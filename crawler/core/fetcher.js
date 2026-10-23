const http = require('http');
const https = require('https');
const { assertSafeUrl, guardedLookup } = require('./url-guard');

// Statuses worth another attempt: the request may succeed later. Everything else
// (403, 404, 410, robots-style blocks, 501) will not change on retry, and
// retrying them just hammers sites that already said no.
const RETRYABLE_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);
// Error codes that will not get better by retrying.
const NON_RETRYABLE_ERROR_CODES = new Set(['ESSRF', 'ERR_BAD_REQUEST', 'ERR_BAD_RESPONSE', 'ERR_FR_TOO_MANY_REDIRECTS']);

const DEFAULTS = Object.freeze({
  retryBaseMs: 500,
  retryMaxMs: 8000,
  retryAfterMaxMs: 10000,
});

// Shared agents so every connection, including ones opened for redirects, goes
// through the SSRF-guarded DNS lookup.
const httpAgent = new http.Agent({ lookup: guardedLookup });
const httpsAgent = new https.Agent({ lookup: guardedLookup });

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status) {
  return RETRYABLE_STATUSES.has(status);
}

function isRetryableError(error) {
  if (!error) return false;
  if (error.code && NON_RETRYABLE_ERROR_CODES.has(error.code)) return false;
  if (/^Blocked /.test(error.message || '')) return false;
  return true; // timeouts, resets, DNS hiccups
}

// Retry-After is either seconds or an HTTP date. Returns milliseconds or null.
function parseRetryAfter(value, now = Date.now()) {
  if (value === undefined || value === null || value === '') return null;
  const text = String(value).trim();
  if (/^\d+$/.test(text)) return Number(text) * 1000;
  const date = Date.parse(text);
  if (Number.isNaN(date)) return null;
  return Math.max(0, date - now);
}

// Exponential backoff with +/-25% jitter, so parallel sources do not retry in lockstep.
function computeDelay(attempt, options = {}) {
  const baseMs = options.retryBaseMs ?? DEFAULTS.retryBaseMs;
  const maxMs = options.retryMaxMs ?? DEFAULTS.retryMaxMs;
  const afterMaxMs = options.retryAfterMaxMs ?? DEFAULTS.retryAfterMaxMs;
  const random = options.random || Math.random;

  const retryAfter = parseRetryAfter(options.retryAfter);
  if (retryAfter !== null) return Math.min(retryAfter, afterMaxMs);

  const exponential = Math.min(maxMs, baseMs * (2 ** (attempt - 1)));
  const jitter = 0.75 + (random() * 0.5);
  return Math.round(exponential * jitter);
}

async function fetchOnce(source, config) {
  assertSafeUrl(source.url);
  // Required lazily so the retry and guard logic stays unit-testable in CI, where `npm test` runs without installing dependencies.
  const axios = require('axios');

  const response = await axios.get(source.url, {
    timeout: config.timeout,
    maxRedirects: config.maxRedirects,
    maxContentLength: config.maxBodyBytes,
    maxBodyLength: config.maxBodyBytes,
    responseType: 'arraybuffer',
    validateStatus: () => true,
    httpAgent,
    httpsAgent,
    beforeRedirect: (options) => {
      assertSafeUrl(`${options.protocol}//${options.hostname}${options.path || ''}`);
    },
    headers: {
      'User-Agent': 'SETA-Careers-Platform-Crawler/1.0',
      Accept: 'text/html,application/pdf;q=0.9,*/*;q=0.8',
    },
  });

  return {
    status: response.status,
    contentType: response.headers['content-type'] || '',
    retryAfter: response.headers['retry-after'],
    body: Buffer.from(response.data),
    url: response.request && response.request.res && response.request.res.responseUrl ? response.request.res.responseUrl : source.url,
  };
}

// deps lets tests inject a fake fetchOnce and sleep; production callers omit it.
async function fetchSource(source, config, log = () => {}, events = {}, deps = {}) {
  const doFetch = deps.fetchOnce || fetchOnce;
  const wait = deps.sleep || sleep;
  const random = deps.random || Math.random;
  let lastError = null;
  let lastStatus = null;
  let attempts = 0;

  for (let attempt = 1; attempt <= config.retries; attempt += 1) {
    attempts = attempt;
    let retryAfter = null;
    let retryable = true;

    try {
      const response = await doFetch(source, config);

      if (response.status >= 200 && response.status < 300) {
        log(events.FETCH_SUCCESS || 'FETCH_SUCCESS', { source_id: source.source_id, url: response.url, status: response.status, attempt });
        return { ok: true, attempts, ...response };
      }

      lastStatus = response.status;
      lastError = new Error(`HTTP ${response.status}`);
      retryAfter = response.retryAfter;
      retryable = isRetryableStatus(response.status);
      log(events.FETCH_FAILURE || 'FETCH_FAILURE', { source_id: source.source_id, url: source.url, status: response.status, attempt, retryable, error: lastError.message });
    } catch (error) {
      lastError = error;
      retryable = isRetryableError(error);
      log(events.FETCH_FAILURE || 'FETCH_FAILURE', { source_id: source.source_id, url: source.url, attempt, retryable, error: error.message });
    }

    if (!retryable || attempt >= config.retries) break;
    await wait(computeDelay(attempt, { ...config, retryAfter, random }));
  }

  return {
    ok: false,
    status: lastStatus,
    contentType: '',
    body: null,
    url: source.url,
    attempts,
    error: lastError ? lastError.message : 'Unknown fetch failure',
  };
}

module.exports = {
  computeDelay,
  fetchSource,
  isRetryableError,
  isRetryableStatus,
  parseRetryAfter,
};
