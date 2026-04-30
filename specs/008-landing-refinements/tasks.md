# Tasks: Landing Refinements (Phase 2e)

**Input**: `specs/008-landing-refinements/plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`
**Branch**: `008-landing-refinements`
**Date**: 2026-04-26

**Tests**: Not requested in spec — no test tasks generated. Manual verification steps are in `specs/008-landing-refinements/quickstart.md`.

**Organization**: Tasks are grouped by user story. US1 and US2 are both P1 and touch the same file (`page.tsx`) — complete US1 fully before US2. US3 (P2) can begin after US1 and US2 are verified. US4 (P3) is documentation-only and can run in parallel at any time.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no incomplete dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Exact file paths in every task description

## Path Conventions

```
Landing page:  src/app/page.tsx
New component: src/app/_components/HeroBackground.tsx
Name research: specs/008-landing-refinements/research.md

Design gates:  /impeccable:clarify  (copy validation)
               /impeccable:shape    (SVG composition design)

Pre-push:      npm run lint && npx tsc --noEmit
Manual test:   npm run dev  (port 3000)
```

---

## Phase 1: Setup

**Purpose**: Confirm baseline is clean before any changes land.

- [ ] T001 Verify `npm run lint && npx tsc --noEmit` passes on branch `008-landing-refinements` with zero errors before writing any code

---

## Phase 2: User Story 1 — Inspiring Community-Centred Hero (Priority: P1) 🎯 MVP

**Goal**: The hero section carries a short mission-level statement centred on the grassroots coaching community. Headline, subheadline, and CTA labels all swap from Alt A to the refined Alt C framing.

**Independent Test**: Visit `http://localhost:3000`. Hero headline reads "Rugby tactics, drawn by coaches like you". Subheadline references "grassroots coaching community" and "help every coach on your touchline get better". CTA 1 reads "Start drawing free" (links to `/app`). CTA 2 reads "Browse the community playbook" (links to `/gallery`). At 375px width, headline fits in two lines with no truncation or overflow.

### Implementation for User Story 1

- [ ] T002 [US1] Design gate — run `/impeccable:clarify` with the following draft for validation against brand principles (direct · tactical · grassroots) before touching any code:
  - Headline: "Rugby tactics, drawn by coaches like you"
  - Subheadline: "A free tool for the grassroots coaching community. Draw plays, share sessions, and help every coach on your touchline get better."
  - CTA 1: "Start drawing free"
  - CTA 2: "Browse the community playbook"
  - Confirm or refine before proceeding to T003
- [ ] T003 [US1] Swap hero section copy to the approved Alt C variant in `src/app/page.tsx`:
  - Replace the `<h1>` text with the approved headline
  - Replace the `<p>` subheadline text with the approved subheadline
  - Update CTA 1 `<a>` label to "Start drawing free" (keep `href="/app"`)
  - Update CTA 2 `<a>` label to "Browse the community playbook" (keep `href="/gallery"`)
  - Update the comment block at the top of the file: mark Alt A as deprecated, mark Alt C as ACTIVE
- [ ] T004 [US1] Manually verify hero renders correctly at three viewports:
  - 375px: headline fits two lines, no overflow; subheadline readable; both CTAs visible
  - 768px: layout correct, no wrapping issues
  - 1280px: max-width container constraints respected
- [ ] T005 [US1] Run `npm run lint && npx tsc --noEmit` — zero new errors

**Checkpoint**: Hero mission statement live. User Story 1 independently verifiable.

---

## Phase 3: User Story 2 — Accurate, Coach-Centric Feature Cards (Priority: P1)

**Goal**: All landing page copy is accurate and rugby-coach-centric. The deprecated GIF export card is gone. The "code" ambiguity in card 2 is resolved. Both How It Works steps are corrected.

**Independent Test**: Visit `http://localhost:3000`. Scroll through Section 2 (features grid) — 5 cards visible, no mention of GIF/WebM/export/code. 'Rugby Union, League & Touch' card description does not contain the word "code". Scroll to "From blank pitch to shared play in minutes" — Step 1 mentions "Click to add" not "Drag". Step 3 does not mention GIF. Grid reflows correctly at all breakpoints.

### Implementation for User Story 2

- [ ] T006 [US2] Update `FEATURES` array in `src/app/page.tsx`:
  - Remove the entire `FEATURES[3]` object (`{ title: 'Export as a GIF', description: '...' }`)
  - Rewrite `FEATURES[1].description` (currently "Pick your code and the right field appears..."): replace with "Pick your format — Union, League, or Touch — and the right pitch appears automatically. Correct markings, correct dimensions. No setup."
- [ ] T007 [US2] Rewrite How It Works step descriptions in `src/app/page.tsx`:
  - Step 1 `<p>`: replace "Drag attack players, defenders, a ball, and cones onto the pitch where you want them." with "Click to add players, a ball, and cones. Then drag them into position on the pitch."
  - Step 3 `<p>`: replace "Share a link, export a GIF, or post to the gallery so other coaches can learn from it too." with "Share a link your players can open on their phones, or post to the community gallery so other coaches can learn from it too."
- [ ] T008 [US2] Manually verify after changes:
  - Section 2: count cards — exactly 5 visible
  - Grid reflow at `sm` (<768px): 5 rows; at `md` (768–1023px): 2+2+1; at `lg` (≥1024px): 3+2
  - Ctrl+F / page search for "GIF", "WebM", "export", "code" — none present in visible copy
  - 'Rugby Union, League & Touch' card description visible and correct
  - Step 1 copy reads "Click to add..."
  - Step 3 copy reads "Share a link...community gallery..."
- [ ] T009 [US2] Run `npm run lint && npx tsc --noEmit` — zero new errors

**Checkpoint**: All copy corrections live. Section 2 and Section 3 accurate and coach-centric.

---

## Phase 4: User Story 3 — Hero Background Illustration (Priority: P2)

**Goal**: A composed rugby illustration in the hand-drawn whiteboard aesthetic — pitch markings, rugby ball, tactical annotations — sits as a decorative background layer in the hero section. It signals "rugby coaching tool" before a word is read. Structured for future animation with grouped SVG elements.

**Independent Test**: Visit `http://localhost:3000` on desktop (≥768px). Hero section has a visible background illustration behind the headline and CTAs. At least 3 distinct rugby element types are recognisable (ball, pitch lines, arrows minimum). All strokes are imperfect and heavy — consistent with the brand logo aesthetic. On mobile (<768px), the illustration is hidden or unobtrusive. DevTools Accessibility panel confirms `aria-hidden="true"` on the SVG. No layout shift on page load.

### Implementation for User Story 3

- [ ] T010 [US3] Design gate — run `/impeccable:shape` to design the background illustration composition before writing any SVG:
  - Input: brand logo at `public/assets/logo.png` as the aesthetic reference
  - Goal: determine which element groups to include, their approximate placement, stroke weight, and opacity on a dark (#1A3D1A) background
  - Output: a composition brief (which elements, rough layout, colour treatment) agreed before T011 begins
  - Do not proceed to T011 until the composition is approved
- [ ] T011 [US3] Create `src/app/_components/HeroBackground.tsx` with the component shell (create the `src/app/_components/` directory if it does not exist):
  - Default export: `export default function HeroBackground()`
  - Root `<svg>` with `aria-hidden="true"`, `focusable="false"`, `viewBox="0 0 800 500"`, `className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"`
  - Five `<g>` group stubs with stable IDs (SVG paths empty at this point):
    ```tsx
    <g id="pitch-lines"></g>
    <g id="ball"></g>
    <g id="arrows"></g>
    <g id="posts"></g>
    <g id="cones"></g>
    ```
  - All SVG attributes: `stroke-linecap="butt"` `stroke-linejoin="miter"` `fill="none"` on each group
- [ ] T012 [US3] Implement structural SVG paths in `src/app/_components/HeroBackground.tsx`:
  - `<g id="pitch-lines">`: 2–3 heavy horizontal strokes suggesting try line or 22m line fragments, bleeding off the right/bottom edge; stroke `#f5f0e8` opacity 0.18, strokeWidth 6
  - `<g id="posts">`: H-shaped goalpost silhouette, partially visible at one edge; same stroke colour/opacity
  - `<g id="cones">`: 2–3 simple triangle outlines; same stroke colour/opacity
  - All paths must be imperfect Bezier curves — not geometric primitives; reference the logo hand-drawn quality
- [ ] T013 [US3] Implement tactical SVG paths in `src/app/_components/HeroBackground.tsx`:
  - `<g id="ball">`: hand-drawn prolate spheroid matching the brand logo; stroke `#f5f0e8` opacity 0.18 for the outline; amber `#D97706` opacity 0.55 for the internal X-mark and dotted direction arrow; strokeWidth 5 outline, 4 markings
  - `<g id="arrows">`: 1–2 curved running-line arrows with arrowheads, sketched freehand style; stroke `#D97706` opacity 0.55, strokeWidth 4
  - Ensure paths are irregular — hand-drawn curves, not ruler-straight or perfect arcs
- [ ] T014 [US3] Mount `<HeroBackground />` in `src/app/page.tsx`:
  - Import the component at the top of the file
  - Add `position: relative; overflow: hidden` to the hero `<section>` (via Tailwind: ensure `relative overflow-hidden` are present)
  - Render `<HeroBackground />` as the last child inside the hero section's inner container, or as a direct child of the section
- [ ] T015 [US3] Validate illustration:
  - Desktop (≥768px): illustration visible in hero; does not obscure headline, subheadline, or either CTA
  - Mobile (<768px): illustration hidden (`hidden md:block` confirmed)
  - DevTools → Accessibility panel: SVG `aria-hidden="true"` confirmed, no accessible name announced
  - DevTools → Performance/Network tab: no CLS triggered by illustration; no external SVG file loaded
- [ ] T016 [US3] Run `npm run lint && npx tsc --noEmit` — zero new errors

**Checkpoint**: Background illustration live and accessible. Story 3 independently verifiable.

---

## Phase 5: User Story 4 — App Name Evaluation (Priority: P3)

**Goal**: A documented shortlist of ≥5 candidate names assessed against the brand principles and the community/coaching-elevation framing. Documentation only — no production UI change.

**Independent Test**: `specs/008-landing-refinements/research.md` contains a "Name Evaluation" section with ≥5 candidates, each assessed against direct · tactical · grassroots and the community/coaching-education positioning. One candidate is flagged as preferred (if any) with the constitutional amendment required to adopt it.

### Implementation for User Story 4

- [ ] T017 [P] [US4] Research and document ≥5 candidate app names in `specs/008-landing-refinements/research.md` under a new `## Name Evaluation (LANDING-001)` section:
  - Each candidate assessed against: direct · tactical · grassroots; community/coaching-elevation framing; sport-agnostic but rugby-rooted; memorability
  - Note which candidates would require a constitutional amendment and what that amendment would change
  - Mark any preferred candidate clearly; do not implement any name change in production

**Checkpoint**: Name evaluation complete. Decision artefact available for future constitutional review.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Full end-to-end verification, regression checks, final gate.

- [ ] T018 Full manual test against `specs/008-landing-refinements/quickstart.md` — all 9 sections checked and passing
- [ ] T019 [P] Regression checks — verify these routes are unaffected by the landing page changes:
  - `/app` — editor loads and functions normally
  - `/gallery` — gallery loads and displays animations
  - `/share/[any-valid-id]` — share viewer loads and plays animation on mobile viewport
- [ ] T020 Final `npm run lint && npx tsc --noEmit` — zero new errors; ready for PR

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (US1)**: Depends on Phase 1
- **Phase 3 (US2)**: Depends on Phase 2 — US1 establishes the tone that US2 copy must be consistent with
- **Phase 4 (US3)**: Depends on Phases 2 and 3 — illustration mounts in the hero section already updated by US1
- **Phase 5 (US4)**: No blocking dependencies — fully parallel to Phases 2–4 (`[P]` marked)
- **Phase 6 (Polish)**: Depends on all desired user stories being complete

### Within Each User Story

- Design gates (T002, T010) MUST run before their respective implementation tasks
- `page.tsx` tasks within US1 and US2 are sequential — same file, no parallelism within a phase
- Structural paths (T012) before tactical paths (T013) — establishes composition before adding detail
- Mount (T014) before validation (T015) — can't validate what isn't rendered

### Parallel Opportunities

- T017 (name research): fully parallel to all implementation phases — different file, no code dependency
- T019 (regression checks): parallel to T018 (manual test) — different routes

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: User Story 1 (hero copy)
3. **STOP and VALIDATE**: verify hero at 375px/768px/1280px
4. Ship/demo if hero copy alone is a meaningful increment

### Incremental Delivery

1. Phase 1 → baseline clean
2. Phase 2 (US1) → community mission hero live
3. Phase 3 (US2) → copy corrections live; all deprecated content gone
4. Phase 4 (US3) → background illustration live (most design-intensive; do last of P1/P2 work)
5. Phase 5 (US4) → name evaluation documented (run in parallel at any point)
6. Phase 6 → full verification + PR

---

## Notes

- [P] tasks = different files or different routes — run in parallel
- Design gates (T002, T010) are not optional — they protect copy quality and illustration fidelity
- All SVG paths in HeroBackground must be hand-drawn Bezier quality — reference `public/assets/logo.png` at all times
- `aria-hidden="true"` on HeroBackground SVG is mandatory — verify via DevTools, not code inspection
- Pre-push gate: `npm run lint && npx tsc --noEmit` must pass before PR
- No Canvas/ components touched — `/replay/[id]` and `/share/[id]` regression check is a safety net only
