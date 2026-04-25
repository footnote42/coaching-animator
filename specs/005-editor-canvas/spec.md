# Feature Specification: Editor & Canvas Credibility (Phase 2a)

**Feature Branch**: `005-editor-canvas`  
**Created**: 2026-04-25  
**Status**: Draft  
**Input**: ROADMAP.md Phase 2a — Editor & Canvas. Issues: PITCH-001, PITCH-002, EDITOR-001–009, UX-006.

---

## Constitutional Compliance Gate *(mandatory — check before writing requirements)*

Verify this feature against [docs/authority/constitution.md](../../docs/authority/constitution.md):

- [x] **Tier alignment**: All tiers (0–2) use the canvas; changes must not alter guest/auth behaviour split. Editor (Tier 1) and share/replay views (Tier 2) must continue to behave correctly.
- [x] **No telemetry**: No new user identity, device, or usage data collected.
- [x] **No third-party analytics**: No SDKs added.
- [x] **No hardcoded colors**: All entity color changes must route through `EntityColors` service (`src/features/animation/services/entityColors.ts`).
- [x] **Privacy gate**: No new data stored. Metadata pop-out (EDITOR-001) moves existing fields; no schema change required.
- [x] **Shared canvas risk**: Yes — pitch markings (PITCH-001), canvas scaling (PITCH-002), and player label changes (EDITOR-006/007) touch shared canvas components. All changes must be verified on `/app`, `/replay/[id]`, AND `/share/[id]`.

> No constitutional conflicts identified.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Correct Pitch for Coach Credibility (Priority: P1)

A head coach opens the editor to build a drill. They see a pitch with all the standard markings they recognise from a real rugby pitch: try lines, 22-metre lines, 10-metre line, halfway line, 5-metre inner side markers, and upright 'H' posts. There are no unexplained extra lines. The pitch immediately reads as a credible coaching tool, not a generic diagram.

**Why this priority**: Coaches will judge the product in the first 10 seconds. A pitch with incorrect markings destroys trust. This is a pre-launch blocker.

**Independent Test**: Navigate to `/app`. Observe the canvas. All standard rugby pitch zones are visible and correctly proportioned without needing to place any entities.

**Acceptance Scenarios**:

1. **Given** a new editor session, **When** the canvas loads, **Then** the pitch displays try lines (at both ends), 22-metre lines, 10-metre line, halfway line, 5-metre inner sideline markers, and two H-post shapes at each end.
2. **Given** the pitch is rendered, **When** a coach compares it to a standard rugby pitch diagram, **Then** no unexplained lines or artefacts are present.
3. **Given** the share view (`/share/[id]`), **When** the animation plays, **Then** the same correct pitch markings are visible.

---

### User Story 2 — Canvas Fills the Editor Window (Priority: P1)

A coach opens the editor on a large desktop monitor. The pitch canvas expands to fill the available workspace. On a smaller laptop screen, the pitch is still proportionally sized and fully visible. The coach never sees blank space where the pitch should be, nor does the pitch overflow its container.

**Why this priority**: A fixed-size canvas on a large screen wastes workspace and looks unfinished. This is a credibility and usability blocker.

**Independent Test**: Open `/app` at multiple browser window sizes (full-screen 1920×1080, 1280×800, 1440×900). The canvas adjusts to fill the available editor area each time, maintaining 4:3 aspect ratio.

**Acceptance Scenarios**:

1. **Given** the editor is open, **When** the browser window is resized, **Then** the canvas resizes proportionally without requiring a page reload.
2. **Given** the editor on a 1920×1080 screen, **When** the canvas loads, **Then** the pitch fills the available workspace without white space gaps.
3. **Given** the editor on a 1280×800 screen, **When** the canvas loads, **Then** the full pitch is visible without horizontal scroll.

---

### User Story 3 — Readable Player Tokens (Priority: P1)

A coach builds a drill with attackers and defenders. Each player token shows only a number (1, 2, 3…). A small legend on the canvas indicates which colour represents attackers and which represents defenders. When the coach views the animation on their phone at arm's length on the pitch, the numbers are clearly legible.

**Why this priority**: Player tokens with text labels ("Attacker", "Defender") create visual noise that clutters the pitch. Coaches need clean, fast-read diagrams. Mobile legibility is a pitch-side requirement.

**Independent Test**: Add 3 attackers and 3 defenders to the canvas. Verify: no text labels appear on tokens; numbers are visible; a legend is visible on the canvas; numbers remain readable on a mobile screen at reduced zoom.

**Acceptance Scenarios**:

1. **Given** a player token on the canvas, **When** it is rendered, **Then** only the player number is visible — no "Attacker" or "Defender" text.
2. **Given** both attacker and defender tokens on the canvas, **When** the canvas renders, **Then** a pitch legend is visible mapping each team colour to its role.
3. **Given** the share view on a mobile viewport, **When** the animation plays, **Then** player numbers are legible without zooming.

---

### User Story 4 — Focused Colour Choices (Priority: P2)

A coach selects a colour for a player token. They see exactly six clearly distinct colour options representing the six most common rugby team colours: red, blue, white, yellow, green, and black. They make a decision quickly without being overwhelmed by near-identical shades.

**Why this priority**: A large palette with indistinct colours causes decision paralysis and inconsistent drill designs. Six colours matches real-world rugby kit conventions.

**Independent Test**: Open entity colour picker. Count the options. Confirm each is visually distinct from all others at normal viewing size.

**Acceptance Scenarios**:

1. **Given** a player token is selected, **When** the colour picker opens, **Then** exactly six colour swatches are shown: red, blue, white, yellow, green, black.
2. **Given** the six colours are displayed, **When** a coach views them, **Then** each is immediately distinguishable from the others without hover states or labels.

---

### User Story 5 — Export Clutter Removed (Priority: P2)

A coach explores the editor sidebar. They do not see any reference to video export formats (WebM, GIF). The export panel is gone. If export options exist, only JSON is offered (for power users). The coach does not wonder whether a video export feature is available or broken.

**Why this priority**: Showing a non-functional or deprecated feature erodes trust. The export settings are a known credibility issue flagged in the pre-launch review.

**Independent Test**: Open editor sidebar. Search for "export", "WebM", "GIF". None should appear. JSON export (if present) should be clearly labelled.

**Acceptance Scenarios**:

1. **Given** the editor UI, **When** all panels and menus are examined, **Then** no WebM or GIF export options are present.
2. **Given** the editor UI, **When** all panels and menus are examined, **Then** JSON export is the only export mechanism visible (or no export panel exists).

---

### User Story 6 — Recognisable Tackle Equipment Icons (Priority: P2)

A coach adds a tackle bag or tackle shield to the canvas. The icon immediately reads as that piece of equipment — it matches the coach's mental model from a whiteboard diagram. Colours follow team conventions via the EntityColors service.

**Why this priority**: Unrecognisable icons cause coaches to distrust the tool or avoid those entities. This blocks adoption of a key coaching feature.

**Independent Test**: Add a tackle bag and a tackle shield entity. Without prompting, show the canvas to a rugby coach and ask them to name both shapes.

**Acceptance Scenarios**:

1. **Given** a tackle bag entity on the canvas, **When** a rugby coach views it, **Then** they correctly identify it as a tackle bag without prompting.
2. **Given** a tackle shield entity on the canvas, **When** a rugby coach views it, **Then** they correctly identify it as a tackle shield without prompting.
3. **Given** either entity, **When** rendered, **Then** color is applied via `EntityColors.resolve()` — no hardcoded hex values.

---

### User Story 7 — Consistent Entity Creation Buttons (Priority: P3)

A coach views the entity creation toolbar. All entity buttons (player, cone, ball, tackle bag, tackle shield) look visually consistent: same size, same hover behaviour, same icon alignment style. The toolbar reads as a designed set, not a patchwork of individual buttons.

**Why this priority**: Visual inconsistency signals unfinished UI. Low-effort polish that contributes to overall credibility. Non-blocking for launch but worth shipping with Phase 2a.

**Independent Test**: Open editor. Screenshot the entity toolbar. Compare all entity button sizes, hover states, and icon alignment.

**Acceptance Scenarios**:

1. **Given** the entity creation toolbar, **When** all buttons are visible, **Then** they are uniform in size and alignment.
2. **Given** any entity button is hovered, **When** compared to other entity buttons hovered, **Then** hover states are identical in style.

---

### User Story 8 — Team Selector Removed (Priority: P3)

A coach selects a player entity. The entity controls panel does not display a team selector control. Controls visible are only those that have a real effect on the animation.

**Why this priority**: A visible control that does nothing misleads coaches and makes the product feel unfinished. Removing it is a small, clean change.

**Independent Test**: Select a player entity. Check entity control panel. No "team" selector or team assignment UI is present.

**Acceptance Scenarios**:

1. **Given** any entity is selected in the editor, **When** the entity controls panel is displayed, **Then** no team selector control is present.

---

### User Story 9 — Animation Metadata in Dedicated Pane (Priority: P3)

A coach wants to name their animation or add a YouTube reference. These fields are accessed through a clearly labelled metadata pane (not buried in the entity sidebar). The sidebar remains focused on canvas controls (entity placement, layer management). Metadata entry feels intentional, not like an afterthought.

**Why this priority**: Sidebar clarity improves discoverability of entity controls. Moving metadata separates concerns cleanly. Non-blocking but improves overall editor UX.

**Independent Test**: Open editor. Find animation name field. It should be in a metadata pane/popup, not the main entity sidebar. Entity sidebar contains no animation-level metadata.

**Acceptance Scenarios**:

1. **Given** the editor is open, **When** the coach accesses animation metadata (name, description, YouTube link), **Then** these fields are presented in a dedicated metadata panel or popup, separate from entity controls.
2. **Given** the entity sidebar, **When** no entity is selected, **Then** no animation-level metadata fields (name, YouTube link) are visible in the sidebar.

---

### Edge Cases

- Canvas resize: What happens if the browser window is resized while an animation is playing? Playback should continue; canvas adjusts.
- Share view (Tier 2): Pitch marking corrections and label changes must render identically in `/share/[id]` — which uses `position: fixed; inset: 0` layout. The canvas must not overflow or clip.
- Guest tier (Tier 0): All visual changes (pitch, tokens, colours) apply to the guest session identically — no login required to see correct pitch markings.
- Empty canvas: Legend is still visible even when no entities are placed.
- Single-team drill: If only attackers (or only defenders) are placed, the legend still renders without error.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The pitch canvas MUST display all standard rugby field markings: try lines, 22-metre lines, 10-metre line, halfway line, 5-metre inner sideline markers, and H-shaped goalposts at each end.
- **FR-002**: The pitch canvas MUST NOT display any unexplained or incorrect lines beyond the standard markings in FR-001.
- **FR-003**: The editor canvas MUST resize responsively to fill the available browser viewport, maintaining 4:3 aspect ratio, without a page reload.
- **FR-004**: Player tokens on the canvas MUST display only a number identifier — text labels such as "Attacker" or "Defender" MUST NOT appear on the token itself.
- **FR-005**: A persistent legend MUST be displayed on the pitch canvas mapping team colours to their roles (attacker / defender).
- **FR-006**: Entity label text (player numbers, cone labels) MUST use sufficient font weight and size to be legible on a mobile screen at arm's length.
- **FR-007**: The entity colour selector MUST offer exactly six options: red, blue, white, yellow, green, and black.
- **FR-008**: All WebM and GIF export options MUST be removed from the editor UI. JSON export, if displayed, is the only permitted export format.
- **FR-009**: The team selector control MUST be removed from the entity controls panel.
- **FR-010**: Tackle bag and tackle shield entity icons MUST be redesigned to be visually recognisable as their real-world equivalents, consistent with a coaching whiteboard aesthetic.
- **FR-011**: All entity creation buttons MUST be visually consistent in size, alignment, and hover state.
- **FR-012**: Animation metadata fields (name, description, YouTube link) MUST be accessible from a dedicated metadata pane, separate from the entity controls sidebar.

### Frontend Requirements

- **UI-001**: Pitch marking changes are applied within the shared canvas components (`Canvas/Field.tsx` or equivalent) so that all three routes — `/app`, `/replay/[id]`, `/share/[id]` — automatically benefit.
- **UI-002**: The canvas legend is a non-interactive overlay within the canvas bounds; it does not obstruct entity placement in the editor.
- **UI-003**: Entity creation buttons use a single shared button variant defined in the design system (`src/shared/ui/`).
- **UI-004**: Styling uses Tailwind classes with design tokens from `tailwind.config` (pitch-green, tactics-white, warm-accent). Sharp corners only (`rounded-none`).
- **UI-005**: The metadata pane opens as a modal or slide-over; it does not replace the sidebar layout.

### Canvas / Animation Requirements

- **CV-001**: All canvas changes must be verified on `/app` (editor), `/replay/[id]` (replay), and `/share/[id]` (share).
- **CV-002**: `ShareViewer` uses `position:fixed inset:0` — layout must not be altered. Canvas resizing logic in the editor must not affect `useShareCanvasSize`.
- **CV-003**: All entity and icon colour assignments MUST use `EntityColors.resolve()` — no hardcoded hex values.
- **CV-004**: The editor canvas resize observer pattern MUST follow the existing `useShareCanvasSize` hook design, adapted for the editor context.
- **CV-005**: Pitch markings MUST be implemented as SVG or canvas vector shapes — not bitmap images — so they scale cleanly at all resolutions.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A rugby coach viewing the pitch for the first time correctly identifies all standard markings (try lines, 22m, 10m, halfway, H posts) without prompting.
- **SC-002**: The editor canvas fills the available workspace on screens from 1280px wide upward without horizontal scroll or layout overflow.
- **SC-003**: Player tokens display only a number — zero instances of "Attacker" or "Defender" text visible on any player token on canvas.
- **SC-004**: Colour picker displays exactly six swatches; each is immediately distinguishable from all others at normal desktop zoom.
- **SC-005**: No WebM or GIF export UI is reachable from any editor route.
- **SC-006**: Tackle bag and tackle shield icons are correctly identified without prompting by at least one rugby coach during manual review.
- **SC-007**: All entity creation buttons pass a visual consistency audit (same size, hover state, icon alignment) with zero exceptions.
- **SC-008**: `npm run lint && npx tsc --noEmit` passes with no new errors introduced by Phase 2a changes.
- **SC-009**: All acceptance scenarios above are manually verified on `/app`, `/replay/[id]`, and `/share/[id]`.

---

## Assumptions

- **Export decision deferred**: The question of whether a future export format will replace WebM/GIF is explicitly deferred to FEAT-008 (Phase 3–4). This spec only removes the current broken UI.
- **Team selector wired in Phase 4**: Removing the team selector (FR-009) does not preclude re-introducing it with full functionality in a later phase. The removal is a clean placeholder.
- **Metadata pane is a UI reorganisation only**: No database schema changes are required for EDITOR-001. The animation name and YouTube link already exist in storage; this is a display relocation.
- **Legend design is minimal**: The pitch legend is a simple colour-swatch + label pair (e.g., a red dot + "Attack", blue dot + "Defence"). Advanced legend designs (e.g., animated, interactive) are out of scope.
- **EDITOR-002 (Share Button)**: The share button fix is referenced in Phase 2a issues but is the primary concern of Phase 2c (Share Workflow). This spec notes the dependency; implementation may be deferred to the 2c spec to avoid scope overlap.
- **Striped/hooped token patterns**: EDITOR-009 notes a stretch goal for striped patterns. This is explicitly out of scope for Phase 2a — the six solid colours are the deliverable.

---

## Dependencies

- **Shared canvas components**: `Canvas/Stage.tsx`, `Canvas/Field.tsx`, `Canvas/PlayerToken.tsx`, `Canvas/EntityLayer.tsx` — changes here affect all three routes.
- **EntityColors service**: `src/features/animation/services/entityColors.ts` — must be the source of truth for all new/revised entity colours.
- **`useShareCanvasSize`**: Pattern to be mirrored for editor canvas scaling (PITCH-002).
- **Phase 2c cross-reference**: EDITOR-002 (Share Button) is listed in Phase 2a issues but overlaps with Phase 2c scope. Coordinate with the 2c spec before implementing.
