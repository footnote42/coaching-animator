# Data Model: Snap-to-Grid (Phase 2j)

**Task**: 013-snap-to-grid
**Date**: 2026-05-01
**Status**: complete

---

## Summary

No database schema changes. No new persistent entities. Snap-to-grid is a session-only UI preference and a computed geometry constant — both live entirely in client-side state.

---

## UIStore Extension

**File**: `src/core/stores/uiStore.ts`

### New State Field

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `snapToGrid` | `boolean` | `false` | Whether snap-to-grid is currently active |

### New Action

| Action | Signature | Description |
|--------|-----------|-------------|
| `toggleSnapToGrid` | `() => void` | Toggles `snapToGrid` between `true` and `false` |

No persistence (no localStorage, no Supabase). State resets to `false` on page reload.

---

## Grid Constants

**File**: `src/features/animation/services/snapGrid.ts`

| Constant | Value | Description |
|----------|-------|-------------|
| `GRID_COLS` | `16` | Number of vertical grid divisions |
| `GRID_ROWS` | `12` | Number of horizontal grid divisions |

These constants are the single source of truth for grid density. Changing them affects both the visual grid overlay and the snap calculation automatically.

---

## Derived Geometry (computed at runtime, never stored)

| Value | Formula | Description |
|-------|---------|-------------|
| `cellW` | `stageWidth / GRID_COLS` | Width of one grid cell in canvas pixels |
| `cellH` | `stageHeight / GRID_ROWS` | Height of one grid cell in canvas pixels |
| Snap X | `Math.round(x / cellW) * cellW` | Nearest grid column intersection |
| Snap Y | `Math.round(y / cellH) * cellH` | Nearest grid row intersection |

---

## Existing Entities — No Changes

Entity positions (`x`, `y`) in the project data model are unchanged. After snap, the stored coordinates happen to align with grid intersections, but the schema enforces no such constraint — this remains a UI-layer behaviour, not a data-layer constraint.
