# Handoff: coaching-animator — Phase 2 Planning

**Date**: 2026-02-20
**Branch**: main (`d5b58fb` — fully up to date)
**State**: Phase 0-1 complete. All tasks done. Ready to plan Phase 2.

---

## What Was Just Completed

| Task | Title | Commit |
|------|-------|--------|
| T014 | Staging Supabase project | `ffe8c31` |
| T015 | Mobile share route `/share/[id]` | `04cc14c` |

T015 delivered:
- `src/app/share/[id]/page.tsx` — auto-play, OG metadata, view count
- `src/features/animation/components/ShareViewer.tsx` — stripped watch-only viewer, loops
- `src/app/share/layout.tsx` — black full-height layout
- `src/shared/components/Navigation.tsx` — /share/* guard
- `tests/e2e/share-replay.spec.ts` — 7 E2E tests

Quality gates: `npx tsc --noEmit` ✅ `npm test -- --run` 48/48 ✅ `npm run lint` ✅

---

## Next Phase: Phase 2 — Progressions + Remix Genealogy

**PRD reference**: Sections 5.2 (Progressions), 5.5 (Remix), 7.2.1
**Scope**: Medium — DB migrations + API + gallery UI changes
**CLEO epic**: Create a new epic for Phase 2 (T016+ range is taken; use next available ID)

### What Phase 2 delivers

1. **Drill progressions** — A base animation + up to 5 variations, linked via `parent_animation_id`
2. **Remix genealogy** — When a user forks someone else's animation, track the lineage (A→B→C chain visible in UI)
3. **Gallery presentation** — One card per progression set with "+ N progressions" expand badge
4. **Collection detail** — Base + progressions in vertical sequence within a collection

### DB changes needed (no migrations exist yet)

```sql
-- Additions to saved_animations
parent_animation_id UUID REFERENCES saved_animations(id) ON DELETE CASCADE
progression_order   INTEGER DEFAULT 0  -- 0=base, 1-5=progressions
is_progression      BOOLEAN DEFAULT FALSE
remixed_from_id     UUID REFERENCES saved_animations(id) ON DELETE SET NULL
remix_count         INTEGER DEFAULT 0
```

### CLEO session start

```bash
ct session list
ct session start --scope epic:<NEW_EPIC_ID> --auto-focus --name "Phase 2 RCSD planning"
```

### Recommended workflow: RCSD pipeline first

Phase 2 is medium scope with DB schema decisions. Use RCSD before implementation:

```bash
# 1. Research (understand remix/progression patterns in similar tools)
# 2. Consensus (confirm DB schema with user — especially cascade rules)
# 3. Specification — use speckit.specify:
#    /speckit.specify "Phase 2: Drill progressions and remix genealogy"
# 4. Decomposition — use speckit.tasks to generate task list
# 5. Implementation — use speckit.implement or execute-plans
```

---

## Quality Gates (run before every push)

```bash
npm run lint             # ESLint
npx tsc --noEmit         # TypeScript — 0 errors
npm test -- --run        # 48/48 unit tests
```

---

## Key Files for Phase 2

| Area | Path |
|------|------|
| PRD v2.0 | `docs/authority/PRD-v2.0.md` sections 5.2, 5.5, 7.2.1 |
| DB migrations | `supabase/migrations/` (8 files, applied to staging) |
| Gallery cards | `src/features/gallery/components/AnimationCard.tsx` |
| Public gallery | `src/features/gallery/components/PublicAnimationCard.tsx` |
| Collection detail | `src/app/collections/[id]/page.tsx` |
| Animations API | `src/app/api/animations/` |
| Gallery API | `src/app/api/gallery/` |

---

## Phases After Phase 2

| Phase | Title | Scope |
|-------|-------|-------|
| Phase 3 (v2.2) | Organizations + Endorsements | Large — new tables, RLS, member management |
| Phase 4 (v2.3) | Personalization (club badge, strip colors) | Small — 4 DB columns + settings UI |
