const crypto = require('crypto');
const config = require('./config/crawler-config');
const { loadActiveSources } = require('./core/source-loader');
const { fetchRobotsFile, fetchSource } = require('./core/fetcher');
const { createRobotsChecker } = require('./core/robots');
const { routeContent } = require('./core/router');
const { parseHtml } = require('./parsers/html-parser');
const { parsePdf } = require('./parsers/pdf-parser');
const { evaluateRun, parseMinSuccessRate } = require('./core/run-status');
const { normalizeParsedContent } = require('./pipeline/normalize');
const { validateNormalizedContent } = require('./pipeline/validate');
const { createDedupe } = require('./pipeline/dedupe');
const {
  LOG_EVENTS,
  appendLog,
  flushRecords,
  initializeRunFiles,
  rejectRecord,
  stageRecord,
  writeReport,
} = require('./pipeline/staging');

async function createLimit(concurrency) {
  const { default: pLimit } = await import('p-limit');
  return pLimit(concurrency);
}

function createCrawlId() {
  try {
    const { v4 } = require('uuid');
    return v4();
  } catch {
    return crypto.randomUUID();
  }
}

function reject(rejectedRecords, source, reason, details = null) {
  rejectRecord(rejectedRecords, {
    source_id: source.source_id,
    url: source.url,
    reason,
    ...(details ? { details } : {}),
  });
}

function summarizeRejectionsByReason(rejectedRecords) {
  return rejectedRecords.reduce((summary, record) => {
    const reason = record.reason || 'UNKNOWN';
    summary[reason] = (summary[reason] || 0) + 1;
    return summary;
  }, {});
}

async function parseContent(contentType, body) {
  if (contentType === 'html') return parseHtml(body);
  if (contentType === 'pdf') return parsePdf(body);
  throw new Error(`Unsupported content type: ${contentType}`);
}

// One misbehaving source must never take down the whole run. Anything the
// per-source pipeline throws (normalising, validating, writing staging files)
// is recorded as an INTERNAL_ERROR rejection and counted in
// report.internal_errors, which makes the run fail via evaluateRun().
async function processSource(source, context) {
  try {
    await crawlSource(source, context);
  } catch (error) {
    context.report.internal_errors = (context.report.internal_errors || 0) + 1;
    appendLog(LOG_EVENTS.INTERNAL_ERROR, { source_id: source.source_id, url: source.url, error: error.message });
    reject(context.rejectedRecords, source, 'INTERNAL_ERROR', error.message);
  }
}

async function crawlSource(source, context) {
  context.report.sources_processed += 1;

  const fetchResult = await fetchSource(source, config, appendLog, LOG_EVENTS, { robots: context.robots });
  if (!fetchResult.ok) {
    context.report.failed_fetches += 1;
    // ROBOTS_DISALLOWED / ROBOTS_UNREACHABLE are reported as their own reasons so a site asking not to be crawled is not mistaken for an outage.
    reject(context.rejectedRecords, source, fetchResult.rejectReason || 'FETCH_FAILED', fetchResult.error);
    return;
  }

  context.report.successful_fetches += 1;

  const contentType = routeContent(fetchResult, appendLog, LOG_EVENTS);
  if (contentType === 'unknown') {
    reject(context.rejectedRecords, source, 'UNSUPPORTED_CONTENT_TYPE', fetchResult.contentType || 'No content type detected');
    return;
  }

  let parsed;
  try {
    parsed = await parseContent(contentType, fetchResult.body);
    appendLog(LOG_EVENTS.PARSE_SUCCESS, { source_id: source.source_id, url: fetchResult.url, content_type: contentType });
  } catch (error) {
    appendLog(LOG_EVENTS.PARSE_FAILURE, { source_id: source.source_id, url: fetchResult.url, content_type: contentType, error: error.message });
    reject(context.rejectedRecords, { ...source, url: fetchResult.url }, 'PARSER_ERROR', error.message);
    return;
  }

  const normalized = normalizeParsedContent(parsed, { url: fetchResult.url });
  const validation = validateNormalizedContent(contentType, normalized);
  if (!validation.valid) {
    appendLog(LOG_EVENTS.VALIDATION_FAILURE, { source_id: source.source_id, url: fetchResult.url, reasons: validation.reasons });
    reject(context.rejectedRecords, { ...source, url: fetchResult.url }, 'VALIDATION_FAILED', validation.reasons);
    return;
  }

  const stagedRecord = {
    crawl_id: createCrawlId(),
    source_id: source.source_id,
    source_name: source.name,
    url: fetchResult.url,
    content_type: contentType,
    title: normalized.metadata.title || '',
    text: normalized.normalizedText,
    metadata: normalized.metadata,
    crawled_at: new Date().toISOString(),
  };

  // Synchronous from here to stageRecord, so concurrent sources cannot both pass the check.
  const duplicate = context.dedupe.check(stagedRecord);
  if (duplicate) {
    reject(context.rejectedRecords, { ...source, url: fetchResult.url }, duplicate.reason, `Same page as source ${duplicate.duplicate_of}`);
    return;
  }

  stageRecord(context.stagedRecords, stagedRecord);
}

async function main() {
  initializeRunFiles();

  const report = {
    started_at: new Date().toISOString(),
    completed_at: '',
    sources_processed: 0,
    successful_fetches: 0,
    failed_fetches: 0,
    internal_errors: 0,
    staged_records: 0,
    rejected_records: 0,
    rejected_by_reason: {},
    status: '',
    failure_reasons: [],
  };
  const stagedRecords = [];
  const rejectedRecords = [];
  let sourcesLoaded = 0;
  let minSuccessRate = 0;
  let fatalError = null;

  appendLog(LOG_EVENTS.START, { config });

  try {
    // Parsed first so a typo in CRAWLER_MIN_SUCCESS_RATE fails fast, before any network work.
    minSuccessRate = parseMinSuccessRate(process.env.CRAWLER_MIN_SUCCESS_RATE);

    const sources = loadActiveSources({
      log: appendLog,
      events: LOG_EVENTS,
      reject: (rejection) => rejectRecord(rejectedRecords, rejection),
    });
    sourcesLoaded = sources.length;
    const limit = await createLimit(config.concurrency);
    const dedupe = createDedupe();
    const robots = createRobotsChecker((origin) => fetchRobotsFile(origin, config));

    await Promise.all(
      sources.map((source) => limit(() => processSource(source, { report, stagedRecords, rejectedRecords, dedupe, robots }))),
    );
  } catch (error) {
    fatalError = error;
    appendLog(LOG_EVENTS.FETCH_FAILURE, { error: error.message, fatal: true });
  } finally {
    // A failed flush must not stop the report from being written, but it must fail the run.
    try {
      flushRecords(stagedRecords, rejectedRecords);
    } catch (error) {
      fatalError = fatalError || new Error(`Could not write staging output: ${error.message}`);
      appendLog(LOG_EVENTS.INTERNAL_ERROR, { error: fatalError.message, fatal: true });
    }
    report.completed_at = new Date().toISOString();
    report.staged_records = stagedRecords.length;
    report.rejected_records = rejectedRecords.length;
    report.rejected_by_reason = summarizeRejectionsByReason(rejectedRecords);

    // A run counts as successful only if evaluateRun() says so (see
    // core/run-status.js). Previously the exit code was 0 unless the crawler
    // itself crashed, so a run where all sources failed looked like a success.
    const verdict = fatalError
      ? { ok: false, reasons: [`FATAL: ${fatalError.message}`] }
      : evaluateRun(report, { sourcesLoaded, minSuccessRate });
    report.status = verdict.ok ? 'OK' : 'FAILED';
    report.failure_reasons = verdict.reasons;
    if (!verdict.ok) process.exitCode = 1;

    writeReport(report);
    appendLog(LOG_EVENTS.END, report);

    console.log(
      `Crawl ${report.status}: ${report.sources_processed} source(s), ${report.successful_fetches} fetched, ` +
      `${report.failed_fetches} failed, ${report.internal_errors} internal error(s), ` +
      `${report.staged_records} staged, ${report.rejected_records} rejected.`,
    );
    if (!verdict.ok) {
      console.error(`Crawl failed:\n${verdict.reasons.map((reason) => `  - ${reason}`).join('\n')}`);
    }
  }
}

if (require.main === module) {
  main().catch((error) => {
    // main() handles its own errors; this only fires if reporting itself breaks (e.g. disk full).
    console.error('Crawler crashed:', error);
    process.exitCode = 1;
  });
}

module.exports = {
  main,
  processSource,
  summarizeRejectionsByReason,
};
