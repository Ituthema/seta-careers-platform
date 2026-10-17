#!/usr/bin/env node
/**
 * Marks opportunities whose closing_date has passed as `expired: true` in
 * data/opportunities.json.
 *
 * The site UI already hides lapsed listings by date, but the sitemap and any
 * other consumer of the data rely on the `expired` flag, so it has to be kept
 * accurate. Run this after a closing date passes, then `npm run sitemap`, and
 * commit both files.
 *
 * A listing stays open for its whole closing day (closing_date < today means
 * closed), matching the logic in index.html's daysUntil().
 *
 * Only the `expired` flag is changed. updated_date is deliberately left alone
 * because the UI shows it as "Last verified".
 *
 * Usage:
 *   node scripts/mark-expired.js                 # apply
 *   node scripts/mark-expired.js --dry-run       # show what would change
 *   node scripts/mark-expired.js --today=2026-10-12
 */

const fs = require('fs');
const path = require('path');

const DATA_PATH = path.resolve(__dirname, '..', 'data', 'opportunities.json');
const DRY_RUN = process.argv.includes('--dry-run');
const todayArg = process.argv.find(a => a.startsWith('--today='));

// Today in South Africa (UTC+2), not UTC, so the cut-off matches the audience.
const TODAY = todayArg
  ? todayArg.slice('--today='.length)
  : new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Johannesburg' }).format(new Date());

if (!/^\d{4}-\d{2}-\d{2}$/.test(TODAY)) {
  console.error(`❌ Invalid --today value "${TODAY}" (expected YYYY-MM-DD).`);
  process.exit(1);
}

const opportunities = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
if (!Array.isArray(opportunities)) {
  console.error('❌ data/opportunities.json must be a JSON array.');
  process.exit(1);
}

const changed = [];
for (const o of opportunities) {
  if (!o.expired && o.closing_date && o.closing_date < TODAY) {
    o.expired = true;
    changed.push(`${o.id} (${o.closing_date}) ${o.title}`);
  }
}

if (!changed.length) {
  console.log(`✅ Nothing to expire as of ${TODAY}.`);
  process.exit(0);
}

console.log(`${DRY_RUN ? 'Would mark' : 'Marked'} ${changed.length} opportunity(ies) as expired (today = ${TODAY}):`);
changed.forEach(line => console.log(`  - ${line}`));

if (DRY_RUN) {
  console.log('\nDry run: no files written.');
} else {
  fs.writeFileSync(DATA_PATH, JSON.stringify(opportunities, null, 2) + '\n', 'utf8');
  console.log('\nNext: npm run sitemap, then commit data/opportunities.json and sitemap.xml.');
}
