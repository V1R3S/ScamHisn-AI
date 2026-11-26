import { EXTENSION_CONFIG } from './config.js';
import { TRANSLATIONS } from './i18n.js';

const hasChromeStorage = typeof chrome !== 'undefined' && Boolean(chrome.storage);
const hasChromeTabs = typeof chrome !== 'undefined' && Boolean(chrome.tabs);

async function storageGet(area, keys) {
  if (hasChromeStorage && chrome.storage[area]) {
    return chrome.storage[area].get(keys);
  }
  const out = {};
  for (const k of keys) {
    try {
      const v = localStorage.getItem(`scamhisn-ext-${k}`);
      if (v !== null) out[k] = JSON.parse(v);
    } catch {
      // ignore
    }
  }
  return out;
}

async function storageSet(area, obj) {
  if (hasChromeStorage && chrome.storage[area]) {
    await chrome.storage[area].set(obj);
    return;
  }
  for (const [k, v] of Object.entries(obj)) {
    try {
      localStorage.setItem(`scamhisn-ext-${k}`, JSON.stringify(v));
    } catch {
      // ignore
    }
  }
}

const state = {
  locale: 'en',
  theme: 'light',
  activeTab: 'manual',
  category: 'general',
  apiBaseUrl: EXTENSION_CONFIG.DEFAULT_API_BASE,
  isScanning: false,
  result: null,
  showDetails: false,
  showPoliceNotice: false,
  devAutoMonitorEnabled: false,
};

const el = (id) => document.getElementById(id);

function t() {
  return TRANSLATIONS[state.locale] || TRANSLATIONS.en;
}

// Static icon markup (not user data): sun shown in dark mode, moon in light mode
const ICON_SUN =
  '<svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>';
const ICON_MOON =
  '<svg viewBox="0 0 24 24" class="icon" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';

function applyTheme() {
  const isDark = state.theme === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
  el('theme-icon').innerHTML = isDark ? ICON_SUN : ICON_MOON;
}

/** Official Aman channels of Abu Dhabi Police (verified on aman.adpolice.gov.ae). */
function renderAmanPanel() {
  const tr = t();
  const box = el('police-notice');
  box.textContent = '';

  const title = document.createElement('p');
  title.className = 'aman-title';
  title.textContent = tr.amanTitle;

  const channels = document.createElement('p');
  channels.className = 'aman-channels';
  channels.dir = 'ltr';
  const tel = document.createElement('a');
  tel.href = 'tel:8002626';
  tel.textContent = '800 2626';
  const mail = document.createElement('a');
  mail.href = 'mailto:aman@adpolice.gov.ae';
  mail.textContent = 'aman@adpolice.gov.ae';
  const web = document.createElement('a');
  web.href = 'https://aman.adpolice.gov.ae';
  web.target = '_blank';
  web.rel = 'noopener noreferrer';
  web.textContent = 'aman.adpolice.gov.ae';
  channels.append(tel, ' · SMS 2828 · ', mail, ' · ', web);

  const note = document.createElement('p');
  note.className = 'aman-note';
  note.textContent = tr.amanNote;

  box.append(title, channels, note);
}

/** How much of the analysis ran, mirroring the website's wording. */
function coverageInfo(data, tr) {
  const aiUnavailable = data.aiAnalysis?.status === 'unavailable';
  const level = data.coverage?.level ?? (aiUnavailable ? 'rules_only' : 'full');
  const pageLoaded = data.coverage?.pageLoaded ?? data.technicalChecks?.domAndForms?.browserCaptured ?? true;
  let text = tr.coverage.full;
  if (level === 'address_only') text = tr.coverage.addressOnly;
  else if (level === 'rules_only') text = data.verdict === 'safe' ? tr.coverage.officialNoAi : tr.coverage.rulesOnly;
  else if (level === 'partial') text = pageLoaded ? tr.coverage.partial : tr.coverage.pageNotLoaded;
  return { level, text, isFull: level === 'full' };
}

function applyTranslations() {
  const tr = t();
  const isAr = state.locale === 'ar';
  document.documentElement.dir = isAr ? 'rtl' : 'ltr';
  document.documentElement.lang = isAr ? 'ar-AE' : 'en';

  el('brand-name').textContent = tr.brand;
  el('lang-btn').textContent = isAr ? 'English' : 'العربية';
  el('tab-manual-label').textContent = tr.tabManual;
  el('tab-auto-label').textContent = tr.tabAuto;
  el('dev-only-pill').textContent = tr.devOnlyBadge;
  el('locked-title').textContent = tr.lockedTitle;
  el('locked-body').textContent = tr.lockedBody;
  el('dev-monitor-title').textContent = tr.devMonitorTitle;
  el('dev-monitor-desc').textContent = tr.devMonitorDesc;
  el('dev-monitor-toggle-label').textContent = tr.devMonitorToggle;
  el('dev-monitor-status').textContent = state.devAutoMonitorEnabled
    ? tr.devActiveStatus
    : tr.devInactiveStatus;

  el('cat-general-label').textContent = tr.categories.general;
  el('cat-job-label').textContent = tr.categories.job;
  el('cat-map-label').textContent = tr.categories.map;

  el('url-input').placeholder = tr.urlPlaceholder;
  el('this-tab-btn').textContent = tr.thisTab;
  el('paste-btn').textContent = tr.paste;
  el('inspect-btn-label').textContent = state.isScanning ? tr.inspecting : tr.inspect;

  el('settings-label').textContent = tr.settingsTitle;
  el('api-url-input').placeholder = tr.settingsPlaceholder;
  el('settings-save-btn').textContent = tr.settingsSave;

  el('details-btn-label').textContent = state.showDetails ? tr.hideDetails : tr.showDetails;
  el('pdf-btn-label').textContent = tr.generateReport;
  el('police-btn-label').textContent = tr.sendToPolice;
  el('evidence-heading').textContent = tr.evidenceTitle;
  renderAmanPanel();

  el('findings-heading').textContent = tr.findingsTitle;
  el('tech-heading').textContent = tr.techTitle;
  el('raw-json-heading').textContent = tr.rawJsonTitle;
  el('copy-json-btn').textContent = tr.copyJson;
  el('footer-credit').textContent = tr.footerCredit;

  if (state.result) {
    renderResult(state.result);
  }
}

function applyModeTab() {
  const isManual = state.activeTab === 'manual';
  el('tab-manual').classList.toggle('active', isManual);
  el('tab-manual').setAttribute('aria-selected', String(isManual));
  el('tab-auto').classList.toggle('active', !isManual);
  el('tab-auto').setAttribute('aria-selected', String(!isManual));

  el('panel-manual').classList.toggle('hidden', !isManual);
  el('panel-auto').classList.toggle('hidden', isManual);

  if (EXTENSION_CONFIG.DEV_MODE) {
    el('auto-locked-view').classList.add('hidden');
    el('auto-dev-view').classList.remove('hidden');
    el('tab-auto-lock').classList.add('hidden');
    el('dev-pill').classList.toggle('hidden', !EXTENSION_CONFIG.PRIVATE_BUILD);
  } else {
    el('auto-locked-view').classList.remove('hidden');
    el('auto-dev-view').classList.add('hidden');
    el('tab-auto-lock').classList.remove('hidden');
    el('dev-pill').classList.add('hidden');
  }
}

function setCategory(cat) {
  state.category = cat;
  document.querySelectorAll('.cat-btn').forEach((btn) => {
    const active = btn.getAttribute('data-cat') === cat;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-checked', String(active));
  });
}

function showError(msg) {
  const box = el('error-box');
  if (!msg) {
    box.classList.add('hidden');
    box.textContent = '';
  } else {
    box.textContent = msg;
    box.classList.remove('hidden');
  }
}

function renderResult(data) {
  const tr = t();
  const isAr = state.locale === 'ar';
  const score = Math.max(0, Math.min(100, Math.round(Number(data.scamScore) || 0)));

  el('result-card').classList.remove('hidden');

  const verdict = data.verdict || 'safe';
  const coverage = coverageInfo(data, tr);

  // A clean technical result without AI is "incomplete", never a confident verdict
  // (unless the server itself says "safe": its verified official-domain rule).
  const isIncomplete =
    (coverage.level === 'rules_only' || coverage.level === 'address_only') && score <= 19 && verdict !== 'safe';

  // Verdict band: tinted by verdict
  const tone =
    verdict === 'high_risk' || verdict === 'confirmed_scam'
      ? 'danger'
      : verdict === 'safe' && !isIncomplete
        ? 'safe'
        : 'warn';
  el('verdict-band').className = `verdict-band tone-${tone}`;
  el('gauge-score').textContent = `${score}%`;
  el('verdict-badge').textContent = isIncomplete ? tr.incompleteLabel : tr.verdicts[verdict] || verdict;
  el('duration-pill').textContent = `${((data.durationMs || 0) / 1000).toFixed(1)}s`;

  // One sentence. The server's summary says plainly when AI was unavailable.
  const aiSummary = isAr ? data.aiAnalysis?.summaryAr : data.aiAnalysis?.summaryEn;
  const aiUnavailable = data.aiAnalysis?.status === 'unavailable';
  el('result-summary').textContent =
    aiUnavailable && coverage.level !== 'address_only' && (score >= 45 || verdict === 'safe')
      ? ''
      : aiSummary || '';
  el('result-summary').classList.toggle('hidden', !el('result-summary').textContent);

  // Coverage chip
  const chip = el('coverage-chip');
  chip.textContent = coverage.text;
  chip.className = `coverage-chip ${coverage.isFull ? 'full' : 'partial'}`;

  // Evidence: the top findings, up front
  const evidence = el('evidence-list');
  evidence.textContent = '';
  const topFlags = (Array.isArray(data.redFlags) ? data.redFlags : []).slice(0, 3);
  if (topFlags.length === 0) {
    const li = document.createElement('li');
    li.className = 'evidence-item none';
    li.textContent = tr.noFindings;
    evidence.appendChild(li);
  } else {
    for (const f of topFlags) {
      const li = document.createElement('li');
      li.className = `evidence-item sev-${String(f.severity || 'info')}`;
      li.textContent = isAr ? f.titleAr : f.titleEn;
      evidence.appendChild(li);
    }
  }

  el('result-url').textContent = data.finalUrl || data.inputUrl || '';
  el('result-url').title = data.finalUrl || data.inputUrl || '';

  // Critical Prompt-Injection / Smoking-Gun alert
  const critBox = el('critical-alert');
  const hasCritical =
    data.promptInjection?.detected ||
    data.aiAnalysis?.aiDetectedPromptInjection ||
    (data.smokingGunsTriggered && data.smokingGunsTriggered.length > 0);

  if (hasCritical) {
    const firstSg = data.smokingGunsTriggered?.[0];
    critBox.textContent = firstSg
      ? `⚠ ${isAr ? firstSg.titleAr : firstSg.titleEn}`
      : isAr
        ? '⚠ تم رصد هجوم حقن أوامر (Prompt Injection)!'
        : '⚠ Prompt-Injection Attack Intercepted!';
    critBox.classList.remove('hidden');
  } else {
    critBox.classList.add('hidden');
  }

  // Details Drawer contents (always generated, revealed on "Show Details")
  const findingsList = el('findings-list');
  findingsList.innerHTML = '';
  const flags = Array.isArray(data.redFlags) ? data.redFlags : [];
  if (flags.length === 0) {
    const li = document.createElement('li');
    li.className = 'finding-item';
    li.textContent = tr.noFindings;
    findingsList.appendChild(li);
  } else {
    for (const f of flags.slice(0, 8)) {
      const li = document.createElement('li');
      li.className = 'finding-item';
      const title = document.createElement('span');
      title.className = 'finding-title';
      title.textContent = `[${String(f.severity || 'info').toUpperCase()}] ${isAr ? f.titleAr : f.titleEn}`;
      const detail = document.createElement('span');
      detail.className = 'finding-detail';
      detail.textContent = isAr ? f.detailAr : f.detailEn;
      li.append(title, detail);
      findingsList.appendChild(li);
    }
  }

  // Technical Grid
  const tc = data.technicalChecks || {};
  const tl = tr.techLabels;
  const cells = [
    {
      lbl: tl.ssl,
      val: !tc.tls?.isHttps ? tl.noHttps : tc.tls?.valid ? tl.valid : tl.invalid,
    },
    {
      lbl: tl.domainAge,
      val:
        tc.domainRegistration?.domainAgeDays !== null &&
        tc.domainRegistration?.domainAgeDays !== undefined
          ? `${tc.domainRegistration.domainAgeDays} ${tl.days}`
          : tl.unavailable,
    },
    {
      lbl: tl.redirects,
      val: `${tc.redirects?.hopCount ?? 0} (HTTP ${tc.headers?.httpStatus ?? '—'})`,
    },
    {
      lbl: tl.headers,
      val: `${3 - (tc.headers?.missingCriticalHeaders?.length ?? 3)}/3`,
    },
    {
      lbl: tl.forms,
      val: tc.domAndForms?.hasSensitiveInputs ? tl.yes : tl.no,
    },
    {
      lbl: tl.injection,
      val:
        data.promptInjection?.detected || data.aiAnalysis?.aiDetectedPromptInjection
          ? tl.detected
          : tl.clean,
    },
  ];

  const techGrid = el('tech-grid');
  techGrid.innerHTML = '';
  for (const c of cells) {
    const cell = document.createElement('div');
    cell.className = 'tech-cell';
    const l = document.createElement('span');
    l.className = 'tech-lbl';
    l.textContent = c.lbl;
    const v = document.createElement('span');
    v.className = 'tech-val';
    v.textContent = c.val;
    cell.append(l, v);
    techGrid.appendChild(cell);
  }

  el('raw-json-pre').textContent = JSON.stringify(data, null, 2);

  // Sync drawer & police visibility
  el('details-drawer').classList.toggle('hidden', !state.showDetails);
  el('details-btn').setAttribute('aria-expanded', String(state.showDetails));
  el('details-btn-label').textContent = state.showDetails ? tr.hideDetails : tr.showDetails;
  el('police-notice').classList.toggle('hidden', !state.showPoliceNotice);
}

async function runScan(rawUrl) {
  const tr = t();
  const url = rawUrl.trim();
  if (!url) {
    showError(tr.errEmptyUrl);
    return;
  }

  state.isScanning = true;
  state.showDetails = false;
  state.showPoliceNotice = false;
  showError(null);

  el('inspect-btn').disabled = true;
  el('inspect-spinner').classList.remove('hidden');
  el('inspect-btn-label').textContent = tr.inspecting;

  try {
    const base = state.apiBaseUrl.replace(/\/$/, '');
    const res = await fetch(`${base}/api/v1/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-ScamHisn-Client': EXTENSION_CONFIG.DEV_MODE
          ? 'chrome-extension-dev/1.0.0'
          : 'chrome-extension/1.0.0',
      },
      body: JSON.stringify({
        url,
        mode: state.category,
        locale: state.locale,
      }),
    });

    const body = await res.json().catch(() => null);
    if (!res.ok) {
      const msg =
        state.locale === 'ar' && body?.error?.messageAr
          ? body.error.messageAr
          : body?.error?.message || `HTTP ${res.status}`;
      showError(msg);
      return;
    }

    state.result = body;
    renderResult(body);
  } catch {
    showError(tr.errNetwork);
  } finally {
    state.isScanning = false;
    el('inspect-btn').disabled = false;
    el('inspect-spinner').classList.add('hidden');
    el('inspect-btn-label').textContent = t().inspect;
  }
}

async function downloadPdf() {
  if (!state.result) return;
  const tr = t();
  const btn = el('pdf-btn');
  btn.disabled = true;
  el('pdf-btn-label').textContent = tr.generatingReport;

  try {
    const base = state.apiBaseUrl.replace(/\/$/, '');
    const res = await fetch(`${base}/api/v1/report/pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/pdf',
      },
      body: JSON.stringify({ report: state.result, locale: state.locale }),
    });

    if (!res.ok) throw new Error('PDF error');

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ScamHisn-Report-${String(state.result.scanId || 'scan').slice(0, 8)}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  } catch {
    showError(tr.errNetwork);
  } finally {
    btn.disabled = false;
    el('pdf-btn-label').textContent = t().generateReport;
  }
}

async function init() {
  const syncData = await storageGet('sync', ['locale', 'theme', 'apiBaseUrl']);
  const localData = await storageGet('local', [
    'pendingContextUrl',
    'pendingContextTimestamp',
    'devAutoMonitorEnabled',
  ]);

  if (syncData.locale === 'ar' || syncData.locale === 'en') state.locale = syncData.locale;
  if (syncData.theme === 'light' || syncData.theme === 'dark') state.theme = syncData.theme;
  // An address that was never live (the first version 2 build used it) is dropped for the default
  const savedBase = typeof syncData.apiBaseUrl === 'string' ? syncData.apiBaseUrl.trim().replace(/\/$/, '') : '';
  if (savedBase === 'https://scamhisn-ai-v2.onrender.com') {
    await storageSet('sync', { apiBaseUrl: state.apiBaseUrl });
  } else if (savedBase) {
    state.apiBaseUrl = savedBase;
  }
  state.devAutoMonitorEnabled = Boolean(localData.devAutoMonitorEnabled);

  el('api-url-input').value = state.apiBaseUrl;
  el('dev-monitor-checkbox').checked = state.devAutoMonitorEnabled;

  // Pre-fill URL if user right-clicked a link within the last 60s
  if (
    localData.pendingContextUrl &&
    Date.now() - Number(localData.pendingContextTimestamp || 0) < 60_000
  ) {
    el('url-input').value = localData.pendingContextUrl;
    await storageSet('local', { pendingContextUrl: '', pendingContextTimestamp: 0 });
  }

  applyTheme();
  applyModeTab();
  applyTranslations();

  // Event listeners
  el('lang-btn').addEventListener('click', async () => {
    state.locale = state.locale === 'en' ? 'ar' : 'en';
    await storageSet('sync', { locale: state.locale });
    applyTranslations();
  });

  el('theme-btn').addEventListener('click', async () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    await storageSet('sync', { theme: state.theme });
    applyTheme();
  });

  el('settings-btn').addEventListener('click', () => {
    el('settings-panel').classList.toggle('hidden');
  });

  el('settings-save-btn').addEventListener('click', async () => {
    const val = el('api-url-input').value.trim().replace(/\/$/, '');
    if (!val.startsWith('http://') && !val.startsWith('https://')) return;
    state.apiBaseUrl = val;
    await storageSet('sync', { apiBaseUrl: val });
    const status = el('settings-status');
    status.textContent = t().settingsSaved;
    status.classList.remove('hidden');
    window.setTimeout(() => status.classList.add('hidden'), 1800);
  });

  el('tab-manual').addEventListener('click', () => {
    state.activeTab = 'manual';
    applyModeTab();
  });

  el('tab-auto').addEventListener('click', () => {
    state.activeTab = 'auto';
    applyModeTab();
  });

  document.querySelectorAll('.cat-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-cat');
      if (cat) setCategory(cat);
    });
  });

  el('this-tab-btn').addEventListener('click', async () => {
    if (!hasChromeTabs) return;
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.url && (tab.url.startsWith('http://') || tab.url.startsWith('https://'))) {
        el('url-input').value = tab.url;
        showError(null);
      }
    } catch {
      // ignore
    }
  });

  el('paste-btn').addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        el('url-input').value = text.trim();
        showError(null);
      }
    } catch {
      // ignore
    }
  });

  el('scan-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!state.isScanning) {
      void runScan(el('url-input').value);
    }
  });

  el('details-btn').addEventListener('click', () => {
    state.showDetails = !state.showDetails;
    if (state.result) renderResult(state.result);
  });

  el('pdf-btn').addEventListener('click', () => {
    void downloadPdf();
  });

  el('police-btn').addEventListener('click', () => {
    state.showPoliceNotice = !state.showPoliceNotice;
    el('police-notice').classList.toggle('hidden', !state.showPoliceNotice);
  });

  el('copy-json-btn').addEventListener('click', async () => {
    if (!state.result) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(state.result, null, 2));
      el('copy-json-btn').textContent = t().copied;
      window.setTimeout(() => {
        el('copy-json-btn').textContent = t().copyJson;
      }, 1500);
    } catch {
      // ignore
    }
  });

  el('dev-monitor-checkbox').addEventListener('change', async (e) => {
    if (!EXTENSION_CONFIG.DEV_MODE) return;
    state.devAutoMonitorEnabled = Boolean(e.target.checked);
    await storageSet('local', { devAutoMonitorEnabled: state.devAutoMonitorEnabled });
    el('dev-monitor-status').textContent = state.devAutoMonitorEnabled
      ? t().devActiveStatus
      : t().devInactiveStatus;
  });
}

void init();
