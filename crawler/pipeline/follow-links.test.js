const test = require('node:test');
const assert = require('node:assert/strict');
const { selectFollowLinks, sameSite } = require('./follow-links');

const page = (over = {}) => ({
  source_id: 's1', source_name: 'Dept', url: 'https://www.example.gov.za/careers',
  metadata: { links: [
    'https://www.example.gov.za/careers/learnership-farming-2026',
    'https://example.gov.za/bursaries/nsfas-2027',
    'https://www.example.gov.za/about-us',
    'https://other-site.com/learnership-2026',
    'https://www.example.gov.za/media/learnership-poster.jpg',
    'https://www.example.gov.za/downloads/internship-form.docx',
    'https://www.example.gov.za/vacancies/advert-123.pdf',
    'mailto:hr@example.gov.za',
    'https://www.example.gov.za/careers',
    'https://www.example.gov.za/careers/learnership-farming-2026#apply',
  ] }, ...over,
});

test('picks same-site opportunity links only, skips media, documents and third parties', () => {
  const picks = selectFollowLinks([page()], { perSource: 10 });
  const urls = picks.map((p) => p.url);
  assert.ok(urls.includes('https://www.example.gov.za/careers/learnership-farming-2026'));
  assert.ok(urls.includes('https://example.gov.za/bursaries/nsfas-2027'), 'subdomain / www variants count as the same site');
  assert.ok(urls.includes('https://www.example.gov.za/vacancies/advert-123.pdf'), 'PDFs are allowed');
  for (const bad of ['about-us', 'other-site.com', '.jpg', '.docx', 'mailto']) assert.ok(!urls.some((u) => u.includes(bad)), bad);
  assert.equal(urls.filter((u) => u.includes('learnership-farming-2026')).length, 1, 'anchors and repeats collapse to one URL');
  assert.ok(picks.every((p) => p.parent_url === 'https://www.example.gov.za/careers' && p.source_id === 's1'));
});

test('limits per source and in total, and prefers links that look like one specific advert', () => {
  const many = { source_id: 's2', source_name: 'Many', url: 'https://many.example.org/jobs', metadata: { links: [
    'https://many.example.org/learnerships', 'https://many.example.org/learnerships/boiler-2026', 'https://many.example.org/learnerships/pipe-fitter-2026-17', 'https://many.example.org/internship', 'https://many.example.org/vacancies/clerk-55' ] } };
  const picks = selectFollowLinks([many], { perSource: 2 });
  assert.equal(picks.length, 2);
  assert.ok(picks[0].url.includes('pipe-fitter-2026-17'), 'year + id + depth ranks first');
  assert.equal(selectFollowLinks([page(), many, { ...many, source_id: 's3', url: 'https://third.example.org/x', metadata: { links: ['https://third.example.org/internship-2026'] } }], { perSource: 10, total: 4 }).length, 4);
});

test('never follows from a followed page, never fetches an already-staged page, and can be turned off', () => {
  assert.deepEqual(selectFollowLinks([page({ depth: 1 })]), []);
  const staged = [page(), { source_id: 's9', url: 'https://www.example.gov.za/careers/learnership-farming-2026', metadata: { links: [] } }];
  assert.ok(!selectFollowLinks(staged, { perSource: 10 }).some((p) => p.url.endsWith('learnership-farming-2026')));
  assert.deepEqual(selectFollowLinks([page()], { enabled: false }), []);
  assert.deepEqual(selectFollowLinks(null), []);
  assert.deepEqual(selectFollowLinks([{ source_id: 'x', url: 'not a url', metadata: { links: ['https://a.org/learnership'] } }]), []);
});

test('sameSite ignores www and accepts subdomains, rejects lookalikes', () => {
  assert.ok(sameSite('www.a.org', 'a.org'));
  assert.ok(sameSite('jobs.a.org', 'a.org'));
  assert.ok(!sameSite('evil-a.org', 'a.org'));
  assert.ok(!sameSite('a.org.evil.com', 'a.org'));
});
