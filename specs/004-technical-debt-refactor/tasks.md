# Tasks: Phase 3a — Technical Debt Reduction

**Input**: `specs/004-technical-debt-refactor/plan.md`, `spec.md`, `research.md`
**Branch**: `004-technical-debt-refactor`
**Tests**: No new test files required. All 73 existing tests MUST pass unmodified after each step.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Include exact file paths in every task description

## Path Conventions

```
Source:   src/features/animation/components/Editor.tsx
          src/features/animation/components/hooks/use[Name].ts
          src/core/stores/projectStore.ts

Pre-push: npm run lint && npx tsc --noEmit
Unit:     npm test -- --run
E2E:      npm run e2e  (requires dev server: npm run dev)
```

---

## Phase 1: Setup

**Purpose**: Confirm branch is clean and baseline passes before any changes

- [x] T001 Verify `npm run lint && npx tsc --noEmit && npm test -- --run` all pass on the `004-technical-debt-refactor` branch before any changes
- [x] T002 Create directory `src/features/animation/components/hooks/` (empty, just the folder)

---

## Phase 2: Context Menu Hook (US1 + US3)

**Purpose**: Extract the most self-contained handler group first. Establishes the hook extraction pattern used by all subsequent phases.

**⚠️ CRITICAL**: Complete this phase and verify tests pass before starting Phase 3.

**Independent Test**: After this phase, `Editor.tsx` renders correctly and all context menu interactions (right-click, inline label edit, canvas click dismiss) work.

- [x] T003 [US1] Create `src/features/animation/components/hooks/useEditorContextMenuHandlers.ts` — extract these handlers from `Editor.tsx`: `handleEntitySelect`, `handleEntityMove`, `handleEntityDoubleClick`, `handleEntityContextMenu`, `handleInlineEditorConfirm`, `handleInlineEditorCancel`, `handleContextMenuDuplicate`, `handleContextMenuDelete`, `handleContextMenuEditLabel`, `handleAnnotationContextMenu`, `handleAnnotationContextMenuDelete`, `handleCanvasClick`. Move local state: `inlineEditor`, `contextMenu`, `annotationContextMenu`. Hook params: `project`, `currentFrameIndex`. Use `useProjectStore.getState()` for actions (`removeEntity`, `removeAnnotation`, `updateEntity`, `propagateEntity`). Use `useUIStore` selectors for `selectEntity`, `deselectAll`, `selectAnnotation`, `selectedEntityId`, `selectedAnnotationId`.

- [x] T004 [US1] Wire `useEditorContextMenuHandlers` into `Editor.tsx`: import the hook, pass `project` and `currentFrameIndex` as params, destructure all returned handlers and state. Remove the extracted handler function bodies and local state (`inlineEditor`, `contextMenu`, `annotationContextMenu`) from `Editor.tsx`. Verify `npm test -- --run && npx tsc --noEmit` pass.

---

## Phase 3: Progression Handlers Hook

**Purpose**: Extract the most complex async handler group (progression management with its owned local state).

**⚠️ CRITICAL**: Complete T003–T004 before starting this phase.

**Independent Test**: After this phase, switching between progressions, the unsaved-changes guard, and adding new progressions all work correctly when authenticated with a cloud animation loaded.

- [x] T005 [US1] Create `src/features/animation/components/hooks/useEditorProgressionHandlers.ts` — extract these handlers from `Editor.tsx`: `handleProgressionSelectRequest`, `handleProgressionReorder`, `handleProgressionDiscardAndSwitch`, `handleAddProgression`. Move local state: `baseAnimationMeta`, `progressions`, `activeProgressionIndex`, `showProgressionUnsavedDialog`, `pendingProgressionIndex`, `isAddingProgression`. Include computed value `showProgressionPanel`. Hook params: `cloudAnimationId`, `isAuthenticated`. Use `useProjectStore(s => s.loadProject)` and `useProjectStore(s => s.isDirty)` selectors internally. Also expose `setBaseAnimationMeta` and `setProgressions` setters so the progression-loading `useEffect` in `Editor.tsx` can still update them.

- [x] T006 [US1] Wire `useEditorProgressionHandlers` into `Editor.tsx`: import the hook, pass `cloudAnimationId` and `isAuthenticated` as params, destructure all returned values. Remove extracted handlers, local state, and `showProgressionPanel` computation from `Editor.tsx`. Update the progression-loading `useEffect` to use the `setBaseAnimationMeta` and `setProgressions` setters returned by the hook. Verify `npm test -- --run && npx tsc --noEmit` pass.

---

## Phase 4: Entity Creation Handlers Hook

**Purpose**: Extract all entity-creation handlers and the guest limit modal state.

**⚠️ CRITICAL**: Complete T005–T006 before starting this phase.

**Independent Test**: After this phase, adding all 6 entity types (attack player, defense player, ball, cone, tackle shield, tackle bag) works correctly. Guest limit modal fires correctly at the 10-frame ceiling.

- [x] T007 [US1] Create `src/features/animation/components/hooks/useEditorEntityHandlers.ts` — extract these handlers from `Editor.tsx`: `handleRecoverProject`, `handleSkipRecovery`, `handleAddAttackPlayer`, `handleAddDefensePlayer`, `handleAddBall`, `handleAddCone`, `handleAddTackleShield`, `handleAddTackleBag`. Move local state: `showGuestLimitModal`. Hook params: `isAuthenticated`, `cloudAnimationId`, `showRecoveryDialog`, `setShowRecoveryDialog`, `recoveredProject`, `setRecoveredProject`. Use `useProjectStore(s => s.addEntity)`, `useProjectStore(s => s.propagateEntity)`, `useProjectStore(s => s.project)`, `useProjectStore(s => s.currentFrameIndex)` selectors internally. Expose `setShowGuestLimitModal` in return so `useEditorPlaybackHandlers` can trigger the modal.

- [x] T008 [US1] Wire `useEditorEntityHandlers` into `Editor.tsx`: import the hook, pass required params, destructure returned handlers and `showGuestLimitModal`. Remove extracted handlers and `showGuestLimitModal` state from `Editor.tsx`. Verify `npm test -- --run && npx tsc --noEmit` pass.

---

## Phase 5: Playback Handlers Hook

**Purpose**: Extract frame navigation and drawing handlers.

**⚠️ CRITICAL**: Complete T007–T008 before starting this phase. The `setShowGuestLimitModal` setter from Phase 4 is a required param.

**Independent Test**: After this phase, adding frames, navigating between frames, changing frame duration, and drawing arrows/lines all work correctly. The guest limit modal fires when a guest tries to add an 11th frame.

- [x] T009 [US1] Create `src/features/animation/components/hooks/useEditorPlaybackHandlers.ts` — extract these handlers from `Editor.tsx`: `handleAddFrame`, `handlePreviousFrame`, `handleNextFrame`, `handleFrameDurationChange`, `handleDrawingComplete`. Hook params: `isAuthenticated`, `setShowGuestLimitModal` (passed from entity handlers). Use `useProjectStore(s => s.addFrame)`, `useProjectStore(s => s.setCurrentFrame)`, `useProjectStore(s => s.updateFrame)`, `useProjectStore(s => s.addAnnotation)`, `useProjectStore(s => s.project)`, `useProjectStore(s => s.currentFrameIndex)`, `useProjectStore(s => s.isDirty)` selectors internally.

- [x] T010 [US1] Wire `useEditorPlaybackHandlers` into `Editor.tsx`: import the hook, pass `isAuthenticated` and `setShowGuestLimitModal` (from entity handlers hook) as params, destructure returned handlers. Remove extracted handlers from `Editor.tsx`. Verify `npm test -- --run && npx tsc --noEmit` pass.

---

## Phase 6: Granular Store Selectors

**Purpose**: Replace the two broad store destructures in `Editor.tsx` with individual selectors. This is the re-render performance fix.

**⚠️ CRITICAL**: Complete all hook extraction phases (T003–T010) before this phase. Once all handlers are in hooks, `Editor.tsx` should only be consuming a small set of store values directly.

**Independent Test**: After this phase, `Editor.tsx` no longer has `const { ... } = useProjectStore()` or `const { ... } = useUIStore()` at the top level. Each consumed value is a separate `useProjectStore(s => s.value)` call.

- [x] T011 [US2] In `Editor.tsx`, replace the remaining `useProjectStore()` destructure with individual granular selectors — one `useProjectStore(s => s.value)` call per state value still directly consumed in `Editor.tsx` JSX (expected remaining: `project`, `currentFrameIndex`, `isPlaying`, `playbackSpeed`, `loopPlayback`, `playbackPosition`, `isDirty`, `newProject`, `loadProject`, `removeFrame`, `duplicateFrame`, `play`, `pause`, `reset`, `setPlaybackSpeed`, `toggleLoop`). Actions used only in handlers MUST be accessed via `useProjectStore.getState()` instead of selectors. Verify `npm test -- --run && npx tsc --noEmit` pass.

- [x] T012 [US2] In `Editor.tsx`, replace the remaining `useUIStore()` destructure with individual granular selectors — one `useUIStore(s => s.value)` call per value still directly consumed in `Editor.tsx` JSX (expected remaining: `showGhosts`, `toggleGhosts`, `drawingMode`, `setDrawingMode`). Verify `npm test -- --run && npx tsc --noEmit` pass.

---

## Phase 7: Final Verification & Polish

**Purpose**: Confirm all success criteria from spec.md are met.

- [x] T013 Count lines in `src/features/animation/components/Editor.tsx` — confirm it is under 400 lines (from 852). Count lines in each new hook file — confirm each is under 200 lines.

- [x] T014 [P] Run full automated verification: `npm run lint && npx tsc --noEmit && npm test -- --run`. All must pass with 0 errors.

- [x] T014b [P] Run E2E suite: `npm run e2e` (requires `npm run dev` running in a separate terminal). Confirm all existing E2E specs pass — covers SC-004 (E2E scenarios from US1 pass without modifying test files).

- [x] T015 [P] Manual smoke test against `specs/004-technical-debt-refactor/quickstart.md` test checklist (31 items). Test `/app`, `/replay/[id]`, and `/share/[id]` routes. Mark any failures for investigation before proceeding.

- [x] T016 [US3] Confirm `src/features/animation/components/hooks/` directory contains exactly 4 hook files: `useEditorContextMenuHandlers.ts`, `useEditorProgressionHandlers.ts`, `useEditorEntityHandlers.ts`, `useEditorPlaybackHandlers.ts`. Verify each filename is self-describing (matches its domain: entity, playback, progression, contextMenu). Confirm no files were created outside `src/features/animation/`.

---

## Dependencies (Story Completion Order)

```
T001 (baseline) → T002 (dir) → T003 (context menu hook) → T004 (wire)
                                                          → T005 (progression hook) → T006 (wire)
                                                                                     → T007 (entity hook) → T008 (wire)
                                                                                                          → T009 (playback hook) → T010 (wire)
                                                                                                                                 → T011 (store selectors)
                                                                                                                                 → T012 (ui selectors)
                                                                                                                                 → T013, T014, T015, T016
```

T014 and T015 can run in parallel after T012 completes.

## Implementation Strategy

**MVP = Phase 1 + Phase 2 only** (T001–T004): Proves the hook extraction pattern, reduces Editor.tsx by ~110 lines, keeps all tests green. Remainder follows the same pattern.

**Do not skip the verification step after each hook wiring (T004, T006, T008, T010)**. Each wiring is a potential TypeScript compilation error if return types don't match. Catching it per-step is far cheaper than debugging at the end.
