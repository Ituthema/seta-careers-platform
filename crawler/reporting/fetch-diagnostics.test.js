// Run with: npm test   (node --test, no dependencies needed)
const test = require('node:test');
const assert = require('node:assert/strict');
const { CATEGORIES, buildDiagnostics, classifyFetchFailure } = require('./fetch-diagnostics');

test('robots rejections are classified by their reason, not by message text', () => {
  assert.equal(classifyFetchFailure({ reason: 'ROBOTS_DISALLOWED', details: 'Disallowed by https://x.org/robots.txt for SETA' }), 'ROBOTS_DISALLOWED');
  assert.equal(classifyFetchFailure({ reason: 'ROBOTS_UNREACHABLE', details: 'robots.txt returned HTTP 503' }), 'ROBOTS_UNREACHABLE');
});

test('blocked private addresses are their own category', () => {
  assert.equal(classifyFetchFailure({ reason: 'FETCH_FAILED', details: 'Blocked private address 10.0.0.1 for host x' }), 'BLOCKED_URL');
});

test('diagnostics count robots rejections as fetch failures and ignore parse problems', () => {
  const report = buildDiagnostics([
    { reason: 'FETCH_FAILED', details: 'HTTP 404' },
    { reason: 'ROBOTS_DISALLOWED', details: 'Disallowed' },
    { reason: 'ROBOTS_DISALLOWED', details: 'Disallowed' },
    { reason: 'ROBOTS_UNREACHABLE', details: 'robots.txt returned HTTP 503' },
    { reason: 'PARSER_ERROR', details: 'bad html' },
    { reason: 'DUPLICATE_URL', details: 'Same page as source a' },
  ]);
  assert.equal(report.total_rejected_records, 6);
  assert.equal(report.total_fetch_failed_records, 4);
  assert.equal(report.categories.ROBOTS_DISALLOWED.count, 2);
  assert.equal(report.categories.ROBOTS_UNREACHABLE.count, 1);
  assert.equal(report.categories.HTTP_404.count, 1);
  assert.equal(report.dominant_failure_category, 'ROBOTS_DISALLOWED');
  assert.ok(CATEGORIES.includes('ROBOTS_DISALLOWED') && CATEGORIES.includes('ROBOTS_UNREACHABLE'));
});
