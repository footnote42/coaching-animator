# API Contracts: Phase 2c — Share & Playback Workflow

**Date**: 2026-05-03
**Feature**: `specs/018-share-playback-workflow/spec.md`

---

## Already-Implemented Endpoints (verify only)

### GET /api/animations/[id]/progressions

Returns ordered progressions for a base animation.

**Response** `200`:
```json
{
  "progressions": [
    {
      "id": "uuid",
      "title": "Foundation Title — Progression 1",
      "description": "string | null",
      "animation_type": "tactic",
      "duration_ms": 5000,
      "frame_count": 10,
      "visibility": "public",
      "upvote_count": 0,
      "created_at": "ISO 8601",
      "updated_at": "ISO 8601",
      "thumbnail_url": "string | null",
      "progression_order": 1,
      "current_version": "1.0"
    }
  ]
}
```

**Errors**: `404` (not found), `400` (called on a Progression), `401` (private, non-owner)

---

### POST /api/animations/[id]/progressions

Creates a new empty Progression linked to the given Foundation. Auth required (owner only).

**Request**: no body needed — progression is created with default payload.

**Response** `201`:
```json
{
  "id": "uuid",
  "title": "Progression 1",
  "progression_order": 1,
  "created_at": "ISO 8601"
}
```

**Errors**: `401` (not owner), `422` (max 5 progressions reached), `400` (parent is itself a progression)

---

## Modified Endpoints

### GET /share/[id] page data fetch — add `coaching_notes`

The server-side fetch in `src/app/share/[id]/page.tsx` must include `coaching_notes`:

```typescript
// Before:
.select('id, title, payload, view_count, parent_animation_id, is_progression, progression_order, user_id')

// After:
.select('id, title, payload, view_count, parent_animation_id, is_progression, progression_order, user_id, coaching_notes')
```

Pass as `coachingNotes?: string | null` prop to `ShareViewer`.

### GET /replay/[id] page data fetch — add `coaching_notes`

Same change in `src/app/replay/[id]/page.tsx`. Pass to `ReplayViewer`.

---

## New Mutations (via existing PATCH /api/animations/[id])

The existing PATCH handler already processes `parent_animation_id` and `is_progression`. The following describe the payloads for the new UI flows — no new route files needed.

### Link to Foundation

```typescript
// PATCH /api/animations/{animationId}
{
  parent_animation_id: foundationId,   // string (UUID)
  is_progression: true,
  progression_order: nextSlot          // number (1–5)
}
```

**Frontend validation before PATCH**:
1. Confirm user owns the animation being linked
2. Confirm the target Foundation exists and user owns it
3. Confirm target is not itself a progression
4. Confirm target has fewer than 5 progressions
5. If animation being linked has `progression_count > 0`: warn user that its children will be detached

**Error responses**: `401` (not owner), `404` (Foundation not found), `422` (max 5 reached)

### Unlink from Foundation

```typescript
// PATCH /api/animations/{progressionId}
{
  parent_animation_id: null,
  is_progression: false,
  progression_order: 0
}
```

After success, the animation becomes a standalone Foundation-eligible animation.

---

## New API: "Save As Progression" — save flow integration

When a coach chooses "Save As Progression" in the save modal:

1. First call: `GET /api/animations?is_progression=false&mine=true` to populate the parent-picker. (This uses the existing list endpoint; `mine=true` filter scopes to the authenticated user.)
2. On save: POST to `/api/animations` (existing save endpoint) with `parent_animation_id` and `is_progression: true` included in the body.

### GET /api/animations — parent-picker list

Existing endpoint, no changes. Frontend passes `is_progression=false` query param. Response already filters `is_progression.eq.false`.

---

## New API: Foundation Parent-Picker for Linking

Same as above — `GET /api/animations?is_progression=false` returning the user's Foundation animations for the "Link to Foundation" modal.

---

## Zod Schema Extensions

File: `src/lib/schemas/animations.ts`

Add `coaching_notes` to the animation save/update schema if not already present:

```typescript
// Check and add if missing:
coaching_notes: z.string().max(5000).nullable().optional(),
```

Add to PATCH schema if not already present:
```typescript
parent_animation_id: z.string().uuid().nullable().optional(),
is_progression: z.boolean().optional(),
progression_order: z.number().int().min(0).max(5).optional(),
```
