# Prioritised Next Steps — seta-careers-platform

**Last reviewed:** 2026-10-28
**Reference main SHA:** `c84c0844f1fbd0e4add6ff517fcede820aba77a0`
**Status note:** This roadmap is evidence-informed, but items remain open until the repository, CI, and real outputs have been checked on the relevant commit. Do not infer completion from a plan or historic audit.

## Priority rules

- **P0 — correctness / operational blocker:** blocks trustworthy publication or prevents knowing whether the project works.
- **P1 — high leverage:** improves reliable inventory growth, freshness, or critical user journeys.
- **P2 — scale / optimisation:** do after P0/P1 bottlenecks are measured.
- Order within a priority reflects dependency and expected impact, not ease of implementation.

## P0 — do these first

### NEXT-001 — Verify current main and CI after TASK-211

**Why first:** We need a trustworthy baseline before building on the structured extraction and review queue.

**Scope**
- Confirm current `main` SHA and the latest GitHub Actions runs for that exact SHA.
- Run the relevant tests and content checks where an environment is available.
- Inspect the merged TASK-211 changes and any follow-up changes since its merge.
- Separate code-test failures, content warnings, external link-check limitations, and infrastructure/network failures.

**Acceptance criteria**
- Report exact SHA, run URL, event, conclusion, and failed jobs/steps (or clearly state that no run was found).
- Never call a historic run “current”.
- Record local commands and actual exit codes/output.
- File focused follow-up tasks for confirmed defects; do not make unrelated changes.

**Deliverable:** dated baseline report under `docs/audits/`.

### NEXT-002 — Prove the vacancy pipeline end to end with a controlled sample

**Why:** Discovery is only valuable if candidates can be safely extracted, verified, reviewed, and published without data loss or silent handoff gaps.

**Inspect first:** `crawler/index.js`, `crawler/pipeline/`, `scripts/review-candidates.js`, `scripts/extract-vacancies.js`, `scripts/add-listing.js`, the listing-draft builder, relevant tests, and generated-output ignore rules.

**Scope**
- Trace each stage and file contract: source registry → fetch → staging → candidate extraction → structured vacancy record → human verification/review → listing draft → canonical data → page/sitemap generation → validation.
- Use a small, controlled fixture or sample source; include successful fetch, blocked/failed source, empty staging, malformed input, duplicate, missing deadline, and expired listing cases.
- Verify whether review decisions/evidence persist between runs or must be maintained manually.
- Identify duplicated scripts or competing candidate output formats; document them before merging/removing anything.
- Add only the minimum tests or reporting needed to close confirmed gaps.

**Acceptance criteria**
- Every handoff has a documented input/output contract and an observable error path.
- Candidates cannot be published automatically without human verification.
- Failures distinguish no candidates, source blocked, fetch error, parser error, and malformed input.
- Dedupe behaviour is repeatable and does not silently discard distinct adverts.
- Tests cover the critical paths; all required CI checks pass on the resulting PR.

**Deliverable:** pipeline diagram/table, focused code/tests where required, and a run report with counts at each stage.

### NEXT-003 — Build a source-to-publication funnel report

**Why:** The project needs to know whether low live inventory comes from source access, extraction, deduplication, verification, or publication.

**Required per-run/per-source counts**
- configured sources; attempted sources; successful, blocked, unverified, and failed fetches;
- staged pages/documents; parse successes/failures;
- raw leads; normalised candidates; duplicates;
- candidates reviewed; verified open; expired/closed; rejected with reason;
- drafts accepted/rejected; records written; pages generated; validation errors.

**Acceptance criteria**
- Totals reconcile across stages, including failures and skipped records.
- Each candidate can be traced to source and evidence.
- Reports are machine-readable and concise, with a readable summary.
- No secrets or unnecessary raw page contents are written to committed reports.
- A zero count is explained by stage rather than reported as a generic “no opportunities”.

**Deliverable:** a reproducible report, preferably JSON plus concise terminal output, and a short interpretation guide.

### NEXT-004 — Reconcile published inventory against official status

**Why:** Inventory count is not the same as live inventory; stale or unverifiable adverts damage trust.

**Scope**
- Review all current canonical opportunity records in batches.
- Verify each against its official advert/application page.
- Record checked date, source/evidence URL, application URL, and result where schema supports it.
- Resolve conflicting dates, missing eligibility, dead application paths, and duplicate adverts.
- Mark closed/expired records using the existing lifecycle; do not delete records solely because they are old.
- Treat TLS errors, 403s, bot blocks, and inaccessible portals as unverified until browser/manual evidence resolves them.

**Acceptance criteria**
- Every record is classified: verified open, verified closed/expired, withdrawn, duplicate, or needs manual verification.
- No unverified record is described as live.
- Changes pass data validation and generated-page/sitemap checks.
- Report includes category counts and a list of unresolved items.

**Deliverable:** dated inventory reconciliation report and small, evidence-backed data PR(s).

## P1 — make reliable growth repeatable

### NEXT-005 — Turn the source registry into an operational monitoring system

**Scope**
- Audit `data/sources.json` for duplicates, stale checks, missing strategies, priorities, and source-domain coverage.
- Confirm what the existing weekly source-health workflow actually runs and whether it persists useful artifacts.
- Separate HTTP/network outcome from “source has no current vacancies”.
- Set review cadence by source type and priority; prioritise official SETA, government, employer, TVET/university, and funder sources.
- Make failures actionable with source ID, URL, stage, timestamp, and reason.

**Acceptance criteria**
- Every active source has an explicit strategy, priority, and check cadence.
- A scheduled report exposes sources that have not been checked or repeatedly fail.
- A blocked source does not automatically become inactive/dead.
- TLS verification and crawler safety controls remain unchanged.

### NEXT-006 — Improve extraction quality using measured errors

**Scope**
- Create a small labelled evaluation set of real official adverts across HTML, PDF, listing pages, and generic career pages.
- Measure field-level accuracy for title, organisation, category, location, deadline, eligibility, and application URL.
- Classify failures: wrong category, date confusion, multi-vacancy document, navigation-link false positive, missing application link, and parser failure.
- Add source-specific adapters only where recurring failures justify them.
- Use AI only as an optional drafting aid if a usable, permitted provider is configured; no paid API assumption and no AI-only verification.

**Acceptance criteria**
- A repeatable test set and baseline metrics exist.
- Changes improve measured precision without unacceptable loss of recall.
- Unknown values remain unknown rather than fabricated.
- Official evidence and human review remain mandatory.

### NEXT-007 — Strengthen cross-run and cross-source deduplication

**Scope**
- Inspect current dedupe keys and persisted data before changing them.
- Prefer canonical application URL, official advert URL, external advert ID, and source identity.
- Use normalised title + organisation + deadline as a secondary signal, not a blind deletion rule.
- Send ambiguous matches to manual review.
- Record why two candidates were matched.

**Acceptance criteria**
- Re-running the same sample does not create repeated candidates/listings.
- Different vacancies from one PDF or employer page are not collapsed into one.
- Existing published records are not rewritten without evidence.
- Duplicate rate is included in the funnel report.

### NEXT-008 — Finish the general-jobs content path with verified adverts

**Context:** PR #111 previously merged route/category support, but the merge itself did not add verified general-job records. Reconfirm current state before acting.

**Scope**
- Verify current route, category mapping, listing schema, validators, sitemap, and generated detail page behaviour for `jobs`.
- Research and verify actual government/employer vacancies from official pages.
- Add a small first batch of high-confidence records using the established draft/review workflow.
- Include expiry and application-link checks.

**Acceptance criteria**
- General-jobs category is reachable through navigation, filters, direct detail URLs, and sitemap where appropriate.
- At least the first batch of records is officially verified and validated.
- No placeholder or unverified records are added just to fill the category.

### NEXT-009 — Close freshness and expiry gaps

**Scope**
- Define the status rules for open, closing soon, closed, expired, withdrawn, and unverified.
- Test date handling in `Africa/Johannesburg`, including midnight boundaries and missing/invalid dates.
- Ensure listing display, category counts, generated pages, and sitemap eligibility use consistent status logic.
- Keep the original advert/evidence available for audit.

**Acceptance criteria**
- Date/status tests cover boundary cases.
- Expiry runs are repeatable and idempotent.
- Expired records are not shown as open.
- Warnings are either fixed or explicitly documented with rationale.

### NEXT-010 — Add critical user-journey regression tests

**Scope**
- Choose the lightest compatible browser test setup; do not add a large framework without justification.
- Test mobile viewport, home page load, search, category/province filters, detail page direct load, expired status, application link, canonical metadata, and 404/fallback behaviour.
- Keep existing unit/data/link/SEO tests.

**Acceptance criteria**
- Critical journeys run automatically on pull requests.
- Failures identify the broken route/interaction.
- Tests do not rely on live third-party job portals for deterministic assertions.

## P2 — scale only after measurement

### NEXT-011 — Improve operations and observability

Add a run history and compact weekly dashboard from existing reports before adding a new service. Track source coverage, funnel conversion, verified-live inventory, stale rate, application-link health, category/province coverage, and time from discovery to publication.

### NEXT-012 — Modularise the frontend incrementally

The single-page frontend can become harder to maintain, but a rewrite is not the current first move. First protect routes and user journeys with tests, then extract small modules/components without changing behaviour. Keep mobile-first design and canonical routes stable.

### NEXT-013 — Reassess search, storage, hosting, and AI architecture

Make a short decision record only when measured constraints justify it. Consider a database when concurrent editorial workflow, transactional review history, access control, or query performance genuinely requires it; do not migrate merely because the catalogue reaches thousands of JSON records. Compare free/open-source and operating-cost options before adopting paid services.

## 10. Recommended immediate sequence

1. **NEXT-001:** verify current main SHA and CI.
2. **NEXT-002:** test the complete vacancy pipeline with controlled fixtures.
3. **NEXT-003:** implement or repair stage-by-stage funnel reporting.
4. **NEXT-004:** reconcile current inventory against official status.
5. **NEXT-005:** make source health recurring and actionable.
6. **NEXT-006:** measure extraction errors and fix the highest-frequency failure.
7. **NEXT-007:** improve cross-run deduplication where evidence proves a gap.
8. **NEXT-008:** publish verified general-jobs records through the existing workflow.
9. **NEXT-009:** make expiry/freshness consistent and testable.
10. **NEXT-010:** add browser-level regression coverage.
11. **NEXT-011 to NEXT-013:** improve observability and architecture based on measured needs.

**Do not start all tasks in parallel.** Complete each task's acceptance criteria, record evidence, and then continue. If NEXT-001 reveals a release-blocking defect, fix that defect before proceeding.

## 11. Task status template

Copy this block into a task PR, issue, or dated project report:

```md
### Task: NEXT-XXX — [short title]
- Status: Not started / In progress / Blocked / Done
- Priority:
- Base commit:
- Evidence of problem:
- Scope (allowed files):
- Out of scope:
- Changes made:
- Tests/commands:
- Actual results and exit codes:
- CI run URL and exact head SHA:
- Data/SEO impact:
- Risks and unresolved questions:
- Documentation updated:
- Next task:
```

Status values must reflect evidence. A task is not Done until acceptance criteria pass and the result is recorded.
