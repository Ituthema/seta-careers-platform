#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const {
  DEFAULT_REGISTRY_PATH,
  SOURCE_TYPES,
  loadSources,
  validateRegistry,
} = require('./validators/source-validator');

const REPORTS_DIR = path.resolve(__dirname, '..', 'reports');
const REPORT_PATH = path.join(REPORTS_DIR, 'source-audit-report.json');
const MINIMUM_SOURCE_COUNT = 50;

function ensureReportsDir() {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

function buildReport(validation, registryPath = DEFAULT_REGISTRY_PATH) {
  return {
    generated_at: new Date().toISOString(),
    registry_path: path.relative(path.resolve(__dirname, '..'), registryPath),
    status: validation.status,
    summary: validation.summary,
    issues: validation.issues,
  };
}

function writeReport(report, reportPath = REPORT_PATH) {
  ensureReportsDir();
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
}

function printAudit(report) {
  console.log(`Source audit: ${report.status}`);
  console.log(`Sources: ${report.summary.total} total, ${report.summary.active} active, ${report.summary.inactive} inactive.`);
  console.log(`Issues: ${report.summary.issue_counts.FAIL} FAIL, ${report.summary.issue_counts.WARN} WARN.`);
  console.log('Sources by type:');

  for (const type of SOURCE_TYPES) {
    console.log(`- ${type}: ${report.summary.by_type[type] || 0}`);
  }

  if (report.issues.length > 0) {
    console.log('\nFindings:');
    for (const issue of report.issues) {
      console.log(`[${issue.level}] ${issue.code}: ${issue.message}`);
    }
  }

  console.log(`\nReport written to ${path.relative(process.cwd(), REPORT_PATH)}`);
}

function runAudit(options = {}) {
  const registryPath = options.registryPath || DEFAULT_REGISTRY_PATH;
  const sources = loadSources(registryPath);
  const validation = validateRegistry(sources, { minimumSources: options.minimumSources ?? MINIMUM_SOURCE_COUNT });
  const report = buildReport(validation, registryPath);
  writeReport(report, options.reportPath || REPORT_PATH);
  return report;
}

function main() {
  let report;

  try {
    report = runAudit();
  } catch (error) {
    const failure = {
      generated_at: new Date().toISOString(),
      registry_path: path.relative(path.resolve(__dirname, '..'), DEFAULT_REGISTRY_PATH),
      status: 'FAIL',
      summary: { total: 0, active: 0, inactive: 0, by_type: {}, issue_counts: { PASS: 0, WARN: 0, FAIL: 1 } },
      issues: [{ level: 'FAIL', code: 'AUDIT_EXCEPTION', message: error.message, source_id: null, field: null }],
    };
    writeReport(failure);
    printAudit(failure);
    process.exit(1);
  }

  printAudit(report);

  if (report.status === 'FAIL') {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  MINIMUM_SOURCE_COUNT,
  REPORT_PATH,
  REPORTS_DIR,
  buildReport,
  runAudit,
  writeReport,
};
