# Data Architecture

## Canonical Source
`data/` directory contains the single source of truth.

## Files
| File | Purpose | Top-level shape | Fields |
|---|---|---|---|
| `opportunities.json` | All opportunity listings | Array of records | See "Required Fields" below and `docs/schema-draft.json` (reference draft; runtime validation is defined by `scripts/validate-content.js`) |
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
npm run sitemap          # scripts/generate-seo-pages.js (static SEO pages + sitemap)
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
- URLs: validator accepts `http://` and `https://`; prefer HTTPS
- No trailing commas
- 2-space indentation

### Required Fields (Every Opportunity)
Enforced by `scripts/validate-content.js`:
- `id` (string, unique)
- `slug` (string, kebab-case, unique)
- `title` (string)
- `category` (string; validator accepts `learnership`, `internship`, `bursary`, `apprenticeship`, `tvet`, `job`)
- `sector` (string; `Not stated` when unknown)
- `province` (string; a province from `provinces.json`, `Nationwide`, or `Not stated` when unknown)
- `qualification_level` (string; `Not stated` when unknown)
- `stipend` (string; `Not stated` when unknown)
- `closing_date` (string, YYYY-MM-DD, or `null` when the advert publishes none)
- `application_url` (string, URL)
- `source_name` (string)
- `source_url` (string, URL)
- `verified` (boolean)
- `featured` (boolean)
- `expired` (boolean)
- `description` (string; a fixed placeholder when none was available)
- `eligibility` (array of strings; `[]` when unknown)
- `documents_needed` (array of strings; `[]` when unknown)
- `employment_eligibility` (array of `"unemployed" | "student" | "employed"`; `[]` when unknown) — who this opportunity is open to
- `tags` (array of strings; may be empty)
- `field_notes` (optional object, field name -> comment; see below)
- `posted_date`, `updated_date` (YYYY-MM-DD; `updated_date` is shown to users as "Last verified")

### Missing fields and `field_notes`
An advert often leaves things out. That must not block a listing, and it must never be hidden: the field is stored as
missing **and** explained in `field_notes`. Implemented in `scripts/lib/field-notes.js`; tested by
`scripts/lib/field-notes.test.js`, `scripts/lib/listing-draft.test.js` and enforced by `scripts/validate-content.js`.

| Field | Stored as "missing" | Example comment |
| --- | --- | --- |
| `sector`, `province`, `qualification_level`, `stipend` | `"Not stated"` | `Stipend unknown: the advert does not state one.` |
| `closing_date` | `null` | `Closing date unknown: no closing date was published. Confirm on the official page before applying.` |
| `description` | fixed placeholder sentence | `No description was available when this listing was added.` |
| `eligibility`, `documents_needed`, `employment_eligibility` | `[]` | `Required documents unknown: the advert does not list any.` |

Rules:
- Every missing field MUST have a non-empty comment in `field_notes`; `npm run validate` fails otherwise.
- `field_notes` keys must be one of the fields above. Fields that have a real value need no comment.
- Only `title`, `category` and a link (`application_url` or `source_url`) are essential for `npm run add:listing`; the
  builder fills a missing field's marker value and default comment (a draft can supply its own comment in `field_notes`).
- A value that is supplied must still be valid: a bad date or unknown province is an error, not "missing".
- A closing date in the past is still refused; a missing one is allowed. `npm run expire` and the lapsed-date warning skip
  listings with no date, so re-check them by hand.

**Status (this change):** the data contract, builder and validator are implemented and tested. Display of the notes in the
UI, static pages, calendar and sitemap handling of undated listings is **planned** (follow-up batch); until it merges, do
not publish a listing with missing fields.

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
