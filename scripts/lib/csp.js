'use strict';

// Content-Security-Policy delivered as a <meta> tag (GitHub Pages cannot send headers).
//
// What this buys, given that the SPA has inline scripts and inline onclick handlers (so
// 'unsafe-inline' for scripts cannot be dropped): injected markup cannot load a script from
// another site, cannot send data to another origin (fetch/XHR/beacon/image), cannot embed
// frames or plugins, cannot change <base>, and cannot post a form elsewhere.
// What it does not do: stop inline script that is already on the page, or set frame-ancestors
// (not allowed in a meta tag).
//
// The static SEO pages carry no script at all (JSON-LD is data), so theirs is much tighter.

const APP_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const STATIC_POLICY = [
  "default-src 'none'",
  "style-src 'unsafe-inline'",
  "img-src 'self' data:",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ');

const metaTag = (policy) => `<meta http-equiv="Content-Security-Policy" content="${policy}">`;

module.exports = { APP_POLICY, STATIC_POLICY, metaTag };
