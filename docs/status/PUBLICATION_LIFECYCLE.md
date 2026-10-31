# Publication Lifecycle Contract

**Status:** Implemented in the code on the feature branch; CI/local execution pending review.  
**Purpose:** distinguish editorial publication eligibility from expiry and source verification.

## Allowed states

| `publication_status` | Meaning | Public directory / SEO pages |
|---|---|---|
| `open` | Editorially approved to appear as an open opportunity, with current source evidence | Included only when `expired` is also false and the closing date has not passed in the interactive app |
| `expired` | Application window has closed | Excluded |
| `on_hold` | Temporarily suppressed pending an official clarification, working application route, or editorial decision | Excluded |
| `withdrawn` | Provider withdrew/cancelled the opportunity | Excluded |
| `needs_review` | Evidence is missing, conflicting, stale, or not yet approved | Excluded |

## Contract and safeguards

- `publication_status` is required on every opportunity record and is validated against the allowed state set.
- The shared `isListedOpportunity()` helper includes only records explicitly marked `open` and not marked `expired`. The SEO generator uses this helper, so non-open states are excluded from generated category/detail pages and the sitemap.
- The interactive app uses the same editorial state and fails closed to `needs_review` if a record lacks the field. It also retains the closing-date check.
- `expired` remains as a separate compatibility/lifecycle flag. The validator rejects `open + expired: true` and `expired + expired: false`; do not use `expired` to represent a broken link or unresolved evidence.
- `verified` remains a source-review indicator, not a substitute for `publication_status`, checked-at timestamps, or evidence. A future enhancement should persist evidence URL, checked-at timestamp, reviewer, and reason for status changes.
- The status is an editorial gate, not an automatic approval mechanism. Candidate ingestion must not assign `open` unless official evidence has been checked and a human reviewer approves publication.
- The helper intentionally does not compare the current date, keeping generated SEO output deterministic. Expiry maintenance remains the responsibility of the existing expiry process and validation checks.

## Current inventory migration

All 17 records received a lifecycle value in the same change:
- 8 `open` records, including the Mpumalanga traffic learnership (ID 014).
- 9 `expired` records.

For ID 014, the official Mpumalanga vacancy page links to the advert image, which visibly contains the corrected Microsoft Forms application URL `https://forms.cloud.microsoft/r/tKW94ibBVF` and a 30 October 2026 closing date. The department's 13 October statement had announced a dormant link and a forthcoming erratum; the current official advert image resolves that specific uncertainty. The record remains open only until its closing date, subject to any newer official update. Sources: [official vacancy page](https://www.mpg.gov.za/vacancies/traffic-learnership-department-community-safety-security-and-liaison), [official advert image](https://www.mpg.gov.za/sites/default/files/vacancies/DCSSL-30102026.jpeg), [department statement](https://www.mpg.gov.za/media/dcssl-advertised-posts-basic-traffic-officers-diploma-20262027).

The other seven open records retain their prior evidence basis; this status migration does not mean every field in every record has been independently re-proven. The nine expired records remain expired and should not be treated as currently open.

## Review and validation

- Run `npm test` to execute the repository's `*.test.js` suite, including `scripts/publication-status.test.js`.
- Run `npm run validate` to validate lifecycle values and consistency.
- Run `npm run sitemap` and inspect the generated diff; only explicitly open records should be emitted.
- Run `npm run validate:routes` and `npm run validate:pages`.
- Check the exact PR-head GitHub Actions results before merge. No local execution is claimed by this document.
