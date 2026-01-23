# Implementation Plan: Phase 5 - Export Animation as Video

## Goal Description

Implement User Story 3: Export Animation as Video to enable coaches to export their animated tactical diagrams as shareable .webm video files. This feature uses the MediaRecorder API to capture the Konva Stage during playback and generates a downloadable video file.

**Background Context:**
- Previous phases have implemented core animation, save/load, and playback functionality
- Critical bugs (playback, ball shape/color) were fixed in the previous session
- The application uses React + Konva for canvas rendering and Zustand for state management
- Export must work entirely offline (per Constitution V: Offline-First Privacy)

**What this change accomplishes:**
- Coaches can export animations as .webm videos for sharing via WhatsApp, Google Drive, etc.
- Videos are self-contained and playable on any device without the tool
- Export process provides visual feedback via progress indicator
- Exported files maintain the specified resolution (720p default, 1080p optional)

## User Review Required

> [!IMPORTANT]
> **Konva Stage Ref Access Strategy**
> The implementation requires access to the Konva Stage instance to capture video. Two approaches are possible:
> 1. **Stage Ref Forwarding** (Recommended): Use `React.forwardRef` on the `Stage` component to expose the Konva stage instance
> 2. **Context-based**: Create a StageContext to provide stage ref throughout the component tree
> 
> This plan uses **Approach 1** (ref forwarding) as it's simpler and more direct. Please confirm if you prefer a different approach.

> [!WARNING]
> **Browser Compatibility Note**
> MediaRecorder API support for canvas capture varies by browser:
> - ✅ Chrome 90+: Full support
> - ✅ Edge 90+: Full support
> - ⚠️ Firefox: Partial support
> - ❌ Safari: Limited support
> 
> Per spec assumptions, Chrome/Edge are primary targets. This aligns with the documented constraints.

## Proposed Changes

### Core Hook Implementation

#### [NEW] [useExport.ts](file:///c:/Coding%20Projects/coaching-animator/src/hooks/useExport.ts)

Create a custom hook to manage the entire video export workflow:

**Key Responsibilities:**
- Accept Konva Stage ref as input
- Manage export state machine: `idle → preparing → recording → processing → complete` (or `error`)
- Capture canvas stream using `stage.toCanvas()` and MediaRecorder API
- Trigger full animation playback from frame 0
- Track export progress (0-100%)
- Generate video blob and trigger download
- Handle errors and cleanup

**Dependencies:**
- `useProjectStore` for project data and playback control
- React `useRef`, `useState`, `useCallback` for state management
- MediaRecorder API for canvas capture
- Blob API for file download

**Export Function Signature:**
```typescript
export function useExport(stageRef: React.RefObject<Konva.Stage>) {
  // Returns: { exportStatus, exportProgress, startExport }
}
```

**State Transitions:**
1. `idle`: Ready to export
2. `preparing`: Validating project, resetting to frame 0
3. `recording`: MediaRecorder capturing canvas, animation playing
4. `processing`: Finalizing video blob
5. `complete`: Download triggered, ready for next export
6. `error`: Export failed with error message

---

### ProjectStore Integration

#### [MODIFY] [projectStore.ts](file:///c:/Coding%20Projects/coaching-animator/src/store/projectStore.ts)

Add export-related state to the global store for UI access:

**Changes:**
- Add `exportStatus: ExportStatus` field (default: `'idle'`)
- Add `exportProgress: number` field (default: `0`)
- These fields will be updated by the `useExport` hook via setter functions
- No new actions needed; hook manages state internally and updates store

**Rationale:** Export state in the store allows components (like ProjectActions) to reactively display progress UI without prop drilling.

---

### UI Component Updates

#### [MODIFY] [ProjectActions.tsx](file:///c:/Coding%20Projects/coaching-animator/src/components/Sidebar/ProjectActions.tsx)

Add Export button and progress UI to the project actions sidebar:

**Changes:**
- Import `Video` or `Camera` icon from `lucide-react`
- Add "Export" button below the Save button
- Call `startExport()` from `useExport` hook on Export click
- Display export progress indicator when `exportStatus !== 'idle'`
  - Use a text label or progress bar showing `exportProgress` percentage
  - Show status messages: "Preparing...", "Recording...", "Processing...", "Complete!"
  - Show error message if `exportStatus === 'error'`
- Disable Export button when:
  - No project loaded (`!project`)
  - Less than 2 frames (`project.frames.length < 2`)
  - Export in progress (`exportStatus !== 'idle'`)

**UI Layout:**
```
[Project Actions Section]
├── New | Open (side by side)
├── Save
└── Export  ← NEW
    └── Progress Indicator (conditional)
```

---

### Stage Ref Management

#### [MODIFY] [Stage.tsx](file:///c:/Coding%20Projects/coaching-animator/src/components/Canvas/Stage.tsx)

Enable external access to the Konva Stage instance:

**Changes:**
- Wrap component with `React.forwardRef`
- Forward ref to the `<KonvaStage>` component
- Update type signature to support ref

**Before:**
```typescript
export const Stage: React.FC<StageProps> = ({ ... })
```

**After:**
```typescript
export const Stage = React.forwardRef<Konva.Stage, StageProps>(({ ... }, ref) => {
  return <KonvaStage ref={ref} ... />
})
```

---

#### [MODIFY] [App.tsx](file:///c:/Coding%20Projects/coaching-animator/src/App.tsx)

Create and pass Stage ref to enable export functionality:

**Changes:**
- Import `useRef` from React and `Konva` from konva
- Create `stageRef = useRef<Konva.Stage>(null)`
- Pass `ref={stageRef}` to `<Stage>` component
- Call `useExport(stageRef)` hook to initialize export functionality

**Note:** The hook will be called in App.tsx and export state will be accessible via the store to ProjectActions.

---

### Hook Exports

#### [MODIFY] [hooks/index.ts](file:///c:/Coding%20Projects/coaching-animator/src/hooks/index.ts)

Export the new `useExport` hook:

**Changes:**
- Add `export { useExport } from './useExport';`

## Verification Plan

### Automated Tests

#### Unit Test: `useExport` Hook

**Test File:** `tests/unit/useExport.test.ts` (NEW)

**Test Coverage:**
- ✅ Initial state is `idle` with 0% progress
- ✅ `startExport()` transitions to `preparing` state
- ✅ Export validates minimum 2 frames (error state if < 2)
- ✅ Export validates maximum duration (error if > 5 minutes)
- ✅ Hook cleans up MediaRecorder on unmount
- ✅ Error state is set when MediaRecorder fails

**Run Command:**
```bash
npm test useExport.test.ts
```

**Rationale:** Ensures export state machine works correctly and handles edge cases (validation, errors, cleanup) before manual testing.

---

#### Unit Test: `projectStore` Export State

**Test File:** `tests/unit/projectStore.test.ts` (MODIFY existing)

**New Test Cases:**
- ✅ Export state fields exist and initialize correctly
- ✅ Export state can be updated independently

**Run Command:**
```bash
npm test projectStore.test.ts
```

**Rationale:** Confirms store changes don't break existing functionality and new state is accessible.

---

### Browser Verification

**Prerequisites:**
- Development server running: `npm run dev`
- Chrome or Edge browser

**Test Scenario 1: Successful Export**

1. Open application in browser
2. Create a new project (or load existing)
3. Add 2+ attack players to canvas
4. Create Frame 2 and move players to different positions
5. Verify Export button is enabled in left sidebar
6. Click "Export" button
7. **Expected Results:**
   - Export button becomes disabled
   - Progress indicator appears showing "Preparing..."
   - Animation automatically plays from Frame 1 to end
   - Progress updates to "Recording..." then "Processing..."
   - A `.webm` file downloads automatically
   - Progress shows "Complete!" briefly
   - Export button re-enables after completion

8. Open the downloaded `.webm` file in a video player
9. **Expected Results:**
   - Video plays showing smooth animation of player movements
   - Video quality matches canvas rendering
   - Video duration matches animation duration (frame durations summed)

**Test Scenario 2: Validation - Insufficient Frames**

1. Open application in browser
2. Create new project (starts with 1 frame)
3. Add entities to Frame 1
4. **Expected Results:**
   - Export button is disabled
   - Tooltip or disabled state indicates "Minimum 2 frames required"

**Test Scenario 3: Error Handling**

1. Open application in browser
2. Create a project with 2 frames
3. Open browser DevTools Console
4. Before clicking Export, inject an error by running:
   ```javascript
   // Simulate MediaRecorder failure (advanced testing)
   // This can be done by modifying useExport.ts temporarily to throw error
   ```
5. Click Export
6. **Expected Results:**
   - Export status shows "Error"
   - User-friendly error message is displayed
   - Export button re-enables for retry

**Test Scenario 4: Multiple Exports**

1. Complete Test Scenario 1 successfully
2. Modify player positions
3. Click Export again
4. **Expected Results:**
   - Second export completes successfully
   - New video file downloads (different from first)
   - No memory leaks or performance degradation

---

### Manual Verification Checklist

Before marking Phase 5 complete, verify all acceptance criteria from User Story 3:

- [ ] **AC-1**: Given I have a project with at least two frames, When I click Export, Then the animation plays through and a .webm video file is generated
- [ ] **AC-2**: Given export is in progress, When rendering is happening, Then I see a progress indicator showing export status
- [ ] **AC-3**: Given export completes successfully, When the video is ready, Then the file automatically downloads to my device
- [ ] **AC-4**: Given I have exported a video, When I open the file on any device, Then it plays correctly showing the animated player movements

---

## Post-Implementation

After completing implementation and verification:

1. Update [KNOWN_ISSUES.md](file:///c:/Coding%20Projects/coaching-animator/specs/001-rugby-animation-tool/KNOWN_ISSUES.md):
   - Add "✅ Phase 5: User Story 3 - COMPLETE" section
   
2. Create `walkthrough.md` artifact demonstrating:
   - Step-by-step export process
   - Screenshots of progress indicator states
   - Embedded video showing successful export (optional)

3. Commit changes with message: `feat: implement Phase 5 - Export Animation as Video (US3)`
