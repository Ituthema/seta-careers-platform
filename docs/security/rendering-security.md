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
