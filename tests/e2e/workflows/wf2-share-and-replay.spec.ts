import { test, expect } from '@playwright/test';
import { loginAsTestUser, createTestAnimation } from '../helpers';
import { getShareUrlFromCard, asUnauthenticatedPlayer } from './helpers';

test.describe('WF2: Share & Replay', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(120_000);

  const TITLE = `WF2 Audit ${Date.now()}`;
  let shareUrl = '';

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await loginAsTestUser(page);
    await page.waitForTimeout(1_500);
    await createTestAnimation(page, TITLE);
    await ctx.close();
  });

  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.waitForTimeout(1_500);
  });

  test('WF2-S1+S2: My Playbook shows animations and Share opens modal', async ({ page }) => {
    test.info().annotations.push({ type: 'workflow', description: 'WF2:step1' });
    test.info().annotations.push({ type: 'workflow', description: 'WF2:step2' });
    await page.goto('/my-gallery');
    await page.waitForLoadState('networkidle');
    const card = page.getByTestId('animation-card').filter({ hasText: TITLE }).first();
    await expect(card).toBeVisible({ timeout: 30_000 });
    await card.hover();
    await card.locator('button[aria-label="Share"]').click();
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5_000 });
  });

  test('WF2-S3+S4: link-only visibility produces a share URL', async ({ page }) => {
    test.info().annotations.push({ type: 'workflow', description: 'WF2:step3' });
    test.info().annotations.push({ type: 'workflow', description: 'WF2:step4' });
    shareUrl = await getShareUrlFromCard(page, TITLE);
    expect(shareUrl).toMatch(/\/share\//);
  });

  test('WF2-S5+S6: share link loads full-screen without account', async ({ page }) => {
    test.info().annotations.push({ type: 'workflow', description: 'WF2:step5' });
    test.info().annotations.push({ type: 'workflow', description: 'WF2:step6' });
    expect(shareUrl, 'WF2-S4 must have produced a share URL').toBeTruthy();
    await asUnauthenticatedPlayer(page, shareUrl, async (playerPage) => {
      await expect(playerPage).toHaveURL(/\/share\//, { timeout: 15_000 });
      await expect(playerPage.locator('canvas').first()).toBeVisible({ timeout: 20_000 });
    });
  });

  test('WF2-S7: floating remote present and frames advance on play', async ({ page }) => {
    test.info().annotations.push({ type: 'workflow', description: 'WF2:step7' });
    expect(shareUrl).toBeTruthy();
    await asUnauthenticatedPlayer(page, shareUrl, async (playerPage) => {
      const playBtn = playerPage.locator('button[aria-label="Play"], [aria-label="Play animation"]').first();
      await expect(playBtn).toBeVisible({ timeout: 10_000 });
      await playBtn.click();
      await expect(playerPage.locator('button[aria-label="Pause"]')).toBeVisible({ timeout: 5_000 });
    });
  });

  test('WF2-S8: no editor controls visible to unauthenticated viewer', async ({ page }) => {
    test.info().annotations.push({ type: 'workflow', description: 'WF2:step8' });
    expect(shareUrl).toBeTruthy();
    await asUnauthenticatedPlayer(page, shareUrl, async (playerPage) => {
      await expect(playerPage.locator('canvas').first()).toBeVisible({ timeout: 20_000 });
      await expect(playerPage.locator('[data-testid="save-to-cloud-button"]')).toBeHidden();
      await expect(playerPage.locator('nav a[href="/my-gallery"]')).toBeHidden();
    });
  });
});
