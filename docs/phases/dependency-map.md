# Dependency Map

## Frontend Dependencies

```
Homepage
├── Opportunity Model (data structure)
├── Category Data
├── Province Data
└── Search Hook
    └── Opportunity Model

Opportunity Detail
├── Opportunity Model
├── Bookmark Module
└── Share Utilities

Search
├── Opportunity Model
├── Province Data
├── Category Data
└── Search Filters
    ├── Province Filter
    ├── Category Filter
    ├── SETA Filter
    └── Qualification Filter

Bookmarks
└── Storage Abstraction
    └── localStorage (temp) → API (future)
```

## Data Pipeline Dependencies

```
Crawler
├── Source Registry (docs/source-registry.md)
└── robots.txt compliance

Parser
├── Crawler Output
└── Data Schema (docs/schema-draft.json)

Review Queue
├── Parser Output
└── Source Validator (scripts/validators/source-validator.js)

Publishing
├── Review Queue Approval
├── Data Schema Validation
└── Sitemap Regeneration
```

## Implementation Order

1. Data Schema (`docs/schema-draft.json`) — Permanent contract
2. Validation Scripts (`scripts/validate-content.js`)
3. Source Registry (`docs/source-registry.md`)
4. Crawler (documented in `docs/modules/crawler.md`)
5. Parser (after crawler)
6. Review Queue (after parser)
7. Publishing Automation (after review queue)
8. Admin Dashboard (after authentication)

## Rule

Before implementing a module, ALL its dependencies must be documented in `docs/modules/`.
