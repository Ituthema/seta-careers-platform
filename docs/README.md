# Documentation Index

Use these documents in this order when planning or operating the project.

## Start here

1. [Project operating workflow](PROJECT_WORKFLOW.md) — end-to-end engineering, content, verification, release, and documentation process; includes safety rules and definitions of done.
2. [Prioritised next steps](roadmap/PRIORITISED_NEXT_STEPS.md) — ordered backlog with rationale, scope, acceptance criteria, and deliverables.
3. [Architecture overview](architecture/overview.md) — current technical structure, contracts, constraints, and migration considerations.
4. [Upscale workflow](UPSCALE_WORKFLOW.md) — existing growth and editorial cadence guidance. Apply it alongside the stricter official-verification and evidence requirements in the project operating workflow.

## Current implementation evidence

- [Publication lifecycle contract](status/PUBLICATION_LIFECYCLE.md) — allowed editorial states and the rules controlling public listings and generated SEO pages.

- [Verified implementation baseline](status/IMPLEMENTATION_BASELINE.md) — commit-specific snapshot of current architecture, data counts, known discrepancies, and observed CI results.
- [Implementation–documentation reconciliation rule](context/CODEX_TASK_RULES.md) — mandatory evidence and reporting rules for code/documentation work.

## Current inventory and category gaps

- [Published inventory reconciliation (2026-10-28)](audits/2026-10-28-published-inventory-reconciliation.md) — record-by-record official-source review, including the Mpumalanga traffic-learnership application-link conflict.
- [TVET/jobs metadata gap plan](status/TVET_JOBS_METADATA_GAP_PLAN.md) — scoped implementation sequence and acceptance criteria; no placeholder vacancies.

## Evidence and audits

- [Data audit report](data-audit-report.md) — consult the report date and scope before treating findings as current.
- [Audit directory](audits/) — dated repository snapshots. Each audit describes the exact commit it reviewed; do not treat historic CI results as current status.
- [Blockers and watch list](blockers.md) — known automation-path notes. Reconfirm claims against current code and CI before using them as evidence.

## How to keep docs reliable

- Start from the current `main` SHA and the latest CI run on that SHA.
- Prefer the operating workflow and roadmap for process and priority; use architecture docs for technical contracts.
- When two documents conflict, do not silently assume either is correct. Confirm current code, update the relevant document, and record the reason.
- Date new audits and record their exact commit SHA.
- Keep completed tasks and historical audit records; update current status in the roadmap or a new report rather than rewriting history.
