# Feature Specification: Playback Controls

**Feature Branch**: `007-playback-controls`
**Created**: 2026-04-25
**Status**: Draft
**Input**: User description: "phase 2b Playback Controls in docs\authority\ROADMAP.md with issues detailed in docs\issues\ISSUES.md"

## Constitutional Compliance Gate *(mandatory — check before writing requirements)*

Verify this feature against [docs/authority/constitution.md](../../docs/authority/constitution.md):

- [x] **Tier alignment**: Editor is Tier 1 (Authenticated). Playback remote is only visible to logged-in coaches in the editor. No new public-facing tier required.
- [x] **No telemetry**: Remote position may be persisted locally (browser storage) — no user identity or usage events collected.
- [x] **No third-party analytics**: No tracking added.
- [x] **No hardcoded colors**: Remote UI uses design tokens (Pitch Green, Tactics White, Warm Accent). No entity color changes.
- [x] **Privacy gate**: Remote position stored in browser local storage only — no new cloud data. No PII.
- [x] **Shared canvas risk**: The floating remote appears over the canvas in the editor. Must verify `/app` (editor), `/replay/[id]` (replay), and `/share/[id]` (share) routes are unaffected. The share route already has its own FloatingRemote — no changes to that component are required by this feature.

> No constitutional conflicts identified. Constitution v3.4.2 §V.10 (Mobile-First Adaptive Architecture) explicitly supports bottom-oriented controls in the editor view.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Coach Controls Playback Without Scrolling (Priority: P1)

A coach builds an animation in the editor on their phone or tablet at the pitch. They press play to preview the drill and want to pause, step forward, or step back while the canvas is in view. Currently, the playback buttons are fixed in the document — scrolling to see the full pitch moves the controls off screen, forcing the coach to scroll back up to interact with them.

After this feature, the playback remote floats over the canvas, always visible regardless of scroll position. The coach can preview the animation and control playback without ever losing sight of the pitch.

**Why this priority**: This is the primary usability gap in PLAYBACK-001. Coaches using the app on mobile at the pitch find playback controls unreachable mid-session — breaking the core review loop. This is a pre-launch blocker for mobile coaching use.

**Independent Test**: Open the editor on a mobile device (or DevTools mobile emulation). Load an animation, scroll so the pitch canvas is visible. The playback remote should be visible without scrolling back to the top. Press play — animation plays. Press pause — animation stops.

**Acceptance Scenarios**:

1. **Given** a coach has an animation open in the editor, **When** they scroll the page, **Then** the playback remote remains visible on screen at all times
2. **Given** the playback remote is visible, **When** the coach taps/clicks play, **Then** the animation begins playing immediately
3. **Given** the animation is playing, **When** the coach taps/clicks pause, **Then** the animation stops on the current frame
4. **Given** the animation is paused, **When** the coach taps/clicks the previous frame button, **Then** the animation steps back one frame
5. **Given** the animation is paused, **When** the coach taps/clicks the next frame button, **Then** the animation advances one frame
6. **Given** the remote is floating, **When** it reaches the edge of the viewport, **Then** it does not move off screen (stays within bounds)

---

### User Story 2 — Coach Repositions Remote to Avoid Covering the Pitch (Priority: P2)

A coach is reviewing a specific area of the pitch and the floating remote is positioned over an entity they want to see clearly. They drag the remote to a different corner of the screen. The remote stays in the new position for the rest of the session.

**Why this priority**: The remote's default position will occasionally overlap important pitch content. Draggability gives coaches control without requiring a fixed position that works for every animation. This is a quality-of-life improvement, not a blocker.

**Independent Test**: Open the editor on a desktop browser. Drag the playback remote from its default position to the top-right corner. Release — the remote stays in the new position. Navigate away and return — the remote reappears at the last known position.

**Acceptance Scenarios**:

1. **Given** the floating remote is visible, **When** the coach drags it, **Then** it moves with the drag gesture and settles where released
2. **Given** the remote has been repositioned, **When** the coach refreshes the page or reopens the editor, **Then** the remote reappears at the last saved position
3. **Given** the coach drags the remote toward the edge of the viewport, **When** they release, **Then** the remote snaps to stay fully within the visible area (does not go off screen)
4. **Given** a small mobile viewport, **When** the coach drags the remote, **Then** drag remains responsive and the remote stays within the safe area (accounting for mobile browser chrome)

---

### User Story 3 — Coach Sees Frame Progress at a Glance (Priority: P2)

While reviewing a drill, the coach wants to know which frame they are on and how many frames are in the animation. The remote displays "3 / 7" (current frame / total frames) so the coach has spatial context without counting button presses.

**Why this priority**: Frame position context reduces confusion during review. Useful but not blocking launch.

**Independent Test**: Open an animation with at least 3 frames. The playback remote shows "1 / N" initially. Press next frame — it updates to "2 / N". Press play — the counter increments as frames advance.

**Acceptance Scenarios**:

1. **Given** an animation is open in the editor, **When** the remote is visible, **Then** it displays the current frame number and total frame count (e.g., "2 / 5")
2. **Given** the animation is playing, **When** each frame advances, **Then** the frame counter updates in real time
3. **Given** a single-frame animation, **When** the remote is visible, **Then** prev/next frame buttons are disabled (no frames to navigate to)

---

### Edge Cases

- What if the animation has only one frame? → Prev/next buttons are disabled; play/pause still functions (though nothing will appear to change)
- What if the coach is a guest (Tier 0)? → The floating remote applies only to the editor (Tier 1 authenticated view). Guests using the local editor have the same controls — the remote is visible regardless of auth state since the editor is accessible to guests
- What happens if the viewport is resized while the remote is positioned? → The remote re-checks its position and snaps back into bounds if now off screen
- What if the remote position stored in local storage refers to a position now off screen (e.g., device rotated)? → Remote falls back to default position
- Touch vs pointer: drag must work on both mouse (desktop) and touch (mobile)

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The playback remote in the editor MUST remain visible at all times regardless of page scroll position
- **FR-002**: The remote MUST provide play, pause, previous frame, and next frame controls
- **FR-003**: The remote MUST display the current frame number and total frame count (e.g., "2 / 5")
- **FR-004**: Previous and next frame buttons MUST be disabled when there is no frame in that direction (first frame: prev disabled; last frame: next disabled)
- **FR-005**: The remote MUST be draggable — coaches can reposition it anywhere within the viewport
- **FR-006**: The remote MUST never move fully off screen; it MUST snap back into viewport bounds on drag release
- **FR-007**: The remote's last known position MUST persist across page loads (browser session storage is sufficient; cloud sync not required)
- **FR-008**: If the stored position is outside the current viewport (e.g., after screen resize or orientation change), the remote MUST reset to its default position
- **FR-009**: The remote MUST respond to both pointer (mouse) and touch events for drag and button interactions
- **FR-010**: The remote's default position MUST be bottom-centre or bottom-right of the canvas area, above the safe area on mobile

### Frontend Requirements

- **UI-001**: Remote component lives in `src/features/animation/components/` (reusable if appropriate)
- **UI-002**: Styling uses Tailwind classes; design tokens (Pitch Green, Tactics White, Warm Accent)
- **UI-003**: Sharp corners only (`rounded-none`); hard-edged shadow permitted for depth (Constitution §IV amendment CA-2026-003)
- **UI-004**: All interactive elements (buttons) MUST meet minimum 44×44px touch target size (mobile-first)
- **UI-005**: Remote background uses `bg-black/70` or equivalent dark semi-transparent treatment so the pitch content remains visible beneath it
- **UI-006**: Frame counter typography MUST use `font-mono` for fixed-width digit layout (prevents layout shift as numbers change)
- **UI-007**: The drag handle or entire remote surface acts as the drag initiator — a visible grip indicator is optional but recommended

### Key Entities

- **Playback Remote**: The floating, draggable UI panel containing playback controls. Positioned absolutely within the editor viewport. Stateless beyond position (playback state is owned by the existing animation store).
- **Remote Position**: Stored in browser local/session storage as `{ x: number, y: number }`. Relative to viewport, validated on load.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A coach on mobile can play, pause, and step through frames without scrolling — all controls reachable with the pitch canvas visible
- **SC-002**: The remote can be dragged to any visible area of the screen and stays where placed — zero test cases where it escapes the viewport
- **SC-003**: Frame counter ("N / M") updates within one animation frame (~16ms) of each frame change — no visible lag
- **SC-004**: Remote position persists across a browser refresh — remote appears at the saved position, not the default, on the next visit
- **SC-005**: `npm run lint && npx tsc --noEmit` passes with zero new errors after implementation
- **SC-006**: All routes verified unaffected: `/app` (editor with remote), `/replay/[id]` (no remote change), `/share/[id]` (existing FloatingRemote unchanged)

---

## Assumptions

- The `FloatingRemote` component already exists for the share view (`/share/[id]`). This spec does not require changing that component. The editor remote may reuse the same component or be a variant — that is an implementation decision.
- Playback state (current frame, total frames, is-playing) is already managed by the existing animation Zustand store. This feature does not add new global state — the remote reads from and writes to the existing store.
- "Sticky" / "always visible" is implemented via `position: fixed` (viewport-relative), not `position: sticky` (scroll-relative). The remote floats over the page regardless of scroll depth.
- Session-only position persistence (sessionStorage) is acceptable for v1. Cross-session persistence (localStorage) is a nice-to-have and should be implemented if trivial.
- The editor currently has playback controls somewhere (sidebar or toolbar). This feature replaces or supplements them — the decision is implementation-level and does not need to be specified here. The spec only requires that the floating remote provides the full control set.
- The `/replay/[id]` route has its own viewer (ReplayViewer) that is not affected by this feature.
