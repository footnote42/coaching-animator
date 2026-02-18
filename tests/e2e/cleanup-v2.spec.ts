import { test, expect } from '@playwright/test';

test.describe('Phase 0 Cleanup', () => {
  test('grid overlay toggle button should not exist', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    // Grid toggle should not exist (removed in Phase 0)
    const gridToggle = page.locator('[data-testid="grid-toggle"]');
    await expect(gridToggle).toHaveCount(0);
  });

  test('sport dropdown should only show Rugby Union', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    // Locate sport selector section
    const sportSection = page.locator('text=Sport').locator('..');

    // Verify only Rugby Union is shown
    const sportText = await sportSection.textContent();
    expect(sportText).toContain('Rugby Union');
    expect(sportText).not.toContain('Soccer');
    expect(sportText).not.toContain('American Football');
  });

  // Marker-to-cone conversion test requires legacy fixture
  test.skip('marker entities should auto-convert to cones on load', async () => {
    // TODO: Create fixture with legacy "marker" type
    // Load via file upload or API
    // Verify entities are now type "cone"
  });
});
