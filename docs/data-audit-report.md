# Data Audit Report

## Scope and path note

Requested scan paths were `/data/opportunities.json`, `/data/guides.json`, `/data/categories.json`, and `/data/provinces.json`. On this case-sensitive filesystem those exact lowercase paths are missing; the repository stores the corresponding JSON files under `Data/`, so this report audits only those four corresponding files and does not modify any dataset JSON files.

## Console-style file summaries

### FILE: /data/opportunities.json
- STATUS: missing at /data/opportunities.json; valid audited file at /Data/opportunities.json
- RECORD_COUNT: 12

### FILE: /data/guides.json
- STATUS: missing at /data/guides.json; valid audited file at /Data/guides.json
- RECORD_COUNT: 7

### FILE: /data/categories.json
- STATUS: missing at /data/categories.json; valid audited file at /Data/categories.json
- RECORD_COUNT: 4

### FILE: /data/provinces.json
- STATUS: missing at /data/provinces.json; valid audited file at /Data/provinces.json
- RECORD_COUNT: 9

## Summary of dataset

- `Data/opportunities.json`: 12 records; JSON status: valid.
- `Data/guides.json`: 7 records; JSON status: valid.
- `Data/categories.json`: 4 records; JSON status: valid.
- `Data/provinces.json`: 9 records; JSON status: valid.

## Schema inventory: `Data/opportunities.json`

### Fields found

- application_url
- category
- closing_date
- description
- documents_needed
- eligibility
- expired
- featured
- id
- posted_date
- province
- qualification_level
- sector
- slug
- source_name
- source_url
- stipend
- tags
- title
- updated_date
- verified

### Field types

- application_url → string
- category → string
- closing_date → string
- description → string
- documents_needed → array
- eligibility → array
- expired → boolean
- featured → boolean
- id → string
- posted_date → string
- province → string
- qualification_level → string
- sector → string
- slug → string
- source_name → string
- source_url → string
- stipend → string
- tags → array
- title → string
- updated_date → string
- verified → boolean

### Required fields (present in 95%+ records)

- application_url
- category
- closing_date
- description
- documents_needed
- eligibility
- expired
- featured
- id
- posted_date
- province
- qualification_level
- sector
- slug
- source_name
- source_url
- stipend
- tags
- title
- updated_date
- verified

### Optional fields (present in <95% records)

- None

### Inconsistent presence

- None detected.

### Field usage frequency

- application_url → 100.0%
- category → 100.0%
- closing_date → 100.0%
- description → 100.0%
- documents_needed → 100.0%
- eligibility → 100.0%
- expired → 100.0%
- featured → 100.0%
- id → 100.0%
- posted_date → 100.0%
- province → 100.0%
- qualification_level → 100.0%
- sector → 100.0%
- slug → 100.0%
- source_name → 100.0%
- source_url → 100.0%
- stipend → 100.0%
- tags → 100.0%
- title → 100.0%
- updated_date → 100.0%
- verified → 100.0%

### String value variation analysis

- `application_url` unique values (12): ["https://www.absa.africa/absaafrica/careers", "https://www.capitecbank.co.za/careers", "https://www.eskom.co.za/careers", "https://www.kznhealth.gov.za", "https://www.merseta.org.za", "https://www.mict.org.za/learnerships", "https://www.nsfas.org.za/content/applications.html", "https://www.oldmutual.co.za/careers", "https://www.sasol.com/careers/bursaries", "https://www.shopriteholdings.co.za/careers", "https://www.standardbank.co.za/careers", "https://www.transnet.net/careers"]
- `category` unique values (4): ["apprenticeship", "bursary", "internship", "learnership"]
  - Normalized suggestion: ["apprenticeship", "bursary", "internship", "learnership"]
- `closing_date` unique values (8): ["2026-07-31", "2026-08-15", "2026-08-31", "2026-09-15", "2026-09-30", "2026-10-15", "2026-10-31", "2026-11-30"]
- `description` unique values (12): ["12-month internship placements for graduates in health administration, public health, pharmacy assistance, and environmental health at district offices and provincial hospitals.", "12-month rotational internship across actuarial, finance, IT, and business operations. Structured mentorship with possibility of permanent employment.", "12-month structured programme developing young talent in banking and financial services. Interns rotate across Retail, Corporate, and Digital Banking with structured mentorship.", "12-month YES (Youth Employment Service) placement in banking operations, digital innovation, or financial services. Real work, structured learning, and potential for permanent employment.", "3-year apprenticeship developing qualified artisans in diesel mechanical, electrical, and boilermaking trades. Leads to a nationally recognised trade certificate.", "3-year boilermaker apprenticeship leading to a nationally recognised trade certificate. Covers metal fabrication, welding, and pressure vessel manufacturing.", "Capitec Bank's branch learnership provides NQF Level 4 retail banking qualification through hands-on customer service training across Capitec branches in the Western Cape.", "Eskom's annual learnership programme offers structured workplace learning leading to a nationally recognised NQF qualification. The programme covers electrical, mechanical, and instrumentation disciplines across Eskom's generation, transmission, and distribution divisions.", "Full tuition, accommodation, and monthly living allowance for engineering and science students at any South African public university.", "NQF Level 4 ICT Learnership providing practical experience in IT support, networking, and software fundamentals over 12 months.", "NSFAS provides funding to eligible South African students at public universities and TVET colleges. Covers tuition, accommodation, transport, and a living allowance. No repayment required.", "Retail Learnership across Shoprite, Checkers, and USave providing NQF Level 3 and 4 qualifications in retail operations while working in live store environments."]
- `id` unique values (12): ["001", "002", "003", "004", "005", "006", "007", "008", "009", "010", "011", "012"]
- `posted_date` unique values (11): ["2026-04-01", "2026-04-05", "2026-04-08", "2026-04-10", "2026-04-12", "2026-04-14", "2026-04-15", "2026-04-16", "2026-04-18", "2026-04-20", "2026-04-22"]
- `province` unique values (4): ["Gauteng", "KwaZulu-Natal", "Nationwide", "Western Cape"]
  - Normalized suggestion: ["Gauteng", "KwaZulu-Natal", "Nationwide", "Western Cape"]
- `qualification_level` unique values (2): ["Degree", "Matric"]
- `sector` unique values (10): ["BANKSETA", "CHIETA", "EWSETA", "Government – DHET", "INSETA", "MerSETA", "MICT SETA", "PSETA", "TETA", "W&RSETA"]
- `slug` unique values (12): ["absa-graduate-internship-2026", "capitec-bank-learnership-2026", "eskom-engineering-learnership-2026", "kzn-health-internship-2026", "merseta-boilermaker-apprenticeship-2026", "mict-seta-ict-learnership-2026", "nsfas-bursary-2026", "old-mutual-graduate-internship-2026", "sasol-bursary-engineering-2026", "shoprite-retail-learnership-2026", "standard-bank-yes-internship-2026", "transnet-apprenticeship-2026"]
- `source_name` unique values (12): ["ABSA Group Careers", "Capitec Bank Careers", "Eskom Official Website", "KZN Department of Health", "MerSETA Official Website", "MICT SETA Official", "NSFAS Official Website", "Old Mutual Group Careers", "Sasol Ltd Careers", "Shoprite Holdings Careers", "Standard Bank Careers Portal", "Transnet SOC Ltd"]
- `source_url` unique values (12): ["https://www.absa.africa/absaafrica/careers", "https://www.capitecbank.co.za/careers", "https://www.eskom.co.za/careers", "https://www.kznhealth.gov.za", "https://www.merseta.org.za", "https://www.mict.org.za", "https://www.nsfas.org.za", "https://www.oldmutual.co.za/careers", "https://www.sasol.com/careers", "https://www.shopriteholdings.co.za/careers", "https://www.standardbank.co.za/careers", "https://www.transnet.net/careers"]
- `stipend` unique values (12): ["Full bursary – varies by institution", "Full tuition + R5 000/month", "R3 200/month", "R3 500/month", "R4 000/month", "R4 500/month", "R5 500/month", "R6 000/month", "R6 500/month", "R7 044/month", "R8 500/month", "R9 500/month"]
- `title` unique values (12): ["ABSA Bank Graduate Internship 2026", "Capitec Bank Branch Learnership 2026", "Eskom Engineering Learnership 2026", "KwaZulu-Natal Department of Health Internship 2026", "MerSETA Boilermaker Apprenticeship 2026", "MICT SETA ICT Learnership 2026", "NSFAS Bursary 2026 — University & TVET Funding", "Old Mutual Graduate Internship 2026", "Sasol Engineering & Science Bursary 2026", "Shoprite Group Retail Learnership 2026", "Standard Bank YES Programme Internship 2026", "Transnet Freight Rail Apprenticeship 2026"]
- `updated_date` unique values (10): ["2026-04-05", "2026-04-08", "2026-04-10", "2026-04-12", "2026-04-14", "2026-04-15", "2026-04-16", "2026-04-18", "2026-04-20", "2026-04-22"]

### Boolean normalization audit

- No boolean representation inconsistencies detected.

### Date format analysis

- `closing_date`: {'YYYY-MM-DD': 12} — OK: all values use YYYY-MM-DD.
- `posted_date`: {'YYYY-MM-DD': 12} — OK: all values use YYYY-MM-DD.
- `updated_date`: {'YYYY-MM-DD': 12} — OK: all values use YYYY-MM-DD.
- Required standard: YYYY-MM-DD.

### URL validation audit

- `source_url`: 0 missing, 0 invalid, 0 non-HTTPS, 0 duplicate URL values.
- `application_url`: 0 missing, 0 invalid, 0 non-HTTPS, 0 duplicate URL values.

### Duplicate structure detection

- No duplicates found by title + closing_date or source_url methods.

## Schema inventory: `Data/guides.json`

### Fields found

- body
- category
- faq
- id
- intro
- meta_description
- meta_title
- published_date
- read_time
- related_slugs
- slug
- title
- updated_date

### Field types

- body → string
- category → string
- faq → array
- id → string
- intro → string
- meta_description → string
- meta_title → string
- published_date → string
- read_time → string
- related_slugs → array
- slug → string
- title → string
- updated_date → string

### Required fields (present in 95%+ records)

- body
- category
- faq
- id
- intro
- meta_description
- meta_title
- published_date
- read_time
- related_slugs
- slug
- title
- updated_date

### Optional fields (present in <95% records)

- None

### Inconsistent presence

- None detected.

### Field usage frequency

- body → 100.0%
- category → 100.0%
- faq → 100.0%
- id → 100.0%
- intro → 100.0%
- meta_description → 100.0%
- meta_title → 100.0%
- published_date → 100.0%
- read_time → 100.0%
- related_slugs → 100.0%
- slug → 100.0%
- title → 100.0%
- updated_date → 100.0%

### String value variation analysis

- `body` unique values (7): ["<h2>CV Structure for Learnership Applicants</h2><p><strong>Section 1 — Personal Details:</strong> Full name, ID number, contact number, email address, physical address, province. Do not include a photo unless specifically requested.</p><p><strong>Section 2 — Education:</strong> Institution name, year completed, relevant subjects and symbols. List Matric first. If you have a TVET qualification or any other certificate, list it too.</p><p><strong>Section 3 — Experience:</strong> Any work experience, even informal, part-time, or volunteer. Include company name, your role, dates, and 2–3 bullet points. No experience? Include community work or school projects.</p><p><strong>Section 4 — Skills:</strong> Basic computer literacy, languages spoken, driver's licence if applicable. Keep it brief and honest.</p><p><strong>Section 5 — References:</strong> Two references — a teacher, community leader, or family friend (not a parent). Include name, relationship, and phone number.</p><h2>Non-Negotiable CV Rules</h2><p>Maximum 2 pages. Font: Arial or Calibri, size 11–12. No spelling errors. Save as PDF — not Word (.doc). File name: YourName-CV.pdf. No photo unless requested.</p>", "<h2>Step 1: Check Your Eligibility</h2><p>Confirm you meet the requirements: South African ID, Matric certificate, unemployed status, and the correct age range. Some learnerships require specific Matric subjects.</p><h2>Step 2: Gather Your Documents</h2><p>You will need: certified copy of your ID (within 3 months), certified Matric certificate, CV of maximum 2 pages, motivational letter of 1 page, and proof of residence not older than 3 months.</p><h2>Step 3: Write a Strong Motivational Letter</h2><p>Most applicants fail at this step by sending a generic letter. Your letter must name the specific company and programme, explain why you want this particular opportunity, and describe what you bring to it. Tailor every letter — generic ones are rejected.</p><h2>Step 4: Submit via the Official Website</h2><p>Apply only through the company's official careers page. Email subject format: <strong>Application: [Learnership Name] — [Your Full Name]</strong>. Send before the closing date — late applications are never considered.</p><h2>Step 5: Follow Up Once</h2><p>One week after applying, send a short follow-up email confirming your application. Once only — multiple follow-ups create a negative impression.</p>", "<h2>Who Qualifies for NSFAS in 2026?</h2><p>You qualify if: you are a South African citizen, your household income is R350 000 or less per year, and you are registered or planning to register at a public university or TVET college. SASSA grant recipients qualify automatically — no income proof needed.</p><h2>What Does NSFAS Cover?</h2><p>For university students: tuition fees, accommodation (in university residences), meal allowance, transport allowance, and personal care allowance. For TVET college students: tuition and a monthly living allowance.</p><h2>How to Apply</h2><p>Applications open October–November each year at <strong>myNSFAS.org.za</strong> — the only legitimate application portal. Never use agents claiming to apply on your behalf. Any agent charging a fee is running a scam. NSFAS applications are free.</p><h2>NSFAS vs Private Bursary</h2><p>Apply for both — but double funding is not allowed. If you receive a full corporate bursary covering all costs, you cannot also receive NSFAS. Disclose all funding applications honestly on each form.</p>", "<p>Learnerships are funded through South Africa's SETA system. When a company runs a learnership, they receive a government grant to cover the cost of training and employing a learner. This is why learnerships exist: government incentivises companies to train people who would otherwise not get work experience.</p><h2>How Long Does a Learnership Last?</h2><p>Most learnerships run for 12 months. Some technical learnerships in engineering, manufacturing, and mining can run 18 to 24 months. At the end, you receive a SAQA-registered NQF qualification.</p><h2>What Is a Learnership Stipend?</h2><p>A stipend is the monthly allowance paid to learners during training. In 2026, most learnerships pay between R3 500 and R8 000 per month, depending on the sector and NQF level. Stipends are not subject to PAYE tax.</p><h2>Who Can Apply?</h2><p>Most learnerships require: South African citizen with a valid ID, Matric certificate, currently unemployed, aged 18–35. Some require specific subjects. Check the eligibility section of each listing carefully.</p>", "<p>SETAs are funded by a 1% payroll levy that every employer with a large enough payroll pays to SARS. This money goes into a Skills Development Fund. SETAs use this fund to pay companies to train unemployed people through learnerships, apprenticeships, and skills programmes.</p><h2>How Do SETAs Help Job Seekers?</h2><p>When a company runs a SETA-funded learnership, they take on unemployed people as learners. You receive on-the-job training AND a nationally recognised qualification — free of charge, with a monthly stipend. You never apply to the SETA directly; you apply to companies running SETA-funded programmes.</p><h2>Which SETA Covers Which Sector?</h2><p>Each SETA covers a specific industry. For IT learnerships, look for MICT SETA programmes. For banking, BANKSETA is relevant. For construction, CETA. For retail, W&RSETA. You'll find the SETA name listed on every opportunity in our directory.</p><h2>Do I Need to Pay Anything?</h2><p><strong>No.</strong> All legitimate SETA-funded learnerships are completely free of charge. If anyone asks you to pay an application fee, registration fee, or any deposit — it is a scam. Report it to the SAPS immediately.</p>", "<p>The most important rule: <strong>legitimate learnerships in South Africa are ALWAYS free to apply for.</strong> Any programme that asks you to pay anything before you start is a scam.</p><h2>7 Warning Signs of a Learnership Scam</h2><p><strong>1. An application fee is requested.</strong> No legitimate SETA-funded learnership ever charges a fee to apply.</p><p><strong>2. Documents requested before an interview.</strong> Real programmes only request documents at the interview stage or after an offer.</p><p><strong>3. The stipend is unusually high.</strong> A learnership advertising R25 000/month is almost certainly fake. Typical stipends are R3 500 to R8 000.</p><p><strong>4. WhatsApp-only contact from an unknown number.</strong> Legitimate employers contact applicants via official company email addresses.</p><p><strong>5. No official company website.</strong> Always verify the company exists at cipc.co.za before engaging.</p><p><strong>6. Urgency pressure.</strong> Apply in the next 24 hours or lose your spot. Legitimate programmes have published closing dates, not artificial urgency.</p><p><strong>7. The email domain is generic.</strong> setalearnerships@gmail.com is not an official company email. Real employers use @companyname.co.za addresses.</p><h2>How to Verify a Legitimate Opportunity</h2><p>Search the company name on Google and go directly to their official website. Look for the opportunity on their official careers page. If it's not there, treat it as suspicious. Verify company registration at cipc.co.za.</p>", "<p>The National Qualifications Framework (NQF) is South Africa's system for classifying all education and training qualifications. Every qualification sits at a specific level. This matters because every opportunity listing states a minimum NQF level or qualification type.</p><h2>The Key Levels</h2><p><strong>NQF Level 4 — Matric (Grade 12 / NSC).</strong> The most common entry level for learnerships. Most SETA learnership programmes lead to an NQF Level 4 qualification.</p><p><strong>NQF Level 5 — Higher Certificate.</strong> A one-year post-Matric qualification. Opens more learnership and some internship doors.</p><p><strong>NQF Level 6 — Diploma / Advanced Certificate.</strong> A three-year TVET or university diploma. Required for many graduate internship programmes.</p><p><strong>NQF Level 7 — Bachelor's Degree.</strong> A three-year university degree. Required for corporate graduate programmes and professional internships.</p><h2>TVET and Learnerships</h2><p>Many SETA learnerships specifically target TVET graduates — particularly N6 graduates who need the 18-month practical component for their National Diploma. A TVET-funded learnership allows you to complete your diploma while being paid a stipend.</p>"]
- `category` unique values (2): ["career-advice", "seta-guides"]
  - Normalized suggestion: ["career-advice", "seta-guides"]
- `id` unique values (7): ["g001", "g002", "g003", "g004", "g005", "g006", "g007"]
- `intro` unique values (7): ["A learnership is a structured training programme combining classroom learning with real work experience. You earn a nationally recognised qualification AND a monthly stipend — and it's completely free to apply for.", "A SETA — Sector Education and Training Authority — is a government body that funds skills training in South Africa. There are 21 SETAs, each responsible for a different sector of the economy.", "Applying for a learnership doesn't have to be complicated. This step-by-step guide covers everything — from checking your eligibility to submitting your application. Never pay to apply.", "Learnership scams are widespread in South Africa. Fake opportunities advertised on social media cost job seekers thousands of rands every year. Here's how to protect yourself.", "NSFAS covers tuition, accommodation, and a living allowance for students at public universities and TVET colleges. No repayment required for most students.", "The NQF — National Qualifications Framework — classifies all South African qualifications from Level 1 to Level 10. Understanding it helps you know exactly which opportunities you qualify for.", "Your CV is the first filter between you and a learnership. A clean, 2-page CV with the right information gives you a real advantage over hundreds of applications."]
- `meta_description` unique values (7): ["A learnership pays you a monthly stipend while you earn an NQF qualification. Find out how learnerships work, who can apply, and how to get one in South Africa.", "Complete step-by-step guide to applying for learnerships in South Africa. Documents needed, motivational letter tips, and how to find official applications.", "Everything you need to know about NSFAS 2026 — who qualifies, what is covered, how to apply at myNSFAS, and how it compares to private bursaries.", "Learn to identify fake learnerships in South Africa. Know the 7 red flags, how to verify opportunities, and what to do if you've been scammed.", "Learn what a SETA is, how SETAs fund learnerships, and how to access SETA opportunities in South Africa. Clear, plain-language guide updated for 2026.", "Understand South Africa's NQF qualification levels and what they mean for learnerships, bursaries, and career opportunities. Plain-language guide.", "Write a winning CV for learnership applications in South Africa. Structure, rules, and tips — free guide for first-time applicants."]
- `meta_title` unique values (7): ["How to Apply for a Learnership in South Africa: Step-by-Step 2026", "How to Avoid Learnership Scams in South Africa 2026", "How to Write a CV for a Learnership — South Africa 2026", "NQF Levels Explained — South Africa 2026 Guide", "NSFAS 2026 Application: Who Qualifies, What It Covers & How to Apply", "What Is a Learnership? South Africa Guide 2026", "What Is a SETA in South Africa? Complete 2026 Guide"]
- `published_date` unique values (7): ["2026-04-01", "2026-04-02", "2026-04-03", "2026-04-04", "2026-04-05", "2026-04-06", "2026-04-07"]
- `read_time` unique values (3): ["4 min", "5 min", "6 min"]
- `slug` unique values (7): ["cv-for-learnership", "how-to-apply-for-learnerships", "learnership-scams", "nqf-levels-explained", "nsfas-2026", "what-is-a-learnership", "what-is-a-seta"]
- `title` unique values (7): ["How to Apply for Learnerships: Step-by-Step Guide 2026", "How to Avoid Learnership Scams in South Africa (2026)", "How to Write a CV for a Learnership (With Structure)", "NQF Levels Explained: What They Mean for Your Career (2026)", "NSFAS 2026: How to Apply, Who Qualifies & What It Covers", "What Is a Learnership in South Africa? 2026 Explained", "What Is a SETA in South Africa? Complete Guide 2026"]
- `updated_date` unique values (7): ["2026-04-02", "2026-04-03", "2026-04-04", "2026-04-05", "2026-04-06", "2026-04-07", "2026-04-20"]

### Boolean normalization audit

- No boolean representation inconsistencies detected.

### Date format analysis

- `updated_date`: {'YYYY-MM-DD': 7} — OK: all values use YYYY-MM-DD.
- Required standard: YYYY-MM-DD.

### URL validation audit

- No target URL fields (`source_url`, `application_url`) detected.

### Duplicate structure detection

- No duplicates found by title + closing_date or source_url methods.

## Schema inventory: `Data/categories.json`

### Fields found

- bg
- color
- description
- icon
- id
- label
- plural
- seo_desc
- seo_title

### Field types

- bg → string
- color → string
- description → string
- icon → string
- id → string
- label → string
- plural → string
- seo_desc → string
- seo_title → string

### Required fields (present in 95%+ records)

- bg
- color
- description
- icon
- id
- label
- plural
- seo_desc
- seo_title

### Optional fields (present in <95% records)

- None

### Inconsistent presence

- None detected.

### Field usage frequency

- bg → 100.0%
- color → 100.0%
- description → 100.0%
- icon → 100.0%
- id → 100.0%
- label → 100.0%
- plural → 100.0%
- seo_desc → 100.0%
- seo_title → 100.0%

### String value variation analysis

- `bg` unique values (4): ["#dbeafe", "#dcfce7", "#f3e8ff", "#fef3c7"]
- `color` unique values (4): ["#166534", "#1e40af", "#6b21a8", "#92400e"]
- `description` unique values (4): ["Artisan trade training leading to a nationally recognised trade certificate. 2–3 year programmes.", "Earn a nationally recognised qualification while earning a monthly stipend. Free to apply.", "Financial funding for studies at a public university or TVET college. Covers tuition and living costs.", "Structured work experience for graduates and students. Government and private sector programmes."]
- `icon` unique values (4): ["🎓", "💼", "📚", "🔧"]
- `id` unique values (4): ["apprenticeship", "bursary", "internship", "learnership"]
- `label` unique values (4): ["Apprenticeships", "Bursaries", "Internships", "Learnerships"]
- `plural` unique values (4): ["apprenticeships", "bursaries", "internships", "learnerships"]
- `seo_desc` unique values (4): ["Find apprenticeship programmes in South Africa for 2026. Electrical, mechanical, boilermaking, plumbing and more. Verified SETA-funded opportunities.", "Find government and corporate bursaries for South African students in 2026. NSFAS, merit bursaries, and need-based funding. Updated daily.", "Find verified learnerships across South Africa for 2026. Filter by province, qualification, and closing date. All free to apply. Updated daily.", "Graduate internships and work experience programmes across South Africa for 2026. Filter by province, sector, and qualification. Verified listings."]
- `seo_title` unique values (4): ["Apprenticeships in South Africa 2026 — Become a Qualified Artisan", "Bursaries South Africa 2026 — Find Funding for Your Studies", "Internships in South Africa 2026 — Graduate Opportunities", "Learnerships in South Africa 2026 — Find & Apply"]

### Boolean normalization audit

- No boolean representation inconsistencies detected.

### Date format analysis

- No target date fields (`closing_date`, `posted_date`, `updated_date`) detected.

### URL validation audit

- No target URL fields (`source_url`, `application_url`) detected.

### Duplicate structure detection

- No duplicates found by title + closing_date or source_url methods.

## Schema inventory: `Data/provinces.json`

### Fields found

- description
- icon
- id
- label
- major_cities
- seo_desc
- seo_title
- top_employers

### Field types

- description → string
- icon → string
- id → string
- label → string
- major_cities → array
- seo_desc → string
- seo_title → string
- top_employers → array

### Required fields (present in 95%+ records)

- description
- icon
- id
- label
- major_cities
- seo_desc
- seo_title
- top_employers

### Optional fields (present in <95% records)

- None

### Inconsistent presence

- None detected.

### Field usage frequency

- description → 100.0%
- icon → 100.0%
- id → 100.0%
- label → 100.0%
- major_cities → 100.0%
- seo_desc → 100.0%
- seo_title → 100.0%
- top_employers → 100.0%

### String value variation analysis

- `description` unique values (9): ["Agriculture, gold mining near Welkom, and public sector employment in Bloemfontein (judicial capital) drive opportunities. Mangaung Metro is the largest public sector employer.", "Centre of South Africa's platinum mining industry. Sibanye-Stillwater, Lonmin, and Anglo American run major learnership and apprenticeship programmes in the Rustenburg area.", "Home to Africa's busiest port, driving consistent Transnet and logistics opportunities. Strong automotive (Toyota SA), sugar, and petrochemicals sectors.", "Mining (platinum, chrome, coal) and agriculture drive the economy. Anglo American Platinum, Implats, and Northam Platinum run consistent learnership and apprenticeship programmes.", "South Africa's automotive manufacturing hub. Volkswagen SA (Uitenhage), Isuzu (East London), and Mercedes-Benz SA are major learnership and apprenticeship providers.", "South Africa's economic heartland. The highest volume of learnerships, internships, and bursaries of any province. Home to the big banks, Eskom, Transnet, and most major corporate headquarters.", "South Africa's energy heartland — home to most of Eskom's power stations and Sasol's Secunda operations. Consistent source of engineering and instrumentation learnership opportunities.", "South Africa's largest but least populated province. Diamond mining (De Beers) and iron ore (Kumba Iron Ore) are primary opportunity sources. Less competition per listing than any other province.", "South Africa's second-largest opportunity market. Cape Town hosts major retail headquarters (Shoprite, Pick n Pay, Woolworths), Capitec Bank HQ, and a growing technology sector."]
- `icon` unique values (8): ["⚡", "🌊", "🌻", "🌾", "🌿", "🏔️", "🏙️", "🏜️"]
- `id` unique values (9): ["eastern-cape", "free-state", "gauteng", "kwazulu-natal", "limpopo", "mpumalanga", "north-west", "northern-cape", "western-cape"]
- `label` unique values (9): ["Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", "Mpumalanga", "North West", "Northern Cape", "Western Cape"]
- `seo_desc` unique values (9): ["Find learnerships, bursaries, and internships in KwaZulu-Natal for 2026. Durban, Pietermaritzburg and more. Verified opportunities.", "Find learnerships, bursaries, and internships in the Eastern Cape for 2026. Automotive, government, and manufacturing opportunities. Verified.", "Find verified learnerships and internships in Mpumalanga for 2026. Energy, mining, and government opportunities.", "Find verified learnerships and internships in North West province for 2026. Mining, government, and engineering opportunities.", "Find verified learnerships and internships in the Free State for 2026. Government, agriculture, and mining opportunities. Verified listings.", "Find verified learnerships and internships in the Northern Cape for 2026. Mining, government, and artisan opportunities. Less competition.", "Find verified learnerships, bursaries, and internships in Gauteng for 2026. Johannesburg, Pretoria, and Ekurhuleni. Filter by category and closing date.", "Find verified learnerships, bursaries, and internships in Limpopo for 2026. Mining, agriculture, and government opportunities.", "Find verified learnerships, bursaries, and internships in the Western Cape for 2026. Cape Town and surrounding areas. Verified, free to apply."]
- `seo_title` unique values (9): ["Learnerships & Bursaries in Free State 2026 | Bloemfontein", "Learnerships & Bursaries in Limpopo 2026 | Polokwane", "Learnerships & Bursaries in Mpumalanga 2026 | Nelspruit & Secunda", "Learnerships & Bursaries in North West 2026 | Rustenburg", "Learnerships & Bursaries in Northern Cape 2026 | Kimberley", "Learnerships & Internships in Eastern Cape 2026 | Gqeberha & East London", "Learnerships & Internships in Gauteng 2026 | Johannesburg & Pretoria", "Learnerships & Internships in KwaZulu-Natal 2026 | Durban", "Learnerships & Internships in Western Cape 2026 | Cape Town"]

### Boolean normalization audit

- No boolean representation inconsistencies detected.

### Date format analysis

- No target date fields (`closing_date`, `posted_date`, `updated_date`) detected.

### URL validation audit

- No target URL fields (`source_url`, `application_url`) detected.

### Duplicate structure detection

- No duplicates found by title + closing_date or source_url methods.

## Schema inconsistencies and data quality issues

- Exact lowercase `/data/...` paths are missing, while audited files exist under `Data/...`; this may break code or automation expecting lowercase paths.

## Normalization requirements

- Enforce lowercase canonical category IDs where `category` is used.
- Enforce canonical province labels or IDs before adding filter automation.
- Enforce YYYY-MM-DD for all date fields.
- Enforce HTTPS URLs for `source_url` and `application_url` when present.
- Keep boolean fields as real JSON booleans, not strings or numbers.

## Recommended fixes (no implementation performed)

1. Decide whether the canonical data directory should be `data/` or `Data/`, then update repository paths consistently in a future change.
2. Adopt `docs/schema-draft.json` as the preliminary schema contract for automation planning.
3. Add validation checks for required fields, allowed values, dates, URLs, duplicate URLs, and duplicate title/date combinations.
4. Continue monitoring duplicate `source_url` values in future audits; none were detected in this baseline.
5. Keep this audit as a baseline before any normalization or cleanup phase.
