'use strict';

// Per-source crawl yield: which registry sources actually produce leads, and which are
// active but deliver nothing. Pure functions; the workflow summary renders the result.
//
//   staged : pages staged from the source (registry page + followed detail pages)
//   links  : opportunity-like links found on those pages
//   dated  : text mentions carrying a closing date that is not in the past
//
// "silent" = an active source that staged no page at all (blocked, down, or empty).
// "no dates" = staged pages but not one dated lead: a listing/info page, not a source of
// time-bound opportunities. Those are the sources to replace or to follow deeper.

function sourceYield(sources, staged, candidatePages) {
  const rows = new Map();
  const row = (id) => {
    if (!rows.has(id)) rows.set(id, { source_id: id, staged: 0, links: 0, mentions: 0, dated: 0 });
    return rows.get(id);
  };
  for (const r of Array.isArray(staged) ? staged : []) if (r && r.source_id) row(r.source_id).staged += 1;
  for (const p of Array.isArray(candidatePages) ? candidatePages : []) {
    if (!p || !p.source_id) continue;
    const t = row(p.source_id);
    t.links += (p.links || []).length;
    t.mentions += (p.mentions || []).length;
    t.dated += (p.mentions || []).filter((m) => m.status === 'open').length;
  }
  const names = new Map((Array.isArray(sources) ? sources : []).map((s) => [s.source_id, s]));
  const active = (Array.isArray(sources) ? sources : []).filter((s) => s.active !== false);
  const list = [...rows.values()].map((r) => ({ ...r, name: (names.get(r.source_id) || {}).name || r.source_id }));
  const silent = active.filter((s) => !rows.has(s.source_id) || rows.get(s.source_id).staged === 0).map((s) => s.source_id);
  const noDates = list.filter((r) => r.staged > 0 && r.dated === 0).map((r) => r.source_id);
  const producers = list.filter((r) => r.dated > 0).sort((a, b) => b.dated - a.dated || a.source_id.localeCompare(b.source_id));
  return { active: active.length, producers, silent, noDates };
}

function renderYield(y, limit = 10) {
  const lines = [
    '### Source yield',
    `- **Active sources:** ${y.active}; **with dated leads:** ${y.producers.length}; **staged pages but no dated lead:** ${y.noDates.length}; **silent (nothing staged):** ${y.silent.length}.`,
  ];
  if (y.producers.length) {
    lines.push('', '| Source | Pages | Links | Dated leads |', '|---|---:|---:|---:|');
    for (const r of y.producers.slice(0, limit)) lines.push(`| ${r.source_id} | ${r.staged} | ${r.links} | ${r.dated} |`);
  }
  if (y.silent.length) lines.push('', `Silent sources (candidates to fix or deactivate): ${y.silent.slice(0, 40).join(', ')}${y.silent.length > 40 ? ', …' : ''}`);
  return lines.join('\n');
}

module.exports = { sourceYield, renderYield };
