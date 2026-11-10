'use strict';

// Builds the monthly "check these by hand" list from the registry's access=manual sources.
// Pure function: no file or network access.

function monthLabel(now) {
  return new Intl.DateTimeFormat('en-ZA', { month: 'long', year: 'numeric', timeZone: 'Africa/Johannesburg' }).format(now);
}

// Lower priority number = more important. Within a priority, sources never checked come first.
function manualSources(sources) {
  return (Array.isArray(sources) ? sources : [])
    .filter((s) => s && s.active !== false && s.access === 'manual')
    .sort((a, b) => (a.priority - b.priority) || String(a.last_checked || '').localeCompare(String(b.last_checked || '')) || a.source_id.localeCompare(b.source_id));
}

function buildChecklist(sources, now = new Date()) {
  const list = manualSources(sources);
  const lines = [
    `Month: **${monthLabel(now)}**. These ${list.length} sources cannot be crawled (blocked, JavaScript-only, or robots.txt unreachable), so nobody finds their opportunities unless you look.`,
    '',
    '**How to check:** open the page in a browser. If it lists a learnership, bursary, internship or apprenticeship that is open and has a closing date, add it (`npm run add:listing -- draft.json --write`). Anything unknown stays unknown with a comment. Tick the box when done, even if there was nothing open.',
    '',
    '**If a page works for automated requests again,** remove `access`, `manual_reason` and `manual_since` from its entry in `data/sources.json` so the crawler takes it back.',
  ];
  for (const priority of [...new Set(list.map((s) => s.priority))].sort((a, b) => a - b)) {
    lines.push('', `### Priority ${priority}`, '');
    for (const s of list.filter((x) => x.priority === priority)) {
      const reason = String(s.manual_reason || '').replace(/\s*\([^()]*crawl\)\s*\.?$/, '').replace(/\.$/, '');
      lines.push(`- [ ] **${s.name || s.source_id}** (\`${s.source_id}\`, ${s.type}) — ${s.url}  \n  _Why manual:_ ${reason}`);
    }
  }
  return lines.join('\n') + '\n';
}

module.exports = { buildChecklist, manualSources, monthLabel };
