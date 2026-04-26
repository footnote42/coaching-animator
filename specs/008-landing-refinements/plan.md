# Implementation Plan: Landing Refinements (Phase 2e)

**Branch**: `008-landing-refinements` | **Date**: 2026-04-26 | **Spec**: `specs/008-landing-refinements/spec.md`

## Summary

Elevate the landing page from plain functional tooling to an intentional, community-centred first impression for grassroots rugby coaches. The work is: (1) swap the hero copy to Alt C (community/coaching mission framing), (2) rewrite two card descriptions and remove the deprecated GIF export card, (3) rewrite one How It Works step to accurately describe click-to-place then drag, (4) create a `HeroBackground` React component containing a composed rugby illustration in the hand-drawn whiteboard marker aesthetic of the brand logo, and (5) produce a name evaluation artefact. No backend, no API, no schema changes. Primary files: `src/app/page.tsx` and a new `src/app/_components/HeroBackground.tsx`.

---

## Technical Context

**Language/Version**: TypeScript 5 · Node 22  
**Framework**: Next.js 14 App Router (SSR + API Routes)  
**Canvas**: Konva (react-konva) — shared across `/app`, `/replay/[id]`, `/share/[id]`  
**State**: Zustand stores in `src/core/stores/`  
**Backend**: Supabase (PostgreSQL + Auth + RLS) via `src/lib/supabase/`  
**Styling**: Tailwind CSS + Radix UI primitives  
**Testing**: Vitest (unit) · Playwright (E2E)  
**Deploy**: Vercel (CI via GitHub Actions)  
**Performance Goals**: Canvas interactions <100ms; API responses <500ms p95  
**Constraints**: No telemetry; no third-party analytics; RLS on all DB tables; entity colors via EntityColors service only

---

## Constitutional Compliance Check

| Check | Status | Notes |
|-------|--------|-------|
| Tier alignment (Guest/Auth/Public/Admin) | ✅ Pass | Landing page is Tier 0 (Guest) — fully public, no auth required |
| No telemetry or analytics | ✅ Pass | Copy and SVG changes only; no scripts added |
| Entity colors via EntityColors service | ✅ Pass | No entity logic touched; SVG uses design tokens, not EntityColors |
| Shared canvas — tested on all 3 routes | N/A | No Canvas/ components modified |
| New data: privacy impact assessed | N/A | No new data stored |
| Supabase joins flattened before use | N/A | No new Supabase queries |

No constitutional violations. No complexity exceptions required.

---

## Project Structure

### Documentation (this feature)

```text
specs/008-landing-refinements/
├── spec.md              ✅ created
├── plan.md              ✅ this file
├── research.md          ✅ created
├── data-model.md        ✅ created
├── quickstart.md        ✅ created
└── tasks.md             (created by /speckit.tasks)
```

### Source Code — Files to Create

| File | Description |
|------|-------------|
| `src/app/_components/HeroBackground.tsx` | Composed rugby background illustration — inline SVG with grouped elements, `aria-hidden`, no props |

### Source Code — Files to Modify

| File | Change |
|------|--------|
| `src/app/page.tsx` | Hero copy swap (Alt C), FEATURES array (remove card 4, rewrite card 2), How It Works step rewrites, `<HeroBackground />` mount in hero section |

### Source Code — Files NOT Modified

| File | Reason |
|------|--------|
| `src/shared/components/BrandIcon.tsx` | The illustration is a new independent SVG; BrandIcon is the aesthetic reference, not a base component |
| All `Canvas/` components | Not touched — landing page has no canvas |
| All `features/animation/` | Not touched |
| Any Supabase schema/API routes | Not touched |

---

## Copy Changes — Final State

### Hero Section

```tsx
// Headline
"Rugby tactics, drawn by coaches like you"

// Subheadline
"A free tool for the grassroots coaching community. Draw plays,
share sessions, and help every coach on your touchline get better."

// CTA 1 (href="/app")
"Start drawing free"

// CTA 2 (href="/gallery")
"Browse the community playbook"
```

### FEATURES Array — Final State (5 items)

```typescript
const FEATURES = [
  {
    title: 'Draw plays in motion',
    description: 'Place players on the pitch, add frames, and show how the play unfolds. Drag, move, repeat until it looks right.',
  },
  {
    title: 'Rugby Union, League & Touch',
    description: 'Pick your format — Union, League, or Touch — and the right pitch appears automatically. Correct markings, correct dimensions. No setup.',
  },
  {
    title: 'Share a link with your squad',
    description: 'Send a link your players can open on their phones. No app download, no account needed on their end.',
  },
  // [REMOVED: 'Export as a GIF' — deprecated feature]
  {
    title: 'Nothing to install',
    description: 'It runs in your browser — no download, no app store. Open it on your phone, tablet, or laptop and start drawing.',
  },
  {
    title: 'Free to use',
    description: 'No credit card, no trial period. Start drawing straight away as a guest. Create an account to save your work.',
  },
];
```

### How It Works — Step 1 and Step 3

**Step 1 description**:
```
"Click to add players, a ball, and cones. Then drag them into position on the pitch."
```

**Step 3 description**:
```
"Share a link your players can open on their phones, or post to the community gallery so other coaches can learn from it too."
```

---

## HeroBackground Component Design Brief

See `data-model.md` for full SVG parameters and group structure.

**Aesthetic reference**: `public/assets/logo.png` — the illustration must feel like it comes from the same hand as the logo. Same stroke weight, same imperfection, same colour vocabulary.

**Composition requirements**:
- At least 3 of: pitch markings, rugby ball, tactical arrows, goalposts, cone silhouettes
- Elements should be distributed across the SVG viewport — not clustered in one corner
- Composition bleeds to the edges (no margin/padding feel — the hero `overflow: hidden` crops it)
- Density: sparse enough that content remains primary; rich enough that the coaching world is clearly signalled

**Colour on dark hero background**:
- Structural outlines: off-white `#f5f0e8` at ~18% opacity (chalk-on-board effect)
- Tactical markings: amber `#D97706` at ~55% opacity

**Group structure** (all groups must be present even if empty, for future animation):
```tsx
<g id="pitch-lines"> ... </g>
<g id="ball">        ... </g>
<g id="arrows">      ... </g>
<g id="posts">       ... </g>
<g id="cones">       ... </g>
```

**Design iteration required**: Run `/impeccable:shape` before writing any SVG paths. Composition, element selection, and placement are design decisions — do not code first.

---

## Implementation Sequence

### Step 1 — Copy corrections (LANDING-003, LANDING-004)

1. Open `src/app/page.tsx`
2. Remove `FEATURES[3]` (the 'Export as a GIF' object) from the array
3. Rewrite `FEATURES[1].description` — remove "Pick your code", replace with format-explicit description
4. Rewrite Step 1 description in the How It Works grid — replace "Drag attack players..." with click-to-place then drag copy
5. Rewrite Step 3 description — remove "export a GIF"; replace with community gallery copy
6. `npm run lint && npx tsc --noEmit` — must pass

### Step 2 — Hero mission statement (FR-001, clarification)

7. Replace Alt A hero copy with the refined Alt C mission statement
8. Update the CTA labels
9. Verify hero renders correctly at 375px, 768px, 1280px
10. `npm run lint && npx tsc --noEmit` — must pass

**Design gate**: Run `/impeccable:clarify` on the hero mission statement before committing. The copy should be validated against the brand principles before markup is finalised.

### Step 3 — HeroBackground illustration (LANDING-002)

11. Run `/impeccable:shape` to design the composition — element selection, placement, and SVG path quality
12. Create `src/app/_components/HeroBackground.tsx` with the composed SVG:
    - All element groups wrapped in `<g id="...">` tags
    - `aria-hidden="true"`, `focusable="false"` on the root `<svg>`
    - Component hidden below `md` breakpoint
13. Mount `<HeroBackground />` in the hero `<section>` in `page.tsx`; ensure hero section has `position: relative; overflow: hidden`
14. Validate: illustration visible on desktop (≥768px) and not obscuring headline or CTA
15. Validate: `aria-hidden` confirmed via browser accessibility panel
16. Validate: no CLS (layout shift) — check Network tab and Lighthouse
17. `npm run lint && npx tsc --noEmit` — must pass

### Step 4 — Name evaluation artefact (LANDING-001, FR-008)

17. Research and document ≥ 5 candidate names in `specs/008-landing-refinements/research.md`
18. Assess each against brand criteria + community/coaching-elevation framing
19. Note constitutional amendment requirement for any preferred candidate

---

## Grid Reflow Verification

After removing FEATURES[3], validate these layouts:

| Breakpoint | Grid columns | Card count | Expected layout |
|------------|-------------|------------|-----------------|
| `sm` (<768px) | 1 | 5 | 5 rows |
| `md` (768–1023px) | 2 | 5 | 2+2+1 |
| `lg` (≥1024px) | 3 | 5 | 3+2 |

The existing `grid md:grid-cols-2 lg:grid-cols-3 gap-6` Tailwind class handles this reflow automatically — no CSS changes needed.

---

## Dependencies & Risks

| Risk | Mitigation |
|------|------------|
| Tactical ball SVG increases hero section paint time | Use `loading="lazy"` equivalent for SVG is not applicable — inline SVG paints with the document. Keep paths minimal (< 5 elements). Validate with Lighthouse after. |
| Hero copy swap changes semantic HTML structure | Keep the same `<h1>` / `<p>` / `<a>` structure — only text content changes. No class changes needed. |
| Alt C CTA href `/gallery` already exists | Confirmed — gallery route is live. No routing change needed. |
| 5-card grid single orphan on `lg` breakpoint | Acceptable — 3+2 layout with left-aligned orphan is standard grid behaviour. No special CSS needed. |
