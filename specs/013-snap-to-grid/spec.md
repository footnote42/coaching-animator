# Feature Specification: Snap-to-Grid

**Feature Branch**: `013-snap-to-grid`
**Created**: 2026-05-01
**Status**: Draft
**Input**: User description: "Phase 2j — Snap-to-Grid"

## Constitutional Compliance Gate *(mandatory — check before writing requirements)*

- [x] **Tier alignment**: Tier 1 (Authenticated) — editing is a Tier 1 capability; snap behaviour is local to the session and requires no new stored data
- [x] **No telemetry**: Feature tracks no user identity, device fingerprints, or usage analytics
- [x] **No third-party analytics**: No new SDKs added
- [x] **No hardcoded colors**: Grid overlay uses design tokens; entity colors are unaffected
- [x] **Privacy gate**: No new data stored — snap state is UI-only session preference
- [x] **Shared canvas risk**: This feature touches `Canvas/` (EntityLayer, Stage, Field). All three routes — `/app`, `/replay/[id]`, `/share/[id]` — must be tested. Snap dragging is editor-only; replay and share are read-only and unaffected by snap state, but canvas rendering must remain stable.

> No constitutional conflicts identified.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Entities snap to grid while dragging (Priority: P1)

A coach drags a player, cone, or ball across the field. When snap-to-grid is active, the entity "jumps" to the nearest grid intersection as they drag, making it easy to place entities in aligned, evenly spaced positions without pixel-level precision.

**Why this priority**: The core value of snap-to-grid is precise, effortless positioning. Without drag-snap, the feature is not useful.

**Independent Test**: Open `/app`, create an animation, enable snap-to-grid, drag a player — verify it lands on a grid intersection.

**Acceptance Scenarios**:

1. **Given** snap-to-grid is enabled and a player is on the canvas, **When** the coach drags the player, **Then** the player's position snaps to the nearest grid point on each drag movement
2. **Given** snap-to-grid is enabled, **When** the coach releases a dragged entity, **Then** the entity's final position is exactly on a grid intersection (not mid-cell)
3. **Given** snap-to-grid is disabled, **When** the coach drags an entity, **Then** the entity moves freely with no snapping

---

### User Story 2 — Toggle snap-to-grid on and off (Priority: P1)

A coach wants to place some entities freely (e.g., following a curved run line) and others precisely (e.g., setting up a structured drill). They can toggle snap-to-grid on and off from the editor toolbar without interrupting their workflow.

**Why this priority**: A mandatory-always-on grid would be a regression for free-form diagrams. Toggle is required for the feature to be net-positive.

**Independent Test**: Open `/app`, verify a snap toggle control is present, toggle it, and confirm entity drag behaviour changes accordingly.

**Acceptance Scenarios**:

1. **Given** the editor is open, **When** the coach activates the snap toggle, **Then** snap-to-grid becomes active and the grid overlay appears on the field
2. **Given** snap-to-grid is active, **When** the coach deactivates the toggle, **Then** entities drag freely and the grid overlay disappears
3. **Given** the coach toggles snap on and off multiple times, **Then** each toggle state is consistent and no entities are displaced

---

### User Story 3 — Grid overlay provides visual alignment aid (Priority: P2)

When snap-to-grid is active, a subtle grid is drawn over the pitch so the coach can see the snap points before dragging. The grid is visible enough to guide placement but unobtrusive enough not to obscure the pitch markings or entity labels.

**Why this priority**: The grid visual confirms to the coach that snap is active and shows where entities will land. Without it, snap behaviour feels unpredictable.

**Independent Test**: Enable snap-to-grid and verify a grid pattern is visible on the canvas field.

**Acceptance Scenarios**:

1. **Given** snap-to-grid is enabled, **When** the editor canvas renders, **Then** a grid of evenly spaced lines is drawn over the pitch
2. **Given** snap-to-grid is disabled, **When** the editor canvas renders, **Then** no grid lines are visible
3. **Given** the grid is visible, **Then** the grid lines do not obscure pitch markings (centre circle, try lines, etc.) — they render at low opacity behind entities

---

### User Story 4 — Snap state persists across frame changes (Priority: P2)

A coach enables snap-to-grid and works across multiple animation frames (keyframes). The snap setting remains active as they navigate frames, so they do not need to re-enable it on every frame.

**Why this priority**: Resetting snap state per frame would break the editing flow in multi-frame animations.

**Independent Test**: Enable snap-to-grid, advance to a new frame, confirm the toggle remains active.

**Acceptance Scenarios**:

1. **Given** snap-to-grid is enabled on frame 1, **When** the coach advances to frame 2, **Then** snap-to-grid remains enabled
2. **Given** snap-to-grid is disabled on frame 1, **When** the coach navigates to any frame, **Then** snap remains disabled

---

### Edge Cases

- What happens when an entity is very close to two equidistant grid points? → `Math.round` is used; ties round to the higher grid index (right/down), not top-left
- How does snap behave on mobile touch-drag? → Snap logic applies identically; touch drag uses the same entity drag handler
- Does snap affect annotation drawing (arrows, lines)? → No — snap applies only to entity placement, not free-draw annotations
- Replay/share routes must remain visually unchanged — no grid overlay, no snap logic active

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST snap entity positions to the nearest grid intersection when snap-to-grid is active and an entity is dragged
- **FR-002**: System MUST provide a toggle control in the editor to enable and disable snap-to-grid
- **FR-003**: Snap-to-grid MUST default to off when the editor first loads
- **FR-004**: Snap state MUST persist in the editor session across frame navigation (not reset per frame)
- **FR-005**: Snap MUST NOT affect annotation drawing tools (arrows, free-draw lines)
- **FR-006**: Snap MUST NOT be active in replay or share routes — those routes are read-only and must render identically to current behaviour

### Frontend Requirements

- **UI-001**: Snap toggle lives in the normal editor toolbar (`EditorFloatingRemote` or equivalent); it is NOT shown in Focus Mode — snap state (on or off) carries over unchanged when entering or exiting Focus Mode
- **UI-002**: Toggle renders in two states: inactive (grid off) and active (grid on) — visually distinguishable without relying on colour alone (icon and/or label change)
- **UI-003**: Sharp corners only (`rounded-none`); no soft drop shadows; consistent with existing editor UI aesthetic
- **UI-004**: Grid overlay renders inside the Konva canvas layer, behind entities, at low opacity so pitch markings remain legible
- **UI-005**: Grid cell size is proportional to the pitch dimensions so the grid looks consistent across different field types (rugby, football, futsal)

### Canvas / Animation Requirements

- **CV-001**: Canvas changes must be tested on `/app` (editor), `/replay/[id]` (replay), and `/share/[id]` (share)
- **CV-002**: `ShareViewer` uses `position:fixed inset:0` — do not change its layout
- **CV-003**: Entity colors MUST use `EntityColors.resolve()` — grid overlay uses a neutral design token, never a hardcoded hex
- **CV-004**: Snap calculation MUST occur in the drag event handler (position clamped to grid before updating entity state), not as a post-move correction; the entity's center point is aligned to the nearest grid intersection
- **CV-005**: Grid overlay MUST be a dedicated Konva layer rendered below the entity layer so it does not interfere with hit detection or entity interaction
- **CV-006**: Grid density defaults to 16 columns × 12 rows, stored as a named constant; adjusting the constant requires no changes to component logic

### Key Entities

- **Snap State**: A boolean UI preference (active / inactive) held in editor session state; not persisted to the database
- **Grid Cell**: Derived geometry — pitch width / column count and pitch height / row count; not stored, computed at render time

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A coach can enable snap-to-grid with a single interaction and immediately see the grid overlay on the pitch
- **SC-002**: When snap is active, every entity drag-release results in a position exactly on a grid intersection — no entity lands mid-cell
- **SC-003**: Snap state persists unchanged when navigating between all frames of a multi-frame animation
- **SC-004**: Replay (`/replay/[id]`) and share (`/share/[id]`) routes render identically before and after this feature — no visible grid, no changed layout
- **SC-005**: `npm run lint && npx tsc --noEmit` passes with no new errors introduced by this feature
- **SC-006**: All P1 acceptance scenarios are covered by unit or E2E tests

---

## Clarifications

### Session 2026-05-01

- Q: Should the snap toggle be accessible in Focus Mode? → A: Toggle lives in the normal editor toolbar only; snap state (on or off) persists unchanged when entering or exiting Focus Mode.
- Q: What is the default grid density? → A: 16 columns × 12 rows; density is a named constant and can be adjusted without component changes once the system is established.
- Q: Which point on an entity aligns to the grid intersection when snapping? → A: The entity's center point snaps to the nearest grid intersection.

---

## Assumptions

- Grid density defaults to 16 columns × 12 rows, stored as a named constant; it can be tuned without touching component logic once the system is established. A user-adjustable grid size is out of scope for Phase 2j
- Snap state is session-only and is not persisted to the database or URL — there is no requirement to restore snap state on page reload
- The existing drag handling in `EntityLayer` (or equivalent) already fires positional update callbacks that can be intercepted to apply snap rounding
- Mobile touch events share the same drag pipeline as mouse events via Konva's unified pointer model; no separate mobile snap implementation is required
- Snap applies uniformly to all entity types (players, cones, balls); per-entity snap override is out of scope
