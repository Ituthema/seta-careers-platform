# Project Operating Workflow — seta-careers-platform

**Purpose:** Keep product development, opportunity research, verification, publishing, testing, and documentation in one repeatable workflow.
**Project:** South African career-opportunity discovery and directory platform.
**Repository:** https://github.com/Ituthema/seta-careers-platform
**Production site:** https://setacareersportal.abrdns.com
**Last reviewed against repository metadata:** 2026-10-28
**Review baseline:** `main` at `c84c0844f1fbd0e4add6ff517fcede820aba77a0` (TASK-211 structured vacancy extraction/review queue merge). This is a reference point, not a claim that current CI passes.

## 1. Project outcome and operating principles

The project succeeds when it publishes **more verified, genuinely open opportunities** without sacrificing accuracy, freshness, mobile usability, or trust.

Prioritise in this order:
1. Correctness and official-source verification.
2. A reliable path from discovery to a reviewed, published listing.
3. Freshness, expiry handling, and source coverage.
4. Search, category, province, accessibility, and SEO quality.
5. Automation and scale, only after the workflow is measurable.
6. Architectural upgrades only when measured constraints justify them.

### Non-negotiable rules

- Do not publish a vacancy based only on a search snippet, a crawler mention, an HTTP 200, a social post, or a future closing date.
- Keep official evidence and the actual application URL for every published opportunity.
- Human review is required. The crawler and extraction scripts produce candidates; they do not grant publication approval.
- Preserve TLS certificate verification, robots.txt handling, bounded concurrency, timeouts, redirect limits, response-size limits, and URL safety checks. Never weaken these to increase crawl counts.
- Do not delete expired records merely to hide them. Apply the established expiry and display/sitemap rules consistently.
- Do not introduce paid APIs, a database, a frontend rewrite, or a new hosting platform without an evidence-backed decision and a separate scoped task.
- Keep generated files reproducible and commit regenerated outputs when the repository requires them.
- Treat older audit documents as historical evidence tied to their stated commit, not as live project status.

## 2. End-to-end delivery workflow

Use this lifecycle for both software work and content operations:

`DISCOVER → CAPTURE EVIDENCE → NORMALISE → DEDUPLICATE → VERIFY → REVIEW → PUBLISH → VALIDATE → MONITOR → LEARN`

| Stage | Inputs | Required action | Exit condition / evidence |
|---|---|---|---|
| 1. Discover | Official source registry, source audit, search research | Select sources and record why they matter; prioritise official SETA, employer, government, university/TVET, and funder sources | Source has an owner/type, allowed URL/domain, strategy, priority, and check history |
| 2. Capture | Source URL and fetch result | Fetch safely; preserve source URL, fetch time, status, parser outcome, and errors | A source-level result exists, including failures; blocked/unverified is not called “empty” |
| 3. Extract | Staged HTML/PDF/text | Produce structured candidates with title, organisation, category, dates, location, eligibility, application route, and evidence snippets where available | Candidate is machine-readable and traceable to its source |
| 4. Normalise | Extracted candidate | Normalise category, dates, URLs, organisation, province, and title; retain original values where needed | Schema is valid; uncertain values remain explicitly unknown |
| 5. Deduplicate | Normalised candidates and existing data | Compare canonical application URL, official advert URL, source/advert identifiers, and conservative title+organisation+deadline keys | Duplicate decision is explainable; uncertain matches go to review |
| 6. Verify | Candidate and official advert | Open the official advert; confirm that the opportunity exists, is open, is relevant to South Africa, and has a valid application path | Evidence URL and verification timestamp are recorded; conflicting dates are resolved or flagged |
| 7. Review | Verified draft | Human reviewer approves, rejects, or requests correction; check category, province, eligibility, deadline, and wording | Explicit decision and reason are recorded |
| 8. Publish | Approved draft | Use the existing listing-draft and add-listing workflow; add the approved record to canonical data | Record passes schema and source-domain rules; static pages/sitemap regenerated as required |
| 9. Validate | Code/data change | Run focused tests first, then full project checks; inspect generated diff and route/page output | Required local checks pass; no unexplained generated changes |
| 10. Monitor | Published listing and source registry | Recheck deadline/status, application URL, source availability, and page visibility | Listing remains verified/open, is corrected, or is marked expired/withdrawn |
| 11. Learn | Run reports and review outcomes | Measure funnel conversion, false positives, duplicates, freshness, and source yield | Next task is chosen from measured bottlenecks, not guesses |

## 3. Repository workflow and safety boundaries

### Before every coding task

1. Confirm repository, branch, current commit, and task objective.
2. Read only the files needed for that task, starting with relevant project docs and scripts.
3. Inspect the current implementation before proposing a replacement.
4. State allowed files, forbidden files, expected behavior, tests, and acceptance criteria.
5. Make a focused change. Do not mix unrelated refactors or bulk content additions.
6. Run targeted tests, then the required project checks.
7. Review the diff for unintended data, route, domain, security, and generated-file changes.
8. Open a pull request with evidence. Do not merge unless explicitly authorised by the project owner.

### Known repository interfaces

- Canonical opportunity data: `data/opportunities.json`
- Source registry: `data/sources.json`
- Crawler entry point: `crawler/index.js`
- Staging/candidate output: `crawler/output/` (generated; check ignore rules before handling)
- Candidate extraction: `scripts/review-candidates.js`
- Structured vacancy candidate extraction: `scripts/extract-vacancies.js`
- Listing draft validation/addition: `scripts/add-listing.js`
- Content validation: `scripts/validate-content.js`
- SEO/static page generation: `scripts/generate-seo-pages.js` (invoked by `npm run sitemap`)
- Source audit/health: `scripts/source-audit.js`, `scripts/source-health-check.js`
- Expiry maintenance: `scripts/mark-expired.js`
- Route validation: root `validate-content.js` (invoked by `npm run validate:routes`)
- Main check command: `npm run check`
- Tests: `npm test`

Always confirm current scripts and package commands before using this list; docs can drift.

### Documentation maintenance

When a task changes behavior, schema, commands, workflow, routes, or acceptance criteria:
- update the closest existing document instead of creating a duplicate;
- record the implementation commit/PR and what was actually tested;
- distinguish **verified**, **inferred**, **planned**, and **blocked**;
- add a date and commit SHA to audits;
- update the priority roadmap only when priority or status genuinely changes;
- never change an old audit to make it appear current—create a new dated audit.

## 4. Content operations: exact safe path

The current scripts are intentionally candidate/review oriented. A typical safe sequence is:

```bash
# Run from the repository root (Termux or another Node.js environment)
npm run source:audit
npm run source:health
npm run crawl
npm run review:candidates
npm run extract:vacancies
```

These commands may perform network requests and write generated reports/candidate files. Inspect the actual outputs and current package scripts before running them. If a stage reports zero records, investigate the stage report and rejected/error output rather than treating zero as proof that no vacancies exist.

For each promising lead:
1. Open the official source URL in a browser.
2. Confirm the official advert is still available and open on the verification date.
3. Confirm title, organisation, category, location/province, eligibility, deadline, and application instructions.
4. Prefer the official application URL; check that it belongs to the source or a clearly linked authorised application system.
5. Create a draft using `docs/templates/listing-draft.example.json` (check the current template before use).
6. Run a dry-run first: `npm run add:listing -- path/to/draft.json`.
7. Resolve all errors and investigate warnings. Do not mark a record verified merely to silence a warning.
8. Only after review, run the write mode: `npm run add:listing -- path/to/draft.json --write`.
9. Review changed data, generated pages, sitemap, canonical URL, and expiry state.
10. Run relevant tests and `npm run check`; commit the data and required generated files together.
11. Recheck the published URL after deployment.

Do not commit private candidate dumps, logs, credentials, personal data, or large raw crawls. Follow repository ignore rules.

## 5. Pull-request and release gates

Every code/content PR should include:
- **Problem:** user/project impact and current evidence.
- **Scope:** exact files/areas allowed to change.
- **Approach:** reuse existing functions before introducing a new subsystem.
- **Safety:** publication, source trust, TLS, robots, URL safety, and data-retention impact.
- **Tests:** commands run and their actual outcomes, including warnings and failures.
- **Data/SEO effects:** record counts, route changes, canonical URLs, sitemap/page regeneration.
- **Rollback:** how to revert the change without losing verified records.
- **Acceptance checklist:** explicit pass/fail conditions.

Merge only after:
- review of the diff and any generated files;
- required CI checks pass on the exact PR head;
- failures are fixed rather than bypassed;
- data changes have official evidence;
- deployment-impacting changes have a post-deploy verification plan.

A green CI run is evidence of the checks that ran—not proof that every listing is live, accurate, or indexed. A historic run does not prove current main is green.

## 6. Weekly operating cadence

### Each work session
- Check current `main` SHA and CI.
- Select the single highest-priority unfinished task.
- Make one scoped change, test, and document the outcome.
- Avoid overlapping changes to the same files or mixing research with implementation unless explicitly planned.

### Daily/each publishing session
- Review newly discovered candidates.
- Verify official advert status and application links.
- Check deadlines, duplicates, category/province, and evidence.
- Publish only approved drafts.
- Record rejected candidates and why, so the same false positives are not repeatedly processed.

### Weekly
- Run source audit/health checks and review per-source outcomes.
- Review expired, soon-to-close, withdrawn, and broken-application listings.
- Calculate the discovery-to-publication funnel and source yield.
- Review failures, not just successful fetches.
- Update the roadmap with evidence and next acceptance criteria.
- Confirm GitHub Actions for current main and recent PRs.

### Monthly
- Review source coverage across SETAs, provinces, government, employers, TVETs, universities, and funders.
- Review extraction precision, duplicate rate, and time-to-publication.
- Check mobile user journeys, search/category filters, direct page loads, structured data, canonical URLs, and sitemap.
- Decide whether scale-related architecture changes are justified by measured limits.

## 7. Metrics and decision rules

Track these in a reproducible report, ideally per source and per week:

| Metric | Definition | Why it matters |
|---|---|---|
| Source coverage | Active sources with a successful, interpretable check in the period / active sources | Shows whether the source registry is operational |
| Fetch success rate | Successful fetches / attempted fetches, with blocked and unverified outcomes separated | Avoids mistaking blocks for empty sources |
| Candidate yield | Unique candidate leads per source and per fetch | Identifies useful sources and poor extraction |
| Verification pass rate | Candidates confirmed by official evidence / candidates reviewed | Measures candidate quality |
| Duplicate rate | Candidates matched to existing listings / candidates processed | Reveals wasted review and weak deduplication |
| Publication conversion | Approved listings published / candidates discovered | Finds handoff bottlenecks |
| Discovery-to-publication time | Median time from discovery to published verified record | Measures operational speed |
| Verified live inventory | Published listings confirmed open on the last verification date | Primary inventory quality metric |
| Stale listing rate | Listings whose status/deadline is overdue for recheck | Protects user trust |
| Application-link health | Verified application URLs that remain reachable/usable | Measures usefulness, not just page availability |
| Category/province coverage | Verified live inventory by category, province, and source type | Reveals meaningful gaps |
| User journey pass rate | Search → filter → detail → apply flow passes on mobile and desktop | Protects product usability |

**North-star metric:** verified, genuinely open opportunities published per week. Guardrails: verification pass rate, stale listing rate, duplicate rate, and application-link health. Never improve volume by lowering evidence requirements.

## 8. Definition of done

A task is complete only when:
- the stated problem is demonstrated or the assumption is clearly labelled;
- the smallest sufficient change is implemented;
- relevant tests run and outcomes are recorded;
- security and official-source constraints remain intact;
- generated outputs are reconciled;
- documentation is updated if behavior or process changed;
- PR/commit links and remaining risks are recorded;
- no unsupported claim is made about current CI, live listings, or production behavior.

## 9. Current-status caution

The last reviewed main commit is recorded above. TASK-211 added structured vacancy extraction/review support, but that merge alone does not prove that the full crawl-to-publication funnel works end to end or that the latest CI is green. The first roadmap item is therefore to verify current main, execute the funnel on a controlled sample, and document real results before expanding automation.
