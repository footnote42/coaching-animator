import { Page } from '@playwright/test';

/**
 * Login as test user
 * Requires TEST_USER_EMAIL and TEST_USER_PASSWORD env vars,
 * or falls back to default test account credentials.
 */
export async function loginAsTestUser(page: Page): Promise<void> {
  const email = process.env.TEST_USER_EMAIL || 'user@test.com';
  const password = process.env.TEST_USER_PASSWORD || 'Password1!';

  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]:has-text("Sign In")');

  // Wait for redirect to app or profile page
  await page.waitForURL(/\/(app|my-gallery|profile)/, { timeout: 10000 });
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    const authElement = page.locator('[data-testid="user-menu"]');
    return await authElement.isVisible({ timeout: 1000 });
  } catch {
    return false;
  }
}
