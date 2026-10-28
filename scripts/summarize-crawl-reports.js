#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function readJson(relativePath) {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
  } catch {
    return null;
  }
}

function southAfricanToday(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Johannesburg' }).format(now);
}

function buildSummary({ crawl, candidates, opportunities, today = southAfricanToday() }) {
  const lines = ['## Opportunity ingestion and freshness', ''];
  if (crawl) {
    lines.push(
      `- **Crawl status:** ${crawl.status || 'unknown'}; ${crawl.sources_processed || 0} sources processed; ` +
      `${crawl.successful_fetches || 0} successful fetches; ${crawl.failed_fetches || 0} failed fetches; ` +
      `${crawl.internal_errors || 0} internal errors.`,
      `- **Staging:** ${crawl.staged_records || 0} pages staged; ${crawl.rejected_records || 0} rejected; ` +
      `${Object.keys(crawl.rejected_by_reason || {}).length} rejection reason type(s).`
    );
    if (Array.isArray(crawl.failure_reasons) && crawl.failure_reasons.length) {
      lines.push(`- **Run warnings/failures:** ${crawl.failure_reasons.join('; ')}`);
    }
  } else {
    lines.push('- **Crawl report:** missing or unreadable; check whether the crawl started and produced output.');
  }

  if (candidates && candidates.summary) {
    const s = candidates.summary;
    const mentions = (candidates.pages || []).flatMap((p) => p.mentions || []);
    const byCategory = {};
    for (const mention of mentions) {
      const category = mention.category || 'uncategorized';
      byCategory[category] = (byCategory[category] || 0) + 1;
    }
    lines.push(
      `- **Review candidates:** ${s.pages_with_leads || 0} pages with leads; ${s.links || 0} opportunity-like links; ` +
      `${s.mentions || 0} text mentions; ${s.open_mentions || 0} mentions with a detected non-past closing date.`,
      `- **Mention categories:** ${Object.entries(byCategory).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}: ${v}`).join(', ') || 'none'}.`
    );
    const statuses = mentions.reduce((acc, m) => {
      const status = m.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    lines.push(`- **Date evidence:** ${statuses.open || 0} open-date mentions; ${statuses.past || 0} past-date mentions; ${statuses.no_date || 0} mentions without a detected closing date.`);
  } else {
    lines.push('- **Candidate report:** missing or unreadable; no candidate totals can be confirmed.');
  }

  if (Array.isArray(opportunities)) {
    const live = opportunities.filter((item) =>
      item && item.expired !== true && typeof item.closing_date === 'string' && item.closing_date >= today
    );
    const flaggedExpired = opportunities.filter((item) => item && item.expired === true).length;
    const byCategory = live.reduce((acc, item) => {
      const category = item.category || 'uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
    lines.push(
      `- **Repository live-listing baseline (${today}, South Africa):** ${live.length} of ${opportunities.length} records meet the site's active-date/expired-flag filter; ${flaggedExpired} records are marked expired.`,
      `- **Live listing categories:** ${Object.entries(byCategory).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}: ${v}`).join(', ') || 'none'}.`
    );
  } else {
    lines.push('- **Repository listing baseline:** data/opportunities.json missing or unreadable.');
  }

  lines.push(
    '',
    '**Publication safety:** crawler candidates are leads only. This workflow does not edit data/opportunities.json or publish listings. Verify each opportunity on its official source and use the reviewed listing workflow.',
    '**Interpretation:** a staged page is not necessarily an opportunity; link/mention counts are leads, not unique verified vacancies. Compare crawl, rejection and candidate reports across runs to find where opportunities are being lost.',
    ''
  );
  return lines.join('\n');
}

if (require.main === module) {
  const output = buildSummary({
    crawl: readJson('crawler/output/crawl-report.json'),
    candidates: readJson('crawler/output/candidates.json'),
    opportunities: readJson('data/opportunities.json'),
  });
  console.log(output);
}

module.exports = { buildSummary, southAfricanToday };
