# TASK-208 — Individual Official Vacancy Verification

**Review date:** 2026-10-28  
**Scope:** Verify individual adverts linked from the Department of Employment and Labour official vacancy index before creating listings.

## Official source index

- Index: https://www.labour.gov.za/Vacancies/Pages/Vacancies-List.aspx
- Registry entry added in TASK-207: `department-employment-labour-vacancies`
- The official index showed posts with closing dates of 6 November 2026. Individual advert pages were opened and reviewed before recording the details below.

## Verified advert candidates

### 1. Office Aid (X3 POSTS)

- Official advert: https://www.labour.gov.za/office-aid-(x3-posts)-(2)
- Reference: HR4/4/6/47 (Phalaborwa); HR4/4/6/48 (Lebowakgomo); HR4/4/4/09/48 (Carletonville)
- Salary: R170,226 per annum
- Minimum qualification: Standard 8 / Grade 10
- Duties include office cleanliness, food-service assistance, stock distribution and messenger functions.
- Closing date: **6 November 2026**, 16:00 for walk-in applications and 23:59 online.
- Application instructions: the advert provides email routes for Phalaborwa and Lebowakgomo, and an ESSA online route for Carletonville. It requires the current Z83 form and CV as one attachment for email applications.
- Status: Individual advert reviewed; deadline and requirements explicitly visible on the official page at review time.

### 2. Administrative Clerk: Management Support Services

- Official advert: https://www.labour.gov.za/administrative-clerk-management-support-services-(11)
- Reference: HR4/4/4/09/47
- Location: Carletonville Labour Centre
- Salary: R237,453 per annum
- Minimum qualification: Matriculation / Grade 12 / Senior Certificate
- Duties include supply-chain management, finance and office management, human-resource management, training/performance activities and records management.
- Closing date: **6 November 2026**, 16:00 for walk-in applications and 23:59 online.
- Application instructions: hand delivery at the Carletonville Labour Centre or the ESSA online application route; the advert also describes Z83 and CV requirements.
- Status: Individual advert reviewed; deadline and requirements explicitly visible on the official page at review time.

## Publication decision

These adverts should not be silently inserted into an existing category. The current content validator's category allow-list is:

`learnership`, `internship`, `bursary`, `apprenticeship`, `tvet`.

A general `job` / `vacancy` category is not currently supported by that allow-list. Therefore, **no opportunity records were created in this task**. The safe next task is a narrowly scoped category-support change: inspect all category maps, page-generation logic, navigation, filters, route validation, and tests; add a supported job-vacancy category consistently; then add these records only after the full route and content validation passes.

## Cautions

- Recheck each advert immediately before publication; vacancies and deadlines can change.
- Do not infer additional eligibility conditions, benefits, or employment status beyond the advert.
- Do not treat a crawler timeout, access restriction, or anti-bot response as proof that an official advert is closed.
- Do not weaken TLS verification.
- The Department states its services are free; the platform must not imply that an application fee is required.

## Evidence

- Official vacancy index: https://www.labour.gov.za/Vacancies/Pages/Vacancies-List.aspx
- Office Aid advert: https://www.labour.gov.za/office-aid-(x3-posts)-(2)
- Administrative Clerk advert: https://www.labour.gov.za/administrative-clerk-management-support-services-(11)
