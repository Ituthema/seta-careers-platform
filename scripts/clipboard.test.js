'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('clipboard writes go through copyText() only', () => {
  const calls = html.match(/navigator\.clipboard\.writeText\(/g) || [];
  assert.equal(calls.length, 1, 'only copyText() may call the async Clipboard API');
  const fn = html.slice(html.indexOf('function copyText('));
  assert.ok(fn.indexOf('navigator.clipboard.writeText(') < fn.indexOf('\n}\n'), 'call lives inside copyText');
});

test('copyText() handles rejection and missing Clipboard API with an execCommand fallback', () => {
  const fn = html.slice(html.indexOf('function copyText('), html.indexOf('function copyText(') + 1400);
  assert.match(fn, /execCommand\('copy'\)/);
  assert.match(fn, /navigator\.clipboard&&navigator\.clipboard\.writeText/);
  assert.match(fn, /Copy failed/);
});
