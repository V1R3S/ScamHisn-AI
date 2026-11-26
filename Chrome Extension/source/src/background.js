import { EXTENSION_CONFIG } from './config.js';
import { startCheckEverything } from './guard.js';

const CONTEXT_MENU_ID = 'scamhisn-inspect-link';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: CONTEXT_MENU_ID,
      title: 'Inspect link with ScamHisn AI',
      contexts: ['link'],
    });
  });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== CONTEXT_MENU_ID || !info.linkUrl) return;
  await chrome.storage.local.set({
    pendingContextUrl: info.linkUrl,
    pendingContextTimestamp: Date.now(),
  });
  if (chrome.action && typeof chrome.action.openPopup === 'function') {
    try {
      await chrome.action.openPopup();
    } catch {
      // Fallback: user can click the toolbar icon and the link will be pre-filled
    }
  }
});

async function getApiBase() {
  const stored = await chrome.storage.sync.get(['apiBaseUrl']);
  const raw = (stored.apiBaseUrl || EXTENSION_CONFIG.DEFAULT_API_BASE || '').trim();
  return raw.replace(/\/$/, '');
}

startCheckEverything(getApiBase);
