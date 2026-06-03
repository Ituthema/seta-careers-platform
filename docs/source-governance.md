# Source Governance

This document defines how the platform manages source lifecycle, crawl cadence, and registry priority. The source registry is stored at `data/sources.json` and is validated by `npm run source:audit`.

## Source lifecycle

The current registry stores lifecycle state with the `active` boolean. Operationally, sources should be handled with the following lifecycle states:

| Lifecycle state | Registry representation | Meaning | Required action |
| --- | --- | --- | --- |
| `active` | `active: true` | The source is approved for discovery, health checks, and future crawler work. | Keep the URL and notes current. Review according to its frequency and priority. |
| `inactive` | `active: false` | The source is temporarily excluded from crawling, usually due to stale content, duplicated coverage, or maintenance. | Keep the entry for auditability. Add a note explaining why it is inactive and when it should be reviewed. |
| `deprecated` | `active: false` | The source has been replaced by another source or no longer publishes useful opportunities. | Keep the entry only when historical traceability matters. Add the replacement `source_id` in `notes` when available. |
| `blocked` | `active: false` | The source should not be crawled because of robots, legal, abuse-prevention, authentication, or repeated blocking concerns. | Do not crawl. Document the reason in `notes` and revisit only after a governance review. |

## Frequency values

Use these exact values in `frequency`:

| Value | Meaning | Typical use |
| --- | --- | --- |
| `hourly` | Check many times per day. | Critical API/RSS feeds that change frequently and are safe to poll. |
| `daily` | Check once per day. | High-signal pages with frequent new opportunities. |
| `weekly` | Check once per week. | Most careers pages, SETA notices, bursary pages, and municipal vacancy listings. |
| `monthly` | Check once per month. | Low-change reference pages or sources that only publish periodic rounds. |

## Priority values

Use these exact numeric values in `priority`:

| Priority | Label | Meaning |
| --- | --- | --- |
| `1` | Critical | Highest-value sources for South African careers, public vacancies, bursaries, learnerships, or internships. |
| `2` | High | Strong source with recurring opportunities or broad national/provincial relevance. |
| `3` | Medium | Useful source with regional, sector-specific, or less frequent opportunities. |
| `4` | Low | Opportunistic or low-frequency source kept for coverage completeness. |

## Governance rules

1. Every source must have a stable, kebab-case `source_id` that is never reused for a different organisation.
2. `type` must be one of `government`, `seta`, `university`, `municipality`, `soe`, or `private`.
3. `crawl_strategy` must be one of `html`, `pdf`, `rss`, `api`, or `hybrid`.
4. `frequency` must be one of `hourly`, `daily`, `weekly`, or `monthly`.
5. `priority` must be an integer from `1` to `4`.
6. `last_checked` and `last_success` must be `null` until automation records ISO-8601 UTC timestamps.
7. Material source changes should be documented in `notes`, especially lifecycle changes and blocked/deprecated reasons.
