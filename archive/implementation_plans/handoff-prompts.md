# Phase 9 Handoff Prompts

Use these prompts to kick off the next phase of work. They are designed to be used in a fresh session with a new AI agent.

## 1. Selection Prompt (Choose Your Path)
> **Goal**: Help the user decide which P3 feature to implement next.

```markdown
Review the project documentation in `specs/001-rugby-animation-tool/`. 

All P1 and P2 user stories are complete. We are now entering Phase 9 (P3 Features). 
The remaining key features are:
1. **User Story 7: Ghost Mode** (View previous frame positions as semi-transparent ghosts).
2. **User Story 8: Annotations** (Draw arrows and lines on the field).

Please analyze the current implementation and suggest which one we should tackle first, then create an implementation plan for it following the SDD workflow.
```

## 2. User Story 7 Implementation Prompt (Ghost Mode)
> **Goal**: Direct implementation of Ghost Mode.

```markdown
Implement **User Story 7: View Previous Frame Positions (Ghost Mode)** for the Rugby Animation Tool.

**Context**:
- All P1 and P2 stories are complete.
- See `specs/001-rugby-animation-tool/spec.md` for ACs.
- Existing animation logic is in `src/hooks/useAnimationLoop.ts`.
- Layers are managed in `src/components/Canvas/Stage.tsx`.

**Requirements**:
1. Create `GhostLayer.tsx` in `src/components/Canvas/`.
2. Render entities from `frameIndex - 1` at ~30% opacity.
3. Add `showGhosts` toggle to `uiStore.ts`.
4. Add a toggle button to the Sidebar or Timeline.
5. Ensure ghosts only show on Frame 2 or later.

Start by creating an implementation plan in `specs/001-rugby-animation-tool/implementation_plans/phase-09-us7.md`.
```

## 3. User Story 8 Implementation Prompt (Annotations)
> **Goal**: Direct implementation of Drawing Annotations.

```markdown
Implement **User Story 8: Draw Annotations** for the Rugby Animation Tool.

**Context**:
- This is a P3 feature but highly requested for tactical analysis.
- See `specs/001-rugby-animation-tool/spec.md` for ACs.
- Need to support Arrows and Lines.
- Annotations should be per-frame.

**Requirements**:
1. Create `AnnotationLayer.tsx` in `src/components/Canvas/`.
2. Update `Frame` type in `src/types/index.ts` to include `annotations`.
3. Implement `addAnnotation`, `updateAnnotation`, `removeAnnotation` in `projectStore.ts`.
4. Add drawing tools to the Entity Palette sidebar.
5. Implement click-and-drag drawing interaction using Konva `Arrow` and `Line` components.

Start by creating an implementation plan in `specs/001-rugby-animation-tool/implementation_plans/phase-09-us8.md`.
```

## Project Overview for New Agents
> **Tip**: Include this in any starter prompt to ensure the agent has full context.

- **Tech Stack**: React 18, Konva 9, Zustand 5, Tailwind 4.
- **Architecture**: Single project store (`projectStore.ts`) manages all state. `useAnimationLoop.ts` handles the interpolation loop.
- **Design**: "Tactical Clubhouse" aesthetic - sharp corners, monospace fonts, pitch green (#1A3D1A).
- **Core Logic**: Coordinates are 0-2000, mapped to canvas. Animation is transient (no store updates during RAF).
