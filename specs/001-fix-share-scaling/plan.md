# Implementation Plan: Fix Mobile Replay Scaling

**Branch**: `001-fix-share-scaling` | **Date**: 2026-04-18 | **Spec**: `specs/001-fix-share-scaling/spec.md`

## Summary

The `ShareViewer` canvas renders at `800×600` on first paint (hook default) before `ResizeObserver` corrects it — a visible jump on mobile. The loading placeholder also shows a non-full-screen box. Two targeted file edits fix both issues. Navigation suppression, FloatingRemote safe-area, and the `position:fixed inset:0` architecture are already correct.

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
| Tier alignment (Tier 2 — Public/Link-Shared) | ✅ Pass | Share viewer is unauthenticated read-only |
| No telemetry or analytics | ✅ Pass | No new data collection; existing view_count increment unchanged |
| Entity colors via EntityColors service | ✅ Pass | No color changes in scope |
| Shared canvas — tested on all 3 routes | ✅ Pass | Changes isolated to `useShareCanvasSize` hook (share only) and share `page.tsx`; Canvas components untouched |
| New data: privacy impact assessed | ✅ N/A | No schema changes |
| Supabase joins flattened before use | ✅ N/A | No new queries |

No violations.

---

## Project Structure

### Documentation (this feature)

```text
specs/001-fix-share-scaling/
├── spec.md              # Feature specification (/speckit.specify output)
├── plan.md              # This file
├── research.md          # Phase 0 codebase research ✅
├── data-model.md        # N/A — no schema changes
├── quickstart.md        # Manual test guide ✅ (see below)
├── contracts/           # N/A — no new API contracts
└── tasks.md             # Task list (/speckit.tasks output — NOT created here)
```

### Source Code — Files to Change

```text
src/
├── core/
│   └── hooks/
│       └── useShareCanvasSize.ts        ← Fix initial state (lazy initializer)
└── app/
    └── share/
        └── [id]/
            └── page.tsx                 ← Fix loading placeholder; remove dead wrapper
```

### Source Code — Files Confirmed Unchanged

```text
src/
├── features/animation/components/
│   ├── ShareViewer.tsx                  ✓ Already correct
│   └── Canvas/
│       └── FloatingRemote.tsx           ✓ Safe-area already implemented
├── shared/components/
│   └── Navigation.tsx                   ✓ Already returns null for /share/* 
└── app/
    ├── layout.tsx                       ✓ No change needed
    └── share/
        └── layout.tsx                   ✓ overflow-hidden bg-black is correct
```

---

## Implementation Design

### Change 1 — `src/core/hooks/useShareCanvasSize.ts`

Replace the hard-coded initial state with a lazy initializer:

```typescript
// BEFORE
const [size, setSize] = useState<CanvasSize>({ width: 800, height: 600 });

// AFTER
const [size, setSize] = useState<CanvasSize>(() => {
  if (typeof window === 'undefined') return { width: 800, height: 600 };
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const byWidth = { w: vw, h: vw / aspectRatio };
  const use = byWidth.h <= vh ? byWidth : { w: vh * aspectRatio, h: vh };
  return { width: Math.floor(use.w), height: Math.floor(use.h) };
});
```

**Why this works**: `useState` lazy initializers run once on mount, before the first render. `ShareViewer` is loaded `ssr: false`, so `window` is always available. The `typeof window === 'undefined'` guard is a safety net.

**ResizeObserver role**: The observer still handles subsequent size changes (orientation change, browser chrome show/hide). It's no longer responsible for the initial correct size.

**No regression risk**: `useShareCanvasSize` is only imported by `ShareViewer`. The change is local to the share route.

---

### Change 2 — `src/app/share/[id]/page.tsx`

**Loading placeholder**: Update the `dynamic()` loading component to be full-screen:

```tsx
// BEFORE
loading: () => (
  <div className="animate-pulse bg-white/10 h-[300px] w-full flex items-center justify-center text-white/50">
    Loading…
  </div>
),

// AFTER
loading: () => (
  <div
    className="animate-pulse bg-black flex items-center justify-center text-white/50"
    style={{ position: 'fixed', inset: 0 }}
  >
    Loading…
  </div>
),
```

**Page return**: Remove the unnecessary wrapper around `<ShareViewer />`:

```tsx
// BEFORE
return (
  <div className="min-h-screen bg-black flex flex-col items-center justify-center px-0 py-4">
    <ShareViewer payload={animation.payload} autoPlay={true} />
  </div>
);

// AFTER
return <ShareViewer payload={animation.payload} autoPlay={true} />;
```

**Why the wrapper is safe to remove**: `ShareViewer` uses `position: fixed; inset: 0`, so it occupies the full viewport regardless of its parent. The share layout (`overflow-hidden bg-black`) provides the black background. The wrapper was dead code.

---

## Quickstart — Manual Verification Guide

### Prerequisites

1. `npm run dev` running on port 3000
2. At least one animation in Supabase with `visibility = 'public'` or `'link_shared'`
3. A valid share URL: `http://localhost:3000/share/<animation-id>`

### Test 1 — Mobile viewport, portrait (primary acceptance test)

1. Open Chrome DevTools → Toggle device emulation → Select **iPhone 14** (390×844)
2. Navigate to `http://localhost:3000/share/<id>`
3. **Expected**: Full pitch visible immediately on page load — no oversized flash, no scroll, no pinch needed
4. **Expected**: Canvas fills width (390px), height = 390 / (4/3) = ~293px, centered vertically

### Test 2 — No navigation bar

1. With device emulation still active, inspect the page
2. **Expected**: No `<nav>` element in the rendered HTML for the share route
3. Confirm: canvas occupies full viewport height (no nav-height offset)

### Test 3 — Orientation change

1. In device emulation, rotate to landscape (844×390)
2. **Expected**: Canvas resizes smoothly to landscape dimensions (height-constrained: width = 390 × (4/3) = ~520px)
3. **Expected**: No visible flash or jump

### Test 4 — FloatingRemote

1. On iPhone 14 emulation (has home indicator), verify the play/pause pill is in the bottom-right of the canvas but above the safe area
2. Tap play — animation should start
3. Drag the pill — should stay within canvas bounds

### Test 5 — No regression on other routes

1. Navigate to `/app` — editor should load normally with Navigation visible
2. Navigate to `/gallery` — navigation should be present
3. Navigate to a `/replay/<id>` URL — replay viewer should render at correct size

---

## Complexity Tracking

No constitutional violations. No complexity justification required.
