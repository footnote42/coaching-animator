
# T015: Mobile-Optimised Replay Screen (Share Flow)

**Date**: 2026-02-19
**Status**: Ready for implementation (pending T014 smoke tests)

## Context

The WhatsApp share flow — `link → mobile browser → watch` — requires auto-play on arrival and a stripped, canvas-first UI. The existing `/replay/[id]` route is already responsive and auth-free, but it carries full chrome (global nav, coaching notes, footer CTA) and requires a manual Play tap. A new `/share/[id]` route solves this cleanly with zero risk to the existing route.

---

## Investigation Summary

### What already exists
- `/replay/[id]/page.tsx` — server component, Supabase query filtered to `public`/`link_shared`, no auth required
- `ReplayViewer.tsx` — local React state only (not Zustand), already decoupled from editor
- `useReplayAnimationLoop.ts` — store-free RAF loop, pure callbacks
- `useCanvasSize(800, 4/3)` — SSR-safe responsive sizing, RAF-debounced, already used in ReplayViewer
- Canvas components (Stage, Field, EntityLayer, AnnotationLayer, PlayerToken) — already accept `interactive={false}` to strip all editor behaviour
- E2E tests: `tests/e2e/replay-mobile.spec.ts`, `tests/e2e/mobile-replay.spec.ts` — cover existing `/replay/[id]` route (must pass as baseline, must not regress)

### What is missing
1. **Auto-play** — ReplayViewer requires a user tap; share flow needs playback on mount
2. **Stripped chrome** — nav, coaching notes, footer must be absent; share context is watch-only
3. **A dedicated share URL** — `/share/[id]` signals intent in the URL and to link-preview scrapers

---

## Ranked Options

| # | Option | Summary | Confidence |
|---|--------|---------|-----------|
| 1 | **New `/share/[id]` route** (recommended) | Separate route, stripped chrome, auto-play, zero regression risk | High |
| 2 | `?autoplay=1` on existing route + CSS chrome hide | Single URL, but nav cannot be suppressed from a child page without hacks | Medium |
| 3 | CSS-only (no autoplay) | Near-zero effort but fails auto-play requirement entirely | Low |
| 4 | Fullscreen toggle | iOS Safari WebView blocks requestFullscreen; two-step flow not zero-step | Low |
| 5 | Composable primitives refactor | Correct long-term architecture but disproportionate to current scope | Out of scope |

---

## Recommended Approach: New `/share/[id]` route

### Files to create

**`src/app/share/[id]/page.tsx`**
Server component. Same Supabase query as `/replay/[id]/page.tsx` (`visibility in ('public', 'link_shared')`, `hidden_at is null`). Renders `<ShareViewer>` inside a full-height dark container. No coaching notes section. No footer. OG metadata: "Watch [title]" framing with `og:image` (absolute URL via `NEXT_PUBLIC_BASE_URL`). Passes `autoPlay={true}` to viewer. Increments view count (same mechanism as `/replay/[id]`).

**`src/features/animation/components/ShareViewer.tsx`**
Thin wrapper around ReplayViewer internals. Accepts `autoPlay?: boolean`. On mount with autoPlay: fires `setIsPlaying(true)` after 100ms delay (canvas needs one paint cycle post dynamic-import hydration). `loopPlayback` defaults to `true` in share mode. Renders only: canvas + play/pause button + reset button + frame counter. Strips: frame strip thumbnails, speed selector, coaching notes. Calls `useCanvasSize` with zero padding (full-bleed canvas).

**`src/app/share/layout.tsx`**
Minimal layout: `<div className="min-h-screen bg-black">{children}</div>`. Dark background appropriate for a watch context.

**`tests/e2e/share-replay.spec.ts`**
New E2E test. Covers: auto-play starts within 500ms of load, nav bar absent from DOM, canvas fills viewport width on 375px, play/pause button ≥ 48px touch target, pause/restart functional.

### Files to modify

**`src/shared/components/Navigation.tsx`**
Add early-return guard using the `usePathname()` hook that already exists in this component:
```tsx
if (pathname.startsWith('/share/')) return null;
```
Location: after existing `usePathname()` call, before any JSX. Two lines. Regression check: `/replay/[id]` and `/gallery` still render nav.

**`src/features/animation/components/ReplayViewer.tsx`**
Add `autoPlay?: boolean` to `ReplayViewerProps`. Add one `useEffect`:
```tsx
useEffect(() => {
  if (autoPlay && frames.length > 0) {
    const t = setTimeout(() => setIsPlaying(true), 100);
    return () => clearTimeout(t);
  }
}, [autoPlay, frames.length]);
```
No changes to default behaviour. Existing replay route is unaffected (does not pass `autoPlay`).

**`src/app/replay/[id]/page.tsx`** *(optional, T015-E sub-task)*
Extract Supabase fetch into `src/lib/supabase/fetchAnimation.ts` shared utility to eliminate query duplication between replay and share pages.

---

## Task Structure (CLEO)

```
T015 (Epic): Mobile-optimised replay screen
│
├── T015-A [small]: Add autoPlay prop to ReplayViewer
│   Files: ReplayViewer.tsx
│
├── T015-B [medium]: Create /share/[id] route and ShareViewer
│   Files: src/app/share/[id]/page.tsx, src/features/animation/components/ShareViewer.tsx, src/app/share/layout.tsx
│   Includes: view count increment, generateMetadata with og:title + og:image
│   Depends on: T015-A
│
├── T015-C [small]: Suppress Navigation on /share/* routes
│   Files: src/shared/components/Navigation.tsx
│   Depends on: T015-B
│
├── T015-D [small]: E2E tests for share route
│   Files: tests/e2e/share-replay.spec.ts
│   Depends on: T015-B, T015-C
│
└── T015-E [small, optional]: Extract shared fetchAnimation utility
    Files: src/lib/supabase/fetchAnimation.ts + both page.tsx files
    Depends on: T015-B
```

---

## Verification

### Pre-implementation baseline
```bash
npm run e2e -- --grep "replay"   # Both replay-mobile and mobile-replay tests must pass
npm run lint && npx tsc --noEmit # Clean baseline
```

### Post T015-A
- Open `/replay/[id]` without `autoPlay` prop — no behaviour change (still requires click)

### Post T015-B + T015-C
- Navigate to `/share/[known-public-id]` in DevTools mobile emulation (375×667)
- Animation starts within ~300ms without any user interaction
- `<nav>` absent from DOM on `/share/[id]`
- `<nav>` present on `/replay/[id]` (regression check)
- Canvas spans full viewport width, no horizontal overflow
- No coaching notes or footer CTA in DOM

### Post T015-D
```bash
npm run lint && npx tsc --noEmit
npm run e2e -- --grep "share"    # New tests pass
npm run e2e -- --grep "replay"   # Existing tests still pass
```

---

## Key Design Decisions

**Why 100ms auto-play delay?** ReplayViewer is loaded via `next/dynamic` with `ssr: false`. The canvas Konva stage needs one paint cycle after hydration. 100ms is imperceptible to users but reliable for canvas readiness.

**Why not `?autoplay=1` on existing route?** The nav cannot be suppressed from inside a child page in Next.js App Router without JavaScript guards. A separate route is architecturally cleaner and makes the share intent explicit in the URL.

**Why not touch `loopPlayback` default in ReplayViewer?** ShareViewer sets its own default without modifying `ReplayViewer` props, keeping the existing replay UX unchanged.

**OG image URL**: WhatsApp requires `og:image` to be an absolute URL. Use `NEXT_PUBLIC_BASE_URL` env var or the `headers().get('host')` pattern. A sport-specific icon or generic field image is sufficient — no need for dynamic animation screenshots.

---

## Resolved Decisions

- **View count**: `/share/[id]` increments view count, same as `/replay/[id]`
- **OG metadata**: `og:title` ("Watch [title]") + `og:image` (absolute URL) included in T015-B scope

---

## Handoff Prompt

```
coaching-animator — T015 implementation

Branch: main
Context: Phase 0-1 complete. T014 (staging Supabase) done and smoke-tested. T015 is next.

## What T015 is

A mobile-optimised share route for the WhatsApp flow:
  WhatsApp link → /share/[id] → auto-plays, no nav, no coaching notes

The plan is at docs/plans/T015-mobile-replay.md. Read it fully before starting.

## CLEO session start

ct session list
ct session start --scope epic:T015 --auto-focus --name "T015 mobile share route"

## Implementation order

1. T015-A: Add autoPlay prop to ReplayViewer.tsx (small, ~10 lines)
2. T015-B: Create /share/[id] route, ShareViewer component, share layout (medium)
   - Include view count increment (same mechanism as /replay/[id] if it increments)
   - Include generateMetadata with og:title + og:image (absolute URL via NEXT_PUBLIC_BASE_URL)
3. T015-C: Suppress Navigation on /share/* in Navigation.tsx (2-line guard)
4. T015-D: E2E tests — tests/e2e/share-replay.spec.ts
   - First read tests/e2e/replay-mobile.spec.ts and tests/e2e/mobile-replay.spec.ts to avoid duplication
5. T015-E (optional): Extract shared fetchAnimation utility to src/lib/supabase/fetchAnimation.ts

## Pre-implementation checks

npm run lint && npx tsc --noEmit   # Clean baseline
npm run e2e -- --grep "replay"     # Baseline E2E must pass

## Key files

- src/features/animation/components/ReplayViewer.tsx  (add autoPlay prop)
- src/app/replay/[id]/page.tsx                        (pattern to follow for share route)
- src/shared/components/Navigation.tsx                (add /share/* guard)
- src/core/hooks/useCanvasSize.ts                     (understand before ShareViewer sizing)
- tests/e2e/replay-mobile.spec.ts                     (read before writing new tests)

## Constitutional constraints

- No new npm dependencies
- No auth required for /share/[id] (link_shared / public visibility only)
- No telemetry, tracking, or analytics
```
