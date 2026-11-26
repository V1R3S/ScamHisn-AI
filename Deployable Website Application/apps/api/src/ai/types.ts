import type {
  AiForensicAnalysis,
  AnomalyCheck,
  DnsCheck,
  DomAndFormsCheck,
  DomainRegistration,
  PromptInjectionReport,
  RedirectCheck,
  ScanMode,
  SecurityHeadersCheck,
  TlsCheck,
} from '@scamhisn/shared';
import type { BrowserInspectionResult } from '../inspectors/browserInspector.js';

/**
 * What the researcher (Gemini, with live Google Search / Maps) found, handed to the self-hosted
 * judge in hybrid mode. Plain facts and short findings only: the judge treats them as evidence.
 */
export interface ResearchNotes {
  researchModel: string;
  liveSourcesChecked: boolean;
  researcherScamScore: number | null;
  summaryEn: string;
  impersonatedEntity: string | null;
  confirmedPhishingOrScam: boolean;
  provablyFalseOrImpersonatedClaim: boolean;
  keyFindings: Array<{ severity: string; title: string; detail: string }>;
  sources: string[];
  jobAnalysis: AiForensicAnalysis['jobAnalysis'];
  mapAnalysis: AiForensicAnalysis['mapAnalysis'];
}

/** Everything an AI provider (Gemini or a self-hosted model) receives for one scan. */
export interface AiAnalysisInput {
  /** 'claude' puts Claude ahead of Gemini as the researcher (Check Everything). */
  engine?: 'auto' | 'claude';
  mode: ScanMode;
  inputUrl: string;
  finalUrl: string;
  tls: TlsCheck;
  registration: DomainRegistration;
  redirects: RedirectCheck;
  headers: SecurityHeadersCheck;
  dns: DnsCheck;
  domAndForms: DomAndFormsCheck;
  anomalies: AnomalyCheck;
  promptInjection: PromptInjectionReport;
  browser: BrowserInspectionResult;
  /** Present only in hybrid mode, when Gemini's research is passed to the self-hosted judge. */
  research?: ResearchNotes;
}
