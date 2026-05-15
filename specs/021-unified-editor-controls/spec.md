# Feature Specification: Unified Editor Controls

**Feature Branch**: `021-unified-editor-controls`  
**Created**: 2026-05-15  
**Status**: Draft  
**Input**: User description: "EDITOR-013 — Unified Floating Editor Controls: deprecate FloatingRemote, replace with accessible non-scroll editor controls for frame and timeline management."

## Constitutional Compliance Gate *(mandatory — check before writing requirements)*

Verify this feature against [docs/authority/constitution.md](../../docs/authority/constitution.md):

- [x] **Tier alignment**: Tier 1 (Authenticated) — the editor at `/app` requires authentication; no Guest (Tier 0) impact
- [x] **No telemetry**: Feature collects no user identity, device fingerprints, or usage analytics
- [x] **No third-party analytics**: No Sentry, Mixpanel, GA, or similar SDKs added
- [x] **No hardcoded colors**: Control panel uses design tokens (Tailwind config), not entity hex values — `EntityColors` service not in scope
- [x] **Privacy gate**: No new data stored; control preferences are ephemeral UI state only
- [x] **Shared canvas risk**: `FloatingRemote.tsx` lives in `Canvas/` — removal must be verified on `/app`, `/replay/[id]`, AND `/share/[id]`. The `FloatingRemote` is only rendered in the editor (`/app`), but the import graph must be audited before deletion.

> The `ShareViewer` uses `position: fixed; inset: 0` — any layout changes to the editor must not touch `ShareViewer` layout constraints.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Access All Frame Controls Without Scrolling (Priority: P1)

A coach is building a multi-frame animation in the editor on a laptop or tablet. They need to add frames, adjust playback pace, and toggle looping without scrolling the page or losing sight of the canvas. Currently the timeline controls sit below the visible viewport on most screens, forcing the coach to scroll away from the pitch.

**Why this priority**: This is the core workflow gap (EDITOR-013, severity High). Every coach using the frame-based editor is affected. Scroll friction breaks the create-and-iterate rhythm that makes the tool useful at the pitch.

**Independent Test**: Open `/app` on a 1366×768 viewport (the most common laptop screen size). All frame and timeline controls must be reachable without any vertical scroll.

**Acceptance Scenarios**:

1. **Given** the editor is open with a single frame, **When** the coach views the editor without scrolling, **Then** all controls for adding frames, setting pace, and toggling loop are visible and interactive
2. **Given** the editor is open with 8 or more frames, **When** the coach views the editor without scrolling, **Then** the frame controls remain accessible regardless of the number of frames in the timeline
3. **Given** the editor is open on a mobile viewport (375px wide), **When** the coach views the editor, **Then** all frame and timeline controls are reachable without vertical scroll

---

### User Story 2 - Frame Controls Grouped and Labelled Clearly (Priority: P1)

The replacement control surface groups all frame management actions (add frame, delete frame, duplicate frame, adjust pace, toggle loop) in one cohesive panel. A coach can understand what each control does at a glance without needing to hunt across the screen.

**Why this priority**: Discoverability is essential for time-poor coaches who may use the editor infrequently. Scattered or unlabelled controls increase the chance of user error (e.g., deleting a frame accidentally).

**Independent Test**: A new user (no prior training) can add a frame, reorder it, and delete it using only the controls panel — no external documentation.

**Acceptance Scenarios**:

1. **Given** the controls panel is visible, **When** the coach inspects the controls, **Then** add frame, pace, and loop controls are grouped together under a clear section header or visual grouping
2. **Given** the coach wants to change the playback pace, **When** they interact with the pace control, **Then** a pace value is visible before and after the change (no guessing)
3. **Given** the coach hovers over or focuses a control, **When** the control label is not already visible, **Then** a tooltip or accessible label identifies the control's purpose

---

### User Story 3 - Deprecated FloatingRemote Removed Cleanly (Priority: P1)

The existing `FloatingRemote` component is fully removed from the codebase. No dead code, no disabled imports, no feature-flag shim. The editor renders correctly on all three routes after the removal.

**Why this priority**: Iterating on the existing component was explicitly ruled out (user decision, 2026-05-02). Leaving deprecated code in place creates maintenance confusion and may reintroduce broken UX in future.

**Independent Test**: After removal, `/app`, `/replay/[id]`, and `/share/[id]` all load and function correctly. A `grep` for `FloatingRemote` across the codebase returns zero results.

**Acceptance Scenarios**:

1. **Given** the `FloatingRemote` component has been removed, **When** `/app` loads, **Then** no console errors, no blank panel, and no missing control group
2. **Given** `FloatingRemote` has been removed, **When** `/replay/[id]` and `/share/[id]` load, **Then** both routes render identically to their pre-change state
3. **Given** a developer searches the codebase for `FloatingRemote`, **When** the search completes, **Then** zero import or usage references remain

---

### User Story 4 - Controls Panel Complies with Design System (Priority: P2)

The new control surface visually matches the design language of the existing editor — sharp corners, pitch-green / tactics-white palette, no soft shadows, no rounded corners. It does not introduce new visual patterns inconsistent with the coaching whiteboard aesthetic.

**Why this priority**: Visual consistency supports the "direct · tactical · grassroots" brand. A mismatched panel would undermine the editor's coherence and require rework.

**Independent Test**: A side-by-side visual comparison of the new controls panel against the existing left-sidebar panel shows consistent corner radius (zero), background color, border treatment, and typography.

**Acceptance Scenarios**:

1. **Given** the new panel is rendered, **When** inspected against `.impeccable.md` design constraints, **Then** no rounded corners, no soft drop shadows, and color matches the established palette
2. **Given** the editor is open, **When** the coach's focus is on the canvas, **Then** the controls panel does not visually compete with the canvas — it sits clearly secondary to the animation content

---

### Edge Cases

- What happens when the animation has only one frame and frame deletion is attempted? The delete control must be disabled (cannot delete the last frame) with a visible indication of why.
- How does the control surface behave if the viewport is extremely small (e.g., 320px wide)? Controls must remain accessible — collapse gracefully rather than overflow or hide.
- The editor may be used in loading or error states (e.g., animation fails to load). The control surface must not appear interactive before the animation data is ready.
- Guest (Tier 0) users cannot access `/app`. No Guest-vs-authenticated behavioral difference within the controls panel is required.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All frame management controls (add frame, delete frame, duplicate frame) MUST be reachable without vertical scroll on viewports 768px and wider
- **FR-002**: All timeline controls (playback pace, loop toggle) MUST be reachable without vertical scroll on viewports 768px and wider
- **FR-003**: On mobile viewports below 768px, all frame and timeline controls MUST be accessible (may use a tap-to-reveal drawer or similar pattern, but must not require scroll)
- **FR-004**: The existing `FloatingRemote` component MUST be removed from the codebase — no imports, no dead references, no disabled-but-present code
- **FR-005**: The replacement control surface MUST provide at minimum feature parity with the controls currently exposed by the timeline and the deprecated `FloatingRemote` (add frame, delete frame, pace control, loop toggle, play/pause)
- **FR-006**: Frame deletion MUST be disabled (with visible feedback) when only one frame remains in the animation
- **FR-007**: The replacement control surface MUST NOT alter the layout or behavior of `/replay/[id]` or `/share/[id]` routes

### Frontend Requirements

- **UI-001**: The replacement control surface lives in `src/features/animation/components/` — it is a new component, not a modification of `FloatingRemote`
- **UI-002**: Styling uses Tailwind classes with design tokens from `tailwind.config` (pitch-green, tactics-white, warm-accent)
- **UI-003**: Sharp corners only (`rounded-none`); no soft drop shadows — matches existing left sidebar panel treatment
- **UI-004**: The panel must be keyboard-navigable and all controls must have accessible labels (WCAG AA)
- **UI-005**: The panel must be position-fixed or sticky so it remains visible as canvas content grows — it does not scroll out of view
- **UI-006**: Controls must have visible focus indicators for keyboard users
- **UI-007**: The pace control must display the current pace value before and after interaction — not hidden until hovered

### Canvas / Animation Requirements

- **CV-001**: Canvas changes must be tested on `/app` (editor), `/replay/[id]` (replay), and `/share/[id]` (share)
- **CV-002**: `ShareViewer` uses `position: fixed; inset: 0` — do not alter this or introduce any wrapper that conflicts with it
- **CV-003**: Entity colors are not involved in this feature — `EntityColors.resolve()` is not required

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a 1366×768 viewport, a coach can add a frame, adjust pace, and toggle loop without any vertical scroll — zero scroll events required to reach all controls
- **SC-002**: On a 375px mobile viewport, all frame and timeline controls are reachable within 2 taps from the default editor view
- **SC-003**: A `grep -r "FloatingRemote"` across the full codebase returns zero matches after the feature ships
- **SC-004**: `/app`, `/replay/[id]`, and `/share/[id]` all pass a manual smoke test with no console errors or visual regressions after `FloatingRemote` removal
- **SC-005**: All controls in the new panel pass an accessibility check — minimum 4.5:1 contrast ratio, visible focus indicators, and accessible labels on all interactive elements
- **SC-006**: `npm run lint && npx tsc --noEmit` passes with no new errors after implementation
- **SC-007**: All acceptance scenarios in User Stories 1–3 are covered by unit or E2E tests

### Assumptions

- The left sidebar slide-out panel pattern (already in the editor) is the reference interaction model — the replacement surface mirrors this pattern on the opposite side or occupies a fixed position, but the exact layout is a planning decision
- "Frame management controls" means at minimum: add frame, delete frame. Additional controls (duplicate, reorder) are within scope if already present in the current UI; new capabilities are out of scope for this feature
- Pace control is a numeric step input or slider — the exact widget type is a planning decision, not a spec requirement
- The `FloatingRemote` is not rendered in `/replay/[id]` or `/share/[id]` (based on CLAUDE.md file mapping) — but the import graph must be confirmed during planning to avoid orphaned references
