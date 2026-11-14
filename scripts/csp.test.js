'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { APP_POLICY, STATIC_POLICY } = require('./lib/csp');

const root = path.join(__dirname, '..');
const policyOf = (html) => (html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]*)"/) || [])[1];
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

test('index.html and 404.html carry exactly the app policy', () => {
  assert.equal(policyOf(read('index.html')), APP_POLICY);
  assert.equal(policyOf(read('404.html')), APP_POLICY);
});

test('every generated static page carries the static policy and no script besides JSON-LD', () => {
  const dirs = ['learnerships', 'internships', 'bursaries', 'apprenticeships', 'tvet-pathways', 'guides', 'calendar', 'provinces', 'tools', 'about'];
  let checked = 0;
  const walk = (dir) => {
    for (const e of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
      const rel = path.join(dir, e.name);
      if (e.isDirectory()) walk(rel);
      else if (e.name === 'index.html') {
        const html = read(rel);
        assert.equal(policyOf(html), STATIC_POLICY, `${rel} policy`);
        const scripts = [...html.matchAll(/<script\b([^>]*)>/g)].map((m) => m[1]);
        assert.ok(scripts.every((a) => /application\/ld\+json/.test(a)), `${rel} has an executable script`);
        checked += 1;
      }
    }
  };
  for (const d of dirs) if (fs.existsSync(path.join(root, d))) walk(d);
  assert.ok(checked > 0);
});

test('the policies never allow eval, wildcards or remote scripts', () => {
  for (const p of [APP_POLICY, STATIC_POLICY]) {
    assert.doesNotMatch(p, /unsafe-eval|\*|script-src[^;]*https?:/);
    assert.match(p, /base-uri/);
  }
  assert.match(APP_POLICY, /object-src 'none'/);
  assert.match(APP_POLICY, /connect-src 'self'/);
});

test('index.html loads no external script and its only external origins are the allowed font hosts', () => {
  const html = read('index.html');
  assert.doesNotMatch(html, /<script[^>]+src=/);
  const origins = new Set([...html.matchAll(/(?:src|href)="(https?:\/\/[^"/]+)/g)].map((m) => m[1]));
  for (const o of origins) {
    assert.ok(['https://fonts.googleapis.com', 'https://fonts.gstatic.com', 'https://wa.me', 'https://setacareersportal.abrdns.com'].includes(o), `unexpected origin ${o}`);
  }
});
