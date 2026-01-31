import { Page, expect } from '@playwright/test'

/**
 * E2E Test Helpers & Utilities
 *
 * Common functions for authentication, navigation, and assertions
 * used across Phase 1 test suite.
 */

// ============================================================================
// Authentication Helpers
// ============================================================================

export interface TestUser {
  email: string
  password: string
  displayName?: string
}

/**
 * Generate unique test user with timestamp
 * For production testing, uses pre-created test account
 */
export function generateTestUser(): TestUser {
  // Production test account (already created)
  if (process.env.BASE_URL?.includes('coaching-animator.vercel.app')) {
    return {
      email: 'user@test.com',
      password: 'Password1!',
      displayName: 'E2E Coach',
    }
  }

  // For local testing: generate new user per test to avoid conflicts
  const timestamp = Date.now()
  return {
    email: `test-e2e-${timestamp}@example.com`,
    password: 'TestPassword123!',
    displayName: `E2E Coach ${timestamp}`,
  }
}

/**
 * Register a new user via the registration form
 */
export async function registerUser(page: Page, user: TestUser): Promise<void> {
  await page.goto('/register')

  // Fill registration form
  const emailInput = page.locator('input[type="email"]')
  const passwordInput = page.locator('input[type="password"]').first()
  const confirmInput = page.locator('input[type="password"]').last()
  const tosCheckbox = page.locator('input[type="checkbox"]')
  const submitButton = page.locator('button:has-text("Create Account"), button[type="submit"]')

  await emailInput.fill(user.email)
  await passwordInput.fill(user.password)
  await confirmInput.fill(user.password)
  await tosCheckbox.check()
  await submitButton.click()

  // Wait for redirect
  await page.waitForNavigation({ timeout: 10000 })
}

/**
 * Login with existing user credentials
 */
export async function loginUser(page: Page, user: TestUser): Promise<void> {
  await page.goto('/login')

  const emailInput = page.locator('input[type="email"]')
  const passwordInput = page.locator('input[type="password"]')
  const submitButton = page.locator('button:has-text("Sign In"), button:has-text("Login"), button[type="submit"]')

  await emailInput.fill(user.email)
  await passwordInput.fill(user.password)
  await submitButton.click()

  // Wait for navigation (may go to /app or auth confirmation)
  await page.waitForNavigation({ timeout: 10000 })
}

/**
 * Logout current user
 */
export async function logoutUser(page: Page): Promise<void> {
  // Navigate to home or profile to find logout button
  await page.goto('/')

  const logoutButton = page.locator(
    'button:has-text("Logout"), button:has-text("Sign Out"), [aria-label="Sign out"]'
  )

  if (await logoutButton.count() > 0) {
    await logoutButton.click()
    await page.waitForNavigation({ timeout: 5000 })
  }
}

/**
 * Verify user is authenticated by checking for protected page access
 */
export async function assertUserAuthenticated(page: Page): Promise<void> {
  // Try to access protected page
  await page.goto('/my-gallery')

  // Should not redirect to login
  const currentUrl = page.url()
  expect(currentUrl).not.toContain('/login')

  // Should see gallery content
  const galleryHeading = page.locator('h1, h2').first()
  await expect(galleryHeading).toBeVisible()
}

/**
 * Verify user is NOT authenticated by checking redirect to login
 */
export async function assertUserNotAuthenticated(page: Page): Promise<void> {
  // Try to access protected page
  await page.goto('/my-gallery')

  // Should redirect to login
  const currentUrl = page.url()
  expect(currentUrl).toContain('/login')
}

// ============================================================================
// Animation Helpers
// ============================================================================

export interface AnimationMetadata {
  title: string
  description?: string
  coaching_notes?: string
  animation_type?: 'tactic' | 'skill' | 'game' | 'other'
  tags?: string[]
}

/**
 * Create and save animation via editor + save modal
 */
export async function saveAnimationToCloud(page: Page, metadata: AnimationMetadata): Promise<void> {
  // Navigate to editor if not already there
  if (!page.url().includes('/app')) {
    await page.goto('/app')
  }

  // Wait for canvas to load
  const canvas = page.locator('canvas')
  await expect(canvas).toBeVisible()

  // Add frame (optional, just to have something to save)
  const addFrameBtn = page.locator('button:has-text("Add Frame"), [data-testid="add-frame"]')
  if (await addFrameBtn.count() > 0) {
    await addFrameBtn.click()
    await page.waitForTimeout(500)
  }

  // Click save to cloud button
  const saveBtn = page.locator('button:has-text("Save to Cloud"), [data-testid="save-cloud"]')
  await expect(saveBtn).toBeVisible()
  await saveBtn.click()

  // Wait for modal
  const modal = page.locator('[role="dialog"]')
  await expect(modal).toBeVisible({ timeout: 5000 })

  // Fill title
  const titleInput = page.locator('input[placeholder*="Title"], input[aria-label*="Title"]').first()
  await titleInput.fill(metadata.title)

  // Fill description if provided
  if (metadata.description) {
    const descInput = page.locator('textarea[placeholder*="Description"]').first()
    if (await descInput.count() > 0) {
      await descInput.fill(metadata.description)
    }
  }

  // Select animation type
  if (metadata.animation_type) {
    const typeSelect = page.locator('select').first()
    if (await typeSelect.count() > 0) {
      await page.selectOption('select', metadata.animation_type)
    }
  }

  // Submit
  const submitBtn = page.locator('[role="dialog"] button:has-text("Save"), [data-testid="save-submit"]')
  await submitBtn.click()

  // Wait for success
  const successMsg = page.locator('text=Saved|Success|created')
  await expect(successMsg).toBeVisible({ timeout: 5000 })
}

/**
 * Find animation in personal gallery and return metadata
 */
export async function findAnimationInGallery(page: Page, title: string): Promise<boolean> {
  await page.goto('/my-gallery')

  const titleLocator = page.locator(`text=${title}`)
  return await titleLocator.count() > 0
}

/**
 * Delete animation from personal gallery by title
 */
export async function deleteAnimationFromGallery(page: Page, title: string): Promise<void> {
  await page.goto('/my-gallery')

  const card = page.locator(`text=${title}`).locator('..')
  const deleteBtn = card.locator('button:has-text("Delete")')

  await expect(deleteBtn).toBeVisible()
  await deleteBtn.click()

  // Confirm if dialog appears
  const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")')
  if (await confirmBtn.count() > 0) {
    await confirmBtn.click()
  }

  // Wait for deletion
  await page.waitForTimeout(500)
}

// ============================================================================
// Visibility & Sharing Helpers
// ============================================================================

export type Visibility = 'private' | 'link_shared' | 'public'

/**
 * Change animation visibility in personal gallery
 */
export async function setAnimationVisibility(
  page: Page,
  animationTitle: string,
  visibility: Visibility
): Promise<void> {
  await page.goto('/my-gallery')

  // Find and open edit for animation
  const card = page.locator(`text=${animationTitle}`).locator('..')
  const editBtn = card.locator('button:has-text("Edit"), [aria-label="Edit"]')

  await expect(editBtn).toBeVisible()
  await editBtn.click()

  // Wait for modal
  const modal = page.locator('[role="dialog"]')
  await expect(modal).toBeVisible({ timeout: 5000 })

  // Change visibility
  const visSelect = page.locator('select').first()
  if (await visSelect.count() > 0) {
    await page.selectOption('select', visibility)
  }

  // Save
  const saveBtn = page.locator('[role="dialog"] button:has-text("Save")')
  await saveBtn.click()

  // Wait for success
  const successMsg = page.locator('text=Updated|Success|saved')
  await expect(successMsg).toBeVisible({ timeout: 5000 })
}

/**
 * Get share link for animation (assumes visibility is link_shared or public)
 */
export async function getAnimationShareLink(page: Page, animationTitle: string): Promise<string | null> {
  await page.goto('/my-gallery')

  const card = page.locator(`text=${animationTitle}`).locator('..')
  const linkElement = card.locator('a[href*="/replay"]')

  if (await linkElement.count() > 0) {
    const href = await linkElement.getAttribute('href')
    if (href) {
      return new URL(href, page.url()).toString()
    }
  }

  return null
}

// ============================================================================
// Gallery Search Helpers
// ============================================================================

/**
 * Search public gallery for animations
 */
export async function searchGallery(page: Page, query: string): Promise<number> {
  await page.goto('/gallery')

  const searchInput = page.locator('input[placeholder*="Search"], input[aria-label*="Search"]')
  await expect(searchInput).toBeVisible()

  await searchInput.fill(query)
  await page.waitForTimeout(1000)

  // Count results
  const cards = page.locator('[data-testid="animation-card"], .animation-card')
  return await cards.count()
}

/**
 * Filter gallery by animation type
 */
export async function filterGalleryByType(page: Page, type: string): Promise<number> {
  await page.goto('/gallery')

  const typeFilter = page.locator('select[aria-label*="Type"], select').first()

  if (await typeFilter.count() > 0) {
    await page.selectOption('select', type)
    await page.waitForTimeout(1000)
  }

  const cards = page.locator('[data-testid="animation-card"], .animation-card')
  return await cards.count()
}

/**
 * Sort gallery results
 */
export async function sortGallery(page: Page, sortBy: 'newest' | 'popular'): Promise<void> {
  await page.goto('/gallery')

  const sortSelect = page.locator('select').first()

  if (await sortSelect.count() > 0) {
    await page.selectOption('select', { label: sortBy === 'popular' ? 'Most Popular' : 'Newest' })
    await page.waitForTimeout(1000)
  }
}

/**
 * Navigate to next page in gallery
 */
export async function nextGalleryPage(page: Page): Promise<boolean> {
  const nextBtn = page.locator('button:has-text("Next"), [aria-label="Next page"]')

  if (await nextBtn.count() > 0 && (await nextBtn.isEnabled())) {
    await nextBtn.click()
    await page.waitForTimeout(1000)
    return true
  }

  return false
}

// ============================================================================
// Upvote Helpers
// ============================================================================

/**
 * Upvote animation in gallery
 */
export async function upvoteAnimation(page: Page, animationTitle: string): Promise<void> {
  await page.goto('/gallery')

  const card = page.locator(`text=${animationTitle}`).locator('..')
  const upvoteBtn = card.locator('button:has-text("Upvote"), [data-testid="upvote"]')

  if (await upvoteBtn.count() > 0) {
    await upvoteBtn.click()
    await page.waitForTimeout(500)
  }
}

/**
 * Get upvote count for animation
 */
export async function getUpvoteCount(page: Page, animationTitle: string): Promise<number> {
  const card = page.locator(`text=${animationTitle}`).locator('..')
  const upvoteCount = card.locator('[data-testid="upvote-count"], span:has-text("upvote")')

  if (await upvoteCount.count() > 0) {
    const text = await upvoteCount.textContent()
    const match = text?.match(/\d+/)
    return match ? parseInt(match[0]) : 0
  }

  return 0
}

// ============================================================================
// General Assertion Helpers
// ============================================================================

/**
 * Assert that element is not visible due to permission/access
 */
export async function assertAccessDenied(page: Page): Promise<void> {
  // Look for error message or redirect
  const errorMsg = page.locator('text=not found|not authorized|access denied|login required')
  const isLoginPage = page.url().includes('/login')

  const isDenied = (await errorMsg.count() > 0) || isLoginPage
  expect(isDenied).toBeTruthy()
}

/**
 * Wait for element with retry logic
 */
export async function waitForElement(page: Page, selector: string, timeout: number = 5000): Promise<void> {
  const element = page.locator(selector)
  await expect(element).toBeVisible({ timeout })
}

/**
 * Take screenshot of current page (for debugging)
 */
export async function takeScreenshot(page: Page, filename: string): Promise<void> {
  const timestamp = new Date().toISOString().replace(/:/g, '-')
  await page.screenshot({ path: `test-results/artifacts/${filename}-${timestamp}.png` })
}
