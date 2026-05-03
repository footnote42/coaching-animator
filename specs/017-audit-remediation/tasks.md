# Tasks: 017 — Audit Remediation (Phase 3f)

**Input**: `specs/017-audit-remediation/spec.md`, `plan.md`, `research.md`

**Tests**: No new unit or E2E tests needed — this is a purely cosmetic pass. Verification is by grep (SC-001/002/004) and manual visual inspection (quickstart.md). The existing test suite must remain green.

**Organization**: Tasks are grouped by violation category (A/B/C/D), each matching a user story. All category groups are independent — they touch different files and can be worked in parallel.

---

## Phase 0: Baseline Gate

**Purpose**: Confirm a clean starting state before any changes.

- [ ] T001 Run `npm run lint && npx tsc --noEmit` — verify zero errors on `017-audit-remediation` branch before touching any files
- [ ] T002 Run `npm test -- --run` — verify all tests pass (note count for comparison at end)

**Checkpoint**: Both commands pass. Record test count. Implementation may begin.

---

## Phase 1: Category A — Border Radius (Priority: P1)

**Goal**: Every interactive editor surface uses `rounded-none`. No pill/capsule shapes in the editing workspace.

**Independent Test**: Open `/app` — ProgressionPanel pills, Focus Mode button, sidebar buttons, mobile drawer, and EditorFloatingRemote controls all have sharp corners.

### Implementation for User Story 1

- [ ] T003 [P] [US1] `src/features/animation/components/ProgressionPanel.tsx`:
  - Line 57: `rounded-full` on draggable pill button → `rounded-none`
  - Line 119: `rounded-full` on base "Base" pill button → `rounded-none`
  - Line 151: `rounded-full` on "Add" button → `rounded-none`

- [ ] T004 [P] [US1] `src/features/animation/components/Editor.tsx`:
  - Line 318: `rounded-full` on Focus Mode toggle button → `rounded-none`
  - Line 347: `rounded-md` on in-sidebar collapse button → `rounded-none`
  - Line 392: `rounded-r-lg` on sidebar expand handle tab → `rounded-none`
  - Line 418: `rounded-full` on mobile drawer trigger "Tools & Actions" FAB → `rounded-none`

- [ ] T005 [P] [US1] `src/features/animation/components/MobileDrawer.tsx`:
  - Line 54: `rounded-t-2xl` on drawer container → `rounded-none`
  - Line 63: Replace `<div className="w-12 h-1.5 bg-border/40 rounded-full mb-1" />` with `<div className="w-12 h-0.5 bg-border/40 mb-1" />` (flat rectangular indicator)
  - Line 70: `rounded-full` on close `X` button → `rounded-none`

- [ ] T006 [P] [US1] `src/features/animation/components/Canvas/EditorFloatingRemote.tsx`:
  - Line 279: `rounded-sm` on action button → `rounded-none`
  - Line 285: `rounded-sm` on speed mode toggle group container → `rounded-none`
  - Line 290: `rounded-sm` on individual speed option buttons (0.5×, 1×, 2×) → `rounded-none`
  - Line 301: `rounded-sm` on loop toggle → `rounded-none`
  - Line 311: `rounded-sm` on ghost toggle → `rounded-none`
  - Line 322: `rounded-sm` on expand/collapse chevron button → `rounded-none`

- [ ] T007 [US1] Run `npm run lint && npx tsc --noEmit` — must pass after T003–T006

**Checkpoint**: US1 complete. Grep for `rounded-[^n]` in the four modified files returns only the intentional exceptions (FloatingRemote pill, EndorsementBadge).

---

## Phase 2: Category B — White Surfaces (Priority: P1)

**Goal**: No `bg-white` on editor layout or structural surfaces.

**Independent Test**: Open `/app` — Focus Mode toggle, sidebar expand handle, canvas wrapper, annotation context menu all show cream surface; `InlineEditor` input shows cream. Open `/replay/[id]` — canvas wrapper is cream.

### Implementation for User Story 2

- [ ] T008 [P] [US2] `src/features/animation/components/Editor.tsx` (white surface fixes):
  - Line 318: `bg-white/90 backdrop-blur-sm` → `bg-surface` (drop blur — glassmorphism banned)
  - Line 330: `bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]` (snap-to-grid active) → `bg-tactics-white text-primary border-primary shadow-none`
  - Line 347: `bg-white/80 backdrop-blur-sm` → `bg-surface` (drop blur)
  - Line 392: `bg-white` → `bg-surface`
  - Line 440: `bg-white` (canvas wrapper div) → `bg-surface`
  - Line 568: `bg-white` (annotation context menu) → `bg-surface`

- [ ] T009 [P] [US2] `src/features/animation/components/Canvas/InlineEditor.tsx`:
  - Line 73: `bg-white` on the text input → `bg-surface`

- [ ] T010 [P] [US2] `src/features/animation/components/ReplayViewer.tsx`:
  - Line 179: `bg-white` on canvas wrapper div → `bg-surface`

- [ ] T011 [P] [US2] `src/features/animation/components/Sidebar/SportSelector.tsx`:
  - Line 33: `bg-white` on the `<select>` element → `bg-surface`

- [ ] T012 [US2] Run `npm run lint && npx tsc --noEmit` — must pass after T008–T011

**Checkpoint**: US2 complete. Grep for `bg-white` in the four modified files returns zero results (excluding `text-white`, `hover:bg-white/10`, etc. — those are intentional tints).

---

## Phase 3: Category C — Auth Page Headings (Priority: P1)

**Goal**: All four auth page `<h2>` headings render in the Oswald heading font.

**Independent Test**: Navigate to `/login`, `/register`, `/forgot-password`, `/reset-password` — each heading is visually in Oswald (compressed, bold letterforms).

### Implementation for User Story 3

- [ ] T013 [P] [US3] `src/app/(auth)/login/page.tsx`:
  - Line 68: Add `font-heading` to the `<h2>` className (alongside existing `text-xl font-semibold text-text-primary mb-6`)

- [ ] T014 [P] [US3] `src/app/(auth)/register/page.tsx`:
  - Find the primary `<h2>` heading element, add `font-heading` to its className

- [ ] T015 [P] [US3] `src/app/(auth)/forgot-password/page.tsx`:
  - Find the primary `<h2>` heading element, add `font-heading` to its className

- [ ] T016 [P] [US3] `src/app/(auth)/reset-password/page.tsx`:
  - Find the primary `<h2>` heading element, add `font-heading` to its className

- [ ] T017 [US3] Run `npm run lint && npx tsc --noEmit` — must pass after T013–T016

**Checkpoint**: US3 complete. All four auth pages show Oswald headings.

---

## Phase 4: Category D — Modal Scrim Colour (Priority: P2)

**Goal**: All modal backdrops use `bg-primary/60` (dark pitch-green) instead of `bg-black/50`.

**Independent Test**: Open Save to Cloud modal, Report modal, Delete confirm dialog — backdrop is dark-green-tinted, not neutral grey/black.

### Implementation for User Story 4

- [ ] T018 [P] [US4] `src/shared/components/SaveToCloudModal.tsx`:
  - Line 163: `bg-black/50` → `bg-primary/60`

- [ ] T019 [P] [US4] `src/shared/components/ReportModal.tsx`:
  - Line 67: `bg-black/50` → `bg-primary/60`

- [ ] T020 [P] [US4] `src/shared/components/EditMetadataModal.tsx`:
  - Line 75: `bg-black/50` → `bg-primary/60`

- [ ] T021 [P] [US4] `src/shared/components/DeleteConfirmDialog.tsx`:
  - Line 22: `bg-black/50` → `bg-primary/60`

- [ ] T022 [P] [US4] `src/features/gallery/components/VersionHistoryModal.tsx`:
  - Line 105: `bg-black/50` → `bg-primary/60`

- [ ] T023 [P] [US4] `src/app/collections/[id]/page.tsx`:
  - Line 471: `bg-black/50` → `bg-primary/60`

- [ ] T024 [P] [US4] `src/app/admin/page.tsx`:
  - Line 249: `bg-black/50` → `bg-primary/60`
  - Line 572: `bg-black/50` → `bg-primary/60`

- [ ] T025 [P] [US4] `src/features/animation/components/MobileDrawer.tsx`:
  - Line 43: `bg-black/40` → `bg-primary/50` (drawer backdrop — slightly lighter than modal scrim)

- [ ] T026 [US4] Run `npm run lint && npx tsc --noEmit` — must pass after T018–T025

**Checkpoint**: US4 complete. Grep for `bg-black/50` returns zero results site-wide.

---

## Phase 5: Intentional Exception Documentation

**Purpose**: Mark the two intentional `rounded-full` exceptions with inline comments so future audit passes do not re-flag them.

- [ ] T027 [P] `src/features/animation/components/Canvas/FloatingRemote.tsx`:
  - Find the `rounded-full` pill container class
  - Add JSX comment above: `{/* intentional: share-view playback pill — rounded-full is the brand shape for mobile replay */}`

- [ ] T028 [P] `src/features/gallery/components/EndorsementBadge.tsx`:
  - Find the `rounded-full` class on the badge element
  - Add JSX comment above: `{/* intentional: circular endorsement badge icon — functional shape */}`

---

## Phase 6: Polish & Verification

**Purpose**: Full quality gate + manual smoke tests per quickstart.md.

- [ ] T029 Run `npm test -- --run` — all tests pass (count should match baseline from T002)
- [ ] T030 Run `npm run lint && npx tsc --noEmit` — zero new errors
- [ ] T031 [P] Manual: open `/app` and verify all Category A + B items per quickstart.md (A1–A8, B1–B6)
- [ ] T032 [P] Manual: open `/login`, `/register`, `/forgot-password`, `/reset-password` and verify Oswald headings (quickstart.md C1–C4)
- [ ] T033 [P] Manual: open Save/Report/Delete modals and verify dark-green scrim (quickstart.md D1–D6)
- [ ] T034 [P] Manual: open `/share/[id]` and verify `FloatingRemote` pill RETAINS `rounded-full` (quickstart.md R1)
- [ ] T035 [P] Manual: verify `/replay/[id]` loads correctly, no layout regressions (quickstart.md R3)

**Checkpoint**: All 35 tasks complete. Phase 3f ship-ready.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 0 (Baseline)**: No dependencies — run immediately
- **Phases 1–4 (Categories A–D)**: All depend on Phase 0. All four categories are independent of each other — they touch different files and can be worked in parallel
- **Phase 5 (Exceptions)**: Can run in parallel with Phases 1–4 (different files)
- **Phase 6 (Verification)**: Depends on all implementation phases complete

### Parallel Opportunities

Tasks marked `[P]` within each phase all touch different files — they can be launched simultaneously. In particular:
- T003, T004, T005, T006 can all run in parallel (different files)
- T008, T009, T010, T011 can all run in parallel
- T013, T014, T015, T016 can all run in parallel
- T018 through T025 can all run in parallel

### Execution Strategy

**Fastest path** (all categories in parallel):
1. T001 + T002 (baseline gate)
2. T003–T006 (Category A), T008–T011 (Category B), T013–T016 (Category C), T018–T025 (Category D), T027–T028 (exceptions) — all in parallel
3. T007, T012, T017, T026 (category lint gates)
4. T029–T035 (verification)

---

## Notes

- `[P]` = different files, no dependencies — safe to run in parallel
- No new Supabase queries, no schema changes, no Zustand state changes
- No new components — existing components are edited in-place
- `EntityColors` service: not touched
- `ShareViewer`: not touched (position:fixed layout preserved)
- Pre-push gate: `npm run lint && npx tsc --noEmit` must pass before merge
