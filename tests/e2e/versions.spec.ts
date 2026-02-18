import { test, expect } from '@playwright/test';
import { loginAsTestUser, createTestAnimation } from '../helpers';

test.describe('Version History', () => {
  let animationId: string;

  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    animationId = await createTestAnimation(page, { title: 'Version Test' });
  });

  test('first save should create v1.0', async ({ page }) => {
    const response = await page.request.get(`/api/animations/${animationId}/versions`);
    expect(response.ok()).toBe(true);

    const data = await response.json();
    expect(data.versions).toHaveLength(1);
    expect(data.versions[0].version_number).toBe('1.0');
  });

  test('edit should create v1.1 (minor version)', async ({ page }) => {
    const updateResponse = await page.request.put(`/api/animations/${animationId}`, {
      data: {
        title: 'Version Test - Updated',
        is_major_version: false,
      },
    });
    expect(updateResponse.ok()).toBe(true);

    const versionsResponse = await page.request.get(`/api/animations/${animationId}/versions`);
    const data = await versionsResponse.json();

    expect(data.versions).toHaveLength(2);
    expect(data.versions[0].version_number).toBe('1.1'); // Newest first
    expect(data.versions[1].version_number).toBe('1.0');
  });

  test('should open version history modal', async ({ page }) => {
    await page.request.put(`/api/animations/${animationId}`, {
      data: { title: 'V1.1' },
    });

    await page.goto('/my-gallery');
    await page.waitForLoadState('networkidle');

    const historyIcon = page
      .locator('[data-testid="version-history-icon"]')
      .or(page.locator('button[title*="History"]'))
      .first();
    await historyIcon.click();

    const modal = page
      .locator('[role="dialog"]')
      .or(page.locator('[data-testid="version-history-modal"]'));
    await expect(modal).toBeVisible();

    const versionItems = modal
      .locator('text=1.1')
      .or(modal.locator('[data-testid="version-item"]'));
    await expect(versionItems.first()).toBeVisible();
  });

  test('restore v1.0 should create v2.0', async ({ page }) => {
    await page.request.put(`/api/animations/${animationId}`, {
      data: { title: 'V1.1' },
    });

    const versionsResponse = await page.request.get(`/api/animations/${animationId}/versions`);
    const versions = await versionsResponse.json();
    const v1_0 = versions.versions.find((v: { version_number: string }) => v.version_number === '1.0');
    expect(v1_0).toBeTruthy();

    const restoreResponse = await page.request.post(
      `/api/animations/${animationId}/versions/${v1_0.id}/restore`
    );
    expect(restoreResponse.ok()).toBe(true);

    const newVersionsResponse = await page.request.get(`/api/animations/${animationId}/versions`);
    const newVersions = await newVersionsResponse.json();

    expect(newVersions.versions[0].version_number).toBe('2.0');
    expect(newVersions.versions[0].is_major).toBe(true);
  });
});
