import { test, expect } from '@playwright/test';

test.describe('Phase 0 Cleanup', () => {
  test('grid overlay toggle button should not exist', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    // Grid toggle should not exist (removed in Phase 0)
    const gridToggle = page.locator('[data-testid="grid-toggle"]');
    await expect(gridToggle).toHaveCount(0);
  });

  test('sport dropdown should not show Soccer or American Football', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    // Wait for the sport selector to appear (labeled "Field Type")
    const sportSelect = page.locator('#sport-selector');
    await expect(sportSelect).toBeVisible({ timeout: 10000 });

    // Get all option text
    const options = await sportSelect.locator('option').allTextContents();
    const optionText = options.join(' ');

    // Should contain rugby sports
    expect(optionText).toContain('Rugby');
    // Should NOT contain non-rugby sports (removed in Phase 0)
    expect(optionText).not.toContain('Soccer');
    expect(optionText).not.toContain('American Football');
  });

  // Marker-to-cone conversion test requires legacy fixture
  test.skip('marker entities should auto-convert to cones on load', async () => {
    // TODO: Create fixture with legacy "marker" type
    // Load via file upload or API
    // Verify entities are now type "cone"
  });
});
