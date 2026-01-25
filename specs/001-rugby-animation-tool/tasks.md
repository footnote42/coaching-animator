# Tasks: Animated GIF Export (GIF-Only)

**Input**: `specs/001-rugby-animation-tool/gif-export-plan.md`
**Feature**: Replace video export with client-side GIF export as primary output mechanism
**Context**: This is an enhancement to User Story 3 (Export Animation) from spec.md - replacing MP4/WebM export with GIF export

## Format: `[ID] [P?] [GIF] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[GIF]**: All tasks belong to GIF Export enhancement
- Include exact file paths in descriptions

---

## Phase 1: Setup (Project Initialization) ✅ COMPLETE

**Purpose**: Prepare the project for GIF export implementation

- [x] T001 [P] [GIF] Install gif.js library via npm: `npm install gif.js --save`
- [x] T002 [P] [GIF] Remove @ffmpeg/core, @ffmpeg/ffmpeg, @ffmpeg/util dependencies from package.json
- [x] T003 [GIF] Run `npm install` to update dependencies and verify build succeeds with `npm run build`

**Checkpoint**: ✅ Dependencies updated - gif.js installed, FFmpeg removed, build succeeds

---

## Phase 2: Research & Library Selection (4-6 hours)

**Purpose**: Validate gif.js library and establish encoding parameters

**Objective**: Ensure gif.js works offline and meets performance requirements

### Research & Validation

- [ ] T004 [GIF] Create spike implementation to test gif.js with sample canvas capture from CanvasStage in src/components/Canvas/Stage.tsx
- [ ] T005 [GIF] Measure encoding time for 10-frame, 5-second test sequence
- [ ] T006 [GIF] Verify gif.js can be bundled locally (no CDN dependencies) per offline-first constitution
- [ ] T007 [GIF] Document memory usage and output file size for test sequence
- [ ] T008 [P] [GIF] Test GIF playback on Chrome target browser
- [ ] T009 [P] [GIF] Test GIF playback on Edge target browser
- [ ] T010 [GIF] Test GIF playback on WhatsApp Web to ensure sharing compatibility
- [ ] T011 [GIF] Create specs/001-rugby-animation-tool/gif-export-research.md with findings and performance metrics

**Acceptance Criteria**:
- [ ] gif.js successfully encodes 10-frame test animation
- [ ] GIF plays on WhatsApp Web without errors
- [ ] Research document committed with baseline metrics (encoding time, file size, quality)

**Checkpoint**: Library validated - gif.js proven to work, research documented

---

## Phase 3: Core GIF Encoder Hook (4-5 hours)

**Purpose**: Create `useGifExport` hook for GIF generation

**Objective**: Build the core GIF encoding functionality to replace useMp4Export

### Hook Implementation

- [ ] T012 [GIF] Create src/hooks/useGifExport.ts with interface UseGifExportReturn exposing: exportAsGif, progress, isExporting, error, cancelExport
- [ ] T013 [GIF] Implement exportAsGif() function in src/hooks/useGifExport.ts using gif.js encoder
- [ ] T014 [GIF] Implement progress tracking (0-100%) in src/hooks/useGifExport.ts with real-time updates
- [ ] T015 [GIF] Implement error handling and error state management in src/hooks/useGifExport.ts
- [ ] T016 [GIF] Implement isExporting state flag in src/hooks/useGifExport.ts
- [ ] T017 [GIF] Implement cancelExport() function with worker cleanup in src/hooks/useGifExport.ts
- [ ] T018 [GIF] Integrate src/hooks/useFrameCapture.ts to reuse existing frame capture logic
- [ ] T019 [GIF] Implement GIF download as blob with filename generation (project-name-timestamp.gif) in src/hooks/useGifExport.ts
- [ ] T020 [GIF] Test hook with 2-frame animation and verify GIF downloads successfully

**Acceptance Criteria**:
- [ ] Hook exports GIF for 2-frame test animation
- [ ] Progress updates from 0% to 100%
- [ ] GIF file downloads successfully with correct filename
- [ ] Hook interface matches existing useExport pattern

**Checkpoint**: Core GIF hook functional - can encode and download GIF files

---

## Phase 4: UI Integration - Direct Export (4-5 hours)

**Purpose**: Implement single "Export as GIF" button in sidebar

**Objective**: Replace video export UI with GIF export UI

### UI Changes

- [ ] T021 [GIF] Modify src/hooks/useExport.ts to import and use useGifExport instead of useMp4Export
- [ ] T022 [GIF] Update src/hooks/useExport.ts to call gif export methods instead of MP4 encoding
- [ ] T023 [GIF] Modify src/components/Sidebar/ProjectActions.tsx to update button text from "Export Video" to "Export as GIF"
- [ ] T024 [GIF] Update Video icon to Image icon in src/components/Sidebar/ProjectActions.tsx (import from lucide-react)
- [ ] T025 [GIF] Update export progress UI messages in src/components/Sidebar/ProjectActions.tsx to reflect GIF encoding phases
- [ ] T026 [GIF] Update ExportStatus type in src/types/index.ts if needed to reflect GIF encoding phases (preparing, capturing, encoding, complete, error)
- [ ] T027 [GIF] Test "Export as GIF" button triggers export flow correctly
- [ ] T028 [GIF] Verify build succeeds with `npm run build`

**Acceptance Criteria**:
- [ ] "Export as GIF" button visible in sidebar
- [ ] Clicking button triggers GIF export flow
- [ ] Progress bar updates during export
- [ ] Build succeeds with no errors
- [ ] No references to "video" remain in export UI

**Checkpoint**: UI integration complete - GIF export accessible from sidebar

---

## Phase 5: Progress & Cancellation UX (4-5 hours)

**Purpose**: Provide feedback and control during encoding

**Objective**: Enhance user experience with progress indicators and cancellation

### UX Enhancement

- [ ] T029 [GIF] Add progress percentage text display in src/components/Sidebar/ProjectActions.tsx (e.g., "Encoding: 75%")
- [ ] T030 [GIF] Add "Cancel" button visible only during export in src/components/Sidebar/ProjectActions.tsx
- [ ] T031 [GIF] Wire Cancel button to cancelExport() function from useGifExport in src/components/Sidebar/ProjectActions.tsx
- [ ] T032 [GIF] Implement proper resource cleanup on cancellation in src/hooks/useGifExport.ts (terminate workers, free memory)
- [ ] T033 [GIF] Add loading spinner/animation during export in src/components/Sidebar/ProjectActions.tsx
- [ ] T034 [GIF] Test cancellation stops export and resets UI to idle state
- [ ] T035 [GIF] Verify worker resources are properly cleaned up after cancellation using browser DevTools

**Acceptance Criteria**:
- [ ] Progress percentage visible during export (e.g., "Encoding: 75%")
- [ ] Cancel button appears only during export, hidden when idle
- [ ] Cancel button stops export and resets UI
- [ ] Cancellation cleans up worker resources without memory leaks
- [ ] User can start new export after cancellation

**Checkpoint**: UX polished - users have clear feedback and control over export process

---

## Phase 6: Quality & Performance Optimization (4-6 hours)

**Purpose**: Tune encoding settings for optimal size/speed

**Objective**: Meet performance targets (P1: <90s for 20s animation, P2: <10MB output)

### Optimization

- [ ] T036 [GIF] Configure gif.js quality setting in src/hooks/useGifExport.ts (balance fidelity vs size, target quality: 10)
- [ ] T037 [GIF] Configure worker count using navigator.hardwareConcurrency in src/hooks/useGifExport.ts for parallel encoding
- [ ] T038 [GIF] Implement resolution clamping to 720p max in src/hooks/useGifExport.ts to control file size
- [ ] T039 [GIF] Benchmark 20-second animation export time and verify <90s (P1 requirement)
- [ ] T040 [GIF] Benchmark output file size for typical 20s animation and verify <10MB (P2 requirement)
- [ ] T041 [GIF] Test label legibility in output GIF files by exporting animations with player labels
- [ ] T042 [GIF] Fine-tune encoding parameters if benchmarks not met (adjust quality, frame rate, resolution)
- [ ] T043 [GIF] Document final encoding settings in specs/001-rugby-animation-tool/gif-export-research.md

**Acceptance Criteria**:
- [ ] 20-second animation exports in <90 seconds (P1)
- [ ] Output GIF <10MB for typical 20s animation (P2)
- [ ] Labels remain legible in output GIF
- [ ] Encoding settings documented in research.md

**Checkpoint**: Performance optimized - meets all target metrics

---

## Phase 7: Emulated Mobile Verification (3-4 hours)

**Purpose**: Validate GIF compatibility using browser emulation

**Objective**: Ensure GIFs work across devices and platforms

### Browser Emulation Testing

- [ ] T044 [P] [GIF] Test GIF rendering in iOS Safari emulation using Chrome DevTools Device Emulation (iPhone 14 Pro)
- [ ] T045 [P] [GIF] Test GIF rendering in Android Chrome emulation using Chrome DevTools Device Emulation (Pixel 7)
- [ ] T046 [GIF] Test GIF send/playback on WhatsApp Web desktop client
- [ ] T047 [P] [GIF] Test GIF rendering in Gmail web client (open GIF attachment)
- [ ] T048 [P] [GIF] Test GIF rendering in Outlook web client (open GIF attachment)
- [ ] T049 [GIF] Create specs/001-rugby-animation-tool/gif-export-verification.md with test results
- [ ] T050 [GIF] Document any compatibility issues or limitations in gif-export-verification.md

**Acceptance Criteria**:
- [ ] GIF plays correctly in iOS Safari emulation (DevTools)
- [ ] GIF plays correctly in Android Chrome emulation (DevTools)
- [ ] GIF sends/plays on WhatsApp Web
- [ ] GIF opens correctly in Gmail and Outlook
- [ ] Results documented in gif-export-verification.md

**Checkpoint**: Cross-platform compatibility verified - GIFs work everywhere coaches need them

---

## Phase 8: Documentation & Cleanup (3-4 hours)

**Purpose**: Finalize docs and clean up legacy code

**Objective**: Update all documentation and remove MP4 export code

### Documentation Updates

- [ ] T051 [P] [GIF] Update README.md export instructions to specify GIF only (remove video format references)
- [ ] T052 [P] [GIF] Update specs/001-rugby-animation-tool/spec.md FR-EXP-01 to change from ".webm video file" to ".gif file"
- [ ] T053 [P] [GIF] Remove references to WebM/Video/MP4 export from spec.md functional requirements
- [ ] T054 [GIF] Delete src/hooks/useMp4Export.ts (no longer needed)
- [ ] T055 [GIF] Remove unused FFmpeg imports and types from src/types/index.ts
- [ ] T056 [GIF] Run `npm run lint` and fix any linting issues
- [ ] T057 [GIF] Run `npm run build` and verify successful production build
- [ ] T058 [GIF] Remove console.log statements from src/hooks/useGifExport.ts

**Acceptance Criteria**:
- [ ] README updated for GIF export
- [ ] spec.md reflects GIF as the primary export format
- [ ] Final build succeeds with no warnings
- [ ] No unused code or dependencies remain (useMp4Export.ts deleted, FFmpeg deps removed)
- [ ] Codebase clean (no console.logs in production code)

**Checkpoint**: Documentation complete - project ready for deployment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - install gif.js, remove ffmpeg deps → **START HERE**
- **Research (Phase 2)**: Depends on Phase 1 - validate gif.js works
- **Core Implementation (Phase 3)**: Depends on Phase 2 - research findings inform implementation
- **UI Integration (Phase 4)**: Depends on Phase 3 - hook must exist before UI integration
- **UX Enhancement (Phase 5)**: Depends on Phase 4 - enhance existing UI
- **Optimization (Phase 6)**: Depends on Phase 5 - optimize working implementation
- **Verification (Phase 7)**: Depends on Phase 6 - test optimized version
- **Documentation (Phase 8)**: Depends on Phase 7 - document final verified implementation

### Within Each Phase

**Phase 1** (Setup):
- T001-T002 can run in parallel (different dependencies)
- T003 depends on T001-T002 completion

**Phase 2** (Research):
- T004 must complete first (create spike)
- T005-T010 can run in parallel after spike implementation
- T011 depends on T005-T010 completion

**Phase 3** (Core Hook):
- T012 must complete first (create file)
- T013-T017 are sequential implementation of hook features
- T018-T019 can run after core functions implemented
- T020 is final verification

**Phase 4** (UI Integration):
- T021-T022 modify useExport.ts (sequential)
- T023-T026 modify UI components (sequential)
- T027-T028 are verification steps

**Phase 5** (UX Enhancement):
- T029-T033 can run in parallel (different UI elements and hook logic)
- T034-T035 are verification steps

**Phase 6** (Optimization):
- T036-T038 are configuration changes (can run in parallel)
- T039-T042 are sequential benchmarking and tuning
- T043 documents final settings

**Phase 7** (Verification):
- T044-T048 are all marked [P] - can test different platforms in parallel
- T049-T050 document findings

**Phase 8** (Documentation):
- T051-T053 are documentation updates (can run in parallel)
- T054-T058 are cleanup tasks (sequential)

### Parallel Opportunities

**Phase 1**: T001-T002 (different dependencies)
**Phase 2**: T005-T010 (different test scenarios)
**Phase 5**: T029-T033 (different UI elements)
**Phase 6**: T036-T038 (configuration tweaks)
**Phase 7**: T044-T048 (platform testing)
**Phase 8**: T051-T053 (documentation updates)

---

## Implementation Strategy

### Sequential Delivery (Recommended)

1. **Phase 1**: Install dependencies and prepare project (0.5-1 hours)
2. **Phase 2**: Research and validate gif.js approach (4-6 hours)
3. **Phase 3**: Build core useGifExport hook (4-5 hours)
4. **Phase 4**: Integrate into UI (4-5 hours)
5. **CHECKPOINT**: Test GIF export works end-to-end
6. **Phase 5**: Add progress/cancellation UX (4-5 hours)
7. **Phase 6**: Optimize for performance targets (4-6 hours)
8. **Phase 7**: Verify cross-platform compatibility (3-4 hours)
9. **Phase 8**: Clean up and document (3-4 hours)

### Testing Milestones

- **After Phase 3**: Hook exports a GIF file (basic functionality)
- **After Phase 4**: UI button triggers GIF export (integration complete)
- **After Phase 5**: Progress bar and cancellation work (UX complete)
- **After Phase 6**: Performance targets met (<90s, <10MB)
- **After Phase 7**: Cross-platform compatibility verified
- **After Phase 8**: Production ready

---

## Verification Plan

### Automated Tests
- `npm run build`: No errors, bundle size checked
- `npm run lint`: No new errors
- `npm test`: Existing tests still pass (if any)

### Manual Verification
- **Basic Export**: Create 2-frame animation → Export as GIF → Verify playback
- **Progress UI**: Export longer animation → Verify progress updates smoothly 0-100%
- **Cancellation**: Start export → Cancel → Verify clean reset
- **Performance**: Export 20-second animation → Measure time <90s (P1 requirement)
- **File Size**: Verify typical 20s animation <10MB (P2 requirement)
- **Compatibility**: Test GIF on WhatsApp Web, Gmail, Outlook, mobile emulation

### Browser Testing Matrix

| Feature | Chrome | Edge | Firefox | Safari |
|---------|--------|------|---------|--------|
| GIF export | ✅ | ✅ | 🔬 | 🔬 |
| GIF playback (exported file) | ✅ | ✅ | ✅ | ✅ |
| WhatsApp Web sharing | ✅ | ✅ | 🔬 | 🔬 |

Legend: ✅ = Expected to work, 🔬 = Test needed

---

## Constitution Check

### I. Modular Architecture ✅
- useGifExport is a self-contained hook
- Reuses existing useFrameCapture hook
- Clean separation of concerns
- No coupling to other features

### II. Rugby-Centric Design Language ✅
- No terminology changes needed
- Export mechanism is implementation detail
- Coaches think "share plays", not "export format"

### III. Intuitive UX ✅
- Single "Export as GIF" button (simpler than video format selection)
- Clear progress feedback (percentage visible)
- Cancellation option (user control)
- No configuration needed (works out of the box)

### IV. Tactical Clubhouse Aesthetic ✅
- Progress UI uses Pitch Green accents (#1A3D1A)
- Monospace font for progress percentage
- Sharp corners and schematic borders maintained
- Consistent with existing UI patterns

### V. Offline-First Privacy ✅
- gif.js bundled locally; no network encoding
- No external dependencies or CDN calls
- All processing happens in browser
- No data sent to servers

---

## Timeline Estimate

| Phase | Tasks | Hours | Cumulative |
|-------|-------|-------|------------|
| Phase 1: Setup | 3 | 0.5-1 | 0.5-1 |
| Phase 2: Research | 8 | 4-6 | 4.5-7 |
| Phase 3: Core Hook | 9 | 4-5 | 8.5-12 |
| Phase 4: UI Integration | 8 | 4-5 | 12.5-17 |
| Phase 5: UX Enhancement | 7 | 4-5 | 16.5-22 |
| Phase 6: Optimization | 8 | 4-6 | 20.5-28 |
| Phase 7: Verification | 7 | 3-4 | 23.5-32 |
| Phase 8: Documentation | 8 | 3-4 | 26.5-36 |

**Total Estimated Effort**: 26-36 hours (58 tasks)

**Breakdown by Phase**:
- Setup: 3 tasks
- Research: 8 tasks
- Core Implementation: 9 tasks
- UI Integration: 8 tasks
- UX Enhancement: 7 tasks
- Optimization: 8 tasks
- Verification: 7 tasks
- Documentation: 8 tasks

---

## Notes

- All tasks marked with [GIF] label to indicate they belong to GIF Export enhancement
- [P] markers indicate tasks that can run in parallel within their phase
- Each phase builds on the previous phase - sequential execution recommended
- Verification checkpoints after Phases 4, 5, 6, and 7 ensure quality
- Documentation phase includes cleanup of legacy MP4 export code (useMp4Export.ts, FFmpeg deps)
- Performance targets (P1: <90s, P2: <10MB) are hard requirements to verify in Phase 6
- This replaces User Story 3 (Export Animation) from the main tasks.md
- Existing frame capture logic (useFrameCapture.ts) will be reused - no changes needed
- GIF format is better for sharing on WhatsApp/messaging apps than video formats
