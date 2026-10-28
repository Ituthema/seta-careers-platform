#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { writeJsonAtomic } = require('../crawler/pipeline/atomic-write');
const { buildVacancyRecords } = require('../crawler/pipeline/vacancy-records');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const inputIndex = args.indexOf('--input');
const outputIndex = args.indexOf('--output');
const input = path.resolve(inputIndex >= 0 ? args[inputIndex + 1] || '' : path.join(ROOT, 'crawler/output/staging.json'));
const output = path.resolve(outputIndex >= 0 ? args[outputIndex + 1] || '' : path.join(ROOT, 'crawler/output/vacancy-candidates.json'));

if (!fs.existsSync(input)) {
  console.error('Staging file not found: ' + path.relative(ROOT, input));
  console.error('Run npm run crawl first, or pass --input <staging.json>.');
  process.exit(1);
}

try {
  const staged = JSON.parse(fs.readFileSync(input, 'utf8'));
  if (!Array.isArray(staged)) throw new Error('Expected staging input to be a JSON array.');
  const result = buildVacancyRecords(staged);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  writeJsonAtomic(output, result);
  console.log('Staged pages: ' + staged.length);
  console.log('Review candidates: ' + result.summary.total);
  console.log('Needs verification: ' + result.summary.needs_verification);
  console.log('Possibly expired: ' + result.summary.possibly_expired);
  console.log('Published automatically: 0');
  console.log('Output: ' + path.relative(ROOT, output));
} catch (error) {
  console.error('Could not extract vacancy candidates: ' + error.message);
  process.exit(1);
}
