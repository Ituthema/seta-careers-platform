#!/usr/bin/env node
'use strict';
// Prints the monthly manual-source checklist (Markdown) from data/sources.json.
//   npm run sources:checklist
const fs = require('fs');
const path = require('path');
const { buildChecklist } = require('./lib/manual-checklist');
const sources = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'data/sources.json'), 'utf8'));
process.stdout.write(buildChecklist(sources));
