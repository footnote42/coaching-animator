# Feature Specification: Editor Workspace Remodel

**Feature Branch**: `012-editor-workspace-remodel`
**Created**: 2026-04-30
**Status**: Draft
**Issues resolved**: EDITOR-013, PLAYBACK-001
**Phase**: 2i (ROADMAP v3.1)

## Clarifications

### Session 2026-04-30

- Q: What is the visual treatment when the sidebar is collapsed? → A: Zero-width — sidebar disappears entirely; a small toggle chevron/button remains on the canvas left edge.
- Q: Is FrameStrip access on mobile in scope for 2i or formally deferred? → A: Deferred — floating remote (add frame, prev/next) is sufficient for 2i; a swipe-accessible FrameStrip on mobile is tracked as FEAT-012 for a future spec.
- Q: Where is the Focus Mode toggle placed? → A: Overlaid on the canvas top-right corner — a small button, always visible, independent of sidebar and footer state.

---

## Constitutional Compliance Gate *(mandatory — check before writing requirements)*

Verify this feature against [docs/authority/constitution.md](../../docs/authority/constitution.md):

- [x] **Tier alignment**: Tier 0 (Guest) and Tier 1 (Authenticated) — the editor is used at both tiers.
  Layout changes apply equally; no tier-gated controls are added.
- [x] **No telemetry**: No user identity, device fingerprints, or usage analytics collected.
  Sidebar collapsed state and remote position use localStorage — no server-side persistence.
- [x] **No third-party analytics**: No Sentry, Mixpanel, GA, or similar SDKs added
- [x] **No hardcoded colors**: Mobile drawer and sidebar toggle use design tokens only.
  EntityColors not involved.
- [x] **Privacy gate**: No new data transmitted to the server. localStorage keys are
  device-local and contain only UI state (boolean, coordinates).
- [x] **Shared canvas risk**: Editor.tsx is touched (sidebar toggle, Focus Mode, progression
  panel cap). Stage.tsx resize behavior must be verified. `/app` (editor) must be tested
  end-to-end; `/replay/[id]` and `/share/[id]` are unaffected (separate components).

> No constitutional violations identified. Proceed.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Coach wants more canvas space on desktop (Priority: P1)

A coach building a complex drill on a 13" laptop finds the left sidebar takes up a third of
the screen. They click the sidebar collapse toggle and the canvas immediately expands. The
toolbar icons are still reachable via re-expanding the sidebar. The collapsed state survives
a page refresh.

**Why this priority**: The canvas is the primary work surface. Anything that expands it
directly improves authoring quality.

**Independent Test**: On a 1280×800 viewport, collapse the sidebar. Measure canvas width
before and after. Refresh the page — sidebar should remain collapsed.

**Acceptance Scenarios**:

1. **Given** the sidebar is expanded, **When** the coach clicks the collapse toggle,
   **Then** the sidebar collapses and the canvas width increases to fill the freed space
2. **Given** the sidebar is collapsed, **When** the coach clicks the toggle again,
   **Then** the sidebar expands and the canvas returns to its previous width
3. **Given** the coach collapsed the sidebar and refreshed the page,
   **When** the editor loads, **Then** the sidebar opens in collapsed state

---

### User Story 2 — Coach enters Focus Mode to present a drill (Priority: P1)

Before a training session a coach opens their drill on a tablet and wants to show it to the
squad on a projected screen. They activate Focus Mode — the sidebar, footer, and any
progression header disappear, and the canvas fills the entire viewport. Players can see the
full pitch. The coach can exit Focus Mode to resume editing.

**Why this priority**: ROADMAP exit criterion for 2i: "canvas reclaims ≥85% of viewport in
Focus Mode on desktop". This is a named deliverable.

**Independent Test**: Activate Focus Mode on a 1440×900 viewport. Measure canvas area as a
percentage of viewport area.

**Acceptance Scenarios**:

1. **Given** the editor is in normal mode, **When** the coach activates Focus Mode,
   **Then** the sidebar, footer timeline, and progression panel header are hidden and the
   canvas fills ≥85% of the viewport
2. **Given** Focus Mode is active, **When** the coach deactivates it,
   **Then** all hidden panels reappear in their previous state (sidebar collapsed/expanded,
   footer visible)
3. **Given** Focus Mode is active, **When** the coach interacts with the canvas (selecting
   entities, playing), **Then** all canvas interactions work identically to normal mode

---

### User Story 3 — Coach uses the editor on a mobile device (Priority: P1)

A coach at the pitch opens the editor on their phone. Instead of a banner saying "use a
desktop", they see the canvas with a bottom handle for the tool drawer. They pull up the
drawer to add players, then dismiss it to return full attention to the canvas. The floating
remote gives them playback and frame controls without needing the footer.

**Why this priority**: ROADMAP exit criterion: "usable layout on mobile (no MobileWarning
at <768)". The current MobileWarning actively blocks mobile use.

**Independent Test**: On a 375×812 viewport, open the editor. Verify no MobileWarning
banner. Open the mobile drawer. Verify entity palette is accessible.

**Acceptance Scenarios**:

1. **Given** a viewport narrower than 768px, **When** the editor loads,
   **Then** the MobileWarning banner is NOT shown and the canvas is visible
2. **Given** a mobile viewport, **When** the coach taps the drawer handle,
   **Then** a bottom drawer slides up with access to entity creation and project actions
3. **Given** the drawer is open, **When** the coach taps outside it or the handle,
   **Then** the drawer closes and the canvas is fully visible again
4. **Given** a mobile viewport, **When** the coach needs to add a frame or change pace,
   **Then** all frame controls are accessible via the floating remote without scrolling

---

### User Story 4 — Coach controls frames without scrolling (Priority: P2)

A coach on a 768px-tall laptop or tablet is mid-drill and needs to add a frame and toggle
loop. Currently they must scroll down to the footer to access these controls. With the
expanded floating remote, all frame controls are within reach without any scrolling.

**Why this priority**: EDITOR-013 (High severity). The fixed footer requires scrolling on
shorter viewports, breaking the authoring flow.

**Independent Test**: On a 768px-tall viewport with the footer scrolled out of view,
verify that add-frame, pace, loop toggle, and ghost toggle are all accessible via the
floating remote.

**Acceptance Scenarios**:

1. **Given** the expanded floating remote is visible, **When** the coach taps Add Frame,
   **Then** a new frame is added (same behaviour as the footer Add Frame button)
2. **Given** the expanded floating remote is visible, **When** the coach changes pace,
   **Then** playback speed changes (0.5×, 1×, 2×)
3. **Given** the expanded floating remote is visible, **When** the coach toggles Loop,
   **Then** looping is toggled on/off (same behaviour as footer loop button)
4. **Given** the expanded floating remote is visible, **When** the coach toggles Ghost,
   **Then** ghost mode is toggled on/off (same behaviour as footer ghost button)

---

### Edge Cases

- **Sidebar collapse + Focus Mode**: entering Focus Mode from a collapsed-sidebar state
  still hides all chrome; exiting restores collapsed state (not expanded).
- **Progression panel with many progressions**: with the max-height cap, the panel becomes
  scrollable rather than growing unbounded. The cap must not hide the add-progression button.
- **Floating remote expansion on very small screens (320px)**: all controls must remain
  reachable; overflow must not clip controls outside the viewport.
- **Mobile drawer and FloatingRemote coexistence**: the drawer must not cover the floating
  remote when both are visible; the remote must remain draggable.
- **Guest tier on mobile**: the drawer must show the same guest-tier entity limits as
  desktop. No tier changes introduced.

---

## Requirements *(mandatory)*

### Functional Requirements

**Collapsible Sidebar**
- **FR-001**: The sidebar MUST have a toggle control that collapses and expands it
- **FR-002**: When collapsed, the sidebar collapses to zero width — panels (ProjectActions,
  EntityPalette, EntityProperties) are not visible; the canvas expands to fill the freed space
- **FR-003**: The sidebar collapsed/expanded state MUST persist across page refreshes
  (device-local storage, no server round-trip)
- **FR-004**: A toggle chevron/button MUST remain visible on the canvas left edge when the
  sidebar is collapsed, providing the sole re-entry point to expand the sidebar

**Focus Mode**
- **FR-005**: The editor MUST provide a Focus Mode toggle button overlaid on the canvas
  top-right corner; it MUST remain visible regardless of sidebar state, Focus Mode state,
  or viewport size, and MUST hide the sidebar, footer timeline, and progression panel header
  when activated, allowing the canvas to fill ≥85% of the viewport
- **FR-006**: Entering Focus Mode MUST NOT end or reset any in-progress playback
- **FR-007**: Exiting Focus Mode MUST restore all previously visible panels in their
  exact previous state (sidebar collapsed/expanded, footer visible, progression panel state)
- **FR-008**: The floating remote MUST remain visible and functional in Focus Mode

**Progression Panel**
- **FR-009**: The progression panel MUST have a maximum height cap; when the number of
  progressions exceeds the cap, the panel MUST scroll internally
- **FR-010**: The add-progression control MUST always be visible (not scrolled off) when
  the progression panel is at max height

**Mobile Drawer (replaces MobileWarning)**
- **FR-011**: On viewports narrower than 768px, the MobileWarning banner MUST be removed
- **FR-012**: On viewports narrower than 768px, the editor MUST show a bottom drawer
  that provides access to: entity creation palette and project actions (save, share)
- **FR-013**: The mobile drawer MUST be openable and closable via a visible handle or button
- **FR-014**: Dismissing the drawer MUST return full canvas visibility

**Expanded Floating Remote (EDITOR-013)**
- **FR-015**: The floating remote MUST include controls for: add frame, playback pace
  (0.5×/1×/2×), loop toggle, ghost mode toggle — in addition to existing prev/play/next
- **FR-016**: All expanded controls MUST match the behaviour of the equivalent footer controls
- **FR-017**: The floating remote MUST remain draggable and viewport-bounded after expansion

### Frontend Requirements

- **UI-001**: Sidebar toggle and collapse animation use design tokens only; no hardcoded
  pixel values for the collapsed width beyond what is inherent to the collapse
- **UI-002**: Focus Mode transition uses a CSS animation (slide/fade); duration ≤200ms
- **UI-003**: The mobile drawer uses design tokens; no hardcoded colors or bg-white
- **UI-004**: The mobile drawer does NOT overlap the floating remote when both are visible
- **UI-005**: The Konva Stage is notified of container resize after any layout change
  (sidebar toggle, Focus Mode enter/exit) so canvas dimensions recalculate correctly
- **UI-006**: The expanded floating remote respects safe-area insets on mobile
  (existing SafeArea handling preserved)

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In Focus Mode on a 1440×900 desktop viewport, the canvas occupies ≥85% of
  the viewport area
- **SC-002**: On a 375px-wide viewport, the editor loads with no warning banner and a
  visible canvas
- **SC-003**: On a 375px-wide viewport, the mobile drawer opens and provides access to
  entity creation in two taps or fewer
- **SC-004**: The progression panel never increases the editor height regardless of how many
  progressions exist (max-height is capped and internal scrolling takes over)
- **SC-005**: All frame controls (add frame, pace, loop, ghost) are reachable via the
  floating remote without scrolling on a 768px-tall viewport
- **SC-006**: Sidebar collapsed state survives a hard refresh (Ctrl+Shift+R)
- **SC-007**: `npm run lint && npx tsc --noEmit` passes with zero new errors
- **SC-008**: All acceptance scenarios for US1–US4 pass in unit or E2E tests
- **SC-009**: `/replay/[id]` and `/share/[id]` routes are unaffected (no visual regressions)

---

## Assumptions

- The existing `EditorFloatingRemote` component is the base for EDITOR-013 expansion;
  new controls extend it rather than creating a second floating element.
- "Focus Mode" is triggered by a clearly labeled button in the UI (not a keyboard shortcut
  only) — this is a pitch-side tool used by coaches who may not be keyboard power users.
- Sidebar collapsed state and floating remote position are stored in `localStorage` under
  project-namespaced keys; no Supabase schema changes are required.
- The mobile drawer contains a mobile-optimised subset of the sidebar panels, not a
  pixel-perfect copy. EntityProperties can be omitted from the initial drawer (entity
  editing on mobile is a secondary use case).
- The progression panel max-height is determined during implementation by measuring
  2–3 progression pill rows; the exact pixel value is not a spec concern.
- On mobile (<768px), the footer (PlaybackControls + FrameStrip) is hidden; the expanded
  floating remote provides equivalent coverage (prev/next/add-frame/pace/loop/ghost).
  A swipe-accessible FrameStrip for mobile is explicitly out of scope for 2i and tracked
  as FEAT-012 for a future spec.
- `useShareCanvasSize` (used by ShareViewer) is not touched; canvas sizing in the editor
  uses a different resize path.
