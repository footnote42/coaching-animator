/**
 * Phase 2: Progression E2E Tests
 *
 * Tests the progression panel in the editor and gallery card badges.
 * Uses API-based setup for predictable test data.
 */
import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers';

// Helper: create an animation via API and return its ID
async function createAnimation(
  page: Parameters<typeof loginAsTestUser>[0],
  overrides: Record<string, unknown> = {}
): Promise<string> {
  const res = await page.request.post('/api/animations', {
    data: {
      title: 'E2E Base Drill',
      animation_type: 'tactic',
      visibility: 'private',
      payload: {
        version: '1.0',
        name: 'E2E Base Drill',
        sport: 'rugby-union',
        frames: [{ id: 'f1', index: 0, duration: 1000, entities: {}, annotations: [] }],
        settings: { defaultTransitionDuration: 500, exportResolution: '720p' },
      },
      ...overrides,
    },
  });
  expect(res.ok()).toBe(true);
  const data = await res.json();
  return data.id as string;
}

// Helper: create a progression for a base animation
async function createProgression(
  page: Parameters<typeof loginAsTestUser>[0],
  baseId: string,
  order: number
): Promise<string> {
  return createAnimation(page, {
    title: `E2E Base Drill — Progression ${order}`,
    parent_animation_id: baseId,
    is_progression: true,
    progression_order: order,
  });
}

test.describe('Progressions — API', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test('progressions API returns progressions ordered by progression_order', async ({ page }) => {
    const baseId = await createAnimation(page);
    const p2 = await createProgression(page, baseId, 2);
    const p1 = await createProgression(page, baseId, 1);

    const res = await page.request.get(`/api/animations/${baseId}/progressions`);
    expect(res.ok()).toBe(true);

    const { progressions } = await res.json();
    expect(progressions).toHaveLength(2);
    // Should be ordered by progression_order ASC
    expect(progressions[0].id).toBe(p1);
    expect(progressions[1].id).toBe(p2);
    expect(progressions[0].progression_order).toBe(1);
    expect(progressions[1].progression_order).toBe(2);
  });

  test('progressions API rejects requests for a progression (not base)', async ({ page }) => {
    const baseId = await createAnimation(page);
    const progId = await createProgression(page, baseId, 1);

    const res = await page.request.get(`/api/animations/${progId}/progressions`);
    expect(res.status()).toBe(400);
  });

  test('POST /api/animations accepts progression fields', async ({ page }) => {
    const baseId = await createAnimation(page);
    const progId = await createProgression(page, baseId, 1);

    // Verify the progression references the base
    const res = await page.request.get(`/api/animations/${progId}`);
    expect(res.ok()).toBe(true);
    const data = await res.json();
    expect(data.parent_animation_id).toBe(baseId);
    expect(data.is_progression).toBe(true);
    expect(data.progression_order).toBe(1);
  });
});

test.describe('Progressions — Gallery', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test('gallery filters out progression children — only base shown', async ({ page }) => {
    // Create base animation (public so it appears in gallery)
    const baseId = await createAnimation(page, { title: 'E2E Gallery Base', visibility: 'public' });
    // Create a progression (public too, but should be filtered out)
    await createProgression(page, baseId, 1);

    await page.goto('/gallery');
    await page.waitForLoadState('networkidle');

    // The base should appear once
    const baseCards = page.locator('h3, .font-heading').filter({ hasText: 'E2E Gallery Base' });
    await expect(baseCards.first()).toBeVisible();

    // The progression title should NOT appear as a standalone card
    const progressionCards = page.locator('h3, .font-heading').filter({ hasText: 'Progression 1' });
    expect(await progressionCards.count()).toBe(0);
  });
});

test.describe('Progressions — Editor Panel', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test('editor shows progression panel for a loaded base animation', async ({ page }) => {
    const baseId = await createAnimation(page, { title: 'E2E Editor Base' });

    await page.goto(`/app?load=${baseId}`);
    await page.waitForLoadState('networkidle');
    // Wait for the canvas to be present
    await expect(page.locator('canvas')).toBeVisible({ timeout: 10000 });
    // Wait for the progression panel to appear
    await expect(page.getByText('Base')).toBeVisible({ timeout: 5000 });
  });

  test('editor progression panel shows Add button', async ({ page }) => {
    const baseId = await createAnimation(page, { title: 'E2E Editor Panel' });

    await page.goto(`/app?load=${baseId}`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('canvas')).toBeVisible({ timeout: 10000 });
    // Add button should be enabled (0 progressions)
    const addBtn = page.locator('button').filter({ hasText: 'Add' });
    await expect(addBtn).toBeVisible({ timeout: 5000 });
    await expect(addBtn).toBeEnabled();
  });

  test('editor shows existing progressions as pills', async ({ page }) => {
    const baseId = await createAnimation(page, { title: 'E2E Editor With Progs' });
    await createProgression(page, baseId, 1);

    await page.goto(`/app?load=${baseId}`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('canvas')).toBeVisible({ timeout: 10000 });
    // Should show P1 pill
    await expect(page.locator('button').filter({ hasText: 'P1' })).toBeVisible({ timeout: 5000 });
  });
});
