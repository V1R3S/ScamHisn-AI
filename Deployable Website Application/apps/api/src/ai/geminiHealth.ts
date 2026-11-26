import type { AiCapabilities } from '@scamhisn/shared';
import { config } from '../config.js';
import {
  computeCapabilities,
  FeatureUnavailableError,
  GEMINI_QUOTA,
  type GatedFeature,
} from './availability.js';
import { RefusalMemo } from './refusalMemo.js';

/**
 * Live health of every Gemini (key, model) pair, shared by link scans and image scans.
 * A pair that returns a quota or overload error is left alone for GEMINI_COOLDOWN_MS, so an
 * exhausted key costs zero further calls until its cool-down ends.
 */
const geminiCooldowns = new RefusalMemo(config.geminiCooldownMs);

/**
 * A key+model that Google says can never work (model not offered to this account, invalid key,
 * permission denied) is switched off for six hours instead of being retried every cool-down.
 */
const geminiDisabled = new RefusalMemo(6 * 60 * 60 * 1000);
const DISABLED = 'disabled';

export function geminiProviderId(keyIndex: number, model: string): string {
  return `gemini:key${keyIndex + 1}:${model}`;
}

/** Primary model first, then the backup model if one is configured. */
export function geminiModels(): string[] {
  const models = [config.geminiModel];
  for (const model of config.geminiFallbackModels) {
    if (!models.includes(model)) models.push(model);
  }
  return models;
}

export function allGeminiProviderIds(): string[] {
  return geminiModels().flatMap((model) =>
    config.geminiApiKeys.map((_key, keyIndex) => geminiProviderId(keyIndex, model)),
  );
}

export function markGeminiExhausted(providerId: string): void {
  geminiCooldowns.remember(providerId, GEMINI_QUOTA);
}

/** Switches a key+model off for hours: the error says it will not start working by itself. */
export function markGeminiUnusable(providerId: string): void {
  geminiDisabled.remember(providerId, DISABLED);
}

export function isGeminiCoolingDown(providerId: string): boolean {
  return (
    geminiCooldowns.isRefused(providerId, GEMINI_QUOTA) || geminiDisabled.isRefused(providerId, DISABLED)
  );
}

function unavailableUntil(providerId: string): number | null {
  const quota = geminiCooldowns.until(providerId, GEMINI_QUOTA);
  const disabled = geminiDisabled.until(providerId, DISABLED);
  if (quota === null && disabled === null) return null;
  return Math.max(quota ?? 0, disabled ?? 0);
}

export function getAiCapabilities(): AiCapabilities {
  return computeCapabilities({
    geminiProviderIds: allGeminiProviderIds(),
    coolingUntil: unavailableUntil,
    localModel: config.localLlm?.model ?? null,
    claudeConfigured: Boolean(config.anthropicApiKey),
    pipeline: config.aiPipeline === 'hybrid' && config.localLlm ? 'hybrid' : 'gemini_first',
    now: Date.now(),
  });
}

/** Throws FeatureUnavailableError when a Gemini-dependent feature cannot run right now. */
export function assertFeatureAvailable(feature: GatedFeature): void {
  const availability = getAiCapabilities().features[feature];
  if (!availability.available) {
    throw new FeatureUnavailableError(feature, availability);
  }
}
