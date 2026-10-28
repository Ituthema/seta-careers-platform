# TVET and General Jobs — Category Metadata Gap Plan

**Prepared:** 2026-10-28  
**Reference baseline:** `d15da0f23fb1ceb7ec90109d75e797c4d3672bf2`  
**Status:** Planned; no category data or runtime behaviour changed by this planning document.

## 1. Confirmed discrepancy

The route layer (`route-paths.js` and the mirrored mapping in `index.html`) and `scripts/validate-content.js` recognise six opportunity category IDs:

- `learnership`
- `internship`
- `bursary`
- `apprenticeship`
- `tvet`
- `job`

But `data/categories.json` currently defines display metadata for only four: learnership, internship, bursary and apprenticeship. This is a data/UI contract gap, not evidence that TVET or general-job records exist. The current inventory has zero `tvet` and zero `job` records.

## 2. Goal

Make TVET pathways and general vacancies first-class, consistently represented categories across navigation, filters, category labels, SEO pages, routes and validation—without inventing inventory or changing existing canonical URLs.

## 3. Recommended implementation sequence

### Task CAT-001 — Map all category metadata consumers

Inspect only the relevant call sites and tests before changing anything:

- `data/categories.json`
- `index.html` (category navigation, filter options, labels, category page rendering and route mappings)
- `route-paths.js`
- `scripts/generate-seo-pages.js`
- `scripts/validate-content.js`
- tests for category metadata, routing, generated pages and sitemap
- relevant workflow/path filters if new tests require them

Document whether each consumer derives category options from `categories.json` or hard-codes its own list. Avoid a broad frontend refactor in this task.

### Task CAT-002 — Add the two metadata entries

Add `tvet` and `job` entries to `data/categories.json`, matching the existing record shape exactly:

- `id`, `label`, `plural`, `icon`
- `description`
- `color`, `bg`
- `seo_title`, `seo_desc`

Suggested user-facing copy (review before implementing):

| Field | TVET pathways | General jobs |
|---|---|---|
| `id` | `tvet` | `job` |
| `label` | TVET Opportunities | Jobs |
| `plural` | `tvet-pathways` | `jobs` |
| `description` | Opportunities, placements and pathways connected to TVET colleges and vocational training. | Verified government and employer vacancies across South Africa, including entry-level and experienced roles. |
| SEO title concept | TVET College Opportunities in South Africa | Jobs in South Africa — Government and Employer Vacancies |
| SEO description concept | Find verified TVET-related opportunities and vocational pathways. Check eligibility, deadlines and official application details. | Find verified South African government and employer vacancies. Check requirements, location, deadlines and official application details. |

Choose icons and colours consistent with existing design tokens. Do not claim "updated daily" or "verified" in SEO copy unless the operational process can support those promises. The `plural` values must agree with canonical route mappings; do not silently change `/tvet-pathways/{slug}` or `/jobs/{slug}`.

### Task CAT-003 — Make the contract testable

Add focused tests that prove:

1. Each supported category ID has exactly one metadata entry.
2. No metadata entry uses an unsupported ID.
3. Required metadata fields are present and non-empty.
4. Category IDs map to the intended canonical path, especially `tvet → /tvet-pathways/` and `job → /jobs/`.
5. Category navigation/filter labels and metadata use the same ID and do not create a second spelling such as `jobs` as a category ID.
6. Category SEO pages and sitemap output are deterministic when no records exist for a category; a category page may explain that no verified listings are currently available, but must not invent records.
7. A real job/TVET fixture can pass content validation and produce the expected route/page without altering existing categories.
8. Existing four-category routes, filters, sitemap entries and tests remain unchanged.

### Task CAT-004 — Validate generated outputs and review user-facing behaviour

Run the repository's defined checks in a clean checkout. Record actual commands and exit codes. If `npm run sitemap` regenerates pages or sitemap files, inspect the diff and include only expected generated changes. Test the mobile layout and empty-category state; don't equate a valid route with a populated directory.

## 4. Scope and non-goals

**Allowed for the implementation PR:** category metadata, narrowly necessary category-consumer changes, focused tests, generated SEO artefacts only if expected, and documentation that explains the contract.

**Out of scope:** creating placeholder opportunities, importing unverified listings, changing the data store, introducing React/Vite, changing canonical routes, changing crawler publication rules, or making an AI/paid-service dependency.

## 5. Acceptance criteria

- The category metadata IDs and supported category IDs match exactly.
- TVET and jobs category navigation/filter/SEO routes behave consistently even with zero records.
- Existing category behaviour and canonical URLs do not regress.
- Validators and relevant tests pass on the exact PR head; CI links and SHA are recorded.
- Generated file diffs are reviewed.
- Documentation distinguishes category capability from actual inventory counts.
- No listing is added solely to make a category appear populated.

## 6. Dependency and sequencing

1. Resolve or explicitly approve the publication handling for ID 014 in the inventory reconciliation.
2. Implement CAT-001 and confirm every consumer.
3. Implement CAT-002 and CAT-003 together in a scoped PR.
4. Run CAT-004 validation and review the generated diff.
5. Only after the category path is stable, add verified job/TVET records via the normal source-evidence and human-review workflow.

This plan intentionally separates metadata support from vacancy research. A category can be fully implemented and still correctly display zero opportunities.
