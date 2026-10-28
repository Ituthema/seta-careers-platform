# Codex Task Template

## Task ID
[TASK-XXX from docs/phases/backlog.md]

## Role
You are a [frontend|backend|content|devops] developer for CareerHub SA.

## Objective
[One sentence describing one coherent task.]

## Classification
- **Type:** [Feature|Bug|Refactor|Content|Documentation]
- **Scope:** [Temporary scaffolding|Permanent feature]

## Repository Scope

### Allowed Directories
- [List directories AI may read and modify]

### Forbidden Directories
- [List directories AI must NOT touch]

### Entry Files
- [Primary file(s) to modify]

## Context Documents (READ FIRST)
1. `docs/context/CODEX_TASK_RULES.md` — mandatory implementation/documentation reconciliation rules.
2. [Required task-specific context document]
3. [Additional supporting document if necessary]

## Success Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Affected documentation is reconciled with the implementation, or any justified exception is recorded.

## Validation Steps
1. Inspect the current base commit and relevant implementation, tests, configuration, and CI workflows.
2. Run the targeted validation commands for the changed scope; report exact commands and results.
3. Check the final diff and ensure documentation claims match the code and observed validation.
4. Report the base SHA, changed files, unresolved discrepancies, and uncertainties. Do not claim unrun checks passed.

## Commit Message
```
type(scope): description
```

## Stop Condition
After completing the scoped task and reporting validation, STOP. Do not begin unrelated tasks.

## Example Task
**Task:** Add a “Closing Soon” section to the homepage.
**Allowed:** `index.html`, relevant homepage tests, and `docs/modules/homepage.md`
**Forbidden:** `data/`, `scripts/`, `crawler/`, unrelated docs
**Entry:** `index.html`
**Context:** `docs/context/CODEX_TASK_RULES.md`, `docs/modules/homepage.md`
**Success:** Section appears on homepage, shows opportunities closing within 14 days, is responsive, and its documentation matches the implementation.
**Validation:** Run the relevant automated tests, inspect the rendered page if browser tooling is available, and report the actual results.
**Commit:** `feat(homepage): add closing soon section`