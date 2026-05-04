import { test, expect } from '@playwright/test';
import { loginAsTestUser, createTestAnimation } from './helpers';

test.describe('Direct Frame Editing', () => {
  test.setTimeout(120000);
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    // Give it a moment to stabilize after login redirect
    await page.waitForTimeout(3000);
  });

  test('User can open own animation for editing from My Playbook', async ({ page }) => {
    const title = `E2E Edit Test ${Date.now()}`;
    await createTestAnimation(page, title);
    await page.waitForTimeout(2000);

    // Go to My Playbook via nav link
    await page.locator('nav').getByText('My Playbook').click();
    await page.waitForURL('**/my-gallery', { waitUntil: 'networkidle' });
 
    // Find the animation card
    const card = page.getByTestId('animation-card').filter({ hasText: title }).first();
    await expect(card).toBeVisible({ timeout: 30000 });

    // Hover to reveal actions
    await card.hover();

    // Click "Edit Frames" (Pencil icon)
    const editFramesBtn = card.locator('button[aria-label="Edit Frames"]');
    await expect(editFramesBtn).toBeVisible();
    await editFramesBtn.click();

    // Verify redirect to editor with load and mode params
    await expect(page).toHaveURL(/\/app\?load=.*&mode=edit/);

    // Verify editor is loading frames
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();
    await expect(page.getByTestId('frame-counter')).toHaveText('1/1');

    // 5. Add a new frame to modify the animation
    const addFrameBtn = page.getByLabel("Add new frame");
    await expect(addFrameBtn).toBeVisible();
    await addFrameBtn.click();
    // Wait for the counter to update to 2 frames
    await expect(page.getByTestId('frame-counter')).toHaveText(/.*\/2/);

    // 6. Open Save to Cloud again
    const saveBtn = page.getByTestId('save-to-cloud-button').first();
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // 7. Verify overwrite logic (modal should show "Save as new copy" or similar if we wanted, but we just click Save)
    const modal = page.getByTestId('save-to-cloud-modal');
    await expect(modal).toBeVisible();
    
    // In edit mode, clicking save should overwrite
    const submitBtn = modal.locator('button[type="submit"]');
    await submitBtn.click();

    // Wait for modal to hide (success)
    await expect(modal).toBeHidden({ timeout: 15000 });
  });
});
