# Batch 4b: SETA listing URLs (checked 2026-10-23)
Method: official-domain searches, then WebFetch. Robots blocks recorded as inactive, never circumvented. The registry's existing SETA entries are mostly bare homepages; this batch adds listing pages beside them (existing ids untouched).

| source_id | url | status | evidence | recommend |
|---|---|---|---|---|
| mict-seta-vacancies | https://mict.org.za/available-vacancies/ | VERIFIED (empty table) | Column headers only; links learnerships, internships, expired | active |
| etdp-seta-vacancies | https://www.etdpseta.org.za/edu/vacancies | VERIFIED | Links mcidirecthire portal and RSS feed | active |
| agriseta-vacancies | https://www.agriseta.co.za/vacancies-2/ | VERIFIED | Five posts, newest closed 19 Oct 2026 | active |
| merseta-recruitment | https://www.merseta.org.za/recruitment/ | VERIFIED | Two posts closing 14 and 21 Oct 2026 | active |
| teta-vacancies | https://www.teta.org.za/index.php/56-vacancies | VERIFIED (empty) | Portal teta.mcidirecthire.com | active |
| teta-unemployed-bursaries | https://teta.org.za/index.php/newsroom/unemployed-bursaries | VERIFIED | 2026/27 advert dated 11 Oct 2026 | active |
| hwseta-expression-of-interest | https://www.hwseta.org.za/category/expression-of-interest/ | VERIFIED | Oct 2026 posts for providers; learner calls in the Dec 2025 EOI | active |
| inseta-careers | https://inseta.org.za/careers/ | VERIFIED (stale) | Posts from Aug 2021 | inactive |
| lgseta-vacancies | https://lgseta.org.za/careers_archive/ | UNVERIFIABLE (robots) | In search results | inactive |
| lgseta-bursary-window | https://lgseta.org.za/learners-dg-bursary-window/ | UNVERIFIABLE (robots) | 2026 bursary advert PDF in search | inactive |
| cathsseta-vacancies | https://cathsseta.org.za/vacancies/current-vacancies/ | UNVERIFIABLE (robots) | In search results | inactive |
| services-seta-bursaries | https://www.serviceseta.org.za/resources/bursaries-2/ | VERIFIED (stale) | Dated 8 Jan 2024 | inactive |
| wrseta-bursary-scheme | https://www.wrseta.org.za/node/73846 | UNVERIFIABLE (robots) | In search results | inactive |

## Not registered
- BANKSETA: funding windows page said no open windows; internship page describes DG windows for SDFs. No better listing URL.
- FP&M SETA: search returned web-dev.fpmseta.org.za (a development host); not registered. Canonical site still unresolved.
- FASSET: search returned only the already-known pages (vacancies.html, bursaries).
- ETDP SETA bursary notice /edu/urgent-notice: client error on fetch; PDFs for 2025 exist.
- CETA: only press-news items found (bursaries, internship programme); no list page.

## Open items
- FP&M SETA canonical domain and portal; FASSET and CATHSSETA via non-blocked pages.
- External portals (etdpsetajobs, teta.mcidirecthire.com, applybe.com/inseta) not fetched.
- CETA internship and bursary press items could be monitored through https://www.ceta.org.za/media/press-news.
