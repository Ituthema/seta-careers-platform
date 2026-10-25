'use strict';

// Turns staged page snapshots into review candidates.
//
// The crawler stages whole pages (title, text, links), not structured listings.
// This step looks for opportunity-like links and text mentions so a human can
// decide what to publish. It never writes to data/opportunities.json: a
// candidate is a lead to check against the official page, not a listing.

const CATEGORY_PATTERNS = [
  ['learnership', /learnership/i],
  ['bursary', /bursar|scholarship/i],
  ['internship', /internship|intern\b|work[- ]integrated|\byes\b/i],
  ['apprenticeship', /apprentice|artisan/i],
  ['tvet', /\btvet\b/i],
];

const MONTHS = {
  january: 1, jan: 1, february: 2, feb: 2, march: 3, mar: 3, april: 4, apr: 4, may: 5, june: 6, jun: 6,
  july: 7, jul: 7, august: 8, aug: 8, september: 9, sep: 9, sept: 9, october: 10, oct: 10,
  november: 11, nov: 11, december: 12, dec: 12,
};
const MONTH_RE = Object.keys(MONTHS).sort((a, b) => b.length - a.length).join('|');
const DATE_PATTERNS = [
  // 31 October 2026, 31st Oct 2026
  { re: new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(${MONTH_RE})\\.?,?\\s+(20\\d{2})\\b`, 'gi'), parts: (m) => [m[3], MONTHS[m[2].toLowerCase()], m[1]] },
  // October 31, 2026
  { re: new RegExp(`\\b(${MONTH_RE})\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s+(20\\d{2})\\b`, 'gi'), parts: (m) => [m[3], MONTHS[m[1].toLowerCase()], m[2]] },
  // 2026-10-31
  { re: /\b(20\d{2})-(\d{2})-(\d{2})\b/g, parts: (m) => [m[1], Number(m[2]), Number(m[3])] },
];
const CLOSING_WORDS = /clos(?:e|es|ed|ing)|deadline|apply\s+(?:by|before)|applications?\s+(?:end|until)|no\s+later\s+than|until/i;

function pad(n) { return String(n).padStart(2, '0'); }

function toIso(year, month, day) {
  const y = Number(year); const m = Number(month); const d = Number(day);
  if (!m || m < 1 || m > 12 || d < 1 || d > 31) return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  return `${y}-${pad(m)}-${pad(d)}`;
}

function categoryOf(text) {
  const hit = CATEGORY_PATTERNS.find(([, re]) => re.test(text));
  return hit ? hit[0] : null;
}

// Dates that sit close to a "closing / deadline" word. Unlabelled dates are ignored:
// a posting date or an event date must not be mistaken for a deadline.
function closingDates(text) {
  const found = new Set();
  for (const { re, parts } of DATE_PATTERNS) {
    re.lastIndex = 0;
    let match;
    while ((match = re.exec(text)) !== null) {
      const near = text.slice(Math.max(0, match.index - 60), match.index + match[0].length + 20);
      if (!CLOSING_WORDS.test(near)) continue;
      const [y, mo, d] = parts(match);
      const iso = toIso(y, mo, d);
      if (iso) found.add(iso);
    }
  }
  return [...found].sort();
}

const LINK_KEYWORDS = /learnership|bursar|scholarship|internship|apprentice|graduate|artisan|tvet|vacanc|opportunit|early-careers|youth|\byes\b/i;

function linkCandidates(record) {
  const links = Array.isArray(record.metadata && record.metadata.links) ? record.metadata.links : [];
  const out = [];
  for (const url of links) {
    let parsed;
    try { parsed = new URL(url); } catch { continue; }
    const path = parsed.pathname + parsed.search;
    if (url === record.url || !LINK_KEYWORDS.test(path)) continue;
    out.push({ url, category: categoryOf(path) });
  }
  return out;
}

function mentionCandidates(record, limit = 50) {
  const lines = String(record.text || '').split('\n');
  const seen = new Set();
  const out = [];
  for (let i = 0; i < lines.length && out.length < limit; i += 1) {
    const line = lines[i].trim();
    if (!line || line.length > 300) continue;
    const category = categoryOf(line);
    if (!category) continue;
    const key = line.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    // The closing date is often on the next line or two ("Closing date: ...").
    const context = [line, lines[i + 1] || '', lines[i + 2] || ''].join(' ');
    out.push({ category, line, closing_dates: closingDates(context) });
  }
  return out;
}

function today(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Johannesburg' }).format(now);
}

function extractCandidates(record, now = new Date()) {
  const cutoff = today(now);
  const mentions = mentionCandidates(record).map((m) => ({
    ...m,
    // A date in the past means the page is stale or describes a closed window.
    status: m.closing_dates.length === 0 ? 'no_date' : (m.closing_dates.some((d) => d >= cutoff) ? 'open' : 'past'),
  }));
  return {
    source_id: record.source_id,
    source_name: record.source_name,
    page_url: record.url,
    page_title: record.title || '',
    crawled_at: record.crawled_at,
    links: linkCandidates(record),
    mentions,
  };
}

function extractAll(records, now = new Date()) {
  const pages = (records || []).map((r) => extractCandidates(r, now))
    .filter((p) => p.links.length > 0 || p.mentions.length > 0);
  const summary = {
    pages_with_leads: pages.length,
    links: pages.reduce((n, p) => n + p.links.length, 0),
    mentions: pages.reduce((n, p) => n + p.mentions.length, 0),
    open_mentions: pages.reduce((n, p) => n + p.mentions.filter((m) => m.status === 'open').length, 0),
  };
  return { generated_at: now.toISOString(), summary, pages };
}

module.exports = { closingDates, categoryOf, extractCandidates, extractAll, toIso };
