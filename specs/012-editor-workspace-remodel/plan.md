# Implementation Plan: Editor Workspace Remodel (Phase 2i)

**Branch**: `012-editor-workspace-remodel` | **Date**: 2026-04-30 | **Spec**: `specs/012-editor-workspace-remodel/spec.md`

## Summary

Five layout and interaction improvements to the editor workspace, addressing canvas space, presentation mode, mobile usability, and floating remote controls:

1. **Collapsible sidebar** — zero-width collapse with chevron toggle on canvas edge; state persisted to localStorage
2. **Focus Mode** — overlay button hides sidebar + footer + progression panel; canvas fills ≥85% of viewport
3. **Expanded floating remote** (EDITOR-013) — adds add-frame, pace (0.5×/1×/2×), loop, and ghost to the existing draggable remote
4. **Progression panel max-height cap** — Add button always visible; pills scroll horizontally
5. **Mobile drawer** (replaces MobileWarning) — bottom sheet with EntityPalette + ProjectActions at <768px

Full research findings in `research.md`. No schema changes, no new API routes.

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
| Tier alignment (Guest/Auth/Public/Admin) | ✅ | Tier 0 and Tier 1 — layout changes apply equally; guest drawer shows same entity limits as desktop |
| No telemetry or analytics | ✅ | localStorage keys store UI state only (boolean, coordinates) — no server round-trip |
| Entity colors via EntityColors service | ✅ | No entity color logic involved |
| Shared canvas — tested on all 3 routes | ✅ | `/replay/[id]` and `/share/[id]` unaffected — changes are Editor.tsx-only. Stage.tsx untouched. |
| New data: privacy impact assessed | ✅ | No schema changes; no server-side persistence; localStorage is device-local |
| Supabase joins flattened before use | ✅ | No new queries |

No violations.

---

## Project Structure

### Files touched by this feature

```text
src/
└── features/
    └── animation/
        └── components/
            ├── Editor.tsx                         # Sidebar collapse, Focus Mode, mobile drawer integration, MobileWarning removal
            ├── Canvas/
            │   └── EditorFloatingRemote.tsx        # Expanded controls: add-frame, pace, loop, ghost
            ├── ProgressionPanel.tsx                # Max-height cap, Add button always visible
            └── MobileDrawer.tsx                   # NEW — bottom sheet for mobile <768px

tests/
├── unit/
│   └── components/
│       └── EditorFloatingRemote.test.tsx          # Cover expanded controls (new or updated)
└── e2e/
    └── editor.spec.ts                             # NEW — Focus Mode, sidebar collapse, mobile drawer
```

### Documentation (this feature)

```text
specs/012-editor-workspace-remodel/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 codebase research
├── quickstart.md        # Manual test guide
└── tasks.md             # Task list (/speckit.tasks output — NOT created here)
```

---

## Implementation Detail

### Change 1 — Collapsible Sidebar (FR-001 to FR-004)

**File**: `src/features/animation/components/Editor.tsx`

**New state** (add near existing mobile warning state, ~line 174):
```tsx
const SIDEBAR_STORAGE_KEY = 'editor-sidebar-collapsed';
const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
});

const toggleSidebar = useCallback(() => {
  setSidebarCollapsed(prev => {
    const next = !prev;
    try { localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next)); } catch { /* silent */ }
    return next;
  });
}, []);
```

**Sidebar JSX update** (current line ~265):
```tsx
{/* Sidebar — hidden in Focus Mode and on mobile */}
{!focusMode && viewportWidth >= 768 && (
  <aside className={`${sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-64'} border-r border-[var(--color-border)] bg-pitch-green flex flex-col transition-[width] duration-200`}>
    {/* ...existing sidebar content unchanged... */}
  </aside>
)}

{/* Sidebar collapse toggle — only on desktop, not in Focus Mode */}
{!focusMode && viewportWidth >= 768 && sidebarCollapsed && (
  <button
    onClick={toggleSidebar}
    className="fixed left-0 top-1/2 -translate-y-1/2 z-40 w-5 h-12 flex items-center justify-center bg-[var(--color-surface)] border border-[var(--color-border)] border-l-0 text-text-primary/60 hover:text-text-primary"
    aria-label="Expand sidebar"
  >
    <ChevronRight className="w-3 h-3" />
  </button>
)}
```

Add expand/collapse toggle inside the aside (at bottom of sidebar content, above the `</aside>`) when expanded:
```tsx
<button
  onClick={toggleSidebar}
  className="mt-auto px-3 py-2 flex items-center gap-1.5 text-xs text-text-primary/50 hover:text-text-primary border-t border-[var(--color-border)]"
  aria-label="Collapse sidebar"
>
  <ChevronLeft className="w-3 h-3" /> Collapse
</button>
```

**Canvas container**: No change — `flex-1` already fills freed space. ResizeObserver on `canvasContainerRef` auto-recalculates canvas size.

---

### Change 2 — Focus Mode (FR-005 to FR-008)

**File**: `src/features/animation/components/Editor.tsx`

**New state**:
```tsx
const [focusMode, setFocusMode] = useState(false);
const focusModeSnapshot = useRef<{ sidebarCollapsed: boolean } | null>(null);

const enterFocusMode = useCallback(() => {
  focusModeSnapshot.current = { sidebarCollapsed };
  setFocusMode(true);
}, [sidebarCollapsed]);

const exitFocusMode = useCallback(() => {
  if (focusModeSnapshot.current) {
    setSidebarCollapsed(focusModeSnapshot.current.sidebarCollapsed);
  }
  setFocusMode(false);
}, []);
```

**Focus Mode toggle button** (render outside the aside/main structure, as a fixed overlay):
```tsx
{/* Focus Mode toggle — always visible, top-right corner */}
<button
  onClick={focusMode ? exitFocusMode : enterFocusMode}
  className="fixed top-3 right-3 z-50 w-8 h-8 flex items-center justify-center bg-black/50 border border-white/20 text-white/70 hover:text-white transition-opacity duration-200"
  aria-label={focusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
  title={focusMode ? 'Exit Focus Mode' : 'Focus Mode'}
>
  {focusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
</button>
```

**Panels hidden in Focus Mode** — wrap each panel with the condition:
- Aside (sidebar): `{!focusMode && viewportWidth >= 768 && ...}` (same condition as above)
- Footer: `{!focusMode && <ErrorBoundary fallbackTitle="Timeline Error"><footer ...>`
- ProgressionPanel: `{!focusMode && showProgressionPanel && <ProgressionPanel ...>}`

**Imports to add**: `Minimize2, Maximize2, ChevronLeft, ChevronRight` from `lucide-react`.

---

### Change 3 — Expanded Floating Remote (FR-015 to FR-017, EDITOR-013)

**File**: `src/features/animation/components/Canvas/EditorFloatingRemote.tsx`

**New prop**:
```tsx
interface EditorFloatingRemoteProps {
  onAddFrame: () => void;
}
```

**New constants**:
```tsx
const PILL_WIDTH = 176;
const PILL_HEIGHT = 44;
const EXPANDED_HEIGHT = 88;  // two rows
const REMOTE_EXPAND_KEY = 'editor-remote-expanded';
```

**New state**:
```tsx
const [isExpanded, setIsExpanded] = useState<boolean>(() => {
  try { return localStorage.getItem(REMOTE_EXPAND_KEY) === 'true'; } catch { return false; }
});
```

**Additional store selectors**:
```tsx
const playbackSpeed = useProjectStore(s => s.playbackSpeed);
const loopPlayback = useProjectStore(s => s.loopPlayback);
const showGhosts = useUIStore(s => s.showGhosts);
const setPlaybackSpeed = useProjectStore.getState().setPlaybackSpeed;
const toggleLoop = useProjectStore.getState().toggleLoop;
const toggleGhosts = useUIStore.getState().toggleGhosts;
```

**Update viewport clamping** — use `isExpanded ? EXPANDED_HEIGHT : PILL_HEIGHT` in all `maxY` calculations.

**Updated JSX** — expand toggle added to end of first row:
```tsx
{/* EXPAND TOGGLE */}
<button
  onClick={() => {
    const next = !isExpanded;
    setIsExpanded(next);
    try { localStorage.setItem(REMOTE_EXPAND_KEY, String(next)); } catch {}
  }}
  className="w-7 h-11 flex items-center justify-center text-white/50 hover:text-white"
  aria-label={isExpanded ? 'Collapse remote' : 'Expand remote'}
>
  {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
</button>
```

**Second row** (shown when `isExpanded`):
```tsx
{isExpanded && (
  <div className="flex items-center w-full border-t border-white/10">
    {/* ADD FRAME */}
    <button onClick={onAddFrame} className="flex-1 h-11 flex items-center justify-center text-white text-xs gap-1">
      <Plus className="w-3 h-3" /> Frame
    </button>
    {/* PACE */}
    {([0.5, 1, 2] as const).map(speed => (
      <button
        key={speed}
        onClick={() => setPlaybackSpeed(speed)}
        className={`flex-1 h-11 flex items-center justify-center text-xs ${playbackSpeed === speed ? 'text-white font-bold' : 'text-white/50 hover:text-white'}`}
        aria-label={`${speed}× speed`}
      >
        {speed}×
      </button>
    ))}
    {/* LOOP */}
    <button
      onClick={toggleLoop}
      className={`flex-1 h-11 flex items-center justify-center ${loopPlayback ? 'text-white' : 'text-white/40 hover:text-white'}`}
      aria-label="Toggle loop"
    >
      <Repeat className="w-3 h-3" />
    </button>
    {/* GHOST */}
    <button
      onClick={toggleGhosts}
      className={`flex-1 h-11 flex items-center justify-center ${showGhosts ? 'text-white' : 'text-white/40 hover:text-white'}`}
      aria-label="Toggle ghost"
    >
      <Ghost className="w-3 h-3" />
    </button>
  </div>
)}
```

**Update outer div height**:
```tsx
style={{
  ...existing...
  height: isExpanded ? EXPANDED_HEIGHT : PILL_HEIGHT,
}}
```

**Editor.tsx** — pass `onAddFrame` prop:
```tsx
{project && <EditorFloatingRemote onAddFrame={handleAddFrame} />}
```

**Imports to add to EditorFloatingRemote**: `ChevronUp, ChevronDown, Plus, Repeat, Ghost` from `lucide-react`; `useUIStore` from `@/core/stores/uiStore`.

---

### Change 4 — Progression Panel Max-Height Cap (FR-009, FR-010)

**File**: `src/features/animation/components/ProgressionPanel.tsx`

Restructure the outer div to keep Add button always visible outside the horizontal scroll area:

```tsx
<div className="flex items-center gap-0 px-3 py-2 bg-[var(--color-surface)] border-b border-[var(--color-border)] max-h-16 overflow-hidden">
  
  {/* Label */}
  <span className="text-xs text-text-primary/50 shrink-0 mr-2">Progressions:</span>

  {/* Scrollable pills area */}
  <div className="flex items-center gap-2 overflow-x-auto flex-1 min-w-0">
    {/* Base pill */}
    <button ...>Base</button>

    {/* Sortable pills */}
    <DndContext ...>
      <SortableContext ...>
        {progressions.map(...)}
      </SortableContext>
    </DndContext>
  </div>

  {/* Add button — always visible, outside scroll */}
  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
    <button onClick={onAddProgression} disabled={!canAdd || isAdding} ...>
      <Plus className="w-3 h-3" />
      {isAdding ? 'Adding…' : 'Add'}
    </button>
    {!canAdd && <span className="text-xs text-text-primary/30 shrink-0">Max 5</span>}
  </div>
</div>
```

---

### Change 5 — Mobile Drawer (FR-011 to FR-014)

**New file**: `src/features/animation/components/MobileDrawer.tsx`

```tsx
'use client';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  // Entity palette props
  onAddAttackPlayer: () => void;
  onAddDefensePlayer: () => void;
  onAddBall: () => void;
  onAddCone: () => void;
  onAddTackleShield: () => void;
  onAddTackleBag: () => void;
  drawingMode: DrawingMode;
  onDrawingModeChange: (mode: DrawingMode) => void;
  // Project actions props
  isAuthenticated: boolean;
  onSaveToCloud?: () => void;
}
```

Structure:
- Fixed overlay backdrop (`position:fixed; inset:0; z-index:40`) when open — tap to close
- Drawer panel: `position:fixed; bottom:0; left:0; right:0; z-index:50; max-h-[70vh]; overflow-y-auto`
- Handle bar at top: 48px tall, contains a grip icon and "Close" button
- Body: `<ProjectActions ...>` then `<EntityPalette ...>`
- Slide animation: `translate-y-0` open, `translate-y-full` closed — `transition-transform duration-200`

**Editor.tsx** — integration:

Remove:
- `mobileWarningDismissed` state
- `setMobileWarningDismissed`
- The MobileWarning JSX block (lines 309–321)
- Simplify the viewport width tracking to a boolean `isMobile = viewportWidth < 768` (keep existing listener)

Add:
```tsx
const [drawerOpen, setDrawerOpen] = useState(false);
```

Replace MobileWarning JSX with drawer handle (visible only on mobile):
```tsx
{/* Mobile drawer handle — visible at bottom of canvas area on mobile */}
{isMobile && (
  <button
    onClick={() => setDrawerOpen(true)}
    className="fixed bottom-0 left-0 right-0 z-40 h-10 flex items-center justify-center bg-[var(--color-surface)] border-t border-[var(--color-border)] text-text-primary/60 hover:text-text-primary text-xs gap-1"
    aria-label="Open tools drawer"
  >
    <GripVertical className="w-4 h-4 rotate-90" /> Tools
  </button>
)}

<MobileDrawer
  open={drawerOpen && isMobile}
  onClose={() => setDrawerOpen(false)}
  onAddAttackPlayer={handleAddAttackPlayer}
  onAddDefensePlayer={handleAddDefensePlayer}
  onAddBall={handleAddBall}
  onAddCone={handleAddCone}
  onAddTackleShield={handleAddTackleShield}
  onAddTackleBag={handleAddTackleBag}
  drawingMode={drawingMode}
  onDrawingModeChange={setDrawingMode}
  isAuthenticated={isAuthenticated}
  onSaveToCloud={onSaveToCloud}
/>
```

Hide sidebar and footer on mobile (already handled in Change 1 condition: `!focusMode && viewportWidth >= 768`).

---

## No Data Model Changes

No schema changes, no new API routes, no new Zod schemas. Skip data-model.md.

---

## Complexity Tracking

No constitutional violations.

---

## Implementation Order (suggested)

1. Expanded FloatingRemote (self-contained, adds `onAddFrame` prop)
2. ProgressionPanel max-height cap (self-contained)
3. MobileDrawer new component
4. Editor.tsx — integrate all: sidebar collapse, Focus Mode, mobile drawer, remove MobileWarning
5. Tests (unit for FloatingRemote, E2E for all four user stories)
