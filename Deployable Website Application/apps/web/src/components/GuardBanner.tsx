import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { useLocale } from '../i18n/LocaleContext';

/**
 * Shown above the report when the browser extension's Check Everything sent the user here
 * instead of opening a site. The two buttons talk to the extension through a small bridge
 * script that the extension injects on this site only; without the extension they fall back
 * to plain navigation.
 */

const TEXT = {
  en: {
    checking: 'Check Everything is checking this site before it opens',
    stopped: 'Check Everything stopped this site before it opened',
    cleared: 'Check Everything checked this site and found no reason to stop it',
    target: 'You were going to',
    back: 'Go back',
    open: 'Open the site anyway',
    openSafe: 'Open the site',
    warn: 'Only continue if you are sure. Never enter passwords, card details or one-time codes there.',
  },
  ar: {
    checking: 'خاصية «افحص كل شيء» تفحص هذا الموقع قبل فتحه',
    stopped: 'خاصية «افحص كل شيء» أوقفت هذا الموقع قبل فتحه',
    cleared: 'خاصية «افحص كل شيء» فحصت هذا الموقع ولم تجد سبباً لإيقافه',
    target: 'كنت متجهاً إلى',
    back: 'ارجع',
    open: 'افتح الموقع على أي حال',
    openSafe: 'افتح الموقع',
    warn: 'لا تكمل إلا إذا كنت متأكداً. لا تُدخل كلمات المرور أو بيانات البطاقة أو رموز التحقق هناك.',
  },
} as const;

function askExtension(action: 'back' | 'allow', url: string): void {
  let answered = false;
  const onAck = (event: MessageEvent) => {
    if (event.source === window && event.data?.source === 'scamhisn-guard-ack') answered = true;
  };
  window.addEventListener('message', onAck);
  window.postMessage({ source: 'scamhisn-guard', action, url }, window.location.origin);
  // No extension listening (the page was opened by hand): do the plain thing instead
  window.setTimeout(() => {
    window.removeEventListener('message', onAck);
    if (answered) return;
    if (action === 'allow') window.location.href = url;
    else window.history.back();
  }, 700);
}

export function GuardBanner({ url, state }: { url: string; state: 'checking' | 'stopped' | 'cleared' }) {
  const { locale } = useLocale();
  const c = TEXT[locale];
  const danger = state === 'stopped';
  const Icon = state === 'cleared' ? ShieldCheck : ShieldAlert;
  return (
    <section
      className={`my-6 rounded-2xl border-2 p-4 sm:p-5 ${danger ? 'border-danger bg-danger-tint' : 'border-outline bg-surface'}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-7 w-7 shrink-0 ${danger ? 'text-danger' : 'text-brand'}`} strokeWidth={1.75} aria-hidden="true" />
        <div className="min-w-0">
          <h2 className="text-lg font-black tracking-tight text-ink sm:text-xl">{c[state]}</h2>
          <p className="mt-1 text-sm text-muted">
            {c.target}{' '}
            <span dir="ltr" className="break-all font-mono font-bold text-ink">
              {url}
            </span>
          </p>
        </div>
      </div>
      {state !== 'checking' && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => askExtension('back', url)}
            className="cursor-pointer rounded-xl bg-brand px-4 py-2.5 text-sm font-extrabold text-on-brand transition-colors hover:bg-brand-hover"
          >
            {c.back}
          </button>
          <button
            type="button"
            onClick={() => askExtension('allow', url)}
            className="cursor-pointer rounded-xl border-2 border-outline bg-surface px-4 py-2 text-sm font-extrabold text-ink transition-colors hover:border-brand"
          >
            {danger ? c.open : c.openSafe}
          </button>
          {danger && <span className="text-xs font-semibold text-danger">{c.warn}</span>}
        </div>
      )}
    </section>
  );
}
