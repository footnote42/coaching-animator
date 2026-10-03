import { defineConfig, devices } from '@playwright/test'
import { config } from 'dotenv'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

// Optional local E2E env overrides; dotenv never overrides variables already set in the shell
const __dirname = fileURLToPath(new URL('.', import.meta.url))
config({ path: resolve(__dirname, 'tests/e2e/.env.local') })

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

/**
 * Playwright Configuration for coaching-animator E2E Tests
 *
 * Targets http://localhost:3000 (and starts the dev server) unless BASE_URL is set.
 * Set BASE_URL explicitly to test a deployed environment.
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
    baseURL: BASE_URL,
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

  // Web server for local testing (skipped when BASE_URL points at a deployed site)
  webServer: BASE_URL.includes('localhost')
    ? {
      // CI builds first and serves the build; locally the dev server is enough
      command: process.env.CI ? 'npm run start' : 'npm run dev',
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
  outputDir: 'test-results/artifacts',
})
