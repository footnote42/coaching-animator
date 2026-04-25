# Tasks: Playback Controls

**Input**: `specs/007-playback-controls/plan.md`, `spec.md`, `research.md`, `data-model.md`, `quickstart.md`
**Branch**: `007-playback-controls`
**Date**: 2026-04-25

**Tests**: Not requested in spec — no test tasks generated. Manual verification steps are provided in `quickstart.md`.

**Organization**: Tasks are grouped by user story. US1 (P1) is the MVP and must complete before US2/US3. US2 and US3 (both P2) can proceed in either order once US1 is complete.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US3)
- Exact file paths are included in every task

## Path Conventions

```
Component:  src/features/animation/components/Canvas/EditorFloatingRemote.tsx
Editor:     src/features/animation/components/Editor.tsx
FloatingR:  src/features/animation/components/Canvas/FloatingRemote.tsx  (reference only — NOT modified)
Store:      src/core/stores/projectStore.ts  (reference only — NOT modified)
Handlers:   src/features/animation/components/hooks/useEditorPlaybackHandlers.ts  (reference only — NOT modified)

Pre-push:   npm run lint && npx tsc --noEmit
Manual:     npm run dev  (port 3000)
```

---

## Phase 1: Setup

**Purpose**: Confirm baseline is clean before any changes land.

- [x] T001 Verify `npm run lint && npx tsc --noEmit` passes on branch `007-playback-controls` with zero errors before writing any code

---

## Phase 2: User Story 1 — Coach Controls Playback Without Scrolling (Priority: P1) 🎯 MVP

**Goal**: A floating pill overlay appears in the editor viewport, always visible regardless of scroll position. It provides play, pause, prev frame, next frame, and a live frame counter. The remote is always on screen — it never scrolls off with the page.

**Independent Test**: Open `http://localhost:3000/app`. Load any animation. On a mobile viewport (DevTools → iPhone 14, 390×844): verify a dark pill is visible on screen. Press play — animation plays. Press pause — animation stops. Press prev/next frame arrows — frame counter updates. Scroll the page up and down — remote stays visible.

### Implementation for User Story 1

- [x] T002 [US1] Create `src/features/animation/components/Canvas/EditorFloatingRemote.tsx`:
  - Declare constants `PILL_WIDTH = 176`, `PILL_HEIGHT = 44`, `STORAGE_KEY = 'editor-remote-pos'`
  - Copy the `getSafeAreaBottom()` helper verbatim from `src/features/animation/components/Canvas/FloatingRemote.tsx` (reads `env(safe-area-inset-bottom)` via a transient DOM element)
  - Component has no props — reads store internally
  - Read `currentFrameIndex`, `isPlaying`, `project` from `useProjectStore` via selectors
  - Derive `totalFrames = project?.frames.length ?? 0`
  - Read actions `play`, `pause`, `setCurrentFrame` from `useProjectStore.getState()` (not selectors, to avoid re-render on every store update)
  - Compute default position: `{ x: window.innerWidth - PILL_WIDTH - 16, y: window.innerHeight - PILL_HEIGHT - safeAreaBottom - 16 }`
  - Initialise `pos` state to the default (localStorage wiring comes in T004)
  - Render a `<div>` with inline `style={{ position: 'fixed', left: pos.x, top: pos.y, width: PILL_WIDTH, height: PILL_HEIGHT, zIndex: 50, touchAction: 'none', userSelect: 'none' }}`
  - Apply Tailwind: `"flex items-center rounded-none bg-black/70 border border-white/10"` — `rounded-none` is explicit (sharp corners, UI-003 / Constitution §IV)
  - Hard-edged shadow: `style={{ boxShadow: '2px 2px 0 rgba(0,0,0,0.5)' }}`
  - Grip element (drag handle, stubbed — real drag comes in T004): `<div className="px-2 py-3 text-white/40 flex-shrink-0 cursor-grab"><GripVertical className="w-4 h-4" /></div>`
  - Prev frame button: `<button onClick={() => setCurrentFrame(currentFrameIndex - 1)} disabled={currentFrameIndex === 0} className="w-11 h-11 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Previous frame"><ChevronLeft className="w-4 h-4" /></button>`
  - Play/Pause button: `<button onClick={isPlaying ? pause : play} className="w-11 h-11 flex items-center justify-center text-white" aria-label={isPlaying ? 'Pause' : 'Play'}>{isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}</button>`
  - Next frame button: `<button onClick={() => setCurrentFrame(currentFrameIndex + 1)} disabled={currentFrameIndex >= totalFrames - 1} className="w-11 h-11 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Next frame"><ChevronRight className="w-4 h-4" /></button>`
  - Frame counter: `<span className="text-xs text-white/70 font-mono tabular-nums px-2 min-w-[3.5rem] text-center">{currentFrameIndex + 1} / {totalFrames}</span>`
  - Import `GripVertical, ChevronLeft, ChevronRight, Play, Pause` from `lucide-react`

- [x] T003 [US1] Mount `EditorFloatingRemote` in `src/features/animation/components/Editor.tsx`:
  - Add import: `import { EditorFloatingRemote } from '@/features/animation/components/Canvas/EditorFloatingRemote'`
  - Inside the Editor's `return`, just before the final closing `</div>` of the root `flex h-screen` div, add: `{project && <EditorFloatingRemote />}`
  - Do NOT remove or modify the existing `<PlaybackControls>` in the footer
  - Do NOT modify any Canvas/ components (Stage, Field, etc.)

- [x] T004 [US1] Verify User Story 1: `npm run lint && npx tsc --noEmit` — zero new errors. Then open `http://localhost:3000/app`, load an animation, and confirm the floating pill is visible and all four controls function correctly per quickstart.md Test 1 and Test 2.

**Checkpoint**: Floating remote renders and all controls work. Validate independently before continuing.

---

## Phase 3: User Story 2 — Coach Repositions Remote (Priority: P2)

**Goal**: The floating remote is draggable. It can be repositioned anywhere within the viewport, stays within bounds on release, and remembers its position across page reloads.

**Independent Test**: Open the editor on desktop. Drag the remote's grip handle to the top-left corner — it moves with the drag. Release — it stays there. Drag toward any viewport edge — it stops at the edge, never goes off screen. Reload the page — remote reappears at the saved position. Set localStorage key `editor-remote-pos` to `{"x":99999,"y":99999}` and reload — remote resets to default position.

### Implementation for User Story 2

- [x] T005 [US2] Add drag implementation to `src/features/animation/components/Canvas/EditorFloatingRemote.tsx`:
  - Add `dragging = useRef(false)` and `dragStart = useRef({ pointerX: 0, pointerY: 0, startX: 0, startY: 0 })`
  - Add `safeAreaBottom = useRef(0)` and populate it in a `useEffect(() => { safeAreaBottom.current = getSafeAreaBottom(); }, [])`
  - Add `handleDragStart` on `onPointerDown` of the grip element:
    ```
    e.preventDefault()
    dragging.current = true
    dragStart.current = { pointerX: e.clientX, pointerY: e.clientY, startX: pos.x, startY: pos.y }
    (e.target as HTMLElement).setPointerCapture(e.pointerId)
    ```
  - Add `handlePointerMove` on `onPointerMove` of the outer div:
    ```
    if (!dragging.current) return
    const dx = e.clientX - dragStart.current.pointerX
    const dy = e.clientY - dragStart.current.pointerY
    const newX = dragStart.current.startX + dx
    const newY = dragStart.current.startY + dy
    const maxX = window.innerWidth - PILL_WIDTH
    const maxY = window.innerHeight - PILL_HEIGHT - safeAreaBottom.current
    setPos({ x: Math.max(0, Math.min(newX, maxX)), y: Math.max(0, Math.min(newY, maxY)) })
    ```
  - Add `handlePointerUp` on `onPointerUp` and `onPointerCancel` of the outer div: `dragging.current = false`

- [x] T006 [US2] Add localStorage persistence to `src/features/animation/components/Canvas/EditorFloatingRemote.tsx`:
  - Extract a `loadStoredPosition()` helper that:
    1. Wraps the entire body in `try/catch` (localStorage may be unavailable in private browsing)
    2. Reads `localStorage.getItem(STORAGE_KEY)`
    3. If null, returns `null`
    4. Parses JSON — if throws, returns `null`
    5. Validates: `typeof x === 'number' && typeof y === 'number' && x >= 0 && x <= window.innerWidth - PILL_WIDTH && y >= 0 && y <= window.innerHeight - PILL_HEIGHT` — if false, returns `null`
    6. Returns `{ x, y }` if valid
  - Change the `pos` state initialiser to call `loadStoredPosition() ?? defaultPosition` (compute default inside a lazy `useState(() => ...)` initialiser so `window` is only accessed client-side)
  - In `handlePointerUp`, after setting `dragging.current = false`, write position: `try { localStorage.setItem(STORAGE_KEY, JSON.stringify(pos)) } catch { /* silent */ }`
  - Add a `useEffect` that adds a `'resize'` event listener on `window`:
    ```
    const handleResize = () => {
      setPos(prev => ({
        x: Math.max(0, Math.min(prev.x, window.innerWidth - PILL_WIDTH)),
        y: Math.max(0, Math.min(prev.y, window.innerHeight - PILL_HEIGHT - safeAreaBottom.current)),
      }))
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
    ```
  - Note: the resize handler does NOT write to localStorage — only drag-end writes. This avoids spurious writes on every orientation change frame.

- [x] T007 [US2] Verify User Story 2: `npm run lint && npx tsc --noEmit` — zero new errors. Then manually verify quickstart.md Tests 3, 4, and 5 (drag bounds, persistence, and invalid stored position fallback).

**Checkpoint**: Drag, bounds clamping, and persistence all work. Validate independently before continuing.

---

## Phase 4: User Story 3 — Coach Sees Frame Progress (Priority: P2)

**Goal**: The frame counter ("N / M") is always accurate and updates in real time during playback. Prev/next buttons are disabled when there is no frame in that direction.

**Note**: The frame counter and disabled-state logic were implemented as part of T002 (US1). This phase is a dedicated verification pass, not a code change phase. If the counter is working correctly from US1, there is nothing to implement here — only validate.

**Independent Test**: Load an animation with 5 frames. Remote shows `1 / 5`. Press play — counter increments each frame: `2 / 5`, `3 / 5`, etc. Step back/forward manually — counter matches. On frame 1, prev button is disabled. On frame 5, next button is disabled. Create a single-frame animation — both prev and next are disabled.

### Verification for User Story 3

- [x] T008 [US3] Verify User Story 3: confirm frame counter accuracy per quickstart.md Tests 6 and 7. If any issue found, fix within `EditorFloatingRemote.tsx`. Then `npm run lint && npx tsc --noEmit`.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final quality gates and shared canvas regression checks.

- [ ] T009 [P] Manual verify `/app` route (editor): open editor, confirm floating remote appears, existing footer PlaybackControls still present and functional, canvas renders correctly, entities draggable. Also open the Share dialog while the remote is visible — verify no visual conflict (both should be independently usable).
- [ ] T010 [P] Manual verify `/replay/[id]` route: still renders correctly — no new floating remote present (only the existing replay UI)
- [ ] T011 [P] Manual verify `/share/[id]` route: existing `FloatingRemote` still works — drag, play/pause, frame counter — unchanged. No duplicate remote.
- [ ] T012 [P] Manual verify mobile (DevTools iPhone 14 emulation): floating remote visible at bottom of viewport, all 4 buttons reachable without scrolling, drag responsive to touch events per quickstart.md Test 9
- [x] T013 Run `npm run lint && npx tsc --noEmit` — zero new errors across all changed files
- [x] T014 Run `npm test -- --run` — all existing unit tests pass (no regressions from Editor.tsx changes)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **US1 (Phase 2)**: Depends on Setup. T002 before T003 (component must exist before it's mounted). T004 validates.
- **US2 (Phase 3)**: Depends on US1 (T002/T003 must be complete — extends the same file). T005 before T006 (drag must work before persistence is layered on top).
- **US3 (Phase 4)**: Implemented in US1 (T002). T008 is verification only — can run after US1 completes, parallel with US2.
- **Polish (Phase 5)**: Depends on US1–US3 being complete. T009–T012 all independent — run in parallel.

### Parallel Opportunities

- **US3 verify (T008)** can run in parallel with US2 (T005–T007) since it only reads code written in US1
- **Polish (T009–T012)**: All four manual verifications are independent — run simultaneously

### Cross-Story Dependencies

US2 and US3 are independent after US1 completes. US3 has no code to write (implemented in US1) — its only task is verification.

---

## Implementation Strategy

### MVP First (US1 Only)

1. Phase 1: Verify clean baseline
2. Phase 2: US1 — create `EditorFloatingRemote`, mount in Editor
3. Validate: floating remote visible, controls functional, no regressions
4. Ship if ready

### Incremental Delivery

1. US1 → floating remote (P1, core usability on mobile)
2. US2 → draggability + persistence (P2, position control)
3. US3 → frame counter verification (P2, already implemented in US1)
4. Polish → regression verification across all routes

---

## Notes

- No DB schema changes — entirely frontend/localStorage
- No new Zustand store actions — `play()`, `pause()`, `setCurrentFrame()` already exist
- `EditorFloatingRemote` has no props — reads store directly for maximum simplicity
- `getSafeAreaBottom()` is copied from `FloatingRemote.tsx` — not abstracted to a shared util (scope limit)
- Pre-push gate: `npm run lint && npx tsc --noEmit` must pass before PR (SC-005)
- Shared canvas components (`Stage`, `Field`, `FloatingRemote`, etc.) are NOT modified
- The `position: fixed` + `z-50` combination means the remote renders over all page content including Radix dialogs at the same z-level — verify no visual conflict with Share dialog or ContextMenu during polish
