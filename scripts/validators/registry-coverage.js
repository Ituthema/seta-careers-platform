'use strict';

// A listing marked verified: true claims someone checked its official source.
// The crawler can only keep that claim honest for domains that are in
// data/sources.json, so a verified listing on an unregistered domain is a gap.

const PUBLIC_SUFFIXES = new Set(['gov.za', 'co.za', 'org.za', 'ac.za', 'net.za', 'edu.za', 'com', 'org', 'net']);

function hostOf(value) {
  try {
    return new URL(value).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
}

// Same site if the hosts are equal or one is a subdomain of the other
// (my.nsfas.org.za covers nsfas.org.za). A bare public suffix never counts,
// so gov.za does not cover every government site.
function hostsRelated(a, b) {
  if (!a || !b) return false;
  if (a === b) return true;
  const [long, short] = a.length > b.length ? [a, b] : [b, a];
  if (PUBLIC_SUFFIXES.has(short)) return false;
  return long.endsWith('.' + short);
}

function registryHosts(sources) {
  return [...new Set((sources || []).map((s) => hostOf(s.url)).filter(Boolean))];
}

function isCovered(url, hosts) {
  const host = hostOf(url);
  return host !== null && hosts.some((h) => hostsRelated(host, h));
}

// Returns one entry per verified listing URL whose domain the registry lacks.
function findUncoveredVerified(opportunities, sources) {
  const hosts = registryHosts(sources);
  const gaps = [];
  for (const o of opportunities || []) {
    if (o.verified !== true) continue;
    for (const field of ['source_url', 'application_url']) {
      if (o[field] && !isCovered(o[field], hosts)) {
        gaps.push({ id: o.id, field, url: o[field], host: hostOf(o[field]), expired: o.expired === true });
      }
    }
  }
  return gaps;
}

module.exports = { findUncoveredVerified, hostsRelated, hostOf, isCovered };
