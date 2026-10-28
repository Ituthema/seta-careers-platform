# Development Backlog

> **Status reconciliation note (2026-10-28):** checked boxes below mean the named artifact/capability was found in the repository at baseline commit `380b3ad94939f6f4e5b1390bc733cf33c6865e94`; they do not certify exhaustive functional testing. Unchecked historical tasks are not automatically current priorities. Use `docs/roadmap/PRIORITISED_NEXT_STEPS.md` for the active execution order.

## Phase A — Documentation Foundation (Weeks 1–2)
- [x] TASK-001: Create docs/architecture/overview.md — exists; reconciled in this baseline task
- [x] TASK-002: Create docs/architecture/frontend.md — exists; routing section reconciled in this baseline task
- [x] TASK-003: Create docs/architecture/data.md — exists; category/URL contract reconciled in this baseline task
- [ ] TASK-004: Create docs/architecture/scripts.md
- [ ] TASK-005: Create docs/architecture/deployment.md
- [x] TASK-006: Create docs/modules/module-index.md — exists; status reconciled in this baseline task
- [ ] TASK-007: Create docs/modules/homepage.md
- [ ] TASK-008: Create docs/modules/search.md
- [ ] TASK-009: Create docs/modules/opportunity-detail.md
- [ ] TASK-010: Create docs/modules/bookmarks.md
- [ ] TASK-011: Create docs/modules/navigation.md
- [ ] TASK-012: Create docs/modules/seo.md
- [ ] TASK-013: Create docs/modules/crawler.md
- [ ] TASK-014: Create docs/modules/parser.md
- [ ] TASK-015: Create docs/modules/publishing.md
- [ ] TASK-016: Create docs/modules/seta-directory.md
- [ ] TASK-017: Create docs/modules/province-pages.md
- [ ] TASK-018: Create docs/modules/admin-dashboard.md
- [ ] TASK-019: Create docs/modules/authentication.md
- [ ] TASK-020: Create docs/modules/deployment.md
- [x] TASK-021: Create docs/phases/dependency-map.md — file exists; its dependency claims still need a separate full reconciliation
- [ ] TASK-022: Create docs/phases/task-examples.md
- [ ] TASK-023: Create docs/rules/boundaries.md
- [ ] TASK-024: Create docs/rules/coding.md
- [ ] TASK-025: Create docs/rules/naming.md
- [ ] TASK-026: Create docs/rules/testing.md
- [ ] TASK-027: Create docs/rules/commits.md
- [ ] TASK-028: Create docs/context/repository-summary.md
- [ ] TASK-029: Create docs/context/frontend-context.md
- [x] TASK-030: Create docs/context/data-context.md — file exists
- [x] TASK-031: Create docs/context/scripts-context.md — file exists
- [ ] TASK-032: Create docs/context/crawler-context.md
- [ ] TASK-033: Create docs/context/seo-context.md
- [x] TASK-034: Create docs/templates/codex-task-template.md — file exists and requires the reconciliation rule
- [ ] TASK-035: Create docs/templates/feature-implementation.md
- [ ] TASK-036: Create docs/templates/bug-fix.md
- [ ] TASK-037: Create docs/templates/refactoring.md
- [ ] TASK-038: Create docs/templates/content-update.md
- [ ] TASK-039: Create docs/templates/documentation.md
- [ ] TASK-040: Create docs/workflows/validation.md
- [ ] TASK-041: Create docs/workflows/release.md
- [ ] TASK-042: Create docs/workflows/mobile-orchestration.md
- [ ] TASK-043: Create docs/workflows/ai-development.md

## Phase B — Core Features (Weeks 3–4)
- [ ] TASK-044: Add responsive mobile hamburger menu with submenu dropdown
- [ ] TASK-045: Add "Closing Soon" section to homepage
- [ ] TASK-046: Add "Recently Added" section to homepage
- [ ] TASK-047: Add qualification level filter to search
- [ ] TASK-048: Add SETA filter to search
- [ ] TASK-049: Add pagination to search results
- [ ] TASK-050: Add "Similar Opportunities" to detail page
- [ ] TASK-051: Add "Share to WhatsApp" button on detail page

## Phase C — Abstraction Layer (Week 5)
- [ ] TASK-052: Add CONFIG object to index.html
- [ ] TASK-053: Add Storage abstraction wrapper
- [ ] TASK-054: Add API abstraction wrapper
- [ ] TASK-055: Add Search abstraction wrapper
- [ ] TASK-056: Add Router abstraction wrapper

## Phase D — Automation (Week 6)
- [ ] TASK-057: Add GitHub Actions auto-sitemap on data changes
- [x] TASK-058: Add GitHub Actions validation on PR — `.github/workflows/quality.yml` runs on pull requests
- [ ] TASK-059: Add scheduled link checker (weekly cron)

## Phase E — SEO Enhancement (Week 7)
- [ ] TASK-060: Add JSON-LD structured data to index.html
- [ ] TASK-061: Add Twitter Card meta tags
- [ ] TASK-062: Optimize Core Web Vitals
- [ ] TASK-063: Add canonical URLs

## Phase F — Data Pipeline (Weeks 8–10)
- [ ] TASK-064: Document crawler architecture
- [x] TASK-065: Add data normalization pipeline — crawler normalisation exists in `crawler/pipeline/normalize.js`
- [x] TASK-066: Add source health monitoring — script and workflow exist; run results must be checked separately
- [ ] TASK-067: Create review queue workflow

## Phase G — Scale Preparation (Weeks 11–12)
- [ ] TASK-068: Add bookmark export to JSON
- [ ] TASK-069: Add email reminder for closing dates
- [ ] TASK-070: Create SETA directory page
- [ ] TASK-071: Add search autocomplete
- [ ] TASK-072: Add "No results" suggestions
