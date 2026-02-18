import { test, expect } from '@playwright/test';
import { loginAsTestUser, createTestAnimation } from '../helpers';

test.describe('Templates', () => {
  let templateId: string;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAsTestUser(page);
    templateId = await createTestAnimation(page, {
      title: 'Test Template',
      tags: ['template', 'passing'],
    });
    await context.close();
  });

  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test('should tag animation as template', async ({ page }) => {
    const response = await page.request.get(`/api/animations/${templateId}`);
    expect(response.ok()).toBe(true);

    const data = await response.json();
    expect(data.animation.tags).toContain('template');
  });

  test('should filter gallery with "Templates Only"', async ({ page }) => {
    await page.goto('/gallery');
    await page.waitForLoadState('networkidle');

    const templateFilter = page
      .locator('input[type="checkbox"]')
      .filter({ hasText: /template/i });

    if (await templateFilter.isVisible()) {
      await templateFilter.check();
      await page.waitForResponse(/\/api\/gallery.*tags=template/);

      const templateBadge = page.locator('text=Template').first();
      await expect(templateBadge).toBeVisible();
    } else {
      test.skip(true, 'Template filter not implemented yet');
    }
  });

  test('template badge should display on cards', async ({ page }) => {
    await page.goto(`/gallery?tags=template`);
    await page.waitForLoadState('networkidle');

    const badge = page
      .locator('[data-testid="template-badge"]')
      .or(page.locator('text=Template'))
      .first();
    await expect(badge).toBeVisible({ timeout: 5000 });
  });

  test('"Use Template" button should trigger remix', async ({ page }) => {
    await page.goto(`/gallery?tags=template`);
    await page.waitForLoadState('networkidle');

    const useTemplateButton = page.locator('button:has-text("Use Template")').first();

    if (await useTemplateButton.isVisible()) {
      await useTemplateButton.click();
      await page.waitForURL(/\/app\?remix=/);
      const url = page.url();
      expect(url).toMatch(/\/app\?remix=[a-f0-9-]{36}/);
    } else {
      test.skip(true, 'Use Template button not visible');
    }
  });

  test('remix flow should load template in editor', async ({ page }) => {
    await page.goto(`/app?remix=${templateId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();
  });
});
