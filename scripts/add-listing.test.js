const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const CLI = path.join(__dirname, 'add-listing.js');
const TEMPLATE = path.join(__dirname, '..', 'docs', 'templates', 'listing-draft.example.json');

function setup(existing = []) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'add-listing-'));
  const data = path.join(dir, 'opportunities.json');
  const sources = path.join(dir, 'sources.json');
  fs.writeFileSync(data, JSON.stringify(existing));
  fs.writeFileSync(sources, JSON.stringify([{ url: 'https://www.example.org/careers' }]));
  return { dir, data, sources };
}
const run = (args) => spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8' });

// The template's closing date must stay in the future for these tests; refresh it from today.
function freshDraft(dir, patch = {}) {
  const draft = { ...JSON.parse(fs.readFileSync(TEMPLATE, 'utf8')), closing_date: '2099-12-01', ...patch };
  const file = path.join(dir, 'draft.json');
  fs.writeFileSync(file, JSON.stringify(draft));
  return file;
}

test('dry run prints the record and writes nothing', () => {
  const { dir, data, sources } = setup();
  const result = run([freshDraft(dir), '--data', data, '--sources', sources]);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Dry run/);
  assert.deepEqual(JSON.parse(fs.readFileSync(data, 'utf8')), []);
});

test('--write appends exactly one listing', () => {
  const { dir, data, sources } = setup();
  const result = run([freshDraft(dir), '--data', data, '--sources', sources, '--write', '--no-regenerate']);
  assert.equal(result.status, 0, result.stderr);
  const saved = JSON.parse(fs.readFileSync(data, 'utf8'));
  assert.equal(saved.length, 1);
  assert.equal(saved[0].id, '001');
  assert.equal(saved[0].verified, false);
  assert.equal(run([freshDraft(dir), '--data', data, '--sources', sources, '--write', '--no-regenerate']).status, 1, 'second add is a duplicate');
  assert.equal(JSON.parse(fs.readFileSync(data, 'utf8')).length, 1);
});

test('an invalid draft exits 1 with reasons and writes nothing', () => {
  const { dir, data, sources } = setup();
  const result = run([freshDraft(dir, { category: 'job', closing_date: '2020-01-01' }), '--data', data, '--sources', sources, '--write', '--no-regenerate']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /category must be/);
  assert.match(result.stderr, /before today/);
  assert.deepEqual(JSON.parse(fs.readFileSync(data, 'utf8')), []);
});

test('missing draft argument prints usage', () => {
  const result = run([]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Usage/);
});
