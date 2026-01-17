# Implementation Plan - Phase 4: User Story 2 (Save and Load Projects)

This plan outlines the implementation of project persistence, auto-save, and unsaved changes protection for the Rugby Animation Tool.

## Context
- **Feature**: User Story 2 (Save and Load Projects)
- **Goal**: Enable coaches to save tactical diagrams to .json files and restore them.
- **SOP**: Follow `.gemini/commands/speckit.implement.toml`.

## Proposed Changes

### 1. Store Layer Updates
- **File**: [projectStore.ts](file:///c:/Coding%20Projects/coaching-animator/src/store/projectStore.ts)
  - Update all mutation actions (`addFrame`, `removeFrame`, `updateFrame`, `addEntity`, `updateEntity`, `removeEntity`, `setCurrentFrame`) to set `isDirty: true`.
  - Implement `saveProject()`:
    - Return `JSON.stringify(state.project)`.
    - Note: Ensure any circular references or non-serializable data are handled (though currently the project state is clean).
  - Implement `loadProject(data: unknown)`:
    - Validate `data` against the schema using `validateProject` (to be implemented in `utils/validation.ts`).
    - If valid, update the `project` state, set `currentFrameIndex: 0`, and set `isDirty: false`.
    - Return `LoadResult` with success/errors.

- **File**: [uiStore.ts](file:///c:/Coding%20Projects/coaching-animator/src/store/uiStore.ts)
  - Implement `showUnsavedChangesDialog(pendingAction: PendingAction)`: Open the dialog and store the action.
  - Implement `confirmPendingAction()`: Execute the stored `pendingAction`, reset `isDirty` if appropriate, and close the dialog.
  - Implement `cancelPendingAction()`: Clear `pendingAction` and close the dialog.

### 2. Utility Layer
- **File**: [fileIO.ts](file:///c:/Coding%20Projects/coaching-animator/src/utils/fileIO.ts) [NEW]
  - `downloadJson(filename: string, content: string)`: Create a Blob and trigger a `<a download>` click.
  - `readJsonFile(file: File): Promise<unknown>`: Wrap `FileReader` in a Promise to parse file as JSON.

### 3. Hook Layer
- **File**: [useAutoSave.ts](file:///c:/Coding%20Projects/coaching-animator/src/hooks/useAutoSave.ts) [NEW]
  - Use `useEffect` with `setInterval` (30s).
  - Save current project to `localStorage.setItem('rugby_animator_autosave', JSON.stringify(project))`.
  - Add `beforeunload` event listener to show browser-native "Discard changes?" prompt if `isDirty` is true.

### 4. UI Layer
- **File**: [ProjectActions.tsx](file:///c:/Coding%20Projects/coaching-animator/src/components/Sidebar/ProjectActions.tsx) [NEW]
  - Buttons: "New", "Open", "Save".
  - "New" and "Open" should trigger the `isDirty` check (via `uiStore.showUnsavedChangesDialog`) before proceeding.
  - "Open" uses a hidden `<input type="file" accept=".json">`.

- **File**: [ConfirmDialog.tsx](file:///c:/Coding%20Projects/coaching-animator/src/components/UI/ConfirmDialog.tsx) [NEW]
  - Implementation of the shadcn/ui Dialog for the unsaved changes warning.

- **File**: [App.tsx](file:///c:/Coding%20Projects/coaching-animator/src/App.tsx)
  - Integrate `useAutoSave` hook.
  - On mount, check `localStorage` for `rugby_animator_autosave`. If found and newer than current (or if current is empty), prompt user to recover.

## Verification Plan
1. **Store Tests**: Update `tests/unit/projectStore.test.ts` to verify `saveProject` and `loadProject` logic.
2. **File I/O**: Manual verification of download and upload in browser.
3. **Recovery**: Manual verification by refreshing tab after 30s of activity.
