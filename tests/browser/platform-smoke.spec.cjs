const { test, expect } = require('@playwright/test');

test('homepage renders the current opportunity card', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.hero h1')).toContainText('Find Your Career Opportunity in SA');
  await expect(page.locator('.opp-card').first()).toBeVisible();
  await expect(page.locator('.opp-card').filter({ hasText: 'NSFAS Bursary 2027' })).toBeVisible();
});

test('NSFAS 2027 detail route links to the official application portal', async ({ page }) => {
  await page.goto('/#/bursaries/nsfas-bursary-2027');
  await expect(page.locator('.detail-h1')).toContainText('NSFAS Bursary 2027');
  const applicationLink = page.locator('a.apply-btn');
  await expect(applicationLink).toBeVisible();
  await expect(applicationLink).toHaveAttribute('href', 'https://my.nsfas.org.za');
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
