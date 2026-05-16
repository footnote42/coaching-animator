# Data Model: Entity Layering Control (023)

**Branch**: `023-entity-layering` | **Date**: 2026-05-16

---

## Entity (modified)

**File**: `src/core/types/index.ts`

### New field

```
zIndexOffset?: number
```

- **Type**: Optional integer (default: `undefined`, treated as `0` everywhere)
- **Range**: Any integer; in practice always within `0..(N−1)` where N = number of same-type entities
- **Semantics**: Higher value = rendered in front within the entity's type group. The absolute value is irrelevant; only relative ordering among same-type entities matters.
- **Backward compatibility**: Existing saved entities with no field present treat the field as `0`. No DB migration required.

### Field placement in `Entity` interface

Add after `orientation?`:

```typescript
/** Per-entity z-order offset within the entity's type group. Higher = in front. Default 0. */
zIndexOffset?: number;
```

---

## EntityUpdate (modified)

**File**: `src/core/types/index.ts`

### New field

```
zIndexOffset?: number
```

Add to the `EntityUpdate` interface so `updateEntity(id, { zIndexOffset: N })` is type-safe. The all-frames update action uses a separate method but this keeps the type surface consistent.

---

## ProjectStore (modified)

**File**: `src/core/stores/projectStore.ts`

### New action: `updateEntityLayerOffset`

```typescript
updateEntityLayerOffset: (entityId: string, zIndexOffset: number) => void
```

**Behaviour**: Updates `zIndexOffset` on the named entity in **every frame** of the project (not just the current frame). This is required because layer offset is frame-global per specification.

**Algorithm**:
1. Guard: no project → no-op
2. For each frame in `state.project.frames`:
   - If `frame.entities[entityId]` exists, set `zIndexOffset` to the new value
   - If entity not in frame (it can be added mid-animation), skip
3. Return new state with `isDirty: true`

**Rank-swap helper** (pure function, lives in the same file or a utility):

```typescript
function computeLayerSwap(
  entities: Entity[],    // all entities of same type in current frame
  entityId: string,
  direction: 'forward' | 'backward'
): { id: string; zIndexOffset: number }[] | null
```

Returns an array of `{ id, zIndexOffset }` pairs to apply (typically 2 entries — the swapped pair), or `null` if the move is not possible (entity already at boundary).

---

## Rendering Sort (modified)

**File**: `src/features/animation/components/Canvas/EntityLayer.tsx`

### Extended sort key

```typescript
const sorted = [...interpolatedEntities].sort((a, b) => {
  const tierDiff = (LAYER_ORDER[a.type] ?? 2) - (LAYER_ORDER[b.type] ?? 2);
  if (tierDiff !== 0) return tierDiff;
  const zDiff = (a.zIndexOffset ?? 0) - (b.zIndexOffset ?? 0);
  if (zDiff !== 0) return zDiff;
  return a.id.localeCompare(b.id); // stable tiebreaker
});
```

This sort is applied identically in editor, replay, and share views because all three use `EntityLayer`.

---

## EntityContextMenu (modified)

**File**: `src/shared/ui/EntityContextMenu.tsx`

### New props

```typescript
onBringForward?: () => void;
onSendBackward?: () => void;
canBringForward: boolean;   // false = action disabled
canSendBackward: boolean;   // false = action disabled
```

### Rendering

- New divider above the layering actions group
- "Bring Forward" button: disabled when `!canBringForward`
- "Send Backward" button: disabled when `!canSendBackward`
- Disabled buttons: `opacity-40 cursor-not-allowed` — no hover state

---

## No schema changes

No Supabase SQL migration required. The `zIndexOffset` field is stored within the JSONB project payload and survives serialisation/deserialisation transparently. The only code change for persistence is ensuring `hydrateSharePayload` preserves the field when reconstructing entities from share payloads.
