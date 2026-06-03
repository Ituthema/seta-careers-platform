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

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const TODAY = new Date().toISOString().slice(0, 10);

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

const categoryIds = new Set(['learnership', 'internship', 'bursary', 'apprenticeship', 'tvet']);
const guideCategories = new Set(['seta-guides', 'career-advice']);
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

    for (const field of ['closing_date', 'posted_date', 'updated_date']) {
      if (!isIsoDate(opportunity[field])) errors.push(`${label}: ${field} must be YYYY-MM-DD`);
    }

    if (opportunity.updated_date && opportunity.posted_date && opportunity.updated_date < opportunity.posted_date) {
      errors.push(`${label}: updated_date cannot be before posted_date`);
    }

    if (!opportunity.expired && opportunity.closing_date && opportunity.closing_date < TODAY) {
      warnings.push(`${label}: closing_date ${opportunity.closing_date} is before ${TODAY} but expired is false`);
    }

    for (const field of ['application_url', 'source_url']) {
      if (!isHttpUrl(opportunity[field])) errors.push(`${label}: ${field} must be a valid http(s) URL`);
    }

    for (const field of ['verified', 'featured', 'expired']) {
      if (typeof opportunity[field] !== 'boolean') errors.push(`${label}: ${field} must be boolean`);
    }

    for (const field of ['eligibility', 'documents_needed', 'tags']) {
      if (!Array.isArray(opportunity[field]) || opportunity[field].length === 0) {
        errors.push(`${label}: ${field} must be a non-empty array`);
      }
    }

    if (typeof opportunity.description !== 'string' || opportunity.description.length < 80) {
      warnings.push(`${label}: description should be at least 80 characters for search quality`);
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

validateOpportunities(readJson('data/opportunities.json'));
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
