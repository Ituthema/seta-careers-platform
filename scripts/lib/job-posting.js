'use strict';

// schema.org JobPosting for the static listing pages.
//
// Google only accepts JobPosting for real employment-type opportunities, and penalises markup
// that does not match the visible page. So this returns null unless the listing is a verified,
// open learnership/internship/apprenticeship/job with a closing date and a named employer.
// Bursaries and TVET study pathways are not jobs and never get it; unverified listings never
// get it (their details have not been checked against the official advert).

const EMPLOYMENT_CATEGORIES = new Set(['learnership', 'internship', 'apprenticeship', 'job']);
const EMPLOYMENT_TYPE = { internship: 'INTERN', learnership: 'OTHER', apprenticeship: 'OTHER', job: 'FULL_TIME' };
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function plain(value, max) {
  return String(value == null ? '' : value).replace(/\s+/g, ' ').trim().slice(0, max);
}

// Only an exact "R5 000/month" or "R7 044 per month" style figure becomes baseSalary; anything vaguer
// ("Full tuition + R5 000/month", "Not disclosed") is left out rather than guessed.
function monthlyStipend(text) {
  const m = String(text || '').trim().match(/^R\s?(\d{1,3}(?:[\s,]\d{3})*(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?)\s*(?:\/|per\s+)\s*month(?:\s*\(.*\))?$/i);
  if (!m) return null;
  const value = Number(m[1].replace(/[\s,]/g, ''));
  return Number.isFinite(value) && value > 0 ? value : null;
}

// provinceLabels: the labels from data/provinces.json. "Nationwide" and unknown values give a
// country-level location only.
function jobPostingLd(o, ctx) {
  if (!o || o.verified !== true || o.publication_status !== 'open' || o.expired) return null;
  if (!EMPLOYMENT_CATEGORIES.has(o.category)) return null;
  if (typeof o.closing_date !== 'string' || !ISO_DATE.test(o.closing_date)) return null;
  const employer = plain(o.employer, 120);
  if (!employer) return null;
  const title = plain(o.title, 150);
  const description = plain(o.description, 5000);
  if (!title || !description || !ISO_DATE.test(String(o.posted_date || ''))) return null;

  const address = { '@type': 'PostalAddress', addressCountry: 'ZA' };
  if (o.province && (ctx.provinceLabels || []).includes(o.province)) address.addressRegion = o.province;

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title,
    description: '<p>' + description.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]) + '</p>',
    identifier: { '@type': 'PropertyValue', name: 'OpportunitiesZA', value: String(o.id) },
    datePosted: o.posted_date,
    validThrough: `${o.closing_date}T23:59:59+02:00`, // South Africa time
    employmentType: EMPLOYMENT_TYPE[o.category],
    hiringOrganization: { '@type': 'Organization', name: employer },
    jobLocation: { '@type': 'Place', address },
    directApply: false,
    url: ctx.url,
  };
  const monthly = monthlyStipend(o.stipend);
  if (monthly) {
    ld.baseSalary = { '@type': 'MonetaryAmount', currency: 'ZAR', value: { '@type': 'QuantitativeValue', value: monthly, unitText: 'MONTH' } };
  }
  return ld;
}

module.exports = { jobPostingLd, monthlyStipend, EMPLOYMENT_CATEGORIES };
