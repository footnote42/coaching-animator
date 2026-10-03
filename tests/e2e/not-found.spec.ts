import { test, expect } from '@playwright/test';

/**
 * Missing pages answer HTTP 404, not a 200 page that says "not found" (#68).
 * A root loading.tsx would stream the shell first and force 200, so none must exist.
 */
const MISSING = [
  '/p/00000000-0000-0000-0000-000000000000',
  '/p/not-a-uuid',
  '/no-such-page',
];

test.describe('Missing pages return 404', () => {
  for (const path of MISSING) {
    test(`${path} responds 404 with the not-found page`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(404);
      await expect(page).toHaveTitle(/not found/i);
    });
  }
});
