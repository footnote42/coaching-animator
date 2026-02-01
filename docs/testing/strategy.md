# Phase 1 E2E Testing Strategy

**Source**: Extracted from `TESTING_STRATEGY.md`
**Last Updated**: 2026-01-31
**Status**: ✅ Ready for execution
**Test Suite**: `tests/e2e/phase-1-galleries.spec.ts` (13 tests)

---

## Overview

End-to-end tests for coaching-animator validate critical user journeys for **galleries and link sharing**. Tests run against a staging environment using Playwright and verify the complete flow from user registration through animation discovery and sharing.

---

## Architecture Context

**Cloud-First Model** (Updated 2026-01-31):
- Tier 0 (Guest): 10-frame local editor, JSON download only, no cloud persistence
- Tier 1 (Authenticated): Cloud storage, personal gallery (50 animations max per user)
- Tier 2 (Public/Link-Shared): Link sharing, public gallery browsing, upvoting
- Tier 3 (Admin): Moderation and user management

---

## Test Coverage

### User Story 1: Cloud Save & Personal Gallery

Authenticated users can save animations to cloud and manage personal gallery.

**Test Cases**:
- Register new account
- Create animation in editor
- Save animation to cloud via modal
- View saved animation in personal gallery
- Verify persistence across logout/login cycle
- Manage animation metadata
- Delete animations from gallery

**Critical Paths Validated**:
- User registration → email verification → auth session
- Animation creation → cloud save → personal gallery display
- Session persistence (logout → login → animation still there)
- Metadata storage (title, description, type, tags)

### User Story 2: Link Sharing & Visibility Toggle

Users can control animation visibility and generate shareable links.

**Test Cases**:
- Toggle animation visibility (private → link_shared → public)
- Generate and copy shareable links
- Share link_shared animations with guests (no login required)
- Protect private animations (guest access denied)
- Transition between visibility states

**Critical Paths Validated**:
- Visibility toggle persists in database
- Link-shared animations accessible without authentication
- Private animations return 403/access denied
- Share link generation works in UI

### User Story 3: Public Gallery Search & Discovery

Guests and users discover animations through public gallery.

**Test Cases**:
- Access public gallery without login
- Search by keyword (full-text search)
- Filter by animation type (tactic, skill, game, other)
- Sort by popularity (upvotes) or newest
- Paginate through results
- View animation detail pages
- See upvote buttons (authenticated only)
- Access creator display names

**Critical Paths Validated**:
- Full-text search on title + description
- Filter accuracy by animation_type
- Sort order (newest vs popular)
- Pagination (20 per page, 50 max)
- RLS policies allow public gallery read

### Cross-Cutting Workflow

**Complete End-to-End Flow**:
1. Register → Create animation → Save to cloud
2. Set visibility to public
3. Verify appears in public gallery
4. Search finds it by keyword
5. Guest can view detail page
6. Upvote count displays (if authenticated)

---

## Test Execution

### Setup

```bash
# Install dependencies
npm install --save-dev @playwright/test

# Install browsers (first time only)
npx playwright install

# Copy environment template
cp tests/e2e/.env.example tests/e2e/.env.local
```

### Running Tests

```bash
# Run all Phase 1 tests (headless)
npm run e2e

# Run with browser visible (debugging)
npm run e2e:headed

# Debug mode (interactive step-by-step)
npm run e2e:debug

# UI mode with live updates
npm run e2e:ui

# View HTML report after tests
npm run e2e:report

# Run specific test
npx playwright test -g "user can save animation"

# Run specific file
npx playwright test tests/e2e/phase-1-galleries.spec.ts
```

### Expected Output

```
Running 1000ms timeout ...
  ✓ [chromium] › US1: Cloud Save › authenticated user can save animation to cloud (15.2s)
  ✓ [chromium] › US1: Cloud Save › personal gallery shows correct metadata (8.1s)
  ✓ [chromium] › US2: Link Sharing › user can toggle visibility to link_shared (9.3s)
  ✓ [chromium] › US3: Public Gallery › guest can access without login (4.2s)
  ✓ [chromium] › Cross-Cutting › complete flow: save, share, discover (22.5s)

  13 passed (2m 15s)
```

---

## Test Infrastructure

### File Structure

```
tests/e2e/
├── phase-1-galleries.spec.ts  # Main test suite (13 tests)
├── helpers.ts                  # Utility functions for auth, search, etc.
├── README.md                   # Detailed testing guide
└── .env.example               # Environment template

playwright.config.ts           # Playwright configuration
package.json                   # Test scripts (npm run e2e)
```

### Key Files

**playwright.config.ts**:
- Base URL: `http://localhost:3000` (configurable)
- Browsers: Chromium, Firefox, WebKit
- Reporters: HTML, JSON, JUnit XML
- Artifacts: Screenshots on failure, video on failure, traces
- Timeout: 30s per test, 5s for assertions

**helpers.ts** (Reusable Functions):
- `registerUser()` - Create new test user
- `loginUser()` - Login with credentials
- `saveAnimationToCloud()` - Complete save flow
- `setAnimationVisibility()` - Toggle visibility
- `searchGallery()` - Search with keyword
- `getAnimationShareLink()` - Extract share URL
- `takeScreenshot()` - Debug screenshots

---

## Environment Variables

Required for tests to run:

```env
BASE_URL=http://localhost:3000
```

Optional:

```env
# Use pre-existing user instead of creating new ones
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=password123

# Show browser while tests run (debugging)
PLAYWRIGHT_HEADED=false

# Enable detailed output
PLAYWRIGHT_DEBUG=false
```

---

## Debugging Failed Tests

### View Test Results

```bash
# HTML report (interactive)
npm run e2e:report

# JSON results (machine-readable)
cat test-results/results.json | jq

# JUnit XML (CI integration)
cat test-results/junit.xml
```

### Common Failure Scenarios

**Timeout waiting for element**:
- Selector may not match current DOM
- Use `data-testid` instead of CSS classes (classes change with styling)
- Increase timeout if legitimate async operation

**Authentication failed**:
- Verify email/password in test data
- Check Supabase configuration
- Ensure email verification not required (or mock)
- Verify CORS policy allows requests

**Visibility selector not found**:
- Check if `<select>` element exists on page
- May use Radix UI combobox instead
- Look for `[role="combobox"]` alternative

**Gallery search returns no results**:
- Verify test data is public (not private)
- Check full-text search is enabled on Supabase
- Verify search index has been populated

### Debugging Steps

1. **Run single test with browser visible**:
   ```bash
   npx playwright test -g "test name" --headed
   ```

2. **Generate code from UI interactions**:
   ```bash
   npx playwright codegen http://localhost:3000
   ```

3. **Interactive debugger**:
   ```bash
   npm run e2e:debug
   ```

4. **Check browser console**:
   - Screenshots in `test-results/artifacts/`
   - Videos (on failure) in same directory
   - Trace files for step-by-step replay

---

## Test Data Management

### Test User Generation

Each test creates unique user with timestamp:

```typescript
const testUser = {
  email: `test-e2e-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  displayName: 'E2E Coach',
}
```

**Why?** Prevents conflicts with other tests and previous test runs.

### Animation Cleanup

Tests create animations but **do not clean up** (to verify persistence):

```bash
# To manually clean up test data:
# 1. Login to Supabase dashboard
# 2. Find test animations by "E2E Test" prefix
# 3. Delete via SQL or UI
```

---

## Performance Baseline

Expected test execution times:

| Test | Browser | Time |
|------|---------|------|
| Register + Save | Chrome | 15-20s |
| Link Sharing | Chrome | 10-15s |
| Gallery Search | Chrome | 8-12s |
| Complete Workflow | Chrome | 20-25s |
| **Total (3 browsers)** | — | **6-10 min** |

**Factors**:
- Network latency to Supabase
- Playwright browser startup time
- Database query performance
- Email verification (mocked or skipped in tests)

---

## CI/CD Integration

### GitHub Actions Example

Add to `.github/workflows/e2e.yml`:

```yaml
name: E2E Tests - Phase 1

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - run: npm ci
      - run: npx playwright install --with-deps

      - name: Start dev server
        run: npm run dev &

      - name: Wait for server
        run: npm run wait-for-port -- 3000

      - name: Run E2E tests
        run: npm run e2e

      - name: Upload artifacts
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: e2e-results
          path: |
            playwright-report/
            test-results/
          retention-days: 30
```

---

## Known Limitations & Future Improvements

### Phase 1 Limitations

1. **Email Verification**: Tests assume email verification is skipped or instant
   - ✅ Future: Mock email provider or use test email service

2. **Database State**: No automatic cleanup between test runs
   - ✅ Future: Create database fixtures with cleanup hooks

3. **Concurrent Tests**: Run sequentially to avoid auth conflicts
   - ✅ Future: Isolate per-browser context per test

4. **Visual Regression**: No screenshot comparison
   - ✅ Future: Add baseline screenshots for UI changes

### Phase 2 Tests (Future)

- Authentication flows (register, login, password reset)
- Animation creation and editing
- Guest mode limits (10-frame cap)
- Session management and CSRF protection

### Phase 3 Tests (Future)

- Upvoting functionality
- Content reporting and moderation
- Admin dashboard
- Rate limiting and quotas

### Phase 4 Tests (Future)

- Remix/clone animations
- User profile management
- Advanced search (tags, author)

---

## Maintenance & Updates

### When to Update Tests

- UI selectors change → Update `data-testid` or locator
- New API endpoint → Add test coverage
- Authentication flow changes → Update login/register helpers
- Database schema changes → Update test data generation

### Updating Selectors

```typescript
// OLD: Brittle CSS selector (breaks with styling changes)
page.click('.save-button')

// NEW: Stable data-testid
page.click('[data-testid="save-cloud"]')
```

### Adding New Tests

1. Identify user journey
2. Add new `test()` block to appropriate `test.describe()`
3. Use helper functions from `helpers.ts`
4. Run locally to verify: `npm run e2e:headed`

---

## Troubleshooting

**Tests fail locally but pass in CI**:
- Check environment variables
- Verify database state (may need reset)
- Ensure Node version matches

**Tests timeout consistently**:
- Check if dev server is running: `npm run dev`
- Verify Supabase connectivity
- Increase timeout in `playwright.config.ts`

**Cannot find element selector**:
- Inspect page: `npm run e2e:debug`
- Check if element is hidden (display: none)
- Wait for async content to load

---

## References

- **Playwright Docs**: https://playwright.dev
- **Project Spec**: `specs/003-online-platform/spec.md`
- **API Contracts**: `docs/architecture/api-contracts.md`
- **Architecture**: `docs/architecture/auth-patterns.md`, `.specify/memory/constitution.md`
- **E2E Guide**: `docs/testing/e2e-guide.md`

---

## Test Status

**Current Phase**: Phase 1 (Galleries & Link Sharing)
**Test Count**: 13 tests across 3 user story groups + 1 cross-cutting workflow
**Status**: ✅ Ready for execution (requires `/build` issue resolution for production deployment)

**Last Updated**: 2026-01-31
