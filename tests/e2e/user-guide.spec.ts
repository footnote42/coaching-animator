import { test, expect } from '@playwright/test';

test.describe('User Guide and Help Navigation', () => {
  test('? nav icon on homepage navigates to /help', async ({ page }) => {
    await page.goto('/');
    // Click the help icon link in the header
    await page.click('nav a[aria-label="Help"]');
    await expect(page).toHaveURL(/.*\/help/);
  });

  test('/help returns 200 without auth and contains all 4 section headings', async ({ page }) => {
    const response = await page.goto('/help');
    expect(response?.status()).toBe(200);

    await expect(page.locator('h2:has-text("Core workflow")')).toBeVisible();
    await expect(page.locator('h2:has-text("What\'s on the pitch")')).toBeVisible();
    await expect(page.locator('h2:has-text("Sharing")')).toBeVisible();
    await expect(page.locator('h2:has-text("Coaching framework")')).toBeVisible();
  });

  test('footer Help link visible on /gallery and navigates to /help', async ({ page }) => {
    await page.goto('/gallery');
    const footerHelpLink = page.locator('footer a:has-text("Help")');
    await expect(footerHelpLink).toBeVisible();
    
    await footerHelpLink.click();
    await expect(page).toHaveURL(/.*\/help/);
  });

  test('footer absent on /app', async ({ page }) => {
    await page.goto('/app');
    await expect(page.locator('footer')).toHaveCount(0);
  });

  test('clicking coaching framework link on /help navigates to /help/coaching', async ({ page }) => {
    await page.goto('/help');
    await page.click('text=Read the APES Coaching Framework guide');
    await expect(page).toHaveURL(/.*\/help\/coaching/);
  });

  test('/help/coaching returns 200 without auth and contains APES sections', async ({ page }) => {
    const response = await page.goto('/help/coaching');
    expect(response?.status()).toBe(200);

    await expect(page.locator('h1:has-text("The APES Framework")')).toBeVisible();
    await expect(page.locator('h2:has-text("Active")')).toBeVisible();
    await expect(page.locator('h2:has-text("Purposeful")')).toBeVisible();
    await expect(page.locator('h2:has-text("Enjoyable")')).toBeVisible();
    await expect(page.locator('h2:has-text("Safe")')).toBeVisible();
  });

  test('Back to Help link navigates to /help', async ({ page }) => {
    await page.goto('/help/coaching');
    await page.click('text=← Back to Help');
    await expect(page).toHaveURL(/.*\/help/);
  });

  test('gallery link navigates to /gallery', async ({ page }) => {
    await page.goto('/help/coaching');
    await page.click('text=Browse the gallery for APES-aligned drills');
    await expect(page).toHaveURL(/.*\/gallery/);
  });
});
