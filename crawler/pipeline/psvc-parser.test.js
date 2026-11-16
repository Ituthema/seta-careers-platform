const test = require('node:test');
const assert = require('node:assert/strict');
const { isCircular, circularMeta, parsePosts, circularLeads, kindOf } = require('./psvc-parser');
const { buildVacancyRecords } = require('./vacancy-records');

// Mirrors the structure of Public Service Vacancy Circular 40 of 2026 (annexure-level closing dates,
// "POST NN/NN :" headings, one annexure that repeats the date after each post).
const TEXT = `PUBLIC SERVICE VACANCY CIRCULAR
PUBLICATION NO 40 OF 2026
DATE ISSUED 06 NOVEMBER 2026
1. Introduction
ANNEXURE A DEPARTMENT OF EXAMPLE ENERGY
CLOSING DATE : 20 November 2026 at 16h00 (Walk-in) 23h59 (online).
POST 40/01 : DRIVER/MESSENGER REF NO: DEE2026/026 (X2 POSTS)
SALARY : R201 093 per annum (Level 04)
ENQUIRIES : Mr Example Tel No: (012) 406 7359
APPLICATIONS : Email to Vacancies3@dee.example.gov.za
POST 40/02 : INTERNSHIP PROGRAMME: FINANCE REF NO: DEE2026/031 (X5 POSTS)
SALARY : Stipend R7 000 per month
APPLICATIONS : Apply online at https://careers.example.gov.za/intern.
ANNEXURE B DEPARTMENT OF SAMPLE ENVIRONMENT
CLOSING DATE : 23 November 2026, 16:00. No late applications will be accepted.
POST 40/03 : INTERNAL AUDITOR REF NO: FOM74/2026
SALARY : R500 000 per annum
POST 40/04 : LEARNERSHIP: ENVIRONMENTAL PRACTICE REF NO: FOM75/2026
SALARY : R5 000 per month
ANNEXURE F DEPARTMENT OF PER-POST DATES
POST 40/05 : BURSARY PROGRAMME 2027 REF NO: DPD/9
APPLICATIONS : Email bursaries@dpd.example.gov.za
CLOSING DATE : 30 November 2026
POST 40/06 : ARTISAN FOREMAN REF NO: DPD/10
CLOSING DATE : 30 November 2026
ANNEXURE G NO DATE HERE
POST 40/07 : GRADUATE INTERN: LEGAL REF NO: NDH/1
SALARY : R9 000`;

test('recognises a circular and reads its number and issue date', () => {
  assert.equal(isCircular(TEXT), true);
  assert.equal(isCircular('Random careers page'), false);
  assert.deepEqual(circularMeta(TEXT), { circular_no: 40, year: 2026, issued_date: '2026-11-06' });
});

test('parses posts, annexure-level and per-post closing dates, and never borrows the next annexure date', () => {
  const posts = parsePosts(TEXT);
  assert.equal(posts.length, 7);
  const by = Object.fromEntries(posts.map((p) => [p.post_no, p]));
  assert.equal(by['40/01'].title, 'DRIVER/MESSENGER');
  assert.equal(by['40/01'].ref_no, 'DEE2026/026');
  assert.equal(by['40/01'].closing_date, '2026-11-20');
  assert.equal(by['40/02'].closing_date, '2026-11-20', 'last post of annexure A keeps A date, not B');
  assert.equal(by['40/04'].closing_date, '2026-11-23');
  assert.equal(by['40/05'].closing_date, '2026-11-30', 'per-post date');
  assert.equal(by['40/07'].closing_date, null, 'no date in its annexure stays unknown');
  assert.equal(by['40/02'].application_url, 'https://careers.example.gov.za/intern');
  assert.equal(by['40/05'].application_email, 'bursaries@dpd.example.gov.za');
  assert.equal(by['40/02'].department_guess, 'DEPARTMENT OF EXAMPLE ENERGY');
});

test('only youth-development wording becomes a lead; permanent and look-alike posts do not', () => {
  assert.equal(kindOf('INTERNAL AUDITOR'), null);
  assert.equal(kindOf('ARTISAN FOREMAN'), null);
  assert.equal(kindOf('INTERNSHIP PROGRAMME: FINANCE'), 'internship');
  assert.equal(kindOf('LEARNERSHIP: ENVIRONMENTAL PRACTICE'), 'learnership');
  assert.equal(kindOf('BURSARY PROGRAMME 2027'), 'bursary');
  assert.equal(kindOf('APPRENTICE ELECTRICIAN'), 'apprenticeship');
  const leads = circularLeads({ text: TEXT, source_id: 'govza', source_name: 'Gov', url: 'https://www.gov.za/c40.pdf', title: 'C40' }, new Date('2026-11-16T05:00:00Z'));
  assert.deepEqual(leads.map((l) => [l.category, l.closing_date]), [
    ['internship', '2026-11-20'], ['learnership', '2026-11-23'], ['bursary', '2026-11-30'], ['internship', null],
  ]);
  assert.ok(leads.every((l) => l.publishable === false && l.source_page_url === 'https://www.gov.za/c40.pdf'));
  assert.ok(leads[3].missing_fields.includes('closing_date'));
});

test('past closing dates are flagged possibly_expired', () => {
  const leads = circularLeads({ text: TEXT, source_id: 's', url: 'https://www.gov.za/c40.pdf' }, new Date('2026-11-22T05:00:00Z'));
  assert.equal(leads.find((l) => l.category === 'internship' && l.closing_date).status, 'possibly_expired');
  assert.equal(leads.find((l) => l.category === 'bursary').status, 'needs_verification');
});

test('buildVacancyRecords routes circulars through the parser and leaves other pages alone', () => {
  const out = buildVacancyRecords([
    { source_id: 'govza', source_name: 'Gov', url: 'https://www.gov.za/c40.pdf', title: 'C40', text: TEXT },
    { source_id: 'x', source_name: 'X', url: 'https://example.gov.za/jobs', title: 'Jobs', text: 'Learnership applications close 5 December 2026', links: [] },
  ], new Date('2026-11-16T05:00:00Z'));
  const kinds = out.records.map((r) => r.evidence.kind);
  assert.equal(kinds.filter((k) => k === 'psvc_post').length, 4);
  assert.ok(kinds.includes('page_text'));
  assert.equal(out.summary.publishable, 0);
});
