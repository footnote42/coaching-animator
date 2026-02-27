import { test, expect, Page } from '@playwright/test'
import { loginAsTestUser, takeScreenshot } from './helpers'

/**
 * Canvas Pitch Render Diagnostics
 *
 * Confirms or denies the black-screen bug reported on /app and /share/[id].
 * Four suites cover the identified root causes:
 *
 * Suite 1 — Editor /app (desktop 1280×800, requires auth)
 *   Checks canvas dimensions, SVG network responses, and pixel colour.
 *
 * Suite 2a — Share viewer /share/[id], mobile (375×667)
 *   Adds ResizeObserver guard check: canvas.width must NOT stay at 800px fallback.
 *
 * Suite 2b — Share viewer /share/[id], desktop (1280×800)
 *   Same checks without the mobile sizing constraint.
 *
 * Suite 3 — SVG asset reachability (HTTP GET, no browser)
 *   Confirms all /public/assets/fields/*.svg are served correctly.
 *
 * Suite 4 — ResizeObserver sizing guard, mobile (375×667)
 *   Focused checks on position:fixed container and canvas.width fallback.
 *
 * Diagnostic Outcome Mapping:
 *   Suite 3 SVG 404        → Missing /public/assets/fields/*.svg
 *   Suite 1/2 SVG non-200  → Asset serving misconfiguration (next.config.js)
 *   Suite 2a-ii width=800  → ResizeObserver guard firing (useShareCanvasSize.ts:31)
 *   Suite 1d/2a-iv black   → Konva not painting (init race or SVG not loaded)
 *   Suite 2a-v zero-size   → Canvas wrapper collapsed (ShareViewer.tsx structure)
 */

// ============================================================================
// Pixel Sampling Helpers
// ============================================================================

interface Pixel {
  r: number
  g: number
  b: number
  a: number
}

function isPureBlack(pixel: Pixel): boolean {
  return pixel.r < 10 && pixel.g < 10 && pixel.b < 10
}

/**
 * Reads the centre pixel of the first <canvas> element on the page.
 *
 * Strategy:
 * 1. Direct getContext('2d').getImageData() — works in Chromium when canvas
 *    is same-origin (Konva SVGs loaded via img.src from same origin are fine).
 * 2. drawImage into a fresh offscreen canvas — fallback for WebKit / Firefox
 *    where the primary context may be locked.
 * 3. Returns null on any failure → caller should test.skip() with screenshot.
 */
async function sampleCentrePixel(page: Page): Promise<Pixel | null> {
  return page.evaluate((): { r: number; g: number; b: number; a: number } | null => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return null

    const w = canvas.width
    const h = canvas.height
    if (w === 0 || h === 0) return null

    const cx = Math.floor(w / 2)
    const cy = Math.floor(h / 2)

    // Attempt 1: direct getContext (Chromium — fast path)
    try {
      const ctx = (canvas as HTMLCanvasElement).getContext('2d')
      if (ctx) {
        const data = ctx.getImageData(cx, cy, 1, 1).data
        return { r: data[0], g: data[1], b: data[2], a: data[3] }
      }
    } catch {
      // SecurityError on tainted canvas — fall through to attempt 2
    }

    // Attempt 2: drawImage into offscreen canvas (WebKit / Firefox)
    try {
      const offscreen = document.createElement('canvas')
      offscreen.width = 1
      offscreen.height = 1
      const offCtx = offscreen.getContext('2d')
      if (!offCtx) return null
      offCtx.drawImage(canvas as HTMLCanvasElement, cx, cy, 1, 1, 0, 0, 1, 1)
      const data = offCtx.getImageData(0, 0, 1, 1).data
      return { r: data[0], g: data[1], b: data[2], a: data[3] }
    } catch {
      return null
    }
  })
}

// ============================================================================
// Shared Test Data
// ============================================================================

let testAnimationId: string | null = null

test.beforeAll(async ({ baseURL, request }) => {
  const apiUrl = baseURL || process.env.BASE_URL || 'http://localhost:3000'
  try {
    const response = await request.get(`${apiUrl}/api/gallery?limit=1&visibility=public`)
    if (response.ok()) {
      const data = await response.json()
      if (data.animations && data.animations.length > 0) {
        testAnimationId = data.animations[0].id
        console.log(`✓ Using test animation for share suites: ${testAnimationId}`)
        return
      }
    }
  } catch (error) {
    console.warn('⚠️  Could not fetch gallery animations:', error)
  }
  console.warn('⚠️  No public animation found — share/[id] suites will be skipped')
})

// ============================================================================
// Suite 1 — Editor /app (desktop 1280×800, requires auth)
// ============================================================================

test.describe('Suite 1 — Editor /app canvas render', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  // SVG statuses captured per-test in beforeEach for tests that need them
  let capturedSvgStatuses: Map<string, number>

  test.beforeEach(async ({ page }) => {
    capturedSvgStatuses = new Map()

    // Register listener before any navigation so we catch SVG requests from /app load
    page.on('response', (response) => {
      const url = response.url()
      if (url.includes('/assets/fields/') && url.endsWith('.svg')) {
        capturedSvgStatuses.set(url, response.status())
      }
    })

    await loginAsTestUser(page)
    await page.goto('/app')
    await page.locator('canvas').first().waitFor({ state: 'visible', timeout: 15000 })
    // Allow time for SVG image load and Konva paint
    await page.waitForTimeout(2500)
  })

  test('1a — canvas is present with non-zero dimensions', async ({ page }) => {
    const canvas = page.locator('canvas').first()
    await expect(canvas).toBeVisible()

    const box = await canvas.boundingBox()
    expect(box, 'Canvas has no bounding box').not.toBeNull()
    expect(box!.width, 'Canvas width is zero').toBeGreaterThan(0)
    expect(box!.height, 'Canvas height is zero').toBeGreaterThan(0)
  })

  test('1b — field SVG network request returns HTTP 200', async ({ request, baseURL }) => {
    if (capturedSvgStatuses.size === 0) {
      // SVG may have been served from disk cache (no network event) — verify directly
      const apiUrl = baseURL || process.env.BASE_URL || 'http://localhost:3000'
      const svgResponse = await request.get(`${apiUrl}/assets/fields/rugby-union.svg`)
      expect(
        svgResponse.status(),
        `Direct request for rugby-union.svg returned ${svgResponse.status()}`
      ).toBe(200)
      return
    }

    for (const [url, status] of capturedSvgStatuses.entries()) {
      expect(status, `SVG at ${url} returned HTTP ${status}`).toBe(200)
    }
  })

  test('1c — SVG asset path matches a known valid field asset', async ({ request, baseURL }) => {
    const knownPaths = [
      '/assets/fields/rugby-union.svg',
      '/assets/fields/rugby-league.svg',
      '/assets/fields/soccer.svg',
      '/assets/fields/american-football.svg',
    ]

    if (capturedSvgStatuses.size > 0) {
      const foundKnown = [...capturedSvgStatuses.keys()].some((url) =>
        knownPaths.some((p) => url.includes(p))
      )
      expect(
        foundKnown,
        `No captured SVG request matched a known field path. Got: ${[...capturedSvgStatuses.keys()].join(', ')}`
      ).toBe(true)
    } else {
      // Fallback: confirm at least one asset is reachable
      const apiUrl = baseURL || process.env.BASE_URL || 'http://localhost:3000'
      let anyOk = false
      for (const p of knownPaths) {
        const r = await request.get(`${apiUrl}${p}`)
        if (r.status() === 200) {
          anyOk = true
          break
        }
      }
      expect(anyOk, 'None of the known SVG field assets returned HTTP 200').toBe(true)
    }
  })

  test('1d — canvas centre pixel is NOT pure black (primary black screen detector)', async ({ page }) => {
    const pixel = await sampleCentrePixel(page)

    if (pixel === null) {
      await takeScreenshot(page, 'editor-pixel-sample-failed')
      test.skip(true, 'Cannot sample canvas pixel — getContext unavailable or canvas missing')
      return
    }

    if (isPureBlack(pixel)) {
      await takeScreenshot(page, 'editor-BLACK-SCREEN-detected')
    }

    expect(
      isPureBlack(pixel),
      `BLACK SCREEN detected on editor. Centre pixel: rgb(${pixel.r},${pixel.g},${pixel.b})`
    ).toBe(false)
  })

  test('1e — canvas centre pixel green channel ≥ 30 (dark-green pitch heuristic)', async ({ page }) => {
    const pixel = await sampleCentrePixel(page)

    if (pixel === null) {
      await takeScreenshot(page, 'editor-pixel-green-check-failed')
      test.skip(true, 'Cannot sample canvas pixel — skipping green channel check')
      return
    }

    expect(
      pixel.g,
      `Green channel ${pixel.g} is too low — pitch may not be rendering. Pixel: rgb(${pixel.r},${pixel.g},${pixel.b})`
    ).toBeGreaterThanOrEqual(30)
  })

  test('1f — diagnostic screenshot always captured', async ({ page }) => {
    await takeScreenshot(page, 'editor-canvas-diagnostic')
    // Always passes — produces a visual artifact for manual inspection
    expect(true).toBe(true)
  })
})

// ============================================================================
// Suite 2a — Share viewer /share/[id], mobile (375×667)
// ============================================================================

test.describe('Suite 2a — Share viewer /share/[id], mobile (375×667)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  let capturedSvgStatuses: Map<string, number>

  test.beforeEach(async ({ page }) => {
    test.skip(!testAnimationId, 'No public animation available — skipping share suite')

    capturedSvgStatuses = new Map()

    page.on('response', (response) => {
      const url = response.url()
      if (url.includes('/assets/fields/') && url.endsWith('.svg')) {
        capturedSvgStatuses.set(url, response.status())
      }
    })

    await page.goto(`/share/${testAnimationId}`)
    await page.locator('canvas').first().waitFor({ state: 'visible', timeout: 20000 })
    // Extra wait: ResizeObserver fires asynchronously after DOM is visible
    await page.waitForTimeout(3000)
  })

  test('2a-i — canvas is present with non-zero dimensions', async ({ page }) => {
    const canvas = page.locator('canvas').first()
    await expect(canvas).toBeVisible()

    const box = await canvas.boundingBox()
    expect(box, 'Canvas has no bounding box').not.toBeNull()
    expect(box!.width, 'Canvas width is zero').toBeGreaterThan(0)
    expect(box!.height, 'Canvas height is zero').toBeGreaterThan(0)
  })

  test('2a-ii — canvas width NOT stuck at 800px fallback on mobile (ResizeObserver detector)', async ({ page }) => {
    // If useShareCanvasSize's `if (vw <= 0 || vh <= 0) return` guard fires,
    // the canvas stays at the initial 800×600 fallback — wider than the 375px viewport.
    const canvasWidth = await page.evaluate((): number | null => {
      const canvas = document.querySelector('canvas')
      return canvas ? (canvas as HTMLCanvasElement).width : null
    })

    expect(canvasWidth, 'No canvas element found').not.toBeNull()
    expect(
      canvasWidth,
      `canvas.width is ${canvasWidth}px on 375px viewport — ResizeObserver guard may be firing (fallback 800px stuck)`
    ).toBeLessThanOrEqual(375)
  })

  test('2a-iii — field SVG returns HTTP 200', async ({ request, baseURL }) => {
    if (capturedSvgStatuses.size === 0) {
      // Cached response — verify asset reachability directly
      const apiUrl = baseURL || process.env.BASE_URL || 'http://localhost:3000'
      const svgResponse = await request.get(`${apiUrl}/assets/fields/rugby-union.svg`)
      expect(svgResponse.status()).toBe(200)
      return
    }

    for (const [url, status] of capturedSvgStatuses.entries()) {
      expect(status, `SVG at ${url} returned HTTP ${status}`).toBe(200)
    }
  })

  test('2a-iv — canvas centre pixel is NOT pure black (primary black screen detector)', async ({ page }) => {
    const pixel = await sampleCentrePixel(page)

    if (pixel === null) {
      await takeScreenshot(page, 'share-mobile-pixel-sample-failed')
      test.skip(true, 'Cannot sample canvas pixel — getContext unavailable or canvas missing')
      return
    }

    if (isPureBlack(pixel)) {
      await takeScreenshot(page, 'share-mobile-BLACK-SCREEN-detected')
    }

    expect(
      isPureBlack(pixel),
      `BLACK SCREEN detected on share/mobile. Centre pixel: rgb(${pixel.r},${pixel.g},${pixel.b})`
    ).toBe(false)
  })

  test('2a-v — canvas wrapper has non-zero dimensions (prevents bg-black outer bleed)', async ({ page }) => {
    // The inner position:relative div in ShareViewer wraps canvas + FloatingRemote.
    // If it collapses to 0×0, the outer bg-black container bleeds through.
    const wrapperSize = await page.evaluate((): { width: number; height: number } | null => {
      const canvas = document.querySelector('canvas')
      if (!canvas) return null
      const wrapper = canvas.parentElement
      if (!wrapper) return null
      return { width: wrapper.offsetWidth, height: wrapper.offsetHeight }
    })

    expect(wrapperSize, 'Canvas parent wrapper element not found').not.toBeNull()
    expect(wrapperSize!.width, 'Canvas wrapper width is zero').toBeGreaterThan(0)
    expect(wrapperSize!.height, 'Canvas wrapper height is zero').toBeGreaterThan(0)
  })

  test('2a-vi — diagnostic screenshot always captured', async ({ page }) => {
    await takeScreenshot(page, 'share-mobile-canvas-diagnostic')
    expect(true).toBe(true)
  })
})

// ============================================================================
// Suite 2b — Share viewer /share/[id], desktop (1280×800)
// ============================================================================

test.describe('Suite 2b — Share viewer /share/[id], desktop (1280×800)', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test.beforeEach(async ({ page }) => {
    test.skip(!testAnimationId, 'No public animation available — skipping share suite')
    await page.goto(`/share/${testAnimationId}`)
    await page.locator('canvas').first().waitFor({ state: 'visible', timeout: 20000 })
    await page.waitForTimeout(2500)
  })

  test('2b-i — canvas is present with non-zero dimensions', async ({ page }) => {
    const canvas = page.locator('canvas').first()
    await expect(canvas).toBeVisible()

    const box = await canvas.boundingBox()
    expect(box, 'Canvas has no bounding box').not.toBeNull()
    expect(box!.width, 'Canvas width is zero').toBeGreaterThan(0)
    expect(box!.height, 'Canvas height is zero').toBeGreaterThan(0)
  })

  test('2b-ii — canvas centre pixel is NOT pure black', async ({ page }) => {
    const pixel = await sampleCentrePixel(page)

    if (pixel === null) {
      await takeScreenshot(page, 'share-desktop-pixel-sample-failed')
      test.skip(true, 'Cannot sample canvas pixel — getContext unavailable or canvas missing')
      return
    }

    if (isPureBlack(pixel)) {
      await takeScreenshot(page, 'share-desktop-BLACK-SCREEN-detected')
    }

    expect(
      isPureBlack(pixel),
      `BLACK SCREEN detected on share/desktop. Centre pixel: rgb(${pixel.r},${pixel.g},${pixel.b})`
    ).toBe(false)
  })

  test('2b-iii — canvas wrapper has non-zero dimensions', async ({ page }) => {
    const wrapperSize = await page.evaluate((): { width: number; height: number } | null => {
      const canvas = document.querySelector('canvas')
      if (!canvas) return null
      const wrapper = canvas.parentElement
      if (!wrapper) return null
      return { width: wrapper.offsetWidth, height: wrapper.offsetHeight }
    })

    expect(wrapperSize, 'Canvas parent wrapper element not found').not.toBeNull()
    expect(wrapperSize!.width, 'Canvas wrapper width is zero').toBeGreaterThan(0)
    expect(wrapperSize!.height, 'Canvas wrapper height is zero').toBeGreaterThan(0)
  })

  test('2b-iv — diagnostic screenshot always captured', async ({ page }) => {
    await takeScreenshot(page, 'share-desktop-canvas-diagnostic')
    expect(true).toBe(true)
  })
})

// ============================================================================
// Suite 3 — SVG asset reachability (HTTP GET, no browser)
// ============================================================================

test.describe('Suite 3 — SVG asset reachability (infrastructure check)', () => {
  // These must exist for the app to function at all
  const primaryAssets = [
    '/assets/fields/rugby-union.svg',
    '/assets/fields/rugby-league.svg',
    '/assets/fields/soccer.svg',
    '/assets/fields/american-football.svg',
  ]

  // These are optional layout variants — 404 is a soft warning, not a hard failure
  const layoutVariants = [
    '/assets/fields/rugby-union-attack.svg',
    '/assets/fields/rugby-union-defence.svg',
    '/assets/fields/rugby-union-training.svg',
  ]

  for (const assetPath of primaryAssets) {
    test(`3 — ${assetPath} → HTTP 200 + SVG content-type`, async ({ request, baseURL }) => {
      const apiUrl = baseURL || process.env.BASE_URL || 'http://localhost:3000'
      const response = await request.get(`${apiUrl}${assetPath}`)

      expect(
        response.status(),
        `Expected HTTP 200 for ${assetPath}, got ${response.status()}`
      ).toBe(200)

      const contentType = response.headers()['content-type'] ?? ''
      expect(
        contentType,
        `Expected SVG content-type for ${assetPath}, got: "${contentType}"`
      ).toMatch(/image\/svg\+xml|text\/xml|application\/xml/)
    })
  }

  for (const variantPath of layoutVariants) {
    test(`3 — layout variant ${variantPath} (informational — 404 is a soft warning)`, async ({ request, baseURL }) => {
      const apiUrl = baseURL || process.env.BASE_URL || 'http://localhost:3000'
      const response = await request.get(`${apiUrl}${variantPath}`)

      if (response.status() === 404) {
        console.warn(`⚠️  Layout variant not found (404): ${variantPath}`)
        // Non-critical — Field.tsx only requests these for non-standard pitch layouts
        test.skip(true, `Layout variant ${variantPath} not present — non-critical`)
        return
      }

      expect(
        response.status(),
        `Unexpected status ${response.status()} for layout variant ${variantPath}`
      ).toBe(200)
    })
  }
})

// ============================================================================
// Suite 4 — ResizeObserver sizing guard (mobile 375×667)
// ============================================================================

test.describe('Suite 4 — ResizeObserver sizing guard (mobile)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test.beforeEach(async ({ page }) => {
    test.skip(!testAnimationId, 'No public animation available — skipping ResizeObserver suite')

    await page.goto(`/share/${testAnimationId}`)
    await page.locator('canvas').first().waitFor({ state: 'visible', timeout: 20000 })
    // Extra wait: ResizeObserver fires async after layout
    await page.waitForTimeout(4000)
  })

  test('4a — ShareViewer position:fixed container has non-zero clientWidth/clientHeight', async ({ page }) => {
    const containerDimensions = await page.evaluate((): {
      clientWidth: number
      clientHeight: number
      position: string
    } | null => {
      const canvas = document.querySelector('canvas')
      if (!canvas) return null

      // Walk up DOM to find the position:fixed container (ShareViewer's outer div)
      let el: HTMLElement | null = canvas.parentElement?.parentElement ?? null
      while (el && el !== document.body) {
        const style = window.getComputedStyle(el)
        if (style.position === 'fixed') {
          return {
            clientWidth: el.clientWidth,
            clientHeight: el.clientHeight,
            position: style.position,
          }
        }
        el = el.parentElement
      }

      // Fallback: report viewport dimensions
      return {
        clientWidth: document.documentElement.clientWidth,
        clientHeight: document.documentElement.clientHeight,
        position: 'fallback-no-fixed-ancestor',
      }
    })

    expect(containerDimensions, 'Cannot find canvas element').not.toBeNull()
    expect(
      containerDimensions!.clientWidth,
      `position:fixed container clientWidth is zero (position: ${containerDimensions!.position})`
    ).toBeGreaterThan(0)
    expect(
      containerDimensions!.clientHeight,
      `position:fixed container clientHeight is zero (position: ${containerDimensions!.position})`
    ).toBeGreaterThan(0)
  })

  test('4b — canvas.width attribute is NOT 800 (un-scaled ResizeObserver fallback)', async ({ page }) => {
    // useShareCanvasSize initialises at { width: 800, height: 600 }.
    // If the ResizeObserver guard `if (vw <= 0 || vh <= 0) return` fires on the
    // first observation, the canvas stays at 800. On a 375px viewport, 800 is
    // a definitive indicator the hook failed to compute a real size.
    const canvasWidth = await page.evaluate((): number | null => {
      const canvas = document.querySelector('canvas')
      return canvas ? (canvas as HTMLCanvasElement).width : null
    })

    expect(canvasWidth, 'No canvas element found').not.toBeNull()
    expect(
      canvasWidth,
      `canvas.width is 800 — ResizeObserver fallback was never cleared. Check useShareCanvasSize.ts:31`
    ).not.toBe(800)
    expect(
      canvasWidth,
      `canvas.width (${canvasWidth}) is ≥ 800 on a 375px viewport`
    ).toBeLessThan(800)
  })

  test('4c — diagnostic: log canvas dimensions and capture screenshot', async ({ page }) => {
    const dims = await page.evaluate((): Record<string, number | null> | null => {
      const canvas = document.querySelector('canvas')
      if (!canvas) return null
      const c = canvas as HTMLCanvasElement
      return {
        attrWidth: c.width,
        attrHeight: c.height,
        offsetWidth: c.offsetWidth,
        offsetHeight: c.offsetHeight,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      }
    })

    console.log('[Suite 4] ResizeObserver diagnostic:', JSON.stringify(dims, null, 2))
    await takeScreenshot(page, 'share-mobile-resize-observer-diagnostic')
    expect(true).toBe(true)
  })
})
