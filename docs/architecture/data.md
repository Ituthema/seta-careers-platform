# Data Architecture

## Canonical Source
`data/` directory contains the single source of truth.

## Files
| File | Purpose | Schema | Records |
|---|---|---|---|
| `opportunities.json` | All opportunity listings | See `docs/schema-draft.json` | ~50+ |
| `guides.json` | Educational guide articles | Title, content, tags, date | ~10+ |
| `categories.json` | Category metadata | Name, slug, description, icon | ~15 |
| `provinces.json` | Province list | Name, slug, code | 9 |

## Data Flow
1. Content added to `data/*.json`
2. Run `node validate-content.js` to validate
3. Run `node sitemap-generator.js` to update sitemap
4. Run `node scripts/check-links.js` to verify URLs
5. Commit and push
6. GitHub Pages serves updated JSON
7. `index.html` fetches fresh data on load

## Validation Pipeline
```bash
npm run validate   # validate-content.js
npm run links      # check-links.js
npm run sitemap    # sitemap-generator.js
npm run check      # full release check
```

## Schema Contract (Permanent — Never Change)

Add to all data files:
```json
{
  "_schema_version": "1.0",
  "_last_updated": "2026-07-04",
  "opportunities": [...]
}
```

### Field Rules
- All fields: snake_case, immutable names
- Dates: `YYYY-MM-DD`
- Booleans: `true`/`false` (not strings)
- Arrays: always valid JSON arrays
- URLs: must include protocol (`https://`)
- No trailing commas
- 2-space indentation

### Required Fields (Every Opportunity)
- `id` (string)
- `slug` (string, unique)
- `title` (string)
- `category` (string)
- `sector` (string)
- `province` (string)
- `closing_date` (string, YYYY-MM-DD)
- `application_url` (string, URL)
- `source_name` (string)
- `source_url` (string, URL)
- `verified` (boolean)
- `expired` (boolean)

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
- Never delete expired opportunities — mark `expired: true`
- Never rename fields without backward compatibility plan
