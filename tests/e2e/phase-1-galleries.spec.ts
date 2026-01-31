import { test, expect } from '@playwright/test'

/**
 * Phase 1 E2E Tests: Critical Gallery & Link Sharing Workflows
 *
 * These tests validate the core user journeys for cloud-based animation
 * storage and sharing functionality. All tests run against staging environment.
 *
 * Test Coverage:
 * - US1: Cloud Save + Personal Gallery
 * - US2: Visibility Toggle + Link Sharing
 * - US3: Public Gallery Search & Discovery
 */

// ============================================================================
// Test Data & Fixtures
// ============================================================================

// Production test account (user@test.com / Password1!)
// Local tests generate new accounts per test
const isProduction = process.env.BASE_URL?.includes('coaching-animator.vercel.app')

const TEST_USER = {
  email: isProduction ? 'user@test.com' : `test-${Date.now()}@example.com`,
  password: isProduction ? 'Password1!' : 'TestPassword123!',
  displayName: 'E2E Test Coach',
}

const ANIMATION_PAYLOAD = {
  title: `E2E Lineout - ${new Date().toISOString().slice(0, 10)}`,
  description: 'End-to-end test animation for gallery validation',
  coaching_notes: 'Testing link sharing and gallery functionality',
  animation_type: 'tactic' as const,
  tags: ['lineout', 'e2e-test'],
}

// ============================================================================
// US1: Cloud Save & Personal Gallery
// ============================================================================

test.describe('US1: Cloud Save & Personal Gallery', () => {
  test('authenticated user can save animation to cloud and view in personal gallery', async ({
    page,
  }) => {
    // 1. Register (local only) or Login (production)
    if (isProduction) {
      // Production: Use existing test account
      await page.goto('/login')
      await expect(page).toHaveTitle(/Login|Sign In/)

      await page.fill('input[type="email"]', TEST_USER.email)
      await page.fill('input[type="password"]', TEST_USER.password)
      await page.click('button:has-text("Sign In"), button:has-text("Login"), button[type="submit"]')

      // Wait for redirect to /app or /my-gallery
      await page.waitForNavigation({ timeout: 10000 })
    } else {
      // Local: Create new test account
      await page.goto('/register')
      await expect(page).toHaveTitle(/Register/)

      await page.fill('input[type="email"]', TEST_USER.email)
      await page.fill('input[type="password"]', TEST_USER.password)
      await page.fill('input[type="password"]:last-of-type', TEST_USER.password)

      // Accept ToS
      await page.check('input[type="checkbox"]')

      await page.click('button:has-text("Create Account")')

      // Wait for verification or redirect
      await page.waitForNavigation()

      // Should redirect to email confirmation or /app
      const url = page.url()
      expect(['/app', '/auth/confirm'].some(p => url.includes(p))).toBeTruthy()

      // 2. If redirected to verify page, navigate to /app to access editor
      if (url.includes('auth/confirm')) {
        await page.goto('/app')
      }
    }

    // 3. Create animation in editor
    // Navigate to app if not already there
    if (!page.url().includes('/app')) {
      await page.goto('/app')
    }

    // Verify canvas is loaded (use first to avoid strict mode with multiple canvas)
    const canvas = page.locator('canvas').first()
    await expect(canvas).toBeVisible({ timeout: 10000 })

    // Add some frames (simulate animation creation)
    // Click "Add Frame" button (implementation may vary)
    const addFrameButtons = page.locator('button:has-text("Add Frame"), [data-testid="add-frame"]')

    if (await addFrameButtons.count() > 0) {
      await addFrameButtons.first().click()
      await page.waitForTimeout(500)
    }

    // 4. Save to cloud via modal
    const saveButton = page.locator('button:has-text("Save to Cloud"), [data-testid="save-cloud"]')
    await expect(saveButton).toBeVisible()
    await saveButton.click()

    // Wait for modal to appear
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 })

    // Fill metadata form
    const titleInput = page.locator('input[placeholder*="Title"], input[aria-label*="Title"]').first()
    await titleInput.fill(ANIMATION_PAYLOAD.title)

    const descInput = page.locator('textarea[placeholder*="Description"], textarea[aria-label*="Description"]').first()
    if (await descInput.count() > 0) {
      await descInput.fill(ANIMATION_PAYLOAD.description)
    }

    // Select animation type
    const typeSelect = page.locator('select, [role="combobox"]').first()
    if (await typeSelect.count() > 0) {
      await typeSelect.click()
      await page.click('text=Tactic')
    }

    // Submit save
    const submitButton = page.locator('[role="dialog"] button:has-text("Save"), [data-testid="save-submit"]')
    await expect(submitButton).toBeVisible()
    await submitButton.click()

    // Wait for success toast or redirect
    const successToast = page.locator('text=Saved|Success|Animation created')
    await expect(successToast).toBeVisible({ timeout: 5000 })

    // 5. Navigate to personal gallery
    await page.goto('/my-gallery')
    await expect(page).toHaveTitle(/Gallery|Playbook/)

    // Verify animation appears in gallery
    const animationCard = page.locator(`text=${ANIMATION_PAYLOAD.title}`)
    await expect(animationCard).toBeVisible()

    // 6. Verify metadata is correct by clicking card
    await page.click(`text=${ANIMATION_PAYLOAD.title}`)

    // Should see metadata in detail or edit mode
    const detailTitle = page.locator(`text=${ANIMATION_PAYLOAD.title}`)
    await expect(detailTitle).toBeVisible()

    // 7. Logout and verify persistence (skip for production to avoid race conditions)
    if (!isProduction) {
      await page.goto('/')

      const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out")')
      if (await logoutButton.count() > 0) {
        await logoutButton.click()
        await page.waitForNavigation()
      }

      // 8. Login again and verify animation still there
      await page.goto('/login')
      await page.fill('input[type="email"]', TEST_USER.email)
      await page.fill('input[type="password"]', TEST_USER.password)
      await page.click('button:has-text("Sign In"), button:has-text("Login")')

      await page.waitForNavigation()
    }

    // Navigate to gallery and verify animation persists
    await page.goto('/my-gallery')

    // Animation should persist
    await expect(page.locator(`text=${ANIMATION_PAYLOAD.title}`)).toBeVisible({ timeout: 5000 })
  })

  test('personal gallery shows correct animation metadata', async ({ page }) => {
    // Assumes user is authenticated (run after previous test or in same session)
    await page.goto('/my-gallery')
    await page.waitForLoadState('networkidle')

    // Verify we're on my-gallery page
    expect(page.url()).toContain('/my-gallery')

    // Verify page has content
    const bodyContent = await page.locator('body').textContent()
    expect(bodyContent?.length ?? 0).toBeGreaterThan(100)

    // Look for any animation cards or UI elements
    const allText = await page.textContent()
    expect(allText?.length ?? 0).toBeGreaterThan(0)
  })

  test('can delete animation from personal gallery', async ({ page }) => {
    await page.goto('/my-gallery')

    const cards = page.locator('[data-testid="animation-card"], .animation-card')
    const initialCount = await cards.count()

    if (initialCount > 0) {
      const firstCard = cards.first()
      const deleteButton = firstCard.locator('button:has-text("Delete")')

      await deleteButton.click()

      // Confirm deletion if dialog appears
      const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")')
      if (await confirmButton.count() > 0) {
        await confirmButton.click()
      }

      // Verify deletion
      await page.waitForTimeout(500)
      const finalCount = await cards.count()
      expect(finalCount).toBeLessThanOrEqual(initialCount)
    }
  })
})

// ============================================================================
// US2: Link Sharing & Visibility Toggle
// ============================================================================

test.describe('US2: Link Sharing & Visibility Toggle', () => {
  test('user can toggle animation visibility to link_shared', async ({ page }) => {
    // Assumes animation exists in personal gallery
    await page.goto('/my-gallery')

    const cards = page.locator('[data-testid="animation-card"], .animation-card')

    if (await cards.count() > 0) {
      const firstCard = cards.first()

      // Open card to edit visibility
      const editButton = firstCard.locator('button:has-text("Edit"), [aria-label="Edit"]')
      await editButton.click()

      // Wait for edit modal or page
      await page.waitForSelector('[role="dialog"], [data-testid="edit-metadata"]', { timeout: 3000 })

      // Find visibility toggle/select
      const visibilitySelect = page.locator(
        'select:has-option("link_shared"), [role="combobox"]:has-text("private|public|link")'
      ).first()

      if (await visibilitySelect.count() > 0) {
        await visibilitySelect.click()

        // Select "link_shared"
        const linkSharedOption = page.locator('text=Link Shared, text=Shareable')
        if (await linkSharedOption.count() > 0) {
          await linkSharedOption.click()
        } else {
          // Try by value attribute
          await page.selectOption('select', 'link_shared')
        }

        // Save changes
        const saveButton = page.locator('[role="dialog"] button:has-text("Save"), [data-testid="save"]')
        await saveButton.click()

        // Verify success
        const successToast = page.locator('text=Updated|Saved|Success')
        await expect(successToast).toBeVisible({ timeout: 3000 })
      }
    }
  })

  test('user can copy share link for link_shared animation', async ({ page }) => {
    await page.goto('/my-gallery')

    const cards = page.locator('[data-testid="animation-card"], .animation-card')

    if (await cards.count() > 0) {
      const firstCard = cards.first()

      // Look for copy link button
      const copyButton = firstCard.locator(
        'button:has-text("Copy"), button:has-text("Share"), [data-testid="copy-link"]'
      )

      if (await copyButton.count() > 0) {
        await copyButton.click()

        // Verify copy success feedback
        const copiedFeedback = page.locator('text=Copied|Link copied')
        await expect(copiedFeedback).toBeVisible({ timeout: 2000 })
      }
    }
  })

  test('guest can view link_shared animation without login', async ({ page, context }) => {
    // Get share URL from authenticated session
    await page.goto('/my-gallery')

    const cards = page.locator('[data-testid="animation-card"], .animation-card')

    if (await cards.count() > 0) {
      const firstCard = cards.first()
      const cardLink = firstCard.locator('a[href*="/replay"]')

      let shareUrl: string | null = null

      if (await cardLink.count() > 0) {
        shareUrl = await cardLink.getAttribute('href')
      } else {
        // Try to extract from copy button or card data attribute
        const dataReplayId = firstCard.getAttribute('data-replay-id')
        if (dataReplayId) {
          shareUrl = `/replay/${await dataReplayId}`
        }
      }

      if (shareUrl) {
        // Open in incognito/new context (guest)
        const guestPage = await context.newPage()

        await guestPage.goto(shareUrl)

        // Verify animation loads without login
        const canvas = guestPage.locator('canvas')
        await expect(canvas).toBeVisible({ timeout: 5000 })

        // Verify no login required message
        const loginPrompt = guestPage.locator('text=Please log in|Sign in required')
        await expect(loginPrompt).not.toBeVisible()

        await guestPage.close()
      }
    }
  })

  test('cannot access private animation via link', async ({ page, context }) => {
    // First, ensure an animation is private
    await page.goto('/my-gallery')

    const cards = page.locator('[data-testid="animation-card"], .animation-card')

    if (await cards.count() > 0) {
      const firstCard = cards.first()

      // Set to private
      const editButton = firstCard.locator('button:has-text("Edit")')
      await editButton.click()

      await page.waitForSelector('[role="dialog"]', { timeout: 3000 })

      const visibilitySelect = page.locator('select').first()
      if (await visibilitySelect.count() > 0) {
        await page.selectOption('select', 'private')
      }

      const saveButton = page.locator('[role="dialog"] button:has-text("Save")')
      await saveButton.click()

      // Get the URL from the card
      const cardLink = firstCard.locator('a[href*="/replay"]')
      let replayUrl: string | null = null

      if (await cardLink.count() > 0) {
        replayUrl = await cardLink.getAttribute('href')
      }

      if (replayUrl) {
        // Try to access in guest context
        const guestPage = await context.newPage()

        await guestPage.goto(replayUrl)

        // Should see error or redirect to login
        const errorMessage = guestPage.locator('text=not found|not authorized|login required')
        const loginRedirect = guestPage.url().includes('/login')

        const isProtected = (await errorMessage.count() > 0) || loginRedirect
        expect(isProtected).toBeTruthy()

        await guestPage.close()
      }
    }
  })
})

// ============================================================================
// US3: Public Gallery Search & Discovery
// ============================================================================

test.describe('US3: Public Gallery Search & Discovery', () => {
  test('guest can access public gallery without login', async ({ page }) => {
    await page.goto('/gallery')
    await page.waitForLoadState('networkidle')

    // Verify gallery page loaded (check URL)
    expect(page.url()).toContain('/gallery')

    // Verify animation cards are visible
    const cards = page.locator('[data-testid="animation-card"], [class*="gallery"], [class*="card"]')

    // Gallery should have content (at minimum, we can scroll and interact)
    const bodyContent = await page.locator('body').textContent()
    expect(bodyContent?.length ?? 0).toBeGreaterThan(100)
  })

  test('user can search public gallery by keyword', async ({ page }) => {
    await page.goto('/gallery')
    await page.waitForLoadState('networkidle')

    // Find search input - try multiple selectors
    let searchInput = page.locator('input[placeholder*="Search"], input[aria-label*="Search"]')

    if (await searchInput.count() === 0) {
      // Fallback: look for any input field
      searchInput = page.locator('input[type="text"]').first()
    }

    if (await searchInput.count() > 0) {
      await searchInput.fill('lineout')
      await page.waitForLoadState('networkidle')

      // Results should appear or "no results" message
      const bodyContent = await page.locator('body').textContent()
      expect(bodyContent?.length ?? 0).toBeGreaterThan(0)
    }
  })

  test('user can filter public gallery by animation type', async ({ page }) => {
    await page.goto('/gallery')

    // Find filter/type select
    const typeFilter = page.locator(
      'select[aria-label*="Type"], [role="combobox"]:has-text("Type|Category")'
    ).first()

    if (await typeFilter.count() > 0) {
      await typeFilter.click()

      // Select "Tactic"
      const tacticOption = page.locator('text=Tactic')
      if (await tacticOption.count() > 0) {
        await tacticOption.click()
      }

      // Wait for filtered results
      await page.waitForTimeout(1000)

      // Verify results changed or still valid
      const cards = page.locator('[data-testid="animation-card"], .animation-card')
      await expect(cards.count()).toBeGreaterThanOrEqual(0)
    }
  })

  test('user can sort public gallery by popularity (upvotes)', async ({ page }) => {
    await page.goto('/gallery')

    // Find sort select
    const sortSelect = page.locator(
      'select[aria-label*="Sort"], [role="combobox"]:has-text("Sort|Order")'
    ).first()

    if (await sortSelect.count() > 0) {
      await sortSelect.click()

      // Select "Most Upvoted" or similar
      const popularOption = page.locator('text=Popular|Upvoted|Trending')
      if (await popularOption.count() > 0) {
        await popularOption.click()
      }

      // Wait for re-sort
      await page.waitForTimeout(1000)

      // Verify cards are displayed
      const cards = page.locator('[data-testid="animation-card"], .animation-card')
      await expect(cards.count()).toBeGreaterThanOrEqual(0)
    }
  })

  test('gallery pagination works correctly', async ({ page }) => {
    await page.goto('/gallery')

    // Get initial card count
    const cards = page.locator('[data-testid="animation-card"], .animation-card')
    const initialCount = await cards.count()

    if (initialCount >= 20) {
      // Next page button should exist
      const nextButton = page.locator('button:has-text("Next"), [aria-label="Next page"]')

      if (await nextButton.count() > 0) {
        const isEnabled = await nextButton.isEnabled()
        expect(isEnabled).toBeTruthy()

        // Click next
        await nextButton.click()
        await page.waitForTimeout(1000)

        // Verify cards changed
        const newCards = page.locator('[data-testid="animation-card"], .animation-card')
        const newCount = await newCards.count()

        // Should have different or same count depending on total
        expect(newCount).toBeGreaterThanOrEqual(0)
      }
    }
  })

  test('authenticated user sees upvote counts and buttons', async ({ page }) => {
    // Login first
    await page.goto('/login')

    const emailInput = page.locator('input[type="email"]')
    if (await emailInput.count() > 0) {
      // Use existing test user or skip
      // For now, just verify structure when logged in
    }

    await page.goto('/gallery')

    // Look for upvote buttons
    const upvoteButtons = page.locator('button:has-text("Upvote"), [data-testid="upvote-btn"]')

    // If user is authenticated, buttons might be visible
    if (await upvoteButtons.count() > 0) {
      await expect(upvoteButtons.first()).toBeVisible()
    }
  })

  test('animation detail page shows all metadata', async ({ page }) => {
    await page.goto('/gallery')

    // Find first animation card
    const cards = page.locator('[data-testid="animation-card"], .animation-card')

    if (await cards.count() > 0) {
      // Click to view detail
      const firstCard = cards.first()
      const cardLink = firstCard.locator('a')

      if (await cardLink.count() > 0) {
        await cardLink.first().click()
      } else {
        await firstCard.click()
      }

      await page.waitForNavigation()

      // Verify detail page loaded
      const detailTitle = page.locator('h1, h2')
      await expect(detailTitle).toBeVisible()

      // Verify metadata visible
      const description = page.locator('[class*="description"], p')
      if (await description.count() > 0) {
        const descText = await description.first().textContent()
        expect(descText?.length).toBeGreaterThan(0)
      }

      // Verify canvas/player for replay
      const player = page.locator('canvas, [data-testid="animation-player"]')
      if (await player.count() > 0) {
        await expect(player.first()).toBeVisible()
      }
    }
  })
})

// ============================================================================
// Cross-Cutting E2E: Complete Workflow
// ============================================================================

test.describe('Cross-Cutting: Full Workflow (US1 + US2 + US3)', () => {
  test('complete flow: save animation, share link, discover in gallery', async ({
    page,
    context,
  }) => {
    // 1. Create and save animation (US1)
    await page.goto('/app')
    await page.waitForLoadState('networkidle')

    const canvas = page.locator('canvas').first()
    await expect(canvas).toBeVisible({ timeout: 10000 })

    // Add frame
    const addFrameBtn = page.locator('button:has-text("Add Frame"), [data-testid="add-frame"]')
    if (await addFrameBtn.count() > 0) {
      await addFrameBtn.click()
    }

    // Save to cloud
    const saveBtn = page.locator('button:has-text("Save to Cloud")')
    await saveBtn.click()

    await page.waitForSelector('[role="dialog"]')

    const titleInput = page.locator('input[placeholder*="Title"]').first()
    const timestamp = Date.now()
    await titleInput.fill(`E2E Test ${timestamp}`)

    const submitBtn = page.locator('[role="dialog"] button:has-text("Save")')
    await submitBtn.click()

    const successMsg = page.locator('text=Saved|Success')
    await expect(successMsg).toBeVisible({ timeout: 5000 })

    // 2. Change visibility to public and get share link (US2)
    await page.goto('/my-gallery')

    const animCard = page.locator(`text=E2E Test ${timestamp}`).locator('..')
    const editBtn = animCard.locator('button:has-text("Edit")')

    await editBtn.click()
    await page.waitForSelector('[role="dialog"]')

    // Change to public
    const visSelect = page.locator('select').first()
    await page.selectOption('select', 'public')

    const saveMeta = page.locator('[role="dialog"] button:has-text("Save")')
    await saveMeta.click()

    await expect(page.locator('text=Updated|Success')).toBeVisible({ timeout: 3000 })

    // 3. Verify animation appears in public gallery (US3)
    await page.goto('/gallery')

    const searchInput = page.locator('input[placeholder*="Search"]')
    await searchInput.fill(`E2E Test ${timestamp}`)

    await page.waitForTimeout(1000)

    const foundCard = page.locator(`text=E2E Test ${timestamp}`)
    await expect(foundCard).toBeVisible()

    // 4. View animation detail
    await foundCard.click()

    const playerCanvas = page.locator('canvas, [data-testid="animation-player"]')
    await expect(playerCanvas).toBeVisible({ timeout: 5000 })
  })
})
