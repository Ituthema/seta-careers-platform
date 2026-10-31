'use strict';

// Turns a hand-written draft into a complete data/opportunities.json record, or
// explains what is wrong. Pure functions (no file or network access) so they can
// be unit-tested; scripts/add-listing.js does the I/O.

const { findUncoveredVerified, hostOf, hostsRelated } = require('../validators/registry-coverage');
const { NOTE_FIELDS, LIST_FIELDS, DEFAULT_NOTES, isMissing, missingValue, fieldLabel } = require('./field-notes');

const CATEGORIES = ['learnership', 'internship', 'bursary', 'apprenticeship', 'tvet', 'job'];
const PROVINCES = ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape', 'Nationwide'];
const EMPLOYMENT = ['unemployed', 'student', 'employed'];
// Only these are essential: without a title, a category and somewhere to apply or read the advert, there is no listing.
// Every other field may be missing, but then it is recorded as missing together with a comment (see field-notes.js).
const REQUIRED_TEXT = ['title', 'category'];

function todaySA(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Johannesburg' }).format(now);
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function isRealDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

function slugify(text) {
  return String(text || '')
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    .slice(0, 80).replace(/-+$/g, '');
}

function nextId(existing) {
  const max = existing.reduce((n, o) => Math.max(n, Number.parseInt(o.id, 10) || 0), 0);
  return String(max + 1).padStart(3, '0');
}

function nonEmptyStrings(value) {
  return Array.isArray(value) && value.length > 0 && value.every((v) => typeof v === 'string' && v.trim() !== '');
}

// Returns { listing, errors, warnings }. listing is null when there are errors.
//
// Missing optional fields never block a listing: each one is stored as an explicit
// "missing" value plus a comment in listing.field_notes (the draft may supply its own
// comment in draft.field_notes; otherwise a default such as "Stipend unknown: ..." is used).
// A value that IS supplied must still be valid (real date, known province, ...).
function buildListing(draft, existing, sources, now = new Date()) {
  const errors = [];
  const warnings = [];
  const d = draft && typeof draft === 'object' ? draft : {};
  const today = todaySA(now);

  for (const field of REQUIRED_TEXT) {
    if (typeof d[field] !== 'string' || d[field].trim() === '') errors.push(`${field} is required (non-empty text)`);
  }

  // A value of the wrong type is an error, not "missing" (so a typo never silently hides data).
  for (const field of NOTE_FIELDS) {
    const v = d[field];
    if (v === undefined || v === null || v === '') continue;
    if (LIST_FIELDS.includes(field) ? !Array.isArray(v) : typeof v !== 'string') {
      errors.push(`${field} must be ${LIST_FIELDS.includes(field) ? 'a list of text' : 'text'} (leave it out if unknown)`);
    }
  }

  // Treat an explicit "missing" marker in the draft the same as leaving the field out.
  const supplied = {};
  for (const field of NOTE_FIELDS) {
    if (!isMissing(field, d[field])) supplied[field] = d[field];
  }

  // Provided lists must contain only non-empty text.
  for (const field of LIST_FIELDS) {
    if (field in supplied && Array.isArray(supplied[field]) && !nonEmptyStrings(supplied[field])) errors.push(`${field} must be a list of non-empty text (leave it out or use [] if unknown)`);
  }

  if (d.category && !CATEGORIES.includes(d.category)) errors.push(`category must be one of: ${CATEGORIES.join(', ')}`);
  if (supplied.province && !PROVINCES.includes(supplied.province)) errors.push(`province must be one of: ${PROVINCES.join(', ')} (or leave it out if unknown)`);
  if (nonEmptyStrings(supplied.employment_eligibility)) {
    const bad = supplied.employment_eligibility.filter((v) => !EMPLOYMENT.includes(v));
    if (bad.length) errors.push(`employment_eligibility has invalid value(s): ${bad.join(', ')} (allowed: ${EMPLOYMENT.join(', ')})`);
  }

  // At least one working link is needed; the other is copied across if absent.
  const hasApply = typeof d.application_url === 'string' && d.application_url.trim() !== '';
  const hasSource = typeof d.source_url === 'string' && d.source_url.trim() !== '';
  if (!hasApply && !hasSource) errors.push('application_url or source_url is required (a listing needs a link to the official advert)');
  for (const field of ['application_url', 'source_url']) {
    if (d[field] && !isHttpUrl(d[field])) errors.push(`${field} must be a valid http(s) URL`);
  }
  const applicationUrl = (hasApply ? d.application_url : d.source_url || '').trim();
  const sourceUrl = (hasSource ? d.source_url : d.application_url || '').trim();
  if (hasApply !== hasSource && (hasApply || hasSource)) {
    warnings.push(`${hasApply ? 'source_url' : 'application_url'} was not given; the other link was used for both`);
  }

  if (supplied.closing_date) {
    if (!isRealDate(supplied.closing_date)) errors.push('closing_date must be a real date as YYYY-MM-DD (leave it out if no date is published)');
    else if (supplied.closing_date < today) errors.push(`closing_date ${supplied.closing_date} is before today (${today}); do not add a closed opportunity`);
  }
  if (d.tags !== undefined && !(Array.isArray(d.tags) && d.tags.every((t) => typeof t === 'string'))) errors.push('tags must be a list of text');
  if (typeof supplied.description === 'string' && supplied.description.trim().length < 80) {
    warnings.push('description is under 80 characters; longer text is better for search');
  }
  if (d.field_notes !== undefined && (d.field_notes === null || typeof d.field_notes !== 'object' || Array.isArray(d.field_notes))) {
    errors.push('field_notes must be an object like { "stipend": "Stipend unknown: ..." }');
  }

  const slug = d.slug ? String(d.slug) : slugify(d.title);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) errors.push('slug must be lowercase kebab-case (omit it to generate one from the title)');
  if (existing.some((o) => o.slug === slug)) errors.push(`slug "${slug}" is already used by listing ${existing.find((o) => o.slug === slug).id}`);
  if (applicationUrl && existing.some((o) => o.application_url === applicationUrl)) {
    errors.push(`application_url is already used by listing ${existing.find((o) => o.application_url === applicationUrl).id}`);
  }

  const verified = d.verified === true;
  if (verified && errors.length === 0) {
    const probe = findUncoveredVerified([{ id: 'draft', verified: true, source_url: sourceUrl, application_url: applicationUrl }], sources);
    for (const gap of probe) errors.push(`verified: true needs ${gap.field} domain "${gap.host}" in data/sources.json; register it first or leave verified false`);
  }
  if (!verified) warnings.push('verified is false: the listing is published as unverified until you have checked it against its official page');
  if (applicationUrl && sourceUrl && isHttpUrl(applicationUrl) && isHttpUrl(sourceUrl) &&
      !hostsRelated(hostOf(applicationUrl), hostOf(sourceUrl))) {
    warnings.push('application_url and source_url are on different sites; confirm the application link really belongs to the source');
  }

  if (errors.length) return { listing: null, errors, warnings };

  // Fill every missing field with its marker value and a comment.
  const customNotes = d.field_notes && typeof d.field_notes === 'object' ? d.field_notes : {};
  const fieldNotes = {};
  const value = {};
  for (const field of NOTE_FIELDS) {
    if (field in supplied) {
      value[field] = LIST_FIELDS.includes(field) ? supplied[field].map((v) => v.trim()) : String(supplied[field]).trim();
    } else {
      value[field] = missingValue(field);
      const custom = typeof customNotes[field] === 'string' ? customNotes[field].trim() : '';
      fieldNotes[field] = custom || DEFAULT_NOTES[field];
      warnings.push(`${fieldLabel(field)} is missing: stored as ${field === 'closing_date' ? 'no date' : 'unknown'} with the comment "${fieldNotes[field]}"`);
    }
  }
  if (!('closing_date' in supplied)) warnings.push('no closing date: re-check the official page regularly so this listing does not go stale');

  const listing = {
    id: nextId(existing),
    slug,
    title: d.title.trim(),
    category: d.category,
    sector: value.sector,
    province: value.province,
    qualification_level: value.qualification_level,
    stipend: value.stipend,
    closing_date: value.closing_date,
    application_url: applicationUrl,
    source_name: typeof d.source_name === 'string' && d.source_name.trim() !== '' ? d.source_name.trim() : (hostOf(sourceUrl) || 'Official source'),
    source_url: sourceUrl,
    verified,
    featured: d.featured === true,
    expired: false,
    description: value.description,
    eligibility: value.eligibility,
    employment_eligibility: value.employment_eligibility,
    documents_needed: value.documents_needed,
    tags: Array.isArray(d.tags) ? d.tags : [],
    posted_date: today,
    updated_date: today,
  };
  if (Object.keys(fieldNotes).length > 0) listing.field_notes = fieldNotes;
  return { listing, errors, warnings };
}

module.exports = { buildListing, slugify, nextId, todaySA, CATEGORIES, PROVINCES, EMPLOYMENT };
