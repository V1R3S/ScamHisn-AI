import type { WatchFinding, WatchTotals } from './watchService.js';

/**
 * Findings from real passes over the public certificate logs, kept so a freshly started server
 * (the free host sleeps and has no disk) does not open on an empty page. Replaced by
 * `npm run watch:seed`. Nothing here is invented.
 */
export const SEED_TOTALS: WatchTotals = { certificatesRead: 0, namesChecked: 0, runs: 0 };

export const SEED_FINDINGS: WatchFinding[] = [];
