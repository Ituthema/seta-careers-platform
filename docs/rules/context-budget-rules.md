# Context Budget Rules

- Primary file limit: 1 per task.
- Supporting file limit: 2 per task.
- JSON record scope: 1 record where applicable.
- Directory loading:
  - Do not load full directories.
  - Do not perform broad recursive scans.
  - Request explicit scope before expanding.
- Cross-module scanning:
  - Do not scan across modules unless explicitly requested.
  - Use named files, IDs, functions, or sections as anchors.
- Expansion rule:
  - Expand context only when blocked.
  - State why each added file is required.
