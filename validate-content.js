#!/usr/bin/env node
/**
 * Validates that canonical opportunity data, the runtime loader in index.html,
 * and generated sitemap.xml agree on live opportunity slugs.
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const BASE = 'https://setacareersportal.abrdns.com';
const TODAY = new Date().toISOString().split('T')[0];
const DATA_PATH = 'data/opportunities.json';

const catPluralMap = {
  learnership: 'learnerships',
  internship: 'internships',
  bursary: 'bursaries',
  apprenticeship: 'apprenticeships',
  tvet: 'tvet-pathways',
};

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function loadJSON(file) {
  return JSON.parse(read(file));
}

function isLiveOpportunity(o) {
  return !o.expired && (!o.closing_date || o.closing_date >= TODAY);
}

function opportunityPath(o) {
  const catPlural = catPluralMap[o.category] || `${o.category}s`;
  return `/${catPlural}/${o.slug}`;
}

function difference(left, right) {
  return [...left].filter(value => !right.has(value)).sort();
}

function assertNoDiff(label, leftName, left, rightName, right) {
  const missing = difference(left, right);
  if (missing.length) {
    console.error(`❌ ${label}: ${leftName} has entries missing from ${rightName}:`);
    missing.forEach(value => console.error(`   - ${value}`));
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
const livePaths = new Set(opportunities.filter(isLiveOpportunity).map(opportunityPath));
const liveSlugs = new Set(opportunities.filter(isLiveOpportunity).map(o => o.slug));

const duplicateSlugs = [...liveSlugs].filter(slug => opportunities.filter(o => isLiveOpportunity(o) && o.slug === slug).length > 1);
if (duplicateSlugs.length) {
  console.error('❌ Duplicate live opportunity slugs found in data/opportunities.json:');
  duplicateSlugs.forEach(slug => console.error(`   - ${slug}`));
  process.exitCode = 1;
}

const sitemap = read('sitemap.xml');
const sitemapPaths = new Set(
  [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)]
    .map(match => match[1])
    .filter(loc => loc.startsWith(BASE))
    .map(loc => loc.slice(BASE.length))
    .filter(loc => /^\/(learnerships|internships|bursaries|apprenticeships|tvet-pathways)\/[^/]+$/.test(loc))
);

assertNoDiff('Opportunity sitemap sync', 'data/opportunities.json', livePaths, 'sitemap.xml', sitemapPaths);
assertNoDiff('Opportunity sitemap sync', 'sitemap.xml', sitemapPaths, 'data/opportunities.json', livePaths);

if (process.exitCode) process.exit(process.exitCode);
console.log(`✅ Content validation passed: ${liveSlugs.size} live opportunity slugs match index.html loader and sitemap.xml.`);
