import { Page, expect, BrowserContext } from '@playwright/test';

/**
 * Delete animations whose titles start with any of the given prefixes.
 * Uses the authenticated API request context — no browser UI needed.
 * Safe to call even if there are no matching animations.
 */
export async function deleteTestAnimationsByPrefix(
  page: Page,
  prefixes: string[]
): Promise<void> {
  const resp = await page.request.get('/api/animations?limit=50');
  if (!resp.ok()) return;
  const data = await resp.json();
  const animations: { id: string; title: string }[] = data.animations ?? [];
  const toDelete = animations.filter((a) =>
    prefixes.some((p) => a.title.startsWith(p))
  );
  for (const anim of toDelete) {
    await page.request.delete(`/api/animations/${anim.id}`);
  }
}

export async function findCardInMyPlaybook(page: Page, title: string) {
  await page.goto('/my-gallery');
  await page.waitForLoadState('networkidle');
  const card = page.getByTestId('animation-card').filter({ hasText: title }).first();
  await expect(card).toBeVisible({ timeout: 30_000 });
  await card.hover();
  return card;
}

export async function getShareUrlFromCard(page: Page, title: string): Promise<string> {
  const card = await findCardInMyPlaybook(page, title);
  await expect(card.locator('button[aria-label="Share"]')).toBeVisible();
  await card.locator('button[aria-label="Share"]').click();

  const modal = page.locator('[role="dialog"]');
  await expect(modal).toBeVisible({ timeout: 5_000 });

  const linkOnlyOption = modal.locator(
    'button:has-text("Link Only"), label:has-text("Link Only"), [data-value="link_shared"]'
  );
  if (await linkOnlyOption.count() > 0) {
    await linkOnlyOption.first().click();
    await page.waitForTimeout(1_000);
  }

  const urlInput = modal.locator('input[readonly], input[aria-label*="share" i], input[aria-label*="link" i]');
  await expect(urlInput).toBeVisible({ timeout: 5_000 });
  const shareUrl = await urlInput.inputValue();
  expect(shareUrl).toMatch(/\/share\//);

  const closeBtn = modal.locator('button[aria-label="Close"], button:has-text("Done")');
  if (await closeBtn.count() > 0) await closeBtn.first().click();
  return shareUrl;
}

export async function clickEditFrames(page: Page, title: string): Promise<void> {
  const card = await findCardInMyPlaybook(page, title);
  await expect(card.locator('button[aria-label="Edit Frames"]')).toBeVisible();
  await card.locator('button[aria-label="Edit Frames"]').click();
  await expect(page).toHaveURL(/\/app\?load=.*&mode=edit/, { timeout: 15_000 });
}

export async function clickEditInfo(page: Page, title: string): Promise<void> {
  const card = await findCardInMyPlaybook(page, title);
  const btn = card.locator(
    'button[aria-label="Edit Info"], button[aria-label="Edit Metadata"], button[aria-label="Settings"]'
  );
  await expect(btn).toBeVisible();
  await btn.click();
  await expect(
    page.locator('[data-testid="edit-metadata-modal"], [role="dialog"]').first()
  ).toBeVisible({ timeout: 10_000 });
}

export async function asUnauthenticatedPlayer(
  page: Page,
  shareUrl: string,
  callback: (playerPage: Page) => Promise<void>
): Promise<void> {
  const browser = page.context().browser()!;
  const playerContext: BrowserContext = await browser.newContext();
  const playerPage = await playerContext.newPage();
  try {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const fullUrl = shareUrl.startsWith('http') ? shareUrl : `${baseUrl}${shareUrl}`;
    await playerPage.goto(fullUrl);
    await callback(playerPage);
  } finally {
    await playerContext.close();
  }
}
