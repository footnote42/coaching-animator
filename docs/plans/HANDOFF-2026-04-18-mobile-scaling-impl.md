# Session Handoff — 2026-04-18 — Mobile Replay Scaling Implementation

**Branch**: `001-fix-share-scaling`  
**Spec**: `specs/001-fix-share-scaling/`  
**Status at session end**: Implementation complete, new bug discovered

---

## What Was Completed This Session

The full SpecKit workflow for `001-fix-share-scaling` ran from planning through implementation:

### Planning (earlier in session, pre-compaction)
- `/speckit.plan` — researched root cause, generated `plan.md`, `research.md`
- `/speckit.tasks` — generated `tasks.md` (18 tasks)
- `/speckit-superb-review` — coverage gate passed, T004a added for zero-frames regression

### Implementation (this sub-session)
All 18 tasks completed and marked `[x]` in `tasks.md`.

**Three source files changed:**

| File | Change |
|------|--------|
| `src/core/hooks/useShareCanvasSize.ts` | Replaced hard-coded `{ width: 800, height: 600 }` initial state with lazy initializer reading `window.innerWidth/innerHeight` at mount. Fixes the oversized first-paint flash on mobile. |
| `src/app/share/[id]/page.tsx` | Loading placeholder updated to `position: fixed; inset: 0` (was `h-[300px]`). Dead `min-h-screen` wrapper removed — `ShareViewer` is `position: fixed` so the wrapper was inert. |
| `src/features/animation/components/ShareViewer.tsx` | Zero-frames fallback branch updated to `position: fixed; inset: 0` centering — wrapper removal had broken it. |

**New test file:** `src/core/hooks/useShareCanvasSize.test.ts` — TDD-driven, 2 tests (portrait + landscape lazy init). RED → GREEN confirmed. 50/50 unit tests passing.

**Quality gates passed:**
- `npm run lint && npx tsc --noEmit` — clean
- `npm test -- --run` — 50/50 passing
- `npm run e2e` — 70/70 passing (exit 0)
- Device emulation: iPhone 14 portrait ✅, landscape ✅, iPhone SE 320px ✅, FloatingRemote ✅

---

## Open Issue — Entity Icons Not Scaling With Canvas

**Observation (user, end of session):**

> "The replay screen renders the pitch correctly but does not render the animation to scale against the pitch. Both the pitch and remote control tool render fine but the animated icons appear off to one side, incomplete, and at the same size as the original file."

**What this means technically:**

The `useShareCanvasSize` lazy initializer fix correctly sizes the Konva `Stage` element to the viewport. The rugby pitch SVG (the `Field` component) scales correctly because it fills the stage bounds. However, entity positions (player tokens, cones, balls) are stored in the animation payload as absolute coordinates in the **editor's coordinate space** (approximately 800×600 or whatever size the editor used when the animation was built).

When the stage renders at 390×292 (mobile portrait), entities appear at their original pixel positions — off-screen or clustered — because no scale factor is applied to map editor coordinates to the new stage size.

**Root cause hypothesis:**

The `Stage` component in `src/features/animation/components/Canvas/Stage.tsx` likely sets a `scaleX`/`scaleY` based on the ratio of `(current canvas size) / (editor canvas size)`. Check whether this scale is being computed and passed down correctly to the `EntityLayer` under the new canvas dimensions, or whether the lazy initializer change broke a timing assumption.

**Key files to investigate:**

```
src/features/animation/components/Canvas/Stage.tsx     ← look for scaleX/scaleY
src/features/animation/components/Canvas/EntityLayer.tsx
src/features/animation/components/ShareViewer.tsx       ← how canvasSize is passed to Stage
src/core/hooks/useShareCanvasSize.ts                    ← the hook we changed
```

**What to check first:**

1. In `Stage.tsx`: how are `scaleX` and `scaleY` computed? Are they based on the canvas size passed in?
2. In `ShareViewer.tsx`: is the `canvasSize` from `useShareCanvasSize` passed to `Stage` (and is the stage positioned/sized correctly)?
3. Was this bug present before the lazy initializer fix? (It may be pre-existing — the ResizeObserver still fires and sets the correct size asynchronously. The lazy init means the stage starts at the right size, but if the scale calculation in Stage.tsx was always wrong on share route, it would have been hidden by the pitch also being wrong.)

**This is a separate issue from FR-001** — FR-001 (canvas renders at correct size on first paint) is now fixed. This is about entity coordinate scaling within the canvas, which maps to the editor's canvas dimensions.

---

## Uncommitted Work

All implementation work is **uncommitted** — changes are staged locally on branch `001-fix-share-scaling`. The optional `speckit.git.commit` hook was not run.

Files with uncommitted changes:
- `src/core/hooks/useShareCanvasSize.ts`
- `src/core/hooks/useShareCanvasSize.test.ts`
- `src/app/share/[id]/page.tsx`
- `src/features/animation/components/ShareViewer.tsx`
- `specs/001-fix-share-scaling/tasks.md` (all tasks marked complete)
- `specs/001-fix-share-scaling/spec.md` (status updated to Tasked)

---

## Next Session Prompt

```
You are continuing work on coaching-animator (Next.js 14, Konva canvas, Supabase).
Branch: 001-fix-share-scaling

## What's done
The canvas sizing fix for ShareViewer is complete and all quality gates pass.
Three source files were changed (see docs/plans/HANDOFF-2026-04-18-mobile-scaling-impl.md).
All changes are uncommitted — commit them first.

## New bug discovered (end of last session)
The pitch renders at the correct size on mobile, but animated entity icons (players, cones,
balls) appear at the wrong positions and wrong scale — they cluster off to one side at
their original editor coordinate sizes rather than scaling to match the canvas.

The root cause is almost certainly in how scaleX/scaleY is computed and applied in the
Konva Stage for the share route. Editor coordinates are saved in a fixed space (likely
800×600) and must be mapped to the current canvas size.

Investigate:
- src/features/animation/components/Canvas/Stage.tsx  ← scaleX/scaleY computation
- src/features/animation/components/ShareViewer.tsx    ← how canvasSize feeds into Stage
- src/core/hooks/useShareCanvasSize.ts                 ← the hook (already fixed)

Determine if this is a pre-existing bug (masked before because canvas was also wrong size)
or a regression introduced by the lazy initializer. Either way, fix it as part of 001.

## How to start
1. git add / git commit the existing changes
2. Open /share/<any-id> on iPhone 14 emulation (390×844)
3. Observe the entity positioning bug
4. Read Stage.tsx to understand the scale computation
5. Fix — do NOT change entity coordinates in the payload; apply scale transform at render time

Pre-push gate: npm run lint && npx tsc --noEmit
Spec: specs/001-fix-share-scaling/spec.md
```

---

## Spec Status

`specs/001-fix-share-scaling/spec.md` — **Status: Implementing**  
All 18 tasks complete. Entity scaling bug is a follow-on task within the same spec before marking Done.
