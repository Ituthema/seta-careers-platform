#!/usr/bin/env node

const { auditRegistry, loadRegistry } = require('./source-audit');

const DEFAULT_TIMEOUT_MS = 5000;
const timeoutMs = Number.parseInt(process.env.SOURCE_HEALTH_TIMEOUT_MS || `${DEFAULT_TIMEOUT_MS}`, 10);
const limit = Number.parseInt(process.env.SOURCE_HEALTH_LIMIT || '0', 10);
const strict = process.env.SOURCE_HEALTH_STRICT === '1';

async function probeSource(source) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let response = await fetch(source.url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'seta-careers-platform-source-health/1.0',
      },
    });

    if (response.status === 405 || response.status === 403) {
      response = await fetch(source.url, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'User-Agent': 'seta-careers-platform-source-health/1.0',
        },
      });
    }

    return {
      source_id: source.source_id,
      name: source.name,
      ok: response.ok,
      status: response.status,
      final_url: response.url,
    };
  } catch (error) {
    return {
      source_id: source.source_id,
      name: source.name,
      ok: false,
      status: null,
      final_url: source.url,
      error: error.name === 'AbortError' ? `Timed out after ${timeoutMs}ms` : error.message,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  const sources = loadRegistry();
  const auditErrors = auditRegistry(sources);

  if (auditErrors.length > 0) {
    console.error('Source registry health check failed before probing because the audit did not pass:');
    auditErrors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  const activeSources = sources.filter((source) => source.active);
  const selectedSources = limit > 0 ? activeSources.slice(0, limit) : activeSources;

  console.log(`Checking ${selectedSources.length} active sources${limit > 0 ? ` (SOURCE_HEALTH_LIMIT=${limit})` : ''}...`);

  const results = [];
  for (const source of selectedSources) {
    const result = await probeSource(source);
    results.push(result);
    const marker = result.ok ? 'OK' : 'WARN';
    const status = result.status === null ? 'n/a' : result.status;
    console.log(`[${marker}] ${source.source_id} ${status} ${result.final_url}${result.error ? ` (${result.error})` : ''}`);
  }

  const failures = results.filter((result) => !result.ok);
  console.log(`\nHealth summary: ${results.length - failures.length}/${results.length} sources returned an HTTP 2xx response.`);

  if (failures.length > 0) {
    console.log(`Non-2xx or unreachable sources: ${failures.length}.`);
    if (strict) {
      process.exit(1);
    }
    console.log('Run with SOURCE_HEALTH_STRICT=1 to fail on unreachable or non-2xx sources.');
  }
}

main().catch((error) => {
  console.error(`Source health check failed: ${error.message}`);
  process.exit(1);
});
