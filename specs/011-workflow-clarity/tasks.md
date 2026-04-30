# Tasks: Workflow Clarity (Phase 2h)

**Input**: `specs/011-workflow-clarity/plan.md`, `spec.md`, `research.md`, `quickstart.md`

**Tests**: Not explicitly requested in spec. Test tasks omitted; manual test scenarios in `quickstart.md`.

**Note**: Phase 0 research confirmed that spec 006 (2026-04-26) shipped 10 of 12 FRs. Only 2 targeted one-line changes remain: FR-005 (ShareViewer back link) and FR-008 (My-Gallery Play destination). US1 (EDITOR-002) and US4 (GALLERY-002 desktop) are fully resolved — no implementation tasks.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story from spec.md

## Path Conventions

```
Source:   src/features/animation/components/ShareViewer.tsx
          src/app/my-gallery/page.tsx

Pre-push: npm run lint && npx tsc --noEmit
Unit:     npm test -- --run
Manual:   specs/011-workflow-clarity/quickstart.md
```

---

## Phase 1: Setup

**Purpose**: Confirm the branch is clean before making changes.

- [X] T001 Verify `npm run lint && npx tsc --noEmit && npm test -- --run` passes on `011-workflow-clarity` with no new errors

---

## Phase 2: User Story 2 — Share View Back Link (Priority: P1)

**Goal**: Player opens `/share/{id}` and can navigate back to `/gallery` via a clearly labelled link.

**Resolves**: FR-005 (back-to-gallery link destination)

**Independent Test**: Open any `/share/{id}` URL. Verify a "← Gallery" link is visible at the bottom-left and clicking it navigates to `/gallery`. Verify on 320px viewport the arrow icon remains visible.

**Already done** (no tasks): FR-004 (animation name in header overlay — shipped in spec 006), FR-006 (overlay layout safety — existing absolute positioning unchanged).

### Implementation for User Story 2

- [X] T002 [US2] In `src/features/animation/components/ShareViewer.tsx` ~line 346: change `href="/"` to `href="/gallery"` and update the visible label from `"Coaching Animator"` to `"← Gallery"` (keep `hidden sm:inline` on the `<span>`)

**Checkpoint**: `/share/{id}` shows "← Gallery" link → clicking navigates to `/gallery`. Canvas layout unchanged.

---

## Phase 3: User Story 3 — My-Gallery Play Navigation (Priority: P1)

**Goal**: Clicking the Play (thumbnail) overlay on a My-Gallery animation card navigates to `/share/{id}` rather than the editor.

**Resolves**: FR-008 (My-Gallery Play button destination)

**Independent Test**: Sign in, navigate to `/my-gallery`, click any animation card thumbnail. Verify browser navigates to `/share/{id}`. Verify the Edit (Pencil) button in the card footer still opens `/app?load={id}`.

**Already done** (no tasks): Public gallery (`/gallery`) card click already uses `router.push('/share/${id}')` in `GalleryClient.tsx` — FR-007 resolved. Edit button on AnimationCard is separate — no access regression.

### Implementation for User Story 3

- [X] T003 [US3] In `src/app/my-gallery/page.tsx` ~line 167: change `handlePlay` from `router.push('/app?load=${id}')` to `router.push('/share/${id}')`

**Checkpoint**: My-Gallery card Play → `/share/{id}`. Edit button → `/app?load={id}` (unchanged). Public gallery card click → `/share/{id}` (regression check).

---

## Phase 4: Polish & Verification

**Purpose**: Manual golden-path and regression checks, then pre-push gate.

- [X] T004 [P] Manual test — quickstart.md Test 1: open `/share/{id}` directly; verify "← Gallery" link visible at bottom-left; click → navigates to `/gallery`; resize to 320px → arrow icon still visible
- [X] T005 [P] Manual test — quickstart.md Test 2: sign in, `/my-gallery`, click thumbnail → `/share/{id}`; confirm Edit (Pencil) button still opens `/app?load={id}`
- [X] T006 [P] Manual regression — quickstart.md Test 3: `/gallery` card click → `/share/{id}` (must not have regressed)
- [X] T007 [P] Manual regression — quickstart.md Test 4: `/app` → save → Share button → modal/clipboard works; mobile → Web Share sheet opens
- [X] T008 Run `npm run lint && npx tsc --noEmit` — zero new errors
- [X] T009 Run `npm test -- --run` — all unit tests pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (US2)** and **Phase 3 (US3)**: Both depend on Phase 1; they touch different files → can be done in parallel (T002 and T003 are [P]-eligible)
- **Phase 4 (Polish)**: Depends on T002 and T003 both complete

### Parallel Opportunities

- T002 (`ShareViewer.tsx`) and T003 (`my-gallery/page.tsx`) touch different files → can be implemented simultaneously
- T004–T007 are all independent manual checks → verify in any order

---

## Implementation Strategy

### MVP (Minimum to close the core loop)

1. Complete Phase 1: verify gate
2. Complete T002 (ShareViewer back link) + T003 (My-Gallery Play) — can be done in the same pass
3. Run Phase 4 verification
4. Push PR against `main`

### Total Task Count

| Phase | Tasks | Notes |
|-------|-------|-------|
| Setup | 1 | T001 |
| US2 (ShareViewer back link) | 1 | T002 |
| US3 (My-Gallery Play) | 1 | T003 |
| Polish & Verification | 6 | T004–T009 |
| **Total** | **9** | 2 implementation, 4 manual, 2 CI |

---

## Notes

- Spec 006 already resolved: US1 (editor Share button), FR-001–004, FR-006–007, FR-009, FR-012
- P3 nice-to-haves deferred: FR-010 (gallery card Web Share API on mobile), FR-011 (sonner toast on gallery copy)
- ShareViewer constraint: `position:fixed; inset:0` on outer container — do NOT change to `h-screen` (CLAUDE.md)
- Entity colors not involved in this feature
- Pre-push gate: `npm run lint && npx tsc --noEmit` must pass before PR
