# Data Automation Blockers

## Current status

There are no known blocking issues for the canonical data automation path.
The repository now uses lowercase `data/` JSON paths consistently for the
runtime app, content validators, sitemap generator, and GitHub Pages workflow.

## Resolved blockers

### Resolved: Data directory casing mismatch

The earlier audit noted that lowercase `/data/...` paths were missing and that
JSON files lived under `/Data/...`. That blocker is no longer current:
canonical files now exist under `data/`, and automation should continue to use
those lowercase paths for Linux and GitHub Pages compatibility.

## Watch list

- Keep generated `sitemap.xml` committed after content changes.
- Run `npm run check` before publishing so JSON validation, link checks, and
  sitemap generation stay aligned.
- Treat external link-check warnings as maintenance prompts; some official
  career portals block automated HEAD/GET requests even when the page is usable
  in a browser.
