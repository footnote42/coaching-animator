# Mobile Share Viewer — Fit-to-Screen + Floating Draggable Remote

**Epic**: T055
**Session**: Mobile Share Viewer Redesign (scope: epic:T055)
**Created**: 2026-02-25
**Status**: Ready to implement

## Context

The `/share/[id]` route (`ShareViewer.tsx`) has two problems on mobile:
1. **Scroll**: Canvas + controls stack taller than the viewport. `useCanvasSize` is width-only, unaware of vertical space.
2. **Controls below pitch**: Reset + Play sit below the canvas with `mt-4`, pushing content off-screen.

Goal: canvas fills the screen with no scroll, and a small draggable floating remote control overlaid on the pitch.

## Files to Modify

| File | Change |
|------|--------|
| `src/features/animation/components/ShareViewer.tsx` | Main changes — full-screen layout, FloatingRemote |
| `src/features/animation/components/Canvas/FloatingRemote.tsx` | New component |
| `src/core/hooks/useShareCanvasSize.ts` | New hook — container-measured, dvh-aware |
| `src/app/share/layout.tsx` | `h-[100dvh] overflow-hidden` |

---

## Step 1 — Full-screen layout

**`src/app/share/layout.tsx`**:
```tsx
<div className="h-[100dvh] overflow-hidden bg-black flex items-center justify-center">
  {children}
</div>
```

**`ShareViewer`** outer div:
```tsx
<div className="relative w-full h-full flex items-center justify-center" ref={containerRef}>
  <ShareCanvas ... />
  <FloatingRemote ... />
</div>
```

The canvas wrapper gets `ref={containerRef}` so the size hook can measure it directly.

---

## Step 2 — Container-measured canvas size hook

**`src/core/hooks/useShareCanvasSize.ts`** — uses `ResizeObserver` on a ref instead of `window.innerHeight`.

Why: `100dvh` in CSS is smarter than `window.innerHeight` in JS. Browser chrome hide/show causes `innerHeight` to flicker; observing the DOM container avoids this entirely.

```ts
export function useShareCanvasSize(
  containerRef: RefObject<HTMLElement>,
  aspectRatio = 4/3
): CanvasSize {
  const [size, setSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width: vw, height: vh } = entry.contentRect;
      // Fit canvas within both dimensions, preserve aspect ratio
      const byWidth = { w: vw, h: vw / aspectRatio };
      const use = byWidth.h <= vh ? byWidth : { w: vh * aspectRatio, h: vh };
      setSize({ width: Math.floor(use.w), height: Math.floor(use.h) });
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef, aspectRatio]);

  return size;
}
```

---

## Step 3 — Remove below-canvas controls

Delete the `<div className="mt-4 flex items-center gap-3">` controls block from `ShareViewer`. Controls move entirely into `FloatingRemote`.

---

## Step 4 — FloatingRemote component

**File**: `src/features/animation/components/Canvas/FloatingRemote.tsx`

### Layout
```
[ ⠿ ]  [ ▶ ]  3/12
  ↑      ↑      ↑
handle  play   counter
```

Pill: `rounded-full bg-black/60 backdrop-blur-sm border border-white/20`
Approx width: 120px, height: 44px (minimum touch target height)

### Drag: Dedicated handle only

The **GripVertical** lucide icon on the LEFT side is the only drag trigger. The play button and frame counter are interactive elements with their own `onClick`; they do not participate in drag.

```tsx
<div ref={pillRef} style={{ position: 'absolute', left: pos.x, top: pos.y, touchAction: 'none' }}>
  {/* DRAG HANDLE — only this div triggers drag */}
  <div
    onPointerDown={handleDragStart}
    className="cursor-grab active:cursor-grabbing px-2 py-3 text-white/40"
  >
    <GripVertical className="w-4 h-4" />
  </div>

  {/* PLAY/PAUSE — standard click, no drag */}
  <button onClick={togglePlay} className="w-11 h-11 flex items-center justify-center text-white">
    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
  </button>

  {/* FRAME COUNTER */}
  <span className="text-xs text-white/60 tabular-nums pr-3">{current}/{total}</span>
</div>
```

Play button is `w-11 h-11` (44×44px) — meets Apple/Android touch target minimum.

### Reset: Double-tap play button

No separate reset icon. Double-tap (two taps within 300ms) on the play button resets to frame 1 and resumes. Avoids tiny icons, keeps pill small.

Implementation: track `lastTap` timestamp in a ref, compare on each tap.

### Position state: percentage-based

Store position as percentage of container dimensions so orientation changes don't orphan the remote:

```ts
const [pos, setPos] = useState({ xPct: 0.85, yPct: 0.85 }); // bottom-right default

// Derive absolute pixels for rendering:
const absX = pos.xPct * containerWidth - PILL_WIDTH;
const absY = pos.yPct * containerHeight - PILL_HEIGHT;

// On drag end: convert back to percentage and clamp 0–1
```

On orientation flip, percentage is unchanged — computed pixels auto-adjust.

### Safe area inset

Apply safe area as a minimum bottom constraint in the clamp logic:

```ts
const minY = 0;
const maxY = containerHeight - PILL_HEIGHT - safeAreaBottom; // safeAreaBottom ≈ 34px on iPhone
```

Read safe area via a hidden sentinel div with `padding-bottom: env(safe-area-inset-bottom)` measured via `getComputedStyle`.

---

## Step 5 — Back-to-site link

Keep as `absolute bottom-2 left-3` — bottom-left corner, away from the remote's default bottom-right position.

Add safe-area offset: `style={{ bottom: 'calc(8px + env(safe-area-inset-bottom, 0px))' }}`.

---

## Handoff Prompt (for a clean agent session)

```
You are implementing epic T055: Mobile Share Viewer Redesign.

**Goal**: Fix two problems on the /share/[id] route on mobile:
1. The page scrolls — canvas + controls are taller than the viewport
2. Controls sit below the pitch — replace with a draggable floating remote overlaid on the canvas

**Full plan**: docs/plans/mobile-share-viewer-redesign.md

**Cleo session**: Already active — scope epic:T055. Session name: "Mobile Share Viewer Redesign"
Run `ct session status` to confirm, then `ct focus set T056` to begin the first task.

**Task order** (follow dependencies):
  T056 — useShareCanvasSize hook (START HERE)
  T057 — Full-screen share layout (depends T056)
  T058 — FloatingRemote component (depends T056, parallel with T057)
  T059 — Wire FloatingRemote into ShareViewer (depends T057 + T058)
  T060 — E2E tests (depends T059)

**Key files to read first**:
- src/features/animation/components/ShareViewer.tsx (main file to change)
- src/core/hooks/useCanvasSize.ts (existing hook to model the new one on)
- src/app/share/layout.tsx (layout wrapper to update)

**Key design decisions** (do not re-litigate):
- Drag handle only: GripVertical icon on left of pill — do NOT make the whole pill draggable
- Position as percentage (xPct/yPct), not absolute pixels — survives orientation changes
- Double-tap play = reset — no separate reset icon
- Safe area: clamp maxY using env(safe-area-inset-bottom) (~34px on iPhone)
- ResizeObserver on container ref — not window.innerHeight (avoids browser chrome flicker)

**Before starting**: run `npm run lint && npx tsc --noEmit` to confirm clean baseline.
**After each task**: run lint + tsc, then `ct complete <id>` before moving to next task.
**After T059**: run `npm run dev` and manually test on mobile viewport (375px) in browser devtools.
```

---

## Verification Checklist

- [ ] `/share/[id]` on 375px mobile — no scroll, canvas fills screen
- [ ] Orientation change (portrait → landscape) — remote stays in bounds
- [ ] Drag handle moves remote; play button still toggles cleanly
- [ ] Double-tap play — resets to frame 1 and resumes
- [ ] iPhone 14 Pro (390×844) — remote default position clears home indicator
- [ ] Desktop (800px+) — canvas caps at max width, remote still draggable
- [ ] Autoplay fires after 100ms on load
