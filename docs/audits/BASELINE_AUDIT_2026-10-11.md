# Baseline Audit — seta-careers-platform

- **Audit date:** 2026-10-11 (South Africa, UTC+02:00)
- **Repository:** https://github.com/Ituthema/seta-careers-platform
- **Branch audited:** `main`
- **Audited commit:** `52e0e5a5ae7484be3b89911333c8a53ac232f155`
- **Commit:** Merge pull request #60, “Fix remaining code-review findings (guide body sanitizing, sitemap routes, link check)”
- **Purpose:** Baseline source of truth for future Codex tasks. This document records observed state at the commit above. Re-audit when `main` changes; do not treat it as a live dashboard.

## 1. Executive result

**CI is green, but content-quality and documentation defects remain.** The latest Quality Gates run passed all nine job steps, including content validation, external link checking, sitemap generation, route/data consistency, custom-domain validation and generated-file cleanliness. Passing CI does not mean there are no defects: the content validator emitted eight warnings, the link checker emitted eight warnings, and the sitemap contains only four currently live opportunity detail URLs.

### Repository metadata

- Default branch: `main`
- Visibility: public
- Archived: no
- Repository size reported by GitHub: 545 KB (GitHub repository size units)
- Latest commit reviewed: `52e0e5a5ae7484be3b89911333c8a53ac232f155`
- Repository file tree: 95 entries total; 69 blob/file entries and 26 tree/directory entries. GitHub's recursive tree response was not truncated.
- Inventory below lists every tracked file returned by GitHub's recursive tree for this commit.

## 2. Latest GitHub Actions results

### Quality Gates

- Run: [Quality Gates #118](https://github.com/Ituthema/seta-careers-platform/actions/runs/38146992501)
- Run ID: `38146992501`
- Event: push to `main`
- Head SHA: `52e0e5a5ae7484be3b89911333c8a53ac232f155`
- Started: 2026-10-11 14:23:39 UTC
- Completed: 2026-10-11 14:23:57 UTC
- Overall result: **success**
- Job: **Validate content and sitemap — success**

| Step | Result | Actual result |
|---|---|---|
| Checkout repository | PASS | Checked out audited SHA |
| Set up Node.js | PASS | Node v20.20.2; npm 10.8.2 |
| Validate JSON content | PASS WITH WARNINGS | Passed with 8 warnings |
| Check opportunity links | PASS WITH WARNINGS | 15 unique URLs; 0 errors, 8 warnings; 13 responded, 2 unverified |
| Regenerate sitemap | PASS | 15 static + 4 opportunity + 7 guide = 26 URLs |
| Validate sitemap/router/data | PASS | 4 live opportunity IDs matched loader and sitemap |
| Validate Pages domain | PASS | CNAME is `setacareersportal.abrdns.com` |
| Ensure generated files committed | PASS | `git diff --exit-code -- sitemap.xml` clean |
| Job completion | PASS | No failed step |

### Exact content-validation output (from the GitHub Actions job log)

```text
⚠️ opportunity 001: closing_date 2026-09-30 is before 2026-10-11 but expired is false
⚠️ opportunity 002: closing_date 2026-07-31 is before 2026-10-11 but expired is false
⚠️ opportunity 004: closing_date 2026-08-15 is before 2026-10-11 but expired is false
⚠️ opportunity 007: closing_date 2026-09-15 is before 2026-10-11 but expired is false
⚠️ opportunity 008: closing_date 2026-08-31 is before 2026-10-11 but expired is false
⚠️ opportunity 010: closing_date 2026-07-31 is before 2026-10-11 but expired is false
⚠️ opportunity 011: closing_date 2026-09-30 is before 2026-10-11 but expired is false
⚠️ opportunity 012: closing_date 2026-09-30 is before 2026-10-11 but expired is false
✅ Content validation passed with 8 warning(s).
```

**Interpretation:** the validator warns, but does not fail, when the closing date is in the past and `expired` is still false. These records may be excluded from live routes by the date-aware sitemap filter, but the source data is inconsistent and needs editorial reconciliation. Do not simply change flags without checking source evidence.

### Exact external link-check summary

```text
Checked 15 unique opportunity URL(s): 0 error(s), 8 warning(s).
Verified (site responded): 13. Unverified (no response / network issue): 2.
```

Warnings observed:
- `https://www.nsfas.org.za`: unverified after TLS certificate verification failure in the runner (`curl: (60) unable to get local issuer certificate`). This is not proof the destination is down.
- `https://www.kznhealth.gov.za`: same runner TLS verification issue; unverified, not confirmed dead.
- HTTP 403 from MICT SETA, Shoprite, Old Mutual, Standard Bank and Capitec career URLs. The checker correctly treats these as reachable but restricted/rate-limited, not as confirmed broken links.
- The remaining warnings total eight when both TLS cases and all six 403 endpoint entries are counted.

The checker only tests HTTP reachability. HTTP 200 or 403 does **not** prove that a page advertises the specific opportunity or that its application is open. A general careers landing page is not sufficient evidence of a specific active listing.

### Other recent workflow run

A Codespaces dynamic workflow run for the same SHA also reported success: [run 38146992410](https://github.com/Ituthema/seta-careers-platform/actions/runs/38146992410). This is not a replacement for the Quality Gates result.

## 3. Prioritized confirmed defects

Severity definitions: **P0** immediate security/data-loss incident; **P1** blocks core trust or important operation; **P2** material quality/maintenance issue; **P3** cleanup/long-term improvement. No P0 incident is established by this audit.

### P1 — Eight expired-date/status inconsistencies in opportunity data

- **Evidence:** `data/opportunities.json`; validation logic in `scripts/validate-content.js` around the closing-date check (approximately lines 112–116 in this commit).
- **Confirmed records:** IDs 001, 002, 004, 007, 008, 010, 011, 012 have closing dates before 2026-10-11 while `expired: false`.
- **Observed impact:** validator warns but passes. Date-aware live filtering excludes past-dated entries, but stored state is contradictory and could mislead other consumers that rely on the flag alone.
- **Required fix:** verify each original advertisement and update status/deadline/source evidence; add a regression test. Do not mark a listing open merely because the employer website responds.
- **Acceptance:** no past-dated opportunity remains active without an explicit, documented exception; CI fails or requires an explicit allowlist for unresolved inconsistencies.

### P1 — Only four live opportunity detail URLs are emitted

- **Evidence:** latest Quality Gates output from `sitemap-generator.js`; `validate-content.js` root route check.
- **Actual output:** 4 live opportunity IDs; 26 total sitemap URLs (15 static, 4 opportunity, 7 guide).
- **Impact:** the current opportunity directory is very small for a career-opportunity platform and offers limited opportunity-specific crawlable inventory. This is a content coverage finding, not by itself proof of a software bug.
- **Required fix:** audit each record against primary sources; restore only genuinely open opportunities; source and verify more active opportunities. Keep historical/expired records out of active listings.
- **Acceptance:** report counts of total, active, expired, verified and unverified records; every published active record has current evidence and a working, relevant application destination.

### P1 — README directs users to a different repository and includes stale setup instructions

- **Evidence:** `README.md` lines 5–6 and around lines 40–55; also search the remaining README for occurrences of `seta-careers-platform1`.
- **Confirmed content:** repository link and push/SSH examples refer to `Ituthema/seta-careers-platform1`, not the audited repository `Ituthema/seta-careers-platform`. The displayed live-site line has extra whitespace after `https://`. The documented tree omits current crawler/scripts/docs/report paths and describes an older layout.
- **Impact:** users following setup instructions may push to the wrong remote or misunderstand the current structure.
- **Required fix:** update all repository URLs and commands to the actual repository, remove whitespace from the live URL, and document the current workflow without destructive reinitialization instructions as the default.
- **Acceptance:** no stale repository URL remains in the README; setup commands are verified against the current repository and do not ask maintainers to delete `.git`.

### P2 — Link checking allows several classes of warning while CI remains green

- **Evidence:** `.github/workflows/quality.yml` step “Check opportunity links”; `scripts/check-links.js` status classification and non-strict default.
- **Confirmed behaviour:** default mode treats 403/401/429 and 5xx as warnings, and no-response network/TLS errors as unverified warnings. The current run passed with 8 warnings.
- **Impact:** CI success means no hard-broken statuses were detected; it does not mean all destinations were semantically verified or accessible to applicants.
- **Required fix:** retain sensible handling for bot blocks, but add a review report and a scheduled strict/manual verification policy. Store last-verified time and distinguish destination reachability from listing-specific verification.
- **Acceptance:** CI output separates reachable, restricted, unverified and hard-broken URLs; unresolved active application links are visible as actionable items.

### P2 — Sitemap uses hash-fragment routes and stale fallback dates

- **Evidence:** `sitemap.xml` lines near the top show `https://setacareersportal.abrdns.com/#/` and category routes; multiple static pages have `<lastmod>2026-05-01</lastmod>`. `sitemap-generator.js` uses a fallback date when a record lacks an explicit update date.
- **Confirmed behaviour:** the generated sitemap includes hash URLs; the latest successful job confirms 26 entries and clean generation.
- **Impact:** hash-fragment routes are a weak long-term choice for a content-first SEO directory, and stale fallback `lastmod` values can misrepresent freshness. This is an architecture/SEO risk, not proof of deindexing.
- **Required fix:** do not edit sitemap URLs alone. Plan and test a route migration to real paths with direct-load/fallback handling, canonical tags, redirects and backward compatibility. Avoid inventing last-modified dates; omit or derive them from real content changes.
- **Acceptance:** route, router, sitemap, 404 handling and canonical metadata agree; direct URL requests work; every sitemap entry corresponds to a real page.

### P2 — Current validator does not enforce expired-status consistency as an error

- **Evidence:** `scripts/validate-content.js`, closing-date warning branch (approximately lines 112–116).
- **Confirmed behaviour:** a stale `expired: false` field only creates a warning, allowing CI to pass with eight instances.
- **Required fix:** after editorial reconciliation, promote this condition to an error or require a documented exception/override. Ensure time comparisons are UTC/date-only and deterministic in tests.
- **Acceptance:** a test record with past closing date and no exception fails validation.

### P2 — Quality Gates has no browser-level regression job

- **Evidence:** `.github/workflows/quality.yml` (steps 1–9). The workflow runs data/link/sitemap/domain checks but does not run browser automation.
- **Confirmed scope:** no browser test step exists in this workflow file. This does not prove no tests exist elsewhere; the complete file inventory contains no obvious test directory or browser-test configuration.
- **Impact:** route, navigation, rendering, sanitization and mobile interactions are not verified by this CI job.
- **Required fix:** add focused browser smoke tests only after choosing a lightweight test runner compatible with this static site. Start with homepage, category route, opportunity detail, guide sanitization, invalid route and mobile navigation.
- **Acceptance:** CI fails on deterministic front-end regressions and produces a concise test summary.

### P3 — Node 20/action runtime deprecation warning

- **Evidence:** latest Quality Gates log, final warning; `.github/workflows/quality.yml` uses `actions/checkout@v4`, `actions/setup-node@v4`, Node 20.
- **Confirmed warning:** GitHub runner reported Node.js 20 deprecation/forced Node 24 runtime for actions. The workflow still passed.
- **Required fix:** review current supported action runtime and Node LTS, then update workflow versions deliberately and validate on a separate PR.
- **Acceptance:** no avoidable runtime deprecation warning; all checks still pass.

### P3 — README and current tree have drifted

- **Evidence:** `README.md` structure versus the inventory below; `package.json` scripts identify the actual validation commands.
- **Confirmed issue:** README's project tree omits crawler, source registry, reports, architecture docs, quality workflows and the scripts directory.
- **Required fix:** replace the hand-maintained tree with an accurate concise structure and link to detailed architecture/workflow documents.

## 4. Important non-defects / do not regress

1. The latest Quality Gates run is green. Do not claim that CI currently fails.
2. The link checker explicitly distinguishes network/TLS failures from broken links; preserve that distinction.
3. The root `CNAME` matches `setacareersportal.abrdns.com`; the CI domain-file check passes. This does not verify external DNS, Pages settings, HTTPS or production uptime.
4. `sitemap.xml` is generated and committed consistently at the audited SHA; the generated-file diff step passes.
5. The latest merged change adds an allowlist sanitizer for guide bodies and shares route-path generation through `route-paths.js`. Do not reintroduce raw guide-body HTML insertion.
6. This audit did not run commands in a local checkout. “Actual output” above means captured GitHub Actions log output, not a new local execution.

## 5. Full tracked-file inventory at audited commit

Source: GitHub recursive tree API for SHA `52e0e5a5ae7484be3b89911333c8a53ac232f155`. Response was not truncated. Listed paths are tracked files; directory entries are omitted.

```text
.github/workflows/quality.yml
.github/workflows/source-health.yml
.gitignore
404.html
CNAME
CareerHub SA AI Development Strategy.txt
README.md
Repository Workflow Optimization Framework.txt
code-review-bugs.txt
crawler/config/crawler-config.js
crawler/core/fetcher.js
crawler/core/router.js
crawler/core/source-loader.js
crawler/index.js
crawler/logs/crawl.log
crawler/output/crawl-report.json
crawler/output/fetch-diagnostics.json
crawler/output/rejected.json
crawler/output/staging.json
crawler/parsers/html-parser.js
crawler/parsers/pdf-parser.js
crawler/pipeline/normalize.js
crawler/pipeline/staging.js
crawler/pipeline/validate.js
crawler/reporting/fetch-diagnostics.js
data/categories.json
data/guides.json
data/opportunities.json
data/provinces.json
data/sources.json
deploy.sh
docs/UPSCALE_WORKFLOW.md
docs/architecture/Repository-Workflow-Optimization-Framework.md
docs/architecture/data.md
docs/architecture/frontend.md
docs/architecture/overview.md
docs/blockers.md
docs/context/data-context.md
docs/context/scripts-context.md
docs/context/ui-context.md
docs/data-audit-report.md
docs/modules/module-index.md
docs/phases/backlog.md
docs/phases/dependency-map.md
docs/rules/boundaries.md
docs/rules/context-budget-rules.md
docs/rules/data-access-rules.md
docs/schema-draft.json
docs/security/rendering-security.md
docs/source-governance.md
docs/source-registry.md
docs/templates/codex-task-template.md
docs/templates/rulesets.md
index.html
logs/changes-log.json
logs/normalization-report.json
package-lock.json
package.json
reports/source-audit-report.json
reports/source-health-report.json
robots.txt
route-paths.js
scripts/check-links.js
scripts/normalize_dataset.js
scripts/source-audit.js
scripts/source-health-check.js
scripts/validate-content.js
scripts/validate-pages-config.js
scripts/validators/source-validator.js
sitemap-generator.js
sitemap.xml
validate-content.js
```

## 6. Actual validation commands represented by CI

Run from repository root with Node.js 20+ and dependencies installed:

```bash
npm run validate
npm run links
npm run sitemap
npm run validate:routes
npm run validate:pages
git diff --exit-code -- sitemap.xml
```

Full convenience command in `package.json`:

```bash
npm run check
```

Note: `npm run check` regenerates `sitemap.xml`; run it in a clean branch and inspect the diff afterwards. The audit did not run these commands locally; the results in Section 2 are from the latest GitHub Actions job.

## 7. Codex execution rules for tasks derived from this baseline

- Treat this report as a snapshot for SHA `52e0e5a5ae7484be3b89911333c8a53ac232f155`, not as proof of current state after future commits.
- Before starting a task, fetch current `main` and this report. If the HEAD SHA changed, re-check the relevant finding and mark it fixed, still present or changed before editing.
- One task should address one finding or tightly coupled acceptance criteria. Do not combine README cleanup, data corrections, route migration and security changes in one patch.
- Use exact paths and line numbers from the current HEAD; line numbers in this report are baseline references and may shift.
- Do not alter listing truth/status without checking the primary source.
- Do not bypass failed validation with environment flags merely to make CI green. If a network limitation is real, report it explicitly and preserve a separate verification status.
- Run relevant validation and include full command, exit code, concise actual output, changed-file list and limitations in the PR description.
- No claim of browser, DNS, production, or semantic application verification without an actual test/evidence.
- Update this report only after the relevant task merges or after a deliberate re-baseline; retain the audited SHA and date.

## 8. Evidence links

- Repository: https://github.com/Ituthema/seta-careers-platform
- Audited commit: https://github.com/Ituthema/seta-careers-platform/commit/52e0e5a5ae7484be3b89911333c8a53ac232f155
- Latest Quality Gates run: https://github.com/Ituthema/seta-careers-platform/actions/runs/38146992501
- Quality workflow: https://github.com/Ituthema/seta-careers-platform/blob/main/.github/workflows/quality.yml
- Opportunity data: https://github.com/Ituthema/seta-careers-platform/blob/main/data/opportunities.json
- Content validator: https://github.com/Ituthema/seta-careers-platform/blob/main/scripts/validate-content.js
- Link checker: https://github.com/Ituthema/seta-careers-platform/blob/main/scripts/check-links.js
- Sitemap generator: https://github.com/Ituthema/seta-careers-platform/blob/main/sitemap-generator.js
- Generated sitemap: https://github.com/Ituthema/seta-careers-platform/blob/main/sitemap.xml
- README: https://github.com/Ituthema/seta-careers-platform/blob/main/README.md
- Route validator: https://github.com/Ituthema/seta-careers-platform/blob/main/validate-content.js
- Pages validator: https://github.com/Ituthema/seta-careers-platform/blob/main/scripts/validate-pages-config.js
