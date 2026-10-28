#!/usr/bin/env node
/**
 * Draft a listing from ONE official page with Claude's help. Run it on your own
 * machine (for example Termux); the API key never goes in the website.
 *
 *   export ANTHROPIC_API_KEY=sk-ant-...        (never commit or paste this anywhere)
 *   npm run ai:draft -- https://example.org/careers/some-learnership
 *   npm run ai:draft -- <url> --out docs/listing-drafts
 *
 * What it does: fetches the page with the crawler's safe fetcher (robots.txt and
 * private-network checks apply), asks the model to fill the listing fields from
 * that page only, then checks every claim against the page text. A closing date,
 * stipend or qualification the page does not actually contain is removed.
 *
 * What it never does: publish, set verified to true, or search the web. You still
 * open the page, confirm, and run `npm run add:listing`.
 *
 * Options: --model <id>   model id (default: env AI_DRAFT_MODEL or claude-sonnet-5-5)
 *          --out <dir>    where to write the draft (default docs/listing-drafts)
 *          --print        print the draft instead of writing files
 */
const fs = require('fs');
const path = require('path');
const { makeDraft } = require('./lib/ai-draft');
const { writeJsonAtomic } = require('../crawler/pipeline/atomic-write');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const value = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const url = args.find((a, i) => !a.startsWith('--') && !['--model', '--out'].includes(args[i - 1]));
const model = value('--model') || process.env.AI_DRAFT_MODEL || 'claude-sonnet-5-5';
const outDir = path.resolve(ROOT, value('--out') || 'docs/listing-drafts');

function fail(message) { console.error(message); process.exit(1); }

if (!url) fail('Usage: npm run ai:draft -- <official page URL> [--out dir] [--print]');
if (!process.env.ANTHROPIC_API_KEY) fail('Set ANTHROPIC_API_KEY first, for example: export ANTHROPIC_API_KEY=...  (do not put it in any file in the repo).');

async function fetchPage(pageUrl) {
  // Lazy so a missing crawler dependency gives a clear message.
  let fetcher; let robotsLib; let config;
  try {
    fetcher = require('../crawler/core/fetcher');
    robotsLib = require('../crawler/core/robots');
    config = require('../crawler/config/crawler-config');
    require.resolve('axios');
  } catch {
    return fail('The crawler dependencies are missing. Run: npm install   (axios and cheerio are needed to fetch pages).');
  }
  const robots = robotsLib.createRobotsChecker((origin) => fetcher.fetchRobotsFile(origin, config));
  const result = await fetcher.fetchSource({ source_id: 'ai-draft', url: pageUrl }, config, () => {}, {}, { robots });
  if (!result.ok) throw new Error(`Could not fetch the page: ${result.rejectReason || result.error || `HTTP ${result.status}`}`);
  if (!/html|text/i.test(result.contentType)) throw new Error(`Unsupported content type: ${result.contentType || 'unknown'} (PDFs are not supported yet).`);
  return { url: result.url, html: Buffer.from(result.body).toString('utf8') };
}

async function callModel(system, user) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model, max_tokens: 2000, system, messages: [{ role: 'user', content: user }] }),
    signal: AbortSignal.timeout(90000),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Anthropic API error ${response.status}: ${(body.error && body.error.message) || 'no details'}`);
  return (body.content || []).map((b) => b.text || '').join('\n');
}

(async () => {
  const readJson = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
  const result = await makeDraft(url, { fetchPage, callModel }, readJson('data/opportunities.json'), readJson('data/sources.json'));

  if (result.skipped) {
    console.log(`No draft: the model says this page is not a single opportunity (${result.skipped}).`);
    process.exit(2);
  }

  console.log('Checks against the page:');
  for (const c of result.checks) console.log(`  - ${c}`);
  if (result.errors.length) {
    console.log('\nStill missing or invalid (fix these in the draft file before add:listing):');
    for (const e of result.errors) console.log(`  - ${e}`);
  }
  for (const w of result.warnings) console.log(`warning: ${w}`);

  if (args.includes('--print')) { console.log(JSON.stringify(result.draft, null, 2)); return; }
  fs.mkdirSync(outDir, { recursive: true });
  const file = path.join(outDir, `${result.slug}.json`);
  if (fs.existsSync(file)) fail(`\n${path.relative(ROOT, file)} already exists; not overwriting. Delete it or pick another --out.`);
  writeJsonAtomic(file, result.draft);
  writeJsonAtomic(path.join(outDir, `${result.slug}.evidence.json`), { source: result.draft.source_url, model, evidence: result.evidence, checks: result.checks });
  console.log(`\nDraft written: ${path.relative(ROOT, file)}`);
  console.log('AI-written text can be wrong. Open the page, check every field, then:');
  console.log(`  npm run add:listing -- ${path.relative(ROOT, file)}           (dry run)`);
})().catch((error) => fail(`Failed: ${error.message}`));
