#!/usr/bin/env node
/**
 * OpportunitiesZA content quality gate.
 *
 * Validates the JSON data files that power SEO pages, sitemaps, and the
 * editorial workflow. The script intentionally has zero external dependencies
 * so it can run in Termux, GitHub Actions, and local Node installs.
 */

const fs = require('fs');
const path = require('path');
const { findUncoveredVerified } = require('./validators/registry-coverage');
const { NOTE_FIELDS, NOT_STATED, isMissing, missingWithoutNote } = require('./lib/field-notes');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
// Today in South Africa (UTC+2), matching scripts/mark-expired.js.
const TODAY = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Johannesburg' }).format(new Date());
// Opt-in: turn lapsed-but-not-expired records into errors (e.g. for a scheduled
// maintenance run). Off by default so CI does not go red just because a date passed.
const STRICT_EXPIRY = process.env.CONTENT_STRICT_EXPIRY === 'true';

const opportunityRequiredFields = [
  'id',
  'slug',
  'title',
  'category',
  'sector',
  'province',
  'qualification_level',
  'stipend',
  'closing_date',
  'application_url',
  'source_name',
  'source_url',
  'verified',
  'featured',
  'expired',
  'description',
  'eligibility',
  'documents_needed',
  'employment_eligibility',
  'tags',
  'posted_date',
  'updated_date',
];

const guideRequiredFields = [
  'id',
  'slug',
  'title',
  'category',
  'intro',
  'body',
  'faq',
  'meta_title',
  'meta_description',
  'read_time',
  'published_date',
  'updated_date',
];

const categoryIds = new Set(['learnership', 'internship', 'bursary', 'apprenticeship', 'tvet', 'job']);
const guideCategories = new Set(['seta-guides', 'career-advice']);
const employmentStatuses = new Set(['unemployed', 'student', 'employed']);
const provinceNames = new Set([
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'Northern Cape',
  'North West',
  'Western Cape',
  'Nationwide',
  NOT_STATED, // province not stated by the advert (needs a field_notes comment)
]);

const errors = [];
const warnings = [];

function readJson(relativePath) {
  const fullPath = path.join(ROOT, relativePath);
  try {
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  } catch (error) {
    errors.push(`${relativePath}: ${error.message}`);
    return null;
  }
}

function isIsoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function isSlug(value) {
  return typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function assertArray(name, value, relativePath) {
  if (!Array.isArray(value)) {
    errors.push(`${relativePath}: expected top-level JSON array`);
    return false;
  }
  return true;
}

function checkRequired(record, fields, label) {
  for (const field of fields) {
    if (!(field in record)) errors.push(`${label}: missing required field "${field}"`);
  }
}

function checkUnique(records, field, label) {
  const seen = new Map();
  for (const record of records) {
    const value = record[field];
    if (seen.has(value)) {
      errors.push(`${label}: duplicate ${field} "${value}" in ${seen.get(value)} and ${record.id || record.slug}`);
    } else {
      seen.set(value, record.id || record.slug);
    }
  }
}

function validateOpportunities(opportunities) {
  if (!assertArray('opportunities', opportunities, 'data/opportunities.json')) return;

  checkUnique(opportunities, 'id', 'opportunities');
  checkUnique(opportunities, 'slug', 'opportunities');

  for (const opportunity of opportunities) {
    const label = `opportunity ${opportunity.id || opportunity.slug || '(unknown)'}`;
    checkRequired(opportunity, opportunityRequiredFields, label);

    if (!isSlug(opportunity.slug)) errors.push(`${label}: slug must be lowercase kebab-case`);
    if (!categoryIds.has(opportunity.category)) errors.push(`${label}: unknown category "${opportunity.category}"`);
    if (!provinceNames.has(opportunity.province)) warnings.push(`${label}: province "${opportunity.province}" is not in the standard province list`);

    // closing_date may be null when the advert publishes none; field_notes must then say so (checked below).
    for (const field of ['closing_date', 'posted_date', 'updated_date']) {
      if (field === 'closing_date' && isMissing('closing_date', opportunity.closing_date)) continue;
      if (!isIsoDate(opportunity[field])) errors.push(`${label}: ${field} must be YYYY-MM-DD`);
    }

    if (opportunity.updated_date && opportunity.posted_date && opportunity.updated_date < opportunity.posted_date) {
      errors.push(`${label}: updated_date cannot be before posted_date`);
    }

    if (!opportunity.expired && opportunity.closing_date && opportunity.closing_date < TODAY) {
      const msg = `${label}: closing_date ${opportunity.closing_date} is before ${TODAY} but expired is false (run: npm run expire)`;
      (STRICT_EXPIRY ? errors : warnings).push(msg);
    }

    for (const field of ['application_url', 'source_url']) {
      if (!isHttpUrl(opportunity[field])) errors.push(`${label}: ${field} must be a valid http(s) URL`);
    }

    for (const field of ['verified', 'featured', 'expired']) {
      if (typeof opportunity[field] !== 'boolean') errors.push(`${label}: ${field} must be boolean`);
    }

    // Lists must be arrays; an empty list means "not stated" and then needs a field_notes comment (checked below).
    for (const field of ['eligibility', 'documents_needed', 'tags', 'employment_eligibility']) {
      if (!Array.isArray(opportunity[field])) errors.push(`${label}: ${field} must be an array`);
    }
    if (Array.isArray(opportunity.employment_eligibility)) {
      const invalid = opportunity.employment_eligibility.filter(v => !employmentStatuses.has(v));
      if (invalid.length) {
        errors.push(`${label}: employment_eligibility contains invalid value(s): ${invalid.join(', ')}`);
      }
    }

    if (!isMissing('description', opportunity.description) && opportunity.description.length < 80) {
      warnings.push(`${label}: description should be at least 80 characters for search quality`);
    }

    // Missing-field rule: anything the advert did not state must be recorded as missing AND explained.
    if (opportunity.field_notes !== undefined) {
      const notes = opportunity.field_notes;
      if (!notes || typeof notes !== 'object' || Array.isArray(notes)) {
        errors.push(`${label}: field_notes must be an object of field name -> comment`);
      } else {
        for (const [key, value] of Object.entries(notes)) {
          if (!NOTE_FIELDS.includes(key)) errors.push(`${label}: field_notes has unknown field "${key}" (allowed: ${NOTE_FIELDS.join(', ')})`);
          else if (typeof value !== 'string' || value.trim() === '') errors.push(`${label}: field_notes.${key} must be a non-empty comment`);
        }
      }
    }
    for (const field of missingWithoutNote(opportunity)) {
      errors.push(`${label}: ${field} is missing/unknown but has no explanation; add field_notes.${field} (e.g. "${field === 'stipend' ? 'Stipend unknown: the advert does not state one.' : 'Say why this is unknown.'}")`);
    }
  }
}

function validateGuides(guides) {
  if (!assertArray('guides', guides, 'data/guides.json')) return;

  checkUnique(guides, 'id', 'guides');
  checkUnique(guides, 'slug', 'guides');

  for (const guide of guides) {
    const label = `guide ${guide.id || guide.slug || '(unknown)'}`;
    checkRequired(guide, guideRequiredFields, label);

    if (!isSlug(guide.slug)) errors.push(`${label}: slug must be lowercase kebab-case`);
    if (!guideCategories.has(guide.category)) errors.push(`${label}: unknown category "${guide.category}"`);

    for (const field of ['published_date', 'updated_date']) {
      if (!isIsoDate(guide[field])) errors.push(`${label}: ${field} must be YYYY-MM-DD`);
    }

    if (guide.updated_date && guide.published_date && guide.updated_date < guide.published_date) {
      errors.push(`${label}: updated_date cannot be before published_date`);
    }

    if (!Array.isArray(guide.faq) || guide.faq.length === 0) {
      errors.push(`${label}: faq must be a non-empty array`);
    }

    if (typeof guide.meta_description === 'string' && guide.meta_description.length > 160) {
      warnings.push(`${label}: meta_description is over 160 characters`);
    }
  }
}

function validateMetadata(file, requiredFields) {
  const records = readJson(file);
  if (!records || !assertArray(file, records, file)) return;

  checkUnique(records, 'id', file);
  for (const record of records) {
    const label = `${file} ${record.id || '(unknown)'}`;
    for (const field of requiredFields) {
      if (!(field in record)) errors.push(`${label}: missing required field "${field}"`);
    }
    if (!isSlug(record.id)) errors.push(`${label}: id must be lowercase kebab-case`);
  }
}

if (!fs.existsSync(DATA_DIR)) {
  errors.push('Expected lowercase data/ directory. Rename Data/ to data/ for Linux and GitHub Pages compatibility.');
}

const opportunitiesData = readJson('data/opportunities.json');
validateOpportunities(opportunitiesData);

// Verified listings must point at domains the source registry knows about.
// Live listings are errors; expired ones are warnings so history does not block CI.
const sourcesData = readJson('data/sources.json');
if (Array.isArray(opportunitiesData) && Array.isArray(sourcesData)) {
  for (const gap of findUncoveredVerified(opportunitiesData, sourcesData)) {
    const msg = `opportunity ${gap.id}: verified listing ${gap.field} domain "${gap.host || gap.url}" is not in data/sources.json (add it, or set verified to false)`;
    (gap.expired ? warnings : errors).push(msg);
  }
}
validateGuides(readJson('data/guides.json'));
validateMetadata('data/categories.json', ['id', 'label', 'icon', 'description']);
validateMetadata('data/provinces.json', ['id', 'label', 'icon', 'major_cities', 'description']);

for (const warning of warnings) console.warn(`⚠️  ${warning}`);

if (errors.length > 0) {
  console.error('\n❌ Content validation failed:');
  for (const error of errors) console.error(`   - ${error}`);
  process.exit(1);
}

console.log(`✅ Content validation passed with ${warnings.length} warning(s).`);
