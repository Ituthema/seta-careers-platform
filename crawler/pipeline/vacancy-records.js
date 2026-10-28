'use strict';

const crypto = require('crypto');
const { extractAll } = require('./candidates');

function slugFromUrl(rawUrl) {
  try {
    const part = new URL(rawUrl).pathname.split('/').filter(Boolean).pop() || '';
    return decodeURIComponent(part).replace(/[-_]+/g, ' ').replace(/\.(?:html?|pdf)$/i, '').replace(/\b\w/g, (m) => m.toUpperCase()).trim();
  } catch {
    return '';
  }
}

function stableId(sourceId, url, title) {
  return crypto.createHash('sha256').update([sourceId || '', url || '', title || ''].join('\n').toLowerCase()).digest('hex').slice(0, 20);
}

// Convert discovery leads into explicit review records. This is intentionally
// a lead queue, not publishable content: every record retains source evidence
// and requires official-page verification before it can enter opportunities.json.
function buildVacancyRecords(stagedRecords, now = new Date()) {
  const extracted = extractAll(stagedRecords, now);
  const records = [];
  const seen = new Set();

  for (const page of extracted.pages) {
    for (const link of page.links) {
      const title = slugFromUrl(link.url) || page.page_title || 'Untitled vacancy lead';
      const key = link.url.replace(/#.*$/, '').replace(/\/$/, '').toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      records.push({
        candidate_id: stableId(page.source_id, link.url, title),
        category: link.category || 'job',
        title,
        organization: page.source_name || null,
        location: null,
        closing_date: null,
        application_url: link.url,
        source_id: page.source_id,
        source_name: page.source_name || null,
        source_page_url: page.page_url,
        source_page_title: page.page_title,
        evidence: { kind: 'link', value: link.url },
        status: 'needs_verification',
        publishable: false,
        missing_fields: ['official_title', 'organization_confirmation', 'location', 'closing_date', 'eligibility', 'application_instructions'],
        discovered_at: now.toISOString(),
      });
    }

    for (const mention of page.mentions) {
      const closingDate = mention.closing_dates.find((date) => date >= new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Johannesburg' }).format(now)) || mention.closing_dates[0] || null;
      const title = mention.line;
      const key = [page.source_id, title.toLowerCase(), closingDate || ''].join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      records.push({
        candidate_id: stableId(page.source_id, page.page_url, title),
        category: mention.category || 'job',
        title,
        organization: page.source_name || null,
        location: null,
        closing_date: closingDate,
        application_url: null,
        source_id: page.source_id,
        source_name: page.source_name || null,
        source_page_url: page.page_url,
        source_page_title: page.page_title,
        evidence: { kind: 'page_text', value: mention.line, closing_dates: mention.closing_dates },
        status: mention.status === 'past' ? 'possibly_expired' : 'needs_verification',
        publishable: false,
        missing_fields: ['official_title_confirmation', 'organization_confirmation', 'location', 'application_url', 'eligibility', 'application_instructions'],
        discovered_at: now.toISOString(),
      });
    }
  }

  records.sort((a, b) => {
    const statusRank = (r) => r.status === 'needs_verification' ? 0 : 1;
    return statusRank(a) - statusRank(b) || String(a.closing_date || '9999-12-31').localeCompare(String(b.closing_date || '9999-12-31')) || a.title.localeCompare(b.title);
  });

  return {
    schema_version: 1,
    generated_at: now.toISOString(),
    summary: {
      total: records.length,
      needs_verification: records.filter((r) => r.status === 'needs_verification').length,
      possibly_expired: records.filter((r) => r.status === 'possibly_expired').length,
      publishable: 0,
      by_category: records.reduce((out, record) => {
        out[record.category] = (out[record.category] || 0) + 1;
        return out;
      }, {}),
    },
    records,
  };
}

module.exports = { buildVacancyRecords, slugFromUrl, stableId };
