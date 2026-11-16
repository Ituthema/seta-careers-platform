'use strict';

// Public Service Vacancy Circular (DPSA) parser.
//
// A circular is one very large PDF of department annexures. Each post starts with
// "POST 40/04 : TITLE REF NO: ..." and the closing date is usually written once per
// annexure ("CLOSING DATE : 20 November 2026 at 16h00"), though some annexures repeat it
// after every post. Most posts are permanent jobs, so this only emits leads for youth-development
// wording (internship, learnership, bursary, apprenticeship). Output is a lead for human
// verification against the circular and the department's own advert, never a listing.

const { closingDates } = require('./candidates');

const KIND_PATTERNS = [
  ['learnership', /learnership|\blearners?\b/i],
  ['bursary', /bursar/i],
  ['apprenticeship', /apprentice|trainee\s+artisan|artisan\s+(?:trainee|learner)/i],
  ['internship', /\binterns?\b|internship|work[- ]integrated|\bWIL\b|\bYES\b|graduate\s+(?:programme|trainee)/i],
];

function kindOf(title) {
  const hit = KIND_PATTERNS.find(([, re]) => re.test(title));
  return hit ? hit[0] : null;
}

function isCircular(text) {
  return /PUBLIC\s+SERVICE\s+VACANCY\s+CIRCULAR/i.test(String(text || '').slice(0, 4000));
}

function circularMeta(text) {
  const head = String(text || '').slice(0, 4000);
  const no = head.match(/PUBLICATION\s+NO\.?\s*(\d{1,3})\s+OF\s+(20\d{2})/i);
  const issued = head.match(/DATE\s+ISSUED\s*:?\s*(\d{1,2}\s+[A-Za-z]+\s+20\d{2})/i);
  const iso = issued ? Date.parse(`${issued[1]} 00:00 UTC`) : NaN;
  return {
    circular_no: no ? Number(no[1]) : null,
    year: no ? Number(no[2]) : null,
    issued_date: Number.isNaN(iso) ? null : new Date(iso).toISOString().slice(0, 10),
  };
}

function clean(value, max) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, max);
}

// Parses every "POST NN/NN :" block. Dates are resolved post-level first, then from the
// closest annexure-level "CLOSING DATE" inside the same annexure; otherwise left null.
function parsePosts(text) {
  const src = String(text || '');
  const annexures = [...src.matchAll(/ANNEXURE\s+([A-Z])\b[ \t]*[:\-–]?[ \t]*([^\n]{0,120})/g)]
    .map((m) => ({ at: m.index, letter: m[1], name: clean(m[2].split(/\s(?:CLOSING|NOTE|POST)\b/)[0], 100) }));
  const sectionDates = [...src.matchAll(/CLOSING\s+DATE\s*:?\s*([^\n]{0,80})/gi)]
    .map((m) => ({ at: m.index, date: closingDates(`closing date ${m[1]}`)[0] || null }));
  const heads = [...src.matchAll(/POST\s+(\d{1,3}\/\d{1,3})\s*:\s*/g)];

  return heads.map((head, i) => {
    const start = head.index;
    let end = i + 1 < heads.length ? heads[i + 1].index : src.length;
    // The next annexure's header (and its shared closing date) sits before its first post, so
    // cut this post off there to avoid borrowing the wrong date.
    const nextAnnexure = annexures.find((a) => a.at > start && a.at < end);
    if (nextAnnexure) end = nextAnnexure.at;
    const body = src.slice(start + head[0].length, end);

    const title = clean(body.split(/\s(?:REF(?:ERENCE)?\s*NO|SALARY|CENTRE|CENTER|REQUIREMENTS)\s*:/i)[0], 200);
    const ref = body.match(/REF(?:ERENCE)?\s*NO\.?\s*:?\s*([A-Z0-9][A-Z0-9/\-.]*)/i);
    const salary = body.match(/SALARY\s*:\s*([^\n]{1,120})/i);
    const apps = body.match(/APPLICATIONS?\s*:\s*([^\n]{0,240})/i);
    const urls = apps ? (apps[1].match(/https?:\/\/[^\s)]+/g) || []) : [];
    const emails = apps ? (apps[1].match(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g) || []) : [];

    const own = body.match(/CLOSING\s+DATE\s*:?\s*([^\n]{0,80})/i);
    let closing = own ? (closingDates(`closing date ${own[1]}`)[0] || null) : null;
    if (!closing) {
      const annexure = [...annexures].reverse().find((a) => a.at < start);
      const shared = [...sectionDates].reverse().find((d) => d.at < start && (!annexure || d.at >= annexure.at));
      closing = shared ? shared.date : null;
    }
    const annexure = [...annexures].reverse().find((a) => a.at < start);
    return {
      post_no: head[1],
      title,
      ref_no: ref ? ref[1].replace(/[.]+$/, '') : null,
      salary: salary ? clean(salary[1], 120) : null,
      closing_date: closing,
      department_guess: annexure && annexure.name ? annexure.name : null,
      application_url: urls[0] ? urls[0].replace(/[.,;]+$/, '') : null,
      application_email: emails[0] || null,
    };
  });
}

// Youth-development posts only, as lead records for buildVacancyRecords.
function circularLeads(record, now = new Date(), makeId = (...p) => p.join('|')) {
  const meta = circularMeta(record.text);
  const cutoff = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Johannesburg' }).format(now);
  const leads = [];
  for (const post of parsePosts(record.text)) {
    const category = kindOf(post.title);
    if (!category) continue;
    leads.push({
      candidate_id: makeId(record.source_id, record.url, `${meta.circular_no || ''}/${post.post_no}/${post.ref_no || ''}`),
      category,
      title: post.title,
      organization: post.department_guess || record.source_name || null,
      location: null,
      closing_date: post.closing_date,
      application_url: post.application_url,
      source_id: record.source_id,
      source_name: record.source_name || null,
      source_page_url: record.url,
      source_page_title: record.title || '',
      evidence: {
        kind: 'psvc_post',
        value: `Circular ${meta.circular_no || '?'} of ${meta.year || '?'}, post ${post.post_no}${post.ref_no ? `, ref ${post.ref_no}` : ''}`,
        issued_date: meta.issued_date,
        salary: post.salary,
        application_email: post.application_email,
      },
      status: post.closing_date && post.closing_date < cutoff ? 'possibly_expired' : 'needs_verification',
      publishable: false,
      missing_fields: ['organization_confirmation', 'location', 'eligibility', 'application_instructions'].concat(post.closing_date ? [] : ['closing_date']),
      discovered_at: now.toISOString(),
    });
  }
  return leads;
}

module.exports = { isCircular, circularMeta, parsePosts, circularLeads, kindOf };
