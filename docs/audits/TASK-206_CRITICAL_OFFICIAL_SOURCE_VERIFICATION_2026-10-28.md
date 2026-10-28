# TASK-206 — Verify Critical Official Sources with Unverified Health Results

**Review date:** 2026-10-28  
**Scope:** Three priority funding/skills-development source records: Services SETA, LGSETA and NSFAS.

## Why this review was needed

The 2026-10-28 automated health report classified multiple sources as unverified because requests timed out or failed before receiving an HTTP status. That is not proof that an official website is unavailable. This review uses official pages and official government information to determine what can be safely confirmed, without weakening TLS verification.

## Findings and actions

### Services SETA — canonical hostname corrected

- **Registry ID:** `services-seta`
- **Canonical URL now recorded:** https://servicesseta.org.za/
- **Evidence:** The official Services SETA homepage describes its skills-development mandate and, during this review, displayed 2026/27 discretionary-grant, strategic-project and strategic-partnership funding announcements.
- **Action:** Updated the registry URL from the `www` hostname to the official homepage hostname that was confirmed in research. This is a source URL correction, not confirmation that any particular learner opportunity is open.
- **Source:** https://servicesseta.org.za/

### LGSETA — official source confirmed; no URL change

- **Registry ID:** `lgseta`
- **Registry URL retained:** https://lgseta.org.za/
- **Evidence:** The official homepage identifies the Local Government Sector Education and Training Authority and links learner information, including its DG Bursary Window.
- **Action:** Kept the existing official URL and clarified the registry notes. No-response health results remain unverified until a request obtains an HTTP response.
- **Source:** https://lgseta.org.za/

### NSFAS — official source confirmed; no URL change

- **Registry ID:** `nsfas`
- **Registry URL retained:** https://www.nsfas.org.za/
- **Evidence:** The South African Government published an official notice on 20 October 2026 stating that NSFAS 2027 funding applications close on 31 October 2026 and directing applicants to NSFAS's official platforms.
- **Action:** Kept the official NSFAS homepage and recorded the dated official cross-reference. This supports the source's relevance; it does not change any existing opportunity record or replace the requirement to verify deadlines against the current official notice.
- **Sources:** https://www.nsfas.org.za/ and https://www.gov.za/news/media-statements/nsfas-records-868626-applications-2027-funding-cycle-20-oct-2026

## Safety and scope

- No opportunity records were added, deleted, expired, or reopened.
- The registry still contains 219 source records.
- No TLS verification setting or timeout policy was weakened.
- Automated `unverified` means no HTTP response was obtained; it must not be described as proof the source is dead.
- A source homepage is not proof of a specific vacancy. Publish an opportunity only after checking its own official advert, eligibility, application destination and closing date.
- This is a targeted review of three priority sources, not a claim that all unverified sources have been manually verified.
