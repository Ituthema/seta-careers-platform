// Run with: npm test   (node --test, no dependencies needed)
const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluateRun, parseMinSuccessRate } = require('./run-status');

const report = (overrides = {}) => ({
  sources_processed: 10,
  successful_fetches: 10,
  failed_fetches: 0,
  internal_errors: 0,
  ...overrides,
});

test('a run where every source fails to fetch is a failure (the old behaviour exited 0)', () => {
  const verdict = evaluateRun(report({ successful_fetches: 0, failed_fetches: 10 }), { sourcesLoaded: 10 });
  assert.equal(verdict.ok, false);
  assert.match(verdict.reasons[0], /^NO_SUCCESSFUL_FETCHES/);
});

test('partial failure is still a success by default (sites that block bots are expected)', () => {
  const verdict = evaluateRun(report({ successful_fetches: 1, failed_fetches: 9 }), { sourcesLoaded: 10 });
  assert.deepEqual(verdict, { ok: true, reasons: [] });
});

test('a fully successful run is a success', () => {
  assert.deepEqual(evaluateRun(report(), { sourcesLoaded: 10 }), { ok: true, reasons: [] });
});

test('an internal crawler error fails the run even when fetches succeeded', () => {
  const verdict = evaluateRun(report({ internal_errors: 1 }), { sourcesLoaded: 10 });
  assert.equal(verdict.ok, false);
  assert.match(verdict.reasons[0], /^INTERNAL_ERRORS: 1 /);
});

test('no sources loaded is a failure', () => {
  const verdict = evaluateRun(report({ sources_processed: 0, successful_fetches: 0 }), { sourcesLoaded: 0 });
  assert.equal(verdict.ok, false);
  assert.match(verdict.reasons[0], /^NO_SOURCES/);
  assert.equal(verdict.reasons.length, 1, 'does not also report NO_SUCCESSFUL_FETCHES');
});

test('multiple problems are all reported', () => {
  const verdict = evaluateRun(report({ successful_fetches: 0, internal_errors: 2 }), { sourcesLoaded: 10 });
  assert.equal(verdict.ok, false);
  assert.equal(verdict.reasons.length, 2);
});

test('minimum success rate: below fails, at or above passes', () => {
  const opts = { sourcesLoaded: 10, minSuccessRate: 0.5 };
  assert.equal(evaluateRun(report({ successful_fetches: 4 }), opts).ok, false);
  assert.match(evaluateRun(report({ successful_fetches: 4 }), opts).reasons[0], /^LOW_SUCCESS_RATE/);
  assert.equal(evaluateRun(report({ successful_fetches: 5 }), opts).ok, true);
  assert.equal(evaluateRun(report({ successful_fetches: 6 }), opts).ok, true);
});

test('falls back to sources_processed when sourcesLoaded is not given', () => {
  assert.equal(evaluateRun(report({ successful_fetches: 0 })).ok, false);
  assert.equal(evaluateRun(report()).ok, true);
});

test('parseMinSuccessRate: unset or blank means 0', () => {
  assert.equal(parseMinSuccessRate(undefined), 0);
  assert.equal(parseMinSuccessRate(null), 0);
  assert.equal(parseMinSuccessRate(''), 0);
  assert.equal(parseMinSuccessRate('  '), 0);
});

test('parseMinSuccessRate: accepts 0 to 1', () => {
  assert.equal(parseMinSuccessRate('0.5'), 0.5);
  assert.equal(parseMinSuccessRate('1'), 1);
  assert.equal(parseMinSuccessRate(0), 0);
});

test('parseMinSuccessRate: rejects junk and out-of-range values loudly', () => {
  for (const bad of ['abc', '2', '-0.1', 'NaN', '50%']) {
    assert.throws(() => parseMinSuccessRate(bad), /CRAWLER_MIN_SUCCESS_RATE/, `should reject "${bad}"`);
  }
});
