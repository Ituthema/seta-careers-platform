'use strict';

// Turns crawler leads (crawler/output/vacancy-candidates.json) into draft files that
// `npm run add:listing -- <draft.json>` accepts. Pure functions: no file or network access.
//
// A draft is only a starting point for a person who checks the official page:
//   - verified is always false and publication_status is never set, so add:listing defaults
//     the listing to needs_review (hidden from the public) until a human approves it;
//   - anything the lead does not contain is left out, and add:listing records it as missing
//     with an explanatory comment (see docs/architecture/data.md, "Missing fields");
//   - the crawler evidence is kept under `_lead` so the reviewer can see where it came from.

const { buildListing, slugify, todaySA } = require('./listing-draft');

const MAX_TITLE = 120;

function cleanTitle(text) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  return t.length > MAX_TITLE ? t.slice(0, MAX_TITLE - 1).trimEnd() + '…' : t;
}

// A crawler "title" is often a sentence fragment from the page ("Already registered on our Job
// Site? >", "• Click on All jobs.", a bare ID). Only titles that read like the name of an
// opportunity become drafts; the rest stay in the lead file for people who want to browse it.
const TITLE_WORDS = /(learnership|bursar|scholarship|internship|intern\b|apprentice|artisan|vacanc|graduate|trainee|tvet|work[- ]integrated|programme|program\b|early[- ]careers|funding|circular|\byes\b)/i;

function titleProblem(title) {
  if (!/^[A-Z]/.test(title)) return 'title does not start like a name (fragment, bullet or number)';
  if (/[{}<>|;&]|\?\s*$|[.:,]\s*$|\bclick\b|\bselect\b|\bregistered\b/i.test(title)) return 'title reads like page text, not an opportunity name';
  if (title.split(' ').length < 2) return 'title is a single word';
  if (!TITLE_WORDS.test(title)) return 'title does not mention an opportunity type';
  return null;
}

// Returns { draft } for a usable lead, or { skip: reason }.
function draftFromLead(lead, today) {
  if (!lead || typeof lead !== 'object') return { skip: 'not a lead record' };
  if (lead.status === 'possibly_expired') return { skip: 'closing date has passed' };
  const title = cleanTitle(lead.title);
  if (!title) return { skip: 'no title' };
  const problem = titleProblem(title);
  if (problem) return { skip: problem };
  const closing = typeof lead.closing_date === 'string' ? lead.closing_date : null;
  if (closing && closing < today) return { skip: `closing date ${closing} has passed` };
  const sourceUrl = lead.source_page_url || lead.application_url;
  if (!sourceUrl) return { skip: 'no link to the official page' };

  const draft = {
    title,
    category: lead.category || 'job',
    source_name: lead.source_name || lead.organization || undefined,
    source_url: sourceUrl,
    verified: false,
    featured: false,
    _lead: {
      candidate_id: lead.candidate_id,
      source_id: lead.source_id,
      evidence: lead.evidence || null,
      discovered_at: lead.discovered_at || null,
      note: 'Crawler lead. Open the official page, confirm the details, then fill in what the advert states. Leave the rest out; add:listing records it as unknown.',
    },
  };
  if (lead.application_url) draft.application_url = lead.application_url;
  if (closing) draft.closing_date = closing;
  if (!draft.source_name) delete draft.source_name;
  return { draft };
}

// leads: records[] from vacancy-candidates.json; existing: data/opportunities.json; sources: data/sources.json.
// Returns { drafts: [{ file, draft, warnings }], skipped: [{ title, reason }] }.
function buildDrafts(leads, existing, sources, now = new Date(), max = 25) {
  const today = todaySA(now);
  const drafts = [];
  const skipped = [];
  const taken = new Set();
  const pool = Array.isArray(existing) ? existing.slice() : [];

  // Leads with a future closing date are the most useful, so they are drafted first.
  const ordered = (Array.isArray(leads) ? leads : []).slice().sort((a, b) =>
    (b && b.closing_date ? 1 : 0) - (a && a.closing_date ? 1 : 0));
  for (const lead of ordered) {
    if (drafts.length >= max) { skipped.push({ title: cleanTitle(lead && lead.title), reason: `over the limit of ${max} drafts` }); continue; }
    const made = draftFromLead(lead, today);
    if (made.skip) { skipped.push({ title: cleanTitle(lead && lead.title), reason: made.skip }); continue; }
    const { draft } = made;
    // Reuse the real add:listing rules: duplicates of published listings or of earlier drafts are skipped.
    const probe = buildListing(draft, pool, sources, now);
    if (!probe.listing) { skipped.push({ title: draft.title, reason: probe.errors.join('; ') }); continue; }
    const key = `${probe.listing.slug}|${probe.listing.application_url}`;
    if (taken.has(key)) { skipped.push({ title: draft.title, reason: 'duplicate of another lead in this run' }); continue; }
    taken.add(key);
    // Count this draft as present so a later lead with the same slug or link is caught as a duplicate.
    pool.push({ id: probe.listing.id, slug: probe.listing.slug, application_url: probe.listing.application_url });
    drafts.push({ file: `${slugify(draft.title) || 'lead'}.json`, draft, warnings: probe.warnings });
  }
  return { drafts, skipped };
}

module.exports = { draftFromLead, buildDrafts, cleanTitle, titleProblem };
