# Batch 1 — National departments (checked 2026-10-20)
Method: official-domain searches (gov.za sites only), then WebFetch on each page. Not reachable: dalrrd.gov.za (ROBOTS_DISALLOWED), dha.gov.za careers (ROBOTS_DISALLOWED), publicworks.gov.za (redirect loop https<->http, listing page never seen).

| source_id | url | status | evidence | recommend |
|---|---|---|---|---|
| dws-erecruitment | https://erecruitment.dws.gov.za/Browse-jobs/ | VERIFIED | Table of ~45 live posts, all closing 30-Oct-2026, with ref no., category, "More Info" links | active |
| dws-internship-programme | https://www.dws.gov.za/learninga/IP.aspx | VERIFIED | Non-technical internship programme for graduates/learner interns; no fixed dates ("watch website and print media") | active (monthly) |
| dmpr | https://www.dmpr.gov.za/Media-Centre/Opportunities-Centre | VERIFIED | Department of Mineral and Petroleum Resources; links to Learning-Opportunities, Current-Vacancies, Archived-Vacancies. Current-Vacancies said "No current vacancies" on 2026-10-20 | active |
| dsd | https://www.dsd.gov.za/index.php/2-uncategorised/38-vacancies | VERIFIED (empty) | Social Development vacancies page: "Currently no details on Vacancies" on 2026-10-20 | active (weekly) |
| dcdt | https://www.dcdt.gov.za/vacancies.html | VERIFIED | Board nomination circulars, Chief Director post, ITU role, SMME digital skills programme; no internships seen; undated | active |
| dalrrd | https://www.dalrrd.gov.za/index.php/vacancies | UNVERIFIABLE | Page blocks fetch; appears in official-domain search results. Department now called Department of Agriculture; confirm canonical domain | inactive |
| dha-erecruitment | https://erecruitment.dha.gov.za/no-auth/Shesha.Recruitment/public-jobs | RIGHT-ORG, JS-rendered | Fetch showed only "Initializing..."; HR circulars also posted as PDFs at dha.gov.za/images/PDFs/jobs/ | inactive (needs JS) |

## Proposed updates to existing sources
| source_id | current | proposed | evidence |
|---|---|---|---|
| the-dtic | https://www.ditoc.gov.za/ | https://www.thedtic.gov.za/careers/ | ditoc.gov.za was a typo. thedtic.gov.za verified as the dtic; /careers/ page has no listings, footer links external ATS https://thedti.hua.hrsmart.com/hr/ats/JobSearch/index (seen as a link, not fetched). Keep inactive until the ATS is checked. |

## Rejected / reference only
- dmre.gov.za/opportunities/vacancies: stale mirror (posts from 2017-2025); use dmpr.gov.za.
## Open questions
- DPWI: vacancy circular PDFs exist under publicworks.gov.za/PDFs/Other/2026Vacancies/ but no listing page could be fetched.
- Check if the dtic ATS (hua.hrsmart.com) allows automated access.
