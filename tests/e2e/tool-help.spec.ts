import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('walkthrough-2026-10-10/screenshots');

test.beforeAll(() => {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
});

for (const [project, label, isPhone] of [
  ['chromium', 'desktop 1440 px', false],
  ['phone', 'phone 390 px', true],
] as const) {
  test.describe(`Tool help text box [${label}]`, () => {
    if (project === 'chromium') {
      test.use({ viewport: { width: 1440, height: 900 } });
    }

    test.beforeEach(({}, testInfo) => {
      test.skip(testInfo.project.name !== project, `runs in the ${project} project`);
    });

    test('shows tool name and description and captures screenshot', async ({ page }) => {
      await page.goto('/practice', { waitUntil: 'load' });
      await expect(page.getByRole('heading', { name: 'Practice editor' })).toBeVisible({ timeout: 60_000 });

      // Default tool is Select
      const selectionRegion = page.getByRole('region', { name: 'Selection' });
      await expect(selectionRegion.getByText('Select:')).toBeVisible();
      await expect(selectionRegion.getByText(/drag a marker to move it/)).toBeVisible();

      // Pick Attacker tool
      const attackerBtn = page.getByRole('button', { name: 'Place attacker' });
      await attackerBtn.click();

      // Verify Attacker name and description appear in the text box below tool icons
      await expect(selectionRegion.getByText('Attacker:')).toBeVisible();
      await expect(selectionRegion.getByText(/tap the pitch to place a player\./)).toBeVisible();

      const filename = isPhone ? 'tool-box-390px.png' : 'tool-box-1440px.png';
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, filename), fullPage: false });
    });
  });
}
