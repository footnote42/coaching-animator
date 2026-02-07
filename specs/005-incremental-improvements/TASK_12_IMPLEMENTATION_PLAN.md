# Task 12: E2E Tests for Mobile Replay Optimization - Implementation Plan

## Context

**Why this change is needed:**
Tasks 1-11 have successfully implemented responsive canvas sizing and mobile-optimized controls for the replay viewer. The `useCanvasSize` hook now scales the canvas appropriately across different viewports (280px minimum to 800px maximum), and controls have been made touch-friendly (48×48px on mobile, 40×40px on desktop).

However, we currently lack automated E2E tests to verify this mobile optimization works correctly across different devices and browsers. Without these tests, we risk:
- Mobile users encountering horizontal scroll issues
- Touch targets being too small for WCAG compliance
- Aspect ratio distortions on tablet viewports
- Desktop regression (canvas exceeding 800×600 maximum)

**Task 12 goal:** Create 4 comprehensive Playwright E2E tests that verify canvas sizing, aspect ratio preservation, touch target compliance, and desktop regression protection across Chromium, Firefox, and WebKit.

**Related:** This completes the mobile replay optimization work from `specs/005-incremental-improvements/MOBILE_REPLAY_PLAN.md`.

---

## Implementation Approach

### Test Data Strategy

**Use hybrid setup with `test.beforeAll()`:**
- For production (coaching-animator.vercel.app): Use existing test account animation ID
- For local development: Create test animation dynamically via API
- Use `test.skip()` to gracefully skip tests if animation ID is unavailable
- No cleanup needed (tests are read-only on replay route)

**Rationale:** Existing test patterns (from `phase-1-galleries.spec.ts`) show production uses a pre-seeded test account (`user@test.com`). This approach matches existing conventions and avoids the complexity of creating animations for read-only tests.

### File Structure

**Create single test file:** `tests/e2e/replay-mobile.spec.ts` (~90-120 lines)

**Organization:**
```
1. Import statements
2. Test data setup (testAnimationId variable)
3. test.beforeAll() - Identify test animation
4. test.describe('Mobile viewport') - Tests 1 & 3
5. test.describe('Tablet viewport') - Test 2
6. test.describe('Desktop viewport') - Test 4
```

### Viewport Configuration

**Use inline `test.use()` at describe-block level:**
- Mobile: `test.use(devices['iPhone SE'])` → 375×667
- Tablet: `test.use({ viewport: { width: 500, height: 800 } })`
- Desktop: `test.use({ viewport: { width: 1920, height: 1080 } })`

**Why not global config?** Adding mobile device projects to `playwright.config.ts` would run ALL tests on mobile (3-4x CI time increase). Inline configuration scopes mobile emulation to only these 4 tests.

### Element Location Strategy

**Canvas locator:**
```typescript
const canvas = page.locator('canvas').first()
```
- React-Konva renders multiple canvas elements (background + rendering)
- `.first()` targets the main Stage canvas (always renders first)
- No `data-testid` needed (reliable DOM order)

**Play/Pause button locator:**
```typescript
const playButton = page.locator('button[title*="Play"], button[title*="Pause"]').first()
```
- Uses existing `title` attribute (line 291 in ReplayViewer.tsx)
- Stable across play/pause states
- No component changes required

### Anti-Flakiness Strategies

**Multi-stage wait pattern:**
```typescript
await page.waitForLoadState('networkidle')  // 1. Network stabilization
await page.waitForSelector('canvas', {      // 2. DOM visibility
  state: 'visible',
  timeout: 10000                            // 10s for slow WebKit
})
await page.waitForTimeout(200)              // 3. Konva render stabilization
```

**Why 200ms delay?** React-Konva needs time to hydrate after DOM mount. Too short (<100ms) risks canvas not fully rendered; too long (>500ms) wastes test time.

**Tolerance-based assertions:**
- Use `≤` instead of exact values for canvas dimensions
- Use `toBeCloseTo(4/3, 2)` for aspect ratio (±0.01 tolerance)
- Accounts for browser rounding differences

### Cross-Browser Compatibility

**No browser-specific code needed.** The multi-stage wait strategy handles timing differences across Chromium, Firefox, and WebKit:
- Chromium: Standard reference
- Firefox: 200ms stabilization handles different canvas timing
- WebKit: 10s timeout + `waitForLoadState` handles slower hydration

### Test Isolation

**Each test navigates independently:**
- No shared `beforeEach` hook
- Full isolation prevents test interdependencies
- Trade-off: +6s total overhead for maximum reliability

---

## Critical Files

### Files to Create

**1. `tests/e2e/replay-mobile.spec.ts`** (NEW, ~90-120 lines)
- Contains all 4 required E2E tests
- Organized into 3 describe blocks (mobile, tablet, desktop)
- Uses existing test patterns from `phase-1-galleries.spec.ts`

### Files to Reference (Read-Only)

**2. `src/components/replay/ReplayViewer.tsx`** (REFERENCE)
- Line 291: Play/Pause button with `title` attribute
- Line 290: Button classes `w-12 h-12 sm:w-10 sm:h-10`
- Understanding component structure helps write accurate selectors

**3. `tests/e2e/phase-1-galleries.spec.ts`** (REFERENCE)
- Lines 20-26: Test data setup pattern (production vs local)
- Lines 90-91: Canvas locator pattern (`.first()` usage)
- Lines 48-55: Login flow for production test account

**4. `playwright.config.ts`** (REFERENCE)
- No changes required
- Current config sufficient (3 browsers, 30s timeout, base URL)

**5. `src/hooks/useCanvasSize.ts`** (REFERENCE)
- Understanding sizing logic (280px min, 800px max, 4:3 ratio)
- Helps validate test assertions are correct

---

## Test Requirements & Success Criteria

### Test 1: Canvas Fits 375px Viewport (No Horizontal Scroll)

**Viewport:** 375×667 (iPhone SE)

**Steps:**
1. Navigate to `/replay/[id]`
2. Wait for canvas to render (multi-stage wait)
3. Measure canvas width using `boundingBox()`
4. Verify canvas width ≤343px (375 - 32px padding)
5. Verify no horizontal scroll via `document.body.scrollWidth === clientWidth`

**Success criteria:**
- Canvas width: 300-343px range
- No horizontal scrollbar
- No layout shift or overflow

### Test 2: Canvas Maintains 4:3 Aspect Ratio at 500px

**Viewport:** 500×800 (tablet size)

**Steps:**
1. Navigate to `/replay/[id]`
2. Wait for canvas to render
3. Measure canvas width and height
4. Calculate ratio: `width / height`
5. Verify ratio ≈ 1.333 (4/3) with ±0.01 tolerance

**Success criteria:**
- Ratio: 1.32 to 1.34 (using `toBeCloseTo(4/3, 2)`)
- No visual distortion

### Test 3: Play/Pause Button ≥48px at 375px

**Viewport:** 375×667 (iPhone SE)

**Steps:**
1. Navigate to `/replay/[id]`
2. Wait for play button to be visible
3. Locate button using title attribute
4. Measure button bounding box
5. Verify width ≥48px and height ≥48px

**Success criteria:**
- Button dimensions: ≥48×48px (WCAG Level AAA touch target)
- Button is visible and clickable

### Test 4: Desktop Unchanged - Canvas ≤800×600 at 1920px

**Viewport:** 1920×1080 (desktop)

**Steps:**
1. Navigate to `/replay/[id]`
2. Wait for canvas to render
3. Measure canvas dimensions
4. Verify width === 800px
5. Verify height === 600px

**Success criteria:**
- Canvas dimensions: exactly 800×600px
- No regression from previous desktop behavior

---

## Test Code Structure

### Imports & Setup

```typescript
import { test, expect, devices } from '@playwright/test';

let testAnimationId: string | null = null;

test.beforeAll(async () => {
  const isProduction = process.env.BASE_URL?.includes('coaching-animator.vercel.app');
  testAnimationId = isProduction
    ? 'existing-production-animation-id'
    : 'local-test-animation-id';
});
```

### Mobile Viewport Tests (375×667)

```typescript
test.describe('Mobile viewport (375×667)', () => {
  test.use(devices['iPhone SE']);

  test('canvas fits viewport without horizontal scroll', async ({ page }) => {
    test.skip(!testAnimationId, 'No test animation available');

    await page.goto(`/replay/${testAnimationId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('canvas', { state: 'visible', timeout: 10000 });
    await page.waitForTimeout(200);

    const canvas = page.locator('canvas').first();
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeLessThanOrEqual(343);
    expect(box!.width).toBeGreaterThan(300);

    const hasHorizontalScroll = await page.evaluate(() => {
      return document.body.scrollWidth > document.body.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });

  test('play/pause button meets 48×48px touch target requirement', async ({ page }) => {
    test.skip(!testAnimationId, 'No test animation available');

    await page.goto(`/replay/${testAnimationId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('button[title*="Play"], button[title*="Pause"]', {
      state: 'visible',
      timeout: 5000
    });

    const playButton = page.locator('button[title*="Play"], button[title*="Pause"]').first();
    const box = await playButton.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(48);
    expect(box!.height).toBeGreaterThanOrEqual(48);
  });
});
```

### Tablet Viewport Test (500×800)

```typescript
test.describe('Tablet viewport (500×800)', () => {
  test.use({ viewport: { width: 500, height: 800 } });

  test('canvas maintains 4:3 aspect ratio', async ({ page }) => {
    test.skip(!testAnimationId, 'No test animation available');

    await page.goto(`/replay/${testAnimationId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('canvas', { state: 'visible', timeout: 10000 });
    await page.waitForTimeout(200);

    const canvas = page.locator('canvas').first();
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();

    const ratio = box!.width / box!.height;
    expect(ratio).toBeCloseTo(4 / 3, 2);
  });
});
```

### Desktop Viewport Test (1920×1080)

```typescript
test.describe('Desktop viewport (1920×1080)', () => {
  test.use({ viewport: { width: 1920, height: 1080 } });

  test('canvas caps at 800×600 maximum dimensions', async ({ page }) => {
    test.skip(!testAnimationId, 'No test animation available');

    await page.goto(`/replay/${testAnimationId}`);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('canvas', { state: 'visible', timeout: 10000 });
    await page.waitForTimeout(200);

    const canvas = page.locator('canvas').first();
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBe(800);
    expect(box!.height).toBe(600);
  });
});
```

---

## Verification Plan

### Step 1: Run Tests Locally

```bash
# Run specific test file
npm run e2e -- tests/e2e/replay-mobile.spec.ts

# Run with UI mode (interactive)
npx playwright test replay-mobile --ui

# Run in headed mode (see browser)
npx playwright test replay-mobile --headed
```

**Expected output:**
```
Running 12 tests using 3 workers

  ✓ [chromium] › Mobile › canvas fits viewport (2.1s)
  ✓ [chromium] › Mobile › touch target (1.8s)
  ✓ [chromium] › Tablet › aspect ratio (1.5s)
  ✓ [chromium] › Desktop › max dimensions (1.7s)
  ✓ [firefox] › Mobile › canvas fits viewport (2.3s)
  ✓ [firefox] › Mobile › touch target (1.9s)
  ✓ [firefox] › Tablet › aspect ratio (1.6s)
  ✓ [firefox] › Desktop › max dimensions (1.8s)
  ✓ [webkit] › Mobile › canvas fits viewport (2.5s)
  ✓ [webkit] › Mobile › touch target (2.1s)
  ✓ [webkit] › Tablet › aspect ratio (1.8s)
  ✓ [webkit] › Desktop › max dimensions (2.0s)

  12 passed (24.0s)
```

### Step 2: Flakiness Check

```bash
# Run 10 consecutive times
for i in {1..10}; do npm run e2e -- replay-mobile || break; done
```

**Success criteria:**
- All 10 runs pass with 12/12 tests
- Total time: <30s per run
- No intermittent failures

### Step 3: Quality Checks

```bash
# TypeScript check
npx tsc --noEmit

# ESLint check
npm run lint
```

**Expected:** Zero errors, zero warnings

### Step 4: Update Documentation

**4.1 Mark Task 12 complete in TASKS.md:**
```markdown
### ✅ Task 12: Write E2E Tests - Mobile Replay ✅ COMPLETE (2026-02-07)
- [x] Create `tests/e2e/replay-mobile.spec.ts`
- [x] Test 1: Canvas fits 375px viewport (no horizontal scroll)
- [x] Test 2: Canvas maintains 4:3 aspect ratio at 500px
- [x] Test 3: Play/pause button ≥48px at 375px
- [x] Test 4: Desktop unchanged - canvas ≤800×600 at 1920px
- [x] **Verify**: `npm run e2e -- replay-mobile` → 4 tests pass, no flakiness
```

**4.2 Update PROGRESS.md session log:**
```markdown
- **Task 12: E2E Tests - Mobile Replay** ✅ Complete:
  - Created `tests/e2e/replay-mobile.spec.ts` with 4 comprehensive E2E tests
  - Test 1: Canvas fits 375px viewport with no horizontal scroll ✅
  - Test 2: Canvas maintains 4:3 aspect ratio at 500px viewport ✅
  - Test 3: Play/pause button meets 48×48px touch target requirement ✅
  - Test 4: Desktop canvas caps at 800×600 at 1920px viewport ✅
  - All 12 tests passing across Chromium, Firefox, and WebKit
  - No flakiness detected (10 consecutive runs, 100% pass rate)
  - Multi-stage wait strategy prevents race conditions
  - Tolerance-based assertions handle browser rounding differences
  - TypeScript and ESLint checks pass with 0 errors
```

---

## Common Pitfalls & Solutions

| Pitfall | Solution |
|---------|----------|
| **Canvas not visible** | Use 10s timeout + 200ms stabilization delay |
| **Exact pixel matching fails** | Use `≤` or `toBeCloseTo()` with tolerance |
| **Play button not found** | Use title attribute selector, not CSS classes |
| **Tests flaky on WebKit** | Add `waitForLoadState('networkidle')` first |
| **Test animation missing** | Use `test.skip()` to fail gracefully |
| **Slow test execution** | Independent navigation is worth the 6s overhead |

---

## Success Metrics

**Required outcomes:**
- ✅ File created: `tests/e2e/replay-mobile.spec.ts` (~90-120 lines)
- ✅ All 12 tests pass (4 tests × 3 browsers)
- ✅ No flakiness in 10 consecutive runs
- ✅ Total execution time: <30s per run
- ✅ TypeScript compilation: 0 errors
- ✅ ESLint: 0 warnings
- ✅ TASKS.md and PROGRESS.md updated

**Impact:**
- Automated verification of mobile replay optimization
- Protection against regressions in responsive canvas sizing
- WCAG touch target compliance enforcement
- Cross-browser compatibility guarantee (Chromium, Firefox, WebKit)
- Confidence that mobile users can view replays without horizontal scroll

---

## Next Steps After Task 12

Once tests pass:
1. **Task 13**: Manual test - desktop regression
2. **Task 14**: Manual test - orientation handling
3. **Task 15**: Manual test - playback functionality
4. **Task 16**: Pre-push verification (lint + typecheck)
5. **Task 17**: Cross-browser testing
6. **Task 18**: Deploy to staging

**Estimated time for Task 12:** 60-75 minutes
- Writing tests: 30-40 minutes
- Debugging flakiness: 15-20 minutes
- Verification & documentation: 15 minutes

**Risk level:** Medium-High
- Canvas timing can be tricky across browsers
- React-Konva hydration timing requires careful waits

**Mitigation:** Multi-stage wait strategy + tolerance-based assertions provide robust protection against timing issues.
