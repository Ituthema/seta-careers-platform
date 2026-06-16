const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.resolve(__dirname, '..', 'output');
const REJECTED_PATH = path.join(OUTPUT_DIR, 'rejected.json');
const DIAGNOSTICS_PATH = path.join(OUTPUT_DIR, 'fetch-diagnostics.json');

const CATEGORIES = Object.freeze([
  'HTTP_403',
  'HTTP_404',
  'HTTP_429',
  'HTTP_5XX',
  'TIMEOUT',
  'DNS_FAILURE',
  'TLS_FAILURE',
  'REDIRECT_FAILURE',
  'UNKNOWN',
]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function classifyFetchFailure(record) {
  const details = String(record.details || '').toLowerCase();

  const statusMatch = details.match(/(?:http|status(?: code)?|response(?: status)?)\D+(\d{3})/i);
  const status = statusMatch ? Number(statusMatch[1]) : null;

  if (status === 403) return 'HTTP_403';
  if (status === 404) return 'HTTP_404';
  if (status === 429) return 'HTTP_429';
  if (status >= 500 && status <= 599) return 'HTTP_5XX';

  if (/\b(etimedout|timeout|timed out|eai_again|socket hang up|aborted)\b/.test(details)) return 'TIMEOUT';
  if (/\b(enotfound|dns|eai_nodata|getaddrinfo|name not resolved)\b/.test(details)) return 'DNS_FAILURE';
  if (/\b(tls|ssl|certificate|cert_|self[- ]signed|unable_to_verify|err_tls|ep roto|wrong version number)\b/.test(details)) return 'TLS_FAILURE';
  if (/\b(redirect|max redirects|too many redirects|redirected|err_fr_too_many_redirects)\b/.test(details)) return 'REDIRECT_FAILURE';

  return 'UNKNOWN';
}

function toPercent(count, total) {
  if (total === 0) return 0;
  return Number(((count / total) * 100).toFixed(2));
}

function buildDiagnostics(rejectedRecords) {
  const fetchFailures = rejectedRecords.filter((record) => record.reason === 'FETCH_FAILED');
  const categories = Object.fromEntries(CATEGORIES.map((category) => [category, { count: 0, percentage: 0 }]));

  for (const record of fetchFailures) {
    categories[classifyFetchFailure(record)].count += 1;
  }

  for (const category of CATEGORIES) {
    categories[category].percentage = toPercent(categories[category].count, fetchFailures.length);
  }

  const dominantFailureCategory = CATEGORIES.reduce((dominant, category) => {
    if (categories[category].count > categories[dominant].count) return category;
    return dominant;
  }, CATEGORIES[0]);

  return {
    generated_at: new Date().toISOString(),
    input_file: path.relative(path.resolve(__dirname, '..', '..'), REJECTED_PATH),
    total_rejected_records: rejectedRecords.length,
    total_fetch_failed_records: fetchFailures.length,
    categories,
    dominant_failure_category: fetchFailures.length > 0 ? dominantFailureCategory : null,
  };
}

function writeDiagnostics(report, outputPath = DIAGNOSTICS_PATH) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

function run() {
  const rejectedRecords = readJson(REJECTED_PATH);
  const diagnostics = buildDiagnostics(rejectedRecords);
  writeDiagnostics(diagnostics);
  console.log(`Fetch diagnostics written to ${path.relative(process.cwd(), DIAGNOSTICS_PATH)}`);
  console.log(`Dominant failure category: ${diagnostics.dominant_failure_category}`);
  return diagnostics;
}

if (require.main === module) {
  run();
}

module.exports = {
  CATEGORIES,
  buildDiagnostics,
  classifyFetchFailure,
};
