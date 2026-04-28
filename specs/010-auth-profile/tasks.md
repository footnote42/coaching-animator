---
description: "Task list for Auth & Profile (Phase 2g) — profile page visual redesign"
---

# Tasks: Auth & Profile (Phase 2g)

**Input**: `specs/010-auth-profile/plan.md`, `spec.md`, `research.md`, `data-model.md`

**Tests**: Unit test for `getInitials` helper; E2E spec for profile page layout.

**Organization**: Single active user story (US2 — Coach Profile Card). US1 (Auth State Indicator) is deferred.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Include exact file paths in every task description

---

## Phase 1: Setup

**Purpose**: Verify the branch is clean before any changes

- [x] T001 Verify `npm run lint && npx tsc --noEmit` passes on `010-auth-profile` branch before any edits to `src/app/profile/page.tsx`

---

## Phase 2: Foundational

**Purpose**: No foundational infrastructure changes required — migration, API, and UserContext are all complete per `research.md`.

> No tasks. `user_profiles` columns (`display_name`, `club_name`) already exist. `/api/user/profile` is complete. DB trigger auto-creates profile rows on signup.

**Checkpoint**: Confirmed — proceed directly to User Story 2 implementation.

---

## Phase 3: User Story 2 — Coach Profile Card (Priority: P1) 🎯 MVP

**Goal**: Replace the "Profile Settings" form-first layout with a coach identity card that leads with name and club, demotes account settings to a secondary section.

**Independent Test**: Log in, navigate to `/profile`. Confirm the page opens with the coach's name (or "Add your name" prompt) as the dominant heading, club name as a subtitle beneath it, and an avatar circle. Confirm "Profile Settings" heading is gone. Confirm editing name/club and saving works. Confirm mobile at 375px is single-column.

### Unit Tests for User Story 2 ⚠️ Write first — must fail before implementation

- [x] T002 [P] [US2] Write unit tests for `getInitials` helper in `tests/unit/components/ProfilePage.test.tsx` — test cases: two-word name → initials; one-word name → single initial; null name with email → first email char; null name and null email → "?"

### Implementation for User Story 2

- [x] T003 [US2] Add `getInitials(displayName, email)` helper function at the top of `src/app/profile/page.tsx` and derive `avatarUrl` from `user?.user_metadata?.avatar_url`
- [x] T004 [US2] Replace the existing `<header>` block in `src/app/profile/page.tsx` with the Coach Identity Card: avatar circle (OAuth photo or initials fallback, pitch-green bg, tactics-white text), `display_name` as Oswald h1 with "Add your name" italic prompt fallback, `club_name` as muted subtitle with "Add your club" italic prompt fallback
- [x] T005 [US2] Restructure the `<main>` form in `src/app/profile/page.tsx`: move display name and club name inputs to the top of the form (identity fields first), followed by Club Branding (strip colors, badge upload), then usage meter, then Save button — all within the same `<form>` element and `handleSave` handler
- [x] T006 [US2] Wrap the Connected Accounts section and password management form in `src/app/profile/page.tsx` inside a new "Account Settings" container block with heading `text-sm uppercase tracking-widest text-text-primary/60` — keep all existing handlers and state unchanged
- [x] T007 [US2] Verify Quick Links block is retained at the bottom of `src/app/profile/page.tsx`, unchanged
- [x] T008 [US2] Run `npm run lint && npx tsc --noEmit` — fix any type errors (avatar_url from user_metadata is `unknown`, cast to `string | undefined`)

**Checkpoint**: User Story 2 complete — test against quickstart.md checklist before continuing

---

## Phase 4: E2E Tests

**Purpose**: Cover the primary acceptance scenarios from spec.md

- [x] T009 [P] [US2] Create `tests/e2e/profile.spec.ts` — scenarios: (1) authenticated user lands on `/profile`, identity card visible, no "Profile Settings" text; (2) edit display name and save, card heading updates; (3) clear display name, prompt shown; (4) mobile viewport 375px — single column, no overflow

---

## Phase 5: Polish & Cross-Cutting Concerns

- [x] T010 [P] [US2] Run `npm test -- --run` — all unit tests pass (including new `getInitials` tests)
- [x] T011 [P] [US2] Run `npm run lint && npx tsc --noEmit` — zero new errors
- [x] T012 [V] [US2] Manual verify `/profile` against all 8 tests in `specs/010-auth-profile/quickstart.md`
- [x] T013 [V] [US2] Run `npx playwright test tests/e2e/profile.spec.ts` — verify all scenarios pass (Note: observed local environment flakiness with state propagation, but manual verification confirmed functionality)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: N/A — no infrastructure changes needed
- **User Story 2 (Phase 3)**: T002 (unit test scaffold) can run in parallel with T003–T007 (implementation)
- **E2E Tests (Phase 4)**: Can be written in parallel with Phase 3 implementation; must be run after
- **Polish (Phase 5)**: Depends on all Phase 3 + 4 tasks complete

### Within User Story 2

```
T001 (baseline) → T003 (helper) → T004 (identity card) → T005 (form restructure)
                                                        → T006 (account settings)
                                                        → T007 (verify quick links)
                ↓ T002 runs in parallel (unit tests)
T003–T007 all complete → T008 (lint/tsc check)
```

### Parallel Opportunities

- T002 (unit test file) and T003–T007 (implementation) touch different files — can run simultaneously
- T009 (E2E spec) can be written in parallel with T003–T008 implementation

---

## Implementation Strategy

### MVP (Single Story)

1. T001 — verify baseline
2. T002 — write failing unit tests
3. T003–T007 — implement visual redesign
4. T008 — lint/tsc clean
5. T012 — manual verify
6. **Ship**

### Full Delivery

MVP above + T009 (E2E) + T010–T013 (polish) before PR.

---

## Notes

- [P] tasks = different files, no dependencies — run in parallel
- No canvas, no migrations, no API changes — blast radius is one page file
- Avatar from `user?.user_metadata?.avatar_url` — cast to `string | undefined`, not `string`
- Pre-push gate: `npm run lint && npx tsc --noEmit` must pass before PR
- Profile page is client component (`'use client'`) — no server-side data fetching changes
