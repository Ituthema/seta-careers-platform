# Rulesets

## JSON_SINGLE_FILE_EDIT_V1

- Use for one JSON file.
- Target one record by ID when possible.
- Load no full dataset unless required.
- Apply `docs/rules/data-access-rules.md`.
- Apply `docs/rules/context-budget-rules.md`.
- Do not modify unrelated records.

## SCRIPT_FUNCTION_EDIT_V1

- Use for one script function.
- Load one primary script.
- Load only direct supporting files.
- Preserve existing script responsibilities.
- Do not add dependencies unless requested.
- Apply `docs/rules/context-budget-rules.md`.

## INDEX_HTML_SECTION_EDIT_V1

- Use for one `index.html` section.
- Load target section only.
- Load adjacent CSS or JS only when required.
- Preserve unrelated sections and behavior.
- Avoid full SPA reinterpretation.
- Apply `docs/rules/context-budget-rules.md`.
