# Starter Prompt: Phase 7 - User Story 5 Implementation

**Role & Framework Alignment**
You are the implementation agent for the **Rugby Animation Tool**. We are using a Spec-Driven Development (SDD) workflow.

**Core Instructions:**
1. **SOP Intake:** Read [.gemini/commands/speckit.implement.toml](file:///c:/Coding%20Projects/coaching-animator/.gemini/commands/speckit.implement.toml). Adopt the logic in the `prompt` section as your Standard Operating Procedure (SOP).
2. **Context Intake:** Analyze the following files to understand the project:
   - [specs/001-rugby-animation-tool/spec.md](file:///c:/Coding%20Projects/coaching-animator/specs/001-rugby-animation-tool/spec.md) (User Story 5)
   - [specs/001-rugby-animation-tool/HANDOFF.md](file:///c:/Coding%20Projects/coaching-animator/specs/001-rugby-animation-tool/HANDOFF.md) (Status: Phase 6 Complete)
   - [.specify/memory/constitution.md](file:///c:/Coding%20Projects/coaching-animator/.specify/memory/constitution.md) (Design tokens and aesthetic principles)
3. **Current Status**: All P1 stories (US1-US3) and User Story 4 are complete and verified. The application supports multi-frame animation, video export, save/load, and manual frame timing.
4. **Goal**: Implement **User Story 5 - Configure Player Tokens**. This involves enabling coaches to customize player labels (numbers/names), colors, and team designations.

---

## Implementation Objective: User Story 5

### Features to Implement
1. **Team Designation**: Separate palette buttons for "Attack Player" and "Defense Player".
2. **Label Editing**: Double-click a player token to open an inline editor for jersey numbers/labels.
3. **Color Customization**: Ability to change player colors from a predefined tactical palette.
4. **Context Menu**: Right-click context menu for quick actions (Delete, Duplicate, Edit).
5. **Entity Properties Panel**: A sidebar section to edit selected entity properties (Label, Color, Team).

### Key Files to Modify
- `src/components/Sidebar/EntityPalette.tsx`: Update buttons.
- `src/components/Canvas/PlayerToken.tsx`: Add double-click/right-click handlers.
- `src/store/projectStore.ts`: Ensure `updateEntity` handles all property changes.
- `src/components/Sidebar/EntityProperties.tsx`: (NEW) Create this component.
- `src/App.tsx`: Integrate the new properties panel.

---

## Technical Constraints (Constitution)
- **Sharp corners**: All UI elements (buttons, inputs, menus) must use `border-radius: 0`.
- **Monospace fonts**: Labels and data inputs should use monospace.
- **Tactical Aesthetic**: Use the defined `DESIGN_TOKENS.colors` (Pitch Green, Tactics White).
- **Offline-First**: No external libraries for picker/menus if possible (use shadcn/radix).

---

## Next Steps
1. Create a detailed implementation plan in `specs/001-rugby-animation-tool/implementation_plans/phase-07-us5.md`.
2. Break down tasks for individual files.
3. Begin execution following the SDD workflow.

**Ready for Phase 7 implementation!**
