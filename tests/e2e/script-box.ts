import { expect, type Page } from '@playwright/test'

/**
 * Open the editor's script box: unfold "Advanced: Practice Script" (collapsed by default, #202),
 * then open its details. A click before hydration is lost, so retry until the box shows.
 */
export async function openScriptBox(page: Page) {
  const fold = page.locator('main h2 button[aria-controls]').filter({ hasText: /^Advanced: Practice Script/ }).first()
  const details = page.locator('details', { has: page.locator('#practice-script') })
  await expect(async () => {
    if ((await fold.isVisible()) && (await fold.getAttribute('aria-expanded')) === 'false') await fold.click()
    await expect(details.locator('summary')).toBeVisible({ timeout: 1000 })
  }).toPass({ timeout: 20_000 })
  if (!(await details.evaluate((d) => (d as HTMLDetailsElement).open))) await details.locator('summary').click()
}
