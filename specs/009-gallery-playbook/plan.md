# Implementation Plan: Gallery & My Playbook

**Branch**: `009-gallery-playbook` | **Date**: 2026-04-26 | **Spec**: `specs/009-gallery-playbook/spec.md`

## Summary

Close four pre-launch quality gaps in the public gallery and My Playbook:
1. Add `preview_entities JSONB` column + mini-pitch SVG preview to every gallery card
2. Add `endorsed_by TEXT` column + visible CSS stamp badge on endorsed cards
3. Add always-visible progression strip beneath parent cards
4. Add search/filter to My Playbook (URL-driven, client-side)
5. Verify the template filter end-to-end and convert to URL-driven state

Two Supabase migrations are P0 prerequisites before any feature work.

---

## Technical Context

**Language/Version**: TypeScript 5 · Node 22  
**Framework**: Next.js 14 App Router (SSR + API Routes)  
**Canvas**: Konva (react-konva) — not touched in this feature; mini-pitch uses inline SVG  
**State**: Zustand stores in `src/core/stores/` — not touched; no new global state  
**Backend**: Supabase (PostgreSQL + Auth + RLS) via `src/lib/supabase/`  
**Styling**: Tailwind CSS (v4 with `@theme` CSS vars in `globals.css`) + Radix UI primitives  
**Testing**: Vitest (unit) · Playwright (E2E)  
**Deploy**: Vercel (CI via GitHub Actions)  
**Performance Goals**: Canvas interactions <100ms; API responses <500ms p95  
**Constraints**: No telemetry; no third-party analytics; RLS on all DB tables; entity colors via EntityColors service only (exception: MiniPitchSVG reads CSS vars directly — documented in research.md)

---

## Constitutional Compliance Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Check | Status | Notes |
|-------|--------|-------|
| Tier alignment (Guest/Auth/Public/Admin) | PASS | Gallery = Tier 2 (Public). My Playbook = Tier 1 (Auth). Endorsement write = Admin only (no UI in Phase 2f). |
| No telemetry or analytics | PASS | No new tracking. Search state is URL params (browser-native). |
| Entity colors via EntityColors service | PASS with documented exception | `MiniPitchSVG` uses CSS vars (`--color-accent-warm`, `--color-text-primary`) directly — this is a UI preview component, not an entity renderer. Documented in research.md Decision 6. |
| Shared canvas — tested on all 3 routes | N/A | No Canvas/ components modified. Mini-pitch is inline SVG. |
| New data: privacy impact assessed | PASS | `endorsed_by`: org reference (not PII). `preview_entities`: positions derived from user-created public content. No new PII. |
| Supabase joins flattened before use | PASS | All new joins follow existing flatten pattern (Array.isArray check). |

---

## Project Structure

### Documentation (this feature)

```text
specs/009-gallery-playbook/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 findings — key architecture decisions
├── data-model.md        # Schema changes, TypeScript types, state model
├── quickstart.md        # Manual test guide with seed steps
├── contracts/
│   └── api-contracts.md # API shapes, Zod schemas, component contracts
└── tasks.md             # Task list (/speckit.tasks output)
```

### Source Code — Files to Create

```text
supabase/migrations/
└── 20260226000000_add_endorsed_by_and_preview_entities.sql  # P0

src/app/api/gallery/[id]/progressions/
└── route.ts                                                  # New endpoint

src/features/gallery/components/
├── MiniPitchSVG.tsx        # Inline SVG preview (no canvas)
├── EndorsementBadge.tsx    # Text-only CSS stamp
└── ProgressionStrip.tsx    # Always-visible horizontal strip
```

### Source Code — Files to Modify

```text
src/lib/schemas/animations.ts            # Add q + type to MyAnimationsQuerySchema
src/app/api/gallery/route.ts             # Add endorsed_by + preview_entities to SELECT
src/app/api/animations/route.ts          # Accept q/type params; save preview_entities on POST
src/features/gallery/components/PublicAnimationCard.tsx  # Add badge + SVG + strip
src/app/gallery/GalleryClient.tsx        # Convert templatesOnly to URL param
src/app/my-gallery/page.tsx             # Add search + type filter + URL state

tests/unit/components/MiniPitchSVG.test.tsx    # Unit tests
tests/unit/components/EndorsementBadge.test.tsx
tests/e2e/gallery.spec.ts               # Add endorsement + progression tests
tests/e2e/my-gallery.spec.ts            # New — search/filter E2E
```

---

## Implementation Sequence

Implementation must respect these dependency constraints:

```
[P0] Migration → TypeScript types → API changes → Component changes → Tests
```

### Group 0 — Database (P0, must be first)

**G0-1**: Migration `20260226000000_add_endorsed_by_and_preview_entities.sql`
- `ALTER TABLE saved_animations ADD COLUMN endorsed_by TEXT DEFAULT NULL`
- `ALTER TABLE saved_animations ADD COLUMN preview_entities JSONB DEFAULT NULL`
- Backfill UPDATE for `preview_entities` (extract players from first frame, cap at 15)
- See `data-model.md` for exact SQL

**G0-2**: Regenerate TypeScript types
- `npx supabase gen types typescript --local > src/lib/supabase/database.types.ts`

### Group 1 — Schema & API (no UI dependencies)

**G1-1**: `src/lib/schemas/animations.ts`
- Add `q: z.string().optional()` and `type: AnimationTypeSchema.optional()` to `MyAnimationsQuerySchema`

**G1-2**: `src/app/api/gallery/route.ts`
- Add `endorsed_by`, `preview_entities` to the Supabase SELECT string
- Add both fields to the AnimationRow interface
- Map both fields in the response transform

**G1-3**: `src/app/api/animations/route.ts` (GET handler)
- Accept and parse `q` and `type` from query params (no server-side filtering applied)

**G1-4**: `src/app/api/animations/route.ts` (POST handler)
- After `AnimationPayloadSchema.safeParse`, extract first-frame player entities (cap 15)
- Add `preview_entities: previewEntities` to the Supabase INSERT

**G1-5**: `src/app/api/gallery/[id]/progressions/route.ts` (new)
- `GET` handler: query `saved_animations` for `parent_animation_id = id AND is_progression = true AND visibility = 'public'`
- Return `{ progressions: [...] }` ordered by `progression_order ASC`, max 5
- 404 if parent not found or not public

### Group 2 — New Components (depends on G1)

**G2-1**: `src/features/gallery/components/MiniPitchSVG.tsx`
- Inline SVG: outer rect (pitch), center line, dots from entities prop
- Attackers: `fill={getComputedStyle(document.documentElement).getPropertyValue('--color-accent-warm')}` — use CSS var reference via Tailwind: `fill-[var(--color-accent-warm)]`
- Defenders: `fill-[var(--color-text-primary)] opacity-40`
- Empty state: pitch outline only
- Props: `entities: PreviewEntity[] | null`, `className?: string`

**G2-2**: `src/features/gallery/components/EndorsementBadge.tsx`
- Renders `endorsedBy.replace(/_/g, ' ').toUpperCase()`
- Classes: `bg-primary text-text-inverse text-[10px] font-heading font-bold tracking-wider px-2 py-0.5` (no rounding, no shadow)
- `aria-label={`Endorsed by ${displayText}`}`

**G2-3**: `src/features/gallery/components/ProgressionStrip.tsx`
- Fetches `/api/gallery/${parentId}/progressions` on mount
- Loading state: 3 skeleton placeholder items
- Each item: fixed-width container, `MiniPitchSVG` at 1:1 aspect (square), numbered stamp overlay
- Container: `flex overflow-x-auto scroll-snap-type-x-mandatory gap-2`
- Item: `scroll-snap-align-start flex-none w-20 relative`
- Keyboard: arrow keys + Enter
- Numbered stamp: `absolute top-1 left-1 w-5 h-5 bg-primary text-text-inverse text-[10px] font-bold flex items-center justify-center`

### Group 3 — Modified Components (depends on G1, G2)

**G3-1**: `src/features/gallery/components/PublicAnimationCard.tsx`
- Add `endorsed_by?: string | null` and `preview_entities?: PreviewEntity[] | null` to `PublicAnimation` interface
- Replace fallback `<div>X frames</div>` with `<MiniPitchSVG entities={preview_entities} />`
- Add `<EndorsementBadge>` (absolute positioned, top-right, inside preview div) when `endorsed_by` is non-null
- Add `<ProgressionStrip>` below card content div when `progression_count > 0`
- Remove the existing pill badge for progressions (replaced by the strip)

**G3-2**: `src/app/gallery/GalleryClient.tsx`
- Convert `templatesOnly` from `useState(false)` to URL param `?templates=true`
  - Init: `const templates = searchParams.get('templates') === 'true'`
  - Update: add `templates` to URL push
  - API: keep existing `params.set('tags', 'template')` logic, trigger from URL state

**G3-3**: `src/app/my-gallery/page.tsx`
- Wrap in `<Suspense>` (required for `useSearchParams`)
- Add `useSearchParams` hook
- Init `search`, `type` from URL (`?q=`, `?type=`)
- Convert `sort`, `order` to URL params
- Add search input + type filter select (matching gallery visual style)
- Client-side filter: `filteredAnimations` derived from `animations` state using `search` and `type`
- Pass `?q=` and `?type=` to `/api/animations` fetch (forwarded, ignored server-side)
- Update URL on every filter change (replace, not push)
- Empty state with query echoed when no results match

### Group 4 — Tests

**G4-1**: Unit tests
- `tests/unit/components/MiniPitchSVG.test.tsx`: renders pitch outline, renders attacker/defender dots, caps at 15, handles null entities
- `tests/unit/components/EndorsementBadge.test.tsx`: renders correct display text, no badge when endorsedBy is null (tested via PublicAnimationCard)

**G4-2**: E2E tests
- `tests/e2e/gallery.spec.ts`: add tests for endorsement badge (seeded data), mini-pitch visible (smoke), template filter URL state
- `tests/e2e/my-gallery.spec.ts`: search by partial title, type filter, combined filters, empty state with query echo, URL param persistence across reload

---

## Complexity Tracking

| Consideration | Decision |
|---------------|----------|
| `MiniPitchSVG` uses CSS vars directly (not EntityColors) | Documented exception — preview UI, not entity renderer |
| `preview_entities` backfill runs at migration time | Acceptable — one-time cost, capped at 15 rows per animation |
| `ProgressionStrip` makes a network request per card with progressions | Accepted — progressions are rare in the gallery; no impact on most cards |
| My Playbook converts sort/order from useState to URL — potential breaking change | URL params are additive; existing bookmarks without params fall back to defaults |
