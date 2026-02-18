import { test, expect } from '@playwright/test';
import { loginAsTestUser, createTestAnimation, createTestCollection, addAnimationToCollection } from '../helpers';

test.describe('Collections', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test('should create collection via API', async ({ page }) => {
    const collectionId = await createTestCollection(page, 'E2E Test Collection', false);

    expect(collectionId).toBeTruthy();
    expect(collectionId).toMatch(/^[0-9a-f-]{36}$/); // UUID format
  });

  test('should add animation to collection', async ({ page }) => {
    const collectionId = await createTestCollection(page);
    const animationId = await createTestAnimation(page);

    await addAnimationToCollection(page, collectionId, animationId);

    const response = await page.request.get(`/api/collections/${collectionId}`);
    expect(response.ok()).toBe(true);

    const data = await response.json();
    expect(data.collection.items).toHaveLength(1);
    expect(data.collection.items[0].animation_id).toBe(animationId);
  });

  test('should display collection detail page', async ({ page }) => {
    const collectionId = await createTestCollection(page, 'Test Collection');
    const anim1 = await createTestAnimation(page, { title: 'Animation 1' });
    const anim2 = await createTestAnimation(page, { title: 'Animation 2' });
    await addAnimationToCollection(page, collectionId, anim1);
    await addAnimationToCollection(page, collectionId, anim2);

    await page.goto(`/collections/${collectionId}`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1')).toContainText('Test Collection');

    const cards = page
      .locator('[data-testid="animation-card"]')
      .or(page.locator('article'));
    await expect(cards).toHaveCount(2);
  });

  test('share button should copy collection URL', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-write', 'clipboard-read']);

    const collectionId = await createTestCollection(page);

    await page.goto(`/collections/${collectionId}`);
    await page.waitForLoadState('networkidle');

    const shareButton = page.locator('button:has-text("Share")');
    await shareButton.click();

    const clipboardText = await page.evaluate(() =>
      navigator.clipboard.readText()
    );

    expect(clipboardText).toContain(`/collections/${collectionId}`);
  });

  test('should remove animation from collection', async ({ page }) => {
    const collectionId = await createTestCollection(page);
    const animationId = await createTestAnimation(page);
    await addAnimationToCollection(page, collectionId, animationId);

    const response = await page.request.delete(
      `/api/collections/${collectionId}/animations/${animationId}`
    );
    expect(response.ok()).toBe(true);

    const getResponse = await page.request.get(`/api/collections/${collectionId}`);
    const data = await getResponse.json();
    expect(data.collection.items).toHaveLength(0);
  });
});
