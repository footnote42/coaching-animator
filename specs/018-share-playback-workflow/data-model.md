# Data Model: Phase 2c — Share & Playback Workflow

**Date**: 2026-05-03
**Feature**: `specs/018-share-playback-workflow/spec.md`

---

## Summary

No new migrations are required. All progression and coaching notes columns already exist on `saved_animations`. This spec is a UI + minor API wiring exercise on top of an already-complete schema.

---

## Existing Schema — `saved_animations` (relevant columns)

```sql
-- Already present (confirmed in database.types.ts + migrations)
id                   UUID PRIMARY KEY
user_id              UUID NOT NULL REFERENCES auth.users(id)
title                TEXT NOT NULL           -- 1-100 chars
description          TEXT                    -- max 2000 chars
coaching_notes       TEXT                    -- max 5000 chars (coaching delivery notes)
animation_type       TEXT NOT NULL
tags                 TEXT[]
payload              JSONB NOT NULL
visibility           TEXT NOT NULL           -- 'private' | 'link_shared' | 'public'
parent_animation_id  UUID REFERENCES saved_animations(id) ON DELETE CASCADE
is_progression       BOOLEAN NOT NULL DEFAULT FALSE
progression_order    INTEGER DEFAULT 0       -- 0 = base; 1-5 = progression slot
progression_count    INTEGER NOT NULL DEFAULT 0  -- denormalized counter
upvote_count         INTEGER DEFAULT 0
view_count           INTEGER DEFAULT 0
created_at           TIMESTAMPTZ
updated_at           TIMESTAMPTZ
```

---

## Key Constraints

| Constraint | Detail |
|-----------|--------|
| `coaching_notes_length` | `char_length(coaching_notes) <= 5000` |
| `chk_progression_order` | `progression_order BETWEEN 0 AND 5` — max 5 progressions per Foundation |
| `trigger_check_parent_is_base` | `parent_animation_id` MUST point to a non-progression (`is_progression = false`) |
| `ON DELETE CASCADE` | Deleting a Foundation deletes all its Progressions |
| Progression counters | `progression_count` maintained by insert/delete triggers |

---

## TypeScript Interface (extended)

```typescript
// Existing interface — no changes needed
interface SavedAnimation {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  coaching_notes: string | null;       // Use this field (NOT coaching_points)
  animation_type: 'tactic' | 'skill' | 'game' | 'other';
  tags: string[];
  payload: ProjectPayload;
  visibility: 'private' | 'link_shared' | 'public';
  parent_animation_id: string | null;  // FK to Foundation animation
  is_progression: boolean;             // true = this is a Progression; false = Foundation or standalone
  progression_order: number;           // 0 = Foundation; 1-5 = Progression slot
  progression_count: number;           // Denormalized count of linked Progressions
  upvote_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}
```

---

## Entity Semantics (canonical terms for implementation)

| Term | Meaning | DB Indicator |
|------|---------|-------------|
| **Foundation** | Base animation in a set; not a progression | `is_progression = false` AND `parent_animation_id IS NULL` |
| **Progression** | Child animation linked to a Foundation | `is_progression = true` AND `parent_animation_id IS NOT NULL` |
| **Standalone** | Unlinked animation | `is_progression = false` AND `parent_animation_id IS NULL` (same as Foundation before any Progressions are added) |
| **Progression Set** | Foundation + all its Progressions | Queried via `WHERE parent_animation_id = $foundationId` |

---

## Mutations Required (UI flows)

### 1 — Save New Animation as Progression ("Save As Progression" flow)

POST `/api/animations` with:
```json
{
  "title": "{Foundation Title} — Progression {n}",
  "parent_animation_id": "{foundation_id}",
  "is_progression": true,
  "progression_order": {next_available_slot},
  "tags": [{inherited from Foundation}],
  "animation_type": "{inherited from Foundation}",
  "coaching_notes": "{optional}"
}
```
- Client must query `GET /api/animations/{foundation_id}/progressions` first to determine `next_available_slot`
- API already validates max 5 progressions and that parent is a Foundation

### 2 — Link Existing Animation to Foundation ("Link to Foundation")

PATCH `/api/animations/{id}` with:
```json
{
  "parent_animation_id": "{foundation_id}",
  "is_progression": true,
  "progression_order": {next_available_slot}
}
```
- Requires: user owns both `id` and `foundation_id`
- Requires: `foundation_id` is a Foundation (`is_progression = false`)
- Requires: `id` is currently a standalone (not a Foundation with its own Progressions — warn before proceeding if it has `progression_count > 0`)
- Server must increment `progression_count` on Foundation after update

### 3 — Unlink Progression ("Unlink")

PATCH `/api/animations/{id}` with:
```json
{
  "parent_animation_id": null,
  "is_progression": false,
  "progression_order": 0
}
```
- Requires: user owns `id`
- Server must decrement `progression_count` on old parent
- No re-ordering of siblings required (gaps in `progression_order` are acceptable)

### 4 — Update Coaching Notes

PATCH `/api/animations/{id}` with:
```json
{
  "coaching_notes": "{text or null}"
}
```
Already supported by the existing PATCH handler. Empty string → store as `null`.

---

## Gallery Query — Filtering Progressions

Already implemented in `GET /api/animations` (public gallery endpoint):
```sql
.or('is_progression.eq.false,is_progression.is.null')
```
No change needed here.

---

## Share/Replay Page — Coaching Notes Fetch

The share page (`/share/[id]/page.tsx`) currently selects:
```typescript
.select('id, title, payload, view_count, parent_animation_id, is_progression, progression_order, user_id')
```

Must be extended to include `coaching_notes`:
```typescript
.select('id, title, payload, view_count, parent_animation_id, is_progression, progression_order, user_id, coaching_notes')
```

Then pass `coaching_notes` as a prop to `ShareViewer`.

Same change needed in `replay/[id]/page.tsx` → `ReplayViewer`.
