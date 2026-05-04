import { test, expect } from '@playwright/test';
import { loginAsTestUser, createTestAnimation } from '../helpers';
import { getShareUrlFromCard, clickEditFrames, clickEditInfo, asUnauthenticatedPlayer } from './helpers';

test.describe('WF1: Core Coaching Loop', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(120_000);

  const TITLE = `WF1 Audit ${Date.now()}`;
  const UPDATED_TITLE = `${TITLE} (edited)`;
  let shareUrl = '';

  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.waitForTimeout(1_500);
  });

  test('WF1-S1+S2: canvas and editor toolbar are accessible', async ({ page }) => {
    test.info().annotations.push({ type: 'workflow', description: 'WF1:step1' });
    test.info().annotations.push({ type: 'workflow', description: 'WF1:step2' });
    await page.goto('/app');
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 20_000 });
    await expect(
      page.locator('button[aria-label*="attack" i], button[aria-label*="player" i]').first()
    ).toBeVisible();
  });

  test('WF1-S3: second frame can be added via frame strip', async ({ page }) => {
    test.info().annotations.push({ type: 'workflow', description: 'WF1:step3' });
    await page.goto('/app');
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 20_000 });
    await page.getByLabel('Add new frame').click();
    await expect(page.getByTestId('frame-counter')).toHaveText(/.*\/2/, { timeout: 5_000 });
  });

  test('WF1-S4: Save to Cloud persists animation with metadata', async ({ page }) => {
    test.info().annotations.push({ type: 'workflow', description: 'WF1:step4' });
    await createTestAnimation(page, TITLE);
    await page.goto('/my-gallery');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByTestId('animation-card').filter({ hasText: TITLE }).first()
    ).toBeVisible({ timeout: 30_000 });
  });

  test('WF1-S5: Edit metadata updates card title', async ({ page }) => {
    test.info().annotations.push({ type: 'workflow', description: 'WF1:step5' });
    await clickEditInfo(page, TITLE);
    const modal = page.locator('[role="dialog"]');
    const titleInput = modal.locator('input[placeholder*="title" i]').first();
    await expect(titleInput).toBeVisible();
    await titleInput.fill(UPDATED_TITLE);
    await modal.locator('button[type="submit"]').click();
    await expect(modal).toBeHidden({ timeout: 10_000 });
    await page.goto('/my-gallery');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByTestId('animation-card').filter({ hasText: UPDATED_TITLE }).first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test('WF1-S6: Edit Frames opens editor, Overwrite Original persists changes', async ({ page }) => {
    test.info().annotations.push({ type: 'workflow', description: 'WF1:step6' });
    await clickEditFrames(page, UPDATED_TITLE);
    await expect(page.locator('canvas').first()).toBeVisible();
    await expect(page.getByTestId('frame-counter')).toHaveText('1/1');
    await page.getByLabel('Add new frame').click();
    await expect(page.getByTestId('frame-counter')).toHaveText(/.*\/2/, { timeout: 5_000 });
    await page.getByTestId('save-to-cloud-button').first().click();
    const modal = page.getByTestId('save-to-cloud-modal');
    await expect(modal).toBeVisible();
    await expect(modal.locator('button:has-text("Overwrite"), button:has-text("Overwrite Original")')).toBeVisible();
    await expect(modal.locator('button:has-text("Save as New"), button:has-text("New Copy")')).toBeVisible();
    await expect(modal.locator('text=/share link/i, text=/existing share/i').first()).toBeVisible();
    await modal.locator('button:has-text("Overwrite"), button:has-text("Overwrite Original")').click();
    await expect(modal).toBeHidden({ timeout: 20_000 });
  });

  test('WF1-S7: Share generates a link-only URL', async ({ page }) => {
    test.info().annotations.push({ type: 'workflow', description: 'WF1:step7' });
    shareUrl = await getShareUrlFromCard(page, UPDATED_TITLE);
    expect(shareUrl).toMatch(/\/share\//);
  });

  test('WF1-S8: share link plays back for unauthenticated user', async ({ page }) => {
    test.info().annotations.push({ type: 'workflow', description: 'WF1:step8' });
    expect(shareUrl, 'WF1-S7 must have captured a share URL').toBeTruthy();
    await asUnauthenticatedPlayer(page, shareUrl, async (playerPage) => {
      await expect(playerPage.locator('canvas').first()).toBeVisible({ timeout: 20_000 });
      await expect(
        playerPage.locator('button[aria-label="Play"], [aria-label="Play animation"]').first()
      ).toBeVisible({ timeout: 10_000 });
      await expect(
        playerPage.locator('[data-testid="save-to-cloud-button"]')
      ).toBeHidden();
    });
  });
});
