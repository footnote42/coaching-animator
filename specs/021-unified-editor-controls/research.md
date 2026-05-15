# Research: Unified Editor Controls

**Feature**: `021-unified-editor-controls`
**Date**: 2026-05-15

---

## Key Findings

### Finding 1: Two floating remotes — only one is deprecated

There are two `FloatingRemote`-style components in the codebase:

| Component | Path | Consumer | Status |
|-----------|------|----------|--------|
| `FloatingRemote` | `Canvas/FloatingRemote.tsx` | `ShareViewer.tsx` | **Keep** |
| `EditorFloatingRemote` | `Canvas/EditorFloatingRemote.tsx` | `Editor.tsx` | **Delete** |

The spec's intent is to deprecate the **editor** floating remote (`EditorFloatingRemote`). The `FloatingRemote` used in `ShareViewer` is healthy and must not be touched.

### Finding 2: Mobile controls gap is the real severity driver

The footer (`PlaybackControls` + `FrameStrip`) is rendered only when `!focusMode && !isMobile`. On mobile (`< 768px`), the only access to timeline controls is:
- `EditorFloatingRemote` — a small draggable pill that reads from stores
- `MobileDrawer` — but it only contains entity palette and project actions; **zero timeline controls**

This means mobile users cannot add frames, change speed, or toggle loop without knowing about the floating remote. This is the core usability gap.

### Finding 3: EditorFloatingRemote already has all controls

`EditorFloatingRemote` contains: play/pause, prev/next, frame counter, add frame, speed (0.5/1/2×), loop, ghost mode, share. It reads from Zustand stores directly (no props). Position is persisted in `localStorage` under keys `editor-remote-pos` and `editor-remote-expanded`.

The component is fully functional but is described as "not effective" — it is too small, mobile-hostile, and its location is unpredictable (draggable).

### Finding 4: Footer should survive its removal safely

`PlaybackControls` and `FrameStrip` are pure React components in `src/features/animation/components/Timeline/`. They are not imported by any Canvas/ components, `ShareViewer`, or `ReplayViewer`. Removing the footer from `Editor.tsx` and moving these into `TimelinePanel` has no cross-route risk.

### Finding 5: Right-side panel is the correct approach

The left sidebar is a collapsible `aside` at fixed width (`w-64`) inside a `flex h-screen` layout. A right-side `TimelinePanel` follows the same pattern — adding a `!focusMode && !isMobile`-gated `aside` on the right side. This integrates naturally into the existing flex layout, avoids any `position: fixed` complexity, and is always in viewport without scrolling.

### Finding 6: Focus mode behavior

`enterFocusMode()` collapses the left sidebar (`setSidebarCollapsed(true)`). The `TimelinePanel` should also be hidden in focus mode (consistent behavior). `EditorFloatingRemote` currently persists in focus mode — the new design should not. Coaches in focus mode want only the canvas.

### Finding 7: No backend or schema changes

This is a pure frontend refactor. No Supabase schema changes, no API changes, no new data persistence (other than removing two `localStorage` keys on cleanup).

---

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Which floating remote to remove | `EditorFloatingRemote` only | `FloatingRemote` serves ShareViewer and is effective |
| Layout approach | Right-side panel (option a) | Floating remote approach already failed; fixed panel is always predictable |
| Footer | Remove (absorbed into TimelinePanel) | Eliminates scroll risk permanently; single control surface |
| Mobile | Timeline section added to MobileDrawer | Consistent with existing mobile pattern |
| Focus mode | Hide TimelinePanel | Consistent with left sidebar collapse behavior |
| FrameStrip on mobile | Exclude (no change) | Consistent with existing FEAT-012 scope |
