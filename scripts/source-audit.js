#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SOURCE_TYPES = new Set([
  'government',
  'seta',
  'university',
  'municipality',
  'soe',
  'private',
]);

const CRAWL_STRATEGIES = new Set(['html', 'pdf', 'rss', 'api', 'hybrid']);
const FREQUENCIES = new Set(['hourly', 'daily', 'weekly', 'monthly']);
const PRIORITIES = new Set([1, 2, 3, 4]);

const REQUIRED_FIELDS = [
  'source_id',
  'name',
  'type',
  'url',
  'active',
  'crawl_strategy',
  'frequency',
  'priority',
  'last_checked',
  'last_success',
  'notes',
];

const registryPath = path.resolve(__dirname, '..', 'data', 'sources.json');

function isIsoDateOrNull(value) {
  if (value === null) return true;
  if (typeof value !== 'string') return false;
  const timestamp = Date.parse(value);
  return !Number.isNaN(timestamp) && new Date(timestamp).toISOString() === value;
}

function validateSource(source, index, seenIds) {
  const errors = [];
  const prefix = `sources[${index}]`;

  for (const field of REQUIRED_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(source, field)) {
      errors.push(`${prefix} is missing required field "${field}".`);
    }
  }

  if (typeof source.source_id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(source.source_id)) {
    errors.push(`${prefix}.source_id must be a non-empty kebab-case identifier.`);
  } else if (seenIds.has(source.source_id)) {
    errors.push(`${prefix}.source_id "${source.source_id}" is duplicated.`);
  } else {
    seenIds.add(source.source_id);
  }

  if (typeof source.name !== 'string' || source.name.trim() === '') {
    errors.push(`${prefix}.name must be a non-empty string.`);
  }

  if (!SOURCE_TYPES.has(source.type)) {
    errors.push(`${prefix}.type must be one of: ${Array.from(SOURCE_TYPES).join(', ')}.`);
  }

  try {
    const parsedUrl = new URL(source.url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      errors.push(`${prefix}.url must use http or https.`);
    }
  } catch {
    errors.push(`${prefix}.url must be a valid absolute URL.`);
  }

  if (typeof source.active !== 'boolean') {
    errors.push(`${prefix}.active must be a boolean.`);
  }

  if (!CRAWL_STRATEGIES.has(source.crawl_strategy)) {
    errors.push(`${prefix}.crawl_strategy must be one of: ${Array.from(CRAWL_STRATEGIES).join(', ')}.`);
  }

  if (!FREQUENCIES.has(source.frequency)) {
    errors.push(`${prefix}.frequency must be one of: ${Array.from(FREQUENCIES).join(', ')}.`);
  }

  if (!PRIORITIES.has(source.priority)) {
    errors.push(`${prefix}.priority must be one of: ${Array.from(PRIORITIES).join(', ')}.`);
  }

  if (!isIsoDateOrNull(source.last_checked)) {
    errors.push(`${prefix}.last_checked must be null or an ISO-8601 UTC timestamp.`);
  }

  if (!isIsoDateOrNull(source.last_success)) {
    errors.push(`${prefix}.last_success must be null or an ISO-8601 UTC timestamp.`);
  }

  if (typeof source.notes !== 'string') {
    errors.push(`${prefix}.notes must be a string.`);
  }

  return errors;
}

function loadRegistry(filePath = registryPath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function auditRegistry(sources) {
  const errors = [];
  const seenIds = new Set();

  if (!Array.isArray(sources)) {
    return ['Source registry root must be an array.'];
  }

  if (sources.length < 50) {
    errors.push(`Source registry must contain at least 50 sources; found ${sources.length}.`);
  }

  sources.forEach((source, index) => {
    errors.push(...validateSource(source, index, seenIds));
  });

  return errors;
}

function printSummary(sources) {
  const byType = sources.reduce((summary, source) => {
    summary[source.type] = (summary[source.type] || 0) + 1;
    return summary;
  }, {});

  const activeCount = sources.filter((source) => source.active).length;

  console.log(`Source registry audit: ${sources.length} sources (${activeCount} active).`);
  console.log('Sources by type:');
  for (const type of Array.from(SOURCE_TYPES)) {
    console.log(`- ${type}: ${byType[type] || 0}`);
  }
}

function main() {
  let sources;

  try {
    sources = loadRegistry();
  } catch (error) {
    console.error(`Failed to load ${registryPath}: ${error.message}`);
    process.exit(1);
  }

  const errors = auditRegistry(sources);
  printSummary(Array.isArray(sources) ? sources : []);

  if (errors.length > 0) {
    console.error('\nAudit failed:');
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log('\nAudit passed.');
}

if (require.main === module) {
  main();
}

module.exports = {
  CRAWL_STRATEGIES,
  FREQUENCIES,
  PRIORITIES,
  SOURCE_TYPES,
  auditRegistry,
  loadRegistry,
  registryPath,
};
