#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const BASE = 'https://opportunitiesza.co.za';
const TODAY = new Date().toISOString().split('T')[0];
const DATA_PATH = 'data/opportunities.json';

function read(file) { return fs.readFileSync(path.join(ROOT, file), 'utf8'); }
function loadJSON(file) { return JSON.parse(read(file)); }
function isLiveOpportunity(o) { return !o.expired && (!o.closing_date || o.closing_date >= TODAY); }

// Matches AppRouter.pageToPath('detail', o) → '/opportunity/{id}'
function opportunityHashPath(o) { return `/#/opportunity/${o.id}`; }

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

const sitemap = read('sitemap.xml');
const sitemapHashPaths = new Set(
  [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)]
    .map(m => m[1])
    .filter(loc => loc.startsWith(BASE))
    .map(loc => loc.slice(BASE.length))
    .filter(loc => /^\/#\/opportunity\/[^/]+$/.test(loc))
);

assertNoDiff('Opportunity sitemap sync', 'data/opportunities.json', liveHashPaths, 'sitemap.xml', sitemapHashPaths);
assertNoDiff('Opportunity sitemap sync', 'sitemap.xml', sitemapHashPaths, 'data/opportunities.json', liveHashPaths);

if (process.exitCode) process.exit(process.exitCode);
console.log(`✅ Content validation passed: ${liveIds.size} live opportunity ids match index.html loader and sitemap.xml.`);
