# Feature Specification: Phase 2c — Share & Playback Workflow

**Feature Branch**: `018-share-playback-workflow`
**Created**: 2026-05-03
**Status**: Draft
**Input**: User description: "Phase 2c — Share & Playback Workflow"

## Constitutional Compliance Gate *(mandatory — check before writing requirements)*

Verify this feature against [docs/authority/constitution.md](../../docs/authority/constitution.md):

- [x] **Tier alignment**: Tier 1 (editor, save flow) + Tier 2 (share/replay, gallery) — no Guest-only or Admin surfaces affected
- [x] **No telemetry**: No telemetry introduced; Web Share API is a browser primitive with no data retention
- [x] **No third-party analytics**: No third-party SDKs added
- [x] **No hardcoded colors**: No entity color changes; all UI uses design tokens
- [x] **Privacy gate**: One new data field — `coaching_notes` (free text, nullable; column already exists in DB). Same access model as `description`: owned by the creating user, readable by anyone with access to the animation (public/link-shared). No additional PII or sensitive data.
- [x] **Shared canvas risk**: `FloatingRemote.tsx` (share route), `ShareViewer.tsx`, `ReplayViewer.tsx` all touched — all three routes (`/app`, `/replay/[id]`, `/share/[id]`) must be smoke-tested after every canvas-adjacent change.

> No constitutional conflicts. `coaching_notes` follows the same privacy model as `description`. Web Share API is a browser platform API with zero telemetry implications.

---

## Background

This spec closes ten open Phase 2 issues that collectively describe a broken share workflow and an undiscoverable progression creation path. They group into three problem clusters:

**Cluster 1 — Share entry points are broken or missing**

| Issue | Problem |
|-------|---------|
| EDITOR-002 | Share button in the editor is non-functional (displays "not available in development") |
| FLOW-001 | Gallery "Play" button routes to `/replay/{id}` (old, unoptimised) instead of `/share/{id}` |
| GALLERY-002 | No share action on gallery cards; no `/share/{id}` link generated from the gallery |

**Cluster 2 — Share/replay view lacks context and utility**

| Issue | Problem |
|-------|---------|
| FLOW-002 | `/share/{id}` shows no animation title, no progression navigation, no link back to the site |
| FLOW-004 | Back button from share view only offers "Gallery"; owners have no path back to their Playbook |
| PLAYBACK-001 | Playback controls are not always visible — they require scrolling on some viewports |
| PLAYBACK-002 | No way to view coaching notes from the share or replay screen without navigating away |
| FEAT-013 | No dedicated "Coaching Points" field in animation metadata — notes have no separate home |

**Cluster 3 — Progression workflow is undiscoverable and pollutes the gallery**

| Issue | Problem |
|-------|---------|
| WORKFLOW-001 | No discoverable UI path to create a progression of an existing animation |
| UX-010 | Progression animations appear as standalone gallery cards, cluttering the view; progression navigation is absent from all playback surfaces |

**Out of scope**: Pure canvas mechanics (EDITOR-012, EDITOR-013, EDITOR-014), visual polish (UX-012, UX-013, UX-014), landing page copy (LANDING-001 through LANDING-004).

---

## Clarifications

### Session 2026-05-03

- Q: Can coaches see and manage their individual progressions from My Playbook? → A: Yes — progressions are displayed in My Playbook as visually offset stacked cards beneath their parent, evoking a stack of physical coaching cards. The default listing shows only parent cards; the stacked progressions are visible beneath each parent with edit/delete/rename actions accessible per progression. Progressions do not appear as top-level standalone cards in either My Playbook or the public gallery.
- Q: Does the parent animation count as "Part 1"? → A: The base animation is labelled "Foundation". Linked children are labelled "Progression 1", "Progression 2", etc. (1-based, ordered by creation date). The badge on the public gallery parent card reads "{n} progressions" counting only the linked children. The Foundation itself carries no part/progression number label.
- Q: Can a coach retroactively link an already-saved standalone animation as a Progression of an existing Foundation? → A: Yes. A "Link to Foundation" action on My Playbook standalone cards lets coaches attach them to an existing Foundation at any time. Progressions can also be unlinked, reverting them to standalone animations.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Share from the Editor (Priority: P1)

A coach has finished building an animation in the editor and wants to send it to their squad before training. They tap the Share button in the editor toolbar and immediately get a link they can copy or send via WhatsApp. They do not need to leave the editor or navigate to a separate page.

**Why this priority**: The Share button is the primary sharing entry point for coaches creating new content. It is currently non-functional. Without it the core loop — create → share → watch — is broken.

**Independent Test**: Open `/app`, create and save an animation. Tap the Share toolbar button. A `/share/{id}` link must be produced and copyable.

**Acceptance Scenarios**:

1. **Given** the editor is open and the animation has been saved to the cloud, **When** the coach taps the Share button, **Then** a `/share/{id}` link is copied to the clipboard (desktop) or the Web Share sheet opens (mobile)
2. **Given** the editor is open and the animation has unsaved changes, **When** the coach taps Share, **Then** a prompt appears asking them to save before sharing; if they save, the share action completes normally
3. **Given** a mobile browser with Web Share API support, **When** the coach taps Share, **Then** the native share sheet opens with the `/share/{id}` URL pre-populated; WhatsApp is available as a target
4. **Given** a desktop browser without Web Share API support, **When** the coach taps Share, **Then** the link is copied to clipboard and a confirmation toast appears

---

### User Story 2 — Share and Play from the Gallery (Priority: P1)

A coach browsing the public gallery wants to send a drill to their team. They click the Share button on a gallery card and get a link. They also click Play to watch the animation in the optimised share view.

**Why this priority**: The gallery is the primary discovery surface for public content. Both the Play and Share actions currently route to the wrong destination (`/replay/{id}`) or are absent entirely.

**Independent Test**: Open `/gallery`. Click "Play" on any card — must navigate to `/share/{id}`. Click "Share" on any card — must produce a `/share/{id}` link.

**Acceptance Scenarios**:

1. **Given** the public gallery, **When** a user clicks "Play" on an animation card, **Then** they are taken to `/share/{id}` for that animation
2. **Given** the public gallery, **When** a user clicks "Share" on an animation card, **Then** a `/share/{id}` link is copied to clipboard (desktop) or the Web Share sheet opens (mobile)
3. **Given** My Playbook, **When** a coach clicks "Play" or "Share" on one of their animations, **Then** the same routing behaviour applies (routes to `/share/{id}`)

---

### User Story 3 — Share View: Title, Navigation, and Context (Priority: P1)

A player receives a share link. They open `/share/{id}` and immediately see the animation title and can navigate between parts of a multi-progression drill set. When they want to find out what the site is, there is a subtle link back to the landing page.

**Why this priority**: The share view is the only surface players see. Without a title it is disorienting. Without progression navigation, a multi-part drill set is inaccessible to viewers.

**Independent Test**: Open `/share/{id}` for an animation that belongs to a progression set. The title, prev/next controls, and site link must all be visible.

**Acceptance Scenarios**:

1. **Given** any `/share/{id}` page, **When** the page loads, **Then** the animation title is displayed prominently above the canvas
2. **Given** a Foundation animation that has at least one Progression, **When** a viewer opens `/share/{id}` for any animation in the set (Foundation or any Progression), **Then** prev/next navigation controls are visible and functional
3. **Given** `/share/{id}` for the Foundation of a set, **When** the viewer taps "Next", **Then** they navigate to the `/share/{id}` of Progression 1; the Foundation is first in the navigation order
4. **Given** any `/share/{id}` page, **Then** a non-intrusive "Built with Coaching Animator" link is visible that leads back to the landing page
5. **Given** a logged-in animation owner on their own `/share/{id}`, **Then** a "My Playbook" navigation link is also visible

---

### User Story 4 — Coaching Points Field in Save and Edit Flow (Priority: P1)

A coach wants to record specific coaching delivery notes for a drill — separate from the general description. They add coaching points when saving to the cloud. When they reopen the animation from My Playbook, the coaching points are pre-populated and ready to edit.

**Why this priority**: Coaching delivery notes are core to the product's coaching utility. Without a dedicated field, coaches have no structured place for this content. Pre-population is a data integrity requirement — missing it makes the field appear broken.

**Independent Test**: Save an animation with a Coaching Points value. Open it for editing from My Playbook. The Coaching Points field must be pre-populated.

**Acceptance Scenarios**:

1. **Given** the Save to Cloud modal, **When** it opens, **Then** a "Coaching Points" textarea is present below the Description field
2. **Given** an animation with saved coaching points, **When** the coach opens it for editing from My Playbook, **Then** the Coaching Points field is pre-populated with the stored value
3. **Given** an animation with no coaching points, **When** the edit modal opens, **Then** the Coaching Points field is empty and editable
4. **Given** the coach updates the coaching points and saves, **When** they reopen the edit modal, **Then** the updated value is reflected

---

### User Story 5 — Coaching Notes Reveal in Playback Views (Priority: P1)

A player watching a shared drill wants to read the coach's delivery notes without leaving the animation. They tap a "Notes" button and a panel slides up showing the coaching points. Tapping again or tapping outside dismisses it.

**Why this priority**: Coaching notes in the playback view are a direct extension of US-4. The field is only useful if viewers can access it from the share/replay screen.

**Independent Test**: Open `/share/{id}` for an animation that has coaching points. Tap the Notes button. The panel must reveal the coaching points content.

**Acceptance Scenarios**:

1. **Given** `/share/{id}` with coaching points set, **When** the viewer taps the "Notes" control, **Then** a dismissible overlay displays the coaching points text without obscuring playback controls
2. **Given** `/share/{id}` with no coaching points, **Then** the "Notes" control is not rendered
3. **Given** `/replay/{id}` with coaching points set, **When** the viewer taps the "Notes" control, **Then** the same dismissible overlay behaviour applies
4. **Given** the Notes overlay is open, **When** the viewer taps outside the panel or taps a close control, **Then** the overlay dismisses and the animation continues

---

### User Story 6 — Progression Creation Workflow (Priority: P1)

A coach has built a basic lineout drill and now wants to create a harder variation as Progression 2. From My Playbook they click "Add Progression" on the parent card — the editor opens pre-linked to that animation as the parent. They build the variation and save it. Alternatively, while in the editor, they can choose "Save As Progression" during the save flow and pick the parent from a list.

Once saved, the progression no longer appears as a standalone card in the gallery. The parent card shows a badge (e.g., "3 progressions") and clicking it reveals prev/next navigation through the set.

**Why this priority**: Progressions are a core differentiating feature. There is currently no way for coaches to create them. Without a workflow, the feature is inaccessible regardless of how well the database supports it.

**Independent Test**: From My Playbook, click "Add Progression" on any card. The editor opens linked to that parent. Save it. Verify the progression is not standalone in the gallery; verify the parent card shows a progression count.

**Acceptance Scenarios**:

1. **Given** My Playbook, **When** the coach opens card actions, **Then** "Add Progression" is listed as an option
2. **Given** the coach clicks "Add Progression", **When** the editor opens, **Then** the current animation is pre-linked to the selected parent (visible in the save modal)
3. **Given** the editor save flow, **When** the coach opens the save options, **Then** a "Save As Progression" option is available that lets them select a parent from their own animations
4. **Given** an animation saved as a progression, **When** a user views the public gallery, **Then** the progression card does not appear as a standalone item; it is accessible only via its parent
5. **Given** a parent animation with progressions, **When** a user views its gallery card, **Then** a progression count badge is displayed (e.g., "3 progressions")
6. **Given** the auto-generated progression title "{Foundation Title} — Progression {n}", **When** the coach edits it in the save modal, **Then** the custom title is saved instead
7. **Given** My Playbook, **When** a coach views a parent animation card that has progressions, **Then** the progression cards are visible as offset stacked cards beneath the parent, evoking a physical card stack; each stacked card shows its title and offers edit, rename, and delete actions
8. **Given** My Playbook with the stacked progression cards visible, **When** the coach taps a progression card, **Then** the editor opens with that Progression loaded for editing
9. **Given** a standalone My Playbook card, **When** the coach selects "Link to Foundation", **Then** they can select any of their own Foundation animations and the card moves into that Foundation's stacked progression view
10. **Given** a Progression card in the stacked view, **When** the coach selects "Unlink", **Then** the animation is detached from the Foundation and appears as a standalone top-level card in My Playbook

---

### User Story 7 — Persistent Floating Playback Remote (Priority: P2)

A coach at the pitch is using `/share/{id}` on their phone to demonstrate a drill. They do not want to scroll to reach playback controls mid-demonstration. The controls stay visible and accessible regardless of viewport size or scroll position.

**Why this priority**: P2 because `/share/{id}` already works for basic viewing. This is a usability improvement for the pitch-side use case rather than a blocking defect.

**Independent Test**: Open `/share/{id}` on a small viewport (375px wide). Scroll the page. Playback controls must remain visible without scrolling back.

**Acceptance Scenarios**:

1. **Given** `/share/{id}` on a mobile viewport, **When** the viewer scrolls down, **Then** playback controls remain visible without requiring the viewer to scroll back up
2. **Given** playback controls in fixed/floating position, **Then** they do not obscure the primary animation area

---

### User Story 8 — Context-Aware Back Button (Priority: P3)

A logged-in coach viewing their own animation on `/share/{id}` wants to return to their Playbook. The back button offers "My Playbook" as a destination. A guest viewer sees no Playbook link.

**Why this priority**: P3 because the back button is a navigation convenience. The feature is fully usable without it.

**Independent Test**: Log in and open `/share/{id}` for your own animation. A "My Playbook" link must be visible. Log out (or view another user's share link) — the link must not appear.

**Acceptance Scenarios**:

1. **Given** a logged-in user viewing `/share/{id}` for an animation they own, **Then** a "My Playbook" navigation link is visible
2. **Given** a guest viewer (not logged in) on any `/share/{id}`, **Then** no "My Playbook" link appears
3. **Given** a logged-in user viewing another user's `/share/{id}`, **Then** no "My Playbook" link appears (they do not own it)

---

### Edge Cases

- Share attempted on an unsaved animation → prompt to save first; share link is only generated after a successful save
- Animation with `visibility: 'private'` accessed via share link by a non-owner → existing RLS must return 404 or access-denied (verify no regression)
- Progression created and its parent is later deleted → ON DELETE CASCADE means the Progression is also deleted when the Foundation is deleted. Coaches must be warned before deleting any animation with `progression_count > 0`.
- Coaching points field containing an empty string → treated as "no coaching points" (same as null); Notes button must not render
- Web Share API unavailable (desktop browsers) → fallback to `navigator.clipboard.writeText`; show confirmation toast
- Foundation with no linked Progressions → no prev/next controls shown; navigation only appears when at least one Progression exists
- Retroactive link ("Link to Foundation") applied to an animation that already has its own Progressions → the animation becomes a Progression of the chosen Foundation; its own linked Progressions become orphans (revert to standalone); warn the coach before confirming
- Unlink applied to a Progression whose Foundation is public → the unlinked animation becomes a standalone public animation immediately; coach is informed

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The editor share button MUST produce a working `/share/{id}` link; on desktop it MUST copy the link to clipboard; on mobile it MUST invoke the Web Share API
- **FR-002**: An animation MUST be saved to the cloud before a share link can be generated; an unsaved state MUST present a save-first prompt
- **FR-003**: Gallery "Play" actions MUST navigate to `/share/{id}` (not `/replay/{id}`)
- **FR-004**: Gallery "Share" actions MUST produce a `/share/{id}` link via clipboard (desktop) or Web Share API (mobile)
- **FR-005**: `/share/{id}` MUST display the animation title above the canvas area
- **FR-006**: `/share/{id}` MUST include a non-intrusive link back to the site landing page
- **FR-007**: `/share/{id}` MUST display prev/next navigation controls when the animation is a Foundation with at least one Progression, or is itself a Progression; navigation order is: Foundation → Progression 1 → Progression 2 → …
- **FR-008**: Logged-in animation owners on `/share/{id}` MUST have an explicit navigation option to My Playbook
- **FR-009**: The animation save modal and edit modal MUST each include a "Coaching Points" free-text field, positioned below Description
- **FR-010**: Coaching Points data MUST be persisted to the database and pre-populated in the edit modal on every open
- **FR-011**: `/share/{id}` and `/replay/{id}` MUST provide a dismissible coaching notes overlay triggered by a visible "Notes" control; the control MUST NOT render when coaching points are absent (null or empty string)
- **FR-012**: Playback controls on `/share/{id}` MUST remain accessible without scrolling on all supported viewport sizes
- **FR-013**: My Playbook animation cards MUST offer an "Add Progression" action that opens the editor pre-linked to the selected Foundation
- **FR-014**: The editor save flow MUST offer a "Save As Progression" option; selecting it MUST allow the coach to choose a Foundation from their own Playbook
- **FR-019**: My Playbook standalone animation cards MUST offer a "Link to Foundation" action that retroactively attaches the animation as a Progression of a chosen Foundation; the animation is removed from the standalone listing and added to the Foundation's stacked progression cards
- **FR-020**: My Playbook Progression cards (visible in the stacked view) MUST offer an "Unlink" action that detaches the Progression from its Foundation, reverting it to a standalone animation in both My Playbook and (if public) the public gallery
- **FR-015**: Animations saved as progressions MUST NOT appear as standalone top-level cards in the public gallery or as top-level cards in My Playbook; in My Playbook they are shown in the ProgressionStrip (horizontal scrollable row) beneath their parent card, with per-progression rename, delete, and unlink actions accessible on each strip item. *(The "stacked offset card" visual metaphor is deferred to a future polish phase; ProgressionStrip fulfils the functional requirement for this spec.)*
- **FR-016**: The base animation in a set is labelled "Foundation" (no part number); linked progression titles MUST auto-generate as "{Foundation Title} — Progression {n}" where n is the 1-based creation order; the coach MUST be able to override this title before saving
- **FR-017**: Progression tags and sport type MUST inherit from the Foundation animation by default; the coach MAY override these values before saving
- **FR-018**: The public gallery badge on a Foundation card MUST read "{n} progressions" where n counts only the linked Progression children (Foundation excluded from the count)

### Frontend Requirements *(UI surfaces)*

- **UI-001**: Sharp corners only (`rounded-none`); no soft drop shadows; all surfaces use `bg-surface` or `bg-background` tokens (no `bg-white`)
- **UI-002**: ShareButton in editor toolbar — replace placeholder with functional clipboard/Web Share implementation
- **UI-003**: Gallery and My Playbook animation cards — update Play href to `/share/{id}`; add Share button with clipboard/Web Share behaviour
- **UI-004**: `/share/{id}` page — add title header above canvas, prev/next progression navigation, "Powered by" footer link, and context-aware Playbook back link (owner only)
- **UI-005**: SaveToCloudModal and EditMetadataModal — add "Coaching Points" textarea below Description
- **UI-006**: ShareViewer and ReplayViewer — add Notes overlay component (dismissible panel); show only when coaching points are non-empty
- **UI-007**: My Playbook card actions — standalone cards offer "Add Progression" (opens editor pre-linked) and "Link to Foundation" (attaches existing animation retroactively); Foundation cards with Progressions display the ProgressionStrip (horizontal scrollable row) beneath them; each strip item exposes rename, delete, and unlink actions
- **UI-008**: Save flow — add "Save As Progression" option with a parent-picker that browses the authenticated user's own animations
- **UI-009**: Parent animation gallery cards (public gallery) — add progression count badge when the animation has linked progressions; My Playbook parent cards use the stacked card UI instead of a badge

### API / Database Requirements *(backend changes)*

- **API-001**: `animations` table has a `coaching_notes` column (type: text, nullable, max 5000 chars) — column already exists in `saved_animations`; **no migration required**
- **API-002**: All animation read and write endpoints (save, GET, PUT) MUST include `coaching_notes` in their payload and query
- **API-003**: Gallery list query MUST filter `WHERE parent_animation_id IS NULL` to exclude standalone progression cards from the public listing
- **API-004**: Share/replay page data fetch MUST include a sibling progression query: `SELECT id, title FROM animations WHERE parent_animation_id = $parentId ORDER BY created_at ASC` to build the prev/next navigation set
- **API-005**: Any new or modified endpoints MUST apply rate limiting consistent with the existing policy (see `specs/016-security-hardening/`)
- **API-006**: RLS policies on `animations` MUST continue to prevent non-owners from reading `private` visibility animations; verify no regression from new column or query changes

### Key Entities *(data model)*

- **Animation**: Extended with `coaching_notes` (text, nullable, max 5000 chars; column already exists in `saved_animations`). `parent_animation_id` FK already exists with ON DELETE CASCADE — deleting a Foundation deletes all its Progressions.
- **Foundation**: An animation with no `parent_animation_id`; the base drill in a progression set. Carries no part/number label. Displays a "{n} progressions" badge on its gallery card when Progressions are linked.
- **Progression**: An animation with a non-null `parent_animation_id` pointing to its Foundation. Auto-titled "{Foundation Title} — Progression {n}". Not shown as a standalone card in public gallery or My Playbook top-level listing; shown in the Foundation's ProgressionStrip in My Playbook.
- **Progression Set**: The Foundation plus all its linked Progressions, ordered by creation date. No new database table required — the relationship is expressed via the existing `parent_animation_id` FK.

---

## Assumptions

- `parent_animation_id` FK already exists on the `animations` table (observed in codebase exploration). If absent, it must be created as part of this spec.
- The `/share/{id}` route fetches progression siblings at render time; no dedicated progressions table is required.
- Web Share API fallback (clipboard) is the only desktop share mechanism needed at this phase — native OS share integration is out of scope.
- The "Powered by" footer link text will be confirmed during implementation; placeholder: "Built with Coaching Animator".
- Rate limiting for any new or modified API endpoints follows the existing pattern in `src/lib/rate-limit.ts` (or equivalent).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A coach can obtain a working `/share/{id}` link from the editor in ≤ 2 taps/clicks, without leaving the editor
- **SC-002**: All gallery "Play" and "Share" interactions produce `/share/{id}` URLs — zero occurrences of `/replay/{id}` routing from gallery actions
- **SC-003**: `/share/{id}` displays the animation title, a site back-link, and progression prev/next controls (when applicable) — all three elements present simultaneously for an animation with progressions
- **SC-004**: A viewer can read coaching notes from `/share/{id}` or `/replay/{id}` without navigating away from the playback screen
- **SC-005**: A coach can create a progression of an existing animation via a discoverable UI path reachable from My Playbook in ≤ 3 taps/clicks
- **SC-006**: Progression animations produce zero standalone cards in the public gallery; parent cards display an accurate progression count badge
- **SC-007**: The Coaching Points field persists and pre-populates correctly across at least one full save → close → reopen → edit cycle
- **SC-008**: `npm run lint && npx tsc --noEmit` passes with zero new errors after all changes
- **SC-009**: All three routes (`/app`, `/replay/[id]`, `/share/[id]`) render without visual regression or console errors after canvas-adjacent changes
