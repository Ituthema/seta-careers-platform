const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.resolve(__dirname, '..', 'output');
const LOG_DIR = path.resolve(__dirname, '..', 'logs');
const STAGING_PATH = path.join(OUTPUT_DIR, 'staging.json');
const REJECTED_PATH = path.join(OUTPUT_DIR, 'rejected.json');
const REPORT_PATH = path.join(OUTPUT_DIR, 'crawl-report.json');
const LOG_PATH = path.join(LOG_DIR, 'crawl.log');
const HISTORY_DIR = path.join(OUTPUT_DIR, 'history');

const LOG_EVENTS = Object.freeze({
  START: 'START',
  END: 'END',
  SOURCE_LOADED: 'SOURCE_LOADED',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_FAILURE: 'FETCH_FAILURE',
  UNSUPPORTED_CONTENT: 'UNSUPPORTED_CONTENT',
  PARSE_SUCCESS: 'PARSE_SUCCESS',
  PARSE_FAILURE: 'PARSE_FAILURE',
  VALIDATION_FAILURE: 'VALIDATION_FAILURE',
  STAGED: 'STAGED',
});

function ensureCrawlerStorage() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

function writeJson(filePath, payload) {
  ensureCrawlerStorage();
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

function appendLog(event, details = {}) {
  ensureCrawlerStorage();
  const line = JSON.stringify({ timestamp: new Date().toISOString(), event, ...details });
  fs.appendFileSync(LOG_PATH, `${line}\n`, 'utf8');
}

function archivePreviousRun() {
  const filesToArchive = [STAGING_PATH, REJECTED_PATH, REPORT_PATH, LOG_PATH];
  const hasPreviousRun = filesToArchive.some((filePath) => fs.existsSync(filePath));
  if (!hasPreviousRun) return;

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const runDir = path.join(HISTORY_DIR, stamp);
  fs.mkdirSync(runDir, { recursive: true });

  for (const filePath of filesToArchive) {
    if (fs.existsSync(filePath)) {
      fs.copyFileSync(filePath, path.join(runDir, path.basename(filePath)));
    }
  }
}

function initializeRunFiles() {
  ensureCrawlerStorage();
  archivePreviousRun();
  writeJson(STAGING_PATH, []);
  writeJson(REJECTED_PATH, []);
  writeJson(REPORT_PATH, {
    started_at: '',
    completed_at: '',
    sources_processed: 0,
    successful_fetches: 0,
    failed_fetches: 0,
    staged_records: 0,
    rejected_records: 0,
    rejected_by_reason: {},
  });
  fs.writeFileSync(LOG_PATH, '', 'utf8');
}

function stageRecord(records, record) {
  records.push({ ...record, status: 'staged' });
  writeJson(STAGING_PATH, records);
  appendLog(LOG_EVENTS.STAGED, { source_id: record.source_id, url: record.url, crawl_id: record.crawl_id });
}

function rejectRecord(records, rejection) {
  records.push({ timestamp: new Date().toISOString(), ...rejection });
  writeJson(REJECTED_PATH, records);
}

function writeReport(report) {
  writeJson(REPORT_PATH, report);
}

module.exports = {
  LOG_EVENTS,
  LOG_PATH,
  REJECTED_PATH,
  REPORT_PATH,
  STAGING_PATH,
  appendLog,
  initializeRunFiles,
  rejectRecord,
  stageRecord,
  writeReport,
};
