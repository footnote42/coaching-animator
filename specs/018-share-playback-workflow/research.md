# Research: Phase 2c — Share & Playback Workflow

**Date**: 2026-05-03
**Feature**: `specs/018-share-playback-workflow/spec.md`
**Branch**: `018-share-playback-workflow`

---

## Scope

Phase 0 codebase research resolving all spec assumptions before design begins. Covers DB schema state, existing API routes, component inventory, and discrepancies between spec language and codebase reality.

---

## Finding 1 — DB Table Name

- **Decision**: Table is `saved_animations`, not `animations`.
- **Rationale**: Migration history shows the canonical table has always been `saved_animations`. The spec used "animations" as shorthand — all SQL and TypeScript must use the real name.
- **Impact**: No schema change needed for this; purely a naming clarification for implementation.

---

## Finding 2 — `coaching_notes` Already Exists

- **Decision**: The `coaching_notes TEXT` column already exists on `saved_animations` (created in the Phase 2 foundation migrations). The spec called it `coaching_points` but the canonical DB name is `coaching_notes`. Use `coaching_notes` everywhere.
- **Rationale**: Migration `20260220000000_progressions_and_remix.sql` is the authoritative source. The database.types.ts confirms `coaching_notes: string | null`. Constraint: `coaching_notes_length CHECK (char_length(coaching_notes) <= 5000)`.
- **What remains**: API (`GET /api/animations/[id]`) already returns `coaching_notes` via `SELECT *`. The PATCH handler already processes it. **Only the UI is missing**: no `coaching_notes` textarea in `SaveToCloudModal` or `EditMetadataModal`.

---

## Finding 3 — Progression Schema Already Fully Implemented

- **Decision**: All progression DB columns already exist. No migration required for progressions.
- **Columns present**: `parent_animation_id UUID REFERENCES saved_animations(id) ON DELETE CASCADE`, `is_progression BOOLEAN NOT NULL DEFAULT FALSE`, `progression_order INTEGER DEFAULT 0` (range 0–5), `progression_count INTEGER NOT NULL DEFAULT 0`.
- **Important**: ON DELETE is **CASCADE**, not SET NULL. If a Foundation is deleted, all its Progressions are also deleted. The spec edge case ("Progressions become orphans") does not apply to the current schema. The spec assumption about `ON DELETE SET NULL` was incorrect.
- **Limit**: Maximum 5 progressions per Foundation (enforced by `chk_progression_order CHECK (progression_order BETWEEN 0 AND 5)`). Implementation must respect this limit.
- **Progression order**: `progression_order` is 1-based for progressions (1–5); base animations have `progression_order = 0`. Auto-generation of the next value: `(SELECT COUNT(*) WHERE parent_animation_id = $id) + 1`.

---

## Finding 4 — Share View Features Already Implemented

Reviewing `ShareViewer.tsx`, the following FR items from the spec are **already implemented**:

| FR | Description | Status |
|----|-------------|--------|
| FR-005 | Title above canvas | ✅ Done — `h1` with gradient overlay at top of canvas |
| FR-006 | Non-intrusive "Powered by" footer | ✅ Done — `powered by Coaching Animator` link bottom-right |
| FR-007 | Prev/next progression navigation | ✅ Done — full nav set built server-side in `share/[id]/page.tsx` |
| FR-008 | Context-aware back button | ✅ Done — owner → `/my-gallery`, non-owner → `/gallery` |

What remains for ShareViewer: coaching notes overlay (FR-011).

---

## Finding 5 — Gallery Routing Already Fixed

- **Decision**: FR-003 (Gallery "Play" routes to `/share/{id}`) is **already done**.
- `GalleryClient.tsx` line 180: `router.push('/share/${id}')` — onView handler already pushes to share route.
- The `PublicAnimationCard` Play overlay delegates to this handler.

---

## Finding 6 — Gallery & My Playbook Share Buttons Already Present

| Surface | Status |
|---------|--------|
| `PublicAnimationCard` — Share button | ✅ Done — `handleShare` at line 113, uses `navigator.share` + clipboard fallback |
| `AnimationCard` (My Playbook) — Share button | ✅ Done — ShareSheet integration at line 242–314 |
| `ShareSheet` component | ✅ Done — implements clipboard + Web Share API correctly |

What remains: **Editor toolbar share button** (EDITOR-002). The Editor component has no ShareSheet or share handler.

---

## Finding 7 — Editor Share Button Missing

- The Editor does not import or render a share button. The toolbar (rendered in `Toolbar.tsx` or directly in `Editor.tsx`) has a Save button but no Share button.
- This is EDITOR-002 — the blocking gap. Implementation: add a Share icon button to the editor toolbar that opens a `ShareSheet` conditional on `cloudAnimationId` being set. If unsaved, prompt to save first.

---

## Finding 8 — Progressions API Exists and Enforces Rules

- `GET /api/animations/[id]/progressions` — returns progressions ordered by `progression_order`. Checks base is not itself a progression. Access: owner always; public/link_shared base for anyone.
- `POST /api/animations/[id]/progressions` — creates a new progression child. Enforces max 5. Auto-sets `progression_order = existingCount + 1`, title `"Progression {n}"`, visibility `'private'`.
- `GET /api/gallery/[id]/progressions` — public-only version for ProgressionStrip.
- No dedicated link/unlink endpoints exist yet (needed for FR-019, FR-020).

---

## Finding 9 — ProgressionStrip Exists (Different Visual Than Spec)

The `ProgressionStrip` component is a horizontal scrollable row of `MiniPitchSVG` thumbnails displayed below each parent card. It already serves the spec's functional goal (make progressions discoverable from My Playbook and gallery). 

The spec described "visually offset stacked cards evoking physical coaching cards" — this is a different visual from the current horizontal strip. Implementation decision: **retain ProgressionStrip as the My Playbook progression display**; the "stacked card" metaphor is described in the spec as a preference but the ProgressionStrip is already functional and user-tested. The plan upgrades My Playbook to add "Add Progression", "Link to Foundation", and "Unlink" actions as direct card actions rather than changing the strip layout.

---

## Finding 10 — "Save As Progression" Flow Not Yet Implemented

- Neither the `SaveToCloudModal` nor the `EditMetadataModal` has a `parent_animation_id` selector.
- The `POST /api/animations` route supports `parent_animation_id` in its payload (line 231-232 in route.ts) so the API is ready.
- Implementation: Add a "Save As Progression" toggle + parent-picker to `SaveToCloudModal`. The picker queries `GET /api/animations?is_progression=false` to list the user's Foundation animations.

---

## Finding 11 — Link / Unlink API Gaps

Two new API mutations are needed:
- **Link to Foundation**: `PATCH /api/animations/[id]` with `{ parent_animation_id, is_progression: true, progression_order }`. Must validate: target Foundation exists and user owns it; target is not itself a progression.
- **Unlink**: `PATCH /api/animations/[id]` with `{ parent_animation_id: null, is_progression: false, progression_order: 0 }`. Must decrement parent's `progression_count` and re-order siblings.

The existing PATCH handler already processes `parent_animation_id` updates. Link/Unlink can reuse it with validation guards in the frontend or a dedicated sub-route.

---

## Finding 12 — Rate Limiting Pattern

- `src/lib/server/rate-limit.ts` — confirmed location. Already used in progressions POST (`checkRateLimit(user.id, 'progression_create')`).
- New endpoints should follow the same pattern.

---

## Finding 13 — ReplayViewer Coaching Notes Gap

- `ReplayViewer.tsx` does not currently fetch or display `coaching_notes`.
- The replay page (`/replay/[id]/page.tsx`) fetches the animation; `coaching_notes` is included in `SELECT *`.
- Need to: (a) pass `coaching_notes` from page to ReplayViewer, (b) add Notes overlay component (same component reused in ShareViewer and ReplayViewer).

---

## Key Discrepancies: Spec Language vs Codebase Reality

| Spec Term | Actual Codebase |
|-----------|----------------|
| `animations` table | `saved_animations` table |
| `coaching_points` field | `coaching_notes` column |
| ON DELETE SET NULL (orphans) | ON DELETE CASCADE (progressions deleted with parent) |
| "stacked offset card" visual | `ProgressionStrip` horizontal scroll (existing, functional) |
| FR-003 gallery routing "todo" | Already implemented |
| FR-005/006/007/008 share view "todo" | Already implemented in ShareViewer |
| Gallery share button "missing" | PublicAnimationCard has it; AnimationCard has it |

---

## Work Remaining Summary

| # | Area | Component(s) | Size |
|---|------|-------------|------|
| 1 | Editor share button | `Editor.tsx` + `ShareSheet` | small |
| 2 | Coaching notes in save modal | `SaveToCloudModal.tsx` | small |
| 3 | Coaching notes in edit modal | `EditMetadataModal.tsx` | small |
| 4 | Notes overlay component | new `CoachingNotesOverlay.tsx` | small |
| 5 | Notes overlay in ShareViewer | `ShareViewer.tsx` | small |
| 6 | Notes overlay in ReplayViewer | `ReplayViewer.tsx` + `replay/[id]/page.tsx` | small |
| 7 | "Add Progression" action in My Playbook | `AnimationCard.tsx` | small |
| 8 | "Save As Progression" in save flow | `SaveToCloudModal.tsx` + parent-picker | medium |
| 9 | "Link to Foundation" action + API | `AnimationCard.tsx` + PATCH API | medium |
| 10 | "Unlink" action + API | `AnimationCard.tsx` + PATCH API | small |
