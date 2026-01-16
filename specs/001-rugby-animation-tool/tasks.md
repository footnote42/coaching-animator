# Tasks: Rugby Animation Tool

**Input**: Design documents from `/specs/001-rugby-animation-tool/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in the specification, so test tasks are NOT included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single project structure: `src/`, `tests/` at repository root
- All paths use forward slashes for consistency

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize Vite + React + TypeScript project in repository root per quickstart.md
- [x] T002 [P] Install core dependencies: react-konva, konva, zustand, lucide-react
- [x] T003 [P] Install Tailwind CSS and configure with Tactical Clubhouse aesthetic in tailwind.config.js
- [x] T004 [P] Install shadcn/ui using CLI and initialize configuration
- [x] T005 [P] Configure Vite with path aliases and ES2020 target in vite.config.ts
- [x] T006 [P] Configure TypeScript with strict mode and path aliases in tsconfig.json
- [x] T007 Create project directory structure per plan.md (components/, hooks/, store/, utils/, types/, constants/, assets/)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 [P] Copy core types from contracts/types.ts to src/types/index.ts
- [x] T009 [P] Create validation constants in src/constants/validation.ts from types.ts VALIDATION
- [x] T010 [P] Create design tokens in src/constants/design-tokens.ts from types.ts DESIGN_TOKENS
- [x] T011 [P] Create field dimensions constants in src/constants/fields.ts from types.ts FIELD_DIMENSIONS
- [x] T012 [P] Create interpolation utilities in src/utils/interpolation.ts per research.md
- [x] T013 [P] Create validation utilities in src/utils/validation.ts for project schema validation
- [x] T014 [P] Create sanitization utilities in src/utils/sanitization.ts for input cleaning
- [x] T015 [P] Create field SVG assets for rugby-union in src/assets/fields/rugby-union.svg per research.md
- [x] T016 [P] Create field SVG assets for rugby-league in src/assets/fields/rugby-league.svg
- [x] T017 [P] Create field SVG assets for soccer in src/assets/fields/soccer.svg
- [x] T018 [P] Create field SVG assets for american-football in src/assets/fields/american-football.svg
- [x] T019 Initialize ProjectStore skeleton in src/store/projectStore.ts with Zustand per store-contracts.ts
- [x] T020 [P] Initialize UIStore skeleton in src/store/uiStore.ts with Zustand per store-contracts.ts
- [x] T021 [P] Install and configure shadcn/ui Button component in src/components/ui/button.tsx
- [x] T022 [P] Install and configure shadcn/ui Slider component in src/components/ui/slider.tsx
- [x] T023 [P] Install and configure shadcn/ui Dialog component in src/components/ui/dialog.tsx
- [x] T024 [P] Install and configure shadcn/ui Select component in src/components/ui/select.tsx
- [x] T025 [P] Install and configure shadcn/ui Input component in src/components/ui/input.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create Basic Tactical Animation (Priority: P1) 🎯 MVP

**Goal**: Enable coaches to position players on a rugby field and animate their movements between positions

**Independent Test**: Drag player tokens onto canvas, create second frame with different positions, press play to see smooth animation

### Implementation for User Story 1

- [x] T026 [P] [US1] Implement default project creation logic in src/store/projectStore.ts newProject action

- [X] T027 [P] [US1] Create Field background component in src/components/Canvas/Field.tsx per component-contracts.ts FieldProps
- [x] T028 [P] [US1] Create Stage wrapper component in src/components/Canvas/Stage.tsx per component-contracts.ts StageProps
- [X] T029 [US1] Create PlayerToken component in src/components/Canvas/PlayerToken.tsx with drag support per component-contracts.ts PlayerTokenProps
- [x] T030 [US1] Create EntityLayer component in src/components/Canvas/EntityLayer.tsx orchestrating entity rendering per component-contracts.ts EntityLayerProps
- [x] T031 [US1] Implement addEntity action in src/store/projectStore.ts per store-contracts.ts with UUID generation and defaults
- [x] T032 [US1] Implement updateEntity action in src/store/projectStore.ts with position clamping per store-contracts.ts
- [x] T033 [US1] Implement removeEntity action in src/store/projectStore.ts per store-contracts.ts
- [x] T034 [US1] Create EntityPalette sidebar component in src/components/Sidebar/EntityPalette.tsx per component-contracts.ts EntityPaletteProps
- [x] T035 [US1] Implement addFrame action in src/store/projectStore.ts per store-contracts.ts
- [x] T036 [US1] Implement setCurrentFrame action in src/store/projectStore.ts per store-contracts.ts
- [x] T037 [US1] Create FrameStrip timeline component in src/components/Timeline/FrameStrip.tsx per component-contracts.ts FrameStripProps
- [x] T038 [US1] Create FrameThumbnail component in src/components/Timeline/FrameThumbnail.tsx per component-contracts.ts FrameThumbnailProps
- [x] T039 [US1] Create useAnimationLoop custom hook in src/hooks/useAnimationLoop.ts with lerp interpolation per research.md
- [x] T040 [US1] Implement play, pause, reset actions in src/store/projectStore.ts per store-contracts.ts
- [x] T041 [US1] Create PlaybackControls component in src/components/Timeline/PlaybackControls.tsx per component-contracts.ts PlaybackControlsProps
- [x] T042 [US1] Integrate Canvas, Timeline, and Sidebar components in src/App.tsx
- [x] T043 [US1] Implement entity selection in src/store/uiStore.ts selectEntity and deselectAll actions per store-contracts.ts
- [x] T044 [US1] Add keyboard shortcut support (Spacebar, Delete) in src/hooks/useKeyboardShortcuts.ts per research.md

**Checkpoint**: At this point, User Story 1 should be fully functional - can position players, add frames, and animate movement

---

## Phase 4: User Story 2 - Save and Load Projects (Priority: P1)

**Goal**: Enable coaches to save tactical diagrams to files and load them later for reuse

**Independent Test**: Create project with positioned players, save to file, close application, reopen, load file, verify all data restored

### Implementation for User Story 2

- [ ] T045 [P] [US2] Create file I/O utilities in src/utils/fileIO.ts with save/load helper functions
- [ ] T046 [P] [US2] Implement saveProject action in src/store/projectStore.ts returning JSON string per store-contracts.ts
- [ ] T047 [P] [US2] Implement loadProject action in src/store/projectStore.ts with validation per store-contracts.ts LoadResult
- [ ] T048 [US2] Create ProjectActions sidebar component in src/components/Sidebar/ProjectActions.tsx per component-contracts.ts ProjectActionsProps
- [ ] T049 [US2] Implement auto-save to LocalStorage in src/hooks/useAutoSave.ts per research.md (30 second interval)
- [ ] T050 [US2] Create unsaved changes dialog using ConfirmDialog in src/components/UI/ConfirmDialog.tsx per component-contracts.ts ConfirmDialogProps
- [ ] T051 [US2] Implement isDirty state tracking in src/store/projectStore.ts (set to true on any mutation)
- [ ] T052 [US2] Implement unsaved changes dialog logic in src/store/uiStore.ts per store-contracts.ts unsavedChangesDialog
- [ ] T053 [US2] Add crash recovery on app load by checking LocalStorage for autosave data in src/App.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - projects are persistent and recoverable

---

## Phase 5: User Story 3 - Export Animation as Video (Priority: P1)

**Goal**: Enable coaches to export animated play diagrams as video files for sharing

**Independent Test**: Create simple two-frame animation, click Export, verify playable video file downloads

### Implementation for User Story 3

- [ ] T054 [P] [US3] Create video export hook in src/hooks/useExport.ts using MediaRecorder API per research.md
- [ ] T055 [P] [US3] Create ExportDialog component in src/components/UI/ExportDialog.tsx per component-contracts.ts ExportDialogProps
- [ ] T056 [US3] Implement startExport, setExportProgress, completeExport actions in src/store/uiStore.ts per store-contracts.ts
- [ ] T057 [US3] Integrate export workflow in ProjectActions component to trigger export process
- [ ] T058 [US3] Implement canvas capture and MediaRecorder setup in useExport hook with 60fps stream
- [ ] T059 [US3] Add export resolution configuration in ProjectSettings and apply to canvas capture
- [ ] T060 [US3] Implement export error handling and retry logic in useExport hook
- [ ] T061 [US3] Add export validation to prevent exports longer than 5 minutes per VALIDATION.EXPORT.MAX_DURATION_MS

**Checkpoint**: All P1 user stories complete - MVP is fully functional with create, save, load, and export capabilities

---

## Phase 6: User Story 4 - Manage Multiple Frames (Priority: P2)

**Goal**: Enable coaches to add, remove, duplicate, and navigate between frames for complex multi-phase plays

**Independent Test**: Create project, add multiple frames using frame controls, navigate between them, verify each frame maintains independent player positions

### Implementation for User Story 4

- [ ] T062 [P] [US4] Implement removeFrame action in src/store/projectStore.ts with last-frame protection per store-contracts.ts
- [ ] T063 [P] [US4] Implement duplicateFrame action in src/store/projectStore.ts per store-contracts.ts
- [ ] T064 [P] [US4] Implement updateFrame action in src/store/projectStore.ts for duration changes per store-contracts.ts FrameUpdate
- [ ] T065 [US4] Add frame action buttons (Add, Duplicate, Remove) to FrameStrip component
- [ ] T066 [US4] Create FrameSettings component in src/components/Timeline/FrameSettings.tsx per component-contracts.ts FrameSettingsProps
- [ ] T067 [US4] Add prev/next frame navigation buttons to PlaybackControls component
- [ ] T068 [US4] Add keyboard shortcuts for frame navigation (Left/Right arrows) to useKeyboardShortcuts hook
- [ ] T069 [US4] Update FrameThumbnail component to show frame duration and provide delete/duplicate actions

**Checkpoint**: User Story 4 complete - multi-frame management fully functional

---

## Phase 7: User Story 5 - Configure Player Tokens (Priority: P2)

**Goal**: Enable coaches to customize player tokens with colors, labels, and team designations

**Independent Test**: Add player token, change color, edit label to jersey number, verify changes visible and persistent across frames

### Implementation for User Story 5

- [ ] T070 [P] [US5] Update EntityPalette component to have separate buttons for Attack Player and Defense Player
- [ ] T071 [P] [US5] Implement team-based color defaults in addEntity action using DESIGN_TOKENS.colors.attack and defense
- [ ] T072 [P] [US5] Create InlineEditor component in src/components/UI/InlineEditor.tsx per component-contracts.ts InlineEditorProps
- [ ] T073 [P] [US5] Create ColorPicker component in src/components/UI/ColorPicker.tsx per component-contracts.ts ColorPickerProps
- [ ] T074 [US5] Create EntityProperties panel component in src/components/Sidebar/EntityProperties.tsx per component-contracts.ts EntityPropertiesProps
- [ ] T075 [US5] Implement label editing in PlayerToken component on double-click using InlineEditor
- [ ] T076 [US5] Implement color and team updates in EntityProperties panel connected to updateEntity action
- [ ] T077 [US5] Create EntityContextMenu component in src/components/UI/EntityContextMenu.tsx per component-contracts.ts EntityContextMenuProps
- [ ] T078 [US5] Add right-click context menu support to PlayerToken component for delete/duplicate/edit actions

**Checkpoint**: User Story 5 complete - full player token customization available

---

## Phase 8: User Story 6 - Select Different Sports Fields (Priority: P2)

**Goal**: Enable coaches to select different field types (Rugby Union, Rugby League, Soccer, American Football)

**Independent Test**: Open sport selector, choose each field type, verify correct field markings appear on canvas

### Implementation for User Story 6

- [ ] T079 [P] [US6] Create SportSelector component in src/components/Sidebar/SportSelector.tsx per component-contracts.ts SportSelectorProps
- [ ] T080 [P] [US6] Implement updateProjectSettings action in src/store/projectStore.ts per store-contracts.ts ProjectSettingsUpdate
- [ ] T081 [US6] Update Field component to dynamically load correct SVG based on project.sport property
- [ ] T082 [US6] Add sport selector to Sidebar with dropdown showing all field types from FIELD_DIMENSIONS
- [ ] T083 [US6] Set default sport to 'rugby-union' in newProject action per Constitution II

**Checkpoint**: User Story 6 complete - multi-sport field selection functional

---

## Phase 9: User Story 7 - View Previous Frame Positions (Priority: P3)

**Goal**: Enable coaches to see ghost/transparent images of player positions from previous frame

**Independent Test**: Create two frames with different positions, navigate to Frame 2, enable ghost mode, verify semi-transparent players appear at Frame 1 positions

### Implementation for User Story 7

- [ ] T084 [P] [US7] Create GhostLayer component in src/components/Canvas/GhostLayer.tsx per component-contracts.ts GhostLayerProps
- [ ] T085 [P] [US7] Implement toggleGhosts action in src/store/uiStore.ts per store-contracts.ts
- [ ] T086 [US7] Add ghost toggle button to UI (Sidebar or Timeline)
- [ ] T087 [US7] Integrate GhostLayer into Stage component after EntityLayer
- [ ] T088 [US7] Implement logic to get previous frame entities in GhostLayer (hide if on frame 0)

**Checkpoint**: User Story 7 complete - ghost layer functional for authoring aid

---

## Phase 10: User Story 8 - Draw Annotations (Priority: P3)

**Goal**: Enable coaches to draw arrows and lines to indicate movement paths and tactical instructions

**Independent Test**: Select draw tool, click and drag to create arrow, verify annotation appears and persists

### Implementation for User Story 8

- [ ] T089 [P] [US8] Create AnnotationLayer component in src/components/Canvas/AnnotationLayer.tsx per component-contracts.ts AnnotationLayerProps
- [ ] T090 [P] [US8] Implement addAnnotation action in src/store/projectStore.ts per store-contracts.ts AnnotationCreate
- [ ] T091 [P] [US8] Implement updateAnnotation action in src/store/projectStore.ts per store-contracts.ts AnnotationUpdate
- [ ] T092 [P] [US8] Implement removeAnnotation action in src/store/projectStore.ts per store-contracts.ts
- [ ] T093 [US8] Add annotation drawing tool to EntityPalette (Arrow and Line tools)
- [ ] T094 [US8] Implement annotation drawing interaction (click-drag-release) in AnnotationLayer component
- [ ] T095 [US8] Add annotation selection and editing in AnnotationLayer component
- [ ] T096 [US8] Integrate AnnotationLayer into Stage component after GhostLayer

**Checkpoint**: User Story 8 complete - annotation drawing functional

---

## Phase 11: User Story 9 - Control Playback Speed and Looping (Priority: P3)

**Goal**: Enable coaches to control animation speed and enable looping for review

**Independent Test**: Play animation, change speed to 0.5x, 1x, and 2x, observe timing changes; enable loop and verify animation restarts

### Implementation for User Story 9

- [ ] T097 [P] [US9] Implement setPlaybackSpeed action in src/store/projectStore.ts per store-contracts.ts
- [ ] T098 [P] [US9] Implement toggleLoop action in src/store/projectStore.ts per store-contracts.ts
- [ ] T099 [US9] Add speed control buttons (0.5x, 1x, 2x) to PlaybackControls component per component-contracts.ts
- [ ] T100 [US9] Add loop toggle checkbox to PlaybackControls component per component-contracts.ts
- [ ] T101 [US9] Update useAnimationLoop hook to respect playbackSpeed multiplier
- [ ] T102 [US9] Update useAnimationLoop hook to implement looping behavior when enabled

**Checkpoint**: All user stories complete - full feature set implemented

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T103 [P] Create GridOverlay component in src/components/Canvas/GridOverlay.tsx per component-contracts.ts GridOverlayProps
- [ ] T104 [P] Implement toggleGrid action in src/store/uiStore.ts and integrate GridOverlay into Stage
- [ ] T105 [P] Add loading states to all async operations (save, load, export)
- [ ] T106 [P] Implement entity fade-out animation when entity doesn't exist in target frame per FR-ANI-05
- [ ] T107 [P] Implement ball possession logic (parentId) in updateEntity and PlayerToken rendering
- [ ] T108 [P] Add tooltips with keyboard shortcuts to all major action buttons per research.md
- [ ] T109 [P] Implement Ctrl/Cmd+S keyboard shortcut for save in useKeyboardShortcuts hook
- [ ] T110 [P] Implement Escape key to deselect entities in useKeyboardShortcuts hook
- [ ] T111 [P] Add proper error boundaries and error handling throughout application
- [ ] T112 [P] Optimize canvas rendering for 60fps performance per plan.md performance goals
- [ ] T113 [P] Add loading indicator during initial application startup
- [ ] T114 [P] Implement proper accessibility attributes for all interactive elements
- [ ] T115 Run quickstart.md validation checklist to verify setup is functional
- [ ] T116 Create user-facing README.md with usage instructions and feature overview
- [ ] T117 Final code cleanup: remove console.logs, TODOs, and unused imports

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-11)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 12)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Independent of US1 but integrates naturally
- **User Story 3 (P1)**: Depends on US1 (needs animation playback to export)
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Extends US1 frame management
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - Extends US1 entity customization
- **User Story 6 (P2)**: Can start after Foundational (Phase 2) - Independent, extends Field component
- **User Story 7 (P3)**: Depends on US1 (needs frame navigation)
- **User Story 8 (P3)**: Can start after Foundational (Phase 2) - Independent annotation system
- **User Story 9 (P3)**: Depends on US1 (extends playback controls)

### Within Each User Story

- Models/utilities before components
- Store actions before components that use them
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1 (Setup)**: All tasks marked [P] can run in parallel
- **Phase 2 (Foundational)**: Most tasks marked [P] can run in parallel
- **User Stories**: Each story can be worked on by different team members simultaneously (after Phase 2 completes)
- **Within Stories**: Tasks marked [P] indicate different files with no dependencies

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Launch utility creation in parallel:
Task: "Create interpolation utilities in src/utils/interpolation.ts"
Task: "Create validation utilities in src/utils/validation.ts"
Task: "Create sanitization utilities in src/utils/sanitization.ts"

# Launch field SVG creation in parallel:
Task: "Create field SVG for rugby-union in src/assets/fields/rugby-union.svg"
Task: "Create field SVG for rugby-league in src/assets/fields/rugby-league.svg"
Task: "Create field SVG for soccer in src/assets/fields/soccer.svg"
Task: "Create field SVG for american-football in src/assets/fields/american-football.svg"

# Launch shadcn/ui component installation in parallel:
Task: "Install Button component in src/components/UI/Button.tsx"
Task: "Install Slider component in src/components/UI/Slider.tsx"
Task: "Install Dialog component in src/components/UI/Dialog.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. Complete Phase 4: User Story 2
5. Complete Phase 5: User Story 3
6. **STOP and VALIDATE**: Test all P1 stories independently
7. Deploy/demo MVP

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (basic animation!)
3. Add User Story 2 → Test independently → Deploy/Demo (with persistence!)
4. Add User Story 3 → Test independently → Deploy/Demo (MVP complete!)
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Add User Story 6 → Test independently → Deploy/Demo
8. Add User Story 7 → Test independently → Deploy/Demo
9. Add User Story 8 → Test independently → Deploy/Demo
10. Add User Story 9 → Test independently → Deploy/Demo
11. Polish phase → Final release

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (P1)
   - Developer B: User Story 2 (P1)
   - Developer C: User Story 4 (P2)
3. After US1 complete: Developer A moves to User Story 3 (depends on US1)
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Tests are not included as they were not explicitly requested in the specification
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Total task count: 117 tasks across 12 phases
- MVP scope: Phases 1-5 (Tasks T001-T061) = 61 tasks
- P1 stories deliver core value: create animations, save/load, export videos
