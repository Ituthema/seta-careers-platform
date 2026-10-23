const fs = require('fs');
const path = require('path');

// Write to a temp file in the same directory, then rename over the target.
// rename() is atomic on the same filesystem, so a crash, kill or full disk
// leaves either the old complete file or the new complete file, never a
// truncated JSON document that the next run (or a reader) chokes on.
function writeFileAtomic(filePath, contents) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  const tmpPath = path.join(dir, `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`);
  try {
    fs.writeFileSync(tmpPath, contents, 'utf8');
    fs.renameSync(tmpPath, filePath);
  } catch (error) {
    try { fs.unlinkSync(tmpPath); } catch { /* temp file may not exist */ }
    throw error;
  }
}

function writeJsonAtomic(filePath, payload) {
  writeFileAtomic(filePath, `${JSON.stringify(payload, null, 2)}\n`);
}

module.exports = { writeFileAtomic, writeJsonAtomic };
