# Contract: GET /api/animations

**Feature**: 019-save-metadata-unification  
**Date**: 2026-05-04

---

## Change

Extend the Supabase SELECT string to include four previously-omitted columns.

**File**: `src/app/api/animations/route.ts`

### Before

```typescript
.select(
  'id, title, animation_type, duration_ms, frame_count, visibility, upvote_count, created_at, updated_at, progression_count, remix_count, thumbnail_url, preview_entities, remixed_from_id, remixed_from:remixed_from_id(title)',
  { count: 'exact' }
)
```

### After

```typescript
.select(
  'id, title, description, coaching_notes, animation_type, duration_ms, frame_count, visibility, upvote_count, created_at, updated_at, progression_count, remix_count, thumbnail_url, preview_entities, tags, video_url, remixed_from_id, remixed_from:remixed_from_id(title)',
  { count: 'exact' }
)
```

---

## Response Shape (AnimationSummary — additions only)

```typescript
{
  // ... all existing fields ...
  description: string | null,       // text — was already in AnimationSummary type but not fetched
  coaching_notes: string | null,    // text — was already in AnimationSummary type but not fetched
  tags: string[] | null,            // text[] — new in AnimationSummary
  video_url: string | null,         // text — new in AnimationSummary
}
```

---

## PUT /api/animations/[id] — no change required

Tags and `video_url` are already accepted:

```typescript
// src/app/api/animations/[id]/route.ts:186
if (data.tags !== undefined) updateData.tags = data.tags;
if (data.video_url !== undefined) updateData.video_url = data.video_url;
```

`UpdateAnimationSchema` already validates:
- `tags`: `z.array(z.string().max(30)).max(10).optional()`
- `video_url`: regex-validated optional string
