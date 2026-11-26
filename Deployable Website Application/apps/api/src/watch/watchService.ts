import { promises as dns } from 'node:dns';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parse as parseDomain } from 'tldts';
import type { DomainRegistration } from '@scamhisn/shared';
import { detectBrandImpersonation, isOfficialBrandDomain, PROTECTED_BRANDS } from '../security/brandCatalog.js';
import { inspectDomainRegistration } from '../inspectors/rdapInspector.js';
import { buildAddressOnlyScan } from '../services/addressOnlyScan.js';
import { fetchEntries, fetchLogList, fetchTreeSize, type CtLog } from './ctLogs.js';
import { SEED_FINDINGS, SEED_TOTALS } from './seedFindings.js';

/**
 * The watchtower: looks for look-alikes of protected UAE brands among host names that received
 * an HTTPS certificate in the last minutes, before anyone has reported them.
 *
 * It needs no AI and no API key. Each new host name goes through the same brand catalogue and
 * address check that a link pasted by a user goes through.
 */

export interface WatchFinding {
  host: string;
  registrableDomain: string;
  brand: string;
  reason: string;
  isUaeEntity: boolean;
  /** When the certificate log accepted the certificate. */
  certLoggedAt: string;
  /** When the watcher first saw it. */
  firstSeenAt: string;
  log: string;
  scamScore: number;
  verdict: string;
  flags: string[];
  /** True when the name answered a DNS lookup at the time of the check. */
  resolves: boolean;
  registeredAt: string | null;
  domainAgeDays: number | null;
}

export interface WatchTotals {
  certificatesRead: number;
  namesChecked: number;
  runs: number;
}

export interface WatchStatus {
  enabled: boolean;
  running: boolean;
  lastRunAt: string | null;
  lastRunSeconds: number | null;
  lastRunCertificates: number;
  lastRunError: string | null;
  logsRead: string[];
  intervalMinutes: number;
  totals: WatchTotals;
  findingCount: number;
}

export interface LookalikeMatch {
  host: string;
  registrableDomain: string;
  brand: string;
  reason: string;
  isUaeEntity: boolean;
}

/**
 * The certificate logs are full of machine-made names, and a short brand word such as "adcb"
 * turns up inside random strings by chance. A pasted link comes with a message that gives it
 * context; a name from the logs does not. So here the brand word must stand as a word of its
 * own: between dots or hyphens, or (for words of six letters or more) at the start or end of one.
 */
export function brandStandsAsWord(host: string, brandName: string): boolean {
  const entry = PROTECTED_BRANDS.find((brand) => brand.name === brandName);
  if (!entry) return false;
  const parts = host.toLowerCase().split(/[.-]/);
  for (const raw of [...entry.tokens, ...(entry.keywords ?? [])]) {
    const word = raw.toLowerCase();
    if (word.includes('-') || word.includes('.')) {
      // A multi-part token such as "uae-pass" has to match on its own boundaries
      const at = host.indexOf(word);
      if (at < 0) continue;
      const before = at === 0 ? '.' : host[at - 1];
      const after = at + word.length >= host.length ? '.' : host[at + word.length];
      if ((before === '.' || before === '-') && (after === '.' || after === '-')) return true;
      continue;
    }
    if (parts.includes(word)) return true;
    if (word.length >= 6 && parts.some((part) => part.startsWith(word) || part.endsWith(word))) return true;
  }
  return false;
}

/**
 * Pure check used for every certificate name: is this a look-alike of a protected UAE brand?
 * Global brands are left out on purpose: this watcher serves UAE reporting channels.
 */
export function findLookalike(rawName: string): LookalikeMatch | null {
  const host = rawName.trim().toLowerCase().replace(/^\*\./, '').replace(/\.$/, '');
  if (!host || !host.includes('.')) return null;
  const parsed = parseDomain(host);
  const registrableDomain = parsed.domain ?? null;
  if (!registrableDomain || parsed.isIp) return null;
  if (isOfficialBrandDomain(host, registrableDomain)) return null;
  const match = detectBrandImpersonation(host, registrableDomain, `https://${host}/`);
  if (!match || !match.isUaeEntity || !brandStandsAsWord(host, match.brand)) return null;
  return { host, registrableDomain, brand: match.brand, reason: match.reason, isUaeEntity: match.isUaeEntity };
}

const ENTRIES_PER_LOG = Number(process.env.WATCH_ENTRIES_PER_LOG ?? 2500);
const MAX_LOGS = Number(process.env.WATCH_MAX_LOGS ?? 6);
const INTERVAL_MS = Number(process.env.WATCH_INTERVAL_MS ?? 10 * 60_000);
const RUN_BUDGET_MS = Number(process.env.WATCH_RUN_BUDGET_MS ?? 75_000);
const MAX_NEW_PER_RUN = Number(process.env.WATCH_MAX_NEW ?? 20);
const MAX_FINDINGS = 400;
const MIN_LOG_SIZE = 1_000_000; // skips test logs
const STORE_PATH = process.env.WATCH_STORE_PATH ?? path.join(os.tmpdir(), 'scamhisn-watch.json');
const ENABLED = process.env.WATCH_ENABLED !== 'false';

const findings = new Map<string, WatchFinding>();
const cursors = new Map<string, number>();
let totals: WatchTotals = { ...SEED_TOTALS };
let running = false;
let lastRunAt: number | null = null;
let lastRunMs: number | null = null;
let lastRunCertificates = 0;
let lastRunError: string | null = null;
let logsRead: string[] = [];
let timer: NodeJS.Timeout | null = null;

function loadStore(): void {
  for (const finding of SEED_FINDINGS) findings.set(finding.registrableDomain, finding);
  try {
    const saved = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8')) as { findings?: WatchFinding[]; totals?: WatchTotals };
    for (const finding of saved.findings ?? []) findings.set(finding.registrableDomain, finding);
    if (saved.totals && saved.totals.certificatesRead > totals.certificatesRead) totals = saved.totals;
  } catch {
    // First start, or a host with no writable disk: the seed is enough to begin with
  }
}
loadStore();

function saveStore(): void {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify({ findings: listFindings(), totals }));
  } catch {
    // Not fatal: findings stay in memory until the next restart
  }
}

export function listFindings(): WatchFinding[] {
  return [...findings.values()].sort((a, b) => Date.parse(b.certLoggedAt) - Date.parse(a.certLoggedAt));
}

export function getWatchStatus(): WatchStatus {
  return {
    enabled: ENABLED,
    running,
    lastRunAt: lastRunAt ? new Date(lastRunAt).toISOString() : null,
    lastRunSeconds: lastRunMs === null ? null : Math.round(lastRunMs / 100) / 10,
    lastRunCertificates,
    lastRunError,
    logsRead,
    intervalMinutes: Math.round(INTERVAL_MS / 60_000),
    totals,
    findingCount: findings.size,
  };
}

async function resolves(host: string): Promise<boolean> {
  try {
    const records = await Promise.race([
      dns.resolve4(host),
      new Promise<string[]>((resolve) => setTimeout(() => resolve([]), 4000)),
    ]);
    return records.length > 0;
  } catch {
    return false;
  }
}

const NO_REGISTRATION = (registrableDomain: string): DomainRegistration => ({
  registrableDomain,
  source: 'unavailable',
  createdAt: null,
  expiresAt: null,
  registrar: null,
  domainAgeDays: null,
  isNewlyRegistered: false,
  isYoungDomain: false,
  statuses: [],
  error: 'not looked up',
});

/** Scores one look-alike with the same address check a pasted link gets. */
export async function buildFinding(
  match: LookalikeMatch,
  certLoggedAt: number,
  log: string,
  lookups = true,
): Promise<WatchFinding> {
  let registration = NO_REGISTRATION(match.registrableDomain);
  let live = false;
  if (lookups) {
    [registration, live] = await Promise.all([
      inspectDomainRegistration(match.host).catch(() => NO_REGISTRATION(match.registrableDomain)),
      resolves(match.host),
    ]);
  }
  const scan = buildAddressOnlyScan({
    scanId: `watch-${match.registrableDomain}`,
    startedAt: Date.now(),
    mode: 'general',
    url: new URL(`https://${match.host}/`),
    registration,
    dnsErrorCode: live ? 'NOT_OPENED' : 'ENOTFOUND',
  });
  return {
    ...match,
    certLoggedAt: new Date(certLoggedAt || Date.now()).toISOString(),
    firstSeenAt: new Date().toISOString(),
    log,
    scamScore: scan.scamScore,
    verdict: scan.verdict,
    // "offline" describes a link someone pasted; here the live state is reported separately
    flags: scan.redFlags.map((flag) => flag.code).filter((code) => code !== 'DOMAIN_OFFLINE'),
    resolves: live,
    registeredAt: registration.createdAt,
    domainAgeDays: registration.domainAgeDays,
  };
}

async function readLog(
  log: CtLog,
  deadline: number,
  onName: (name: string, loggedAt: number, log: string) => void,
): Promise<number> {
  const size = await fetchTreeSize(log);
  if (size < MIN_LOG_SIZE) return 0;
  const tip = size - 1;
  const previous = cursors.get(log.url);
  let start = Math.max(previous === undefined ? tip - ENTRIES_PER_LOG + 1 : previous + 1, tip - ENTRIES_PER_LOG + 1, 0);
  let read = 0;
  while (start <= tip && Date.now() < deadline) {
    const batch = await fetchEntries(log, start, Math.min(start + 255, tip));
    if (batch.length === 0) break;
    for (const entry of batch) {
      for (const name of entry.names) onName(name, entry.loggedAt, log.name);
    }
    read += batch.length;
    start += batch.length;
  }
  cursors.set(log.url, start - 1);
  return read;
}

/** One pass over the newest certificates. Safe to call while another pass runs: it returns at once. */
export async function runWatchCycle(): Promise<WatchStatus> {
  if (running) return getWatchStatus();
  running = true;
  const startedAt = Date.now();
  const deadline = startedAt + RUN_BUDGET_MS;
  lastRunError = null;
  try {
    const logs = (await fetchLogList()).slice(0, 24);
    // Prefer the logs that answer fastest: probe sizes in parallel and keep the busiest ones
    const sized = await Promise.all(
      logs.map(async (log) => ({ log, size: await fetchTreeSize(log).catch(() => 0) })),
    );
    const chosen = sized
      .filter((entry) => entry.size >= MIN_LOG_SIZE)
      .sort((a, b) => b.size - a.size)
      .slice(0, MAX_LOGS)
      .map((entry) => entry.log);

    let names = 0;
    const fresh = new Map<string, { match: LookalikeMatch; loggedAt: number; log: string }>();
    const onName = (name: string, loggedAt: number, logName: string) => {
      names++;
      const match = findLookalike(name);
      if (!match || findings.has(match.registrableDomain) || fresh.has(match.registrableDomain)) return;
      fresh.set(match.registrableDomain, { match, loggedAt, log: logName });
    };

    const counts = await Promise.all(
      chosen.map((log) =>
        readLog(log, deadline, onName).catch((err) => {
          lastRunError = err instanceof Error ? err.message : String(err);
          return 0;
        }),
      ),
    );
    const certificates = counts.reduce((sum, n) => sum + n, 0);

    for (const candidate of [...fresh.values()].slice(0, MAX_NEW_PER_RUN)) {
      const finding = await buildFinding(candidate.match, candidate.loggedAt, candidate.log);
      findings.set(finding.registrableDomain, finding);
    }
    if (findings.size > MAX_FINDINGS) {
      for (const stale of listFindings().slice(MAX_FINDINGS)) findings.delete(stale.registrableDomain);
    }

    logsRead = chosen.map((log) => log.name);
    lastRunCertificates = certificates;
    totals = {
      certificatesRead: totals.certificatesRead + certificates,
      namesChecked: totals.namesChecked + names,
      runs: totals.runs + 1,
    };
    saveStore();
  } catch (err) {
    lastRunError = err instanceof Error ? err.message : String(err);
  } finally {
    lastRunAt = Date.now();
    lastRunMs = lastRunAt - startedAt;
    running = false;
  }
  return getWatchStatus();
}

/** Starts the background passes: the first shortly after boot, then one every interval. */
export function startWatchScheduler(): void {
  if (!ENABLED || timer) return;
  setTimeout(() => void runWatchCycle(), 15_000).unref();
  timer = setInterval(() => void runWatchCycle(), INTERVAL_MS);
  timer.unref();
}
