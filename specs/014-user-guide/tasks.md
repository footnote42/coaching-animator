# Tasks: User Guide (Phase 2k)

**Input**: `specs/014-user-guide/plan.md` · `spec.md` · `quickstart.md`

**Tests**: Included — SC-006 explicitly requires test coverage for all acceptance scenarios in US1–US3.

**TDD**: Tests MUST be written first and MUST fail before implementation begins.

**Organization**: Tasks grouped by user story — each story is independently deliverable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no conflicts)
- **[Story]**: User story this task serves
- Include exact file paths in every task description

## Path Conventions

```
Source:   src/features/animation/components/FirstRunModal.tsx
          src/features/animation/components/Editor.tsx
          src/shared/components/Navigation.tsx
          src/shared/components/Footer.tsx
          src/app/layout.tsx
          src/app/help/page.tsx
          src/app/help/coaching/page.tsx

Tests:    tests/unit/components/FirstRunModal.test.tsx
          tests/e2e/user-guide.spec.ts

Pre-push: npm run lint && npx tsc --noEmit
Unit:     npm test -- --run
E2E:      npm run e2e  (requires dev server: npm run dev)
```

---

## Phase 1: Setup

**Purpose**: Clean baseline — orphaned file removed before any new work begins

- [x] T001 Verify `npm run lint && npx tsc --noEmit` passes on branch `014-user-guide` before any changes
- [x] T002 Delete `src/shared/components/OnboardingTutorial.tsx` — orphaned (not imported anywhere), contains `.impeccable.md` violations (emojis, `rounded-xl`, `animate-in`) and stale GIF/MP4 export copy

**Checkpoint**: Branch clean, no pre-existing violations

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No DB or API changes required for this feature. The only cross-cutting prerequisite is verifying the layout injection point for Footer before user stories begin.

*No blocking prerequisites identified — user story phases may proceed immediately after Phase 1.*

---

## Phase 3: User Story 1 — First-time coach self-onboards (Priority: P1) — MVP

**Goal**: An onboarding card appears on first visit to `/app`, explains the 3-step core loop, and disappears on dismiss. The editor is fully usable behind the card. Dismissed state survives page refresh.

**Independent Test**: Open `/app` in incognito. Onboarding card appears in bottom-right corner. Canvas is interactive behind it. Click "Got it" — card disappears. Refresh — card does NOT reappear. Elapsed time to complete core loop: <5 minutes.

### Tests for User Story 1 (write FIRST — must FAIL before implementation)

- [x] T003 [US1] Update `tests/unit/components/FirstRunModal.test.tsx` — replace dialog-focused tests with: (a) renders fixed corner card when `open=true`, (b) does NOT render when `open=false`, (c) clicking "Got it" calls `onDismiss`, (d) no Radix Dialog elements present, (e) uses `rounded-none` not `rounded-md`. Verify tests FAIL on current codebase before proceeding.

### Implementation for User Story 1

- [x] T004 [US1] Refactor `src/features/animation/components/FirstRunModal.tsx` — remove Radix UI Dialog wrapper; replace with `div` positioned `fixed bottom-24 right-4 z-40 max-w-xs`; apply `rounded-none border border-border bg-surface text-text-primary`; update copy to 3 steps ("Add players to the pitch — drag from the sidebar", "Move them per frame — click Add Frame to record each position", "Save and share — generate a link your squad can open on their phone"); dismiss button: `rounded-none bg-primary text-text-inverse text-sm font-medium w-full`; label: "Got it"; no animations, no emojis. Props: `{ open: boolean; onDismiss: () => void }`.
- [x] T005 [US1] Update `src/features/animation/components/Editor.tsx` — add `showOnboarding` state initialized from `localStorage.getItem('firstRunSeen') !== '1'`; update `FirstRunModal` render at line 302 to pass `open={showOnboarding}` and `onDismiss={() => { localStorage.setItem('firstRunSeen', '1'); setShowOnboarding(false); }}`; remove any stale `open` prop pattern left over from the dialog API.
- [x] T006 [US1] Verify `npm run lint && npx tsc --noEmit` passes; run `npm test -- --run` and confirm T003 tests now pass.

**Checkpoint**: US1 fully functional — test independently in incognito before continuing

---

## Phase 4: User Story 2 — Coach finds the help page (Priority: P1)

**Goal**: `/help` page exists with 4 structured sections, loads without authentication, and is reachable in one click from both the navigation header "?" icon and the site footer "Help" link on every page.

**Independent Test**: In incognito, click the "?" icon in the nav header — lands on `/help`. Read 4 sections. Click "Help" in the footer from `/gallery` — lands on `/help`. Confirm `/app` has no footer. Confirm `/share/{id}` has no footer.

### Tests for User Story 2 (write FIRST — must FAIL before implementation)

- [x] T007 [P] [US2] Add scenarios to `tests/e2e/user-guide.spec.ts` (create file if it doesn't exist) covering: (a) `?` nav icon on homepage navigates to `/help`, (b) `/help` returns 200 without auth, (c) `/help` contains all 4 section headings (core workflow, what's on the pitch, sharing, coaching framework), (d) footer "Help" link visible on `/gallery` and navigates to `/help`, (e) footer absent on `/app`. Verify these tests FAIL before implementation.

### Implementation for User Story 2

- [x] T008 [P] [US2] Create `src/shared/components/Footer.tsx` — client component (`'use client'`); import `usePathname` from `next/navigation`; return `null` if pathname starts with `/share/` or `/app`; render `<footer className="border-t border-border bg-surface mt-auto">` with `<div className="max-w-6xl mx-auto px-4 py-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-text-primary/50">`; links: Help (`/help`), Coaching Guide (`/help/coaching`), Contact (`/contact`), Terms (`/legal/terms`), Privacy (`/legal/privacy`), Sitemap (`/sitemap-page`); all links: `hover:text-text-primary transition-colors`; zero `rounded-*` classes; no emojis; no shadows.
- [x] T009 [US2] Update `src/app/layout.tsx` — import `Footer` from `@/shared/components/Footer`; add `<Footer />` after `{children}` and before `<OfflineIndicator />` (or before `<Toaster />` if OfflineIndicator is not present in the file).
- [x] T010 [P] [US2] Update `src/shared/components/Navigation.tsx` — import `HelpCircle` from `lucide-react`; add `<Link href="/help" className="p-1.5 text-text-primary/70 hover:text-primary transition-colors" aria-label="Help"><HelpCircle className="w-4 h-4" /></Link>` to the desktop nav links fragment (after existing nav links, before the CTA button); add a "Help" text link in the mobile dropdown menu at the same position.
- [x] T011 [P] [US2] Create `src/app/help/page.tsx` — server component; `export const metadata = { title: 'Help' }`; sections using standard heading hierarchy (`font-heading font-bold`): (1) **Core workflow** — 4 steps: add entities, set positions per frame, save, share the link; (2) **What's on the pitch** — entity types: attacker (red), defender (blue), ball (white), cone (high-vis yellow), tackle shield, tackle bag; (3) **Sharing** — save first, then Share button copies `/share/{id}` link; works in WhatsApp; (4) **Coaching framework** — one-liner teaser + link to `/help/coaching`; layout: `max-w-2xl mx-auto px-4 py-8`; zero rounded corners; no emojis; no soft shadows; no animations; WCAG AA contrast on all text.
- [x] T012 [US2] Verify `npm run lint && npx tsc --noEmit` passes; run `npm run e2e` and confirm T007 tests now pass.

**Checkpoint**: US2 fully functional — test help page and navigation independently before continuing

---

## Phase 5: User Story 3 — Coach discovers APES framework (Priority: P2)

**Goal**: `/help/coaching` exists, loads without authentication, explains APES in plain language with grassroots tone, links to the gallery, and has a "← Back to Help" link.

**Independent Test**: In incognito, navigate to `/help/coaching`. Page loads (no auth redirect). Verify APES (Active, Purposeful, Enjoyable, Safe) is explained. Verify gallery link and back link exist.

### Tests for User Story 3 (write FIRST — must FAIL before implementation)

- [x] T013 [P] [US3] Add scenarios to `tests/e2e/user-guide.spec.ts`: (a) clicking coaching framework link on `/help` navigates to `/help/coaching`, (b) `/help/coaching` returns 200 without auth, (c) page contains "APES" and each letter (Active, Purposeful, Enjoyable, Safe), (d) "Back to Help" link navigates to `/help`, (e) gallery link navigates to `/gallery`. Verify FAIL before implementation.

### Implementation for User Story 3

- [x] T014 [P] [US3] Create `src/app/help/coaching/page.tsx` — server component; `export const metadata = { title: 'Coaching Framework' }`; heading: "The APES Framework"; brief intro: what APES stands for and why it matters for grassroots clubs; four sections (one per letter): plain English description + one example applied to a drill in the animator; tone: direct, grassroots — written for a volunteer club coach, not an academic; CTA: "Browse the gallery for APES-aligned drills" → link to `/gallery`; back link: "← Back to Help" → `/help`; layout: `max-w-2xl mx-auto px-4 py-8`; zero rounded corners; no emojis; no soft shadows; no animations.
- [x] T015 [US3] Verify `npm run lint && npx tsc --noEmit` passes; run `npm run e2e` and confirm T013 tests now pass.

**Checkpoint**: US3 functional — visit `/help` → click coaching link → `/help/coaching` loads correctly

---

## Phase 6: User Story 4 — Returning coach re-opens onboarding on demand (Priority: P3)

**Goal**: After dismissing the onboarding, a coach can re-open the card via the "How it works" button at the bottom of the editor sidebar.

**Independent Test**: Dismiss the onboarding card. Locate the "How it works" button at the bottom of the sidebar (with HelpCircle icon). Click it. Onboarding card reappears. Dismiss again — closes without side effects.

*Note: US4 shares the same Editor.tsx file as US1. The sidebar help button is implemented alongside US1 (T005). This phase adds the button if not already done.*

### Implementation for User Story 4

- [x] T016 [US4] In `src/features/animation/components/Editor.tsx` — add help button strip at the bottom of the `<aside>` element, outside the scrollable `overflow-y-auto` div: `<div className="border-t border-border p-3 flex justify-between items-center"><button onClick={() => setShowOnboarding(true)} className="flex items-center gap-1.5 text-xs text-text-inverse/70 hover:text-text-inverse transition-colors" aria-label="Show guide"><HelpCircle className="w-4 h-4" /><span>How it works</span></button><Link href="/help" className="text-xs text-text-inverse/50 hover:text-text-inverse/80 transition-colors">Help</Link></div>`; only show when `!sidebarCollapsed`; import `HelpCircle` from `lucide-react` if not already imported by T005.

*If T005 already added this button, mark T016 as complete.*

**Checkpoint**: All 4 user stories independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates, style compliance verification, final pre-PR checks

- [x] T017 [P] Manual impeccable style audit — verify zero `rounded-*` (except `rounded-none`) on: FirstRunModal card and button, Footer links and container, help pages, Navigation "?" icon; verify no emojis anywhere in new copy; verify no `shadow-*` classes; verify no `animate-in` or `hover:scale-*`
- [x] T018 [P] Manual WCAG AA spot-check — verify `text-text-primary/70` and `text-text-inverse/70` used in footer and sidebar button meet 4.5:1 contrast against their backgrounds in both light and dark themes
- [x] T019 [P] Canvas regression check — manually verify `/app` (editor), `/replay/[id]` (replay), `/share/[id]` (share/mobile) all still function correctly; no canvas layout breaks from Footer or layout.tsx changes
- [x] T020 Run `npm test -- --run` — all unit tests pass (including updated FirstRunModal.test.tsx)
- [x] T021 Run `npm run e2e` — all E2E tests pass including new `tests/e2e/user-guide.spec.ts`
- [x] T022 Run `npm run lint && npx tsc --noEmit` — zero new errors introduced
- [x] T023 Manual quickstart walkthrough — complete all 8 sections in `specs/014-user-guide/quickstart.md` end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Start immediately — no dependencies
- **Phase 3 (US1)**: Depends on Phase 1; T004 before T005 (both in same file)
- **Phase 4 (US2)**: Depends on Phase 1; T008 before T009 (Footer must exist before layout import); T010 and T011 are parallel
- **Phase 5 (US3)**: Depends on Phase 4 (coaching link must exist on `/help` first — T011 creates it)
- **Phase 6 (US4)**: Depends on Phase 3 (same Editor.tsx file as US1)
- **Phase 7 (Polish)**: Depends on all story phases complete

### Within Each User Story

- Tests written and confirmed FAILING before any implementation task begins
- US1 and US2 are both P1 — they can be executed in parallel (different files)
- US3 depends on US2 being complete (coaching link is on the /help page)
- US4 shares Editor.tsx with US1 — serialize within that file

### Parallel Opportunities

Tasks marked `[P]` have no file conflicts:
- T007 (US2 E2E tests) + T003 (US1 unit tests) — different test files
- T008 (Footer) + T010 (Navigation) + T011 (help page) — different files entirely
- T013 (US3 E2E additions) + T014 (coaching page) — test vs source, no conflict
- T017 (style audit) + T018 (WCAG check) + T019 (canvas regression) — manual checks

---

## Implementation Strategy

### MVP: User Story 1 only

1. Complete Phase 1 (Setup — delete OnboardingTutorial)
2. Write + fail T003 (FirstRunModal unit tests)
3. Implement T004 + T005 + T006 (FirstRunModal refactor + Editor wiring)
4. **STOP and VALIDATE**: incognito test confirms onboarding card appears, dismisses, doesn't reappear
5. Ship — core self-onboarding criterion met

### Incremental Delivery

1. Phase 1 → Phase 3 (US1) → validate → optionally ship
2. Phase 4 (US2) → validates help page + navigation → ship
3. Phase 5 (US3) → validates coaching page → ship
4. Phase 6 (US4) → sidebar re-open trigger → ship
5. Phase 7 → final quality gate → PR ready

---

## Notes

- `[P]` tasks = different files, no dependencies — run in parallel
- `[Story]` label maps tasks to user stories for traceability
- US4 implementation is folded into T005 (Phase 3) and T016 (Phase 6) — both touch Editor.tsx
- `.impeccable.md` key rules: `rounded-none` everywhere; design tokens only; no emojis; no shadows; no `animate-in`
- No DB schema changes, no API routes, no Supabase queries — all new surfaces are static or device-local
- Footer uses `usePathname` to self-exclude from `/app` and `/share/*` — no layout conditional needed
- Pre-push gate: `npm run lint && npx tsc --noEmit` must pass before PR
