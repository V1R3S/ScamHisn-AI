import { z } from 'zod';

export const ScanModeSchema = z.enum(['general', 'job', 'map']);
export type ScanMode = z.infer<typeof ScanModeSchema>;

export const LocaleSchema = z.enum(['en', 'ar']);
export type Locale = z.infer<typeof LocaleSchema>;

export const VerdictLevelSchema = z.enum([
  'safe',
  'caution',
  'suspicious',
  'high_risk',
  'confirmed_scam',
]);
export type VerdictLevel = z.infer<typeof VerdictLevelSchema>;

export const SeveritySchema = z.enum(['critical', 'high', 'medium', 'low', 'info']);
export type Severity = z.infer<typeof SeveritySchema>;

export const ScanRequestSchema = z.object({
  url: z
    .string()
    .trim()
    .min(4, 'URL is required')
    .max(2048, 'URL exceeds maximum allowed length (2048 characters)'),
  mode: ScanModeSchema.default('general'),
  locale: LocaleSchema.optional().default('en'),
});
export type ScanRequest = z.infer<typeof ScanRequestSchema>;

export const BilingualFlagSchema = z.object({
  code: z.string(),
  severity: SeveritySchema,
  category: z.enum([
    'ssl',
    'domain',
    'redirect',
    'headers',
    'credential_harvesting',
    'impersonation',
    'prompt_injection',
    'phishing_kit',
    'job_scam',
    'map_scam',
    'ai_forensics',
    'network',
  ]),
  titleEn: z.string(),
  titleAr: z.string(),
  detailEn: z.string(),
  detailAr: z.string(),
});
export type BilingualFlag = z.infer<typeof BilingualFlagSchema>;

export const TlsCheckSchema = z.object({
  isHttps: z.boolean(),
  checked: z.boolean(),
  valid: z.boolean(),
  authorized: z.boolean(),
  authorizationError: z.string().nullable(),
  selfSigned: z.boolean(),
  expired: z.boolean(),
  notYetValid: z.boolean(),
  hostnameMismatch: z.boolean(),
  issuer: z.string().nullable(),
  subject: z.string().nullable(),
  subjectAltNames: z.array(z.string()),
  validFrom: z.string().nullable(),
  validTo: z.string().nullable(),
  daysRemaining: z.number().nullable(),
  protocol: z.string().nullable(),
  error: z.string().nullable(),
});
export type TlsCheck = z.infer<typeof TlsCheckSchema>;

export const DomainRegistrationSchema = z.object({
  registrableDomain: z.string().nullable(),
  source: z.enum(['rdap', 'whois', 'unavailable']),
  createdAt: z.string().nullable(),
  expiresAt: z.string().nullable(),
  registrar: z.string().nullable(),
  domainAgeDays: z.number().nullable(),
  isNewlyRegistered: z.boolean(),
  isYoungDomain: z.boolean(),
  statuses: z.array(z.string()),
  error: z.string().nullable(),
});
export type DomainRegistration = z.infer<typeof DomainRegistrationSchema>;

export const RedirectHopSchema = z.object({
  url: z.string(),
  status: z.number().nullable(),
});
export type RedirectHop = z.infer<typeof RedirectHopSchema>;

export const RedirectCheckSchema = z.object({
  initialUrl: z.string(),
  finalUrl: z.string(),
  hopCount: z.number(),
  maxHopsExceeded: z.boolean(),
  crossDomainRedirect: z.boolean(),
  chain: z.array(RedirectHopSchema),
});
export type RedirectCheck = z.infer<typeof RedirectCheckSchema>;

export const SecurityHeadersCheckSchema = z.object({
  httpStatus: z.number().nullable(),
  hsts: z.boolean(),
  csp: z.boolean(),
  xFrameOptions: z.boolean(),
  xContentTypeOptions: z.boolean(),
  referrerPolicy: z.boolean(),
  missingCriticalHeaders: z.array(z.string()),
});
export type SecurityHeadersCheck = z.infer<typeof SecurityHeadersCheckSchema>;

export const DnsCheckSchema = z.object({
  aRecords: z.array(z.string()),
  aaaaRecords: z.array(z.string()),
  mxRecords: z.array(z.string()),
  hasSpf: z.boolean(),
  hasDmarc: z.boolean(),
});
export type DnsCheck = z.infer<typeof DnsCheckSchema>;

export const HiddenDomSnippetSchema = z.object({
  technique: z.string(),
  tag: z.string(),
  snippet: z.string(),
});
export type HiddenDomSnippet = z.infer<typeof HiddenDomSnippetSchema>;

export const DomAndFormsCheckSchema = z.object({
  browserCaptured: z.boolean(),
  browserError: z.string().nullable(),
  title: z.string().nullable(),
  formCount: z.number(),
  hasPasswordInput: z.boolean(),
  hasOtpInput: z.boolean(),
  hasPaymentInput: z.boolean(),
  hasGovIdInput: z.boolean(),
  hasSensitiveInputs: z.boolean(),
  externalFormActions: z.array(z.string()),
  hiddenElementCount: z.number(),
  suspiciousHiddenSnippets: z.array(HiddenDomSnippetSchema),
  externalScriptDomains: z.array(z.string()),
  iframeDomains: z.array(z.string()),
  obfuscatedScriptIndicators: z.array(z.string()),
  exfiltrationEndpoints: z.array(z.string()),
});
export type DomAndFormsCheck = z.infer<typeof DomAndFormsCheckSchema>;

export const AnomalyCheckSchema = z.object({
  isPunycode: z.boolean(),
  unicodeDomain: z.string().nullable(),
  hasMixedScriptHomograph: z.boolean(),
  suspiciousTld: z.boolean(),
  tld: z.string().nullable(),
  excessiveSubdomains: z.boolean(),
  subdomainDepth: z.number(),
  usesRawIp: z.boolean(),
  hasEmbeddedCredentials: z.boolean(),
  isUrlShortener: z.boolean(),
  impersonatedBrand: z.string().nullable(),
  impersonationReason: z.string().nullable(),
  phishingKitIndicators: z.array(z.string()),
});
export type AnomalyCheck = z.infer<typeof AnomalyCheckSchema>;

export const PromptInjectionChannelSchema = z.enum([
  'visible_text',
  'hidden_dom',
  'html_comment',
  'meta_tag',
  'map_review',
  'aria_or_data_attr',
]);
export type PromptInjectionChannel = z.infer<typeof PromptInjectionChannelSchema>;

export const PromptInjectionFindingSchema = z.object({
  channel: PromptInjectionChannelSchema,
  patternName: z.string(),
  severity: SeveritySchema,
  matchedExcerpt: z.string(),
  decodedPayload: z.string().optional(),
});
export type PromptInjectionFinding = z.infer<typeof PromptInjectionFindingSchema>;

export const PromptInjectionReportSchema = z.object({
  detected: z.boolean(),
  severity: z.enum(['none', 'low', 'medium', 'high', 'critical']),
  zeroWidthCharCount: z.number(),
  unicodeTagSmugglingDetected: z.boolean(),
  hiddenDomInjectionDetected: z.boolean(),
  reviewInjectionDetected: z.boolean(),
  findings: z.array(PromptInjectionFindingSchema),
});
export type PromptInjectionReport = z.infer<typeof PromptInjectionReportSchema>;

export const GroundingSourceSchema = z.object({
  title: z.string(),
  uri: z.string(),
  sourceType: z.enum(['web', 'maps']),
});
export type GroundingSource = z.infer<typeof GroundingSourceSchema>;

export const JobAuthenticityBreakdownSchema = z.object({
  linkLegitimate: z.boolean(),
  jobAuthenticityScore: z.number().min(0).max(100),
  companyVerified: z.boolean(),
  companyName: z.string().nullable(),
  verificationNotesEn: z.string(),
  verificationNotesAr: z.string(),
  redFlagsEn: z.array(z.string()),
  redFlagsAr: z.array(z.string()),
});
export type JobAuthenticityBreakdown = z.infer<typeof JobAuthenticityBreakdownSchema>;

export const MapVerificationBreakdownSchema = z.object({
  placeVerified: z.boolean(),
  placeName: z.string().nullable(),
  coordinates: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .nullable(),
  businessExistsOnExternalSources: z.boolean(),
  contactHijackingSuspected: z.boolean(),
  reviewInjectionOrScamLinksFound: z.boolean(),
  verificationNotesEn: z.string(),
  verificationNotesAr: z.string(),
});
export type MapVerificationBreakdown = z.infer<typeof MapVerificationBreakdownSchema>;

export const AiForensicAnalysisSchema = z.object({
  status: z.enum(['completed', 'degraded', 'unavailable']),
  error: z.string().nullable(),
  model: z.string(),
  groundingUsed: z.array(z.string()),
  groundingSources: z.array(GroundingSourceSchema),
  aiScamScore: z.number().min(0).max(100).nullable(),
  confidence: z.enum(['high', 'medium', 'low']).nullable(),
  aiDetectedPromptInjection: z.boolean(),
  promptInjectionEvidence: z.string().nullable(),
  impersonatedEntity: z.string().nullable(),
  provablyFalseOrImpersonatedClaim: z.boolean(),
  confirmedPhishingOrScam: z.boolean(),
  summaryEn: z.string(),
  summaryAr: z.string(),
  recommendationEn: z.string(),
  recommendationAr: z.string(),
  keyFindings: z.array(
    z.object({
      severity: SeveritySchema,
      titleEn: z.string(),
      titleAr: z.string(),
      detailEn: z.string(),
      detailAr: z.string(),
    }),
  ),
  jobAnalysis: JobAuthenticityBreakdownSchema.nullable(),
  mapAnalysis: MapVerificationBreakdownSchema.nullable(),
});
export type AiForensicAnalysis = z.infer<typeof AiForensicAnalysisSchema>;

export const TechnicalChecksSchema = z.object({
  ssrf: z.object({
    passed: z.boolean(),
    resolvedIps: z.array(z.string()),
  }),
  tls: TlsCheckSchema,
  domainRegistration: DomainRegistrationSchema,
  redirects: RedirectCheckSchema,
  headers: SecurityHeadersCheckSchema,
  dns: DnsCheckSchema,
  domAndForms: DomAndFormsCheckSchema,
  anomalies: AnomalyCheckSchema,
});
export type TechnicalChecks = z.infer<typeof TechnicalChecksSchema>;

/**
 * How much of the analysis actually ran. The UI must never present an incomplete check as "safe".
 * - full:         page opened AND a grounded AI answered (live Google Search / Maps lookups)
 * - partial:      an AI answered, but without live lookups (backup model) or the page could not be opened
 * - rules_only:   no AI answered — deterministic technical checks only
 * - address_only: the domain does not resolve — verdict is based on the address itself
 */
export const CoverageLevelSchema = z.enum(['full', 'partial', 'rules_only', 'address_only']);
export type CoverageLevel = z.infer<typeof CoverageLevelSchema>;

/**
 * - gemini / gemini_backup: a Gemini key+model answered alone
 * - local:  the self-hosted model answered alone (no live lookups)
 * - hybrid: Gemini gathered the live evidence and the self-hosted model made the judgment
 */
export const AiProviderKindSchema = z.enum(['gemini', 'gemini_backup', 'claude', 'local', 'hybrid', 'none']);
export type AiProviderKind = z.infer<typeof AiProviderKindSchema>;

export const AnalysisCoverageSchema = z.object({
  level: CoverageLevelSchema,
  domainResolved: z.boolean(),
  pageLoaded: z.boolean(),
  aiProvider: AiProviderKindSchema,
  aiModel: z.string().nullable(),
  liveSourcesChecked: z.boolean(),
});
export type AnalysisCoverage = z.infer<typeof AnalysisCoverageSchema>;

export const ScanResponseSchema = z.object({
  scanId: z.string(),
  scannedAt: z.string(),
  durationMs: z.number(),
  mode: ScanModeSchema,
  inputUrl: z.string(),
  finalUrl: z.string(),
  scamScore: z.number().min(0).max(100),
  verdict: VerdictLevelSchema,
  scoreBreakdown: z.object({
    deterministicRiskPoints: z.number(),
    aiScamScore: z.number().nullable(),
    appliedFloor: z.number().nullable(),
    escalationReason: z.string().nullable(),
  }),
  smokingGunsTriggered: z.array(BilingualFlagSchema),
  redFlags: z.array(BilingualFlagSchema),
  technicalChecks: TechnicalChecksSchema,
  promptInjection: PromptInjectionReportSchema,
  aiAnalysis: AiForensicAnalysisSchema,
  coverage: AnalysisCoverageSchema.optional(),
});
export type ScanResponse = z.infer<typeof ScanResponseSchema>;

/**
 * Which features can run right now. Job, Map and Image checks need Gemini (live lookups and
 * vision); when every Gemini key is exhausted they are switched off for a cool-down instead of
 * returning weaker answers. General link checks always run (local model, then rules).
 */
export const FeatureAvailabilitySchema = z.object({
  available: z.boolean(),
  reason: z.enum(['ok', 'gemini_not_configured', 'gemini_cooling_down']),
  /** ISO time at which the feature is retried; null unless cooling down. */
  retryAt: z.string().nullable(),
});
export type FeatureAvailability = z.infer<typeof FeatureAvailabilitySchema>;

export const AiCapabilitiesSchema = z.object({
  pipeline: z.enum(['hybrid', 'gemini_first']),
  geminiConfigured: z.boolean(),
  geminiAvailable: z.boolean(),
  geminiRetryAt: z.string().nullable(),
  localModelConfigured: z.boolean(),
  localModel: z.string().nullable(),
  features: z.object({
    general: FeatureAvailabilitySchema,
    job: FeatureAvailabilitySchema,
    map: FeatureAvailabilitySchema,
    image: FeatureAvailabilitySchema,
  }),
});
export type AiCapabilities = z.infer<typeof AiCapabilitiesSchema>;

export const HealthResponseSchema = z.object({
  status: z.enum(['ok', 'degraded']),
  service: z.string(),
  version: z.string(),
  model: z.string(),
  aiConfigured: z.boolean(),
  timestamp: z.string(),
  capabilities: AiCapabilitiesSchema.optional(),
});
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

export const ApiErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    messageAr: z.string().optional(),
    details: z.unknown().optional(),
    /** Set on FEATURE_UNAVAILABLE: when the feature will be tried again. */
    retryAt: z.string().nullable().optional(),
  }),
});
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;

// =============================================================================
// Screenshot / Image Scam & Authenticity Inspection Schemas
// =============================================================================

export const AllowedImageMimeSchema = z.enum(['image/jpeg', 'image/png', 'image/webp']);
export type AllowedImageMime = z.infer<typeof AllowedImageMimeSchema>;

export const ImageAuthenticityStatusSchema = z.enum([
  'genuine',
  'suspicious',
  'forged_or_scam',
]);
export type ImageAuthenticityStatus = z.infer<typeof ImageAuthenticityStatusSchema>;

export const ImageScanRequestSchema = z.object({
  imageBase64: z
    .string()
    .min(100, 'Image data is required')
    .max(2_000_000, 'Image payload is too large after compression (max ~1.4 MB)'),
  mimeType: AllowedImageMimeSchema,
  fileName: z.string().max(180).optional(),
  locale: LocaleSchema.optional().default('en'),
});
export type ImageScanRequest = z.infer<typeof ImageScanRequestSchema>;

export const ImageFindingSchema = z.object({
  severity: SeveritySchema,
  titleEn: z.string(),
  titleAr: z.string(),
  detailEn: z.string(),
  detailAr: z.string(),
});
export type ImageFinding = z.infer<typeof ImageFindingSchema>;

export const ImageScanResponseSchema = z.object({
  scanId: z.string(),
  scannedAt: z.string(),
  durationMs: z.number(),
  cached: z.boolean(),
  model: z.string(),
  scamScore: z.number().min(0).max(100),
  verdict: VerdictLevelSchema,
  authenticityStatus: ImageAuthenticityStatusSchema,
  isGenuine: z.boolean(),
  visualPromptInjectionDetected: z.boolean(),
  impersonatedEntity: z.string().nullable(),
  extractedUrls: z.array(z.string()),
  extractedPhones: z.array(z.string()),
  summaryEn: z.string(),
  summaryAr: z.string(),
  authenticityNotesEn: z.string(),
  authenticityNotesAr: z.string(),
  findings: z.array(ImageFindingSchema),
});
export type ImageScanResponse = z.infer<typeof ImageScanResponseSchema>;
