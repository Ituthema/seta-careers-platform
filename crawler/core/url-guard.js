const dns = require('dns');
const net = require('net');

// SSRF guard for the crawler. Source URLs come from data/sources.json, which is
// edited by hand and by PRs, and any page can redirect anywhere. Without a guard
// a bad entry (or a redirect) could make the crawler call loopback, link-local
// (cloud metadata at 169.254.169.254) or private-network addresses.
//
// Two layers:
//   1. assertSafeUrl() rejects non-http(s) schemes and embedded credentials
//      before any request is made.
//   2. guardedLookup() is installed as the socket DNS lookup, so every address a
//      connection resolves to, including after redirects, is checked.
//
// Limitation: when axios uses an HTTP(S)_PROXY from the environment, the socket
// connects to the proxy and the target host is resolved by the proxy, so layer 2
// cannot see it. Layer 1 still applies. Set CRAWLER_ALLOW_PRIVATE_NETWORK=true to
// disable layer 2 (for example a proxy on a private address).

const IPV4_BLOCKED = [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
];

function ipv4ToInt(address) {
  return address.split('.').reduce((acc, part) => (acc * 256) + Number(part), 0);
}

function isBlockedIPv4(address) {
  const value = ipv4ToInt(address);
  return IPV4_BLOCKED.some(([base, bits]) => {
    const size = 2 ** (32 - bits);
    const start = ipv4ToInt(base);
    return value >= start && value < start + size;
  });
}

function isBlockedIPv6(address) {
  const lower = address.toLowerCase().split('%')[0];
  if (lower === '::' || lower === '::1') return true;

  const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isBlockedIPv4(mapped[1]);
  const mappedHex = lower.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (mappedHex) {
    const high = parseInt(mappedHex[1], 16);
    const low = parseInt(mappedHex[2], 16);
    return isBlockedIPv4(`${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`);
  }

  const first = parseInt(lower.split(':')[0] || '0', 16);
  if ((first & 0xfe00) === 0xfc00) return true; // fc00::/7 unique local
  if ((first & 0xffc0) === 0xfe80) return true; // fe80::/10 link local
  if ((first & 0xff00) === 0xff00) return true; // ff00::/8 multicast
  return false;
}

function isPrivateAddress(address) {
  const family = net.isIP(address);
  if (family === 4) return isBlockedIPv4(address);
  if (family === 6) return isBlockedIPv6(address);
  return true; // not an IP at all: refuse rather than guess
}

function allowPrivateNetwork(env = process.env) {
  return env.CRAWLER_ALLOW_PRIVATE_NETWORK === 'true';
}

function assertSafeUrl(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error(`Blocked URL (not parseable): ${rawUrl}`);
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`Blocked URL scheme: ${parsed.protocol}`);
  }
  if (parsed.username || parsed.password) {
    throw new Error('Blocked URL: embedded credentials');
  }
  if (net.isIP(parsed.hostname.replace(/^\[|\]$/g, '')) && !allowPrivateNetwork() && isPrivateAddress(parsed.hostname.replace(/^\[|\]$/g, ''))) {
    throw new Error(`Blocked private address: ${parsed.hostname}`);
  }
  return parsed;
}

function guardedLookup(hostname, options, callback) {
  const opts = typeof options === 'function' ? {} : (options || {});
  const cb = typeof options === 'function' ? options : callback;

  dns.lookup(hostname, { ...opts, all: true }, (error, addresses) => {
    if (error) return cb(error);
    if (!allowPrivateNetwork()) {
      const blocked = addresses.find((entry) => isPrivateAddress(entry.address));
      if (blocked) {
        const blockedError = new Error(`Blocked private address ${blocked.address} for host ${hostname}`);
        blockedError.code = 'ESSRF';
        return cb(blockedError);
      }
    }
    if (opts.all) return cb(null, addresses);
    return cb(null, addresses[0].address, addresses[0].family);
  });
}

module.exports = {
  assertSafeUrl,
  guardedLookup,
  isPrivateAddress,
};
