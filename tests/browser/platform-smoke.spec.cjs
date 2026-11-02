const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');

// Smoke tests must not depend on one specific listing: listings close and expire.
// Pick a currently open, dated listing from the same data file the app loads.
function todaySA() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Johannesburg' }).format(new Date());
}
function openListing() {
  const records = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/opportunities.json'), 'utf8'));
  const today = todaySA();
  return records.find((o) => o.publication_status === 'open' && !o.expired && o.closing_date && o.closing_date >= today) || null;
}
const CAT_PATH = { learnership: 'learnerships', internship: 'internships', bursary: 'bursaries', apprenticeship: 'apprenticeships', tvet: 'tvet-pathways', job: 'jobs' };

test('homepage renders an open opportunity card', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.hero h1')).toContainText('Find Your Career Opportunity in SA');
  await expect(page.locator('.opp-card').first()).toBeVisible();
});

test('an open listing detail route links to its official application page', async ({ page }) => {
  const listing = openListing();
  test.skip(!listing, 'no open dated listing in data/opportunities.json right now');
  await page.goto(`/#/${CAT_PATH[listing.category]}/${listing.slug}`);
  await expect(page.locator('.detail-h1')).toContainText(listing.title);
  const applicationLink = page.locator('a.apply-btn');
  await expect(applicationLink).toBeVisible();
  await expect(applicationLink).toHaveAttribute('href', listing.application_url);
});

test('mobile navigation opens the navigation drawer', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const menuButton = page.locator('.hbg');
  await expect(menuButton).toBeVisible();
  await menuButton.click();
  await expect(page.locator('.drawer')).toHaveClass(/open/);
  await expect(page.locator('.drawer')).toContainText('Bursaries');
});
