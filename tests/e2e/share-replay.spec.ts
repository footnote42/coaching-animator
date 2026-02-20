import { test, expect } from '@playwright/test'

/**
 * Share Route E2E Tests
 *
 * Validates the /share/[id] mobile-optimised watch experience:
 * - Auto-play starts within 500ms of load (no user interaction required)
 * - Navigation bar is absent from DOM
 * - Canvas fills viewport width on 375px (no horizontal overflow)
 * - Play/pause button meets ≥48px touch target requirement
 * - Pause and restart controls are functional
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

    // Wait for canvas to be present, then check that a play/pause toggle appears in playing state
    // ShareViewer sets isPlaying=true after 100ms; by 500ms it should be playing
    await page.waitForTimeout(500)

    // The button label switches to "Pause" when playing
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
// Mobile viewport — canvas and touch targets
// ============================================================================

test.describe('Share route — mobile viewport (375×667)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('canvas fills viewport width without horizontal overflow', async ({ page }) => {
    test.skip(!testAnimationId, 'No test animation available')

    await page.goto(`/share/${testAnimationId}`)
    await page.waitForSelector('canvas', { state: 'visible', timeout: 10000 })

    // Poll until canvas resizes from SSR default
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

  test('play/pause button meets 48×48px touch target requirement', async ({ page }) => {
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
    expect(box!.width).toBeGreaterThanOrEqual(48)
    expect(box!.height).toBeGreaterThanOrEqual(48)
  })
})

// ============================================================================
// Controls — pause and restart
// ============================================================================

test.describe('Share route — controls', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('pause button stops playback', async ({ page }) => {
    test.skip(!testAnimationId, 'No test animation available')

    await page.goto(`/share/${testAnimationId}`)

    // Wait for auto-play to kick in
    const pauseButton = page.locator('button[aria-label="Pause"]')
    await expect(pauseButton).toBeVisible({ timeout: 2000 })

    await pauseButton.click()

    // After pause, the button should switch to Play
    await expect(page.locator('button[aria-label="Play"]')).toBeVisible({ timeout: 1000 })
  })

  test('restart button resumes playback from beginning', async ({ page }) => {
    test.skip(!testAnimationId, 'No test animation available')

    await page.goto(`/share/${testAnimationId}`)

    // Pause first
    const pauseButton = page.locator('button[aria-label="Pause"]')
    await expect(pauseButton).toBeVisible({ timeout: 2000 })
    await pauseButton.click()

    // Click Restart
    await page.locator('button[aria-label="Restart"]').click()

    // Should be playing again
    await expect(page.locator('button[aria-label="Pause"]')).toBeVisible({ timeout: 1000 })
  })

  test('coaching notes and frame strip absent from DOM', async ({ page }) => {
    test.skip(!testAnimationId, 'No test animation available')

    await page.goto(`/share/${testAnimationId}`)
    await page.waitForLoadState('networkidle')

    // No "Coaching Notes" heading
    await expect(page.getByRole('heading', { name: /coaching notes/i })).toHaveCount(0)

    // No speed buttons (0.5x / 2x are share-stripped)
    await expect(page.locator('button', { hasText: '0.5x' })).toHaveCount(0)
  })
})
