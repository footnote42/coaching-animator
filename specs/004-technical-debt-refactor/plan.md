# Implementation Plan: Phase 3a — Technical Debt Reduction

**Branch**: `004-technical-debt-refactor` | **Date**: 2026-04-25 | **Spec**: `specs/004-technical-debt-refactor/spec.md`

## Summary

Decompose the 852-line `Editor.tsx` monolith into focused custom hooks and apply granular Zustand selectors to eliminate whole-component re-renders. No user-visible behaviour changes. All existing tests must pass unmodified.

---

## Technical Context

**Language/Version**: TypeScript 5 · Node 22
**Framework**: Next.js 14 App Router (SSR + API Routes)
**Canvas**: Konva (react-konva) — shared across `/app`, `/replay/[id]`, `/share/[id]`
**State**: Zustand stores in `src/core/stores/` — `projectStore.ts` (741 lines), `uiStore.ts`
**Styling**: Tailwind CSS + Radix UI primitives
**Testing**: Vitest (unit) · Playwright (E2E)
**Deploy**: Vercel (CI via GitHub Actions)
**Performance Goals**: Canvas interactions <100ms; API responses <500ms p95
**Constraints**: No telemetry; no third-party analytics; entity colors via EntityColors service only

---

## Constitutional Compliance Check

| Check | Status | Notes |
|-------|--------|-------|
| Tier alignment (Guest/Auth/Public/Admin) | ✅ PASS | Pure refactor — no tier-level behaviour changes |
| No telemetry or analytics | ✅ PASS | No new data collection |
| Entity colors via EntityColors service | ✅ PASS | Preserved as-is during extraction |
| Shared canvas — tested on all 3 routes | ✅ PASS | Canvas/ components not touched; only Editor.tsx orchestration layer |
| New data: privacy impact assessed | ✅ N/A | No schema changes |
| Supabase joins flattened before use | ✅ N/A | No new queries |

> Constitutional compliance is maintained by the invariant: the refactor introduces no behaviour changes. The shared canvas components (`Stage.tsx`, `Field.tsx`, `PlayerToken.tsx`, `EntityLayer.tsx`, `AnnotationLayer.tsx`) are explicitly out of scope.

---

## Project Structure

### Documentation (this feature)

```text
specs/004-technical-debt-refactor/
├── spec.md              ✅ created
├── plan.md              ✅ this file
├── research.md          ✅ see below (Phase 0)
├── quickstart.md        ✅ see below (Phase 1)
└── tasks.md             — /speckit.tasks output (not created here)
```

No `data-model.md` — this refactor introduces no new entities or schema changes.
No `contracts/` — no new or changed API contracts.

### Source Code — Files This Feature Touches

```text
src/features/animation/
├── components/
│   ├── Editor.tsx                           MODIFY (reduce to <400 lines)
│   └── hooks/                               CREATE directory
│       ├── useEditorEntityHandlers.ts       CREATE
│       ├── useEditorPlaybackHandlers.ts     CREATE
│       ├── useEditorProgressionHandlers.ts  CREATE
│       └── useEditorContextMenuHandlers.ts  CREATE

src/core/stores/
└── projectStore.ts                          READ ONLY (selectors applied in Editor.tsx consumers)
```

**Why this structure**: Hooks co-located with the feature component that owns them. The `hooks/` sub-directory under `components/` follows the existing pattern in the codebase.

---

## Phase 0: Research

### Codebase Analysis

#### R1 — Editor.tsx Handler Groups (Completed)

Scanned `Editor.tsx` (852 lines). Handler groups identified:

| Group | Handlers | Lines (approx) | Hook Target |
|-------|----------|----------------|-------------|
| Entity creation | `handleAddAttackPlayer`, `handleAddDefensePlayer`, `handleAddBall`, `handleAddCone`, `handleAddTackleShield`, `handleAddTackleBag` | ~90 | `useEditorEntityHandlers` |
| Recovery | `handleRecoverProject`, `handleSkipRecovery` | ~20 | `useEditorEntityHandlers` (same hook — shares store deps) |
| Frame/playback | `handleAddFrame`, `handlePreviousFrame`, `handleNextFrame`, `handleFrameDurationChange` | ~30 | `useEditorPlaybackHandlers` |
| Progression | `handleProgressionSelectRequest`, `handleProgressionReorder`, `handleProgressionDiscardAndSwitch`, `handleAddProgression` | ~120 | `useEditorProgressionHandlers` |
| Context menus | `handleEntityContextMenu`, `handleContextMenuDuplicate`, `handleContextMenuDelete`, `handleContextMenuEditLabel`, `handleAnnotationContextMenu`, `handleAnnotationContextMenuDelete`, `handleCanvasClick` | ~70 | `useEditorContextMenuHandlers` |
| Entity events | `handleEntitySelect`, `handleEntityMove`, `handleEntityDoubleClick`, `handleInlineEditorConfirm`, `handleInlineEditorCancel` | ~40 | `useEditorContextMenuHandlers` (same hook — shares inline editor state) |
| Drawing | `handleDrawingComplete` | ~15 | `useEditorPlaybackHandlers` (shares frame/annotation deps) |

#### R2 — Store Subscription Analysis (Completed)

**Current subscription in `Editor.tsx`:**

```typescript
// Line 64-88: ONE destructure subscribes to the entire projectStore
const {
  project, currentFrameIndex, isPlaying, playbackSpeed, loopPlayback,
  playbackPosition, isDirty, newProject, loadProject, addFrame,
  setCurrentFrame, removeFrame, duplicateFrame, addEntity, propagateEntity,
  updateEntity, play, pause, reset, setPlaybackSpeed, toggleLoop,
  updateFrame, addAnnotation,
} = useProjectStore();

// Line 90-100: ONE destructure subscribes to entire uiStore
const {
  selectedEntityId, selectEntity, deselectAll, showGhosts, toggleGhosts,
  selectedAnnotationId, selectAnnotation, drawingMode, setDrawingMode,
} = useUIStore();
```

**Problem**: Zustand's default `useStore()` with destructuring subscribes to the entire store. Any state change (e.g. `playbackPosition` updating 30× per second during playback) re-renders the entire 852-line `Editor` component.

**Solution**: Use granular selectors. Each consumed value gets its own `useProjectStore(s => s.value)` call. Zustand only re-renders a component when the specific selected value changes.

#### R3 — Guest Limit State (Completed)

`showGuestLimitModal` moves into `useEditorEntityHandlers`. `handleAddFrame` (in playback hook) receives the setter as a parameter to trigger it when the frame limit is hit.

#### R4 — Progression State Ownership (Completed)

`baseAnimationMeta`, `progressions`, `activeProgressionIndex`, `showProgressionUnsavedDialog`, `pendingProgressionIndex`, `isAddingProgression` migrate wholesale into `useEditorProgressionHandlers`.

#### R5 — Inline Editor + Context Menu State (Completed)

`inlineEditor`, `contextMenu`, `annotationContextMenu` migrate into `useEditorContextMenuHandlers`.

#### R6 — Remaining State in Editor.tsx After Extraction (Completed)

After all extractions, `Editor.tsx` retains only:
- `stageRef` (canvas ref — must live in the component that renders `<Stage>`)
- `mobileWarningDismissed`, `viewportWidth` (viewport state, used directly in JSX)
- `showRecoveryDialog`, `recoveredProject` (set by a `useEffect` that stays in Editor.tsx)
- All 4 `useEffect` hooks (recovery, viewport, auto-save, progression loading) — stay in Editor.tsx due to mixed dependencies

> **Decision**: `useEffect` hooks stay in `Editor.tsx`. Extracting them risks subtle ordering bugs with mixed dependencies. Line-count target (<400) is achievable without moving them.

---

## Phase 1: Design

### Hook Interface Designs

#### `useEditorEntityHandlers`

```typescript
interface UseEditorEntityHandlersParams {
  isAuthenticated: boolean;
  cloudAnimationId: string | null;
  showRecoveryDialog: boolean;
  setShowRecoveryDialog: (v: boolean) => void;
  recoveredProject: unknown;
  setRecoveredProject: (v: unknown) => void;
}

interface UseEditorEntityHandlersReturn {
  showGuestLimitModal: boolean;
  setShowGuestLimitModal: (v: boolean) => void;
  handleRecoverProject: () => void;
  handleSkipRecovery: () => void;
  handleAddAttackPlayer: () => void;
  handleAddDefensePlayer: () => void;
  handleAddBall: () => void;
  handleAddCone: () => void;
  handleAddTackleShield: () => void;
  handleAddTackleBag: () => void;
}
// Store deps: addEntity, propagateEntity (actions); project, currentFrameIndex (state)
```

#### `useEditorPlaybackHandlers`

```typescript
interface UseEditorPlaybackHandlersParams {
  isAuthenticated: boolean;
  setShowGuestLimitModal: (v: boolean) => void;
}

interface UseEditorPlaybackHandlersReturn {
  handleAddFrame: () => void;
  handlePreviousFrame: () => void;
  handleNextFrame: () => void;
  handleFrameDurationChange: (frameId: string, durationMs: number) => void;
  handleDrawingComplete: (points: number[], type: 'arrow' | 'line') => void;
}
// Store deps: addFrame, setCurrentFrame, updateFrame, addAnnotation (actions); project, currentFrameIndex, isDirty (state)
```

#### `useEditorProgressionHandlers`

```typescript
interface UseEditorProgressionHandlersParams {
  cloudAnimationId: string | null;
  isAuthenticated: boolean;
}

interface UseEditorProgressionHandlersReturn {
  baseAnimationMeta: { id: string; title: string; is_progression: boolean } | null;
  setBaseAnimationMeta: Dispatch<SetStateAction<...>>;
  progressions: Pick<AnimationSummary, 'id' | 'title' | 'progression_order'>[];
  setProgressions: Dispatch<SetStateAction<...>>;
  activeProgressionIndex: number;
  showProgressionUnsavedDialog: boolean;
  setShowProgressionUnsavedDialog: (v: boolean) => void;
  isAddingProgression: boolean;
  showProgressionPanel: boolean;
  handleProgressionSelectRequest: (index: number) => void;
  handleProgressionReorder: (animationId: string, newOrder: number) => Promise<void>;
  handleProgressionDiscardAndSwitch: () => void;
  handleAddProgression: () => Promise<void>;
}
// Store deps: loadProject (action); project, isDirty (state)
```

#### `useEditorContextMenuHandlers`

```typescript
interface UseEditorContextMenuHandlersParams {
  project: Project | null;
  currentFrameIndex: number;
}

interface UseEditorContextMenuHandlersReturn {
  inlineEditor: { entityId: string; x: number; y: number; currentValue: string } | null;
  contextMenu: { entityId: string; x: number; y: number } | null;
  annotationContextMenu: { annotationId: string; x: number; y: number } | null;
  handleEntitySelect: (entityId: string) => void;
  handleEntityMove: (entityId: string, x: number, y: number) => void;
  handleEntityDoubleClick: (entityId: string) => void;
  handleEntityContextMenu: (entityId: string, event: { x: number; y: number }) => void;
  handleInlineEditorConfirm: (value: string) => void;
  handleInlineEditorCancel: () => void;
  handleContextMenuDuplicate: () => void;
  handleContextMenuDelete: () => void;
  handleContextMenuEditLabel: () => void;
  handleAnnotationContextMenu: (annotationId: string, event: { x: number; y: number }) => void;
  handleAnnotationContextMenuDelete: () => void;
  handleCanvasClick: () => void;
}
// Store deps: updateEntity, propagateEntity (via getState); removeEntity, removeAnnotation (via getState)
// UI store deps: selectEntity, deselectAll, selectAnnotation (actions); selectedEntityId, selectedAnnotationId (state)
```

### Granular Selector Pattern

Replace the single `useProjectStore()` destructure with individual selectors:

```typescript
// Before (subscribes to entire store)
const { project, currentFrameIndex, isDirty, ... } = useProjectStore();

// After (each selector is independent)
const project = useProjectStore(s => s.project);
const currentFrameIndex = useProjectStore(s => s.currentFrameIndex);
const isDirty = useProjectStore(s => s.isDirty);
// Actions via getState() in handlers (stable, no re-render)
```

### Implementation Sequence

1. Create `useEditorContextMenuHandlers` — most self-contained, no async
2. Create `useEditorProgressionHandlers` — complex async, isolated state
3. Create `useEditorEntityHandlers` — straightforward entity creation
4. Create `useEditorPlaybackHandlers` — shares `setShowGuestLimitModal` from entity hook
5. Replace `useProjectStore()` + `useUIStore()` destructures with granular selectors
6. Verify line count, run full test suite, manual smoke test all 3 routes

Each step: wire into `Editor.tsx`, run `npm test -- --run && npx tsc --noEmit` before proceeding.

---

## Complexity Tracking

No constitutional violations. No complexity justification required.
