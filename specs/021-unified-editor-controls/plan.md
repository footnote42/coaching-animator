# Implementation Plan: Unified Editor Controls

**Branch**: `021-unified-editor-controls` | **Date**: 2026-05-15 | **Spec**: `specs/021-unified-editor-controls/spec.md`

## Summary

Replace the `EditorFloatingRemote` component with a permanently visible right-side controls panel in the editor. Move all timeline controls (playback, frame management, speed, loop, ghost mode) out of the scroll-dependent footer and the ineffective floating remote, and into a fixed-width right sidebar that mirrors the existing left sidebar pattern. Extend `MobileDrawer` with a timeline tab to give mobile users the same access. Remove `EditorFloatingRemote` entirely.

---

## Technical Context

**Language/Version**: TypeScript 5 · Node 22
**Framework**: Next.js 14 App Router (SSR + API Routes)
**Canvas**: Konva (react-konva) — shared across `/app`, `/replay/[id]`, `/share/[id]`
**State**: Zustand stores in `src/core/stores/`
**Backend**: Supabase (PostgreSQL + Auth + RLS) via `src/lib/supabase/`
**Styling**: Tailwind CSS + Radix UI primitives
**Testing**: Vitest (unit) · Playwright (E2E)
**Deploy**: Vercel (CI via GitHub Actions)
**Performance Goals**: Canvas interactions <100ms; API responses <500ms p95
**Constraints**: No telemetry; no third-party analytics; RLS on all DB tables; entity colors via EntityColors service only

---

## Constitutional Compliance Check

| Check | Status | Notes |
|-------|--------|-------|
| Tier alignment (Guest/Auth/Public/Admin) | [x] | Tier 1 (Auth) for editor; controls not visible to guests |
| No telemetry or analytics | [x] | UI-only change; no events tracked |
| Entity colors via EntityColors service | [x] | N/A — no entity color rendering in controls panel |
| Shared canvas — tested on all 3 routes | [x] | `FloatingRemote` (ShareViewer) is NOT changed; `EditorFloatingRemote` removal affects `/app` only — confirmed |
| New data: privacy impact assessed | [x] | No new data. Position preference stored in `localStorage` (existing behavior) may be removed |
| Supabase joins flattened before use | [x] | N/A — no new queries |

---

## Project Structure

### Documentation (this feature)

```text
specs/021-unified-editor-controls/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 codebase research (below)
├── quickstart.md        # Phase 1 manual test guide
└── tasks.md             # Task list (/speckit.tasks output)
```

### Source Code (files changed)

```text
src/
└── features/animation/components/
    ├── Editor.tsx                          # MODIFIED — remove EditorFloatingRemote, add TimelinePanel, restructure footer
    ├── TimelinePanel.tsx                   # NEW — right-side controls panel
    ├── MobileDrawer.tsx                    # MODIFIED — add timeline tab/section
    └── Canvas/
        └── EditorFloatingRemote.tsx        # DELETED — deprecated
```

---

## Phase 0: Research

### R-001: Component Inventory

**Two `FloatingRemote` components exist — only one is deprecated:**

| Component | File | Used By | Action |
|-----------|------|---------|--------|
| `FloatingRemote` | `Canvas/FloatingRemote.tsx` | `ShareViewer.tsx` only | **Keep** — serves `/share/[id]` playback |
| `EditorFloatingRemote` | `Canvas/EditorFloatingRemote.tsx` | `Editor.tsx` only | **Delete** — this is the deprecated component |

**Decision**: The spec's reference to "deprecate FloatingRemote" refers to the **editor** floating remote (`EditorFloatingRemote`). `FloatingRemote` in the share viewer is unrelated, effective, and must not be touched.

### R-002: Current Editor Layout (desktop)

```
<div className="flex h-screen relative">
  <aside>  ← left sidebar (collapsible, hidden on mobile)
    ProjectActions + EntityPalette + EntityProperties
  </aside>
  <main className="flex-1 flex flex-col">
    <ProgressionPanel />   (conditional)
    <div id="canvas-container" className="flex-1 min-h-0 overflow-hidden">
      <Stage> ... </Stage>
    </div>
    <footer>               (!focusMode && !isMobile only)
      <PlaybackControls />
      <FrameStrip />
    </footer>
  </main>
  <EditorFloatingRemote /> ← position:fixed overlay (always visible when project loaded)
  <MobileDrawer />         ← mobile overlay (entity palette + project actions only; NO timeline)
</div>
```

**Root cause of EDITOR-013**: On mobile (`< 768px`), the footer is hidden via `!isMobile` and `MobileDrawer` contains NO timeline controls (no add frame, speed, loop, ghost). Users can only use the `EditorFloatingRemote` pill — which is small, hard to tap at pitch, and requires knowing it exists. On short desktop viewports, the footer can also scroll off-screen because canvas minimum content size may exceed available height.

### R-003: Design Decision — Right-Side Panel

**Chosen approach: (a) Right-side panel mirroring the left sidebar**

Rationale:
- The floating remote approach (b) already failed — `EditorFloatingRemote` IS a floating remote, and it was declared "not effective" by the user
- A right-side panel integrates permanently into the layout at fixed width — no scroll, no drag, always predictable location
- Mirrors the left sidebar pattern already present, matching the "coaching clipboard" aesthetic
- Eliminates footer entirely (controls are no longer below the fold)
- On mobile, timeline controls move into the existing `MobileDrawer` (adding a tabs/section)

Alternatives rejected:
- **New floating remote design**: The user explicitly ruled out iterating on the floating remote
- **Embedding controls above canvas**: Would reduce canvas height unnecessarily

### R-004: Controls to Migrate

Controls currently in `EditorFloatingRemote` (to migrate to `TimelinePanel`):
- Play / Pause
- Previous frame / Next frame
- Frame counter (current/total)
- Add frame
- Speed selector (0.5×, 1×, 2×)
- Loop toggle
- Ghost mode toggle
- Share button (only when `project.id` exists)

Controls currently in `PlaybackControls` footer (to unify into `TimelinePanel`):
- Play / Pause / Reset
- Previous frame / Next frame / Frame counter
- Speed selector (0.5×, 1×, 2×)
- Loop toggle
- Ghost mode toggle

Controls currently in `FrameStrip` footer:
- Frame thumbnail strip with add/remove/duplicate/duration per frame

**Decision**: `TimelinePanel` absorbs ALL of the above. The footer (`PlaybackControls` + `FrameStrip`) is removed for desktop. The `FrameStrip` moves inside `TimelinePanel` (vertical layout, scrollable within the panel). `PlaybackControls` is replaced by inline controls inside `TimelinePanel`.

### R-005: Mobile Strategy

`MobileDrawer` currently shows only entity palette and project actions (no timeline). Adding a timeline section to `MobileDrawer`:
- Add a visual section divider and a "Timeline" section inside the drawer
- Include: Play/Pause, Prev/Next Frame, Add Frame, Speed, Loop, Ghost
- `FrameStrip` on mobile is already excluded per FEAT-012 (pending issue) — consistent to leave it out of mobile drawer for now

### R-006: EditorFloatingRemote localStorage Key

`EditorFloatingRemote` uses two `localStorage` keys:
- `editor-remote-pos` — position
- `editor-remote-expanded` — expanded state

Both can be abandoned when the component is deleted. No migration needed (ephemeral preferences).

### R-007: Focus Mode Impact

Current focus mode collapses the left sidebar and hides the footer/mobile drawer. The right-side `TimelinePanel` should also be hidden in focus mode (consistent with left sidebar). `EditorFloatingRemote` was NOT hidden in focus mode — the new design should follow the sidebar pattern (hidden in focus mode, not floating).

A separate "focus mode" overlay can optionally show minimal play/pause (out of scope for this feature — note in assumptions).

---

## Phase 1: Design

### TimelinePanel Component

**File**: `src/features/animation/components/TimelinePanel.tsx`

**What it renders**:
```
[Timeline header — "Timeline" label + collapse toggle (optional)]
[Playback row: Reset | Prev | Play/Pause | Next | FrameCounter]
[Speed row: 0.5× | 1× | 2× | Loop | Ghost | Share (if saved)]
[Frame strip: scrollable list of FrameThumbnail items + Add button]
```

**Layout**: Vertical flex column, fixed width (`w-64` matching left sidebar), full editor height, right edge of the `flex` layout. `bg-tactics-white border-l border-border`.

**State**: Reads from `useProjectStore` and `useUIStore` directly (same pattern as `EditorFloatingRemote`). No new props required since it reads from stores.

**Visibility**: Hidden when `focusMode === true` OR `isMobile === true` (replicate left sidebar behavior exactly).

### MobileDrawer Timeline Section

**File**: `src/features/animation/components/MobileDrawer.tsx`

**Addition**: New props:
```typescript
// Added to MobileDrawerProps:
isPlaying: boolean;
currentFrameIndex: number;
totalFrames: number;
playbackSpeed: PlaybackSpeed;
loopEnabled: boolean;
ghostEnabled: boolean;
onPlay: () => void;
onPause: () => void;
onPrevFrame: () => void;
onNextFrame: () => void;
onAddFrame: () => void;
onSpeedChange: (speed: PlaybackSpeed) => void;
onLoopToggle: () => void;
onGhostToggle: () => void;
```

Or, simpler: `MobileDrawer` reads from `useProjectStore` / `useUIStore` directly (matching `TimelinePanel` pattern) — avoids prop drilling. **Preferred approach**: read from stores internally.

**New section in drawer** (added below the existing entity palette):
```
--- Timeline ---
[Prev | Play/Pause | Next | Frame counter]
[+ Add Frame | 0.5× | 1× | 2× | Loop | Ghost]
```

### Editor.tsx Structural Changes

1. **Remove**: `import { EditorFloatingRemote }` and the `{project && <EditorFloatingRemote />}` render
2. **Remove**: The `<footer>` block (PlaybackControls + FrameStrip) — absorbed into TimelinePanel
3. **Add**: `import { TimelinePanel }` and render it as a right-side sibling to `<main>`:
   ```jsx
   <div className="flex h-screen relative">
     <aside>...</aside>       {/* left sidebar */}
     <main className="flex-1 flex flex-col">...</main>
     {!focusMode && !isMobile && <TimelinePanel />}  {/* NEW right panel */}
   </div>
   ```
4. **Update**: MobileDrawer to include timeline controls (either via props or store reads)

### Shared canvas safety check

`FrameStrip` and `PlaybackControls` are currently in `src/features/animation/components/Timeline/`. They are React components rendered in the editor DOM, **not** inside the Konva canvas. Removing them from the footer and rendering them inside `TimelinePanel` has zero impact on `/replay/[id]` or `/share/[id]`. Those routes do not import or render either component.

`FloatingRemote` in `ShareViewer` is completely isolated — no changes.

---

## Complexity Tracking

No constitutional violations.

---
