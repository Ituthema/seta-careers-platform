'use strict';

// One level of link following for the crawler.
//
// The registry points at LISTING pages (a careers page, a "learnerships" index). Their closing dates
// are normally on the individual advert pages those listings link to, so reading only the listing
// page finds links but almost never a usable date. This picks a few opportunity-looking links per
// source so the crawler can fetch those advert pages too.
//
// Deliberately conservative, because it fetches third-party sites:
//   - same website only (the link's host must match the page's host or be a subdomain of it);
//   - the URL must look like an opportunity (learnership, bursary, internship, apprentice, vacancy ...);
//   - no images, archives or office documents; PDFs are allowed (the crawler can parse them);
//   - at most `perSource` links per source and `total` overall, and never the same URL twice;
//   - the normal fetch rules still apply (robots.txt, private-network guard, size cap).
// Pure functions: no network or file access, so they are unit-tested without dependencies.

const OPPORTUNITY_URL = /learnership|bursar|scholarship|internship|apprentice|artisan|vacanc|early-?careers|graduate|trainee|tvet|work-?integrated|\byes\b/i;
const SKIP_EXTENSION = /\.(?:jpe?g|png|gif|webp|svg|ico|zip|rar|7z|docx?|xlsx?|pptx?|mp[34]|avi|mov|css|js|xml|rss)$/i;

const DEFAULTS = Object.freeze({ enabled: true, perSource: 3, total: 120 });

function normalise(rawUrl) {
  try {
    const u = new URL(rawUrl);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    u.hash = '';
    u.hostname = u.hostname.toLowerCase();
    return u;
  } catch {
    return null;
  }
}

function bareHost(host) {
  return String(host || '').replace(/^www\./, '');
}

// Same site if hosts are equal or one is a subdomain of the other (www ignored).
function sameSite(a, b) {
  const x = bareHost(a);
  const y = bareHost(b);
  return x === y || x.endsWith('.' + y) || y.endsWith('.' + x);
}

// Prefer links that look like one specific advert: a year, an id/number, a deeper path.
function score(url) {
  const path = url.pathname;
  let s = 0;
  if (/20\d{2}/.test(path + url.search)) s += 3;
  s += Math.min(3, (path.match(/\d+/g) || []).length); // each number (id, reference, year) suggests a single advert
  s += Math.min(3, path.split('/').filter(Boolean).length - 1);
  if (/\.pdf$/i.test(path)) s += 1;
  return s;
}

function key(url) {
  return url.toString().replace(/\/$/, '').toLowerCase();
}

// stagedRecords: crawler staging records ({ source_id, source_name, url, metadata: { links } }).
// Returns [{ source_id, source_name, url, parent_url }].
function selectFollowLinks(stagedRecords, options = {}) {
  const opts = { ...DEFAULTS, ...options };
  if (!opts.enabled) return [];
  const seen = new Set((stagedRecords || []).map((r) => normalise(r.url)).filter(Boolean).map(key));
  const out = [];

  for (const record of Array.isArray(stagedRecords) ? stagedRecords : []) {
    if (out.length >= opts.total) break;
    if (record.depth) continue; // never follow links from a followed page: one level only
    const page = normalise(record.url);
    const links = record.metadata && Array.isArray(record.metadata.links) ? record.metadata.links : [];
    if (!page) continue;

    const picks = [];
    for (const link of links) {
      const url = normalise(link);
      if (!url || !sameSite(url.hostname, page.hostname)) continue;
      if (SKIP_EXTENSION.test(url.pathname)) continue;
      if (!OPPORTUNITY_URL.test(url.pathname + url.search)) continue;
      const k = key(url);
      if (seen.has(k) || picks.some((p) => p.k === k)) continue;
      picks.push({ k, url, score: score(url) });
    }
    picks.sort((a, b) => b.score - a.score || a.k.localeCompare(b.k));
    for (const pick of picks.slice(0, opts.perSource)) {
      if (out.length >= opts.total) break;
      seen.add(pick.k);
      out.push({ source_id: record.source_id, source_name: record.source_name, url: pick.url.toString(), parent_url: record.url });
    }
  }
  return out;
}

module.exports = { selectFollowLinks, sameSite, DEFAULTS };
