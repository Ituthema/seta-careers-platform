'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSummary, southAfricanToday } = require('./summarize-crawl-reports');

test('summary reports crawl outcomes, candidate leads and live-listing baseline', () => {
  const output = buildSummary({
    today: '2026-10-28',
    crawl: {
      status: 'OK',
      sources_processed: 10,
      successful_fetches: 8,
      failed_fetches: 2,
      internal_errors: 0,
      staged_records: 6,
      rejected_records: 4,
      rejected_by_reason: { FETCH_FAILED: 2, DUPLICATE: 2 },
      failure_reasons: [],
    },
    candidates: {
      summary: { pages_with_leads: 3, links: 7, mentions: 4, open_mentions: 2 },
      pages: [
        { mentions: [{ category: 'bursary', status: 'open' }, { category: 'learnership', status: 'past' }] },
        { mentions: [{ category: 'bursary', status: 'no_date' }, { category: 'internship', status: 'open' }] },
      ],
    },
    opportunities: [
      { title: 'Open listing', category: 'bursary', closing_date: '2026-10-31', expired: false },
      { title: 'Expired flag', category: 'learnership', closing_date: '2026-11-01', expired: true },
      { title: 'Past close', category: 'internship', closing_date: '2026-10-01', expired: false },
    ],
  });

  assert.match(output, /8 successful fetches/);
  assert.match(output, /6 pages staged; 4 rejected/);
  assert.match(output, /7 opportunity-like links; 4 text mentions/);
  assert.match(output, /bursary: 2/);
  assert.match(output, /1 of 3 records meet the site's active-date\/expired-flag filter/);
  assert.match(output, /does not edit data\/opportunities\.json or publish listings/);
});

test('missing reports are explicitly reported without inventing counts', () => {
  const output = buildSummary({ crawl: null, candidates: null, opportunities: null, today: '2026-10-28' });
  assert.match(output, /Crawl report:\\*\\* missing or unreadable/);
  assert.match(output, /Candidate report:\\*\\* missing or unreadable/);
  assert.match(output, /Repository listing baseline: data\/opportunities\.json missing or unreadable/);
});

test('South African date formatter returns an ISO date', () => {
  assert.match(southAfricanToday(new Date('2026-10-28T12:00:00Z')), /^2026-10-28$/);
});
