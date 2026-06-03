# Data Automation Blockers

## BLOCKER 1: Data directory casing mismatch

The requested lowercase `/data/...` paths do not exist on this case-sensitive filesystem. The audited JSON files are under `/Data/...`. Automation that expects lowercase paths will fail until the canonical directory casing is decided and applied consistently.
