const test = require('node:test');
const assert = require('node:assert/strict');
const { jobPostingLd, monthlyStipend } = require('./job-posting');

const ctx = { url: 'https://example.test/learnerships/x/', provinceLabels: ['Gauteng', 'Western Cape'] };
const ok = {
  id: '30', title: 'Engineering Learnership', category: 'learnership', province: 'Gauteng', stipend: 'R5 000/month',
  closing_date: '2026-12-15', posted_date: '2026-11-10', description: 'A 12 month learnership <b>with</b> a stipend & mentoring.',
  employer: 'Example Engineering (Pty) Ltd', verified: true, publication_status: 'open', expired: false,
};

test('a verified open employment listing gets a complete JobPosting', () => {
  const ld = jobPostingLd(ok, ctx);
  assert.equal(ld['@type'], 'JobPosting');
  assert.equal(ld.hiringOrganization.name, 'Example Engineering (Pty) Ltd');
  assert.equal(ld.validThrough, '2026-12-15T23:59:59+02:00');
  assert.equal(ld.datePosted, '2026-11-10');
  assert.equal(ld.employmentType, 'OTHER');
  assert.deepEqual(ld.jobLocation.address, { '@type': 'PostalAddress', addressCountry: 'ZA', addressRegion: 'Gauteng' });
  assert.equal(ld.baseSalary.value.value, 5000);
  assert.equal(ld.baseSalary.currency, 'ZAR');
  assert.equal(ld.url, ctx.url);
  assert.equal(ld.description, '<p>A 12 month learnership &lt;b&gt;with&lt;/b&gt; a stipend &amp; mentoring.</p>');
  assert.equal(jobPostingLd({ ...ok, category: 'internship' }, ctx).employmentType, 'INTERN');
});

test('anything that is not a verified, open, dated, employer-named job gets no markup', () => {
  const cases = {
    bursary: { category: 'bursary' }, tvet: { category: 'tvet' }, unverified: { verified: false }, notOpen: { publication_status: 'needs_review' },
    expired: { expired: true }, noDate: { closing_date: null }, badDate: { closing_date: '15 Dec 2026' }, noEmployer: { employer: '  ' },
    noPosted: { posted_date: undefined }, noDescription: { description: '' },
  };
  for (const [name, over] of Object.entries(cases)) assert.equal(jobPostingLd({ ...ok, ...over }, ctx), null, name);
  assert.equal(jobPostingLd(null, ctx), null);
});

test('nationwide or unknown provinces give a country-only location', () => {
  assert.deepEqual(jobPostingLd({ ...ok, province: 'Nationwide' }, ctx).jobLocation.address, { '@type': 'PostalAddress', addressCountry: 'ZA' });
});

test('baseSalary only for an exact monthly figure, never a guess', () => {
  assert.equal(monthlyStipend('R4 500/month'), 4500);
  assert.equal(monthlyStipend('R7 044 per month'), 7044);
  assert.equal(monthlyStipend('R10,109.86/month (basic salary, no benefits)'), 10109.86);
  assert.equal(monthlyStipend('Full tuition + R5 000/month'), null);
  assert.equal(monthlyStipend('Not disclosed by employer'), null);
  assert.equal(monthlyStipend('Not stated'), null);
  assert.equal('baseSalary' in jobPostingLd({ ...ok, stipend: 'Not stated' }, ctx), false);
});
