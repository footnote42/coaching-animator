# Implementation Plan: Snap-to-Grid

**Branch**: `013-snap-to-grid` | **Date**: 2026-05-01 | **Spec**: `specs/013-snap-to-grid/spec.md`

## Summary

Add optional snap-to-grid to the editor canvas. When enabled, entity drag-end positions are rounded to the nearest intersection of a 16×12 logical grid drawn over the pitch. A toggle in the normal editor toolbar controls snap state (hidden in Focus Mode, state persists across modes). A dedicated Konva layer renders the grid overlay when snap is active.

---

## Technical Context

**Language/Version**: TypeScript 5 · Node 22
**Framework**: Next.js 14 App Router (SSR + API Routes)
**Canvas**: Konva (react-konva) — shared across `/app`, `/replay/[id]`, `/share/[id]`
**State**: Zustand stores in `src/core/stores/` — snap state goes in `uiStore.ts` alongside `showGhosts`
**Backend**: Supabase (PostgreSQL + Auth + RLS) — no schema changes required
**Styling**: Tailwind CSS + Radix UI primitives
**Testing**: Vitest (unit) · Playwright (E2E)
**Deploy**: Vercel (CI via GitHub Actions)
**Performance Goals**: Canvas interactions <100ms; snap calculation is O(1) arithmetic — no impact
**Constraints**: No telemetry; no third-party analytics; entity colors via EntityColors service only; grid color via design token only

---

## Constitutional Compliance Check

| Check | Status | Notes |
|-------|--------|-------|
| Tier alignment (Guest/Auth/Public/Admin) | PASS | Editor is Tier 1 (Auth); snap is a UI preference with no DB persistence |
| No telemetry or analytics | PASS | No new tracking; snap state is local to browser session |
| Entity colors via EntityColors service | PASS | Grid overlay uses a design token color, not entity color logic |
| Shared canvas — tested on all 3 routes | REQUIRED | Grid layer and snap only render in editor; replay/share are unaffected but must be regression-tested |
| New data: privacy impact assessed | PASS | No new data stored; snap state is session-only in uiStore |
| Supabase joins flattened before use | N/A | No new queries |

---

## Project Structure

### Documentation (this feature)

```text
specs/013-snap-to-grid/
├── spec.md              ✓ complete
├── plan.md              ← this file
├── research.md          ✓ complete
├── data-model.md        ✓ complete
├── quickstart.md        ✓ complete
└── tasks.md             (created by /speckit.tasks)
```

### Source Code — Files Touched

```text
src/
├── core/stores/
│   └── uiStore.ts                         MODIFY — add snapToGrid + toggleSnapToGrid
│
├── features/animation/
│   ├── components/
│   │   ├── Editor.tsx                     MODIFY — snap toggle button; pass snap props; GridLayer in layer stack
│   │   └── Canvas/
│   │       ├── GridLayer.tsx              CREATE — new Konva Layer with grid lines
│   │       ├── EntityLayer.tsx            MODIFY — receive snapToGrid + stage dims; pass to PlayerToken
│   │       ├── PlayerToken.tsx            MODIFY — apply snap rounding in handleDragEnd
│   │       └── index.ts                  MODIFY — export GridLayer
│   └── services/
│       └── snapGrid.ts                   CREATE — pure snap calculation + grid constants
│
tests/
├── unit/
│   ├── services/
│   │   └── snapGrid.test.ts              CREATE — unit tests for snap calculation
│   └── components/
│       └── GridLayer.test.tsx            CREATE — render tests for grid overlay visibility
└── e2e/
    └── editor.spec.ts                    MODIFY — add snap-to-grid E2E scenarios
```

---

## Phase 0: Research Findings

*See `research.md` for full detail. Summary:*

- Snap calculation is O(1) arithmetic on the existing drag pipeline; no new Konva APIs needed
- Grid overlay uses a Konva `Layer` + `Line` shapes rendered below `EntityLayer` — same pattern as `GhostLayer`
- Entity `x`/`y` is already the center coordinate (Konva `Group` position = center of all shapes); snap-to-center is trivially correct
- Focus mode is a local `useState` in `Editor.tsx`; snap toggle is hidden with the same `!focusMode && ...` guard as sidebar controls
- Snap state follows the exact Zustand pattern as `showGhosts`/`toggleGhosts` in `uiStore.ts`

---

## Phase 1: Design

### State Design

**`uiStore.ts` additions:**

```typescript
// State
snapToGrid: boolean;   // default: false

// Action
toggleSnapToGrid: () => void;
```

Follows the existing `showGhosts` / `toggleGhosts` pattern exactly.

### Snap Service (`snapGrid.ts`)

```typescript
export const GRID_COLS = 16;
export const GRID_ROWS = 12;

// Returns snapped center position in Konva canvas coordinates
export function snapPosition(
  x: number,
  y: number,
  stageWidth: number,
  stageHeight: number,
): { x: number; y: number } {
  const cellW = stageWidth / GRID_COLS;
  const cellH = stageHeight / GRID_ROWS;
  return {
    x: Math.round(x / cellW) * cellW,
    y: Math.round(y / cellH) * cellH,
  };
}
```

`Math.round` resolves equidistant ties toward the higher grid index (0.5 rounds up), matching the spec edge case.

### Grid Layer (`GridLayer.tsx`)

- Konva `Layer` containing `GRID_COLS - 1` vertical `Line` shapes + `GRID_ROWS - 1` horizontal `Line` shapes
- Color: `DESIGN_TOKENS.colours.primary` (pitch green) at opacity `0.15` — low contrast, behind entities
- Props: `width: number`, `height: number`, `visible: boolean`
- `listening={false}` — never captures pointer events

### Layer Order in `Editor.tsx`

```text
<Stage>
  <Field />               ← pitch SVG
  <FieldLayoutOverlay />  ← layout markers
  <GridLayer />           ← NEW: behind entities, above field markings
  <GhostLayer />          ← frame ghosts
  <EntityLayer />         ← players, cones, balls
  <AnnotationLayer />     ← arrows, free-draw
</Stage>
```

### Snap Integration in `PlayerToken.tsx`

New props:

```typescript
snapEnabled?: boolean;
stageWidth?: number;
stageHeight?: number;
```

In `handleDragEnd`, after bounds-clamping, before `onDragEnd`:

```typescript
let finalX = clampedX;
let finalY = clampedY;
if (snapEnabled && stageWidth && stageHeight) {
  const snapped = snapPosition(clampedX, clampedY, stageWidth, stageHeight);
  finalX = snapped.x;
  finalY = snapped.y;
}
node.x(finalX);
node.y(finalY);
onDragEnd(finalX, finalY);
```

### Snap Toggle in `Editor.tsx`

Hidden in Focus Mode via the existing `!focusMode` guard. Positioned in the top-right toolbar alongside the Focus Mode toggle:

```tsx
{!focusMode && (
  <button
    onClick={toggleSnapToGrid}
    aria-label={snapToGrid ? 'Disable snap to grid' : 'Enable snap to grid'}
    aria-pressed={snapToGrid}
    className={cn('...existing toolbar button classes...', snapToGrid && 'bg-tactics-white/20')}
  >
    <Grid className="w-5 h-5" />
  </button>
)}
```

Icon: `Grid` from `lucide-react` (already a dependency).

### `stageWidth` / `stageHeight` Propagation

`Editor.tsx` already tracks canvas dimensions (used to size the `Stage` component). These values are threaded down as props: `Editor → EntityLayer → PlayerToken`.

---

## Complexity Tracking

No constitutional violations. No complexity exceptions required.
