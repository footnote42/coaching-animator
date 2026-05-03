---
description: "Task list for Phase 2l — Cosmetic Polish"
---

# Tasks: Phase 2l — Cosmetic Polish

**Input**: `specs/015-cosmetic-polish/plan.md`, `spec.md`, `research.md`, `data-model.md`

**Organization**: Tasks grouped by user story. No test tasks requested (verification tasks included instead).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Include exact file paths in every task description

---

## Phase 1: Setup

**Purpose**: Baseline verified — branch is clean and CI gates are passing before any changes

- [x] T001 Verify `npm run lint && npx tsc --noEmit` passes on current branch before any changes

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared type and utility changes used by multiple user stories — must exist before gallery workstreams begin

**⚠️ CRITICAL**: Gallery story tasks (US2, US5) depend on T002. Card hover tasks (US2, US5) depend on T003.

- [x] T002 [P] Add `endorsed_by: string | null` field to `AnimationSummary` interface in `src/features/gallery/components/AnimationCard.tsx` (line ~13) and ensure the API response in `src/app/api/gallery/route.ts` selects this column
- [x] T003 [P] Create shared hover utility `src/shared/ui/card-action-hover.ts` exporting a single Tailwind class string (e.g. `hover:bg-surface-warm`) to enforce consistent card-button hover feedback across gallery and Playbook (UI-005)

**Checkpoint**: Type and utility additions in place — gallery story work can now begin

---

## Phase 3: User Story 1 — Share-flow Clarity (Priority: P1)

**Goal**: Coach can share an animation from the editor; player opens link and sees the title; back button is context-aware for owners.

**Independent Test**: Visit `/app` → save → click Share → verify share sheet opens with `/share/{id}` URL and copy-to-clipboard. Visit `/share/{id}` as owner → back button → `/my-gallery`. Visit as guest → back button → `/gallery`. Animation title visible top-left of share chrome.

### Implementation for User Story 1

- [x] T004 [P] [US1] Create `src/features/animation/components/ShareSheet.tsx`: modal/sheet component with `ShareSheetProps` interface (`animationId`, `animationTitle`, `open`, `onClose`); constructs `/share/{animationId}` URL; invokes `navigator.share` (Web Share API) on mobile; falls back to `navigator.clipboard.writeText` on desktop / unsupported browsers; displays the URL and a copy button with visible confirmation state
- [x] T005 [P] [US1] Update `src/app/share/[id]/page.tsx`: add `user_id` to the Supabase `select` query (around line 69–76) and pass it as `animationUserId` prop to `ShareViewer`
- [x] T006 [US1] Update `src/features/animation/components/ShareViewer.tsx`: (a) change title alignment from `text-center` to `text-left` (line ~275); (b) add `animationUserId` prop; derive `isOwner` using `useUser()` from UserContext; update back-button `href` to `/my-gallery` when owner, `/gallery` otherwise (lines ~344–355); (c) add "powered by Coaching Animator" `<a href="/">` link as `absolute bottom-2 right-2` in the chrome layer outside the canvas div; (d) fix `bg-white` → `bg-surface` on the ShareCanvas div (line ~177) — depends on T005
- [x] T007 [US1] Add Share button to `src/features/animation/components/EditorFloatingRemote.tsx` using `ShareSheet` from T004: button visible only when animation has a saved `id` (not a new unsaved animation); opens ShareSheet with `animationId` and `animationTitle` — depends on T004
- [x] T008 [US1] Verify `src/app/gallery/GalleryClient.tsx`: confirm `handleView` routes to `/share/${id}` not `/replay/${id}`; scan all public card surfaces in `GalleryClient.tsx`, `PublicAnimationCard.tsx`, `AnimationCard.tsx` for any remaining `/replay/` links and update to `/share/`

**Checkpoint**: Full share workflow functional — share from editor, title on share view, context-aware back button

---

## Phase 4: User Story 2 — My Playbook Parity (Priority: P1)

**Goal**: Playbook has search/filter, full card parity (mini-pitch + progression strip + labelled actions), private animations open, and visually distinct page banner.

**Independent Test**: Sign in → `/my-gallery` — confirm: page banner distinct from `/gallery`; search narrows cards by title/tag; each card shows mini-pitch preview + progression strip + labelled Edit/Replay/Share; clicking a private animation opens without error.

### Implementation for User Story 2

- [x] T009 [P] [US2] Add styled page banner to `src/app/my-gallery/page.tsx` above the card grid: `font-heading` title "My Playbook", tactical motif (SVG or CSS), `bg-[var(--color-surface-warm)]` (#EDE6D0 — deeper cream per design system); zero radius; amber not used; replaces the generic `text-2xl font-heading` heading at lines ~178–197
- [x] T010 [P] [US2] Add styled page banner to `src/app/gallery/GalleryClient.tsx` (public Gallery): `font-heading` title "Community Playbook", rugby-lines motif, `bg-[var(--color-background)]` (#F2ECD8 — warm cream per design system); paired with T009 to make each page visually distinct at a glance
- [x] T011 [P] [US2] Update `src/features/gallery/components/AnimationCard.tsx`: (a) add text labels to Edit (line ~253), Replay (click overlay), and Share (line ~232) actions (icon+label or text buttons per FR-009); (b) fix `rounded-full` → `rounded-none` on lines 177 and 184; (c) apply shared hover utility from T003 to action buttons; (d) update any `/replay/` links to `/share/` — depends on T002, T003
- [x] T012 [US2] Fix private animation open bug: investigate `src/app/share/[id]/page.tsx` RLS/auth handling for private animations owned by the signed-in user; ensure the server component passes auth context correctly so the owner can view their own private animation without a 403/404
- [x] T013 [US2] Verify My Playbook search/filter end-to-end in `src/app/my-gallery/page.tsx`: title filter narrows results; tag filter works; sort controls work; empty-state does not crash; search input remains visible when list is empty

**Checkpoint**: My Playbook fully functional with parity to public gallery

---

## Phase 5: User Story 3 — Landing Page Polish (Priority: P1)

**Goal**: Landing hero is rugby-specific with tactical-ball SVG; copy is accurate and coach-facing; no duplicate footer links.

**Independent Test**: Open `/` in a fresh session — tactical-ball SVG in hero; Section 2 card 2 has no "code" reference; Section 2 card 4 has no export/GIF mention; Section 3 card 1 describes click-to-place + drag; Section 3 card 3 has no GIF export claim; footer has no duplicated links from section above.

### Implementation for User Story 3

- [x] T014 [P] [US3] Audit `src/app/_components/HeroBackground.tsx` against LANDING-002 (FR-017): if a rugby-ball *shape* is absent (current diagrams are tactical lines/arrows, not a ball outline), add `public/assets/tactical-ball.svg` (hand-drawn marker stroke, pitch-green outline, amber tactical markings, zero rounded corners) and reference it in HeroBackground; also verify reduced-motion and mobile viewport (< 480 px) handling
- [x] T015 [P] [US3] Audit `src/app/page.tsx`: verify Section 2 card 2 (no "code" / developer language), Section 2 card 4 (no export/GIF/WebM, preserves 4-card grid), Section 3 card 1 (click-to-place then drag description), Section 3 card 3 (no GIF export claim), footer (no duplicated CTA links); update only where stale copy is found

**Checkpoint**: Landing page credibility confirmed — no developer jargon, no dead feature references

---

## Phase 6: User Story 4 — Header & Profile Context (Priority: P2)

**Goal**: Auth state visible in header on all pages; profile page reads as identity card not bare form.

**Independent Test**: Sign out → Login affordance visible in header without opening a menu. Sign in → profile chip with initial/name visible persistently. Visit `/profile` → clear heading hierarchy, sectioned layout.

### Implementation for User Story 4

- [x] T016 [P] [US4] Update `src/shared/components/Navigation.tsx`: add guest `<LoginButton>` control and authenticated `<ProfileChip>` (initial/avatar chip derived from UserContext) that are persistently visible without opening a menu; replace or augment the plain "Profile" text link when authenticated (FR-023)
- [x] T017 [P] [US4] Fix `src/app/profile/page.tsx`: change `rounded-full` → `rounded-none` on avatar circle (line ~253) and loading spinner (line ~235); verify the identity card composition (heading hierarchy, sectioned layout) already reads well — no layout overhaul needed per research finding (FR-024)

**Checkpoint**: Authentication state visible on all pages; profile page composition confirmed

---

## Phase 7: User Story 5 — Card Consistency & Branding (Priority: P2)

**Goal**: Gallery thumbnails use correct entity colours; endorsed cards show RFU badge; card layout is stable; hover is consistent.

**Independent Test**: Visit `/gallery` — mini-pitch shows pitch green / red attack / blue defence / hi-vis yellow cones; endorsed card shows RFU badge < 50 KB; cards with/without tags occupy same vertical footprint; hover feedback is consistent across all action buttons.

### Implementation for User Story 5

- [x] T018 [P] [US5] Fix colour tokens in `src/features/gallery/components/MiniPitchSVG.tsx`: import `EntityColors` from `@/features/animation`; replace attack player fill with `EntityColors.getDefault('player', 'attack')` (resolves to blue `#2563EB` per `DESIGN_TOKENS.colours.attack[0]`); replace defence player fill with `EntityColors.getDefault('player', 'defense')` (resolves to red `#DC2626` per `DESIGN_TOKENS.colours.defense[0]`); add cone rendering using `EntityColors.getDefault('cone')` (resolves to hi-vis yellow `#E6EA0C` per `neutral[2]`); remove the "intentional documented exception" note at line ~25 (overridden by FR-014). Spec prose says "red attack / blue defence" — this is a labelling convention; the token-resolved values are authoritative (attack=blue, defence=red).
- [x] T019 [P] [US5] Add `public/assets/hampshire-rfu-badge.webp` (compressed < 50 KB); update `src/features/gallery/components/AnimationCard.tsx` to render the badge image when `animation.endorsed_by` is set — depends on T002
- [x] T019b [US5] Add constitution-mandated endorsement disclaimer (V.2.4) to endorsed cards in `src/features/gallery/components/AnimationCard.tsx` and `src/features/gallery/components/PublicAnimationCard.tsx`: when `animation.endorsed_by` is set, render the required text — *"Endorsed by [endorsed_by]. Endorsement does not guarantee accuracy, safety, or suitability for all coaching contexts. Coaches are responsible for adapting drills to their players' skill levels."* — as a `title` attribute on the badge image (minimum) or as a visible small-print line below the badge (preferred); no new hardcoded colours; zero radius on any wrapper — depends on T019
- [x] T020 [P] [US5] Fix `src/features/gallery/components/PublicAnimationCard.tsx`: change `rounded-full` → `rounded-none` on lines 177 and 184; apply shared hover utility from T003 to all card action buttons; update Remix attribution link from `/replay/` to `/share/` (line ~225)
- [x] T021 [US5] Add stable card layout slots to `src/features/gallery/components/AnimationCard.tsx` and `src/features/gallery/components/PublicAnimationCard.tsx`: tag row and progression strip use reserved slots with `min-h-[N]` outer container and `h-0` collapse when empty so card footprint is consistent across cards with/without these badges (FR-013, UI-006) — depends on T019, T020
- [x] T022 [US5] Verify templates filter end-to-end: create an animation tagged as a template → confirm it appears under templates filter in `/gallery` → remix it → confirm no regression from the architecture refactor (FR-016 / GALLERY-003)

**Checkpoint**: Card consistency and branding confirmed on both gallery surfaces

---

## Phase 8: Polish & Impeccable Audit

**Purpose**: Verify design quality, run all CI gates, confirm SC-010 (≥18/20 audit score)

- [x] T023 [P] Run impeccable audit on all touched surfaces: check for `rounded-*` on new buttons/badges/banners, `bg-white` on editor or share surfaces, `font-heading` missing on new/rewritten headings (share-view title, page banners, profile heading), amber proliferation beyond singular CTAs
- [x] T024 Fix any impeccable audit violations found during T023 across touched files
- [x] T025 [P] Verify RFU badge asset size gate: `ls -la public/assets/hampshire-rfu-badge.*` must be < 51200 bytes
- [x] T026 Run `npm run lint && npx tsc --noEmit` — no new errors permitted
- [x] T027 Audit SC-011 acceptance scenario coverage: grep `tests/e2e/` and `tests/unit/` for coverage of: (a) share-flow context-aware back button (owner vs guest), (b) AnimationCard labelled Edit/Replay/Share actions, (c) ProfileChip guest vs auth render state; if any scenario has no test, add a targeted test in the appropriate spec file before marking T027 done
- [x] T028 Run `npm test -- --run` — all unit tests pass (including any added by T027)
- [x] T029 Run `npm run e2e` — all E2E tests pass (dev server running: `npm run dev`)

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
  └── Phase 2 (Foundational)
        ├── Phase 3 (US1 — independent of T002/T003)
        ├── Phase 4 (US2 — T009, T010, T011 depend on T002, T003)
        ├── Phase 5 (US3 — independent)
        ├── Phase 6 (US4 — independent)
        └── Phase 7 (US5 — T019 depends on T002; T020 depends on T003)
              └── Phase 8 (Polish — depends on all stories)
```

### Within User Story 1

- T004 (ShareSheet) and T005 (share page) → run in parallel
- T006 (ShareViewer) depends on T005
- T007 (EditorFloatingRemote) depends on T004
- T008 (verify FLOW-001) → independent, run any time

### Within User Story 2

- T009, T010, T011, T012, T013 → mostly parallel (different files)
- T011 depends on T002 and T003

### Within User Story 5

- T018, T019, T020 → run in parallel
- T019b depends on T019 (needs badge rendered first)
- T021 depends on T019, T019b, and T020

### Parallel Opportunities (cross-story)

Once Phase 2 is complete, all 5 user story phases can be worked in parallel (different workstreams, different files). Recommended single-session order per plan.md: US4 → US3 → US2 → US1 → US5 → Polish (ascending blast radius).

---

## Implementation Strategy

### MVP First (US1 + US2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (T002, T003)
3. Complete Phase 3: US1 — share flow clarity
4. Complete Phase 4: US2 — My Playbook parity
5. **STOP and VALIDATE**: manually test both stories per quickstart.md
6. Proceed to US3, US4, US5 incrementally

### Incremental Delivery

- US1 → share loop closes the Phase 2 workflow-clarity exit criterion
- US2 → Playbook parity removes the highest-severity bug (private-open) plus usability gaps
- US3, US4, US5 → credibility and polish; shippable at any point after US1+US2
- Polish (Phase 8) → final gate before PR

---

## Notes

- [P] tasks = different files, no dependencies — run in parallel
- [Story] label maps tasks to user stories for traceability
- MiniPitchSVG colour fix (T018): attack=blue (#2563EB), defense=red (#DC2626), cone=hi-vis yellow (#E6EA0C) — confirmed from `src/core/constants/design-tokens.ts`. Spec prose says "red attack" (labelling convention only); tokens are authoritative. Note: the CLAUDE.md global example shows `getDefault('player', 'attack') → '#ef4444'` which is incorrect — `#ef4444` is a different red; the real value is `#2563EB` (blue). Do not rely on that comment.
- Entity colors: always `EntityColors.resolve()` or `EntityColors.getDefault()` — never hardcoded hex
- ShareViewer: keep `position:fixed inset:0` — never change to `h-screen` or `h-full`; title and attribution go in existing chrome layer (CV-002)
- Supabase joins: always flatten (`Array.isArray(raw) ? raw[0] : raw`) before use
- Pre-push gate: `npm run lint && npx tsc --noEmit` must pass before PR
