# Module Index — Current Implementation Status

**Reconciled against:** `380b3ad94939f6f4e5b1390bc733cf33c6865e94` on 2026-10-28.  
Status labels describe the observed repository implementation, not a claim that every user journey has been exhaustively tested.

| Module | Current status | Evidence / entry point | Remaining gap |
| --- | --- | --- | --- |
| Homepage | Implemented | `index.html` | Browser smoke tests cover only the configured smoke scenarios. |
| Navigation | Implemented | `index.html` | Keep mobile interaction covered as navigation changes. |
| Search and filters | Implemented | `index.html` | Review filter coverage against supported category metadata. |
| Opportunity details | Implemented | `index.html`, `route-paths.js` | Canonical detail paths use category plus slug; legacy `/opportunity/{id}` fallback remains. |
| Bookmarks | Implemented client-side | `index.html`, browser local storage | No account/cloud sync. |
| Category routes | Partially reconciled | `index.html`, `route-paths.js`, `scripts/generate-seo-pages.js` | Routes/validator recognise six categories, but `data/categories.json` defines only four category metadata records. |
| Province pages | Implemented in static SEO generation and interactive UI | `scripts/generate-seo-pages.js`, `data/provinces.json`, `index.html` | Inventory coverage can be sparse; do not imply every province has active listings. |
| Guides | Implemented data-driven content and SEO pages | `data/guides.json`, `scripts/generate-seo-pages.js` | Continue checking content quality and route agreement. |
| Crawler fetch | Implemented | `crawler/index.js`, `crawler/core/` | Source access can fail or be restricted; failures are not proof of no openings. |
| HTML/PDF parser | Implemented | `crawler/parsers/html-parser.js`, `crawler/parsers/pdf-parser.js` | Extraction quality still needs source-specific measurement. |
| Normalisation/validation/dedupe | Implemented pipeline stages | `crawler/pipeline/normalize.js`, `validate.js`, `dedupe.js` | Quality and cross-run/cross-source dedupe require measurement. |
| Candidate staging/reporting | Implemented | `crawler/pipeline/staging.js`, `crawler/reporting/` | Staged records are not approved public listings. |
| Candidate review | CLI tooling exists | `npm run review:candidates`, `scripts/review-candidates.js` | This is not a complete web-based editorial queue or automated approval system. |
| Listing creation | Controlled script exists | `npm run add:listing`, `scripts/add-listing.js` | Human verification and review remain necessary. |
| Source registry/audit | Implemented | `data/sources.json`, `npm run source:audit` | Registry metadata is not the same as a successful recent crawl. |
| Source health | Implemented | `scripts/source-health-check.js`, `.github/workflows/source-health.yml` | Confirm recent workflow output separately; registry timestamps may remain null. |
| Content validation | Implemented | `scripts/validate-content.js`, `npm run validate` | Expiry warnings and official-status verification are different checks. |
| SEO generation/routes | Implemented | `scripts/generate-seo-pages.js`, `route-paths.js`, `npm run validate:routes` | Static outputs must be regenerated and committed when relevant data/routes change. |
| CI quality gates | Implemented | `.github/workflows/quality.yml` | Current run results are commit-specific; see baseline report. |
| Browser smoke tests | Implemented | `.github/workflows/browser-smoke.yml` | Smoke tests do not equal exhaustive end-to-end coverage. |
| Authentication/admin dashboard | Not implemented in reviewed architecture | No current auth service or admin app was identified in the inspected implementation | Do not plan work that assumes user accounts exist. |
| Automated publication | Not implemented in crawler path reviewed | Crawler stages candidates; publication uses reviewed data changes | Keep human approval gate. |

## Interpretation rules

- **Implemented** means the code path exists; it does not mean all edge cases are tested.
- **Tested** should be used only for tests actually run, with the commit and result recorded.
- **Planned** means a proposed future capability, not a present feature.
- **Unknown** means the relevant code or current workflow result has not been inspected.
