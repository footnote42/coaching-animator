# Data Model: Gallery & My Playbook

**Feature**: `009-gallery-playbook`  
**Date**: 2026-04-26

---

## Database Changes

### New Columns on `saved_animations`

```sql
-- Migration: add_endorsed_by_and_preview_entities
ALTER TABLE saved_animations
  ADD COLUMN endorsed_by TEXT DEFAULT NULL,
  ADD COLUMN preview_entities JSONB DEFAULT NULL;
```

**`endorsed_by`**
- Type: `TEXT`, nullable, no default
- Constraint: none (any string value is valid; display normalises underscores → spaces)
- Populated by: admin action (manual DB update or future admin UI)
- RLS: readable by all (`visibility = 'public'`), writeable only by admin role (existing RLS policy)
- Index: none required in Phase 2f (single-column query not needed; display-only)

**`preview_entities`**
- Type: `JSONB`, nullable, no default
- Shape: `Array<{ x: number; y: number; team: "attack" | "defense" | "neutral" }>`
- Constraints: max 15 elements (enforced in application layer, not DB)
- Populated by: `/api/animations` POST handler on save; migration backfill for existing rows
- Backfill query (included in migration):
  ```sql
  UPDATE saved_animations
  SET preview_entities = (
    SELECT jsonb_agg(
      jsonb_build_object(
        'x', elem->>'x',
        'y', elem->>'y',
        'team', elem->>'team'
      )
    )
    FROM (
      SELECT value AS elem
      FROM jsonb_each(
        (payload->'frames'->0->'entities')
      )
      WHERE value->>'type' = 'player'
      LIMIT 15
    ) subq
  )
  WHERE preview_entities IS NULL
    AND payload IS NOT NULL
    AND jsonb_array_length(payload->'frames') > 0;
  ```
  Note: `payload->'frames'->0->'entities'` uses JSONB path. `jsonb_each` iterates entity record values. The `LIMIT 15` caps extraction per the spec edge case.

---

## TypeScript Types

After migration, regenerate:
```bash
npx supabase gen types typescript --local > src/lib/supabase/database.types.ts
```

New fields appear in `Database["public"]["Tables"]["saved_animations"]["Row"]`:
```typescript
endorsed_by: string | null
preview_entities: Array<{ x: number; y: number; team: 'attack' | 'defense' | 'neutral' }> | null
```

---

## Entities (Application Layer)

### `PublicAnimation` (GalleryClient interface, updated)

Add two new optional fields to the existing interface:

```typescript
interface PublicAnimation {
  // ... existing fields unchanged ...
  endorsed_by?: string | null          // new: endorsement source
  preview_entities?: PreviewEntity[] | null  // new: first-frame positions
}
```

### `PreviewEntity` (new type)

```typescript
interface PreviewEntity {
  x: number
  y: number
  team: 'attack' | 'defense' | 'neutral'
}
```

### `ProgressionPreview` (new type for progression strip)

Returned by `GET /api/gallery/[id]/progressions`:

```typescript
interface ProgressionPreview {
  id: string
  title: string
  progression_order: number
  preview_entities: PreviewEntity[] | null
}
```

### `AnimationSummary` (My Playbook — unchanged)

No new fields needed for My Playbook. The existing `AnimationSummary` type from `AnimationCard` is sufficient — My Playbook search/filter is client-side over the existing loaded list.

---

## Zod Schema Changes

### `GalleryQuerySchema` (no changes — `q`, `type`, `tags` already exist server-side)

### `MyAnimationsQuerySchema` (add search/filter params)

```typescript
export const MyAnimationsQuerySchema = PaginationSchema.extend({
  sort: z.enum(['title', 'created_at', 'duration_ms', 'animation_type']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
  q: z.string().optional(),     // new: accepted but ignored server-side today
  type: AnimationTypeSchema.optional(),  // new: accepted but ignored server-side today
});
```

---

## Entity Relationships

```
saved_animations (parent)
├── endorsed_by: text nullable           ← new col, display-only
├── preview_entities: jsonb nullable     ← new col, first-frame players
├── progression_count: int               ← existing denormalized counter
└── children (saved_animations)
    ├── parent_animation_id: uuid FK
    ├── is_progression: bool = true
    ├── progression_order: int (1–5)
    └── preview_entities: jsonb nullable ← same new col, used in strip
```

---

## State Model (My Playbook)

URL state replaces component state:

| URL Param | Old State | New State | Server-side? |
|-----------|-----------|-----------|--------------|
| `?q=` | none (new) | `useSearchParams('q')` | No — client filter only |
| `?type=` | none (new) | `useSearchParams('type')` | No — client filter only |
| `?sort=` | `useState('created_at')` | `useSearchParams('sort')` | Yes (existing) |
| `?order=` | `useState('desc')` | `useSearchParams('order')` | Yes (existing) |

Client-side filter logic:
```
filteredAnimations = animations
  .filter(a => q ? (a.title.includes(q) || a.description?.includes(q)) : true)
  .filter(a => type ? a.animation_type === type : true)
```

Case-insensitive matching applied at filter time (`.toLowerCase()` on both sides).
