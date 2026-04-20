# Research: Landing Page Rebrand

**Feature**: 002-landing-rebrand  
**Date**: 2026-04-20  
**Status**: Complete

---

## 1. Current Font Loading

**Finding**: `layout.tsx` does not use `next/font` at all. Fonts are declared as CSS variable strings in `globals.css` (`--font-heading: 'Inter', ...`) but Inter is never explicitly loaded — it falls through to the system font stack or browser default.

**Decision**: Add `next/font/google` in `layout.tsx` to load a chosen heading font and a body font. Apply them as CSS variables on the `<html>` or `<body>` element. This replaces the current implicit font declarations in `globals.css`.

**Why next/font**: Avoids external CDN requests at render time (privacy), eliminates FOUT (flash of unstyled text), and provides automatic `font-display: swap` and subset optimization.

---

## 2. Typography — Heading Font

**Decision**: `Oswald` (400–700 weight range, Latin subset)

**Rationale**:
- Condensed proportions and high x-height reference sports typography and printed coaching materials (coaching clipboard, 1980s rugby programme)
- Strong visual contrast from Inter: Oswald is explicitly condensed and vertical where Inter is neutral and wide
- Available via Google Fonts through `next/font/google` with zero external CDN requests at runtime
- Works at large display sizes (hero headings) and mid-sizes (section headers) without feeling decorative or novelty

**Alternatives considered**:
- `Barlow Condensed`: Similar aesthetic but slightly more modern/tech; Oswald has more editorial weight
- `Bebas Neue`: Very bold headline-only usage; lacks the mid-weight range needed for sub-headings
- `Fjalla One`: Narrower use case; Oswald has better weight control across sizes

---

## 3. Typography — Body Font

**Decision**: Keep Inter or move to `DM Sans` — **defer to `/impeccable:typeset`**

**Rationale**: The spec requires body legibility on small mobile screens outdoors. Inter is adequate for this but generic. DM Sans has a rounder humanist quality that pairs well with Oswald's condensed seriousness without being heavy. This choice should be validated visually during impeccable execution rather than locked in the plan, as it depends on how the two fonts look together.

**Constraint**: Whatever body font is chosen must have minimum 16px effective size at default zoom and must not conflict with the Oswald heading aesthetic.

---

## 4. Color Token Refinements

**Decision**: Update background and surface-warm tokens to achieve "coaching document" warmth

| Token | Old Value | New Value | Reasoning |
|-------|-----------|-----------|-----------|
| `--color-background` | `#F8F9FA` | `#F2ECD8` | Cream/aged-white — visually distinct from white, references coaching notepads and printed programmes |
| `--color-surface` | `#FFFFFF` | `#FDFAF5` | Very light cream for content wells — no longer stark white |
| `--color-surface-warm` | `#F9FAFB` | `#EDE6D0` | Deeper cream for alternating sections — creates genuine contrast rhythm |

**WCAG check**: `#111827` (text-primary) on `#F2ECD8` (new background)
- Text `#111827` luminance ≈ 0.027, Background `#F2ECD8` luminance ≈ 0.83 → Ratio ≈ 24:1. Passes AA and AAA.

**Primary and accent unchanged**: `#1A3D1A` (pitch green) and `#D97706` (warm amber) stay — they're correct territory per `.impeccable.md`.

---

## 5. Feature Cards Section — Anti-Pattern Analysis

**Finding**: Current feature cards (`/` — Features Section) use `bg-primary/10` icon containers (a tinted square with a Lucide icon), which is the exact "SaaS icon card" pattern identified as an anti-reference in `.impeccable.md`.

**Decision**: Redesign feature cards as a typographic list. Remove icon squares. Use bold numbered labels or dash markers. Let the feature title carry visual weight via Oswald font. This references printed coaching plans and match programme feature lists — utilitarian, direct, no decorative chrome.

**Layout approach**: Two or three column grid maintained for desktop. Each card becomes: bold title (large Oswald) + plain description text. No background fill on cards (or very subtle border only). Clean, editorial.

---

## 6. Navigation and Footer — Incidental Scope

**Finding**: Navigation (`Navigation.tsx`) and the page footer (`page.tsx`) will automatically benefit from token changes (new background color, new fonts from CSS variables). No structural changes to navigation required — it is not the primary focus of this spec.

**Decision**: Token changes flow through automatically. Do not restructure navigation or footer beyond what the token updates and font application naturally provide.

**One exception**: The rugby emoji (🏉) in the navigation logo and footer does not align with the "analog authenticity" principle — but removing it is a separate judgment call for the impeccable execution phase, not a requirement in this spec.

---

## 7. Files Changed — Definitive List

| File | Change |
|------|--------|
| `src/app/layout.tsx` | Add `next/font/google` import and font variable application |
| `src/app/globals.css` | Update `--color-background`, `--color-surface`, `--color-surface-warm`, `--font-heading`, `--font-body` tokens |
| `src/app/page.tsx` | Redesign feature cards section; tune section spacing |

No other files require changes. Canvas components, API routes, stores, and Supabase queries are all unaffected.
