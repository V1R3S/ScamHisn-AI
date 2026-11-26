import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCtEntry, pickUsableLogs } from '../watch/ctLogs.js';
import { brandStandsAsWord, buildFinding, findLookalike } from '../watch/watchService.js';

const here = path.dirname(fileURLToPath(import.meta.url));
// Two entries copied from a public log on 26 November 2026: one certificate, one pre-certificate
const fixture = JSON.parse(fs.readFileSync(path.join(here, 'fixtures/ct-entries.json'), 'utf8')) as {
  x509: { leaf_input: string; extra_data: string };
  precert: { leaf_input: string; extra_data: string };
};

test('a certificate entry from a real log yields its host names and the time it was logged', () => {
  const entry = parseCtEntry(fixture.x509.leaf_input, fixture.x509.extra_data);
  assert.ok(entry, 'entry should parse');
  assert.ok(entry.names.length > 0, 'at least one DNS name');
  for (const name of entry.names) {
    assert.match(name, /^[a-z0-9.-]+\.[a-z0-9-]+$/);
    assert.ok(!name.startsWith('*.'), 'wildcard prefix is removed');
  }
  const year = new Date(entry.loggedAt).getUTCFullYear();
  assert.ok(year >= 2026 && year <= 2027, `plausible log time, got ${year}`);
});

test('a pre-certificate entry is read from extra_data', () => {
  const entry = parseCtEntry(fixture.precert.leaf_input, fixture.precert.extra_data);
  assert.ok(entry, 'entry should parse');
  assert.ok(entry.names.length > 0);
});

test('garbage entries are skipped, never thrown', () => {
  assert.equal(parseCtEntry('', ''), null);
  assert.equal(parseCtEntry('AAAA', 'AAAA'), null);
  assert.equal(parseCtEntry(Buffer.alloc(64).toString('base64'), ''), null);
});

test('only usable logs whose window includes today are read', () => {
  const now = Date.parse('2026-11-26T00:00:00Z');
  const list = {
    operators: [
      {
        name: 'Op',
        logs: [
          { description: 'current', url: 'https://a.example/x', state: { usable: {} }, temporal_interval: { start_inclusive: '2026-07-01T00:00:00Z', end_exclusive: '2027-01-01T00:00:00Z' } },
          { description: 'expired', url: 'https://b.example/', state: { usable: {} }, temporal_interval: { start_inclusive: '2025-01-01T00:00:00Z', end_exclusive: '2026-01-01T00:00:00Z' } },
          { description: 'future', url: 'https://c.example/', state: { usable: {} }, temporal_interval: { start_inclusive: '2027-01-01T00:00:00Z', end_exclusive: '2027-07-01T00:00:00Z' } },
          { description: 'retired', url: 'https://d.example/', state: { retired: {} } },
          { description: 'no address', state: { usable: {} } },
        ],
      },
    ],
  };
  const logs = pickUsableLogs(list, now);
  assert.deepEqual(logs.map((log) => log.name), ['current']);
  assert.equal(logs[0]?.url, 'https://a.example/x/');
  assert.deepEqual(pickUsableLogs(null, now), []);
});

test('look-alikes of protected UAE brands are picked out of certificate names', () => {
  for (const name of ['adpolice-fines-pay.top', '*.dubaipolice-case.vip', 'login.uaepass-verify.com', 'ADNOC-careers-apply.top']) {
    const match = findLookalike(name);
    assert.ok(match, `${name} should match`);
    assert.ok(match.brand.length > 0);
    assert.ok(!match.host.startsWith('*.'));
    assert.equal(match.host, match.host.toLowerCase());
  }
});

test('a brand word buried in a random string, and global brands, are left out', () => {
  // All four are real names from the logs on 26 November 2026 that an early version reported
  for (const name of [
    'nsyhllbbfdrfoazfqadcblsanzfe.fis.pdx.test.prod.sadbirds.aws.dev',
    'www.zyxwwww.vutsrqpojilkfedcbadcbnotexists8725432qz1blnsmvl51shl.mvl.40-160-235-230.local-ip.sh',
    'z49.w.api.fabric.microsoft-int.com',
    'rayaaicloud.ai',
  ]) {
    assert.equal(findLookalike(name), null, `${name} should not match`);
  }
  assert.equal(brandStandsAsWord('adcb-login.top', 'ADCB'), true);
  assert.equal(brandStandsAsWord('secure.adcb.verify-id.info', 'ADCB'), true);
  assert.equal(brandStandsAsWord('xadcbx.top', 'ADCB'), false);
  assert.equal(brandStandsAsWord('adpolicefines.top', 'Abu Dhabi Police'), true);
});

test('official sites, unrelated names and bare addresses are never reported', () => {
  for (const name of ['www.adpolice.gov.ae', 'selfcare.uaepass.ae', 'tamm.abudhabi', 'u.ae', 'example.com', 'flowers-to-the-world.com', 'localhost', '10.0.0.1', '']) {
    assert.equal(findLookalike(name), null, `${name} should not match`);
  }
});

test('a look-alike gets the same score a pasted link with that address gets', async () => {
  const match = findLookalike('adpolice-fines-pay.top');
  assert.ok(match);
  const finding = await buildFinding(match, Date.parse('2026-11-26T02:35:00Z'), 'Test log', false);
  assert.equal(finding.registrableDomain, 'adpolice-fines-pay.top');
  assert.equal(finding.brand, 'Abu Dhabi Police');
  assert.equal(finding.scamScore, 84);
  assert.equal(finding.verdict, 'high_risk');
  assert.ok(finding.flags.includes('BRAND_IMPERSONATION'));
  assert.ok(!finding.flags.includes('DOMAIN_OFFLINE'), 'the offline flag is not carried over');
  assert.equal(finding.certLoggedAt, '2026-11-26T02:35:00.000Z');
  assert.equal(finding.resolves, false);
});
