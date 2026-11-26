import { parse as parseDomain } from 'tldts';
import type { DomainRegistration } from '@scamhisn/shared';
import { isOfficialBrandDomain } from '../security/brandCatalog.js';
import { buildAddressOnlyScan } from './addressOnlyScan.js';

/**
 * The instant half of Check Everything.
 *
 * Before the browser opens a site, the extension asks for a verdict on the address alone:
 * brand look-alikes, risky endings, punycode, raw IP addresses. Nothing is fetched and no AI is
 * called, so the answer comes back in milliseconds and the page is not held up. The full scan
 * (page, redirects, AI) follows separately.
 */
export interface QuickCheck {
  host: string;
  /** True for a domain on the verified list of official brand domains. */
  official: boolean;
  scamScore: number;
  verdict: string;
  impersonatedBrand: string | null;
  flags: string[];
  /** True when the address alone is bad enough to stop the page from opening. */
  block: boolean;
}

const BLOCKING_VERDICTS = new Set(['suspicious', 'high_risk', 'confirmed_scam']);

export function quickAddressCheck(rawUrl: string): QuickCheck | null {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  const host = url.hostname.toLowerCase();
  const registrableDomain = parseDomain(host).domain ?? host;
  const official = isOfficialBrandDomain(host, registrableDomain);

  const registration: DomainRegistration = {
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
  };
  const scan = buildAddressOnlyScan({
    scanId: 'quick',
    startedAt: Date.now(),
    mode: 'general',
    url,
    registration,
    dnsErrorCode: 'NOT_OPENED',
  });
  return {
    host,
    official,
    scamScore: scan.scamScore,
    verdict: scan.verdict,
    impersonatedBrand: scan.technicalChecks.anomalies.impersonatedBrand,
    // "offline" describes a pasted link that would not open; here nothing was opened at all
    flags: scan.redFlags.map((flag) => flag.code).filter((code) => code !== 'DOMAIN_OFFLINE'),
    block: !official && BLOCKING_VERDICTS.has(scan.verdict),
  };
}
