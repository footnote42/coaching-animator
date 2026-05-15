import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './helpers';

test.describe('Feature 021: Unified Editor Controls (TimelinePanel)', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(60000);
    
    // Set up standard environment
    await page.addInitScript(() => {
      localStorage.setItem('firstRunSeen', '1');
      localStorage.setItem('has_seen_tutorial', 'true');
      localStorage.setItem('sidebarCollapsed', 'false');
    });
    
    await page.goto('/app');
    await loginAsTestUser(page);
    
    if (!page.url().endsWith('/app')) {
      await page.goto('/app');
    }
    
    await page.waitForSelector('main', { timeout: 30000 });

    // Handle recovery modal if it appears
    const recoveryModal = page.locator('text=Recover Auto-Saved Project');
    try {
      if (await recoveryModal.isVisible({ timeout: 5000 })) {
        await page.click('button:has-text("Start Fresh")');
      }
    } catch (e) {
      // ignore
    }
  });

  test.describe('US1 — Desktop TimelinePanel', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1366, height: 768 });
    });

    test('TimelinePanel is visible on the right side', async ({ page }) => {
      const panel = page.getByTestId('timeline-panel');
      await expect(panel).toBeVisible();
      
      // Verify it's on the right (bounding box check)
      const panelBox = await panel.boundingBox();
      const viewportWidth = 1366;
      expect(panelBox?.x).toBeGreaterThan(viewportWidth / 2);
    });

    test('Add Frame via TimelinePanel increments frame count', async ({ page }) => {
      // Find Add Frame button inside panel
      const panel = page.getByTestId('timeline-panel');
      const addFrameBtn = panel.locator('button[aria-label="Add Frame"]');
      
      // Initial frames (assume 1)
      const frameItems = panel.locator('[data-testid^="frame-item-"]');
      const initialCount = await frameItems.count();
      
      await addFrameBtn.click();
      
      // Check count
      await expect(frameItems).toHaveCount(initialCount + 1);
    });

    test('Delete Frame button disabled state logic', async ({ page }) => {
      const panel = page.getByTestId('timeline-panel');
      const deleteFrameBtn = panel.locator('button[aria-label="Delete Frame"]');
      
      // Initially 1 frame, should be disabled
      await expect(deleteFrameBtn).toBeDisabled();
      
      // Add a frame
      await panel.locator('button[aria-label="Add Frame"]').click();
      
      // Now should be enabled
      await expect(deleteFrameBtn).toBeEnabled();
      
      // Delete it
      await deleteFrameBtn.click();
      
      // Should be disabled again
      await expect(deleteFrameBtn).toBeDisabled();
    });

    test('Speed and Loop controls are interactive', async ({ page }) => {
      const panel = page.getByTestId('timeline-panel');
      
      // Speed toggle
      const speedBtn = panel.locator('button[aria-label="Speed 2x"]');
      await speedBtn.click();
      // Check if it's active (usually via class or data attribute)
      // For now, just click verification
      
      // Loop toggle
      const loopBtn = panel.locator('button[aria-label="Toggle Loop"]');
      await loopBtn.click();
      await expect(loopBtn).toHaveAttribute('aria-pressed', 'true');
    });
  });

  test.describe('US1 — Mobile Timeline Section', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
    });

    test('TimelinePanel is hidden at 375px', async ({ page }) => {
      const panel = page.getByTestId('timeline-panel');
      await expect(panel).toBeHidden();
    });

    test('MobileDrawer contains Timeline section with controls', async ({ page }) => {
      const drawerHandle = page.locator('button[aria-label="Open mobile drawer"]');
      await drawerHandle.click();
      
      const timelineSection = page.locator('text=Timeline');
      await expect(timelineSection).toBeVisible();
      
      // Check for a control inside the drawer
      await expect(page.locator('button[aria-label="Play animation"]')).toBeVisible();
    });
  });

  test.describe('US3 — Focus Mode and Routes', () => {
    test('Focus mode hides TimelinePanel', async ({ page }) => {
      await page.setViewportSize({ width: 1366, height: 768 });
      const focusBtn = page.locator('button[aria-label="Enter focus mode"]');
      await focusBtn.click();
      
      const panel = page.getByTestId('timeline-panel');
      await expect(panel).toBeHidden();
    });

    test('/replay route loads without console errors', async ({ page }) => {
      // Navigate to gallery first to find an animation to replay
      await page.goto('/gallery');
      const firstAnimation = page.locator('a[href^="/replay/"]').first();
      
      if (await firstAnimation.isVisible()) {
        const href = await firstAnimation.getAttribute('href');
        if (href) {
          const logs: string[] = [];
          page.on('console', msg => {
            if (msg.type() === 'error') logs.push(msg.text());
          });
          
          await page.goto(href);
          await page.waitForLoadState('networkidle');
          
          expect(logs).toHaveLength(0);
        }
      }
    });
    
    test('/share route loads without console errors', async ({ page }) => {
      // Navigate to gallery first to find an animation to share/view
      await page.goto('/gallery');
      const firstAnimation = page.locator('a[href^="/replay/"]').first();
      
      if (await firstAnimation.isVisible()) {
        const href = await firstAnimation.getAttribute('href');
        if (href) {
          const shareHref = href.replace('/replay/', '/share/');
          const logs: string[] = [];
          page.on('console', msg => {
            if (msg.type() === 'error') logs.push(msg.text());
          });
          
          await page.goto(shareHref);
          await page.waitForLoadState('networkidle');
          
          expect(logs).toHaveLength(0);
        }
      }
    });
  });
});
