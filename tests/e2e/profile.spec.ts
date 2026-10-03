import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers';

test.describe('Profile Page (Coach Identity)', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    await loginAsTestUser(page);
  });

  test('authenticated user lands on /profile, identity card visible', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Coach name or prompt should be the dominant heading
    const headerH1 = page.locator('header h1');
    await expect(headerH1).toBeVisible({ timeout: 10000 });
    
    // "Profile Settings" should NOT be the main heading anymore
    const profileSettingsTitle = page.locator('h1:has-text("Profile Settings")');
    await expect(profileSettingsTitle).toBeHidden();

    // Avatar circle should be visible
    const avatarCircle = page.locator('header .rounded-full.bg-pitch-green');
    await expect(avatarCircle).toBeVisible({ timeout: 10000 });

    // Account Settings section should be visible
    await expect(page.locator('h2:has-text("Account Settings")')).toBeVisible({ timeout: 10000 });
  });

  test('edit display name and save, card heading updates', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    const newName = `Coach ${Date.now()}`;
    const displayNameInput = page.locator('input#displayName');
    await displayNameInput.fill(newName);
    
    await page.click('button:has-text("Save Changes")');
    
    // Wait for success message
    const successMsg = page.locator('text=Profile updated successfully');
    await expect(successMsg).toBeVisible({ timeout: 10000 });

    // Heading in header should update (retry logic in expect)
    await expect(page.locator('header h1')).toHaveText(newName.toUpperCase(), { timeout: 10000 });
    
    // Refresh to verify persistence
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('header h1')).toHaveText(newName.toUpperCase(), { timeout: 15000 });
  });

  test('clear display name, prompt shown', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    const displayNameInput = page.locator('input#displayName');
    await displayNameInput.clear();
    
    await page.click('button:has-text("Save Changes")');
    await expect(page.locator('text=Profile updated successfully')).toBeVisible({ timeout: 10000 });

    // Prompt "Add your name" should be shown in header h1
    // Using regex to handle the span inside h1
    await expect(page.locator('header h1')).toHaveText(/ADD YOUR NAME/i, { timeout: 10000 });
  });

  test('mobile layout — no overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Header items should be stacked
    await expect(page.locator('header .flex-col').first()).toBeVisible();

    // Check for horizontal overflow
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(overflow).toBe(false);
  });

  test('quick links visible', async ({ page }) => {
    await page.goto('/profile');
    
    // Scroll to bottom to ensure visibility
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    const quickLinksHeader = page.locator('text=Quick Links');
    await expect(quickLinksHeader).toBeVisible({ timeout: 10000 });
    
    await expect(page.locator('a[href="/my-practices"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('a[href="/gallery"]')).toBeVisible({ timeout: 10000 });
  });
});
