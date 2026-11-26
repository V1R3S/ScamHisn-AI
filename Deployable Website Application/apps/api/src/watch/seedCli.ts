import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getWatchStatus, listFindings, runWatchCycle } from './watchService.js';

/**
 * Runs a few real passes over the certificate logs and writes what was found into
 * seedFindings.ts, so a freshly started server opens with real findings.
 *   npm run watch:seed --workspace=@scamhisn/api -- 6
 */
const passes = Math.max(1, Number(process.argv[2] ?? 3));
const pauseMs = Math.max(0, Number(process.argv[3] ?? 20_000));
for (let i = 1; i <= passes; i++) {
  const status = await runWatchCycle();
  console.log(
    `pass ${i}/${passes}: ${status.lastRunCertificates} certificates in ${status.lastRunSeconds}s, ${status.findingCount} look-alikes so far${status.lastRunError ? ` (last error: ${status.lastRunError})` : ''}`,
  );
  if (i < passes) await new Promise((resolve) => setTimeout(resolve, pauseMs));
}
const status = getWatchStatus();
const file = path.join(path.dirname(fileURLToPath(import.meta.url)), 'seedFindings.ts');
const body = `import type { WatchFinding, WatchTotals } from './watchService.js';

/**
 * Findings from real passes over the public certificate logs, kept so a freshly started server
 * (the free host sleeps and has no disk) does not open on an empty page. Replaced by
 * \`npm run watch:seed\`. Nothing here is invented. Written ${new Date().toISOString()}.
 */
export const SEED_TOTALS: WatchTotals = ${JSON.stringify(status.totals)};

export const SEED_FINDINGS: WatchFinding[] = ${JSON.stringify(listFindings(), null, 2)};
`;
fs.writeFileSync(file, body);
console.log(`wrote ${listFindings().length} findings to ${file}`);
process.exit(0);
