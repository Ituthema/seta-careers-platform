'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { buildChecklist, manualSources } = require('./manual-checklist');

const s = (id, extra = {}) => ({ source_id: id, name: id.toUpperCase(), type: 'private', url: `https://${id}.example.org`, active: true, priority: 2, last_checked: null, ...extra });
const NOW = new Date('2026-12-01T05:00:00Z');

test('only active manual sources are listed, most important first', () => {
  const list = manualSources([s('auto'), s('off', { access: 'manual', active: false }), s('b', { access: 'manual', priority: 2 }), s('a', { access: 'manual', priority: 1 }), s('c', { access: 'manual', priority: 2 })]);
  assert.deepEqual(list.map((x) => x.source_id), ['a', 'b', 'c']);
});

test('the checklist has task boxes, the reason, priority headings and the month', () => {
  const text = buildChecklist([s('a', { access: 'manual', priority: 1, manual_reason: 'The site answers automated requests with HTTP 403 (checked by the 2026-11-09 crawl).' })], NOW);
  assert.match(text, /December 2026/);
  assert.match(text, /### Priority 1/);
  assert.match(text, /- \[ \] \*\*A\*\* \(`a`, private\) — https:\/\/a\.example\.org/);
  assert.match(text, /Why manual:_ The site answers automated requests with HTTP 403/);
  assert.doesNotMatch(text, /checked by the 2026/);
  assert.match(buildChecklist([], NOW), /These 0 sources/);
});

test('a reason keeps its own parentheses and loses only the trailing crawl-date note', () => {
  const reason = 'robots.txt could not be fetched, so the crawler (RFC 9309) must treat the whole site as disallowed (2026-11-09 crawl).';
  const text = buildChecklist([s('a', { access: 'manual', manual_reason: reason })], NOW);
  assert.match(text, /\(RFC 9309\) must treat the whole site as disallowed\s*$/m);
});
