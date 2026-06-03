# Source Registry

The source registry moves the project from manually curated JSON content toward a source-registry-driven platform. It does not change the current website functionality; it adds a validated discovery layer that future ingestion and crawler workflows can use.

## Registry location

The registry lives at:

```text
data/sources.json
```

It is an array of source objects with this shape:

```json
[
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
]
```

## Field reference

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `source_id` | string | Yes | Stable kebab-case identifier used by scripts, logs, and future ingestion records. |
| `name` | string | Yes | Human-readable organisation or source name. |
| `type` | string | Yes | One of the approved source types. |
| `url` | string | Yes | Absolute HTTP(S) URL for the best available source landing page. |
| `active` | boolean | Yes | Whether the source is currently eligible for health checks and future crawling. |
| `crawl_strategy` | string | Yes | Expected extraction strategy: `html`, `pdf`, `rss`, `api`, or `hybrid`. |
| `frequency` | string | Yes | Review/crawl cadence: `hourly`, `daily`, `weekly`, or `monthly`. |
| `priority` | number | Yes | Importance score from `1` (critical) to `4` (low). |
| `last_checked` | string/null | Yes | Reserved for future automation; must be `null` or an ISO-8601 UTC timestamp. |
| `last_success` | string/null | Yes | Reserved for future automation; must be `null` or an ISO-8601 UTC timestamp. |
| `notes` | string | Yes | Context for what the source publishes or why it is included. |

## Allowed source types

```json
[
  "government",
  "seta",
  "university",
  "municipality",
  "soe",
  "private"
]
```

## Allowed crawl strategies

```json
[
  "html",
  "pdf",
  "rss",
  "api",
  "hybrid"
]
```

## Scripts

Run a schema and governance audit:

```bash
npm run source:audit
```

Run a registry audit plus active-source URL probe:

```bash
npm run source:health
```

The health check is intentionally non-strict by default because public-sector and employer websites may block automated requests, reject `HEAD`, redirect through third-party career portals, or temporarily rate-limit probes. To make non-2xx or unreachable sources fail the command, run:

```bash
SOURCE_HEALTH_STRICT=1 npm run source:health
```

For a faster smoke test, limit the number of active sources probed:

```bash
SOURCE_HEALTH_LIMIT=10 npm run source:health
```

## Current coverage

The initial registry contains more than 50 high-value South African sources across these categories:

- Government departments and public entities.
- Sector Education and Training Authorities (SETAs).
- Universities.
- State-owned enterprises (SOEs).
- Major private employers.
- Metropolitan and major municipalities.
