# Tasks: Entity Layering Control

**Input**: `specs/023-entity-layering/plan.md` · `spec.md` · `research.md` · `data-model.md`

**Tests**: Included per SC-006 ("All acceptance scenarios in US1–US3 covered by automated tests").

**Organization**: Grouped by plan phase → mapped to user story. Foundational phases (types + store) must complete before any user-story work.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)

---

## Phase 1: Setup

**Purpose**: Confirm clean baseline on branch `023-entity-layering`.

- [x] T001 Run `npm run lint && npx tsc --noEmit && npm test -- --run` on branch `023-entity-layering` — confirm all pass before any changes

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Type definitions and store infrastructure that every user-story phase depends on. Must be 100% complete before Phase 3.

**⚠️ CRITICAL**: No user-story implementation can begin until this phase is done.

- [x] T002 Add `zIndexOffset?: number` to `Entity` interface (after `orientation?`) and to `EntityUpdate` interface in `src/core/types/index.ts`
- [x] T003 [P] Add `updateEntityLayerOffset(entityId: string, zIndexOffset: number) => void` to the Zustand store interface and implement it in `src/core/stores/projectStore.ts` — updates `zIndexOffset` on the entity in **all frames**, sets `isDirty: true`
- [x] T004 [P] Add `export function computeLayerSwap(entities: Entity[], entityId: string, direction: 'forward' | 'backward'): Array<{ id: string; zIndexOffset: number }> | null` in `src/core/stores/projectStore.ts` — sorts same-type entities by `(zIndexOffset ?? 0)` ASC then `id` ASC, finds rank R, swaps with R+1 (forward) or R-1 (backward), returns null if at boundary

**Checkpoint**: `npm run lint && npx tsc --noEmit` must pass before continuing.

---

## Phase 3: User Story 1 — Automatic Type-Based Stacking (Priority: P1)

**Goal**: The canvas always renders cone/equipment → player → ball (bottom to top) regardless of insertion order. No user action required.

**Independent Test**: Open `/app`, add a cone + player + ball at the same position — ball on top, player in middle, cone at bottom. Save and reload — order unchanged.

- [x] T005 [US1] Extend the sort in `src/features/animation/components/Canvas/EntityLayer.tsx` from 1-key to 3-key: primary `LAYER_ORDER[type]`, secondary `(zIndexOffset ?? 0)`, tiebreaker `a.id.localeCompare(b.id)`
- [x] T006 [US1] Run `npm run lint && npx tsc --noEmit` — no errors

**Checkpoint**: Type-hierarchy stacking is visually correct in `/app`. Replay and share inherit the same sort automatically.

---

## Phase 4: User Story 2 — Bring Forward / Send Backward (Priority: P1)

**Goal**: Right-clicking any entity in the editor shows "Bring Forward" and "Send Backward" actions. Actions are disabled at boundaries. Actions affect intra-type z-order only — the type hierarchy is never overridden.

**Independent Test**: Open `/app`, add two overlapping attack players — right-click the back one → "Bring Forward" → it is now on top. Right-click the new top player → "Bring Forward" is disabled.

- [x] T007 [P] [US2] Extend `EntityContextMenuProps` in `src/shared/ui/EntityContextMenu.tsx` with `onBringForward?: () => void`, `onSendBackward?: () => void`, `canBringForward: boolean`, `canSendBackward: boolean`; add a `<hr>` divider, then "Bring Forward" and "Send Backward" buttons above the existing Duplicate group; disabled buttons use `opacity-40 cursor-not-allowed pointer-events-none` AND must not invoke `onBringForward`/`onSendBackward` (either via `pointer-events-none` on the element or an explicit `disabled` check in the onClick guard)
- [x] T008 [P] [US2] In `src/features/animation/components/hooks/useEditorContextMenuHandlers.ts`, add `handleContextMenuBringForward` and `handleContextMenuSendBackward` handlers (use `computeLayerSwap` then `updateEntityLayerOffset` per result pair), and derived flags `contextMenuCanBringForward` / `contextMenuCanSendBackward` (computed from rank of `contextMenu.entityId` within its type group in the current frame); export all four from the hook
- [x] T009 [US2] In `src/features/animation/components/Editor.tsx`, destructure the four new values from `useEditorContextMenuHandlers` and pass them to `<EntityContextMenu>` as `onBringForward`, `onSendBackward`, `canBringForward`, `canSendBackward`
- [x] T010 [US2] Run `npm run lint && npx tsc --noEmit` — no errors

**Checkpoint**: Context menu shows Bring Forward / Send Backward; actions work; boundary states disable correctly.

---

## Phase 5: User Story 3 — Layer Order Persists (Priority: P1)

**Goal**: Layer offsets survive save + reload (Tier 1) and appear identically in `/replay/[id]` and `/share/[id]`.

**Independent Test**: Set a layer offset in `/app`, save, reload — same order. Open `/replay/[id]` and `/share/[id]` — same order.

- [x] T011 [US3] In `src/core/utils/hydratePayload.ts`, extend the entity construction in `resolveEntityProps` to include `zIndexOffset: ('zIndexOffset' in e && typeof e.zIndexOffset === 'number') ? e.zIndexOffset : undefined` so share-payload roundtrips preserve the field
- [x] T012 [US3] Run `npm run lint && npx tsc --noEmit` — no errors

**Checkpoint**: Layer order survives cloud save/reload and is consistent across editor, replay, and share.

---

## Phase 6: User Story 4 — Guest Layer Control (Priority: P2)

**Goal**: Layering works for unauthenticated guests during the session; nothing persists after page refresh (consistent with all other guest state).

**Independent Test**: Open `/app` in incognito, add two overlapping players, use "Bring Forward" — layer change is immediate. Refresh — change is gone.

- [x] T013 [US4] No-op verification: the null-project guard in `updateEntityLayerOffset` (T003) follows the standard store pattern — confirm it is present by reading the T003 implementation; no separate test needed as T014's unit tests for `computeLayerSwap` will exercise the same null-safe code paths

**Checkpoint**: Guest layering works in-session; refresh clears it (no persistence for guests — consistent with all other guest editor state).

---

## Phase 7: Tests

**Purpose**: Automated validation of acceptance scenarios from spec.md (required by SC-006).

- [x] T014 [P] Write unit tests for `computeLayerSwap` in `tests/unit/stores/projectStore.layerOffset.test.ts` covering: bring-forward at top (returns null), send-backward at bottom (returns null), mid-rank swap returns correct offset pairs, single-entity input (both directions null), equal-offset tiebreaker resolved by ID, **mixed-type input (cone + player entities passed together) — assert only same-type peers are considered; the cone's rank must not be influenced by the presence of players**
- [x] T015 [P] Write unit tests for the 3-key EntityLayer sort in `tests/unit/components/EntityLayer.sort.test.ts` covering: cone always below player, player always below ball, equal-type same-offset stable by ID, equal-type different-offset respects offset value
- [x] T016 Write E2E tests in `tests/e2e/entity-layering.spec.ts` covering: US1 stacking order — use `page.evaluate(() => window.__konvaStage?.findOne('Layer').children.map(n => n.attrs.id))` (or the project's existing Konva stage accessor pattern) to assert render order rather than screenshot diffs; US2 Bring Forward reverses order + "Bring Forward" button is disabled (`pointer-events-none` / `aria-disabled`) after reaching the top; US3 layer offset persists after save + reload (Tier 1 path) AND is consistent across at least 2 frames during replay playback

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Shared canvas verification, final quality gates.

- [x] T017 [P] Manual verify `/app` (editor): type stacking, Bring Forward, Send Backward, disabled states, boundary behaviour — use quickstart.md Tests 1–4
- [x] T018 [P] Manual verify `/replay/[id]`: layer offsets match editor arrangement — quickstart Test 6
- [x] T019 [P] Manual verify `/share/[id]`: layer offsets survive share payload roundtrip — quickstart Test 6
- [x] T020 Run `npm test -- --run` — all 116+ unit tests pass (no regressions)
- [x] T021 Run `npm run lint && npx tsc --noEmit` — zero new errors or warnings

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
  └── Phase 2 (Foundational) ← BLOCKS all story phases
        ├── Phase 3 (US1) — T005–T006
        ├── Phase 4 (US2) — T007–T010 (also uses T004 from Foundational)
        ├── Phase 5 (US3) — T011–T012
        └── Phase 6 (US4) — T013 (verification only)
              └── Phase 7 (Tests) — T014–T016
                    └── Phase 8 (Polish) — T017–T021
```

### Within Foundational Phase

- T002 must complete first (types gate all downstream tasks)
- T003 and T004 can run in parallel after T002

### Within User Story Phases

- T007 and T008 are fully parallel (different files)
- T009 depends on T007 + T008 complete

### Parallel Opportunities

| Wave | Tasks |
|------|-------|
| Wave 1 (after T002) | T003, T004 |
| Wave 2 (after Foundational) | T005, T007, T008, T011 (all different files) |
| Wave 3 (after T007+T008) | T009 |
| Wave 4 (after implementation done) | T014, T015 |
| Wave 5 (after T014+T015+T016) | T017, T018, T019 |

---

## Implementation Strategy

### MVP (US1 + US2 only — delivers visible layering control)

1. Phase 1: Setup — T001
2. Phase 2: Foundational — T002 → (T003, T004 parallel)
3. Phase 3: US1 — T005, T006
4. Phase 4: US2 — (T007, T008 parallel) → T009, T010
5. **STOP and VALIDATE**: verify layering and context menu in `/app`
6. Ship if ready — US3 persistence and tests can follow

### Full Delivery

Continue Phase 5 (US3) → Phase 6 (US4) → Phase 7 (Tests) → Phase 8 (Polish)

---

## Notes

- `[P]` tasks have no file conflicts — launch simultaneously
- Type hierarchy (FR-001) is already implemented; Phase 3 only adds `zIndexOffset` and ID to the sort
- `computeLayerSwap` (T004) is a pure function — test it in isolation before wiring to the store
- Entity colors: always `EntityColors.resolve()` — never hardcoded hex (no color changes in this feature)
- `ShareViewer`: `position:fixed inset:0` — do not touch layout constraints
- Pre-push gate: `npm run lint && npx tsc --noEmit` must pass before PR
