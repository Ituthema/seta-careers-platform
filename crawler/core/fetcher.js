const http = require('http');
const https = require('https');

let axios = null;
try {
  axios = require('axios');
} catch {
  axios = null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithNode(url, config, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    const request = client.get(
      parsedUrl,
      {
        timeout: config.timeout,
        headers: {
          'User-Agent': 'SETA-Careers-Platform-Crawler/1.0',
          Accept: 'text/html,application/pdf;q=0.9,*/*;q=0.8',
        },
      },
      (response) => {
        const status = response.statusCode || 0;
        const location = response.headers.location;

        if ([301, 302, 303, 307, 308].includes(status) && location) {
          response.resume();
          if (redirectCount >= config.maxRedirects) {
            reject(new Error(`Maximum redirects exceeded for ${url}`));
            return;
          }
          const nextUrl = new URL(location, url).toString();
          resolve(fetchWithNode(nextUrl, config, redirectCount + 1));
          return;
        }

        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => {
          const body = Buffer.concat(chunks);
          resolve({
            status,
            contentType: response.headers['content-type'] || '',
            body,
            url,
          });
        });
      },
    );

    request.on('timeout', () => request.destroy(new Error(`Request timed out after ${config.timeout}ms`)));
    request.on('error', reject);
  });
}

async function fetchOnce(source, config) {
  if (axios) {
    const response = await axios.get(source.url, {
      timeout: config.timeout,
      maxRedirects: config.maxRedirects,
      responseType: 'arraybuffer',
      validateStatus: () => true,
      headers: {
        'User-Agent': 'SETA-Careers-Platform-Crawler/1.0',
        Accept: 'text/html,application/pdf;q=0.9,*/*;q=0.8',
      },
    });

    return {
      status: response.status,
      contentType: response.headers['content-type'] || '',
      body: Buffer.from(response.data),
      url: response.request && response.request.res && response.request.res.responseUrl ? response.request.res.responseUrl : source.url,
    };
  }

  return fetchWithNode(source.url, config);
}

async function fetchSource(source, config, log = () => {}, events = {}) {
  let lastError = null;

  for (let attempt = 1; attempt <= config.retries; attempt += 1) {
    try {
      const response = await fetchOnce(source, config);

      if (response.status >= 200 && response.status < 300) {
        log(events.FETCH_SUCCESS || 'FETCH_SUCCESS', { source_id: source.source_id, url: response.url, status: response.status, attempt });
        return { ok: true, ...response };
      }

      lastError = new Error(`HTTP ${response.status}`);
      log(events.FETCH_FAILURE || 'FETCH_FAILURE', { source_id: source.source_id, url: source.url, status: response.status, attempt, error: lastError.message });
    } catch (error) {
      lastError = error;
      log(events.FETCH_FAILURE || 'FETCH_FAILURE', { source_id: source.source_id, url: source.url, attempt, error: error.message });
    }

    if (attempt < config.retries) {
      await sleep(250 * attempt);
    }
  }

  return {
    ok: false,
    status: null,
    contentType: '',
    body: null,
    url: source.url,
    error: lastError ? lastError.message : 'Unknown fetch failure',
  };
}

module.exports = {
  fetchSource,
};
