import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright Configuration for coaching-animator E2E Tests
 *
 * Runs Phase 1 tests against staging environment.
 * Generate HTML reports and JUnit XML for CI/CD integration.
 */

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.spec.ts',

  // Test execution settings
  fullyParallel: false, // Run sequentially to avoid auth conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1, // Single worker to avoid session interference

  // Timeout settings
  timeout: 30 * 1000, // 30s per test
  expect: {
    timeout: 5 * 1000, // 5s for assertions
  },

  // Base URL for relative navigation
  use: {
    baseURL: process.env.BASE_URL || 'https://coaching-animator.vercel.app',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // Browser configurations
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // Web server for local testing (skip if testing production)
  webServer: process.env.BASE_URL?.includes('localhost')
    ? {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
      }
    : undefined,

  // Reporter configurations
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],
  ],

  // Output folder for artifacts (screenshots, videos, traces)
  outputFolder: 'test-results/artifacts',
})
