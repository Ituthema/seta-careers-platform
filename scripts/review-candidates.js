#!/usr/bin/env node
/**
 * Turn the crawler's staged pages into a short list of leads to review.
 *
 *   npm run review:candidates
 *   npm run review:candidates -- --input path/to/staging.json
 *
 * Writes crawler/output/candidates.json (untracked) and prints the leads whose
 * closing date is still in the future. Nothing here publishes anything:
 * a human checks each lead on the official page, then adds the listing.
 */
const fs = require('fs');
const path = require('path');
const { extractAll } = require('../crawler/pipeline/candidates');
const { writeJsonAtomic } = require('../crawler/pipeline/atomic-write');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const inputIndex = args.indexOf('--input');
const input = path.resolve(inputIndex >= 0 ? args[inputIndex + 1] || '' : path.join(ROOT, 'crawler/output/staging.json'));
const output = path.join(ROOT, 'crawler/output/candidates.json');

if (!fs.existsSync(input)) {
  console.error(`No staged pages at ${path.relative(ROOT, input)}.`);
  console.error('Run the crawler first (npm run crawl), or pass --input <staging.json>.');
  process.exit(1);
}

let records;
try {
  records = JSON.parse(fs.readFileSync(input, 'utf8'));
} catch (error) {
  console.error(`Could not read ${path.relative(ROOT, input)}: ${error.message}`);
  process.exit(1);
}
if (!Array.isArray(records)) {
  console.error('Expected a JSON array of staged records.');
  process.exit(1);
}

const result = extractAll(records);
fs.mkdirSync(path.dirname(output), { recursive: true });
writeJsonAtomic(output, result);

console.log(`Staged pages read: ${records.length}`);
console.log(`Pages with leads: ${result.summary.pages_with_leads}  |  link leads: ${result.summary.links}  |  mentions: ${result.summary.mentions}  |  with a future closing date: ${result.summary.open_mentions}`);

if (records.length === 0) {
  console.log('\nThe crawl staged nothing. Check crawler/output/rejected.json and crawl-report.json for why (network access, robots.txt, blocked URLs).');
}

const open = result.pages.flatMap((p) => p.mentions.filter((m) => m.status === 'open').map((m) => ({ page: p, mention: m })));
if (open.length > 0) {
  console.log('\nOpen leads (check each on the official page before publishing):');
  for (const { page, mention } of open) {
    console.log(`- [${mention.category}] ${mention.line}`);
    console.log(`    closes ${mention.closing_dates.join(', ')}  |  ${page.source_id}  |  ${page.page_url}`);
  }
}
console.log(`\nFull list: ${path.relative(ROOT, output)}`);
