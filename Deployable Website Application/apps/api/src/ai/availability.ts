import type { AiCapabilities, FeatureAvailability } from '@scamhisn/shared';

/**
 * Which features can run right now.
 *
 * Job, Map and Image checks depend on Gemini: live Google Search / Maps lookups and vision are
 * things a self-hosted text model cannot do. When every Gemini key is exhausted those features
 * are switched OFF for a cool-down rather than quietly answering with less evidence.
 * General link checks never switch off: the local model answers, and after it the rules.
 */

export const GEMINI_QUOTA = 'quota';

export interface CapabilityInput {
  /** Ids of every configured Gemini (key, model) pair. Empty when no key is set. */
  geminiProviderIds: string[];
  /** Epoch ms until which a provider is cooling down, or null when it is usable. */
  coolingUntil: (providerId: string) => number | null;
  /** Name of the self-hosted model, or null when none is configured. */
  localModel: string | null;
  /** True when Claude is configured as the backup researcher and image reader. */
  claudeConfigured?: boolean;
  pipeline: AiCapabilities['pipeline'];
  now: number;
}

export function computeCapabilities(input: CapabilityInput): AiCapabilities {
  const geminiConfigured = input.geminiProviderIds.length > 0;
  const coolDowns = input.geminiProviderIds.map((id) => input.coolingUntil(id));
  const geminiAvailable = geminiConfigured && coolDowns.some((until) => until === null);

  // Earliest moment any key comes back
  const pending = coolDowns.filter((until): until is number => until !== null && until > input.now);
  const geminiRetryAt =
    geminiConfigured && !geminiAvailable && pending.length > 0
      ? new Date(Math.min(...pending)).toISOString()
      : null;

  const always: FeatureAvailability = { available: true, reason: 'ok', retryAt: null };
  // With Claude as backup these features keep working while Gemini cools down
  const needsGemini: FeatureAvailability = geminiAvailable || input.claudeConfigured
    ? always
    : geminiConfigured
      ? { available: false, reason: 'gemini_cooling_down', retryAt: geminiRetryAt }
      : { available: false, reason: 'gemini_not_configured', retryAt: null };

  return {
    pipeline: input.pipeline,
    geminiConfigured,
    geminiAvailable,
    geminiRetryAt,
    localModelConfigured: input.localModel !== null,
    localModel: input.localModel,
    features: {
      general: always,
      job: needsGemini,
      map: needsGemini,
      image: needsGemini,
    },
  };
}

export type GatedFeature = 'job' | 'map' | 'image';

/** Thrown when a feature that needs Gemini is requested while Gemini is unavailable. */
export class FeatureUnavailableError extends Error {
  public readonly code = 'FEATURE_UNAVAILABLE';
  public readonly statusCode = 503;
  public readonly messageAr: string;
  public readonly retryAt: string | null;
  public readonly feature: GatedFeature;

  constructor(feature: GatedFeature, availability: FeatureAvailability) {
    const names: Record<GatedFeature, { en: string; ar: string }> = {
      job: { en: 'Job post checks', ar: 'فحص إعلانات الوظائف' },
      map: { en: 'Map link checks', ar: 'فحص روابط الخرائط' },
      image: { en: 'Image checks', ar: 'فحص الصور' },
    };
    const name = names[feature];
    const coolingDown = availability.reason === 'gemini_cooling_down';
    super(
      coolingDown
        ? `${name.en} are paused: Gemini is over its limit or not answering on every key. They switch back on automatically after a short cool-down. General link checks still work.`
        : `${name.en} need a Gemini key, and none is configured on this server. General link checks still work.`,
    );
    this.name = 'FeatureUnavailableError';
    this.feature = feature;
    this.retryAt = availability.retryAt;
    this.messageAr = coolingDown
      ? `${name.ar} متوقف مؤقتاً: Gemini تجاوز حدّه أو لا يستجيب على كل المفاتيح. يرجع تلقائياً بعد فترة تهدئة قصيرة. فحص الروابط العامة شغّال.`
      : `${name.ar} يحتاج مفتاح Gemini، ولا يوجد مفتاح مفعّل على هذا الخادم. فحص الروابط العامة شغّال.`;
  }
}
