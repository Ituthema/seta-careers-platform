const { normalizeWhitespace } = require('../pipeline/normalize');

let cheerio = null;
try {
  cheerio = require('cheerio');
} catch {
  cheerio = null;
}

function stripTags(html) {
  return normalizeWhitespace(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
      .replace(/<header[\s\S]*?<\/header>/gi, ' ')
      .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
      .replace(/<aside[\s\S]*?<\/aside>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'"),
  );
}

function extractFirst(html, pattern) {
  const match = html.match(pattern);
  return match ? stripTags(match[1]) : '';
}

function parseHtmlFallback(html) {
  const links = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)].map((match) => match[1]);
  const headings = [...html.matchAll(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/gi)].map((match) => stripTags(match[1])).filter(Boolean);
  const title = extractFirst(html, /<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const descriptionMatch = html.match(/<meta\b[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i)
    || html.match(/<meta\b[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);
  const canonicalMatch = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i)
    || html.match(/<link\b[^>]*href=["']([^"']*)["'][^>]*rel=["']canonical["'][^>]*>/i);

  return {
    title,
    text: stripTags(html),
    links,
    headings,
    metadata: {
      title,
      description: descriptionMatch ? normalizeWhitespace(descriptionMatch[1]) : '',
      canonical: canonicalMatch ? canonicalMatch[1] : '',
    },
  };
}

function parseHtml(body) {
  const html = Buffer.isBuffer(body) ? body.toString('utf8') : String(body || '');

  if (!cheerio) {
    return parseHtmlFallback(html);
  }

  const $ = cheerio.load(html);
  $('script, style, noscript, iframe, svg, nav, header, footer, aside').remove();

  const title = normalizeWhitespace($('title').first().text() || $('h1').first().text());
  const links = $('a[href]')
    .map((_, element) => $(element).attr('href'))
    .get()
    .filter(Boolean);
  const headings = $('h1, h2, h3, h4, h5, h6')
    .map((_, element) => normalizeWhitespace($(element).text()))
    .get()
    .filter(Boolean);
  const metadata = {
    title,
    description: normalizeWhitespace($('meta[name="description"]').attr('content') || ''),
    canonical: $('link[rel="canonical"]').attr('href') || '',
  };

  return {
    title,
    text: normalizeWhitespace($('body').text() || $.root().text()),
    links,
    headings,
    metadata,
  };
}

module.exports = {
  parseHtml,
};
