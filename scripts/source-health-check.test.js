const test = require('node:test');
const assert = require('node:assert/strict');
const { buildReport } = require('./source-health-check');

const config = { timeoutMs: 8000 };
const source = (overrides = {}) => ({
  source_id: 'example-source',
  name: 'Example source',
  url: 'https://example.gov.za/',
  final_url: 'https://example.gov.za/',
  status: 200,
  response_time: 100,
  redirects: 0,
  redirect_chain: [],
  ssl_available: true,
  healthy: true,
  checked_at: '2026-10-28T10:00:00.000Z',
  ...overrides,
});

test('buildReport counts a successful HTTP response as healthy', () => {
  const report = buildReport([source()], config);
  assert.equal(report.status, 'PASS');
  assert.equal(report.summary.healthy, 1);
  assert.equal(report.summary.unhealthy, 0);
  assert.equal(report.summary.unverified, 0);
  assert.equal(report.sources[0].health_state, 'healthy');
});

test('buildReport distinguishes a real HTTP error from a network failure', () => {
  const report = buildReport([
    source({ status: 503, healthy: false }),
    source({ source_id: 'timed-out', status: null, healthy: false, error: 'Timed out after 8000ms' }),
  ], config);
  assert.equal(report.status, 'FAIL');
  assert.equal(report.summary.unhealthy, 1);
  assert.equal(report.summary.unverified, 1);
  assert.equal(report.sources[0].health_state, 'unhealthy');
  assert.equal(report.sources[1].health_state, 'unverified');
});

test('all-unverified results produce WARN, not a false claim that every source is down', () => {
  const report = buildReport([
    source({ status: null, healthy: false, ssl_available: false, error: 'fetch failed' }),
    source({ source_id: 'second', status: null, healthy: false, ssl_available: false, error: 'Timed out after 8000ms' }),
  ], config);
  assert.equal(report.status, 'WARN');
  assert.equal(report.summary.healthy, 0);
  assert.equal(report.summary.unhealthy, 0);
  assert.equal(report.summary.unverified, 2);
});

test('redirect and TLS warnings do not weaken certificate verification or mark an HTTP response unhealthy', () => {
  const report = buildReport([
    source({ redirects: 1, redirect_chain: [{ status: 301 }], ssl_available: false }),
  ], config);
  assert.equal(report.status, 'WARN');
  assert.equal(report.summary.healthy, 1);
  assert.equal(report.summary.unverified, 0);
});
