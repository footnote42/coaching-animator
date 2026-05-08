import { test, expect } from '@playwright/test';
import { loginAsTestUser, createTestAnimation } from '../helpers';

test.describe('WF3: Remix & Personalise', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(120_000);

  const SOURCE_TITLE = `WF3 Source ${Date.now()}`;
  const REMIX_TITLE = `WF3 Remix ${Date.now()}`;
  let publicAnimationId: string | null = null;
  const originalTitle = SOURCE_TITLE;

  test.beforeAll(async ({ browser }) => {
    test.setTimeout(120_000);
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await loginAsTestUser(page);
    await page.waitForTimeout(1_500);
    await createTestAnimation(page, SOURCE_TITLE, { visibility: 'public' });
    const resp = await page.request.get('/api/animations?limit=20&sort=created_at&order=desc');
    if (resp.ok()) {
      const data = await resp.json();
      const anim = data.animations?.find((a: { title: string }) => a.title === SOURCE_TITLE);
      publicAnimationId = anim?.id ?? null;
    }
    await ctx.close();
  });

  test.afterAll(async ({ browser }) => {
    test.setTimeout(120_000);
    if (!publicAnimationId) return;
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await loginAsTestUser(page);
    await page.waitForTimeout(1_000);
    await page.request.delete(`/api/animations/${publicAnimationId}`);
    await ctx.close();
  });

  test('WF3-S1: public gallery browsable without account', async ({ page }) => {
    test.info().annotations.push({ type: 'workflow', description: 'WF3:step1' });
    await page.goto('/gallery');
    await page.waitForLoadState('networkidle');
    expect(page.url()).not.toContain('/login');
    await expect(page.getByTestId('animation-card').first()).toBeVisible({ timeout: 15_000 });
  });

  test('WF3-S2: Remix button visible on public animation cards', async ({ page }) => {
    test.info().annotations.push({ type: 'workflow', description: 'WF3:step2' });
    test.skip(!publicAnimationId, 'No public animation available');
    await page.goto('/gallery');
    await page.waitForLoadState('networkidle');
    const card = page.getByTestId('animation-card').first();
    await expect(card).toBeVisible({ timeout: 15_000 });
    await card.hover();
    await expect(card.locator('button[aria-label="Remix"], button:has-text("Remix")')).toBeVisible();
  });

  test('WF3-S3: Remix redirects unauthenticated user to sign-in', async ({ page }) => {
    test.info().annotations.push({ type: 'workflow', description: 'WF3:step3' });
    test.skip(!publicAnimationId, 'No public animation available');
    // Intentionally not logged in
    await page.goto('/gallery');
    await page.waitForLoadState('networkidle');
    const card = page.getByTestId('animation-card').first();
    await card.hover();
    await card.locator('button[aria-label="Remix"], button:has-text("Remix")').click();
    await expect(page).toHaveURL(/\/(login|register)/, { timeout: 10_000 });
  });

  test('WF3-S4: authenticated remix opens editor with original frames', async ({ page }) => {
    test.info().annotations.push({ type: 'workflow', description: 'WF3:step4' });
    test.skip(!publicAnimationId, 'No public animation available');
    await loginAsTestUser(page);
    await page.waitForTimeout(1_500);
    await page.goto('/gallery');
    await page.waitForLoadState('networkidle');
    const card = page.getByTestId('animation-card').filter({ hasText: originalTitle }).first();
    await expect(card).toBeVisible({ timeout: 15_000 });
    await card.hover();
    await card.locator('button[aria-label="Remix"], button:has-text("Remix")').click();
    await expect(page).toHaveURL(/\/app\?load=/, { timeout: 15_000 });
    await expect(page.locator('canvas').first()).toBeVisible();
    await expect(page.getByTestId('frame-counter')).toBeVisible({ timeout: 10_000 });
  });

  test('WF3-S5: save after remix creates new animation in My Playbook', async ({ page }) => {
    test.info().annotations.push({ type: 'workflow', description: 'WF3:step5' });
    test.skip(!publicAnimationId, 'No public animation available');
    await loginAsTestUser(page);
    await page.waitForTimeout(1_500);
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    await page.goto(`${baseUrl}/app?load=${publicAnimationId}`);
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 20_000 });
    const saveBtn = page.getByTestId('save-to-cloud-button').first();
    await expect(saveBtn).toBeEnabled({ timeout: 10_000 });
    await saveBtn.click();
    const modal = page.getByTestId('save-to-cloud-modal');
    await expect(modal).toBeVisible({ timeout: 5_000 });
    await modal.locator('input[placeholder*="title" i]').first().fill(REMIX_TITLE);
    await modal.locator('button[type="submit"]').click();
    await expect(modal).toBeHidden({ timeout: 15_000 });
    await page.goto('/my-gallery');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByTestId('animation-card').filter({ hasText: REMIX_TITLE }).first()
    ).toBeVisible({ timeout: 30_000 });
  });

  test('WF3-S6: original animation unchanged in public gallery', async ({ page }) => {
    test.info().annotations.push({ type: 'workflow', description: 'WF3:step6' });
    test.skip(!publicAnimationId, 'No public animation available');
    await page.goto('/gallery');
    await page.waitForLoadState('networkidle');
    await expect(
      page.getByTestId('animation-card').filter({ hasText: originalTitle }).first()
    ).toBeVisible({ timeout: 15_000 });
  });
});
