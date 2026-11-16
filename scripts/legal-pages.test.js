const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { privacyBody, termsBody, LEGAL_UPDATED } = require('./lib/legal-pages');

const ROOT = path.join(__dirname, '..');
const index = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const page = (route) => fs.readFileSync(path.join(ROOT, route, 'index.html'), 'utf8');

// These guard the claims the privacy page makes. If one fails, the site's behaviour changed:
// update scripts/lib/legal-pages.js (and LEGAL_UPDATED) before shipping it.
test('the site still matches the privacy page: no cookies, forms, analytics or external scripts', () => {
  assert.ok(!/<script[^>]*\ssrc=/i.test(index), 'index.html loads an external script');
  assert.ok(!/document\.cookie/.test(index), 'index.html sets cookies');
  assert.ok(!/<form[\s>]/i.test(index), 'index.html has a form');
  assert.ok(!/gtag\(|googletagmanager|google-analytics|adsbygoogle|facebook\.net|hotjar|clarity\.ms/i.test(index), 'analytics or ad tool found');
  assert.ok(!/sessionStorage\.setItem|indexedDB/.test(index.replace(/__redirect_path/g, '')), 'new browser storage in use');
});

test('privacy page mentions the third parties the site really uses', () => {
  const usesFonts = /fonts\.googleapis\.com/.test(index);
  assert.equal(usesFonts, /Google Fonts/.test(privacyBody()), 'Google Fonts statement out of sync with index.html');
  assert.match(privacyBody(), /GitHub Pages/);
  assert.match(privacyBody(), /local storage/);
  assert.match(privacyBody(), /POPIA|Protection of Personal Information/);
  assert.match(privacyBody(), /inforegulator\.org\.za/);
  assert.match(termsBody(), /Unverified/);
  assert.match(termsBody(), /Republic of South Africa/);
});

test('generated /privacy/ and /terms/ pages load nothing from other sites and are in the sitemap', () => {
  const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  for (const route of ['privacy', 'terms']) {
    const html = page(route);
    assert.match(html, /<link rel="canonical" href="https:\/\/setacareersportal\.abrdns\.com\/[a-z]+\/">/);
    assert.ok(!/<script[^>]*\ssrc=|<link[^>]*rel="stylesheet"|<img[^>]*src="https?:/i.test(html), `${route} loads an external resource`);
    assert.ok(sitemap.includes(`https://setacareersportal.abrdns.com/${route}/`), `${route} missing from sitemap`);
  }
  assert.ok(sitemap.includes(`<loc>https://setacareersportal.abrdns.com/privacy/</loc>\n    <lastmod>${LEGAL_UPDATED}</lastmod>`));
});

test('the interactive footer links to the static policy pages', () => {
  assert.match(index, /<a class="fl-btn" href="\/privacy\/">Privacy Policy<\/a>/);
  assert.match(index, /<a class="fl-btn" href="\/terms\/">Terms of Use<\/a>/);
});
