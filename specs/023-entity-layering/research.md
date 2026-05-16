# Research: Entity Layering Control (023)

**Branch**: `023-entity-layering` | **Date**: 2026-05-16

---

## Finding 1: Type-based ordering is already implemented

**Decision**: The `LAYER_ORDER` constant in `EntityLayer.tsx` already defines the type hierarchy (cone=0, tackle-bag/shield=1, player=2, ball=3) and sorts `interpolatedEntities` by it before rendering. No type-hierarchy fix is needed — this is already correct.

**Rationale**: Reading `EntityLayer.tsx` lines 145–153 confirms the sort exists and is applied.

**Gap**: The sort has no secondary key. Two entities of the same type with equal implicit z-order are sorted only by `Object.values()` insertion order, which is non-deterministic after mutations. This is the root cause of unpredictable same-type overlap.

---

## Finding 2: Entity data model — no `zIndexOffset` field exists

**Decision**: Add `zIndexOffset?: number` to the `Entity` interface in `src/core/types/index.ts`. Default (undefined / missing) treated as 0.

**Rationale**: The field is optional for full backward compatibility. All existing entities missing the field will render as z-offset 0 with no migration required (spec FR-008).

**Alternatives considered**:
- Separate project-level offset map (`project.entityLayerOffsets: Record<string, number>`): Avoids touching the per-frame entity model, but adds a new top-level field to `Project` and complicates serialization. Rejected — the entity-per-frame approach stays consistent with how all other entity properties (color, label, position) are already stored.

---

## Finding 3: `updateEntity` only updates the current frame

**Decision**: Add a new store action `updateEntityGlobalField(entityId: string, field: 'zIndexOffset', value: number)` (or `updateEntityLayerOffset`) that applies the update to **all frames** in the project.

**Rationale**: Layer offset is frame-global per spec assumption. The existing `updateEntity` action applies to `state.project.frames[state.currentFrameIndex]` only (lines 451–530 of `projectStore.ts`). Reusing it would make layer offsets frame-local, breaking US3. A targeted all-frames action is the minimal correct solution.

**Alternatives considered**:
- Looping `updateEntity` across all frame indexes: Rejected — it triggers multiple `set()` calls and multiple `isDirty` state changes; a single `set()` is cleaner and atomic.

---

## Finding 4: `EntityUpdate` interface needs extension

**Decision**: Add `zIndexOffset?: number` to the `EntityUpdate` interface. The `updateEntity` action already uses `Partial<EntityUpdate>` so the new field is automatically optional.

**Rationale**: The all-frames action can reuse the same interface extension without breaking any callers.

---

## Finding 5: Rank-swap is the cleanest Bring Forward / Send Backward strategy

**Decision**: Use rank-swap:
1. Sort all same-type entities in the current frame by `(zIndexOffset ?? 0)`, then by `id` (stable tiebreaker).
2. Find the current entity's rank R (0 = back, N−1 = front).
3. "Bring Forward": swap `zIndexOffset` values with rank R+1 entity; disabled if R = N−1.
4. "Send Backward": swap `zIndexOffset` values with rank R−1 entity; disabled if R = 0.
5. Apply both swapped offsets across all frames.

**Rationale**: Avoids unbounded integer growth. Offsets stay within the range 0..N−1 after normalisation. Single-step increments keep interaction reversible and predictable.

**Alternatives considered**:
- Simple +1/−1 increment: Easier to implement, but offsets can drift to large values and "Bring Forward" boundary detection requires comparing against max offset rather than rank. Rejected.
- Jump to front/back: Out of scope per spec assumption.

---

## Finding 6: Context menu disabled-state must be computed per-menu-open

**Decision**: Compute `canBringForward` and `canSendBackward` flags inside `useEditorContextMenuHandlers` when a context menu is opened (i.e., when `contextMenu` state is set). Pass flags to `EntityContextMenu` as props.

**Rationale**: The flags depend on how many entities of the same type exist in the current frame and the entity's current rank — this is derived state, not stored state.

---

## Finding 7: `EntityLayer.tsx` sort needs a stable tiebreaker

**Decision**: Change the sort to a 3-key comparison: `LAYER_ORDER[type]` → `(zIndexOffset ?? 0)` → `a.id.localeCompare(b.id)`.

**Rationale**: Entity IDs are stable UUIDs. Using them as tiebreaker guarantees identical sort order across all re-renders and across editor/replay/share views, satisfying SC-003 and FR-010.

---

## Finding 8: `hydrateSharePayload` handles `zIndexOffset` transparently

**Decision**: No changes needed to `hydratePayload.ts`. The function spreads entity properties from the JSON payload — unknown fields including `zIndexOffset` are preserved automatically.

**Rationale**: `currentEntities[e.id] = { id, type, team, color, label, x, y, parentId, orientation }` is an explicit construction that does NOT include `zIndexOffset`. This means `zIndexOffset` will be **lost** for share payloads unless we explicitly include it.

**Correction**: `hydrateSharePayload` MUST explicitly include `zIndexOffset` when constructing entities in `resolveEntityProps`. Missing it means share-view won't respect layer offsets.

---

## Finding 9: No DB schema changes required

**Decision**: The project data (including all frames and entities) is stored as a JSONB blob in Supabase. Adding `zIndexOffset` to the `Entity` TypeScript type is sufficient — the serialisation round-trip preserves all JSON fields.

**Rationale**: `database.types.ts` shows `preview_entities` as `Json | null` — the schema is schema-less at the entity level. No SQL migration required.

---

## Summary: Files to touch

| File | Change |
|------|--------|
| `src/core/types/index.ts` | Add `zIndexOffset?: number` to `Entity` and `EntityUpdate` |
| `src/core/stores/projectStore.ts` | Add `updateEntityLayerOffset(entityId, delta)` all-frames action |
| `src/core/utils/hydratePayload.ts` | Spread `zIndexOffset` when reconstructing entities |
| `src/features/animation/components/Canvas/EntityLayer.tsx` | Extend sort to include `zIndexOffset` + ID tiebreaker |
| `src/shared/ui/EntityContextMenu.tsx` | Add `onBringForward`, `onSendBackward`, `canBringForward`, `canSendBackward` props |
| `src/features/animation/components/hooks/useEditorContextMenuHandlers.ts` | Add bring-forward/send-backward handlers and disabled-state computation |
| `src/features/animation/components/Editor.tsx` | Wire new handlers + flags to `EntityContextMenu` |
