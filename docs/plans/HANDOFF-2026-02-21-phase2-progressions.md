# Handoff Prompt — Phase 2 Progressions (post-T050)

**Date**: 2026-02-21
**Branch**: `main` (clean, pushed, CI passing)
**Last commit**: `3e30b56` — feat(T047-T050): Phase 2 Progressions — drag-drop reorder + progression set view

---

## Session Goal

Continue Phase 2 (v2.1) implementation. Core progressions UI is complete. Remaining work: E2E tests, Remix Genealogy visualization, Rugby Pivot.

---

## What Was Completed This Session

### CLEO Tasks Done

| Task | Title | Status |
|------|-------|--------|
| T047 | Phase 2: Drill Progressions (epic) | Created + children done |
| T048 | Progression editor panel — create & reorder progressions | ✅ Done |
| T049 | Gallery card: aggregate progression set (badge + expand) | ✅ Done |
| T050 | Collection detail: base + progressions vertical sequence | ✅ Done |
| T052 | Phase 2: Remix Genealogy Visualization (epic) | Created, pending |
| T053 | Remix count display on original animation card | Pending |
| T054 | Remix genealogy breadcrumb chain (A→B→C) | Pending |

### Key Files Changed

| File | Change |
|------|--------|
| `src/features/animation/components/ProgressionPanel.tsx` | Added `@dnd-kit/sortable` drag-drop; `SortablePill` with ⠿ handle; `onReorder` prop |
| `src/features/animation/components/Editor.tsx` | `handleProgressionReorder` — optimistic reorder + PATCH + revert on failure |
| `src/app/api/animations/[id]/progressions/route.ts` | Broadened from owner-only to public/link_shared access |
| `src/app/api/animations/[id]/progressions/reorder/route.ts` | **New** — `PATCH` batch-updates `progression_order`, validates ownership |
| `src/app/progression/[id]/page.tsx` | **New** — `/progression/[id]` vertical sequence page |
| `src/features/gallery/components/AnimationCard.tsx` | Badge → `NextLink` to `/progression/{id}` |
| `src/features/gallery/components/PublicAnimationCard.tsx` | Badge → `Link` to `/progression/{id}` |

### Architecture Notes

- **No new DB migrations needed** — all progression columns (`parent_animation_id`, `progression_order`, `is_progression`, `progression_count`) were applied in T016
- **`@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities`** are now installed
- **Progression panel UX**: horizontal pill bar above canvas; Base pill fixed; P1–P5 pills draggable; max 5; Add button disabled at limit
- **Progressions API**: GET endpoint now open to public/link_shared, reorder PATCH validates ownership + verifies all IDs are genuine children

---

## Remaining Phase 2 Work (Priority Order)

### 1. T051 — E2E Tests: Progression Workflow (child of T047)

PRD §12.1 spec:
```
test('Progression workflow'):
  - Create base animation + save to cloud
  - Add 3 progressions
  - Reorder via drag (verify progression_order updates)
  - Gallery shows single card with "+3 progressions" badge
  - Click badge → /progression/[id] shows base + 3 steps
  - Verify 5-progression limit (6th add is disabled/rejected)
```

Files to look at:
- `tests/` or `e2e/` — existing E2E test patterns (Playwright)
- `npm run e2e` to run (requires `npm run dev` in separate terminal)

### 2. T053 — Remix Count Display (child of T052)

PRD F-RMX-05: Show `remix_count` on gallery cards and replay page.
- `remix_count` column already exists and is incremented by DB trigger
- Add a "N remixes" badge to `AnimationCard`, `PublicAnimationCard`, and replay header
- Similar pattern to the `upvote_count` display

### 3. T054 — Remix Genealogy Breadcrumb (child of T052, depends T053)

PRD F-RMX-04: For 3+ remix generations, show `A → B → C → Current` breadcrumb.
- Needs a `/api/animations/[id]/lineage` endpoint that resolves chain server-side (cap at 5 hops)
- Component: `RemixChain.tsx` — horizontal breadcrumb, each node links to `/replay/[id]`
- Show on replay page header and gallery card tooltip
- DB: walk `remixed_from_id` recursively; use a CTE or iterative fetch

### 4. T044–T046 — Rugby-Only Pivot (PRD §5.7)

- T045: Add `VISIBLE_SPORTS` constant to `src/core/constants/` (default: `['rugby-union']`)
- T046: Filter `SportSelector` and gallery sport filter to only show `VISIBLE_SPORTS`
- Simple feature flag — no DB changes needed

### 5. T033 — First-Run Experience (child of T029)

After email confirmation, user lands on `/app` with no context. Should show a welcome/onboarding modal.

### 6. T034 — Mobile Layout Audit (child of T031)

Structural audit: CTA placement on mobile, hero rendering on small screens.

---

## Start Commands

```bash
ct session list
ct dash
ct show T051   # Start here — E2E tests
```

---

## Key Constraints

- TypeScript + ESLint must pass before push: `npx tsc --noEmit && npm run lint`
- No time estimates (use small/medium/large sizing)
- Constitution v3.4.0 prohibits: telemetry, third-party auth, advertising, paywalls
- Mobile-first: all UI changes must consider ≤768px viewports
