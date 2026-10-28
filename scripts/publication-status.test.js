const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  PUBLICATION_STATUSES,
  isListedOpportunity,
} = require('../route-paths');

const ROOT = path.resolve(__dirname, '..');
const opportunities = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'data', 'opportunities.json'), 'utf8')
);

test('publication lifecycle exposes the supported editorial states', () => {
  assert.deepEqual([...PUBLICATION_STATUSES].sort(), [
    'expired',
    'needs_review',
    'on_hold',
    'open',
    'withdrawn',
  ]);
});

test('only explicitly open, non-expired records are listed', () => {
  assert.equal(isListedOpportunity({ publication_status: 'open', expired: false }), true);
  for (const status of ['expired', 'on_hold', 'withdrawn', 'needs_review', undefined, null]) {
    assert.equal(isListedOpportunity({ publication_status: status, expired: false }), false);
  }
  assert.equal(isListedOpportunity({ publication_status: 'open', expired: true }), false);
  assert.equal(isListedOpportunity(null), false);
});

test('all current records have a valid, consistent publication status', () => {
  assert.equal(opportunities.length, 17);
  for (const opportunity of opportunities) {
    assert.ok(
      PUBLICATION_STATUSES.has(opportunity.publication_status),
      `record ${opportunity.id} has invalid publication_status`
    );
    if (opportunity.publication_status === 'open') {
      assert.equal(opportunity.expired, false, `record ${opportunity.id} cannot be open and expired`);
    }
    if (opportunity.publication_status === 'expired') {
      assert.equal(opportunity.expired, true, `record ${opportunity.id} marked expired must retain expired: true`);
    }
  }
});

test('Mpumalanga traffic learnership uses the corrected official application URL', () => {
  const record = opportunities.find((opportunity) => opportunity.id === '014');
  assert.ok(record);
  assert.equal(record.publication_status, 'open');
  assert.equal(record.closing_date, '2026-10-30');
  assert.equal(record.application_url, 'https://forms.cloud.microsoft/r/tKW94ibBVF');
});

test('interactive directory fails closed when publication status is absent', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  assert.match(html, /publicationStatus:o\.publication_status\|\|'needs_review'/);
  assert.match(html, /o\.publicationStatus==='open'&&!o\.expired/);
  assert.match(html, /_opp=liveOpps\(\)\.find\(o=>o\.id===id\)\|\|null/);
  assert.match(html, /function openOpp\(id\)\{_opp=liveOpps\(\)\.find/);
  assert.match(html, /const saved=liveOpps\(\)\.filter/);
});
