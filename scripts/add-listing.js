#!/usr/bin/env node
/**
 * Validate a draft listing and, with --write, add it to data/opportunities.json.
 *
 *   npm run add:listing -- draft.json            (dry run: shows the record, writes nothing)
 *   npm run add:listing -- draft.json --write    (appends, regenerates static pages, validates)
 *
 * Start from docs/templates/listing-draft.example.json. id, slug, dates, expired
 * and featured are filled in for you. verified stays false unless the draft sets
 * it to true AND both URLs are on domains in data/sources.json.
 *
 * Options: --data <file>       use another opportunities file (testing)
 *          --sources <file>    use another registry file (testing)
 *          --no-regenerate     skip the page regeneration and validation steps
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { buildListing } = require('./lib/listing-draft');
const { writeJsonAtomic } = require('../crawler/pipeline/atomic-write');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const value = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const draftPath = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--data' && args[i - 1] !== '--sources');

function fail(message) { console.error(message); process.exit(1); }
function readJson(file, label) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { return fail(`Could not read ${label} (${file}): ${e.message}`); }
}

if (!draftPath) fail('Usage: npm run add:listing -- <draft.json> [--write]\nTemplate: docs/templates/listing-draft.example.json');
const dataFile = path.resolve(value('--data') || path.join(ROOT, 'data/opportunities.json'));
const sourcesFile = path.resolve(value('--sources') || path.join(ROOT, 'data/sources.json'));

const draft = readJson(path.resolve(draftPath), 'draft');
const existing = readJson(dataFile, 'opportunities file');
const sources = readJson(sourcesFile, 'source registry');
if (!Array.isArray(existing) || !Array.isArray(sources)) fail('Opportunities and sources files must be JSON arrays.');

const { listing, errors, warnings } = buildListing(draft, existing, sources);
for (const w of warnings) console.warn(`warning: ${w}`);
if (!listing) {
  console.error('\nThe draft cannot be added:');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(JSON.stringify(listing, null, 2));
if (!flag('--write')) {
  console.log('\nDry run: nothing was written. Add --write to append this listing.');
  process.exit(0);
}

writeJsonAtomic(dataFile, existing.concat(listing));
console.log(`\nAdded listing ${listing.id} (${listing.slug}) to ${path.relative(ROOT, dataFile)}.`);

if (flag('--no-regenerate')) process.exit(0);
const steps = [['scripts/generate-seo-pages.js', 'Regenerating static pages and sitemap'], ['scripts/validate-content.js', 'Validating content']];
for (const [script, label] of steps) {
  console.log(`${label}...`);
  const result = spawnSync(process.execPath, [path.join(ROOT, script)], { cwd: ROOT, stdio: 'inherit' });
  if (result.status !== 0) fail(`\n${label} failed. The listing was written; fix the problem (or remove the record) before committing.`);
}
console.log('\nNext: review with git status, then commit data/opportunities.json, sitemap.xml and the generated pages together.');
