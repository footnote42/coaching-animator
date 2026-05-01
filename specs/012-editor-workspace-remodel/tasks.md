# Tasks: Editor Workspace Remodel (Phase 2i)

**Input**: `specs/012-editor-workspace-remodel/plan.md`, `spec.md`, `research.md`, `quickstart.md`

**Tests**: SC-008 explicitly requires all US1–US4 acceptance scenarios to pass in unit or E2E tests. Test tasks are included and follow TDD — tests MUST be written first and MUST fail before implementation begins.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Exact file paths in every task description

## Path Conventions

```
Source:   src/features/animation/components/Editor.tsx
          src/features/animation/components/Canvas/EditorFloatingRemote.tsx
          src/features/animation/components/ProgressionPanel.tsx
          src/features/animation/components/MobileDrawer.tsx   ← NEW

Tests:    tests/unit/components/EditorFloatingRemote.test.tsx
          tests/e2e/editor.spec.ts                             ← NEW

Pre-push: npm run lint && npx tsc --noEmit
Unit:     npm test -- --run
E2E:      npm run e2e  (requires dev server: npm run dev)
```

---

## Phase 1: Setup

**Purpose**: Verify clean baseline before any changes

- [x] T001 Verify `npm run lint && npx tsc --noEmit` passes on branch `012-editor-workspace-remodel` before any changes

---

## Phase 2: Foundational (Blocking Prerequisite)

**Purpose**: Progression panel cap is self-contained and unblocks the editor layout. Complete before US1–US3.

**⚠️ CRITICAL**: Complete before starting user story phases

- [x] T002 Restructure `src/features/animation/components/ProgressionPanel.tsx`: add `max-h-16 overflow-hidden` to outer div; wrap pills (base + sortable) in a `flex-1 min-w-0 overflow-x-auto` inner div; move Add button and "Max 5" badge outside the scroll container in a `flex-shrink-0 ml-2` wrapper so the Add button is always visible regardless of how many pills exist (FR-009, FR-010, SC-004)

**Checkpoint**: ProgressionPanel compiles; Add button visible with 5 progressions; panel height is stable

---

## Phase 3: User Story 1 — Collapsible Sidebar (Priority: P1) 🎯 MVP

**Goal**: Coach can collapse the sidebar to zero-width with a toggle; state persists across refreshes

**Independent Test**: On 1280×800, collapse sidebar → canvas expands; hard-refresh → sidebar stays collapsed (SC-006)

> **⚠️ TDD — Write test first, confirm it FAILS before implementing T004–T005**

- [x] T003 [US1] Write failing E2E tests for sidebar collapse in `tests/e2e/editor.spec.ts`: (a) collapse toggle hides sidebar and canvas expands, (b) expand toggle restores sidebar, (c) collapsed state persists across hard refresh (US1 acceptance scenarios 1–3)
- [x] T004 [US1] Add sidebar collapse state to `src/features/animation/components/Editor.tsx`: add `SIDEBAR_STORAGE_KEY`, `sidebarCollapsed` state (lazy init from localStorage), `toggleSidebar` useCallback with localStorage write; add `isMobile` derived boolean (`viewportWidth < 768`); add `const [focusMode, setFocusMode] = useState(false)` as a **compile-only placeholder** so T005 conditions compile — T007 will expand this into full Focus Mode state with snapshot logic (prep for US2/US3 shared conditions)
- [x] T005 [US1] Update sidebar JSX in `src/features/animation/components/Editor.tsx`: wrap `<aside>` in condition `{!focusMode && !isMobile}` (US3 prep); apply `className={sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-64'}` with `transition-[width] duration-200`; add collapse toggle button inside aside; add fixed left-edge chevron button when sidebar is collapsed (FR-001 to FR-004, UI-001)

**Checkpoint**: Sidebar collapse works; localStorage persists; canvas fills freed space (ResizeObserver auto-fires); E2E tests pass

---

## Phase 4: User Story 2 — Focus Mode (Priority: P1)

**Goal**: Coach can enter Focus Mode to hide all chrome; canvas fills ≥85% viewport; panels restore on exit

**Independent Test**: On 1440×900, enter Focus Mode → sidebar, footer, progression panel hidden; exit → panels restore in previous state (SC-001)

> **⚠️ TDD — Write test first, confirm it FAILS before implementing T007–T008**

- [x] T006 [US2] Add Focus Mode E2E tests to `tests/e2e/editor.spec.ts`: (a) Focus Mode hides sidebar/footer/progression header and canvas fills viewport, (b) exit restores previous state, (c) playback is not interrupted when entering Focus Mode, (d) sidebar-collapsed + Focus Mode edge case (US2 acceptance scenarios 1–3 + edge case from spec)
- [x] T007 [US2] Expand the `focusMode` placeholder from T004 in `src/features/animation/components/Editor.tsx`: the `useState(false)` stub is already declared — do NOT redeclare it; add `focusModeSnapshot` ref (captures `sidebarCollapsed` at activation), `enterFocusMode` and `exitFocusMode` callbacks (restores sidebar state from snapshot); add imports `Minimize2, Maximize2` from `lucide-react` (FR-005 to FR-007)
- [x] T008 [US2] Add Focus Mode overlay button and conditional panel hiding in `src/features/animation/components/Editor.tsx`: render fixed top-right Focus Mode toggle button (z-50, always visible); wrap footer ErrorBoundary with `{!focusMode && ...}`; wrap ProgressionPanel with `{!focusMode && showProgressionPanel && ...}`; sidebar condition already uses `!focusMode` from T005 (FR-005, FR-008, UI-002, SC-001)

**Checkpoint**: Focus Mode hides all chrome; floating remote stays visible; exiting restores exact previous state; E2E tests pass

---

## Phase 5: User Story 3 — Mobile Drawer (Priority: P1)

**Goal**: On <768px, no MobileWarning banner; bottom drawer gives access to EntityPalette and ProjectActions

**Independent Test**: On 375×812, editor loads with no warning, canvas visible; drawer handle opens drawer with EntityPalette in ≤2 taps (SC-002, SC-003)

> **⚠️ TDD — Write test first, confirm it FAILS before implementing T010–T011**

- [x] T009 [US3] Add mobile drawer E2E tests to `tests/e2e/editor.spec.ts`: (a) no MobileWarning at 375px viewport, (b) canvas visible on load, (c) drawer handle opens drawer, (d) drawer closes on backdrop tap, (e) floating remote not hidden by open drawer (US3 acceptance scenarios 1–4 + UI-004 edge case)
- [x] T010 [P] [US3] Create `src/features/animation/components/MobileDrawer.tsx`: `position:fixed; bottom:0; left:0; right:0; z-50; max-h-[70vh]; overflow-y-auto`; slide animation via `translate-y-0` / `translate-y-full` with `transition-transform duration-200`; handle bar at top with grip icon + close button; backdrop overlay at z-40 closes on tap; body contains `<ProjectActions>` then `<EntityPalette>` with all required props; respects design tokens (FR-012, FR-013, FR-014, UI-003, UI-004)
- [x] T011 [US3] Integrate MobileDrawer in `src/features/animation/components/Editor.tsx`: remove `mobileWarningDismissed` state, `setMobileWarningDismissed`, and MobileWarning JSX (lines ~174, ~309–321); add `drawerOpen` state; add drawer handle button fixed at bottom of screen when `isMobile`; render `<MobileDrawer>` with all entity handler props; confirm aside and footer are hidden when `isMobile` (conditions added in T005 cover aside; wrap footer similarly) (FR-011, FR-012, SC-002, SC-003)

**Checkpoint**: No MobileWarning at 375px; drawer opens and closes; EntityPalette accessible in ≤2 taps; floating remote visible over closed and open drawer; E2E tests pass

---

## Phase 6: User Story 4 — Expanded Floating Remote (Priority: P2)

**Goal**: Floating remote provides add-frame, pace (0.5×/1×/2×), loop toggle, ghost toggle in addition to existing controls

**Independent Test**: On 768px-tall viewport, expand remote → all 4 new controls visible and functional (SC-005)

> **⚠️ TDD — Write test first, confirm it FAILS before implementing T013–T014**

- [x] T012 [US4] Write unit tests for `tests/unit/components/EditorFloatingRemote.test.tsx`: (a) expand toggle shows/hides second row, (b) Add Frame calls `onAddFrame` prop, (c) pace buttons call `setPlaybackSpeed` with correct value, (d) Loop calls `toggleLoop`, (e) Ghost calls `toggleGhosts`, (f) expanded height used for viewport clamping when expanded (US4 acceptance scenarios 1–4)
- [x] T013 [US4] Expand `src/features/animation/components/Canvas/EditorFloatingRemote.tsx`: add `onAddFrame: () => void` prop; add `EXPANDED_HEIGHT = 88` constant; add `isExpanded` state (lazy-init from `editor-remote-expanded` localStorage key); add additional store selectors (`playbackSpeed`, `loopPlayback`, `showGhosts`, `setPlaybackSpeed`, `toggleLoop`, `toggleGhosts`); add expand chevron toggle to first row; add second row with Add Frame / 0.5× / 1× / 2× / Loop (Repeat icon) / Ghost (Ghost icon) buttons; update outer div height to `isExpanded ? EXPANDED_HEIGHT : PILL_HEIGHT`; update all `maxY` viewport clamping to use expanded height when expanded; add imports `ChevronUp, ChevronDown, Plus, Repeat, Ghost` from lucide-react; add `useUIStore` import (FR-015, FR-016, FR-017, UI-006)
- [x] T014 [US4] Update `src/features/animation/components/Editor.tsx`: pass `onAddFrame={handleAddFrame}` prop to `<EditorFloatingRemote>`; update the component render from `<EditorFloatingRemote />` to `<EditorFloatingRemote onAddFrame={handleAddFrame} />`

**Checkpoint**: Remote expands to show second row; all 4 new controls match footer behaviour; remote stays draggable and viewport-bounded in expanded state; unit tests pass

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates, regression verification, final pre-push checks

- [x] T015 [P] Manual verify `npm run dev` → open `/share/{id}` → confirm no visual regressions from 011-workflow-clarity baseline (SC-009)
- [x] T016 [P] Manual verify `npm run dev` → open `/replay/{id}` → confirm no visual regressions (SC-009)
- [x] T017 Run `npm test -- --run` — all unit tests pass (including EditorFloatingRemote.test.tsx)
- [x] T018 Run `npm run e2e` (dev server running) — all E2E tests pass (editor.spec.ts US1–US4 scenarios, plus existing gallery/my-gallery tests not regressed)
- [x] T019 Run `npm run lint && npx tsc --noEmit` — zero new errors (SC-007)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — completes before all user stories
- **US1 (Phase 3)**: Depends on Foundational; T003 → T004 → T005 (sequential, all Editor.tsx)
- **US2 (Phase 4)**: Depends on US1 (shares Editor.tsx state additions); T006 → T007 → T008
- **US3 (Phase 5)**: Depends on US1/US2 for shared Editor.tsx conditions; T009 → T010 [P with T009] → T011
- **US4 (Phase 6)**: Largely independent of US1–US3 (different files); T012 → T013 → T014
- **Polish (Phase 7)**: All implementation complete

### Parallel Opportunities

- T003 (US1 E2E) + T010 (MobileDrawer.tsx) + T012 (EditorFloatingRemote tests): all touch different files, safe to run in parallel if multiple agents
- T015 (share route check) + T016 (replay route check): independent browser verifications
- T013 (EditorFloatingRemote expansion) can begin before US1–US3 Editor.tsx changes since it touches a different file — only T014 needs Editor.tsx to be stable

### Within Each User Story

- TDD: test task first, confirm failure, then implement
- Editor.tsx tasks are sequential (T004 → T005 → T007 → T008 → T011) — one agent at a time
- MobileDrawer.tsx (T010) can be built in parallel with any Editor.tsx US1/US2 task

---

## Implementation Strategy

### MVP First (US1 — Sidebar Collapse)

1. Complete Phase 1: Verify baseline
2. Complete Phase 2: ProgressionPanel cap
3. Complete Phase 3: Sidebar collapse only
4. **STOP and VALIDATE**: sidebar collapses, localStorage persists, canvas fills space
5. Proceed to US2 (Focus Mode) — builds on same Editor.tsx foundation

### Incremental Delivery

1. Setup + ProgressionPanel cap → clean foundation
2. US1 (sidebar) → canvas space improvement; validate
3. US2 (Focus Mode) → presentation mode; validate
4. US3 (mobile drawer) → mobile usability; validate
5. US4 (expanded remote) → frame controls at any viewport; validate
6. Polish → regression-free, pre-push gate passed

---

## Notes

- [P] tasks = different files, no dependencies — safe to run in parallel
- [Story] label maps to user stories for traceability
- **Editor.tsx is touched by US1, US2, US3, and US4 (T014)** — these tasks MUST be sequential within each story; different stories should not edit Editor.tsx simultaneously
- Entity colors: always `EntityColors.resolve()` — never hardcoded hex (no entity color logic in this feature)
- ResizeObserver auto-fires on sidebar collapse and Focus Mode exit — no imperative `stage.size()` call needed (research.md Area 6)
- MobileDrawer: use design tokens only — no `bg-white`, no hardcoded hex (UI-003)
- Pre-push gate: `npm run lint && npx tsc --noEmit` must pass before PR (SC-007)
