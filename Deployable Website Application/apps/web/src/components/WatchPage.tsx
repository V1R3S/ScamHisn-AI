import { useCallback, useEffect, useState } from 'react';
import { Download, Radar, RefreshCw } from 'lucide-react';
import { useLocale } from '../i18n/LocaleContext';
import { SectionHeading } from './ScribbleUnderline';

/** Mirrors apps/api/src/watch/watchService.ts */
interface WatchFinding {
  host: string;
  registrableDomain: string;
  brand: string;
  reason: string;
  certLoggedAt: string;
  firstSeenAt: string;
  log: string;
  scamScore: number;
  verdict: string;
  flags: string[];
  resolves: boolean;
  registeredAt: string | null;
  domainAgeDays: number | null;
}

interface WatchStatus {
  enabled: boolean;
  running: boolean;
  lastRunAt: string | null;
  lastRunSeconds: number | null;
  lastRunCertificates: number;
  lastRunError: string | null;
  logsRead: string[];
  intervalMinutes: number;
  totals: { certificatesRead: number; namesChecked: number; runs: number };
  findingCount: number;
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? '';

const TEXT = {
  en: {
    title: 'Check Everything',
    lead: 'Every HTTPS site gets a certificate, and every certificate is written to a public log, usually minutes before the site goes live. Check Everything reads those logs and looks for new addresses that imitate UAE brands, before anyone has reported them.',
    certs: 'certificates read',
    names: 'addresses checked',
    found: 'look-alikes found',
    last: 'last pass',
    never: 'not yet',
    running: 'Reading the logs…',
    scan: 'Scan now',
    export: 'Export CSV',
    every: (m: number) => `A pass runs by itself every ${m} minutes.`,
    findings: 'Look-alikes of UAE brands',
    empty: 'No look-alike of a UAE brand in the certificates read so far. That is the normal state: most passes find none.',
    imitates: 'Imitates',
    issued: 'Certificate logged',
    registered: 'Domain registered',
    unknown: 'not published',
    live: 'Answers now',
    notLive: 'Not answering yet',
    check: 'Check it',
    how: 'How to read this',
    notes: [
      'A look-alike is an address that carries the name of a UAE brand as a word of its own, on a domain that brand does not own.',
      'The score is the same address check a pasted link gets. No AI is used here, so this page works even when the AI services are busy.',
      'A match is a lead to look at, not proof of a scam. Some are harmless businesses with a similar name.',
      'Only brands in our catalogue are watched, and only sites that request a certificate show up here.',
    ],
    ago: (m: number) => (m < 1 ? 'just now' : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`),
    days: (d: number) => (d === 0 ? 'today' : d === 1 ? 'yesterday' : `${d} days ago`),
    failed: 'Check Everything could not be reached.',
  },
  ar: {
    title: 'افحص كل شيء',
    lead: 'كل موقع آمن يحصل على شهادة، وكل شهادة تُسجَّل في سجل عام، غالباً قبل تشغيل الموقع بدقائق. خاصية «افحص كل شيء» تقرأ هذه السجلات ويبحث عن عناوين جديدة تنتحل جهات إماراتية، قبل أن يبلّغ عنها أحد.',
    certs: 'شهادة تمت قراءتها',
    names: 'عنوان تم فحصه',
    found: 'عنوان منتحِل',
    last: 'آخر جولة',
    never: 'لم تبدأ بعد',
    running: 'جارٍ قراءة السجلات…',
    scan: 'افحص الآن',
    export: 'تصدير CSV',
    every: (m: number) => `تعمل جولة تلقائياً كل ${m} دقائق.`,
    findings: 'عناوين تنتحل جهات إماراتية',
    empty: 'لا يوجد عنوان ينتحل جهة إماراتية في الشهادات المقروءة حتى الآن. هذا هو الوضع الطبيعي: أغلب الجولات لا تجد شيئاً.',
    imitates: 'ينتحل',
    issued: 'تسجيل الشهادة',
    registered: 'تسجيل النطاق',
    unknown: 'غير منشور',
    live: 'يستجيب الآن',
    notLive: 'لا يستجيب بعد',
    check: 'افحصه',
    how: 'كيف تقرأ هذه الصفحة',
    notes: [
      'العنوان المنتحِل هو عنوان يحمل اسم جهة إماراتية ككلمة مستقلة على نطاق لا تملكه تلك الجهة.',
      'الدرجة هي نفس فحص العنوان الذي يحصل عليه أي رابط تلصقه. لا يُستخدم الذكاء الاصطناعي هنا، لذلك تعمل الصفحة حتى لو كانت خدمات الذكاء الاصطناعي مشغولة.',
      'التطابق خيط يستحق النظر وليس دليلاً على الاحتيال. بعضها أعمال عادية باسم مشابه.',
      'نراقب الجهات الموجودة في قائمتنا فقط، ولا يظهر هنا إلا المواقع التي طلبت شهادة.',
    ],
    ago: (m: number) => (m < 1 ? 'الآن' : m < 60 ? `قبل ${m} د` : m < 1440 ? `قبل ${Math.round(m / 60)} س` : `قبل ${Math.round(m / 1440)} يوم`),
    days: (d: number) => (d === 0 ? 'اليوم' : d === 1 ? 'أمس' : `قبل ${d} يوماً`),
    failed: 'تعذّر الوصول إلى خدمة «افحص كل شيء».',
  },
} as const;

function minutesSince(iso: string): number {
  return Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60_000));
}

function toCsv(findings: WatchFinding[]): string {
  const cell = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const head = ['address', 'registrable_domain', 'imitates', 'score', 'verdict', 'certificate_logged_utc', 'domain_registered_utc', 'answers_dns', 'certificate_log', 'reason'];
  const rows = findings.map((f) =>
    [f.host, f.registrableDomain, f.brand, f.scamScore, f.verdict, f.certLoggedAt, f.registeredAt ?? '', f.resolves, f.log, f.reason].map(cell).join(','),
  );
  return [head.join(','), ...rows].join('\r\n');
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border-2 border-outline bg-surface px-4 py-4">
      <div className="text-2xl font-black tracking-tight text-brand sm:text-3xl">{value}</div>
      <div className="mt-1 text-xs font-semibold text-muted">{label}</div>
    </div>
  );
}

export function WatchPage() {
  const { locale } = useLocale();
  const c = TEXT[locale];
  const [status, setStatus] = useState<WatchStatus | null>(null);
  const [findings, setFindings] = useState<WatchFinding[]>([]);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/watch`, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(String(res.status));
      const body = (await res.json()) as { status: WatchStatus; findings: WatchFinding[] };
      setStatus(body.status);
      setFindings(body.findings);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), 5000);
    return () => clearInterval(timer);
  }, [load]);

  const scanNow = async () => {
    setStatus((prev) => (prev ? { ...prev, running: true } : prev));
    try {
      await fetch(`${API_BASE}/api/v1/watch/run`, { method: 'POST' });
    } finally {
      void load();
    }
  };

  const exportCsv = () => {
    const blob = new Blob([`﻿${toCsv(findings)}`], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `scamhisn-check-everything-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const number = (n: number) => n.toLocaleString(locale === 'ar' ? 'ar-AE' : 'en-US');

  return (
    <article className="mx-auto w-full max-w-4xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14">
      <div className="flex items-center gap-3">
        <Radar className="h-8 w-8 text-brand" strokeWidth={1.75} aria-hidden="true" />
        <h1 className="text-3xl font-black tracking-tight text-ink sm:text-4xl">{c.title}</h1>
      </div>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">{c.lead}</p>

      {failed && <p className="mt-6 w-fit rounded-xl bg-warn-tint px-4 py-2 text-sm font-semibold text-warn">{c.failed}</p>}

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat value={status ? number(status.totals.certificatesRead) : '…'} label={c.certs} />
        <Stat value={status ? number(status.totals.namesChecked) : '…'} label={c.names} />
        <Stat value={number(findings.length)} label={c.found} />
        <Stat value={status?.lastRunAt ? c.ago(minutesSince(status.lastRunAt)) : c.never} label={c.last} />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void scanNow()}
          disabled={!status || status.running}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-extrabold text-on-brand transition-colors hover:bg-brand-hover disabled:cursor-default disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${status?.running ? 'animate-spin' : ''}`} aria-hidden="true" />
          {status?.running ? c.running : c.scan}
        </button>
        <button
          type="button"
          onClick={exportCsv}
          disabled={findings.length === 0}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-outline bg-surface px-4 py-2 text-sm font-extrabold text-ink transition-colors hover:border-brand disabled:cursor-default disabled:opacity-50"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          {c.export}
        </button>
        {status && <span className="text-xs font-semibold text-muted">{c.every(status.intervalMinutes)}</span>}
      </div>

      <section className="mt-10 border-t border-hairline pt-10">
        <SectionHeading>{c.findings}</SectionHeading>
        {findings.length === 0 ? (
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted">{c.empty}</p>
        ) : (
          <ul className="mt-6 space-y-3">
            {findings.map((f) => {
              const high = f.scamScore >= 50;
              return (
                <li key={f.registrableDomain} className="rounded-2xl border-2 border-outline bg-surface p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div dir="ltr" className="break-all font-mono text-[15px] font-bold text-ink">
                        {f.host}
                      </div>
                      <div className="mt-1 text-sm text-muted">
                        {c.imitates} <span className="font-extrabold text-ink">{f.brand}</span>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-lg px-2.5 py-1 text-lg font-black ${high ? 'bg-danger-tint text-danger' : 'bg-warn-tint text-warn'}`}
                    >
                      {f.scamScore}%
                    </span>
                  </div>
                  <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 text-xs sm:grid-cols-3">
                    <div>
                      <dt className="inline font-semibold text-muted">{c.issued}: </dt>
                      <dd className="inline font-bold text-ink">{c.ago(minutesSince(f.certLoggedAt))}</dd>
                    </div>
                    <div>
                      <dt className="inline font-semibold text-muted">{c.registered}: </dt>
                      <dd className="inline font-bold text-ink">
                        {f.domainAgeDays === null ? c.unknown : c.days(f.domainAgeDays)}
                      </dd>
                    </div>
                    <div className={`font-bold ${f.resolves ? 'text-danger' : 'text-muted'}`}>{f.resolves ? c.live : c.notLive}</div>
                  </dl>
                  <a
                    href={`#/?check=${encodeURIComponent(`https://${f.host}/`)}`}
                    className="mt-3 inline-block text-xs font-extrabold text-brand hover:underline"
                  >
                    {c.check} →
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-10 border-t border-hairline pt-10">
        <SectionHeading>{c.how}</SectionHeading>
        <ul className="mt-5 max-w-2xl list-disc space-y-2 ps-5 text-sm leading-relaxed text-muted">
          {c.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        {status && status.logsRead.length > 0 && (
          <p dir="ltr" className="mt-5 text-[11px] text-muted">
            Logs read in the last pass: {status.logsRead.join(' · ')}
          </p>
        )}
      </section>
    </article>
  );
}
