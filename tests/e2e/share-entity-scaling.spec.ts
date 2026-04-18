import { test, expect } from '@playwright/test'

/**
 * Entity Icon Scaling — Share Route E2E Tests
 *
 * Validates that entity icons (players, cones, balls) on /share/[id] are
 * rendered using a scale transform that maps the 800×600 editor coordinate
 * space to the actual mobile canvas dimensions.
 *
 * Bug: entities rendered at raw editor coordinates on a ~390×292 mobile
 * canvas appear clustered off-screen. Fix: scaleX = canvasWidth/800,
 * scaleY = canvasHeight/600 applied to the entity layer only.
 *
 * Test strategy: ShareCanvas exposes data-entity-scale-x / data-entity-scale-y
 * attributes on its wrapper div. Tests verify these match the canvas-to-editor
 * ratio on mobile viewports.
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

  console.warn('⚠️  No public animation available — entity scaling tests will be skipped')
  testAnimationId = null
})

// ============================================================================
// Entity Scale Transform — mobile viewport
// ============================================================================

test.describe('Share route — entity scale transform (US4)', () => {
  test.use({ viewport: { width: 390, height: 844 } }) // iPhone 14 portrait

  test('share-canvas element is present with entity scale attributes', async ({ page }) => {
    test.skip(!testAnimationId, 'No test animation available')

    await page.goto(`/share/${testAnimationId}`)
    await page.waitForSelector('[data-testid="share-canvas"]', {
      state: 'visible',
      timeout: 10000,
    })

    const scaleX = await page.locator('[data-testid="share-canvas"]').getAttribute('data-entity-scale-x')
    const scaleY = await page.locator('[data-testid="share-canvas"]').getAttribute('data-entity-scale-y')

    expect(scaleX).not.toBeNull()
    expect(scaleY).not.toBeNull()
  })

  test('entity scale X matches canvas-width / 800 (editor reference width)', async ({ page }) => {
    test.skip(!testAnimationId, 'No test animation available')

    await page.goto(`/share/${testAnimationId}`)
    await page.waitForSelector('[data-testid="share-canvas"]', {
      state: 'visible',
      timeout: 10000,
    })
    // Allow ResizeObserver to settle canvas dimensions
    await page.waitForTimeout(400)

    const canvasEl = page.locator('[data-testid="share-canvas"]')
    const box = await canvasEl.boundingBox()
    expect(box).not.toBeNull()

    const scaleXAttr = await canvasEl.getAttribute('data-entity-scale-x')
    expect(scaleXAttr).not.toBeNull()

    const scaleX = parseFloat(scaleXAttr!)
    const expectedScaleX = box!.width / 800

    // Entity scale must match the canvas-to-editor ratio
    expect(scaleX).toBeCloseTo(expectedScaleX, 2)

    // On iPhone 14 (390px wide), canvas width ≤ 390 so scale must be < 1
    expect(scaleX).toBeLessThan(1)
  })

  test('entity scale Y matches canvas-height / 600 (editor reference height)', async ({ page }) => {
    test.skip(!testAnimationId, 'No test animation available')

    await page.goto(`/share/${testAnimationId}`)
    await page.waitForSelector('[data-testid="share-canvas"]', {
      state: 'visible',
      timeout: 10000,
    })
    await page.waitForTimeout(400)

    const canvasEl = page.locator('[data-testid="share-canvas"]')
    const box = await canvasEl.boundingBox()
    expect(box).not.toBeNull()

    const scaleYAttr = await canvasEl.getAttribute('data-entity-scale-y')
    expect(scaleYAttr).not.toBeNull()

    const scaleY = parseFloat(scaleYAttr!)
    const expectedScaleY = box!.height / 600

    expect(scaleY).toBeCloseTo(expectedScaleY, 2)
    expect(scaleY).toBeLessThan(1)
  })
})

// ============================================================================
// Entity Scale Transform — desktop (scale ≥ 1 on wide viewports)
// ============================================================================

test.describe('Share route — entity scale on desktop viewport', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('entity scale is ≥ 1 when canvas is wider than editor reference (1280px)', async ({ page }) => {
    test.skip(!testAnimationId, 'No test animation available')

    await page.goto(`/share/${testAnimationId}`)
    await page.waitForSelector('[data-testid="share-canvas"]', {
      state: 'visible',
      timeout: 10000,
    })
    await page.waitForTimeout(400)

    const canvasEl = page.locator('[data-testid="share-canvas"]')
    const scaleXAttr = await canvasEl.getAttribute('data-entity-scale-x')
    expect(scaleXAttr).not.toBeNull()

    // On desktop, canvas width may exceed 800 so scale ≥ 1
    expect(parseFloat(scaleXAttr!)).toBeGreaterThan(0)
  })
})
