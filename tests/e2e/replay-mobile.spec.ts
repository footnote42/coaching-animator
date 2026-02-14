import { test, expect } from '@playwright/test'

/**
 * Mobile Replay E2E Tests
 *
 * Validates responsive canvas sizing and mobile-optimized controls
 * across Chromium, Firefox, and WebKit browsers.
 *
 * Test Coverage:
 * - Mobile (375×667): Canvas fits viewport, touch targets ≥48px
 * - Tablet (500×800): 4:3 aspect ratio preservation
 * - Desktop (1920×1080): Maximum 800×600 canvas dimensions
 *
 * Related: specs/005-incremental-improvements/MOBILE_REPLAY_PLAN.md
 */

// ============================================================================
// Test Data Setup
// ============================================================================

let testAnimationId: string | null = null

test.beforeAll(async ({ baseURL, request }) => {
  const apiUrl = baseURL || process.env.BASE_URL || 'http://localhost:3000'

  try {
    // Try to fetch a public animation from the gallery
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

  // Fallback: If no public animations found, tests will skip
  console.warn('⚠️  No public animation available - tests will be skipped')
  console.warn('   To run these tests, ensure at least one public animation exists in the gallery')
  testAnimationId = null
})

// ============================================================================
// Mobile Viewport Tests (375×667 - iPhone SE)
// ============================================================================

test.describe('Mobile viewport (375×667)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('canvas fits viewport without horizontal scroll', async ({ page }) => {
    test.skip(!testAnimationId, 'No test animation available')

    await page.goto(`/replay/${testAnimationId}`)
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('canvas', { state: 'visible', timeout: 10000 })

    const canvas = page.locator('canvas').first()

    // Poll until canvas width is in expected range (or timeout after 5s)
    // This handles the timing gap between initial render (800px) and useEffect resize
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
      .toBeLessThanOrEqual(343)

    const box = await canvas.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.width).toBeGreaterThan(300) // Reasonable minimum

    // Verify no horizontal scrollbar
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.body.scrollWidth > document.body.clientWidth
    })
    expect(hasHorizontalScroll).toBe(false)
  })

  test('play/pause button meets 48×48px touch target requirement', async ({ page }) => {
    test.skip(!testAnimationId, 'No test animation available')

    await page.goto(`/replay/${testAnimationId}`)
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('button[title*="Play"], button[title*="Pause"]', {
      state: 'visible',
      timeout: 5000,
    })

    const playButton = page.locator('button[title*="Play"], button[title*="Pause"]').first()
    const box = await playButton.boundingBox()
    expect(box).not.toBeNull()

    // WCAG Level AAA requires ≥48×48px touch targets
    expect(box!.width).toBeGreaterThanOrEqual(48)
    expect(box!.height).toBeGreaterThanOrEqual(48)
  })
})

// ============================================================================
// Tablet Viewport Test (500×800)
// ============================================================================

test.describe('Tablet viewport (500×800)', () => {
  test.use({ viewport: { width: 500, height: 800 } })

  test('canvas maintains 4:3 aspect ratio', async ({ page }) => {
    test.skip(!testAnimationId, 'No test animation available')

    await page.goto(`/replay/${testAnimationId}`)
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('canvas', { state: 'visible', timeout: 10000 })
    await page.waitForTimeout(200) // Allow React-Konva to stabilize

    const canvas = page.locator('canvas').first()
    const box = await canvas.boundingBox()
    expect(box).not.toBeNull()

    // Verify 4:3 aspect ratio (1.333...) with ±0.01 tolerance
    const ratio = box!.width / box!.height
    expect(ratio).toBeCloseTo(4 / 3, 2) // toBeCloseTo with 2 decimal precision
  })
})

// ============================================================================
// Desktop Viewport Test (1920×1080)
// ============================================================================

test.describe('Desktop viewport (1920×1080)', () => {
  test.use({ viewport: { width: 1920, height: 1080 } })

  test('canvas caps at 800×600 maximum dimensions', async ({ page }) => {
    test.skip(!testAnimationId, 'No test animation available')

    await page.goto(`/replay/${testAnimationId}`)
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('canvas', { state: 'visible', timeout: 10000 })
    await page.waitForTimeout(200) // Allow React-Konva to stabilize

    const canvas = page.locator('canvas').first()
    const box = await canvas.boundingBox()
    expect(box).not.toBeNull()

    // Desktop should cap at 800×600
    expect(box!.width).toBe(800)
    expect(box!.height).toBe(600)
  })
})
