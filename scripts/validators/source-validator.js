const fs = require('fs');
const path = require('path');

const SOURCE_TYPES = Object.freeze([
  'government',
  'seta',
  'university',
  'municipality',
  'soe',
  'private',
]);

const CRAWL_STRATEGIES = Object.freeze(['html', 'pdf', 'rss', 'api', 'hybrid']);
const FREQUENCIES = Object.freeze(['hourly', 'daily', 'weekly', 'monthly']);
const PRIORITIES = Object.freeze([1, 2, 3, 4]);

const REQUIRED_FIELDS = Object.freeze([
  'source_id',
  'name',
  'url',
  'type',
  'active',
  'crawl_strategy',
  'frequency',
  'priority',
  'last_checked',
  'last_success',
  'notes',
]);

const DEFAULT_REGISTRY_PATH = path.resolve(__dirname, '..', '..', 'data', 'sources.json');
const SOURCE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function createIssue(level, code, message, source = null, field = null) {
  return { level, code, message, source_id: source ? source.source_id || null : null, field };
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isIsoDateOrNull(value) {
  if (value === null) return true;
  if (typeof value !== 'string') return false;

  const timestamp = Date.parse(value);
  return !Number.isNaN(timestamp) && new Date(timestamp).toISOString() === value;
}

function normalizeUrl(value) {
  const parsedUrl = new URL(value);
  parsedUrl.hash = '';

  if ((parsedUrl.protocol === 'https:' && parsedUrl.port === '443') || (parsedUrl.protocol === 'http:' && parsedUrl.port === '80')) {
    parsedUrl.port = '';
  }

  parsedUrl.hostname = parsedUrl.hostname.toLowerCase();
  return parsedUrl.toString().replace(/\/$/, '');
}

function validateUrl(value) {
  if (typeof value !== 'string' || value.trim() === '') {
    return { valid: false, normalizedUrl: null, message: 'url must be a non-empty string.' };
  }

  try {
    const parsedUrl = new URL(value);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return { valid: false, normalizedUrl: null, message: 'url must use http or https.' };
    }

    return { valid: true, normalizedUrl: normalizeUrl(value), message: null };
  } catch {
    return { valid: false, normalizedUrl: null, message: 'url must be a valid absolute URL.' };
  }
}

function validateSource(source, index = 0) {
  const issues = [];
  const prefix = `sources[${index}]`;

  if (!isPlainObject(source)) {
    issues.push(createIssue('FAIL', 'INVALID_SOURCE_OBJECT', `${prefix} must be an object.`));
    return issues;
  }

  for (const field of REQUIRED_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(source, field)) {
      issues.push(createIssue('FAIL', 'MISSING_FIELD', `${prefix} is missing required field "${field}".`, source, field));
    }
  }

  if (typeof source.source_id !== 'string' || !SOURCE_ID_PATTERN.test(source.source_id)) {
    issues.push(createIssue('FAIL', 'INVALID_SOURCE_ID', `${prefix}.source_id must be a non-empty kebab-case identifier.`, source, 'source_id'));
  }

  if (typeof source.name !== 'string' || source.name.trim() === '') {
    issues.push(createIssue('FAIL', 'INVALID_NAME', `${prefix}.name must be a non-empty string.`, source, 'name'));
  }

  if (!SOURCE_TYPES.includes(source.type)) {
    issues.push(createIssue('FAIL', 'INVALID_SOURCE_TYPE', `${prefix}.type must be one of: ${SOURCE_TYPES.join(', ')}.`, source, 'type'));
  }

  const urlResult = validateUrl(source.url);
  if (!urlResult.valid) {
    issues.push(createIssue('FAIL', 'INVALID_URL', `${prefix}.${urlResult.message}`, source, 'url'));
  }

  if (typeof source.active !== 'boolean') {
    issues.push(createIssue('FAIL', 'INVALID_ACTIVE', `${prefix}.active must be a boolean.`, source, 'active'));
  }

  if (!CRAWL_STRATEGIES.includes(source.crawl_strategy)) {
    issues.push(createIssue('FAIL', 'INVALID_CRAWL_STRATEGY', `${prefix}.crawl_strategy must be one of: ${CRAWL_STRATEGIES.join(', ')}.`, source, 'crawl_strategy'));
  }

  if (!FREQUENCIES.includes(source.frequency)) {
    issues.push(createIssue('FAIL', 'INVALID_FREQUENCY', `${prefix}.frequency must be one of: ${FREQUENCIES.join(', ')}.`, source, 'frequency'));
  }

  if (!PRIORITIES.includes(source.priority)) {
    issues.push(createIssue('FAIL', 'INVALID_PRIORITY', `${prefix}.priority must be one of: ${PRIORITIES.join(', ')}.`, source, 'priority'));
  }

  if (!isIsoDateOrNull(source.last_checked)) {
    issues.push(createIssue('FAIL', 'INVALID_LAST_CHECKED', `${prefix}.last_checked must be null or an ISO-8601 UTC timestamp.`, source, 'last_checked'));
  }

  if (!isIsoDateOrNull(source.last_success)) {
    issues.push(createIssue('FAIL', 'INVALID_LAST_SUCCESS', `${prefix}.last_success must be null or an ISO-8601 UTC timestamp.`, source, 'last_success'));
  }

  if (typeof source.notes !== 'string') {
    issues.push(createIssue('FAIL', 'INVALID_NOTES', `${prefix}.notes must be a string.`, source, 'notes'));
  } else if (source.notes.trim() === '') {
    issues.push(createIssue('WARN', 'EMPTY_NOTES', `${prefix}.notes is empty; add source context for operators.`, source, 'notes'));
  }

  return issues;
}

function validateDuplicates(sources) {
  const issues = [];
  const idMap = new Map();
  const urlMap = new Map();

  sources.forEach((source, index) => {
    if (!isPlainObject(source)) return;

    if (typeof source.source_id === 'string' && source.source_id.trim() !== '') {
      const existingIndex = idMap.get(source.source_id);
      if (existingIndex !== undefined) {
        issues.push(createIssue('FAIL', 'DUPLICATE_SOURCE_ID', `sources[${index}].source_id duplicates sources[${existingIndex}].source_id: "${source.source_id}".`, source, 'source_id'));
      } else {
        idMap.set(source.source_id, index);
      }
    }

    const urlResult = validateUrl(source.url);
    if (urlResult.valid) {
      const existingIndex = urlMap.get(urlResult.normalizedUrl);
      if (existingIndex !== undefined) {
        issues.push(createIssue('FAIL', 'DUPLICATE_URL', `sources[${index}].url duplicates sources[${existingIndex}].url: "${urlResult.normalizedUrl}".`, source, 'url'));
      } else {
        urlMap.set(urlResult.normalizedUrl, index);
      }
    }
  });

  return issues;
}

function validateRegistry(sources, options = {}) {
  const issues = [];
  const minimumSources = options.minimumSources ?? 1;

  if (!Array.isArray(sources)) {
    return {
      valid: false,
      status: 'FAIL',
      issues: [createIssue('FAIL', 'INVALID_REGISTRY_ROOT', 'Source registry root must be an array.')],
      summary: { total: 0, active: 0, inactive: 0, by_type: {}, issue_counts: { PASS: 0, WARN: 0, FAIL: 1 } },
    };
  }

  if (sources.length < minimumSources) {
    issues.push(createIssue('FAIL', 'MINIMUM_SOURCE_COUNT', `Source registry must contain at least ${minimumSources} sources; found ${sources.length}.`));
  }

  sources.forEach((source, index) => {
    issues.push(...validateSource(source, index));
  });
  issues.push(...validateDuplicates(sources));

  const byType = sources.reduce((summary, source) => {
    const type = isPlainObject(source) ? source.type || 'unknown' : 'unknown';
    summary[type] = (summary[type] || 0) + 1;
    return summary;
  }, {});

  const active = sources.filter((source) => isPlainObject(source) && source.active === true).length;
  const issueCounts = issues.reduce((counts, issue) => {
    counts[issue.level] = (counts[issue.level] || 0) + 1;
    return counts;
  }, { PASS: 0, WARN: 0, FAIL: 0 });

  const status = issueCounts.FAIL > 0 ? 'FAIL' : issueCounts.WARN > 0 ? 'WARN' : 'PASS';

  return {
    valid: issueCounts.FAIL === 0,
    status,
    issues,
    summary: {
      total: sources.length,
      active,
      inactive: sources.length - active,
      by_type: byType,
      issue_counts: issueCounts,
    },
  };
}

function loadSources(filePath = DEFAULT_REGISTRY_PATH) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

module.exports = {
  CRAWL_STRATEGIES,
  DEFAULT_REGISTRY_PATH,
  FREQUENCIES,
  PRIORITIES,
  REQUIRED_FIELDS,
  SOURCE_TYPES,
  isIsoDateOrNull,
  loadSources,
  normalizeUrl,
  validateDuplicates,
  validateRegistry,
  validateSource,
  validateUrl,
};
