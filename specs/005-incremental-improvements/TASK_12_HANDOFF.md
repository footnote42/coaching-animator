# Task 12: E2E Tests for Mobile Replay - Handoff Prompt

I need you to perform **Task 12** from the Mobile Replay Optimization spec. Tasks 1-11 have been completed successfully.

## Context

**Project**: Coaching Animator (sports animation tool)

**Working Directory**: `c:\Coding Projects\coaching-animator`

### What has been accomplished:

✅ **Tasks 1-3**: Created `useCanvasSize` hook and integrated it into ReplayViewer. Canvas now scales responsively based on viewport width.

✅ **Task 4**: Manual verification confirmed canvas fits mobile (≤343px at 375px viewport) with 16px padding and no overflow.

✅ **Task 5**: Updated ReplayViewer controls for mobile responsiveness with 48×48px touch targets on mobile.

✅ **Task 6**: Added landscape orientation hint that appears when `canvasWidth < 600px`.

✅ **Task 7**: Responsive page header title (`text-xl sm:text-2xl`).

✅ **Task 8**: Responsive metadata stacking (vertical on mobile, horizontal with bullets on desktop).

✅ **Task 9**: Fixed SSR issues in `Stage.tsx` and resolved server-side crash with dynamic imports.

✅ **Task 10**: Manual testing verified landscape hint behavior works correctly across all device orientations and viewports.

✅ **Task 11**: Unit tests created for `useCanvasSize` hook with 10 comprehensive tests, all passing.

### Technical Notes:

- **Testing Framework**: Playwright (already configured in `playwright.config.ts`)
- **Test Location**: E2E tests go in `tests/e2e/` directory
- **Existing E2E Tests**: `tests/e2e/phase-1-galleries.spec.ts` (reference for patterns)
- **Test Runner**: `npm run e2e` or `npx playwright test`
- **Browsers**: Chromium, Firefox, WebKit (Safari)
- **Mobile Testing**: Use `playwright.devices` for mobile emulation
- **ReplayViewer Route**: `/replay/[id]` (dynamic route)

## Task 12 Requirements

From `specs/005-incremental-improvements/TASKS.md`:

```markdown
### ✅ Task 12: Write E2E Tests - Mobile Replay
- [ ] Create `tests/e2e/replay-mobile.spec.ts`
- [ ] Test 1: Canvas fits 375px viewport (no horizontal scroll)
- [ ] Test 2: Canvas maintains 4:3 aspect ratio at 500px
- [ ] Test 3: Play/pause button ≥48px at 375px
- [ ] Test 4: Desktop unchanged - canvas ≤800×600 at 1920px
- [ ] **Verify**: `npm run e2e -- replay-mobile` → 4 tests pass, no flakiness

**Files**: `tests/e2e/replay-mobile.spec.ts` (NEW, 90 lines)
```

## Test Scenarios

### Test 1: Canvas Fits 375px Viewport (No Horizontal Scroll)

**Purpose**: Verify mobile canvas doesn't cause horizontal overflow

**Steps**:
1. Set viewport to 375×667 (iPhone SE)
2. Navigate to a replay page (create or use existing animation)
3. Wait for canvas to render
4. Check canvas width ≤343px (375 - 32 padding)
5. Verify `document.body.scrollWidth === document.body.clientWidth` (no horizontal scroll)
6. Check 16px padding on left/right

**Expected**: Canvas visible without horizontal scrolling

---

### Test 2: Canvas Maintains 4:3 Aspect Ratio at 500px

**Purpose**: Verify aspect ratio preservation at tablet/small desktop size

**Steps**:
1. Set viewport to 500×800
2. Navigate to replay page
3. Get canvas element dimensions
4. Calculate actual ratio: `width / height`
5. Verify ratio ≈ 1.333 (4/3) with ±0.01 tolerance

**Expected**: Canvas maintains 4:3 aspect ratio

---

### Test 3: Play/Pause Button ≥48px at 375px

**Purpose**: Verify touch targets meet accessibility requirements (WCAG 2.1 Level AAA: 44×44px minimum, we use 48×48px)

**Steps**:
1. Set viewport to 375×667
2. Navigate to replay page
3. Locate play/pause button
4. Get button bounding box dimensions
5. Verify `width ≥ 48` and `height ≥ 48`

**Expected**: Button dimensions meet 48×48px touch target requirement

---

### Test 4: Desktop Unchanged - Canvas ≤800×600 at 1920px

**Purpose**: Verify desktop regression - canvas should cap at 800×600

**Steps**:
1. Set viewport to 1920×1080
2. Navigate to replay page
3. Get canvas element dimensions
4. Verify `width === 800` and `height === 600`

**Expected**: Canvas capped at maximum dimensions on desktop

---

## Existing E2E Test Patterns

Reference: `tests/e2e/phase-1-galleries.spec.ts`

### Common Patterns Used in Project

```typescript
import { test, expect, devices } from '@playwright/test';

// Mobile device emulation
test.use(devices['iPhone SE']);

// Navigation to dynamic routes
await page.goto('/replay/some-id');

// Wait for elements
await page.waitForSelector('canvas', { state: 'visible' });

// Get element dimensions
const canvas = await page.locator('canvas');
const box = await canvas.boundingBox();
expect(box.width).toBe(343);

// Check for horizontal scroll
const hasHorizontalScroll = await page.evaluate(() => {
  return document.body.scrollWidth > document.body.clientWidth;
});
expect(hasHorizontalScroll).toBe(false);

// Get computed styles
const padding = await page.evaluate(() => {
  const container = document.querySelector('.container-class');
  const styles = window.getComputedStyle(container);
  return parseInt(styles.paddingLeft);
});
```

## Test Structure Template

```typescript
import { test, expect, devices } from '@playwright/test';

test.describe('Mobile Replay Optimization', () => {
  // Setup: Create or use existing animation ID for testing
  const TEST_ANIMATION_ID = 'test-animation-id'; // You'll need to create this or use existing

  test.describe('Mobile viewport (375×667)', () => {
    test.use(devices['iPhone SE']);

    test('canvas fits viewport without horizontal scroll', async ({ page }) => {
      // Navigate to replay page
      await page.goto(`/replay/${TEST_ANIMATION_ID}`);

      // Wait for canvas to render
      await page.waitForSelector('canvas', { state: 'visible' });

      // Get canvas dimensions
      const canvas = page.locator('canvas');
      const box = await canvas.boundingBox();

      // Verify canvas width ≤343px (375 - 32 padding)
      expect(box).not.toBeNull();
      expect(box!.width).toBeLessThanOrEqual(343);

      // Verify no horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.body.scrollWidth > document.body.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);
    });

    test('play/pause button meets 48×48px touch target requirement', async ({ page }) => {
      await page.goto(`/replay/${TEST_ANIMATION_ID}`);

      // Wait for controls to render
      await page.waitForSelector('[aria-label="Play"]', { state: 'visible' });

      // Get play button dimensions
      const playButton = page.locator('[aria-label="Play"]');
      const box = await playButton.boundingBox();

      // Verify button dimensions ≥48×48px
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThanOrEqual(48);
      expect(box!.height).toBeGreaterThanOrEqual(48);
    });
  });

  test.describe('Tablet viewport (500×800)', () => {
    test.use({ viewport: { width: 500, height: 800 } });

    test('canvas maintains 4:3 aspect ratio', async ({ page }) => {
      await page.goto(`/replay/${TEST_ANIMATION_ID}`);
      await page.waitForSelector('canvas', { state: 'visible' });

      const canvas = page.locator('canvas');
      const box = await canvas.boundingBox();

      expect(box).not.toBeNull();
      const ratio = box!.width / box!.height;

      // Verify 4:3 ratio (1.333...) with tolerance
      expect(ratio).toBeCloseTo(4 / 3, 2); // 2 decimal places
    });
  });

  test.describe('Desktop viewport (1920×1080)', () => {
    test.use({ viewport: { width: 1920, height: 1080 } });

    test('canvas caps at 800×600 maximum dimensions', async ({ page }) => {
      await page.goto(`/replay/${TEST_ANIMATION_ID}`);
      await page.waitForSelector('canvas', { state: 'visible' });

      const canvas = page.locator('canvas');
      const box = await canvas.boundingBox();

      expect(box).not.toBeNull();
      expect(box!.width).toBe(800);
      expect(box!.height).toBe(600);
    });
  });
});
```

## Setup Considerations

### Test Data

You'll need a valid animation ID for testing. Options:

1. **Use existing animation**: Check database for existing animation IDs
2. **Create test animation**: Add a fixture or seed animation
3. **Use mock data**: Create a minimal test animation via API before tests

**Recommended approach**: Use a shared test animation ID that's seeded in the database.

### Test Animation Setup

You may need to create a test animation before running E2E tests. Here's a sample approach:

```typescript
import { test as setup } from '@playwright/test';

// Setup test animation once before all tests
setup('create test animation', async ({ request }) => {
  // Create animation via API
  const response = await request.post('/api/animations', {
    data: {
      name: 'E2E Test Animation',
      sport: 'rugby-union',
      frames: [/* minimal frame data */],
      visibility: 'public'
    }
  });

  const { id } = await response.json();

  // Save ID to environment or file for use in tests
  process.env.TEST_ANIMATION_ID = id;
});
```

**Alternatively**: Use a hardcoded ID of an animation that's already in your database.

## Success Criteria

✅ **Test file created**: `tests/e2e/replay-mobile.spec.ts` (NEW, ~90-120 lines)
✅ **All 4 required tests pass**: `npm run e2e -- replay-mobile` shows 4/4 passing
✅ **No flakiness**: Tests pass consistently across multiple runs
✅ **Cross-browser**: Tests pass in Chromium, Firefox, WebKit
✅ **TypeScript passes**: `npx tsc --noEmit` with 0 errors
✅ **ESLint passes**: `npm run lint` with 0 warnings
✅ **Updated TASKS.md**: Task 12 marked complete
✅ **Updated PROGRESS.md**: Session log updated with Task 12 completion details

## Implementation Steps

### Step 1: Review Existing E2E Tests

Read `tests/e2e/phase-1-galleries.spec.ts` to understand:
- Project's E2E testing patterns
- How to handle authentication (if needed)
- Common helper functions
- Test organization structure

### Step 2: Determine Test Animation ID

Choose one approach:
- Use existing animation ID from database
- Create setup script to seed test animation
- Use fixtures in `tests/fixtures/` directory

**Note**: Check if `tests/e2e/helpers.ts` has utility functions for test data.

### Step 3: Create Test File

Create `tests/e2e/replay-mobile.spec.ts` with:
- Import statements (Playwright, expect, devices)
- Test describe blocks (mobile, tablet, desktop)
- 4 required test cases
- Proper async/await handling
- Clear assertions with descriptive error messages

### Step 4: Run Tests Locally

```bash
# Run specific test file
npm run e2e -- tests/e2e/replay-mobile.spec.ts

# Run with specific browser
npx playwright test replay-mobile --project=chromium

# Run in headed mode (see browser)
npm run e2e:headed -- replay-mobile

# Run in debug mode
npm run e2e:debug -- replay-mobile
```

### Step 5: Fix Any Flakiness

Common causes of flaky E2E tests:
- **Race conditions**: Add proper `waitForSelector` calls
- **Timing issues**: Use `waitForLoadState('networkidle')` if needed
- **Dynamic content**: Wait for specific elements before assertions
- **Animation timing**: Wait for canvas to stabilize after render

**Anti-flakiness patterns**:
```typescript
// Wait for canvas to be visible AND stable
await page.waitForSelector('canvas', { state: 'visible' });
await page.waitForTimeout(100); // Small delay for render stabilization

// Retry assertions that might be timing-sensitive
await expect.poll(async () => {
  const box = await canvas.boundingBox();
  return box?.width;
}).toBeLessThanOrEqual(343);
```

### Step 6: Run Across All Browsers

```bash
# Run on all browsers (Chromium, Firefox, WebKit)
npm run e2e -- replay-mobile
```

Verify tests pass on:
- ✅ Chromium
- ✅ Firefox
- ✅ WebKit (Safari)

### Step 7: Run Quality Checks

```bash
npx tsc --noEmit    # TypeScript check
npm run lint        # ESLint check
```

### Step 8: Update Documentation

- Mark Task 12 complete in `TASKS.md`
- Add completion details to `PROGRESS.md`

## Common Pitfalls to Avoid

1. **Hardcoding animation IDs**: Use a variable or environment variable for flexibility
2. **Not waiting for canvas render**: Always wait for canvas to be visible before assertions
3. **Ignoring flakiness**: If a test fails occasionally, investigate and fix the root cause
4. **Pixel-perfect assertions**: Use ranges or tolerances for dimensions (e.g., ±2px)
5. **Missing error messages**: Always provide descriptive expect messages
6. **Not testing cross-browser**: Run on all three browsers (Chromium, Firefox, WebKit)
7. **Forgetting mobile devices**: Use `devices['iPhone SE']` for authentic mobile emulation

## Example Test Output

After running `npm run e2e -- replay-mobile`, you should see:

```
Running 4 tests using 3 workers

  ✓ [chromium] › replay-mobile.spec.ts:10:5 › Mobile viewport › canvas fits viewport without horizontal scroll (2.3s)
  ✓ [chromium] › replay-mobile.spec.ts:25:5 › Mobile viewport › play/pause button meets 48×48px touch target (1.8s)
  ✓ [chromium] › replay-mobile.spec.ts:40:5 › Tablet viewport › canvas maintains 4:3 aspect ratio (1.5s)
  ✓ [chromium] › replay-mobile.spec.ts:55:5 › Desktop viewport › canvas caps at 800×600 maximum (1.9s)

  4 passed (7.5s)
```

## Verification Commands

```bash
# Run E2E tests
npm run e2e -- replay-mobile

# Run with UI mode (interactive)
npm run e2e:ui -- replay-mobile

# Generate test report
npm run e2e:report

# TypeScript check
npx tsc --noEmit

# ESLint check
npm run lint
```

## Completion Steps

After all tests pass:

1. **Update TASKS.md**:

    ```markdown
    ### ✅ Task 12: Write E2E Tests - Mobile Replay ✅ COMPLETE (2026-02-07)
    - [x] Create `tests/e2e/replay-mobile.spec.ts`
    - [x] Test 1: Canvas fits 375px viewport (no horizontal scroll)
    - [x] Test 2: Canvas maintains 4:3 aspect ratio at 500px
    - [x] Test 3: Play/pause button ≥48px at 375px
    - [x] Test 4: Desktop unchanged - canvas ≤800×600 at 1920px
    - [x] **Verify**: `npm run e2e -- replay-mobile` → 4 tests pass, no flakiness
    ```

2. **Update PROGRESS.md**: Add under "Work Done" in Session 2026-02-07:

    ```markdown
    - **Task 12: E2E Tests - Mobile Replay** ✅ Complete:
      - Created `tests/e2e/replay-mobile.spec.ts` with 4 comprehensive E2E tests
      - Test 1: Canvas fits 375px viewport with no horizontal scroll ✅
      - Test 2: Canvas maintains 4:3 aspect ratio at 500px viewport ✅
      - Test 3: Play/pause button meets 48×48px touch target requirement ✅
      - Test 4: Desktop canvas caps at 800×600 at 1920px viewport ✅
      - All 4 tests passing across Chromium, Firefox, and WebKit
      - No flakiness detected (10 consecutive runs, 100% pass rate)
      - Test execution time: ~X.Xs total
      - Uses Playwright devices for authentic mobile emulation
      - Proper wait strategies to prevent race conditions
      - TypeScript and ESLint checks pass with 0 errors
    ```

3. **Update session summary**:

    - Change session title to "Tasks 1-12"
    - Update status to "12 of 18 total"
    - Update "Latest Task" to "Task 12 of 18 complete (Mobile replay E2E tests)"

## Resources

- **Playwright docs**: https://playwright.dev/docs/intro
- **Existing E2E tests**: `tests/e2e/phase-1-galleries.spec.ts`
- **Playwright config**: `playwright.config.ts`
- **Test helpers**: `tests/e2e/helpers.ts` (if exists)
- **ReplayViewer component**: `src/components/replay/ReplayViewer.tsx`
- **Replay page**: `app/replay/[id]/page.tsx`
- **Project specs**: `specs/005-incremental-improvements/`

## Next Steps After Completion

After Task 12 is complete, the next tasks are:

- **Task 13**: Manual test - desktop regression
- **Task 14**: Manual test - orientation handling
- **Task 15**: Manual test - playback functionality
- **Tasks 16-18**: Pre-push verification, cross-browser testing, deployment

---

**Estimated Time**: ~45-60 minutes (including test writing, debugging flakiness, and cross-browser verification)

**Complexity**: Medium-High (requires understanding E2E testing patterns, Playwright API, and handling async timing)

**Priority**: High (E2E tests are critical for ensuring mobile replay works correctly in production)
