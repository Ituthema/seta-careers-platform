# Verified Implementation Baseline

**Repository:** `Ituthema/seta-careers-platform`  
**Branch:** `main`  
**Commit reviewed:** `380b3ad94939f6f4e5b1390bc733cf33c6865e94`  
**Review date:** 2026-10-28  
**Purpose:** record observed implementation and documentation discrepancies before changing the project roadmap or architecture.

This is a snapshot, not a permanent guarantee. Re-run the checks after the base commit changes. Counts below were computed from `data/opportunities.json` and `data/sources.json` at the commit above.

## 1. Verification method and evidence

Inspected the repository tree, current package scripts, router/path mappings, data files, content validator, SEO generator, crawler pipeline, source-health script, CI workflow definitions, and the documentation listed below.

### Current-main CI evidence

The following GitHub Actions runs were completed for the exact reviewed commit SHA:

| Workflow | Result | Run |
| --- | --- | --- |
| Quality Gates | **Success** | [40756315397](https://github.com/Ituthema/seta-careers-platform/actions/runs/40756315397) |
| Browser Smoke Tests | **Success** | [40756315297](https://github.com/Ituthema/seta-careers-platform/actions/runs/40756315297) |
| GitHub Pages build and deployment | **Success** | [40756314411](https://github.com/Ituthema/seta-careers-platform/actions/runs/40756314411) |

All three runs report `380b3ad94939f6f4e5b1390bc733cf33c6865e94` as their head SHA. The merge-triggered workflow run was still in progress when inspected; it is not counted as a success or failure here.

**Local validation:** no local shell commands or tests were run as part of this GitHub-connector audit. The results above are observed remote workflow results only. The crawler dependency-installed test workflow was not triggered by this documentation-only merge because its push trigger is path-filtered; its result is therefore **not tested for this commit**. The scheduled source-health workflow's latest operational output was not independently verified in this audit.

## 2. Inventory snapshot

### Published opportunity records

| Measure | Observed value |
| --- | ---: |
| Total records in `data/opportunities.json` | 17 |
| Learnerships | 5 |
| Internships | 5 |
| Bursaries | 3 |
| Apprenticeships | 4 |
| TVET records | 0 |
| General-job records | 0 |
| Records with `expired: true` | 9 |
| Records with `expired: false` and closing date before 2026-10-28 | 0 |

The final row is a date/flag consistency check, **not proof that the remaining records represent genuine currently open opportunities**. A record's `verified: true`, an unexpired flag, or a future closing date does not independently prove the official advert is still open. Each record must be checked against current official evidence before it is described as live.

### Source registry

| Measure | Observed value |
| --- | ---: |
| Total source entries | 220 |
| Active source entries | 152 |
| Inactive source entries | 68 |
| `last_checked` is null | 219 |
| `last_success` is null | 220 |

Registry entries are coverage intentions, not proof that a source was fetched successfully or that it contains open opportunities. The high null timestamp counts mean the registry itself does not currently provide a complete last-checked/last-success history. Do not infer that all active sources were crawled successfully.

Source entries by type:

| Type | Count |
| --- | ---: |
| Government | 61 |
| SETA | 35 |
| University | 35 |
| Private | 51 |
| SOE | 19 |
| Municipality | 19 |

## 3. Verified implementation facts

- The frontend is a vanilla HTML/CSS/JavaScript application in root `index.html`; `package.json` does not define a frontend build tool.
- GitHub Pages serves the repository root; the root `CNAME` declares `setacareersportal.abrdns.com`.
- `scripts/generate-seo-pages.js` generates static SEO pages and `sitemap.xml`; `npm run sitemap` invokes it.
- `index.html` and `route-paths.js` map six opportunity category IDs: learnership, internship, bursary, apprenticeship, TVET, and job. Canonical detail paths use category plus slug when present; `/opportunity/{id}` is a legacy fallback.
- `scripts/validate-content.js` accepts the same six category IDs.
- `data/categories.json` contains only four display metadata entries: learnership, internship, bursary, and apprenticeship. The category route/validator layer is therefore ahead of the category metadata layer for TVET and jobs.
- The crawler has fetch/robots handling, HTML/PDF parsing, normalisation, validation, deduplication, candidate staging, rejection reasons, and run reporting. Its staged output is not public inventory.
- `npm run review:candidates` and `npm run add:listing` provide CLI review/listing workflows; the inspected crawler path does not auto-publish unreviewed candidates.
- Source-health code classifies restricted and unverified responses separately from ordinary HTTP failures. TLS verification must not be weakened to make checks appear green.

## 4. Documentation discrepancies addressed by the companion PR

| Document | Previous claim/problem | Reconciliation |
| --- | --- | --- |
| Root `README.md` | Described the whole website as hash-routed and named stale sitemap-generation paths/commands. | Updated the structure, mixed SPA/static SEO model, category gap, and authoritative npm commands. |
| `docs/architecture/frontend.md` | Described only old hash-based detail routes and omitted the current six-category path mapping/static SEO output. | Updated routing section and documented the four-entry category metadata gap. |
| `docs/architecture/overview.md` | Mixed current architecture with dated migration assumptions and inaccurate routing/SEO descriptions. | Rewritten around verified current architecture; migrations are proposals requiring evidence and approval. |
| `docs/architecture/data.md` | Omitted the job category and said URLs must be HTTPS although the validator accepts HTTP and HTTPS. | Corrected the documented validator contract and clarified that the draft schema is not the executable validator. |
| `docs/schema-draft.json` | Category enum omitted TVET and jobs; URL rule did not match validator behaviour. | Aligned allowed category IDs and URL rule with the current validator. |
| `docs/modules/module-index.md` | Multiple modules were incorrectly described as missing/not implemented, and routing was stale. | Replaced with evidence-linked current status and explicit remaining gaps. |
| `docs/phases/backlog.md` | Several tasks were unchecked despite the corresponding files/capabilities existing. | Checked only items with direct repository evidence and added a status interpretation note. |
| `docs/README.md` | Did not link to a commit-specific baseline or the reconciliation rule. | Added both links. |

This reconciliation is intentionally limited. It does **not** claim every documentation file or dependency-map statement has been audited.

## 5. Outstanding discrepancies and risks

1. **Category metadata gap:** add or deliberately defer TVET and jobs display metadata in `data/categories.json`; then validate the navigation, filters, labels, static category pages, and sitemap end-to-end. Do not add speculative vacancy records just to fill the category.
2. **Live inventory truth:** 17 records is a small inventory. The expiry-flag check is not a substitute for current official advert verification. Audit each listing's exact official advert, closing date, eligibility, and application URL.
3. **Source freshness:** 220 registry entries exist, but 219 have null `last_checked` and all 220 have null `last_success`. Establish whether the workflow should persist these fields or whether timestamped health reports are the intended source of truth; document the chosen contract.
4. **Backlog accuracy:** only obvious artifact/capability mismatches were marked complete. Reconcile the remaining backlog against the tree and tests in a separate scoped task.
5. **Dependency map:** verify each named path and dependency before using it to sequence implementation; its file references may reflect an earlier architecture.
6. **CI coverage:** remote Quality Gates, Browser Smoke Tests, and Pages deployment passed for the baseline commit. This does not establish the latest result of every scheduled/path-filtered workflow.

## 6. Recommended next steps

1. Merge this documentation-only PR only after reviewing its diff and required checks.
2. Resolve the TVET/jobs metadata gap with an explicit product decision and tests.
3. Run an official-evidence reconciliation of the 17 published listings and publish only records confirmed open by primary sources.
4. Define and measure the source-to-publication funnel: registry → attempted fetch → successful fetch → parsed candidate → valid candidate → deduplicated candidate → official verification → human approval → published → stale/expired.
5. Reconcile the remaining backlog and dependency map against the current tree.

## 7. Reproduction commands

On a local checkout at the reviewed commit (or a later commit after rechecking the baseline), run:

```bash
npm test
npm run validate
npm run source:audit
npm run validate:routes
npm run validate:pages
```

Run `npm run links` only when outbound network access is available; interpret bot-blocked/TLS-failed results as unverified/restricted, not as proof that an official source is empty. Use `npm run check` for the configured full release gate, understanding that it can regenerate files and require a clean diff afterwards.
