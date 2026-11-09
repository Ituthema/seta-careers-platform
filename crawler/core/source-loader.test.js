'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { loadActiveSources } = require('./source-loader');
const { validateSource } = require('../../scripts/validators/source-validator');

const base = (id, extra = {}) => ({
  source_id: id, name: id, url: `https://${id}.example.org/careers`, type: 'private', active: true,
  crawl_strategy: 'html', frequency: 'weekly', priority: 1, last_checked: null, last_success: null, notes: 'n', ...extra,
});
const fileWith = (sources) => {
  const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'src-')), 'sources.json');
  fs.writeFileSync(f, JSON.stringify(sources));
  return f;
};

test('the crawler skips access=manual sources and loads the rest', () => {
  const f = fileWith([base('auto-one'), base('blocked', { access: 'manual', manual_reason: 'HTTP 403 to automated clients' }), base('off', { active: false })]);
  assert.deepEqual(loadActiveSources({ sourcePath: f }).map((s) => s.source_id), ['auto-one']);
});

test('the validator requires a reason for manual sources and rejects unknown access modes', () => {
  const codes = (s) => validateSource(s, 0).map((i) => i.code);
  assert.ok(codes(base('x', { access: 'manual' })).includes('MISSING_MANUAL_REASON'));
  assert.ok(codes(base('x', { access: 'sometimes' })).includes('INVALID_ACCESS'));
  assert.deepEqual(codes(base('x', { access: 'manual', manual_reason: 'JavaScript-only page' })), []);
  assert.deepEqual(codes(base('x', { access: 'auto' })), []);
  assert.deepEqual(codes(base('x')), []);
});
