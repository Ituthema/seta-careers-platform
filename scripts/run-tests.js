// Runs every *.test.js under crawler/ and scripts/ with the built-in test runner.
// Dependency-free and cross-platform: no shell globs, so it behaves the same on
// Windows, macOS, Linux and in CI, and a new test file is picked up automatically.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

function findTests(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === 'node_modules' ? [] : findTests(full);
    return entry.name.endsWith('.test.js') ? [full] : [];
  });
}

const files = ['crawler', 'scripts'].flatMap((dir) => findTests(path.join(ROOT, dir))).sort();
if (files.length === 0) {
  console.error('No test files found under crawler/ or scripts/.');
  process.exit(1);
}

const result = spawnSync(process.execPath, ['--test', ...files], { stdio: 'inherit', cwd: ROOT });
process.exit(result.status === null ? 1 : result.status);
