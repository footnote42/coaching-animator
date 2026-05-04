# Data Model: Save & Metadata Unification

**Feature**: 019-save-metadata-unification  
**Date**: 2026-05-04

---

## Summary

No DB schema changes. Two existing DB columns (`tags text[]`, `video_url text`) are already stored but omitted from the list query and TypeScript interface. This document describes the interface extension and the validation rules that govern the new fields.

---

## AnimationSummary (extended)

**File**: `src/features/gallery/components/AnimationCard.tsx`

Add two fields to the existing interface:

```typescript
export interface AnimationSummary {
  // ... existing fields unchanged ...

  // 019: metadata unification — expose fields already in DB
  tags?: string[] | null;       // text[] column; null if never set
  video_url?: string | null;    // text column; null if never set
}
```

**Consumers updated by this change**:
- `EditMetadataModal` — reads both fields to pre-populate form
- `my-gallery/page.tsx` — patches both fields in `handleEditSave`
- `GET /api/animations` response — now includes both fields

---

## Validation Rules (EditMetadataModal)

### Tags

| Rule | Value | Source |
|------|-------|--------|
| Input format | Comma-separated plain text | Matches `SaveToCloudModal` |
| Parse | `split(',').map(t => t.trim()).filter(Boolean)` | Same as `SaveToCloudModal` |
| Max tags | 10 | `UpdateAnimationSchema`, `CreateAnimationSchema` |
| Max chars per tag | 30 | `UpdateAnimationSchema` |
| Empty input | Treated as `undefined` (no tags) | `[] → undefined` |
| Trailing/double commas | Trimmed via `.filter(Boolean)` | Edge case from spec |
| Display on modal open | `(animation.tags ?? []).join(', ')` | `[] → ''` |

### YouTube URL

| Rule | Value | Source |
|------|-------|--------|
| Regex | `/^https:\/\/(www\.)?(youtube\.com\/watch\?v=\|youtu\.be\/)[A-Za-z0-9_-]{11}$/` | `MetadataSheet.tsx` |
| Empty input | Treated as `undefined` / cleared (`video_url: null` in DB) | Spec edge case |
| Validation timing | On form submit (inline error shown) | Same as `MetadataSheet` |
| Error message | "Please enter a valid YouTube URL (youtube.com/watch?v=... or youtu.be/...)" | From `MetadataSheet` |

### Description

| Rule | Value | Notes |
|------|-------|-------|
| Max chars | 2000 | Spec UI-001: fix from current incorrect 500 |

---

## State Flow

### Edit Modal Lifecycle

```
AnimationCard.onEdit(id)
  → my-gallery sets editingId = id
  → EditMetadataModal opens with animation prop (from animations[] in state)
  → Form pre-populated from prop

Coach edits fields → submits

PUT /api/animations/[id]
  ├── success → onSave({ title, description, coaching_notes, animation_type,
  │                       visibility, tags, video_url })
  │             → my-gallery patches animations[] optimistically
  │             → modal closes
  │
  └── failure → toast.error(message)
                modal stays open, form data intact
```

### Optimistic Patch in my-gallery

```typescript
// Before (current):
const handleEditSave = async () => {
  setEditingId(null);
  await fetchAnimations();
};

// After (019):
const handleEditSave = (updated: Partial<AnimationSummary>) => {
  setAnimations((prev) =>
    prev.map((a) => (a.id === editingId ? { ...a, ...updated } : a))
  );
  setEditingId(null);
};
```

The `updated` object is constructed in `EditMetadataModal.handleSubmit` from the confirmed form state after a successful PUT, then passed to `onSave`.

---

## No Schema Migration Required

All columns already exist in `saved_animations`:
- `description text` ✅
- `coaching_notes text` ✅
- `tags text[]` ✅
- `video_url text` ✅
