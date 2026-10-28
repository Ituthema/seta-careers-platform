# Listing drafts

Drafts for `npm run add:listing` (see `docs/source-registry.md`, "Adding a listing"). A draft here is **not published**. To publish:

    npm run add:listing -- docs/listing-drafts/<file>.json            # dry run
    npm run add:listing -- docs/listing-drafts/<file>.json --write    # append, regenerate, validate

Delete or move a draft once it is published or its closing date has passed.

## 2026-10-25 from setacareers.co.za (third-party blog, not a SETA)

| Draft | Status |
|---|---|
| `afgri-farming-learnership-2026-2027.json` | Closes **28 Oct 2026** per the blog quoting AFGRI's portal (ref AO-2494). `verified: false`: I could not open the AFGRI portal page myself (fetch tool refused the URL). Open the application link, confirm the date and requirements, then publish. |

Posts with **no published closing date**, so no draft (the schema requires one and the add command refuses past or missing dates):

| Opportunity | Posted | Portal |
|---|---|---|
| MAZIV Cape Town Learnership 2026 (12 months, Western Cape, ages 18 to 35) | 22 Oct 2026 | maziv.mcidirecthire.com |
| SVA Architectural Internship 2027 (Johannesburg or Cape Town, ref GIB-478) | 15 Oct 2026 | gibb.mcidirecthire.com/SVA |
| Melomed Plumbing Internship, N6 (Cape Town Southern Suburbs, ref MG-Plumb-Intern) | 22 Oct 2026 | melomed.mcidirecthire.com |
| Melomed Electrical Internship, N6 (ref MG-Elec-Intern) | 22 Oct 2026 | melomed.mcidirecthire.com |

If the employer portal shows a closing date, send it and I will write the draft.
