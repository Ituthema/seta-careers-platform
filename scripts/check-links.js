#!/usr/bin/env node
/**
 * Checks canonical opportunity source and application URLs.
 *
 * The checker fails on hard-broken HTTP responses such as 404/410 while
 * treating bot-blocking or transient network failures as warnings by default.
 * Set LINK_CHECK_STRICT=true to fail on warnings in scheduled maintenance runs.
 *
 * The run also fails if ZERO links could be verified (every request failed
 * before any site responded), since that proves nothing about link health.
 * Set LINK_CHECK_ALLOW_UNVERIFIED=true to bypass in no-network sandboxes.
 */

const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'data', 'opportunities.json');
const TIMEOUT_MS = Number(process.env.LINK_CHECK_TIMEOUT_MS || 8000);
const RETRIES = Number(process.env.LINK_CHECK_RETRIES || 2);
const CONCURRENCY = Number(process.env.LINK_CHECK_CONCURRENCY || 4);
const STRICT = process.env.LINK_CHECK_STRICT === 'true';
const HARD_BROKEN_STATUSES = new Set([404, 410, 451]);
const WARNING_STATUSES = new Set([401, 403, 429]);

const opportunities = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
const urlMap = new Map();

for (const opportunity of opportunities) {
  for (const field of ['application_url', 'source_url']) {
    const value = opportunity[field];
    if (!urlMap.has(value)) urlMap.set(value, []);
    urlMap.get(value).push(`${opportunity.id}:${field}`);
  }
}

function classifyStatus(status) {
  if (status >= 200 && status < 400) return { level: 'pass', message: `HTTP ${status}` };
  if (HARD_BROKEN_STATUSES.has(status)) return { level: 'error', message: `HTTP ${status}` };
  if (WARNING_STATUSES.has(status)) return { level: 'warning', message: `HTTP ${status} (reachable but restricted or rate-limited)` };
  if (status >= 500) return { level: 'warning', message: `HTTP ${status} (server-side response)` };
  return { level: 'error', message: `HTTP ${status}` };
}

function mergeLevels(left, right) {
  const rank = { pass: 0, warning: 1, error: 2 };
  return rank[right] > rank[left] ? right : left;
}

function request(url, method) {
  const timeoutSeconds = Math.ceil(TIMEOUT_MS / 1000);
  const args = [
    '--location',
    '--silent',
    '--show-error',
    '--max-time', String(timeoutSeconds),
    '--output', '/dev/null',
    '--write-out', '%{http_code}',
    '--user-agent', 'OpportunitiesZA-LinkChecker/1.0 (+https://setacareersportal.abrdns.com)',
  ];

  if (method === 'HEAD') args.push('--head');
  args.push(url);

  return new Promise((resolve, reject) => {
    execFile('curl', args, { timeout: TIMEOUT_MS + 1000 }, (error, stdout, stderr) => {
      const status = Number(String(stdout).trim().slice(-3));
      if (status) {
        resolve({ status });
        return;
      }

      if (error) {
        reject(new Error((stderr || error.message).trim()));
        return;
      }

      reject(new Error('curl did not return an HTTP status code'));
    });
  });
}

async function checkUrl(url, refs) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch (error) {
    return { url, refs, level: 'error', message: `Invalid URL: ${error.message}` };
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return { url, refs, level: 'error', message: `Unsupported protocol: ${parsed.protocol}` };
  }

  let lastError;
  for (let attempt = 1; attempt <= RETRIES + 1; attempt += 1) {
    try {
      let response = await request(url, 'HEAD');
      if ([405, 501].includes(response.status)) response = await request(url, 'GET');
      const statusResult = classifyStatus(response.status);
      // The target host answered, so the link was genuinely checked
      // (even when the answer was a 401/403/429 or a 5xx warning).
      return { url, refs, verified: true, ...statusResult };
    } catch (error) {
      lastError = error;
      if (attempt <= RETRIES) {
        await new Promise(resolve => setTimeout(resolve, 350 * attempt));
      }
    }
  }

  // No HTTP response from the target at all (DNS failure, timeout, proxy or
  // CONNECT tunnel refusal, TLS error). This says nothing about the link, so it
  // is reported as UNVERIFIED rather than as a site failure.
  return {
    url,
    refs,
    verified: false,
    level: STRICT ? 'error' : 'warning',
    message: `UNVERIFIED — no response from the site (network/environment issue) after ${RETRIES + 1} attempt(s): ${lastError.message}`,
  };
}

async function runQueue(items) {
  const results = [];
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      const [url, refs] = items[index];
      results[index] = await checkUrl(url, refs);
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, worker));
  return results;
}

async function main() {
  const results = await runQueue([...urlMap.entries()]);
  let overall = 'pass';

  for (const result of results) {
    overall = mergeLevels(overall, result.level);
    const icon = result.level === 'pass' ? '✅' : result.level === 'warning' ? '⚠️' : '❌';
    console.log(`${icon} ${result.url} — ${result.message} (${result.refs.join(', ')})`);
  }

  const warnings = results.filter(result => result.level === 'warning').length;
  const errors = results.filter(result => result.level === 'error').length;
  const verified = results.filter(result => result.verified).length;
  const unverified = results.length - verified;
  console.log(`\nChecked ${results.length} unique opportunity URL(s): ${errors} error(s), ${warnings} warning(s).`);
  console.log(`Verified (site responded): ${verified}. Unverified (no response / network issue): ${unverified}.`);

  if (errors > 0 || (STRICT && warnings > 0)) process.exit(1);

  // An all-unverified run proves nothing, so it must not pass silently.
  // Set LINK_CHECK_ALLOW_UNVERIFIED=true for sandboxes with no outbound access.
  if (results.length > 0 && verified === 0) {
    if (process.env.LINK_CHECK_ALLOW_UNVERIFIED === 'true') {
      console.warn('⚠️  No links could be verified; allowed by LINK_CHECK_ALLOW_UNVERIFIED=true.');
    } else {
      console.error('❌ No links could be verified (every request failed before reaching a site). Run from an environment with outbound HTTPS access, or set LINK_CHECK_ALLOW_UNVERIFIED=true to bypass.');
      process.exit(1);
    }
  }
}

main();
