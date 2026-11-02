const test = require('node:test');
const assert = require('node:assert/strict');
const { undatedOpen, toMarkdown } = require('./list-undated-open');

const rec = (over) => ({ id: '1', title: 'A', publication_status: 'open', expired: false, closing_date: null, updated_date: '2026-10-30', source_url: 'https://x.example/a', ...over });

test('only open, unexpired listings without a closing date are reported', () => {
  const records = [
    rec({ id: '1' }),
    rec({ id: '2', closing_date: '2026-12-01' }),
    rec({ id: '3', expired: true, publication_status: 'expired' }),
    rec({ id: '4', publication_status: 'needs_review' }),
    rec({ id: '5', closing_date: '' }),
  ];
  assert.deepEqual(undatedOpen(records).map((o) => o.id), ['1', '5']);
  assert.deepEqual(undatedOpen(null), []);
});

test('markdown shows the age, escapes table characters and handles the empty case', () => {
  const md = toMarkdown([rec({ title: 'Pipe | Title' })], '2026-11-02');
  assert.match(md, /1 open listing\(s\)/);
  assert.match(md, /\| 1 \| Pipe \\\| Title \| 2026-10-30 \| 3 \| https:\/\/x\.example\/a \|/);
  assert.equal(toMarkdown([rec({ closing_date: '2026-12-01' })], '2026-11-02'), 'No open listings without a closing date.\n');
});
