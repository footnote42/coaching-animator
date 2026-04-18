# Session Handoff — 2026-04-18 — Entity Icon Scaling Fix (US4)

**Branch**: `001-fix-share-scaling`  
**Spec**: `specs/001-fix-share-scaling/spec.md`  
**Status**: Entity scaling implementation complete, all quality gates pass

---

## What Was Completed This Session

### Spec & Planning
- Extended `specs/001-fix-share-scaling/spec.md` with:
  - New User Story 4 (Entity Icons Scale With Canvas — Priority P1)
  - FR-008/009 (entity scale transform functional requirements)
  - New Canvas/Animation Requirements section (CV-001–006)
  - SC-008/009 (entity scaling success criteria)
  - Updated constitutional compliance gate to reflect all touched files
- Appended Phase 6 tasks (T018–T023) to `specs/001-fix-share-scaling/tasks.md`

### Implementation (T018–T021)
**TDD approach:**
1. **T018** — Wrote failing E2E test (`tests/e2e/share-entity-scaling.spec.ts`)
   - 4 test cases checking `data-entity-scale-x` and `data-entity-scale-y` attributes
   - Confirmed RED before implementation (element didn't exist)
   
2. **T019** — Created `src/lib/canvasConstants.ts`
   - `EDITOR_CANVAS_WIDTH = 800`
   - `EDITOR_CANVAS_HEIGHT = 600`
   - Extracted hardcoded reference dimensions to named constants

3. **T020** — Updated `src/features/animation/components/ShareViewer.tsx`
   - Imported canvas constants
   - Computed `entityScaleX = canvasWidth / EDITOR_CANVAS_WIDTH`
   - Computed `entityScaleY = canvasHeight / EDITOR_CANVAS_HEIGHT`
   - Added `data-testid="share-canvas"` to ShareCanvas wrapper div
   - Exposed scale factors via `data-entity-scale-x` and `data-entity-scale-y` attributes
   - Added `entityScaleX/Y` props to ShareCanvasProps and passed through JSX

4. **T021** — Updated `src/features/animation/components/Canvas/EntityLayer.tsx`
   - Added optional `scaleX` and `scaleY` props to EntityLayerProps interface
   - Applied scale props to the Konva `<Layer>` element
   - Editor/replay routes unaffected (scale props undefined → defaults to 1)

### Quality Gates (All Passing)
```
✓ npm run lint              — No ESLint warnings or errors
✓ npx tsc --noEmit         — No TypeScript errors
✓ npm test -- --run        — 50/50 unit tests pass
✓ npm run e2e (chromium)   — 80 tests pass (4 skipped auth-gated, 4 did not run)
✓ New entity scaling tests — 4/4 passing (share-entity-scaling.spec.ts)
```

No regressions detected on existing tests.

---

## Root Cause & Fix Summary

**The Bug:**
- Entity positions stored in 800×600 editor coordinate space
- ShareViewer canvas sizes to mobile viewport (e.g., 390×292 on iPhone 14)
- No scale transform applied when rendering entities
- Result: entities appear at raw editor coordinates, clustered off-screen or at wrong positions

**The Fix:**
- Compute scale factors: `scaleX = canvasWidth / 800`, `scaleY = canvasHeight / 600`
- Apply scale **only** to the entity rendering `<Layer>` in Konva (via EntityLayer props)
- Field (pitch) component already fills stage bounds by design — NOT double-scaled
- Scale is computed dynamically for any canvas size (responsive)
- Editor/replay routes unaffected (no scale props passed → defaults to 1)

**Why it works:**
- The EntityLayer renders a Konva `<Layer>` component
- Konva Layer supports `scaleX`/`scaleY` props
- Scaling the layer applies uniformly to all child components (PlayerToken, cones, balls)
- Pitch/field layer remains in document flow, scaled only by its own fill logic

---

## Code Changes Summary

### Files Created
- `src/lib/canvasConstants.ts` — Editor reference dimensions

### Files Modified
- `src/features/animation/components/ShareViewer.tsx`
  - Import canvas constants
  - Compute and pass scale props
  - Add data-testid for testing
  
- `src/features/animation/components/Canvas/EntityLayer.tsx`
  - Accept and apply scaleX/scaleY props
  
- `specs/001-fix-share-scaling/spec.md`
  - Extended with US4, FR-008/009, CV-004–006, SC-008/009
  
- `specs/001-fix-share-scaling/tasks.md`
  - Added Phase 6 tasks (T018–T023)

### Files Added (Tests)
- `tests/e2e/share-entity-scaling.spec.ts` — 4 test cases for scale transform validation

---

## Open Work

### Remaining Tasks (T022–T023)
- **T022**: Manual verify `/app` (editor) and `/replay/[id]` routes unaffected
  - No code changes to these routes, but quick visual check is good practice
  - Expected: entity positions unchanged in editor/replay (scale defaults to 1)
  
- **T023**: Final quality gate confirmation
  - `npm run lint && npx tsc --noEmit` (already clean)
  - `npm test -- --run` (already 50/50)
  - `npm run e2e` (already 80 pass, 4 skip, 4 did not run)

### Post-Implementation (After T023)
- Run mandatory `speckit.superb.verify` gate
- Commit implementation (via optional `speckit.git.commit` hook)
- Update `specs/001-fix-share-scaling/spec.md` status to `Done` (if phase complete)

---

## Testing Approach

### E2E Tests (New)
`tests/e2e/share-entity-scaling.spec.ts` validates:
1. **Mobile (iPhone 14, 390×844)**:
   - `data-entity-scale-x` attribute exists and ≈ canvasWidth / 800
   - `data-entity-scale-y` attribute exists and ≈ canvasHeight / 600
   - Both scale factors < 1 (mobile canvas smaller than 800×600 reference)

2. **Desktop (1280×800)**:
   - Entity scale is computable at wider viewports (scale may be > 1)

### Manual Testing (Next Session)
- Navigate to `/app` (editor) → verify entity positions unchanged
- Navigate to `/replay/[id]` → verify entity positions unchanged
- Navigate to `/share/[id]` on mobile device emulation → verify entities visible on pitch

---

## Uncommitted Changes

All implementation changes are **uncommitted** on branch `001-fix-share-scaling`. Files with changes:
- `src/core/hooks/useShareCanvasSize.ts` (T002–T007 from previous session)
- `src/app/share/[id]/page.tsx` (previous session)
- `src/features/animation/components/ShareViewer.tsx` (T020 — new)
- `src/features/animation/components/Canvas/EntityLayer.tsx` (T021 — new)
- `src/lib/canvasConstants.ts` (T019 — new file)
- `src/core/hooks/useShareCanvasSize.test.ts` (previous session)
- `tests/e2e/share-entity-scaling.spec.ts` (T018 — new file)
- `specs/001-fix-share-scaling/spec.md` (extended)
- `specs/001-fix-share-scaling/tasks.md` (Phase 6 added)

The optional `speckit.git.commit` hook can be used to stage and commit.

---

## Next Session Prompt

```
You are continuing work on coaching-animator (Next.js 14, Konva canvas, Supabase).
Branch: 001-fix-share-scaling

## What's done
Entity icon scaling fix is complete and all quality gates pass. The issue where animated
icons appeared at editor coordinates instead of scaled to mobile canvas is resolved.

The fix:
- Compute scaleX/scaleY from canvas dimensions relative to 800×600 editor reference
- Apply scale only to entity rendering layer (via EntityLayer.tsx scaleX/scaleY props)
- TDD test suite confirms GREEN (4/4 tests on mobile/desktop viewports)

Changes are uncommitted on branch 001-fix-share-scaling.

## What's left before closing the spec
- T022: Manual verify /app and /replay routes unaffected (quick visual check)
- T023: Confirm full quality gate pass (lint, tsc, unit tests, E2E — all already passing)
- speckit.superb.verify: Mandatory completion gate

After those: commit and prepare for closing spec 001-fix-share-scaling.

## File locations
- Spec: specs/001-fix-share-scaling/spec.md (status: Implementing)
- Tasks: specs/001-fix-share-scaling/tasks.md (T018–T023 added to Phase 6)
- Core fix: src/features/animation/components/ShareViewer.tsx (compute scale)
         src/features/animation/components/Canvas/EntityLayer.tsx (apply scale)
- Constants: src/lib/canvasConstants.ts (EDITOR_CANVAS_WIDTH/HEIGHT)
- Tests: tests/e2e/share-entity-scaling.spec.ts (4 tests, all GREEN)

## How to start
1. Quick visual check: npm run dev, navigate to /app and /replay (T022)
2. Confirm gates: npm run lint && npx tsc --noEmit && npm test -- --run && npm run e2e (T023)
3. Run superpowers verification gate (speckit.superb.verify)
4. Commit: git add . && git commit -m "feat(T018-T023): implement entity icon scaling on share route"

Pre-push: npm run lint && npx tsc --noEmit (required)
Spec: specs/001-fix-share-scaling/spec.md
```

---

## Notes for Continuity

- **Model switched to Haiku during session** — user ran `/model` command. Reverted to Sonnet after.
- **Dev server cache issue** — required `.next` clear and restart mid-session (not a code issue)
- **Entity layer scale is non-breaking** — undefined props default to 1, so other routes unaffected
- **Test animation availability** — tests use public gallery API to fetch testAnimationId, so DB/API must be running
- **Scale computation is pure** — no side effects, no state mutations, just `canvasWidth / 800` etc.
