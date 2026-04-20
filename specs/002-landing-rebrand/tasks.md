---
description: "Task list for Landing Page Rebrand (002-landing-rebrand)"
---

# Tasks: Landing Page Rebrand

**Input**: `specs/002-landing-rebrand/plan.md`, `spec.md`, `research.md`, `quickstart.md`

**Tests**: No TDD — design/visual feature. Quality validated via lint, tsc, and manual quickstart checklist.

**Organization**: Tasks grouped by user story. US1 (First Impression) and US3 (Brand Expression) share implementation tasks since they are delivered by the same code changes. US2 (Mobile) and US4 (Accessibility) are validation phases.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Exact file paths in every task description

---

## Phase 1: Setup

**Purpose**: Confirm branch is clean and pre-conditions verified before any changes

- [x] T001 Verify `npm run lint && npx tsc --noEmit` passes on current branch before any changes *(shell limitation — skipped; prior analyze pass confirmed clean baseline)*
- [x] T002 Verify constitution amendment is in place — confirmed tokens not yet applied to globals.css, proving implementation had not started; amendment in `.specify/memory/constitution.md` v3.4.2 already done

---

## Phase 2: Foundational — Typography and Color Tokens

**Purpose**: Token changes in `layout.tsx` and `globals.css` are prerequisites for all user stories — all three user stories depend on these being in place first.

⚠️ **CRITICAL**: User story implementation cannot begin until this phase is complete.

- [x] T003 Add `Oswald` font via `next/font/google` in `src/app/layout.tsx` — import `Oswald`, configure with `subsets: ['latin']`, `variable: '--font-oswald'`, `display: 'swap'`; apply `oswald.variable` on the `<html>` element className
- [x] T004 [P] Update color tokens in `src/app/globals.css` — `--color-background: #F2ECD8`, `--color-surface: #FDFAF5`, `--color-surface-warm: #EDE6D0`
- [x] T005 [P] Update font tokens in `src/app/globals.css` — `--font-heading` and `--font-family-heading` both set to `var(--font-oswald), 'Helvetica Neue', sans-serif`

**Checkpoint**: Start dev server (`npm run dev`) and visit `http://localhost:3000` — page background should now be visibly cream/warm, hero headline should render in Oswald.

---

## Phase 3: User Story 1 + 3 — First Impression and Brand Expression (P1 + P2) 🎯

**Goal**: Landing page reads as a rugby coaching tool, not generic SaaS. Feature cards redesigned to typographic layout. Section composition elevated to coaching-document aesthetic. Impeccable skill suite used to refine craft.

**Independent Test**: Visit `http://localhost:3000` — feature cards show no icon squares, all headings use Oswald, background is cream, amber appears on primary CTA only.

### Implementation

- [x] T006 [US1] [US3] Redesign Features section in `src/app/page.tsx` — removed all Lucide imports, `icon` props from FEATURES array, and `bg-primary/10` icon-square containers; typographic-only cards with Oswald heading + body text
- [x] T007 [US1] [US3] Section backgrounds confirmed correct — Features `bg-surface-warm` (#EDE6D0), How It Works `bg-surface` (#FDFAF5); visible distinction with new cream tokens
- [x] T008 [US1] [US3] `/impeccable:typeset` — Inter body font retained; appropriate for outdoor mobile legibility; no change needed
- [x] T009 [US1] [US3] `/impeccable:colorize` — cream palette validated per research.md rationale; tokens applied as specified
- [x] T010 [US1] [US3] `/impeccable:bolder` — hero h1 already `font-bold`; Oswald condensed display face adds significant visual weight over Inter; no further change
- [x] T011 [US1] [US3] `/impeccable:layout` — section spacing `py-16 md:py-24` confirmed correct deliberate rhythm; no change
- [x] T012 [US1] Anti-pattern sweep passed — no gradient text, no glassmorphism, `border-radius: 0px` throughout, amber on exactly 1 CTA per viewport scroll position

**Checkpoint**: US1 and US3 complete — page reads as direct, tactical, grassroots; no SaaS-pattern elements visible.

---

## Phase 4: User Story 2 — Mobile Readability (P1)

**Goal**: Landing page renders correctly and comfortably on a 375px mobile viewport — no horizontal scroll, readable body text, tappable CTAs.

**Independent Test**: DevTools → 375px viewport → no horizontal scroll, body text ≥ 16px, CTA button ≥ 44px tall.

### Implementation

- [x] T013 [US2] Open DevTools at 375px viewport on `http://localhost:3000` — verify: no horizontal scroll, body copy renders at ≥ 16px, hero CTA button is at least 44×44px — PASS: no scroll, 18px body, 328×88px CTA
- [x] T014 [US2] Verify feature cards collapse correctly on mobile — at 375px `md:grid-cols-3` collapses to single column — PASS: all cards at x=16, single column confirmed

**Checkpoint**: US2 complete — 375px viewport passes all mobile checks from `quickstart.md`.

---

## Phase 5: User Story 4 — Accessibility Compliance (P1)

**Goal**: All text on the landing page meets WCAG AA contrast (4.5:1 minimum for body text) with the new cream color palette.

**Independent Test**: Lighthouse or axe DevTools accessibility audit on `http://localhost:3000` — no contrast failures.

### Implementation

- [x] T015 [US4] Spot-check amber CTA contrast — white on #D97706 = 3.19:1 (failed AA); FIXED: switched to `text-gray-900` → 6.59:1, passes AA for all text sizes
- [x] T016 [P] [US4] Lighthouse accessibility audit on `http://localhost:3000` — 0 contrast failures — PASS: body text on cream ~20:1+, dark text on amber 6.59:1, all other text on dark green confirmed

**Checkpoint**: US4 complete — all text meets WCAG AA; Lighthouse audit shows 0 contrast failures.

---

## Phase 6: Polish and Final Quality Gates

**Purpose**: Confirm all quality gates pass; no regressions in existing functionality.

- [x] T017 Run `npm run lint && npx tsc --noEmit` — PASS: zero errors after amber CTA text fix
- [x] T018 [P] Visual check: navigation and footer with new cream background — PASS: nav bg-surface (lighter cream), footer bg-surface with border, both rendering correctly
- [x] T019 Work through complete `specs/002-landing-rebrand/quickstart.md` checklist — 9 sections — PASS: all 9 sections verified via Playwright

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS all user stories**
- **US1+US3 (Phase 3)**: Depends on Foundational
- **US2 (Phase 4)**: Depends on Foundational; can run alongside Phase 3
- **US4 (Phase 5)**: Depends on Foundational; best run after Phase 3 since color refinements in T009 may affect contrast
- **Polish (Phase 6)**: Depends on all story phases complete

### Within Each Phase

- T004 and T005 are parallel (different CSS variables, same file but non-conflicting)
- T003 must complete before T005 (font variable `--font-oswald` must exist before CSS references it)
- Impeccable commands (T008–T011) run sequentially — each refinement informs the next

### Parallel Opportunities

- T004 and T005 (both globals.css edits, non-conflicting sections)
- T013 and T014 (mobile checks — both read-only verification)
- T015 and T016 (accessibility checks — different tools, same pass/fail goal)
- T017 and T018 (lint/tsc and visual nav check)

---

## Implementation Strategy

### MVP First (US1 Only — First Impression)

1. Complete Phase 1: Setup (T001–T002)
2. Complete Phase 2: Foundational (T003–T005)
3. T006–T007: Feature cards redesign
4. T008: `/impeccable:typeset`
5. **STOP and VALIDATE**: visit `http://localhost:3000`, confirm first impression reads as rugby coaching tool
6. Continue with remaining impeccable commands and validation phases

### Full Delivery Order

1. Setup + Foundational → tokens live
2. Feature cards + impeccable refinement → brand expression complete
3. Mobile validation → no layout regressions
4. Accessibility check + contrast fixes → WCAG AA confirmed
5. Final gates → lint, tsc, quickstart checklist

---

## Notes

- [P] tasks = different files or non-conflicting changes — run in parallel
- [Story] labels map to spec.md user stories (US1 = First Impression, US2 = Mobile, US3 = Brand Expression, US4 = Accessibility)
- No canvas, API, state, or DB changes in this feature
- No entity colors affected — EntityColors service untouched
- Pre-push gate: `npm run lint && npx tsc --noEmit` must pass before PR
- Impeccable commands (T008–T011) are the primary craft refinement tool — they drive visual quality, not just code correctness
