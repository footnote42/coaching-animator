---
description: "Task list for Spec 020: Direct Frame Editing"
---

# Tasks: Direct Frame Editing

**Input**: `specs/020-frame-edit-own-animations/plan.md` (required), `spec.md` (required), `research.md`

**Tests**: TDD requested. Every implementation task MUST follow a failing test task.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Branch is clean, any cross-cutting scaffolding in place

- [x] T001 Verify `npm run lint && npx tsc --noEmit` passes on current branch before any changes
- [x] T002 Verify `PUT /api/animations/[id]` route correctly handles `payload` and `is_major_version` in `src/app/api/animations/[id]/route.ts`

---

## Phase 2: User Story 1 - Opening Own Animation for Editing (Priority: P1) 🎯 MVP

**Goal**: As a coach, I see a "Open in Editor" button on my animation cards in My Playbook.

**Independent Test**: Visit `/my-gallery`, click "Open in Editor" on an own card, see Editor load with frames.

### Tests for User Story 1
- [x] T003 [P] [US1] **TDD (RED)**: Write failing unit test for `AnimationCard` rendering "Open in Editor" for owned animations in `tests/unit/components/AnimationCard.test.tsx`
- [x] T004 [P] [US1] **TDD (RED)**: Write failing E2E spec for opening editor from My Playbook in `tests/e2e/frame-editing.spec.ts`

### Implementation for User Story 1
- [x] T005 [P] [US1] **GREEN**: Modify `src/features/gallery/components/AnimationCard.tsx`:
    - Rename current metadata pencil to `Settings` icon ("Edit Info").
    - Add new `Pencil` icon for "Edit Frames" navigating to `/app?load=${animation.id}&mode=edit`.
- [x] T006 [P] [US1] **GREEN**: Modify `src/app/app/AnimationToolClient.tsx` to pass `isEditMode={mode === 'edit'}` to `Editor`.
- [x] T007 [US1] **VERIFY**: Ensure T003 and T004 pass.
- [x] T008 [US1] Commit: `feat(gallery): add "Open in Editor" action to AnimationCard`

---

## Phase 3: User Story 2 - Overwriting Original Animation (Priority: P1)

**Goal**: As a coach, after modifying frames, I can overwrite the existing record.

**Independent Test**: Load animation in edit mode, change a position, click Save -> Overwrite Original, reload and verify change.

### Tests for User Story 2
- [x] T009 [P] [US2] **TDD (RED)**: Write failing unit test for `SaveToCloudModal` update mode in `tests/unit/components/SaveToCloudModal.test.tsx` (mocking `PUT` failure/success).
- [x] T010 [P] [US2] **TDD (RED)**: Write failing E2E spec for overwriting original animation in `tests/e2e/frame-editing.spec.ts`.

### Implementation for User Story 2
- [x] T011 [P] [US2] **GREEN**: Modify `src/shared/components/SaveToCloudModal.tsx` to show "Overwrite Original" and warning alert when `isEditMode` is true.
- [x] T012 [P] [US2] **GREEN**: Implement `handleOverwrite` in `SaveToCloudModal.tsx` using `PUT /api/animations/${animationId}`.
- [x] T013 [US2] **VERIFY**: Ensure T009 and T010 pass.
- [x] T014 [US2] Commit: `feat(editor): implement overwrite logic in SaveToCloudModal`

---

## Phase 4: User Story 3 - Save as New & Quota Check (Priority: P2)

**Goal**: As a coach, I can choose to save a modified copy, respecting the 50-animation limit.

**Independent Test**: Load animation in edit mode, click Save -> Save as New Copy, verify new record exists.

### Implementation for User Story 3
- [x] T015 [US3] **VERIFY**: Confirm `POST /api/animations` path correctly triggers quota rejection if limit is reached (TDD: mock 50 limit).
- [x] T016 [US3] **GREEN**: Ensure `SaveToCloudModal` "Save as New Copy" button resets the target ID to `null` before POSTing.
- [x] T017 [US3] Commit: `feat(editor): ensure "Save as Copy" respects user quotas`

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates and final checks

- [x] T018 Run `npm test -- --run` — all unit tests pass
- [x] T019 Run `npm run e2e` — all E2E tests pass
- [x] T020 Run `npm run lint && npx tsc --noEmit` — no new errors
- [x] T021 Manual verification: verify shared canvas components (`Stage.tsx`, etc.) work correctly on all 3 routes after save.
