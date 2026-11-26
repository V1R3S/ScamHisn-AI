import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_GEMINI_MODEL } from '@scamhisn/shared';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Load .env from monorepo root first, then local fallback without overwriting existing env vars
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1' || normalized === 'yes') return true;
  if (normalized === 'false' || normalized === '0' || normalized === 'no') return false;
  return fallback;
}

function parseOrigins(raw: string | undefined): string[] {
  if (!raw || !raw.trim()) return [];
  return raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
}

function isPlaceholderKey(key: string): boolean {
  const k = key.trim().toLowerCase();
  return k.length === 0 || k.includes('your_google_ai_studio') || k === 'changeme';
}

/**
 * Gemini keys, in the order they are tried. GEMINI_API_KEY stays the primary; GEMINI_API_KEYS
 * (comma-separated) and GEMINI_API_KEY_2 add fallbacks used when the previous key is rate limited.
 */
function parseGeminiKeys(): string[] {
  const candidates = [
    process.env.GEMINI_API_KEY ?? '',
    ...(process.env.GEMINI_API_KEYS ?? '').split(','),
    process.env.GEMINI_API_KEY_2 ?? '',
  ];
  const keys: string[] = [];
  for (const raw of candidates) {
    const key = raw.trim();
    if (!isPlaceholderKey(key) && !keys.includes(key)) keys.push(key);
  }
  return keys;
}

const geminiApiKeys = parseGeminiKeys();
const localLlmBaseUrl = process.env.LOCAL_LLM_BASE_URL?.trim() ?? '';

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parsePositiveInt(process.env.PORT, 3001),
  geminiApiKey: geminiApiKeys[0] ?? null,
  geminiApiKeys,
  // Claude answers when every Gemini key and model has failed (see ai/claudeBackup.ts)
  anthropicApiKey: process.env.ANTHROPIC_API_KEY?.trim() || null,
  claudeModel: process.env.CLAUDE_MODEL?.trim() || 'claude-opus-5-5',
  claudeTimeoutMs: parsePositiveInt(process.env.CLAUDE_TIMEOUT_MS, 40_000),
  geminiModel: process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL,
  /** Second Gemini model tried when the primary is overloaded or rate limited (limits are per model). */
  geminiFallbackModel: process.env.GEMINI_FALLBACK_MODEL?.split(',')[0]?.trim() || null,
  /**
   * Backup Gemini models in the order they are tried, from GEMINI_FALLBACK_MODEL (comma-separated).
   * Each model has its own allowance, so a list keeps the AI answering when the primary runs out.
   */
  geminiFallbackModels: (process.env.GEMINI_FALLBACK_MODEL ?? '')
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean),
  /**
   * How long a Gemini key+model is left alone after a quota / overload error. While every key is
   * cooling down, the features that need Gemini (Job, Map, Image) are switched off.
   */
  geminiCooldownMs: parsePositiveInt(process.env.GEMINI_COOLDOWN_MS, 120_000),
  /**
   * AI_PIPELINE:
   *   hybrid       Gemini researches live sources, the self-hosted model makes the judgment
   *   gemini_first Gemini judges; the self-hosted model is only a fallback
   *   auto         (default) hybrid when a self-hosted model is configured, else gemini_first
   */
  aiPipeline: ((): 'hybrid' | 'gemini_first' => {
    const raw = process.env.AI_PIPELINE?.trim().toLowerCase();
    if (raw === 'hybrid' || raw === 'gemini_first') return raw;
    return localLlmBaseUrl ? 'hybrid' : 'gemini_first';
  })(),
  /** Hard ceiling for one AI provider attempt before the chain moves to the next one. */
  aiRequestTimeoutMs: parsePositiveInt(process.env.AI_REQUEST_TIMEOUT_MS, 25_000),
  /**
   * Optional self-hosted OpenAI-compatible model (e.g. Jais 2 on llama.cpp / Ollama), used when
   * every Gemini option fails. Null when LOCAL_LLM_BASE_URL is not set.
   */
  localLlm: localLlmBaseUrl
    ? {
        baseUrl: localLlmBaseUrl,
        model: process.env.LOCAL_LLM_MODEL?.trim() || 'jais-2-8b-chat',
        apiKey: process.env.LOCAL_LLM_API_KEY?.trim() || null,
        timeoutMs: parsePositiveInt(process.env.LOCAL_LLM_TIMEOUT_MS, 45_000),
        maxPromptChars: parsePositiveInt(process.env.LOCAL_LLM_MAX_PROMPT_CHARS, 9_000),
      }
    : null,
  corsAllowedOrigins: parseOrigins(process.env.CORS_ALLOWED_ORIGINS),
  corsAllowExtensions: parseBool(process.env.CORS_ALLOW_EXTENSIONS, true),
  playwrightHeadless: parseBool(process.env.PLAYWRIGHT_HEADLESS, true),
  scanTimeoutMs: parsePositiveInt(process.env.SCAN_TIMEOUT_MS, 25_000),
  navigationTimeoutMs: parsePositiveInt(process.env.NAVIGATION_TIMEOUT_MS, 15_000),
  maxConcurrentScans: parsePositiveInt(process.env.MAX_CONCURRENT_SCANS, 3),
  maxRedirectHops: parsePositiveInt(process.env.MAX_REDIRECT_HOPS, 8),
  rateLimitWindowMs: parsePositiveInt(process.env.RATE_LIMIT_WINDOW_MS, 60_000),
  rateLimitMax: parsePositiveInt(process.env.RATE_LIMIT_MAX, 20),
} as const;
