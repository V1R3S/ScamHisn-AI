import crypto from 'node:crypto';
import { parse as parseDomain } from 'tldts';
import type { ScanRequest, ScanResponse, TechnicalChecks } from '@scamhisn/shared';
import { config } from '../config.js';
import { assertSafeUrl, normalizeUserUrl, SsrfError } from '../security/ssrfGuard.js';
import { extractFirstUrl } from '../security/inputExtractor.js';
import { isOfficialBrandDomain } from '../security/brandCatalog.js';
import { buildAddressOnlyScan } from './addressOnlyScan.js';
import { determineCoverage, guardVerdict } from './coverage.js';
import { inspectInHeadlessBrowser } from '../inspectors/browserInspector.js';
import { inspectTls } from '../inspectors/tlsInspector.js';
import { inspectDomainRegistration } from '../inspectors/rdapInspector.js';
import { inspectDns } from '../inspectors/dnsInspector.js';
import { runHeuristicAnalysis } from '../inspectors/heuristicAnalyzer.js';
import { scanForPromptInjection } from '../security/promptInjectionScanner.js';
import { analyzeWithAi } from '../ai/geminiAnalyzer.js';
import { assertFeatureAvailable } from '../ai/geminiHealth.js';
import { computeDecisiveScore } from '../scoring/scoringEngine.js';

class ConcurrencySemaphore {
  private active = 0;
  private readonly queue: Array<() => void> = [];

  constructor(private readonly maxConcurrency: number) {}

  // Scans take 5–40 s, so a queued request waits long enough for a slot to free up
  // (several judges testing at once) instead of failing after 10 s.
  async acquire(timeoutMs = 45_000): Promise<void> {
    if (this.active < this.maxConcurrency) {
      this.active++;
      return;
    }

    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        const idx = this.queue.indexOf(onReady);
        if (idx >= 0) this.queue.splice(idx, 1);
        reject(
          new SsrfError(
            'SCAN_QUEUE_BUSY',
            'Scanner is currently at maximum concurrency. Please retry in a few seconds.',
            'خادم الفحص مشغول حالياً بطلبات ثانية، حاول مرة ثانية بعد ثواني.',
            503,
          ),
        );
      }, timeoutMs);

      const onReady = () => {
        clearTimeout(timer);
        this.active++;
        resolve();
      };
      this.queue.push(onReady);
    });
  }

  release(): void {
    this.active = Math.max(0, this.active - 1);
    const next = this.queue.shift();
    if (next) next();
  }
}

const scanSemaphore = new ConcurrencySemaphore(config.maxConcurrentScans);

export async function runUrlScan(request: ScanRequest): Promise<ScanResponse> {
  const startedAt = Date.now();
  const scanId = crypto.randomUUID();

  // 0. People paste the whole SMS, not just the link: pull the first real link out of free text
  const candidateUrl = extractFirstUrl(request.url);
  if (!candidateUrl) {
    throw new SsrfError(
      'NO_LINK_FOUND',
      'No link was found in that text. Paste the link itself, or the full message that contains it.',
      'ما لقينا رابط في النص. الصق الرابط نفسه أو الرسالة كاملة اللي فيها الرابط.',
    );
  }

  // Job and Map checks rest on Gemini's live Google lookups. If every Gemini key is cooling
  // down, say so up front instead of returning a verdict without that evidence.
  if (request.mode === 'job' || request.mode === 'map') {
    assertFeatureAvailable(request.mode);
  }

  // 1. Pre-flight URL validation & SSRF protection (DNS lookup + private/loopback IP block)
  let safeInitial: Awaited<ReturnType<typeof assertSafeUrl>>;
  try {
    safeInitial = await assertSafeUrl(candidateUrl);
  } catch (err) {
    // A dead or never-registered look-alike still deserves a verdict, not an error:
    // judge the address itself (brand impersonation, look-alike spelling, TLD, registry age).
    if (err instanceof SsrfError && err.code === 'DNS_RESOLUTION_FAILED') {
      const url = new URL(normalizeUserUrl(candidateUrl));
      const host = url.hostname.toLowerCase().replace(/\.$/, '');
      const registration = await inspectDomainRegistration(host);
      return buildAddressOnlyScan({
        scanId,
        startedAt,
        mode: request.mode,
        url,
        registration,
        dnsErrorCode: /\(([A-Z_]+)\)/.exec(err.message)?.[1] ?? 'NO_DNS_RECORDS',
      });
    }
    throw err;
  }
  const initialRegDomain = parseDomain(safeInitial.hostname).domain ?? null;

  await scanSemaphore.acquire();
  try {
    // 2. Run isolated Playwright headless inspection alongside initial TLS, RDAP, and DNS checks
    const [browser, initialTls, initialReg, initialDns] = await Promise.all([
      inspectInHeadlessBrowser(safeInitial.normalizedUrl, request.mode),
      inspectTls(safeInitial.url),
      inspectDomainRegistration(safeInitial.hostname),
      inspectDns(safeInitial.hostname, initialRegDomain),
    ]);

    // 3. If redirects landed on a different host/protocol, re-verify SSRF and inspect final destination
    let finalUrlObj = safeInitial.url;
    let resolvedIps = safeInitial.resolvedIps;
    let tls = initialTls;
    let registration = initialReg;
    let dns = initialDns;

    if (browser.finalUrl && browser.finalUrl !== safeInitial.normalizedUrl) {
      const safeFinal = await assertSafeUrl(browser.finalUrl);
      finalUrlObj = safeFinal.url;
      resolvedIps = Array.from(new Set([...safeInitial.resolvedIps, ...safeFinal.resolvedIps]));

      const finalHostChanged = safeFinal.hostname !== safeInitial.hostname;
      const finalProtocolChanged = safeFinal.url.protocol !== safeInitial.url.protocol;
      const finalRegDomain = parseDomain(safeFinal.hostname).domain ?? null;

      const refreshTasks: Array<Promise<void>> = [];
      if (finalHostChanged || finalProtocolChanged) {
        refreshTasks.push(
          inspectTls(safeFinal.url).then((res) => {
            tls = res;
          }),
        );
      }
      if (finalHostChanged) {
        if (finalRegDomain !== initialRegDomain) {
          refreshTasks.push(
            inspectDomainRegistration(safeFinal.hostname).then((res) => {
              registration = res;
            }),
          );
        }
        refreshTasks.push(
          inspectDns(safeFinal.hostname, finalRegDomain).then((res) => {
            dns = res;
          }),
        );
      }
      if (refreshTasks.length > 0) {
        await Promise.all(refreshTasks);
      }
    }

    // 4. Local heuristic & anomaly checks
    const heuristics = runHeuristicAnalysis({
      initialUrl: safeInitial.url,
      finalUrl: finalUrlObj,
      tls,
      registration,
      dns,
      browser,
    });

    // 5. Deterministic multi-channel anti-prompt-injection pre-scanner
    const promptInjection = scanForPromptInjection({
      visibleText: browser.visibleText,
      hiddenDomTexts: browser.hiddenDomTexts,
      htmlComments: browser.htmlComments,
      metaTexts: Object.entries(browser.metaTags).map(([k, v]) => `${k}: ${v}`),
      mapReviews: browser.mapReviews,
      ariaAndDataAttrs: browser.ariaAndDataAttrs,
    });

    // 6. AI forensic inspection through the fallback chain
    //    (Gemini keys → backup Gemini model → self-hosted model → rules only)
    const aiResult = await analyzeWithAi({
      mode: request.mode,
      inputUrl: safeInitial.normalizedUrl,
      finalUrl: finalUrlObj.toString(),
      tls,
      registration,
      redirects: heuristics.redirects,
      headers: heuristics.headers,
      dns,
      domAndForms: heuristics.domAndForms,
      anomalies: heuristics.anomalies,
      promptInjection,
      browser,
    });
    const aiAnalysis = aiResult.analysis;

    // Gemini ran out during this very scan: the keys are now cooling down, so report the
    // Job / Map check as paused rather than answer without live lookups.
    const geminiAnswered =
      aiResult.provider === 'gemini' ||
      aiResult.provider === 'gemini_backup' ||
      aiResult.provider === 'claude' ||
      aiResult.provider === 'hybrid';
    if ((request.mode === 'job' || request.mode === 'map') && !geminiAnswered) {
      assertFeatureAvailable(request.mode);
    }

    const technicalChecks: TechnicalChecks = {
      ssrf: {
        passed: true,
        resolvedIps,
      },
      tls,
      domainRegistration: registration,
      redirects: heuristics.redirects,
      headers: heuristics.headers,
      dns,
      domAndForms: heuristics.domAndForms,
      anomalies: heuristics.anomalies,
    };

    // 7. Decisive hybrid 0–100% scoring engine (with fatal smoking-gun floors)
    const scoredHost = finalUrlObj.hostname.toLowerCase();
    const scoring = computeDecisiveScore({
      isOfficialDomain: isOfficialBrandDomain(scoredHost, parseDomain(scoredHost).domain ?? null),
      mode: request.mode,
      technicalChecks,
      heuristicFlags: heuristics.flags,
      promptInjection,
      aiAnalysis,
    });

    // 8. State how much of the analysis ran; an incomplete check is never reported as "safe"
    const coverage = determineCoverage({
      domainResolved: true,
      pageLoaded: browser.captured,
      aiStatus: aiAnalysis.status,
      aiProvider: aiResult.provider,
      aiModel: aiResult.provider === 'none' ? null : aiAnalysis.model,
    });
    // An official domain of a protected brand that scored clean is safe on the registry evidence
    // alone, so an AI outage must not make adpolice.gov.ae or tamm.abudhabi look doubtful.
    const finalHost = finalUrlObj.hostname.toLowerCase();
    const isCleanOfficialDomain =
      scoring.verdict === 'safe' &&
      browser.captured &&
      isOfficialBrandDomain(finalHost, parseDomain(finalHost).domain ?? null);

    return {
      scanId,
      scannedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
      mode: request.mode,
      inputUrl: safeInitial.normalizedUrl,
      finalUrl: finalUrlObj.toString(),
      scamScore: scoring.scamScore,
      verdict: isCleanOfficialDomain ? scoring.verdict : guardVerdict(scoring.verdict, coverage),
      scoreBreakdown: scoring.scoreBreakdown,
      smokingGunsTriggered: scoring.smokingGunsTriggered,
      redFlags: scoring.redFlags,
      technicalChecks,
      promptInjection,
      aiAnalysis,
      coverage,
    };
  } finally {
    scanSemaphore.release();
  }
}
