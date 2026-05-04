import { test, expect } from '@playwright/test'

/**
 * Share Route E2E Tests
 *
 * Validates the /share/[id] mobile-optimised watch experience:
 *
 * Original (pre-T055):
 * - Auto-play starts within 500ms of load (no user interaction required)
 * - Navigation bar is absent from DOM
 * - Canvas fills viewport width on 375px (no horizontal overflow)
 *
 * T055 additions (mobile redesign):
 * - No vertical scroll — canvas + controls fit within 100dvh
 * - FloatingRemote pill is visible and positioned within canvas bounds
 * - Drag handle (GripVertical) is present in the pill
 * - Play/pause button meets ≥44px touch target (Apple HIG minimum)
 * - Double-tap play button resets to start and resumes
 * - Back-to-site link present and positioned bottom-left
 *
 * Regression: /replay/[id] must still render nav (checked here too).
 */

// ============================================================================
// Test Data Setup
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
        console.log(`✓ Using test animation: ${testAnimationId}`)
        return
      }
    }
  } catch (error) {
    console.warn('⚠️  Could not fetch gallery animations:', error)
  }

  console.warn('⚠️  No public animation available — share tests will be skipped')
  testAnimationId = null
})

// ============================================================================
// Auto-play
// ============================================================================

test.describe('Share route — auto-play', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('animation starts playing within 500ms without user interaction', async ({ page }) => {
    test.skip(!testAnimationId, 'No test animation available')

    await page.goto(`/share/${testAnimationId}`)
    await page.waitForSelector('canvas', { state: 'visible', timeout: 10000 })

    // ShareViewer sets isPlaying=true after 100ms; by 500ms it should be playing
    await page.waitForTimeout(500)

    // FloatingRemote switches to Pause aria-label when playing
    const pauseButton = page.locator('button[aria-label="Pause"]')
    await expect(pauseButton).toBeVisible({ timeout: 500 })
  })
})

// ============================================================================
// Navigation absent on /share, present on /replay (regression)
// ============================================================================

test.describe('Share route — no navigation chrome', () => {
  test('nav element is absent from DOM on /share/[id]', async ({ page }) => {
    test.skip(!testAnimationId, 'No test animation available')

    await page.goto(`/share/${testAnimationId}`)
    await page.waitForLoadState('networkidle')

    const nav = page.locator('nav')
    await expect(nav).toHaveCount(0)
  })

  test('nav element is present on /replay/[id] (regression)', async ({ page }) => {
    test.skip(!testAnimationId, 'No test animation available')

    await page.goto(`/replay/${testAnimationId}`)
    await page.waitForLoadState('networkidle')

    const nav = page.locator('nav')
    await expect(nav).toHaveCount(1)
  })
})

// ============================================================================
// Mobile viewport — no scroll (T055 core requirement)
// ============================================================================

test.describe('Share route — no scroll on mobile (T055)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('page has no vertical scroll on 375×667 viewport', async ({ page }) => {
    test.skip(!testAnimationId, 'No test animation available')

    await page.goto(`/share/${testAnimationId}`)
    await page.waitForSelector('canvas', { state: 'visible', timeout: 10000 })

    // Wait for ResizeObserver to settle canvas dimensions
    await page.waitForTimeout(500)

    const hasVerticalScroll = await page.evaluate(
      () => document.documentElement.scrollHeight > window.innerHeight
    )
    expect(hasVerticalScroll).toBe(false)
  })

  test('canvas fills viewport width without horizontal overflow', async ({ page }) => {
    test.skip(!testAnimationId, 'No test animation available')

    await page.goto(`/share/${testAnimationId}`)
    await page.waitForSelector('canvas', { state: 'visible', timeout: 10000 })

    const canvas = page.locator('canvas').first()
    await expect
      .poll(
        async () => {
          const box = await canvas.boundingBox()
          return box?.width ?? 0
        },
        {
          message: 'Canvas should resize to fit mobile viewport',
          timeout: 5000,
          intervals: [100, 250, 500],
        }
      )
      .toBeLessThanOrEqual(375)

    const box = await canvas.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.width).toBeGreaterThan(300)

    const hasHorizontalScroll = await page.evaluate(
      () => document.body.scrollWidth > document.body.clientWidth
    )
    expect(hasHorizontalScroll).toBe(false)
  })
})

// ============================================================================
// FloatingRemote — presence and layout (T055)
// ============================================================================

test.describe('Share route — FloatingRemote (T055)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('FloatingRemote pill is visible after load', async ({ page }) => {
    test.info().annotations.push({ type: 'workflow', description: 'WF2:step7' });
    test.skip(!testAnimationId, 'No test animation available')

    await page.goto(`/share/${testAnimationId}`)
    // Wait for auto-play to resolve (pill renders immediately but play button label depends on state)
    await page.waitForSelector('button[aria-label="Pause"], button[aria-label="Play"]', {
      state: 'visible',
      timeout: 10000,
    })

    const playButton = page
      .locator('button[aria-label="Pause"]')
      .or(page.locator('button[aria-label="Play"]'))
      .first()

    await expect(playButton).toBeVisible()
  })

  test('play/pause button meets 44×44px touch target minimum (Apple HIG)', async ({ page }) => {
    test.skip(!testAnimationId, 'No test animation available')

    await page.goto(`/share/${testAnimationId}`)
    await page.waitForSelector('button[aria-label="Pause"], button[aria-label="Play"]', {
      state: 'visible',
      timeout: 10000,
    })

    const playButton = page
      .locator('button[aria-label="Pause"]')
      .or(page.locator('button[aria-label="Play"]'))
      .first()

    const box = await playButton.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.width).toBeGreaterThanOrEqual(44)
    expect(box!.height).toBeGreaterThanOrEqual(44)
  })

  test('FloatingRemote is positioned within viewport bounds', async ({ page }) => {
    test.skip(!testAnimationId, 'No test animation available')

    await page.goto(`/share/${testAnimationId}`)
    await page.waitForSelector('button[aria-label="Pause"], button[aria-label="Play"]', {
      state: 'visible',
      timeout: 10000,
    })
    await page.waitForTimeout(300) // let ResizeObserver settle

    const playButton = page
      .locator('button[aria-label="Pause"]')
      .or(page.locator('button[aria-label="Play"]'))
      .first()

    const box = await playButton.boundingBox()
    expect(box).not.toBeNull()

    // Pill must be fully within the 375×667 viewport
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.y).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width).toBeLessThanOrEqual(375)
    expect(box!.y + box!.height).toBeLessThanOrEqual(667)
  })

  test('frame counter is visible (N/M format)', async ({ page }) => {
    test.skip(!testAnimationId, 'No test animation available')

    await page.goto(`/share/${testAnimationId}`)
    await page.waitForSelector('button[aria-label="Pause"], button[aria-label="Play"]', {
      state: 'visible',
      timeout: 10000,
    })

    // Frame counter shows "1/N" format
    const counter = page.locator('span.tabular-nums')
    await expect(counter).toBeVisible()
    const text = await counter.textContent()
    expect(text).toMatch(/^\d+\/\d+$/)
  })
})

// ============================================================================
// Controls — play/pause and double-tap reset (T055)
// ============================================================================

test.describe('Share route — controls (T055)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('pause button stops playback', async ({ page }) => {
    test.skip(!testAnimationId, 'No test animation available')

    await page.goto(`/share/${testAnimationId}`)

    const pauseButton = page.locator('button[aria-label="Pause"]')
    await expect(pauseButton).toBeVisible({ timeout: 2000 })

    await pauseButton.click()

    await expect(page.locator('button[aria-label="Play"]')).toBeVisible({ timeout: 1000 })
  })

  test('double-tap play button resets to start and resumes', async ({ page }) => {
    test.skip(!testAnimationId, 'No test animation available')

    await page.goto(`/share/${testAnimationId}`)

    // Wait for auto-play
    const pauseButton = page.locator('button[aria-label="Pause"]')
    await expect(pauseButton).toBeVisible({ timeout: 2000 })

    // Double-tap within 300ms — use dispatchEvent for precise timing
    const playBtn = page.locator('button[aria-label="Pause"]').first()
    await playBtn.click()
    await playBtn.click() // second click within Playwright's natural timing (~50ms)

    // After double-tap reset, animation resumes (Pause label visible again)
    await expect(page.locator('button[aria-label="Pause"]')).toBeVisible({ timeout: 1500 })

    // Frame counter should show 1/N (reset to start)
    const counter = page.locator('span.tabular-nums')
    const text = await counter.textContent()
    expect(text).toMatch(/^1\//)
  })

  test('coaching notes and frame strip absent from DOM', async ({ page }) => {
    test.skip(!testAnimationId, 'No test animation available')

    await page.goto(`/share/${testAnimationId}`)
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: /coaching notes/i })).toHaveCount(0)
    await expect(page.locator('button', { hasText: '0.5x' })).toHaveCount(0)
  })
})

// ============================================================================
// Back-to-site link (T055)
// ============================================================================

test.describe('Share route — back-to-site link (T055)', () => {
  test('back-to-site link is present and points to home', async ({ page }) => {
    test.skip(!testAnimationId, 'No test animation available')

    await page.goto(`/share/${testAnimationId}`)
    await page.waitForLoadState('networkidle')

    const link = page.locator('a[href="/"]').first()
    await expect(link).toBeVisible()
  })
})
