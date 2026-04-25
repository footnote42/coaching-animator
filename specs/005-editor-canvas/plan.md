# Implementation Plan: Editor & Canvas Credibility (Phase 2a)

**Branch**: `005-editor-canvas` | **Date**: 2026-04-25 | **Spec**: `specs/005-editor-canvas/spec.md`

## Summary

Correct the rugby pitch SVG markings, make the editor canvas responsive, clean up player token labels with a pitch legend, replace the 12-colour palette with 6 tactical colours, remove the deprecated export settings panel, strip the non-functional team selector, improve tackle equipment icons, standardise entity palette buttons, and move animation metadata to a dedicated pop-out pane. All changes are purely frontend — no database schema changes required.

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
| Tier alignment (Guest/Auth/Public/Admin) | [x] Pass | All canvas/editor changes apply to all tiers uniformly. No tier boundaries change. |
| No telemetry or analytics | [x] Pass | No new data collection. UI changes only. |
| Entity colors via EntityColors service | [x] Pass | New 6-colour `TACTICAL_PALETTE` is consumed via `EntityColors`; `ColorPicker` renders the subset. |
| Shared canvas — tested on all 3 routes | [x] Required | Pitch SVG, canvas sizing, PlayerToken label changes, PitchLegend all affect shared canvas. Must verify `/app`, `/replay/[id]`, `/share/[id]`. |
| New data: privacy impact assessed | [x] N/A | No new data stored. Metadata pop-out (EDITOR-001) is a UI relocation only. |
| Supabase joins flattened before use | [x] N/A | No new Supabase queries. |

> No violations. Shared canvas risk is flagged — verification is mandatory for every change touching `Canvas/`.

---

## Project Structure

### Documentation (this feature)

```text
specs/005-editor-canvas/
├── spec.md              ← Feature specification
├── plan.md              ← This file
├── research.md          ← Phase 0 codebase research
├── data-model.md        ← Phase 1 constants and interface changes
├── quickstart.md        ← Manual test guide
└── tasks.md             ← Task list (created by /speckit.tasks)
```

### Source Code — Files This Feature Touches

```text
public/assets/fields/
└── rugby-union.svg                           ← PITCH-001: Rewrite SVG markings

src/core/
├── constants/
│   └── design-tokens.ts                      ← EDITOR-009: Add TACTICAL_PALETTE (6 colours)
└── hooks/
    └── useEditorCanvasSize.ts                ← PITCH-002: New — mirrors useShareCanvasSize

src/features/animation/
└── components/
    ├── Editor.tsx                            ← PITCH-002: Replace hardcoded 800×600 with useEditorCanvasSize
    ├── Canvas/
    │   ├── Field.tsx                         ← No change (SVG fix is in the asset, not Field.tsx)
    │   ├── PlayerToken.tsx                   ← EDITOR-006/007: Increase label fontSize; shape redesign (EDITOR-005)
    │   └── PitchLegend.tsx                   ← EDITOR-006: New — Konva Layer with attack/defence legend
    └── Sidebar/
        ├── EntityPalette.tsx                 ← EDITOR-004: Standardise button variants
        ├── EntityProperties.tsx              ← EDITOR-008: Remove team selector buttons
        ├── ProjectActions.tsx                ← EDITOR-003: Remove Export Settings section + props
        └── MetadataSheet.tsx                 ← EDITOR-001: New — metadata pop-out Dialog/Sheet

src/shared/ui/
└── ColorPicker.tsx                           ← EDITOR-009: Replace palette with TACTICAL_PALETTE
```

---

## Phase 0: Research Findings

### PITCH-001 — Current SVG State

**File**: `/public/assets/fields/rugby-union.svg` (2000×1400px, pitch landscape orientation)

**Issues found**:
1. **H-posts**: Rendered as U-shaped brackets (3 lines, 40px wide, y=650–750). On a top-down coaching diagram, H-posts should appear as two upright lines with a crossbar — not side-opening brackets.
2. **5m inner sideline markers**: Currently implemented as full-height dashed vertical lines (`x=282, 364, 446` and `x=1554, 1636, 1718`). Per rugby coaching convention, these should be **short perpendicular ticks** along the **long boundary lines** (top and bottom) at 5m spacing — not full field lines.
3. **Unexplained extra lines**: The x=282/364/446 lines (3 phantom "yard" lines between try line at x=200 and 22m line at x=440) clutter the pitch with no coaching meaning. Similarly x=1554 almost overlaps the 22m line at x=1560.
4. **22m lines are dashed**: Standard pitch diagrams show 22m lines as solid (not dashed). Halfway line is solid (correct). 10m lines are dashed (acceptable — conventionally lighter weight).
5. **Try lines**: Currently grey (#A0A0A0) — should be white (#F8F9FA) at same weight as other lines.

**Decision**: Rewrite the SVG from scratch with correct proportions. Use the existing 2000×1400 canvas. Layout (all measured from left edge at x=50):
- Dead-ball lines: x=50 (left), x=1950 (right) — boundary
- Try lines: x=200 (left), x=1800 (right) — solid, white
- 22m lines: x=440 (left), x=1560 (right) — solid, white
- 10m lines: x=800 (left), x=1200 (right) — dashed (lighter weight)
- Halfway: x=1000 — solid, white
- 5m inner sideline markers: short ticks (20px) at y=50 and y=1350 at x=200+82=282, x=282+82=364... actually the 5m markers should be AT the sideline every 5m of the real pitch. This needs to be along the long sides. In the coach diagram convention, the 5m infield markers are short **parallel** lines (gang lines) running along each long side, 5m infield, from the 22 to the try line. Let me reconsider.

Actually, looking at what real rugby pitch diagrams show:
- The "5m" marks are short tick marks on the TOUCHLINES at various distances — they indicate positions relevant to lineouts and kicks.
- The 5m infield line (gang line) runs parallel to the touchline, 5m in, from the 22m to the try line.

For this spec's purposes, the ISSUES.md says: "5-meter inner markers along both long sides". These are the gang lines — short dashed lines parallel to the touchlines, 5m infield, between the 22m and the try line on each side.

**H-posts decision**: In top-down view, H-posts are typically shown as: two vertical lines (representing the uprights as seen from above, as dots or short marks) with a horizontal crossbar. The existing code extends lines horizontally (as if looking from the side at the base). For a top-down diagram:
- Show two small rectangles (2×20px) centered on the try line at y_center±50px for the uprights
- Show a horizontal line between them for the crossbar

**Rationale**: Clean, recognizable top-down H-shape that matches coaching whiteboard convention.

---

### PITCH-002 — Canvas Sizing

**File**: `src/features/animation/components/Editor.tsx` lines 62–63

```typescript
const canvasWidth = 800;   // hardcoded
const canvasHeight = 600;  // hardcoded
```

**Pattern**: `src/core/hooks/useShareCanvasSize.ts` — ResizeObserver on a container ref, fits canvas to container while maintaining 4:3 aspect ratio.

**Decision**: Create `useEditorCanvasSize` as a thin alias or direct copy of `useShareCanvasSize`. The hook interface is identical; only the initial SSR fallback size may differ. Place in `src/core/hooks/useEditorCanvasSize.ts`. Wire up a `containerRef` on the editor's canvas wrapper div in `Editor.tsx`.

**ShareViewer safety**: `ShareViewer.tsx` uses `useShareCanvasSize` with `position:fixed inset:0`. The editor hook is separate — no risk of cross-contamination.

---

### EDITOR-006/007 — Player Token Labels

**File**: `src/features/animation/components/Canvas/PlayerToken.tsx`

**Current state**:
- `entity.label` defaults to `''` (set in `useEditorEntityHandlers.ts` lines 66, 77). Labels are NOT "Attacker"/"Defender" by default — the issue refers to potential old data or an observed UX confusion from the entity type display elsewhere.
- `fontSize={11}` at line 238 — too small for mobile legibility (EDITOR-007).
- No legend component exists.

**Decision**:
- Increase `fontSize` to `14` (bold) for player labels in `PlayerToken.tsx`. Test legibility at arm's length.
- Create `PitchLegend.tsx` — a Konva `Layer` rendering a small colour-swatch + label box (attack colour + "Attack" text, defence colour + "Defence" text), positioned at bottom-left of the canvas. Non-interactive (`listening={false}`).
- `PitchLegend` is added inside `Stage` in both `Editor.tsx` and `ReplayViewer.tsx`/`ShareViewer.tsx` where the Stage renders.

**PitchLegend data**: Reads attack/defence default colours from `EntityColors.getDefault('player', 'attack')` and `EntityColors.getDefault('player', 'defense')` — does not hardcode hex.

---

### EDITOR-009 — Colour Palette

**File**: `src/shared/ui/ColorPicker.tsx`

**Current state**: 12 swatches from `DESIGN_TOKENS` (4 attack + 4 defense + 4 neutral). DESIGN_TOKENS.colours.attack = `['#2563EB', '#16A34A', '#0891B2', '#7C3AED']` (Blue, Green, Cyan, Purple).

**Issue**: Too many near-similar colours, overwhelming for coaches. Spec requires exactly 6: Red, Blue, White, Yellow, Green, Black.

**Decision**: Add `TACTICAL_PALETTE` to `src/core/constants/design-tokens.ts`:
```
TACTICAL_PALETTE = ['#DC2626', '#2563EB', '#FFFFFF', '#EAB308', '#16A34A', '#111827']
```
(Red, Blue, White, Yellow/Amber, Green, Black — all from existing DESIGN_TOKENS or standard values)

`ColorPicker.tsx` renders `TACTICAL_PALETTE` instead of the current flattened team+neutral arrays. The 6-swatch grid remains `grid-cols-6`.

**Note**: `DESIGN_TOKENS.colours.attack/defense/neutral` remain unchanged (used by `EntityColors` service for defaults). Only `ColorPicker` changes its display palette.

---

### EDITOR-003 — Export Settings Removal

**File**: `src/features/animation/components/Sidebar/ProjectActions.tsx`

**Current state**: Lines 316–441 render the entire "Export Settings" section (resolution selector, format selector WebM/GIF, export button, progress indicator). Props `onExport`, `exportStatus`, `exportProgress`, `exportError`, `canExport`, `recommendedFormat`, `formatReason`, `exportFormat` support this panel.

**Decision**:
1. Remove the "Export Settings" `<div>` block (lines 316–441) from the JSX.
2. Remove the corresponding props from `ProjectActionsProps` and the component signature.
3. Find all callers of `ProjectActions` in `Editor.tsx` and remove the now-unused props passed in.
4. Remove `ExportFormat` and `ExportStatus` type imports if no longer used elsewhere.
5. The `Video` import from lucide-react can be removed.

**JSON export**: The spec notes that JSON export (the existing "Save Local" button with `downloadJson`) is the only permitted export and is already present. No new UI needed.

---

### EDITOR-008 — Team Selector

**File**: `src/features/animation/components/Sidebar/EntityProperties.tsx`

**Current state**: Lines 159–192 render the "Team" control — three buttons (Attack / Defense / Neutral) that update `entity.team`. This DOES functionally change the EntityColors default resolution. The issue flags it as confusing because manually-set colours appear to override it visually with no feedback.

**Decision**: Remove the Team button group entirely (lines 159–192). The Attack/Defense team assignment will be implicit through the `EntityPalette` buttons ("Attack Player" vs "Defense Player") which already set `entity.team = 'attack'/'defense'` at creation time. Post-creation team changes are not required for the Phase 2a scope.

---

### EDITOR-005 — Tackle Equipment Icons

**File**: `src/features/animation/components/Canvas/PlayerToken.tsx`

**Current state**:
- `tackle-shield`: `Rect` 32×16px with `cornerRadius={4}` — looks like a rounded pill, not a shield.
- `tackle-bag`: `Ellipse` radiusX=10, radiusY=20 — a vertical oval, could be anything.

**Decision**: Redesign both shapes using Konva primitives to be recognizable coaching whiteboard shapes:

- **Tackle Shield**: Draw as a flattened rectangle with a notch at the top — matching the characteristic shape of a real tackle shield (wider at bottom, narrower grip at top). Achieved with a `Rect` (full shield body, 28×20px) + smaller `Rect` (grip, 14×6px, centered at top), both with the entity colour. Use `orientation` rotation. Remove `cornerRadius`.
- **Tackle Bag**: Draw as a tall thin rectangle with flat ends — representing the cylindrical standing bag. Achieved with a `Rect` (10×30px) without corner radius. Vertical by default.

Both use `EntityColors.resolve()` (already present).

---

### EDITOR-004 — Entity Button Variants

**File**: `src/features/animation/components/Sidebar/EntityPalette.tsx`

**Current state**: "Attack Player" and "Defense Player" use `variant="default"` (filled). Ball, Cone, Shield, Bag use `variant="outline"`. This creates visual hierarchy but also inconsistency — the `variant="default"` buttons appear prominently styled differently.

**Decision**: Change "Attack Player" and "Defense Player" to `variant="outline"` to match all other entity buttons. Add a background color indicator via `className` instead — e.g., a small coloured dot prefix — OR simply use uniform `variant="outline"`. Keep the group structure (Entities / Equipment / Annotations sections) as-is.

---

### EDITOR-001 — Metadata Pop-Out

**File**: `src/features/animation/components/Sidebar/ProjectActions.tsx`

**Current state**: Lines 195–234 render a "Metadata" section (Animation Title input + Tutorial Video URL input) directly in the sidebar.

**Decision**: 
1. Replace the inline metadata section with a single "Edit Metadata" button in the sidebar.
2. Create `MetadataSheet.tsx` — a Radix `Dialog` (or shadcn `Sheet`) component containing the Animation Title and YouTube URL fields. Reuse the existing field components and validation logic from `ProjectActions.tsx`.
3. The metadata sheet state (`open`/`setOpen`) lives in `ProjectActions.tsx` via `useState`.

**No data model change**: `updateProjectSettings` from the project store is called identically; only the UI container changes.

---

## Phase 1: Data Model

No new database entities or schema changes.

**New constants**:
```typescript
// src/core/constants/design-tokens.ts — addition
TACTICAL_PALETTE: ['#DC2626', '#2563EB', '#FFFFFF', '#EAB308', '#16A34A', '#111827'] as const
//                  Red        Blue      White     Yellow     Green      Black
```

**New hook interface** (`src/core/hooks/useEditorCanvasSize.ts`):
```typescript
// Identical interface to useShareCanvasSize — different initial fallback only
export function useEditorCanvasSize(
  containerRef: RefObject<HTMLElement>,
  aspectRatio?: number,   // defaults to 4/3
): { width: number; height: number }
```

**New component interface** (`src/features/animation/components/Canvas/PitchLegend.tsx`):
```typescript
export interface PitchLegendProps {
  width: number;   // canvas width — legend positioned bottom-left
  height: number;  // canvas height — legend positioned near bottom edge
}
// Returns a Konva Layer (non-interactive)
```

**New component interface** (`src/features/animation/components/Sidebar/MetadataSheet.tsx`):
```typescript
export interface MetadataSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
// Reads/writes via useProjectStore internally
```

**Modified prop interface** (`ProjectActions.tsx` — props removed):
```typescript
// REMOVED from ProjectActionsProps:
onExport, exportStatus, exportProgress, exportError, canExport, recommendedFormat, formatReason, exportFormat
```

---

## Contracts

No external API contracts — this feature is purely frontend.

---

## Build Sequence

This is the recommended order to minimise merge conflicts and enable independent testing:

| Step | Issue(s) | File(s) | Risk | Test gate |
|------|----------|---------|------|-----------|
| 1 | PITCH-001 | `rugby-union.svg` | Low (asset only) | Visual — open `/app`, `/replay`, `/share` |
| 2 | PITCH-002 | `useEditorCanvasSize.ts`, `Editor.tsx` | Medium (canvas layout) | Resize browser window at `/app` |
| 3 | EDITOR-003 | `ProjectActions.tsx` | Low (removal) | No WebM/GIF in editor sidebar |
| 4 | EDITOR-009 | `design-tokens.ts`, `ColorPicker.tsx` | Low (palette swap) | Colour picker shows 6 swatches |
| 5 | EDITOR-008 | `EntityProperties.tsx` | Low (removal) | No team selector after entity select |
| 6 | EDITOR-006/007 | `PlayerToken.tsx`, `PitchLegend.tsx` | Medium (new component) | Legend visible; number legible on mobile |
| 7 | EDITOR-005 | `PlayerToken.tsx` | Medium (shape redesign) | Icons recognizable |
| 8 | EDITOR-004 | `EntityPalette.tsx` | Low (style change) | Buttons uniform |
| 9 | EDITOR-001 | `MetadataSheet.tsx`, `ProjectActions.tsx` | Medium (new component) | Title/URL in metadata dialog |

**Cross-route verification** (mandatory after steps 1, 2, 6, 7):
- `/app` (editor) 
- `/replay/[id]` (replay viewer)
- `/share/[id]` (share viewer — `position:fixed inset:0` must not break)

---

## Complexity Tracking

No constitutional violations. No complexity exceptions required.
