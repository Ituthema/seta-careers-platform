function detectContentType(fetchResult) {
  const contentType = (fetchResult.contentType || '').toLowerCase();
  const url = (fetchResult.url || '').toLowerCase();
  const body = fetchResult.body;

  if (contentType.includes('text/html') || contentType.includes('application/xhtml+xml')) return 'html';
  if (contentType.includes('application/pdf')) return 'pdf';
  if (url.endsWith('.pdf')) return 'pdf';

  if (Buffer.isBuffer(body)) {
    const signature = body.subarray(0, 5).toString('utf8');
    if (signature === '%PDF-') return 'pdf';

    const sample = body.subarray(0, 512).toString('utf8').toLowerCase();
    if (sample.includes('<!doctype html') || sample.includes('<html')) return 'html';
  }

  return 'unknown';
}

function routeContent(fetchResult, log = () => {}, events = {}) {
  const contentType = detectContentType(fetchResult);

  if (contentType === 'unknown') {
    log(events.UNSUPPORTED_CONTENT || 'UNSUPPORTED_CONTENT', {
      url: fetchResult.url,
      reason: 'UNSUPPORTED_CONTENT_TYPE',
      content_type: fetchResult.contentType || '',
    });
  }

  return contentType;
}

module.exports = {
  detectContentType,
  routeContent,
};
