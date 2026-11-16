// An `open` listing that has not been verified must be published AND clearly labelled "Unverified" on the
// static pages (see docs/status/PUBLICATION_LIFECYCLE.md, "Relaxed"). Runs the real generator on a temporary copy.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const base = {
  category: 'learnership', sector: 'Engineering', province: 'Gauteng', qualification_level: 'Matric', stipend: 'R5 000 per month',
  closing_date: '2099-01-31', application_url: 'https://www.example.org/apply', source_name: 'example.org', source_url: 'https://www.example.org/apply',
  featured: false, expired: false, publication_status: 'open',
  description: 'A twelve month engineering learnership for unemployed matriculants, with workplace experience and a monthly stipend.',
  eligibility: ['Citizen'], employment_eligibility: ['unemployed'], documents_needed: ['ID'], tags: [], posted_date: '2026-11-02', updated_date: '2026-11-02',
};
const unverified = { ...base, id: '980', slug: 'unverified-test-learnership', title: 'Unverified Test Learnership', verified: false };
const verified = { ...base, id: '981', slug: 'verified-test-learnership', title: 'Verified Test Learnership', application_url: 'https://www.example.org/apply2', verified: true };

test('an open but unverified listing is published with an Unverified notice; a verified one has none', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-unverified-'));
  try {
    fs.mkdirSync(path.join(tmp, 'scripts'));
    fs.copyFileSync(path.join(ROOT, 'scripts/generate-seo-pages.js'), path.join(tmp, 'scripts/generate-seo-pages.js'));
    fs.copyFileSync(path.join(ROOT, 'route-paths.js'), path.join(tmp, 'route-paths.js'));
    fs.mkdirSync(path.join(tmp, 'scripts/lib'), { recursive: true });
    fs.cpSync(path.join(ROOT, 'scripts/lib'), path.join(tmp, 'scripts/lib'), { recursive: true });
    fs.cpSync(path.join(ROOT, 'data'), path.join(tmp, 'data'), { recursive: true });
    const file = path.join(tmp, 'data/opportunities.json');
    fs.writeFileSync(file, JSON.stringify(JSON.parse(fs.readFileSync(file, 'utf8')).concat([unverified, verified]), null, 2));
    const run = spawnSync(process.execPath, [path.join(tmp, 'scripts/generate-seo-pages.js')], { cwd: tmp, encoding: 'utf8' });
    assert.equal(run.status, 0, run.stderr);
    const u = fs.readFileSync(path.join(tmp, 'learnerships/unverified-test-learnership/index.html'), 'utf8');
    assert.match(u, /<strong>Unverified:<\/strong>/);
    const v = fs.readFileSync(path.join(tmp, 'learnerships/verified-test-learnership/index.html'), 'utf8');
    assert.ok(!v.includes('Unverified:'), 'verified listings carry no notice');
    assert.ok(fs.readFileSync(path.join(tmp, 'sitemap.xml'), 'utf8').includes('/learnerships/unverified-test-learnership/'), 'unverified open listings are still in the sitemap');
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
});

test('needs_review listings stay out of public output even if unverified', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-review-'));
  try {
    fs.mkdirSync(path.join(tmp, 'scripts'));
    fs.copyFileSync(path.join(ROOT, 'scripts/generate-seo-pages.js'), path.join(tmp, 'scripts/generate-seo-pages.js'));
    fs.copyFileSync(path.join(ROOT, 'route-paths.js'), path.join(tmp, 'route-paths.js'));
    fs.mkdirSync(path.join(tmp, 'scripts/lib'), { recursive: true });
    fs.cpSync(path.join(ROOT, 'scripts/lib'), path.join(tmp, 'scripts/lib'), { recursive: true });
    fs.cpSync(path.join(ROOT, 'data'), path.join(tmp, 'data'), { recursive: true });
    const file = path.join(tmp, 'data/opportunities.json');
    fs.writeFileSync(file, JSON.stringify(JSON.parse(fs.readFileSync(file, 'utf8')).concat([{ ...unverified, slug: 'review-only', title: 'Review Only', publication_status: 'needs_review' }]), null, 2));
    assert.equal(spawnSync(process.execPath, [path.join(tmp, 'scripts/generate-seo-pages.js')], { cwd: tmp }).status, 0);
    assert.ok(!fs.existsSync(path.join(tmp, 'learnerships/review-only/index.html')));
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
});

test('JobPosting JSON-LD appears only on verified open employment listings that name an employer', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-jobposting-'));
  try {
    fs.mkdirSync(path.join(tmp, 'scripts'));
    fs.copyFileSync(path.join(ROOT, 'scripts/generate-seo-pages.js'), path.join(tmp, 'scripts/generate-seo-pages.js'));
    fs.copyFileSync(path.join(ROOT, 'route-paths.js'), path.join(tmp, 'route-paths.js'));
    fs.cpSync(path.join(ROOT, 'scripts/lib'), path.join(tmp, 'scripts/lib'), { recursive: true });
    fs.cpSync(path.join(ROOT, 'data'), path.join(tmp, 'data'), { recursive: true });
    const withEmployer = { ...base, id: '982', slug: 'jp-with-employer', title: 'JP With Employer', application_url: 'https://www.example.org/jp1', verified: true, employer: 'Example Employer Ltd' };
    const noEmployer = { ...base, id: '983', slug: 'jp-no-employer', title: 'JP No Employer', application_url: 'https://www.example.org/jp2', verified: true };
    const notVerified = { ...base, id: '984', slug: 'jp-unverified', title: 'JP Unverified', application_url: 'https://www.example.org/jp3', verified: false, employer: 'Example Employer Ltd' };
    const bursary = { ...base, id: '985', slug: 'jp-bursary', title: 'JP Bursary', category: 'bursary', application_url: 'https://www.example.org/jp4', verified: true, employer: 'Example Employer Ltd' };
    const file = path.join(tmp, 'data/opportunities.json');
    fs.writeFileSync(file, JSON.stringify(JSON.parse(fs.readFileSync(file, 'utf8')).concat([withEmployer, noEmployer, notVerified, bursary]), null, 2));
    const run = spawnSync(process.execPath, [path.join(tmp, 'scripts/generate-seo-pages.js')], { cwd: tmp, encoding: 'utf8' });
    assert.equal(run.status, 0, run.stderr);
    const page = (dir, slug) => fs.readFileSync(path.join(tmp, dir, slug, 'index.html'), 'utf8');
    const yes = page('learnerships', 'jp-with-employer');
    assert.match(yes, /"@type":"JobPosting"/);
    assert.match(yes, /"hiringOrganization":\{"@type":"Organization","name":"Example Employer Ltd"\}/);
    assert.match(yes, /"validThrough":"2099-01-31T23:59:59\+02:00"/);
    assert.match(yes, /"@type":"BreadcrumbList"/, 'breadcrumbs are kept');
    assert.ok(!page('learnerships', 'jp-no-employer').includes('JobPosting'));
    assert.ok(!page('learnerships', 'jp-unverified').includes('JobPosting'));
    assert.ok(!page('bursaries', 'jp-bursary').includes('JobPosting'));
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
});
