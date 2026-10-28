const test = require('node:test');
const assert = require('node:assert/strict');
const { buildVacancyRecords, slugFromUrl } = require('./vacancy-records');

const NOW = new Date('2026-10-28T12:00:00Z');

test('slugFromUrl creates a readable title without pretending it is verified', () => {
  assert.equal(slugFromUrl('https://example.org/jobs/administrative-clerk-vacancy.pdf'), 'Administrative Clerk Vacancy');
});

test('builds deduplicated, traceable review records and never marks leads publishable', () => {
  const pages = [{
    source_id: 'official-dept', source_name: 'Department of Example',
    url: 'https://example.gov.za/careers', title: 'Careers', crawled_at: '2026-10-28T10:00:00Z',
    text: 'Vacancy: Administrative Clerk\nClosing date: 6 November 2026',
    metadata: { links: ['https://example.gov.za/jobs/administrative-clerk-vacancy', 'https://example.gov.za/jobs/administrative-clerk-vacancy'] },
  }];
  const result = buildVacancyRecords(pages, NOW);
  assert.equal(result.summary.total, 2);
  assert.equal(result.summary.publishable, 0);
  assert.ok(result.records.every((record) => record.publishable === false));
  assert.ok(result.records.every((record) => record.source_page_url === pages[0].url));
  assert.ok(result.records.some((record) => record.category === 'job'));
  assert.ok(result.records.some((record) => record.closing_date === '2026-11-06'));
  assert.equal(new Set(result.records.map((record) => record.candidate_id)).size, result.records.length);
});
