# Feature Specification: Phase 2l — Cosmetic Polish

**Feature Branch**: `015-cosmetic-polish`
**Created**: 2026-05-01
**Status**: Draft
**Input**: User description: "Phase 2l Cosmetic Polish — wrap up Phase 2 with styling improvements and clarification of the animation creation/sharing process flow, while keeping the impeccable design standards in view."

## Constitutional Compliance Gate

Verify this feature against [docs/authority/constitution.md](../../docs/authority/constitution.md):

- [x] **Tier alignment**: Touches Tier 0 (landing/share-view for guests/players), Tier 1 (My Playbook search/parity, profile context, editor share), Tier 2 (gallery share-flow, public card hover/layout). No Tier 3 changes.
- [x] **No telemetry**: No new tracking, fingerprinting, or analytics introduced.
- [x] **No third-party analytics**: No new SDKs (Sentry, Mixpanel, GA, etc.).
- [x] **No hardcoded colors**: Thumbnail palette work (UX-012) and any new badges/buttons MUST go through design tokens / `EntityColors`. No raw hex literals.
- [x] **Privacy gate**: No new persistent user data. Profile gains optional non-PII context fields (club, region) — same scope class as existing profile fields, no retention change.
- [x] **Shared canvas risk**: This phase intentionally does NOT touch `Canvas/`, `Stage.tsx`, `Field.tsx`, `PlayerToken.tsx`, `EntityLayer.tsx`, or `AnnotationLayer.tsx`. Entity-depth shadows (UX-011) explicitly deferred to avoid shared-canvas regression risk. `MiniPitchSVG` (gallery card thumbnail) is in scope but is a standalone preview, not the live canvas.

> No constitutional conflicts identified.

---

## Clarifications

### Session 2026-05-01

- Q: Profile Club/Region storage approach? → A: Defer Club/Region entirely to Phase 4; profile work in 2l limited to layout/composition only.
- Q: Section 2 card 4 strategy? → A: Rewrite to a new coach-facing value proposition (preserves the 4-card grid).
- Q: Gallery vs Playbook visual signifier? → A: Combined — distinct titled page banner plus a subtle page-background differentiation.
- Q: Card layout stability strategy? → A: Reserved slots that collapse to a small fixed min-height when empty (tags row, progression strip).
- Q: Share-view title and "powered by" placement? → A: Animation title top-left of the share-view chrome; "powered by Coaching Animator" link bottom-right. Both on existing chrome layer; canvas sizing model unchanged.

---

## User Scenarios & Testing

### User Story 1 — Coach completes the share workflow without ambiguity (Priority: P1)

A coach finishes editing an animation, saves it, opens their My Playbook, finds the animation, shares the link with their squad via WhatsApp on mobile (or copy-paste on desktop), and the player who receives the link sees the animation title and a clear way to return to the gallery. The coach who owns the animation can return from the share view to their Playbook (not to the public gallery).

**Why this priority**: This is the core loop credibility test. Phases 2c and 2h shipped most of the plumbing, but four observable gaps remain: the editor's Share button shows "not available in development" with no fallback, the gallery's Play button still routes to the legacy `/replay/{id}`, the share view is missing the animation title, and the share-view back button is not context-aware for owners. Closing these gaps is what allows Phase 2 to claim the workflow-clarity exit criterion in full.

**Independent Test**: Visit `/app` → save → click Share → verify a modal/sheet provides the share link with a copy-to-clipboard fallback. Visit `/gallery` → click an animation's Play action → verify it opens `/share/{id}` (not `/replay/{id}`). Visit `/share/{id}` → verify the animation title is rendered and a "powered by Coaching Animator" link is present. Visit `/share/{id}` while signed in as the owner → verify the back button returns to `/my-gallery` (not `/gallery`). All four checks pass without source-code inspection.

**Acceptance Scenarios**:

1. **Given** a saved animation in the editor, **When** the coach clicks Share, **Then** a share sheet opens showing the `/share/{id}` URL with a copy-to-clipboard control and (on mobile) a Web Share API trigger that surfaces WhatsApp as a target.
2. **Given** a public animation card in the gallery, **When** the coach clicks Play (or the equivalent primary action), **Then** the browser navigates to `/share/{id}` for that animation — never `/replay/{id}`.
3. **Given** a player opens a share link on mobile, **When** the share view loads, **Then** the animation title is visible at the top-left of the chrome layer and a subtle "powered by" link sits at the bottom-right, returning them to the landing page when clicked.
4. **Given** an authenticated owner is viewing their own animation at `/share/{id}`, **When** they click the back button, **Then** they land on `/my-gallery`. Non-owners and guests still return to `/gallery`.

---

### User Story 2 — Coach manages My Playbook with the same affordances as the public gallery (Priority: P1)

A coach with a growing playbook wants to find a specific drill, immediately recognise its content from a thumbnail, see whether it has progressions, and take an Edit / Replay / Share action without guessing. Private animations they own must open when clicked. The Playbook page should also feel visually distinct from the public Gallery so they always know where they are.

**Why this priority**: Without parity and a working private-open path, the Playbook is functionally inferior to the public gallery the coach already understands, and a known bug (private animations not opening) blocks the most basic owner flow. This is the highest-severity grouping in the 2l backlog (one High bug + multiple usability gaps that compound at scale).

**Independent Test**: Sign in, visit `/my-gallery` with at least one private and one public animation present. Confirm: (a) a search/filter input is visible and narrows the set by title/tag; (b) cards show a tactical preview (mini-pitch) and a progression strip when applicable; (c) Edit / Replay / Share are clearly labelled primary actions on each card; (d) clicking a private animation opens it for the owner without an access error; (e) the page is visually distinguishable from `/gallery` at a glance (header treatment, background tint, or equivalent signifier).

**Acceptance Scenarios**:

1. **Given** an authenticated coach with ≥10 saved animations, **When** they type into the My Playbook search input, **Then** the visible cards filter to those whose title or tags match the query.
2. **Given** a saved animation that has progression children, **When** rendered as a Playbook card, **Then** the card displays the same tactical mini-pitch preview and progression strip used on public gallery cards.
3. **Given** the coach inspects a Playbook card, **When** they look for actions, **Then** Edit, Replay, and Share are presented as clearly labelled primary controls (text or icon+label, not hidden behind a single ambiguous click target).
4. **Given** a private animation owned by the signed-in coach, **When** they click it from My Playbook, **Then** it opens (in the appropriate route) without a 403/404 or "not available" message.
5. **Given** the coach navigates between `/gallery` and `/my-gallery`, **When** comparing the two pages, **Then** each page presents a distinct titled banner *and* a different subtle page-background tone, both persistent, telling them which page they are on without reading the URL.

---

### User Story 3 — A new visitor lands on a credible, on-brand landing page (Priority: P1)

A grassroots rugby coach visits the landing page on desktop or mobile. The hero feels rugby-specific (not generic SaaS), the value-proposition cards speak to coaches (not developers), no copy references deprecated export features, and the footer doesn't repeat the section above it.

**Why this priority**: Landing credibility is one of the original Phase 2 launch gates. Even with the Apr 20 rebrand, four open issues (LANDING-002/003/004 and UX-017) leak technical jargon, dead features, and visual duplication on the highest-traffic page. These are quick wins that protect the impressions the coach forms in the first ~10 seconds.

**Independent Test**: Open `/` in a fresh session on both desktop and mobile. Confirm: a subtle tactical-ball SVG asset is present in the hero background; Section 2 cards 2 and 4 read as rugby-coaching propositions with no mention of "code" or export formats; Section 3 card 1 accurately describes the click-to-place-then-drag interaction (not an ambiguous "drag?"); Section 3 card 3 contains no GIF-export claim; the footer/bottom-section pair no longer repeats the same links.

**Acceptance Scenarios**:

1. **Given** a visitor opens `/` on desktop, **When** the hero renders, **Then** a tactical-ball SVG (hand-drawn marker aesthetic, off-white textured background, pitch-green outline, amber tactical markings) is present as a subtle background element without competing with foreground copy.
2. **Given** a coach reads the Section 2 cards, **When** they reach card 2, **Then** the copy describes a coaching benefit in coach-facing language (no reference to "code" or developer concepts).
3. **Given** a coach reads the Section 2 cards, **When** they reach card 4, **Then** the card no longer references export formats and instead presents a coherent coach-facing value proposition; the 4-card grid layout is preserved.
4. **Given** a coach reads the Section 3 cards, **When** they reach card 1, **Then** the interaction is described accurately (entities are placed by clicking the palette, then optionally dragged to reposition).
5. **Given** a coach reads the Section 3 cards, **When** they reach card 3, **Then** there is no claim about exporting to GIF.
6. **Given** a visitor scrolls to the bottom of `/`, **When** the footer renders, **Then** it does not duplicate links from the section immediately above it.

---

### User Story 4 — Coach knows whether they are signed in, and the profile page reads as more than a bare form (Priority: P2)

A coach lands on any page and can immediately tell from the header whether they are signed in (and as whom). When they open their profile, the page composition has clear identity-surface treatment (heading, layout) rather than reading as a raw settings form — even though no new fields are introduced this phase.

**Why this priority**: UX-005 (auth state visibility) is rated High in ISSUES.md and is a usability blocker for new and returning users alike. PROFILE-001 is rated Low and the bespoke avatar work plus Club/Region fields have been deferred to Phase 4; the remaining "profile feels too functional" portion is a small layout/composition pass and pairs naturally with the header change.

**Independent Test**: Sign out → confirm the header shows a Login (or equivalent) affordance and no profile chip. Sign in → confirm the header shows a persistent indicator (avatar/initial chip or named control) of the authenticated state. Visit `/profile` → confirm the page composition reads as a coach identity surface (clear heading, sectioned layout) rather than a bare settings form.

**Acceptance Scenarios**:

1. **Given** a guest on any page, **When** they look at the header, **Then** a clearly labelled Login (or equivalent) action is visible without opening a menu.
2. **Given** an authenticated user on any page, **When** they look at the header, **Then** a persistent indicator (e.g., profile chip with initial/avatar or a named control) confirms the signed-in state without opening a menu.
3. **Given** an authenticated coach visits `/profile`, **When** the page renders, **Then** the page composition reads as an identity card (clear heading hierarchy, sectioned layout) rather than a flat settings form, using only the existing profile fields.

---

### User Story 5 — Gallery and Playbook cards feel consistent, branded, and stable (Priority: P2)

A coach browsing cards in either gallery sees consistent hover behaviour on action buttons, a stable layout that does not jump when tags or progression badges are present or absent, thumbnails whose colours match the actual editor experience (pitch green / red / blue / hi-vis yellow), and a Hampshire RFU endorsement badge on endorsed cards.

**Why this priority**: Each issue here is individually low-severity but together they erode the "this is for rugby coaches" credibility. Pulling them into one design pass alongside the parity work (US 2) is cheaper than threading them across multiple later phases. RFU asset (GALLERY-001) is the highest-value item in this group because it cashes in already-shipped wiring (FEATURE-001).

**Independent Test**: Visit `/gallery` and `/my-gallery`. Confirm: hover any action button on a card and observe consistent visual feedback; cards with tags vs no tags occupy the same vertical footprint; cards with progressions vs none also do not shift other cards; mini-pitch thumbnails render in pitch green with red/blue team players and hi-vis yellow cones; cards flagged as endorsed (`endorsed_by` set) display the RFU badge as a compressed image asset under 50 KB.

**Acceptance Scenarios**:

1. **Given** a coach hovers any action button on a gallery card, **When** the hover settles, **Then** the visual feedback (colour/tone change) is consistent across Share, Remix, Play, and any other card actions.
2. **Given** two gallery cards — one with tags + progression count and one with neither, **When** rendered side by side, **Then** their outer footprint and internal element positions do not differ in a way that makes the grid jump.
3. **Given** the tactical mini-pitch preview renders on a card, **When** it appears, **Then** the pitch is rugby green, players use the editor team colours (red attack / blue defence), and cones use hi-vis yellow.
4. **Given** an animation has `endorsed_by` set, **When** its card renders, **Then** the Hampshire RFU badge is shown using a compressed asset under 50 KB.
5. **Given** the templates filter on `/gallery`, **When** the user toggles or selects a template scope, **Then** the filter behaves correctly end-to-end (creation tagging, gallery filter, template remix flow) with no regression from the architecture refactor.

---

### Edge Cases

- **No animations to display in My Playbook**: search/filter UI must remain visible (or render a sensible empty state); filtering an already-empty list must not crash.
- **Share sheet on browsers without Web Share API**: must gracefully fall back to clipboard copy + visible URL; no dead button.
- **Owner views their own private animation while signed out in a second tab**: existing tier rules apply; this phase does not change the access model, only the click-through behaviour for the signed-in owner.
- **Tactical-ball SVG on very small viewports**: must not cover or compete with hero copy; reduce opacity or scale gracefully on widths under 480 px.
- **RFU badge asset > 50 KB**: build/lint must surface this so a regression cannot ship.
- **Reduced motion users**: any new hover transitions or hero element must respect `prefers-reduced-motion`.
- **Long animation titles in share view**: title must truncate or wrap gracefully without breaking the canvas chrome.
- **Logged-out user on `/share/{id}`**: back button still returns to `/gallery` (current behaviour preserved); only the owner case changes.

---

## Requirements

### Functional Requirements

**Share-flow clarity (US 1)**

- **FR-001**: Editor MUST present a working Share affordance that produces the `/share/{id}` link via a UI surface with at minimum a copy-to-clipboard fallback. The "not available in development" placeholder MUST be removed.
- **FR-002**: On mobile-class viewports, the editor and gallery share controls MUST invoke the Web Share API when available, surfacing system share targets (including WhatsApp) without requiring app-specific code paths.
- **FR-003**: Gallery primary "Play" action MUST navigate to `/share/{id}`. The legacy `/replay/{id}` route MUST NOT be the destination of any user-facing action surfaced in `/gallery` or `/my-gallery` after this phase.
- **FR-004**: `/share/{id}` MUST display the animation title at the top-left of the share-view chrome layer. The title MUST use `font-heading` and MUST truncate or wrap gracefully without altering canvas sizing.
- **FR-005**: `/share/{id}` MUST include a subtle attribution link (e.g., "powered by Coaching Animator") at the bottom-right of the share-view chrome layer, returning the visitor to the landing page. The link MUST NOT compete with the bottom-anchored floating remote or the back-button region.
- **FR-006**: `/share/{id}` back navigation MUST be context-aware: if the viewer is the authenticated owner of the animation, the back target is `/my-gallery`; otherwise (guest or non-owner) it remains `/gallery`.

**Gallery / Playbook parity (US 2 & US 5)**

- **FR-007**: My Playbook MUST provide a search/filter control with parity to the public Gallery (matching by title and tags).
- **FR-008**: My Playbook cards MUST render the tactical mini-pitch preview and progression strip used on public Gallery cards.
- **FR-009**: My Playbook cards MUST present Edit, Replay, and Share as clearly labelled primary actions.
- **FR-010**: A private animation owned by the signed-in user MUST open from My Playbook without an access error.
- **FR-011**: `/gallery` and `/my-gallery` MUST each render a distinct titled page banner (different copy and supporting tactical motif) AND a subtle page-background differentiation. Together these must make the page identity recognisable at a glance without reading the URL. Banner styling MUST comply with impeccable rules (zero radius, `font-heading` on the title, cream/pitch-green palette, amber not used).
- **FR-012**: Hover feedback on gallery card action buttons (Share, Remix, Play, etc.) MUST be visually consistent across actions.
- **FR-013**: Card layout MUST use reserved slots for the tag row and the progression strip. When either is absent, the slot MUST collapse to a small fixed minimum height so neighbouring elements do not jump, while the overall card height adjusts cleanly (no padded-empty-rectangle effect). Outer footprint and element positions MUST remain stable across cards with and without these badges.
- **FR-014**: The tactical mini-pitch preview (`MiniPitchSVG`) MUST use a colour palette representative of the editor: pitch green field, red attack / blue defence player markers, hi-vis yellow cones. All colour values MUST resolve through existing design tokens / `EntityColors` (no new hardcoded hex).
- **FR-015**: When an animation has `endorsed_by` set, its card MUST display the Hampshire RFU endorsement badge using a production image asset compressed to under 50 KB.
- **FR-016**: Templates creation, tagging, gallery filter, and remix flow MUST be verified end-to-end and any regression introduced by the prior architecture refactor MUST be closed.

**Landing polish (US 3)**

- **FR-017**: Landing hero MUST include a tactical-ball SVG background element with a hand-drawn marker aesthetic (heavy stroke, imperfect lines, zero rounded corners), pitch-green outline, amber tactical markings, on an off-white textured background per the design note in ISSUES.md (LANDING-002).
- **FR-018**: Section 2 card 2 copy MUST be rewritten to address rugby coaches with coaching-relevant language; no reference to "code" or developer concepts.
- **FR-019**: Section 2 card 4 MUST be rewritten to a new coach-facing value proposition that contains no reference to export/GIF/WebM features. The 4-card grid layout MUST be preserved (card 4 is not removed).
- **FR-020**: Section 3 card 1 MUST describe the actual interaction model accurately (click to place from palette, drag to reposition).
- **FR-021**: Section 3 card 3 MUST NOT reference exporting to GIF.
- **FR-022**: The landing footer MUST NOT duplicate links from the section immediately above it; the bottom of the page MUST present a single, coherent footer.

**Header & profile context (US 4)**

- **FR-023**: The site header MUST display a persistent indicator of authentication state — a Login (or equivalent) action for guests; a profile chip / named control for authenticated users — visible on all pages without opening a menu.
- **FR-024**: The Profile page MUST present its composition as a coach identity card rather than a bare settings form, using layout, heading hierarchy, and sectioning of the existing profile fields only. No new profile fields are introduced this phase. (Bespoke rugby-themed avatar illustrations and Club/Region fields are explicitly out of scope and deferred to Phase 4.)

**Cross-cutting**

- **FR-025**: No new feature surface introduced in this phase MAY add telemetry, analytics, third-party SDKs, or hardcoded entity colours.
- **FR-026**: All new copy and UI surfaces MUST meet WCAG AA contrast (4.5:1 for body text, 3:1 for large text/icons) and respect `prefers-reduced-motion` for any animation.

### Frontend Requirements

- **UI-001**: Components live in their existing feature directories; new components (e.g. tactical-ball SVG asset, share sheet) belong in `src/features/<feature>/components/` or `src/shared/components/` if reusable.
- **UI-002**: Styling uses Tailwind classes; design tokens from `tailwind.config` (pitch green, cream/aged-white neutral, amber accent). Amber is reserved for singular CTAs and MUST NOT proliferate to badges, hovers, or chrome introduced this phase.
- **UI-003**: Sharp corners only (`rounded-none`); no soft drop shadows; no `bg-white` introduced on editor or share surfaces (Phase 3f audit P1 lines).
- **UI-004**: Display headings introduced or rewritten this phase (landing card titles, share-view animation title, Playbook card titles, profile heading) MUST use the established display font (Oswald / `font-heading`).
- **UI-005**: Hover state styling for card action buttons MUST use a single shared utility/class so consistency is enforced structurally rather than by inspection.
- **UI-006**: Card layout MUST use stable slots (header / preview / tag row / progression strip / footer). Tag row and progression strip MUST be reserved slots that collapse to a small fixed min-height when empty so neighbouring elements do not displace.

### API / Database Requirements

- **API-001**: No new API routes are introduced. Existing routes used by the share flow (`POST /api/share`) and gallery endpoints are unchanged.
- **API-002**: The `endorsed_by` column shipped via 009-gallery-playbook is reused as-is; only the production image asset is added.
- **API-003**: No new profile fields, columns, or migrations are introduced this phase. Profile work is layout/composition only over existing fields.

### Canvas / Animation Requirements

- **CV-001**: This phase explicitly does NOT modify `Stage.tsx`, `Field.tsx`, `PlayerToken.tsx`, `EntityLayer.tsx`, or `AnnotationLayer.tsx`. Any change that would do so is out of scope and must be re-spec'd.
- **CV-002**: `ShareViewer` keeps `position:fixed inset:0`. The share-view title and "powered by" link are added to the existing chrome layer, not by changing the canvas sizing model.
- **CV-003**: Mini-pitch thumbnail (`MiniPitchSVG`) entity colours MUST resolve through existing tokens / `EntityColors`. No new hex literals.

### Key Entities

No new entities are introduced and no entities are modified. Existing entities (`Animation`, `Profile`, `endorsed_by` column on `animations`) are reused unchanged. Club and Region as profile fields have been deferred to Phase 4.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: A coach can complete the full loop — edit → save → Share (from editor or gallery card) → player opens link with title visible → owner returns to `/my-gallery` — with zero references to a non-functional Share button and zero `/replay/{id}` destinations from public surfaces.
- **SC-002**: My Playbook supports search/filter, renders cards at full feature parity with the public Gallery (preview + progression strip + clear Edit/Replay/Share actions), and opens private owner-owned animations without error.
- **SC-003**: Landing page on a fresh session has zero copy referencing "code" (in coach-facing context), zero references to export/GIF/WebM features, accurate interaction copy on Section 3 card 1, and no duplicated footer links.
- **SC-004**: Authentication state is visible in the header on every page in both signed-in and signed-out states without opening a menu.
- **SC-005**: Gallery cards display consistent hover feedback across all action buttons and a stable layout with or without tags/progression badges.
- **SC-006**: Endorsed gallery cards display the Hampshire RFU badge using a production image asset under 50 KB.
- **SC-007**: Tactical mini-pitch preview uses pitch green, red attack / blue defence player colours, and hi-vis yellow cones — all via existing design tokens.
- **SC-008**: Templates creation → tagging → gallery filter → remix flow passes an end-to-end check with no regression from the architecture refactor.
- **SC-009**: `npm run lint && npx tsc --noEmit` passes with no new errors. Existing E2E suite remains green.
- **SC-010**: Impeccable design audit re-score on touched surfaces is **≥18/20** (Phase 3f exit criterion). Zero `rounded-*` and zero `bg-white` introduced on editor/share surfaces; `font-heading` applied to new/rewritten headings.
- **SC-011**: All acceptance scenarios across User Stories 1–5 are covered by either an existing test, a new unit test, or an E2E scenario.

---

## Assumptions

- A1. The `endorsed_by` column and badge slot on gallery cards already exist (shipped via 009-gallery-playbook); only the production RFU image asset and its compressed delivery are new.
- A2. The Web Share API is broadly available on mobile browsers used by grassroots rugby coaches (Safari iOS, Chrome Android); a clipboard-copy fallback covers desktop and any non-supporting browser.
- A3. The current `MiniPitchSVG` component is the right place to update thumbnail colours; no new thumbnail component is required.
- A4. `font-heading` (Oswald) is already wired through Tailwind / fonts; this phase only applies it to additional headings, not introduces it.
- A5. Profile work is composition-only over existing fields; no schema or data-shape changes.
- A6. The existing share-view chrome (introduced in 011-workflow-clarity) has room to host an animation title and a small attribution link without redesigning the layout.
- A7. The audit-2026-04-24 framework / `impeccable:audit` skill provides the scoring mechanism for SC-010; no new audit tooling is built in this phase.

## Scope Boundaries

**In scope** (5 workstreams, ~22 issues):

- Workstream 1 — Landing polish: LANDING-002, LANDING-003, LANDING-004, UX-017.
- Workstream 2 — Gallery / Playbook parity: MYPLAYBOOK-001, MYPLAYBOOK-002, MYPLAYBOOK-003, MYPLAYBOOK-004, UX-013, UX-014, UX-015, UX-012, GALLERY-001, GALLERY-003.
- Workstream 3 — Share-flow clarity: EDITOR-002, GALLERY-002, FLOW-001, FLOW-002, FLOW-004.
- Workstream 4 — Header / profile context: UX-005, PROFILE-001 (composition/layout only — no avatars, no Club/Region fields).
- Workstream 5 — Impeccable audit pass on touched surfaces.

**Out of scope (explicit)**:

- LANDING-001 (app rename — constitutional amendment).
- PROFILE-001 bespoke avatar library (deferred to Phase 4).
- Profile Club/Region fields and any associated schema changes (deferred to Phase 4).
- UX-011 entity depth shadows (shared-canvas regression risk).
- NAV-001 tab indicator redesign (separate nav effort).
- EDITOR-011 / EDITOR-012 / EDITOR-014 (editor entity behaviour — future phase).
- FLOW-003 player welcome page (Phase 4 per ROADMAP).
- All Phase 3+ items (security, perf baseline, search & layering, admin bulk delete).

## Dependencies

- D1. `endorsed_by` column and badge slot already shipped (009-gallery-playbook).
- D2. Share workflow plumbing already shipped (006-share-workflow / 2c).
- D3. Workflow clarity navigation already shipped (011-workflow-clarity / 2h) — this phase adds the title, attribution, and owner-aware back to the existing chrome.
- D4. Snap-to-grid, Editor Workspace Remodel, and User Guide (013, 012, 014) shipped — no conflicts expected.

## References

- ROADMAP: `docs/authority/ROADMAP.md` (§ Phase 2l — Cosmetic Polish)
- Issues: `docs/issues/ISSUES.md`
- Design: `.impeccable.md`
- Plan file: `~/.claude/plans/i-am-close-to-warm-newell.md`
