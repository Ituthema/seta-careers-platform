'use strict';

// Writes probe/crawl evidence into the registry's last_checked / last_success fields.
//
//   last_checked : the newest time anything tried this source (health probe or crawl).
//   last_success : the newest time it actually delivered: a health probe that returned a
//                  2xx/3xx response, or a crawl that staged a page from it.
//
// A restricted response (401/403) or a timeout counts as checked, never as success: many
// public SA sites block automated probes, so "reachable" is not claimed for them.
// Timestamps only ever move forward, so re-running with an older report changes nothing.

const isIso = (v) => typeof v === 'string' && !Number.isNaN(Date.parse(v));
const newer = (a, b) => (!isIso(a) ? (isIso(b) ? b : null) : (!isIso(b) ? a : (Date.parse(b) > Date.parse(a) ? b : a)));

// health: health-report `sources[]`; staged: crawler staging records; sources: registry array.
// Returns { sources: updatedCopy, changed: [source_id...] }.
function applyFreshness(sources, health, staged) {
  const checked = new Map();
  const success = new Map();
  const note = (map, id, ts) => { if (id && isIso(ts)) map.set(id, newer(map.get(id), ts)); };

  for (const h of Array.isArray(health) ? health : []) {
    note(checked, h.source_id, h.checked_at);
    const ok = h.health_state === 'healthy' || (h.health_state === undefined && h.healthy === true);
    if (ok) note(success, h.source_id, h.checked_at);
  }
  for (const r of Array.isArray(staged) ? staged : []) {
    // Followed pages carry the registry id of the source they were found on.
    note(checked, r.source_id, r.crawled_at);
    note(success, r.source_id, r.crawled_at);
  }

  const changed = [];
  const out = (Array.isArray(sources) ? sources : []).map((s) => {
    const lc = newer(s.last_checked, newer(checked.get(s.source_id), success.get(s.source_id)));
    const ls = newer(s.last_success, success.get(s.source_id));
    if (lc === (s.last_checked ?? null) && ls === (s.last_success ?? null)) return s;
    changed.push(s.source_id);
    return { ...s, last_checked: lc, last_success: ls };
  });
  return { sources: out, changed };
}

module.exports = { applyFreshness };
