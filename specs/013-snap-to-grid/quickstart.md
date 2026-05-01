# Quickstart: Manual Test Guide — Snap-to-Grid (Phase 2j)

**Date**: 2026-05-01

---

## Prerequisites

1. Dev server running: `npm run dev`
2. Logged in as a Tier 1 (authenticated) user at `http://localhost:3000`
3. An animation open in the editor at `/app`

---

## Test 1 — Toggle Appears in Normal Mode (P1)

1. Open `/app` with an animation loaded
2. Confirm the **snap toggle button** (grid icon) is visible in the top toolbar
3. Confirm the button is **not** visually highlighted (snap is off by default)

**Expected**: Grid icon visible, not highlighted.

---

## Test 2 — Enabling Snap Shows Grid Overlay (P1)

1. Click the snap toggle button
2. Observe the canvas

**Expected**: A subtle grid of horizontal and vertical lines appears over the pitch. Lines are low-opacity (visible but not dominating). Toggle button appears highlighted/pressed.

---

## Test 3 — Entity Snaps on Drag-Release (P1)

1. Snap-to-grid is enabled (grid visible)
2. Drag a player to a position mid-cell (between grid lines)
3. Release the player

**Expected**: On release, the player jumps to the nearest grid intersection. Its center aligns exactly with a grid line crossing.

---

## Test 4 — Disabling Snap Removes Grid and Allows Free Drag (P1)

1. Click the snap toggle again to disable
2. Drag a player

**Expected**: Grid overlay disappears. Player moves freely with no snapping. Toggle button no longer highlighted.

---

## Test 5 — Snap State Persists Across Frames (P2)

1. Enable snap-to-grid on frame 1
2. Use the frame navigation controls (next frame / add frame)
3. Observe snap toggle state

**Expected**: Toggle remains active. Grid overlay still visible. No snap state reset.

---

## Test 6 — Toggle Hidden in Focus Mode (Clarification Q1)

1. With snap enabled, click the **Focus Mode** button (Maximize icon)
2. Observe the toolbar

**Expected**: The snap toggle is no longer visible. Grid overlay remains visible (snap state carried into Focus Mode).

3. Exit Focus Mode

**Expected**: Snap toggle reappears, still showing as active. Grid overlay still visible.

---

## Test 7 — Annotations Unaffected (FR-005)

1. Enable snap-to-grid
2. Select an annotation drawing tool (arrow or free-draw)
3. Draw an annotation across the canvas

**Expected**: Annotation draws freely — no snapping to grid intersections.

---

## Test 8 — Replay Route Unaffected (FR-006, SC-004)

1. Open a saved animation at `/replay/[id]`

**Expected**: No grid overlay visible. Page renders identically to before this feature.

---

## Test 9 — Share Route Unaffected (FR-006, SC-004)

1. Open a share link at `/share/[id]`

**Expected**: No grid overlay visible. Layout unchanged. No console errors.

---

## CI Checks

```bash
npm run lint           # Must pass with no new errors
npx tsc --noEmit       # Must pass with no new type errors
npm test -- --run      # snapGrid.test.ts and GridLayer.test.tsx must pass
```
