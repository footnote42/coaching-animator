# Implementation Plan: Playback Controls

**Branch**: `007-playback-controls` | **Date**: 2026-04-25 | **Spec**: `specs/007-playback-controls/spec.md`

## Summary

Add `EditorFloatingRemote` — a `position: fixed`, draggable floating panel in the editor viewport — providing play, pause, prev frame, next frame, and a live frame counter. The remote reads from the existing `useProjectStore` (no new store actions). Position persists in `localStorage`. The existing footer `PlaybackControls` component is not removed.

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
| Tier alignment (Guest/Auth/Public/Admin) | ✅ Pass | Editor is Tier 1/0 (authenticated + guest). Remote visible to all editor users — no new tier required. |
| No telemetry or analytics | ✅ Pass | Position stored in localStorage only. No events collected. |
| Entity colors via EntityColors service | ✅ Pass | No entity colors changed. Remote UI uses design tokens only. |
| Shared canvas — tested on all 3 routes | ✅ Pass | No Canvas/ components modified. Remote is rendered outside the Konva Stage. Routes `/replay/[id]` and `/share/[id]` unaffected. |
| New data: privacy impact assessed | ✅ Pass | Only `{x, y}` pixel coordinates in localStorage. No PII. No cloud storage. |
| Supabase joins flattened before use | N/A | No new Supabase queries. |

Constitutional authority: `specs/007-playback-controls/spec.md` §Constitutional Compliance Gate. Constitution §V.10 (CA-2026-003) explicitly supports bottom-oriented floating controls in the editor view.

---

## Project Structure

### Documentation (this feature)

```text
specs/007-playback-controls/
├── spec.md              ✅ created
├── plan.md              ✅ this file
├── research.md          ✅ created
├── data-model.md        ✅ created
├── quickstart.md        ✅ created
└── tasks.md             (created by /speckit.tasks)
```

### Source Code — Files to Create

| File | Description |
|------|-------------|
| `src/features/animation/components/Canvas/EditorFloatingRemote.tsx` | New floating remote component for the editor |

### Source Code — Files to Modify

| File | Change |
|------|--------|
| `src/features/animation/components/Editor.tsx` | Import and render `EditorFloatingRemote`; wire to existing store selectors and `useEditorPlaybackHandlers` |

### Source Code — Files NOT Modified

| File | Reason |
|------|--------|
| `src/features/animation/components/Canvas/FloatingRemote.tsx` | Share-route remote — unchanged; separate component |
| `src/features/animation/components/Timeline/PlaybackControls.tsx` | Existing footer controls stay; floating remote supplements them |
| `src/core/stores/projectStore.ts` | No new store actions needed |
| `src/features/animation/components/hooks/useEditorPlaybackHandlers.ts` | `handlePreviousFrame`/`handleNextFrame` reused as-is |
| All `Canvas/Stage.tsx`, `Canvas/Field.tsx`, etc. | Not touched — shared canvas unchanged |

---

## Component Design: EditorFloatingRemote

### Props interface

```typescript
// No props — reads store directly and manages its own position state
export function EditorFloatingRemote(): JSX.Element
```

The component is self-contained: it reads `useProjectStore` selectors internally and manages its own position in state (synced to localStorage). No props reduces friction in the Editor mount point.

### Dimensions

```typescript
const PILL_WIDTH = 176;   // px — wider than share remote to fit 4 buttons + counter
const PILL_HEIGHT = 44;   // px — 44px = minimum touch target height (spec UI-004)
const STORAGE_KEY = 'editor-remote-pos';
```

### Visual structure

```
[ ⠿ ] [ ◀ ] [ ▶▐ ] [ ▶ ] [ 2 / 5 ]
  grip  prev  play   next   counter
```

- Grip (drag handle): `GripVertical` icon, `onPointerDown` initiates drag
- Prev frame: `ChevronLeft` icon, `disabled` when `currentFrameIndex === 0`
- Play/Pause: `Play`/`Pause` icon, toggles `play()` / `pause()`
- Next frame: `ChevronRight` icon, `disabled` when `currentFrameIndex === totalFrames - 1`
- Frame counter: `font-mono`, e.g. `2 / 5`

### Styling

```typescript
// Outer wrapper — position:fixed, z-50, dark semi-transparent pill
className="fixed z-50 flex items-center bg-black/70 border border-white/10 shadow-[2px_2px_0_rgba(0,0,0,0.5)]"
// rounded-none per Constitution §IV / UI-003

// All buttons: minimum 44×44px touch target (UI-004)
className="w-11 h-11 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed"

// Frame counter: fixed-width digits (UI-006)
className="text-xs text-white/70 font-mono tabular-nums px-2 min-w-[3.5rem] text-center"
```

### Position lifecycle

```
Mount
  → getSafeAreaBottom() — read env(safe-area-inset-bottom)
  → Read localStorage[STORAGE_KEY]
  → Validate: JSON parse + bounds check against window.innerWidth/Height
  → Valid: use stored position
  → Invalid: use default (bottom-right − 16px inset − safeAreaBottom)

Drag
  → onPointerDown on grip → setPointerCapture
  → onPointerMove → clamp to [0, viewportW − PILL_W] × [0, viewportH − PILL_H − safeAreaBottom]
  → setPos(clamped)

Drag end
  → onPointerUp → write pos to localStorage

Viewport resize
  → window.addEventListener('resize', handler)
  → Re-clamp pos to new viewport dimensions
  → Write clamped pos to localStorage
  → cleanup on unmount
```

### Rendering in Editor.tsx

Add `EditorFloatingRemote` as the last child of the root `flex h-screen` div:

```tsx
// in Editor.tsx return statement, just before closing </div>
{project && <EditorFloatingRemote />}
```

Gated on `project` existing — avoids rendering the remote before a project is loaded (empty state / loading). Once a project is loaded, the remote is always present.

---

## Implementation Sequence

### Phase 1: Core component (US1 MVP)

1. Create `EditorFloatingRemote.tsx` with:
   - `position: fixed` pill layout
   - Play/Pause button wired to `play()` / `pause()` from projectStore
   - Prev/Next frame buttons wired to `setCurrentFrame(currentFrameIndex ± 1)` with bounds check
   - Frame counter `currentFrameIndex + 1 / project.frames.length`
   - Default bottom-right position (no localStorage yet)
2. Mount in Editor.tsx, verify it renders over the canvas
3. Verify `npm run lint && npx tsc --noEmit` passes

### Phase 2: Draggability (US2)

4. Add drag handle + pointer event handlers to EditorFloatingRemote
5. Add viewport bounds clamping
6. Add `getSafeAreaBottom()` helper (copy from FloatingRemote.tsx)
7. Add `window.resize` handler for re-clamping
8. Add localStorage read/write for position persistence
9. Verify drag works on mouse (desktop) and touch (DevTools mobile emulation)

### Phase 3: Polish

10. Verify frame counter updates in real time during playback
11. Verify `disabled` state on prev/next at frame boundaries
12. Verify all 3 routes unaffected
13. `npm run lint && npx tsc --noEmit` — zero new errors

---

## Complexity Tracking

No constitutional violations identified. No complexity exceptions required.

---

## Dependencies & Risks

| Risk | Mitigation |
|------|------------|
| `position: fixed` remote covered by modal overlays | `z-50` is sufficient; Radix Dialog uses `z-50` by default — they layer correctly |
| Safe area inset not available in all browsers | Helper returns 0 as fallback — remote is 16px above viewport bottom minimum |
| localStorage not available (private browsing) | Wrap read/write in try/catch; falls back to default position silently |
| Touch events not firing in DevTools emulation | Use pointer events (`onPointerDown`) not touch events — universally supported |
