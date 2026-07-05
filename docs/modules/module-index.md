# Module Index

## Module 01 — Authentication
- **Status:** Not implemented
- **Entry Point:** N/A
- **Dependencies:** None
- **Priority:** Low
- **Phase:** 3

## Module 02 — Homepage
- **Status:** Implemented in `index.html`
- **Entry Point:** `index.html` (route: `/`)
- **Dependencies:** Opportunity model, Category data, Province data
- **Priority:** High (maintain)
- **Phase:** 1

## Module 03 — Navigation
- **Status:** Implemented in `index.html`
- **Entry Point:** `index.html` (header/nav section)
- **Dependencies:** None
- **Priority:** High (enhance mobile menu)
- **Phase:** 1

## Module 04 — Search
- **Status:** Implemented in `index.html`
- **Entry Point:** `index.html` (search section)
- **Dependencies:** Opportunity model
- **Priority:** High (add filters)
- **Phase:** 1

## Module 05 — Opportunity Details
- **Status:** Implemented in `index.html`
- **Entry Point:** `index.html` (route: `/#/opportunity/{slug}`)
- **Dependencies:** Opportunity model, Bookmark module
- **Priority:** High (add related opportunities)
- **Phase:** 1

## Module 06 — Bookmarks
- **Status:** Implemented in `index.html`
- **Entry Point:** `index.html` (localStorage + bookmark buttons)
- **Dependencies:** None
- **Priority:** Medium (add export)
- **Phase:** 1

## Module 07 — SETA Directory
- **Status:** Partial (categories exist)
- **Entry Point:** `index.html` (category grid)
- **Dependencies:** Category data
- **Priority:** Medium (dedicated page)
- **Phase:** 2

## Module 08 — Province Pages
- **Status:** Partial (province filter exists)
- **Entry Point:** `index.html` (province grid + filter)
- **Dependencies:** Province data, Opportunity model
- **Priority:** Medium (dedicated pages)
- **Phase:** 2

## Module 09 — Crawler
- **Status:** Exists but undocumented
- **Entry Point:** `crawler/` directory
- **Dependencies:** Source registry, Data schema
- **Priority:** High (document and automate)
- **Phase:** 5

## Module 10 — Parser
- **Status:** Not implemented
- **Entry Point:** N/A
- **Dependencies:** Crawler output
- **Priority:** Medium
- **Phase:** 5

## Module 11 — Review Queue
- **Status:** Not implemented
- **Entry Point:** N/A
- **Dependencies:** Parser output
- **Priority:** Low
- **Phase:** 5

## Module 12 — Publishing
- **Status:** Manual (edit JSON, validate, push)
- **Entry Point:** `data/*.json`
- **Dependencies:** Validation scripts
- **Priority:** Medium (automate)
- **Phase:** 5

## Module 13 — Admin Dashboard
- **Status:** Not implemented
- **Entry Point:** N/A
- **Dependencies:** Authentication, Publishing
- **Priority:** Low
- **Phase:** 4

## Module 14 — SEO
- **Status:** Partial (sitemap, robots, OG tags)
- **Entry Point:** `index.html`, `sitemap.xml`, `robots.txt`
- **Dependencies:** Content data
- **Priority:** High (enhance structured data)
- **Phase:** 1

## Module 15 — Deployment
- **Status:** Implemented (GitHub Pages)
- **Entry Point:** `deploy.sh`, GitHub Actions
- **Dependencies:** None
- **Priority:** Medium (add CI validation)
- **Phase:** 1
