# Next Session Kickoff — 2026-04-28

## Context

This session completed a full PM/Architect audit of coaching-animator and reconciled governance docs with code reality. The documents have been updated:
- `docs/authority/ROADMAP.md` — now v3.1, fully accurate, hygiene rules added
- `docs/authority/PRD-v2.0.md` — §5.13 (Save & Share Workflow As Built) inserted; §6.1 clarified; Amendment A2.1-9 logged
- `docs/issues/ISSUES.md` — FEATURE-001 closed with pulled-forward note

**Feature branch 010-auth-profile is complete but NOT YET merged to main.** Merge it first before starting new feature work.

---

## What to do in the next session

### Step 0 — Merge 010-auth-profile

Confirm `010-auth-profile` is clean and merge to main before creating a new feature branch.

```bash
npm run lint && npx tsc --noEmit
npm test -- --run
```

If both pass: merge or open PR.

---

### Step 1 — Decide the sequence

The user is leaning towards **2h → 2i → 2j** but is undecided. Before specifying anything, confirm the order. The phases are:

| Phase | Title | Core scope | Key issues |
|-------|-------|-----------|------------|
| **2h** | Workflow Clarity | Gallery↔/share/{id} nav, animation name on share view, breadcrumb | FLOW-001, FLOW-002, UX-008, EDITOR-002, GALLERY-002 |
| **2i** | Editor Workspace Remodel | Collapsible sidebar, Focus Mode, mobile drawer, capped progression panel | EDITOR-013, PLAYBACK-001 |
| **2j** | Snap-to-Grid | Toggle in toolbar, optional grid overlay, snap on drag-end | FEAT-010 |

**Recommendation**: Start with **2h** — it closes the core-loop MVP criterion (edit → save → share → player views → return to gallery) which is the one unmet success criterion that most blocks calling v1 "launch-ready."

---

### Step 2 — Answer the design questions

Before running `/speckit.specify`, answer these so the spec is sharp:

**For 2h (Workflow Clarity):**
- Is the UI scope just the gallery↔/share navigation + share-view header, or also the My-Gallery→/share/{id} flow?
- Should clicking a gallery card open `/share/{id}` directly, or open a preview modal first?
- Should the back-to-site link on `/share/{id}` go to `/gallery` or `/`?

**For 2i (Editor Workspace Remodel):**
- Collapsed sidebar state: icon-only (tools visible, labels hidden) or fully hidden with a chevron reveal?
- Focus Mode: hide sidebar + footer PlaybackControls, or sidebar only?
- Mobile drawer trigger: hamburger inside the canvas header bar, or a FAB?

**For 2j (Snap-to-Grid):**
- Grid resolution: pitch-marking-relative (5m/10m/22m zone intervals) or arbitrary pixel grid (e.g. 10px on canvas)?
- Grid overlay: always-visible when snap is on, or a separate toggle?
- Default state: snap OFF (power user opt-in) — confirmed, per audit.

---

### Step 3 — Run SpecKit on the first chosen phase

Once sequence and design decisions are confirmed:

```
/speckit.specify
```

SpecKit will prompt for the feature description. Use the relevant row from the ROADMAP v3.1 as the starting point:

**2h — Workflow Clarity:**
> Phase 2h of the Coaching Animator (ROADMAP v3.1). Resolve FLOW-001, FLOW-002, UX-008, EDITOR-002, GALLERY-002. Add gallery↔/share/{id} navigation and breadcrumb. Show animation name + back-to-site link on /share/{id}. Exit criterion: a coach can complete edit → save → share → player views → back to gallery without external help.

**2i — Editor Workspace Remodel:**
> Phase 2i of the Coaching Animator (ROADMAP v3.1). Collapsible left sidebar (chevron toggle, persisted in user prefs). Focus Mode (hides sidebar + progression panel + footer; canvas full-bleed). Cap progression panel max-height with internal scroll. Mobile drawer at <768 (replaces MobileWarning). Resolve EDITOR-013, PLAYBACK-001. Exit criteria: canvas reclaims ≥85% of viewport in Focus Mode; usable layout on mobile.

**2j — Snap-to-Grid:**
> Phase 2j of the Coaching Animator (ROADMAP v3.1). Pulled forward from Phase 4 / FEAT-010. Toggle in editor toolbar (off by default). Optional grid overlay. Snap on drag-end — insert at PlayerToken.handleDragEnd before onDragEnd callback. Pass snap and gridSize as props through EntityLayer → PlayerToken. Replay & Share viewers unaffected (they use interactive={false}). Exit criteria: snap on/off, grid overlay on/off; unit + e2e green; replay & share unaffected.

---

## Key files for immediate reference

### 2h — Workflow Clarity
- `src/app/gallery/GalleryClient.tsx` — gallery card click handler, entry point for /share/{id} nav
- `src/features/gallery/components/PublicAnimationCard.tsx` — gallery card component
- `src/app/share/[id]/page.tsx` — ShareViewer host; add animation name + back-to-site header
- `src/features/animation/components/ShareViewer.tsx` — ShareViewer component
- `docs/authority/PRD-v2.0.md §5.13` — save/share/visibility model (written this session)

### 2i — Editor Workspace Remodel
- `src/features/animation/components/Editor.tsx:262–450` — layout JSX
- `src/core/hooks/useEditorCanvasSize.ts:35–43` — ResizeObserver (will respond naturally to sidebar collapse)
- `src/features/animation/components/Canvas/Stage.tsx` — Stage sizing (reads from useEditorCanvasSize; no changes expected)

### 2j — Snap-to-Grid
- `src/features/animation/components/Canvas/PlayerToken.tsx:93–110` — handleDragEnd (snap insertion point at ~line 108)
- `src/features/animation/components/Canvas/EntityLayer.tsx:64–80, 159` — onEntityMove props threading
- `src/features/animation/components/Canvas/Stage.tsx` — may need grid overlay Konva layer

---

## Pre-push gate (run before every PR)

```bash
npm run lint && npx tsc --noEmit
npm test -- --run
```

---

## Audit debt — also track for Phase 3f

P1 violations identified in `docs/issues/audit-2026-04-24-score-15-20.md`:
- 15+ `rounded-*` instances in editor surfaces (profile.tsx, admin.tsx, and editor dialogs)
- 8 `bg-white` instances in ShareViewer, Editor, ReplayViewer, ConfirmDialog, EntityContextMenu, InlineEditor, SportSelector
- 5 auth pages missing `font-heading` (login, register, forgot-password, reset-password)

These are Phase 3f scope, but note them so they aren't accidentally introduced during 2h/2i/2j.
