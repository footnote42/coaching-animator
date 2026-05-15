# Next Session — EDITOR-013: Unified Floating Editor Controls

**Date written**: 2026-05-15
**Branch**: Start from `main` (PR #17 merged this session)

---

## Context

The `020-frame-edit-own-animations` branch was fully merged to main. The codebase now has:
- All 18 workflow E2E tests passing (WF1/WF2/WF3)
- `/wf-audit` skill for running workflow audits
- Frame editing (EDITOR-019) closed
- ISSUES.md current — both audit bugs marked closed

The highest-priority open issue is EDITOR-013.

---

## EDITOR-013 — Unified Floating Editor Controls

**Severity**: High (mobile usability)

**The problem**: Users must scroll to reach the timeline controls (add frame, pace, loop, etc.) in the editor at `/app`. The existing floating remote was intended to solve this but is not effective — user confirmed 2026-05-02 it should be deprecated entirely, not iterated on.

**The requirement**: All frame/timeline controls must be accessible without scrolling. Two approved approaches:
- **(a) Slide-up panel** on the right side, mirroring the existing left sidebar panel pattern
- **(b) Replacement floating remote** — a redesigned, complete replacement (not an iteration)

The existing `FloatingRemote` component must be **deprecated and removed**, not patched.

**Key files to read first**:
- `src/features/animation/components/Editor.tsx` — main editor; where the floating remote is rendered
- `src/features/animation/components/Canvas/FloatingRemote.tsx` — current deprecated component
- `src/features/animation/components/Timeline/PlaybackControls.tsx` — timeline controls
- `src/app/app/AnimationToolClient.tsx` — editor page client wrapper
- `docs/issues/ISSUES.md` — EDITOR-013 entry for exact requirements
- `.impeccable.md` — design system constraints (must comply)

---

## How to start

```
/speckit.specify "EDITOR-013 — Unified Floating Editor Controls: deprecate FloatingRemote, replace with accessible non-scroll editor controls for frame and timeline management. See docs/issues/ISSUES.md#editor-013 and .impeccable.md for constraints."
```

Then follow with `/speckit.plan` and `/speckit.tasks` before implementing.

---

## Branch naming

```
git checkout -b 021-unified-editor-controls
```

---

## Pre-push gate (run before every PR)

```bash
npm run lint
npx tsc --noEmit
npm test -- --run
```

## Shared canvas rule

Any change to Canvas/ components must be verified on all three routes:
- `/app` (editor)
- `/replay/[id]`
- `/share/[id]` — uses `position: fixed; inset: 0` — do not alter that layout

---

## After EDITOR-013: Next issues in priority order

1. **UX-001** — Welcome popup button contrast (WCAG AA — accessibility blocker)
2. **EDITOR-012** — Entity spawning: placed on every frame, not just the added frame
3. **EDITOR-010** — Progression buttons missing for new (unsaved) animations
4. **PLAYBACK-001** — Floating playback remote should persist and be draggable

See `docs/issues/ISSUES.md` for full details on each.
