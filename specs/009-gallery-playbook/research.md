# Research: Gallery & My Playbook

**Feature**: `009-gallery-playbook`  
**Date**: 2026-04-26  
**Branch**: `009-gallery-playbook`

---

## Decision 1: First-Frame Entity Data Source

**Question**: How does the mini-pitch SVG preview get per-animation entity positions without extra API calls?

**Finding**: The gallery API (`/api/gallery/route.ts`) returns metadata only — `id`, `title`, `animation_type`, `tags`, `duration_ms`, `frame_count`, `upvote_count`, `progression_count`, `thumbnail_url`, etc. It does **not** return the `payload` field (which holds frame/entity data, up to 1 MB per animation). Including the full payload in the gallery response would multiply response size unacceptably.

**Decision**: Add a `preview_entities JSONB` nullable column to `saved_animations`. This column stores a lightweight snapshot: `Array<{x, y, team}>` for the first frame only (no IDs, no labels — position + team only). It is:
- Populated in the `/api/animations` POST handler when a new animation is saved
- Updated via DB trigger on `saved_animations` UPDATE (if payload changes)
- Backfilled for existing rows via a one-time `UPDATE` in the migration

The gallery API adds `preview_entities` to its SELECT. Card payload grows by ~200–800 bytes per card. This is the accepted tradeoff.

**Rationale**: Zero extra API calls per card, forward-compatible with thumbnail generation, single source of truth for preview data. Inline first-frame in gallery API SELECT was rejected because the payload JSON can be 500 KB+ for complex animations and Supabase `->` JSON path extraction has limited ergonomics for nested arrays.

**Alternatives considered**:
- Include `payload` in gallery SELECT: Rejected — payload up to 1 MB, gallery returns 20 cards.
- Lazy fetch per card on mount: Rejected — 20 sequential API calls on page load, visible flicker.
- PostgreSQL computed column: Not available in Supabase's managed Postgres without custom function + view complexity.

---

## Decision 2: `endorsed_by` Column

**Question**: Does `endorsed_by` exist in the database?

**Finding**: Confirmed absent. Grepped `supabase/migrations/`, `src/`, and TypeScript types — zero results. The most recent migration is `20260225000001_club_badges_storage.sql`.

**Decision**: New migration `20260226000000_add_endorsed_by_and_preview_entities.sql` adds both columns together. TypeScript types must be regenerated after migration (`supabase gen types typescript`).

**Rationale**: One migration for both P0 columns minimises migration count and regeneration cycles.

---

## Decision 3: My Playbook URL State Architecture

**Question**: How to convert My Playbook from `useState` to URL-driven state for search/filter?

**Finding**: `src/app/my-gallery/page.tsx` uses `useState` for sort and order, no search or type filter exists. `GalleryClient.tsx` already demonstrates the pattern: `useSearchParams()` to initialise state, `router.push` with `URLSearchParams` to update URL on change.

**Decision**: Convert My Playbook to URL-driven state following the existing gallery pattern exactly:
- `?q=` for search
- `?type=` for type filter
- `?sort=` and `?order=` for existing sort (migrate from `useState` to URL)
- Client-side filtering runs against the full loaded collection — params are also forwarded to `/api/animations` on fetch (server ignores `q` and `type` today per `MyAnimationsQuerySchema`)

**Rationale**: Shareable filtered URLs, zero frontend refactor cost when server-side filtering is enabled, parity with gallery UX.

---

## Decision 4: Progression Strip Data Source

**Question**: Where do progression children's `preview_entities` and titles come from for the always-visible strip?

**Finding**: The gallery API filters out progressions: `.eq('is_progression', false)`. Child progression records exist in `saved_animations` with `parent_animation_id` set. The `progression_count` on the parent tells us how many children exist, but the gallery API does not return child data.

**Decision**: Add a new API endpoint `GET /api/gallery/[id]/progressions` that returns child progression records for a given parent:
```
{ progressions: Array<{ id, title, progression_order, preview_entities }> }
```
Cards with `progression_count > 0` fetch their children via this endpoint on mount. Each child includes `preview_entities` (the same column added in Decision 1 — backfilled for existing progressions too).

**Rationale**: Including progression children in the main gallery response would require a nested join and significantly complicate the main query. A separate endpoint fetched once per parent card on mount is acceptable — progressions are rare (most cards have none), and the fetch is a lightweight SELECT of 1–5 rows.

**Alternatives considered**:
- Nested `progressions[]` array in the main gallery response: Rejected — complex JOIN, large payloads when many progressions exist, all cards pay the cost even with 0 progressions.
- `/progression/[id]` existing route: That's a separate page, not an API for strip data.

---

## Decision 5: Template Filter URL State

**Question**: The template filter uses `useState(false)` (not URL-driven). Should this be fixed as part of Phase 2f?

**Finding**: In `GalleryClient.tsx`, `templatesOnly` is `useState(false)`, not derived from URL params. The API correctly uses `tags=template` to filter. The filter works functionally but cannot be bookmarked or shared. The spec says "verified end-to-end" — so we verify the API behaviour AND align the UI state with the URL pattern the rest of the controls use.

**Decision**: Convert `templatesOnly` from `useState` to a URL param `?templates=true` as part of the GalleryClient refactor. This brings it into the same state management model as `q`, `type`, `sort`, `order` — consistent and bookmarkable.

---

## Decision 6: MiniPitchSVG Color Source

**Question**: What colors do attacker and defender dots use in the mini-pitch SVG?

**Finding**: The spec says "attacker dots use the warm-accent color and defender dots use a muted counterpart, matching design tokens." The `EntityColors` service uses team-based colors (Blue for attack, Red for defense). For the mini-pitch preview, these full team colors are intentionally NOT used — the aesthetic goal is a simplified 2-color sketch view, not a full-fidelity replica.

**Decision**: Use CSS variables directly in the inline SVG:
- Attacker dots: `var(--color-accent-warm)` (#D97706, amber)
- Defender dots: `var(--color-text-primary)` at 40% opacity (muted charcoal)
- Pitch outline: `var(--color-primary)` (#1A3D1A, pitch green)

This does NOT go through `EntityColors` — the mini-pitch is a UI preview component, not an entity renderer. It reads CSS tokens, not entity-level defaults. This is an intentional exception to the EntityColors rule, documented here.

---

## Decision 7: `preview_entities` Extraction Logic

**Question**: How are `preview_entities` extracted from the animation payload on save?

**Finding**: The `/api/animations` POST handler already parses the full `AnimationPayload`. The payload structure is `{ frames: Array<{ entities: Record<string, Entity> }> }` where Entity has `{ type, team, x, y, color?, label? }`. First frame = `payload.frames[0]`.

**Decision**: In the POST handler, after payload is validated, extract first-frame entities as:
```typescript
const firstFrame = data.payload.frames[0];
const previewEntities = Object.values(firstFrame.entities)
  .filter(e => e.type === 'player') // players only for mini-pitch
  .slice(0, 15) // cap at 15 per spec edge case
  .map(e => ({ x: e.x, y: e.y, team: e.team }));
```
Store as `preview_entities: previewEntities` in the INSERT. Cap at 15 entities per the spec edge case. Balls and equipment (cones, shields) are excluded — only player positions are rendered in the preview.

---

## Summary

| Decision | Chosen | Rationale |
|----------|--------|-----------|
| First-frame data | New `preview_entities JSONB` column | Zero extra API calls, ~200–800 bytes per card |
| `endorsed_by` | New migration, text nullable | Confirmed absent, P0 prerequisite |
| My Playbook state | URL params (`?q=`, `?type=`, `?sort=`, `?order=`) | Parity with gallery, zero migration cost when cap lifted |
| Progression data | New `GET /api/gallery/[id]/progressions` | Lightweight, rare, keeps main query clean |
| Template filter | Convert to `?templates=true` URL param | Consistent with other controls, bookmarkable |
| Mini-pitch colors | CSS vars: amber + muted charcoal | Aesthetic preview, not entity-faithful render |
| preview_entities extraction | Players only, capped at 15 | Minimal, focused on tactical positioning |
