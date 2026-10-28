# TASK-201 — Verified Opportunity Recovery and Content Gap Audit

**Audit date:** 2026-10-28 (South African time)  
**Repository baseline:** `main` at `1e6b6190664b6c33ed686b2a5c9089fe9686bbea`  
**Scope:** published opportunity records, official-source verification, immediate deadlines, and category coverage.

## Executive finding

The directory's immediate issue is stale and uneven category coverage, not a broken data schema. At baseline there were 10 published records: nine marked expired and one marked open. No published record had a past closing date while still marked open. The `verified` boolean was true for all 10 records, but that flag alone is not proof of a current re-check.

One additional 2027 bursary was confirmed from a current Department of Basic Education notice and added below. No new learnership, internship, or apprenticeship was added because this pass did not find a current opening with enough official-source evidence to support every required listing field.

## A. Reproducible baseline

Counts below were calculated directly from `data/opportunities.json` on the baseline commit before changes.

| Measure | Baseline |
|---|---:|
| Total records | 10 |
| Learnerships | 4 |
| Internships | 4 |
| Bursaries | 2 |
| Apprenticeships | 0 |
| `expired: true` | 9 |
| `expired: false` | 1 |
| `verified: true` | 10 |
| `verified: false` | 0 |
| Past closing date but `expired: false` | 0 |
| Closing date today/future but `expired: true` | 0 |
| Missing required source/application URL values | 0 |

The nine expired records are historical entries, not current opportunities: IDs `001`, `002`, `004`, `006`, `007`, `008`, `010`, `011`, and `012`. Their stored `verified: true` values should be interpreted as historical verification claims, not a statement that those roles remain open.

### Source URL quality concerns

Several expired entries use general career homepages instead of a vacancy-specific application page: Eskom (`001`), ABSA (`002`), MICT SETA (`004`), Shoprite (`006`), KZN Health (`007`), Old Mutual (`010`), Standard Bank (`011`) and Capitec (`012`). These are not proven broken solely by being broad URLs, so this audit does not replace them speculatively. Re-verify or improve the specific links if the records are ever reused. Keep expired records for history and preserve their IDs/slugs.

## B. Official-source checks

All checks below were performed on 2026-10-28. “Confirmed open” means the official notice/page showed an application window whose closing date had not passed at check time; applicants must still re-check the provider before applying.

| Opportunity | Official evidence | Result and action |
|---|---|---|
| NSFAS 2027 funding | [NSFAS — How to apply](https://www.nsfas.org.za/content/how-to-apply.html), [NSFAS homepage](https://www.nsfas.org.za/), and [NSFAS statement published by the South African Government on 20 October](https://www.gov.za/news/media-statements/nsfas-records-868626-applications-2027-funding-cycle-20-oct-2026) | **Confirmed open at audit time; 31 October deadline corroborated by the later official update.** NSFAS pages state applications opened 18 September and close 31 October 2026. An earlier government speech page says 18 November, but the later 20 October NSFAS statement says applications close 31 October and explicitly says there will be no extension. Existing record ID `003` retained; the stored date matches the later NSFAS-issued update. |
| Funza Lushaka Bursary 2027 — first-time applicants | [Department of Basic Education official notice](https://www.education.gov.za/ArchivedDocuments/ArchivedArticles/2027FunzaLushakaBursaryProgramme.aspx), which links to [eServices](https://www.eservices.gov.za/) | **Confirmed open.** The notice says applications opened 1 October 2026; returning applicants close 30 November 2026 and first-time applicants close 31 January 2027. Added a first-time-applicant record (ID `013`) with the latter deadline, explicitly distinguishing the earlier returning-applicant deadline. |
| AFGRI Farmer Development learnership (AO-2494) | [Official AFGRI recruitment page](https://afgri.mcidirecthire.com/External/Job?Ref=TEkBhDYErs0qhHgueWeCgt_yRI-cnPLR1MRk1RR6CpovtNnuiVlYCxkOUAzXEEVwx_D6XKczw4UO6wc3odkYiaZxDHfU-No8uMmZea6okqGk-2sOaLrLWYk4CgoMVSLcu1_CwzPcVE8bAjaW8-TCrg) | The official page confirms the 12-month programme, Grade 12/equivalent, unemployment, Gauteng location, market-related salary and closing date **28 October 2026**. The draft now records this evidence-based review outcome. The official page does not explicitly substantiate its specific document list (updated CV and proof of Grade 12), so `verified` remains false. This is the audit date and the deadline is same-day; keep the draft unpublished in this PR and do not carry it forward as open after the closing day. |
| DFFE 2027 student bursary | [Official DFFE bursaries page](https://www.dffe.gov.za/index.php/bursaries) | **Rejected as expired:** official page states the deadline was 2 October 2026. |
| Funza Lushaka return applicants | Same official DBE notice above | **Not represented by the new record:** returning applicants have a distinct 30 November 2026 deadline; the new listing is explicitly only for first-time applicants. Revisit as a separate record only if it can be represented without confusing the applicant cohorts. |

### Inconclusive or rejected leads

The following leads remain unpublished because an official opening with all necessary details was not independently confirmed during this pass:

- ISFAP Bursary 2027 — previously surfaced with a 31 October deadline from a directory; official current notice not confirmed.
- Energy Mobility Education Trust scholarship — third-party listing had inconsistent funder attribution; do not publish until the funder and official application notice are identified.
- Xylem SA Trust bursary — third-party listing had inconsistent funder attribution; official current notice not confirmed.
- Silulumanzi Bursary and Emfuleni Local Municipality Mayoral Bursary — previously surfaced with 30 November deadlines, but official notices were not confirmed in this pass.
- Free State Office of the Premier/SAAFoST bursary — deadline and/or official notice remains unclear.
- Implats engineering internship 2027, SAWEA WIIP graduate internships 2027, EconoFoods graduate internship 2027, and generic SETA roundups — aggregator leads only; no qualifying official opening evidence was confirmed here.
- The prior research pass found IDC External Bursary 2027 closed on 30 September, National Treasury External Bursary closed on 30 September, and Capitec's 2027 internship listing closed on 15 August. These are not new openings.

A source that is blocked, times out, or fails TLS verification remains unverified; do not weaken TLS verification to force a result.

## C. Category gaps after evidence-backed changes

The post-change dataset contains 11 records: 4 learnerships, 4 internships, 3 bursaries and 0 apprenticeships. Nine remain historical/expired and two are marked open at the audit date (NSFAS and Funza Lushaka first-time applicants).

The only open categories represented after this pass are bursaries. There are no currently open learnerships, internships or apprenticeships in the published dataset. This is a real content gap; do not fill it with undated evergreen career pages or aggregator-only leads.

## D. Ordered next actions

1. **Urgent — expire AFGRI after 2026-10-28:** it is open only through its official same-day deadline. Keep the draft separate; do not merge/publish it after the deadline.
2. **Daily until 31 October — NSFAS:** re-check the official notice and application portal; then mark the record expired on the first South African calendar day after the deadline unless NSFAS publishes an official extension.
3. **Weekly — find official openings in missing categories:** check each SETA's official notices and employer/government career pages for dated learnership, internship and apprenticeship calls. Record the exact vacancy page rather than only a homepage.
4. **Investigate leads, don't publish them prematurely:** confirm ISFAP, Silulumanzi, Emfuleni, Xylem/other named funders from their own websites or official notices.
5. **Improve source operations:** regenerate the stale source-health report in a normal network environment and distinguish HTTP responses from timeouts, anti-bot restrictions and TLS verification failures. Do not change crawler networking or TLS verification.
6. **Before publishing:** run the existing tests, content validation, link check, sitemap generation, route validation and Pages configuration validation; inspect generated changes and review the pull request.

## E. Validation record

**Remote CI result:** all required checks passed on implementation commit `000b5768e3bdb2064b8dacf02d566e0c7e9cd5b5` on 2026-10-28. This environment could not clone the repository for a local run, so these are the actual GitHub Actions results, not local claims.

| Check | Actual result |
|---|---|
| `npm test` | Passed: 73 tests, 72 passed, 0 failed, 1 skipped |
| `npm run validate` | Passed with 0 warnings |
| `npm run links` | 15 unique opportunity URLs checked; 0 errors, 8 warnings. 13 URLs responded; NSFAS and KZN Health remained unverified due to TLS certificate-chain errors. Six other warnings were HTTP 403 restrictions/rate limits. TLS verification was not weakened. |
| `npm run sitemap` | Passed: generated 2 active opportunity pages, 1 category landing page and a sitemap with 25 URLs |
| `npm run validate:routes` | Passed: 2 opportunity pages, 1 category page, 7 guide pages and 13 information pages use crawlable canonical routes |
| `npm run validate:pages` | Passed: GitHub Pages CNAME verified as `setacareersportal.abrdns.com` |
| Generated SEO files current/committed check | Passed |
| Crawler tests | Passed on Node 20 and Node 22 |
| Browser smoke tests | Passed |

The `npm run check` wrapper was not invoked as one command because the remote workflow runs its constituent checks individually; the validation, link, sitemap, route and Pages checks above all ran and passed. The link warnings are recorded rather than suppressed.

## Files changed by this task

- `docs/audits/task-201-verified-opportunity-recovery-2026-10-28.md` — this audit.
- `docs/listing-drafts/afgri-farming-learnership-2026-2027.json` — record the official verification outcome and hold-publication decision.
- `data/opportunities.json` — verified Funza Lushaka first-time-applicant listing.
- `data/sources.json` — register the official eServices host linked from the DBE notice.

No expired record was deleted, no expired listing was represented as open, and no AFGRI same-day deadline draft was published.
