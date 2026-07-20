const pdfParse = require('pdf-parse');
const { normalizeWhitespace } = require('../pipeline/normalize');

async function parsePdf(body) {
  if (!Buffer.isBuffer(body) || body.length === 0) {
    throw new Error('PDF body is empty.');
  }

  if (body.subarray(0, 5).toString('utf8') !== '%PDF-') {
    throw new Error('PDF body is corrupt or has an invalid signature.');
  }

  try {
    const parsed = await pdfParse(body);
    const text = normalizeWhitespace(parsed.text || '');

    if (!text) {
      throw new Error('PDF did not contain extractable text.');
    }

    return {
      text,
      pages: parsed.numpages || 0,
      info: parsed.info || {},
    };
  } catch (error) {
    const message = /password/i.test(error.message) ? 'PDF is password protected.' : error.message;
    throw new Error(`PDF parsing failed: ${message}`);
  }
}

module.exports = {
  parsePdf,
};
