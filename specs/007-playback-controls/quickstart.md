# Quickstart: Playback Controls (007) — Manual Test Guide

**Branch**: `007-playback-controls` | **Date**: 2026-04-25

---

## Pre-conditions

```bash
npm run dev   # dev server on http://localhost:3000
```

Log in with a test account (or use guest mode — the floating remote appears for all users).

---

## Test 1: Remote is always visible (US1 — P1 MVP)

**Goal**: Verify the floating remote stays visible while the pitch is in view.

1. Open `http://localhost:3000/app`
2. Load any animation (or create a new one)
3. On a mobile viewport (DevTools → iPhone 14, 390×844): scroll the page up and down
4. **Expected**: The floating remote (pill with play button and frame counter) stays visible on screen at all times — it does NOT scroll with the page content

**Verification**: `position: fixed` is applied. Inspect element in DevTools — the remote element should show `position: fixed` in computed styles.

---

## Test 2: Playback controls function correctly (US1)

**Goal**: All four buttons work.

1. Load an animation with at least 3 frames
2. On the floating remote, tap/click **Play** → animation starts, button changes to Pause icon
3. Tap/click **Pause** → animation stops
4. Tap/click **Next Frame** (right arrow) → frame counter increments by 1
5. Tap/click **Prev Frame** (left arrow) → frame counter decrements by 1
6. Navigate to frame 1, tap **Prev Frame** → button is disabled (no frame 0)
7. Navigate to last frame, tap **Next Frame** → button is disabled

---

## Test 3: Remote stays within viewport bounds (US1, FR-006)

**Goal**: Remote cannot be dragged off screen.

1. Open editor on desktop
2. Drag the remote towards each edge (top, bottom, left, right)
3. **Expected**: Remote stops at the viewport edge — never hides or goes partially off screen
4. Release mouse — remote stays at the clamped position

---

## Test 4: Position persists across page reload (US2, FR-007)

**Goal**: localStorage persistence works.

1. Drag the floating remote to the top-left corner of the screen
2. Note the approximate position
3. Reload the page (`Ctrl+R` / `Cmd+R`)
4. **Expected**: Remote reappears at the top-left position from before the reload — NOT at the default bottom-right

**Verification**: In DevTools → Application → Local Storage → `localhost:3000` → key `editor-remote-pos` should contain `{"x": <approx_x>, "y": <approx_y>}`.

---

## Test 5: Invalid stored position falls back to default (US2, FR-008)

**Goal**: Out-of-bounds stored position resets gracefully.

1. In DevTools → Application → Local Storage, manually set `editor-remote-pos` to `{"x": 99999, "y": 99999}`
2. Reload the page
3. **Expected**: Remote appears at the default position (bottom-right), not off screen

---

## Test 6: Frame counter updates in real time (US3)

**Goal**: "N / M" counter stays in sync with animation playback.

1. Load an animation with at least 5 frames
2. Note the remote displays `1 / 5` (or however many frames)
3. Press Play
4. **Expected**: Counter increments with each frame change — `1 / 5` → `2 / 5` → ... → `5 / 5`
5. Press Prev Frame twice from frame 5
6. **Expected**: Counter shows `3 / 5`

---

## Test 7: Single-frame animation (Edge case)

**Goal**: Buttons disabled appropriately.

1. Create a new project (single frame by default)
2. **Expected**: Both Prev Frame and Next Frame buttons are disabled
3. Play/Pause still work (animation "plays" but doesn't advance)

---

## Test 8: Shared canvas routes unaffected (SC-006)

**Goal**: No regressions on other routes.

1. Open `/replay/<any-valid-id>` → verify ReplayViewer renders normally, no floating remote from this feature
2. Open `/share/<any-valid-id>` → verify existing FloatingRemote still works (play/pause, drag), no duplicate remote
3. Open `/gallery` → verify gallery renders normally

---

## Test 9: Touch drag on mobile (FR-009)

**Goal**: Drag works with touch events.

1. Open DevTools → Toggle device toolbar → iPhone 14 Pro (or similar)
2. Enable touch simulation
3. Long-press and drag the remote's drag handle (grip icon)
4. **Expected**: Remote moves with the drag gesture, stays within viewport bounds on release

---

## Pre-push Gate

```bash
npm run lint && npx tsc --noEmit
```

Zero new errors required before opening the PR.
