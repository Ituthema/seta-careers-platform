# Generated reports

`source-audit-report.json` and `source-health-report.json` are generated files and are not tracked in git. A committed copy goes stale (the old health report was months out of date and showed every source as down), so the latest ones live here instead:

- **Weekly:** the `Source Registry Health` workflow (Mondays) uploads both as the `source-reports` artifact (kept 90 days) and prints a summary on the run page: GitHub > Actions > Source Registry Health > latest run.
- **Registry timestamps:** the same run opens one pull request (`automation/source-freshness`) that records `last_checked` / `last_success` in `data/sources.json`.
- **Locally:** `npm run source:audit -- --write-report` and `npm run source:health -- --write-report` write them into this folder (git ignores them).

How to read a health report: a 403 or timeout from a government or SETA site usually means it blocks automated requests, not that it has nothing to publish. Sources the crawler cannot read are marked `access: "manual"` in `data/sources.json` and covered by the manual-sources checklist workflow.
