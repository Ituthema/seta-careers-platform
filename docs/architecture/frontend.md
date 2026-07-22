# Frontend Architecture

## Single File SPA
The current frontend is a temporary launch-phase monolith. The entire website is contained in `index.html` (~94KB). It is a self-contained Single Page Application using:
- Vanilla JavaScript (no frameworks)
- CSS embedded in `<style>` tags
- HTML templates rendered via JS
- Client-side routing via hash fragments (`#/opportunity/slug`)

This single-file approach is intentional for Phase 1 speed and GitHub Pages compatibility, but it is not the target architecture. It should be treated as scaffolding that will be extracted into reusable components, pages, hooks, styles, and routing utilities during Phase 2.

## Entry Point
- **File:** `index.html`
- **Load sequence:** HTML → CSS → JS → fetch `/data/opportunities.json` → render
- **Hosting contract:** GitHub Pages serves the root `index.html` file directly.
- **Data contract:** The frontend consumes static JSON from `/data/`, especially `/data/opportunities.json`.

## Key Sections in index.html

The monolith should be annotated with component boundary comments before extraction work begins. These markers are documentation breadcrumbs for future maintainers and migration tooling.

### Component Boundary Marker Format
Use this exact comment pattern around each logical UI section:

```html
<!-- COMPONENT: ComponentName -->
<!-- MIGRATION: Will become src/components/ComponentName.jsx -->
<!-- DEPENDENCIES: dependency names or None -->
<!-- PROPS: propName (type), anotherProp (type) -->
<section-or-div>...</section-or-div>
<!-- END COMPONENT: ComponentName -->
```

For sections that do not accept props, omit the `PROPS` line or write `<!-- PROPS: None -->`. For route-level sections, use the future `src/pages/` location in the migration comment.

### Header
```html
<!-- COMPONENT: Header -->
<!-- MIGRATION: Will become src/components/Header.jsx -->
<!-- DEPENDENCIES: None -->
<header>...</header>
<!-- END COMPONENT: Header -->
```

### OpportunityCard
```html
<!-- COMPONENT: OpportunityCard -->
<!-- MIGRATION: Will become src/components/OpportunityCard.jsx -->
<!-- PROPS: opportunity (object) -->
<div class="opportunity-card">...</div>
<!-- END COMPONENT: OpportunityCard -->
```

### SearchBar
```html
<!-- COMPONENT: SearchBar -->
<!-- MIGRATION: Will become src/components/SearchBar.jsx -->
<!-- DEPENDENCIES: search state, filter state -->
<!-- PROPS: query (string), onSearch (function) -->
<form class="search-bar">...</form>
<!-- END COMPONENT: SearchBar -->
```

### FilterPanel
```html
<!-- COMPONENT: FilterPanel -->
<!-- MIGRATION: Will become src/components/FilterPanel.jsx -->
<!-- DEPENDENCIES: categories data, provinces data, filter state -->
<!-- PROPS: filters (object), categories (array), provinces (array), onFilterChange (function) -->
<aside class="filter-panel">...</aside>
<!-- END COMPONENT: FilterPanel -->
```

### Footer
```html
<!-- COMPONENT: Footer -->
<!-- MIGRATION: Will become src/components/Footer.jsx -->
<!-- DEPENDENCIES: None -->
<footer>...</footer>
<!-- END COMPONENT: Footer -->
```

### Route-Level Page Boundaries
Route render blocks should use the same marker format, but point to `src/pages/`:

```html
<!-- COMPONENT: HomePage -->
<!-- MIGRATION: Will become src/pages/HomePage.jsx -->
<!-- DEPENDENCIES: OpportunityCard, SearchBar, FilterPanel -->
<!-- PROPS: opportunities (array), filters (object) -->
<main>...</main>
<!-- END COMPONENT: HomePage -->
```

Known page targets include:
- `HomePage.jsx` for the default opportunity listing.
- `OpportunityDetailPage.jsx` for individual opportunity detail routes.
- `CategoryPage.jsx` for category-filtered listings.
- `ProvincePage.jsx` for province-filtered listings.

## Routing
- Hash-based routing is used for GitHub Pages compatibility.
- Current route patterns:
  - `/#/` — homepage
  - `/#/directory` — full opportunity directory
  - `/#/directory/{category}` — directory pre-filtered by category
    (`learnership`, `internship`, `bursary`, `apprenticeship`)
  - `/#/opportunity/{id}` — opportunity detail page, keyed by the
    opportunity's `id` field (NOT its `slug`)
  - `/#/guides/{id}` — guide detail page, keyed by the guide's `id`
    field (e.g. `g001`; NOT its `slug`)
  - `/#/calendar`, `/#/tools`, `/#/eligibility`, `/#/scam`,
    `/#/checklist`, `/#/bursary-checker`, `/#/guides`,
    `/#/provinces`, `/#/saved`, `/#/about` — top-level pages matched
    by RouterWrapper.apply()'s catch-all `else{ _page=parts[0]; }`
    branch
  - There is no `/#/category/{slug}` or `/#/province/{slug}` route.
    Category filtering happens via `/#/directory/{category}`;
    province filtering is client-side UI state on `/#/provinces` and
    `/#/directory`, not a distinct route per province.
- `404.html` converts legacy path-style URLs (e.g. `/opportunity/001`
  from before the hash-route scheme was adopted, or stray external
  backlinks) into the equivalent `/#/...` hash route and redirects
  there, so old links still resolve into the correct page instead of
  falling back to the homepage. See 404.html for the conversion logic.

The hash router is temporary. It should be replaced with History API routing during the component/build migration and then with SSR-compatible routing during Phase 4.

## State Management
- Pure JavaScript objects are used for UI and data state.
- There is no external state management library.
- Opportunities are loaded from `/data/opportunities.json` and held client-side.
- Search and filter state live in browser memory during the session.
- Bookmarks are stored in `localStorage` under the key `careerhub_bookmarks`.

The current state model is acceptable for launch, but it couples rendering, routing, data loading, and persistence inside the monolith. During extraction, state responsibilities should move into focused hooks such as `useOpportunities`, `useSearch`, and `useBookmarks`.

## Dependencies
- None. Zero external JavaScript libraries.
- No bundler.
- No transpiler.
- No framework runtime.
- No package-managed frontend build pipeline.

This dependency-free approach keeps Phase 1 deployment simple, but it also prevents component isolation, typed interfaces, tree-shaking, and modern developer tooling.

## Temporary Limitations
The monolithic frontend is explicitly temporary and should not be expanded indefinitely. Known limitations include:
- No component reusability (copy-paste HTML/JS)
- No separation of concerns (HTML mixed with CSS mixed with JS)
- No testing isolation (can't unit test functions in 94KB file)
- No hot reloading (must edit one giant file)
- No lazy loading (entire app loads at once)
- No type safety for opportunity objects, route params, or UI state
- No route-level code splitting
- No dynamic per-route metadata for SEO
- No independent visual testing for cards, filters, headers, or page layouts

## Migration Path

### Phase 2: Component Extraction (Month 3–4)
Extract the monolith into a build-backed frontend structure. The initial target may use React, Vue, or Svelte through Vite, but the planned component names and boundaries are:

```text
src/
├── components/
│   ├── Header.jsx
│   ├── OpportunityCard.jsx
│   ├── SearchBar.jsx
│   ├── FilterPanel.jsx
│   └── Footer.jsx
├── pages/
│   ├── HomePage.jsx
│   ├── OpportunityDetailPage.jsx
│   ├── CategoryPage.jsx
│   └── ProvincePage.jsx
├── hooks/
│   ├── useOpportunities.js
│   ├── useSearch.js
│   └── useBookmarks.js
├── styles/
│   └── variables.css
└── utils/
    └── router.js
```

Phase 2 extraction steps:
1. Add component boundary comments to `index.html` before moving code.
2. Extract static layout sections first (`Header`, `Footer`).
3. Extract repeated UI units (`OpportunityCard`).
4. Extract interactive controls (`SearchBar`, `FilterPanel`).
5. Extract route-level page render functions into `pages/`.
6. Move data loading into `useOpportunities`.
7. Move search/filter logic into `useSearch`.
8. Move bookmark persistence into `useBookmarks`.
9. Move hash parsing and route generation into `utils/router.js`.
10. Add unit tests around hooks and utilities before changing data contracts.

### Phase 3: Platform Integration (Month 5–6)
When the backend and database arrive, keep the frontend data contract stable while replacing static JSON reads with API calls:
- Preserve opportunity field names for backward compatibility.
- Keep bookmark UX unchanged while adding authenticated cloud sync.
- Add loading, empty, and error states around API requests.
- Introduce environment-specific API base URLs.

### Phase 4: SSR (Month 7–8)
- Migrate to Next.js or Nuxt.
- Server-side render opportunity pages for SEO.
- Generate dynamic meta tags per opportunity.
- Replace hash routes with clean canonical URLs.
- Add structured data per detail page.
- Preserve GitHub Pages-era URLs with redirects where possible.

## Architecture Rules Until Extraction
- Do not rename `index.html` while GitHub Pages is the host.
- Do not introduce a build step without executing the Phase 2 migration plan.
- Do not add external frontend dependencies casually; the current dependency contract is zero external JS libraries.
- Do not rename JSON fields consumed by the frontend without a backward compatibility plan.
- Keep the Search → Filter → View → Bookmark → Apply user flow intact during every migration phase.
