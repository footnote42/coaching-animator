# Starter Prompt: Phase 8 - Next User Story Implementation

**Role & Framework Alignment**
You are the implementation agent for the **Rugby Animation Tool**. We are using a Spec-Driven Development (SDD) workflow.

**Core Instructions:**
1. **SOP Intake:** Read [.gemini/commands/speckit.implement.toml](file:///c:/Coding%20Projects/coaching-animator/.gemini/commands/speckit.implement.toml). Adopt the logic in the `prompt` section as your Standard Operating Procedure (SOP).
2. **Context Intake:** Analyze the following files to understand the project:
   - [specs/001-rugby-animation-tool/spec.md](file:///c:/Coding%20Projects/coaching-animator/specs/001-rugby-animation-tool/spec.md) (All User Stories)
   - [specs/001-rugby-animation-tool/HANDOFF.md](file:///c:/Coding%20Projects/coaching-animator/specs/001-rugby-animation-tool/HANDOFF.md) (Status: Phase 7 Complete)
   - [.specify/memory/constitution.md](file:///c:/Coding%20Projects/coaching-animator/.specify/memory/constitution.md) (Design tokens and aesthetic principles)
3. **Current Status**: All P1 stories (US1-US3) and P2 stories (US4-US5) are complete and verified. The application supports multi-frame animation, video export, save/load, manual frame timing, and player token customization.
4. **Goal**: Choose and implement the **next highest-priority User Story** from the remaining work.

---

## Implementation Objective: Choose Next Phase

### Remaining User Stories (Priority Order)

#### Option 1: User Story 6 - Select Different Sports Fields (P2)
**Why Next**: Extends core functionality with multi-sport support. Field SVG assets already created in Phase 2.
**Complexity**: Low-Medium (3-4 tasks)
**Features to Implement**:
- Sport selector UI component in `Sidebar/SportSelector.tsx`
- Update `Field.tsx` to dynamically load SVG based on `project.sport`
- Implement `updateProjectSettings` action in `projectStore.ts`
- Wire selector to sidebar with dropdown for all field types

**Estimated Time**: 2-3 hours

---

#### Option 2: User Story 7 - View Previous Frame Positions (P3)
**Why Next**: Enhances authoring experience with ghost overlays.
**Complexity**: Low (2-3 tasks)
**Features to Implement**:
- Create `GhostLayer.tsx` component rendering semi-transparent entities
- Add `toggleGhosts` action to `uiStore.ts`
- Integrate ghost layer into `Stage.tsx` after `EntityLayer`
- Add toggle button to UI (sidebar or timeline)

**Estimated Time**: 1-2 hours

---

#### Option 3: User Story 9 - Control Playback Speed and Looping (P3)
**Why Next**: Playback controls partially exist but UI needs wiring.
**Complexity**: Low (1-2 tasks if just UI wiring)
**Features to Implement**:
- Verify speed control buttons (0.5x, 1x, 2x) in `PlaybackControls.tsx`
- Verify loop toggle checkbox
- Ensure `useAnimationLoop` hook respects `playbackSpeed` and `loopPlayback`

**Estimated Time**: 1 hour (verification + minor fixes)

---

## Recommended Approach

**I recommend starting with User Story 6** (Sport Field Selector) because:
1. It's the last remaining P2 story
2. Field SVG assets are already created
3. It provides immediate user value (multi-sport support)
4. It's medium complexity with clear deliverables

**Alternative**: If you want quick wins, implement **User Story 9** first (just UI wiring for existing logic).

---

## Technical Constraints (Constitution)
- **Sharp corners**: All UI elements (buttons, dropdowns, menus) must use `border-radius: 0`.
- **Monospace fonts**: Labels and data inputs should use monospace.
- **Tactical Aesthetic**: Use the defined `DESIGN_TOKENS.colors` (Pitch Green, Tactics White).
- **Offline-First**: No external libraries for pickers/menus if possible.

---

## Next Steps

### If implementing User Story 6:
1. Create implementation plan in `specs/001-rugby-animation-tool/implementation_plans/phase-08-us6.md`
2. Analyze existing code:
   - `src/components/Canvas/Field.tsx` (field rendering)
   - `src/constants/fields.ts` (field dimensions)
   - `src/assets/fields/` (SVG assets)
   - `src/store/projectStore.ts` (`updateProjectSettings` action)
3. Create `SportSelector.tsx` component
4. Integrate selector in sidebar
5. Verify field switching in browser

### If implementing User Story 7:
1. Create implementation plan in `specs/001-rugby-animation-tool/implementation_plans/phase-08-us7.md`
2. Create `GhostLayer.tsx` with opacity logic
3. Add toggle to UI store
4. Wire toggle button to sidebar/timeline
5. Verify ghost rendering in browser

### If implementing User Story 9:
1. Create implementation plan in `specs/001-rugby-animation-tool/implementation_plans/phase-08-us9.md`
2. Review `PlaybackControls.tsx` to verify UI exists
3. Review `useAnimationLoop.ts` to verify speed/loop logic
4. Wire buttons if needed
5. Verify playback behavior in browser

---

## Previous Phase Summary (Phase 7)

**Completed**: User Story 5 - Configure Player Tokens
- ✅ Team designation (Attack=Blue, Defense=Red)
- ✅ Label editing via Entity Properties panel
- ✅ Color customization with tactical palette
- ✅ Right-click context menu (Edit/Duplicate/Delete)
- ✅ Entity Properties sidebar panel

**Known Issue**: Double-click inline editing doesn't work reliably, but context menu "Edit Label" provides a working alternative.

**Build Status**: ✅ `npm run build` successful  
**Git Commit**: `dd35975` - Phase 7 complete

---

**Ready for Phase 8 implementation! Choose your user story and proceed.**
