# Starter Prompt: Phase 9+ - Next User Story Implementation

**Role & Framework Alignment**
You are the implementation agent for the **Rugby Animation Tool**. We are using a Spec-Driven Development (SDD) workflow.

**Core Instructions:**
1. **SOP Intake:** Read [.gemini/commands/speckit.implement.toml](file:///c:/Coding%20Projects/coaching-animator/.gemini/commands/speckit.implement.toml). Adopt the logic in the `prompt` section as your Standard Operating Procedure (SOP).
2. **Context Intake:** Analyze the following files to understand the project:
   - [specs/001-rugby-animation-tool/spec.md](file:///c:/Coding%20Projects/coaching-animator/specs/001-rugby-animation-tool/spec.md) (All User Stories)
   - [specs/001-rugby-animation-tool/HANDOFF.md](file:///c:/Coding%20Projects/coaching-animator/specs/001-rugby-animation-tool/HANDOFF.md) (Status: Phase 8 Complete)
   - [.specify/memory/constitution.md](file:///c:/Coding%20Projects/coaching-animator/.specify/memory/constitution.md) (Design tokens and aesthetic principles)
3. **Current Status**: All P1 stories (US1-US3) and all P2 stories (US4-US6) are complete and verified. The application supports multi-frame animation, video export, save/load, manual frame timing, player token customization, and multi-sport field selection.
4. **Goal**: Choose and implement the **next highest-priority User Story** from the remaining P3 work.

---

## Project Status Summary

### ✅ Completed Phases (All P1 + P2 Stories)

#### Phase 3: User Story 1 - Create Basic Tactical Animation (P1) ✅
- Multi-frame animation with smooth interpolation
- Drag-and-drop entity positioning
- Play/Pause/Reset playback controls
- Canvas interaction (select, deselect, drag)

#### Phase 4: User Story 2 - Save and Load Projects (P1) ✅
- Save project to JSON file
- Load project with validation
- Unsaved changes warning dialog
- Auto-save to LocalStorage every 30 seconds
- Crash recovery on restart

#### Phase 5: User Story 3 - Export Animation as Video (P1) ✅
- MediaRecorder API integration
- .webm video export
- Export progress indicator
- Canvas-to-video capture at 60 FPS

#### Phase 6: User Story 4 - Manage Multiple Frames (P2) ✅
- Frame duration slider (0.1s - 10s per frame)
- Duplicate frame functionality
- Frame navigation (prev/next buttons)
- Frame thumbnails in strip

#### Phase 7: User Story 5 - Configure Player Tokens (P2) ✅
- Team designation (Attack/Defense/Neutral)
- Label editing via Entity Properties panel
- Color customization with tactical palette
- Right-click context menu (Edit/Duplicate/Delete)
- Entity Properties sidebar panel

#### Phase 8: User Story 6 - Select Different Sports Fields (P2) ✅
- Sport selector dropdown in sidebar
- Dynamic field switching (Rugby Union, Rugby League, Soccer, American Football)
- `updateProjectSettings` action in projectStore
- Field selection persists in save/load
- Constitution-compliant UI (sharp corners, monospace, pitch green)

**Last Commit**: `890660d` - "feat: implement User Story 6 - sport field selector"

---

## Remaining Work (Priority Order)

### P3: Polish Features (Not Started)

#### Option 1: User Story 7 - View Previous Frame Positions (Ghost Mode)
**Why Next**: Low complexity, enhances authoring experience with minimal risk.
**Complexity**: Low (2-3 tasks)
**Features to Implement**:
- Create `GhostLayer.tsx` component rendering semi-transparent entities
- Add `showGhosts` toggle to `uiStore.ts`
- Integrate ghost layer into `Stage.tsx` after `EntityLayer`
- Add toggle button to UI (sidebar or timeline)

**Estimated Time**: 1-2 hours

**Technical Notes**:
- Ghost entities should render at ~30% opacity
- Only show ghosts when on Frame 2 or later
- Ghost positions should match Frame N-1

---

#### Option 2: User Story 9 - Control Playback Speed and Looping
**Why Next**: Quick win - UI may just need wiring to existing logic.
**Complexity**: Low (1-2 tasks if just UI wiring)
**Features to Implement**:
- Verify speed control buttons (0.5x, 1x, 2x) in `PlaybackControls.tsx`
- Verify loop toggle checkbox
- Ensure `useAnimationLoop` hook respects `playbackSpeed` and `loopPlayback`

**Estimated Time**: 1 hour (verification + minor fixes)

**Status Check**:
- `playbackSpeed` and `loopPlayback` state already exist in `projectStore.ts`
- `setPlaybackSpeed` and `toggleLoop` actions already exist
- `PlaybackControls.tsx` already has speed prop - may just need UI buttons

---

#### Option 3: User Story 8 - Draw Annotations
**Why Later**: Medium-high complexity, requires new annotation system.
**Complexity**: Medium-High (5-7 tasks)
**Features to Implement**:
- Arrow tool for drawing movement paths
- Line tool for tactical instructions
- Annotation color picker
- Annotation visibility per frame
- Draw mode toggle in UI

**Estimated Time**: 3-4 hours

**Technical Notes**:
- Annotations stored in `Frame.annotations` array
- Konva `Arrow` and `Line` shapes
- Click-and-drag drawing interaction

---

## Recommended Approach

**I recommend starting with User Story 9** (Playback Speed and Looping) because:
1. Fastest to complete (likely just UI wiring)
2. Backend logic already exists in stores and hooks
3. Quick win to build momentum
4. Low risk (won't introduce breaking changes)

**Alternative**: If you prefer a more visible feature, implement **User Story 7** (Ghost Mode) for better visual feedback during authoring.

---

## Technical Context

### Architecture Overview

**State Management (Zustand)**:
- `projectStore.ts` - Main application state (project data, frames, entities, playback)
- `uiStore.ts` - UI state (modals, selected entity, dialogs)

**Canvas Rendering (Konva + react-konva)**:
- `Stage.tsx` - Main Konva wrapper with ref forwarding for export
- `Field.tsx` - Background field rendering (SVG-based, dynamic by sport)
- `EntityLayer.tsx` - Renders all entities (players, ball, cones, markers)
- `PlayerToken.tsx` - Individual entity component with drag-and-drop

**Animation System**:
- `useAnimationLoop.ts` - Core animation engine using requestAnimationFrame
- Linear interpolation (lerp) between frame positions
- Transient updates for performance (no re-renders during playback)
- Auto-stops at last frame unless loop enabled

**Export System**:
- `useExport.ts` - Manages video recording lifecycle
- Captures Konva Stage canvas at 60 FPS
- State machine: idle → preparing → recording → processing → complete

**File I/O**:
- Save: Download JSON via programmatic `<a>` click
- Load: File input → JSON validation → project restore
- Auto-save: LocalStorage every 30 seconds

### Design System (Constitution)

**Colors**:
- Pitch Green: `#1A3D1A`
- Tactics White: `#F8F9FA`

**Typography**:
- Monospace for data, coordinates, timecodes
- Bold sans-serif for headings

**Borders**:
- Sharp corners (`border-radius: 0`)
- 1px schematic borders
- No drop shadows

**Offline-First**:
- Zero network calls
- No telemetry or analytics
- No authentication

---

## File Locations

### Documentation
- **Spec**: [spec.md](file:///c:/Coding%20Projects/coaching-animator/specs/001-rugby-animation-tool/spec.md)
- **Plan**: [plan.md](file:///c:/Coding%20Projects/coaching-animator/specs/001-rugby-animation-tool/plan.md)
- **Data Model**: [data-model.md](file:///c:/Coding%20Projects/coaching-animator/specs/001-rugby-animation-tool/data-model.md)
- **Tasks**: [tasks.md](file:///c:/Coding%20Projects/coaching-animator/specs/001-rugby-animation-tool/tasks.md)

### Source Code
- **Entry Point**: [App.tsx](file:///c:/Coding%20Projects/coaching-animator/src/App.tsx)
- **Types**: [types/index.ts](file:///c:/Coding%20Projects/coaching-animator/src/types/index.ts)
- **Stores**: [store/projectStore.ts](file:///c:/Coding%20Projects/coaching-animator/src/store/projectStore.ts), [store/uiStore.ts](file:///c:/Coding%20Projects/coaching-animator/src/store/uiStore.ts)
- **Hooks**: [hooks/](file:///c:/Coding%20Projects/coaching-animator/src/hooks/)
- **Components**: [components/](file:///c:/Coding%20Projects/coaching-animator/src/components/)

### Recent Implementation Plans
- Phase 8: [phase-08-us6.md](file:///c:/Coding%20Projects/coaching-animator/specs/001-rugby-animation-tool/implementation_plans/phase-08-us6.md)
- Phase 7: [phase-07-us5.md](file:///c:/Coding%20Projects/coaching-animator/specs/001-rugby-animation-tool/implementation_plans/phase-07-us5.md)
- Phase 6: [phase-06-us4.md](file:///c:/Coding%20Projects/coaching-animator/specs/001-rugby-animation-tool/implementation_plans/phase-06-us4.md)

---

## Development Environment

### Setup
```bash
npm run dev  # Runs on http://localhost:5173
```

### Build & Test
```bash
npm run build  # TypeScript compilation + Vite build
npm test       # Vitest unit tests
```

### Key Dependencies
- React: 18.2.0
- Konva: 9.3.22
- Zustand: 5.0.2
- Tailwind CSS: 4.x
- Vite: 5.4.21

### Git Workflow
- **Branch**: `001-rugby-animation-tool`
- **Convention**: Conventional commits (`feat:`, `fix:`, `docs:`)

---

## Next Steps for Phase 9

### If implementing User Story 9 (Playback Speed):
1. Review `PlaybackControls.tsx` to see if UI already exists
2. Review `useAnimationLoop.ts` to verify speed logic
3. Create implementation plan in `specs/001-rugby-animation-tool/implementation_plans/phase-09-us9.md`
4. Wire UI controls if needed
5. Verify playback behavior in browser

### If implementing User Story 7 (Ghost Mode):
1. Create implementation plan in `specs/001-rugby-animation-tool/implementation_plans/phase-09-us7.md`
2. Create `GhostLayer.tsx` component
3. Add `showGhosts` toggle to `uiStore.ts`
4. Integrate ghost layer in `Stage.tsx`
5. Add toggle button to UI
6. Verify ghost rendering in browser

---

## Known Issues

### Current Known Issues
✅ No critical issues as of Phase 8 completion

### Quality Notes
- **Double-click inline editing**: Has minor timing issue (use context menu "Edit Label" instead)
- **Entity repositioning**: Not implemented when switching sports with different field dimensions

---

## Browser Compatibility
- **Supported**: Chrome 90+, Edge 90+ (primary targets)
- **Partial**: Firefox (MediaRecorder support varies)
- **Not Supported**: Safari (limited MediaRecorder API support)

---

## Success Criteria for Next Phase

When the next user story is complete, verify:
- ✅ Build successful (`npm run build`)
- ✅ All acceptance scenarios from spec.md pass
- ✅ Constitution compliance (sharp corners, monospace, pitch green)
- ✅ Browser tests pass for core functionality
- ✅ Feature integrates cleanly with existing code

---

## Contact & Context

This handoff document was created after **Phase 8 completion** (2026-01-22). All P1 and P2 user stories (US1-US6) are now implemented and verified. The application is in a stable, production-ready state for core animation, multi-sport field selection, save/load, and video export functionality.

**Ready for next agent to begin planning Phase 9 work.**

---

## Quick Start Checklist

Before starting implementation:
- [ ] Read this handoff document
- [ ] Review [spec.md](file:///c:/Coding%20Projects/coaching-animator/specs/001-rugby-animation-tool/spec.md) for chosen user story
- [ ] Review [constitution.md](file:///c:/Coding%20Projects/coaching-animator/.specify/memory/constitution.md) for design constraints
- [ ] Check `npm run dev` is running (http://localhost:5173)
- [ ] Verify current build status (`npm run build`)
- [ ] Choose next user story (US7, US8, or US9)
- [ ] Create implementation plan following SDD workflow
- [ ] Get user approval before execution
- [ ] Implement, verify, document, commit, push

**Good luck with Phase 9!** 🚀
