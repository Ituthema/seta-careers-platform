'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { applyFreshness } = require('./source-freshness');

const reg = () => [
  { source_id: 'a', last_checked: null, last_success: null },
  { source_id: 'b', last_checked: null, last_success: null },
  { source_id: 'c', last_checked: '2026-11-01T00:00:00.000Z', last_success: '2026-11-01T00:00:00.000Z' },
  { source_id: 'd', last_checked: null, last_success: null },
];

test('healthy probes and crawled pages record a success; blocked or failed probes only record a check', () => {
  const health = [
    { source_id: 'a', health_state: 'healthy', checked_at: '2026-11-09T06:00:00.000Z' },
    { source_id: 'b', health_state: 'restricted', checked_at: '2026-11-09T06:00:00.000Z' },
  ];
  const staged = [{ source_id: 'd', crawled_at: '2026-11-09T07:00:00.000Z' }];
  const { sources, changed } = applyFreshness(reg(), health, staged);
  const by = Object.fromEntries(sources.map((s) => [s.source_id, s]));
  assert.equal(by.a.last_success, '2026-11-09T06:00:00.000Z');
  assert.equal(by.b.last_checked, '2026-11-09T06:00:00.000Z');
  assert.equal(by.b.last_success, null, 'a restricted response is not a success');
  assert.equal(by.d.last_success, '2026-11-09T07:00:00.000Z');
  assert.deepEqual(changed.sort(), ['a', 'b', 'd']);
});

test('timestamps never move backwards and unchanged sources keep their identity', () => {
  const old = [{ source_id: 'c', health_state: 'healthy', checked_at: '2026-06-03T00:00:00.000Z' }];
  const input = reg();
  const { sources, changed } = applyFreshness(input, old, []);
  assert.deepEqual(changed, []);
  assert.equal(sources[2], input[2]);
});

test('bad input is tolerated', () => {
  assert.deepEqual(applyFreshness(null, null, null), { sources: [], changed: [] });
  const { changed } = applyFreshness(reg(), [{ source_id: 'a', health_state: 'healthy', checked_at: 'not a date' }, {}], [{}]);
  assert.deepEqual(changed, []);
});
