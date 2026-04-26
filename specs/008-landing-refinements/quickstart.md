# Quickstart & Manual Test Guide: Landing Refinements (Phase 2e)

**Branch**: `008-landing-refinements` | **Date**: 2026-04-26

## Prerequisites

```bash
npm run dev        # dev server on localhost:3000
```

No Supabase env vars required — landing page is static/public.

---

## Test Checklist

### 1. Hero copy (SC-001)

- [ ] Visit `http://localhost:3000`
- [ ] Headline reads: **"Rugby tactics, drawn by coaches like you"**
- [ ] Subheadline references "grassroots coaching community" and "help every coach on your touchline get better"
- [ ] CTA 1 reads: **"Start drawing free"**
- [ ] CTA 2 reads: **"Browse the community playbook"**
- [ ] Both CTAs link to `/app` and `/gallery` respectively

### 2. Section 2 cards — deprecated copy removed (SC-002)

- [ ] Scroll to the features grid
- [ ] Count cards: there are **5 cards** (not 6)
- [ ] No card title or description mentions: "GIF", "WebM", "export", "code" (in a technical/programming sense)
- [ ] Card 'Rugby Union, League & Touch' description does NOT contain the word "code"
- [ ] Card 'Rugby Union, League & Touch' description DOES contain "Union, League, or Touch" and "right pitch appears automatically"

### 3. Section 3 steps — accurate copy (SC-003)

- [ ] Scroll to "From blank pitch to shared play in minutes"
- [ ] Step 1 description reads: "Click to add players, a ball, and cones. Then drag them into position on the pitch."
- [ ] Step 1 does NOT say "Drag attack players..."
- [ ] Step 3 description does NOT mention "GIF" or "export"
- [ ] Step 3 description mentions "community gallery"

### 4. Hero background illustration (SC-004 / SC-005)

- [ ] Background illustration is visible in the hero section on desktop (≥768px)
- [ ] Illustration is positioned as a decorative layer — does not cover headline, subheadline, or CTAs
- [ ] Illustration contains at least 3 distinct rugby element types (e.g., ball + pitch lines + arrows)
- [ ] All strokes follow the brand logo aesthetic: heavy, imperfect, hand-drawn quality — not vector-clean
- [ ] Amber (#D97706) tactical markings (arrows, X-marks) are visible
- [ ] Off-white structural outlines are visible against the dark hero background
- [ ] Screen reader test: open VoiceOver/NVDA, navigate page — the illustration is not announced
- [ ] DevTools → Accessibility panel: SVG `aria-hidden="true"` confirmed
- [ ] DevTools → Network tab: no additional SVG file loaded (illustration is inline)

### 5. Mobile viewport (SC-006, UI-009)

- [ ] Open DevTools → set viewport to 375px width
- [ ] Hero headline is fully readable — no truncation, no overflow
- [ ] Tactical ball SVG is either hidden or does not overlap headline/CTA
- [ ] Hero mission statement fits within two lines at 375px

### 6. Card grid reflow

- [ ] At `lg` breakpoint (≥1024px): 5 cards display as 3+2 (no empty slot)
- [ ] At `md` breakpoint (≥768px): 5 cards display as 2+2+1 (no empty slot)
- [ ] At `sm` breakpoint (<768px): 5 cards stack 1 per row

### 7. Contrast (SC-005)

- [ ] DevTools → Lighthouse → Accessibility: no new contrast failures
- [ ] Hero headline and subheadline remain readable over the dark hero background after SVG is added

### 8. Lint / TypeScript gate (SC-007)

```bash
npm run lint
npx tsc --noEmit
```

- [ ] Both commands exit 0 with no new errors

### 9. Name evaluation artefact (SC-008)

- [ ] `specs/008-landing-refinements/research.md` exists and contains a name evaluation section with ≥ 5 candidates

---

## Regression checks

These pages should be unaffected — spot-check:

- [ ] `/app` — editor loads normally
- [ ] `/gallery` — gallery loads and shows animations
- [ ] `/share/[any-valid-id]` — share viewer loads and plays animation

---

## Design iteration note

Before committing final copy, run:

```
/impeccable:clarify    — hero mission statement + card copy tone check
/impeccable:shape      — tactical ball SVG geometry iteration
```

Final copy should not be committed until `/impeccable:clarify` has validated the hero mission statement and card rewrites against brand principles.
