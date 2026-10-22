# Progress log (update after EVERY batch; resume from the first unchecked item)
Resume rule: continue from the first unchecked batch. Registry counts: 75 before batch 1, 82 after batch 1, 92 after batch 2, 104 after batch 3, 116 after batch 4, 131 after batch 5, 146 after batch 6, 154 after batch 7. Method and schema rules: docs/source-governance.md and docs/source-registry.md. Researchers verify every URL by fetching it, never register aggregators, never get around robots blocks. Do NOT stack PRs on another batch branch (batch 2 was lost that way once); branch each batch from main.
Rules: one batch = one research area, write results to its own file, then commit/PR before starting the next.

- [x] 1 national_departments.md (done, merged)
- [x] 2 youth_funders_bursaries.md (done, merged)
- [ ] 2b jobs-fund, SEFA, NEF, professional bodies (ECSA, SAIPA, HPCSA, SACAP), corporate bursary funders, NYDA ERP vacancies
- [x] 3 provincial_governments.md (done: see docs/source-research/batch-3-provincial-governments.md)
- [x] 4 setas_qcto.md (done: see docs/source-research/batch-4-setas-qcto.md)
- [ ] 4b better listing URLs for the 11 SETAs already registered; National Skills Fund; unresolved SETA listing pages (CATHSSETA, FASSET, FP&M, INSETA, SASSETA, W&RSETA)
- [x] 5 universities (done: see docs/source-research/batch-5-universities.md)
- [ ] 5b TVET colleges; better listing URLs for the 10 registered universities; UFH, WSU, UMP index pages
- [x] 6 soes_public_entities (done: see docs/source-research/batch-6-soes-public-entities.md; follow-ups listed there)
- [x] 7 municipalities (done: see docs/source-research/batch-7-municipalities.md)
- [ ] 8 private_finance_consulting_tech.md
- [ ] 9 private_mining_energy_retail_other.md
Status: user abandoned the 9-agent parallel run on 2026-10-20 (nothing was researched). Restart small, one batch at a time.
