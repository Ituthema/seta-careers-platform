# UI Context

- Scope: `index.html` only.
- Responsibilities:
  - Define application structure, UI sections, inline behavior, and static references.
  - Preserve current user-facing behavior unless explicitly changed.
- Reasoning scope:
  - Work at section level.
  - Identify the target section before editing.
  - Avoid full SPA reinterpretation.
- Context loading:
  - Load only the target section by default.
  - Load minimal adjacent markup, styles, or script needed for the section.
  - Do not scan unrelated sections unless requested.
- Supporting context:
  - Use named IDs, classes, handlers, or data attributes as anchors.
  - Include data or script context only when directly required.
- Related rules:
  - `docs/rules/context-budget-rules.md`
  - `docs/templates/rulesets.md#index_html_section_edit_v1`
