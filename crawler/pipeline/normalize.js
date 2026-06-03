function normalizeWhitespace(value = '') {
  return String(value)
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t+/g, ' ')
    .replace(/[ \f\v]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function normalizeUrl(value, baseUrl = null) {
  if (!value || typeof value !== 'string') return null;

  try {
    const parsedUrl = baseUrl ? new URL(value, baseUrl) : new URL(value);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) return null;

    parsedUrl.hash = '';
    parsedUrl.hostname = parsedUrl.hostname.toLowerCase();

    if ((parsedUrl.protocol === 'https:' && parsedUrl.port === '443') || (parsedUrl.protocol === 'http:' && parsedUrl.port === '80')) {
      parsedUrl.port = '';
    }

    return parsedUrl.toString();
  } catch {
    return null;
  }
}

function normalizeLinks(links = [], baseUrl = null) {
  const normalized = links
    .map((link) => normalizeUrl(typeof link === 'string' ? link : link.href, baseUrl))
    .filter(Boolean);

  return [...new Set(normalized)];
}

function normalizeParsedContent(parsed, context = {}) {
  const metadata = {
    ...(parsed.metadata || {}),
    ...(parsed.info ? { info: parsed.info } : {}),
  };

  if (metadata.canonical) {
    metadata.canonical = normalizeUrl(metadata.canonical, context.url);
  }

  if (parsed.title) {
    metadata.title = normalizeWhitespace(parsed.title);
  } else if (metadata.title) {
    metadata.title = normalizeWhitespace(metadata.title);
  }

  if (metadata.description) {
    metadata.description = normalizeWhitespace(metadata.description);
  }

  if (Array.isArray(parsed.links)) {
    metadata.links = normalizeLinks(parsed.links, context.url);
  }

  if (Array.isArray(parsed.headings)) {
    metadata.headings = parsed.headings.map(normalizeWhitespace).filter(Boolean);
  }

  if (Number.isInteger(parsed.pages)) {
    metadata.pages = parsed.pages;
  }

  return {
    normalizedText: normalizeWhitespace(parsed.text || ''),
    metadata,
  };
}

module.exports = {
  normalizeParsedContent,
  normalizeUrl,
  normalizeWhitespace,
};
