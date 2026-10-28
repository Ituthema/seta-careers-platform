# TASK-202 — Official-Source Opportunity Recovery and Freshness Audit

**Audit date:** 2026-10-28  
**Baseline:** `main` at `3e9b128c25513984babd101cb4a4536db8e5d8ad` (after TASK-201 / PR #103)  
**Scope:** Current learner-facing opportunities, official-source evidence, expiry/freshness reporting. No auto-publishing or TLS-verification changes.

## Summary

- Added one currently open, official-source-verified learnership: **Mpumalanga Basic Traffic Officers Diploma Learnership 2026/27**, reference `DCSSL/05/2026`, closing **30 October 2026**.
- The provincial government's official vacancy page links the advert image. The advert itself specifies the corrected Microsoft Forms application URL, a R5,000 monthly stipend, 12-month programme, Matric, Code B licence, South African citizenship, no criminal record, medical fitness, and driving/competency tests.
- Kept all historical listings and IDs. No expired listing was reopened or deleted.
- Improved source-health reporting so a request with no HTTP response is marked **unverified**, not automatically described as an unhealthy source. HTTP error responses remain separate and can still fail strict checks.
- The prior `reports/source-health-report.json` is dated **2026-06-03**. Its 58/58 “unhealthy” result is stale and mostly reports timeouts or “fetch failed” with no HTTP status. It must not be interpreted as proof that all 58 sources are down. Regenerate it from a network that can reach the sources before relying on it.

## Verified listing added

| Field | Evidence-backed value |
|---|---|
| Title | Mpumalanga Basic Traffic Officers Diploma Learnership 2026/27 |
| Reference | DCSSL/05/2026 |
| Category / province | Learnership / Mpumalanga |
| Programme | 12 months |
| Stipend | R5,000 per month |
| Closing date | 30 October 2026 |
| Location | Mpumalanga Traffic Training College, Mkhuhlu (Calcutta), Bushbuckridge Local Municipality |
| Minimum requirements | Grade 12; at least Code B driving licence; South African citizen; no criminal record; fit for strenuous training |
| Assessments | Medical assessment for shortlisted candidates; driving and competency tests |
| Application | [Corrected application form](https://forms.cloud.microsoft/r/tKW94ibBVF) |
| Official source page | [Mpumalanga Provincial Government vacancy page](https://www.mpg.gov.za/vacancies/traffic-learnership-department-community-safety-security-and-liaison) |
| Enquiries | Mr G. Mnisi: 013 766 4019; Ms N. Mathebula: 013 766 9152 |

The official advert instructs applicants to complete the new Z83 and upload a detailed CV containing at least three referees and their contact details. Copies of qualifications and other supporting documents are requested from shortlisted candidates as directed by the advert. The listing description explicitly notes that the advert does not state an employment-status restriction; users should clarify eligibility questions with the department.

## Search findings and rejected leads

- **Mpumalanga traffic learnership — ACCEPTED.** Official provincial vacancy page and linked advert confirm the current closing date and application URL. Deadline is urgent; verify the source again before the closing date and expire the listing after the closing day.
- **Department of Tourism 2026/27 Culinary Skills learnership — REJECTED as open.** The official programme page indicated the closing date had passed (18 October 2026). Do not present it as open without a new official advert.
- **MISA apprenticeship/learnership programme — NOT PUBLISHED.** A programme page exists, but the evidence found in this pass did not establish a currently open learner intake with a future closing date. Recheck the official page/advert before publishing.
- **Services SETA 2026/27 discretionary grant — NOT A LEARNER LISTING.** This is a funding window for employers/providers, not a direct learner opportunity; retain it only as a potential source-monitoring lead.
- Aggregator-only leads were not promoted to verified live listings. Third-party summaries can help discover leads, but official evidence is required for active listing claims.

## Content gap after this recovery

The dataset now contains a verified open learnership and verified open bursary listings (NSFAS 2027 and Funza Lushaka 2027 first-time applicants). The main gap remains **verified open internships and apprenticeships**. Continue source-first research across official SETA, provincial/national government, public university/TVET and employer career pages. Do not fill category gaps with evergreen career pages or aggregator-only leads.

## Freshness and status rules

1. **Open:** closing date has not passed in South African local time, and the listing has current, attributable official advert evidence.
2. **Expired:** closing date has passed. Preserve the record and canonical slug/history; do not delete it as part of routine expiry maintenance.
3. **Unverified source:** no HTTP status was received (for example, timeout, TLS/network error, DNS/proxy issue). This means the checker could not verify the source; it does not prove the source is down. Do not disable certificate validation to make a check pass.
4. **Unhealthy HTTP response:** the host returned an HTTP status outside the accepted success/redirect range. Treat it separately from no-response cases and review the status/redirect chain.
5. **Historical or draft lead:** keep it out of live listings unless a current official advert confirms the intake and deadline. Human review remains required; no auto-publishing is introduced.
6. Re-run source health checks and record the run timestamp before using health metrics. Do not overwrite this dated audit with unsupported assumptions about inaccessible sources.

## Validation status

The GitHub connector was used to make focused edits on a branch; repository scripts could not be executed in this connector session. Therefore, **no local test or validation result is claimed here**. The PR's GitHub Actions checks must confirm the new listing, generated SEO pages/sitemap, and source-health tests. If generated pages or sitemap are reported stale, run the repository's documented `npm run sitemap` workflow and include only the generated files associated with the listing.

## Files changed

- `data/opportunities.json` — added record `014`; no existing record was deleted or reopened.
- `scripts/source-health-check.js` — added a `health_state` field and separate unverified count; no TLS verification behavior was weakened.
- `scripts/source-health-check.test.js` — tests successful responses, HTTP errors, no-response cases, and warnings.
- `docs/audits/TASK-202_OFFICIAL_SOURCE_RECOVERY_2026-10-28.md` — this audit.
