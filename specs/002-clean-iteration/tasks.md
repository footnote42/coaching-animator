# Tasks: Clean Iteration - Bug Fixes & Polish

**Input**: `specs/002-clean-iteration/plan.md`, `specs/002-clean-iteration/spec.md`
**Feature**: Critical bug fixes and UI/polish improvements for production stability
**Context**: Post-MVP cleanup iteration addressing Share Link failure, Export Resolution disconnect, and Constitution compliance

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US5)
- Include exact file paths in descriptions

---

## Phase 0: Environment Setup & Verification (30 minutes)

**Purpose**: Establish baseline and prepare environment for bug fixes

- [x] T001 [P] [SETUP] Create `.env.local` from `.env.local.example` template (gitignored)
- [x] T002 [P] [SETUP] Document Supabase setup requirements in README.md or create SETUP.md
- [x] T003 [SETUP] Verify current export behavior: confirm 720p hardcoding by exporting video and checking dimensions
- [x] T004 [SETUP] Verify current share behavior: confirm missing env error by clicking Share Link without configuration
- [x] T005 [P] [SETUP] Create design token audit checklist: grep for color usage, rounded corners, font usage

**Checkpoint**: ✅ Baseline established - bugs confirmed, setup documented

---

## Phase 1: Critical Bug Fixes (P0) (2-3 hours)

**Purpose**: Fix Share Link and Export Resolution bugs

### Phase 1.1: Share Link Environment Configuration (US1)

**Goal**: Enable Share Link feature with proper error handling

**Independent Test**: Click Share Link with valid Supabase config; URL copied to clipboard

- [ ] T006 [P] [US1] Add Supabase setup section to README.md with step-by-step instructions
- [ ] T007 [US1] Improve error messaging in `api/share.ts` lines 133-153: distinguish missing env vs. network errors
- [ ] T008 [US1] Test share flow with valid `.env.local` configuration: verify URL creation and clipboard copy
- [ ] T009 [US1] Test share flow without env vars: verify clear error message (not generic 500)
- [ ] T010 [US1] Verify privacy notice toast appears on first share (localStorage check)

**Checkpoint**: ✅ Share Link functional when configured, clear errors when not

---

### Phase 1.2: Export Resolution Connection (US2)

**Goal**: Connect export resolution UI to actual video capture logic

**Independent Test**: Export at 1080p, verify output is 1920x1080 pixels

- [ ] T011 [US2] Modify `src/hooks/useFrameCapture.ts` to accept resolution parameter in `captureFrames` function
- [ ] T012 [US2] Update `EXPORT_SETTINGS` constant to accept dynamic width/height instead of hardcoded values
- [ ] T013 [US2] Modify `src/hooks/useExport.ts` to read `project.settings.exportResolution` from store
- [ ] T014 [US2] Map resolution string to dimensions using `VALIDATION.EXPORT.RESOLUTIONS` from `src/constants/validation.ts`
- [ ] T015 [US2] Pass resolution dimensions to `captureFrames` function call in `useExport.ts`
- [ ] T016 [US2] Update stage sizing logic in `useFrameCapture.ts` lines 208-212 to use dynamic dimensions
- [ ] T017 [US2] Test export at 720p: verify output is 1280x720 pixels
- [ ] T018 [US2] Test export at 1080p: verify output is 1920x1080 pixels
- [ ] T019 [US2] Verify resolution selector UI in `src/components/Sidebar/ProjectActions.tsx` updates correctly

**Checkpoint**: ✅ Export resolution matches UI selection for both 720p and 1080p

---

## Phase 2: UI/Polish Improvements (P1) (3-4 hours)

**Purpose**: Implement HiDPI support and enforce Constitution design tokens

### Phase 2.1: High-DPI Canvas Support (US3)

**Goal**: Crisp canvas rendering on Retina/HiDPI displays

**Independent Test**: View canvas on HiDPI display; elements render sharply without blur

- [ ] T020 [US3] Add `pixelRatio={window.devicePixelRatio}` prop to Konva Stage in `src/App.tsx` (around line 420)
- [ ] T021 [US3] Test on HiDPI display (devicePixelRatio >= 2): verify crisp rendering
- [ ] T022 [US3] Test on standard display (devicePixelRatio = 1): verify no performance degradation

**Checkpoint**: ✅ Canvas renders crisply on all display types

---

### Phase 2.2: Design Token Audit & Enforcement (US4)

**Goal**: Achieve 100% Constitution IV compliance for visual design

**Independent Test**: Visual audit confirms color palette, typography, and border styling match Constitution

- [ ] T023 [P] [US4] Audit `src/index.css`: verify `--color-primary: #1A3D1A` and `--color-background: #F8F9FA` are defined
- [ ] T024 [P] [US4] Search for rounded corners: `grep -r "rounded-" src/components` and create fix list
- [ ] T025 [P] [US4] Search for color usage: `grep -r "#1A3D1A\|#F8F9FA" src/` and verify consistency
- [ ] T026 [P] [US4] Audit monospace font usage: verify timecodes, coordinates, frame counts use `font-mono` class
- [ ] T027 [US4] Fix rounded corners in UI components: replace `rounded-*` classes with sharp corners (border-radius: 0)
- [ ] T028 [US4] Fix color inconsistencies: ensure all primary surfaces use Pitch Green `#1A3D1A`
- [ ] T029 [US4] Fix background inconsistencies: ensure all backgrounds use Tactics White `#F8F9FA`
- [ ] T030 [US4] Fix typography: ensure all data displays (coordinates, timecodes) use monospace font
- [ ] T031 [US4] Visual regression test: screenshot all major screens and verify Constitution compliance

**Checkpoint**: ✅ 100% Constitution IV compliance achieved

---

## Phase 3: Spec Compliance Gaps (P2) (2-3 hours)

**Purpose**: Enable missing spec features and improve edge case handling

### Phase 3.1: Annotation Start Frame Editing (US5)

**Goal**: Make annotation start frame selector functional

**Independent Test**: Create annotation, change Start Frame in properties panel, verify visibility updates

- [ ] T032 [US5] Enable Start Frame selector in `src/components/Sidebar/EntityProperties.tsx` line 60: remove disabled state
- [ ] T033 [US5] Implement `onValueChange` handler for Start Frame selector to update annotation
- [ ] T034 [US5] Update `src/store/projectStore.ts` if annotation update logic needed (check `updateAnnotation` action)
- [ ] T035 [US5] Test annotation visibility: create annotation, set start frame, verify it appears only from that frame onward
- [ ] T036 [US5] Test annotation visibility across frame navigation: verify annotation respects start/end frame range

**Checkpoint**: ✅ Annotation start frame selector is functional

---

### Phase 3.2: Edge Case Error Handling

**Goal**: User-friendly error messages for all edge cases

**Independent Test**: Trigger edge cases, verify toast notifications appear (not console-only errors)

- [ ] T037 [P] [EDGE] Add toast notification in `src/store/projectStore.ts` `addFrame` action when 50-frame limit reached
- [ ] T038 [P] [EDGE] Add toast notification in `src/components/Sidebar/ProjectActions.tsx` `handleOpen` when invalid JSON loaded
- [ ] T039 [EDGE] Test 50-frame limit: attempt to add 51st frame, verify clear message appears
- [ ] T040 [EDGE] Test invalid JSON load: load corrupted file, verify toast error (not just console error)
- [ ] T041 [EDGE] Test export with 1 frame: verify graceful failure with clear message
- [ ] T042 [EDGE] Test share offline: verify Share Link button disabled with "Offline" label

**Checkpoint**: ✅ All edge cases produce user-friendly feedback

---

## Phase 4: Testing & Verification (1-2 hours)

**Purpose**: Comprehensive testing of all changes

### Manual Verification Checklist

**P0 Bugs**:
- [ ] T043 [TEST] Share Link creates URL and copies to clipboard with valid config
- [ ] T044 [TEST] Share Link shows clear error when env vars missing
- [ ] T045 [TEST] Export at 720p produces 1280x720 video (verify with browser video properties)
- [ ] T046 [TEST] Export at 1080p produces 1920x1080 video (verify with browser video properties)

**P1 Polish**:
- [ ] T047 [TEST] Canvas renders sharply on HiDPI display (devicePixelRatio >= 2)
- [ ] T048 [TEST] All UI uses Pitch Green `#1A3D1A` for primary elements
- [ ] T049 [TEST] All UI uses Tactics White `#F8F9FA` for backgrounds
- [ ] T050 [TEST] No rounded corners in UI components (visual inspection)
- [ ] T051 [TEST] Monospace font used for timecodes, coordinates, frame counts

**P2 Compliance**:
- [ ] T052 [TEST] Annotation start frame selector is functional and updates visibility
- [ ] T053 [TEST] 50-frame limit shows user-friendly toast message
- [ ] T054 [TEST] Invalid JSON load shows user-friendly toast message

### Regression Testing

- [ ] T055 [TEST] Existing animation playback works correctly at all speeds
- [ ] T056 [TEST] Entity drag-and-drop still functional
- [ ] T057 [TEST] Frame navigation (prev/next, thumbnails) works correctly
- [ ] T058 [TEST] Auto-save to LocalStorage still works (check after edits)
- [ ] T059 [TEST] Video export completes without errors for typical projects
- [ ] T060 [TEST] Ball possession logic still works (ball follows parent player)
- [ ] T061 [TEST] Grid overlay toggle still works
- [ ] T062 [TEST] Context menus (entity, annotation) still functional

**Checkpoint**: ✅ All tests pass, no regressions detected

---

## Phase 5: Documentation & Cleanup (30 minutes)

**Purpose**: Update documentation and prepare for deployment

- [ ] T063 [P] [DOC] Update `README.md` with Supabase setup instructions
- [ ] T064 [P] [DOC] Update `CLAUDE.md` to reference `specs/002-clean-iteration/` as current iteration
- [ ] T065 [P] [DOC] Create `specs/002-clean-iteration/PROJECT_STATE.md` documenting completion status
- [ ] T066 [DOC] Update `specs/002-clean-iteration/spec.md` with any discovered edge cases or changes
- [ ] T067 [DOC] Commit all changes with clear commit messages per phase

**Checkpoint**: ✅ Documentation complete, ready for deployment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 0 (Setup)**: No dependencies - start immediately
- **Phase 1 (P0 Bugs)**: Depends on Phase 0 completion
  - Phase 1.1 (Share Link) and Phase 1.2 (Export Resolution) can run in parallel
- **Phase 2 (P1 Polish)**: Depends on Phase 1 completion
  - Phase 2.1 (HiDPI) and Phase 2.2 (Design Tokens) can run in parallel
- **Phase 3 (P2 Compliance)**: Depends on Phase 2 completion
  - Phase 3.1 (Annotation) and Phase 3.2 (Edge Cases) can run in parallel
- **Phase 4 (Testing)**: Depends on Phase 3 completion
- **Phase 5 (Documentation)**: Depends on Phase 4 completion

### Task Dependencies Within Phases

**Phase 1.1 (Share Link)**:
- T006-T007 can run in parallel
- T008-T010 must run sequentially after T006-T007

**Phase 1.2 (Export Resolution)**:
- T011-T012 can run in parallel
- T013-T014 must run after T011-T012
- T015-T016 must run after T013-T014
- T017-T019 must run after T015-T016

**Phase 2.2 (Design Tokens)**:
- T023-T026 (audit tasks) can run in parallel
- T027-T030 (fix tasks) must run after audits
- T031 must run after all fixes

**Phase 3.1 (Annotation)**:
- T032-T034 can run in parallel
- T035-T036 must run after T032-T034

**Phase 3.2 (Edge Cases)**:
- T037-T038 can run in parallel
- T039-T042 must run after T037-T038

**Phase 4 (Testing)**:
- All test tasks can run in any order (but after implementation)

**Phase 5 (Documentation)**:
- T063-T065 can run in parallel
- T066-T067 must run after T063-T065

---

## Parallel Opportunities

### Maximum Parallelism (if multiple developers available):

**After Phase 0 completes**:
- Developer A: Phase 1.1 (Share Link) → T006-T010
- Developer B: Phase 1.2 (Export Resolution) → T011-T019

**After Phase 1 completes**:
- Developer A: Phase 2.1 (HiDPI) → T020-T022
- Developer B: Phase 2.2 (Design Tokens) → T023-T031

**After Phase 2 completes**:
- Developer A: Phase 3.1 (Annotation) → T032-T036
- Developer B: Phase 3.2 (Edge Cases) → T037-T042

---

## Implementation Strategy

### Solo Developer (Sequential)

1. **Day 1 Morning**: Phase 0 + Phase 1.1 (Share Link)
2. **Day 1 Afternoon**: Phase 1.2 (Export Resolution)
3. **Day 2 Morning**: Phase 2.1 (HiDPI) + Phase 2.2 (Design Tokens audit)
4. **Day 2 Afternoon**: Phase 2.2 (Design Tokens fixes)
5. **Day 3 Morning**: Phase 3.1 (Annotation) + Phase 3.2 (Edge Cases)
6. **Day 3 Afternoon**: Phase 4 (Testing) + Phase 5 (Documentation)

**Total Estimated Time**: 2-3 days (16-24 hours)

### Incremental Deployment

1. Deploy Phase 1 (P0 bugs) immediately after testing → Critical fixes live
2. Deploy Phase 2 (P1 polish) after testing → Visual improvements live
3. Deploy Phase 3 (P2 compliance) after testing → Full spec compliance live

---

## Notes

- **[P] tasks**: Different files, no dependencies, can run in parallel
- **[Story] labels**: Map tasks to user stories for traceability
- **Checkpoints**: Stop and validate after each phase before proceeding
- **Testing**: Manual verification required (no automated tests in this iteration)
- **Deployment**: Vercel auto-deploys on merge to main branch
- **Rollback**: Keep Phase 1 changes in separate commit for easy rollback if needed

---

## Success Criteria

- ✅ Share Link: 100% success rate when Supabase configured
- ✅ Export Resolution: 100% accuracy to UI selection
- ✅ HiDPI: No visible blur on 2x displays
- ✅ Constitution: 100% color/typography compliance
- ✅ Annotation: Start frame selector functional
- ✅ Edge Cases: All produce user-friendly messages
- ✅ Zero regressions in existing functionality
