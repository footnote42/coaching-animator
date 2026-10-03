import { Page, expect } from '@playwright/test'

/**
 * E2E helpers shared by the remaining specs: sign-in and sign-out only.
 */

export interface TestUser {
  email: string
  password: string
  displayName?: string
}

/**
 * Sign in with existing credentials through the login form.
 */
export async function loginUser(page: Page, user: TestUser, redirect?: string): Promise<void> {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
  const loginUrl = redirect ? `${baseUrl}/login?redirect=${encodeURIComponent(redirect)}` : `${baseUrl}/login`
  await page.goto(loginUrl)

  const emailInput = page.getByTestId('login-email')
  const passwordInput = page.getByTestId('login-password')
  const submitButton = page.getByTestId('login-submit')

  await emailInput.click()
  await emailInput.fill(user.email)

  await passwordInput.click()
  await passwordInput.fill(user.password)

  await submitButton.click()

  // Use 'load' instead of 'networkidle': realtime connections keep the page from reaching networkidle
  await page.waitForURL(/\/(practice|my-practices|profile)/, { timeout: 60000, waitUntil: 'load' })

  // The profile tab appears once UserContext is ready
  await expect(page.locator('a[href="/profile"]').first()).toBeVisible({ timeout: 15000 })
}

/**
 * Sign out the current user.
 */
export async function logoutUser(page: Page): Promise<void> {
  await page.goto('/')

  const logoutButton = page.locator(
    'button:has-text("Logout"), button:has-text("Sign Out"), [aria-label="Sign out"]'
  )

  if (await logoutButton.count() > 0) {
    await logoutButton.first().click()
    await page.waitForLoadState('load')
  }
}

/**
 * Sign in as the default test user (local and production).
 */
export async function loginAsTestUser(page: Page, redirect?: string): Promise<void> {
  await loginUser(page, { email: 'user@test.com', password: 'Password1!' }, redirect)
}
