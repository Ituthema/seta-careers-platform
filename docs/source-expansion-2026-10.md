# Opportunity Source Expansion — October 2026

**Research checked:** 2026-10-18  
**Repository:** `Ituthema/seta-careers-platform`  
**Scope:** Expand the existing source registry using findings from the source-registry research. This document records source-discovery evidence and ingestion policy; it does not assert that every listed organisation currently has an open vacancy.

## Changes applied

Two durable official discovery pages were added to `data/sources.json`:

| Source ID | Official URL | Type | Priority | Cadence | Why it is registered |
| --- | --- | --- | --- | --- | --- |
| `govza-government-jobs-week` | https://www.gov.za/government-jobs-week | Government | 1 | Weekly | National government index linking to the current Public Service Vacancy Circular and dated notices. Follow the linked circular and preserve its publication date and circular number. |
| `nsfas-application-guidance` | https://www.nsfas.org.za/content/how-to-apply.html | Government | 1 | Weekly | Official funding-cycle and application guidance; validate intake year and deadlines against this page before publishing an opportunity. |

The registry now contains 75 source records. Existing records for DPSA, MQA, MISA, Crawford International, City of Johannesburg's job portal, NSFAS, SAQA, and other SETAs/employers were reviewed rather than duplicated. Relevant operational notes were strengthened to identify primary evidence, expiry risks, and unresolved canonical-domain questions.

## Findings mapped to existing registry entries

| Research finding | Registry handling | Required ingestion treatment |
| --- | --- | --- |
| DPSA Public Service Vacancy Circular 37 of 2026 contains MISA graduate internship details in Annexure J. Official circular PDF: https://www.gov.za/sites/default/files/PUBLIC%20SERVICE%20VACANCY%20CIRCULAR%2037%20OF%202026-%20NATIONAL.pdf | Existing `dpsa` source retained; new Government Jobs This Week discovery index added. Existing `misa` landing-page record remains inactive because automated verification was blocked. | Prefer the dated DPSA circular as primary evidence. Save the circular URL, circular number/date, annexure/page reference, closing date and verification timestamp. Do not infer that a blocked MISA homepage invalidates the DPSA notice. |
| NSFAS 2027 funding guidance: https://www.nsfas.org.za/content/how-to-apply.html | Added `nsfas-application-guidance`; existing `nsfas` organisation source retained. | At the 2026-10-18 research check, the reported application window was 2026-09-18 to 2026-10-31. This is time-sensitive: verify the official page immediately before publishing and mark the opportunity expired after its confirmed deadline. |
| MQA Quality Assurance Intern notice: https://mqa.org.za/job/internship-opportunity-quality-assurance-intern/ | Existing `mqa` source retained and its notes updated. | The research identified a historical notice with a 2025 deadline. Do not re-publish it as open. Use the MQA's current job listing and a current deadline for any new opportunity. |
| Crawford International hiring portal: https://crawford.simplify.hr/ | Existing `crawford-international` source retained and its notes updated. | This is a recruitment platform linked by an aggregator, but an employer-branded portal alone does not prove a particular role remains open. Confirm the individual live role and preserve its direct application URL. |
| Ba-Phalaborwa Youth Programme 2026/2027 | No source added: the research found an aggregator listing with municipal contact details but did not establish a canonical official notice URL. | Keep as a verification lead only. Check the municipality's own public notices or contact the municipality through independently verified official contact details before publishing. Never treat the aggregator article as primary evidence. |
| Crawford, African Independent Brokers/Badger Holdings and other employer opportunities surfaced by aggregators | Use existing official employer portal records where available; keep aggregator records separate from primary sources. | An aggregator outbound link is a discovery clue. Verify the exact role, requirements, deadline, and application path on the employer's own portal before marking an opportunity verified. |

## Prioritised next sources

1. **Tier 1 — high-signal primary feeds:** DPSA circular index and government-jobs index; NSFAS application guidance; official SETA opportunity pages (including MQA, Services SETA, MICT SETA, merSETA, BANKSETA and HWSETA); official employer portals for Eskom, Transnet, SARS, Shoprite and major banks. Most are already represented in `data/sources.json`; improve their exact listing-page URLs and extraction only after validating the canonical page.
2. **Tier 2 — local and provincial public opportunities:** metropolitan and municipal job portals, provincial government vacancy pages, and public entities. Existing entries for the City of Johannesburg and several metros should remain inactive where the specific portal has not been verified. Do not activate a source merely because an aggregator cites it.
3. **Tier 3 — education and qualifications:** university and TVET college careers/funding pages, SAQA and QCTO registers. Qualification/accreditation registers are reference sources, not vacancy feeds; keep them inactive for opportunity crawling unless they publish relevant open programmes.
4. **Tier 4 — aggregators:** Edupstairs, BursaryZA, AfterMatric24 and SETACareers are discovery channels, not final authorities. The current source schema has no `aggregator` type, so do not force them into a government/employer type. Add a dedicated aggregator type only through a separately validated schema and audit change.

## Provenance, deduplication and deadline policy

For each future opportunity record, preserve at least:

- `source_id` and `source_url` for the page actually used as evidence;
- `application_url` for the direct official application destination, kept distinct from the discovery URL;
- `verified` and a verification timestamp (do not treat a reachable homepage as proof that a role is live);
- the source's publication date, closing date, reference number and official attachment URL when present;
- a provenance note describing whether the item came from an official page, dated PDF/circular, employer ATS, or aggregator lead.

Deduplicate using a normalized application URL plus employer/role/reference number; use title, employer, location and closing date as a fallback fingerprint. Preserve all discovered source URLs as provenance rather than discarding them when duplicates are merged. Never merge distinct intakes solely because the titles match.

A listing may be marked `verified: true` only when its exact role or funding cycle and application instructions are supported by a current official source. If the official source cannot be found, keep the item unverified or reject it. Recheck closing dates before publication and on expiry runs; never invent a replacement date. Expired records must not appear as currently open just because an aggregator page remains online.

## Discovery endpoints and crawl cadence

The research did not confirm a stable RSS or API endpoint for the newly added Government Jobs This Week or NSFAS guidance pages. The registry therefore uses `hybrid` for the government index (HTML index plus linked PDFs) and `html` for NSFAS guidance. Weekly is a conservative discovery cadence; do not increase polling frequency until the site supports it and the crawler observes meaningful change. Probe health is not the same as content freshness or vacancy verification.

## Explicitly unresolved items

- RESOLVED 2026-10-20: `ditoc.gov.za` was a typo. The canonical dtic site is `https://www.thedtic.gov.za/`; the `the-dtic` source now points at its careers page and stays inactive until the external ATS it links to is checked.
- Eastern Cape and KwaZulu-Natal departmental URLs previously recorded as unverified remain inactive until canonical domains and live vacancy pages are confirmed.
- The MISA homepage and City of Johannesburg job portal remain inactive where automated checks were blocked; use official circulars or manually verified portals as evidence, not assumptions.
- The research surfaced no confirmed machine-readable RSS/API for the four aggregators. Sitemap or robots discovery should be rechecked during crawler implementation, without assuming a feed exists.
