#!/usr/bin/env node
/**
 * Prints a short Markdown summary of the generated source reports.
 *
 * Used by .github/workflows/source-health.yml, which appends the output to
 * $GITHUB_STEP_SUMMARY so the weekly result is visible on the run page without
 * downloading the JSON artifacts:
 *
 *   node scripts/summarize-source-reports.js >> "$GITHUB_STEP_SUMMARY"
 *
 * Reads only; never fails the job (a missing or unreadable report is reported
 * as such). The audit/health steps themselves decide pass/fail.
 */

const fs = require('fs');
const path = require('path');

const REPORTS_DIR = path.resolve(__dirname, '..', 'reports');

function readReport(name) {
  try {
    return JSON.parse(fs.readFileSync(path.join(REPORTS_DIR, name), 'utf8'));
  } catch {
    return null;
  }
}

const audit = readReport('source-audit-report.json');
const health = readReport('source-health-report.json');

const lines = ['## Source registry health', ''];

if (audit && audit.summary) {
  const counts = audit.summary.issue_counts || {};
  lines.push(
    `- **Registry audit:** ${audit.status} — ${audit.summary.total} sources ` +
    `(${audit.summary.active} active), ${counts.FAIL || 0} FAIL, ${counts.WARN || 0} WARN`
  );
} else {
  lines.push('- **Registry audit:** report missing or unreadable');
}

if (health && health.summary) {
  const s = health.summary;
  // The report's own status label is deliberately not shown: it can read FAIL
  // when many sites block probes even though the job treats that as a warning.
  lines.push(
    `- **Source health:** ${s.healthy}/${s.checked} healthy, ` +
    `${s.unhealthy} unhealthy, ${s.with_redirects} redirecting, ${s.ssl_available} with SSL`
  );
  if (health.error) lines.push(`  - Health check error: ${health.error}`);
} else {
  lines.push('- **Source health:** report missing or unreadable');
}

lines.push(
  '',
  'Many public SA government and SETA sites block automated probes, so unhealthy sources are warnings, not failures.',
  'The full JSON reports are attached to this run as the `source-reports` artifact.',
  ''
);

console.log(lines.join('\n'));
