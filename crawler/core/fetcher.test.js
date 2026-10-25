// Run with: npm test   (node --test, no dependencies needed)
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { computeDelay, fetchSource, parseRetryAfter, isRetryableStatus } = require('./fetcher');
const { assertSafeUrl, isPrivateAddress } = require('./url-guard');

const config = { timeout: 2000, retries: 3, maxRedirects: 5, maxBodyBytes: 1024 * 1024 };
const source = { source_id: 'test', url: 'https://example.org/jobs' };
const ok = (extra = {}) => ({ status: 200, contentType: 'text/html', body: Buffer.from('ok'), url: source.url, ...extra });

function scripted(responses) {
  const calls = [];
  const waits = [];
  const fetchOnce = async () => {
    const next = responses[Math.min(calls.length, responses.length - 1)];
    calls.push(next);
    if (next instanceof Error) throw next;
    return next;
  };
  return { calls, waits, deps: { fetchOnce, sleep: async (ms) => { waits.push(ms); }, random: () => 0.5 } };
}

test('403, 404 and 410 are not retried (they will not change)', async () => {
  for (const status of [403, 404, 410, 501]) {
    const { calls, deps } = scripted([ok({ status })]);
    const result = await fetchSource(source, config, () => {}, {}, deps);
    assert.equal(result.ok, false);
    assert.equal(result.status, status);
    assert.equal(calls.length, 1, `HTTP ${status} should stop after one attempt`);
  }
});

test('429 and 5xx are retried until they succeed', async () => {
  const { calls, waits, deps } = scripted([ok({ status: 503 }), ok({ status: 429 }), ok()]);
  const result = await fetchSource(source, config, () => {}, {}, deps);
  assert.equal(result.ok, true);
  assert.equal(result.attempts, 3);
  assert.equal(calls.length, 3);
  assert.equal(waits.length, 2);
});

test('retries stop at config.retries and report the last status and attempts', async () => {
  const { calls, deps } = scripted([ok({ status: 500 })]);
  const result = await fetchSource(source, config, () => {}, {}, deps);
  assert.equal(result.ok, false);
  assert.equal(result.status, 500);
  assert.equal(result.attempts, 3);
  assert.equal(calls.length, 3);
});

test('network errors are retried, blocked URLs are not', async () => {
  const reset = Object.assign(new Error('socket hang up'), { code: 'ECONNRESET' });
  const first = scripted([reset, ok()]);
  assert.equal((await fetchSource(source, config, () => {}, {}, first.deps)).ok, true);
  assert.equal(first.calls.length, 2);

  const blocked = Object.assign(new Error('Blocked private address 10.0.0.1 for host x'), { code: 'ESSRF' });
  const second = scripted([blocked]);
  const result = await fetchSource(source, config, () => {}, {}, second.deps);
  assert.equal(result.ok, false);
  assert.equal(second.calls.length, 1);
  assert.match(result.error, /Blocked private address/);
});

test('Retry-After is honoured but capped', () => {
  assert.equal(parseRetryAfter('3'), 3000);
  assert.equal(parseRetryAfter('Wed, 21 Oct 2026 07:28:00 GMT', Date.parse('Wed, 21 Oct 2026 07:27:50 GMT')), 10000);
  assert.equal(parseRetryAfter('garbage'), null);
  assert.equal(computeDelay(1, { retryAfter: '3' }), 3000);
  assert.equal(computeDelay(1, { retryAfter: '9999' }), 10000);
});

test('backoff grows exponentially with jitter and a ceiling', () => {
  const opts = { random: () => 0.5 }; // jitter factor 1.0
  assert.equal(computeDelay(1, opts), 500);
  assert.equal(computeDelay(2, opts), 1000);
  assert.equal(computeDelay(3, opts), 2000);
  assert.equal(computeDelay(10, opts), 8000);
  assert.equal(computeDelay(1, { random: () => 0 }), 375);
  assert.equal(computeDelay(1, { random: () => 1 }), 625);
});

test('only transient statuses are retryable', () => {
  for (const status of [408, 425, 429, 500, 502, 503, 504]) assert.equal(isRetryableStatus(status), true);
  for (const status of [301, 400, 401, 403, 404, 410, 501]) assert.equal(isRetryableStatus(status), false);
});

test('assertSafeUrl rejects bad schemes, credentials and private literals', () => {
  assert.throws(() => assertSafeUrl('file:///etc/passwd'), /scheme/);
  assert.throws(() => assertSafeUrl('ftp://example.org/'), /scheme/);
  assert.throws(() => assertSafeUrl('https://user:pw@example.org/'), /credentials/);
  assert.throws(() => assertSafeUrl('http://169.254.169.254/latest/meta-data'), /private address/);
  assert.throws(() => assertSafeUrl('http://127.0.0.1:8080/'), /private address/);
  assert.throws(() => assertSafeUrl('http://[::1]/'), /private address/);
  assert.throws(() => assertSafeUrl('not a url'), /not parseable/);
  assert.equal(assertSafeUrl('https://www.sita.co.za/internships').hostname, 'www.sita.co.za');
});

test('isPrivateAddress covers the ranges that matter', () => {
  for (const address of ['10.1.2.3', '172.16.0.1', '172.31.255.255', '192.168.1.1', '127.0.0.1', '169.254.169.254', '100.64.0.1', '0.0.0.0', '::1', 'fd00::1', 'fe80::1', '::ffff:10.0.0.1', '::ffff:7f00:1']) {
    assert.equal(isPrivateAddress(address), true, address);
  }
  for (const address of ['8.8.8.8', '41.0.0.1', '172.32.0.1', '172.15.255.255', '2606:4700:4700::1111', '::ffff:8.8.8.8']) {
    assert.equal(isPrivateAddress(address), false, address);
  }
});

const HAS_AXIOS = (() => { try { require.resolve('axios'); return true; } catch { return false; } })();

test('the real fetcher refuses a loopback server unless private networks are allowed', { skip: HAS_AXIOS ? false : 'axios is not installed' }, async () => {
  const server = http.createServer((req, res) => { res.setHeader('Content-Type', 'text/html'); res.end('<html>hi</html>'); });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}/`;
  const local = { source_id: 'local', url };
  const previous = process.env.CRAWLER_ALLOW_PRIVATE_NETWORK;
  try {
    delete process.env.CRAWLER_ALLOW_PRIVATE_NETWORK;
    const blocked = await fetchSource(local, { ...config, retries: 1 });
    assert.equal(blocked.ok, false);
    assert.match(blocked.error, /Blocked private address/);

    // A hostname that resolves to loopback must be stopped by the DNS-level guard.
    const viaName = await fetchSource({ source_id: 'local', url: `http://localhost:${server.address().port}/` }, { ...config, retries: 1 });
    assert.equal(viaName.ok, false);
    assert.match(viaName.error, /Blocked private address/);

    process.env.CRAWLER_ALLOW_PRIVATE_NETWORK = 'true';
    const allowed = await fetchSource(local, { ...config, retries: 1 });
    assert.equal(allowed.ok, true);
    assert.equal(allowed.body.toString(), '<html>hi</html>');
  } finally {
    if (previous === undefined) delete process.env.CRAWLER_ALLOW_PRIVATE_NETWORK;
    else process.env.CRAWLER_ALLOW_PRIVATE_NETWORK = previous;
    await new Promise((resolve) => server.close(resolve));
  }
});

test('guardedLookup blocks a hostname that resolves to loopback, and the opt-out allows it (plain http, no axios)', async () => {
  const { guardedLookup } = require('./url-guard');
  const server = http.createServer((req, res) => res.end('hi'));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const agent = new http.Agent({ lookup: guardedLookup });
  const get = () => new Promise((resolve) => {
    const request = http.get({ host: 'localhost', port: server.address().port, agent }, (response) => {
      response.resume();
      response.on('end', () => resolve({ status: response.statusCode }));
    });
    request.on('error', (error) => resolve({ error }));
  });
  const previous = process.env.CRAWLER_ALLOW_PRIVATE_NETWORK;
  try {
    delete process.env.CRAWLER_ALLOW_PRIVATE_NETWORK;
    const blocked = await get();
    assert.equal(blocked.error && blocked.error.code, 'ESSRF');

    process.env.CRAWLER_ALLOW_PRIVATE_NETWORK = 'true';
    assert.equal((await get()).status, 200);
  } finally {
    if (previous === undefined) delete process.env.CRAWLER_ALLOW_PRIVATE_NETWORK;
    else process.env.CRAWLER_ALLOW_PRIVATE_NETWORK = previous;
    agent.destroy();
    await new Promise((resolve) => server.close(resolve));
  }
});

// --- robots.txt integration -------------------------------------------------

const { createRobotsChecker } = require('./robots');
const checkerFor = (body, status = 200) => createRobotsChecker(async () => ({ status, body: Buffer.from(body) }));

test('a robots-disallowed source is never requested and reports ROBOTS_DISALLOWED', async () => {
  const { calls, deps } = scripted([ok()]);
  const robots = checkerFor('User-agent: *\nDisallow: /jobs');
  const result = await fetchSource(source, config, () => {}, {}, { ...deps, robots });
  assert.equal(result.ok, false);
  assert.equal(result.rejectReason, 'ROBOTS_DISALLOWED');
  assert.equal(result.attempts, 0);
  assert.equal(calls.length, 0, 'the page must not be fetched');
});

test('an allowed source is fetched normally', async () => {
  const { calls, deps } = scripted([ok()]);
  const robots = checkerFor('User-agent: *\nDisallow: /private');
  const result = await fetchSource(source, config, () => {}, {}, { ...deps, robots });
  assert.equal(result.ok, true);
  assert.equal(calls.length, 1);
});

test('an unreachable robots.txt blocks the source as ROBOTS_UNREACHABLE', async () => {
  const { calls, deps } = scripted([ok()]);
  const robots = checkerFor('', 503);
  const result = await fetchSource(source, config, () => {}, {}, { ...deps, robots });
  assert.equal(result.ok, false);
  assert.equal(result.rejectReason, 'ROBOTS_UNREACHABLE');
  assert.equal(calls.length, 0);
});

test('a redirect onto a robots-disallowed path is rejected after the fetch', async () => {
  const { calls, deps } = scripted([ok({ url: 'https://example.org/private/portal' })]);
  const robots = checkerFor('User-agent: *\nDisallow: /private');
  const result = await fetchSource(source, config, () => {}, {}, { ...deps, robots });
  assert.equal(result.ok, false);
  assert.equal(result.rejectReason, 'ROBOTS_DISALLOWED');
  assert.equal(calls.length, 1);
  assert.equal(result.url, 'https://example.org/private/portal');
});
