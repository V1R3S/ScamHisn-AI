import { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';
import { useLocale } from '../i18n/LocaleContext';
import { ThemeToggle } from './ThemeToggle';
import { HisnLogo } from './HisnLogo';

/** Which page the hash router is showing, so the matching nav link can be underlined. */
function useIsImpactRoute(): boolean {
  const [isImpact, setIsImpact] = useState(() => window.location.hash.startsWith('#/impact'));
  useEffect(() => {
    const onChange = () => setIsImpact(window.location.hash.startsWith('#/impact'));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return isImpact;
}

export function Header() {
  const { locale, t, toggleLocale } = useLocale();
  const isImpact = useIsImpactRoute();

  const navItems = [
    { href: '#/', label: t.nav.check, active: !isImpact },
    { href: '#/impact', label: t.nav.impact, active: isImpact },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-hairline bg-page">
      <div className="mx-auto flex h-14 max-w-[1104px] items-center justify-between gap-2 px-4 sm:h-16 sm:gap-3 sm:px-8">
        <a
          href="/"
          className="inline-flex min-w-0 items-center gap-1.5 text-base font-extrabold text-ink sm:gap-2 sm:text-xl"
        >
          <HisnLogo className="h-7 w-7 shrink-0 sm:h-9 sm:w-9" />
          <span className="truncate tracking-tight">{t.brandName}</span>
        </a>

        <div className="flex shrink-0 items-center gap-2.5 sm:gap-5">
          <nav className="flex items-center gap-3 sm:gap-7">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                aria-current={item.active ? 'page' : undefined}
                className={`relative py-2 text-[13px] font-bold transition-colors sm:text-[15px] ${
                  item.active ? 'text-ink' : 'text-muted hover:text-ink'
                }`}
              >
                {item.label}
                {item.active && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-[2.5px] rounded-full bg-brand"
                  />
                )}
              </a>
            ))}
          </nav>

          <span aria-hidden="true" className="h-5 w-px bg-ink/25 max-sm:hidden" />

          <button
            type="button"
            onClick={toggleLocale}
            aria-label={locale === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
            className="inline-flex cursor-pointer items-center gap-1 py-2 text-[13px] font-bold text-ink transition-colors hover:text-brand sm:gap-1.5 sm:text-[15px]"
          >
            <Globe className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
            {locale === 'en' ? <span lang="ar">العربية</span> : <span lang="en">English</span>}
          </button>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
