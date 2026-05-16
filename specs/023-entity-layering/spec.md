# Feature Specification: Entity Layering Control

**Feature Branch**: `023-entity-layering`  
**Created**: 2026-05-16  
**Status**: Draft  
**Input**: User description: "FEAT-006 — Animation Layering Control: Fix entity layering order (Cones < Players < Ball) and add Send Forward/Backward controls for entities in the editor."

## Constitutional Compliance Gate *(mandatory — check before writing requirements)*

- [x] **Tier alignment**: Tier 0 (Guest) and Tier 1 (Auth) — layering is an editor concern, persisted to cloud for Tier 1
- [x] **No telemetry**: No new analytics or tracking
- [x] **No third-party analytics**: No new SDKs
- [x] **No hardcoded colors**: No entity color changes; existing `EntityColors` service unchanged
- [x] **Privacy gate**: A `zIndexOffset` integer is added to each `Entity` record — minimal, non-personal data stored alongside existing entity fields
- [x] **Shared canvas risk**: This touches `EntityLayer.tsx` — editor, replay, and share routes must all be tested

> No conflicts detected.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Automatic Type-Based Stacking (Priority: P1)

A coach places a cone and then positions a player directly on top of it. Without any manual action, the player visually appears above the cone. The coach then adds a ball on top of the player; the ball appears above the player. This stacking order is guaranteed regardless of the order entities were added to the canvas or how many times the animation has been saved and reloaded.

**Why this priority**: Correct visual layering is a prerequisite for readable tactical diagrams. An obscured ball or hidden player undermines the tool's core purpose.

**Independent Test**: Can be fully tested by visiting `/app`, adding a cone, a player, and a ball overlapping at the same position, then verifying the visual stacking order.

**Acceptance Scenarios**:

1. **Given** a frame with a cone and a player at identical coordinates, **When** the canvas renders, **Then** the player token is drawn on top of the cone.
2. **Given** a frame with a player and the ball at identical coordinates, **When** the canvas renders, **Then** the ball is drawn on top of the player.
3. **Given** a saved animation where entities were added in reverse order (ball first, then player, then cone), **When** the animation is loaded and played, **Then** the stacking order is still cone → player → ball (bottom to top).

---

### User Story 2 — Bring Forward / Send Backward in Context Menu (Priority: P1)

A coach has two overlapping attack players. The coach right-clicks the player that is currently hidden beneath the other and selects "Bring Forward". The formerly hidden player now appears on top. Later, the coach right-clicks a player already at the front of its group and sees the "Bring Forward" option is disabled, confirming there is nowhere further to go.

**Why this priority**: Coaches will frequently overlap same-type entities for tactical formations. Without per-entity z-control, the only workaround is deleting and re-adding entities, which is destructive and disruptive.

**Independent Test**: Can be fully tested by visiting `/app`, adding two overlapping players, right-clicking the back player, choosing "Bring Forward", and verifying it is now on top.

**Acceptance Scenarios**:

1. **Given** two overlapping players where player A is below player B, **When** the coach right-clicks player A and selects "Bring Forward", **Then** player A renders above player B.
2. **Given** a player already at the highest z-order within its type group, **When** the coach right-clicks it, **Then** the "Bring Forward" action is visually disabled (greyed out).
3. **Given** a player at the lowest z-order within its type group, **When** the coach right-clicks it, **Then** the "Send Backward" action is visually disabled.
4. **Given** a cone and a player overlapping, **When** the coach right-clicks the cone and selects "Bring Forward", **Then** the cone moves forward within the cone group but remains below all players (type hierarchy is never overridden).

---

### User Story 3 — Layer Order Persists Across Save, Reload, and Views (Priority: P1)

A coach adjusts the z-order of two overlapping defenders, saves the animation, then opens the replay and share links. The z-order the coach set in the editor is the z-order seen in replay and share views.

**Why this priority**: A layering fix that only lasts for the current editor session is misleading — the final shared output must match what the coach arranged.

**Independent Test**: Can be tested by setting a layer override in `/app`, saving, then opening `/replay/[id]` and `/share/[id]` and verifying the same visual order.

**Acceptance Scenarios**:

1. **Given** a layer offset applied to an entity, **When** the animation is saved to the cloud (Tier 1) and reloaded, **Then** the layer offset is preserved.
2. **Given** a layer offset applied to an entity, **When** the replay viewer renders the animation, **Then** the entity appears in the same z-order as in the editor.
3. **Given** a layer offset applied to an entity, **When** the share viewer renders, **Then** the z-order matches the editor arrangement.

---

### User Story 4 — Guest Layer Control (Priority: P2)

A guest (unauthenticated) coach uses the editor and adjusts the z-order of entities within their local session. The layering is reflected correctly during the session. When the session ends (page refresh), no layer state is persisted — consistent with Tier 0 behaviour for all other editor state.

**Why this priority**: The editor must remain fully functional for guests; layering is a core visual capability, not a gated feature.

**Independent Test**: Can be tested by opening `/app` without signing in, adjusting layer order, and verifying the canvas reflects the change within the session.

**Acceptance Scenarios**:

1. **Given** a guest user with overlapping entities, **When** the coach uses "Bring Forward", **Then** the layer change is immediately reflected in the canvas.
2. **Given** a guest user, **When** the page is refreshed, **Then** the layer offsets are not persisted (consistent with all other guest-session state).

---

### Edge Cases

- **Same-type entities with equal z-offset**: When two entities of the same type have the same `zIndexOffset`, render order falls back to creation order (stable, deterministic).
- **Entity deleted that was "on top"**: The sibling entities below it redistribute naturally; no rebalancing required.
- **Single entity of its type**: Both "Bring Forward" and "Send Backward" are disabled — there is no peer to swap with.
- **Tackle-bag and tackle-shield vs. cone layering**: Equipment types (tackle-bag, tackle-shield) are treated as the same tier as cones for the purposes of the type hierarchy.
- **Replay / share interactivity**: Layer controls are editor-only; replay and share views render the stored z-order but offer no controls.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST render entities in a fixed, immutable type hierarchy: cones and equipment (lowest) → players → ball (highest).
- **FR-002**: Within each type group, entities MUST be rendered in a deterministic order based on a per-entity layer offset value (defaulting to 0).
- **FR-003**: Users MUST be able to increase an entity's layer offset ("Bring Forward") relative to other entities in the same type group via a right-click context menu action.
- **FR-004**: Users MUST be able to decrease an entity's layer offset ("Send Backward") relative to other entities in the same type group via a right-click context menu action.
- **FR-005**: "Bring Forward" MUST be disabled when the entity already has the highest layer offset within its type group in the current frame.
- **FR-006**: "Send Backward" MUST be disabled when the entity already has the lowest layer offset within its type group in the current frame.
- **FR-007**: Layer offset values MUST be persisted as part of the entity record and survive save, reload, and cloud sync.
- **FR-008**: Entities that pre-date this feature (no stored layer offset) MUST render as if their offset is 0 — no migration required.
- **FR-009**: Cross-type layering MUST NOT be user-adjustable; a cone can never be brought above a player regardless of any offset applied.
- **FR-010**: Layer offset adjustments MUST be reflected identically in the editor, replay viewer, and share viewer.

### Frontend Requirements

- **UI-001**: "Bring Forward" and "Send Backward" actions are added to the existing `EntityContextMenu` component (`src/shared/ui/EntityContextMenu.tsx`).
- **UI-002**: Disabled actions are visually distinct (reduced opacity, no hover highlight) and do not trigger any callback.
- **UI-003**: Sharp corners only (`rounded-none`); no soft drop shadows — consistent with existing context menu style.
- **UI-004**: Action labels are "Bring Forward" and "Send Backward" (not "Bring to Front" / "Send to Back" — single-step increments only).
- **UI-005**: A divider separates the layering actions from the existing Duplicate / Delete group in the menu.

### Canvas / Animation Requirements

- **CV-001**: Canvas changes must be tested on `/app` (editor), `/replay/[id]` (replay), and `/share/[id]` (share).
- **CV-002**: `ShareViewer` layout constraints (`position: fixed; inset: 0`) must not be modified.
- **CV-003**: Entity colors MUST continue to use `EntityColors.resolve()` — no hardcoded hex values.
- **CV-004**: `EntityLayer.tsx` MUST sort entities first by type group (existing `LAYER_ORDER` map), then by `zIndexOffset` (ascending), then by creation order as a stable tiebreaker.

### Key Entities

- **Entity**: Gains one new optional field — a per-entity layer offset (integer, default 0). This value represents the entity's desired position within its type group; higher values render in front. The field is optional for backward compatibility.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A cone placed directly over a player always renders beneath the player — verifiable in editor, replay, and share with no configuration.
- **SC-002**: A coach can bring a hidden overlapping entity to the front in exactly one right-click + one menu selection.
- **SC-003**: After saving and reloading an animation, all layer offsets are identical to those set in the editor session.
- **SC-004**: "Bring Forward" and "Send Backward" are correctly disabled for entities that have no peers in their type group or are already at the boundary — zero false-positive actions possible.
- **SC-005**: `npm run lint && npx tsc --noEmit` passes with zero new errors or warnings after implementation.
- **SC-006**: All acceptance scenarios in US1–US3 are covered by automated tests.

---

## Assumptions

- The existing `LAYER_ORDER` constant in `EntityLayer.tsx` defines the canonical type hierarchy and is the reference for FR-001; it does not need to be re-specified here.
- "Bring Forward" and "Send Backward" are single-step increments (not "jump to front/back") — this keeps the interaction lightweight and reversible.
- Layer offsets are frame-global (the same entity always has the same offset in every frame of the animation). Per-frame layering is out of scope.
- No visual z-order indicator (e.g., numbered badge) is required on entities — the canvas visual order is sufficient feedback.
- Tackle-bag and tackle-shield share the equipment tier with cones for layering purposes, matching the existing `LAYER_ORDER` values in the codebase.
