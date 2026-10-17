#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { opportunityRoutePath, CAT_PATH_MAP, isListedOpportunity } = require('./route-paths');

const ROOT = __dirname;
const BASE = 'https://setacareersportal.abrdns.com';
const DATA_PATH = 'data/opportunities.json';

function read(file) { return fs.readFileSync(path.join(ROOT, file), 'utf8'); }
function loadJSON(file) { return JSON.parse(read(file)); }
// Same date-independent rule the sitemap generator uses (route-paths.js).
const isLiveOpportunity = isListedOpportunity;

// Mirrors AppRouter.pageToPath('detail', o) in index.html via route-paths.js:
// '/{category-plural}/{slug}' (legacy '/opportunity/{id}' only without a slug).
function opportunityHashPath(o) { return `/#${opportunityRoutePath(o)}`; }

function difference(left, right) { return [...left].filter(v => !right.has(v)).sort(); }
function assertNoDiff(label, leftName, left, rightName, right) {
  const missing = difference(left, right);
  if (missing.length) {
    console.error(`❌ ${label}: ${leftName} has entries missing from ${rightName}:`);
    missing.forEach(v => console.error(`   - ${v}`));
    process.exitCode = 1;
  }
}

const indexHTML = read('index.html');
if (!indexHTML.includes("const DATA_BASE='/data'") || !indexHTML.includes("fetchJSON('opportunities.json')")) {
  console.error(`❌ index.html is not configured to load opportunities from /data/opportunities.json.`);
  process.exit(1);
}
if (/const\s+OPPS\s*=\s*\[/.test(indexHTML)) {
  console.error('❌ index.html still contains a hardcoded OPPS array.');
  process.exit(1);
}

const opportunities = loadJSON(DATA_PATH);
const liveHashPaths = new Set(opportunities.filter(isLiveOpportunity).map(opportunityHashPath));
const liveIds = new Set(opportunities.filter(isLiveOpportunity).map(o => o.id));

const duplicateIds = [...liveIds].filter(id =>
  opportunities.filter(o => isLiveOpportunity(o) && o.id === id).length > 1
);
if (duplicateIds.length) {
  console.error('❌ Duplicate live opportunity ids found in data/opportunities.json:');
  duplicateIds.forEach(id => console.error(`   - ${id}`));
  process.exitCode = 1;
}

// Keep route-paths.js in sync with index.html's catPathMap.
const catPathMapSource = indexHTML.match(/const catPathMap=\{([^}]*)\}/);
if (!catPathMapSource) {
  console.error('❌ Could not find catPathMap in index.html to compare with route-paths.js.');
  process.exit(1);
}
const htmlCatMap = Object.fromEntries(
  [...catPathMapSource[1].matchAll(/['"]?([\w-]+)['"]?\s*:\s*'([^']+)'/g)].map(m => [m[1], m[2]])
);
if (JSON.stringify(Object.entries(htmlCatMap).sort()) !== JSON.stringify(Object.entries(CAT_PATH_MAP).sort())) {
  console.error('❌ route-paths.js CAT_PATH_MAP is out of sync with catPathMap in index.html.');
  console.error(`   index.html:     ${JSON.stringify(htmlCatMap)}`);
  console.error(`   route-paths.js: ${JSON.stringify(CAT_PATH_MAP)}`);
  process.exit(1);
}

// Sitemap entries that are opportunity detail pages: canonical
// /{category-plural}/{slug} or the legacy /opportunity/{id}.
const opportunityLocPattern = new RegExp(
  `^/#/(?:${[...Object.values(CAT_PATH_MAP), 'opportunity'].join('|')})/[^/]+$`
);

const sitemap = read('sitemap.xml');
const sitemapHashPaths = new Set(
  [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)]
    .map(m => m[1])
    .filter(loc => loc.startsWith(BASE))
    .map(loc => loc.slice(BASE.length))
    .filter(loc => opportunityLocPattern.test(loc))
);

assertNoDiff('Opportunity sitemap sync', 'data/opportunities.json', liveHashPaths, 'sitemap.xml', sitemapHashPaths);
assertNoDiff('Opportunity sitemap sync', 'sitemap.xml', sitemapHashPaths, 'data/opportunities.json', liveHashPaths);

if (process.exitCode) process.exit(process.exitCode);
console.log(`✅ Content validation passed: ${liveIds.size} live opportunity ids match index.html loader and sitemap.xml.`);
