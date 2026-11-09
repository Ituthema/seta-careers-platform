const test = require('node:test');
const assert = require('node:assert/strict');
const { buildDrafts, draftFromLead, cleanTitle } = require('./candidate-drafts');
const { buildListing } = require('./listing-draft');
const { buildVacancyRecords } = require('../../crawler/pipeline/vacancy-records');

const NOW = new Date('2026-11-03T08:00:00Z');
const existing = [{ id: '003', slug: 'taken', application_url: 'https://example.gov.za/jobs/already-listed' }];
const lead = (over = {}) => ({
  candidate_id: 'c1', category: 'learnership', title: 'Farming Learnership', source_id: 'src-1', source_name: 'Dept of Example',
  source_page_url: 'https://example.gov.za/careers', application_url: 'https://example.gov.za/jobs/farming-learnership',
  closing_date: null, status: 'needs_verification', evidence: { kind: 'link', value: 'x' }, discovered_at: '2026-11-03T07:00:00Z', ...over,
});

test('a lead becomes an unverified draft that add:listing accepts and keeps hidden by default', () => {
  const { drafts, skipped } = buildDrafts([lead()], existing, [], NOW);
  assert.equal(skipped.length, 0);
  assert.equal(drafts.length, 1);
  const d = drafts[0].draft;
  assert.equal(d.verified, false);
  assert.equal(d.publication_status, undefined, 'never pre-approved');
  assert.equal(d._lead.candidate_id, 'c1');
  const built = buildListing(d, existing, [], NOW);
  assert.deepEqual(built.errors, []);
  assert.equal(built.listing.publication_status, 'needs_review');
  assert.equal(built.listing.closing_date, null);
  assert.match(built.listing.field_notes.stipend, /Stipend unknown/);
});

test('past, expired, titleless, linkless and duplicate leads are skipped with a reason', () => {
  const leads = [
    lead({ candidate_id: 'a', title: 'Old Learnership', closing_date: '2026-10-01' }),
    lead({ candidate_id: 'b', title: 'Flagged Learnership', status: 'possibly_expired' }),
    lead({ candidate_id: 'c', title: '   ' }),
    lead({ candidate_id: 'd', title: 'No Link Learnership', source_page_url: null, application_url: null }),
    lead({ candidate_id: 'e', title: 'Already Listed Learnership', application_url: 'https://example.gov.za/jobs/already-listed' }),
    lead({ candidate_id: 'f', title: 'Good One Learnership', application_url: 'https://example.gov.za/jobs/good-one', closing_date: '2026-12-01' }),
    lead({ candidate_id: 'g', title: 'Good One Learnership', application_url: 'https://example.gov.za/jobs/good-one-2', closing_date: '2026-12-01' }),
  ];
  const { drafts, skipped } = buildDrafts(leads, existing, [], NOW);
  assert.deepEqual(drafts.map((d) => d.draft.title), ['Good One Learnership']);
  assert.equal(drafts[0].draft.closing_date, '2026-12-01');
  const reasons = skipped.map((s) => s.reason).join(' | ');
  for (const text of ['has passed', 'no title', 'no link', 'application_url is already used', 'slug "good-one-learnership" is already used']) assert.ok(reasons.includes(text), text);
});

test('the limit is respected and long titles are shortened', () => {
  const many = Array.from({ length: 5 }, (_, i) => lead({ candidate_id: `m${i}`, title: `Lead Learnership ${i}`, application_url: `https://example.gov.za/jobs/${i}` }));
  assert.equal(buildDrafts(many, [], [], NOW, 2).drafts.length, 2);
  assert.ok(cleanTitle('x'.repeat(300)).length <= 120);
  assert.equal(draftFromLead(null, '2026-11-03').skip, 'not a lead record');
});

test('works on real crawler output: leads from buildVacancyRecords become drafts', () => {
  const pages = [{ source_id: 'official-dept', source_name: 'Department of Example', url: 'https://example.gov.za/careers', title: 'Careers', crawled_at: '2026-11-03T06:00:00Z',
    text: 'Learnership: Boiler Operator\nClosing date: 30 November 2026', metadata: { links: ['https://example.gov.za/jobs/boiler-operator-learnership'] } }];
  const { records } = buildVacancyRecords(pages, NOW);
  const { drafts } = buildDrafts(records, [], [], NOW);
  assert.ok(drafts.length >= 1);
  assert.ok(drafts.every((d) => d.draft.verified === false && d.draft.source_url));
  assert.ok(drafts.some((d) => d.draft.closing_date === '2026-11-30'));
});

test('titleProblem rejects page-text fragments and accepts opportunity names', () => {
  const { titleProblem } = require('./candidate-drafts');
  for (const bad of ['Already registered on our Job Site? >', '• Click on All jobs.', '1375269855', '“I am confident this programme works', 'the Public Service Vacancy Circular 39', 'News, Vacancies, Tenders & Notices', 'Careers']) {
    assert.ok(titleProblem(bad), bad);
  }
  for (const good of ['External Bursaries', 'Eskom Engineering Learnership 2026', 'LH Marthinusen Apprenticeship — Durban']) {
    assert.equal(titleProblem(good), null, good);
  }
});
