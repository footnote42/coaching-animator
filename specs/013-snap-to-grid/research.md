# Research: Snap-to-Grid (Phase 2j)

**Task**: 013-snap-to-grid
**Date**: 2026-05-01
**Status**: complete

---

## Summary

Snap-to-grid is a pure arithmetic transformation on the existing drag pipeline. No new Konva APIs, no schema changes, no new Zustand patterns. Everything maps onto existing code.

---

## Drag Pipeline

**File**: `src/features/animation/components/Canvas/PlayerToken.tsx:93`

`handleDragEnd` reads `node.x()` / `node.y()`, clamps to 0–2000, resets the Konva node, and calls `onDragEnd(clampedX, clampedY)`. Snap rounding is inserted between the bounds clamp and the `onDragEnd` call — no structural change to the pipeline.

The Konva stage coordinate space is the pixel dimensions passed to `<Stage width height>`. Entity positions stored in project state are in that pixel-based canvas space (0 to `stageWidth`/`stageHeight`). The current clamp of 2000 is a defensive default; the snap function must use the actual stage dimensions.

**Snap formula** (O(1)):
```
cellW = stageWidth / GRID_COLS
cellH = stageHeight / GRID_ROWS
snappedX = round(x / cellW) * cellW
snappedY = round(y / cellH) * cellH
```

## Entity Anchor Point

**File**: `src/features/animation/components/Canvas/PlayerToken.tsx:162`

Konva `Group` x/y is the registration point. All child shapes (circles, ellipses, rects) are centered at `(0, 0)` within the group (they use `radius` for circles, or `offsetX`/`offsetY` for rects). Therefore `entity.x` / `entity.y` is already the visual center. Snap-to-center needs no additional offset arithmetic.

## State Management

**File**: `src/core/stores/uiStore.ts`

`showGhosts: boolean` + `toggleGhosts: () => void` (lines 34, 78-81) is the canonical pattern for boolean UI toggles. `snapToGrid` follows this exactly — one state field, one toggle action, Zustand devtools name already set.

## Focus Mode

**File**: `src/features/animation/components/Editor.tsx:197`

Focus mode is a local `useState<boolean>` in `Editor.tsx`, not in `uiStore`. The snap toggle is rendered with `{!focusMode && ...}` — same guard used for the sidebar and Progression Panel (lines 310, 362). Snap state lives in `uiStore` and is unaffected by focus mode transitions.

## Grid Overlay

**Files**: `src/features/animation/components/Canvas/GhostLayer.tsx`, `Stage.tsx`

`GhostLayer` is a sibling `<Layer>` inside `<Stage>`. `GridLayer` follows the same pattern: a Konva `Layer` with `listening={false}`, inserted between `<FieldLayoutOverlay>` and `<GhostLayer>` in `Editor.tsx`.

Grid lines: `GRID_COLS - 1` vertical + `GRID_ROWS - 1` horizontal `<Line>` shapes. Each line spans the full stage dimension. Color uses `DESIGN_TOKENS.colours.primary` at opacity 0.15 — below entities, above pitch SVG, low enough contrast not to obscure pitch markings.

## Replay / Share Isolation

**Files**: `src/app/replay/[id]/page.tsx`, `src/app/share/[id]/page.tsx`

Neither route renders `Editor.tsx`, `EditorFloatingRemote`, or `uiStore.snapToGrid`. The `GridLayer` component is only instantiated inside `Editor.tsx`. No code paths in `ReplayViewer` or `ShareViewer` are affected.

## `stageWidth` / `stageHeight` Availability

`Editor.tsx` tracks canvas dimensions via a `ResizeObserver` (or equivalent hook) to size the `<Stage>`. These values are already passed as props to `EntityLayer` via the stage size. The same values are threaded to `PlayerToken` as new props `stageWidth` / `stageHeight`.

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|-----------------|
| `dragBoundFunc` on Konva Group | Fires during drag movement (continuous), not just on release; would cause the entity to visually jump on every frame, which can feel erratic at fine densities |
| Snap on `onDragMove` (continuous visual snap) | More complex — requires resetting node position mid-drag and can conflict with Konva's internal drag state; the spec says "snaps on each drag movement" but the acceptance criteria require exact position on release — snap-on-release satisfies both |
| Separate snap Zustand store | Overkill for a single boolean — `uiStore` is the correct home alongside `showGhosts` |
| Persisting snap state to DB or URL | Out of scope per spec; session-only is sufficient |
