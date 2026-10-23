// Run with: npm test   (node --test, no dependencies needed)
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { writeFileAtomic, writeJsonAtomic } = require('./atomic-write');

function tempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'atomic-write-'));
}

test('writes JSON with a trailing newline and creates missing directories', () => {
  const dir = tempDir();
  const target = path.join(dir, 'nested', 'out.json');
  writeJsonAtomic(target, { a: 1 });
  assert.equal(fs.readFileSync(target, 'utf8'), '{\n  "a": 1\n}\n');
});

test('overwrites an existing file and leaves no temp files behind', () => {
  const dir = tempDir();
  const target = path.join(dir, 'out.json');
  writeJsonAtomic(target, [1]);
  writeJsonAtomic(target, [1, 2]);
  assert.deepEqual(JSON.parse(fs.readFileSync(target, 'utf8')), [1, 2]);
  assert.deepEqual(fs.readdirSync(dir), ['out.json']);
});

test('a failed write keeps the previous file intact and cleans up the temp file', () => {
  const dir = tempDir();
  const target = path.join(dir, 'out.json');
  writeJsonAtomic(target, { keep: true });
  const original = fs.renameSync;
  fs.renameSync = () => { throw new Error('disk full'); };
  try {
    assert.throws(() => writeFileAtomic(target, '{"partial":'), /disk full/);
  } finally {
    fs.renameSync = original;
  }
  assert.deepEqual(JSON.parse(fs.readFileSync(target, 'utf8')), { keep: true });
  assert.deepEqual(fs.readdirSync(dir), ['out.json']);
});
