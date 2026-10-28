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

// Whether an opportunity belongs in the sitemap. Deliberately depends ONLY
// on the `expired` flag, never on today's date, so the generated sitemap (and
// the CI "sitemap is committed" check) cannot change just because time passed.
// Keeping `expired` accurate is the job of `npm run expire` plus the
// lapsed-but-not-expired warning in scripts/validate-content.js.
function isListedOpportunity(o) {
  return !o.expired;
}

module.exports = { CAT_PATH_MAP, opportunityRoutePath, isListedOpportunity };
