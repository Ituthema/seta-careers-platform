# Listing drafts

Drafts for `npm run add:listing` (see `docs/source-registry.md`, "Adding a listing"). A draft here is **not published**. To publish:

    npm run add:listing -- docs/listing-drafts/<file>.json            # dry run
    npm run add:listing -- docs/listing-drafts/<file>.json --write    # append, regenerate, validate

Delete or move a draft once it is published or its closing date has passed.

## 2026-11-16 bursary search (Nov 2026 to Jan 2027 closing window)

| Draft | Status |
|---|---|
| `emalahleni-external-bursary-2027.json` | Closes **27 Nov 2026** per a third-party article that links the municipal notice. `verified: false`: the fetch tool could not open emalahleni.gov.za. Open the notice, confirm the date and details, then publish. |

Checked and **not** drafted because they have already closed: Garden Route District Municipality external bursaries 2027 (closed 31 Oct 2026, official notice read on gardenroute.gov.za) and the Free State Provincial Government bursaries 2027 (closed 13 Nov 2026 per a third-party article). Ekurhuleni (id 020) is already listed. Other 2027 leads seen only on aggregators, with no closing date confirmed on an official page: Nkangala District Municipality, Emfuleni Mayoral Bursary, George and Witzenberg municipalities, Limpopo LDARD and Public Works, Gauteng Sport, Arts, Culture and Recreation, Office of the Premier (provincial).

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
