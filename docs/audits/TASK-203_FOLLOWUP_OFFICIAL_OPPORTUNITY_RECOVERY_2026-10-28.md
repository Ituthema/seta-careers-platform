# TASK-203 — Follow-up Official Opportunity Recovery

**Audit date:** 2026-10-28  
**Baseline:** `main` after TASK-202 / PR #104, merge commit `523bf94ac9de81e5b0d09549996f72d509e4cc71`  
**Scope:** Continue official-source research to address the internship/apprenticeship gap; preserve source verification and generated route conventions.

## Accepted official opportunity

### City of Johannesburg Administration Officer Internship — Circular 029/2026

- **Status:** Accepted as open based on the official circular checked 28 October 2026.
- **Publication date:** 22 October 2026.
- **Closing date:** 4 November 2026.
- **Duration:** Up to 18 months.
- **Department / location:** Environmental and Infrastructure Services Department, Office of the Executive Director; Traduna House, 118 Jorissen Street, Braamfontein.
- **Remuneration:** R10,109.86 per month basic salary, no benefits.
- **Qualification:** Grade 12 plus a three-year qualification with 360 credits in Law, Administration, Public Governance, Business Management or Business Administration at NQF Level 6 or equivalent.
- **Local restriction:** Only qualifying residents of the City of Johannesburg are considered; the advert frames this as an opportunity for qualifying students in the Johannesburg community.
- **Previous internship restriction:** Applicants must not have participated in an internship before, except where the previous programme was unrelated to their course of study.
- **Application documents:** Certified qualification(s), ID and CV; online application required.
- **Official circular:** [Student Internship Circular 029/2026 (PDF)](https://joburg.org.za/work_/Documents/Vacancies-2026/Internship-029_2026_Admin-Officer_EISD.pdf)
- **Official application form:** [Apply online](https://share.hsforms.com/1qifX7lzWTm2xp9GwPEOeXA469tl)
- **Official programme index:** [City of Johannesburg 2026 Internships](https://joburg.org.za/work_/Pages/2026-Vacancies/2026-Internships.aspx)

The published listing intentionally preserves the City-specific residence restriction; it is not a nationwide internship. Applicants should read the circular before applying and verify the application form remains active.

## Other source findings

- **MISA Apprenticeship and Experiential Learnership Programmes 2026/2027 — rejected as open.** The official advert states the application deadline was 28 September 2026 at 16:00. Do not publish it as open without a new official advert or extension.
  - Official page: https://www.misa.gov.za/apprenticeship-learnership-programmes/
  - Official advert PDF: https://www.misa.gov.za/wp-content/uploads/2026/09/MISA-Apprentice-EL-Skills-Development-Advert-2026-2027.pdf
- **City of Johannesburg internship circulars 001–028/2026 — not accepted from the listing index alone.** Their current status must be verified from each individual circular; the index contains multiple older circulars and does not prove they remain open.
- No currently open apprenticeship with an independently verified official deadline was confirmed in this pass. Keep the apprenticeship category gap visible rather than relabeling closed programmes as active.

## Implementation

- Added opportunity ID `015` to `data/opportunities.json`; no historical records were deleted or reopened.
- Registered the official online application host as an inactive endpoint-only source record for verified-listing domain coverage; it is not configured as a discovery crawler.
- Added generated static pages at:
  - `internships/index.html`
  - `internships/city-of-johannesburg-administration-officer-internship-circular-029-2026/index.html`
- Updated the deadline calendar, province listing count, Gauteng page, and `sitemap.xml`.
- No auto-publishing was added.

## Source-health limitation

The stale `reports/source-health-report.json` was not rewritten with invented results. A current source-health run needs an execution environment with network access to the configured sources. No TLS verification bypass was used. The TASK-202 health-classification changes should be used to distinguish actual HTTP errors from requests that never received an HTTP response.

## Validation

Repository scripts were not executed by the GitHub connector during this implementation. Use the pull request's CI checks as the source of truth for Node 20/22 tests, content and sitemap validation, and Chromium smoke tests. A fresh source-health report remains a separate operational follow-up and should include its real generated timestamp and results.
