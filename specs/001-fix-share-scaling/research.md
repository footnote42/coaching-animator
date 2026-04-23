# Research: Fix Mobile Replay Scaling

**Branch**: `001-fix-share-scaling` | **Date**: 2026-04-18 | **Phase**: 0 — Codebase Research

---

## Summary

Research confirmed that two files require changes. Three suspected causes were investigated; one (Navigation suppression) is already resolved. The remaining two issues are isolated and low-risk.

---

## Finding 1 — useShareCanvasSize: oversized first render

**Decision**: Fix the initial state in `useShareCanvasSize` using a lazy initializer.

**Rationale**: The hook defaults to `{ width: 800, height: 600 }` at line 23 of `src/core/hooks/useShareCanvasSize.ts`. ResizeObserver fires asynchronously, so the first React render always uses this default. On a 390px-wide phone the canvas renders at 800×600 (more than 2× too wide), then jumps to the correct size after ResizeObserver fires — a visible flash.

The fix is a [lazy initializer](https://react.dev/reference/react/useState#avoiding-recreating-the-initial-state) that reads `window.innerWidth/innerHeight` at mount time:

```typescript
const [size, setSize] = useState<CanvasSize>(() => {
  if (typeof window === 'undefined') return { width: 800, height: 600 };
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const byWidth = { w: vw, h: vw / aspectRatio };
  const use = byWidth.h <= vh ? byWidth : { w: vh * aspectRatio, h: vh };
  return { width: Math.floor(use.w), height: Math.floor(use.h) };
});
```

Because `ShareViewer` is loaded with `ssr: false` (dynamic import), `window` is always available when the hook runs. The `typeof window === 'undefined'` guard is a safety net for any future SSR usage.

**Alternatives considered**:
- `useLayoutEffect` instead of `useEffect`: ResizeObserver callbacks fire asynchronously regardless of whether the observer is set up in a layout effect. The first render still uses the initial state. Does not fix the problem.
- Initialise to `{ width: 0, height: 0 }` and show nothing until ResizeObserver fires: Slightly cleaner semantics but causes a frame of zero-size canvas (Konva Stage would collapse). Worse UX than window-based initialisation.
- Use `window.screen.width/height` instead of `window.innerWidth/innerHeight`: `screen` dimensions are physical device pixels (pre-zoom); `innerWidth/innerHeight` are CSS pixels matching the browser viewport. `innerWidth/innerHeight` is correct.

---

## Finding 2 — Navigation already suppressed on share routes

**Decision**: No change needed for navigation suppression.

**Rationale**: `src/shared/components/Navigation.tsx` line 34 already returns `null` for paths starting with `/share/`:

```typescript
// Share routes are watch-only — no chrome
if (pathname.startsWith('/share/')) return null;
```

`Navigation` is a client component. In Next.js 14 App Router, `usePathname()` is available during server rendering, so the Navigation is not emitted in the SSR HTML for share routes. The root layout renders `<Navigation variant="full" />`, but on share routes it resolves to nothing.

US3 / FR-004 is already met. No changes required to layout files.

---

## Finding 3 — Loading placeholder not full-screen

**Decision**: Update the `dynamic()` loading placeholder in `src/app/share/[id]/page.tsx` to match the ShareViewer's full-screen layout.

**Rationale**: The current loading placeholder renders as an inline `h-[300px] w-full` box within the page wrapper:

```jsx
loading: () => (
  <div className="animate-pulse bg-white/10 h-[300px] w-full flex items-center justify-center text-white/50">
    Loading…
  </div>
),
```

This is visible briefly during the dynamic import hydration on slow connections. The placeholder should use `position: fixed; inset: 0` to match the ShareViewer it will become, giving a seamless transition.

The page wrapper (`min-h-screen bg-black flex flex-col items-center justify-center px-0 py-4`) is also unnecessary — `ShareViewer` uses `position: fixed; inset: 0` so the wrapper has no effect on its layout, and the share layout (`overflow-hidden bg-black`) already provides the black background. The wrapper can be removed entirely, returning just `<ShareViewer />`.

**Alternatives considered**:
- Keep the wrapper, just fix `py-4` → `py-0`: Fixes the potential scroll height problem but leaves dead code. Removing the wrapper is cleaner.
- Use a Suspense boundary instead of dynamic `loading`: Would require converting the page to use Suspense + React.lazy, which is more complex for this fix.

---

## Finding 4 — FloatingRemote safe area: already correct

**Decision**: No change needed.

**Rationale**: `FloatingRemote` reads `env(safe-area-inset-bottom)` via a hidden sentinel div at mount time (line 19–28 of `FloatingRemote.tsx`). The drag clamping at line 114 enforces `maxY = containerHeight - PILL_HEIGHT - safeAreaBottom`. The back-to-site link in `ShareViewer.tsx` also uses `calc(8px + env(safe-area-inset-bottom, 0px))`. US2 / FR-005 is already met.

---

## Files to Change

| File | Change |
|------|--------|
| `src/core/hooks/useShareCanvasSize.ts` | Replace `useState({ width: 800, height: 600 })` with lazy window-based initializer |
| `src/app/share/[id]/page.tsx` | Replace loading placeholder with full-screen version; remove unnecessary page wrapper |

## Files Confirmed Correct (No Change)

| File | Reason |
|------|--------|
| `src/features/animation/components/ShareViewer.tsx` | Layout correct — `position: fixed; inset: 0` with containerRef on outer div |
| `src/shared/components/Navigation.tsx` | Already returns null for `/share/*` routes |
| `src/features/animation/components/Canvas/FloatingRemote.tsx` | Safe-area clamping already implemented |
| `src/app/share/layout.tsx` | `overflow-hidden bg-black` correct |
| `src/app/layout.tsx` | No change needed — Navigation suppression handled in Navigation.tsx |
