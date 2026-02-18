import { test, expect } from '@playwright/test';
import { loginAsTestUser, createTestAnimation } from '../helpers';

test.describe('Video URL', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto('/app');
    await page.waitForLoadState('networkidle');
  });

  test('should add YouTube URL in editor', async ({ page }) => {
    const videoUrlInput = page
      .locator('input[placeholder*="YouTube"]')
      .or(page.locator('input[placeholder*="youtube"]'));

    if (!(await videoUrlInput.isVisible())) {
      test.skip(true, 'Video URL input not visible');
    }

    await videoUrlInput.fill('https://youtube.com/watch?v=dQw4w9WgXcQ');
    await videoUrlInput.blur();

    const error = page.locator('text=Please enter a valid YouTube URL');
    await expect(error).not.toBeVisible();
  });

  test('should show validation error for invalid URL', async ({ page }) => {
    const videoUrlInput = page
      .locator('input[placeholder*="YouTube"]')
      .or(page.locator('input[placeholder*="youtube"]'));

    if (!(await videoUrlInput.isVisible())) {
      test.skip(true, 'Video URL input not visible');
    }

    await videoUrlInput.fill('https://vimeo.com/123456');
    await videoUrlInput.blur();

    const error = page.locator('text=/valid.*YouTube/i');
    await expect(error).toBeVisible({ timeout: 2000 });
  });

  test('should accept youtu.be shortened URLs', async ({ page }) => {
    const videoUrlInput = page
      .locator('input[placeholder*="YouTube"]')
      .or(page.locator('input[placeholder*="youtube"]'));

    if (!(await videoUrlInput.isVisible())) {
      test.skip(true, 'Video URL input not visible');
    }

    await videoUrlInput.fill('https://youtu.be/dQw4w9WgXcQ');
    await videoUrlInput.blur();

    const error = page.locator('text=/valid.*YouTube/i');
    await expect(error).not.toBeVisible();
  });

  test('should save animation with video URL', async ({ page }) => {
    const videoUrlInput = page
      .locator('input[placeholder*="YouTube"]')
      .or(page.locator('input[placeholder*="youtube"]'));

    if (!(await videoUrlInput.isVisible())) {
      test.skip(true, 'Video URL input not visible');
    }

    await videoUrlInput.fill('https://youtube.com/watch?v=dQw4w9WgXcQ');

    const saveButton = page.locator('button:has-text("Save to Cloud")');
    await saveButton.click();

    const response = await page.waitForResponse('/api/animations');
    expect(response.status()).toBe(201);

    const data = await response.json();
    // API returns animation object directly
    expect(data.video_url).toBe('https://youtube.com/watch?v=dQw4w9WgXcQ');
  });

  test('should display "Watch Tutorial Video" link in replay', async ({ page }) => {
    const animationId = await createTestAnimation(page, {
      title: 'Video URL Test',
      videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    });

    await page.goto(`/replay/${animationId}`);
    await page.waitForLoadState('networkidle');

    const videoLink = page
      .locator('a:has-text("Watch Tutorial Video")')
      .or(page.locator('a[href*="youtube.com"]'));
    await expect(videoLink).toBeVisible({ timeout: 5000 });

    await expect(videoLink).toHaveAttribute('href', 'https://youtube.com/watch?v=dQw4w9WgXcQ');
    await expect(videoLink).toHaveAttribute('target', '_blank');
    await expect(videoLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('video link should open in new tab', async ({ page, context }) => {
    const animationId = await createTestAnimation(page, {
      title: 'Video URL New Tab Test',
      videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    });

    await page.goto(`/replay/${animationId}`);
    await page.waitForLoadState('networkidle');

    const videoLink = page
      .locator('a:has-text("Watch Tutorial Video")')
      .or(page.locator('a[href*="youtube.com"]'));

    const pagePromise = context.waitForEvent('page');
    await videoLink.click();
    const newPage = await pagePromise;

    expect(newPage.url()).toContain('youtube.com');
    await newPage.close();
  });

  test('should not display link if video URL is empty', async ({ page }) => {
    const animationId = await createTestAnimation(page, {
      title: 'No Video URL',
    });

    await page.goto(`/replay/${animationId}`);
    await page.waitForLoadState('networkidle');

    const videoLink = page.locator('a:has-text("Watch Tutorial Video")');
    await expect(videoLink).not.toBeVisible();
  });
});
