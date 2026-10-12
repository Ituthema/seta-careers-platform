/**
 * Decides whether a crawl run counts as a success, so the process exit code
 * (and the status written to crawl-report.json) reflects what actually
 * happened instead of always being 0 unless the crawler itself crashed.
 *
 * Deliberately dependency-free so it can be unit-tested without installing
 * axios/cheerio (see run-status.test.js).
 *
 * A run FAILS when any of these hold:
 *   - NO_SOURCES:             no active, valid sources were loaded
 *   - INTERNAL_ERRORS:        the crawler itself hit an unexpected error on a source
 *   - NO_SUCCESSFUL_FETCHES:  every source failed to fetch
 *   - LOW_SUCCESS_RATE:       fewer sources fetched than CRAWLER_MIN_SUCCESS_RATE requires
 *
 * Individual sites blocking the crawler (403, timeouts) are expected for
 * public SA government sites, so by default a run only fails when NOTHING
 * could be fetched. Raise CRAWLER_MIN_SUCCESS_RATE (0 to 1) for a stricter bar.
 */

function parseMinSuccessRate(value) {
  if (value === undefined || value === null || String(value).trim() === '') return 0;
  const rate = Number(value);
  if (!Number.isFinite(rate) || rate < 0 || rate > 1) {
    throw new Error(`CRAWLER_MIN_SUCCESS_RATE must be a number between 0 and 1 (got "${value}")`);
  }
  return rate;
}

function evaluateRun(report, options = {}) {
  const sourcesLoaded = Number.isInteger(options.sourcesLoaded) ? options.sourcesLoaded : report.sources_processed;
  const minSuccessRate = options.minSuccessRate || 0;
  const reasons = [];

  if (sourcesLoaded === 0) {
    reasons.push('NO_SOURCES: no active, valid sources were loaded from data/sources.json');
  }

  if (report.internal_errors > 0) {
    reasons.push(`INTERNAL_ERRORS: ${report.internal_errors} source(s) hit an unexpected error in the crawler itself`);
  }

  if (sourcesLoaded > 0) {
    if (report.successful_fetches === 0) {
      reasons.push(`NO_SUCCESSFUL_FETCHES: all ${sourcesLoaded} source(s) failed to fetch`);
    } else {
      const rate = report.successful_fetches / sourcesLoaded;
      if (rate < minSuccessRate) {
        reasons.push(
          `LOW_SUCCESS_RATE: ${report.successful_fetches}/${sourcesLoaded} fetched ` +
          `(${(rate * 100).toFixed(1)}%), below the required ${(minSuccessRate * 100).toFixed(1)}%`
        );
      }
    }
  }

  return { ok: reasons.length === 0, reasons };
}

module.exports = {
  evaluateRun,
  parseMinSuccessRate,
};
