# Feature Specification: AnimatorApp - Rugby Coaching Animation Tool

**Feature Branch**: `001-rugby-animation-tool`
**Created**: 2026-01-16
**Status**: Draft
**Input**: User description: "Build an animation tool for rugby coaches in line with the PRD.md document and the CONSTITUTION.md instructions"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Basic Tactical Animation (Priority: P1)

As a rugby coach, I want to position players on a rugby field and animate their movements between positions so that I can demonstrate tactical plays to my team.

**Why this priority**: This is the core value proposition of the tool. Without the ability to place players and animate their movement, the tool has no purpose. This represents the minimum viable product.

**Independent Test**: Can be fully tested by dragging player tokens onto a canvas, creating a second frame with different positions, and pressing play to see smooth animation between positions.

**Acceptance Scenarios**:

1. **Given** the application is open with an empty canvas, **When** I add player tokens from the sidebar, **Then** colored circles with labels appear on the rugby field at the drop location
2. **Given** I have players positioned on Frame 1, **When** I create Frame 2 and drag players to new positions, **Then** each player's position is saved for that frame
3. **Given** I have two or more frames with different player positions, **When** I press Play, **Then** players smoothly transition from their Frame 1 positions to Frame 2 positions
4. **Given** animation is playing, **When** I press Pause, **Then** the animation stops at the current interpolated state
5. **Given** animation has played, **When** I press Reset, **Then** the view returns to Frame 1 with players in their original positions

---

### User Story 2 - Save and Load Projects (Priority: P1)

As a rugby coach, I want to save my tactical diagrams to a file and load them later so that I can build a library of plays and reuse my work.

**Why this priority**: Without persistence, coaches lose all work when closing the browser. This is essential for practical use and directly tied to the core functionality.

**Independent Test**: Can be fully tested by creating a project with positioned players, saving to a file, closing the application, reopening, loading the file, and verifying all player positions and frames are restored.

**Acceptance Scenarios**:

1. **Given** I have created a project with players and frames, **When** I click Save, **Then** a JSON file downloads to my device with all project data
2. **Given** I have a previously saved JSON file, **When** I click Load and select the file, **Then** the project is restored with all players, positions, and frames intact
3. **Given** I have unsaved changes, **When** I attempt to create a New Project or close the tab, **Then** I am warned about unsaved changes before proceeding
4. **Given** I am working on a project, **When** 30 seconds pass since my last change, **Then** the project is automatically saved to browser storage for crash recovery

---

### User Story 3 - Export Animation as Video (Priority: P1)

As a rugby coach, I want to export my animated play diagram as a video file so that I can share it via WhatsApp, Google Drive, or other messaging apps with my team.

**Why this priority**: Export is the primary output mechanism. Coaches need shareable videos to communicate plays to players who may not have access to the tool.

**Independent Test**: Can be fully tested by creating a simple two-frame animation, clicking Export, and verifying a playable video file downloads.

**Acceptance Scenarios**:

1. **Given** I have a project with at least two frames, **When** I click Export, **Then** the animation plays through and a .webm video file is generated
2. **Given** export is in progress, **When** rendering is happening, **Then** I see a progress indicator showing export status
3. **Given** export completes successfully, **When** the video is ready, **Then** the file automatically downloads to my device
4. **Given** I have exported a video, **When** I open the file on any device, **Then** it plays correctly showing the animated player movements

---

### User Story 4 - Manage Multiple Frames (Priority: P2)

As a rugby coach, I want to add, remove, duplicate, and navigate between frames so that I can build complex multi-phase plays.

**Why this priority**: While basic animation needs two frames, real tactical diagrams often require many phases. This extends the core functionality to support realistic coaching scenarios.

**Independent Test**: Can be fully tested by creating a project, adding multiple frames using frame controls, navigating between them, and verifying each frame maintains independent player positions.

**Acceptance Scenarios**:

1. **Given** I have a project open, **When** I click Add Frame, **Then** a new frame is created as a copy of the current frame and appears in the frame strip
2. **Given** I have multiple frames, **When** I click on a frame thumbnail in the strip, **Then** the canvas updates to show that frame's player positions
3. **Given** I have a frame selected, **When** I click Duplicate Frame, **Then** an identical copy is created immediately after the selected frame
4. **Given** I have more than one frame, **When** I click Remove Frame on a selected frame, **Then** that frame is deleted and the view moves to an adjacent frame
5. **Given** I have a frame selected, **When** I adjust the Duration slider, **Then** the transition time from this frame to the next is updated

---

### User Story 5 - Configure Player Tokens (Priority: P2)

As a rugby coach, I want to customize player tokens with colors, labels (jersey numbers), and team designations so that my diagrams clearly show who is who.

**Why this priority**: Differentiation between attack and defense, and identification of specific players, is essential for clear tactical communication.

**Independent Test**: Can be fully tested by adding a player token, changing its color, editing its label to a jersey number, and verifying the changes are visible and persist across frames.

**Acceptance Scenarios**:

1. **Given** I click Add Attack Player, **When** the player is added, **Then** it appears with a blue/green color indicating attack team
2. **Given** I click Add Defense Player, **When** the player is added, **Then** it appears with a red/orange color indicating defense team
3. **Given** I have a player selected, **When** I double-click or access properties, **Then** I can edit the label to show a jersey number or position code
4. **Given** I have a player selected, **When** I change its color, **Then** the new color is applied and visible on the canvas
5. **Given** I right-click a player, **When** the context menu appears, **Then** I can delete, duplicate, or change the player's properties

---

### User Story 6 - Select Different Sports Fields (Priority: P2)

As a coach, I want to select different field types (Rugby Union, Rugby League, Soccer, American Football) so that I can create diagrams appropriate to my sport.

**Why this priority**: While rugby is the primary focus, supporting multiple sports increases the tool's utility and allows colleagues who coach other sports to use it.

**Independent Test**: Can be fully tested by opening the sport selector, choosing each field type, and verifying the correct field markings appear on the canvas.

**Acceptance Scenarios**:

1. **Given** I start a new project, **When** the default view loads, **Then** a Rugby Union field is displayed with proper pitch markings
2. **Given** I open the Sport selector, **When** I choose Rugby League, **Then** the field background updates to show Rugby League markings
3. **Given** I open the Sport selector, **When** I choose Soccer, **Then** the field background updates to show a soccer pitch
4. **Given** I open the Sport selector, **When** I choose American Football, **Then** the field background updates to show a gridiron

---

### User Story 7 - View Previous Frame Positions (Priority: P3)

As a rugby coach, I want to see ghost/transparent images of where players were in the previous frame so that I can better plan movement patterns.

**Why this priority**: Ghost images significantly improve the authoring experience but are not essential for core functionality.

**Independent Test**: Can be fully tested by creating two frames with different positions, navigating to Frame 2, enabling ghost mode, and verifying semi-transparent players appear at Frame 1 positions.

**Acceptance Scenarios**:

1. **Given** I am on Frame 2 or later, **When** ghost mode is enabled, **Then** I see semi-transparent versions of players at their previous frame positions
2. **Given** ghost mode is enabled, **When** I toggle it off, **Then** the ghost images disappear
3. **Given** I am on Frame 1, **When** ghost mode is enabled, **Then** no ghosts appear (there is no previous frame)

---

### User Story 8 - Draw Annotations (Priority: P3)

As a rugby coach, I want to draw arrows and lines to indicate movement paths and tactical instructions so that my diagrams are more informative.

**Why this priority**: Annotations enhance diagram clarity but the core animation already communicates movement through player transitions.

**Independent Test**: Can be fully tested by selecting the draw tool, clicking and dragging to create an arrow, and verifying the annotation appears and persists.

**Acceptance Scenarios**:

1. **Given** I select the Arrow tool, **When** I click and drag on the canvas, **Then** an arrow is drawn from start to end point
2. **Given** I have drawn an annotation, **When** I select it, **Then** I can change its color or delete it
3. **Given** annotations exist on a frame, **When** I export or save, **Then** the annotations are included

---

### User Story 9 - Control Playback Speed and Looping (Priority: P3)

As a rugby coach, I want to control animation speed and enable looping so that I can review plays at different paces.

**Why this priority**: Speed control improves review experience but basic playback already delivers core value.

**Independent Test**: Can be fully tested by playing an animation, changing speed to 0.5x, 1x, and 2x, and observing the timing changes.

**Acceptance Scenarios**:

1. **Given** animation is playing, **When** I select 0.5x speed, **Then** the animation plays at half speed
2. **Given** animation is playing, **When** I select 2x speed, **Then** the animation plays at double speed
3. **Given** loop mode is enabled, **When** the animation reaches the last frame, **Then** it automatically restarts from Frame 1

---

### Edge Cases

- What happens when a user tries to load a corrupted or invalid JSON file?
  - System validates the file, rejects invalid format, and shows a user-friendly error message
- What happens when a user has 50 frames and tries to add more?
  - System prevents adding beyond 50 frames and shows a message explaining the limit
- What happens when browser storage quota is exceeded during auto-save?
  - System shows a warning and clears the oldest backup to free space
- What happens when export fails or times out?
  - System shows an error message and allows the user to retry
- What happens when a user deletes all frames?
  - System maintains at least one frame to prevent invalid state
- What happens when a player token is dragged outside canvas bounds?
  - Coordinates are clamped to valid canvas range (0-2000)

## Requirements *(mandatory)*

### Functional Requirements

#### Canvas & Field System
- **FR-CAN-01**: System MUST render a responsive canvas that fills the main content area
- **FR-CAN-02**: System MUST display field background based on selected sport type
- **FR-CAN-03**: System MUST support Rugby Union, Rugby League, Soccer, and American Football field types
- **FR-CAN-04**: System MUST provide a toggleable grid overlay for positioning reference
- **FR-CAN-05**: System MUST support high-DPI/Retina displays with proper pixel ratio scaling

#### Entity System
- **FR-ENT-01**: System MUST render player tokens as colored circles with configurable labels
- **FR-ENT-02**: System MUST support drag-and-drop repositioning of all entities
- **FR-ENT-03**: System MUST color-code entities by team (Attack: blue/green, Defense: red/orange)
- **FR-ENT-04**: System MUST support custom text labels up to 10 characters (jersey numbers, position codes)
- **FR-ENT-05**: System MUST render a distinct ball entity
- **FR-ENT-06**: System MUST support ball possession logic (attaching ball to a player)
- **FR-ENT-07**: System MUST support arrow and line annotations with configurable visibility per frame

#### Frame & Timeline System
- **FR-FRM-01**: System MUST maintain an ordered list of frames (minimum 1, maximum 50)
- **FR-FRM-02**: System MUST allow adding, removing, and duplicating frames via UI controls
- **FR-FRM-03**: System MUST provide frame navigation via thumbnail strip and prev/next buttons
- **FR-FRM-04**: System MUST allow setting per-frame transition duration (100ms to 10,000ms, default 2,000ms)
- **FR-FRM-05**: System MUST display ghost entities from previous frame at reduced opacity when enabled
- **FR-FRM-06**: System MUST prevent deletion of the last remaining frame

#### Animation Engine
- **FR-ANI-01**: System MUST play animation from current frame to end using smooth interpolation
- **FR-ANI-02**: System MUST use linear interpolation (lerp) between entity positions
- **FR-ANI-03**: System MUST support pause and resume of playback
- **FR-ANI-04**: System MUST support reset playback to frame 1
- **FR-ANI-05**: System MUST fade out entities that do not exist in the target frame
- **FR-ANI-06**: System MUST support playback speed control (0.5x, 1x, 2x)
- **FR-ANI-07**: System MUST support loop playback option

#### Export System
- **FR-EXP-01**: System MUST export animation as .webm video file
- **FR-EXP-02**: System MUST display export progress indicator during rendering
- **FR-EXP-03**: System MUST support configurable export resolution (720p default, 1080p optional)
- **FR-EXP-04**: System MUST validate total animation duration does not exceed 5 minutes

#### Persistence System
- **FR-PER-01**: System MUST save project state to downloadable JSON file
- **FR-PER-02**: System MUST load project from uploaded JSON file with validation
- **FR-PER-03**: System MUST auto-save to browser storage every 30 seconds
- **FR-PER-04**: System MUST confirm before discarding unsaved changes
- **FR-PER-05**: System MUST validate loaded files against schema before accepting

#### User Interface
- **FR-UI-01**: System MUST provide keyboard shortcut Spacebar for play/pause toggle
- **FR-UI-02**: System MUST provide keyboard shortcut Delete for removing selected entity
- **FR-UI-03**: System MUST support entity selection via click
- **FR-UI-04**: System MUST support entity deselection via clicking empty canvas area
- **FR-UI-05**: System MUST support inline label editing via double-click
- **FR-UI-06**: System MUST provide context menu via right-click on entities

#### Privacy & Offline
- **FR-PRV-01**: System MUST function entirely offline with no network calls
- **FR-PRV-02**: System MUST NOT include any analytics, tracking, or telemetry
- **FR-PRV-03**: System MUST store all data locally (browser storage only)
- **FR-PRV-04**: System MUST NOT require any user accounts or authentication

#### Constitution Compliance
- **FR-CON-01**: System MUST use rugby-appropriate terminology (phases instead of keyframes where applicable)
- **FR-CON-02**: System MUST default to Rugby Union field on new projects
- **FR-CON-03**: System MUST use the Tactical Clubhouse aesthetic with Pitch Green (#1A3D1A) and Tactics White (#F8F9FA)
- **FR-CON-04**: System MUST use sharp corners (border-radius: 0) and schematic borders (1px)
- **FR-CON-05**: System MUST use monospace fonts for frame counts, coordinates, and timecodes

### Key Entities

- **Project**: The top-level container holding all information about a coaching diagram, including name, selected sport type, and all frames. Projects can be saved and loaded as files.

- **Frame**: A single snapshot in the animation sequence. Each frame contains the positions of all entities at that moment and has a configurable duration for transitioning to the next frame.

- **Entity**: Any object that can be placed on the field. Includes player tokens, the ball, and markers/cones. Each entity has a position, color, label, and team designation.

- **Annotation**: Visual elements overlaid on the field to indicate movement or instructions. Includes arrows and lines with configurable colors and frame visibility.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a two-frame animation with 8 positioned players and export it as video within 5 minutes of first use
- **SC-002**: Animation playback runs at consistent 60 frames per second on standard desktop hardware (2020 or newer)
- **SC-003**: Video export completes successfully on Chrome and Edge browsers
- **SC-004**: Saved project files load without data loss or corruption (100% round-trip fidelity)
- **SC-005**: All primary interactions (drag, click, play/pause) respond within 100 milliseconds
- **SC-006**: Application loads and becomes interactive within 3 seconds on broadband connection
- **SC-007**: Auto-save recovers user work after browser crash with no more than 30 seconds of lost changes
- **SC-008**: Users can differentiate attack and defense players at a glance through color coding
- **SC-009**: Exported videos are shareable via WhatsApp without additional conversion (file size under 25MB for typical animations)
- **SC-010**: Application functions completely offline after initial load

## Assumptions

1. **Target browsers**: Chrome 90+ and Edge 90+ are the primary targets. Firefox support is partial. Safari is not supported due to MediaRecorder limitations.
2. **Hardware**: Users have modern desktop/laptop hardware (2020 or newer) capable of smooth canvas rendering.
3. **Field dimensions**: Canvas coordinates use a 0-2000 range that maps to the visible field area.
4. **Default transition**: 2 seconds between frames unless user specifies otherwise.
5. **Export format**: WebM is the primary export format; MP4 transcoding is optional/future.
6. **No mobile**: This version targets desktop browsers; mobile/touch optimization is out of scope.
7. **Single user**: No collaborative features; projects are personal to the user's device.

## Scope Boundaries

### In Scope
- Browser-based canvas animation tool
- Drag-and-drop player positioning
- Multi-frame keyframe animation with linear interpolation
- Video export (.webm)
- Local file save/load (JSON)
- Auto-save to browser storage
- Multiple sport field backgrounds
- Basic annotations (arrows, lines)

### Out of Scope
- Cloud storage or sync
- User accounts or authentication
- Collaborative editing
- Mobile/touch optimization
- Advanced animation curves (bezier, easing)
- Team/club branding customization
- Template library of pre-built plays
- Real-time sharing or streaming
