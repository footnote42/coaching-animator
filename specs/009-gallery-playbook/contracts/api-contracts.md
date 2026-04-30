# API Contracts: Gallery & My Playbook

**Feature**: `009-gallery-playbook`  
**Date**: 2026-04-26

---

## Modified Endpoints

### `GET /api/gallery`

**Changes**: Add `endorsed_by` and `preview_entities` to response per animation.

**Request** — unchanged:
```
GET /api/gallery?q=lineout&type=tactic&sort=created_at&order=desc&limit=20&offset=0
```

**Response** — updated `animations` item shape:
```typescript
{
  animations: Array<{
    id: string
    title: string
    description: string | null
    animation_type: 'tactic' | 'skill' | 'game' | 'other'
    tags: string[]
    duration_ms: number
    frame_count: number
    upvote_count: number
    created_at: string
    user_id: string
    progression_count: number
    remix_count: number
    remixed_from_id: string | null
    remixed_from_title: string | null
    thumbnail_url: string | null
    author: { display_name: string | null }
    user_has_upvoted: boolean
    endorsed_by: string | null          // NEW
    preview_entities: Array<{           // NEW
      x: number
      y: number
      team: 'attack' | 'defense' | 'neutral'
    }> | null
  }>
  total: number
  limit: number
  offset: number
}
```

---

### `GET /api/animations` (My Playbook)

**Changes**: Accept `q` and `type` query params (server ignores them today; establishes contract for future filtering).

**Request** — updated params accepted (but not applied server-side):
```
GET /api/animations?sort=created_at&order=desc&limit=24&offset=0&q=lineout&type=tactic
```

**Schema change** (`MyAnimationsQuerySchema`):
```typescript
// Add to existing schema:
q: z.string().optional()
type: AnimationTypeSchema.optional()
```

**Response** — unchanged shape (filtering happens client-side).

---

## New Endpoints

### `GET /api/gallery/[id]/progressions`

Returns child progression records for a public parent animation. Used by the progression strip on parent gallery cards.

**Request**:
```
GET /api/gallery/abc123/progressions
```

**Response**:
```typescript
{
  progressions: Array<{
    id: string
    title: string
    progression_order: number    // 1–5
    preview_entities: Array<{
      x: number
      y: number
      team: 'attack' | 'defense' | 'neutral'
    }> | null
  }>
}
```

**Auth**: Public (no auth required — matches gallery visibility model). Only returns progressions where parent `visibility = 'public'`.

**Error responses**:
- `404`: Parent animation not found or not public
- `500`: Database error

**Constraints**:
- Returns at most 5 results (progression_order 1–5)
- Ordered by `progression_order ASC`
- Skips progressions where `visibility != 'public'`

---

## Zod Schemas (Implementation Reference)

### `PreviewEntitySchema`
```typescript
const PreviewEntitySchema = z.object({
  x: z.number(),
  y: z.number(),
  team: z.enum(['attack', 'defense', 'neutral']),
})
```

### `ProgressionPreviewSchema` (new, in `/lib/schemas/animations.ts`)
```typescript
export const ProgressionPreviewSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  progression_order: z.number().int().min(1).max(5),
  preview_entities: z.array(PreviewEntitySchema).max(15).nullable(),
})

export type ProgressionPreview = z.infer<typeof ProgressionPreviewSchema>
```

---

## Component Contracts

### `MiniPitchSVG`
```typescript
interface MiniPitchSVGProps {
  entities: Array<{ x: number; y: number; team: 'attack' | 'defense' | 'neutral' }> | null
  className?: string
  // aspect ratio always 4:3; controlled by parent container
}
```
- Renders inline SVG — no canvas, no Konva
- Pitch outline: rectangle + halfway line, pitch-green stroke
- Attacker dots: `var(--color-accent-warm)` (#D97706), radius 3 (full-size) or 2 (strip)
- Defender dots: `var(--color-text-primary)` at 40% opacity, same radii
- Neutral/equipment dots: omitted
- Empty state (null or empty array): pitch outline only, no dots
- Max 15 dots rendered regardless of input length

### `EndorsementBadge`
```typescript
interface EndorsementBadgePropss {
  endorsedBy: string  // e.g. 'hampshire_rfu'
}
```
- Display text: `endorsedBy.replace(/_/g, ' ').toUpperCase()`
- Position: absolute, top-right of card preview area
- Style: solid `bg-primary` (#1A3D1A) rectangle, `text-text-inverse` (#F8F9FA) uppercase, no rounding, no shadow
- Font: Oswald or heading font, ~10px
- Contrast: 4.5:1 minimum (pitch-green on tactics-white is ~7:1 — passes)
- Accessibility: `aria-label="Endorsed by [display text]"` on the badge element

### `ProgressionStrip`
```typescript
interface ProgressionStripProps {
  parentId: string
  progressionCount: number  // used to skip fetch when 0
}
```
- Fetches `GET /api/gallery/[parentId]/progressions` on mount (if `progressionCount > 0`)
- Renders immediately below card body, always in DOM (no expand/collapse)
- Header: "PROGRESSIONS" in small uppercase (Tailwind `text-xs tracking-widest font-medium`)
- Each item: `MiniPitchSVG` at reduced scale + numbered stamp overlay
- Horizontal scroll: `overflow-x-auto scroll-snap-type-x-mandatory` on container
- Each item: `scroll-snap-align-start`, fixed width
- Keyboard: `role="list"` with `role="listitem"` per item; `tabIndex={0}` on each item; `onKeyDown` handles ArrowLeft/ArrowRight/Enter
- Empty state: nothing rendered (strip absent from DOM when no progressions)
