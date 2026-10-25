const test = require('node:test');
const assert = require('node:assert/strict');
const { findUncoveredVerified, hostsRelated } = require('./registry-coverage');

const sources = [
  { url: 'https://www.nsfas.org.za/' },
  { url: 'https://www.health.gov.za/' },
  { url: 'https://www.standardbank.com/careers' },
];

test('hosts match when equal or one is a subdomain of the other, ignoring www', () => {
  assert.equal(hostsRelated('my.nsfas.org.za', 'nsfas.org.za'), true);
  assert.equal(hostsRelated('nsfas.org.za', 'nsfas.org.za'), true);
  assert.equal(hostsRelated('careers.capitecbank.co.za', 'capitecbank.co.za'), true);
  assert.equal(hostsRelated('standardbank.co.za', 'standardbank.com'), false);
  assert.equal(hostsRelated('notnsfas.org.za', 'nsfas.org.za'), false);
});

test('a bare public suffix does not cover unrelated sites', () => {
  assert.equal(hostsRelated('kznhealth.gov.za', 'gov.za'), false);
  assert.equal(hostsRelated('anything.co.za', 'co.za'), false);
});

test('only verified listings are checked, and every uncovered URL is reported', () => {
  const opps = [
    { id: '1', verified: true, source_url: 'https://my.nsfas.org.za/x', application_url: 'https://www.nsfas.org.za/apply' },
    { id: '2', verified: true, expired: true, source_url: 'https://kznhealth.gov.za', application_url: 'https://kznhealth.gov.za/jobs' },
    { id: '3', verified: false, source_url: 'https://unknown.example/', application_url: 'https://unknown.example/' },
  ];
  const gaps = findUncoveredVerified(opps, sources);
  assert.deepEqual(gaps.map((g) => [g.id, g.field, g.expired]), [['2', 'source_url', true], ['2', 'application_url', true]]);
});

test('an unparseable URL counts as uncovered', () => {
  const gaps = findUncoveredVerified([{ id: '9', verified: true, source_url: 'not a url' }], sources);
  assert.equal(gaps.length, 1);
});
