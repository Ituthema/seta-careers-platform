#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const tls = require('tls');
const { URL } = require('url');
const { DEFAULT_REGISTRY_PATH, loadSources, validateRegistry } = require('./validators/source-validator');

const REPORTS_DIR = path.resolve(__dirname, '..', 'reports');
const REPORT_PATH = path.join(REPORTS_DIR, 'source-health-report.json');
const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_CONCURRENCY = 8;
const MAX_REDIRECTS = 5;

function getConfig() {
  return {
    timeoutMs: Number.parseInt(process.env.SOURCE_HEALTH_TIMEOUT_MS || `${DEFAULT_TIMEOUT_MS}`, 10),
    limit: Number.parseInt(process.env.SOURCE_HEALTH_LIMIT || '0', 10),
    strict: process.env.SOURCE_HEALTH_STRICT === '1',
    concurrency: Number.parseInt(process.env.SOURCE_HEALTH_CONCURRENCY || `${DEFAULT_CONCURRENCY}`, 10),
  };
}

function ensureReportsDir() {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

function writeReport(report, reportPath = REPORT_PATH) {
  ensureReportsDir();
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
}

function checkSslAvailability(sourceUrl, timeoutMs) {
  return new Promise((resolve) => {
    let settled = false;
    let socket;

    function finish(value) {
      if (settled) return;
      settled = true;
      if (socket && !socket.destroyed) {
        socket.destroy();
      }
      resolve(value);
    }
    let parsedUrl;

    try {
      parsedUrl = new URL(sourceUrl);
    } catch {
      finish(false);
      return;
    }

    if (parsedUrl.protocol !== 'https:') {
      finish(false);
      return;
    }

    socket = tls.connect({
      host: parsedUrl.hostname,
      port: parsedUrl.port ? Number.parseInt(parsedUrl.port, 10) : 443,
      servername: parsedUrl.hostname,
      timeout: timeoutMs,
    });

    socket.once('secureConnect', () => {
      const authorized = socket.authorized || socket.authorizationError === null;
      finish(Boolean(authorized));
    });

    socket.once('timeout', () => {
      finish(false);
    });

    socket.once('error', () => {
      finish(false);
    });
  });
}

function resolveRedirectUrl(currentUrl, location) {
  return new URL(location, currentUrl).toString();
}

async function fetchWithRedirects(sourceUrl, timeoutMs, method = 'HEAD') {
  let currentUrl = sourceUrl;
  const chain = [];

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(currentUrl, {
        method,
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'User-Agent': 'seta-careers-platform-source-health/1.0',
          Accept: '*/*',
        },
      });

      const location = response.headers.get('location');
      if ([301, 302, 303, 307, 308].includes(response.status) && location) {
        const nextUrl = resolveRedirectUrl(currentUrl, location);
        chain.push({ status: response.status, from: currentUrl, to: nextUrl });
        currentUrl = nextUrl;
        continue;
      }

      return { response, finalUrl: currentUrl, redirectChain: chain };
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error(`Exceeded ${MAX_REDIRECTS} redirects.`);
}

async function probeSource(source, config = getConfig()) {
  const startedAt = Date.now();
  const sslAvailablePromise = checkSslAvailability(source.url, config.timeoutMs);

  try {
    let result = await fetchWithRedirects(source.url, config.timeoutMs, 'HEAD');

    if ([403, 405].includes(result.response.status)) {
      result = await fetchWithRedirects(source.url, config.timeoutMs, 'GET');
    }

    const responseTime = Date.now() - startedAt;
    const sslAvailable = await sslAvailablePromise;
    const healthy = result.response.status >= 200 && result.response.status < 400;

    return {
      source_id: source.source_id,
      name: source.name,
      url: source.url,
      final_url: result.finalUrl,
      status: result.response.status,
      response_time: responseTime,
      redirects: result.redirectChain.length,
      redirect_chain: result.redirectChain,
      ssl_available: sslAvailable,
      healthy,
      checked_at: new Date().toISOString(),
    };
  } catch (error) {
    const responseTime = Date.now() - startedAt;
    const sslAvailable = await sslAvailablePromise;

    return {
      source_id: source.source_id,
      name: source.name,
      url: source.url,
      final_url: source.url,
      status: null,
      response_time: responseTime,
      redirects: 0,
      redirect_chain: [],
      ssl_available: sslAvailable,
      healthy: false,
      error: error.name === 'AbortError' ? `Timed out after ${config.timeoutMs}ms` : error.message,
      checked_at: new Date().toISOString(),
    };
  }
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }

  const workerCount = Math.min(Math.max(concurrency, 1), items.length || 1);
  await Promise.all(Array.from({ length: workerCount }, worker));
  return results;
}

function buildReport(results, config) {
  const healthyCount = results.filter((result) => result.healthy).length;
  const unhealthyCount = results.length - healthyCount;
  const warnCount = results.filter((result) => result.ssl_available === false || result.redirects > 0).length;

  return {
    generated_at: new Date().toISOString(),
    status: unhealthyCount > 0 ? 'FAIL' : warnCount > 0 ? 'WARN' : 'PASS',
    summary: {
      checked: results.length,
      healthy: healthyCount,
      unhealthy: unhealthyCount,
      with_redirects: results.filter((result) => result.redirects > 0).length,
      ssl_available: results.filter((result) => result.ssl_available).length,
      timeout_ms: config.timeoutMs,
    },
    sources: results,
  };
}

function printHealth(report) {
  console.log(`Source health: ${report.status}`);
  console.log(`Checked: ${report.summary.checked}; healthy: ${report.summary.healthy}; unhealthy: ${report.summary.unhealthy}; redirects: ${report.summary.with_redirects}; SSL available: ${report.summary.ssl_available}.`);

  for (const result of report.sources) {
    const level = result.healthy ? (result.redirects > 0 || !result.ssl_available ? 'WARN' : 'PASS') : 'FAIL';
    const status = result.status === null ? 'n/a' : result.status;
    const error = result.error ? ` (${result.error})` : '';
    console.log(`[${level}] ${result.source_id}: status=${status}, response_time=${result.response_time}ms, redirects=${result.redirects}, ssl=${result.ssl_available}${error}`);
  }

  console.log(`\nReport written to ${path.relative(process.cwd(), REPORT_PATH)}`);
}

async function runHealthCheck(options = {}) {
  const config = { ...getConfig(), ...options };
  const sources = loadSources(options.registryPath || DEFAULT_REGISTRY_PATH);
  const validation = validateRegistry(sources, { minimumSources: 1 });

  if (!validation.valid) {
    const report = {
      generated_at: new Date().toISOString(),
      status: 'FAIL',
      summary: { checked: 0, healthy: 0, unhealthy: 0, with_redirects: 0, ssl_available: 0, timeout_ms: config.timeoutMs },
      validation_issues: validation.issues,
      sources: [],
    };
    writeReport(report, options.reportPath || REPORT_PATH);
    return report;
  }

  const activeSources = sources.filter((source) => source.active);
  const selectedSources = config.limit > 0 ? activeSources.slice(0, config.limit) : activeSources;
  const results = await mapWithConcurrency(selectedSources, config.concurrency, (source) => probeSource(source, config));
  const report = buildReport(results, config);
  writeReport(report, options.reportPath || REPORT_PATH);
  return report;
}

async function main() {
  const config = getConfig();
  const report = await runHealthCheck(config);
  printHealth(report);

  if (report.status === 'FAIL' || (config.strict && report.summary.unhealthy > 0)) {
    process.exit(1);
  }

  process.exit(0);
}

if (require.main === module) {
  main().catch((error) => {
    const report = {
      generated_at: new Date().toISOString(),
      status: 'FAIL',
      summary: { checked: 0, healthy: 0, unhealthy: 0, with_redirects: 0, ssl_available: 0, timeout_ms: getConfig().timeoutMs },
      error: error.message,
      sources: [],
    };
    writeReport(report);
    printHealth(report);
    process.exit(1);
  });
}

module.exports = {
  REPORT_PATH,
  REPORTS_DIR,
  buildReport,
  checkSslAvailability,
  probeSource,
  runHealthCheck,
};
