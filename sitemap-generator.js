/**
 * OpportunitiesZA — Sitemap Generator
 * Run from project root: node sitemap-generator.js
 * Reads opportunities.json and guides.json, outputs sitemap.xml
 *
 * Usage from Termux:
 *   cd /storage/emulated/0/Download/opportunitiesza
 *   node sitemap-generator.js
 *   git add sitemap.xml && git commit -m "Update sitemap" && git push
 */

const fs   = require('fs');
const path = require('path');

// ── CONFIG — update BASE to your real domain ──────────────────
const BASE = 'https://opportunitiesza.co.za';
const TODAY = new Date().toISOString().split('T')[0];

function isLiveOpportunity(o) {
  return !o.expired && (!o.closing_date || o.closing_date >= TODAY);
}

// ── STATIC PAGES ──────────────────────────────────────────────
const STATIC = [
  { loc: '/',                  priority: '1.0', freq: 'daily'   },
  { loc: '/learnerships/',     priority: '0.9', freq: 'daily'   },
  { loc: '/bursaries/',        priority: '0.9', freq: 'daily'   },
  { loc: '/internships/',      priority: '0.9', freq: 'daily'   },
  { loc: '/apprenticeships/',  priority: '0.9', freq: 'daily'   },
  { loc: '/opportunities/',    priority: '0.8', freq: 'daily'   },
  { loc: '/calendar/',         priority: '0.8', freq: 'daily'   },
  { loc: '/tools/',            priority: '0.8', freq: 'weekly'  },
  { loc: '/tools/eligibility/',priority: '0.7', freq: 'monthly' },
  { loc: '/tools/scam/',       priority: '0.7', freq: 'monthly' },
  { loc: '/tools/checklist/',  priority: '0.7', freq: 'monthly' },
  { loc: '/seta-guides/',      priority: '0.8', freq: 'weekly'  },
  { loc: '/career-advice/',    priority: '0.7', freq: 'weekly'  },
  { loc: '/provinces/',        priority: '0.7', freq: 'weekly'  },
  { loc: '/about/',            priority: '0.4', freq: 'monthly' },
  // Province sub-pages
  { loc: '/learnerships/gauteng/',       priority: '0.7', freq: 'weekly' },
  { loc: '/learnerships/western-cape/',  priority: '0.7', freq: 'weekly' },
  { loc: '/learnerships/kwazulu-natal/', priority: '0.7', freq: 'weekly' },
  { loc: '/bursaries/gauteng/',          priority: '0.7', freq: 'weekly' },
  { loc: '/bursaries/western-cape/',     priority: '0.7', freq: 'weekly' },
  { loc: '/internships/gauteng/',        priority: '0.7', freq: 'weekly' },
];

// ── LOAD DATA FILES ───────────────────────────────────────────
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

// ── BUILD XML ─────────────────────────────────────────────────
function urlEntry({ loc, priority, freq, lastmod }) {
  return `  <url>
    <loc>${BASE}${loc}</loc>
    <lastmod>${lastmod || TODAY}</lastmod>
    <changefreq>${freq || 'weekly'}</changefreq>
    <priority>${priority || '0.6'}</priority>
  </url>`;
}

let urls = [];

// Static pages
STATIC.forEach(p => urls.push(urlEntry(p)));

// Opportunity detail pages
const catPluralMap = {
  learnership: 'learnerships',
  internship: 'internships',
  bursary: 'bursaries',
  apprenticeship: 'apprenticeships',
  tvet: 'tvet-pathways',
};

opps
  .filter(isLiveOpportunity)
  .forEach(o => {
    const catPlural = catPluralMap[o.category] || (o.category + 's');
    urls.push(urlEntry({
      loc:     `/${catPlural}/${o.slug}`,
      priority: o.featured ? '0.8' : '0.7',
      freq:    'weekly',
      lastmod:  o.updated_date || TODAY,
    }));
  });

// Guide pages
const guideCatMap = {
  'seta-guides':    'seta-guides',
  'career-advice':  'career-advice',
};

guides.forEach(g => {
  const cat = guideCatMap[g.category] || 'seta-guides';
  urls.push(urlEntry({
    loc:     `/${cat}/${g.slug}`,
    priority: '0.8',
    freq:    'monthly',
    lastmod:  g.updated_date || TODAY,
  }));
});

// ── WRITE SITEMAP ─────────────────────────────────────────────
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

${urls.join('\n\n')}

</urlset>`;

fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), xml, 'utf8');

console.log(`\n✅ sitemap.xml generated successfully`);
console.log(`   Static pages:     ${STATIC.length}`);
console.log(`   Opportunity pages: ${opps.filter(isLiveOpportunity).length}`);
console.log(`   Guide pages:       ${guides.length}`);
console.log(`   Total URLs:        ${urls.length}`);
console.log(`\n📋 Next steps:`);
console.log(`   git add sitemap.xml`);
console.log(`   git commit -m "Update sitemap — ${TODAY}"`);
console.log(`   git push\n`);
