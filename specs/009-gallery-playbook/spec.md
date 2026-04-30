# Feature Specification: Gallery & My Playbook

**Feature Branch**: `009-gallery-playbook`  
**Created**: 2026-04-26  
**Status**: Draft  
**Input**: Phase 2f — Gallery and My Playbook refinements

## Clarifications

### Session 2026-04-26

- Q: For Phase 2f visual previews, build thumbnail generation + storage, mini-pitch SVG fallback from first-frame data, or a different approach? → A: Mini-pitch SVG fallback from first-frame entity data only — no thumbnail generation, no storage.
- Q: Progression display — hidden until triggered, always-visible strip, accordion, or full-screen drawer? → A: Always-visible compact horizontal strip beneath the parent card body; no expand/collapse interaction required.
- Q: My Playbook search — client-side, server-side, or hybrid? → A: Client-side filtering over URL-driven state (`?q=`, `?type=`); params forwarded to API today so server-side can be enabled by a single API-handler change when the animation cap is lifted.
- Q: Endorsement badge — text-only CSS stamp, image asset, or image-with-text-fallback? → A: Text-only CSS stamp for Phase 2f. Image is a future drop-in into the same badge container; no structural change needed when asset is obtained.
- Q: Does `endorsed_by` column exist in the database? → A: Missing — confirmed by grepping migrations, types, and source. A Supabase migration is a P0 prerequisite for the endorsement story.

---

## Constitutional Compliance Gate

- [x] **Tier alignment**: Tier 1 (Authenticated — My Playbook, endorsement admin), Tier 2 (Public — Gallery browse, endorsement display)
- [x] **No telemetry**: No usage tracking; search queries are client-state only
- [x] **No third-party analytics**: No new SDKs added
- [x] **No hardcoded colors**: All entity colors through `EntityColors` service; gallery card colors use design tokens only
- [x] **Privacy gate**: No new PII collected. `endorsed_by` is an existing field storing an org reference. No new storage or thumbnail URLs are introduced in Phase 2f.
- [x] **Shared canvas risk**: Visual preview uses first-frame data for a static mini-pitch render; it does not modify `Canvas/` components. Template filter and progression carousel do not touch shared canvas. Test scope limited to `/gallery` and `/my-gallery`.

---

## Background

The public gallery and personal "My Playbook" are the two post-creation surfaces coaches interact with most. Phase 2f closes four open quality gaps before launch:

1. Gallery cards show no visual content — a label and a frame count conveys nothing to a coach scanning for a drill (UX-004)
2. Hampshire RFU has an existing `endorsed_by` field but no visible badge (GALLERY-001)
3. The template filter exists in the gallery UI but has not been verified end-to-end since the Phase 3a refactor (GALLERY-003)
4. My Playbook has no search or filter; as a coach's collection grows past 20 animations discovery becomes friction (MYPLAYBOOK-001)
5. Gallery cards show progressions as isolated items; there is no way to browse a progression sequence as a set, and no terminology has been established (UX-009)

---

## User Scenarios & Testing

### User Story 1 — My Playbook Search & Filter (Priority: P1)

A coach has 30 saved animations. They want to find all their lineout drills quickly before a training session. Currently they must scroll through every card sorted only by date.

**Why this priority**: Directly blocks utility as the collection grows. Parity with the public gallery is the minimum acceptable bar.

**Independent Test**: Navigate to `/my-gallery` as an authenticated user with multiple animations. Confirm a search input and type filter are present and narrow the card list correctly.

**Acceptance Scenarios**:

1. **Given** a coach is on `/my-gallery` with 10+ animations, **When** they type a partial title into the search field, **Then** only animations whose title or description contains the typed text are shown.
2. **Given** a coach has animations of mixed types, **When** they select "Tactics" from the type filter, **Then** only tactic-type animations are shown.
3. **Given** both search and type filter are active, **When** results are returned, **Then** both constraints apply simultaneously.
4. **Given** no animations match the search query, **When** results are returned, **Then** an empty state is shown with the query echoed back and a suggestion to clear filters.
5. **Given** a search or filter is active, **When** the coach clears the search input, **Then** the full collection is restored without a page reload.

---

### User Story 2 — Gallery Visual Previews (Priority: P1)

A coach browsing the public gallery sees a grid of text-only cards. Without visual content, they cannot judge a drill at a glance — they must click into each one. A mini-pitch SVG fallback — drawn from the first frame's entity data already in the payload — gives every card a meaningful tactical preview with zero backend infrastructure.

**Why this priority**: The gallery is the primary trust-building surface before launch. Cards with no visual signal are not credible next to even a minimal competitor.

**Scope**: Phase 2f delivers the mini-pitch SVG fallback only. No thumbnail generation or storage is built. If a `thumbnail_url` happens to exist on an animation from prior work, it continues to display as before — but no new thumbnails are generated.

**Independent Test**: Visit `/gallery`. Confirm that every card shows a mini-pitch SVG preview area distinct from a blank placeholder, with entity dots visible on cards that have entities in their first frame.

**Acceptance Scenarios**:

1. **Given** any gallery card, **When** it renders, **Then** a mini-pitch SVG preview area is shown — a simplified pitch outline with player position dots derived from the first frame's entity data.
2. **Given** the first frame has attackers and defenders, **When** the card renders, **Then** attacker dots use the warm-accent color and defender dots use a muted counterpart, matching design tokens.
3. **Given** the first frame has no entities, **When** the card renders, **Then** a minimal empty pitch outline is shown (no dots, no blank grey box).
4. **Given** an animation with an existing `thumbnail_url`, **When** the card renders, **Then** the thumbnail is displayed instead of the SVG fallback, preserving current behaviour.
5. **Given** any card preview area, **When** viewed on mobile at 375px width, **Then** the preview area maintains a consistent aspect ratio without overflow or cropping.

---

### User Story 3 — Hampshire RFU Endorsement Badge (Priority: P1)

The gallery contains animations that Hampshire RFU has reviewed and approved. These should be visibly distinguished so coaches can filter for trusted, high-quality content.

**Why this priority**: Partnership credibility. An endorsement badge signals curation quality to new coaches evaluating the tool.

**Independent Test**: Seed at least one animation with a non-null `endorsed_by` value in the database. Visit `/gallery`. Confirm the badge appears on that card and not on un-endorsed cards.

**Acceptance Scenarios**:

1. **Given** an animation has `endorsed_by` set to a non-null value, **When** the gallery card renders, **Then** a text-only endorsement badge is displayed in a consistent position on the card.
2. **Given** an animation has `endorsed_by` as null or empty, **When** the gallery card renders, **Then** no badge is shown.
3. **Given** the `endorsed_by` value is `"hampshire_rfu"`, **When** the badge renders, **Then** it displays the text "HAMPSHIRE RFU" in the stamp style — solid pitch-green background, tactics-white uppercase text, no rounding, no shadow.
4. **Given** any other non-null `endorsed_by` value, **When** the badge renders, **Then** it displays the raw value in the same stamp style, uppercased.
5. **Given** a coach with keyboard navigation, **When** they tab to an endorsed card, **Then** the badge has an appropriate `aria-label` describing the endorsement (e.g., "Endorsed by Hampshire RFU").

---

### User Story 4 — Progression Strip (Priority: P2)

A coach opens the gallery and sees a drill listed alongside its two progressions as three separate cards. There is no indication these belong to a set, no terminology, and no way to browse them in order. An always-visible progression strip beneath the parent card groups them without requiring any interaction to discover.

**Why this priority**: Improves discoverability and communicates the progression concept that is central to the app's value proposition. Not blocking launch but materially improves gallery quality.

**Carousel state**: The progression strip is **always visible** when a parent animation has one or more progressions — no tap/click required to reveal it. It renders as a compact horizontal row directly below the card body.

**Independent Test**: Ensure at least one animation has child progressions in the database. Visit `/gallery`. Confirm that the parent animation card shows a compact horizontal progression strip beneath it, immediately visible without interaction.

**Acceptance Scenarios**:

1. **Given** an animation has one or more child progressions, **When** the gallery card renders, **Then** a compact horizontal strip is shown immediately below the card body with a mini-pitch preview for each progression, in numbered order.
2. **Given** the progression strip has 3 progressions that overflow the card width, **When** a coach swipes the strip on mobile, **Then** the strip scrolls horizontally with CSS snap to reveal hidden progressions.
3. **Given** the progression strip is visible, **When** a coach taps a progression's mini-preview, **Then** they are taken to that specific progression's share view.
4. **Given** the progression strip is visible, **When** a coach uses arrow keys on desktop, **Then** focus moves between progression items and Enter activates the focused one.
5. **Given** an animation with no progressions, **When** the card renders, **Then** no strip is shown and the card layout is unchanged.

---

### User Story 5 — Template Filter Verification (Priority: P2)

The gallery has a template filter. Post-refactor it has not been tested. An untested filter that silently fails sends coaches to a broken state.

**Why this priority**: Regression risk — this is a verification task, not a build task. A broken filter that returns no results could silently mislead coaches.

**Independent Test**: Navigate to `/gallery`, activate the template filter. Verify animations tagged as templates appear, and non-templates do not.

**Acceptance Scenarios**:

1. **Given** the gallery, **When** a coach selects "Templates" filter, **Then** only animations whose tags include "template" are shown.
2. **Given** no template-tagged animations exist in the public gallery, **When** the templates filter is activated, **Then** an empty state is shown with a message (e.g., "No templates yet — check back soon").
3. **Given** a template animation, **When** it renders in the gallery, **Then** the "Remix" affordance is accessible, confirming the template remix flow is not broken.
4. **Given** the coach switches from "Templates" to "All Types", **When** the filter changes, **Then** the full gallery is restored without requiring a page reload.

---

### Edge Cases

- Coach searches My Playbook while offline: show last-cached state with a connection-lost banner; do not show a broken empty state.
- My Playbook with exactly 0 animations: empty state should teach the interface ("Build your first drill in the editor"), not simply say "Nothing here."
- Endorsement badge with a very long `endorsed_by` string: badge must not overflow its container or break card layout.
- Progression carousel with 10+ progressions: horizontal scroll must not break card container width; use overflow-x scroll with scroll snapping.
- Mini-pitch fallback for an animation with 25+ entities: render a representative sample (max 15 dots), do not try to render all entities.
- Gallery search with special characters (`&`, `<`, `>`): sanitize display, do not allow XSS.

---

## Requirements

### Functional Requirements

- **FR-001**: My Playbook MUST provide a text search input that filters the loaded animation collection client-side by title and description.
- **FR-002**: My Playbook MUST provide a type filter (All / Tactics / Skills / Games / Other) matching the public gallery.
- **FR-003**: My Playbook search and filter state MUST be stored as URL query params (`?q=` and `?type=`), not component state — enabling shareable filtered URLs and a zero-refactor path to server-side filtering when the animation cap is lifted.
- **FR-003a**: Search params MUST be forwarded to `/api/animations` on every fetch even though the server ignores them today. When the 50-animation cap is lifted, the API handler gains server-side filtering by adding a single `.ilike()` call; the frontend requires no changes.
- **FR-004**: Gallery cards MUST show a mini-pitch SVG preview derived from the animation's first frame entity data. No thumbnail generation or Supabase Storage writes are in scope. Existing `thumbnail_url` values continue to display as before.
- **FR-005**: The mini-pitch SVG MUST derive attacker and defender positions from the first frame entity data already present in the card payload — no additional API calls required.
- **FR-006**: Gallery cards MUST display a text-only endorsement badge when `endorsed_by` is non-null. No image asset is required for Phase 2f; the badge is pure CSS. The image variant is a future drop-in requiring no structural change.
- **FR-007**: The badge text MUST be the `endorsed_by` value uppercased, with `"hampshire_rfu"` rendered as `"HAMPSHIRE RFU"` (underscore → space). No image loading or fallback logic required.
- **FR-008**: Gallery cards for animations with progressions MUST show an always-visible compact horizontal progression strip beneath the card body — no trigger or expand action required.
- **FR-009**: The progression strip MUST be keyboard-navigable (arrow keys move focus between items, Enter activates) and touch-swipeable with CSS scroll snapping on mobile.
- **FR-010**: The template filter in the public gallery MUST correctly return only animations tagged as templates, verified end-to-end.

### Frontend Requirements

- **UI-001**: All new components live in `src/features/gallery/components/` unless shared across features, in which case `src/shared/components/`.
- **UI-002**: Styling uses Tailwind with the existing design token palette (pitch-green, tactics-white, warm-accent); no new hardcoded color values.
- **UI-003**: Sharp corners only (`rounded-none`). No soft drop shadows. The endorsement badge uses a solid background, not a floating chip with blur.
- **UI-004**: The mini-pitch fallback renders as an inline SVG — a simplified pitch outline (single rectangle with halfway line) with coloured dots for attackers and defenders. No canvas dependency.
- **UI-005**: The endorsement badge sits in the top-right corner of the card preview area, overlaying the thumbnail or fallback. It MUST meet 4.5:1 contrast against its background.
- **UI-006**: The progression strip renders as an always-visible horizontal row directly beneath the card body. It scrolls horizontally with CSS scroll snapping when items overflow. It does not use expand/collapse — the strip is always in the DOM when progressions exist.
- **UI-007**: My Playbook search and filter controls match the visual style of the public gallery's controls — consistent language and interaction pattern.
- **UI-008**: The endorsement badge style is stamp-like (solid rectangle, uppercase short label, no rounded corners) — NOT a floating chip, pill, or badge with shadow. Physical and tactile, not SaaS.
- **UI-009**: The mini-pitch fallback MUST NOT use entity-specific hex colors directly; attacker and defender dot colors MUST be sourced from the design token palette (warm-accent for attackers, muted for defenders).
- **UI-010**: Each progression strip item shows a numbered stamp ("1", "2", "3") overlaid on the mini-pitch preview — terse and rugby-programme style, not a notification badge.

### API / Database Requirements

- **API-001**: The `endorsed_by` column does **not** exist on the `animations` table. A Supabase migration adding a nullable `text` column with no default is a P0 prerequisite — nothing in the endorsement story works without it. The migration must also update the TypeScript database types.
- **API-002**: The public gallery API endpoint MUST include `endorsed_by` in its response payload for each animation once the migration is applied.
- **API-003**: The My Playbook API endpoint (`/api/animations`) MUST accept `q` and `type` query parameters in its request shape today, even though server-side filtering is not implemented. This establishes the contract for future server-side filtering without a frontend refactor.
- **API-004**: Server-side filtering on `q` (case-insensitive contains on `title` and `description`) is explicitly deferred until the 50-animation cap is lifted. When that decision is made, the API handler adds the filter; the frontend is already correct.
- **API-005**: No new RLS policies are required for endorsement display — `endorsed_by` is a read-only public field.

### Key Entities

- **Animation**: Requires a new `endorsed_by` nullable text column (Supabase migration + TypeScript type regeneration). First-frame entity positions are derived from the existing animation `data` field without a new column. No `thumbnail_url` changes — that field is read-only passthrough in Phase 2f.
- **Progression**: Child animations linked by `parent_animation_id`. The carousel renders ordered children; ordering is by `created_at` ascending unless a future `progression_order` field exists.

---

## Design Direction

The gallery is the community coaching resource. It should feel like a shared coaching clipboard — physical, curated, useful. Not a product grid.

### Card Preview Area

The visual preview should recall a tactical diagram on a laminated coaching card: a simplified green pitch (not filled — outline only), with high-vis amber dots for attackers and muted grey-blue dots for defenders. When a thumbnail exists, it fills the preview area with `object-fit: cover`. Both states maintain identical dimensions.

Typography on the card uses the existing Oswald display treatment for the animation title — heavy, ink-weight, no-nonsense. Frame count and duration are secondary metadata below the title in a lighter weight, smaller size.

### Endorsement Badge

Phase 2f ships a text-only badge — pure CSS, no image asset. A solid pitch-green rectangle with the endorser name in tactics-white uppercase (Oswald or equivalent), sized between label and body text. No shadow, no rounding, no chevron. It sits at the top-right of the card preview area and should look stamped on, not floated. When the Hampshire RFU image asset is eventually obtained, it replaces only the text content inside the same badge container — no layout or structural change needed.

### Progression Strip

The progression strip is always visible beneath a parent card — no interaction needed to reveal it. It renders as a compact horizontal row of mini-pitch previews (same SVG component as the card preview area, reduced in scale) with a bold numbered stamp ("1", "2", "3") in the corner of each item. A terse label above the strip reads "PROGRESSIONS" in small uppercase — programme-style, not a heading. On mobile: touch swipe with CSS snap. On desktop: the strip scrolls naturally; no arrow buttons required at this scale.

### My Playbook Search

The search and filter bar in My Playbook mirrors the public gallery bar with one tonal shift: the heading above changes from "Community Playbook" to "Your Playbook." The empty state when search returns nothing shows a direct message: "No drills matching '[query]' — try a different search."

---

## Success Criteria

- **SC-001**: Coach with 30 saved animations can locate a specific drill by partial title search in under 10 seconds on a standard mobile device.
- **SC-002**: Every public gallery card presents a non-empty visual preview area — no card shows a blank grey box.
- **SC-003**: The Hampshire RFU endorsement badge renders on all seeded endorsed animations; no badge appears on non-endorsed animations.
- **SC-004**: The progression carousel correctly groups and sequences child progressions for any parent animation with 2 or more progressions.
- **SC-005**: Template filter in the public gallery returns exactly the animations tagged as templates, with zero false positives or false negatives.
- **SC-006**: `npm run lint && npx tsc --noEmit` passes with zero new errors.
- **SC-007**: All acceptance scenarios for P1 user stories are covered by unit or E2E tests.
- **SC-008**: WCAG AA contrast (4.5:1 minimum) is met on the endorsement badge and all new text elements introduced in this feature.

---

## Assumptions

- **`endorsed_by` column does not exist** (confirmed via codebase grep — no migration, no type definition, no source reference). A Supabase migration adding `endorsed_by text nullable` plus TypeScript type regeneration is a P0 prerequisite for the endorsement story.
- First-frame entity data is available in the existing animation payload already fetched by the gallery — no additional API calls are needed for the mini-pitch fallback.
- "Hampshire RFU" is the only endorser for Phase 2f; a multi-endorser system is Phase 4 (FEATURE-001).
- **Visual preview approach is mini-pitch SVG fallback only** (confirmed). Thumbnail generation and Supabase Storage writes are out of scope.
- **Endorsement badge is text-only CSS stamp for Phase 2f** (confirmed). Image asset is a future drop-in into the same badge container.
- Progression ordering defaults to `created_at` ascending; a future `progression_order` field is noted but not built here.
- **My Playbook search strategy is client-side filtering over URL-driven state** (confirmed). Search and type filter state live in URL params (`?q=`, `?type=`); filtering runs client-side against the full loaded collection. Params are forwarded to the API today (ignored server-side) so that lifting the 50-animation cap requires only an API handler change — no frontend refactor.

---

## Out of Scope (Phase 2f)

- Full multi-endorser badge management system with admin UI (Phase 4 — FEATURE-001)
- Server-side thumbnail generation from canvas snapshots (requires separate infrastructure decision)
- Search by tags (Phase 3 — FEAT-007)
- Gallery Carousel terminology standardisation beyond "progressions" (Phase 4 — DESIGN-001)
- Pagination of progression carousel (Phase 4+)
- Player welcome page after share link (Phase 4 — FLOW-003)
