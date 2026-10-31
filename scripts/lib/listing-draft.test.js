const test = require('node:test');
const assert = require('node:assert/strict');
const { buildListing, slugify, nextId } = require('./listing-draft');

const NOW = new Date('2026-10-25T10:00:00Z');
const sources = [{ url: 'https://www.example.org/careers' }];
const existing = [{ id: '003', slug: 'taken', application_url: 'https://www.example.org/apply/taken' }, { id: '011', slug: 'other', application_url: 'https://x.example/' }];

const draft = () => ({
  title: 'Example Engineering Learnership 2027 & Beyond',
  category: 'learnership', sector: 'Engineering', province: 'Gauteng', qualification_level: 'Matric',
  stipend: 'R5 000 per month', closing_date: '2026-12-01',
  application_url: 'https://www.example.org/apply/eng', source_name: 'Example careers', source_url: 'https://www.example.org/careers',
  description: 'A twelve month engineering learnership for unemployed matriculants, with workplace experience and a monthly stipend paid by the employer.',
  eligibility: ['South African citizen', 'Matric with maths'], documents_needed: ['ID', 'Matric results'], employment_eligibility: ['unemployed'],
});

test('a good draft becomes a full record with generated fields', () => {
  const { listing, errors } = buildListing(draft(), existing, sources, NOW);
  assert.deepEqual(errors, []);
  assert.equal(listing.id, '012');
  assert.equal(listing.slug, 'example-engineering-learnership-2027-and-beyond');
  assert.equal(listing.posted_date, '2026-10-25');
  assert.equal(listing.expired, false);
  assert.equal(listing.publication_status, 'needs_review');
  assert.equal(listing.verified, false);
  assert.deepEqual(Object.keys(listing).slice(0, 4), ['id', 'slug', 'title', 'category']);
});

test('general job vacancy drafts are accepted as a supported category', () => {
  const input = draft();
  input.title = 'Administrative Clerk Vacancy';
  input.category = 'job';
  const { listing, errors } = buildListing(input, existing, sources, NOW);
  assert.deepEqual(errors, []);
  assert.equal(listing.category, 'job');
  assert.equal(require('../../route-paths').opportunityRoutePath(listing), '/jobs/administrative-clerk-vacancy');
});

test('missing and invalid fields are all reported', () => {
  const { listing, errors } = buildListing({ title: 'x', category: 'invalid-category', province: 'Mars', closing_date: '2026-02-30', application_url: 'nope', employment_eligibility: ['retired'] }, existing, sources, NOW);
  assert.equal(listing, null);
  for (const text of ['sector is required', 'category must be', 'province must be', 'closing_date must be a real date', 'application_url must be a valid', 'employment_eligibility has invalid', 'eligibility must be']) {
    assert.ok(errors.some((e) => e.includes(text)), text);
  }
});

test('closed dates, duplicate slugs and duplicate application links are rejected', () => {
  assert.ok(buildListing({ ...draft(), closing_date: '2026-10-24' }, existing, sources, NOW).errors.some((e) => /before today/.test(e)));
  assert.ok(buildListing({ ...draft(), closing_date: '2026-10-25' }, existing, sources, NOW).errors.length === 0);
  assert.ok(buildListing({ ...draft(), slug: 'taken' }, existing, sources, NOW).errors.some((e) => /already used by listing 003/.test(e)));
  assert.ok(buildListing({ ...draft(), application_url: 'https://www.example.org/apply/taken' }, existing, sources, NOW).errors.some((e) => /application_url is already used/.test(e)));
});

test('new listings need explicit open approval and verified source evidence to publish', () => {
  const pending = buildListing(draft(), existing, sources, NOW);
  assert.equal(pending.listing.publication_status, 'needs_review');
  const openWithoutVerification = buildListing({ ...draft(), publication_status: 'open' }, existing, sources, NOW);
  assert.equal(openWithoutVerification.listing, null);
  assert.ok(openWithoutVerification.errors.some((e) => /publication_status open requires verified: true/.test(e)));
  const approved = buildListing({ ...draft(), verified: true, publication_status: 'open' }, existing, sources, NOW);
  assert.deepEqual(approved.errors, []);
  assert.equal(approved.listing.publication_status, 'open');
  const invalid = buildListing({ ...draft(), publication_status: 'published' }, existing, sources, NOW);
  assert.ok(invalid.errors.some((e) => /publication_status must be one of/.test(e)));
});

test('verified: true needs registry coverage for both URLs', () => {
  assert.equal(buildListing({ ...draft(), verified: true }, existing, sources, NOW).listing.verified, true);
  const bad = buildListing({ ...draft(), verified: true, application_url: 'https://portal.other.example/apply' }, existing, sources, NOW);
  assert.equal(bad.listing, null);
  assert.ok(bad.errors.some((e) => /portal\.other\.example/.test(e)));
});

test('warnings: unverified, short description, different sites', () => {
  const { warnings } = buildListing({ ...draft(), description: 'Too short for search.', application_url: 'https://portal.other.example/apply' }, existing, sources, NOW);
  assert.ok(warnings.some((w) => /under 80/.test(w)));
  assert.ok(warnings.some((w) => /different sites/.test(w)));
  assert.ok(warnings.some((w) => /verified is false/.test(w)));
});

test('slugify and nextId', () => {
  assert.equal(slugify('Café & Co: Bursary 2027!'), 'cafe-and-co-bursary-2027');
  assert.equal(nextId([]), '001');
  assert.equal(nextId([{ id: '009' }, { id: '004' }]), '010');
});
