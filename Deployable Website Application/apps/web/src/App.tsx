import { useCallback, useEffect, useState } from 'react';
import { ImpactPage } from './components/ImpactPage';
import { WatchPage } from './components/WatchPage';
import { Download } from 'lucide-react';
import type { AiCapabilities, ImageScanResponse, ScanMode, ScanResponse } from '@scamhisn/shared';
import { LocaleProvider, useLocale } from './i18n/LocaleContext';
import { TEAM_MEMBERS } from './i18n/translations';
import { ThemeProvider } from './theme/ThemeContext';
import { ApiClientError, fetchCapabilities, scanImage, scanUrl } from './api/client';
import type { CompressedImagePayload } from './utils/imageCompress';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ScanForm, type InspectorTab } from './components/ScanForm';
import { ScanProgress } from './components/ScanProgress';
import { ResultsDashboard } from './components/ResultsDashboard';
import { ImageResultsCard } from './components/ImageResultsCard';

/** Minimal hash routing: "#/impact" shows the Impact page, anything else the inspector. */
function useHashRoute(): string {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onChange = () => {
      setHash(window.location.hash);
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

function ScamHisnShell() {
  const { locale, t } = useLocale();
  const route = useHashRoute();
  const showImpact = route.startsWith('#/impact');
  const showWatch = route.startsWith('#/watch');
  const [url, setUrl] = useState('');

  // A "Check it" link on the Check Everything page arrives as #/?check=<address>: put it in the box
  useEffect(() => {
    const at = route.indexOf('?check=');
    if (at < 0) return;
    try {
      setUrl(decodeURIComponent(route.slice(at + 7)));
    } catch {
      // a malformed address is simply ignored
    }
  }, [route]);
  const [mode, setMode] = useState<InspectorTab>('general');
  const [selectedImage, setSelectedImage] = useState<CompressedImagePayload | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanningVariant, setScanningVariant] = useState<'url' | 'image'>('url');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [imageResult, setImageResult] = useState<{
    data: ImageScanResponse;
    previewDataUrl: string;
    fileName: string;
  } | null>(null);

  // Which features can run right now. Refreshed on load, every 15 s, and after each scan,
  // so a paused feature shows as paused and comes back on its own when the cool-down ends.
  const [capabilities, setCapabilities] = useState<AiCapabilities | null>(null);
  const refreshCapabilities = useCallback(async () => {
    setCapabilities(await fetchCapabilities());
  }, []);
  useEffect(() => {
    void refreshCapabilities();
    const timer = window.setInterval(() => void refreshCapabilities(), 15_000);
    return () => window.clearInterval(timer);
  }, [refreshCapabilities]);

  const handleModeChange = (nextMode: InspectorTab) => {
    setMode(nextMode);
    setError(null);
  };

  const handleScanUrl = async (targetUrl: string, targetMode: ScanMode) => {
    setIsScanning(true);
    setScanningVariant('url');
    setError(null);
    // Clear the previous verdict so a failed scan never leaves an old result on screen
    setResult(null);
    setImageResult(null);

    try {
      const response = await scanUrl({ url: targetUrl, mode: targetMode, locale });
      setImageResult(null);
      setResult(response);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(locale === 'ar' && err.messageAr ? err.messageAr : err.message);
      } else {
        setError(
          locale === 'ar'
            ? 'تعذّر الاتصال بخادم الفحص. تأكد من تشغيل الخدمة وحاول مرة ثانية.'
            : err instanceof Error
              ? err.message
              : 'Failed to reach the inspection server.',
        );
      }
    } finally {
      setIsScanning(false);
      void refreshCapabilities();
    }
  };

  const handleScanImage = async (img: CompressedImagePayload) => {
    setIsScanning(true);
    setScanningVariant('image');
    setError(null);
    setResult(null);
    setImageResult(null);

    try {
      const response = await scanImage({
        imageBase64: img.imageBase64,
        mimeType: img.mimeType,
        fileName: img.fileName,
        locale,
      });
      setResult(null);
      setImageResult({
        data: response,
        previewDataUrl: img.previewDataUrl,
        fileName: img.fileName,
      });
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(locale === 'ar' && err.messageAr ? err.messageAr : err.message);
      } else {
        setError(
          locale === 'ar'
            ? 'تعذّر فحص الصورة المرفوعة. تأكد من الاتصال وحاول مرة ثانية.'
            : err instanceof Error
              ? err.message
              : 'Failed to inspect the uploaded image.',
        );
      }
    } finally {
      setIsScanning(false);
      void refreshCapabilities();
    }
  };

  const handleDeepScanExtractedUrl = (extractedUrl: string) => {
    setMode('general');
    setUrl(extractedUrl);
    void handleScanUrl(extractedUrl, 'general');
  };

  // Once there is something to show, the hero shrinks so the result sits near the top
  const compactHero = isScanning || result !== null || imageResult !== null;

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-page text-ink">
      <Header />

      {showImpact && (
        <main className="flex-1">
          <ImpactPage />
        </main>
      )}

      {showWatch && (
        <main className="flex-1">
          <WatchPage />
        </main>
      )}

      <main hidden={showImpact || showWatch} className="mx-auto w-full max-w-[1104px] flex-1 px-4 pb-20 sm:px-8 sm:pb-24">
        <Hero compact={compactHero} />

        {/* Inspection Form */}
        <ScanForm
          url={url}
          mode={mode}
          selectedImage={selectedImage}
          isScanning={isScanning}
          error={error}
          capabilities={capabilities}
          onUrlChange={setUrl}
          onModeChange={handleModeChange}
          onImageSelect={(img) => {
            setSelectedImage(img);
            if (!img) setImageResult(null);
          }}
          onError={setError}
          onSubmitUrl={handleScanUrl}
          onSubmitImage={handleScanImage}
        />

        {/* Progress or Results */}
        {isScanning ? (
          <ScanProgress variant={scanningVariant} />
        ) : imageResult ? (
          <ImageResultsCard
            key={imageResult.data.scanId}
            result={imageResult.data}
            previewDataUrl={imageResult.previewDataUrl}
            fileName={imageResult.fileName}
            onDeepScanUrl={handleDeepScanExtractedUrl}
          />
        ) : (
          result && <ResultsDashboard key={result.scanId} result={result} />
        )}
      </main>

      {/* Footer: team, the three notes, and the Chrome extension download */}
      <footer className="border-t border-hairline">
        <div className="mx-auto grid max-w-[1104px] gap-x-12 gap-y-8 px-4 py-10 text-sm sm:px-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
          <div>
            <p className="text-base font-extrabold text-ink">{t.footer.teamName}</p>
            <p className="mt-2 leading-relaxed text-muted">
              <span>{t.footer.membersLabel}: </span>
              <span dir="ltr" className="inline-block text-left rtl:text-right">
                {TEAM_MEMBERS.join(', ')}
              </span>
            </p>

            <a
              href="/scamhisn-extension.zip"
              download="scamhisn-extension.zip"
              className="btn btn-outline mt-5 text-sm"
            >
              <Download className="h-4 w-4" strokeWidth={1.9} aria-hidden="true" />
              <span>{t.footer.downloadExtensionBtn}</span>
            </a>
            <p className="mt-2.5 text-xs leading-relaxed text-muted">
              {t.footer.extensionDesktopOnly}
              <br />
              {t.footer.extensionBriefSteps}
            </p>
          </div>

          <ul className="space-y-2.5 text-[13px] leading-relaxed text-muted">
            <li>{t.footer.apiNoteDesc}</li>
            <li>{t.footer.sandboxNote}</li>
            <li>{t.footer.privacyNote}</li>
          </ul>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <ScamHisnShell />
      </LocaleProvider>
    </ThemeProvider>
  );
}
