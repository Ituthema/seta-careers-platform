const axios = require('axios');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchOnce(source, config) {
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

async function fetchSource(source, config, log = () => {}) {
  let lastError = null;

  for (let attempt = 1; attempt <= config.retries; attempt += 1) {
    try {
      const response = await fetchOnce(source, config);

      if (response.status >= 200 && response.status < 300) {
        log('FETCH_SUCCESS', { source_id: source.source_id, url: response.url, status: response.status, attempt });
        return { ok: true, ...response };
      }

      lastError = new Error(`HTTP ${response.status}`);
      log('FETCH_FAILURE', { source_id: source.source_id, url: source.url, status: response.status, attempt, error: lastError.message });
    } catch (error) {
      lastError = error;
      log('FETCH_FAILURE', { source_id: source.source_id, url: source.url, attempt, error: error.message });
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
