# Feature Specification: Phase 3a — Technical Debt Reduction

**Feature Branch**: `004-technical-debt-refactor`
**Created**: 2026-04-25
**Status**: Draft
**Input**: User description: "for 3a on the roadmap"

## Constitutional Compliance Gate

- [x] **Tier alignment**: Internal refactor — no tier-level behaviour changes. All tiers continue to work identically.
- [x] **No telemetry**: No new data collection introduced.
- [x] **No third-party analytics**: No new SDKs added.
- [x] **No hardcoded colors**: Refactor preserves all existing `EntityColors` service usage.
- [x] **Privacy gate**: No new data stored.
- [x] **Shared canvas risk**: `Canvas/` components are NOT being restructured; only the orchestrating `Editor.tsx` and the store are in scope.

> This is a pure internal refactor. No user-facing behaviour changes. Constitutional compliance is maintained by the constraint that the app must behave identically before and after.

---

## Context & Motivation

`Editor.tsx` currently stands at 852 lines — a single React component that owns entity creation handlers, animation playback controls, progression management, context menus, inline editing, recovery logic, and rendering. This violates the single-responsibility principle and creates compounding costs:

- Every new feature merged into the editor grows this file further
- Security review (Phase 3b) is harder on a monolith than on decomposed units
- Bugs in one domain (e.g. progressions) can mask issues in another (e.g. entity creation)

`projectStore.ts` is consumed in `Editor.tsx` via a single destructuring call that subscribes to the entire store. This means any state change anywhere in the store (playback position, entity updates, frame index, etc.) triggers a full re-render of the 852-line component — a re-render storm that will worsen as the feature set grows.

**Goal**: Break the monolith and eliminate unnecessary re-renders without changing any user-visible behaviour.

---

## User Scenarios & Testing

### User Story 1 — Editor Behaviour Is Unchanged (Priority: P1)

A coach uses the editor exactly as before: adds players, annotates frames, plays back animations, saves to cloud, manages progressions. Nothing visibly changes.

**Why this priority**: This is a refactor. The primary success condition is that nothing breaks. If the editor behaviour changes, the refactor has failed.

**Independent Test**: Open `/app`, create an animation with at least 3 frames, 2 players, 1 annotation, and 1 progression. Save to cloud. Reload. Verify all data persists and playback works.

**Acceptance Scenarios**:

1. **Given** a logged-in user on `/app`, **When** they add an attack player, defense player, ball, and cone, **Then** all four entities appear on canvas in the correct positions with correct default colors
2. **Given** a multi-frame animation, **When** the user plays back at 1× speed, **Then** all frames advance in sequence and the loop returns to the first frame when loop is enabled
3. **Given** an animation with a progression, **When** the user switches between the base and progression, **Then** each progression loads its correct frame data without data leakage between progressions
4. **Given** unsaved changes, **When** the user navigates away, **Then** the dirty-state indicator is visible and the recovery dialog appears on next load
5. **Given** a guest user (Tier 0), **When** they reach the 10-frame limit, **Then** the guest limit modal appears and no additional frames are added

### User Story 2 — Render Performance Does Not Regress (Priority: P1)

Playback and entity manipulation remain smooth. The store selector refactor eliminates whole-component re-renders from unrelated state changes.

**Why this priority**: The re-render storm is the primary performance risk. Even if invisible at current scale, it will degrade UX as the animation feature set grows.

**Independent Test**: Open `/app`, start playback of a 5-frame animation, observe that only the canvas area updates during playback (not unrelated UI sections). Add an entity during edit mode — verify only entity-relevant sections re-render.

**Acceptance Scenarios**:

1. **Given** the store selector refactor is applied, **When** playback position advances, **Then** only components subscribed to playback state re-render
2. **Given** an entity is selected, **When** the entity moves, **Then** only components subscribed to entity state re-render
3. **Given** a guest-limit check fires, **When** the modal state changes, **Then** the canvas and toolbar do not re-render unnecessarily

### User Story 3 — Developer Can Navigate Editor in Under 60 Seconds (Priority: P2)

A developer reading the codebase can identify where entity-creation logic lives, where playback controls live, and where progression management lives — without reading more than one file per concern.

**Why this priority**: The primary audience for this refactor is future developers (including AI coding assistants). Measurable navigability is the test of successful decomposition.

**Independent Test**: Ask a developer unfamiliar with the codebase to find "where does handleAddCone live?" They should answer in under 60 seconds after the refactor.

**Acceptance Scenarios**:

1. **Given** the decomposed codebase, **When** a developer looks for entity-creation logic, **Then** it lives in a dedicated hook or file with a self-describing name
2. **Given** the decomposed codebase, **When** a developer looks for playback controls, **Then** they are in a dedicated hook or component
3. **Given** the decomposed codebase, **When** a developer looks for progression management, **Then** it is isolated from entity and playback logic

### Edge Cases

- Extracting hooks must not break the progression-switch guard (unsaved-changes check before switching progression)
- The inline label editor (canvas overlay) must continue to position correctly relative to the entity after extraction
- Context menus for entities and annotations must continue to dismiss correctly on canvas click
- The store selector refactor must not break the `useProjectStore.getState()` direct calls in `handleContextMenuDelete` and `handleAnnotationContextMenuDelete`
- Mobile viewport warning must continue to fire at the correct breakpoint after extraction
- `stripColors` prop must continue to be threaded through to child components correctly

---

## Requirements

### Functional Requirements

- **FR-001**: `Editor.tsx` MUST be decomposed so that no single file in the editor feature exceeds 400 lines after refactor
- **FR-002**: Entity-creation handlers (`handleAddAttackPlayer`, `handleAddDefensePlayer`, `handleAddBall`, `handleAddCone`, `handleAddTackleShield`, `handleAddTackleBag`) MUST be extracted into a dedicated custom hook
- **FR-003**: Playback controls (`handleAddFrame`, `handlePreviousFrame`, `handleNextFrame`, `handleFrameDurationChange`) MUST be extracted into a dedicated custom hook
- **FR-004**: Progression management logic (`handleProgressionSelectRequest`, `handleProgressionReorder`, `handleAddProgression`, `handleProgressionDiscardAndSwitch`) MUST be extracted into a dedicated custom hook
- **FR-005**: Context menu handlers (`handleEntityContextMenu`, `handleContextMenuDuplicate`, `handleContextMenuDelete`, `handleContextMenuEditLabel`, `handleAnnotationContextMenu`, `handleAnnotationContextMenuDelete`) AND entity-interaction handlers that share inline-editor state (`handleEntitySelect`, `handleEntityMove`, `handleEntityDoubleClick`, `handleCanvasClick`, `handleInlineEditorConfirm`, `handleInlineEditorCancel`) MUST be extracted into a dedicated hook or grouped module
- **FR-006**: `Editor.tsx` MUST subscribe to `projectStore` using granular selectors (one selector per piece of state consumed) rather than a single whole-store destructure
- **FR-007**: `Editor.tsx` MUST subscribe to `uiStore` using granular selectors for the same reason
- **FR-008**: All extracted hooks MUST be co-located within the `src/features/animation/` directory hierarchy
- **FR-009**: The public interface of `Editor.tsx` (its props) MUST NOT change
- **FR-010**: All existing unit tests MUST continue to pass after refactor with no modifications to test files (test files may only be updated if a test was testing an implementation detail, not behaviour)
- **FR-011**: `npm run lint` and `npx tsc --noEmit` MUST pass with zero new errors after refactor

### Key Entities

- **`useEditorEntityHandlers` hook**: Owns all entity-creation handlers. Depends on `projectStore` actions and guest-limit state.
- **`useEditorPlaybackHandlers` hook**: Owns frame navigation and duration handlers. Depends on `projectStore` playback state.
- **`useEditorProgressionHandlers` hook**: Owns progression switching, reordering, and creation. Owns the progression-specific UI state (unsaved dialog, pending index, isAdding).
- **`useEditorContextMenuHandlers` hook**: Owns entity and annotation context menu state and handlers.
- **Granular store selectors**: Named selector functions or inline selectors that subscribe to individual state slices in `projectStore` and `uiStore`.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: `Editor.tsx` is under 400 lines after refactor (currently 852)
- **SC-002**: No single extracted hook file exceeds 200 lines
- **SC-003**: `npm run lint && npx tsc --noEmit && npm test -- --run` all pass with zero errors
- **SC-004**: All E2E scenarios from User Story 1 pass without modification to test files
- **SC-005**: The number of store state subscriptions in `Editor.tsx` changes from 1 broad destructure to N granular selectors (one per consumed state value)
- **SC-006**: No new files are created outside `src/features/animation/` (except test files in `tests/`)
- **SC-007**: The `/app`, `/replay/[id]`, and `/share/[id]` routes all load and behave correctly after refactor (verified manually or via E2E)

---

## Assumptions

- `ReplayViewer.tsx` and `ShareViewer.tsx` are out of scope — they do not share the Editor's handler logic and are not part of this refactor
- `projectStore.ts` internals (actions, state shape) are not being changed — only how `Editor.tsx` subscribes to them
- Test files that assert on implementation details (e.g. import paths) may be updated; tests asserting on behaviour must not change
- This refactor targets the minimum decomposition needed to make Phase 3b (security review) tractable — it is not a full architectural overhaul
