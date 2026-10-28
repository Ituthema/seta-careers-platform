/**
 * Shared opportunity route logic for the build-time scripts
 * (sitemap-generator.js, validate-content.js).
 *
 * MUST mirror index.html:
 *   - catPathMap
 *   - RouterWrapper.pageToPath('detail', opp)
 *
 * Canonical detail URL: /{category-plural}/{slug}.
 * Legacy fallback (no category/slug): /opportunity/{id}. The app and 404.html
 * still resolve /opportunity/{id}, but it is a compatibility route only.
 */

const CAT_PATH_MAP = {
  learnership: 'learnerships',
  internship: 'internships',
  bursary: 'bursaries',
  apprenticeship: 'apprenticeships',
  tvet: 'tvet-pathways',
  job: 'jobs',
};

// `o` is a raw record from data/opportunities.json (category/slug/id).
function opportunityRoutePath(o) {
  if (o && o.category && o.slug) {
    const base = CAT_PATH_MAP[o.category] || `${o.category}s`;
    return `/${base}/${encodeURIComponent(o.slug)}`;
  }
  return `/opportunity/${encodeURIComponent((o && o.id) || '')}`;
}

// Publication lifecycle is an explicit editorial decision. Only records with
// publication_status === "open" belong in public listings and generated SEO
// pages. The legacy expired flag remains a defensive guard while consumers
// migrate; this helper deliberately does not compare today's date so generated
// output is deterministic. Keep publication_status and expired consistent.
const PUBLICATION_STATUSES = new Set([
  'open',
  'expired',
  'on_hold',
  'withdrawn',
  'needs_review',
]);

function isListedOpportunity(o) {
  return Boolean(o && o.publication_status === 'open' && !o.expired);
}

module.exports = { CAT_PATH_MAP, PUBLICATION_STATUSES, opportunityRoutePath, isListedOpportunity };
