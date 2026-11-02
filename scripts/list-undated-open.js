#!/usr/bin/env node
'use strict';
/**
 * Lists open listings that have no closing date.
 *
 * `npm run expire` can only expire a listing whose closing_date has passed, so a listing
 * with no date stays open until a person re-checks the official advert. This prints a
 * Markdown table of those listings (used in the daily expiry job summary).
 *
 *   node scripts/list-undated-open.js            # Markdown to stdout
 */
const fs = require('fs');
const path = require('path');

function undatedOpen(records) {
  return (Array.isArray(records) ? records : []).filter(
    (o) => o && o.publication_status === 'open' && !o.expired && !o.closing_date,
  );
}

function daysSince(dateText, today) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateText))) return null;
  return Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${dateText}T00:00:00Z`)) / 86400000);
}

function toMarkdown(records, today) {
  const rows = undatedOpen(records);
  if (rows.length === 0) return 'No open listings without a closing date.\n';
  const lines = [
    `${rows.length} open listing(s) have no closing date and are never expired automatically. Re-check each against its official advert:`,
    '',
    '| ID | Title | Last updated | Days since | Official page |',
    '| --- | --- | --- | --- | --- |',
  ];
  for (const o of rows) {
    const age = daysSince(o.updated_date, today);
    const cell = (v) => String(v == null ? '' : v).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
    lines.push(`| ${cell(o.id)} | ${cell(o.title)} | ${cell(o.updated_date)} | ${age === null ? '?' : age} | ${cell(o.source_url)} |`);
  }
  return lines.join('\n') + '\n';
}

module.exports = { undatedOpen, toMarkdown };

if (require.main === module) {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Johannesburg' }).format(new Date());
  const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'data', 'opportunities.json'), 'utf8'));
  process.stdout.write(toMarkdown(data, today));
}
