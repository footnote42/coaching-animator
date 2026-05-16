# Tasks: Notebook Tab Navigation

**Input**: `specs/022-notebook-tab-nav/plan.md`, `spec.md`, `research.md`, `data-model.md`

**Tests**: Not requested — no test tasks generated. Visual verification via quickstart.md.

**Organization**: Grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Exact file paths in every task description

---

## Phase 1: Setup

**Purpose**: Verify baseline before any changes

- [x] T001 Verify `npm run lint && npx tsc --noEmit` passes on branch `022-notebook-tab-nav` before any changes
- [x] T002 Read `src/app/gallery/GalleryClient.tsx` — check if any graph-paper texture class already exists; document finding: (a) class exists → T016 must rename/merge rather than add; (b) class absent → T016 proceeds as written. Record outcome as a comment in tasks.md or inline in T016 before executing Phase 6
  - *Outcome*: Class absent. Logged in T002_finding.txt.

---

## Phase 2: Foundational (CSS Infrastructure)

**Purpose**: All visual tab and texture styles live in `globals.css` — MUST be complete before Navigation.tsx restructure

**⚠️ CRITICAL**: No user story implementation can begin until this phase is complete

- [x] T003 Add five CSS custom properties (`--c-tab-home`, `--c-tab-gallery`, `--c-tab-playbook`, `--c-tab-create`, `--c-nav-cover`) to the `:root` block in `src/app/globals.css`
- [x] T004 Add `.nav-tab`, `.nav-tab::after` (sheen), `.nav-tab::before` (right-edge depth shadow), `.nav-tab:not(.nav-tab-active)`, `.nav-tab.nav-tab-active` class definitions to `src/app/globals.css`
- [x] T005 [P] Add `.page-texture-lined`, `.page-texture-grid-lg`, `.page-texture-grid-sm` background-image gradient classes to `src/app/globals.css`

**Checkpoint**: CSS variables and `.nav-tab` class verified in browser before moving to Navigation.tsx

---

## Phase 3: User Stories 1, 2 & 4 — Tab Visual Appearance (Priority: P1/P2)

**Goal**: Desktop nav shows coloured notebook tabs with active state, plastic sheen, and correct cover background

**US1**: Identify active section at a glance
**US2**: Per-section colour identity
**US4**: Plastic laminate aesthetic

**Independent Test**: Visit `http://localhost:3000/gallery` — Gallery tab is raised (active), amber coloured, sheen visible; Home and Create tabs recede behind it; nav bar background is dark cover colour; no seam between active tab and page content

- [x] T006 [US1] Add `TAB_SECTIONS` array and `SectionId` type to `src/shared/components/Navigation.tsx` — four entries (home `/`, gallery `/gallery`, playbook `/my-gallery`, create `/app`) with `id`, `label`, `href`, `cssVar`, `requiresAuth` fields
- [x] T007 [US1] [US2] Replace the `hidden md:flex items-center gap-4` div in `src/shared/components/Navigation.tsx` with a tab strip: map `TAB_SECTIONS` (filtered by auth state) to `<Link>` elements using `.nav-tab` / `.nav-tab-active` classes; set `backgroundColor` inline style from `var(--c-tab-{id})`; tab text `text-white text-sm font-medium`; assign default left-to-right z-index (no MRU yet — active tab gets `zIndex: MAX_Z`, others decrease left-to-right); add `aria-label="Site navigation"` to the outer `<nav>` element
- [x] T008 [US4] Apply `--c-nav-cover` as inline background style on the `<nav>` element in `src/shared/components/Navigation.tsx`; remove `bg-surface` class from the nav element; update `border-b border-border` to use a cover-appropriate opacity if needed
- [x] T009 Verify `npm run lint && npx tsc --noEmit` passes; visually verify tab sheen, cover background, active-tab seam, and colour identity in browser

**Checkpoint**: US1, US2, US4 independently verified before proceeding

---

## Phase 4: User Story 3 — MRU Tab Layering (Priority: P2)

**Goal**: Tab z-ordering tracks visit history; order persists across page refresh

**Independent Test**: Visit Gallery → Create → Home; tabs layer front-to-back as Home (active) → Create → Gallery; refresh preserves this order

- [x] T010 Create `src/shared/hooks/useTabOrder.ts` — exports `useTabOrder(sections: SectionId[]): [SectionId[], (id: SectionId) => void]`; reads from `localStorage` key `nav_mru_v1` in `useEffect` (SSR-safe); try/catch falls back to `sections` default order; `recordVisit(id)` prepends id, deduplicates, and writes back to localStorage; filters unknown IDs from stored value on load
- [x] T011 [US3] Wire `useTabOrder` into `src/shared/components/Navigation.tsx` — call `recordVisit(activeId)` in a `useEffect` when `pathname` changes; compute each tab's `zIndex` as `MAX_Z - visitOrder.indexOf(tab.id)` (active tab always gets `MAX_Z`); replace the default z-index assignment from T007 with the MRU-derived values
- [x] T012 Verify `npm run lint && npx tsc --noEmit` passes; manually verify MRU layering and localStorage persistence (quickstart Test B and Test E)

**Checkpoint**: US3 independently verified — MRU order and refresh persistence both pass

---

## Phase 5: User Story 5 — Mobile Hamburger Colour Bars (Priority: P2)

**Goal**: Mobile dropdown shows colour-coded section entries (4px left bar per section)

**Independent Test**: Set viewport to 375px; open hamburger — each section entry has a coloured left bar matching its tab colour; My Playbook absent when unauthenticated

- [x] T013 [US5] Replace `{navLinks}` in the mobile dropdown block of `src/shared/components/Navigation.tsx` with a dedicated mobile renderer: map `TAB_SECTIONS` (filtered by auth state) to `<div className="flex items-center gap-3">` containing a `<div className="w-1 self-stretch" style={{ backgroundColor: 'var(--c-tab-{id})' }} />` colour bar and a `<Link>` for the section; preserve sign-out button and admin link below the section entries
- [x] T014 Verify `npm run lint && npx tsc --noEmit` passes; manually verify mobile dropdown at 375px (quickstart Test D)

**Checkpoint**: US5 independently verified — colour bars visible, auth gate correct, navigation works

---

## Phase 6: User Story 6 — Page Background Textures (Priority: P3)

**Goal**: Home, Gallery, and My Playbook pages each show their distinctive background texture

**Independent Test**: Visit each of the three pages — correct texture visible, Create page and editor have no texture

- [x] T015 [P] [US6] Add `page-texture-lined` class to the outermost content wrapper `<div>` (or `<main>`) in `src/app/page.tsx`
- [x] T016 [P] [US6] Add `page-texture-grid-lg` class to the outermost wrapper element in `src/app/gallery/GalleryClient.tsx` (check T002 findings first — if class already exists, update or merge rather than duplicate)
- [x] T017 [P] [US6] Add `page-texture-grid-sm` class to the outermost wrapper element in `src/app/my-gallery/page.tsx`

**Checkpoint**: US6 independently verified — three textures pass visual test; Create/editor unaffected

---

## Phase 7: Polish & Verification

**Purpose**: Final quality gates and regression check

- [x] T018 Run `npm run lint && npx tsc --noEmit` — must pass with zero new errors
- [x] T019 Run full quickstart test plan from `specs/022-notebook-tab-nav/quickstart.md` — all 7 test sections (A through G) pass
- [x] T020 Run `npm test -- --run` — all existing unit tests pass (no regressions)
- [x] T021 Visual review against `prototype/nav-tabs.html` — sheen quality, MRU layering depth, active-tab seam, cover background, mobile colour bars all match prototype intent
- [x] T022 Confirm `prototype/nav-tabs.html` My Playbook colour (`#1A3D1A`) verdict — if tab is hard to distinguish from cover on screen, update `--c-tab-playbook` in `src/app/globals.css` to `#166534`

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
  └── Phase 2 (Foundational CSS) ← BLOCKS all user story work
        ├── Phase 3 (US1+US2+US4 — Tab Appearance) ← can start once Phase 2 done
        │     └── Phase 4 (US3 — MRU Layering) ← builds on Phase 3 Navigation.tsx
        │           └── Phase 5 (US5 — Mobile) ← also builds on Navigation.tsx
        └── Phase 6 (US6 — Textures) ← independent; can run in parallel with Phases 3-5
  └── Phase 7 (Polish) ← requires all prior phases
```

### Within Each Phase

- T015, T016, T017 (texture page edits) are independent files — run in parallel
- T006 and T007 must be sequential (T007 uses `TAB_SECTIONS` from T006)
- T010 (hook) and T008 (cover bg) are independent — run in parallel

### Parallel Opportunities

| Parallel group | Tasks | Condition |
|---------------|-------|-----------|
| CSS infrastructure | T003, T004, T005 | T005 has no dependency on T003/T004 |
| Navigation + hook | T010 runs parallel to T006–T009 | T010 is pure hook, no Navigation.tsx conflict |
| Page textures | T015, T016, T017 | Three different files |

---

## Implementation Strategy

### MVP (User Stories 1, 2, 4 only — Phase 1–3)

1. Phase 1: Verify baseline
2. Phase 2: CSS infrastructure (variables + `.nav-tab` + textures)
3. Phase 3: Navigation.tsx tab strip (desktop only, default z-order)
4. **STOP AND VALIDATE**: coloured tabs visible, sheen working, active seam clean
5. Ship if MVP is sufficient

### Incremental Delivery

1. Phases 1–3 → MVP: visual tab identity on desktop
2. Phase 4 → adds MRU behaviour and persistence
3. Phase 5 → mobile parity
4. Phase 6 → page textures (P3, skippable)
5. Phase 7 → final gates before PR

---

## Notes

- [P] tasks = different files, no blocking dependencies — launch simultaneously
- `prototype/nav-tabs.html` is the visual design authority — when in doubt, match the prototype
- Tab z-indices are within the nav's stacking context (`z-50`) — they do not compete with page modals/overlays
- `nav-tab-active` applies `margin-bottom: -1px` to cover the nav `border-b` — do not remove this
- Entity colors: N/A — this feature uses navigation chrome colours, not EntityColors service
- Pre-push gate: `npm run lint && npx tsc --noEmit` must pass before PR
