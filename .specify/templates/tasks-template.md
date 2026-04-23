---
description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: `specs/[###-feature-name]/plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/`

**Tests**: Include test tasks only if explicitly requested in the spec. When included, tests MUST be written first and MUST fail before implementation begins (TDD).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in every task description

## Path Conventions

```
Source:   src/features/[feature]/components/[Component].tsx
          src/features/[feature]/services/[service].ts
          src/core/stores/[name]Store.ts
          src/core/hooks/use[Name].ts
          src/shared/components/[Component].tsx
          src/shared/ui/[primitive].tsx
          src/app/[route]/page.tsx
          src/app/api/[resource]/route.ts
          src/lib/schemas/[resource].ts

Tests:    tests/unit/components/[Component].test.tsx
          tests/unit/services/[service].test.ts
          tests/e2e/[feature].spec.ts

Pre-push: npm run lint && npx tsc --noEmit
Unit:     npm test -- --run
E2E:      npm run e2e  (requires dev server: npm run dev)
```

<!--
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.
  
  The /speckit.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (priorities P1, P2, P3…)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints/schemas from contracts/
  
  Tasks MUST be organized by user story so each story can be independently
  implemented, tested, and delivered as an MVP increment.
  
  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Branch is clean, any cross-cutting scaffolding in place

- [ ] T001 Verify `npm run lint && npx tsc --noEmit` passes on current branch before any changes
- [ ] T002 [P] Create Zod schema in `src/lib/schemas/[resource].ts` (if new API input shapes needed)
- [ ] T003 [P] Add/extend Supabase type in `src/core/types/` (if schema changes needed)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Database migration: add/alter table `[table_name]` with RLS policies
- [ ] T005 [P] API route scaffold: `src/app/api/[resource]/route.ts` with auth guard
- [ ] T006 [P] Zustand slice addition/extension in `src/core/stores/[name]Store.ts` (if new state needed)
- [ ] T007 Create/extend service layer in `src/features/[feature]/services/[service].ts`

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works — e.g., "Visit /app, do X, see Y"]

### Tests for User Story 1 *(OPTIONAL — only if tests requested)* ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [US1] Unit test for [Component] in `tests/unit/components/[Component].test.tsx`
- [ ] T011 [P] [US1] Unit test for [service] in `tests/unit/services/[service].test.ts`
- [ ] T012 [P] [US1] E2E spec for [user journey] in `tests/e2e/[feature].spec.ts`

### Implementation for User Story 1

- [ ] T013 [P] [US1] Create `src/features/[feature]/components/[Component].tsx`
- [ ] T014 [P] [US1] Create `src/features/[feature]/services/[service].ts`
- [ ] T015 [US1] Wire component to Zustand store in `src/core/stores/[name]Store.ts` (depends on T013, T014)
- [ ] T016 [US1] Add route entry point `src/app/[route]/page.tsx`
- [ ] T017 [US1] Verify `npm run lint && npx tsc --noEmit` passes

**Checkpoint**: User Story 1 fully functional — test independently before continuing

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works independently]

### Tests for User Story 2 *(OPTIONAL)* ⚠️

- [ ] T018 [P] [US2] Unit test in `tests/unit/[path]`
- [ ] T019 [P] [US2] E2E spec addition to `tests/e2e/[feature].spec.ts`

### Implementation for User Story 2

- [ ] T020 [P] [US2] Create/extend `src/features/[feature]/components/[Component].tsx`
- [ ] T021 [US2] Implement `src/features/[feature]/services/[service].ts`
- [ ] T022 [US2] Integrate with User Story 1 components if needed

**Checkpoint**: User Stories 1 AND 2 both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works independently]

### Tests for User Story 3 *(OPTIONAL)* ⚠️

- [ ] T023 [P] [US3] Unit/E2E tests

### Implementation for User Story 3

- [ ] T024 [P] [US3] Create/extend components and services
- [ ] T025 [US3] Integrate with prior stories if needed

**Checkpoint**: All user stories independently functional

---

[Add more user story phases as needed]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates, shared canvas verification, final checks

- [ ] TXXX [P] If canvas touched: manual verify `/app` route (editor)
- [ ] TXXX [P] If canvas touched: manual verify `/replay/[id]` route (replay viewer)
- [ ] TXXX [P] If canvas touched: manual verify `/share/[id]` route (share viewer — mobile, `position:fixed`)
- [ ] TXXX Run `npm test -- --run` — all unit tests pass
- [ ] TXXX Run `npm run e2e` — all E2E tests pass (dev server running)
- [ ] TXXX Run `npm run lint && npx tsc --noEmit` — no new errors
- [ ] TXXX Update `src/features/[feature]/index.ts` public exports if new components added
- [ ] TXXX Code cleanup and refactoring

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS all user stories**
- **User Stories (Phase 3+)**: All depend on Foundational; can proceed in priority order
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Services before components (components import services, not reverse)
- Store slice before component wiring
- Core implementation before route integration
- Story verified complete before moving to next priority

### Parallel Opportunities

- Tasks marked [P] have no file conflicts — launch simultaneously
- Different user stories can be worked in parallel once Foundational is done

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (**CRITICAL** — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: test User Story 1 independently
5. Ship/demo if ready

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. User Story 1 → test independently → deploy (MVP!)
3. User Story 2 → test independently → deploy
4. Each story adds value without breaking previous ones

---

## Notes

- [P] tasks = different files, no dependencies — run in parallel
- [Story] label maps tasks to user stories for traceability
- Entity colors: always `EntityColors.resolve()` — never hardcoded hex
- Supabase joins: always flatten (`Array.isArray(raw) ? raw[0] : raw`) before use
- ShareViewer: `position:fixed inset:0` — never `h-screen` or `h-full`
- Pre-push gate: `npm run lint && npx tsc --noEmit` must pass before PR
