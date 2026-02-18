import { test, expect } from '@playwright/test';
import { loginAsTestUser, createTestAnimation } from '../helpers';

let testAnimationId: string;

test.describe('Mobile Replay', () => {
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await loginAsTestUser(page);
    testAnimationId = await createTestAnimation(page, {
      title: 'Mobile Test Animation',
    });
    await context.close();
  });

  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('canvas should be responsive at 375px viewport', async ({ page }) => {
    await page.goto(`/replay/${testAnimationId}`);
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('canvas').first();
    const box = await canvas.boundingBox();

    expect(box).not.toBeNull();
    expect(box!.width).toBeLessThanOrEqual(375);
  });

  test('touch targets should be minimum 48x48px', async ({ page }) => {
    await page.goto(`/replay/${testAnimationId}`);
    await page.waitForLoadState('networkidle');

    const playButton = page.locator('[title="Play"]').or(
      page.locator('button').filter({ hasText: 'Play' })
    );
    const box = await playButton.boundingBox();

    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(48);
    expect(box!.height).toBeGreaterThanOrEqual(48);
  });

  test('landscape hint should display in portrait < 600px', async ({ page }) => {
    await page.goto(`/replay/${testAnimationId}`);
    await page.waitForLoadState('networkidle');

    const hint = page.locator('text=Rotate device').or(page.locator('text=landscape'));
    await expect(hint).toBeVisible({ timeout: 5000 });
  });

  test('landscape hint should be dismissible', async ({ page }) => {
    await page.goto(`/replay/${testAnimationId}`);
    await page.waitForLoadState('networkidle');

    const hint = page.locator('text=Rotate device').or(page.locator('text=landscape'));
    await expect(hint).toBeVisible({ timeout: 5000 });

    const dismissButton = hint
      .locator('button[aria-label*="Dismiss"]')
      .or(hint.locator('button:has-text("✕")'));
    await dismissButton.click();

    await expect(hint).not.toBeVisible();
  });
});

test.describe('Editor Mobile Warning', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('editor should show mobile warning < 768px', async ({ page }) => {
    await page.goto('/app');
    await page.waitForLoadState('networkidle');

    const warning = page.locator('text=desktop').or(page.locator('text=mobile'));
    await expect(warning).toBeVisible({ timeout: 5000 });
  });
});
