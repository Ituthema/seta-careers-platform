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

test('invalid values are all reported, and only title, category and a link are essential', () => {
  const { listing, errors } = buildListing({ title: 'x', category: 'invalid-category', province: 'Mars', closing_date: '2026-02-30', application_url: 'nope', employment_eligibility: ['retired'], eligibility: 'not a list' }, existing, sources, NOW);
  assert.equal(listing, null);
  for (const text of ['category must be', 'province must be', 'closing_date must be a real date', 'application_url must be a valid', 'employment_eligibility has invalid', 'eligibility must be a list of text']) {
    assert.ok(errors.some((e) => e.includes(text)), text);
  }
  const none = buildListing({}, existing, sources, NOW);
  assert.equal(none.listing, null);
  for (const text of ['title is required', 'category is required', 'application_url or source_url is required']) {
    assert.ok(none.errors.some((e) => e.includes(text)), text);
  }
});

test('a draft with only the essentials becomes a listing with a comment for every missing field', () => {
  const { listing, errors, warnings } = buildListing({ title: 'Bare Bones Internship', category: 'internship', source_url: 'https://www.example.org/careers' }, existing, sources, NOW);
  assert.deepEqual(errors, []);
  assert.equal(listing.stipend, 'Not stated');
  assert.equal(listing.closing_date, null);
  assert.deepEqual(listing.eligibility, []);
  assert.equal(listing.application_url, 'https://www.example.org/careers');
  assert.equal(listing.source_name, 'example.org');
  assert.match(listing.field_notes.stipend, /Stipend unknown/);
  assert.match(listing.field_notes.closing_date, /Closing date unknown/);
  assert.deepEqual(Object.keys(listing.field_notes).sort(), ['closing_date', 'description', 'documents_needed', 'eligibility', 'employment_eligibility', 'province', 'qualification_level', 'sector', 'stipend']);
  assert.ok(warnings.some((w) => /no closing date/.test(w)));
  assert.equal(listing.verified, false);
});

test('a custom comment replaces the default, and fields that are given get no comment', () => {
  const { listing } = buildListing({ ...draft(), stipend: '', field_notes: { stipend: 'Stipend unknown: employer says it is set at interview.' } }, existing, sources, NOW);
  assert.equal(listing.field_notes.stipend, 'Stipend unknown: employer says it is set at interview.');
  assert.deepEqual(Object.keys(listing.field_notes), ['stipend']);
  assert.equal(buildListing(draft(), existing, sources, NOW).listing.field_notes, undefined);
});

test('a missing closing date is allowed, but a past one is still refused', () => {
  const { closing_date, ...noDate } = draft();
  assert.equal(buildListing(noDate, existing, sources, NOW).listing.closing_date, null);
  assert.ok(buildListing({ ...draft(), closing_date: '2026-10-24' }, existing, sources, NOW).errors.some((e) => /before today/.test(e)));
});

test('closed dates, duplicate slugs and duplicate application links are rejected', () => {
  assert.ok(buildListing({ ...draft(), closing_date: '2026-10-24' }, existing, sources, NOW).errors.some((e) => /before today/.test(e)));
  assert.ok(buildListing({ ...draft(), closing_date: '2026-10-25' }, existing, sources, NOW).errors.length === 0);
  assert.ok(buildListing({ ...draft(), slug: 'taken' }, existing, sources, NOW).errors.some((e) => /already used by listing 003/.test(e)));
  assert.ok(buildListing({ ...draft(), application_url: 'https://www.example.org/apply/taken' }, existing, sources, NOW).errors.some((e) => /application_url is already used/.test(e)));
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
