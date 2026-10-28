# Implementation–Documentation Reconciliation Rule

**Status:** Active repository workflow rule  
**Applies to:** Code changes, documentation changes, data/schema changes, routing changes, crawler/pipeline changes, CI changes, and deployment changes.

## Purpose

Keep project knowledge aligned with the current implementation. Documentation is a claim to verify, not automatic proof of current behaviour. Historical audits remain useful evidence of what was observed at the time, but do not establish current status.

## Required procedure

Before changing code or documenting current behaviour:

1. Identify the current base commit and inspect the relevant implementation files, tests, configuration, and CI workflows.
2. Treat repository code and observed test results as evidence of actual behaviour. Treat documentation as a claim to verify, not automatic proof.
3. Distinguish these states:
   - **Implemented:** verified in the current code.
   - **Tested:** supported by a test that was actually run.
   - **Planned:** documented intention not yet implemented.
   - **Blocked:** implementation or verification cannot proceed.
   - **Unknown:** insufficient evidence.
4. When implementation and documentation disagree, record the discrepancy and determine whether code, documentation, or both require correction.
5. Update affected documentation in the same change as the implementation whenever practical.
6. Never claim a test, CI check, route, feature, or deployment is verified unless evidence supports that claim.
7. Include the exact base commit SHA, commands run, results, files changed, and remaining uncertainties in the task report. If a command cannot be run, state that explicitly.
8. Keep changes scoped. Do not rewrite unrelated documentation or scan the entire repository when targeted evidence is sufficient. Expand scope only when dependencies or evidence require it.
9. Do not remove historical audit records; label them as historical and link them to their original date and commit where known.
10. Before completion, check that the resulting documentation agrees with the final code diff and actual validation results.

## Evidence requirements

- Record the commit SHA against which the review was performed.
- Separate local test results from GitHub Actions results. CI is verified only when a run for the relevant commit has been inspected.
- For each material discrepancy, record: document/path, claim, implementation evidence, status, severity, and correction or follow-up.
- Never interpret an inaccessible URL, TLS failure, HTTP 403, bot block, or timeout as proof that a source contains no opportunities.
- Never treat a future closing date or a candidate record as proof that an opportunity is officially open or approved for publication.
- If source counts or research results are recorded, include the scope, date/time, and source snapshot or commit where available.

## Completion report

Use this concise format:

- **Base commit:** exact SHA
- **Files changed:** paths and purpose
- **Evidence inspected:** implementation/tests/configuration/CI paths
- **Validation run:** exact commands or workflow URLs and observed results
- **Discrepancies:** resolved items and outstanding items
- **Uncertainties/blockers:** explicit list, or “None identified” only when supported
- **Status:** implemented / tested / planned / blocked / unknown, as appropriate

## Review gate

Do not mark a task complete merely because the code or documentation was edited. Confirm the final diff, validate the changed behaviour to the extent possible, update affected documentation, and report any verification that remains outstanding.