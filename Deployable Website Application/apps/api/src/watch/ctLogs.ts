import { X509Certificate } from 'node:crypto';

/**
 * Reader for the public Certificate Transparency logs (RFC 6962).
 *
 * Every publicly trusted HTTPS certificate must be written to these logs, usually minutes
 * before the site goes live. Reading the newest entries shows which host names were set up
 * just now, without anyone having reported them.
 */

export interface CtLog {
  operator: string;
  name: string;
  url: string;
}

export interface CtEntry {
  /** When the log accepted the certificate (milliseconds since 1970). */
  loggedAt: number;
  /** Lower-case DNS names on the certificate, wildcard prefix removed. */
  names: string[];
}

const LOG_LIST_URL = 'https://www.gstatic.com/ct/log_list/v3/log_list.json';
const X509_ENTRY = 0;

interface RawLogList {
  operators?: Array<{
    name?: string;
    logs?: Array<{
      description?: string;
      url?: string;
      state?: Record<string, unknown>;
      temporal_interval?: { start_inclusive?: string; end_exclusive?: string };
    }>;
  }>;
}

/** Logs that are marked usable and whose certificate window includes today. */
export function pickUsableLogs(list: unknown, now: number): CtLog[] {
  const out: CtLog[] = [];
  for (const operator of (list as RawLogList)?.operators ?? []) {
    for (const log of operator.logs ?? []) {
      if (!log.url || !log.state || !('usable' in log.state)) continue;
      const start = log.temporal_interval?.start_inclusive;
      const end = log.temporal_interval?.end_exclusive;
      if (start && Date.parse(start) > now) continue;
      if (end && Date.parse(end) <= now) continue;
      out.push({
        operator: operator.name ?? 'unknown',
        name: log.description ?? log.url,
        url: log.url.endsWith('/') ? log.url : `${log.url}/`,
      });
    }
  }
  return out;
}

function cleanName(raw: string): string | null {
  const name = raw.trim().toLowerCase().replace(/^\*\./, '');
  if (!name || name.length > 253 || !name.includes('.') || /[^a-z0-9.-]/.test(name)) return null;
  return name;
}

/**
 * Reads one log entry. `leaf_input` is a MerkleTreeLeaf: version (1 byte), leaf type (1),
 * timestamp (8), entry type (2), then the certificate. For a pre-certificate the leaf only
 * holds the to-be-signed part, so the full pre-certificate is taken from `extra_data`.
 */
export function parseCtEntry(leafInputB64: string, extraDataB64: string): CtEntry | null {
  try {
    const leaf = Buffer.from(leafInputB64, 'base64');
    if (leaf.length < 15) return null;
    const loggedAt = Number(leaf.readBigUInt64BE(2));
    const entryType = leaf.readUInt16BE(10);
    let der: Buffer;
    if (entryType === X509_ENTRY) {
      const length = leaf.readUIntBE(12, 3);
      der = leaf.subarray(15, 15 + length);
    } else {
      const extra = Buffer.from(extraDataB64, 'base64');
      if (extra.length < 3) return null;
      const length = extra.readUIntBE(0, 3);
      der = extra.subarray(3, 3 + length);
    }
    const certificate = new X509Certificate(der);
    const names = new Set<string>();
    for (const part of (certificate.subjectAltName ?? '').split(',')) {
      const trimmed = part.trim();
      if (!trimmed.startsWith('DNS:')) continue;
      const name = cleanName(trimmed.slice(4));
      if (name) names.add(name);
    }
    return { loggedAt, names: [...names] };
  } catch {
    return null;
  }
}

async function getJson(url: string, timeoutMs: number): Promise<unknown> {
  const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${new URL(url).host}`);
  return res.json();
}

export async function fetchLogList(): Promise<CtLog[]> {
  return pickUsableLogs(await getJson(LOG_LIST_URL, 15_000), Date.now());
}

export async function fetchTreeSize(log: CtLog): Promise<number> {
  const sth = (await getJson(`${log.url}ct/v1/get-sth`, 10_000)) as { tree_size?: number };
  if (typeof sth.tree_size !== 'number') throw new Error(`No tree size from ${log.name}`);
  return sth.tree_size;
}

/** Entries from `start` to `end` inclusive. A log may return fewer than asked for. */
export async function fetchEntries(log: CtLog, start: number, end: number): Promise<CtEntry[]> {
  const body = (await getJson(`${log.url}ct/v1/get-entries?start=${start}&end=${end}`, 20_000)) as {
    entries?: Array<{ leaf_input: string; extra_data: string }>;
  };
  const out: CtEntry[] = [];
  for (const raw of body.entries ?? []) {
    // A null keeps the position, so the caller can still advance by the number returned
    out.push(parseCtEntry(raw.leaf_input, raw.extra_data) ?? { loggedAt: 0, names: [] });
  }
  return out;
}
