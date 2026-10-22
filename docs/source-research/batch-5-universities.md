# Batch 5 — Universities (checked 2026-10-22)
Method: official-domain searches (ac.za), then WebFetch. NOT covered (moved to batch 5b): TVET colleges; better listing URLs for the 10 universities already registered (all bare homepages); University of Fort Hare, Walter Sisulu University and University of Mpumalanga central vacancy index pages (not found).

| source_id | url | status | evidence | recommend |
|---|---|---|---|---|
| nwu-vacancies | https://www.nwu.ac.za/vacancies | VERIFIED | Recruitment info page; no posts listed; links NWU's e-recruitment portal https://nwu.ci.hr/applicant/index.php (PNet) | active |
| nwu-bursaries | http://studies.nwu.ac.za/studies/bursaries-and-loans | VERIFIED | Links undergraduate, postgraduate and external bursaries, bank loans; no 2027 dates | active (monthly) |
| ufs-human-resources | https://www.ufs.ac.za/supportservices/departments/human-resources-home | VERIFIED | No posts; links vacancy portal https://ufs.hua.hrsmart.com/hr/ats/JobSearch/viewAll (not fetched) | active |
| ufs-internal-bursaries | https://www.ufs.ac.za/kovsielife/student-fin/bursaries/ufs-internal-bursaries | VERIFIED | Merit bursaries (mostly automatic) and donor funds via PS Online Funding; no windows | active (monthly, low) |
| uwc-bursaries-opportunities | https://www.uwc.ac.za/admission-and-financial-aid/fees-and-financial-aid/bursaries-and-opportunities | VERIFIED | Notices: NSFAS 2027, Babette Taute 2027, Energy Mobility 2027, MIM 2026, Dare to Dream 2026; no closing dates in list | active |
| unizulu-vacancies | https://www.unizulu.ac.za/vacancies/ | VERIFIED (stale) | Two executive posts closing 7 Dec 2025; "No Vacancies Available" | active (monthly, low) |
| vut-vacancies | https://vut.ac.za/vacancies/ | VERIFIED | One post (Senior Lecturer) closing 27 Oct 2026; page modified 15 Oct 2026; e-recruitment | active |
| mut-vacancies | https://www.mut.ac.za/vacancies/ | VERIFIED | Two posts closing 23 Oct 2026 | active |
| rhodes-recruitment | https://ru.simplify.hr/ | VERIFIED org, JS-rendered | "Jobs at Rhodes University" on Simplify; listings load dynamically | active |
| smu-vacancies | https://www.smu.ac.za/vacancies/ | VERIFIED | Category links: internal, support, academic, scholarship programmes, nominations; no posts shown; footer 2021-2023 | active |
| cput-jobs | https://www.cput.ac.za/jobs | RIGHT-ORG-NO-LISTING | Points to an online application system (alecto.cput.ac.za, seen in search) | inactive |
| univen-careers | https://www.univen.ac.za/vacancies/univen-careers/ | UNVERIFIABLE (robots) | In official search results | inactive |
| ul-careers | https://www.ul.ac.za/careers/ | UNVERIFIED (server error) | In official search results | inactive |
| spu-vacancies | https://www.spu.ac.za/index.php/spu-vacancies/ | UNVERIFIED (client error) | In official search results | inactive |
| stellenbosch-hr | http://www.sun.ac.za/english/human-resources/Pages/default.aspx | UNVERIFIED | HR division page from search results; central vacancy list not found (vacancies are scattered across department sites) | inactive |

## Open questions
- Fort Hare: job adverts exist at ufh.ac.za/Jobs/*.aspx and past_jobs (robots-blocked); the index page was not found.
- WSU: Graduate Employability Programme page found (wsu.ac.za/index.php/en/graduate-employability-programme), vacancies page not found.
- UMP: vacancy adverts are PDFs under ump.ac.za/UMPSite/media/UMPMedia/System/Documents/vacancies/; no index page found.
- NWU, UFS, Rhodes and CPUT run external recruitment portals; these need their own crawl decisions.
