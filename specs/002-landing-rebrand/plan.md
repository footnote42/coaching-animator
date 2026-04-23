# Implementation Plan: Landing Page Rebrand

**Branch**: `002-landing-rebrand` | **Date**: 2026-04-20 | **Spec**: `specs/002-landing-rebrand/spec.md`

## Summary

Replace the landing page's generic Inter/white-background visual treatment with a typography and color system that references the coaching whiteboard, printed clipboard, and 1980s rugby programme aesthetic described in `.impeccable.md`. Changes are token-first (CSS variables + next/font) and limited to three files: `layout.tsx`, `globals.css`, and `page.tsx`. No canvas, API, state, or database changes.

---

## Technical Context

**Language/Version**: TypeScript 5 · Node 22  
**Framework**: Next.js 15 App Router (SSR + API Routes)  
**Canvas**: Konva (react-konva) — **not touched by this feature**  
**State**: Zustand stores — **not touched by this feature**  
**Backend**: Supabase — **not touched by this feature**  
**Styling**: Tailwind CSS v4 via `@theme` in `globals.css`; no `tailwind.config.ts` — all tokens are CSS variables  
**Font loading**: Currently no `next/font` usage — fonts are declared as CSS variable strings only  
**Testing**: Vitest (unit) · Playwright (E2E)  
**Deploy**: Vercel (CI via GitHub Actions)  
**Performance Goals**: No perf impact expected — font loading via `next/font` reduces FOUT  
**Constraints**: No telemetry; no third-party analytics; entity colors untouched; Canvas not touched

---

## Constitutional Compliance Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Check | Status | Notes |
|-------|--------|-------|
| Tier alignment (Guest/Auth/Public/Admin) | ✅ | Tier 0 + Tier 2 — landing page is public, no auth |
| No telemetry or analytics | ✅ | No new data collection; purely visual change |
| Entity colors via EntityColors service | ✅ | Not applicable — no entity/canvas changes |
| Shared canvas — tested on all 3 routes | ✅ | Not applicable — Canvas files untouched |
| New data: privacy impact assessed | ✅ | Not applicable — no schema or data changes |
| Supabase joins flattened before use | ✅ | Not applicable — no new Supabase queries |
| Design System amendment | ✅ | Constitution v3.4.2 updated 2026-04-20 — color token table reflects new palette |

**Gate result: PASS — no violations**

---

## Project Structure

### Documentation (this feature)

```text
specs/002-landing-rebrand/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 codebase research ✓
├── quickstart.md        # Phase 1 manual test guide ✓
└── tasks.md             # Task list ✓
```

*No data-model.md or contracts/ needed — purely presentational feature with no new data entities or API changes.*

> ⚠️ NOTE: `setup-plan.sh` resets this file to the blank template on every run. If plan.md looks like a template, restore from git or the session context.

### Source Code (files changed)

```text
src/
├── app/
│   ├── layout.tsx       # Add next/font/google; apply CSS variables on <html>
│   ├── globals.css      # Update color tokens + font-heading/font-body tokens
│   └── page.tsx         # Redesign feature cards section; tune section composition
```

---

## Phase 0: Research Findings

> See `research.md` for full detail. Summary of decisions:

| Unknown | Decision |
|---------|----------|
| Heading font | `Oswald` (condensed, deliberate weight, editorial/sport aesthetic) |
| Body font | Defer to `/impeccable:typeset` — Inter or DM Sans, validated visually |
| Background color | `#F2ECD8` (warm cream — distinct from white, coaching-document feel) |
| Surface color | `#FDFAF5` (very light cream for content wells) |
| Surface-warm color | `#EDE6D0` (deeper cream for alternating sections) |
| Feature cards pattern | Replace icon-in-colored-square with typographic layout (Oswald title + plain description) |
| Font loading mechanism | `next/font/google` in `layout.tsx` — replaces CSS-variable-only declaration |
| Files affected | 3 files: `layout.tsx`, `globals.css`, `page.tsx` |

---

## Phase 1: Design & Contracts

### Token Changes

Updated CSS variable values for `src/app/globals.css`:

```css
/* Typography */
--font-heading: var(--font-oswald), 'Helvetica Neue', sans-serif;
--font-body: var(--font-dm-sans), system-ui, sans-serif;  /* or keep Inter — confirm via T008 */

/* Color — document-warm neutral palette */
--color-background: #F2ECD8;    /* warm cream — was #F8F9FA */
--color-surface: #FDFAF5;       /* light cream content wells — was #FFFFFF */
--color-surface-warm: #EDE6D0;  /* deeper cream for alternating sections — was #F9FAFB */

/* Primary and accent unchanged */
--color-primary: #1A3D1A;       /* pitch green — unchanged */
--color-accent-warm: #D97706;   /* amber CTA — unchanged */
```

Font CSS variable (`--font-oswald`) is emitted by `next/font` and applied to the `<html>` element via `className` in `layout.tsx`. Body font token (`--font-body`) is confirmed and updated after T008 (`/impeccable:typeset`).

### Feature Cards Redesign

**Before** (SaaS icon-card pattern):
```
[ icon-square ]  Feature Title
                 Description text
```

**After** (typographic coaching-document pattern):
```
Feature Title (Oswald, large)
Description text
```

No icon squares, no colored card backgrounds. Grid maintained (2–3 columns). Visual hierarchy from font weight, not decorative chrome.

### `layout.tsx` Change

```tsx
import { Oswald } from 'next/font/google';

const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
});

// Apply on <html>: className={oswald.variable}
```

### Impeccable Execution

After structural changes are in place, the `/impeccable` skill suite drives craft refinement:
- `/impeccable:typeset` — finalizes font pairing and scale; confirms or updates `--font-body`
- `/impeccable:colorize` — validates and refines the cream palette
- `/impeccable:layout` — tunes section spacing and visual rhythm
- `/impeccable:bolder` — ensures heading weight reads correctly on mobile

---

## Complexity Tracking

> No constitutional violations — section left empty per template rule.
