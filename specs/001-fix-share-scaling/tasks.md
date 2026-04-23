---
description: "Task list for 001-fix-share-scaling"
---

# Tasks: Fix Mobile Replay Scaling

**Input**: `specs/001-fix-share-scaling/plan.md`, `spec.md`, `research.md`

**Tests**: Not explicitly requested in spec. No test tasks generated.

**Organization**: Tasks grouped by user story. US2 and US3 require verification only (already implemented per research.md).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

## Path Conventions

```
Source:   src/core/hooks/useShareCanvasSize.ts
          src/app/share/[id]/page.tsx

Pre-push: npm run lint && npx tsc --noEmit
Unit:     npm test -- --run
E2E:      npm run e2e  (requires dev server: npm run dev)
```

---

## Phase 1: Setup

**Purpose**: Branch is clean; pre-flight baseline passes.

- [x] T001 Run `npm run lint && npx tsc --noEmit` — confirm zero errors on current branch before any changes

---

## Phase 2: User Story 1 — Animation Fits Screen on First Load (Priority: P1) 🎯 MVP

**Goal**: Canvas renders at the correct mobile size on first paint, with no oversized flash and a full-screen loading state.

**Independent Test**: Open Chrome DevTools → iPhone 14 emulation (390×844) → navigate to `http://localhost:3000/share/<id>`. The full pitch is visible immediately at first paint with no visible size jump. No horizontal scroll. No nav bar.

### Implementation for User Story 1

- [x] T002 [US1] In `src/core/hooks/useShareCanvasSize.ts`: replace `useState<CanvasSize>({ width: 800, height: 600 })` (line 23) with the lazy initializer described in plan.md — reads `window.innerWidth/innerHeight` at mount time to produce correct initial size; retains `typeof window === 'undefined'` guard
- [x] T003 [US1] In `src/app/share/[id]/page.tsx`: replace the `loading: () => ...` callback inside the `dynamic()` call — change from `h-[300px] w-full bg-white/10` to `style={{ position: 'fixed', inset: 0 }} className="animate-pulse bg-black flex items-center justify-center text-white/50"`
- [x] T004 [US1] In `src/app/share/[id]/page.tsx`: remove the `<div className="min-h-screen bg-black flex flex-col items-center justify-center px-0 py-4">` wrapper in the `return` statement — replace with a bare `return <ShareViewer payload={animation.payload} autoPlay={true} />`
- [x] T004a [US1] Verify zero-frames fallback after T004: temporarily pass an empty `frames: []` payload to ShareViewer (or find an animation with zero frames), confirm "No frames to display" text is visible and reasonably centred on a black screen; if centering is broken by wrapper removal, update the no-frames branch in `src/features/animation/components/ShareViewer.tsx` to use `position: fixed; inset: 0` layout consistent with the normal path
- [x] T005 [US1] Run `npm run lint && npx tsc --noEmit` — confirm no new errors after T002–T004a
- [x] T006 [US1] Manual verify in iPhone 14 device emulation (390×844 portrait): canvas fills width, no oversized flash, no scroll bar
- [x] T007 [US1] Manual verify orientation change in device emulation: rotate to landscape (844×390), canvas resizes smoothly to height-constrained dimensions

**Checkpoint**: US1 independently verified — canvas correct on first paint in portrait and landscape.

---

## Phase 3: User Story 2 — Controls Visible and Accessible (Priority: P1)

**Goal**: Confirm FloatingRemote is within safe-area bounds on iPhone 14 Pro emulation.

**Independent Test**: On iPhone 14 Pro emulation, FloatingRemote pill is visible and tappable above the home indicator safe area.

**No code changes required** (research.md — Finding 4: FloatingRemote safe-area already implemented in `src/features/animation/components/Canvas/FloatingRemote.tsx`).

### Verification for User Story 2

- [x] T008 [US2] Manual verify FloatingRemote on iPhone 14 Pro emulation (393×852 with notch): pill is visible at bottom-right of canvas, not obscured by home indicator
- [x] T009 [US2] Tap the play button — animation starts; tap again — animation pauses; double-tap — resets to frame 1

**Checkpoint**: US2 verified — controls visible and functional within safe areas.

---

## Phase 4: User Story 3 — No Navigation Bar on Share Route (Priority: P2)

**Goal**: Confirm the navigation bar is absent on `/share/[id]` and the canvas uses the full viewport height.

**Independent Test**: Screenshot of `/share/[id]` shows no site navigation bar.

**No code changes required** (research.md — Finding 2: `src/shared/components/Navigation.tsx` line 34 already returns null for `/share/*` routes).

### Verification for User Story 3

- [x] T010 [US3] On desktop viewport (1280×800), open `/share/<id>` in browser — confirm no navigation bar is rendered (inspect DOM: no `<nav>` element visible on screen)
- [x] T011 [US3] Navigate to `/gallery` — confirm navigation bar is present as normal (no regression)

**Checkpoint**: US3 verified — share route is navigation-free; other routes unaffected.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final quality gates and regression checks across all canvas routes.

- [x] T012 [P] Manual verify `/app` route (editor) — canvas renders, players/entities visible, edit tools functional, navigation bar present
- [x] T013 [P] Manual verify `/replay/<id>` route — replay viewer renders and plays back correctly at desktop viewport
- [x] T014 [P] Manual verify `/share/<id>` on a 320px-wide viewport (iPhone SE): full pitch visible (may be small, but complete and unclipped)
- [x] T015 Run `npm test -- --run` — all unit tests pass
- [x] T016 Run `npm run e2e` — all E2E tests pass (dev server running on port 3000)
- [x] T017 Run `npm run lint && npx tsc --noEmit` — final gate; zero new errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (US1)**: Depends on Phase 1 — T002, T003, T004 can run in parallel (different files), T005–T007 follow
- **Phase 3 (US2)**: Independent of Phase 2 — can verify in parallel with Phase 2 development
- **Phase 4 (US3)**: Independent — can verify at any time
- **Phase 5 (Polish)**: Depends on all phases complete

### Within Phase 2

- T002, T003+T004 are different files → run in parallel
- T005 (lint gate) follows T002–T004
- T006, T007 (manual verify) follow T005

### Parallel Opportunities

- T002 (`useShareCanvasSize.ts`) and T003+T004 (`page.tsx`) — different files, zero conflict
- T008+T009 (US2 verify) and T010+T011 (US3 verify) can be done alongside US1 implementation

---

## Implementation Strategy

### MVP (User Story 1 Only — 2 file edits)

1. T001 — baseline lint gate
2. T002 — fix `useShareCanvasSize` initial state
3. T003+T004 — fix loading placeholder + remove dead wrapper
4. T005 — lint gate after changes
5. T006+T007 — device emulation verify
6. **STOP and VALIDATE**: full pitch visible on iPhone 14 without flash ✓

### Full Completion

- After MVP: verify US2 (T008–T009) and US3 (T010–T011)
- Polish (T012–T017): regression checks + final quality gate

---

## Notes

- No new files — all changes are in-place edits to existing files
- `useShareCanvasSize` is only imported by `ShareViewer` — change is share-route-isolated
- `position:fixed inset:0` on ShareViewer outer container must remain unchanged (spec UI-005)
- Entity colors: no colour changes in scope
- Pre-push gate: `npm run lint && npx tsc --noEmit` must pass (SC-006)

---

## Phase 6: Entity Icon Scaling (US4 — follow-on bug)

**Goal**: Entity icons (players, cones, balls) appear at correct positions on the share route by applying a scale transform (canvasWidth/800, canvasHeight/600) to the entity layer only. The Field (pitch) layer is NOT scaled (it fills stage bounds by design).

**Context**: Entity positions in animation payloads are stored in 800×600 editor coordinate space. `Stage.tsx` applies no `scaleX/scaleY`. This causes entities to render at editor-space pixel positions on a mobile-sized canvas, appearing clustered or off-screen. Pattern reference: `src/lib/thumbnail.ts` lines 116-120.

**Independent Test**: Open Chrome DevTools → iPhone 14 emulation (390×844) → navigate to `http://localhost:3000/share/<id>`. All player tokens and cones must appear overlaid on the pitch, not clustered in a corner.

- [x] T018 [US4] TDD — write a failing Playwright E2E test that navigates to `/share/<id>` on iPhone 14 viewport and asserts that at least one player entity token is visible within the canvas bounds (not outside the viewport). Confirm test is RED before any implementation.
- [x] T019 [US4] Extract editor reference constants: create `src/lib/canvasConstants.ts` exporting `EDITOR_CANVAS_WIDTH = 800` and `EDITOR_CANVAS_HEIGHT = 600`
- [x] T020 [US4] In `src/features/animation/components/ShareViewer.tsx`: compute `entityScaleX = canvasWidth / EDITOR_CANVAS_WIDTH` and `entityScaleY = canvasHeight / EDITOR_CANVAS_HEIGHT` from the existing `canvasSize` values; pass as props to `ShareCanvas` (or directly to `Stage`)
- [x] T021 [US4] In `src/features/animation/components/Canvas/Stage.tsx`: accept optional `entityScaleX` and `entityScaleY` props (default 1); apply them as `scaleX/scaleY` on the Konva `<Layer>` that wraps `EntityLayer` only — the Field layer MUST remain unscaled
- [x] T022 [US4] Confirm `/app` (editor) and `/replay/[id]` routes are unaffected: pass no entity scale props (or verify defaults to 1); manual check that entities render correctly on both routes
- [x] T023 [US4] Run full quality gates: `npm run lint && npx tsc --noEmit`, `npm test -- --run`, `npm run e2e` — all must pass, including T018 E2E test now GREEN
