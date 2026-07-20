const crypto = require('crypto');
const config = require('./config/crawler-config');
const { loadActiveSources } = require('./core/source-loader');
const { fetchSource } = require('./core/fetcher');
const { routeContent } = require('./core/router');
const { parseHtml } = require('./parsers/html-parser');
const { parsePdf } = require('./parsers/pdf-parser');
const { normalizeParsedContent } = require('./pipeline/normalize');
const { validateNormalizedContent } = require('./pipeline/validate');
const {
  LOG_EVENTS,
  appendLog,
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

async function processSource(source, context) {
  context.report.sources_processed += 1;

  const fetchResult = await fetchSource(source, config, appendLog, LOG_EVENTS);
  if (!fetchResult.ok) {
    context.report.failed_fetches += 1;
    reject(context.rejectedRecords, source, 'FETCH_FAILED', fetchResult.error);
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
    staged_records: 0,
    rejected_records: 0,
    rejected_by_reason: {},
  };
  const stagedRecords = [];
  const rejectedRecords = [];

  appendLog(LOG_EVENTS.START, { config });

  try {
    const sources = loadActiveSources({
      log: appendLog,
      events: LOG_EVENTS,
      reject: (rejection) => rejectRecord(rejectedRecords, rejection),
    });
    const limit = await createLimit(config.concurrency);

    await Promise.all(
      sources.map((source) => limit(() => processSource(source, { report, stagedRecords, rejectedRecords }))),
    );
  } catch (error) {
    appendLog(LOG_EVENTS.FETCH_FAILURE, { error: error.message, fatal: true });
    process.exitCode = 1;
  } finally {
    report.completed_at = new Date().toISOString();
    report.staged_records = stagedRecords.length;
    report.rejected_records = rejectedRecords.length;
    report.rejected_by_reason = summarizeRejectionsByReason(rejectedRecords);
    writeReport(report);
    appendLog(LOG_EVENTS.END, report);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  main,
  processSource,
  summarizeRejectionsByReason,
};
