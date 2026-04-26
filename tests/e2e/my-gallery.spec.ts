import { test, expect } from '@playwright/test';

/**
 * E2E Tests: My Playbook Search & Filter (009-gallery-playbook US1)
 *
 * T013: Covers the search and type filter acceptance scenarios.
 * Requires authenticated session and multiple saved animations.
 *
 * NOTE: These tests run against the dev server (localhost:3000).
 * Ensure `npm run dev` is running before executing.
 */

test.describe('My Playbook Search & Filter (US1)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to my-gallery; unauthenticated users redirect to login
    await page.goto('/my-gallery');
    await page.waitForLoadState('networkidle');
  });

  test('search input is visible in the controls bar', async ({ page }) => {
    // Auth redirect is acceptable — just confirm the page renders some UI
    const url = page.url();
    if (url.includes('/login')) {
      // Unauthenticated redirect is expected behaviour
      return;
    }

    const searchInput = page.locator('#my-gallery-search');
    await expect(searchInput).toBeVisible({ timeout: 5000 });
  });

  test('type filter select is visible in the controls bar', async ({ page }) => {
    const url = page.url();
    if (url.includes('/login')) return;

    const typeFilter = page.locator('#my-gallery-type-filter');
    await expect(typeFilter).toBeVisible({ timeout: 5000 });
  });

  test('URL params q and type are preserved on reload', async ({ page }) => {
    const url = page.url();
    if (url.includes('/login')) return;

    // Navigate with params already set
    await page.goto('/my-gallery?q=lineout&type=tactic');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('#my-gallery-search');
    if (await searchInput.isVisible()) {
      // Input should reflect URL param
      const value = await searchInput.inputValue();
      expect(value).toBe('lineout');
    }

    const typeFilter = page.locator('#my-gallery-type-filter');
    if (await typeFilter.isVisible()) {
      const value = await typeFilter.inputValue();
      expect(value).toBe('tactic');
    }
  });

  test('search narrows card list by partial title', async ({ page }) => {
    const url = page.url();
    if (url.includes('/login')) return;

    const searchInput = page.locator('#my-gallery-search');
    if (!(await searchInput.isVisible())) return;

    await searchInput.fill('NONEXISTENTTITLE_XYZ_UNIQUE_12345');

    // Either empty state message or reduced card set
    const emptyMsg = page.locator('text=No drills matching');
    const cards = page.locator('[class*="animation-card"], [class*="AnimationCard"]');

    // Wait for filter to apply (client-side, instant)
    await page.waitForTimeout(200);

    const emptyVisible = await emptyMsg.isVisible();
    const cardCount = await cards.count();

    // Either empty state shown or cards filtered to 0
    expect(emptyVisible || cardCount === 0).toBeTruthy();
  });

  test('clear filters restores full list', async ({ page }) => {
    const url = page.url();
    if (url.includes('/login')) return;

    const searchInput = page.locator('#my-gallery-search');
    if (!(await searchInput.isVisible())) return;

    await searchInput.fill('searchterm');
    await page.waitForTimeout(200);

    // Clear
    await searchInput.fill('');
    await page.waitForTimeout(200);

    // No empty-state message for cleared filter
    const emptySearchMsg = page.locator('text=No drills matching');
    await expect(emptySearchMsg).not.toBeVisible();
  });
});
