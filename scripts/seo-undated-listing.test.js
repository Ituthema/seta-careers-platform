// Proves the static SEO generator handles a listing with missing fields (see docs/architecture/data.md,
// "Missing fields and field_notes"): it must not crash, must show the explanatory comments, and must
// list undated listings after dated ones. Runs the real generator on a temporary copy of the repo data.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

function generateWith(extraRecords) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-undated-'));
  fs.mkdirSync(path.join(tmp, 'scripts'));
  fs.copyFileSync(path.join(ROOT, 'scripts/generate-seo-pages.js'), path.join(tmp, 'scripts/generate-seo-pages.js'));
  fs.copyFileSync(path.join(ROOT, 'route-paths.js'), path.join(tmp, 'route-paths.js'));
  fs.cpSync(path.join(ROOT, 'data'), path.join(tmp, 'data'), { recursive: true });
  const file = path.join(tmp, 'data/opportunities.json');
  const records = JSON.parse(fs.readFileSync(file, 'utf8'));
  fs.writeFileSync(file, JSON.stringify(records.concat(extraRecords), null, 2));
  const run = spawnSync(process.execPath, [path.join(tmp, 'scripts/generate-seo-pages.js')], { cwd: tmp, encoding: 'utf8' });
  return { tmp, run };
}

const undated = {
  id: '990', slug: 'undated-test-learnership', title: 'Undated Test Learnership', category: 'learnership',
  sector: 'Not stated', province: 'Not stated', qualification_level: 'Not stated', stipend: 'Not stated', closing_date: null,
  application_url: 'https://www.example.org/apply', source_name: 'example.org', source_url: 'https://www.example.org/apply',
  verified: true, featured: false, expired: false, publication_status: 'open',
  description: 'Details were not provided with this listing. Read the official advert before applying.',
  eligibility: [], employment_eligibility: [], documents_needed: [], tags: [], posted_date: '2026-11-02', updated_date: '2026-11-02',
  field_notes: {
    stipend: 'Stipend unknown: the advert does not state one.',
    closing_date: 'Closing date unknown: no closing date was published. Confirm on the official page before applying.',
    eligibility: 'Eligibility requirements unknown: the advert does not list any.',
    documents_needed: 'Required documents unknown: the advert does not list any.',
  },
};
const dated = { ...undated, id: '991', slug: 'dated-test-learnership', title: 'Dated Test Learnership', closing_date: '2099-01-31', field_notes: undefined };
delete dated.field_notes;

test('an undated listing generates a page that shows its comments and does not crash the generator', () => {
  const { tmp, run } = generateWith([undated]);
  try {
    assert.equal(run.status, 0, run.stderr);
    const page = fs.readFileSync(path.join(tmp, 'learnerships/undated-test-learnership/index.html'), 'utf8');
    assert.match(page, /Closing date:<\/strong> Not stated/);
    assert.match(page, /Details not published/);
    assert.match(page, /Stipend unknown: the advert does not state one\./);
    assert.match(page, /Eligibility requirements unknown: the advert does not list any\./);
    assert.match(page, /Required documents unknown: the advert does not list any\./);
    assert.ok(fs.readFileSync(path.join(tmp, 'sitemap.xml'), 'utf8').includes('/learnerships/undated-test-learnership/'));
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
});

test('undated listings are listed after dated ones and stay off the deadline calendar', () => {
  const { tmp, run } = generateWith([undated, dated]);
  try {
    assert.equal(run.status, 0, run.stderr);
    const category = fs.readFileSync(path.join(tmp, 'learnerships/index.html'), 'utf8');
    const datedAt = category.indexOf('Dated Test Learnership');
    const undatedAt = category.indexOf('Undated Test Learnership');
    assert.ok(datedAt > -1 && undatedAt > datedAt, 'dated listing should come first');
    assert.match(category, /Closing date not stated/);
    const calendar = fs.readFileSync(path.join(tmp, 'calendar/index.html'), 'utf8');
    assert.ok(calendar.includes('Dated Test Learnership'));
    assert.ok(!calendar.includes('Undated Test Learnership'), 'no date means it cannot sit on a calendar');
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
});

test('a record with no field_notes renders exactly as before (no notes section)', () => {
  const { tmp, run } = generateWith([dated]);
  try {
    assert.equal(run.status, 0, run.stderr);
    const page = fs.readFileSync(path.join(tmp, 'learnerships/dated-test-learnership/index.html'), 'utf8');
    assert.ok(!page.includes('Details not published'));
    assert.match(page, /Closing date:<\/strong> 31 January 2099/);
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
});
