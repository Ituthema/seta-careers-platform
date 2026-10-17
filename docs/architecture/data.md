# Data Architecture

## Canonical Source
`data/` directory contains the single source of truth.

## Files
| File | Purpose | Top-level shape | Fields |
|---|---|---|---|
| `opportunities.json` | All opportunity listings | Array of records | See "Required Fields" below and `docs/schema-draft.json` |
| `guides.json` | Educational guide articles | Array of records | `id`, `slug`, `title`, `category`, `intro`, `body` (HTML, sanitised on render), `faq`, `related_slugs`, `meta_title`, `meta_description`, `read_time`, `published_date`, `updated_date` |
| `categories.json` | Category metadata | Array of records | `id`, `label`, `plural`, `icon`, `description`, `color`, `bg`, `seo_title`, `seo_desc` |
| `provinces.json` | The nine provinces | Array of records | `id`, `label`, `icon`, `major_cities`, `description`, `top_employers`, `seo_title`, `seo_desc` |
| `sources.json` | Source registry for the crawler and audits | Array of records | `source_id`, `name`, `type`, `url`, `active`, `crawl_strategy`, `frequency`, `priority`, `last_checked`, `last_success`, `notes` |

Record counts are intentionally not listed here; they change with every content update. `Nationwide` is a valid
`province` for an opportunity but has no entry in `provinces.json`; `index.html` adds it to the province list itself.

## Data Flow
1. Content added to `data/*.json`
2. `npm run validate` (content rules) and `npm run validate:routes` (sitemap vs data vs `index.html`)
3. `npm run expire` marks listings whose closing date has passed as `expired: true`
4. `npm run sitemap` regenerates `sitemap.xml`
5. `npm run links` verifies URLs (needs outbound HTTPS)
6. Commit and push
7. GitHub Pages serves updated JSON
8. `index.html` fetches fresh data on load

## Validation Pipeline
```bash
npm run validate         # scripts/validate-content.js: schema, dates, enums, duplicates
npm run validate:routes  # validate-content.js: sitemap/route/data consistency
npm run validate:pages   # scripts/validate-pages-config.js: CNAME / Pages config
npm run links            # scripts/check-links.js: live URL check
npm run sitemap          # sitemap-generator.js
npm run expire           # scripts/mark-expired.js: flag lapsed listings
npm run check            # full release check
```

## Schema Contract

Every data file is a bare top-level JSON array. There is no wrapper object and no `_schema_version` /
`_last_updated` field; `index.html` and every script read the arrays directly. Changing this would be a
breaking change to all of them.

### Field Rules
- All fields: snake_case, immutable names
- Dates: `YYYY-MM-DD`
- Booleans: `true`/`false` (not strings)
- Arrays: always valid JSON arrays
- URLs: must include protocol (`https://`)
- No trailing commas
- 2-space indentation

### Required Fields (Every Opportunity)
Enforced by `scripts/validate-content.js`:
- `id` (string, unique)
- `slug` (string, kebab-case, unique)
- `title` (string)
- `category` (string; one of `learnership`, `internship`, `bursary`, `apprenticeship`, `tvet`)
- `sector` (string)
- `province` (string; a province from `provinces.json` or `Nationwide`)
- `qualification_level` (string)
- `stipend` (string)
- `closing_date` (string, YYYY-MM-DD)
- `application_url` (string, URL)
- `source_name` (string)
- `source_url` (string, URL)
- `verified` (boolean)
- `featured` (boolean)
- `expired` (boolean)
- `description` (string)
- `eligibility` (non-empty array of strings)
- `documents_needed` (non-empty array of strings)
- `employment_eligibility` (non-empty array of `"unemployed" | "student" | "employed"`) — who this opportunity is open to
- `tags` (non-empty array of strings)
- `posted_date`, `updated_date` (YYYY-MM-DD; `updated_date` is shown to users as "Last verified")

### Expiry
- The UI hides a listing after its closing day by comparing `closing_date` with the visitor's local date.
- The sitemap and route validator do **not** look at the date; they only use the `expired` flag, so the sitemap changes
  only when the data changes.
- Keep `expired` accurate: run `npm run expire` after dates pass. `npm run validate` warns about lapsed listings that are
  still `expired: false`; set `CONTENT_STRICT_EXPIRY=true` to make that an error.

## Temporary Limitations
- No concurrent editing (merge conflicts)
- No server-side validation at write time
- No user-generated content
- File size will grow (multi-MB eventually)
- No analytics on data access

## Migration Path
- Phase 3: PostgreSQL database + REST API
- Phase 4: Headless CMS (Directus/Strapi)
- Phase 5: AI-assisted content pipeline

## Prohibited
- Never store data in `index.html`
- Never bypass validation before pushing
- Never delete expired opportunities — mark `expired: true` (`npm run expire` does this)
- Never rename fields without backward compatibility plan
