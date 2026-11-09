#!/usr/bin/env node
'use strict';
// Records last_checked / last_success in data/sources.json from the latest reports.
//   node scripts/apply-source-freshness.js            (reads reports/source-health-report.json and,
//                                                      if present, crawler/output/staging.json)
//   node scripts/apply-source-freshness.js --dry-run  (print what would change, write nothing)
const fs = require('fs');
const path = require('path');
const { applyFreshness } = require('./lib/source-freshness');

const ROOT = path.resolve(__dirname, '..');
const read = (p) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null);
const registryPath = path.join(ROOT, 'data/sources.json');
const sources = read(registryPath);
const health = read(path.join(ROOT, 'reports/source-health-report.json'));
const staged = read(path.join(ROOT, 'crawler/output/staging.json'));

const { sources: updated, changed } = applyFreshness(sources, health && health.sources, Array.isArray(staged) ? staged : staged && staged.records);
const withSuccess = updated.filter((s) => s.last_success).length;
console.log(`Sources updated: ${changed.length}  |  with a recorded success: ${withSuccess} of ${updated.length}`);
if (process.argv.includes('--dry-run') || changed.length === 0) process.exit(0);
fs.writeFileSync(registryPath, `${JSON.stringify(updated, null, 2)}\n`);
