# Feature Specification: Landing Refinements (Phase 2e)

**Feature Branch**: `008-landing-refinements`  
**Created**: 2026-04-26  
**Status**: Draft  
**Input**: Phase 2e — Landing Refinements; issues LANDING-001 through LANDING-004

## Constitutional Compliance Gate *(mandatory — check before writing requirements)*

- [x] **Tier alignment**: Tier 0 (Guest) — landing page is publicly accessible, no authentication required
- [x] **No telemetry**: No new tracking or analytics introduced
- [x] **No third-party analytics**: SVG assets are inline or self-hosted; no external asset services
- [x] **No hardcoded colors**: Tactical ball SVG uses brand token values from `tailwind.config` (pitch-green #1A3D1A, warm-accent #D97706)
- [x] **Privacy gate**: No new data stored; landing page is read-only
- [x] **Shared canvas risk**: Does not touch any Canvas components

> No constitutional conflicts.

---

## Background & Design Context

This feature addresses four open issues against the landing page identified in the 2026-04-24 product review. The intent is not merely to correct errors but to present an intentional landing page that gives coaches the confidence to use the app — elevating the brand from plain functional tooling to inspiring grassroots coaches to enhance their understanding of the art and science of coaching and boost their own performance for the betterment of their players.

**Design system reference**: `.impeccable.md`
- Brand personality: **direct · tactical · grassroots**
- Aesthetic: coaching whiteboard, hand-drawn marker, 1980s printed rugby programme
- Typography: sharp corners, deliberate ink weight, no rounded elements
- Palette territory: pitch-green (#1A3D1A) dominant, warm amber (#D97706) reserved for singular CTAs
- The whiteboard aesthetic is itself a community artefact — it references something coaches have always shared (the session plan on the board). The community narrative is carried by copy, not by softening the visual language.

**Impeccable skills recommended for design work**:
- `/impeccable:shape` — for refining the tactical ball SVG geometry and composition
- `/impeccable:clarify` — for tightening the hero mission statement and card copy against the "direct · community" brand principles
- `/impeccable:colorize` — if palette adjustments are needed for the background treatment

---

## Clarifications

### Session 2026-04-26

- Q: What is the structural scope of the landing page changes? → A: Hero mission statement + card rewrites — add or replace the hero copy with a short mission-level statement about coaches building the grassroots game together, and rewrite all cards to match that aspirational community tone. No new structural sections.
- Q: What emotional hook should the hero mission statement centre on? → A: Community and shared knowledge — the statement centres on coaches building the grassroots game together ("Grassroots rugby's shared playbook, built by coaches for coaches").
- Q: Does the community framing change the visual register? → A: No — visual language stays strictly tactical/whiteboard; community is expressed through copy only; no human imagery or warmth added.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Inspiring Community-Centred Hero (Priority: P1)

A coach discovers the landing page and, before reading a single feature card, encounters a short mission statement in the hero section that speaks directly to why they coach and what this community offers them. The hero copy centres on coaches building the grassroots game together — the tool is positioned as the shared resource of that community, not as a product.

**Why this priority**: The hero is the first thing every visitor reads. A mission-level statement that centres community immediately signals this is not a generic SaaS tool — it is something built by coaches for coaches. This is the primary vehicle for the aspirational elevation the feature intends.

**Independent Test**: Visit the landing page. The hero section contains a primary headline or subheadline that communicates a community/grassroots coaching mission. It does not lead with feature descriptions or tool capabilities. It speaks to the coach's motivation, not the product's functionality.

**Acceptance Scenarios**:

1. **Given** the landing page loads, **When** the hero is visible, **Then** the primary headline or subheadline communicates a coaching community mission — not a product feature description.
2. **Given** the hero copy is read, **When** assessed against brand principles, **Then** it is direct (no marketing fluff), tactical (grounded in coaching reality), and grassroots (volunteer/community spirit, not corporate).
3. **Given** the hero mission statement is present, **When** the page is read end-to-end, **Then** the card copy in Section 2 and Section 3 is tonally consistent with the mission — inspiring and coach-centric, not functional and feature-centric.

---

### User Story 2 — Accurate, Coach-Centric Feature Cards (Priority: P1)

A coach reading the landing page feature cards encounters only accurate, current capabilities described in rugby coaching language. No card references deprecated features (GIF export) or developer-centric concepts ("code"). Every card connects a capability to a coaching benefit.

**Why this priority**: Incorrect copy undermines trust. A card referencing GIF export creates confusion for a feature that no longer exists. A card referencing "code" alienates the target audience. Both contradict the community-for-coaches positioning the hero now establishes.

**Independent Test**: Visit the landing page on desktop and mobile. Read every card in Section 2 and Section 3. No card mentions GIF, WebM, or export formats. No card references programming, code, or technical implementation. Every card describes a coaching action or coaching benefit consistent with the community/grassroots tone.

**Acceptance Scenarios**:

1. **Given** the landing page loads, **When** a coach reads Section 2 cards, **Then** no card mentions code, programming, GIF, WebM, or export formats.
2. **Given** Section 2 card 2 previously referenced "code", **When** viewed after this change, **Then** it describes a coaching-specific benefit in plain language consistent with the community mission.
3. **Given** Section 2 card 4 previously described deprecated export functionality, **When** viewed after this change, **Then** it either presents a different genuine value proposition or the slot is removed.
4. **Given** Section 3 card 1 previously said "Drag?", **When** viewed after this change, **Then** it accurately describes the click-to-place then drag interaction in coaching language.
5. **Given** Section 3 card 3 previously referenced "Export to GIF", **When** viewed after this change, **Then** the GIF export mention is removed; the card either presents a different capability or is removed.

---

### User Story 3 — Hero Background Illustration (Priority: P2)

A coach landing on the hero section sees a composed background illustration that immediately and unmistakably signals "rugby coaching tool." The illustration is not a photograph, stock image, or generic graphic. It is a hand-drawn, whiteboard-marker-style SVG composition referencing the visual language coaches already share — pitch markings, a rugby ball, equipment silhouettes, and tactical notation sketched as if on a coaching board. The illustration bleeds toward the edges of the hero, feels like it belongs behind the content, and does not compete with the headline or CTAs.

**Why this priority**: The landing page currently has no visual signal that communicates the tool's purpose before a word is read. A composed background illustration — rather than a single ball — creates a richer sense of the coaching world without increasing cognitive load, since it sits behind the content at low opacity. It is deliberately scoped to the hero section in this phase; the structure is designed to accommodate subtle animation or parallax in a future phase without requiring a structural rewrite.

**Independent Test**: Visit the landing page on desktop. The hero section has a visible background illustration composed of multiple rugby-specific elements. The illustration does not obscure the headline, subheadline, or CTAs. The style is consistent with the brand logo (hand-drawn, pitch-green outlines, amber tactical markings). No interactive behaviour is present.

**Acceptance Scenarios**:

1. **Given** the landing page loads, **When** the hero section is visible, **Then** a background illustration is present as a decorative layer behind the hero text — not as inline content.
2. **Given** the illustration is rendered, **When** inspected visually, **Then** it contains at least three distinct rugby-specific element types (e.g., ball, pitch marking, equipment silhouette, or tactical annotation).
3. **Given** the illustration is rendered, **When** inspected visually, **Then** all elements follow the brand logo aesthetic: hand-drawn heavy strokes, pitch-green (#1A3D1A) outlines, amber (#D97706) tactical markings, imperfect non-geometric paths, zero rounded corners.
4. **Given** a mobile viewport (<768px), **When** the hero section is visible, **Then** the illustration is either hidden or reduced sufficiently in prominence that it does not obscure the headline, subheadline, or primary CTA.
5. **Given** the page loads, **When** the user has `prefers-reduced-motion` set, **Then** the illustration is fully static — no CSS animation of any kind.
6. **Given** the illustration is a background decoration, **When** a screen reader traverses the page, **Then** the SVG has `aria-hidden="true"` and contributes nothing to the accessibility tree.

---

### User Story 4 — App Name Evaluation (Priority: P3)

The team has documented candidate names that meet the brand principles (direct · tactical · grassroots) and the community/coaching-education aspiration, are sport-agnostic but rugby-rooted, and reflect the "shared playbook for grassroots coaches" positioning. No implementation change is made as part of this feature; a decision artefact is produced for a future constitutional amendment.

**Why this priority**: "Coaching Animator" is accurate but not memorable and does not reflect the community and coaching elevation aspiration. However, a name change requires a constitutional amendment and is decoupled from the copy corrections — it must not block P1/P2 delivery.

**Independent Test**: A documented shortlist of candidate names exists at `specs/008-landing-refinements/research.md`, evaluated against brand criteria and the community/coaching-education positioning.

**Acceptance Scenarios**:

1. **Given** the evaluation is complete, **When** the research artefact is reviewed, **Then** it contains at least 5 candidate names assessed against the brand principles and the community/coaching-elevation framing.
2. **Given** a preferred candidate is identified, **When** reviewed against the constitution, **Then** the spec notes what constitutional amendment would be required to adopt it.

---

### Edge Cases

- If Section 2 card 4 is removed (not replaced), the card grid must reflow gracefully — validate on all breakpoints.
- If Section 3 card 3 is removed, the same reflow validation applies.
- The hero background illustration must not cause layout shift (CLS). Implement as a positioned decorative layer outside document flow.
- If the SVG is complex, inline it in the component rather than referencing an external file to avoid a "pop-in" on first paint.
- The hero mission statement must not exceed two short lines on mobile — test at 375px viewport width.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The hero section MUST include a short mission-level statement centred on the coaching community — coaches building the grassroots game together. This statement replaces or augments existing hero copy; it does not appear as a feature card.
- **FR-002**: Section 2, card 2 MUST be rewritten. The revised copy MUST describe a coaching benefit in rugby-specific language, consistent with the community mission tone. It MUST NOT reference code, programming, or technical concepts.
- **FR-003**: Section 2, card 4 MUST be removed or replaced. If removed, the card grid MUST reflow without empty gaps. If replaced, the new copy MUST describe a genuine, live capability in coach-centric language.
- **FR-004**: Section 3, card 1 MUST be rewritten to accurately describe the interaction model: click to place entities, then drag to position.
- **FR-005**: Section 3, card 3 MUST have any reference to "Export to GIF" removed. If the remaining copy is incoherent, the card is replaced or removed.
- **FR-006**: The hero section MUST include a composed background illustration rendered as an SVG, positioned as a decorative layer behind the hero content. The illustration MUST contain at least three distinct rugby-specific element types drawn in the hand-drawn whiteboard marker aesthetic of the brand logo: elements from pitch markings (lines, posts, try line), equipment (ball, cones, tackle bags), and tactical notation (arrows, running lines, X-marks).
- **FR-007**: The background illustration SVG MUST render with `aria-hidden="true"` and contribute nothing to the accessibility tree. It MUST be structured so that future animation (CSS transitions, scroll-based parallax) can be applied to individual element groups without requiring a structural rewrite of the markup.
- **FR-008**: A name evaluation artefact MUST be produced at `specs/008-landing-refinements/research.md` documenting at least 5 candidate names assessed against brand criteria and the community/coaching-elevation positioning. No production UI change is required.

### Frontend Requirements

- **UI-001**: All landing page copy changes are confined to the landing page component(s); no shared components are modified.
- **UI-002**: Illustration strokes use two colour treatments. Structural outlines (pitch markings, equipment shapes): off-white `#f5f0e8` at approximately 18% opacity — a chalk-on-board effect visible against the dark hero background (`bg-primary` = #1A3D1A). Tactical markings (arrows, X-marks, direction lines): warm-accent `#D97706` at approximately 55% opacity. Neither colour is applied to entity logic; these are SVG presentation attributes only.
- **UI-003**: All SVG paths use `stroke-linecap="butt"`, `stroke-linejoin="miter"` — zero rounded line endings, consistent with the broader design system and brand logo.
- **UI-004**: The illustration is positioned decoratively (CSS `position: absolute`, `pointer-events: none`) and does not participate in document flow. The parent hero section must have `position: relative` and `overflow: hidden`.
- **UI-005**: On mobile viewports (<768px), the illustration is either hidden (`hidden md:block`) or reduced to an opacity that does not compete with the headline, subheadline, or primary CTA.
- **UI-006**: All SVG paths are intentionally imperfect — non-geometric Bezier curves that reference a hand-drawn marker, not a vector drawing application. Perfect ellipses and straight ruler lines are not acceptable.
- **UI-010**: Individual element groups within the SVG MUST be wrapped in `<g>` elements with descriptive IDs (e.g., `id="ball"`, `id="pitch-lines"`, `id="arrows"`) to enable future animation targeting without structural change.
- **UI-007**: All revised card copy must pass the "30-second coach" test: legible at a glance, no jargon, immediately communicates a coaching benefit.
- **UI-008**: The visual language remains strictly tactical/whiteboard throughout. No human imagery, softened textures, or warmth is introduced. The community narrative is carried by copy alone.
- **UI-009**: The hero mission statement must be no longer than two short lines at 375px viewport width without truncation or overflow.

### Design Process Notes

This feature is a design task before it is an implementation task. The recommended workflow:

1. Run `/impeccable:clarify` to draft and evaluate the hero mission statement against the brand principles (direct · tactical · grassroots) and the community/coaching-elevation intent before writing any markup.
2. Run `/impeccable:shape` to design and iterate on the hero background illustration composition — element selection, placement, density, and path quality. The brand logo (`public/assets/logo.png`) is the primary aesthetic reference. The illustration must feel like it comes from the same hand.
3. Run `/impeccable:clarify` again on each rewritten card to validate tone consistency with the hero mission before committing to final copy.
4. Run `/impeccable:colorize` only if the background treatment introduces contrast concerns against the existing hero palette.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The hero section contains a mission statement that, when read in isolation, communicates a coaching community purpose — not a product feature list.
- **SC-002**: A coach reading Section 2 encounters zero references to deprecated features (GIF, WebM, export formats) and zero developer-centric language.
- **SC-003**: A coach reading Section 3 card 1 understands the interaction model (click-to-place, drag-to-reposition) without requiring additional explanation.
- **SC-004**: The hero background illustration is visible on desktop (≥768px), contains at least three distinct rugby-specific element types, and does not overlap or obscure the headline, subheadline, or primary CTA on any breakpoint.
- **SC-005**: WCAG AA contrast is maintained — the background illustration does not reduce text contrast below 4.5:1 for any hero body copy or CTA label.
- **SC-006**: The hero mission statement fits within two lines at 375px viewport width with no truncation.
- **SC-007**: `npm run lint && npx tsc --noEmit` passes with no new errors after all changes.
- **SC-008**: The name evaluation artefact exists at `specs/008-landing-refinements/research.md` with at least 5 candidates evaluated against the community/coaching-elevation framing.

---

## Assumptions

1. **LANDING-001 is documentation-only in this phase.** No production name change is in scope. The evaluation artefact feeds a future decision; a constitutional amendment is required before any name change ships. Name candidates should now be evaluated against the community/coaching-elevation framing, not just the original brand criteria.
2. **Section 2 and Section 3 are distinct sections on the landing page.** If the page layout has changed since the issue was written, the implementer should re-map the cards to current DOM structure before making copy changes.
3. **The background illustration is purely static in this phase.** No CSS keyframe animation is applied. The "hand-drawn" quality comes from SVG path imperfection, not motion. The `<g>` group structure is future-proofed for animation without being animated now.
4. **Card slot removal is preferred over placeholder replacement** for both Section 2 card 4 and Section 3 card 3 if no high-quality replacement copy can be identified during implementation. A tight, honest grid of fewer cards is better than a padded grid with filler content.
5. **The brand icon in `src/shared/components/BrandIcon.tsx` is the reference aesthetic, not a source component.** The background illustration is a new, independently created SVG. It draws on the same visual language (same stroke style, same colours) but is not derived from the BrandIcon component.
6. **The whiteboard aesthetic is itself a community artefact.** The decision not to introduce visual warmth is deliberate — the hand-drawn coaching diagram references something coaches have always shared. Community is expressed through copy, not visual softening.
7. **Illustration is hero-only in this phase.** Future phases may extend the illustration to span the full page or introduce scrolling/parallax. The current scope is the hero `<section>` only. No structural changes are required to extend it later provided the `<g>` group structure is clean.

---

## Dependencies

- `.impeccable.md` — design system reference for all SVG and copy work
- `src/app/page.tsx` (or equivalent landing page file) — primary change target
- No database, API, or auth changes required
- No shared Canvas components affected
