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
      env: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
      },
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
