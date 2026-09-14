#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const expectedDomain = 'setacareersportal.abrdns.com';
const cnamePath = path.join(__dirname, '..', 'CNAME');

if (!fs.existsSync(cnamePath)) {
  console.error('GitHub Pages configuration error: the root CNAME file is missing.');
  process.exit(1);
}

const actualDomain = fs.readFileSync(cnamePath, 'utf8').replace(/\r?\n$/, '');

if (actualDomain !== expectedDomain) {
  console.error(
    `GitHub Pages configuration error: CNAME must contain exactly ${expectedDomain}.`,
  );
  process.exit(1);
}

console.log(`GitHub Pages CNAME verified: ${expectedDomain}`);
