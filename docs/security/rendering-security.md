# Rendering Security

- Scope: opportunity data rendered in `index.html`.
- Data status: all values from `/data/opportunities.json` and crawler outputs are untrusted.
- Shared layer: use the `SECURITY` helpers in `index.html`.

## Approved Patterns

- Text nodes: `esc(value)` before HTML-string insertion.
- Attributes: `attr(value)` before attribute interpolation.
- URLs: `safeUrl(value)` before assigning `href` or URL-bearing data attributes.
- IDs/classes: `safeId(value)` for generated selector/class fragments.
- Events: `data-action` + delegated `addEventListener()`.
- Bookmark data: store IDs in `data-bookmark-id`; read through `dataset`.

## Prohibited Patterns

- Raw opportunity fields inside `innerHTML` templates.
- Raw opportunity fields in attributes, IDs, classes, or URLs.
- `javascript:` or unsupported protocols in links.
- Inline event handlers for opportunity cards, related opportunities, bookmarks, or copy-link actions.
- Duplicated escaping logic outside the shared helpers.

## Examples

- Safe text: `` `<h3>${esc(opportunity.title)}</h3>` ``
- Safe attribute: `` `<div data-opp-id="${attr(opportunity.id)}">` ``
- Safe URL: `` `<a href="${attr(safeUrl(opportunity.url))}">Apply</a>` ``
- Safe event: `` `<button data-action="open-opp" data-opp-id="${attr(opportunity.id)}">` ``

## Documented Exceptions

- `guide.body` (rendered raw, unescaped, in `renderGuideDetail()`) is
  the one deliberate exception to "Raw opportunity fields inside
  innerHTML templates" above. `data/guides.json`'s `body` field
  contains real authored HTML (`<h2>`, `<p>`, `<strong>`, etc.) that is
  meant to render as formatted content — escaping it with `esc()`
  would display literal tag text instead of formatting every guide
  page.
- This is safe ONLY under the current trust model: `data/guides.json`
  is authored exclusively by the site owner directly editing the JSON
  file. It is NOT currently open to additional contributors, an admin
  CMS, or an API.
- If that trust boundary ever changes (e.g. a CMS, multi-author
  workflow, or API-driven guide authoring is introduced), `guide.body`
  becomes a stored-XSS vector of identical severity to the ones this
  document exists to prevent elsewhere, and must be run through a real
  HTML sanitizer with an explicit allowed-tag/attribute list (e.g.
  DOMPurify) before this exception can remain in place — NOT wrapped in
  `esc()`, which would just break every guide's formatting instead of
  safely neutralizing untrusted markup.
- Do not extend this exception to any other field without the same
  explicit trust-model reasoning documented here first.
