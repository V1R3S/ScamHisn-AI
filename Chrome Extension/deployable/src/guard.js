// ---------------------------------------------------------------------------------------------
// Check Everything
//
// When the user switches it on in the popup, every site the browser opens goes through the
// ScamHisn AI engine, and so does every site a page redirects to:
//   1. at once, a verdict on the address alone (look-alikes of protected brands, risky endings);
//   2. then the full scan: the page is opened on our server, redirects are followed, Claude
//      researches and the self-hosted model judges.
// If either says the site is not legitimate, the tab shows the ScamHisn report instead of the
// site, with the usual "Download evidence report" and "Report to Abu Dhabi Police" buttons.
// Nothing is checked while the toggle is off.
// ---------------------------------------------------------------------------------------------

export const ENABLED_KEY = 'devAutoMonitorEnabled'; // storage key kept from the earlier developer-only build
const VERDICT_TTL_MS = 30 * 60_000;
const BLOCKING_VERDICTS = new Set(['suspicious', 'high_risk', 'confirmed_scam']);
const inFlight = new Map(); // host -> Promise of the full scan, so one site is scanned once

const session = chrome.storage.session;
const get = async (key) => (await session.get([key]))[key];
const set = (key, value) => session.set({ [key]: value });

export function hostOf(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed.hostname.toLowerCase() : null;
  } catch {
    return null;
  }
}

function isLocal(host) {
  return host === 'localhost' || host.endsWith('.localhost') || host.startsWith('127.') || host.startsWith('10.') || host.startsWith('192.168.');
}

export function startCheckEverything(getApiBase) {
  async function post(path, body, timeoutMs) {
    const apiBase = await getApiBase();
    const res = await fetch(`${apiBase}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-ScamHisn-Client': 'chrome-extension-check-everything/2.0.0',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) throw new Error(`HTTP_${res.status}`);
    return res.json();
  }

  function badge(tabId, state) {
    const looks = {
      checking: ['…', '#5c6660'],
      safe: ['OK', '#0e6b47'],
      stopped: ['!', '#c8322b'],
      unknown: ['?', '#a66a12'],
    }[state];
    chrome.action.setBadgeText({ tabId, text: looks[0] }).catch(() => {});
    chrome.action.setBadgeBackgroundColor({ tabId, color: looks[1] }).catch(() => {});
  }

  async function showReport(tabId, url) {
    const apiBase = await getApiBase();
    await chrome.tabs.update(tabId, { url: `${apiBase}/#/guard?url=${encodeURIComponent(url)}` }).catch(() => {});
    badge(tabId, 'stopped');
  }

  /** The full scan, once per site. Resolves to true (stop), false (fine) or null (engine unreachable). */
  function fullScan(host, url) {
    if (inFlight.has(host)) return inFlight.get(host);
    const job = (async () => {
      try {
        const report = await post('/api/v1/scan', { url, mode: 'general', locale: 'en', engine: 'claude' }, 150_000);
        const block = BLOCKING_VERDICTS.has(report.verdict);
        await set(`v:${host}`, { block, at: Date.now(), score: report.scamScore, full: true });
        return block;
      } catch {
        // The engine could not be reached: the badge says so; the site is never reported as cleared
        return null;
      } finally {
        inFlight.delete(host);
      }
    })();
    inFlight.set(host, job);
    return job;
  }

  async function guard(tabId, url) {
    const host = hostOf(url);
    if (!host || isLocal(host)) return;
    const enabled = (await chrome.storage.local.get([ENABLED_KEY]))[ENABLED_KEY];
    if (!enabled) return;
    if (host === hostOf(await getApiBase())) return; // our own report pages
    if (await get(`allow:${host}`)) {
      badge(tabId, 'unknown');
      return;
    }

    const known = await get(`v:${host}`);
    if (known && Date.now() - known.at < VERDICT_TTL_MS) {
      if (known.block) {
        await showReport(tabId, url);
      } else {
        badge(tabId, 'safe');
        await set(`last:${tabId}`, url);
      }
      return;
    }

    badge(tabId, 'checking');
    // Step 1: the address alone, answered in a fraction of a second
    let quick = null;
    try {
      quick = await post('/api/v1/scan-quick', { url }, 6_000);
    } catch {
      quick = null;
    }
    if (quick && quick.block) {
      await set(`v:${host}`, { block: true, at: Date.now(), score: quick.scamScore, full: false });
      await showReport(tabId, url);
      return;
    }
    if (quick && quick.official) {
      await set(`v:${host}`, { block: false, at: Date.now(), score: 0, full: false });
      await set(`last:${tabId}`, url);
      badge(tabId, 'safe');
      return;
    }

    // Step 2: the full scan. The page keeps loading meanwhile and is replaced if the verdict is bad.
    const block = await fullScan(host, url);
    if (block === null) {
      badge(tabId, 'unknown');
      return;
    }
    if (!block) {
      badge(tabId, 'safe');
      await set(`last:${tabId}`, url);
      return;
    }
    // Replace the tab only if it is still on that site
    const current = await get(`at:${tabId}`);
    if (!current || hostOf(current) === host) await showReport(tabId, url);
  }

  // A site is about to open
  chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    if (details.frameId !== 0) return;
    void set(`at:${details.tabId}`, details.url).then(() => guard(details.tabId, details.url));
  });

  // The page that actually arrived: after a redirect this is a different site from the one asked for
  chrome.webNavigation.onCommitted.addListener((details) => {
    if (details.frameId !== 0) return;
    void set(`at:${details.tabId}`, details.url).then(() => guard(details.tabId, details.url));
  });

  chrome.tabs.onRemoved.addListener((tabId) => {
    void session.remove([`at:${tabId}`, `last:${tabId}`]);
  });

  // Buttons on the report page ("Go back", "Open the site anyway"), relayed by src/bridge.js
  chrome.runtime.onMessage.addListener((message, sender) => {
    if (!message || message.type !== 'GUARD_ACTION' || !sender.tab || !sender.tab.id) return false;
    const tabId = sender.tab.id;
    (async () => {
      const host = hostOf(String(message.url || ''));
      if (message.action === 'allow' && host) {
        await set(`allow:${host}`, true);
        await chrome.tabs.update(tabId, { url: message.url });
        return;
      }
      const last = await get(`last:${tabId}`);
      if (last) await chrome.tabs.update(tabId, { url: last });
      else await chrome.tabs.remove(tabId);
    })();
    return false;
  });
}
