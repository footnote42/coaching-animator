# Handoff Prompt — Phase 2 Complete (post-T051–T054)

**Date**: 2026-02-23
**Branch**: `main` (clean, pushed, CI passing)
**Last commit**: `6fb94bb` — feat(T051-T054): Phase 2 Remix Genealogy + Progression E2E tests

---

## Session Goal

Phase 2 (v2.1) core is now complete. Remaining work is cleanup/polish: close out the T044–T046 rugby pivot epic (already implemented, just needs task completion), then tackle T033 (first-run experience) and T034 (mobile layout audit).

---

## What Was Completed This Session

| Task | Title | Status |
|------|-------|--------|
| T051 | E2E tests — Progression workflow | ✅ Done |
| T053 | Remix count display on original animation card | ✅ Done |
| T054 | Remix genealogy breadcrumb chain (A→B→C) | ✅ Done |
| T052 | Phase 2: Remix Genealogy Visualization (epic) | ✅ Done |

### Key Files Changed

| File | Change |
|------|--------|
| `tests/e2e/progressions.spec.ts` | Added: reorder API tests, 5-limit enforcement, `/progression/[id]` page test |
| `src/features/gallery/components/AnimationCard.tsx` | Added `remix_count` badge (bottom-right overlay on thumbnail) |
| `src/features/gallery/components/PublicAnimationCard.tsx` | Added `remix_count` badge (bottom-right overlay on thumbnail) |
| `src/app/replay/[id]/page.tsx` | Added `remix_count` to Supabase select + "N remixes" stat in header |
| `src/app/replay/[id]/ReplayActions.tsx` | Added `<RemixChain>` component above single-level attribution |
| `src/app/api/animations/[id]/lineage/route.ts` | **New** — walks `remixed_from_id` chain server-side, up to 5 hops |
| `src/shared/ui/RemixChain.tsx` | **New** — client component fetching lineage and rendering `A → B → C` breadcrumb |

### Architecture Notes

- **`RemixChain`** fetches `/api/animations/[id]/lineage` on mount; silently suppresses errors; only renders when chain ≥ 2 nodes
- **Lineage API** only includes `public`/`link_shared` nodes; private ancestors are skipped/stop the chain
- **`remix_count`** data was already in API responses — this was purely a UI addition
- **T044–T046** (Rugby Pivot): ALREADY FULLY IMPLEMENTED before this session — `VISIBLE_SPORTS` constant is in `src/core/constants/fields.ts`, `SportSelector` already uses it. Tasks just need to be marked done in CLEO.

---

## Remaining Work (Priority Order)

### 1. T044–T046 — Close Out Rugby Pivot (quick admin)

These are already implemented. Just mark them done in CLEO:

```bash
ct done T045 --notes "Already implemented: VISIBLE_SPORTS=['rugby-union','rugby-league'] in src/core/constants/fields.ts"
ct done T046 --notes "Already implemented: SportSelector uses VISIBLE_SPORTS; gallery sport filter uses same list"
ct done T044 --notes "Epic complete: T045+T046 already implemented and verified"
```

### 2. T033 — First-Run Experience (child of T029)

After email confirmation, user lands on `/app` with no animation loaded and no context.

**PRD requirement**: Welcome/onboarding modal on first `/app` visit post-registration.

**Implementation guidance**:
- Trigger: check `localStorage` for `firstRunSeen` flag; show modal if absent
- Modal content: brief welcome, 3 bullets (what the tool does), "Start Animating" CTA that dismisses + sets flag
- Keep it minimal — one modal, no tour, no multi-step wizard
- File to create: `src/features/animation/components/FirstRunModal.tsx`
- Wire into: `src/features/animation/components/Editor.tsx` (already the `/app` entry point)
- Must work at ≤768px (mobile-first)

### 3. T034 — Mobile Layout Audit (child of T031)

Structural audit of CTA placement and hero rendering on small screens (≤768px).

**What to check**:
- Landing page (`src/app/page.tsx`): hero text readable, CTA button accessible, no layout overflow
- Gallery (`src/app/gallery/GalleryClient.tsx`): card grid, filter controls usable on mobile
- Replay page (`src/app/replay/[id]/page.tsx`): header stats wrap cleanly, viewer fits viewport
- Use `npm run e2e` with `tests/e2e/replay-mobile.spec.ts` and `tests/e2e/mobile-replay.spec.ts` as reference

**Deliverable**: Fix any regressions found; document findings if no code changes needed.

---

## Start Commands

```bash
ct session list
ct dash

# Quick admin first — close T044-T046 (already implemented)
ct done T045 --notes "Already implemented: VISIBLE_SPORTS in src/core/constants/fields.ts"
ct done T046 --notes "Already implemented: SportSelector + gallery filter use VISIBLE_SPORTS"
ct done T044 --notes "Epic complete: children already implemented"

# Then start T033
ct session start --scope task:T033 --auto-focus --name "First-Run Experience"
ct show T033
```

---

## Key Constraints

- TypeScript + ESLint must pass before push: `npx tsc --noEmit && npm run lint`
- No time estimates (use small/medium/large sizing)
- Constitution v3.4.0 prohibits: telemetry, third-party auth, advertising, paywalls
- Mobile-first: all UI changes must consider ≤768px viewports
- `firstRunSeen` flag is localStorage only — no DB column needed, no auth dependency

---

## Phase Status Summary

| Epic | Status |
|------|--------|
| T047 Drill Progressions | ✅ All children done (T048–T051) |
| T052 Remix Genealogy | ✅ All children done (T053–T054) |
| T044 Rugby Pivot | ⚠️ Implemented but tasks not marked done |
| T029 Onboarding Flow Audit | 🔲 T033 pending |
| T031 Mobile Experience Audit | 🔲 T034 pending |
