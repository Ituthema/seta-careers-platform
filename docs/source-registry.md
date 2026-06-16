# Source Registry

The source registry is the canonical list of organisations and pages that the platform can audit, monitor, and eventually crawl for South African career opportunities. It is intentionally separate from published opportunity content so new ingestion tooling can be built without changing the current website data model.

## Registry location

```text
data/sources.json
```

The file is a JSON array of source objects. Every object must follow the same schema so scripts can validate, health-check, and later crawl sources consistently.

## Source schema

```json
{
  "source_id": "dpsa",
  "name": "Department of Public Service and Administration (DPSA)",
  "type": "government",
  "url": "https://www.dpsa.gov.za/newsroom/psvc/",
  "active": true,
  "crawl_strategy": "pdf",
  "frequency": "weekly",
  "priority": 1,
  "last_checked": null,
  "last_success": null,
  "notes": "Public Service Vacancy Circulars."
}
```

## Field meanings

| Field | Type | Required | Meaning | Validation |
| --- | --- | --- | --- | --- |
| `source_id` | string | Yes | Stable machine identifier used in reports, logs, future crawler records, and deduplication. | Must be unique and kebab-case: lowercase letters, numbers, and single hyphens only. |
| `name` | string | Yes | Human-readable organisation or source name. | Must be a non-empty string. |
| `url` | string | Yes | Best landing page for vacancies, bursaries, learnerships, internships, supplier notices, or programme announcements. | Must be a unique absolute `http` or `https` URL. |
| `type` | string | Yes | Source category used for coverage reporting and governance. | Must be one of the approved source types below. |
| `active` | boolean | Yes | Whether this source is eligible for health checks and future crawler runs. | Must be `true` or `false`. |
| `crawl_strategy` | string | Yes | Expected extraction approach for future ingestion. | Must be one of the approved crawl strategies below. |
| `frequency` | string | Yes | Intended review or crawl cadence. | Must be one of the approved frequencies below. |
| `priority` | number | Yes | Relative source importance. `1` is highest priority and `4` is lowest. | Must be `1`, `2`, `3`, or `4`. |
| `last_checked` | string/null | Yes | Timestamp reserved for automation to record the most recent probe or crawl attempt. | Must be `null` or an ISO-8601 UTC timestamp. |
| `last_success` | string/null | Yes | Timestamp reserved for automation to record the most recent successful probe or crawl. | Must be `null` or an ISO-8601 UTC timestamp. |
| `notes` | string | Yes | Operational context: what the source publishes, special handling, lifecycle notes, or replacement source IDs. | Must be a string; empty notes produce a warning. |

## Approved enum values

### Source types

- `government` — national or provincial departments, public agencies, and government programmes.
- `seta` — Sector Education and Training Authorities.
- `university` — universities and universities of technology.
- `municipality` — metropolitan, district, or local municipalities.
- `soe` — state-owned enterprises and public companies.
- `private` — private employers, banks, retailers, telcos, industrial firms, and similar organisations.

### Crawl strategies

- `html` — content is primarily on standard web pages.
- `pdf` — content is primarily published in PDFs.
- `rss` — content is available through RSS/Atom feeds.
- `api` — content is available through a structured API.
- `hybrid` — source requires multiple approaches, such as HTML pages plus PDF attachments or external career portals.

### Frequencies

- `hourly` — high-volume feeds that are safe and valuable to poll multiple times per day.
- `daily` — high-signal sources with frequent postings.
- `weekly` — normal cadence for most careers pages, SETA notices, and government vacancy pages.
- `monthly` — low-change sources or periodic opportunity rounds.

## Onboarding process

1. **Identify the source.** Confirm the organisation publishes opportunities relevant to the platform: jobs, bursaries, learnerships, apprenticeships, internships, graduate programmes, tenders, or career guidance.
2. **Choose the canonical URL.** Prefer the most specific public landing page that lists opportunities. Avoid search results, login-only pages, expired campaign pages, and third-party mirrors unless they are the official application portal.
3. **Assign a stable `source_id`.** Use a concise kebab-case ID. Do not reuse IDs from removed or deprecated sources.
4. **Classify the source.** Pick the closest `type`, `crawl_strategy`, `frequency`, and `priority` values from the approved enums.
5. **Add operational notes.** Explain what the source publishes and record any known handling requirements, such as PDFs, external applicant tracking systems, or blocked automation.
6. **Validate locally.** Run `npm run source:audit` and resolve every `FAIL` before merging. Review any `WARN` output and update notes or metadata where appropriate.
7. **Probe health.** Run `npm run source:health` to generate a fresh health report for active sources. Non-2xx responses are warnings by default because some public websites block automated probes.
8. **Review reports.** Confirm `reports/source-audit-report.json` and `reports/source-health-report.json` were regenerated and contain expected results.

## Deactivation process

Use deactivation when a source should remain in the registry for auditability but should not be crawled or health-checked.

1. Set `active` to `false`.
2. Keep `source_id`, `name`, `url`, and `type` unchanged unless the organisation itself changed.
3. Update `notes` with the deactivation reason, date, and any replacement `source_id`.
4. Leave `last_checked` and `last_success` unchanged unless an automation process updates them.
5. Run `npm run source:audit` to verify the inactive source still follows schema rules.
6. Do not delete a source unless there is no governance, audit, or historical reason to retain it.

Common deactivation reasons include duplicated coverage, discontinued opportunity pages, permanent redirects to a better source, legal or robots concerns, login-only access, repeated blocking, or source content no longer matching the platform scope.

## Validation rules

The reusable validator lives at:

```text
scripts/validators/source-validator.js
```

It enforces these rules for `source-audit.js`, `source-health-check.js`, and future crawler code:

- The registry root must be an array.
- Required fields must be present: `source_id`, `name`, `url`, `type`, `active`, `crawl_strategy`, `frequency`, `priority`, `last_checked`, `last_success`, and `notes`.
- `source_id` values must be unique and kebab-case.
- `url` values must be valid absolute `http` or `https` URLs and must be unique after normalization.
- `type`, `frequency`, `crawl_strategy`, and `priority` must match approved enum values.
- `name` must be non-empty.
- `active` must be boolean.
- `last_checked` and `last_success` must be `null` or ISO-8601 UTC timestamps.
- `notes` must be a string; blank notes are reported as warnings.

## Operational scripts and reports

Run the registry audit:

```bash
npm run source:audit
```

The audit prints a `PASS`, `WARN`, or `FAIL` summary and writes:

```text
reports/source-audit-report.json
```

Run the active-source health check:

```bash
npm run source:health
```

The health check records HTTP status, redirects, response time, SSL availability, and overall health for every active source, then writes:

```text
reports/source-health-report.json
```

The health command exits successfully for warnings unless strict mode is enabled:

```bash
SOURCE_HEALTH_STRICT=1 npm run source:health
```

## Crawler rejection reasons

The crawler preserves the existing rejected-record shape: each rejection still includes `source_id`, `url`, `reason`, optional `details`, and the timestamp added by the staging pipeline. Source registry validation failures now use a specific reason so operators can distinguish bad registry metadata from fetched content validation failures.

| Reason | Stage | Meaning |
| --- | --- | --- |
| `INVALID_SOURCE_REGISTRY` | Source loader | An active source failed `scripts/validators/source-validator.js` checks before crawl processing. |
| `FETCH_FAILED` | Fetcher | The source could not be fetched after configured retries. |
| `UNSUPPORTED_CONTENT_TYPE` | Router | The fetched response could not be routed to a supported parser. |
| `PARSER_ERROR` | Parser | Supported content was fetched, but parsing threw an error. |
| `VALIDATION_FAILED` | Rejection pipeline | Parsed and normalized content failed downstream content validation. |

Example source registry rejection:

```json
{
  "timestamp": "2026-06-16T00:00:00.000Z",
  "source_id": "sources[4]",
  "url": "",
  "reason": "INVALID_SOURCE_REGISTRY",
  "details": [
    "sources[4].source_id must be a non-empty kebab-case identifier.",
    "sources[4].url must be a non-empty string."
  ]
}
```

Example crawl report rejection summary:

```json
{
  "rejected_records": 2,
  "rejected_by_reason": {
    "INVALID_SOURCE_REGISTRY": 1,
    "FETCH_FAILED": 1
  }
}
```
