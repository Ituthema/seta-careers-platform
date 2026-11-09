'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { sourceYield, renderYield } = require('./source-yield');

const sources = [
  { source_id: 'a', name: 'A', active: true }, { source_id: 'b', name: 'B', active: true },
  { source_id: 'c', name: 'C', active: true }, { source_id: 'off', name: 'Off', active: false },
];
const staged = [{ source_id: 'a' }, { source_id: 'a' }, { source_id: 'b' }];
const pages = [
  { source_id: 'a', links: [1, 2], mentions: [{ status: 'open' }, { status: 'no_date' }] },
  { source_id: 'b', links: [1], mentions: [{ status: 'past' }] },
];

test('sorts sources into producers, no-dates and silent; inactive sources are ignored', () => {
  const y = sourceYield(sources, staged, pages);
  assert.equal(y.active, 3);
  assert.deepEqual(y.producers.map((r) => [r.source_id, r.staged, r.links, r.dated]), [['a', 2, 2, 1]]);
  assert.deepEqual(y.noDates, ['b']);
  assert.deepEqual(y.silent, ['c']);
});

test('renders a table and tolerates missing input', () => {
  const text = renderYield(sourceYield(sources, staged, pages));
  assert.match(text, /\| a \| 2 \| 2 \| 1 \|/);
  assert.match(text, /Silent sources[^\n]*c/);
  assert.deepEqual(sourceYield(null, null, null), { active: 0, producers: [], silent: [], noDates: [] });
});
