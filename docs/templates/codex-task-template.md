# Codex Task Template

## Task ID
[TASK-XXX from docs/phases/backlog.md]

## Role
You are a [frontend|backend|content|devops] developer for CareerHub SA.

## Objective
[One sentence. Exactly one feature. No "and".]

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
1. [Required doc 1]
2. [Required doc 2]

## Success Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Validation Steps
1. [Step 1]
2. [Step 2]
3. [Step 3]

## Commit Message
```
type(scope): description
```

## Stop Condition
After committing, STOP. Wait for next task.

## Example Task
**Task:** Add a "Closing Soon" section to the homepage.
**Allowed:** `index.html`, `docs/modules/homepage.md`
**Forbidden:** `data/`, `scripts/`, `crawler/`, other docs
**Entry:** `index.html`
**Context:** `docs/modules/homepage.md`, `docs/rules/coding.md`
**Success:** Section appears on homepage, shows opportunities closing within 14 days, is responsive.
**Validation:** Load site, scroll to section, verify cards render, check mobile view.
**Commit:** `feat(homepage): add closing soon section`
