import {
  API_ENDPOINTS,
  type AiCapabilities,
  type ApiErrorResponse,
  type HealthResponse,
  type ImageScanRequest,
  type ImageScanResponse,
  type Locale,
  type ScanMode,
  type ScanResponse,
} from '@scamhisn/shared';

export class ApiClientError extends Error {
  public readonly code: string;
  public readonly messageAr?: string;

  constructor(code: string, message: string, messageAr?: string) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.messageAr = messageAr;
  }
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? '';

/** Which features can run right now (Gemini healthy, cooling down, or not configured). */
export async function fetchCapabilities(): Promise<AiCapabilities | null> {
  try {
    const res = await fetch(`${API_BASE}${API_ENDPOINTS.health}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as HealthResponse;
    return data.capabilities ?? null;
  } catch {
    return null;
  }
}

export async function scanUrl(params: {
  url: string;
  mode: ScanMode;
  locale: Locale;
  /** 'claude' is used by Check Everything; left out, the server uses its normal chain. */
  engine?: 'auto' | 'claude';
}): Promise<ScanResponse> {
  const res = await fetch(`${API_BASE}${API_ENDPOINTS.scan}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-ScamHisn-Client': 'web-app/1.0.0',
    },
    body: JSON.stringify(params),
  });

  const data = (await res.json().catch(() => null)) as ScanResponse | ApiErrorResponse | null;

  if (!res.ok) {
    const apiErr = (data as ApiErrorResponse | null)?.error;
    throw new ApiClientError(
      apiErr?.code ?? 'REQUEST_FAILED',
      apiErr?.message ?? `Scan request failed with HTTP ${res.status}`,
      apiErr?.messageAr,
    );
  }

  return data as ScanResponse;
}

export async function scanImage(params: ImageScanRequest): Promise<ImageScanResponse> {
  const res = await fetch(`${API_BASE}${API_ENDPOINTS.scanImage}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-ScamHisn-Client': 'web-app/1.0.0',
    },
    body: JSON.stringify(params),
  });

  const data = (await res.json().catch(() => null)) as ImageScanResponse | ApiErrorResponse | null;

  if (!res.ok) {
    const apiErr = (data as ApiErrorResponse | null)?.error;
    throw new ApiClientError(
      apiErr?.code ?? 'IMAGE_SCAN_FAILED',
      apiErr?.message ?? `Image scan failed with HTTP ${res.status}`,
      apiErr?.messageAr,
    );
  }

  return data as ImageScanResponse;
}

export async function downloadForensicReportPdf(
  report: ScanResponse,
  locale: Locale,
): Promise<void> {
  const res = await fetch(`${API_BASE}${API_ENDPOINTS.reportPdf}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/pdf',
      'X-ScamHisn-Client': 'web-app/1.0.0',
    },
    body: JSON.stringify({ report, locale }),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as ApiErrorResponse | null;
    throw new ApiClientError(
      data?.error?.code ?? 'PDF_FAILED',
      data?.error?.message ?? 'Failed to generate PDF report',
      data?.error?.messageAr,
    );
  }

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const shortId = report.scanId.slice(0, 8);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = `ScamHisn-Report-${shortId}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
}
