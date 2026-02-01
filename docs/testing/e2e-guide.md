# Phase 1 E2E Tests: Galleries & Link Sharing

**Location**: `tests/e2e/` (primary location)
**Also documented in**: `docs/testing/e2e-guide.md` (quick reference)
**Last Updated**: 2026-01-31

Playwright end-to-end tests for critical user journeys in coaching-animator.

---

## Test Coverage

### US1: Cloud Save & Personal Gallery
- User registration and authentication
- Animation creation and saving to cloud
- Personal gallery display and persistence
- Logout/login session verification
- Animation deletion from gallery

### US2: Link Sharing & Visibility Toggle
- Visibility toggle (private → link_shared → public)
- Share link generation and copying
- Guest access to link_shared animations without login
- Private animation protection (no guest access)

### US3: Public Gallery Search & Discovery
- Public gallery access without authentication
- Keyword search functionality
- Filter by animation type
- Sort by popularity (upvotes)
- Pagination
- Animation detail page with metadata
- Upvote button display (authenticated users)

---

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase project configured
- Environment variables set

### Installation

```bash
# Install Playwright and dependencies
npm install --save-dev @playwright/test

# Install browsers (first time only)
npx playwright install
```

### Configuration

Environment variables (set in `.env.local` or shell):

```env
# Playwright tests connect to this URL
BASE_URL=http://localhost:3000

# Optional: Staging environment
# BASE_URL=https://staging.example.com

# Optional: Test user credentials (if using pre-existing user)
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=password123
```

---

## Running Tests

### Development (Local)

```bash
# Start dev server first
npm run dev

# Run all tests in headed mode (see browser)
npx playwright test --headed

# Run specific test file
npx playwright test tests/e2e/phase-1-galleries.spec.ts

# Run specific test
npx playwright test -g "user can save animation to cloud"

# Run in debug mode (interactive)
npx playwright test --debug
```

### CI/CD Pipeline

```bash
# Run all tests in headless mode
npx playwright test

# Generate HTML report
npx playwright show-report

# View JSON results
cat test-results/results.json
```

### Test Execution Options

```bash
# Run only one browser
npx playwright test --project=chromium

# Run with verbose output
npx playwright test --verbose

# Update snapshots (if using visual comparisons)
npx playwright test --update-snapshots

# Run tests with retries disabled
npx playwright test --retries=0

# Measure test performance
npx playwright test --reporter=json > test-results/perf.json
```

---

## Test Structure

Each test follows this pattern:

```typescript
test('user journey description', async ({ page, context }) => {
  // 1. Setup: Navigate and interact
  await page.goto('/path')

  // 2. Action: Perform user action
  await page.click('button')

  // 3. Assert: Verify expected state
  await expect(element).toBeVisible()
})
```

### Key Elements

- **`page`**: Main browser tab
- **`context`**: Isolated browser session (for multi-window tests)
- **`expect()`**: Assertion library

---

## Debugging Failed Tests

### View Test Reports

```bash
# Open HTML report in browser
npx playwright show-report

# View detailed trace file (step-by-step replay)
npx playwright show-trace test-results/artifacts/trace-abc123.zip

# View screenshots of failures
open test-results/artifacts/
```

### Debug Single Test

```bash
# Run with debugger and browser visible
npx playwright test --debug --headed -g "test name"

# Inspect element selectors
npx playwright codegen http://localhost:3000
```

### Common Issues

**Test times out waiting for element:**
```typescript
// Increase timeout for specific element
await expect(element).toBeVisible({ timeout: 10000 })
```

**API endpoint not responding:**
- Check Supabase connection
- Verify environment variables
- Check network tab in DevTools

**Login not working:**
- Verify email/password in test
- Check auth session persistence
- Ensure cookies are enabled

---

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - run: npm ci
      - run: npx playwright install --with-deps

      - name: Run E2E tests
        env:
          BASE_URL: https://staging.example.com
        run: npx playwright test

      - name: Upload artifacts
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

      - name: Report results
        if: always()
        run: npx playwright show-report
```

---

## Test Maintenance

### Adding New Tests

1. Identify user journey
2. Create new `test()` block in appropriate file
3. Use existing selectors or add `data-testid` attributes to components
4. Add to relevant test suite (`test.describe()`)

### Updating Selectors

If UI changes and tests fail:

```bash
# Generate new test code from UI interactions
npx playwright codegen http://localhost:3000

# Copy generated selectors to test file
```

### Flaky Test Management

If test intermittently fails:

1. Add explicit waits for async operations
2. Increase timeout if legitimate
3. Mark as `test.fixme()` if blocking
4. Create issue to fix underlying cause

```typescript
// Temporary: Skip until fixed
test.fixme('flaky test description', async ({ page }) => {
  // test code
})

// Add explicit wait
await page.waitForResponse(resp => resp.url().includes('/api/animations'))
```

---

## Performance Considerations

- Tests run sequentially by default (avoid auth race conditions)
- Each test creates new user to avoid data conflicts
- Screenshots only on failure (faster execution)
- Video recording only on failure

---

## Best Practices

✅ **DO:**
- Use `data-testid` attributes for stable selectors
- Wait for API responses, not arbitrary timeouts
- Clear test data after each test (delete created animations)
- Test critical user journeys first
- Run tests before committing

❌ **DON'T:**
- Use brittle CSS class selectors (they change with styling)
- Sleep/wait for fixed durations
- Depend on test execution order
- Test implementation details
- Ignore failing tests

---

## Troubleshooting

### Tests Fail Locally but Pass in CI

- Check environment variables
- Verify Node version matches CI
- Clear cache: `rm -rf node_modules && npm install`
- Check database state (may need reset)

### Tests Hang or Timeout

- Check if dev server is running: `npm run dev`
- Verify Supabase is accessible
- Check network tab for blocked requests
- Review console for JavaScript errors

### Authentication Issues

- Verify email/password in test data
- Check Supabase configuration
- Ensure auth emails are verified
- Check CORS policy in Supabase settings

---

## Performance Baseline

Expected test execution times (Phase 1):

| Test | Time |
|------|------|
| Register + Save Animation | 15-20s |
| Link Sharing Workflow | 10-15s |
| Gallery Search | 8-12s |
| Complete Workflow | 20-25s |
| **Total Suite** | **5-10 min** |

*Times vary by network speed and Supabase latency.*

---

## Reporting

### HTML Report

After tests complete:
```bash
npx playwright show-report
```

Includes:
- Test results summary
- Screenshots of failures
- Video recordings (on failure)
- Execution timeline
- Browser-by-browser comparison

### JUnit XML

For CI/CD integration:
```bash
cat test-results/junit.xml
```

Includes:
- Test counts (passed, failed, skipped)
- Execution time per test
- Error messages and stack traces

---

## Phase 2 & 3 Tests (Future)

Additional test suites will cover:

- **Phase 2**: Authentication, animation creation, guest mode limits
- **Phase 3**: Upvoting, content reporting, admin moderation
- **Phase 4**: Remix functionality

Each phase's tests build on Phase 1 infrastructure.

---

## Related Documentation

- **Testing Strategy**: `docs/testing/strategy.md`
- **Test Code**: `tests/e2e/` (primary location)
- **Playwright Docs**: https://playwright.dev
- **Project Spec**: `specs/003-online-platform/spec.md`
- **API Contracts**: `docs/architecture/api-contracts.md`

---

## Support

For questions or issues:
1. Check test output and screenshots in `test-results/artifacts/`
2. Review Playwright documentation: https://playwright.dev
3. Check codebase for recent changes
4. Create GitHub issue with test output
