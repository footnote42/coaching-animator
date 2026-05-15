---
description: "Task list for Unified Editor Controls (021-unified-editor-controls)"
---

# Tasks: Unified Editor Controls

**Feature**: `021-unified-editor-controls`  
**Spec**: `specs/021-unified-editor-controls/spec.md`  
**Plan**: `specs/021-unified-editor-controls/plan.md`

**Tests**: SC-007 requires test coverage for all US1–US3 acceptance scenarios. E2E tests are written before implementation (TDD). See Phase 2.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Exact file paths are included in every task description

## Path Conventions

```
Source:   src/features/animation/components/TimelinePanel.tsx         (NEW)
          src/features/animation/components/MobileDrawer.tsx          (MODIFIED)
          src/features/animation/components/Editor.tsx                 (MODIFIED)
          src/features/animation/components/Canvas/EditorFloatingRemote.tsx  (DELETE)

Tests:    tests/e2e/021-timeline-panel.spec.ts

Pre-push: npm run lint && npx tsc --noEmit
Unit:     npm test -- --run
E2E:      npm run e2e  (requires dev server: npm run dev)
```

---

## Phase 1: Setup

**Purpose**: Establish a clean baseline before any changes

- [x] T001 Run `npm run lint && npx tsc --noEmit` and confirm zero errors on current branch before touching any source files
- [x] T002 [P] Grep for all `EditorFloatingRemote` references: `grep -r "EditorFloatingRemote" src/` — confirm only `Editor.tsx` imports it and document any unexpected hits before deletion
- [x] T003 [P] Grep for all `FloatingRemote` references: `grep -r "FloatingRemote" src/` — confirm `ShareViewer.tsx` is the only remaining consumer after `EditorFloatingRemote` is removed; document the full reference map

**Checkpoint**: Zero unexpected `EditorFloatingRemote` references — safe to proceed

---

## Phase 2: E2E Tests (Write First — TDD)

**Purpose**: Write failing E2E tests that define the acceptance bar for US1–US3 before implementation begins

> **NOTE: These tests MUST be written first and MUST fail before implementation (TDD)**

- [x] T004 [US1] Create E2E spec file `tests/e2e/021-timeline-panel.spec.ts` with test scaffold (imports, describe block, beforeEach navigation to `/app`)
- [x] T005 [P] [US1] Write E2E test: right-side TimelinePanel visible at 1366×768 viewport without scrolling — verifies `data-testid="timeline-panel"` is in DOM and visible (SC-001)
- [x] T006 [P] [US1] Write E2E test: Add Frame via TimelinePanel adds a second frame — verifies frame count increments (FR-001)
- [x] T007 [P] [US1] Write E2E test: Delete Frame button is disabled when only 1 frame exists, enabled when 2+ frames exist (FR-006)
- [x] T008 [P] [US1] Write E2E test: Speed and Loop controls are interactive — click 2× updates speed, Loop toggle updates active state (FR-002)
- [x] T009 [P] [US1] Write E2E test: at 375px viewport, TimelinePanel is NOT visible; "Tools & Actions" opens MobileDrawer with Timeline section containing Play/Pause, Add Frame, Speed, Loop (FR-003)
- [x] T010 [P] [US3] Write E2E test: focus mode hides TimelinePanel — `data-testid="timeline-panel"` removed from DOM when focus mode active (FR-007)
- [x] T011 [P] [US3] Write E2E test: `/replay/:id` loads without console errors after EditorFloatingRemote removal (SC-004)

**Checkpoint**: All E2E tests run and fail (no `TimelinePanel` exists yet) — TDD baseline established

---

## Phase 3: User Story 1 — Desktop TimelinePanel Component (Priority: P1)

**Goal**: New right-side panel absorbs all timeline controls and is always visible without scrolling on desktop viewports

**Independent Test**: Open `/app` at 1366×768 — TimelinePanel is visible on the right side, all controls reachable without scroll

- [x] T012 [US1] Create `src/features/animation/components/TimelinePanel.tsx` — component scaffold: `w-64` fixed-width right panel, `flex flex-col h-full`, `bg-tactics-white border-l border-border`, `data-testid="timeline-panel"`, reads from `useProjectStore` and `useUIStore` directly (no props)
- [x] T013 [US1] Add playback row to TimelinePanel: Reset, Prev, Play/Pause, Next, FrameCounter — wire to store actions (`onPlay`, `onPause`, `onPrevFrame`, `onNextFrame`, `onReset`)
- [x] T014 [US1] Add speed row to TimelinePanel: 0.5×, 1×, 2× buttons + Loop toggle + Ghost mode toggle — wire to `onSpeedChange`, `onLoopToggle`, `onGhostToggle`; show current speed value at all times (UI-007)
- [x] T015 [US1] Add FrameStrip inside TimelinePanel (vertical scrollable list of frames + Add Frame button) — import existing `FrameStrip` from `src/features/animation/components/Timeline/`; container uses `overflow-y-auto flex-1`
- [x] T016 [US1] Add Add Frame button and Delete Frame button to TimelinePanel — disable Delete Frame when `totalFrames === 1`, show `opacity-50 cursor-not-allowed` disabled state (FR-006)
- [x] T017 [P] [US1] Add Share button to TimelinePanel (conditional: only when `project?.id` is set) — matches `EditorFloatingRemote` share behavior

**Checkpoint**: TimelinePanel renders standalone, all controls wired, frame strip scrolls within panel

---

## Phase 4: User Story 1 — Mobile MobileDrawer Timeline Section (Priority: P1)

**Goal**: Mobile users can access all timeline controls via MobileDrawer without scroll

**Independent Test**: At 375px viewport, tap "Tools & Actions" — MobileDrawer opens with a Timeline section containing all playback and frame controls

- [x] T018 [US1] Add Timeline section to `src/features/animation/components/MobileDrawer.tsx` below existing entity palette: section header "Timeline" + Play/Pause, Prev/Next Frame, Add Frame, Speed (0.5×/1×/2×), Loop, Ghost — reads from stores directly (same pattern as TimelinePanel)
- [x] T019 [US1] Disable Add Frame + Delete Frame in MobileDrawer when appropriate (Delete Frame disabled at `totalFrames === 1`) — matches TimelinePanel behavior

**Checkpoint**: Mobile drawer shows Timeline section; Add Frame works from drawer without closing it

---

## Phase 5: User Story 2 — Controls Grouped and Accessible (Priority: P1)

**Goal**: Controls are visually grouped, labelled, keyboard-navigable, and meet WCAG AA (UI-004, UI-006, UI-007)

**Independent Test**: Tab through TimelinePanel — every button receives focus with visible indicator; all buttons have `aria-label` attributes visible in DevTools

- [x] T020 [P] [US2] Add `aria-label` attributes to all interactive elements in `src/features/animation/components/TimelinePanel.tsx` (Play, Pause, Prev Frame, Next Frame, Add Frame, Delete Frame, 0.5× Speed, 1× Speed, 2× Speed, Loop, Ghost, Share)
- [x] T021 [P] [US2] Add visible focus ring styles to all buttons in TimelinePanel using `focus-visible:ring-2 focus-visible:ring-warm-accent` — verify keyboard tab order is logical top-to-bottom (UI-004, UI-006)
- [x] T022 [P] [US2] Add `aria-label` attributes to all Timeline controls in `src/features/animation/components/MobileDrawer.tsx`

**Checkpoint**: Keyboard-only navigation through TimelinePanel reaches all controls; contrast passes 4.5:1 (SC-005)

---

## Phase 6: User Story 3 — Remove EditorFloatingRemote (Priority: P1)

**Goal**: EditorFloatingRemote is deleted and Editor.tsx is restructured around the new TimelinePanel

**Independent Test**: `grep -r "EditorFloatingRemote" src/` returns zero matches; `/app` loads without errors

- [x] T023 [US3] Modify `src/features/animation/components/Editor.tsx`: remove `import { EditorFloatingRemote }` and the `{project && <EditorFloatingRemote />}` render call
- [x] T024 [US3] Modify `src/features/animation/components/Editor.tsx`: remove the `<footer>` block (`<PlaybackControls />` + `<FrameStrip />`) — these are now absorbed into TimelinePanel
- [x] T025 [US3] Modify `src/features/animation/components/Editor.tsx`: import `TimelinePanel` and add `{!focusMode && !isMobile && <TimelinePanel />}` as right-side sibling to `<main>` in the `flex h-screen` container
- [x] T026 [US3] Delete `src/features/animation/components/Canvas/EditorFloatingRemote.tsx` — confirm file is removed from filesystem
- [x] T027 [US3] Verify `grep -r "EditorFloatingRemote" src/` returns zero matches (SC-003 partial); verify `grep -r "FloatingRemote" src/features/animation/components/ShareViewer.tsx` still returns a match (ShareViewer untouched)

**Checkpoint**: Editor renders with TimelinePanel on right, no footer, no EditorFloatingRemote; `/app` loads cleanly

---

## Phase 7: User Story 4 — Design System Compliance (Priority: P2)

**Goal**: TimelinePanel visually matches left sidebar — no rounded corners, no shadows, correct palette

**Independent Test**: Side-by-side: TimelinePanel vs left sidebar — identical corner treatment, border color, background, and typography

- [x] T028 [P] [US4] Audit `src/features/animation/components/TimelinePanel.tsx` against `.impeccable.md` design constraints: confirm `rounded-none`, no `shadow-*`, background uses `bg-tactics-white`, border uses `border-border`, typography matches left sidebar (UI-003)
- [x] T029 [P] [US4] Audit Timeline section in `src/features/animation/components/MobileDrawer.tsx` for the same design constraints — consistent with drawer's existing styling

**Checkpoint**: Visual review passes; panel does not visually compete with the canvas

---

## Phase 8: Polish, Route Verification, Pre-Push

**Purpose**: Confirm all three routes are clean, lint/tsc pass, E2E tests green

- [x] **T030**: Execute full unit test suite for components (Vitest) <!-- id: 30 -->
- [x] **T031**: Execute E2E regression suite across all core routes <!-- id: 31 -->
- [x] **T032**: Verify clean `npm run lint` and `npx tsc --noEmit` status <!-- id: 32 -->

**Checkpoint**: All E2E tests pass, lint clean, three routes smoke-test clean — ready for PR

---

## Dependencies

```
T001, T002, T003           Phase 1 (baseline verification)
       │
       ▼
T004–T011                  Phase 2 (E2E tests — must fail before T012)
       │
       ▼
T012–T017 ──[P]── T018–T019   Phases 3 & 4 (TimelinePanel + MobileDrawer — parallel)
       │
       ▼
T020–T022                  Phase 5 (accessibility — depends on T012–T017 structure)
       │
       ▼
T023–T027                  Phase 6 (EditorFloatingRemote removal — depends on T012)
       │
       ▼
T028–T029 ──[P]──          Phase 7 (design polish — depends on T023)
       │
       ▼
T030–T033                  Phase 8 (verification — depends on all phases)
```

### Parallel Execution Opportunities

- **T002 + T003**: Grep audits run in parallel
- **T005–T011**: Individual E2E test cases within Phase 2 are independent files/blocks
- **T012–T017 and T018–T019**: TimelinePanel and MobileDrawer are different files — can be implemented in parallel after T004
- **T020, T021, T022**: Accessibility attributes in different files — parallel
- **T023–T024**: Both edits are in Editor.tsx but are distinct blocks — sequential within same file
- **T028 + T029**: Design audit in two different files — parallel

---

## Implementation Strategy

**MVP**: Phase 1 → Phase 2 (tests fail) → Phase 3 (TimelinePanel) → Phase 6 (wire Editor.tsx + delete EditorFloatingRemote) → Phase 8 (verify)

This delivers US1 and US3 (both P1) as a shippable increment: controls panel live, old remote gone, routes clean. Phase 4 (mobile), Phase 5 (accessibility), and Phase 7 (polish) layer on top.

**Total tasks**: 33  
**By user story**: US1 (14), US2 (3), US3 (5), US4 (2), Setup/Polish (9)  
**Parallel opportunities**: 12 tasks can run in parallel within their phase
