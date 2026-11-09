const test = require('node:test');
const assert = require('node:assert/strict');
const { closingDates, categoryOf, extractCandidates, extractAll } = require('./candidates');

const NOW = new Date('2026-10-25T00:00:00Z');

test('closing dates are parsed from several formats, only when labelled', () => {
  assert.deepEqual(closingDates('Closing date: 31 October 2026'), ['2026-10-31']);
  assert.deepEqual(closingDates('Applications close on 5th Nov 2026.'), ['2026-11-05']);
  assert.deepEqual(closingDates('Deadline: October 31, 2026'), ['2026-10-31']);
  assert.deepEqual(closingDates('Apply by 2026-12-01'), ['2026-12-01']);
  assert.deepEqual(closingDates('Posted on 31 October 2026'), []);
  assert.deepEqual(closingDates('Closing 31 February 2026'), []);
});

test('categories come from keywords', () => {
  assert.equal(categoryOf('Engineering Learnership 2027'), 'learnership');
  assert.equal(categoryOf('Bursary applications'), 'bursary');
  assert.equal(categoryOf('Graduate Internship'), 'internship');
  assert.equal(categoryOf('Artisan apprenticeship'), 'apprenticeship');
  assert.equal(categoryOf('Administrative Clerk vacancy'), 'job');
  assert.equal(categoryOf('Office Aid post'), 'job');
  assert.equal(categoryOf('About our company'), null);
});

const record = {
  source_id: 's1', source_name: 'Source One', url: 'https://example.org/careers', title: 'Careers',
  crawled_at: '2026-10-24T00:00:00Z',
  text: 'Welcome\nIT Learnership 2027\nClosing date: 15 November 2026\nBursary round 2025\nClosing date: 1 March 2025\nContact us',
  metadata: { links: ['https://example.org/careers', 'https://example.org/learnerships/it-2027', 'https://example.org/contact'] },
};

test('a page yields link leads and mentions with an open/past/no_date status', () => {
  const page = extractCandidates(record, NOW);
  assert.deepEqual(page.links, [{ url: 'https://example.org/learnerships/it-2027', category: 'learnership' }]);
  assert.deepEqual(page.mentions.map((m) => [m.category, m.status]), [['learnership', 'open'], ['bursary', 'past']]);
});

test('extractAll skips pages without leads and summarises', () => {
  const empty = { ...record, source_id: 's2', text: 'Nothing here', metadata: { links: [] } };
  const result = extractAll([record, empty], NOW);
  assert.equal(result.pages.length, 1);
  assert.deepEqual(result.summary, { pages_with_leads: 1, links: 1, mentions: 2, open_mentions: 1 });
});

test('a followed detail page yields one page-level lead with its closing date from anywhere in the text', () => {
  const { extractCandidates } = require('./candidates');
  const now = new Date('2026-11-09T08:00:00Z');
  const filler = 'Apply online with your CV and ID.\n'.repeat(6);
  const page = { source_id: 's', url: 'https://x.co.za/l/farming', title: 'Farming Learnership 2026', crawled_at: 'x', depth: 1,
    text: `Farming Learnership 2026\nA 12 month programme.\n${filler}\nClosing date: 30 November 2026\n` };
  const out = extractCandidates(page, now);
  const lead = out.mentions.find((m) => m.page_level);
  assert.ok(lead);
  assert.equal(lead.line, 'Farming Learnership 2026');
  assert.deepEqual(lead.closing_dates, ['2026-11-30']);
  assert.equal(lead.status, 'open');
  // Landing pages (no depth) and undated detail pages get no page-level lead.
  assert.equal(extractCandidates({ ...page, depth: undefined }, now).mentions.some((m) => m.page_level), false);
  assert.equal(extractCandidates({ ...page, text: 'No dates here' }, now).mentions.some((m) => m.page_level), false);
});
