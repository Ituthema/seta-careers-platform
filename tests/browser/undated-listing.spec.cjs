const { test, expect } = require('@playwright/test');

// A listing the advert left incomplete must still render, say what is unknown, and never be treated as closed.
// The record is injected into the data response, so no repository data is changed.
const undated = {
  id: '990', slug: 'undated-test-learnership', title: 'Undated Test Learnership', category: 'learnership',
  sector: 'Not stated', province: 'Not stated', qualification_level: 'Not stated', stipend: 'Not stated', closing_date: null,
  application_url: 'https://www.example.org/apply', source_name: 'example.org', source_url: 'https://www.example.org/apply',
  verified: true, featured: false, expired: false, publication_status: 'open',
  description: 'Details were not provided with this listing. Read the official advert before applying.',
  eligibility: [], employment_eligibility: [], documents_needed: [], tags: [], posted_date: '2026-11-02', updated_date: '2026-11-02',
  field_notes: {
    stipend: 'Stipend unknown: the advert does not state one.',
    closing_date: 'Closing date unknown: no closing date was published. Confirm on the official page before applying.',
    eligibility: 'Eligibility requirements unknown: the advert does not list any.',
    documents_needed: 'Required documents unknown: the advert does not list any.',
  },
};

test.beforeEach(async ({ page }) => {
  await page.route('**/data/opportunities.json', async (route) => {
    const response = await route.fetch();
    const records = await response.json();
    await route.fulfill({ response, json: [undated, ...records] });
  });
});

test('detail page shows the comments for every missing field', async ({ page }) => {
  await page.goto('/#/learnerships/undated-test-learnership');
  await expect(page.locator('.detail-h1')).toContainText('Undated Test Learnership');
  await expect(page.locator('.qf-bar')).toContainText('Closing date not stated');
  await expect(page.locator('.urg-banner')).toContainText('No closing date was published');
  await expect(page.locator('.notes-box')).toContainText('Stipend unknown: the advert does not state one.');
  await expect(page.locator('.note-unknown').first()).toContainText('Eligibility requirements unknown');
});

test('directory lists it with a "No closing date" label', async ({ page }) => {
  await page.goto('/#/directory');
  const card = page.locator('.opp-card').filter({ hasText: 'Undated Test Learnership' });
  await expect(card).toHaveCount(1);
  await expect(card.locator('.pill')).toContainText('No closing date');
});
