import { test, expect } from '@playwright/test';
import { loginAsTestUser, createTestAnimation } from './helpers';

test.describe('Profile Page', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await loginAsTestUser(page);
  });

  test('should display profile page with user information', async ({ page }) => {
    await page.goto('http://localhost:3002/profile');

    // Verify profile page loaded
    await expect(page.locator('h1:has-text("Profile Settings")')).toBeVisible();

    // Verify email field exists and is disabled
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toBeDisabled();

    // Verify display name field exists
    const displayNameInput = page.locator('input#displayName');
    await expect(displayNameInput).toBeVisible();
  });

  test('should update display name and persist after refresh', async ({ page }) => {
    await page.goto('http://localhost:3002/profile');

    // Generate unique display name
    const newName = `Test Coach ${Date.now()}`;
    console.log('[Test] Setting display name to:', newName);

    // Clear existing value and enter new display name
    const displayNameInput = page.locator('input#displayName');
    await displayNameInput.clear();
    await displayNameInput.fill(newName);

    // Verify value was set
    await expect(displayNameInput).toHaveValue(newName);

    // Click save button
    await page.click('button:has-text("Save Changes")');

    // Verify success message appears
    await expect(page.locator('text=Profile updated successfully')).toBeVisible({ timeout: 5000 });
    console.log('[Test] Success message appeared');

    // Wait for success message to disappear (auto-hides after 3 seconds)
    await expect(page.locator('text=Profile updated successfully')).toBeHidden({ timeout: 4000 });

    // Reload page to verify persistence
    console.log('[Test] Reloading page to check persistence...');
    await page.reload();

    // Wait for profile page to load
    await expect(page.locator('h1:has-text("Profile Settings")')).toBeVisible();

    // Verify display name persisted
    await expect(displayNameInput).toHaveValue(newName);
    console.log('[Test] Display name persisted successfully');
  });

  test('should display accurate animation count', async ({ page }) => {
    // First, check initial animation count
    await page.goto('http://localhost:3002/profile');

    // Get initial count from usage section
    const usageSection = page.locator('text=/\\d+ \\/ 50/');
    await expect(usageSection).toBeVisible();

    const initialCountText = await usageSection.textContent();
    const initialCount = parseInt(initialCountText?.match(/^(\d+)/)?.[1] ?? '0');
    console.log('[Test] Initial animation count:', initialCount);

    // Create a new animation
    await page.goto('http://localhost:3002/app');

    // Wait for editor to load
    await expect(page.locator('text=Frame 1')).toBeVisible({ timeout: 10000 });

    // Create the animation using helper
    const animationTitle = `Test Animation ${Date.now()}`;
    await createTestAnimation(page, animationTitle);

    // Navigate back to profile
    await page.goto('http://localhost:3002/profile');

    // Verify count incremented
    const newCountText = await usageSection.textContent();
    const newCount = parseInt(newCountText?.match(/^(\d+)/)?.[1] ?? '0');
    console.log('[Test] New animation count:', newCount);

    expect(newCount).toBe(initialCount + 1);
  });

  test('should handle empty display name (anonymous)', async ({ page }) => {
    await page.goto('http://localhost:3002/profile');

    // Clear display name to test anonymous mode
    const displayNameInput = page.locator('input#displayName');
    await displayNameInput.clear();

    // Save
    await page.click('button:has-text("Save Changes")');

    // Verify success
    await expect(page.locator('text=Profile updated successfully')).toBeVisible({ timeout: 5000 });

    // Reload and verify empty state persists
    await page.reload();
    await expect(displayNameInput).toHaveValue('');
  });

  test('should show correct usage percentage bar', async ({ page }) => {
    await page.goto('http://localhost:3002/profile');

    // Get animation count
    const usageText = await page.locator('text=/\\d+ \\/ 50/').textContent();
    const count = parseInt(usageText?.match(/^(\d+)/)?.[1] ?? '0');

    // Check that progress bar exists and has a width
    const progressBar = page.locator('.bg-emerald-600').first();
    await expect(progressBar).toBeVisible();

    // Calculate expected percentage
    const expectedPercentage = Math.min((count / 50) * 100, 100);

    // Get actual width from style attribute
    const style = await progressBar.getAttribute('style');
    const widthMatch = style?.match(/width:\s*(\d+(\.\d+)?)%/);
    const actualWidth = widthMatch ? parseFloat(widthMatch[1]) : 0;

    console.log('[Test] Expected percentage:', expectedPercentage, 'Actual width:', actualWidth);

    // Allow small rounding differences
    expect(Math.abs(actualWidth - expectedPercentage)).toBeLessThan(1);
  });

  test('should show quick links to galleries', async ({ page }) => {
    await page.goto('http://localhost:3002/profile');

    // Verify quick links section exists
    await expect(page.locator('h2:has-text("Quick Links")')).toBeVisible();

    // Verify My Playbook link
    const myPlaybookLink = page.locator('a[href="/my-gallery"]');
    await expect(myPlaybookLink).toBeVisible();
    await expect(myPlaybookLink).toHaveText(/My Playbook/);

    // Verify Public Gallery link
    const galleryLink = page.locator('a[href="/gallery"]');
    await expect(galleryLink).toBeVisible();
    await expect(galleryLink).toHaveText(/Public Gallery/);
  });
});
