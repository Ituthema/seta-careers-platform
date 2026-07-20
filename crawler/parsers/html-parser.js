const cheerio = require('cheerio');
const { normalizeWhitespace } = require('../pipeline/normalize');

function parseHtml(body) {
  const html = Buffer.isBuffer(body) ? body.toString('utf8') : String(body || '');
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
