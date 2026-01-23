# Phase 5: Export Animation as Video - Task Breakdown

## Overview
Implement User Story 3: Export Animation as Video using MediaRecorder API to capture the Konva Stage and generate downloadable .webm video files.

## Phase 0: Setup ✅
- [x] Review existing codebase and documentation
- [x] Confirm known issues are resolved
- [x] Analyze current implementation structure

## Phase 1: Core Hook Implementation
- [ ] **T001**: Create `src/hooks/useExport.ts` hook
  - Implement MediaRecorder API integration
  - Add Konva Stage ref capture logic
  - Implement export state management (idle, preparing, recording, processing, complete, error)
  - Add progress tracking
  - Handle video blob generation and download
  - Clean up resources on completion/error

## Phase 2: ProjectStore Integration
- [ ] **T002**: Add export state to `src/store/projectStore.ts`
  - Add `exportStatus` state field (ExportStatus type)
  - Add `exportProgress` state field (number 0-100)
  - Ensure export state is accessible to UI components

## Phase 3: UI Components
- [ ] **T003**: Update `src/components/Sidebar/ProjectActions.tsx`
  - Add "Export" button with camera/video icon
  - Integrate useExport hook
  - Display export progress UI during rendering
  - Show success/error feedback
  - Handle export button click to trigger full playback
  - Disable Export button when no project exists or < 2 frames

## Phase 4: Stage Ref Management
- [ ] **T004**: Update `src/components/Canvas/Stage.tsx`
  - Add ref forwarding to expose Konva Stage instance
  - Ensure Stage can be captured by MediaRecorder
  
- [ ] **T005**: Update `src/App.tsx`
  - Create Stage ref and pass to Stage component
  - Provide Stage ref to useExport hook via context or props

## Phase 5: Testing & Verification
- [ ] **T006**: Create unit test for useExport hook
  - Test state transitions
  - Test error handling
  - Test cleanup on unmount
  
- [ ] **T007**: Browser verification
  - Create project with 2+ frames with player movements
  - Click Export button
  - Verify progress indicator appears
  - Verify animation plays through automatically
  - Verify .webm file downloads
  - Open downloaded video and verify playback matches canvas animation

## Phase 6: Polish
- [ ] **T008**: Add export validation
  - Minimum 2 frames required
  - Maximum duration check (5 minutes per spec)
  - Error messages for validation failures

- [ ] **T009**: Update documentation
  - Update KNOWN_ISSUES.md to mark Phase 5 complete
  - Add walkthrough.md demonstrating export feature

## Notes
- Export format: .webm (MediaRecorder default)
- Resolution: Use project.settings.exportResolution (720p default, 1080p optional)
- Browser support: Chrome 90+, Edge 90+ (per spec assumptions)
- Export triggers full playback from frame 0 to end
- Progress indicator must be visible during entire export process
