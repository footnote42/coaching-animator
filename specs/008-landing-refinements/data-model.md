# Data Model: Landing Refinements (Phase 2e)

**Branch**: `008-landing-refinements` | **Date**: 2026-04-26

---

## No Schema Changes

This feature makes no changes to the Supabase database, Zustand stores, or TypeScript types. There are no new entities, no new fields, and no new API routes.

---

## Content Model (Landing Page Copy)

The landing page copy is defined as static constants in `src/app/page.tsx`. The following documents the intended final state for all changed content.

### Hero Section

| Element | Before | After |
|---------|--------|-------|
| Headline | "Stop explaining. Start showing." | "Rugby tactics, drawn by coaches like you" |
| Subheadline | "A simple tool for drawing rugby drills and plays. Move players around the pitch, build up the action frame by frame, then share a link with your squad." | "A free tool for the grassroots coaching community. Draw plays, share sessions, and help every coach on your touchline get better." |
| CTA 1 label | "Start drawing — no account needed" | "Start drawing free" |
| CTA 2 label | "See what others have shared" | "Browse the community playbook" |
| Tactical ball SVG | (absent) | Inline `aria-hidden` SVG, position absolute, decorative |

### FEATURES Array (Section 2 Cards)

| Index | Title | Status | Change |
|-------|-------|--------|--------|
| 0 | Draw plays in motion | Keep | No change |
| 1 | Rugby Union, League & Touch | Rewrite desc | Remove "Pick your code"; see target below |
| 2 | Share a link with your squad | Keep | No change |
| 3 | Export as a GIF | **Remove** | Entire object removed; array shrinks to 5 |
| 4 | Nothing to install | Keep (renumbered to index 3) | No change |
| 5 | Free to use | Keep (renumbered to index 4) | No change |

**FEATURES[1] target description**:
> "Pick your format — Union, League, or Touch — and the right pitch appears automatically. Correct markings, correct dimensions. No setup."

### How It Works Steps (Section 3)

| Step | Title | Status | Change |
|------|-------|--------|--------|
| 1 | Place your players | Rewrite desc | "Click to add players, a ball, and cones. Then drag them into position on the pitch." |
| 2 | Build the movement | Keep | No change |
| 3 | Send the link | Rewrite desc | Remove "export a GIF"; see target below |

**Step 3 target description**:
> "Share a link your players can open on their phones, or post to the community gallery so other coaches can learn from it too."

---

## Hero Background Illustration Specification

The background illustration is a composed SVG scene rendered as a React component. It is purely decorative — no TypeScript types, no state, no props.

### Component

| Item | Value |
|------|-------|
| File | `src/app/_components/HeroBackground.tsx` |
| Exports | Default export — a single React component |
| Props | None |
| Usage | `<HeroBackground />` as a child of the hero `<section>` |

### Required SVG attributes

| Attribute | Value | Reason |
|-----------|-------|--------|
| `aria-hidden` | `"true"` | Removes from accessibility tree |
| `focusable` | `"false"` | Prevents SVG tab-stop in some browsers |
| `className` | `"absolute inset-0 w-full h-full pointer-events-none"` | Fills hero section, no interaction |

### Element group structure

Each visual element type is wrapped in a `<g>` with a stable ID — this is the animation hook for future phases:

```svg
<svg aria-hidden="true" focusable="false" viewBox="0 0 800 500" ...>
  <g id="pitch-lines">   <!-- Try line / 22m / halfway fragments --></g>
  <g id="ball">          <!-- Hand-drawn rugby ball --></g>
  <g id="arrows">        <!-- Curved running/passing lines with arrowheads --></g>
  <g id="posts">         <!-- H-post silhouette --></g>
  <g id="cones">         <!-- Cone triangle(s) --></g>
</svg>
```

Not all groups need to be present in v1. Minimum: 3 of the 5 groups. The exact element selection is a design decision deferred to `/impeccable:shape`.

### Visual parameters

| Parameter | Value | Notes |
|-----------|-------|-------|
| Viewbox | `0 0 800 500` | Wide landscape — bleeds to edges |
| Structural outline stroke | `#f5f0e8` at opacity 0.18 | Off-white chalk-on-darkboard effect |
| Tactical marking stroke | `#D97706` at opacity 0.55 | Amber — arrows, X-marks |
| Stroke width (outlines) | 5–6px | Heavy marker weight |
| Stroke width (markings) | 4px | Slightly lighter |
| Line quality | Irregular Bezier — hand-drawn, not geometric | No perfect ellipses or ruler lines |
| Linecap | `butt` | No rounded ends |
| Linejoin | `miter` | Sharp joins |
| Fill | `none` on all paths | Transparent interior |

### Positioning (parent hero section)

```css
/* Applied to hero <section> */
position: relative;
overflow: hidden;
```

```css
/* Applied to HeroBackground wrapper */
position: absolute;
inset: 0;
width: 100%;
height: 100%;
pointer-events: none;
```

### Mobile behaviour

- Below `md` breakpoint (768px): `hidden md:block` on the component wrapper, or opacity reduced to near-zero
- The hero copy and CTAs must remain fully readable on all viewports regardless of illustration state
