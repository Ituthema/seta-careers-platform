# TASK-205 — Official Career-Source URL Repair

**Review date:** 2026-10-28  
**Scope:** MTN Group and SITA internship/youth-development source records in `data/sources.json`.

## Findings

### MTN Group

- **Legacy URL:** `https://group.mtn.com/careers/`
- **Observed issue:** The source-health report generated on 2026-10-28 recorded HTTP 404.
- **Replacement:** `https://www.mtn.com/join-our-yello-family-people-and-culture/`
- **Evidence:** MTN's official careers landing page describes opportunities across its footprint and links to its Global Graduate Programme. Its linked external careers portal is titled “MTN EXTERNAL CAREER SITE Careers.”
- **Action:** Updated the source registry to the official MTN Group careers landing page. The replacement is a careers hub, not a claim that any particular vacancy is currently open.

### State Information Technology Agency (SITA)

- **Registry URL:** `https://www.sita.co.za/internships`
- **Observed issue:** The automated source-health report recorded HTTP 404 on 2026-10-28.
- **Conflicting evidence:** Search indexing rechecked on 2026-10-28 returned the same official SITA page titled “Internships” and showed a 2026-27 learnership advert PDF. This suggests the automated 404 may be transient or inconsistent; it does not establish that the page is permanently removed.
- **Related official page:** `https://www.sita.co.za/content/youth-development-programme`, describing SITA internship, learnership and bursary programmes.
- **Action:** Retained the existing internship URL and updated its notes to record the discrepancy. Do not replace it with a generic vacancies page solely to satisfy the automated probe.
- **Stale advert caution:** The official 2026/27 internship PDF surfaced during research states a closing date of 6 March 2026. That deadline has passed as of this review; do not publish it as an open opportunity without a new official advert.

## Safety and validation rules

- No opportunity listings were added, deleted, expired, or reopened by this task.
- Do not weaken TLS verification to make sources appear healthy.
- Source-health output is diagnostic. Manually inspect the official destination and any linked advert before changing listing status.
- CI must validate the source registry and generated content before merge.

## Sources reviewed

- MTN official careers landing page: https://www.mtn.com/join-our-yello-family-people-and-culture/
- MTN external careers portal: https://ehle.fa.em2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX_1/jobs
- SITA official internships page: https://www.sita.co.za/internships
- SITA youth-development programme: https://www.sita.co.za/content/youth-development-programme
- SITA 2026/27 internship advert PDF: https://www.sita.co.za/sites/default/files/Internships%20-%202026-2027.pdf
