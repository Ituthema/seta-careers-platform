# Batch 6: SOEs and public entities (checked 2026-10-22)
Method: official-domain searches, then WebFetch of each page. Robots blocks and JS-only pages are recorded as inactive, never circumvented. NOT covered: SA Post Office (only a board-nomination PDF found, no vacancies page), ATNS (only tender PDFs found), and the other SOEs (Eskom, Transnet etc. were registered earlier).

| source_id | url | status | evidence | recommend |
|---|---|---|---|---|
| landbank-careers | https://landbank.co.za/Pages/Careers.aspx | VERIFIED | No posts; links Land Bank eRecruit portal. Bursary page says "no bursaries available" | active |
| necsa-careers | https://www.necsa.co.za/careers/ | VERIFIED | One vacancy PDF (Oct 2026); links mcidirecthire portal | active |
| sanparks-vacancies | https://www.sanparks.org/corporate/vacancies | VERIFIED | 11 posts, closing 22 Oct to 4 Nov 2026 | active |
| sita-internships | https://www.sita.co.za/internships | VERIFIED | 2026-27 learnership advert PDF, no closing date | active (monthly) |
| statssa-vacancies | https://www.statssa.gov.za/?page_id=419 | VERIFIED (stale) | Newest advert closed 6 Feb 2026; about 40 archived PDFs | active |
| sarb-careers | https://www.resbank.co.za/en/home/about-us/Careers | VERIFIED | Oracle portal plus graduate, CA trainee, data scientist, WIL programme brochures | active |
| agsa-graduate-recruitment | https://www.agsa.co.za/careers/graduate-recruitment | VERIFIED | Trainee auditor, LEAP, ICT internships; bursaries 15 Aug to 15 Sep | active (monthly) |
| agsa-talent-vacancies | https://talent.agsa.co.za/vacancies/ | VERIFIED (stale) | 2025 deadlines, last modified June 2024 | inactive |
| acsa-careers | https://www.airports.co.za/business/careers/career-opportunities | VERIFIED (old text) | Links Oracle career portal; learnership, apprenticeship, internship text undated | active |
| armscor-youth-development | https://www.armscor.co.za/internship/ | VERIFIED | 24-month TDP; 2026 advert PDF. Jobs page: "no job posts" | active (monthly) |
| sabc-vacancies | https://www.sabc.co.za/sabc/sabc-vacancy-list/ | VERIFIED | One PDF "SABC VACANCIES", portal link; undated | active (PDF not read) |
| telkom-jobs | https://jobs.telkom.co.za/viewalljobs/ | RIGHT-ORG-NO-LISTING | JS-rendered, no posts readable | inactive |
| petrosa-careers | https://careers.petrosa.co.za/ | VERIFIED, empty | "No current positions are available" | inactive |
| pic-graduate-programme | https://www.pic.gov.za/pic/employment/graduate-development-programme | UNVERIFIED | JS shell only | inactive |
| rand-water-bursaries | https://www.randwater.co.za/PeopleandEmployment/Pages/Busaries.aspx | UNVERIFIABLE (robots) | Found via official-domain search | inactive |

## Open items
- PIC: youth-development-programme and bursaries pages need a human check.
- Telkom: needs a browser-based approach; graduate page not fetched.
- SA Post Office and ATNS: no careers pages found.
- Follow-up pages not fetched: SANParks internship and bursary sub-pages, SITA vacancies2, Stats SA internships (page_id=1823), PetroSA students, SARB bursaries, ACSA learnership.
