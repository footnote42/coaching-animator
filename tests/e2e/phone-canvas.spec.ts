import { test, expect, type Page } from '@playwright/test'
import fs from 'fs'
import path from 'path'

/**
 * The Konva canvas must fit inside its box and leave the playback row tappable (#172).
 * Guest mode, no account. Phone checks run in the `phone` project (iPhone 13, WebKit),
 * the desktop check in `chromium` (1440x900).
 */

const EXAMPLES = path.resolve('skill/coaching-animator/examples')
const example = (file: string) => JSON.parse(fs.readFileSync(path.join(EXAMPLES, file), 'utf8'))
const PORTRAIT_20x30 = { ...example('09-pass-and-support.json'), title: 'Portrait', area: { width: 20, length: 30 } }
const CASES = [
  { name: 'portrait 20x30', script: PORTRAIT_20x30 },
  { name: 'example 08 (30x40)', script: example('08-kick-to-space.json') },
  { name: 'square example 09 (20x20)', script: example('09-pass-and-support.json') },
]

async function loadScript(page: Page, script: unknown) {
  await page.goto('/practice', { waitUntil: 'load' })
  const fold = page.locator('main h2 button[aria-controls]').filter({ hasText: /^Script and AI/ }).first()
  if ((await fold.isVisible()) && (await fold.getAttribute('aria-expanded')) === 'false') await fold.click()
  const details = page.locator('details', { has: page.locator('#practice-script') })
  if (!(await details.evaluate((d) => (d as HTMLDetailsElement).open))) await details.locator('summary').click()
  await page.locator('#practice-script').fill(JSON.stringify(script))
  await page.getByRole('button', { name: 'Apply script' }).click()
  await page.locator('.konvajs-content').first().waitFor()
}

async function measure(page: Page) {
  // Wait for the canvas to settle after layout.
  let last = ''
  for (let i = 0; i < 20; i++) {
    const now = await page.evaluate(() => JSON.stringify(document.querySelector('.konvajs-content')?.getBoundingClientRect()))
    if (now === last) break
    last = now
    await page.waitForTimeout(150)
  }
  return page.evaluate(() => {
    const play = document.querySelector('button[aria-label="Play"]') as HTMLElement
    play.scrollIntoView({ block: 'center' })
    const canvas = document.querySelector('.konvajs-content')!
    const box = canvas.parentElement!.parentElement!.parentElement!.getBoundingClientRect()
    const c = canvas.getBoundingClientRect()
    const p = play.getBoundingClientRect()
    const hit = document.elementFromPoint(p.x + p.width / 2, p.y + p.height / 2)
    return {
      canvasBottom: c.bottom,
      canvasHeight: c.height,
      boxBottom: box.bottom,
      boxHeight: box.height,
      playTop: p.top,
      playIsHit: hit === play || play.contains(hit),
    }
  })
}

for (const [project, label] of [['phone', 'iPhone 13 WebKit'], ['chromium', 'desktop 1440x900']] as const) {
  test.describe(`canvas fits its box [${label}]`, () => {
    if (project === 'chromium') test.use({ viewport: { width: 1440, height: 900 } })
    test.beforeEach(({}, testInfo) => test.skip(testInfo.project.name !== project, `runs in the ${project} project`))
    for (const c of CASES) {
      test(c.name, async ({ page }) => {
        await loadScript(page, c.script)
        const m = await measure(page)
        await page.screenshot({ path: path.join(process.env.SHOT_DIR ?? 'test-results', `${project}-${c.name.replace(/\W+/g, '-')}.png`) })
        console.log(`[${project}] ${c.name}`, JSON.stringify(m))
        expect(m.canvasHeight, 'canvas no taller than its box').toBeLessThanOrEqual(m.boxHeight + 1)
        expect(m.canvasBottom, 'canvas ends above the Play row').toBeLessThanOrEqual(m.playTop + 1)
        expect(m.playIsHit, 'Play is the element at its own centre').toBe(true)
      })
    }
  })
}
