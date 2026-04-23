# Feature Specification: Landing Page Rebrand

**Feature Branch**: `002-landing-rebrand`  
**Created**: 2026-04-20  
**Status**: Verified  
**Input**: User description: "Implement the rebranding recommendations of .impeccable.md and use the /impeccable command list to generate a new user experience when accessing the site. Initial rebranding to cover the landing pages rather than the animation studio or the replay/sharing views at this point."

## Constitutional Compliance Gate *(mandatory — check before writing requirements)*

Verify this feature against [docs/authority/constitution.md](../../docs/authority/constitution.md):

- [x] **Tier alignment**: Tier 0 (Guest) and Tier 2 (Public) — landing page is publicly accessible, no auth required
- [x] **No telemetry**: Feature is purely visual/presentational — no new data collection
- [x] **No third-party analytics**: No external SDKs being added
- [x] **No hardcoded colors**: Design token changes go through `globals.css` CSS variables; entity colors unchanged
- [x] **Privacy gate**: No new data stored — this is a presentational change only
- [x] **Shared canvas risk**: Does not touch Canvas/, Stage.tsx, Field.tsx, PlayerToken.tsx, EntityLayer.tsx, or AnnotationLayer.tsx

> Design token table in `.specify/memory/constitution.md` updated to v3.4.2 (2026-04-20) to reflect the new cream palette per §Governance amendment procedure. All other checks pass.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — First Impression Clarity (Priority: P1)

A grassroots rugby coach finds the landing page through a search or link from another coach. Within a few seconds of arriving, they understand what the tool does and feel it was made for someone like them — not a corporate product, not a generic SaaS tool.

**Why this priority**: The landing page is the single highest-traffic touchpoint for new users. If it reads as generic or corporate, coaches bounce. If it communicates "tactical, direct, grassroots" immediately, they engage.

**Independent Test**: Visit `/` with no prior context. Ask a non-user "what does this tool do and who is it for?" They should answer correctly within 5 seconds of reading the above-the-fold content.

**Acceptance Scenarios**:

1. **Given** a first-time visitor arrives at `/`, **When** they view the hero section, **Then** the headline, subtext, and visual treatment together communicate a rugby coaching tool — not a generic productivity or sports analytics product
2. **Given** a first-time visitor arrives at `/`, **When** they scan the page, **Then** the amber accent appears on exactly one primary call-to-action button; all other interactive elements use muted, non-competing styles
3. **Given** a first-time visitor arrives at `/`, **When** they read the copy, **Then** language is plain, direct, and specific to rugby coaching — no marketing fluff or SaaS superlatives

---

### User Story 2 — Mobile Readability (Priority: P1)

A coach reads the landing page on their phone — possibly at the pitch, in outdoor light, with a 375px viewport. They can read all copy, tap the primary CTA, and navigate without pinching or horizontal scrolling.

**Why this priority**: The landing page is frequently experienced on mobile. Poor mobile readability directly causes coach drop-off before they ever reach the editor.

**Independent Test**: Open `/` on a 375px viewport (or mobile device). All text is readable without zooming. No horizontal scroll. Primary CTA is easily tappable.

**Acceptance Scenarios**:

1. **Given** a mobile visitor at 375px viewport, **When** they load `/`, **Then** no horizontal scroll appears and all text is legible at normal zoom
2. **Given** a mobile visitor with the phone at arm's length, **When** they read body text, **Then** the font size and weight make it readable in outdoor conditions (min 16px effective size, sufficient contrast)
3. **Given** a mobile visitor, **When** they tap the primary CTA button, **Then** the tap target is large enough to activate reliably without mis-tapping adjacent elements (min 44×44px)

---

### User Story 3 — Brand Expression Through Typography and Color (Priority: P2)

A returning user or peer coach notices the landing page has a visual quality that feels different from generic web tools — it references the physicality of a coaching whiteboard, a printed clipboard, a 1980s rugby programme. The aesthetic is light-themed, document-like, and utilitarian.

**Why this priority**: This is the rebranding ambition from the design context. It takes the page from "acceptable generic" to "authentically rugby coaching." It's distinct from P1 (comprehension) — this is about distinctiveness and trust-building over repeat visits.

**Independent Test**: Show the landing page to someone familiar with rugby coaching culture. Ask if it looks like it belongs in that world or like a generic tech product. The correct answer is "it belongs."

**Acceptance Scenarios**:

1. **Given** the landing page is loaded, **When** a user scans it, **Then** the typography uses a display/heading font that has deliberate ink weight or character — not Inter or a similarly generic sans-serif
2. **Given** the landing page is loaded, **When** a user views the background, **Then** the dominant neutral is cream, aged-white, or off-white — not pure white (#FFFFFF) or a startup grey (#F8F9FA barely distinguishable from white)
3. **Given** the landing page is loaded, **When** a user inspects the visual composition, **Then** no element resembles generic SaaS patterns: no gradient text, no glassmorphism, no cyan-on-dark hero, no feature cards with colorful icon squares that could belong to any software product

---

### User Story 4 — Accessibility Compliance (Priority: P1)

All text on the landing page meets WCAG AA contrast requirements so coaches with visual impairments or those viewing in bright outdoor light can read the content.

**Why this priority**: WCAG AA is stated as the non-negotiable baseline in the design context. Any typography or color change must be verified against this standard.

**Independent Test**: Run a WCAG AA contrast check on all text/background color combinations introduced or changed. All must return 4.5:1 or higher for body text.

**Acceptance Scenarios**:

1. **Given** any body text element on the landing page, **When** contrast ratio is measured against its background, **Then** the ratio is 4.5:1 or higher
2. **Given** any heading text element, **When** contrast ratio is measured, **Then** the ratio meets WCAG AA (4.5:1 for normal weight, 3:1 for bold text above 18pt)
3. **Given** the amber accent CTA button, **When** contrast ratio of button text against button background is measured, **Then** it meets 4.5:1

---

### Edge Cases

- What happens to the footer and navigation bar? These are incidentally in scope as part of the landing page visual frame — token changes will affect them. Navigation and footer should improve alongside the main page but are not the primary focus.
- What if a chosen display font fails to load? Body font fallback stack must still look intentional, not broken. Fallback should be a system serif or narrow sans rather than defaulting to browser sans-serif.
- Guest vs authenticated view of landing page: The landing page is the same for both states (Tier 0 and Tier 1) — no personalisation is in scope here.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The landing page MUST use a heading/display font that has deliberate ink weight or editorial character, distinct from Inter or system sans-serif defaults
- **FR-002**: The dominant background neutral MUST feel like a coaching document — cream, aged-white, or off-white — clearly distinct from pure white (#FFFFFF) and from the primary dark green
- **FR-003**: The amber accent color MUST appear as the primary CTA and nowhere else on a single viewport scroll — it is reserved for the single most important action
- **FR-004**: The overall page theme MUST be light; dark sections (primary green background) are used as contrast bands only, not as the primary visual mode
- **FR-005**: All text on the landing page MUST meet WCAG AA contrast (4.5:1 for body text) against its background
- **FR-006**: Zero border radius MUST be maintained throughout — no rounded corners on any element
- **FR-007**: Page content MUST be free of generic SaaS visual patterns (gradient text, glassmorphism, hover-to-reveal critical information, decorative icon grids that could belong to any software product)
- **FR-008**: The landing page MUST render without horizontal scroll at 375px viewport width

### Frontend Requirements

- **UI-001**: Typography tokens updated in `src/app/globals.css` — `--font-heading` and `--font-body` changed to reflect the new font selection; fallback stacks maintained
- **UI-002**: Color tokens refined in `src/app/globals.css` — `--color-background` and `--color-surface-warm` updated to achieve document-like warmth; primary and accent remain in the pitch-green/amber territory
- **UI-003**: Sharp corners only (`border-radius: 0`) — already enforced via `--border-radius: 0px` token; verify no component-level overrides are introduced
- **UI-004**: Feature cards section redesigned to avoid the "icon-in-colored-square" SaaS card pattern — layout and visual treatment should feel more editorial or printed-list in nature
- **UI-005**: Section vertical rhythm and whitespace updated to feel deliberate and document-like rather than padded-out SaaS spacer blocks
- **UI-006**: Mobile layout at 375px must have font sizes no smaller than 16px effective for body copy; CTA tap targets minimum 44×44px
- **UI-007**: New font(s) loaded via Next.js font system (`next/font`) to avoid layout shift and respect privacy (no external CDN requests at runtime)

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The hero section communicates the tool's purpose and rugby-specific target user without the visitor needing to read past the fold — verified by human review in T019 quickstart checklist
- **SC-002**: All text/background combinations on the landing page pass WCAG AA contrast (4.5:1 for body text) — verifiable with a contrast checker tool
- **SC-003**: `npm run lint && npx tsc --noEmit` passes with zero new errors introduced
- **SC-004**: The landing page renders without horizontal scroll at 375px viewport width — verifiable in browser DevTools
- **SC-005**: Amber accent color appears on exactly one primary CTA button per viewport — not duplicated in feature cards, section backgrounds, or decorative elements
- **SC-006**: The heading font is visually distinct from Inter and references the coaching document aesthetic (typographic character, deliberate weight) — verifiable by visual comparison

---

## Assumptions

- **Font loading**: Next.js `next/font` system is available and will be used to load any new typefaces. No external CDN font loading.
- **Gallery not in scope**: The gallery page (`/gallery`) is listed as Priority Area 2 in the design context. This spec covers only the home page (`/`). The navigation component and footer will be incidentally improved by token changes but are not the primary design focus.
- **Impeccable commands**: The `/impeccable` skill suite will be used during implementation to drive the actual design execution (bolder, colorize, typeset, etc.) — this spec defines the business requirements; the impeccable skills drive the craft.
- **Existing copy is sound**: The copy variants documented in `page.tsx` (Alt A: "Stop explaining. Start showing.") are approved direction. This spec does not change copy — it changes visual execution.
- **Token-first changes**: Color and typography changes go through `globals.css` CSS variables, not through per-component hardcoded values, to remain consistent with the existing architecture.
