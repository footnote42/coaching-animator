# Feature Specification: Notebook Tab Navigation

**Feature Branch**: `022-notebook-tab-nav`
**Created**: 2026-05-16
**Status**: Draft

---

## Constitutional Compliance Gate

- [x] **Tier alignment**: All tiers — navigation is global; Guest (Tier 0) sees Home, Gallery, Create; Authenticated (Tier 1) also sees My Playbook
- [x] **No telemetry**: Visit order stored in browser-local storage only; no user-identifiable data collected or transmitted
- [x] **No third-party analytics**: N/A — no new SDKs
- [x] **No hardcoded colors**: Navigation palette is UI chrome, not canvas entities — the `EntityColors` service constraint does not apply here
- [x] **Privacy gate**: One localStorage key stores tab visit order (array of section IDs). No PII. No server storage.
- [x] **Shared canvas risk**: No — this feature touches Navigation only; `Canvas/`, `Stage.tsx`, `Field.tsx`, `PlayerToken.tsx`, `EntityLayer.tsx`, `AnnotationLayer.tsx` are not modified

---

## User Scenarios & Testing

### User Story 1 — Identify Active Section at a Glance (Priority: P1)

A coach arrives at any page and can immediately identify which section they are in from the visual state of the navigation tabs, without reading any page content or heading.

**Why this priority**: Core navigation legibility — the feature delivers no value unless the active state is unambiguous.

**Independent Test**: Open any routed page and verify the correct tab appears visually "open".

**Acceptance Scenarios**:

1. **Given** I navigate to the Gallery page, **When** I look at the top navigation, **Then** the Gallery tab appears raised, connected to the page body (no dividing line), and distinctly separated from the receded inactive tabs.
2. **Given** I navigate to the Create page, **When** I look at the top navigation, **Then** the Create tab is visually open and the other tabs are receded behind it.
3. **Given** I am unauthenticated, **When** I look at the navigation, **Then** Home, Gallery, and Create tabs are visible; My Playbook tab is absent.
4. **Given** I am authenticated, **When** I look at the navigation, **Then** all four tabs (Home, Gallery, My Playbook, Create) are present.

---

### User Story 2 — Per-Section Colour Identity (Priority: P1)

Each section has a distinct colour that makes it immediately recognisable. Active and inactive tabs both show their section colour — the active tab is full-brightness; inactive tabs are slightly receded but still colour-identifiable.

**Why this priority**: Colour identity is load-bearing for the notebook metaphor; tabs without section colours are just shapes.

**Independent Test**: Visit each of the four sections in turn and verify each tab colour matches its assignment.

**Acceptance Scenarios**:

1. **Given** I am on the Gallery section, **When** I look at the active tab, **Then** it shows amber (`#D97706`).
2. **Given** I am on My Playbook, **When** I look at the active tab, **Then** it shows pitch green (`#1A3D1A`).
3. **Given** I am on Create, **When** I look at the active tab, **Then** it shows navy (`#1E40AF`).
4. **Given** I am on Home, **When** I look at the active tab, **Then** it shows teal (`#0F766E`).
5. **Given** a tab is inactive, **When** I look at it, **Then** it is visually receded (shorter, slightly dimmed) but its section colour is still visible.

---

### User Story 3 — Tab Layering Reflects Visit History (Priority: P2)

Inactive tabs stack in the order they were last visited. The most recently visited section sits immediately behind the active tab, and so on. On a fresh load with no history, tabs layer left-to-right front-to-back.

**Why this priority**: Reinforces the organic notebook feel; a static stacking order would look mechanical.

**Independent Test**: Visit Gallery → Create → Home in sequence; verify stacking order.

**Acceptance Scenarios**:

1. **Given** I visit Gallery, then Create, then Home (in that sequence), **When** I look at the tabs, **Then** from front to back: Home (active) → Create → Gallery → My Playbook (if authenticated).
2. **Given** a fresh session with no stored history, **When** the nav renders, **Then** tabs layer left-to-right front-to-back (Home frontmost of inactive, then Gallery, etc.).
3. **Given** I navigate several sections and then refresh the page, **When** the nav renders, **Then** the tab stacking order is identical to what it was before refresh.
4. **Given** localStorage is unavailable (e.g. private browsing), **When** the nav renders, **Then** tabs fall back to left-to-right front-to-back layering without error.

---

### User Story 4 — Plastic Laminate Aesthetic (Priority: P2)

The tabs look like colour-coded laminated notebook divider tabs. A diagonal gloss highlight suggests a plastic coating. The nav bar reads as the top edge of a notebook cover.

**Why this priority**: Defines the tactile, physical quality of the feature; without it the tabs are flat coloured rectangles.

**Independent Test**: Visual review against `prototype/nav-tabs.html`.

**Acceptance Scenarios**:

1. **Given** I look at any tab, **When** I examine its surface, **Then** it shows a diagonal highlight — lighter in the top-left, darker in the bottom-right — suggesting a laminated surface.
2. **Given** the nav bar, **When** I look at the overall structure, **Then** the bar background reads as a notebook cover (dark neutral, distinct from all section colours) with the coloured tabs protruding from its top edge.
3. **Given** the active tab, **When** I observe its connection to the page body, **Then** there is no visible seam or border between the tab bottom and the page content area — it appears to open directly into the page.
4. **Given** a tab is partially hidden behind another, **When** I look at its right edge, **Then** a subtle depth shadow is visible, reinforcing the stacked physical depth.

---

### User Story 5 — Mobile Colour-Coded Hamburger Menu (Priority: P2)

On mobile, there are no visible tab shapes. A hamburger icon opens a dropdown. Each section entry in the dropdown has a coloured left-bar matching its tab colour, providing the same colour identity without the tab shape.

**Why this priority**: Mobile parity — the colour identity system must work at all viewports.

**Independent Test**: Set viewport to 375px wide, open hamburger, verify colour bars on each entry.

**Acceptance Scenarios**:

1. **Given** I am on a mobile-width viewport, **When** I look at the navigation bar, **Then** no tab shapes are visible; a hamburger icon is shown instead.
2. **Given** I tap the hamburger icon, **When** the dropdown opens, **Then** each section entry has a 4px coloured left-bar matching its tab colour.
3. **Given** I tap a section entry in the mobile menu, **When** navigation completes, **Then** I am taken to the correct section and the menu closes.
4. **Given** I am unauthenticated and open the mobile menu, **When** I view the list, **Then** My Playbook is not listed.

---

### User Story 6 — Page Background Textures (Priority: P3)

Each section's page background carries a subtle texture that reinforces its identity and the notebook metaphor. Home: horizontal ruled lines. Gallery: large graph paper. My Playbook: small graph paper. Create: clean.

**Why this priority**: Visual polish that completes the notebook metaphor, but the feature ships without it.

**Independent Test**: Visit each section and visually verify the background texture.

**Acceptance Scenarios**:

1. **Given** I visit Home, **When** I look at the page background, **Then** I see faint evenly-spaced horizontal lines (ruled notepad).
2. **Given** I visit Gallery, **When** I look at the page background, **Then** I see a subtle large-cell graph paper grid.
3. **Given** I visit My Playbook, **When** I look at the page background, **Then** I see a subtle small-cell graph paper grid (noticeably tighter than Gallery's).
4. **Given** I visit Create, **When** I look at the page background, **Then** the background is clean — no texture visible.
5. **Given** any section, **When** I read page content, **Then** the texture does not reduce text or UI legibility.

---

### Edge Cases

- My Playbook tab must not be rendered at all for unauthenticated users (not dimmed, not hidden via CSS — absent from the DOM).
- If localStorage is unavailable or throws, the system silently falls back to default left-to-right order; no error surfaces to the user.
- The active tab must produce zero visible gap or double-border between its bottom edge and the page content boundary.
- Tab z-ordering must not interfere with any overlay, modal, or dropdown that appears above the navigation (those elements must still render above all tabs).
- Background textures must be implemented without image files (CSS only) to avoid additional network requests.

---

## Requirements

### Functional Requirements

- **FR-001**: The navigation MUST display one tab per section accessible to the current user tier.
- **FR-002**: The active section's tab MUST be visually distinguished as "open" — raised, full-colour, and visually merged with the page body below it.
- **FR-003**: Inactive tabs MUST be visually receded and stacked by MRU order (most recently visited = immediately behind the active tab).
- **FR-004**: Tab visit order MUST be persisted to browser-local storage and restored on every page load.
- **FR-005**: In the absence of stored history, tabs MUST default to left-to-right front-to-back stacking.
- **FR-006**: If local storage is unavailable, the system MUST fall back gracefully to default ordering with no visible error.
- **FR-007**: Unauthenticated users MUST NOT see the My Playbook tab in any form.
- **FR-008**: On viewports narrower than 768px (matching the existing `md:` Tailwind breakpoint in Navigation.tsx), tab shapes MUST be replaced by a hamburger dropdown with colour-coded section entries.
- **FR-009**: The hamburger dropdown MUST include a coloured left-bar per entry matching that section's tab colour.
- **FR-010**: Each page section MUST display its assigned background texture (ruled lines, large grid, small grid, or none).

### Frontend Requirements

- **UI-001**: Tabs have rounded top corners and squared bases (connecting flush with the nav bar bottom edge).
- **UI-002**: The active tab has no visible dividing line between its base and the page content area — it visually opens into the page.
- **UI-003**: Each tab carries a diagonal gloss overlay — lighter top-left, darker bottom-right — representing a laminated surface.
- **UI-004**: Inactive tabs are slightly shorter and slightly dimmed relative to the active tab.
- **UI-005**: Tabs overlap slightly (partially concealing the tab behind) so stacked depth is physically readable.
- **UI-006**: A subtle shadow on each tab's right edge reveals the depth of tabs stacked behind it.
- **UI-007**: The nav bar background is a dark neutral distinct from all section colours (notebook cover material).
- **UI-008**: Section colours (provisional — to be confirmed against prototype): Home `#0F766E`, Gallery `#D97706`, My Playbook `#1A3D1A`, Create `#1E40AF`.
- **UI-009**: Background textures are CSS-only (no image assets); textures must not degrade content legibility.

### Key Entities

- **Tab visit order**: An ordered list of section IDs, most-recently-visited first. Stored in browser localStorage. Maximum length equals the number of sections accessible to the current user. Used exclusively for z-index layering — it is not used for routing or analytics.

---

## Success Criteria

- **SC-001**: A user can identify their current section purely from the tab visual state without reading any page heading or content.
- **SC-002**: After visiting three or more sections in sequence, the tab stacking order visually matches the MRU visit history.
- **SC-003**: Refreshing the page preserves the tab stacking order (localStorage round-trip verified).
- **SC-004**: On a 375px viewport, the hamburger menu opens and all accessible sections are listed with correct colour indicators.
- **SC-005**: The seam between the active tab and the page body measures ≤ 0px (no visible gap or double border).
- **SC-006**: `npm run lint && npx tsc --noEmit` passes with zero new errors after implementation.
- **SC-007**: All six user story acceptance scenarios pass verification (visual or automated).

---

## Assumptions

- Home exists as a routable section with its own navigation identity (URL: `/`).
- The existing `Navigation.tsx` is the primary component to modify; no new top-level layout component is needed.
- The mobile hamburger breakpoint aligns with the existing `Navigation.tsx` responsive threshold.
- Background textures are applied at the page layout level, not within individual feature components.
- Section colours listed in UI-008 are provisional pending user sign-off on `prototype/nav-tabs.html`. My Playbook's `#1A3D1A` (pitch green) may need lightening to improve contrast against the dark cover; this is a design decision deferred to prototype review.
- The prototype at `prototype/nav-tabs.html` is the design authority for visual behaviour. Any ambiguity between this spec and the prototype resolves in favour of the prototype.
