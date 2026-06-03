function validateNormalizedContent(contentType, normalizedRecord) {
  const reasons = [];
  const title = normalizedRecord.metadata ? normalizedRecord.metadata.title : '';
  const text = normalizedRecord.normalizedText;

  if (contentType === 'html') {
    if (!title || title.trim() === '') reasons.push('HTML_TITLE_MISSING');
    if (!text || text.trim() === '') reasons.push('HTML_TEXT_MISSING');
  } else if (contentType === 'pdf') {
    if (!text || text.trim() === '') reasons.push('PDF_TEXT_MISSING');
  } else {
    reasons.push('UNSUPPORTED_CONTENT_TYPE');
  }

  return {
    valid: reasons.length === 0,
    reasons,
  };
}

module.exports = {
  validateNormalizedContent,
};
