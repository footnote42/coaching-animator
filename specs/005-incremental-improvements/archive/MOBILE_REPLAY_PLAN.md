# Mobile Replay Optimization - Implementation Plan

**Project:** Coaching Animator
**Focus:** Viewport-Aware Canvas Scaling (Option 1 Only)
**Date:** 2026-02-07
**Timeline:** 2-3 days

---

## Context

**Current Problem:**
The replay viewer uses hardcoded 800×600 canvas dimensions, causing horizontal overflow on mobile (<640px viewports). Mobile users must scroll horizontally to see the entire pitch—poor UX for a casual playback viewer.

**User Intent:**
Mobile users need to:
- Open a replay link
- Immediately see the entire pitch (no scrolling)
- Press play/pause comfortably
- Understand entity positions and movement

**Critical Constraints:**
- ❌ NO pinch/pan gestures
- ❌ NO performance mode heuristics
- ❌ NO mobile/desktop code forking
- ❌ NO Konva refactoring
- ✅ Minimal, safe, incremental changes
- ✅ Preserve desktop behavior (800×600 max)
- ✅ Ship in 2-3 days

---

## Implementation Steps

### Production Fixes Applied

The following 4 critical issues have been addressed in this plan:

1. **SSR-Safe `window.devicePixelRatio`** (Stage.tsx)
   - Added `typeof window !== 'undefined'` check
   - Prevents server-side rendering crashes

2. **Negative Width Prevention** (useCanvasSize.ts)
   - Added `Math.max(minWidth, ...)` constraint
   - Minimum canvas width: 280px (prevents nonsense values)

3. **iOS Resize Storm Mitigation** (useCanvasSize.ts)
   - Implemented RAF-based debounce (not timer-based)
   - Prevents jank from Safari URL bar show/hide

4. **Layout Flash Prevention** (ReplayViewer.tsx)
   - Keep `max-w-[800px]` on outer container for initial CSS layout
   - Hook only adjusts Stage dimensions (reduces CLS)

**Testing Fix:** Playwright assertions use `toBeCloseTo()` instead of exact equality to handle devicePixelRatio rounding.

---

### Step 1: Create `useCanvasSize` Hook

**File:** `src/hooks/useCanvasSize.ts` (NEW)

**Purpose:** Calculate canvas dimensions based on viewport width while preserving 4:3 aspect ratio.

```typescript
import { useState, useEffect, useRef } from 'react';

interface CanvasSize {
  width: number;
  height: number;
}

export function useCanvasSize(
  maxWidth: number = 800,
  aspectRatio: number = 4 / 3,
  minWidth: number = 280
): CanvasSize {
  // SSR-safe initial state (prevents hydration mismatch)
  const [size, setSize] = useState<CanvasSize>({
    width: maxWidth,
    height: maxWidth / aspectRatio,
  });

  const rafIdRef = useRef<number>();

  useEffect(() => {
    function calculateSize(): CanvasSize {
      const padding = 32; // 16px each side

      // FIXED: Prevent negative width on tiny screens (Issue #2)
      const constrainedWidth = Math.max(
        minWidth,
        Math.min(window.innerWidth - padding, maxWidth)
      );

      return {
        width: constrainedWidth,
        height: constrainedWidth / aspectRatio,
      };
    }

    // FIXED: RAF debounce for iOS resize storms (Issue #3)
    function handleResize() {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      rafIdRef.current = requestAnimationFrame(() => {
        setSize(calculateSize());
      });
    }

    // Set initial size (client-side only)
    handleResize();

    // Listen for viewport changes
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [maxWidth, aspectRatio, minWidth]);

  return size;
}
```

**Key Details:**
- Default 800×600 (desktop max) prevents hydration mismatch
- 32px total padding (16px each side) for breathing room
- Maintains strict 4:3 aspect ratio (pitch consistency)
- **Minimum width 280px** prevents negative/nonsense values (Issue #2 ✓)
- **RAF debounce** prevents iOS Safari resize storms (Issue #3 ✓)
- Cleans up RAF on unmount (no memory leaks)

---

### Step 2: Update `ReplayViewer.tsx`

**File:** `src/components/replay/ReplayViewer.tsx`

#### A. Replace Hardcoded Canvas Dimensions

**Before:**
```typescript
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
```

**After:**
```typescript
import { useCanvasSize } from '@/hooks/useCanvasSize';

// Inside ReplayViewer component:
const { width: canvasWidth, height: canvasHeight } = useCanvasSize(800, 4/3);
```

#### B. Update Canvas Container

**Before:**
```typescript
<div className="w-full max-w-[800px] aspect-[4/3] border border-border bg-white overflow-hidden">
  <Stage width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
```

**After (FIXED: Prevents layout flash - Issue #4):**
```typescript
<div className="w-full max-w-[800px] mx-auto px-4">
  <div className="border border-border bg-white overflow-hidden">
    <Stage width={canvasWidth} height={canvasHeight}>
```

**Rationale:**
- Keep `max-w-[800px]` on outer container for initial CSS layout
- Prevents "pop" on mobile (starts at 100% width, constrained to 800px)
- Hook only adjusts Stage dimensions (not container)
- Reduces CLS (Cumulative Layout Shift) risk
- `mx-auto` centers canvas on all viewports

#### C. Responsive Control Layout

**Before:**
```typescript
<div className="mt-4 flex items-center gap-4">
  {/* 8 buttons in a row */}
</div>
```

**After:**
```typescript
<div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
  {/* Primary controls (always visible) */}
  <div className="flex items-center gap-2">
    <button className="w-12 h-12 sm:w-10 sm:h-10 rounded border ...">
      {/* Reset */}
    </button>
    <button className="w-12 h-12 sm:w-10 sm:h-10 rounded border ...">
      {/* Prev */}
    </button>
    <button className="w-12 h-12 sm:w-10 sm:h-10 rounded border ...">
      {/* Play/Pause */}
    </button>
    <button className="w-12 h-12 sm:w-10 sm:h-10 rounded border ...">
      {/* Next */}
    </button>
  </div>

  {/* Secondary controls (wrap on mobile) */}
  <div className="flex items-center gap-2">
    <button className="px-4 py-2 sm:px-3 sm:py-1 rounded border text-sm ...">
      0.5x
    </button>
    <button className="px-4 py-2 sm:px-3 sm:py-1 rounded border text-sm ...">
      1x
    </button>
    <button className="px-4 py-2 sm:px-3 sm:py-1 rounded border text-sm ...">
      2x
    </button>
    <button className="w-12 h-12 sm:w-10 sm:h-10 rounded border ...">
      {/* Loop toggle */}
    </button>
  </div>
</div>
```

**Touch Target Compliance:**
- Mobile: 48px (w-12 h-12)
- Desktop: 40px (w-10 h-10)
- Speed buttons: Larger padding on mobile (px-4 py-2 = min 48px width)

**Optional UX Improvement (not required, but recommended):**

Since the primary mobile use case is "quick playback" (not detailed control), consider simplifying to just Play/Pause prominently:

```typescript
<div className="mt-4 flex flex-col items-center gap-3">
  {/* Primary: Just Play/Pause on mobile */}
  <div className="flex justify-center">
    <button className="w-14 h-14 rounded-full border ...">
      {isPlaying ? <Pause /> : <Play />}
    </button>
  </div>

  {/* Secondary controls: wrap below */}
  <div className="flex items-center gap-2 text-sm">
    <button className="px-3 py-1">Reset</button>
    <button className="px-3 py-1">Prev</button>
    <button className="px-3 py-1">Next</button>
    <button className="px-3 py-1">1x</button>
  </div>
</div>
```

This reduces cognitive load and vertical space on mobile. Ship this later if feedback shows users want simpler controls.

---

### Step 3: Add Landscape Orientation Hint

**File:** `src/components/replay/ReplayViewer.tsx`

**Location:** Above canvas container

```typescript
{canvasWidth < 600 && (
  <div className="mb-3 px-4 py-2 bg-surface-darker border border-border rounded text-sm text-muted-foreground text-center">
    💡 Rotate device for best viewing experience
  </div>
)}
```

**Behavior:**
- Shows when canvas width < 600px (narrow portrait)
- Non-blocking (playback works fine)
- Dismissible? NO - keeps it simple, users can ignore it
- Uses existing design tokens (surface-darker, muted-foreground)

---

### Step 4: Update Replay Page Header

**File:** `app/replay/[id]/page.tsx`

#### A. Responsive Title Sizing

**Before:**
```typescript
<h1 className="text-2xl font-heading font-bold">
```

**After:**
```typescript
<h1 className="text-xl sm:text-2xl font-heading font-bold">
```

#### B. Stack Metadata on Mobile

**Before:**
```typescript
<div className="flex items-center gap-4 mt-2 text-sm">
  <span>By {animation.user_profiles?.display_name}</span>
  <span>•</span>
  <span>{animation.category}</span>
  {/* ... */}
</div>
```

**After:**
```typescript
<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm">
  <span>By {animation.user_profiles?.display_name}</span>
  <span className="hidden sm:inline">•</span>
  <span>{animation.category}</span>
  <span className="hidden sm:inline">•</span>
  <span>{animation.frames?.length || 0} frames</span>
  {/* ... */}
</div>
```

**Changes:**
- Vertical stack on mobile (`flex-col`), horizontal on desktop (`sm:flex-row`)
- Hide bullets on mobile (`hidden sm:inline`)
- Consistent gap spacing (8px mobile, 16px desktop)

---

### Step 5: Update `Stage.tsx` (Minimal)

**File:** `src/components/Canvas/Stage.tsx`

**Change:** Ensure props are passed through correctly

```typescript
interface StageProps {
  width: number;  // Now dynamic (was always 800)
  height: number; // Now dynamic (was always 600)
  // ... rest of props
}

export function Stage({ width, height, ...props }: StageProps) {
  return (
    <KonvaStage
      width={width}
      height={height}
      pixelRatio={window.devicePixelRatio || 1}  // ✓ Already correct
      {...props}
    />
  );
}
```

**Required Fix:** Add SSR-safe window check for devicePixelRatio

```typescript
interface StageProps {
  width: number;  // Now dynamic (was always 800)
  height: number; // Now dynamic (was always 600)
  // ... rest of props
}

export function Stage({ width, height, ...props }: StageProps) {
  // FIXED: SSR-safe devicePixelRatio (Issue #1)
  const pixelRatio = typeof window !== 'undefined'
    ? (window.devicePixelRatio || 1)
    : 1;

  return (
    <KonvaStage
      width={width}
      height={height}
      pixelRatio={pixelRatio}
      {...props}
    />
  );
}
```

---

## File-Level Patch Map

| File | Lines Changed | Type | Risk |
|------|---------------|------|------|
| `src/hooks/useCanvasSize.ts` | +50 | NEW | 🟢 Low (isolated, well-tested) |
| `src/components/replay/ReplayViewer.tsx` | ~35 | MODIFY | 🟡 Medium (core UI) |
| `app/replay/[id]/page.tsx` | ~15 | MODIFY | 🟢 Low (layout only) |
| `src/components/Canvas/Stage.tsx` | +5 | MODIFY | 🟢 Low (SSR safety only) |

**Total Code Impact:** ~105 lines added/modified across 4 files

**Production Safety:** All 4 critical issues pre-emptively fixed (SSR, negative width, resize storms, layout flash)

---

## Regression & Testing Checklist

### Pre-Implementation Validation

- [ ] Capture desktop screenshot at 1920×1080 (baseline)
- [ ] Capture desktop screenshot at 800×600 (minimum desktop)
- [ ] Verify current mobile behavior (iPhone SE 375px - overflow confirmed)

### Unit Tests

```typescript
// src/hooks/useCanvasSize.test.ts
describe('useCanvasSize', () => {
  it('returns max size when viewport exceeds max width', () => {
    // Mock window.innerWidth = 1920
    // Expect: { width: 800, height: 600 }
  });

  it('scales down when viewport is narrow', () => {
    // Mock window.innerWidth = 400
    // Expect: { width: 368, height: 276 } (400 - 32 padding)
  });

  it('maintains 4:3 aspect ratio', () => {
    // Test multiple viewport sizes
    // Verify: width / height === 4/3
  });

  it('updates on resize events', () => {
    // Trigger window.resize
    // Verify: size state updates
  });
});
```

### Playwright E2E Test

**File:** `tests/e2e/replay-mobile.spec.ts` (NEW)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Mobile Replay Viewer', () => {
  test('canvas fits viewport at 375px (iPhone SE)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/replay/[test-animation-id]');

    const canvas = page.locator('canvas').first();
    const canvasBounds = await canvas.boundingBox();

    // Canvas should fit within viewport (allow 32px padding)
    expect(canvasBounds.width).toBeLessThanOrEqual(375 - 32);

    // No horizontal scrollbar
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBe(clientWidth);
  });

  test('canvas maintains 4:3 aspect ratio', async ({ page }) => {
    await page.setViewportSize({ width: 500, height: 800 });
    await page.goto('/replay/[test-animation-id]');

    const canvas = page.locator('canvas').first();
    const bounds = await canvas.boundingBox();

    const aspectRatio = bounds.width / bounds.height;
    expect(aspectRatio).toBeCloseTo(4/3, 1); // 1 decimal precision
  });

  test('play/pause button meets 48px touch target on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/replay/[test-animation-id]');

    const playButton = page.getByRole('button', { name: /play|pause/i });
    const bounds = await playButton.boundingBox();

    expect(bounds.width).toBeGreaterThanOrEqual(48);
    expect(bounds.height).toBeGreaterThanOrEqual(48);
  });

  test('desktop behavior unchanged (800px max)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/replay/[test-animation-id]');

    const canvas = page.locator('canvas').first();
    const bounds = await canvas.boundingBox();

    // FIXED: Use toBeCloseTo to avoid devicePixelRatio rounding issues
    expect(bounds.width).toBeCloseTo(800, 0);
    expect(bounds.height).toBeCloseTo(600, 0);

    // Alternative: use less brittle assertion
    expect(bounds.width).toBeLessThanOrEqual(800);
    expect(bounds.height).toBeLessThanOrEqual(600);
  });
});
```

### Manual Testing Devices

| Device | Viewport | Test Focus |
|--------|----------|------------|
| iPhone SE | 375×667 | Minimum viable mobile, no overflow |
| iPhone 14 | 390×844 | Landscape rotation hint |
| iPad Mini | 768×1024 | Tablet layout, landscape mode |
| Desktop | 1920×1080 | Desktop regression (800×600 max) |

### Verification Steps

1. **No Overflow Check:**
   - Open replay on iPhone SE (375px)
   - Confirm entire canvas visible without horizontal scroll
   - Verify padding on left/right edges

2. **Aspect Ratio Check:**
   - Resize browser from 375px → 1920px
   - Pitch aspect ratio remains 4:3 at all sizes
   - Field SVG scales correctly (no distortion)

3. **Touch Target Check:**
   - All buttons ≥48px on mobile (<640px)
   - Speed buttons (0.5x/1x/2x) easily tappable
   - No accidental taps on adjacent controls

4. **Desktop Regression:**
   - Canvas remains 800×600 on large screens
   - Control layout matches original (horizontal row)
   - No visual changes to header/footer

5. **Orientation Handling:**
   - Rotate device portrait → landscape
   - Canvas resizes smoothly (no full page refresh needed)
   - Landscape hint disappears when width >600px

6. **Playback Functionality:**
   - Play/pause works on mobile
   - Speed controls (0.5x/1x/2x) functional
   - Frame scrubbing works (frame strip)
   - Entity interpolation smooth (60fps)

---

## Done Definition

### Success Criteria

✅ **Mobile UX:**
- [ ] Zero horizontal scrolling on iPhone SE (375px)
- [ ] Entire pitch visible without zooming/panning
- [ ] Play/pause button ≥48px touch target
- [ ] Controls wrap cleanly (no overlapping buttons)
- [ ] Landscape hint shown when canvas <600px wide

✅ **Desktop Preservation:**
- [ ] Canvas remains 800×600 max on large screens
- [ ] Control layout unchanged (horizontal row)
- [ ] No visual regressions in header/footer

✅ **Technical Quality:**
- [ ] No SSR hydration warnings in console
- [ ] No layout shift (CLS) during page load
- [ ] Resize events handled without jank
- [ ] TypeScript compiles with zero errors
- [ ] ESLint passes with zero warnings

✅ **Testing:**
- [ ] Unit tests for `useCanvasSize` hook (4 tests)
- [ ] Playwright E2E tests pass (4 mobile scenarios)
- [ ] Manual testing on 4 devices (see grid above)

---

## Implementation Order

### Day 1: Core Functionality

1. Create `useCanvasSize.ts` hook
2. Update `ReplayViewer.tsx` canvas sizing
3. Manual test on Chrome DevTools mobile emulation
4. Fix any initial issues

### Day 2: UI Polish

5. Add responsive control layout
6. Update page header/metadata stacking
7. Add landscape orientation hint
8. Manual test on real iOS device

### Day 3: Testing & Deploy

9. Write unit tests for `useCanvasSize`
10. Write Playwright E2E mobile tests
11. Cross-browser testing (Safari, Chrome, Firefox)
12. Deploy to staging → production

---

## Risk Mitigation

### SSR Hydration Mismatch ✅ FIXED

- **Risk:** Server renders 800×600, client resizes → React warning
- **Mitigation:** Default to 800×600 in `useState`, update only in `useEffect`
- **Status:** Implemented in useCanvasSize hook

### SSR Window Access ✅ FIXED

- **Risk:** `window.devicePixelRatio` causes server-side crash
- **Mitigation:** Added `typeof window !== 'undefined'` check in Stage.tsx
- **Status:** Implemented in Step 5

### Resize Event Storm ✅ FIXED

- **Risk:** iOS Safari URL bar show/hide triggers rapid resizes
- **Mitigation:** RAF-based debounce (not timer-based) in useCanvasSize
- **Status:** Implemented with `requestAnimationFrame` + cleanup

### Negative Canvas Width ✅ FIXED

- **Risk:** Extreme tiny screens (<280px) cause nonsense canvas dimensions
- **Mitigation:** `Math.max(280, ...)` in calculateSize()
- **Status:** Implemented with configurable minWidth parameter

### Layout Flash (CLS) ✅ FIXED

- **Risk:** Canvas "pops" from 800px → smaller on mobile page load
- **Mitigation:** Keep `max-w-[800px]` on outer container, hook adjusts Stage only
- **Status:** Implemented in ReplayViewer canvas container

### Touch Target Compliance

- **Risk:** Speed buttons <48px on very narrow screens (<360px)
- **Mitigation:** Use `px-4 py-2` (min 48px width) + `w-12 h-12` on mobile
- **Status:** Specified in Step 2C responsive control layout

### Canvas Quality on Small Screens

- **Risk:** Canvas too small to see tactics clearly
- **Mitigation:** Landscape hint encourages rotation (acceptable tradeoff)
- **Status:** Implemented in Step 3

---

## Out of Scope (Explicitly Deferred)

- ❌ Pinch-to-zoom gestures
- ❌ Pan gestures for canvas navigation
- ❌ Performance mode / quality reduction
- ❌ Mobile/desktop code forking
- ❌ Container queries (CSS approach)
- ❌ Fullscreen mode toggle
- ❌ Custom speed slider (keep 3 buttons)
- ❌ Control hamburger menu
- ❌ Field SVG optimization

These remain **future considerations** only if user feedback demands them.
