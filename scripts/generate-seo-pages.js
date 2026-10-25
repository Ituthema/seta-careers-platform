#!/usr/bin/env node
/**
 * Build crawlable, static SEO landing pages for GitHub Pages.
 *
 * Generated routes are real directory/index.html files, not hash fragments.
 * Only pages with the marker below are replaced or removed by this script.
 */
const fs = require('fs');
const path = require('path');
const { opportunityRoutePath, CAT_PATH_MAP, isListedOpportunity } = require('../route-paths');

const ROOT = path.resolve(__dirname, '..');
const BASE = 'https://setacareersportal.abrdns.com';
const OUTPUT_ROOTS = [...new Set([...Object.values(CAT_PATH_MAP), 'guides'])];

function readJSON(file) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
}
function escapeHTML(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
  });
}
function safeHttpURL(value) {
  try {
    const parsed = new URL(String(value || ''));
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.href : '';
  } catch (_) {
    return '';
  }
}
function dateText(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return 'Not specified';
  return new Date(value + 'T00:00:00Z').toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
  });
}
function pagePath(file) {
  return path.join(ROOT, file, 'index.html');
}
function routeURL(route) {
  return BASE + (route === '/' ? '/' : route.replace(/\/+$/, '') + '/');
}
function ensureTrailingSlash(route) {
  return route === '/' ? '/' : route.replace(/\/+$/, '') + '/';
}
function writePage(route, html) {
  const output = pagePath(route.replace(/^\/+|\/+$/g, ''));
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, html, 'utf8');
}
function removeOldGeneratedPages() {
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === 'index.html') {
        const existing = fs.readFileSync(full, 'utf8');
        if (existing.includes('<!-- GENERATED SEO PAGE: OpportunitiesZA -->')) fs.unlinkSync(full);
      }
    }
    try {
      if (dir !== ROOT && fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
    } catch (_) {}
  }
  OUTPUT_ROOTS.forEach(function (name) { walk(path.join(ROOT, name)); });
}
// JSON-LD must not be able to close its own <script> element.
function jsonLd(objects) {
  return (objects || []).map(function (object) {
    return '<script type="application/ld+json">' + JSON.stringify(object).replace(/</g, '\\u003c') + '</script>\n';
  }).join('');
}
function breadcrumbLd(crumbs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map(function (crumb, index) {
      return { '@type': 'ListItem', position: index + 1, name: crumb[0], item: BASE + crumb[1] };
    })
  };
}
function baseLayout(options) {
  const title = escapeHTML(options.title);
  const description = escapeHTML(options.description);
  const canonical = routeURL(options.route);
  return '<!doctype html>\n<html lang="en">\n<head>\n' +
    '<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n' +
    '<title>' + title + '</title>\n<meta name="description" content="' + description + '">\n' +
    '<link rel="canonical" href="' + escapeHTML(canonical) + '">\n' +
    '<meta property="og:type" content="website">\n<meta property="og:title" content="' + title + '">\n' +
    '<meta property="og:description" content="' + description + '">\n<meta property="og:url" content="' + escapeHTML(canonical) + '">\n' +
    '<meta property="og:site_name" content="OpportunitiesZA">\n<meta property="og:locale" content="en_ZA">\n<meta name="twitter:card" content="summary">\n' +
    '<meta name="robots" content="index,follow">\n' + jsonLd(options.jsonld) +
    '<style>*,*::before,*::after{box-sizing:border-box}body{margin:0;background:#fafaf9;color:#1a1a1a;font:16px/1.7 system-ui,-apple-system,sans-serif}header,main,footer{max-width:900px;margin:auto;padding:20px}header{border-bottom:1px solid #e5e7eb;background:#fff}header a,.back{color:#0d4a26;text-decoration:none;font-weight:700}.brand{font-weight:900;font-size:1.2rem}main{padding-top:36px;padding-bottom:56px}h1,h2,h3{line-height:1.2}h1{font-size:clamp(2rem,5vw,3rem);letter-spacing:-.04em}h2{margin-top:32px;font-size:1.4rem}.muted{color:#596579}.meta{display:flex;flex-wrap:wrap;gap:8px;margin:18px 0}.pill{display:inline-block;background:#dcfce7;color:#166534;padding:4px 10px;border-radius:20px;font-size:.85rem;font-weight:700}.card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:18px;margin:14px 0}.btn{display:inline-block;background:#0d4a26;color:#fff;text-decoration:none;font-weight:700;padding:11px 16px;border-radius:8px;margin:8px 8px 8px 0}.btn.secondary{background:#f3f4f6;color:#0d4a26}.list{padding-left:22px}.empty{background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:16px}footer{border-top:1px solid #e5e7eb;color:#596579;font-size:.9rem}a{overflow-wrap:anywhere}</style>\n</head>\n<body>\n<!-- GENERATED SEO PAGE: OpportunitiesZA -->\n<header><a class="brand" href="/">OpportunitiesZA</a> <span class="muted">· South African career opportunities</span></header>\n<main>' + options.body + '</main>\n<footer><a href="/">Home</a> · <a href="/#/">Open interactive website</a> · Check every application deadline and eligibility requirement with the official provider.</footer>\n</body>\n</html>\n';
}
function listItems(items) {
  if (!items || !items.length) return '<p class="muted">Not specified by the listing.</p>';
  return '<ul class="list">' + items.map(function (item) { return '<li>' + escapeHTML(item) + '</li>'; }).join('') + '</ul>';
}
function guideBodyToSafeParagraphs(html) {
  // Content is rendered as escaped text; no source HTML or attributes are emitted.
  const chunks = String(html || '').split(/<\/(?:p|h[1-6]|li|blockquote)>/i);
  const paragraphs = chunks.map(function (chunk) {
    return chunk.replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;|&apos;/gi, "'")
      .replace(/\s+/g, ' ').trim();
  }).filter(Boolean);
  return paragraphs.map(function (text) { return '<p>' + escapeHTML(text) + '</p>'; }).join('\n');
}
function lastmod(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) ? value : '';
}

const opportunities = readJSON('data/opportunities.json');
const guides = readJSON('data/guides.json');
const live = opportunities.filter(isListedOpportunity);
const sitemapEntries = [{ route: '/', updated: '' }];
const categoryLabels = {
  learnerships: 'Learnerships',
  internships: 'Internships',
  bursaries: 'Bursaries',
  apprenticeships: 'Apprenticeships',
  'tvet-pathways': 'TVET Pathways'
};
removeOldGeneratedPages();

const liveCategories = [...new Set(live.map(function (o) {
  return CAT_PATH_MAP[o.category] || (o.category + 's');
}))].sort();

liveCategories.forEach(function (categoryPath) {
  const items = live.filter(function (o) {
    return (CAT_PATH_MAP[o.category] || (o.category + 's')) === categoryPath;
  }).sort(function (a, b) { return String(a.closing_date).localeCompare(String(b.closing_date)); });
  const label = categoryLabels[categoryPath] || categoryPath;
  const cards = items.map(function (o) {
    const route = opportunityRoutePath(o);
    return '<article class="card"><h2><a href="' + escapeHTML(ensureTrailingSlash(route)) + '">' + escapeHTML(o.title) + '</a></h2>' +
      '<p>' + escapeHTML(o.description) + '</p><p class="muted">' + escapeHTML(o.province) + ' · ' +
      escapeHTML(o.qualification_level) + ' · Closing ' + escapeHTML(dateText(o.closing_date)) + '</p></article>';
  }).join('\n');
  const route = '/' + categoryPath;
  const updated = items.map(function (o) { return o.updated_date || ''; }).sort().pop() || '';
  writePage(route, baseLayout({
    route: route,
    title: label + ' in South Africa | OpportunitiesZA',
    jsonld: [breadcrumbLd([['Home', '/'], [label, '/' + categoryPath + '/']])],
    description: 'Browse current ' + label.toLowerCase() + ' opportunities in South Africa, with eligibility details, closing dates, and official application links.',
    body: '<nav class="muted"><a href="/">Home</a> / ' + escapeHTML(label) + '</nav><h1>' + escapeHTML(label) + ' in South Africa</h1>' +
      '<p>Current listings are shown below. Confirm eligibility, deadlines, and application instructions with the official provider before applying.</p>' +
      (cards || '<div class="empty">There are no listings in this category right now. Check the official provider websites and return for updates.</div>') +
      '<p><a class="btn secondary" href="/guides/">Read career guides</a></p>'
  }));
  sitemapEntries.push({ route: route, updated: updated });
});

live.forEach(function (o) {
  const route = opportunityRoutePath(o);
  const applicationURL = safeHttpURL(o.application_url);
  const sourceURL = safeHttpURL(o.source_url);
  const body = '<nav class="muted"><a href="/">Home</a> / <a href="/' + escapeHTML(CAT_PATH_MAP[o.category] || (o.category + 's')) + '/">' +
    escapeHTML(categoryLabels[CAT_PATH_MAP[o.category] || (o.category + 's')] || o.category) + '</a></nav>' +
    '<h1>' + escapeHTML(o.title) + '</h1>' +
    '<div class="meta"><span class="pill">' + escapeHTML(o.category) + '</span><span class="pill">' + escapeHTML(o.province) + '</span></div>' +
    '<p>' + escapeHTML(o.description) + '</p>' +
    '<section class="card"><h2>Opportunity details</h2><p><strong>Sector / SETA:</strong> ' + escapeHTML(o.sector) + '</p>' +
    '<p><strong>Minimum qualification:</strong> ' + escapeHTML(o.qualification_level) + '</p><p><strong>Stipend / funding:</strong> ' + escapeHTML(o.stipend) + '</p>' +
    '<p><strong>Closing date:</strong> ' + escapeHTML(dateText(o.closing_date)) + '</p><p><strong>Posted:</strong> ' + escapeHTML(dateText(o.posted_date)) + '</p>' +
    '<p><strong>Last updated:</strong> ' + escapeHTML(dateText(o.updated_date)) + '</p></section>' +
    '<h2>Eligibility</h2>' + listItems(o.eligibility) + '<h2>Documents to prepare</h2>' + listItems(o.documents_needed) +
    '<p>' + (applicationURL ? '<a class="btn" rel="nofollow noopener" href="' + escapeHTML(applicationURL) + '">Visit official application page</a>' : '') +
    (sourceURL ? '<a class="btn secondary" rel="nofollow noopener" href="' + escapeHTML(sourceURL) + '">Check source</a>' : '') + '</p>' +
    '<p class="muted">Listing status and closing dates can change. Confirm the current vacancy and instructions directly with ' + escapeHTML(o.source_name || 'the provider') + '.</p>';
  const description = String(o.description || '').replace(/\s+/g, ' ').slice(0, 155);
  writePage(route, baseLayout({
    route: route,
    title: (o.title || 'Career opportunity') + ' | OpportunitiesZA',
    description: description,
    jsonld: [breadcrumbLd([['Home', '/'], [categoryLabels[CAT_PATH_MAP[o.category] || (o.category + 's')] || o.category, '/' + (CAT_PATH_MAP[o.category] || (o.category + 's')) + '/'], [o.title || 'Career opportunity', route + '/']])],
    body: body
  }));
  sitemapEntries.push({ route: route, updated: o.updated_date || '' });
});

const guideCards = guides.map(function (g) {
  return '<article class="card"><h2><a href="/guides/' + encodeURIComponent(g.id) + '/">' + escapeHTML(g.title) + '</a></h2>' +
    '<p>' + escapeHTML(g.intro) + '</p><p class="muted">' + escapeHTML(g.read_time || g.read || '') + ' · Updated ' + escapeHTML(dateText(g.updated_date)) + '</p></article>';
}).join('\n');
writePage('/guides', baseLayout({
  route: '/guides',
  title: 'SETA Guides and Career Advice | OpportunitiesZA',
  description: 'Plain-language guides to SETAs, learnerships, bursaries, applications, and career preparation in South Africa.',
  jsonld: [breadcrumbLd([['Home', '/'], ['Guides', '/guides/']])],
  body: '<nav class="muted"><a href="/">Home</a> / Guides</nav><h1>SETA Guides &amp; Career Advice</h1><p>Practical information for South African job seekers, learners, and students.</p>' + guideCards
}));
sitemapEntries.push({ route: '/guides', updated: guides.map(function (g) { return g.updated_date || ''; }).sort().pop() || '' });

guides.forEach(function (g) {
  const route = '/guides/' + encodeURIComponent(g.id);
  const faq = (g.faq || []).map(function (item) {
    return '<section class="card"><h3>' + escapeHTML(item.q) + '</h3><p>' + escapeHTML(item.a) + '</p></section>';
  }).join('\n');
  writePage(route, baseLayout({
    route: route,
    title: (g.meta_title || g.title) + ' | OpportunitiesZA',
    description: g.meta_description || g.intro,
    jsonld: [
      breadcrumbLd([['Home', '/'], ['Guides', '/guides/'], [g.title, route + '/']]),
      Object.assign({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: g.title,
        description: g.meta_description || g.intro,
        mainEntityOfPage: BASE + route + '/',
        publisher: { '@type': 'Organization', name: 'OpportunitiesZA', url: BASE + '/' }
      }, g.updated_date ? { dateModified: g.updated_date } : {}),
      ...((g.faq || []).length ? [{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: g.faq.map(function (item) {
          return { '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } };
        })
      }] : [])
    ],
    body: '<nav class="muted"><a href="/">Home</a> / <a href="/guides/">Guides</a></nav><h1>' + escapeHTML(g.title) + '</h1>' +
      '<p class="muted">' + escapeHTML(g.read_time || g.read || '') + ' · Updated ' + escapeHTML(dateText(g.updated_date)) + '</p>' +
      '<section class="card"><p>' + escapeHTML(g.intro) + '</p></section>' + guideBodyToSafeParagraphs(g.body) +
      (faq ? '<h2>Frequently asked questions</h2>' + faq : '') +
      '<p><a class="btn" href="/#/">Browse opportunities</a></p>'
  }));
  sitemapEntries.push({ route: route, updated: g.updated_date || '' });
});

function xmlEscape(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
const urls = sitemapEntries.map(function (entry) {
  const loc = routeURL(entry.route);
  const date = lastmod(entry.updated);
  return '  <url>\n    <loc>' + xmlEscape(loc) + '</loc>' + (date ? '\n    <lastmod>' + date + '</lastmod>' : '') + '\n  </url>';
});
const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.join('\n') + '\n</urlset>\n';
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap, 'utf8');

console.log('Generated crawlable SEO pages and sitemap.');
console.log('  Active opportunity pages: ' + live.length);
console.log('  Category landing pages: ' + liveCategories.length);
console.log('  Guide pages: ' + guides.length);
console.log('  Sitemap URLs: ' + sitemapEntries.length);
