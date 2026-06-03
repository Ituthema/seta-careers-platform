# OpportunitiesZA Upscale Workflow

This workflow turns the current static site into a repeatable content and quality operation that can scale from a manually maintained directory into a trusted, searchable opportunity platform.

## North-star outcome

Grow OpportunitiesZA by increasing **verified active listings**, **useful career guides**, and **organic search coverage** without sacrificing trust. Every workflow below protects one of three outcomes:

1. **Trust:** no paid-to-apply scams, stale deadlines, duplicate listings, or broken source links.
2. **Reach:** each verified listing and guide creates clean SEO surfaces through the sitemap and route structure.
3. **Speed:** contributors can add opportunities quickly while automated checks catch avoidable mistakes.

## Operating cadence

| Cadence | Owner | Workflow | Definition of done |
| --- | --- | --- | --- |
| Daily | Content curator | Find and verify new opportunities from official employer, SETA, university, or government sources. | At least 3 new or refreshed records in `data/opportunities.json`, with source URLs and updated dates. |
| Daily | Content curator | Expiry sweep. | Listings with closing dates in the past are marked `expired: true` or updated from official sources. |
| Twice weekly | Editor | Publish or refresh guides. | One guide in `data/guides.json` is added or materially improved with a new `updated_date`. |
| Weekly | Maintainer | Quality release. | `npm run check` passes, sitemap changes are committed, and GitHub Pages deploys from a clean main branch. |
| Monthly | Product owner | Growth review. | Review search queries, top categories, missing provinces, and conversion clicks; reprioritise the backlog. |

## Contributor workflow

1. **Create a focused branch** named `content/<topic>` or `platform/<feature>`.
2. **Edit the smallest responsible file:** opportunities in `data/opportunities.json`, guides in `data/guides.json`, metadata in `data/categories.json` or `data/provinces.json`.
3. **Validate locally:** run `npm run validate` before committing.
4. **Regenerate the sitemap:** run `npm run sitemap` after content changes.
5. **Run the full check:** run `npm run check` and confirm `git diff` only includes intentional changes.
6. **Open a pull request** using the checklist below.
7. **Merge only after quality gates pass** in GitHub Actions.

## Pull request checklist

- [ ] All new opportunities have an official `source_url` and `application_url`.
- [ ] `closing_date`, `posted_date`, and `updated_date` use `YYYY-MM-DD`.
- [ ] Scam-sensitive copy states that legitimate applications are free where relevant.
- [ ] Expired listings are marked `expired: true` instead of deleted, unless removal is intentional.
- [ ] `npm run check` passes locally.
- [ ] `sitemap.xml` is regenerated and committed when content changes affect public pages.

## Automation now available

The repository now includes a zero-dependency Node workflow for repeatable quality gates:

```bash
npm run validate
npm run sitemap
npm run check
```

GitHub Actions runs the same checks on pushes and pull requests. The workflow validates data quality, regenerates the sitemap, and fails if generated sitemap changes were not committed.

## Scalable backlog

### Phase 1 — Trust foundation

- Add link-checking for `application_url` and `source_url` with retry and timeout handling.
- Add duplicate detection for similar opportunity titles across employers and provinces.
- Add an expiry dashboard that groups listings by expired, closing this week, and closing this month.
- Add source verification notes for high-risk listings.

### Phase 2 — Content growth engine

- Add templates for common opportunity types: learnership, bursary, internship, apprenticeship, and TVET pathway.
- Add province landing pages for every province/category combination with enough active inventory.
- Add guide refresh reminders for articles older than 90 days.
- Add a lightweight editorial calendar for seasonal application peaks.

### Phase 3 — Product scale

- Split the single-page application into maintainable modules when feature velocity starts slowing down.
- Add client-side data loading from `data/*.json` so content updates do not require editing `index.html`.
- Add saved filters, deadline reminders, and shareable search URLs.
- Add structured data for opportunities, FAQ pages, breadcrumbs, and organization metadata.

### Phase 4 — Growth and analytics

- Configure privacy-conscious analytics for search terms, apply-button clicks, category pages, and province pages.
- Add Search Console review tasks for indexing gaps, query opportunities, and broken rich results.
- Add a monthly content scorecard: active listings, expired listings, apply clicks, guide traffic, and top missing sectors.
- Build a partner intake process for employers and training providers while preserving manual verification.

## Data quality rules

Automated validation currently enforces:

- Lowercase `data/` directory compatibility for Linux and GitHub Pages.
- Valid JSON arrays for all data files.
- Required fields for opportunities and guides.
- Unique `id` and `slug` values.
- Lowercase kebab-case slugs.
- Valid `YYYY-MM-DD` dates.
- Valid HTTP(S) source and application URLs.
- Boolean values for `verified`, `featured`, and `expired`.
- Non-empty arrays for eligibility, documents, tags, and guide FAQs.

Warnings highlight issues worth editorial review, such as expired closing dates still marked active or meta descriptions longer than search-result best practice.
