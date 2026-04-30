# Tasks: Gallery & My Playbook (Phase 2f)

**Input**: `specs/009-gallery-playbook/plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`, `contracts/api-contracts.md`
**Branch**: `009-gallery-playbook`
**Date**: 2026-04-26

**Tests**: Included — SC-007 requires all P1 acceptance scenarios to be covered by unit or E2E tests. Unit tests for `MiniPitchSVG` and `EndorsementBadge`; E2E tests for My Playbook search/filter and gallery badge+progression+template scenarios.

**Organization**: Tasks are grouped by user story. US1–US3 are P1 and can be independently implemented after the Foundational phase. US4–US5 are P2 and depend only on Foundational. PublicAnimationCard.tsx is touched by US2, US3, and US4 — implement in that order to avoid re-opening the same file.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US5)
- Exact file paths in every task description

## Path Conventions

```
Gallery components:  src/features/gallery/components/
Gallery exports:     src/features/gallery/index.ts
Gallery page logic:  src/app/gallery/GalleryClient.tsx
My Playbook page:    src/app/my-gallery/page.tsx
API gallery:         src/app/api/gallery/route.ts
API gallery prog:    src/app/api/gallery/[id]/progressions/route.ts
API animations:      src/app/api/animations/route.ts
Schemas:             src/lib/schemas/animations.ts
DB types:            src/lib/supabase/database.types.ts
Migrations:          supabase/migrations/
Unit tests:          tests/unit/components/
E2E tests:           tests/e2e/

Pre-push:  npm run lint && npx tsc --noEmit
Unit:      npm test -- --run
E2E:       npm run e2e  (requires: npm run dev in separate terminal)
```

---

## Phase 1: Setup

**Purpose**: Confirm baseline is clean before any changes land.

- [ ] T001 Verify `npm run lint && npx tsc --noEmit` passes on branch `009-gallery-playbook` with zero errors before writing any code

---

## Phase 2: Foundational (P0 — Blocking Prerequisites)

**Purpose**: Database schema and all API contracts must be in place before any component work begins.

**⚠️ CRITICAL**: No user story implementation can begin until T002–T003 are complete. T004–T008 can proceed in parallel once types are regenerated.

- [ ] T002 Write migration file `supabase/migrations/20260226000000_add_endorsed_by_and_preview_entities.sql` with the exact SQL from `specs/009-gallery-playbook/data-model.md`:
  ```sql
  ALTER TABLE saved_animations
    ADD COLUMN endorsed_by TEXT DEFAULT NULL,
    ADD COLUMN preview_entities JSONB DEFAULT NULL;
  -- Backfill: extract first-frame player entities (players only, LIMIT 15)
  UPDATE saved_animations
  SET preview_entities = (
    SELECT jsonb_agg(
      jsonb_build_object('x', elem->>'x', 'y', elem->>'y', 'team', elem->>'team')
    )
    FROM (
      SELECT value AS elem
      FROM jsonb_each((payload->'frames'->0->'entities'))
      WHERE value->>'type' = 'player'
      LIMIT 15
    ) subq
  )
  WHERE preview_entities IS NULL
    AND payload IS NOT NULL
    AND jsonb_array_length(payload->'frames') > 0;
  ```
- [ ] T003 Apply migration and regenerate TypeScript types (depends on T002):
  - Apply: `npx supabase db push` (or `supabase db reset` in local dev)
  - Regenerate: `npx supabase gen types typescript --local > src/lib/supabase/database.types.ts`
  - Verify `database.types.ts` now contains `endorsed_by: string | null` and `preview_entities: Json | null` on the `saved_animations` Row type
- [ ] T004 [P] Update `src/lib/schemas/animations.ts` — three additions (depends on T003):
- [x] T002: Migration: Create `20260226000000_add_endorsed_by_and_preview_entities.sql`
- [x] T003: Migration: Apply migration and regenerate types (`npx supabase db push` + `gen types`)
- [x] T004: Schemas: Update `src/lib/schemas/animations.ts` (PreviewEntitySchema, Query params)
- [x] T005: API: Update `src/app/api/gallery/route.ts` (Fetch endorsed_by, preview_entities)
- [x] T006: API: Update `src/app/api/animations/route.ts` (GET param forwarding)
- [x] T007: API: Update `src/app/api/animations/route.ts` (POST first-frame extraction)
- [x] T008: API: Create `src/app/api/gallery/[id]/progressions/route.ts`
- [x] T009: Documentation: Create `specs/009-gallery-playbook/quickstart.md`

**Checkpoint**: Database schema updated, TypeScript types regenerated, all API contracts in place. User story implementation can now begin.

---

## Phase 3: User Story 1 — My Playbook Search & Filter (Priority: P1) 🎯 MVP

**Goal**: My Playbook has a search input and type filter driven by URL state (`?q=`, `?type=`). Client-side filtering narrows the loaded collection. Empty state echoes the query. Existing sort/order migrate from useState to URL params.

- [x] T010: Page: Update `src/app/my-gallery/page.tsx` (URL-driven state via `useSearchParams`)
- [x] T011: UI: Add Search and Type filter controls to Playbook header
- [x] T012: Logic: Implement client-side filtering for search/type matches
- [x] T013: E2E: Create `tests/e2e/my-gallery.spec.ts` (Search/Filter coverage)
- [ ] T014: Verification: Manual Pass — Verify `?q=lineout` preserves across refresh

**Checkpoint**: My Playbook search and type filter live. Independently verifiable — move to US2 only after this checkpoint passes.

---

## Phase 4: User Story 2 — Gallery Visual Previews (Priority: P1)

**Goal**: Every gallery card shows a mini-pitch SVG derived from first-frame entity data. No blank grey fallback. Attacker dots are amber (`var(--color-accent-warm)`), defender dots are muted (`var(--color-text-primary)` at 40% opacity). Empty-entity animations show pitch outline only.

- [x] T015: Unit: Create `tests/unit/components/MiniPitchSVG.test.tsx` (RED)
- [x] T016: Component: Create `src/features/gallery/components/MiniPitchSVG.tsx` (GREEN)
- [x] T017: Types: Update `PublicAnimation` interface in `GalleryClient.tsx`
- [x] T018: UI: Integrate `MiniPitchSVG` into `PublicAnimationCard.tsx` (frame fallback)
- [ ] T019: Verification: Manual Pass — Create animation, verify MiniPitch appears in gallery

**Checkpoint**: Gallery visual previews live. Every card has a mini-pitch SVG. Move to US3 only after this checkpoint passes.

---

## Phase 5: User Story 3 — Hampshire RFU Endorsement Badge (Priority: P1)

**Goal**: Animations with a non-null `endorsed_by` value show a solid pitch-green stamp badge in the top-right of the card preview area. Text is the endorser name uppercased with underscores replaced by spaces. No badge on un-endorsed cards.

- [x] T020: Unit: Create `tests/unit/components/EndorsementBadge.test.tsx` (RED)
- [x] T021: Component: Create `src/features/gallery/components/EndorsementBadge.tsx` (GREEN)
- [x] T022: UI: Integrate `EndorsementBadge` into `PublicAnimationCard.tsx`
- [x] T023: E2E: Add Badge coverage to `tests/e2e/gallery.spec.ts`
- [ ] T024: Verification: Manual Pass — Manually flag row as endorsed, verify badge appears

**Checkpoint**: Endorsement badge live on all endorsed cards. Move to US4 only after this checkpoint passes.

---

## Phase 6: User Story 4 — Progression Strip (Priority: P2)

**Goal**: Gallery cards for parent animations with progressions show an always-visible compact horizontal strip beneath the card body. Each strip item shows a `MiniPitchSVG` at reduced scale with a numbered stamp. Touch-swipeable with CSS snap. Keyboard-navigable.

- [x] T025: Component: Create `src/features/gallery/components/ProgressionStrip.tsx`
- [x] T026: UI: Integrate `ProgressionStrip` into `PublicAnimationCard.tsx`
- [x] T032: Module: Export new components from `src/features/gallery/index.ts`
- [x] T033: Verification: Manual US2 — Verify entity extraction on new animation save
- [x] T034: Verification: Manual US3 — Verify endorsement badge contrast/spacing
- [x] T035: Verification: Manual US4 — Verify Progression Strip touch/swipe scroll
- [x] T036: Verification: Final E2E Pass (`npm run e2e`)

**Checkpoint**: Progression strip live and always-visible. US4 independently verifiable.

---

## Phase 7: User Story 5 — Template Filter Verification & URL State (Priority: P2)

**Goal**: Template filter in the public gallery is verified end-to-end and converted to URL-driven state (`?templates=true`) for consistency with all other gallery controls.

- [x] T029: UI: Update `GalleryClient.tsx` to drive `templatesOnly` from URL
- [x] T030: E2E: Add Template URL coverage to `tests/e2e/gallery.spec.ts`
- [ ] T031: Verification: Manual Pass — Verify `?templates=true` filters on load

**Checkpoint**: Template filter URL-driven and verified end-to-end. US5 independently verifiable.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Export index, regression checks, final quality gate.

- [ ] T032 [P] Update `src/features/gallery/index.ts` public exports — add `MiniPitchSVG`, `EndorsementBadge`, `ProgressionStrip` if they need to be exported from the feature boundary
- [ ] T033 Full manual test against `specs/009-gallery-playbook/quickstart.md` — all 7 scenarios (T1–T7) and edge case table checked
- [ ] T034 [P] Regression checks — these routes MUST be unaffected:
  - `/app` (editor): opens normally, canvas functions
  - `/replay/[id]`: loads and plays an animation
  - `/share/[id]`: full-screen share viewer loads on mobile (375px); `position:fixed` layout intact
  - Note: no Canvas/ components were touched — this is a safety net only
- [ ] T035 Run `npm test -- --run` — all unit tests pass (including new T015 and T020 tests)
- [ ] T036 Run `npm run e2e` (dev server running on port 3000) — all E2E tests pass including new `tests/e2e/my-gallery.spec.ts` and updated `tests/e2e/gallery.spec.ts`
- [ ] T037 Final `npm run lint && npx tsc --noEmit` — zero new errors; ready for PR

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — **BLOCKS all user stories**
  - T002 → T003 (sequential — apply migration before type regen)
  - T004, T005, T006, T007, T008 all depend on T003 but are mutually parallel
  - T009 validates the whole foundation
- **Phase 3 (US1 — My Playbook)**: Depends on Foundational (T004, T006 specifically)
- **Phase 4 (US2 — Visual Previews)**: Depends on Foundational (T003, T005)
- **Phase 5 (US3 — Badge)**: Depends on Phase 4 (PublicAnimationCard already has endorsed_by in interface)
- **Phase 6 (US4 — Strip)**: Depends on Phase 4 (MiniPitchSVG available to reuse in strip items)
- **Phase 7 (US5 — Template Filter)**: Depends only on Foundational — can run alongside US1–US4
- **Phase 8 (Polish)**: Depends on all desired user stories being complete

### Within Each User Story

- Unit tests (T015, T020) MUST be written and FAIL before their respective components are implemented
- `PublicAnimationCard.tsx` changes are sequential: US2 (MiniPitchSVG) → US3 (badge) → US4 (strip)
- Interface updates in `GalleryClient.tsx` before component integration in `PublicAnimationCard.tsx`
- Each story verified complete before moving to the next

### Parallel Opportunities

- T004, T005, T006, T007, T008 — all different files, all depend only on T003 — launch simultaneously
- T013 (my-gallery E2E) — different file from T010–T012 — can write tests while implementing
- T015 (MiniPitchSVG unit tests) and T020 (EndorsementBadge unit tests) — parallel to each other and to T016/T021 (component creation)
- T029 (US5 GalleryClient) — separate file from PublicAnimationCard — can run in parallel with US2–US4 once foundational is complete
- T032, T034 (export update, regression) — parallel in Polish phase

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (**CRITICAL**)
3. Complete Phase 3: User Story 1 (My Playbook search + filter)
4. **STOP and VALIDATE**: test My Playbook search/filter independently
5. Ship/demo if ready — this alone closes MYPLAYBOOK-001

### Incremental Delivery

1. Phase 1 + Phase 2 → foundation + API contracts in place
2. Phase 3 (US1) → My Playbook search live → deploy (MVP)
3. Phase 4 (US2) → gallery visual previews live → deploy
4. Phase 5 (US3) → endorsement badges live → deploy
5. Phase 6 (US4) → progression strips live → deploy
6. Phase 7 (US5) → template filter verified + URL-driven → deploy
7. Phase 8 → full verification + PR

---

## Notes

- **[P]** tasks = different files, no dependencies — run in parallel
- **PublicAnimationCard.tsx** is touched in US2, US3, US4 — open once per phase to avoid conflicts
- **MiniPitchSVG** uses CSS vars directly (`var(--color-accent-warm)`, `var(--color-text-primary)`) — NOT `EntityColors` — intentional exception per `research.md` Decision 6
- **Never** hardcode `#D97706` or `#111827` — always use the CSS var reference
- **Supabase joins**: always flatten before use (`Array.isArray(raw) ? raw[0] : raw`)
- **ShareViewer**: `position:fixed inset:0` — never `h-screen` or `h-full` — do not modify
- **Pre-push gate**: `npm run lint && npx tsc --noEmit` must pass with zero new errors before PR
- **Type regen**: after migration, always run `npx supabase gen types typescript --local > src/lib/supabase/database.types.ts`
