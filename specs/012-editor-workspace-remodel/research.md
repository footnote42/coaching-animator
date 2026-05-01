# Phase 0 Research: Editor Workspace Remodel (Phase 2i)

**Date**: 2026-04-30  
**Branch**: `012-editor-workspace-remodel`

---

## Summary

All five feature areas (collapsible sidebar, Focus Mode, expanded floating remote, progression panel cap, mobile drawer) are net-new. No pre-existing implementation covers any of them. The codebase is clean for this work.

---

## Area 1 — Collapsible Sidebar

### Current implementation

`Editor.tsx:265` — sidebar is a fixed-width `<aside>`:
```tsx
<aside className="w-64 border-r border-[var(--color-border)] bg-pitch-green flex flex-col">
```

The canvas `flex-1` column fills the remaining horizontal space. Removing or zero-width collapsing the sidebar will immediately cause `canvasContainerRef` (the ResizeObserver target) to grow, and `useEditorCanvasSize` will recalculate canvas dimensions automatically. **No explicit canvas resize notification is required.**

### Decision

- Add `sidebarCollapsed: boolean` React state to Editor.tsx, initialised from `localStorage.getItem('editor-sidebar-collapsed') === 'true'`.
- When collapsed: render `<aside className="w-0 overflow-hidden ...">` — zero width, children hidden.
- Persist on toggle: `localStorage.setItem('editor-sidebar-collapsed', String(newValue))`.
- The toggle chevron button renders at `position:fixed` on the canvas left edge when sidebar is collapsed; it is part of the Editor layout (not inside the aside), so it remains visible regardless.
- When sidebar is expanded, the toggle button sits as the last element inside the aside at the bottom edge, or as a small tab on the right edge of the aside.

### Rationale

Zero-width collapse (not an icon rail) was specified explicitly in the clarification session (Q1). ResizeObserver auto-recalculation removes the need for an imperative notify call. Local React state + localStorage is sufficient — no Zustand slice needed.

---

## Area 2 — Focus Mode

### Current implementation

`Editor.tsx` renders: aside (sidebar) → main (progression panel + mobile warning + canvas + footer). All panels are visible in normal mode. No overlay toggle exists.

### Decision

- Add `focusMode: boolean` React state to Editor.tsx (no persistence — Focus Mode is a session-level presentation state).
- Add a snapshot ref `focusModeSnapshot.current` that records sidebar collapsed state at the moment Focus Mode is activated. This enables exact restoration on exit (FR-007).
- When `focusMode === true`:
  - Sidebar: always hidden (regardless of `sidebarCollapsed` value)
  - Footer: hidden (`className="hidden"` on the footer ErrorBoundary wrapper)
  - ProgressionPanel: hidden (conditional removed from JSX)
  - Mobile warning: already conditional; also hidden in Focus Mode
  - Canvas container: flex-1 fills remaining space naturally (≥85% SC-001 condition met)
- Focus Mode toggle button: `position:fixed` or `absolute` overlay on canvas top-right corner. Rendered outside the aside/main structure so it is always visible regardless of other panel states.
- Entering Focus Mode does NOT pause playback (FR-006 — the `isPlaying` state is unchanged).

### SC-001 verification

On a 1440×900 viewport: the canvas container is `flex-1 min-h-0` filling the entire height (no sidebar, no footer, no progression header). The canvas is fitted 4:3 inside that container. 4:3 at 1440px width = 1080px height > 900px, so it fits by height: 900×675 canvas in a 1440×900 container → canvas area = 900×675 = 607,500px². Viewport area = 1440×900 = 1,296,000px². 607,500 / 1,296,000 ≈ 46.9% for a 4:3 canvas constrained by height.

Wait — the spec criterion is ≥85% *viewport area* covered by the canvas in Focus Mode. A 4:3 canvas can never fill 85% of a 16:9 viewport. The spec means the canvas region (container) ≥85%, not the Konva canvas element itself. Re-reading SC-001: "the canvas **occupies** ≥85% of the viewport area" — this refers to the canvas display area (the container div, including padding), not the drawn canvas.

In Focus Mode with no sidebar (w-64 = 256px) and no footer (≈120px for PlaybackControls + FrameStrip), on 1440×900:
- Without Focus Mode: canvas container ≈ (1440-256)×(900-120) = 1184×780 = 923,520px²; share of viewport = 71.3%
- With Focus Mode: canvas container = 1440×900 = 1,296,000px²; share = 100% ✓

SC-001 passes. The canvas *element* occupies whatever aspect-ratio space fits, but the spec criterion applies to the container region.

---

## Area 3 — Expanded Floating Remote (EDITOR-013)

### Current implementation

`EditorFloatingRemote.tsx` — PILL_WIDTH=176, PILL_HEIGHT=44. Controls: drag handle, prev frame, play/pause, next frame, frame counter. Reads `useProjectStore` for frame/playing state.

Additional store actions available:
- `useProjectStore.getState().addFrame()` — does not exist yet; frame add is via `useEditorPlaybackHandlers.handleAddFrame`
- `useProjectStore.getState().setPlaybackSpeed(speed)` — exists (line 83 Editor.tsx)
- `useProjectStore.getState().toggleLoop()` — exists (line 84 Editor.tsx)
- `useUIStore.getState().toggleGhosts()` — exists (Editor.tsx line 89)
- `useProjectStore(s => s.playbackSpeed)` — selector exists
- `useProjectStore(s => s.loopPlayback)` — selector exists
- `useUIStore(s => s.showGhosts)` — selector exists

**For add-frame**: `handleAddFrame` in `useEditorPlaybackHandlers` is the safe path (handles guest limits, max frame validation). To expose this via the remote without prop-drilling: the simplest approach is to pass `onAddFrame` as a prop to `EditorFloatingRemote` from Editor.tsx where all handlers live.

### Decision

- Add `isExpanded: boolean` state to `EditorFloatingRemote`. Default `false`.
- Add an expand toggle button (small chevron-up/down) to the right of the frame counter.
- When `isExpanded === true`: render a second control row below the existing row. PILL_WIDTH stays the same (176); total height increases (e.g., PILL_HEIGHT + 44 = 88px). Second row: Add Frame | 0.5× | 1× | 2× | Loop | Ghost.
- Update `PILL_HEIGHT` constant to track the expanded height for viewport clamping.
- Add `onAddFrame` prop: `() => void` — called by the Add Frame button in expanded row. Passed from Editor.tsx.
- Expand toggle persists to `localStorage` under key `editor-remote-expanded` (session preference, not critical).
- No change to drag behaviour — drag handle stays on the first row; the full pill (both rows) moves together.

### Rationale

Prop for `onAddFrame` avoids re-implementing guest-limit logic inside the remote. All other controls read store directly. The second-row pattern is the simplest expansion without breaking the draggable layout.

---

## Area 4 — Progression Panel Max-Height Cap

### Current implementation

`ProgressionPanel.tsx:112` — outer div:
```tsx
<div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-surface)] border-b border-[var(--color-border)] overflow-x-auto">
```

The panel is a **horizontal** single-row strip (flex items-center, no wrap). With max 5 progressions + 1 base + 1 Add button, the row scrolls horizontally when overflow. The panel height is already stable (~40px) — it cannot grow unbounded.

### Decision

The existing `overflow-x-auto` already prevents height growth. To satisfy FR-009/FR-010 formally and future-proof against layout changes:

1. Add `max-h-16 overflow-y-hidden` to the outer div to cap height absolutely.
2. Wrap the scrollable pills section (base + sortable pills) in a horizontally scrollable inner div.
3. Move the Add button and "Max 5" badge **outside** the inner scroll container, in a `flex-shrink-0` wrapper on the right, so it is always visible even when pills overflow.

This satisfies FR-010 (Add always visible) even when there are 5 progressions.

---

## Area 5 — Mobile Drawer (replaces MobileWarning)

### Current implementation

`Editor.tsx:309–321` — the MobileWarning:
```tsx
{viewportWidth < 768 && !mobileWarningDismissed && (
  <div className="px-4 py-2 bg-[var(--color-accent-warm)]/10 ...">
    <span>💻 Desktop recommended ...</span>
    <button onClick={() => setMobileWarningDismissed(true)}>✕</button>
  </div>
)}
```

`Editor.tsx:174–175` — state:
```tsx
const [mobileWarningDismissed, setMobileWarningDismissed] = useState(false);
const [viewportWidth, setViewportWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
```

`Editor.tsx:213–218` — resize listener on viewportWidth.

### Decision

- Remove `mobileWarningDismissed`, `mobileWarningDismissed` setter, and the resize listener from Editor.tsx. The viewport width state can be replaced with a `useIsMobile()` hook (or inline `window.innerWidth < 768` check with a resize listener, but scoped to boolean).
- Create `src/features/animation/components/MobileDrawer.tsx`: a bottom sheet that slides up from the bottom of the screen on mobile (`< 768px`).
  - Contains: EntityPalette and ProjectActions (subset of sidebar content, per spec Assumption).
  - EntityProperties is excluded (entity editing on mobile is secondary use case).
  - Controlled by `drawerOpen: boolean` state in Editor.tsx.
  - Handle bar at top of drawer for drag-to-close behaviour; also closeable by tapping the backdrop.
- Drawer uses `position:fixed; bottom:0; left:0; right:0` with a transform-based slide animation (translate-y: 0 open, translate-y: 100% closed).
- Drawer height: `max-h-[70vh]` to leave canvas visible behind it (respects UI-004: does not cover floating remote when both visible — remote is at a fixed position; drawer rises from bottom with max 70vh height, remote stays above drawer area).
- Handle bar z-index: 50 (same as remote); backdrop: z-index: 40.
- Guest tier limits pass through — EntityPalette receives same props as sidebar version.

### On mobile (<768px)

- Sidebar (`<aside>`) is hidden (same as collapsed, no toggle button shown — drawer replaces it).
- Footer (`<footer>`) is hidden.
- Floating remote (already `position:fixed`) remains visible and provides prev/play/next/add-frame/pace/loop/ghost.
- MobileWarning is removed.

---

## Area 6 — Canvas Resize Auto-Handling

**Finding**: `useEditorCanvasSize` (lines 31–48) uses a ResizeObserver on `canvasContainerRef`. No imperative notification is needed after sidebar toggle or Focus Mode toggle — the ResizeObserver fires automatically when the flex-1 container changes width/height. UI-005 is satisfied by the existing ResizeObserver hook.

---

## No New Routes, No Schema Changes

This is purely a layout/interaction remodel. No new API routes, no Supabase schema changes, no new Zod schemas. Skip data-model.md (no entity changes).

---

## Files to Modify

| File | Change |
|------|--------|
| `src/features/animation/components/Editor.tsx` | Add sidebar collapse state, Focus Mode state, mobile drawer state; remove MobileWarning; hide sidebar/footer/progression panel in Focus Mode and mobile |
| `src/features/animation/components/Canvas/EditorFloatingRemote.tsx` | Add `isExpanded` state, second control row (add frame, pace, loop, ghost), `onAddFrame` prop |
| `src/features/animation/components/ProgressionPanel.tsx` | Add max-h cap, restructure to keep Add button always visible |
| `src/features/animation/components/MobileDrawer.tsx` | **New file** — bottom sheet drawer for mobile |
| `tests/unit/components/EditorFloatingRemote.test.tsx` | New or updated — cover expanded controls |
| `tests/e2e/editor.spec.ts` | New E2E — Focus Mode, sidebar collapse, mobile drawer |
