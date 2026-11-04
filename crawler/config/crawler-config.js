module.exports = Object.freeze({
  timeout: 15000,
  retries: 3,
  concurrency: 5,
  maxRedirects: 5,
  maxBodyBytes: 20 * 1024 * 1024, // 20MB cap on a single source's response body
  // One level of link following (see crawler/pipeline/follow-links.js). Set CRAWLER_FOLLOW_LINKS=false to turn it off.
  followLinks: { perSource: 3, total: 120 },
});
