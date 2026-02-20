/**
 * Phase 2: Remix Genealogy E2E Tests
 *
 * Tests that remix_from_id is stored correctly and remix attribution
 * appears in gallery cards.
 */
import { test, expect } from '@playwright/test';
import { loginAsTestUser } from '../helpers';

test.describe('Remix Genealogy — API', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test('remixing an animation stores remixed_from_id pointing to original', async ({ page }) => {
    // Create a public animation to remix
    const originalRes = await page.request.post('/api/animations', {
      data: {
        title: 'E2E Original for Remix',
        animation_type: 'tactic',
        visibility: 'public',
        payload: {
          version: '1.0',
          name: 'E2E Original for Remix',
          sport: 'rugby-union',
          frames: [{ id: 'f1', index: 0, duration: 1000, entities: {}, annotations: [] }],
          settings: { defaultTransitionDuration: 500, exportResolution: '720p' },
        },
      },
    });
    expect(originalRes.ok()).toBe(true);
    const original = await originalRes.json();
    const originalId = original.id as string;

    // Remix the animation
    const remixRes = await page.request.post(`/api/animations/${originalId}/remix`);
    expect(remixRes.ok()).toBe(true);
    const remix = await remixRes.json();
    const remixId = remix.id as string;

    // Verify remixed_from_id is set on the new animation
    const detailRes = await page.request.get(`/api/animations/${remixId}`);
    expect(detailRes.ok()).toBe(true);
    const detail = await detailRes.json();
    expect(detail.remixed_from_id).toBe(originalId);
  });

  test('remix title includes (Remix) suffix', async ({ page }) => {
    const originalRes = await page.request.post('/api/animations', {
      data: {
        title: 'E2E Suffix Test',
        animation_type: 'tactic',
        visibility: 'public',
        payload: {
          version: '1.0',
          name: 'E2E Suffix Test',
          sport: 'rugby-union',
          frames: [{ id: 'f1', index: 0, duration: 1000, entities: {}, annotations: [] }],
          settings: { defaultTransitionDuration: 500, exportResolution: '720p' },
        },
      },
    });
    expect(originalRes.ok()).toBe(true);
    const original = await originalRes.json();

    const remixRes = await page.request.post(`/api/animations/${original.id}/remix`);
    expect(remixRes.ok()).toBe(true);
    const remix = await remixRes.json();

    expect(remix.title).toContain('(Remix)');
    expect(remix.title).toContain('E2E Suffix Test');
  });

  test('remix starts as private', async ({ page }) => {
    const originalRes = await page.request.post('/api/animations', {
      data: {
        title: 'E2E Visibility Test',
        animation_type: 'tactic',
        visibility: 'public',
        payload: {
          version: '1.0',
          name: 'E2E Visibility Test',
          sport: 'rugby-union',
          frames: [{ id: 'f1', index: 0, duration: 1000, entities: {}, annotations: [] }],
          settings: { defaultTransitionDuration: 500, exportResolution: '720p' },
        },
      },
    });
    const original = await originalRes.json();

    const remixRes = await page.request.post(`/api/animations/${original.id}/remix`);
    const remix = await remixRes.json();

    const detailRes = await page.request.get(`/api/animations/${remix.id}`);
    const detail = await detailRes.json();
    expect(detail.visibility).toBe('private');
  });
});

test.describe('Remix Genealogy — Gallery', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test('gallery shows remix attribution after making a remix public', async ({ page }) => {
    // Create original public animation
    const originalRes = await page.request.post('/api/animations', {
      data: {
        title: 'E2E Remix Attribution Source',
        animation_type: 'tactic',
        visibility: 'public',
        payload: {
          version: '1.0',
          name: 'E2E Remix Attribution Source',
          sport: 'rugby-union',
          frames: [{ id: 'f1', index: 0, duration: 1000, entities: {}, annotations: [] }],
          settings: { defaultTransitionDuration: 500, exportResolution: '720p' },
        },
      },
    });
    const original = await originalRes.json();

    // Create remix
    const remixRes = await page.request.post(`/api/animations/${original.id}/remix`);
    const remixData = await remixRes.json();

    // Make remix public so it appears in gallery
    await page.request.put(`/api/animations/${remixData.id}`, {
      data: { visibility: 'public' },
    });

    await page.goto('/gallery');
    await page.waitForLoadState('networkidle');

    // Find the remix card — it should show "Remixed from ..."
    const remixAttribution = page.getByText(/Remixed from/i);
    await expect(remixAttribution).toBeVisible({ timeout: 5000 });
  });
});
