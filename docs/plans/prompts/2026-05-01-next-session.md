# Next Session: Phase 2j — Snap-to-Grid
 
 ## Context
 Phase 2i (Workspace Remodel) is complete. The editor is now mobile-usable and has a focus mode.
 Next priority is **Phase 2j — Snap-to-Grid**.
 
 ## Goals
 1.  Implement a toggleable grid system in the editor.
 2.  Snap entities (Players, Cones, Balls) to grid intersections on drag-end.
 3.  Ensure grid visibility can be toggled without affecting the underlying data.
 4.  Maintain backward compatibility with non-snapped animations.
 
 ## Proposed Execution
 
 1.  **`/speckit.specify "Phase 2j — Snap-to-Grid"`**
     - Grid resolution: Should it be fixed (e.g., 20px) or relative to pitch markings?
     - Toggle location: Add to the new sidebar or a floating toolbar?
     - Snap logic: Needs to happen in `PlayerToken.handleDragEnd` and similar handlers.
 
 2.  **`/speckit.plan`**
     - Research `Konva` snap-to-grid patterns.
     - Identify all draggable components that need snapping.
 
 3.  **`/speckit.tasks`**
     - P1: UI Toggle (Grid On/Off)
     - P1: Snap logic in `projectStore` or component handlers
     - P2: Grid overlay visual (CSS or Konva Layer)
 
 ## Pre-push Gate
 - `npm run lint && npx tsc --noEmit`
 - `npm test -- --run`
 - `npm run e2e`
 
 ## Reference Documents
 - **Roadmap**: `docs/authority/ROADMAP.md` (v3.2)
 - **Issues**: `docs/issues/ISSUES.md` (FEAT-010)
 - **Current State**: Phase 2i completed and verified on branch `012-editor-workspace-remodel`.
