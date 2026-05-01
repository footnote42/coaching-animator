# Tasks: Phase 2j — Snap-to-Grid

## Phase 1: Foundation (US1)
- [x] **T001**: Create `snapGrid` service (`src/features/animation/services/snapGrid.ts`) with `GRID_COLS=16`, `GRID_ROWS=12`, and `snapPosition` function (rounded grid math + boundary clamping).
- [x] **T002**: Update `uiStore.ts` to include `snapToGrid` boolean (default: false) and `toggleSnapToGrid` action, following the `showGhosts` pattern.
- [x] **T003**: Write unit tests for `snapPosition` covering snapping, clamping, and disabled-state passthrough (`tests/unit/services/snapGrid.test.ts`).

## Phase 2: Entity Snapping (US1)
- [x] **T004**: Update `PlayerToken.tsx` to accept `snapEnabled`, `stageWidth`, and `stageHeight` props; integrate `snapPosition` into `handleDragEnd` before the `onDragEnd` callback.
- [x] **T005**: Update `EntityLayer.tsx` to receive `snapToGrid` and stage dimensions, passing them to all `PlayerToken` instances.
- [x] **T006**: Update `Editor.tsx` to read `snapToGrid` from store and pass it (along with current canvas dimensions) to `EntityLayer`.

## Phase 3: UI Controls (US2)
- [x] **T007**: Add snap toggle button to the editor toolbar in `Editor.tsx`: import `Grid` icon from `lucide-react`, guard with `{!focusMode && ...}`, bind `onClick={toggleSnapToGrid}`, set `aria-label` and `aria-pressed={snapToGrid}`, apply `rounded-none` (UI-003); when active: apply `bg-tactics-white/20` AND a visible ring (`ring-1 ring-white/60`).

## Phase 4: Grid Overlay (US3)
- [x] **T008**: Write render tests for `GridLayer` ensuring it renders `(GRID_COLS-1) + (GRID_ROWS-1)` lines when visible (`tests/unit/components/GridLayer.test.tsx`).
- [x] **T009**: Create `GridLayer` Konva layer (`src/features/animation/components/Canvas/GridLayer.tsx`) rendering subtle lines using `DESIGN_TOKENS.colours.primary` at 0.15 opacity; set `listening={false}`.
- [x] **T010**: Export `GridLayer` from the Canvas barrel (`src/features/animation/components/Canvas/index.ts`).
- [x] **T011**: Insert `GridLayer` into the `Editor.tsx` Stage layer stack between `FieldLayoutOverlay` and `GhostLayer`.

## Phase 5: Verification & Persistence (US4)
- [x] **T012**: Add E2E scenarios covering snap features: toggle visibility, state persistence across frame changes, and focus mode hiding (`tests/e2e/editor.spec.ts`).
- [x] **T013**: CI/CD check: Run `npm run lint && npx tsc --noEmit` and fix any formatting or type issues.
- [x] **T014**: Manual verification: Confirm grid alignment and snap precision in the browser; ensure no regressions on `/replay` or `/share` routes.

---
**Status**: COMPLETE
**Date**: 2026-05-01
