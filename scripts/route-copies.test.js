'use strict';
// The category-to-path mapping exists in three places (route-paths.js, index.html, 404.html).
// This keeps the two browser copies in step with the canonical one so a /jobs/<slug> deep link
// cannot 404 into the home page again.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { CAT_PATH_MAP } = require('../route-paths');

const root = path.join(__dirname, '..');
const toPairs = (src) => [...src.matchAll(/(?:'([a-z-]+)'|([a-z]+))\s*:\s*'([a-z-]+)'/g)].map((m) => [m[1] || m[2], m[3]]);

test('404.html catMap covers every category in route-paths.js', () => {
  const html = fs.readFileSync(path.join(root, '404.html'), 'utf8');
  const block = html.match(/const catMap = \{([^}]*)\}/);
  assert.ok(block, 'catMap not found in 404.html');
  const map = Object.fromEntries(toPairs(block[1]));
  for (const [category, pathSegment] of Object.entries(CAT_PATH_MAP)) {
    assert.equal(map[pathSegment], category, `404.html catMap is missing ${pathSegment} -> ${category}`);
  }
});

test('index.html catPathMap matches route-paths.js', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const block = html.match(/const catPathMap=\{([^}]*)\}/);
  assert.ok(block, 'catPathMap not found in index.html');
  assert.deepEqual(Object.fromEntries(toPairs(block[1])), CAT_PATH_MAP);
});
