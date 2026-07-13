/**
 * OpportunitiesZA — Sitemap Generator
 * Generates hash-based URLs matching the SPA's actual router in index.html.
 * Run: node sitemap-generator.js
 */

const fs   = require('fs');
const path = require('path');

const BASE = 'https://opportunitiesza.co.za';
const DEFAULT_LASTMOD = '2026-05-01';
const TODAY = new Date().toISOString().slice(0, 10);

function isLiveOpportunity(o) {
  return !o.expired && (!o.closing_date || o.closing_date >= TODAY);
}

// Hash routes actually implemented by AppRouter in index.html.
// NOTE: no per-province routes exist — province filtering is client-side
// state on /directory, not a distinct route — so they are NOT listed here.
const STATIC = [
  { loc: '/',                       priority: '1.0', freq: 'daily'   },
  { loc: '/directory',              priority: '0.9', freq: 'daily'   },
  { loc: '/directory/learnership',  priority: '0.9', freq: 'daily'   },
  { loc: '/directory/bursary',      priority: '0.9', freq: 'daily'   },
  { loc: '/directory/internship',   priority: '0.9', freq: 'daily'   },
  { loc: '/directory/apprenticeship', priority: '0.9', freq: 'daily' },
  { loc: '/calendar',               priority: '0.8', freq: 'daily'   },
  { loc: '/tools',                  priority: '0.8', freq: 'weekly'  },
  { loc: '/eligibility',            priority: '0.7', freq: 'monthly' },
  { loc: '/scam',                   priority: '0.7', freq: 'monthly' },
  { loc: '/checklist',              priority: '0.7', freq: 'monthly' },
  { loc: '/bursary-checker',        priority: '0.7', freq: 'monthly' },
  { loc: '/guides',                 priority: '0.8', freq: 'weekly'  },
  { loc: '/provinces',              priority: '0.7', freq: 'weekly'  },
  { loc: '/about',                  priority: '0.4', freq: 'monthly' },
];

function loadJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, file), 'utf8'));
  } catch (e) {
    console.warn(`⚠️  Could not load ${file}: ${e.message}`);
    return [];
  }
}

const opps   = loadJSON('data/opportunities.json');
const guides = loadJSON('data/guides.json');

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Converts a router-style path ("/opportunity/001") into the real,
// crawlable URL the app responds to ("BASE/#/opportunity/001").
// Hash fragments are never sent to the server, so GitHub Pages always
// serves index.html for these — no 404/redirect dance needed.
function hashUrl(routerPath) {
  return `${BASE}/#${routerPath}`;
}

function urlEntry({ loc, priority, freq, lastmod }) {
  return `  <url>
    <loc>${escapeXml(hashUrl(loc))}</loc>
    <lastmod>${lastmod || DEFAULT_LASTMOD}</lastmod>
    <changefreq>${freq || 'weekly'}</changefreq>
    <priority>${priority || '0.6'}</priority>
  </url>`;
}

let urls = [];

STATIC.forEach(p => urls.push(urlEntry(p)));

// Opportunity detail pages — router keys by numeric `id`, NOT by slug/category.
opps
  .filter(isLiveOpportunity)
  .forEach(o => {
    urls.push(urlEntry({
      loc:      `/opportunity/${o.id}`,
      priority: o.featured ? '0.8' : '0.7',
      freq:     'weekly',
      lastmod:  o.updated_date || DEFAULT_LASTMOD,
    }));
  });

// Guide pages — router keys by guide `id` ("g001"), NOT by slug.
guides.forEach(g => {
  urls.push(urlEntry({
    loc:      `/guides/${g.id}`,
    priority: '0.8',
    freq:     'monthly',
    lastmod:  g.updated_date || DEFAULT_LASTMOD,
  }));
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

${urls.join('\n\n')}

</urlset>
`;

fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), xml, 'utf8');

console.log(`\n✅ sitemap.xml generated successfully`);
console.log(`   Static pages:      ${STATIC.length}`);
console.log(`   Opportunity pages: ${opps.filter(isLiveOpportunity).length}`);
console.log(`   Guide pages:       ${guides.length}`);
console.log(`   Total URLs:        ${urls.length}\n`);
