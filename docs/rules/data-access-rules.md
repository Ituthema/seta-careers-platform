# Data Access Rules

- Use ID-scoped JSON operations.
- Prefer single-record updates.
- Preserve unrelated records.
- Preserve existing field names and schema shape.
- Bulk operations:
  - Require explicit instruction.
  - Require target file list or selection rule.
  - Require expected update behavior.
- Dataset parsing:
  - Avoid full dataset parsing unless necessary.
  - Prefer targeted extraction by ID or key.
  - Stop after the requested record scope is satisfied.
- Cross-file data changes:
  - Require explicit file and ID mapping.
  - Do not infer linked updates without instruction.
