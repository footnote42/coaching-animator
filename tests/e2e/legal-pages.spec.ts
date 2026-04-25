import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Legal Pages (T023, T028)
 * Verifies Terms of Service and Privacy Policy are accessible and complete
 */

test.describe('Legal Compliance: Legal Pages', () => {
  test('Terms of Service page loads without authentication', async ({ page }) => {
    await page.goto('http://localhost:3000/terms');
    await expect(page).toHaveTitle(/Terms of Service/);
  });

  test('ToS contains all required sections (FR-006 to FR-010)', async ({ page }) => {
    await page.goto('http://localhost:3000/terms');

    // FR-006: Description of Service
    await expect(page.locator('text=cloud-first')).toBeVisible();
    await expect(page.locator('text=tiered access')).toBeVisible();

    // FR-007: Content Licensing (CC-BY-SA)
    await expect(page.locator('text=CC-BY-SA')).toBeVisible();
    await expect(page.locator('text=Creative Commons')).toBeVisible();
    await expect(page.locator('text=public gallery')).toBeVisible();

    // FR-008: Tiered Access Model
    await expect(page.locator('text=Tier 0')).toBeVisible();
    await expect(page.locator('text=Tier 1')).toBeVisible();
    await expect(page.locator('text=50 animations')).toBeVisible();
    await expect(page.locator('text=10 frames')).toBeVisible();

    // FR-009: Remix & Attribution
    await expect(page.locator('text=remix')).toBeVisible();
    await expect(page.locator('text=credit')).toBeVisible();
    await expect(page.locator('text=ShareAlike')).toBeVisible();

    // FR-010: Prohibited Content
    await expect(page.locator('text=Prohibited Content')).toBeVisible();
    await expect(page.locator('text=Advertising')).toBeVisible();
    await expect(page.locator('text=No.*data.*sale')).toBeVisible();
  });

  test('ToS describes content ownership clearly', async ({ page }) => {
    await page.goto('http://localhost:3000/terms');

    // Verify private vs public content distinction
    await expect(page.locator('text=Private.*Tier 0')).toBeVisible();
    await expect(page.locator('text=retain.*ownership')).toBeVisible();
  });

  test('Privacy Policy page loads without authentication', async ({ page }) => {
    await page.goto('http://localhost:3000/privacy');
    await expect(page).toHaveTitle(/Privacy Policy/);
  });

  test('Privacy Policy contains all required sections (FR-011 to FR-016)', async ({ page }) => {
    await page.goto('http://localhost:3000/privacy');

    // FR-012: No Telemetry Statement
    await expect(page.locator('text=telemetry|analytics|tracking')).toBeVisible();
    await expect(page.locator('text=do not collect|no analytics')).toBeVisible();

    // FR-013: Data Residency
    await expect(page.locator('text=Supabase')).toBeVisible();
    await expect(page.locator('text=data.*stored|storage')).toBeVisible();

    // FR-014: Data Collected
    await expect(page.locator('text=email')).toBeVisible();
    await expect(page.locator('text=animation')).toBeVisible();

    // FR-015: Data Deletion
    await expect(page.locator('text=delete.*account|delete.*data')).toBeVisible();
    await expect(page.locator('text=30 days')).toBeVisible();

    // FR-016: Cookie Reference
    await expect(page.locator('text=cookies|Cookie')).toBeVisible();
  });

  test('Privacy Policy has no mention of selling data', async ({ page }) => {
    await page.goto('http://localhost:3000/privacy');

    // Verify Constitution compliance: no data selling
    await expect(page.locator('text=sell.*data|sell.*personal')).not.toBeVisible();
    await expect(page.locator('text=do not sell|not.*sold')).toBeVisible();
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
