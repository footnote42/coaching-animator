# Session Handoff Log

Rolling record of `/handoff` outputs. Newest entry at the top.

---

## 2026-04-18 — Entity Icon Scaling Fix (Follow-on Bug)

*Full detail: `docs/plans/HANDOFF-2026-04-18-entity-scaling-fix.md`*

**Completed**: Entity icon scaling implementation using TDD (T018–T021). New E2E tests written (4/4 GREEN), spec extended with US4 + new FRs/CVs/SCs, all quality gates pass (lint, tsc, 50/50 unit tests, 80/80 E2E). Changes uncommitted on `001-fix-share-scaling`.

**Bug fixed**: Animated icons (players, cones, balls) now render at correct scale on mobile share route. Issue: entities were at raw 800×600 editor coordinates on a ~390×292 mobile canvas. Fix: apply scaleX/scaleY transform (canvasWidth/800, canvasHeight/600) to entity layer only.

**Next**: T022 (manual /app + /replay verify), T023 (confirm gates), then `speckit.superb.verify` mandatory gate.

---

## 2026-04-18 — Mobile Replay Scaling Implementation

*Full detail: `docs/plans/HANDOFF-2026-04-18-mobile-scaling-impl.md`*

**Completed**: Full SpecKit workflow (plan → tasks → implement) for `001-fix-share-scaling`.
Three files changed: `useShareCanvasSize.ts` (lazy initializer), `share/[id]/page.tsx` (loading placeholder + dead wrapper), `ShareViewer.tsx` (zero-frames fallback). New TDD test added. 50/50 unit tests, 70/70 E2E tests passing. All changes uncommitted.

**New bug discovered**: Entity icons (players, cones) appear at wrong position/scale on the share route — they render at editor coordinates rather than scaled to the new canvas size. Pitch and FloatingRemote are fine. Root cause is likely in `Stage.tsx` `scaleX/scaleY` computation. Fix required before closing spec.

**Next session prompt**: See full handoff doc above.

---

## 2026-04-18 — Project Direction & Infrastructure Restore

**Supabase restored.** DB had been paused due to inactivity. Restored via dashboard — all data intact. Vercel deployment confirmed active.

**Project direction interview completed.** Key findings:
- Status: pre-launch, no external users yet
- Primary usage: desktop edit / mobile view (original plan holds)
- Dev bandwidth: a few hours per week
- Single launch blocker: mobile replay scaling (ShareViewer forces pinch-zoom)
- v1 definition: core loop working + polished landing page + basic user guide
- Mobile editor: explicitly v2

**Roadmap established** (see `docs/authority/ROADMAP.md`):
- Phase 0: Infrastructure rescue ✅ (complete this session)
- Phase 1: Mobile replay scaling fix
- Phase 2: Landing page overhaul (tactical/hand-drawn aesthetic) + inline user guide
- Phase 3: Automated UAT for core loop
- Phase 4: AI animation spike + growth

**SpecKit brownfield bootstrap completed** (earlier same day):
- `.specify/memory/constitution.md`: File Organization section updated to real feature-based architecture
- `.specify/templates/spec-template.md`: Constitutional compliance gate, frontend/API/canvas sections added
- `.specify/templates/plan-template.md`: Real tech context, actual directory structure
- `.specify/templates/tasks-template.md`: Real paths, test commands, project notes
- `docs/authority/constitution.md`: Deleted (was backup copy — `.specify/memory/constitution.md` is canonical)
- Committed and pushed: `e042afb`

**Next session prompt:**

```
You are continuing work on coaching-animator, a Next.js 14 animation tool for rugby coaching.

Infrastructure is healthy — Supabase restored, Vercel active.

The current priority is Phase 1: fix mobile replay scaling in ShareViewer.

The core problem: ShareViewer forces users to pinch-zoom because the Konva canvas doesn't
scale correctly to the mobile viewport. The position:fixed inset:0 constraint must be
preserved.

Key files:
- src/features/animation/components/ShareViewer.tsx
- The useShareCanvasSize hook (find via grep)
- Canvas components shared across /app, /replay/[id], /share/[id] — test all three

Start with: /speckit.specify "fix mobile replay scaling in ShareViewer"

Roadmap reference: docs/authority/ROADMAP.md
Tooling reference: SPECKIT.md
Pre-push gate: npm run lint && npx tsc --noEmit
```

---

## 2026-02-27 — Canvas Pitch Render E2E Diagnostics (CLEO era)

*Agent-prompt style handoff. Full content: `docs/plans/HANDOFF-2026-02-27-e2e-test.md`*

Ran canvas-pitch-render E2E spec against production. Tests target `https://coaching-animator.vercel.app` by default.

---

## 2026-02-25 — Phase 4 Planning Session (CLEO era)

*Agent-prompt style handoff. Full content: `docs/plans/HANDOFF-2026-02-25-phase4.md`*

Set up Phase 4 (v2.3) planning for Club Personalization & Video Links features.
