#!/usr/bin/env node
/**
 * Turn crawler leads into draft files for `npm run add:listing`.
 *
 *   npm run extract:vacancies            # writes crawler/output/vacancy-candidates.json
 *   npm run candidates:drafts            # writes drafts to crawler/output/drafts/ (untracked)
 *   npm run candidates:drafts -- --out docs/listing-drafts --max 10
 *   npm run candidates:drafts -- --input some/vacancy-candidates.json
 *
 * Nothing is published. Each draft is unverified and defaults to needs_review. Open the official
 * page, fill in what the advert states, then run: npm run add:listing -- <draft.json> --write
 */
const fs = require('fs');
const path = require('path');
const { buildDrafts } = require('./lib/candidate-drafts');
const { writeJsonAtomic } = require('../crawler/pipeline/atomic-write');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const value = (name, fallback) => { const i = args.indexOf(name); return i >= 0 && args[i + 1] ? args[i + 1] : fallback; };
const input = path.resolve(value('--input', path.join(ROOT, 'crawler/output/vacancy-candidates.json')));
const outDir = path.resolve(value('--out', path.join(ROOT, 'crawler/output/drafts')));
const max = Number.parseInt(value('--max', '25'), 10) || 25;

function readJson(file, label) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { console.error(`Could not read ${label} (${path.relative(ROOT, file)}): ${e.message}`); process.exit(1); }
}
if (!fs.existsSync(input)) {
  console.error(`No lead file at ${path.relative(ROOT, input)}.`);
  console.error('Run: npm run crawl && npm run extract:vacancies   (or pass --input <vacancy-candidates.json>)');
  process.exit(1);
}

const leadFile = readJson(input, 'lead file');
const leads = Array.isArray(leadFile) ? leadFile : leadFile.records;
if (!Array.isArray(leads)) { console.error('Expected vacancy-candidates.json to contain a "records" array.'); process.exit(1); }
const existing = readJson(path.join(ROOT, 'data/opportunities.json'), 'opportunities');
const sources = readJson(path.join(ROOT, 'data/sources.json'), 'source registry');

const { drafts, skipped } = buildDrafts(leads, existing, sources, new Date(), max);
fs.mkdirSync(outDir, { recursive: true });
for (const d of drafts) writeJsonAtomic(path.join(outDir, d.file), d.draft);

console.log(`Leads read: ${leads.length}  |  drafts written: ${drafts.length}  |  skipped: ${skipped.length}`);
console.log(`Output: ${path.relative(ROOT, outDir)}/`);
for (const d of drafts) console.log(`  + ${d.file}${d.draft.closing_date ? `  (closes ${d.draft.closing_date})` : '  (no closing date)'}`);
const reasons = skipped.reduce((o, s) => { o[s.reason] = (o[s.reason] || 0) + 1; return o; }, {});
for (const [reason, n] of Object.entries(reasons).sort((a, b) => b[1] - a[1]).slice(0, 8)) console.log(`  - skipped ${n}: ${reason}`);
if (drafts.length) console.log('\nNext: open each official page, complete the draft, then:\n  npm run add:listing -- <draft.json>            (dry run)\n  npm run add:listing -- <draft.json> --write');
