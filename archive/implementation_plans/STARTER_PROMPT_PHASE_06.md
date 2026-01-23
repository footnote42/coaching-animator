# Starter Prompt: Phase 6 - User Story 4 Implementation

**Role & Framework Alignment**
You are the primary implementation agent for my **Rugby Animation Tool**. We are using a Spec-Driven Development (SDD) workflow.

**Core Instructions:**
1. **SOP Intake:** Read [.gemini/commands/speckit.implement.toml](file:///c:/Coding%20Projects/coaching-animator/.gemini/commands/speckit.implement.toml). Adopt the logic in the `prompt` section as your Standard Operating Procedure (SOP).
2. **Context Intake:** Analyze the following files to understand the project "Soul" and "Structure":
   - [.specify/memory/constitution.md](file:///c:/Coding%20Projects/coaching-animator/.specify/memory/constitution.md) (Design tokens, modularity, and aesthetic)
   - [specs/001-rugby-animation-tool/spec.md](file:///c:/Coding%20Projects/coaching-animator/specs/001-rugby-animation-tool/spec.md) (The "What" and "Why")
   - [specs/001-rugby-animation-tool/plan.md](file:///c:/Coding%20Projects/coaching-animator/specs/001-rugby-animation-tool/plan.md) (Tech stack and architecture)
   - [specs/001-rugby-animation-tool/HANDOFF.md](file:///c:/Coding%20Projects/coaching-animator/specs/001-rugby-animation-tool/HANDOFF.md) (Project status and completed work)
3. **Current Status:** Phases 1-5 complete (US1-US3 fully implemented). All P1 user stories delivered and verified.
4. **Execution Goal:** First, create a **planning session** for **User Story 4 - Manage Multiple Frames** following the SDD workflow.

---

## What You Need to Plan

The goal is to enhance the existing frame management system to support:
1. **Frame Duration Slider**: Adjust per-frame transition times (currently fixed at 2000ms)
2. **Duplicate Frame**: Clone an existing frame with all entity positions
3. **Frame Navigation**: Smooth prev/next frame controls (may already exist, needs verification)

---

## Current Implementation Status

### Already Implemented (Phase 3)
- ✅ Basic add frame (copies current frame entities)
- ✅ Remove frame (prevents deletion of last frame)
- ✅ Frame strip with thumbnails
- ✅ Click to select frame
- ✅ Current frame indicator

### Store Actions Available
In [`src/store/projectStore.ts`](file:///c:/Coding%20Projects/coaching-animator/src/store/projectStore.ts):
- ✅ `addFrame()` - Creates new frame after current
- ✅ `removeFrame(frameId)` - Deletes frame by ID
- ✅ `duplicateFrame(frameId)` - Already exists but needs verification
- ✅ `updateFrame(frameId, updates)` - Supports duration updates
- ✅ `setCurrentFrame(index)` - Changes active frame

### UI Components
- **FrameStrip.tsx**: Frame thumbnail navigation (needs duration slider integration)
- **PlaybackControls.tsx**: Play/pause/reset controls (has prev/next frame buttons)
- **App.tsx**: Wires up frame actions

---

## User Story 4 Acceptance Criteria (from spec.md)

1. **Given** I have a project open, **When** I click Add Frame, **Then** a new frame is created as a copy of the current frame and appears in the frame strip ✅ *Already works*
2. **Given** I have multiple frames, **When** I click on a frame thumbnail in the strip, **Then** the canvas updates to show that frame's player positions ✅ *Already works*
3. **Given** I have a frame selected, **When** I click Duplicate Frame, **Then** an identical copy is created immediately after the selected frame ⏳ *Needs verification/UI*
4. **Given** I have more than one frame, **When** I click Remove Frame on a selected frame, **Then** that frame is deleted and the view moves to an adjacent frame ✅ *Already works*
5. **Given** I have a frame selected, **When** I adjust the Duration slider, **Then** the transition time from this frame to the next is updated ⏳ *Needs implementation*

---

## Planning Phase Requirements

Your first task is to **create an implementation plan** (not execute yet). Follow this process:

### Step 1: Analyze Current Code
Review these files to understand what's already implemented:
- [`src/components/Timeline/FrameStrip.tsx`](file:///c:/Coding%20Projects/coaching-animator/src/components/Timeline/FrameStrip.tsx)
- [`src/components/Timeline/PlaybackControls.tsx`](file:///c:/Coding%20Projects/coaching-animator/src/components/Timeline/PlaybackControls.tsx)
- [`src/store/projectStore.ts`](file:///c:/Coding%20Projects/coaching-animator/src/store/projectStore.ts) (frame-related actions)
- [`src/App.tsx`](file:///c:/Coding%20Projects/coaching-animator/src/App.tsx) (frame control handlers)

### Step 2: Identify Gaps
Determine what's missing for full US4 compliance:
- Does `duplicateFrame` action work correctly?
- Is there UI to trigger duplicate frame?
- Is there a duration slider component?
- Do prev/next frame buttons exist and work?

### Step 3: Create Implementation Plan
Document in `specs/001-rugby-animation-tool/implementation_plans/phase-06-us4.md`:
- **Task breakdown** (T001, T002, etc. with descriptions)
- **Files to modify** (with specific changes needed)
- **Verification steps** (browser smoke tests)
- **Acceptance criteria checklist**

### Step 4: Create Task Breakdown
Create a `task.md` artifact with:
- Phase 0: Setup (read existing code)
- Phase 1: Duplicate frame functionality (if needed)
- Phase 2: Duration slider UI component
- Phase 3: Integration and wiring
- Phase 4: Browser verification
- Phase 5: Documentation

### Step 5: Request Approval
Use `notify_user` to present the plan for review before proceeding to execution.

---

## Key Constraints

### Constitution Compliance
- **Sharp corners** (border-radius: 0) for slider components
- **Monospace fonts** for duration values (e.g., "2000ms")
- **Pitch Green (#1A3D1A)** for primary UI elements
- **No drop shadows** on sliders or controls

### Technical Requirements
- Duration range: 100ms - 10,000ms (from validation constants)
- Duration slider should update frame data via `updateFrame` action
- Duplicate frame should maintain entity positions and annotations
- Frame navigation should respect frame indices (0-based)

### User Experience
- Duration changes should update immediately (no "Apply" button)
- Duplicate frame should appear immediately after current frame in strip
- Frame navigation should not interrupt ongoing playback
- All interactions should feel responsive (<100ms feedback)

---

## Success Criteria

After implementation, all of these should pass:

### Browser Verification Checklist
1. Create project with 3 frames
2. Adjust Frame 1 duration to 500ms (verify slider works)
3. Adjust Frame 2 duration to 3000ms
4. Click "Duplicate" on Frame 2 → verify Frame 3 appears with same entities
5. Click prev/next buttons → verify smooth navigation
6. Play animation → verify transition times match slider values
7. Save project → reload → verify durations persist

### Acceptance Criteria
- ✅ AC-1: Add frame works (already verified)
- ✅ AC-2: Click frame thumbnail works (already verified)
- ✅ AC-3: Duplicate frame creates exact copy
- ✅ AC-4: Remove frame works (already verified)
- ✅ AC-5: Duration slider updates transition time

---

## Execution Flow (After Planning Approval)

Once the plan is approved:
1. Execute tasks in order (following task.md)
2. Test after each component modification
3. Run `npm run build` to verify no compilation errors
4. Conduct browser verification in `npm run dev`
5. Create walkthrough.md with screenshots
6. Update KNOWN_ISSUES.md to mark Phase 6 complete

---

## Notes

- Frame duration is stored in `frame.duration` (milliseconds)
- Default duration is 2000ms (2 seconds) from `defaultTransitionDuration` setting
- Slider component can use shadcn/ui `Slider` component (already installed)
- Consider adding duration value display next to slider (e.g., "2.5s")

