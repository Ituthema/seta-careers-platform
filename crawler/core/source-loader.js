const path = require('path');
const { loadSources, validateSource } = require('../../scripts/validators/source-validator');

const DEFAULT_SOURCE_PATH = path.resolve(__dirname, '..', '..', 'data', 'sources.json');

function toCrawlerSource(source) {
  return {
    source_id: source.source_id,
    name: source.name,
    url: source.url,
    type: source.type,
    crawl_strategy: source.crawl_strategy,
  };
}

function loadActiveSources(options = {}) {
  const sourcePath = options.sourcePath || DEFAULT_SOURCE_PATH;
  const log = typeof options.log === 'function' ? options.log : () => {};
  const reject = typeof options.reject === 'function' ? options.reject : () => {};
  const sources = loadSources(sourcePath);

  if (!Array.isArray(sources)) {
    throw new Error('Source registry root must be an array.');
  }

  const activeSources = [];

  sources.forEach((source, index) => {
    if (!source || source.active !== true) return;

    const failures = validateSource(source, index).filter((issue) => issue.level === 'FAIL');
    if (failures.length > 0) {
      reject({
        source_id: source && source.source_id ? source.source_id : `sources[${index}]`,
        url: source && source.url ? source.url : '',
        reason: 'INVALID_CONTENT',
        details: failures.map((issue) => issue.message),
      });
      log('VALIDATION_FAILURE', {
        source_id: source && source.source_id ? source.source_id : null,
        failures: failures.map((issue) => issue.code),
      });
      return;
    }

    activeSources.push(toCrawlerSource(source));
    log('SOURCE_LOADED', { source_id: source.source_id, url: source.url });
  });

  return activeSources;
}

module.exports = {
  DEFAULT_SOURCE_PATH,
  loadActiveSources,
};
