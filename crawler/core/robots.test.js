// Run with: npm test   (node --test, no dependencies needed)
const test = require('node:test');
const assert = require('node:assert/strict');
const { createRobotsChecker, isAllowedByRules, parseRobots, selectRules } = require('./robots');

const allowed = (robotsTxt, path, agent) => isAllowedByRules(selectRules(parseRobots(robotsTxt), agent), path);

test('empty or missing rules allow everything', () => {
  assert.equal(allowed('', '/jobs'), true);
  assert.equal(allowed('User-agent: *\nDisallow:\n', '/jobs'), true);
});

test('Disallow blocks by prefix; longest match wins; Allow wins ties', () => {
  const txt = 'User-agent: *\nDisallow: /private\nAllow: /private/public\n';
  assert.equal(allowed(txt, '/private/secret'), false);
  assert.equal(allowed(txt, '/private/public/page'), true);
  assert.equal(allowed(txt, '/other'), true);
  assert.equal(allowed('User-agent: *\nDisallow: /a\nAllow: /a\n', '/a'), true);
});

test('wildcards and end anchors work', () => {
  const txt = 'User-agent: *\nDisallow: /*.pdf$\nDisallow: /search?*q=\n';
  assert.equal(allowed(txt, '/files/ad.pdf'), false);
  assert.equal(allowed(txt, '/files/ad.pdf?x=1'), true);
  assert.equal(allowed(txt, '/search?page=2&q=jobs'), false);
  assert.equal(allowed(txt, '/careers'), true);
});

test('a group naming our agent overrides the * group', () => {
  const txt = 'User-agent: *\nDisallow: /\n\nUser-agent: SETA-Careers-Platform-Crawler\nDisallow: /admin\n';
  assert.equal(allowed(txt, '/jobs'), true);
  assert.equal(allowed(txt, '/admin/x'), false);
});

test('a full-site block for * applies when we are not named', () => {
  assert.equal(allowed('User-agent: *\nDisallow: /\n', '/jobs'), false);
  assert.equal(allowed('User-agent: googlebot\nDisallow: /\n', '/jobs'), true);
});

test('consecutive User-agent lines share one group; comments and junk are ignored', () => {
  const txt = '# hello\nUser-agent: badbot\nUser-agent: seta-careers-platform-crawler # us\nDisallow: /x # why\nnonsense line\n';
  assert.equal(allowed(txt, '/x/y'), false);
  assert.equal(allowed(txt, '/y'), true);
});

test('checker: 200 rules, 404 open, 5xx and network failure are unreachable', async () => {
  const responses = {
    'https://rules.example': { status: 200, body: Buffer.from('User-agent: *\nDisallow: /jobs/private') },
    'https://missing.example': { status: 404, body: Buffer.from('') },
    'https://down.example': { status: 503, body: Buffer.from('') },
  };
  const checker = createRobotsChecker(async (origin) => {
    if (origin === 'https://net.example') throw new Error('ECONNRESET');
    return responses[origin];
  });
  assert.deepEqual(await checker.check('https://rules.example/jobs'), { allowed: true });
  const blocked = await checker.check('https://rules.example/jobs/private/1');
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.reason, 'ROBOTS_DISALLOWED');
  assert.deepEqual(await checker.check('https://missing.example/anything'), { allowed: true });
  const down = await checker.check('https://down.example/jobs');
  assert.equal(down.reason, 'ROBOTS_UNREACHABLE');
  assert.match(down.detail, /HTTP 503/);
  const net = await checker.check('https://net.example/jobs');
  assert.equal(net.reason, 'ROBOTS_UNREACHABLE');
});

test('checker fetches robots.txt once per origin even for concurrent checks', async () => {
  let calls = 0;
  const checker = createRobotsChecker(async () => { calls += 1; return { status: 200, body: Buffer.from('User-agent: *\nDisallow: /x') }; });
  const results = await Promise.all([
    checker.check('https://a.example/one'),
    checker.check('https://a.example/two'),
    checker.check('https://a.example/x'),
    checker.check('https://b.example/one'),
  ]);
  assert.equal(calls, 2);
  assert.deepEqual(results.map((r) => r.allowed), [true, true, false, true]);
});

test('checker: 429 and 408 on robots.txt are unreachable, not "no robots.txt"', async () => {
  for (const status of [429, 408, 425]) {
    const checker = createRobotsChecker(async () => ({ status, body: Buffer.from('') }));
    const verdict = await checker.check('https://example.org/jobs');
    assert.equal(verdict.allowed, false, `HTTP ${status}`);
    assert.equal(verdict.reason, 'ROBOTS_UNREACHABLE');
  }
  const missing = createRobotsChecker(async () => ({ status: 404, body: null }));
  assert.equal((await missing.check('https://example.org/jobs')).allowed, true);
});
