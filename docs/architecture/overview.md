# Architecture Overview — Verified Current State

**Baseline commit reviewed:** `380b3ad94939f6f4e5b1390bc733cf33c6865e94`  
**Baseline date:** 2026-10-28  
**Evidence:** repository files at the commit and GitHub Actions runs linked in [the implementation baseline](../status/IMPLEMENTATION_BASELINE.md).

## Current architecture

- **Frontend:** one main vanilla HTML/CSS/JavaScript application in `index.html`; no React/Vite build is configured in the current `package.json`.
- **Hosting:** GitHub Pages, serving the repository root and custom domain `setacareersportal.abrdns.com`.
- **Published data:** static JSON arrays in `data/`; the frontend and SEO generation scripts read these files.
- **SEO output:** `scripts/generate-seo-pages.js` writes crawlable directory-style pages and `sitemap.xml`. The interactive app and generated static pages coexist.
- **Routing contract:** `index.html` and root `route-paths.js` both map opportunity categories to canonical paths. Detail paths use category plus slug when available; `/opportunity/{id}` is a legacy fallback.
- **Validation:** `npm run validate`, `npm run validate:routes`, `npm run validate:pages`, `npm run links`, and `npm test`; `npm run check` composes the release checks defined in `package.json`.
- **Source registry:** `data/sources.json` is used by registry auditing, source-health probing, and the crawler.
- **Crawler:** `npm run crawl` runs a Node pipeline with source loading, robots handling, bounded fetching, HTML/PDF parsing, normalisation, validation, deduplication, staging, rejection diagnostics, and run reports. Candidate staging is not equivalent to publication.
- **Publication:** approved opportunity records are committed to `data/opportunities.json`; the crawler path reviewed here does not directly publish fetched candidates into the public dataset.

## Category contract and known gap

The current validator and both route maps recognise these six category IDs:

| Category ID | Canonical path |
| --- | --- |
| `learnership` | `/learnerships/{slug}` |
| `internship` | `/internships/{slug}` |
| `bursary` | `/bursaries/{slug}` |
| `apprenticeship` | `/apprenticeships/{slug}` |
| `tvet` | `/tvet-pathways/{slug}` |
| `job` | `/jobs/{slug}` |

However, `data/categories.json` currently contains metadata for only learnership, internship, bursary, and apprenticeship. The 17 published records at this baseline also use only those four categories. Treat TVET and jobs as present in routing/validation, but not yet fully reconciled across display metadata and actual published inventory.

## Public data contracts

- `data/opportunities.json`, `data/guides.json`, `data/categories.json`, `data/provinces.json`, and `data/sources.json` are JSON arrays.
- Runtime opportunity validation is implemented in `scripts/validate-content.js`. `docs/schema-draft.json` is a documentation/reference artifact, not the executable validator.
- Opportunity fields include source and application URLs, verification/expiry flags, dates, eligibility, and employment eligibility.
- The `expired` flag controls sitemap inclusion; a future closing date or `verified: true` alone is not proof an opportunity remains officially open.

## Migration policy

React/Vite, a server-side API, PostgreSQL, SSR, authentication, hosted search, and automated publication are **proposals, not current implementation requirements**. Do not implement a migration based only on a timeline in an old document. Propose a migration only when measured limits, operational needs, or an approved roadmap item justify it, and include migration cost, compatibility, rollback, and validation plans.

## Repository boundaries

- Keep the root `index.html` and `CNAME` contracts intact unless a specifically reviewed deployment change requires otherwise.
- Do not bypass content validation or commit unreviewed crawler candidates.
- Preserve source TLS verification; inaccessible or bot-blocked sources must be classified as unverified/restricted rather than assumed empty.
- Keep changes scoped and reconcile the affected documentation in the same pull request where practical.
