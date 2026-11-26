// Runs only on the ScamHisn site. It passes the two buttons of the report page that Check
// Everything opened ("Go back", "Open the site anyway") on to the extension.
window.addEventListener('message', (event) => {
  if (event.source !== window || event.origin !== window.location.origin) return;
  const data = event.data;
  if (!data || data.source !== 'scamhisn-guard') return;
  if (data.action !== 'back' && data.action !== 'allow') return;
  window.postMessage({ source: 'scamhisn-guard-ack' }, window.location.origin);
  chrome.runtime.sendMessage({ type: 'GUARD_ACTION', action: data.action, url: String(data.url || '') });
});
