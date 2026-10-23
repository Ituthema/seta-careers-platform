const crypto = require('crypto');

// Different registry entries often end at the same page (two sources that
// redirect to one careers site, or a homepage plus a listing that serves the
// same content). Staging both would create duplicate opportunities downstream,
// so the first source to reach a page wins and later ones are rejected as
// duplicates with a pointer to the winner.

function urlKey(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    parsed.hash = '';
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const pathname = parsed.pathname.replace(/\/+$/, '') || '/';
    return `${parsed.protocol}//${host}${parsed.port ? `:${parsed.port}` : ''}${pathname}${parsed.search}`;
  } catch {
    return String(rawUrl);
  }
}

function contentHash(text) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim().toLowerCase();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

function createDedupe() {
  const byUrl = new Map();
  const byContent = new Map();

  return {
    // check() records the record when it is new, so it must be called once per
    // record and synchronously (no await between check and staging) to be safe
    // under the crawler's concurrency.
    check({ source_id: sourceId, url, text }) {
      const keyUrl = urlKey(url);
      if (byUrl.has(keyUrl)) {
        return { reason: 'DUPLICATE_URL', duplicate_of: byUrl.get(keyUrl) };
      }
      const hash = text && String(text).trim() ? contentHash(text) : null;
      if (hash && byContent.has(hash)) {
        return { reason: 'DUPLICATE_CONTENT', duplicate_of: byContent.get(hash) };
      }
      byUrl.set(keyUrl, sourceId);
      if (hash) byContent.set(hash, sourceId);
      return null;
    },
  };
}

module.exports = { contentHash, createDedupe, urlKey };
