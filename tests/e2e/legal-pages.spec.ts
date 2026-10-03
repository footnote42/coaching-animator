import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Legal Pages (T023, T028)
 * Verifies Terms of Service and Privacy Policy are accessible and complete
 */

test.describe('Legal Compliance: Legal Pages', () => {
  test('Terms of Service page loads without authentication', async ({ page }) => {
    await page.goto('http://localhost:3000/terms');
    await expect(page).toHaveTitle(/Terms of Service/i);
  });

  test('ToS contains all required sections', async ({ page }) => {
    await page.goto('http://localhost:3000/terms');
    const h = (name: RegExp) => page.getByRole('heading', { name });

    await expect(h(/Description of Service/)).toBeVisible();
    await expect(page.getByText('Tiered Access Model')).toBeVisible();
    await expect(page.getByText(/CC-BY-SA 4\.0/).first()).toBeVisible();
    await expect(page.getByText(/Creative Commons/).first()).toBeVisible();
    await expect(page.getByText(/Tier 0/).first()).toBeVisible();
    await expect(page.getByText(/Tier 1/).first()).toBeVisible();
    await expect(page.getByText(/50 animations/).first()).toBeVisible();
    await expect(page.getByText(/10 frames/).first()).toBeVisible();
    await expect(h(/Remixed Animations/)).toBeVisible();
    await expect(page.getByText(/ShareAlike/).first()).toBeVisible();
    await expect(h(/Prohibited Content/)).toBeVisible();
  });

  test('ToS states 18+ accounts, no player details, Gallery permission', async ({ page }) => {
    await page.goto('http://localhost:3000/terms');

    await expect(page.getByText(/You must be 18 or over to create an account/)).toBeVisible();
    await expect(page.getByText(/at least 13 years old/)).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'No names or identifying details of players' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Publishing to the Gallery' })).toBeVisible();
    await expect(page.getByText(/you give everyone permission to view it/)).toBeVisible();
  });

  test('ToS explains how to report content and complain', async ({ page }) => {
    await page.goto('http://localhost:3000/terms');

    await expect(page.getByRole('heading', { name: /Reporting Content & Complaints/ })).toBeVisible();
    await expect(page.getByText(/Report button/)).toBeVisible();
    await expect(page.getByText(/safeguarding/).first()).toBeVisible();
    await expect(page.getByText(/We aim to reply within 14 days/)).toBeVisible();
    await expect(page.getByRole('link', { name: 'contact form' })).toHaveAttribute('href', '/contact');
  });

  test('ToS describes content ownership clearly', async ({ page }) => {
    await page.goto('http://localhost:3000/terms');

    await expect(page.getByRole('heading', { name: 'Private Animations' })).toBeVisible();
    await expect(page.getByText(/You retain full ownership/)).toBeVisible();
  });

  test('Privacy Policy page loads without authentication', async ({ page }) => {
    await page.goto('http://localhost:3000/privacy');
    await expect(page).toHaveTitle(/Privacy Policy/i);
  });

  test('Privacy Policy contains all required sections', async ({ page }) => {
    await page.goto('http://localhost:3000/privacy');

    await expect(page.getByRole('heading', { name: /No Telemetry, Analytics, or Tracking/ })).toBeVisible();
    await expect(page.getByText(/We do not collect telemetry data/)).toBeVisible();
    await expect(page.getByText(/Supabase/).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /Data Storage/ })).toBeVisible();
    await expect(page.getByText(/Email address/).first()).toBeVisible();
    await expect(page.getByText(/within 30 days/).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /Cookies & Browser Storage/ })).toBeVisible();
  });

  test('Privacy Policy says accounts are 18+', async ({ page }) => {
    await page.goto('http://localhost:3000/privacy');

    await expect(page.getByText(/Accounts are for people aged 18 or over/)).toBeVisible();
    await expect(page.getByText(/under 13/)).toHaveCount(0);
  });

  test('Privacy Policy has no mention of selling data', async ({ page }) => {
    await page.goto('http://localhost:3000/privacy');

    await expect(page.getByText(/We do not sell, rent, or trade your personal data/)).toBeVisible();
  });

  test('Terms and Privacy pages show one site footer linking to both', async ({ page }) => {
    for (const route of ['/terms', '/privacy', '/']) {
      await page.goto(`http://localhost:3000${route}`);
      await expect(page.locator('footer')).toHaveCount(1);
      await expect(page.locator('footer').getByRole('link', { name: 'Terms' })).toHaveAttribute('href', '/terms');
      await expect(page.locator('footer').getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy');
    }
  });

  test('Contact page loads without authentication', async ({ page }) => {
    await page.goto('http://localhost:3000/contact');
    await expect(page).toHaveTitle(/Contact/);
  });

  test('legal pages are responsive on mobile', async ({ page }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const routes = ['/terms', '/privacy', '/contact'];

    for (const route of routes) {
      await page.goto(`http://localhost:3000${route}`);

      // Verify page renders without horizontal scroll
      const viewport = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));

      expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.clientWidth);
    }
  });
});
