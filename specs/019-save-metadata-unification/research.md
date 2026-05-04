# Research: Save & Metadata Unification

**Task**: 019-save-metadata-unification  
**Date**: 2026-05-04  
**Status**: complete

---

## Summary

All unknowns resolved by reading the codebase. No schema migration, no new API routes, and no new dependencies are required. The work is confined to extending a SELECT string, widening a TypeScript interface, updating one shared component, and deleting a sidebar component.

---

## Findings

### 1. AnimationSummary interface location and current state

**File**: `src/features/gallery/components/AnimationCard.tsx:14`

Current fields: `id`, `title`, `description?`, `coaching_notes?`, `animation_type`, `duration_ms`, `frame_count`, `visibility`, `upvote_count`, `created_at`, `updated_at`, `thumbnail_url?`, `current_version?`, `endorsed_by?`, progression fields, remix fields, `preview_entities?`, `is_rfu_endorsed?`.

**Missing**: `tags?: string[] | null` and `video_url?: string | null`.

### 2. GET /api/animations select string

**File**: `src/app/api/animations/route.ts:47`

Current SELECT: `id, title, animation_type, duration_ms, frame_count, visibility, upvote_count, created_at, updated_at, progression_count, remix_count, thumbnail_url, preview_entities, remixed_from_id, remixed_from:remixed_from_id(title)`

**Missing**: `description, coaching_notes, tags, video_url`

Note: `description` and `coaching_notes` are already in `AnimationSummary` but not fetched. All four fields need adding to the SELECT string.

### 3. EditMetadataModal current state

**File**: `src/shared/components/EditMetadataModal.tsx`

- Pre-populates: title, description, coaching_notes, animation_type, visibility ✅
- Missing: tags, video_url ❌
- Description `maxLength`: 500 (spec requires 2000) ❌
- `onSave` callback: `() => void` — carries no data back to parent ❌
- Error handling: inline `setError` only; modal stays open on error ✅ (stays open is correct — toast needs adding)

### 4. my-gallery handleEditSave — current pattern

**File**: `src/app/my-gallery/page.tsx:139`

```typescript
const handleEditSave = async () => {
  setEditingId(null);
  await fetchAnimations();  // ← full refetch
};
```

This needs changing to an optimistic patch:

```typescript
const handleEditSave = (updated: Partial<AnimationSummary>) => {
  setAnimations((prev) =>
    prev.map((a) => (a.id === editingId ? { ...a, ...updated } : a))
  );
  setEditingId(null);
};
```

The `EditMetadataModal.onSave` prop type changes from `() => void` to `(updated: Partial<AnimationSummary>) => void`.

### 5. PUT /api/animations/[id] — tags and video_url confirmed

**File**: `src/app/api/animations/[id]/route.ts:186`

```typescript
if (data.tags !== undefined) updateData.tags = data.tags;
if (data.video_url !== undefined) updateData.video_url = data.video_url;
```

Both fields are already accepted by the PUT route. **No backend change needed.**

### 6. UpdateAnimationSchema — confirmed

**File**: `src/lib/schemas/animations.ts:86`

`UpdateAnimationSchema` is `CreateAnimationSchema.partial()` which includes `tags` (array, max 10, each max 30 chars) and `video_url` (regex-validated). No schema change needed.

### 7. Tags round-trip pattern from SaveToCloudModal

**File**: `src/shared/components/SaveToCloudModal.tsx`

Display: `tags.join(', ')` → text input  
Parse on save: `tags.split(',').map(t => t.trim()).filter(Boolean)` → `string[]`  
Validation: max 10 tags, each max 30 chars checked inline

This exact pattern should be replicated in `EditMetadataModal`.

### 8. YouTube URL regex source

**File**: `src/features/animation/components/Sidebar/MetadataSheet.tsx:12`

```typescript
const YOUTUBE_URL_REGEX = /^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[A-Za-z0-9_-]{11}$/;
```

This constant should be inlined in `EditMetadataModal` (MetadataSheet will be deleted).

### 9. MetadataSheet removal scope

**File**: `src/features/animation/components/Sidebar/ProjectActions.tsx`

- `MetadataSheet` is imported at line 9
- `isMetadataSheetOpen` state at line 32
- Button trigger at lines 148–158 ("Edit Metadata")
- `<MetadataSheet>` instance at lines 262–265

All four points need removing. After removal, `MetadataSheet.tsx` can be deleted.

No other file imports `MetadataSheet`.

### 10. Toast library

**File**: `src/features/animation/components/Sidebar/ProjectActions.tsx:11`

`import { toast } from 'sonner'` — already used in the project. Add same import to `EditMetadataModal`.

---

## References

- Spec: `specs/019-save-metadata-unification/spec.md`
- `AnimationCard.tsx`: `src/features/gallery/components/AnimationCard.tsx`
- `GET /api/animations`: `src/app/api/animations/route.ts`
- `EditMetadataModal`: `src/shared/components/EditMetadataModal.tsx`
- `my-gallery/page.tsx`: `src/app/my-gallery/page.tsx`
- `PUT /api/animations/[id]`: `src/app/api/animations/[id]/route.ts`
- `MetadataSheet`: `src/features/animation/components/Sidebar/MetadataSheet.tsx`
- `ProjectActions`: `src/features/animation/components/Sidebar/ProjectActions.tsx`
- `SaveToCloudModal`: `src/shared/components/SaveToCloudModal.tsx`
