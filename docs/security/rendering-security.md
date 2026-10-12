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
- Category and province metadata from `data/categories.json` / `data/provinces.json` (labels, descriptions, icons, colours) is untrusted too: `esc()` text, `attr()` attribute and `style` values, including `<option>` values and labels.
- Guide bodies: `sanitizeGuideHtml()` (see Documented Exceptions).

## Prohibited Patterns

- Raw opportunity fields inside `innerHTML` templates.
- Raw opportunity fields in attributes, IDs, classes, or URLs.
- `javascript:` or unsupported protocols in links.
- Inline event handlers for opportunity cards, related opportunities, bookmarks, or copy-link actions.
- Interpolating any data field into an inline handler. Some inline `onclick` handlers still exist (navigation, footer, tool pages, calendar controls, and `copyOppUrl(this)`, which reads the URL from `data-copy-url`). They contain only hard-coded constants or values built from numbers (the calendar date). Keep it that way, and prefer `data-action` when touching them.
- Duplicated escaping logic outside the shared helpers.

## Examples

- Safe text: `` `<h3>${esc(opportunity.title)}</h3>` ``
- Safe attribute: `` `<div data-opp-id="${attr(opportunity.id)}">` ``
- Safe URL: `` `<a href="${attr(safeUrl(opportunity.url))}">Apply</a>` ``
- Safe event: `` `<button data-action="open-opp" data-opp-id="${attr(opportunity.id)}">` ``

## Documented Exceptions

- `guide.body` is the one field that legitimately carries HTML. `data/guides.json` stores authored markup
  (`<h2>`, `<p>`, `<strong>`, lists), and escaping it with `esc()` would print literal tags.
- It is therefore **not** escaped, but it is no longer inserted raw either: `renderGuideDetail()` passes it through
  `sanitizeGuideHtml()` in `index.html`.
  - It parses with `DOMParser` (no script execution, no resource loading) and rebuilds a fresh tree.
  - Allowed elements: `h2 h3 h4 p ul ol li strong b em i br blockquote a`.
  - Every attribute is dropped, except `href` on `<a>`, which must pass `safeUrl()` (http/https only) and is
    rewritten with `target="_blank" rel="noopener noreferrer"`.
  - `script style iframe object embed template noscript svg math` are removed together with their contents.
    Any other unknown element is unwrapped to its text.
- This keeps `guide.body` safe even if the trust model changes (CMS, multiple authors, API-driven content),
  but the allowlist is the contract: to support a new tag or attribute, extend `GUIDE_ALLOWED_TAGS` deliberately
  rather than loosening the sanitizer.
- Do not extend raw-HTML rendering to any other field without the same explicit reasoning documented here first.
