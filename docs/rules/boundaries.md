# Repository Boundaries

## AI Scope Rules
Every task MUST specify:
- Allowed directories
- Forbidden directories
- Entry files
- Context documents to read first

## Directory Access Matrix

| Task Type | Allowed | Forbidden |
|---|---|---|
| UI Feature | `index.html` | `data/`, `scripts/`, `crawler/` |
| Content | `data/*.json` | `index.html`, `scripts/` |
| Script | `scripts/` | `index.html`, `data/` (read-only) |
| SEO | `index.html`, `sitemap.xml`, `robots.txt` | `data/`, `scripts/` |
| Documentation | `docs/` | `index.html`, `data/`, `scripts/` |

## Temporary Feature Markers
Any code implementing temporary scaffolding MUST include:
:
// TEMPORARY: [feature name]
// TARGET: [permanent replacement]
// MIGRATION: [how to swap]


## Stop Condition
After completing the assigned task and committing, STOP.
