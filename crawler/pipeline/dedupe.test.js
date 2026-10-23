// Run with: npm test   (node --test, no dependencies needed)
const test = require('node:test');
const assert = require('node:assert/strict');
const { contentHash, createDedupe, urlKey } = require('./dedupe');

test('urlKey ignores hash, www, trailing slash and host case but keeps path and query', () => {
  assert.equal(urlKey('https://WWW.Example.org/jobs/#top'), urlKey('https://example.org/jobs'));
  assert.notEqual(urlKey('https://example.org/jobs?page=1'), urlKey('https://example.org/jobs?page=2'));
  assert.notEqual(urlKey('https://example.org/a'), urlKey('https://example.org/b'));
  assert.notEqual(urlKey('http://example.org/a'), urlKey('https://example.org/a'));
});

test('contentHash ignores whitespace and case differences', () => {
  assert.equal(contentHash('Hello   World\n'), contentHash(' hello world '));
  assert.notEqual(contentHash('hello world'), contentHash('hello there'));
});

test('first source wins; a second source at the same URL is a DUPLICATE_URL', () => {
  const dedupe = createDedupe();
  assert.equal(dedupe.check({ source_id: 'a', url: 'https://example.org/jobs', text: 'one' }), null);
  assert.deepEqual(dedupe.check({ source_id: 'b', url: 'https://www.example.org/jobs/', text: 'two' }), { reason: 'DUPLICATE_URL', duplicate_of: 'a' });
});

test('identical content at different URLs is a DUPLICATE_CONTENT', () => {
  const dedupe = createDedupe();
  assert.equal(dedupe.check({ source_id: 'a', url: 'https://example.org/one', text: 'Same page text' }), null);
  assert.deepEqual(dedupe.check({ source_id: 'b', url: 'https://example.org/two', text: 'same  page text' }), { reason: 'DUPLICATE_CONTENT', duplicate_of: 'a' });
});

test('different pages and empty text are not duplicates of each other by content', () => {
  const dedupe = createDedupe();
  assert.equal(dedupe.check({ source_id: 'a', url: 'https://example.org/one', text: 'alpha' }), null);
  assert.equal(dedupe.check({ source_id: 'b', url: 'https://example.org/two', text: 'beta' }), null);
  assert.equal(dedupe.check({ source_id: 'c', url: 'https://example.org/three', text: '' }), null);
  assert.equal(dedupe.check({ source_id: 'd', url: 'https://example.org/four', text: '   ' }), null);
});
