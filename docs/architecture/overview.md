# Architecture Overview — CareerHub SA

## Purpose
South Africa's career opportunity intelligence platform for learnerships, bursaries, internships, and apprenticeships.

## Stack
- **Frontend:** Vanilla HTML5 / CSS3 / JavaScript (ES6+)
- **Hosting:** GitHub Pages (static site)
- **Data:** JSON files served statically from `/data/`
- **Build:** Zero build step — no bundler, no transpiler
- **Domain:** opportunitiesza.co.za (custom domain via CNAME)

## Temporary Scaffolding (Phase 1 Only)

These exist now for rapid launch but will be replaced as the project scales.

| Feature | Current | Target | Migration Phase | Why Temporary |
|---|---|---|---|---|
| Hosting | GitHub Pages | Vercel/Netlify → VPS | Phase 3 | No server-side processing, rate limits |
| Frontend | Single `index.html` (~94KB) | Vite + React/Vue/Svelte components | Phase 2 | Unmaintainable monolith, no testing isolation |
| Data | Static JSON files | PostgreSQL + REST API | Phase 3 | No concurrent editing, file size limits, no user-generated content |
| Build | Zero build step | Vite build pipeline | Phase 2 | No component reusability, no TypeScript, no tree-shaking |
| Search | Client-side only | Algolia/Typesense → Elasticsearch | Phase 4 | Loads entire dataset, no fuzzy matching, no analytics |
| Bookmarks | localStorage | Cloud-synced user accounts | Phase 3 | Device-specific, no sync, cleared on browser reset |
| Routing | Hash-based (`/#/`) | History API + SSR | Phase 4 | Bad for SEO, ugly URLs, no dynamic OG tags per page |
| Auth | None | JWT → OAuth | Phase 3 | Can't personalize, can't sync bookmarks, no admin roles |
| Crawler | Manual/undocumented | Scheduled AI pipeline | Phase 5 | No automation, no deduplication, no NLP parsing |
| Publishing | Manual git push | Auto-publish after review | Phase 5 | High error rate, no workflow (draft → review → publish) |
| Validation | Manual script runs | CI/CD automated | Phase 3 | Easy to forget, no enforcement |
| SEO | Basic OG tags | Full structured data + SSR | Phase 4 | No JSON-LD, no dynamic meta tags per opportunity |

## Permanent Contracts (Never Change)

These survive all architecture migrations:

- **Data schema:** Field names, types, structure — the API contract
- **User flow:** Search → Filter → View → Bookmark → Apply
- **SEO requirements:** sitemap.xml, OG tags, structured data, canonical URLs
- **Source governance:** Every opportunity must have verified official source
- **Mobile-first responsive design:** All UI must work on 320px+
- **Content validation rules:** Required fields, date formats, URL protocols

## Public Interfaces

| Interface | Location | Consumers | Stability |
|---|---|---|---|
| Opportunities API | `data/opportunities.json` | Frontend, sitemap generator | Permanent schema |
| Guides API | `data/guides.json` | Frontend | Permanent schema |
| Categories API | `data/categories.json` | Frontend | Permanent schema |
| Provinces API | `data/provinces.json` | Frontend | Permanent schema |
| Sitemap | `sitemap.xml` | Search engines | Auto-generated |

## Prohibited Modifications

- **NEVER** rename `index.html` — GitHub Pages requires it at root
- **NEVER** add a build step (Webpack, Vite, etc.) without Phase 2 migration plan
- **NEVER** commit `node_modules/`
- **NEVER** modify `CNAME` without DNS preparation
- **NEVER** delete data records — mark `expired: true` (retains SEO value)
- **NEVER** rename JSON field names without backward compatibility plan
- **NEVER** break the Search → Filter → View → Bookmark → Apply user flow

## Repository Boundaries

| Task Type | Allowed Directories | Forbidden Directories |
|---|---|---|
| UI Feature | `index.html` | `data/`, `scripts/`, `crawler/` |
| Content | `data/*.json` | `index.html`, `scripts/` |
| Script | `scripts/` | `index.html`, `data/` (read-only) |
| SEO | `index.html`, `sitemap.xml`, `robots.txt` | `data/`, `scripts/` |
| Documentation | `docs/` | `index.html`, `data/`, `scripts/` |

## Migration Roadmap

| Phase | Timeline | Focus | Key Deliverables |
|---|---|---|---|
| Phase 1: Launch | Now | Static scaffolding | GitHub Pages, JSON data, manual workflows |
| Phase 2: Structure | Month 3–4 | Build step + components | Vite, component extraction, TypeScript |
| Phase 3: Platform | Month 5–6 | Backend + database | Vercel/Netlify, PostgreSQL, REST API, JWT auth |
| Phase 4: Scale | Month 7–8 | SSR + search engine | Next.js/Nuxt, Algolia/Typesense, headless CMS |
| Phase 5: Intelligence | Month 9–12 | AI automation | AI crawler, NLP parser, review queue, auto-publish, ML scoring |
