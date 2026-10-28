'use strict';

// Turns a hand-written draft into a complete data/opportunities.json record, or
// explains what is wrong. Pure functions (no file or network access) so they can
// be unit-tested; scripts/add-listing.js does the I/O.

const { findUncoveredVerified, hostOf, hostsRelated } = require('../validators/registry-coverage');

const CATEGORIES = ['learnership', 'internship', 'bursary', 'apprenticeship', 'tvet', 'job'];
const PROVINCES = ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape', 'Nationwide'];
const EMPLOYMENT = ['unemployed', 'student', 'employed'];
const REQUIRED_TEXT = ['title', 'category', 'sector', 'province', 'qualification_level', 'stipend', 'closing_date', 'application_url', 'source_name', 'source_url', 'description'];
const REQUIRED_LISTS = ['eligibility', 'documents_needed', 'employment_eligibility'];

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
function buildListing(draft, existing, sources, now = new Date()) {
  const errors = [];
  const warnings = [];
  const d = draft && typeof draft === 'object' ? draft : {};
  const today = todaySA(now);

  for (const field of REQUIRED_TEXT) {
    if (typeof d[field] !== 'string' || d[field].trim() === '') errors.push(`${field} is required (non-empty text)`);
  }
  for (const field of REQUIRED_LISTS) {
    if (!nonEmptyStrings(d[field])) errors.push(`${field} must be a non-empty list of text`);
  }
  if (d.category && !CATEGORIES.includes(d.category)) errors.push(`category must be one of: ${CATEGORIES.join(', ')}`);
  if (d.province && !PROVINCES.includes(d.province)) errors.push(`province must be one of: ${PROVINCES.join(', ')}`);
  if (nonEmptyStrings(d.employment_eligibility)) {
    const bad = d.employment_eligibility.filter((v) => !EMPLOYMENT.includes(v));
    if (bad.length) errors.push(`employment_eligibility has invalid value(s): ${bad.join(', ')} (allowed: ${EMPLOYMENT.join(', ')})`);
  }
  for (const field of ['application_url', 'source_url']) {
    if (d[field] && !isHttpUrl(d[field])) errors.push(`${field} must be a valid http(s) URL`);
  }
  if (d.closing_date) {
    if (!isRealDate(d.closing_date)) errors.push('closing_date must be a real date as YYYY-MM-DD');
    else if (d.closing_date < today) errors.push(`closing_date ${d.closing_date} is before today (${today}); do not add a closed opportunity`);
  }
  if (d.tags !== undefined && !(Array.isArray(d.tags) && d.tags.every((t) => typeof t === 'string'))) errors.push('tags must be a list of text');
  if (typeof d.description === 'string' && d.description.trim().length > 0 && d.description.trim().length < 80) {
    warnings.push('description is under 80 characters; longer text is better for search');
  }

  const slug = d.slug ? String(d.slug) : slugify(d.title);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) errors.push('slug must be lowercase kebab-case (omit it to generate one from the title)');
  if (existing.some((o) => o.slug === slug)) errors.push(`slug "${slug}" is already used by listing ${existing.find((o) => o.slug === slug).id}`);
  if (d.application_url && existing.some((o) => o.application_url === d.application_url)) {
    errors.push(`application_url is already used by listing ${existing.find((o) => o.application_url === d.application_url).id}`);
  }

  const verified = d.verified === true;
  if (verified && errors.length === 0) {
    const probe = findUncoveredVerified([{ id: 'draft', verified: true, source_url: d.source_url, application_url: d.application_url }], sources);
    for (const gap of probe) errors.push(`verified: true needs ${gap.field} domain "${gap.host}" in data/sources.json; register it first or leave verified false`);
  }
  if (!verified) warnings.push('verified is false: the listing is published as unverified until you have checked it against its official page');
  if (d.application_url && d.source_url && isHttpUrl(d.application_url) && isHttpUrl(d.source_url) &&
      !hostsRelated(hostOf(d.application_url), hostOf(d.source_url))) {
    warnings.push('application_url and source_url are on different sites; confirm the application link really belongs to the source');
  }

  if (errors.length) return { listing: null, errors, warnings };

  const listing = {
    id: nextId(existing),
    slug,
    title: d.title.trim(),
    category: d.category,
    sector: d.sector.trim(),
    province: d.province,
    qualification_level: d.qualification_level.trim(),
    stipend: d.stipend.trim(),
    closing_date: d.closing_date,
    application_url: d.application_url.trim(),
    source_name: d.source_name.trim(),
    source_url: d.source_url.trim(),
    verified,
    featured: d.featured === true,
    expired: false,
    description: d.description.trim(),
    eligibility: d.eligibility.map((v) => v.trim()),
    employment_eligibility: d.employment_eligibility,
    documents_needed: d.documents_needed.map((v) => v.trim()),
    tags: Array.isArray(d.tags) ? d.tags : [],
    posted_date: today,
    updated_date: today,
  };
  return { listing, errors, warnings };
}

module.exports = { buildListing, slugify, nextId, todaySA, CATEGORIES, PROVINCES, EMPLOYMENT };
