# Starter Prompt: Phase 5 - Export Animation as Video

**Role & Framework Alignment**
You are the primary implementation agent for my **Rugby Animation Tool**. We are using a Spec-Driven Development (SDD) workflow.

**Core Instructions:**
1. **SOP Intake:** Read [.gemini/commands/speckit.implement.toml](file:///c:/Coding%20Projects/coaching-animator/.gemini/commands/speckit.implement.toml). Adopt the logic in the `prompt` section as your Standard Operating Procedure (SOP).
2. **Context Intake:** Analyze the following files to understand the project "Soul" and "Structure":
   - [.specify/memory/constitution.md](file:///c:/Coding%20Projects/coaching-animator/.specify/memory/constitution.md) (Design tokens, modularity, and aesthetic)
   - [specs/001-rugby-animation-tool/spec.md](file:///c:/Coding%20Projects/coaching-animator/specs/001-rugby-animation-tool/spec.md) (The "What" and "Why")
   - [specs/001-rugby-animation-tool/plan.md](file:///c:/Coding%20Projects/coaching-animator/specs/001-rugby-animation-tool/plan.md) (Tech stack and architecture)
3. **Current Status:** Phases 1-4 complete and all critical bugs resolved. Check [specs/001-rugby-animation-tool/KNOWN_ISSUES.md](file:///c:/Coding%20Projects/coaching-animator/specs/001-rugby-animation-tool/KNOWN_ISSUES.md) to confirm resolution.
4. **Execution Goal:** Implement **Phase 5: User Story 3 - Export Animation as Video** following the artifacts created in the planning session.

**What You Need to Implement:**
The goal is to allow coaches to export their diagrams as shareable video files (.webm) for distribution via WhatsApp, Google Drive, or other channels.

**Implementation Artifacts:**
Your planning session has already produced two artifacts to guide your work:
- **Task Breakdown**: Detailed in `task.md` artifact - 9 tasks organized into 6 phases
- **Implementation Plan**: Detailed in `implementation_plan.md` artifact - comprehensive technical specifications

**Core Technical Approach:**
1. **Tooling**: Use the **MediaRecorder API** to capture the Konva Stage during playback.
2. **Hook**: Create `src/hooks/useExport.ts` to manage export state machine (idle → preparing → recording → processing → complete).
3. **State**: Extend `projectStore.ts` with `exportStatus` and `exportProgress` fields.
4. **Component**: Update `src/components/Sidebar/ProjectActions.tsx` with Export button and progress UI.
5. **Stage Access**: Modify `src/components/Canvas/Stage.tsx` to forward refs for video capture.
6. **Integration**: Wire up Stage ref in `src/App.tsx` and initialize useExport hook.

**Key Requirements:**
- Export triggers automatic full playback from Frame 0 to end
- Progress indicator shows status: "Preparing...", "Recording...", "Processing...", "Complete!"
- Video downloads automatically as `.webm` format
- Validates minimum 2 frames and maximum 5 minute duration
- Respects `project.settings.exportResolution` (720p default, 1080p optional)
- Works entirely offline (per Constitution V: Offline-First Privacy)

**Execution Order:**
Follow the task breakdown in the artifacts:
1. Phase 1: Implement `useExport.ts` hook with MediaRecorder integration
2. Phase 2: Add export state to `projectStore.ts`
3. Phase 3: Update `ProjectActions.tsx` with Export button and progress UI
4. Phase 4: Implement Stage ref forwarding in `Stage.tsx` and `App.tsx`
5. Phase 5: Create unit tests for `useExport` and verify browser functionality
6. Phase 6: Polish with validation and documentation updates

**Verification:**
After implementation:
1. **Build Check**: Run `npm run build` to verify compilation
2. **Unit Tests**: Run `npm test` to verify useExport tests pass
3. **Browser Testing**: 
   - Create project with 2+ frames with player movements
   - Click "Export" button
   - Verify progress indicator appears and updates
   - Verify animation plays through automatically
   - Verify `.webm` file downloads
   - Open video and confirm playback matches canvas animation

**Success Criteria (User Story 3 Acceptance)**:
- ✅ AC-1: Export button triggers animation playback and generates .webm video
- ✅ AC-2: Progress indicator visible during entire export process
- ✅ AC-3: Video file automatically downloads upon completion
- ✅ AC-4: Exported video plays correctly showing animated player movements

**Notes:**
- Browser targets: Chrome 90+, Edge 90+ (per spec assumptions)
- No backend required - fully client-side export
- Export must not interfere with project state or require saving first
- Clean up MediaRecorder resources on completion/error to prevent memory leaks
