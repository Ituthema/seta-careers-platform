# Batch 3 — Provincial governments (checked 2026-10-22)
Method: gov.za-only searches, then WebFetch of each page. Blocked to automated fetch (not circumvented): northern-cape.gov.za/index.php/apply/jobs, echealth.gov.za, kznonline.gov.za, kzndhs.gov.za (client error).

| source_id | url | status | evidence | recommend |
|---|---|---|---|---|
| limpopo-erecruitment | https://erecruitment.limpopo.gov.za/browse | VERIFIED | 437 vacancies (Health 373, Social Dev 43, Public Works 18, Agriculture 2, Education 1). Posts load per department: browse?office=EDU, LPT, OTP, SAC, ... | active |
| limpopo-internship-programme | https://www.limpopo.gov.za/?page_id=3456 | VERIFIED | Internship/learnership adverts by closing date; newest closed 24 Jul 2026; each links a PDF | active (monthly) |
| mpumalanga-vacancies | https://www.mpg.gov.za/vacancies | VERIFIED | Departments with closing 23 and 30 Oct 2026 incl. a learnership; links e-recruitment | active |
| mpumalanga-erecruitment | https://erecruitment.mpg.gov.za/Process/JobTitle.aspx | VERIFIED | 11 pages of posts, titles + closing dates readable | active |
| gauteng-job-centre | https://jobs.gauteng.gov.za/ | VERIFIED | GPG Professional Job Centre; "120+ jobs"; table of latest posts readable (all Health, closing 2-3 Nov 2026) | active |
| free-state-vacancies | https://www.fsonline.fs.gov.za/?page_id=6523 | VERIFIED | Vacancy circulars by year 2022-2026 as PDFs per department. Old host freestateonline.fs.gov.za redirects to fsonline.fs.gov.za | active (pdf) |
| northern-cape-premier-opportunities | https://www.northerncape.gov.za/otp/opportunities/ | VERIFIED | Office of the Premier: IT internship file, "Vacancies August 2026", Z83; downloads as DOC/DOCX | active (hybrid) |
| north-west-premier-careers | https://premier.nwpg.gov.za/careers/ | VERIFIED (all closed) | 16 PDF adverts, newest closed 29 Jun 2026; no internships | active (monthly, pdf) |
| western-cape-bursaries-internships | https://www.westerncape.gov.za/bursaries-internships-and-learnerships | VERIFIED | Bursaries, learnerships, internships directory; said "no current internship opportunities" | active (monthly) |
| western-cape-jobs | https://www.westerncape.gov.za/jobs-bursaries-and-tenders | VERIFIED | Hub linking how-to-apply and the e-recruitment system | active |
| ec-dsd | https://www.ecdsd.gov.za/about_vacancy.aspx | VERIFIED (stale) | EC Social Development; newest item closed 12 Sep 2025; two 2024 entries show 2014 typo | active (monthly, low) |
| ec-health | https://www.echealth.gov.za/index.php/latest-vacancies | UNVERIFIABLE (robots) | appears in official search results | inactive |

## Rejected / notes
- e-recruitment.westerncape.gov.za: "Under Construction"; WCG now links https://westerncapegov.erecruit.co/candidateapp/... (help link seen only, no listing URL found).
- eservices.gov.za/eRecruitmentCitizenKZN: login-only, no public list.
- KZN: kznonline.gov.za internship invitation exists (robots-blocked); `kzn-government` already covers the site.
## Open questions
- Canonical domains for `ec-dsrac` and `kzn-social-development` still unresolved (no result this round).
- Eastern Cape has no provincial-wide vacancy page found; EC vacancies appear in DPSA circulars (annexures) and per-department sites.
- Limpopo listings load per department; a crawler needs the ?office= URLs.
