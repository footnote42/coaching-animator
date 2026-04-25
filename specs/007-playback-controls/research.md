# Research: Playback Controls (007)

**Branch**: `007-playback-controls` | **Date**: 2026-04-25

---

## Decision 1: New component vs. extending FloatingRemote

**Decision**: Create `EditorFloatingRemote` as a new component in `src/features/animation/components/Canvas/`.

**Rationale**: The existing `FloatingRemote` (used by `ShareViewer`) is `position: absolute` relative to a container element, has no prev/next frame buttons, and has no position persistence. The editor requires all three differences. Extending via feature flags would couple two unrelated contexts and complicate the ShareViewer usage. A dedicated component has a clear, independent interface.

**Alternatives considered**:
- *Extend FloatingRemote with optional props*: Rejected — adds `onPrevFrame?`, `useFixedPosition?`, `storageKey?` flags that ShareViewer never uses, creating dead code paths and conditional rendering complexity in one component.
- *Reuse FloatingRemote with wrappers*: Rejected — the drag logic is tightly coupled to `containerWidth`/`containerHeight` (absolute positioning relative to a parent). Viewport positioning requires a fundamentally different coordinate model.

---

## Decision 2: position: fixed vs. position: absolute

**Decision**: `EditorFloatingRemote` uses `position: fixed` (viewport-relative).

**Rationale**: The spec explicitly requires "position: fixed, not position: sticky." The editor layout is `flex h-screen`, but on narrow mobile viewports (e.g. 360px wide phones) the browser chrome occupies screen real estate, and the layout may overflow vertically, causing the PlaybackControls footer to be pushed below the fold. A `position: fixed` remote stays on screen regardless of scroll depth or layout changes.

**Alternatives considered**:
- *position: absolute inside canvas container*: Would work on desktop where canvas container fills the visible area, but fails when the page scrolls on small devices.

**Coordinate storage**: Stored as absolute pixels `{ x: number, y: number }` from top-left of viewport (not percentage). Percentage-based storage was used in FloatingRemote but causes snapping artifacts when orientation changes mid-session.

---

## Decision 3: localStorage vs. sessionStorage for position persistence

**Decision**: Use `localStorage` with key `editor-remote-pos`.

**Rationale**: The spec says sessionStorage is "sufficient for v1" but localStorage is a "nice-to-have if trivial." It is trivial — same API, one word change. localStorage persists across browser restarts (better coaching workflow: remote stays where the coach left it last session). No PII is stored.

**Validation on load**: After reading the stored value, validate `x ∈ [0, window.innerWidth - PILL_WIDTH]` and `y ∈ [0, window.innerHeight - PILL_HEIGHT]`. If invalid (e.g. orientation changed, different device), reset to default.

---

## Decision 4: Default position

**Decision**: Bottom-right of the viewport: `x = window.innerWidth - PILL_WIDTH - 16`, `y = window.innerHeight - PILL_HEIGHT - safeAreaBottom - 16`.

**Rationale**: Bottom-right is the thumb-reachable zone on mobile, avoids the play/pause area of the pitch (which is typically centre-field), and matches the existing FloatingRemote default in the share view (`xPct: 0.85, yPct: 0.85`). Bottom-left would occlude the score or formation labels typically placed there.

---

## Decision 5: Store changes

**Decision**: No new Zustand store actions needed.

**Rationale**: `useProjectStore.getState().setCurrentFrame(index)` already guards bounds (line 204 in projectStore.ts). The existing `useEditorPlaybackHandlers` hook already exports `handlePreviousFrame` and `handleNextFrame` (computed as `setCurrentFrame(currentFrameIndex - 1/+1)` with bounds check). `EditorFloatingRemote` will call `useProjectStore.getState()` directly for the actions, reading `currentFrameIndex` / `isPlaying` / `project.frames.length` via selectors. The floating remote is a consumer of existing state — it does not own or extend it.

---

## Decision 6: Drag implementation

**Decision**: Reuse the same pointer event + `setPointerCapture` pattern from `FloatingRemote`.

**Rationale**: Already proven correct on both mouse and touch. `setPointerCapture` ensures the drag target receives all pointer events even when the pointer moves outside the element — critical for fast drags. No additional library (react-dnd, framer-motion) needed.

**Bounds clamping**: On `pointerMove`, clamp `x ∈ [0, window.innerWidth - PILL_WIDTH]` and `y ∈ [0, window.innerHeight - PILL_HEIGHT - safeAreaBottom]`. On `pointerUp`, write the clamped position to localStorage. On `resize`, re-read and re-clamp (prevents remote escaping viewport on orientation change).

---

## Decision 7: Component placement in Editor.tsx

**Decision**: Render `EditorFloatingRemote` as a sibling to `<main>` inside the top-level `flex h-screen` div, just before `</div>`.

**Rationale**: Since `position: fixed`, the DOM placement does not affect layout. Placing it outside any `overflow: hidden` container avoids clipping. Placing it inside the editor root keeps it scoped to the editor page.

**Existing PlaybackControls remain**: The footer `PlaybackControls` component stays. The floating remote supplements it — coaches with desktop screens can use either. Removing the footer controls is out of spec scope.

---

## Decision 8: Safe area inset

**Decision**: Reuse the `getSafeAreaBottom()` helper from `FloatingRemote.tsx` (copy into `EditorFloatingRemote` or extract to a shared util).

**Rationale**: iPhone home indicator sits below the page content. Without the safe area offset, the pill would appear beneath the home bar and be unresponsive to taps. The helper reads `env(safe-area-inset-bottom)` via a temporary sentinel DOM element.

**Extraction**: If a shared hook `useSafeAreaBottom()` or utility `getSafeAreaBottom()` doesn't already exist in `src/core/hooks/` or `src/core/utils/`, copy the implementation into `EditorFloatingRemote`. A shared extraction is a nice-to-have, not required by this feature.

---

## Codebase References

| File | Role |
|------|------|
| `src/features/animation/components/Canvas/FloatingRemote.tsx` | Existing remote for share route — read for drag pattern |
| `src/features/animation/components/Timeline/PlaybackControls.tsx` | Existing non-floating controls — NOT modified |
| `src/features/animation/components/Editor.tsx` | Mount point for new remote; existing playback handler wiring |
| `src/features/animation/components/hooks/useEditorPlaybackHandlers.ts` | `handlePreviousFrame`, `handleNextFrame` — reuse directly |
| `src/core/stores/projectStore.ts` | `currentFrameIndex`, `isPlaying`, `play`, `pause`, `setCurrentFrame` |
| `src/core/hooks/useEditorCanvasSize.ts` | Pattern reference for ResizeObserver; not used by EditorFloatingRemote |
