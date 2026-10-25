// robots.txt support for the crawler (RFC 9309), dependency-free.
//
// The crawler identifies itself as SETA-Careers-Platform-Crawler and must honour
// what each site's robots.txt says about that agent. Source verification in
// docs/source-research already treats a robots block as a hard stop; this makes
// the crawler do the same instead of fetching pages a site has asked bots to skip.
//
// Rules (RFC 9309):
//   - the group naming our agent wins over the "*" group
//   - the longest matching path rule wins; on a tie, Allow wins
//   - "*" matches any run of characters, a trailing "$" anchors the end
//   - robots.txt 4xx (missing)  => everything allowed (408, 425 and 429 count as unreachable)
//   - robots.txt 5xx / network failure => everything disallowed for this run
//     (reported as ROBOTS_UNREACHABLE, distinct from ROBOTS_DISALLOWED)

const AGENT_TOKEN = 'SETA-Careers-Platform-Crawler';
const MAX_ROBOTS_BYTES = 512 * 1024;

function parseRobots(text) {
  const groups = [];
  let current = null;
  let lastWasAgent = false;

  for (const rawLine of String(text || '').slice(0, MAX_ROBOTS_BYTES).split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, '').trim();
    if (!line) continue;
    const separator = line.indexOf(':');
    if (separator === -1) continue;
    const field = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();

    if (field === 'user-agent') {
      if (!current || !lastWasAgent) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
      continue;
    }

    lastWasAgent = false;
    if ((field === 'allow' || field === 'disallow') && current) {
      // An empty Disallow means "allow everything"; an empty Allow is ignored.
      if (value === '') continue;
      current.rules.push({ allow: field === 'allow', pattern: value });
    }
  }
  return groups;
}

function patternToRegExp(pattern) {
  const anchored = pattern.endsWith('$');
  const body = anchored ? pattern.slice(0, -1) : pattern;
  const source = body.split('*').map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*');
  return new RegExp(`^${source}${anchored ? '$' : ''}`);
}

function selectRules(groups, agentToken = AGENT_TOKEN) {
  const token = agentToken.toLowerCase();
  const specific = groups.filter((group) => group.agents.some((agent) => agent !== '*' && agent && token.includes(agent)));
  const chosen = specific.length > 0 ? specific : groups.filter((group) => group.agents.includes('*'));
  return chosen.flatMap((group) => group.rules);
}

function isAllowedByRules(rules, pathAndQuery) {
  let best = null;
  for (const rule of rules) {
    if (!patternToRegExp(rule.pattern).test(pathAndQuery)) continue;
    const length = rule.pattern.replace(/\$$/, '').length;
    if (!best || length > best.length || (length === best.length && rule.allow && !best.allow)) {
      best = { length, allow: rule.allow };
    }
  }
  return best ? best.allow : true;
}

function pathAndQuery(rawUrl) {
  const parsed = new URL(rawUrl);
  return `${parsed.pathname || '/'}${parsed.search}`;
}

// fetchRobots(origin) must resolve { status, body } or throw on a network error.
// Results are cached per origin for the lifetime of the checker (one crawl run);
// the cache holds promises, so concurrent sources on one site share one request.
function createRobotsChecker(fetchRobots, agentToken = AGENT_TOKEN) {
  const cache = new Map();

  async function load(origin) {
    let response;
    try {
      response = await fetchRobots(origin);
    } catch (error) {
      return { state: 'unreachable', detail: error.message };
    }
    const status = response && response.status;
    if (status >= 200 && status < 300) {
      const text = response.body ? Buffer.from(response.body).toString('utf8') : '';
      return { state: 'rules', rules: selectRules(parseRobots(text), agentToken) };
    }
    // 4xx means no robots.txt (everything allowed), except the "try again later" statuses,
    // which say nothing about the site's rules.
    if (status >= 400 && status < 500 && ![408, 425, 429].includes(status)) return { state: 'open' };
    return { state: 'unreachable', detail: `robots.txt returned ${status === undefined || status === null ? 'no response' : `HTTP ${status}`}` };
  }

  return {
    // Resolves { allowed: true } or { allowed: false, reason, detail }.
    async check(rawUrl) {
      let origin;
      let target;
      try {
        origin = new URL(rawUrl).origin;
        target = pathAndQuery(rawUrl);
      } catch {
        return { allowed: false, reason: 'ROBOTS_UNREACHABLE', detail: `Unparseable URL: ${rawUrl}` };
      }
      if (!cache.has(origin)) cache.set(origin, load(origin));
      const entry = await cache.get(origin);

      if (entry.state === 'open') return { allowed: true };
      if (entry.state === 'unreachable') return { allowed: false, reason: 'ROBOTS_UNREACHABLE', detail: entry.detail };
      if (isAllowedByRules(entry.rules, target)) return { allowed: true };
      return { allowed: false, reason: 'ROBOTS_DISALLOWED', detail: `Disallowed by ${origin}/robots.txt for ${agentToken}` };
    },
  };
}

module.exports = {
  AGENT_TOKEN,
  createRobotsChecker,
  isAllowedByRules,
  parseRobots,
  selectRules,
};
