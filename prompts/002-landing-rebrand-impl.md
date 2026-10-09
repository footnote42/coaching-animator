# Next Session Prompt — Landing Page Rebrand Implementation

**Branch**: `002-landing-rebrand`  
**Date created**: 2026-04-20  
**Picks up from**: spec/plan/tasks complete, `/speckit.analyze` clean (0 critical, 0 high issues)

---

## Context

We are implementing the landing page rebranding for coaching-animator. All planning and specification work is done. The implementation starts now.

**What this is**: A visual-only rebrand of the home page (`/`) aligned with the `.impeccable.md` design context (direct · tactical · grassroots aesthetic, coaching whiteboard tradition). No canvas, API, state, or database changes.

**Three files change**:
1. `src/app/layout.tsx` — add `next/font/google` (Oswald), apply CSS variable on `<html>`
2. `src/app/globals.css` — update color and font tokens
3. `src/app/page.tsx` — redesign feature cards section, tune section composition

**Design authority**: Read `.impeccable.md` before starting any visual work. This is the brand bible for every decision.

---

## Spec and Task Artifacts

All planning artifacts are at `specs/002-landing-rebrand/`:
- `spec.md` — full requirements (FR-001–FR-008, UI-001–UI-007, SC-001–SC-006)
- `plan.md` — technical context, token changes, impeccable execution plan
- `research.md` — font and color decisions with rationale
- `tasks.md` — 19 tasks across 6 phases, ready to execute
- `quickstart.md` — manual verification checklist (9 sections)

> ⚠️ `setup-plan.sh` resets `plan.md` to a blank template every time it runs. If plan.md looks empty, restore it from git: `git show HEAD:specs/002-landing-rebrand/plan.md` or from `prompts/002-landing-rebrand-impl.md` which contains the full plan inline below.

---

## Task List Summary (execute in order)

### Phase 1: Setup
- **T001** — `npm run lint && npx tsc --noEmit` must pass before any changes
- **T002** — Verify `.specify/memory/constitution.md` shows `--color-background: #F2ECD8`, `--color-surface: #FDFAF5`, `--color-surface-warm: #EDE6D0` and version 3.4.2 (done in previous session)

### Phase 2: Foundation — Token Changes
- **T003** — Add `Oswald` via `next/font/google` in `src/app/layout.tsx`; apply `oswald.variable` on `<html>`
- **T004** [P] — Update color tokens in `src/app/globals.css` (background → `#F2ECD8`, surface → `#FDFAF5`, surface-warm → `#EDE6D0`)
- **T005** [P] — Update `--font-heading` to `var(--font-oswald), 'Helvetica Neue', sans-serif` in `src/app/globals.css`

**Checkpoint after Phase 2**: `npm run dev` → visit `http://localhost:3000` → background should be cream, headline should be in Oswald.

### Phase 3: Feature Cards + Impeccable Refinement (US1 + US3)
- **T006** — Remove icon-square containers from Features section in `src/app/page.tsx`; typographic layout only
- **T007** — Tune alternating section backgrounds in `src/app/page.tsx`
- **T008** — Run `/impeccable:typeset` to validate font pairing; update `--font-body` if needed
- **T009** — Run `/impeccable:colorize` to validate cream palette
- **T010** — Run `/impeccable:bolder` on hero section
- **T011** — Run `/impeccable:layout` to tune section spacing
- **T012** — Anti-pattern sweep: no gradient text, no glassmorphism, amber on exactly one CTA per viewport

### Phase 4: Mobile Validation (US2)
- **T013** — DevTools 375px: no horizontal scroll, body ≥ 16px, CTA ≥ 44×44px (both dimensions)
- **T014** — Feature card grid collapses correctly at 375px (single column)

### Phase 5: Accessibility (US4)
- **T015** — Verify amber CTA button contrast; white text on `#D97706` ≈ 3.2:1 — if button is large/bold may pass large-text AA; otherwise switch to dark text
- **T016** [P] — Lighthouse accessibility audit: 0 contrast failures

### Phase 6: Polish
- **T017** — `npm run lint && npx tsc --noEmit` — zero new errors
- **T018** [P] — Visual check: navigation and footer with new cream background
- **T019** — Work through `specs/002-landing-rebrand/quickstart.md` (9 sections, all checkboxes)

---

## Key Technical Decisions (from research.md)

| Decision | Value |
|----------|-------|
| Heading font | `Oswald` (Google Fonts, via `next/font/google`) |
| Body font | Defer to `/impeccable:typeset` — Inter or DM Sans |
| `--color-background` | `#F2ECD8` (warm cream) |
| `--color-surface` | `#FDFAF5` (light cream) |
| `--color-surface-warm` | `#EDE6D0` (deeper cream) |
| `--color-primary` | `#1A3D1A` (unchanged) |
| `--color-accent-warm` | `#D97706` (unchanged, amber CTAs only) |
| Border radius | 0px — already enforced, do not introduce any rounded corners |
| Font loading | `next/font/google` in `layout.tsx` — no CDN requests |

## layout.tsx Font Setup

```tsx
import { Oswald } from 'next/font/google';

const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-oswald',
  display: 'swap',
});

// In RootLayout:
<html lang="en" className={oswald.variable} suppressHydrationWarning>
```

## globals.css Token Changes

```css
/* Update these in @theme block */
--font-heading: var(--font-oswald), 'Helvetica Neue', sans-serif;
--font-family-heading: var(--font-oswald), 'Helvetica Neue', sans-serif;

--color-background: #F2ECD8;
--color-surface: #FDFAF5;
--color-surface-warm: #EDE6D0;
```

## Feature Cards Redesign (page.tsx)

Remove the icon squares from each feature card:

```tsx
// BEFORE — remove this pattern entirely:
<div className="w-12 h-12 bg-primary/10 flex items-center justify-center mb-4">
  <feature.icon className="w-6 h-6 text-primary" />
</div>

// AFTER — keep only:
<h3 className="text-lg font-heading font-semibold text-text-primary mb-2">
  {feature.title}
</h3>
<p className="text-sm text-text-primary/70">
  {feature.description}
</p>
```

Also remove the `Lucide` imports from `FEATURES` array — icons are no longer used.

---

## Quality Gates Before Done

```bash
npm run lint
npx tsc --noEmit
```

Both must pass with zero new errors. Then work through `specs/002-landing-rebrand/quickstart.md` checklist (9 sections).

---

## After Implementation

Run `/handoff` to close the session, then consider:
- `/speckit.git.commit` to commit the implementation
- Update `docs/plans/HANDOFF.md` with session result
- Mark T3 in `docs/authority/ROADMAP.md` as complete

**Next roadmap item after T3**: T4 (Canvas credibility — pitch yard markers) or T9 (Gallery UX improvements).
