# TASK-207 — Official Vacancy Index Coverage

**Review date:** 2026-10-28  
**Scope:** DPSA/Public Service Vacancy Circular discovery and Department of Employment and Labour vacancy coverage in `data/sources.json`.

## Findings

### South African Government weekly vacancy index

The official Government Jobs This Week page says the Public Service Vacancy Circular is published weekly except in December. On 28 October 2026, it linked **Public Service Vacancy Circular No. 38 of 23 October 2026**, plus separate national and provincial vacancy PDFs.

- Index: https://www.gov.za/government-jobs-week
- Action: Updated the `govza-government-jobs-week` and `dpsa` source notes with the dated circular observed during this review.
- Ingestion rule: treat the circular and linked vacancy advert as primary evidence; capture circular number/publication date and verify the individual vacancy's deadline, eligibility, location and application route before publishing.

### Department of Employment and Labour vacancy list

The department's official vacancy list was reviewed on 28 October 2026. The page showed live records with closing dates of **30 October 2026** and **6 November 2026**. Examples included Office Aid, Registry Clerk, Administrative Clerk, Inspector and Client Service Officer roles, as well as other departmental vacancies.

- Official list: https://www.labour.gov.za/Vacancies/Pages/Vacancies-List.aspx
- Action: Added a dedicated `department-employment-labour-vacancies` source record, separate from the existing general department homepage.
- The source record is not itself a published opportunity. Each individual linked advert still needs review before a listing is created, and a deadline must not be copied from the list without confirming the underlying advert and current status.
- The page states that public-service applications use the Z83 form where applicable and that departmental services are free.

## Changes made

- Updated the DPSA and government index notes with current official circular evidence.
- Added one dedicated official vacancy-list source record.
- Source registry count: **220** (previously 219); source IDs remain unique.
- No opportunity records were added, deleted, expired, or reopened.
- No TLS verification settings were changed.

## Official evidence

- Government Jobs This Week: https://www.gov.za/government-jobs-week
- Department of Employment and Labour vacancies: https://www.labour.gov.za/Vacancies/Pages/Vacancies-List.aspx
- Department guidance on the Public Service Vacancy Circular and job applications: https://www.gov.za/about-government/government-jobs
