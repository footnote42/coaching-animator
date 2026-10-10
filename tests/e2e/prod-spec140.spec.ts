/* eslint-disable @typescript-eslint/no-explicit-any -- page-side Konva and JSON script access */
import { test, expect as baseExpect, chromium, webkit, devices, type Browser, type Page, type BrowserContext } from '@playwright/test'
import fs from 'fs'
import path from 'path'

/**
 * Browser checks of spec #140 (animation flow, kicking and kit) against a DEPLOYED site.
 *
 * Not for CI: it skips unless E2E_PASSWORD and E2E_BASE_URL are both set. It signs in with
 * a private test account, creates one Practice, deletes it again and checks the account is
 * left with none. See tests/e2e/README.md for how to run it.
 *
 * Each check runs twice: desktop (chromium, 1440x900) and phone (iPhone 13, webkit). The
 * browsers are launched here, so run it with `--project=chromium` and read the profile in
 * each test title, not the Playwright project.
 *
 * Env: E2E_BASE_URL, E2E_EMAIL, E2E_PASSWORD (required);
 *      E2E_STORAGE_STATE (signed-in state file, default .auth/coach.json),
 *      PROD140_OUT (screenshots, videos and notes, default test-results/prod140).
 */

const BASE_URL = (process.env.E2E_BASE_URL ?? '').replace(/\/$/, '')
const EMAIL = process.env.E2E_EMAIL ?? ''
const PASSWORD = process.env.E2E_PASSWORD ?? ''
const STORAGE_STATE = path.resolve(process.env.E2E_STORAGE_STATE ?? '.auth/coach.json')
const OUT = path.resolve(process.env.PROD140_OUT ?? 'test-results/prod140')
const EXAMPLES = path.resolve('skill/coaching-animator/examples')
const TITLE_PREFIX = 'E2E spec140'

const expect = baseExpect.configure({ timeout: 10_000 })

type Profile = { name: 'desktop' | 'phone'; launch: () => Promise<Browser>; context: Record<string, unknown>; phone: boolean }

const { defaultBrowserType: _ignored, ...IPHONE_13 } = devices['iPhone 13']
const DESKTOP: Profile = { name: 'desktop', launch: () => chromium.launch(), context: { viewport: { width: 1440, height: 900 } }, phone: false }
const PHONE: Profile = { name: 'phone', launch: () => webkit.launch(), context: { ...IPHONE_13 }, phone: true }
const BOTH = [DESKTOP, PHONE]

const example = (file: string) => JSON.parse(fs.readFileSync(path.join(EXAMPLES, file), 'utf8'))

/** Writes a line for the PR findings table. */
function note(check: string, profile: Profile, text: string) {
  fs.mkdirSync(OUT, { recursive: true })
  fs.appendFileSync(path.join(OUT, 'notes.txt'), `${check} | ${profile.name} | ${text}\n`)
}
const shot = (page: Page, name: string, profile: Profile) => {
  fs.mkdirSync(OUT, { recursive: true })
  return page.screenshot({ path: path.join(OUT, `${name}-${profile.name}.png`) })
}

interface SessionOptions {
  auth?: boolean
  video?: string
}

/** Runs `fn` in a fresh browser for the profile. Keeps a screenshot of the page if it throws. */
async function session(profile: Profile, label: string, opts: SessionOptions, fn: (page: Page, context: BrowserContext) => Promise<void>) {
  fs.mkdirSync(OUT, { recursive: true })
  const browser = await profile.launch()
  const context = await browser.newContext({
    ...profile.context,
    baseURL: BASE_URL,
    storageState: opts.auth ? STORAGE_STATE : undefined,
    recordVideo: opts.video ? { dir: path.join(OUT, `video-${opts.video}-${profile.name}`) } : undefined,
  })
  const page = await context.newPage()
  page.setDefaultTimeout(20_000)
  page.setDefaultNavigationTimeout(60_000)
  await page.addInitScript(installHelpers)
  try {
    await fn(page, context)
  } catch (error) {
    await page.screenshot({ path: path.join(OUT, `FAIL-${label}-${profile.name}.png`) }).catch(() => undefined)
    throw error
  } finally {
    await context.close()
    await browser.close()
  }
}

/** Page-side helpers (run in the browser): read the Konva canvas the editor draws. */
function installHelpers() {
  const w = window as any
  w.__stage = () => {
    const stages = (w.Konva?.stages ?? []).filter((s: any) => document.body.contains(s.container()))
    return stages[stages.length - 1]
  }
  /** Marker shapes in draw order, in cells and page pixels. */
  w.__markers = (areaWidth: number) => {
    const stage = w.__stage()
    if (!stage) return null
    const box = stage.container().getBoundingClientRect()
    const cellPx = stage.width() / areaWidth
    const layer = stage.getLayers()[2]
    return layer.getChildren().map((node: any, order: number) => {
      const r = node.getClientRect({ skipStroke: true, skipShadow: true })
      const cx = r.x + r.width / 2
      const cy = r.y + r.height / 2
      const cls = node.getClassName()
      let kind = 'unknown'
      if (cls === 'Ellipse') kind = 'ball'
      else if (cls === 'RegularPolygon') kind = 'cone'
      else if (cls === 'Rect') kind = 'tackle-shield'
      else if (cls === 'Group') kind = node.findOne('Circle') ? 'player' : 'tackle-bag'
      return {
        order,
        kind,
        label: node.findOne?.('Text')?.text?.() ?? '',
        fill: (node.findOne?.('Circle') ?? node.findOne?.('Rect') ?? node).fill?.() ?? '',
        x: cx / cellPx - 0.5,
        y: cy / cellPx - 0.5,
        w: r.width / cellPx,
        h: r.height / cellPx,
        pageX: box.left + cx,
        pageY: box.top + cy,
      }
    })
  }
}

type Shape = { order: number; kind: string; label: string; fill: string; x: number; y: number; w: number; h: number; pageX: number; pageY: number }
const markersOf = (page: Page, areaWidth: number): Promise<Shape[]> => page.evaluate((a) => (window as any).__markers(a), areaWidth)

const canvas = (page: Page) => page.locator('.konvajs-content').first()

/** The canvas box in page coordinates, so scrolling to tap does not count as the canvas moving. */
const canvasBox = (page: Page) =>
  canvas(page).evaluate((el) => {
    const r = el.getBoundingClientRect()
    return { x: r.x + window.scrollX, y: r.y + window.scrollY, width: r.width, height: r.height }
  })

/** Tap/click a cell of the Area. */
async function tapCell(page: Page, areaWidth: number, cell: { x: number; y: number }) {
  const box = (await canvas(page).boundingBox())!
  const cellPx = box.width / areaWidth
  await canvas(page).click({ position: { x: (cell.x + 0.5) * cellPx, y: (cell.y + 0.5) * cellPx } })
}

/**
 * Play, Pause and Back to start by dispatching the click, so a canvas that overlaps the playback row on a
 * phone (see check 3b) does not stop the other checks. Check 3b asserts the row is reachable.
 */
const press = (page: Page, name: string) => page.getByRole('button', { name, exact: true }).dispatchEvent('click')

async function readClock(page: Page): Promise<{ time: number; duration: number }> {
  const text = await page.getByText(/^\d+\.\ds \/ \d+\.\ds$/).first().innerText()
  const [time, duration] = text.split('/').map((s) => parseFloat(s))
  return { time, duration }
}

/** On a phone the editor's groups fold; open one by its title. No-op on a desktop. */
async function openSection(page: Page, title: RegExp) {
  const button = page.locator('main h2 button[aria-controls]').filter({ hasText: title }).first()
  if ((await button.isVisible()) && (await button.getAttribute('aria-expanded')) === 'false') await button.click()
}

/** Paste a Practice Script into the editor and apply it. */
async function applyScript(page: Page, script: unknown) {
  await openSection(page, /^Advanced: Practice Script/)
  const summary = page.locator('details', { has: page.locator('#practice-script') }).locator('summary')
  const open = await page.locator('details', { has: page.locator('#practice-script') }).evaluate((d) => (d as HTMLDetailsElement).open)
  if (!open) await summary.click()
  await page.locator('#practice-script').fill(JSON.stringify(script))
  await page.getByRole('button', { name: 'Apply script' }).click()
  await expect(page.getByRole('alert').filter({ hasText: "can't be loaded" })).toHaveCount(0)
  await canvas(page).waitFor()
  // The edit layer (the fourth Konva layer) loads after the canvas; taps before it is there do nothing.
  await expect.poll(() => page.evaluate(() => (window as any).__stage()?.getLayers().length ?? 0)).toBeGreaterThanOrEqual(4)
  // ...and the canvas re-measures as the page settles (a tap in between lands on the old stage): wait for a steady size.
  let last = ''
  let steady = 0
  for (let i = 0; i < 40 && steady < 3; i++) {
    const now = JSON.stringify(await canvasBox(page))
    steady = now === last ? steady + 1 : 0
    last = now
    await page.waitForTimeout(200)
  }
}

const scriptNow = async (page: Page) => JSON.parse(await page.locator('#practice-script').inputValue())

async function openEditor(page: Page) {
  await page.goto('/practice', { waitUntil: 'load' })
  await canvas(page).waitFor()
  await page.getByRole('button', { name: 'Select and drag' }).click()
}

async function selectMarker(page: Page, areaWidth: number, label: string) {
  const shapes = await markersOf(page, areaWidth)
  const shape = shapes.find((s) => s.label === label)!
  expect(shape, `marker ${label} on the canvas`).toBeTruthy()
  const box = (await canvas(page).boundingBox())!
  await canvas(page).click({ position: { x: shape.pageX - box.x, y: shape.pageY - box.y } })
}

/** A small Practice with a ball carrier for the kicking checks. */
const KICK_SCRIPT = {
  schemaVersion: 1,
  title: 'Kick check',
  area: { width: 20, length: 30 },
  direction: 'up',
  markers: [
    { id: 'a1', kind: 'attacker', label: '1' },
    { id: 'a2', kind: 'attacker', label: '2' },
    { id: 'ball', kind: 'ball' },
    { id: 'd1', kind: 'defender', label: 'D1' },
  ],
  base: {
    placements: [
      { marker: 'a1', cell: { x: 10, y: 24 } },
      { marker: 'a2', cell: { x: 5, y: 24 } },
      { marker: 'ball', holder: 'a1' },
      { marker: 'd1', cell: { x: 14, y: 6 } },
    ],
    moves: [],
    passes: [],
  },
  progressions: [],
}

// ---------------------------------------------------------------------------------------------

test.describe('prod spec #140', () => {
  test.skip(!PASSWORD || !BASE_URL, 'Set E2E_PASSWORD and E2E_BASE_URL to run the production checks')
  test.setTimeout(180_000)

  // 1 ---------------------------------------------------------------------------------------
  for (const profile of BOTH) {
    test(`1 landing hero 3v2 flows [${profile.name}]`, async () => {
      await session(profile, 'hero', { video: 'hero' }, async (page) => {
        await page.goto('/', { waitUntil: 'load' })
        const svg = page.locator('svg[role="img"][aria-label^="Animated example"]')
        await svg.scrollIntoViewIfNeeded()
        await expect(svg).toBeVisible()
        await shot(page, 'hero-start', profile)

        // Sample every marker's position (in cells) 20 times a second for two loops.
        await page.evaluate(() => {
          const w = window as any
          const svgEl = [...document.querySelectorAll('svg[role="img"]')].find((s) => (s.getAttribute('aria-label') ?? '').startsWith('Animated example'))!
          const clockEl = svgEl.parentElement!.querySelector('p span[aria-hidden="true"]')!
          w.__heroSamples = []
          const t0 = performance.now()
          w.__heroTimer = setInterval(() => {
            const m: Record<string, [number, number]> = {}
            svgEl.querySelectorAll(':scope > g').forEach((g) => {
              const c = g.querySelector('circle')
              if (!c) return
              m[g.querySelector('text')?.textContent ?? 'unlabelled'] = [parseFloat(c.getAttribute('cx')!) - 0.5, parseFloat(c.getAttribute('cy')!) - 0.5]
            })
            const ball = svgEl.querySelector(':scope > ellipse')
            if (ball) m.ball = [parseFloat(ball.getAttribute('cx')!) - 0.5, parseFloat(ball.getAttribute('cy')!) - 0.5]
            w.__heroSamples.push({ t: performance.now() - t0, clock: parseFloat(clockEl.textContent ?? '0'), m })
          }, 50)
        })
        await page.waitForTimeout(22_000)
        const samples: Array<{ t: number; clock: number; m: Record<string, [number, number]> }> = await page.evaluate(() => (window as any).__heroSamples)
        await shot(page, 'hero-end', profile)

        // One loop: from the clock restarting at 0 to the clock reaching its maximum.
        const restart = samples.findIndex((s, i) => i > 0 && s.clock < 0.3 && samples[i - 1].clock > s.clock + 0.5)
        const first = restart >= 0 ? restart : samples.findIndex((s) => s.clock < 0.3)
        expect(first, 'the hero clock restarted at 0 at least once').toBeGreaterThanOrEqual(0)
        const loop = samples.slice(first)
        const end = loop.findIndex((s, i) => i > 0 && s.clock < loop[i - 1].clock - 0.5)
        const play = end > 0 ? loop.slice(0, end) : loop
        const dur = Math.max(...play.map((s) => s.clock))
        const t0 = play[0].t
        expect(dur, 'the hero Practice has a duration').toBeGreaterThan(2)

        // Frames every 0.5 s, for human review of the video alongside.
        const frames = []
        for (let t = 0; t <= dur; t += 0.5) frames.push({ t, ...play.find((s) => s.t - t0 >= t * 1000) })
        fs.mkdirSync(OUT, { recursive: true })
        fs.writeFileSync(path.join(OUT, `hero-frames-${profile.name}.json`), JSON.stringify({ duration: dur, frames }, null, 1))

        // Longest stretch each marker stays put (under 0.01 cells per sample), from the start of play to the
        // last time it moved: its taper to a stop at the end is not a stutter.
        const names = Object.keys(play[0].m)
        const report: string[] = []
        const stuck: string[] = []
        for (const name of names) {
          const moved = play.map((s, i) => (i === 0 ? false : Math.hypot(s.m[name][0] - play[i - 1].m[name][0], s.m[name][1] - play[i - 1].m[name][1]) > 0.01))
          const firstMove = moved.indexOf(true)
          const lastMove = moved.lastIndexOf(true)
          if (firstMove < 0) {
            report.push(`${name}: never moves`)
            continue
          }
          let longest = (play[firstMove].t - t0) / 1000 // a late start counts as standing still
          let runStart = -1
          for (let i = firstMove; i <= lastMove; i++) {
            if (!moved[i] && runStart < 0) runStart = i
            if (moved[i] && runStart >= 0) {
              longest = Math.max(longest, (play[i].t - play[runStart].t) / 1000)
              runStart = -1
            }
          }
          report.push(`${name}: starts ${((play[firstMove].t - t0) / 1000).toFixed(1)}s, last moves ${((play[lastMove].t - t0) / 1000).toFixed(1)}s, longest stop ${longest.toFixed(2)}s`)
          if (longest > 0.5) stuck.push(`${name} (${longest.toFixed(2)}s)`)
        }
        note('1 hero', profile, `play ${dur.toFixed(1)}s. ${report.join('; ')}`)
        expect(stuck, `markers stationary for more than 0.5s mid-play. ${report.join('; ')}`).toEqual([])
      })
    })
  }

  // 2 ---------------------------------------------------------------------------------------
  for (const profile of BOTH) {
    test(`2 editor guest: stable canvas, toolbar groups, folding [${profile.name}]`, async () => {
      await session(profile, 'editor', {}, async (page) => {
        await openEditor(page)
        await applyScript(page, example('09-pass-and-support.json'))
        const area = 20

        // Selecting a marker must not move the canvas.
        const before = await canvasBox(page)
        await selectMarker(page, area, '1')
        await expect(page.locator('#marker-label')).toBeVisible()
        const during = await canvasBox(page)
        await page.mouse.move(0, 0)
        await selectMarker(page, area, '2')
        const other = await canvasBox(page)
        for (const [name, box] of [['selected', during], ['reselected', other]] as const) {
          for (const k of ['x', 'y', 'width', 'height'] as const) {
            expect(Math.abs(box[k] - before[k]), `canvas ${k} after ${name}`).toBeLessThan(0.5)
          }
        }
        await shot(page, 'editor-selected', profile)

        // Toolbar groups: Mode | Place | History.
        const toolbar = page.getByRole('toolbar', { name: 'Editing tools' })
        const groups = await toolbar.getByRole('group').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')))
        expect(groups.filter((g) => ['Mode', 'Place', 'History'].includes(g ?? ''))).toEqual(['Mode', 'Place', 'History'])
        const mode = (await toolbar.getByRole('group', { name: 'Mode', exact: true }).boundingBox())!
        const place = (await toolbar.getByRole('group', { name: 'Place', exact: true }).boundingBox())!
        const history = (await toolbar.getByRole('group', { name: 'History', exact: true }).boundingBox())!
        expect(await toolbar.getByRole('group', { name: 'Mode', exact: true }).getByRole('button').count()).toBe(3)
        expect(await toolbar.getByRole('group', { name: 'History', exact: true }).getByRole('button').count()).toBe(2)
        if (!profile.phone) {
          // One row, left to right.
          expect(Math.abs(mode.y - place.y)).toBeLessThan(15)
          expect(mode.x + mode.width).toBeLessThanOrEqual(place.x)
          expect(place.x + place.width).toBeLessThanOrEqual(history.x)
        } else {
          // Mode and History share the top row, Place takes its own row beneath.
          expect(Math.abs(mode.y - history.y)).toBeLessThan(15)
          expect(place.y).toBeGreaterThan(mode.y + mode.height - 2)
        }
        for (const b of [mode, place, history]) expect(b.x + b.width, 'toolbar group inside the viewport').toBeLessThanOrEqual(page.viewportSize()!.width + 1)
        await shot(page, 'editor-toolbar', profile)

        // Phone: each group folds; desktop: all open, no fold buttons.
        const folds = page.locator('main h2 button[aria-controls]')
        const count = await folds.count()
        // Area, Step and Advanced: Practice Script (plus Passing and kicking, which sits in its own column from xl up).
        expect(count).toBeGreaterThanOrEqual(3)
        if (profile.phone) {
          // Folded by default (Advanced was opened above to paste the script).
          for (const title of [/^Area/, /^Passing and kicking/, /^Advanced: Practice Script/]) {
            const btn = folds.filter({ hasText: title }).first()
            await btn.scrollIntoViewIfNeeded()
            const panel = page.locator(`[id="${await btn.getAttribute('aria-controls')}"]`)
            if (!/Advanced/.test(String(title))) {
              await expect(btn).toHaveAttribute('aria-expanded', 'false')
              await expect(panel).toBeHidden()
            }
            const was = (await btn.getAttribute('aria-expanded')) === 'true'
            await btn.click()
            await expect(btn).toHaveAttribute('aria-expanded', String(!was))
            await (was ? expect(panel).toBeHidden() : expect(panel).toBeVisible())
            await btn.click()
            await expect(btn).toHaveAttribute('aria-expanded', String(was))
          }
        } else {
          for (const title of [/^Area/]) {
            const btn = folds.filter({ hasText: title }).first()
            await expect(btn).toBeHidden()
          }
          await expect(page.locator('main h2').filter({ hasText: /^Area/ })).toBeVisible()
          // Advanced: Practice Script folds at every width (collapse="always")
          const advancedBtn = folds.filter({ hasText: /^Advanced: Practice Script/ }).first()
          await expect(advancedBtn).toBeVisible()
        }
        note('2 editor', profile, 'canvas box unmoved; groups Mode|Place|History ok; ' + (profile.phone ? 'phone groups fold' : 'no folds on desktop'))
      })
    })
  }

  // 2b tags are headed groups: only shown to a signed-in Coach (Details and save). ---------------
  for (const profile of BOTH) {
    test(`2b tags in four headed groups, signed in [${profile.name}]`, async () => {
      await signInOnce()
      await session(profile, 'tags', { auth: true }, async (page) => {
        await openEditor(page)
        const details = page.locator('main h2 button[aria-controls]').filter({ hasText: /^Details and save/ })
        await expect(details).toBeVisible()
        if ((await details.getAttribute('aria-expanded')) === 'false') await details.click()
        const tags = page.getByRole('group', { name: /Principles of play|Skills|Knowledge|Behaviours/ })
        const names = await tags.evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')))
        expect(names).toEqual(['Principles of play', 'Skills', 'Knowledge', 'Behaviours'])
        await page.getByRole('group', { name: 'Behaviours' }).scrollIntoViewIfNeeded()
        await shot(page, 'tags', profile)
        note('2 tags', profile, 'four headed groups (only for signed-in Coaches; guests never see Tags)')
      })
    })
  }

  // 3 ---------------------------------------------------------------------------------------
  for (const profile of BOTH) {
    test(`3 Pass and Kick for the carrier; kick to space lands loose [${profile.name}]`, async () => {
      await session(profile, 'kick', {}, async (page) => {
        await openEditor(page)
        await applyScript(page, KICK_SCRIPT)
        const area = 20

        await selectMarker(page, area, '2')
        await expect(page.getByRole('group', { name: 'Ball carrier' })).toHaveCount(0)
        await selectMarker(page, area, '1')
        const carrier = page.getByRole('group', { name: 'Ball carrier' })
        await expect(carrier.getByRole('button', { name: 'Pass', exact: true })).toBeVisible()
        await expect(carrier.getByRole('button', { name: 'Kick', exact: true })).toBeVisible()
        await shot(page, 'kick-buttons', profile)

        await carrier.getByRole('button', { name: 'Kick', exact: true }).click()
        await expect(carrier.getByRole('button', { name: 'Kick', exact: true })).toHaveAttribute('aria-pressed', 'true')
        await tapCell(page, area, { x: 12, y: 10 })
        await expect.poll(async () => (await scriptNow(page)).base.passes.length, { message: 'a pass entry was made' }).toBe(1)
        const kick = (await scriptNow(page)).base.passes[0]
        expect(kick, 'a pass entry was made').toBeTruthy()
        expect(kick.kick, 'it is a kick').toBe(true)
        expect(kick.cell, 'it is aimed at a cell (kick to space)').toEqual({ x: 12, y: 10 })
        expect(kick.to, 'no receiver').toBeUndefined()

        // Play: pause mid-flight, then run on to the end.
        await press(page, 'Play')
        const { duration } = await readClock(page)
        expect(duration).toBeGreaterThan(0)
        const startBall = (await markersOf(page, area)).find((s) => s.kind === 'ball')!
        await expect.poll(async () => (await readClock(page)).time, { timeout: 20_000 }).toBeGreaterThanOrEqual(duration * 0.4)
        await press(page, 'Pause')
        const mid = (await markersOf(page, area)).find((s) => s.kind === 'ball')!
        await shot(page, 'kick-mid', profile)
        expect(mid.y, 'ball is on its way up the pitch mid-play').toBeLessThan(startBall.y - 1)

        await press(page, 'Play')
        await expect.poll(async () => (await readClock(page)).time, { timeout: 30_000 }).toBeGreaterThanOrEqual(duration - 0.05)
        await page.waitForTimeout(600)
        const end = await markersOf(page, area)
        const endBall = end.find((s) => s.kind === 'ball')!
        await shot(page, 'kick-end', profile)
        const nearest = Math.min(...end.filter((s) => s.kind !== 'ball').map((s) => Math.hypot(s.x - endBall.x, s.y - endBall.y)))
        expect(nearest, 'ball is on its own, away from every player').toBeGreaterThan(1.5)
        expect(Math.hypot(endBall.x - 12, endBall.y - 10), 'ball rests near the target cell').toBeLessThan(5)
        await page.waitForTimeout(500)
        const later = (await markersOf(page, area)).find((s) => s.kind === 'ball')!
        expect(Math.hypot(later.x - endBall.x, later.y - endBall.y), 'ball stays put once at rest').toBeLessThan(0.05)

        // Passes can be edited again from the start; the loose ball then offers Collect.
        await press(page, 'Back to start')
        await openSection(page, /^Passing and kicking/)
        await expect(page.getByRole('group', { name: 'Loose ball' }).getByRole('button', { name: /^Collect/ })).toBeVisible()
        note('3 kick', profile, `kick to cell (12,10); ball ends at (${endBall.x.toFixed(1)},${endBall.y.toFixed(1)}), ${nearest.toFixed(1)} cells from nearest player; Collect offered`)
      })
    })
  }

  // 3b --------------------------------------------------------------------------------------
  for (const profile of BOTH) {
    test(`3b playback controls are not covered by the canvas, portrait Area [${profile.name}]`, async () => {
      await session(profile, 'controls', {}, async (page) => {
        await openEditor(page)
        await applyScript(page, KICK_SCRIPT) // 20 x 30: taller than wide
        await page.waitForTimeout(1000)
        const result = await page.evaluate(() => {
          const play = [...document.querySelectorAll('button')].find((b) => b.getAttribute('aria-label') === 'Play') as HTMLElement
          play.scrollIntoView({ block: 'center' })
          const r = play.getBoundingClientRect()
          const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)
          const stage = (window as any).__stage()
          const box = stage.container().getBoundingClientRect()
          return { covered: !!top?.closest('.konvajs-content'), coveredBy: top?.tagName, canvasBottom: Math.round(box.bottom), playTop: Math.round(r.top) }
        })
        await shot(page, 'controls', profile)
        note('3b controls', profile, result.covered ? `Play button covered by ${result.coveredBy} (canvas bottom ${result.canvasBottom}px, Play top ${result.playTop}px)` : 'Play button reachable')
        expect(result.covered, `Play button is covered by ${result.coveredBy} (canvas bottom ${result.canvasBottom}px, Play top ${result.playTop}px)`).toBe(false)
      })
    })
  }

  // 4 ---------------------------------------------------------------------------------------
  for (const profile of BOTH) {
    test(`4 cone split button [${profile.name}]`, async () => {
      await session(profile, 'cone', {}, async (page) => {
        await openEditor(page)
        await applyScript(page, KICK_SCRIPT)
        const area = 20
        const place = page.getByRole('group', { name: 'Place', exact: true })

        await place.getByRole('button', { name: /^Place \w+ cone$/ }).click()
        const face = place.getByRole('button', { name: /^Place \w+ cone$/ })
        await expect(face).toHaveAttribute('aria-pressed', 'true')
        const startColour = (await face.getAttribute('aria-label'))!.split(' ')[1]
        await tapCell(page, area, { x: 3, y: 15 })
        const coneColours = async () => (await scriptNow(page)).markers.filter((m: any) => m.kind === 'cone').map((c: any) => c.colour ?? 'yellow')
        await expect.poll(coneColours, { message: 'the face places a cone in the current colour' }).toEqual([startColour])

        await place.getByRole('button', { name: 'Cone colour' }).click()
        const swatches = page.getByRole('dialog', { name: 'Cone colour' })
        await expect(swatches).toBeVisible()
        await shot(page, 'cone-swatches', profile)
        const options = await swatches.getByRole('button').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')!))
        expect(options.length).toBeGreaterThanOrEqual(4)
        const pick = options.find((o) => !o.toLowerCase().startsWith(startColour))!
        const colour = pick.split(' ')[0].toLowerCase()
        await swatches.getByRole('button', { name: pick }).click()
        await expect(swatches).toBeHidden()
        await expect(place.getByRole('button', { name: `Place ${colour} cone` })).toHaveAttribute('aria-pressed', 'true')

        await tapCell(page, area, { x: 15, y: 15 })
        await tapCell(page, area, { x: 15, y: 17 })
        await expect.poll(coneColours, { message: 'cones placed after choosing a swatch take its colour' }).toEqual([startColour, colour, colour])
        await expect(place.getByRole('button', { name: `Place ${colour} cone` })).toBeVisible()
        await shot(page, 'cone-placed', profile)
        note('4 cone', profile, `face placed ${startColour}; arrow chose ${colour}; next two cones ${colour}; face label follows`)
      })
    })
  }

  // 5 ---------------------------------------------------------------------------------------
  for (const profile of BOTH) {
    test(`5 Lying shield and bag, ball drawn beneath [${profile.name}]`, async () => {
      await session(profile, 'lying', {}, async (page) => {
        await openEditor(page)
        const area = 12
        await applyScript(page, {
          schemaVersion: 1,
          title: 'Lying check',
          area: { width: 12, length: 12 },
          direction: 'up',
          markers: [
            { id: 'shield1', kind: 'tackle-shield', label: 'S' },
            { id: 'bag1', kind: 'tackle-bag', label: 'B' },
          ],
          base: {
            placements: [
              { marker: 'shield1', cell: { x: 3, y: 6 } },
              { marker: 'bag1', cell: { x: 8, y: 6 } },
            ],
            moves: [],
            passes: [],
          },
          progressions: [],
        })

        // Toggle Lying on each, through the Selection panel.
        for (const [id, cell, kind] of [['shield1', { x: 3, y: 6 }, 'tackle-shield'], ['bag1', { x: 8, y: 6 }, 'tackle-bag']] as const) {
          await tapCell(page, area, cell)
          const lying = page.getByRole('button', { name: 'Lying', exact: true })
          await expect(lying).toBeVisible()
          await expect(lying).toHaveAttribute('aria-pressed', 'false')
          const all = await markersOf(page, area)
          const upright = all.find((s) => s.kind === kind)!
          expect(upright, `${kind} on the canvas, saw ${JSON.stringify(all.map((s) => s.kind))}`).toBeTruthy()
          expect(upright.h, `${kind} stands taller than wide`).toBeGreaterThan(upright.w)
          await lying.click()
          await expect(lying).toHaveAttribute('aria-pressed', 'true')
          const laid = (await markersOf(page, area)).find((s) => s.kind === kind)!
          expect(laid.w, `${kind} lies wider than tall`).toBeGreaterThan(laid.h)
          await expect.poll(async () => (await scriptNow(page)).base.placements.find((p: any) => p.marker === id).lying).toBe(true)
        }
        // The bag is taller than the shield.
        const kit = await markersOf(page, area)
        expect(kit.find((s) => s.kind === 'tackle-bag')!.w, 'lying bag is longer than lying shield').toBeGreaterThan(kit.find((s) => s.kind === 'tackle-shield')!.w)

        // A loose ball placed on a Lying kit's cell is drawn beneath it and peeks out from under it. The
        // Place ball tool moves the one ball, so do the shield, then the bag.
        const ballTool = page.getByRole('button', { name: 'Place ball', exact: true })
        for (const [kind, cell] of [['tackle-shield', { x: 3, y: 6 }], ['tackle-bag', { x: 8, y: 6 }]] as const) {
          await ballTool.click()
          await tapCell(page, area, cell)
          await page.getByRole('button', { name: 'Select and drag' }).click()
          await expect
            .poll(async () => (await scriptNow(page)).base.placements.find((p: any) => p.marker === 'ball')?.cell, { message: 'loose ball on the cell' })
            .toEqual(cell)
          const shapes = await markersOf(page, area)
          const k = shapes.find((s) => s.kind === kind)!
          const ball = shapes.find((s) => s.kind === 'ball')!
          expect(ball.order, `ball drawn before (beneath) the ${kind}`).toBeLessThan(k.order)
          expect(Math.abs(ball.x - k.x), `ball is offset so it shows past the ${kind}`).toBeGreaterThan(0.3)
          expect(Math.abs(ball.y - k.y), `ball is on the ${kind}'s row`).toBeLessThan(0.6)
          await canvas(page).scrollIntoViewIfNeeded()
          await canvas(page).screenshot({ path: path.join(OUT, `lying-ball-under-${kind}-${profile.name}.png`) })
        }

        // The same in the guide's own examples: 08 (ball under a lying shield), 07 (lying bag).
        await applyScript(page, example('08-kick-to-space.json'))
        await page.getByRole('group', { name: 'Steps' }).getByRole('button', { name: /^1\./ }).click()
        let s08 = await markersOf(page, 30)
        const shield = s08.find((s) => s.kind === 'tackle-shield')!
        const loose = s08.find((s) => s.kind === 'ball')!
        expect(shield.w, 'example 08 step 1: shield lies flat').toBeGreaterThan(shield.h)
        expect(loose.order, 'example 08 step 1: ball beneath the shield').toBeLessThan(shield.order)
        await canvas(page).screenshot({ path: path.join(OUT, `lying-example08-${profile.name}.png`) })

        await applyScript(page, example('07-bag-clear-out.json'))
        await page.getByRole('group', { name: 'Steps' }).getByRole('button', { name: /^1\./ }).click()
        s08 = await markersOf(page, 12)
        const bag = s08.find((s) => s.kind === 'tackle-bag')!
        expect(bag.w, 'example 07 step 1: bag lies flat').toBeGreaterThan(bag.h)
        await canvas(page).screenshot({ path: path.join(OUT, `lying-example07-${profile.name}.png`) })
        note('5 lying', profile, 'toggle works on shield and bag; balls drawn beneath and offset; examples 07/08 step 1 lie flat')
      })
    })
  }

  // 6 ---------------------------------------------------------------------------------------
  for (const profile of BOTH) {
    test(`6 Release picker and per-waypoint Pace change playback [${profile.name}]`, async () => {
      await session(profile, 'pace', {}, async (page) => {
        await openEditor(page)
        await applyScript(page, example('09-pass-and-support.json'))
        const area = 20
        const durationOf = async () => (await readClock(page)).duration

        // Positions of every marker the first frame the clock reaches `at` seconds.
        const positionsAt = async (at: number) => {
          await press(page, 'Back to start')
          await press(page, 'Play')
          const shapes: Shape[] = await page.evaluate(
            ([a, want]) =>
              new Promise<any[]>((resolve) => {
                const w = window as any
                const tick = () => {
                  const t = parseFloat((document.body.innerText.match(/(\d+\.\d)s \/ \d+\.\ds/) ?? ['', '0'])[1])
                  if (t >= want) resolve(w.__markers(a))
                  else requestAnimationFrame(tick)
                }
                tick()
              }),
            [area, at] as const,
          )
          await press(page, 'Pause').catch(() => undefined)
          await press(page, 'Back to start') // the controls only edit from the start
          return shapes
        }

        // Release picker.
        await openSection(page, /^Passing and kicking/)
        const release = page.getByLabel(/^Release: where .* releases$/)
        await expect(release).toBeVisible()
        await expect(page.getByRole('button', { name: /^Tap\s+release point/ })).toBeVisible()
        expect(await release.inputValue(), 'example 09 releases at point 1').toBe('0')
        const baseDuration = await durationOf()
        const baseAt = await positionsAt(1.5)
        await release.selectOption('')
        const whenReady = await durationOf()
        const readyAt = await positionsAt(1.5)
        const shift = Math.max(...baseAt.map((s, i) => Math.hypot(s.x - readyAt[i].x, s.y - readyAt[i].y)))
        note('6 release', profile, `duration ${baseDuration}s at point 1 vs ${whenReady}s when ready; largest marker shift at 1.5s ${shift.toFixed(2)} cells`)
        expect(whenReady !== baseDuration || shift > 0.3, 'Release changes duration or positions').toBe(true)
        await release.selectOption('0')
        expect(await durationOf(), 'back to the original timing').toBe(baseDuration)

        // Per-waypoint Pace: select a1, then its first waypoint.
        await selectMarker(page, area, '1')
        const first = (example('09-pass-and-support.json').base.moves[0].waypoints[0]) as { x: number; y: number }
        await tapCell(page, area, first)
        const segment = page.locator('#segment-pace')
        await expect(segment).toBeVisible()
        await expect(page.locator('#run-pace')).toBeVisible()
        await shot(page, 'pace-controls', profile)
        const durations: Record<string, number> = {}
        for (const pace of ['walk', 'sprint', '']) {
          await segment.selectOption(pace)
          durations[pace || 'run pace'] = await durationOf()
        }
        note('6 pace', profile, `duration by segment pace ${JSON.stringify(durations)}; run default ${baseDuration}s`)
        expect(durations.walk, 'walking the first segment takes longer than sprinting it').toBeGreaterThan(durations.sprint)
        expect(durations['run pace']).toBe(baseDuration)
        const script = await scriptNow(page)
        expect(script.base.moves.find((m: any) => m.marker === 'a1').waypoints[0].pace, 'cleared again').toBeUndefined()
      })
    })
  }

  // 7 ---------------------------------------------------------------------------------------
  test.describe('signed in', () => {
    test.describe.configure({ mode: 'serial' })

    for (const profile of BOTH) {
      test(`7 Save with no title opens Details; save, list, delete [${profile.name}]`, async () => {
        await signInOnce()
        const title = `${TITLE_PREFIX} ${profile.name} ${Date.now()}`
        await session(profile, 'save', { auth: true }, async (page) => {
          await openEditor(page)
          const before = await practiceIds(page)
          // No title in the script, or the editor takes it from there and the header Save would not need Details.
          const { title: _title, ...untitled } = example('09-pass-and-support.json')
          await applyScript(page, untitled)
          try {
            const header = page.getByRole('button', { name: /^Save$/ }).first()
            await expect(header).toBeVisible()
            const details = page.locator('main h2 button[aria-controls]').filter({ hasText: /^Details and save/ })
            await expect(details).toHaveAttribute('aria-expanded', 'false')
            await header.click()
            await expect(details).toHaveAttribute('aria-expanded', 'true')
            const titleField = page.getByRole('textbox', { name: 'Title', exact: true })
            await expect(titleField).toBeFocused()
            await shot(page, 'save-details-opened', profile)

            await titleField.fill(title)
            const posted = page.waitForResponse((r) => r.url().endsWith('/api/practices') && r.request().method() === 'POST')
            await header.click()
            expect((await posted).status()).toBe(201)
            await expect(page.getByText('Practice saved.')).toBeVisible()

            // It appears in My Practices (the page on a phone, where the editor hides the list).
            if (profile.phone) {
              await page.waitForURL(/\/practice\?id=/) // saving re-opens the Practice by id
              await page.goto('/my-practices', { waitUntil: 'load' })
            }
            await expect(page.getByRole('button', { name: `Delete ${title}`, exact: true })).toBeVisible()
            await shot(page, 'save-listed', profile)

            // Delete through the UI.
            await page.getByRole('button', { name: `Delete ${title}`, exact: true }).click()
            await page.getByRole('dialog').getByRole('button', { name: 'Delete', exact: true }).click()
            await expect(page.getByRole('button', { name: `Delete ${title}`, exact: true })).toHaveCount(0)
            const left = await page.evaluate(async () => (await (await fetch('/api/practices')).json()).practices.length)
            expect(left, 'no Practices left after the delete').toBe(0)
            note('7 save', profile, 'header Save opened Details and focused Title; saved; listed; deleted through the UI')
          } finally {
            await deleteLeftovers(page, before)
          }
        })
      })
    }

    test('7 the test account has no Practices left', async () => {
      await session(DESKTOP, 'account-empty', { auth: true }, async (page) => {
        await page.goto('/practice', { waitUntil: 'load' })
        const practices = await page.evaluate(async () => (await (await fetch('/api/practices')).json()).practices)
        expect(practices).toEqual([])
      })
    })
  })
})

// ---------------------------------------------------------------------------------------------

let signedIn = false
/** Sign in through the normal /login page once and keep the state for the signed-in checks. */
async function signInOnce() {
  if (signedIn) return
  fs.mkdirSync(path.dirname(STORAGE_STATE), { recursive: true })
  const browser = await chromium.launch()
  try {
    const context = await browser.newContext({ baseURL: BASE_URL, viewport: { width: 1440, height: 900 } })
    const page = await context.newPage()
    await page.goto('/login', { waitUntil: 'load', timeout: 60_000 })
    await page.getByTestId('login-email').fill(EMAIL)
    await page.getByTestId('login-password').fill(PASSWORD)
    await page.getByTestId('login-submit').click()
    await page.waitForURL(/\/(practice|my-practices|profile)/, { timeout: 60_000, waitUntil: 'load' })
    await expect(page.locator('a[href="/profile"]').first()).toBeVisible({ timeout: 20_000 })
    await context.storageState({ path: STORAGE_STATE })
    signedIn = true
  } finally {
    await browser.close()
  }
}

const practiceIds = (page: Page): Promise<string[]> =>
  page.evaluate(async () => ((await (await fetch('/api/practices')).json()).practices ?? []).map((p: { id: string }) => p.id))

/** Safety net: delete any Practice created since `before`, even when a check failed half way. */
async function deleteLeftovers(page: Page, before: string[]) {
  await page
    .evaluate(
      async (keep) => {
        const list = await (await fetch('/api/practices')).json()
        for (const p of list.practices ?? []) {
          if (!keep.includes(p.id)) await fetch(`/api/practices/${p.id}`, { method: 'DELETE' })
        }
      },
      before,
    )
    .catch(() => undefined)
}
