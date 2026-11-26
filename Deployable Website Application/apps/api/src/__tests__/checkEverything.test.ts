import test from 'node:test';
import assert from 'node:assert/strict';
import { quickAddressCheck } from '../services/quickCheck.js';
import { computeCapabilities } from '../ai/availability.js';
import { ScanRequestSchema } from '@scamhisn/shared';

test('a look-alike of a UAE brand is stopped from the address alone', () => {
  const result = quickAddressCheck('https://adpolice-fines-pay.top/verify');
  assert.ok(result);
  assert.equal(result.block, true);
  assert.equal(result.impersonatedBrand, 'Abu Dhabi Police');
  assert.equal(result.scamScore, 84);
  assert.ok(!result.flags.includes('DOMAIN_OFFLINE'));
});

test('official and ordinary sites are let through at once', () => {
  for (const address of ['https://www.adpolice.gov.ae/', 'https://www.tamm.abudhabi', 'https://example.com/page', 'http://news.example.org']) {
    const result = quickAddressCheck(address);
    assert.ok(result, address);
    assert.equal(result.block, false, address);
  }
  assert.equal(quickAddressCheck('https://www.adpolice.gov.ae/')?.official, true);
  assert.equal(quickAddressCheck('https://example.com/')?.official, false);
});

test('only web addresses are checked', () => {
  for (const address of ['', 'not a url', 'chrome://extensions', 'file:///C:/x.html', 'javascript:alert(1)']) {
    assert.equal(quickAddressCheck(address), null, address);
  }
});

test('a scan request may ask for the Claude engine, and defaults to the normal chain', () => {
  assert.equal(ScanRequestSchema.parse({ url: 'https://example.com' }).engine, 'auto');
  assert.equal(ScanRequestSchema.parse({ url: 'https://example.com', engine: 'claude' }).engine, 'claude');
  assert.equal(ScanRequestSchema.safeParse({ url: 'https://example.com', engine: 'other' }).success, false);
});

test('with Claude as backup, job, map and image checks stay on while every Gemini key cools down', () => {
  const base = {
    geminiProviderIds: ['gemini:key1:m'],
    coolingUntil: () => Date.now() + 60_000,
    localModel: null,
    pipeline: 'gemini_first' as const,
    now: Date.now(),
  };
  assert.equal(computeCapabilities(base).features.image.available, false);
  const withClaude = computeCapabilities({ ...base, claudeConfigured: true });
  assert.equal(withClaude.features.image.available, true);
  assert.equal(withClaude.features.job.available, true);
  assert.equal(withClaude.features.map.available, true);
  assert.equal(withClaude.geminiAvailable, false);
  assert.equal(computeCapabilities({ ...base, geminiProviderIds: [], claudeConfigured: true }).features.image.available, true);
});
