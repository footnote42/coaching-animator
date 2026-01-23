# Starter Prompt: Final Polish & Spec Compliance

**Role & Framework Alignment**
You are the implementation agent for the **Rugby Animation Tool**. We are using a Spec-Driven Development (SDD) workflow.

**Core Instructions:**
1. **SOP Intake:** Read [.gemini/commands/speckit.implement.toml](file:///c:/Coding%20Projects/coaching-animator/.gemini/commands/speckit.implement.toml). Adopt the logic in the `prompt` section as your Standard Operating Procedure (SOP).
2. **Context Intake:** Analyze the following files to understand the project:
   - [specs/001-rugby-animation-tool/spec.md](file:///c:/Coding%20Projects/coaching-animator/specs/001-rugby-animation-tool/spec.md) (Check Requirements vs Implementation)
   - [specs/001-rugby-animation-tool/HANDOFF.md](file:///c:/Coding%20Projects/coaching-animator/specs/001-rugby-animation-tool/HANDOFF.md) (Status: Phase 10 Complete)
   - [specs/001-rugby-animation-tool/implementation_plans/phase-final-polish.md](file:///c:/Coding%20Projects/coaching-animator/specs/001-rugby-animation-tool/implementation_plans/phase-final-polish.md) (Target items)
3. **Current Status**: All P1, P2 and P3 user stories are implemented. The application supports multi-frame animation, video export, save/load, ghost mode, and annotation drawing (arrows/lines).
4. **Goal**: Complete the final polish items to ensure 100% compliance with the functional requirements in `spec.md`.

---

## Final Polish Roadmap

### 1. Ball Possession Logic (FR-ENT-06)
**Issue**: Entities with a `parentId` do not currently follow the parent during interpolation.
**Tasks**:
- Update `useAnimationLoop.ts` to support parent-relative positioning for entities (specifically the ball).
- In `EntityProperties.tsx`, add a "Possession" dropdown for ball entities to select a parent player.

### 2. Export Resolution Selection (FR-EXP-03)
**Issue**: Hardcoded 720p export. Spec requires 720p/1080p selection.
**Tasks**:
- Add resolution toggle/dropdown to `ProjectActions.tsx`.
- Update `useExport.ts` and `projectStore.ts` to support dynamic resolution.

### 3. UI Refinements & Bug Fixes
- **Double-click reliability**: Fix `PlayerToken.tsx` to handle double-clicks more reliably (user reported finicky behavior).
- **Constitution Check**: Final sweep for sharp corners (Tailwind v4), monotone colors (Pitch Green/Tactics White), and monospace typography for data.

---

## Technical Context

### Key Files for this Phase
- **Interpolation**: [src/hooks/useAnimationLoop.ts](file:///c:/Coding%20Projects/coaching-animator/src/hooks/useAnimationLoop.ts)
- **Export Hook**: [src/hooks/useExport.ts](file:///c:/Coding%20Projects/coaching-animator/src/hooks/useExport.ts)
- **Store**: [src/store/projectStore.ts](file:///c:/Coding%20Projects/coaching-animator/src/store/projectStore.ts)
- **Sidebar**: [src/components/Sidebar/EntityProperties.tsx](file:///c:/Coding%20Projects/coaching-animator/src/components/Sidebar/EntityProperties.tsx), [src/components/Sidebar/ProjectActions.tsx](file:///c:/Coding%20Projects/coaching-animator/src/components/Sidebar/ProjectActions.tsx)
- **Token Rendering**: [src/components/Canvas/PlayerToken.tsx](file:///c:/Coding%20Projects/coaching-animator/src/components/Canvas/PlayerToken.tsx)

## Development workflow
1. Create a detailed implementation plan in `specs/001-rugby-animation-tool/implementation_plans/` (review existing `phase-final-polish.md` as a starting point).
2. Get user approval for the plan.
3. Execute the changes following the SDD SOP.
4. Verify with `npm run build`.

**Good luck finishing the project!** 🚀
