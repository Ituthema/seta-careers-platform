#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { opportunityRoutePath, CAT_PATH_MAP, isListedOpportunity } = require('./route-paths');

const ROOT = __dirname;
const BASE = 'https://setacareersportal.abrdns.com';
function read(file) { return fs.readFileSync(path.join(ROOT, file), 'utf8'); }
function loadJSON(file) { return JSON.parse(read(file)); }
function fail(message) { console.error('❌ ' + message); process.exitCode = 1; }
function difference(left, right) { return [...left].filter(v => !right.has(v)).sort(); }
function compareSets(label, expected, actual) {
  const missing = difference(expected, actual);
  const extra = difference(actual, expected);
  if (missing.length) fail(label + ': missing entries: ' + missing.join(', '));
  if (extra.length) fail(label + ': unexpected entries: ' + extra.join(', '));
}
function outputFile(route) {
  const clean = route.replace(/^\/+|\/+$/g, '');
  return path.join(ROOT, clean, 'index.html');
}
function canonicalURL(route) {
  return BASE + (route === '/' ? '/' : route.replace(/\/+$/, '') + '/');
}

const indexHTML = read('index.html');
if (!indexHTML.includes("const DATA_BASE='/data'") || !indexHTML.includes("fetchJSON('opportunities.json')")) {
  fail('index.html is not configured to load opportunities from /data/opportunities.json.');
  process.exit(1);
}
if (/const\s+OPPS\s*=\s*\[/.test(indexHTML)) {
  fail('index.html still contains a hardcoded OPPS array.');
  process.exit(1);
}

// Keep the shared route map synchronized with the SPA's legacy-compatible route map.
const catPathMapSource = indexHTML.match(/const catPathMap=\{([^}]*)\}/);
if (!catPathMapSource) {
  fail('Could not find catPathMap in index.html to compare with route-paths.js.');
  process.exit(1);
}
const htmlCatMap = Object.fromEntries(
  [...catPathMapSource[1].matchAll(/['"]?([\w-]+)['"]?\s*:\s*'([^']+)'/g)].map(m => [m[1], m[2]])
);
if (JSON.stringify(Object.entries(htmlCatMap).sort()) !== JSON.stringify(Object.entries(CAT_PATH_MAP).sort())) {
  fail('route-paths.js CAT_PATH_MAP is out of sync with catPathMap in index.html.');
  console.error('   index.html:     ' + JSON.stringify(htmlCatMap));
  console.error('   route-paths.js: ' + JSON.stringify(CAT_PATH_MAP));
  process.exit(1);
}

const opportunities = loadJSON('data/opportunities.json');
const guides = loadJSON('data/guides.json');
const live = opportunities.filter(isListedOpportunity);
const expectedOpportunityPaths = new Set(live.map(opportunityRoutePath));
const expectedGuidePaths = new Set(guides.map(g => '/guides/' + encodeURIComponent(g.id)));
const provinces = loadJSON('data/provinces.json');
const expectedInfoPaths = new Set(['/calendar', '/provinces', '/tools', '/about', ...provinces.map(p => '/provinces/' + encodeURIComponent(p.id))]);
const expectedCategoryPaths = new Set(live.map(o => '/' + (CAT_PATH_MAP[o.category] || (o.category + 's'))));

const sitemap = read('sitemap.xml');
const locs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
const sitemapPaths = new Set();
for (const loc of locs) {
  let url;
  try { url = new URL(loc); } catch (_) { fail('Invalid sitemap URL: ' + loc); continue; }
  if (url.hash) fail('Sitemap URL contains a hash fragment: ' + loc);
  if (url.origin !== BASE) fail('Sitemap URL uses an unexpected origin: ' + loc);
  sitemapPaths.add(url.pathname.replace(/\/+$/, '') || '/');
}

const opportunityPattern = new RegExp('^/(?:' + Object.values(CAT_PATH_MAP).join('|') + ')/[^/]+$');
const sitemapOpportunityPaths = new Set([...sitemapPaths].filter(p => opportunityPattern.test(p)));
const sitemapGuidePaths = new Set([...sitemapPaths].filter(p => /^\/guides\/[^/]+$/.test(p)));
const sitemapCategoryPaths = new Set([...sitemapPaths].filter(p => /^\/(?:learnerships|internships|bursaries|apprenticeships|tvet-pathways|jobs)$/.test(p)));

compareSets('Opportunity sitemap sync', expectedOpportunityPaths, sitemapOpportunityPaths);
compareSets('Guide sitemap sync', expectedGuidePaths, sitemapGuidePaths);
compareSets('Category sitemap sync', expectedCategoryPaths, sitemapCategoryPaths);
compareSets('Info page sitemap sync', expectedInfoPaths, new Set([...sitemapPaths].filter(p => /^\/(?:calendar|provinces|tools|about)(?:\/[^/]+)?$/.test(p))));

for (const route of [...expectedOpportunityPaths, ...expectedGuidePaths, ...expectedCategoryPaths, ...expectedInfoPaths, '/guides']) {
  const file = outputFile(route);
  if (!fs.existsSync(file)) {
    fail('Missing generated static page for ' + route + ' (' + path.relative(ROOT, file) + '). Run npm run sitemap.');
    continue;
  }
  const html = fs.readFileSync(file, 'utf8');
  if (!html.includes('<!-- GENERATED SEO PAGE: OpportunitiesZA -->')) fail('Generated-page marker missing from ' + path.relative(ROOT, file));
  if (!html.includes('<link rel="canonical" href="' + canonicalURL(route) + '">')) fail('Incorrect or missing canonical URL for ' + route);
  if (!/<title>[^<]+<\/title>/.test(html)) fail('Missing page title for ' + route);
  if (!/<meta name="description" content="[^"]+">/.test(html)) fail('Missing meta description for ' + route);
}

// Share-preview image: the file must exist and index.html must point at it.
if (!fs.existsSync(path.join(ROOT, 'assets/og-image.png'))) fail('Missing assets/og-image.png (referenced by og:image).');
if (!read('index.html').includes('<meta property="og:image" content="' + BASE + '/assets/og-image.png">')) fail('index.html is missing the og:image tag for assets/og-image.png.');

if (process.exitCode) process.exit(process.exitCode);
console.log('✅ SEO route validation passed: ' + expectedOpportunityPaths.size + ' opportunity pages, ' +
  expectedCategoryPaths.size + ' category pages, ' + guides.length + ' guide pages and ' + expectedInfoPaths.size + ' info pages use crawlable, canonical URLs.');
