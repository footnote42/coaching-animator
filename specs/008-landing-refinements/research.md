# Research: Landing Refinements (Phase 2e)

**Branch**: `008-landing-refinements` | **Date**: 2026-04-26 | **Spec**: `specs/008-landing-refinements/spec.md`

---

## Decision Log

### D-001: Hero copy variant

**Decision**: Adopt and refine Alt C ("Grassroots Movement") from the existing copy variants in `page.tsx`.

**Rationale**: Alt C is already drafted and explicitly centres community: *"Rugby tactics, drawn by coaches like you"* / *"A free tool for the rugby coaching community. Draw plays, share sessions, and learn from what others have built."* This aligns directly with the clarification-agreed framing (community and shared knowledge). It requires editorial refinement to reflect the coaching-elevation aspiration more fully but needs no structural rethinking.

**Alternatives considered**:
- Alt A ("The Grounded Coach") — functional/direct, currently active; does not carry community mission
- Alt B ("Saturday Coach") — time-pressure framing; coach-focused but not community-focused
- Write from scratch — unnecessary given Alt C is already a strong foundation

---

### D-002: Section 2, card 2 — "Pick your code"

**Decision**: Rewrite the description of the 'Rugby Union, League & Touch' card to eliminate the word "code". "Code" in rugby means the variant of the game (Union/League/Touch) — technically correct — but the issue review flagged it as ambiguous and potentially alienating to coaches unfamiliar with the jargon.

**Rationale**: The card title ('Rugby Union, League & Touch') already names the variants explicitly. The description should reinforce the benefit ("the right pitch appears automatically") without reintroducing jargon that could confuse a less experienced coach.

**Target description**:
> "Pick your format — Union, League, or Touch — and the right pitch appears automatically. Correct markings, correct dimensions. No setup."

**Alternatives considered**:
- Leave unchanged — risks alienating coaches who read "code" as tech jargon; issue explicitly flags it

---

### D-003: Section 2, card 4 — 'Export as a GIF'

**Decision**: Remove the card entirely. Do not replace with placeholder filler.

**Rationale**: GIF export is deprecated (see UX-002, closed). Card 4 in the current 6-card grid is 'Export as a GIF'. Removing it leaves a 5-card grid. Per spec assumption 4: a tight, honest 5-card grid is better than a padded 6-card grid with invented copy. The 5-card layout reflows cleanly in a `md:grid-cols-2 lg:grid-cols-3` Tailwind grid (3+2 arrangement on large screens; 2+2+1 on medium; 1-per-row on small).

**Alternatives considered**:
- Replace with a community-facing value prop ("See how other coaches build plays") — risks duplicating the gallery CTA already in the hero
- Replace with a coaching benefit ("Build muscle memory through repetition") — too abstract and not currently supported by the tool

---

### D-004: Section 3, step 1 — "Drag attack players..."

**Decision**: Rewrite step 1 description to accurately reflect the click-to-place then drag interaction model.

**Current (inaccurate)**: "Drag attack players, defenders, a ball, and cones onto the pitch where you want them."

**Target**:
> "Click to add players, a ball, and cones. Then drag them into position on the pitch."

**Rationale**: The editor uses a click-to-add palette (entities are added to centre pitch on click), not a drag-from-palette interaction. Saying "drag" creates a false expectation that leads to confusion at first use.

---

### D-005: Section 3, step 3 — "export a GIF"

**Decision**: Remove "export a GIF" from the step 3 description. Retain the share link and gallery mentions.

**Current**: "Share a link, export a GIF, or post to the gallery so other coaches can learn from it too."

**Target**:
> "Share a link your players can open on their phones, or post to the community gallery so other coaches can learn from it too."

**Rationale**: GIF export is deprecated. The revised copy leads with the primary share action (link), reinforces community (gallery), and removes the deprecated capability. The phrase "community gallery" also reinforces the Alt C mission framing.

---

### D-006: Hero background illustration approach

**Decision**: Inline SVG composition in the hero `<section>` as `aria-hidden="true"` with `position: absolute` and low opacity. The composition is a multi-element rugby scene in the hand-drawn whiteboard marker aesthetic of the brand logo, not a single ball.

**Scope**: Hero section only in this phase. Structured with `<g>` groups per element type to support future animation without structural change.

**Aesthetic reference**: `public/assets/logo.png` — dark pitch-green (#1A3D1A) heavy imperfect outlines; amber (#D97706) tactical markings; transparent/white interior; marker-pen quality, not vector-clean.

**Element inventory** (minimum 3 types required, suggested composition):

| Group ID | Element type | Visual description |
|----------|-------------|-------------------|
| `pitch-lines` | Pitch markings | Fragment of try line or 22m line — two or three heavy horizontal strokes bleeding off the edge, like a corner of the pitch viewed close |
| `ball` | Rugby ball | Hand-drawn prolate spheroid matching the logo, with amber X and dotted arrow direction line |
| `arrows` | Tactical notation | One or two curved running-line arrows with arrowheads, sketched as if drawn freehand on a board |
| `posts` | Goalposts | H-shaped posts silhouette, heavy stroke, partially visible at edge |
| `cone` | Cone silhouette | Simple triangle outline, 2–3 strokes |

The exact composition (which elements, where, at what size and density) is a design decision deferred to `/impeccable:shape` iteration. The table above is the candidate inventory, not a fixed prescription.

**Colour treatment on dark hero background**: The hero is `bg-primary` (#1A3D1A). Same-colour outlines will be invisible. Solutions:
- Structural outlines: off-white `#f5f0e8` at 15–20% opacity (ghost/chalk effect, references whiteboard on dark surface)
- Tactical markings: amber `#D97706` at 50–60% opacity
- This creates a "chalk board diagram" feel rather than whiteboard-on-white — consistent with a darkened coaching board

**Alternative placement**: If `/impeccable:shape` determines the contrast is too low on the dark hero, consider placing the illustration behind the light-background Section 2 (`bg-surface-warm`) instead. Warm cream background with dark green strokes would more closely match the logo aesthetics. Defer this decision to design iteration.

**Rationale for inline SVG**: Inline avoids a network request and CLS. Given the composition will have multiple `<g>` groups (needed for future animation), a React component is the natural container — it keeps the SVG isolated from `page.tsx` and is easy to animate later. Recommended: `src/app/_components/HeroBackground.tsx` (app-local, not a shared component).

**Alternatives considered**:
- External `.svg` file in `public/` — adds a network request; more awkward to animate individual groups later
- CSS-only background — insufficient for the hand-drawn, irregular path quality required
- Canvas/Konva — overkill for a static decorative element; no animation benefit over SVG for this use case

---

### D-007: Hero mission statement final form

**Decision**: Replace Alt A hero copy with Alt C, refined to reflect coaching elevation and community framing agreed in clarification.

**Refined hero copy proposal** (based on Alt C + clarification context):

```
Headline:    "Rugby tactics, drawn by coaches like you"
Sub:         "A free tool for the grassroots coaching community. Draw plays,
              share sessions, and help every coach on your touchline get better."
CTA 1:       "Start drawing free"
CTA 2:       "Browse the community playbook"
```

**Rationale**: "Help every coach on your touchline get better" elevates from "share sessions" to the coaching-elevation intent the user identified. It positions the community benefit (other coaches improve) as the outcome, not just the feature (gallery browsing). "Grassroots coaching community" is explicit and mirrors the brand personality.

**Final copy refinement**: This proposal should be passed through `/impeccable:clarify` before implementation to validate tone, length, and brand alignment.

---

### D-008: Automated SVG Variation Looping

**Decision**: Implement a smooth, automated crossfade loop through multiple SVG diagram variations for the `HeroBackground` component, rather than static selection.

**Rationale**: The user generated multiple high-quality aesthetic variations of the whiteboard diagrams (Backline Move, Forward Pod, Abstract Minimalist, Corner Attack, Scrum Focus, Lineout Hook). Rather than choosing just one or requiring a manual selector, an automated crossfade (4-second interval) showcases the breadth of the tool's capabilities while keeping the landing page dynamic and engaging. A hidden dev-only switcher remains in the code for easy local review of specific frames.

---

## Codebase Map

| Change | File | Location |
|--------|------|----------|
| Hero copy (Alt C) | `src/app/page.tsx` | `<section>` lines 62–90 |
| FEATURES array card 2 | `src/app/page.tsx` | `FEATURES[1].description` (line ~38) |
| FEATURES array card 4 | `src/app/page.tsx` | `FEATURES[3]` (lines ~44–47) — remove entire object |
| Step 1 description | `src/app/page.tsx` | `<p>` in first `<div>` of grid, line ~138 |
| Step 3 description | `src/app/page.tsx` | `<p>` in third `<div>` of grid, line ~157 |
| Tactical ball SVG | `src/app/page.tsx` | New inline `<svg>` inside hero `<section>` |

---

## Name Evaluation (LANDING-001)

This evaluation assesses potential alternative names for the application against our brand principles (direct · tactical · grassroots), the community/coaching-elevation framing, and the need to be sport-agnostic but rugby-rooted.

### Candidate 1: Coaching Animator (Current)
- **Direct · Tactical · Grassroots**: Very direct. Somewhat tactical. Not particularly grassroots.
- **Community/Coaching-Elevation**: Misses the community aspect entirely. Sounds like a utility.
- **Sport-Agnostic but Rugby-Rooted**: Highly sport-agnostic, but lacks any rugby roots.
- **Memorability**: Low to medium. Descriptive but dry.

### Candidate 2: Touchline
- **Direct · Tactical · Grassroots**: Less direct functionally, but highly grassroots. The "touchline" is where grassroots coaching happens.
- **Community/Coaching-Elevation**: Strong. It invokes the physical space where coaches interact and share knowledge.
- **Sport-Agnostic but Rugby-Rooted**: "Touchline" is predominantly used in rugby (and football), rooting it well while remaining adaptable.
- **Memorability**: High. Punchy and evocative.
- **Constitutional Amendment**: Would require updating `docs/authority/constitution.md` to officially change the project name from "Coaching Animator" to "Touchline" throughout all documentation and branding.

### Candidate 3: The Community Playbook
- **Direct · Tactical · Grassroots**: Direct and tactical. Strongly grassroots.
- **Community/Coaching-Elevation**: Explicitly centers the community and the sharing of knowledge (playbook).
- **Sport-Agnostic but Rugby-Rooted**: Sport-agnostic. Lacks specific rugby roots.
- **Memorability**: Medium. A bit long but very clear.

### Candidate 4: Chalk & Grass
- **Direct · Tactical · Grassroots**: Not direct functionally. Highly tactical (chalk) and grassroots (grass).
- **Community/Coaching-Elevation**: Evocative of the coaching environment, but less explicitly about community.
- **Sport-Agnostic but Rugby-Rooted**: Sport-agnostic, though "grass" applies well to rugby.
- **Memorability**: High. Distinctive and atmospheric.

### Candidate 5: Coach Canvas
- **Direct · Tactical · Grassroots**: Direct and tactical. Neutral on grassroots.
- **Community/Coaching-Elevation**: Focuses on the tool rather than the community.
- **Sport-Agnostic but Rugby-Rooted**: Fully sport-agnostic. No rugby roots.
- **Memorability**: Medium. Alliterative but slightly generic SaaS-sounding.

### Preferred Candidate: Touchline
**Touchline** is the preferred candidate. It strongly embodies the "grassroots" brand principle and evokes the community space of coaching, moving away from the dry, utility-focused current name ("Coaching Animator"). 

**Note**: Do not implement this name change in production yet. It requires a constitutional amendment to proceed.
