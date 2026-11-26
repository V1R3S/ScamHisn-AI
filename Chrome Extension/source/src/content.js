// Check Everything: when the user switches it on in the popup, the first few outside links on
// each page (search results included) are checked and get a small score badge beside them.
(() => {
  const MAX_LINKS_PER_PAGE = 6;
  const BADGE_ATTR = 'data-scamhisn-checked';
  let scannedCount = 0;
  let enabled = false;
  let observer = null;

  function createBadge(score, verdict) {
    const pill = document.createElement('span');
    const isDanger = score >= 75;
    const isWarn = score >= 45 && score < 75;
    const bg = isDanger ? '#be123c' : isWarn ? '#d97706' : '#059669';

    pill.textContent = `🛡 ${score}%`;
    pill.title = `ScamHisn AI (${verdict})`;
    pill.style.cssText = [
      'display:inline-flex',
      'align-items:center',
      'margin-left:5px',
      'padding:1px 6px',
      'border-radius:999px',
      `background:${bg}`,
      'color:#ffffff',
      'font-size:10px',
      'font-weight:700',
      'font-family:ui-monospace,SFMono-Regular,Menlo,monospace',
      'line-height:1.4',
      'vertical-align:middle',
      'box-shadow:0 1px 3px rgba(0,0,0,0.25)',
    ].join(';');
    return pill;
  }

  function scanVisibleLinks() {
    if (!enabled || scannedCount >= MAX_LINKS_PER_PAGE) return;

    const currentHost = window.location.hostname;
    const anchors = document.querySelectorAll(`a[href^="http"]:not([${BADGE_ATTR}])`);

    for (const anchor of anchors) {
      if (scannedCount >= MAX_LINKS_PER_PAGE) break;
      const href = anchor.href;
      try {
        const parsed = new URL(href);
        // Focus on external links (skip same-site navigation noise)
        if (parsed.hostname === currentHost) {
          anchor.setAttribute(BADGE_ATTR, 'skip');
          continue;
        }
      } catch {
        continue;
      }

      anchor.setAttribute(BADGE_ATTR, 'pending');
      scannedCount++;

      chrome.runtime.sendMessage({ type: 'DEV_AUTO_SCAN_URL', url: href }, (resp) => {
        if (chrome.runtime.lastError || !resp?.ok || !resp.data) {
          anchor.setAttribute(BADGE_ATTR, 'error');
          return;
        }
        anchor.setAttribute(BADGE_ATTR, 'done');
        const badge = createBadge(resp.data.scamScore, resp.data.verdict);
        anchor.insertAdjacentElement('afterend', badge);
      });
    }
  }

  function startMonitoring() {
    if (enabled) return;
    enabled = true;
    scanVisibleLinks();
    observer = new MutationObserver(() => {
      if (enabled && scannedCount < MAX_LINKS_PER_PAGE) {
        scanVisibleLinks();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function stopMonitoring() {
    enabled = false;
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  }

  chrome.storage.local.get(['devAutoMonitorEnabled'], (res) => {
    if (res.devAutoMonitorEnabled) {
      startMonitoring();
    }
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.devAutoMonitorEnabled) {
      if (changes.devAutoMonitorEnabled.newValue) {
        startMonitoring();
      } else {
        stopMonitoring();
      }
    }
  });
})();
