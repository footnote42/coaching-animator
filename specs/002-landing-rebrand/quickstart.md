# Quickstart — Manual Test Guide: Landing Page Rebrand

**Feature**: 002-landing-rebrand  
**Date**: 2026-04-20

## Prerequisites

```bash
npm run dev   # Start dev server on http://localhost:3000
```

## Test Checklist

### 1. Typography — Heading Font

- [ ] Visit `http://localhost:3000`
- [ ] Hero headline ("Stop explaining. Start showing.") renders in Oswald — condensed, not Inter
- [ ] Open DevTools → Computed styles on `h1` → `font-family` shows Oswald
- [ ] Hero headline is visually distinct from Inter: narrower letterforms, stronger vertical emphasis

### 2. Color — Cream Background

- [ ] Page background is visibly warm/cream — not white or startup-grey
- [ ] Background is clearly different from `#FFFFFF` — hold it next to a white element to compare
- [ ] Navigation bar (`bg-surface`) appears slightly lighter cream than the page background
- [ ] Feature section and how-it-works section alternate between two distinct cream tones

### 3. Amber CTA — Single Occurrence Per Viewport

- [ ] Scroll to hero section: exactly ONE amber button ("Start drawing — no account needed")
- [ ] Feature cards section has NO amber elements
- [ ] How-it-works section has NO amber elements
- [ ] CTA section at bottom: exactly ONE amber button ("Start drawing")
- [ ] Only one amber element visible in any single viewport scroll position

### 4. Feature Cards — No Icon Squares

- [ ] Features section contains no icon-in-colored-square elements
- [ ] Feature titles use Oswald font, bold, visually prominent
- [ ] Description text is legible and not decorated
- [ ] Cards feel more like a printed coaching list than a SaaS feature grid

### 5. Mobile — 375px Viewport

- [ ] Open DevTools → Device toolbar → Set to 375px width
- [ ] No horizontal scroll appears
- [ ] Body text is minimum 16px (check DevTools computed font-size on `p` elements)
- [ ] "Start drawing" button is at least 44×44px — check DevTools: element height AND width must both be ≥ 44px
- [ ] Hero headline is readable without zooming — at least 2 lines, not overflowing

### 6. WCAG Contrast Spot-Check

- [ ] Install browser extension "axe DevTools" or "WAVE" (or use Lighthouse)
- [ ] Run accessibility audit on `http://localhost:3000`
- [ ] No contrast failures reported for body text
- [ ] Amber button text on amber background passes 4.5:1 (white text on `#D97706` ≈ 3.2:1 — use dark text if white fails)
- [ ] Dark text on cream background passes (expect very high ratio, ~20:1+)

### 7. TypeScript + Lint

```bash
npm run lint          # Must pass with no new errors
npx tsc --noEmit      # Must pass with no new type errors
```

### 8. Anti-Pattern Check

- [ ] No gradient text visible anywhere on the page
- [ ] No glassmorphism (blurred backdrop, semi-transparent panels)
- [ ] No cyan or neon accent colors
- [ ] No elements that could belong to a generic SaaS product page (Notion, Linear, Vercel-style)
- [ ] The overall page feels like it was designed for rugby coaching, not general software

### 9. Theme Structure (FR-004)

- [ ] Dark (pitch-green) sections appear ONLY as the hero band (top) and CTA band (bottom) — not as the dominant visual mode
- [ ] The overall page impression is light: cream/warm backgrounds account for the majority of vertical scroll space
- [ ] No dark full-bleed backgrounds in the Features section or How It Works section

## Pass Criteria

All checkboxes above ticked = feature complete and ready for `/speckit.implement`.
