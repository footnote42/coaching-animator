# Implementation Plan: Share Workflow

**Branch**: `006-share-workflow` | **Date**: 2026-04-25 | **Spec**: `specs/006-share-workflow/spec.md`

## Summary

Fix the broken editor share button (missing `/api/share` route), route gallery play actions to `/share/{id}` instead of `/replay/{id}`, display the animation title in the share view, and add progression navigation to the share view. The "Powered by" footer link is already implemented. Progression infrastructure (API) already exists.

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

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Check | Status | Notes |
|-------|--------|-------|
| Tier alignment (Guest/Auth/Public/Admin) | PASS | `/api/share` requires Tier 1 (auth). `/share/{id}` view is Tier 2 (public). Gallery share action generates link — view only, no auth required. |
| No telemetry or analytics | PASS | No tracking added. View count increment already exists in share page — no change. |
| Entity colors via EntityColors service | PASS | No entity color changes in this feature. |
| Shared canvas — tested on all 3 routes | PASS | ShareViewer changes (title overlay) affect `/share/[id]` only. No changes to Stage.tsx, Field.tsx, EntityLayer.tsx. |
| New data: privacy impact assessed | PASS | `/api/share` creates a `saved_animations` record (already established data type). No new PII. Visibility set to `link_shared` — existing constitutional concept. |
| Supabase joins flattened before use | PASS | Progression queries return arrays; must flatten with `Array.isArray(raw) ? raw[0] : raw` pattern where needed. |

---

## Project Structure

### Documentation (this feature)

```text
specs/006-share-workflow/
├── spec.md              ✅ Written
├── plan.md              ✅ This file
├── research.md          ✅ Written
├── data-model.md        (see below — no new schema)
├── quickstart.md        ✅ (see below)
└── tasks.md             (created by /speckit.tasks)
```

### Source Code — Files to Touch

```text
src/
├── app/
│   ├── api/
│   │   └── share/
│   │       └── route.ts                  [CREATE] POST /api/share
│   ├── share/[id]/
│   │   └── page.tsx                      [MODIFY] fetch progressions server-side
│   └── gallery/
│       └── GalleryClient.tsx             [MODIFY] /replay → /share routing (1 line)
│
├── features/
│   ├── animation/
│   │   ├── components/
│   │   │   ├── ShareViewer.tsx           [MODIFY] add title overlay + progression nav props
│   │   │   └── Sidebar/
│   │   │       └── ShareButton.tsx       [MODIFY] add modal + Web Share API
│   └── gallery/
│       └── components/
│           └── PublicAnimationCard.tsx   [MODIFY] add share action
```

---

## Complexity Tracking

No constitutional violations. No complexity entries required.

---

## Phase 0: Research (Complete)

See `specs/006-share-workflow/research.md` for full findings. All decisions resolved.

**Key decisions:**
1. Implement `/api/share` route — client is already wired to it; server handler is missing
2. Gallery fix is a one-line routing change
3. Animation title display — `payload.name` is available in `normalizeReplayPayload` but unused in JSX
4. "Powered by" link — already implemented, no change needed
5. Progression navigation — fetch server-side in the share page, pass as props to ShareViewer
6. ShareButton modal — show URL after copy instead of toast-only
7. PublicAnimationCard — add share action mirroring AnimationCard's existing clipboard pattern

---

## Phase 1: Design & Implementation Blueprint

### Task 1 — Create `/api/share` route

**File**: `src/app/api/share/route.ts`  
**Complexity**: medium

```
POST /api/share
- Requires auth (use requireAuth() from src/lib/server/auth)
- Body: SharePayloadV2 (output of serializeForShare)
- Validate payload size with validatePayloadSize()
- Upsert into saved_animations:
    title: payload.name || 'Untitled Animation'
    visibility: 'link_shared'
    animation_type: 'tactic' (default for share-created animations)
    payload: body
    user_id: user.id
    frame_count: body.frames.length
    duration_ms: computed from frames
- Return: { id: string }
- Error handling: 401 (no auth), 413 (payload too large), 500 (DB error)
- Rate limit: reuse checkRateLimit() pattern from existing routes
```

**Pattern to follow**: `src/app/api/animations/route.ts` POST handler — same auth, validation, and Supabase insert pattern. Strip unnecessary fields (thumbnail, tags, etc.) since share-created animations don't need them initially.

**Note**: When an animation is shared via this endpoint, it creates a new `saved_animations` record. The coach can later find it in My Playbook. This is the intended behaviour — sharing creates a permanent cloud copy.

---

### Task 2 — Fix gallery routing (one-line change)

**File**: `src/app/gallery/GalleryClient.tsx:171`  
**Complexity**: small

```diff
- router.push(`/replay/${id}`);
+ router.push(`/share/${id}`);
```

---

### Task 3 — Add share action to PublicAnimationCard

**File**: `src/features/gallery/components/PublicAnimationCard.tsx`  
**Complexity**: small

Add a share button to the card actions area. Mimic `AnimationCard`'s `handleCopyLink` pattern (line 97–106):

```typescript
const handleShare = async (e: React.MouseEvent) => {
  e.stopPropagation();
  const url = `${window.location.origin}/share/${animation.id}`;
  
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ url, title: animation.title });
      return;
    } catch {
      // share dismissed or failed — fall through to clipboard
    }
  }
  
  try {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  } catch {
    // clipboard also failed — silent
  }
};
```

Add `copied` state. Add a share icon button (use `Share2` from lucide-react) in the card's action row. Show `Check` icon when `copied` is true (2-second flash), same pattern as AnimationCard.

---

### Task 4 — Enhance ShareButton (Editor sidebar)

**File**: `src/features/animation/components/Sidebar/ShareButton.tsx`  
**Complexity**: medium

Two changes:

**a) Add share modal**: After `shareAnimation()` succeeds and returns a URL, instead of only `toast.success`, open a modal that displays the URL and a copy button. Use `Dialog` from `src/shared/ui/` (existing Radix primitive). Modal content:
- Title: "Share Link"
- Short explanation: "Send this link to your players — they can watch the animation on their phone, no account needed."
- URL input (readonly) showing the full `/share/{id}` URL
- Copy button with `Check` feedback
- Dismiss button

**b) Add Web Share API**: Before showing the modal, check `typeof navigator.share === 'function'`. If true, call `navigator.share({ url, title: project.name })`. If share is dismissed (AbortError), fall back to the modal. If supported and succeeds, skip the modal entirely.

**c) Remove inaccurate privacy notice**: The current code shows a `toast.info` about "90 days" retention. This contradicts the constitution (animations retained indefinitely). Remove the `PRIVACY_NOTICE_KEY` localStorage check and the toast entirely.

---

### Task 5 — Display animation title in ShareViewer

**File**: `src/features/animation/components/ShareViewer.tsx`  
**Complexity**: small

`payload.name` is already available via `normalizeReplayPayload()`. Add a title overlay:

```tsx
{/* Title — top-center overlay, above canvas content */}
<div
  className="absolute top-0 left-0 right-0 px-4 py-2 bg-gradient-to-b from-black/60 to-transparent pointer-events-none"
  style={{ zIndex: 10 }}
>
  <h1 className="text-white font-heading font-bold text-sm sm:text-base truncate text-center">
    {payload.name}
  </h1>
</div>
```

Position this inside the `<div style={{ position: 'relative', width: canvasWidth, height: canvasHeight }}>` wrapper, above `<ShareCanvas>` in the DOM order (renders on top due to z-index). The gradient ensures readability without obscuring the pitch.

---

### Task 6 — Add progression navigation to share view

**Two parts:**

#### Part A — Share page: fetch progression siblings server-side

**File**: `src/app/share/[id]/page.tsx`  
**Complexity**: medium

Extend the initial query to include `parent_animation_id`, `is_progression`, `progression_order`:

```typescript
const { data: animation } = await supabase
  .from('saved_animations')
  .select('id, title, payload, view_count, parent_animation_id, is_progression, progression_order')
  .eq('id', id)
  .is('hidden_at', null)
  .in('visibility', ['public', 'link_shared'])
  .single();
```

Then compute `progressionSet`:
```typescript
// Type for navigation items
type ProgressionNavItem = { id: string; title: string; progression_order: number };

let progressionSet: ProgressionNavItem[] = [];
let currentProgressionOrder: number | null = null;

if (animation.is_progression && animation.parent_animation_id) {
  // This is a progression — fetch parent then its siblings
  const { data: siblings } = await supabase
    .from('saved_animations')
    .select('id, title, progression_order')
    .eq('parent_animation_id', animation.parent_animation_id)
    .eq('is_progression', true)
    .is('hidden_at', null)
    .in('visibility', ['public', 'link_shared'])
    .order('progression_order', { ascending: true });
  
  progressionSet = siblings ?? [];
  currentProgressionOrder = animation.progression_order ?? null;
} else if (!animation.is_progression) {
  // This is a base animation — fetch its progressions
  const { data: progressions } = await supabase
    .from('saved_animations')
    .select('id, title, progression_order')
    .eq('parent_animation_id', id)
    .eq('is_progression', true)
    .is('hidden_at', null)
    .in('visibility', ['public', 'link_shared'])
    .order('progression_order', { ascending: true });
  
  progressionSet = progressions ?? [];
  // base animation has no order itself — treat as the "0" slot
  currentProgressionOrder = 0;
}
```

Pass `progressionSet` and `currentProgressionOrder` to `ShareViewer`:

```tsx
return (
  <ShareViewer
    payload={animation.payload}
    animationTitle={animation.title}
    animationId={id}
    progressionSet={progressionSet}
    currentProgressionOrder={currentProgressionOrder}
    autoPlay={true}
  />
);
```

#### Part B — ShareViewer: render progression navigation

**File**: `src/features/animation/components/ShareViewer.tsx`  
**Complexity**: medium

Add new props to `ShareViewerProps`:
```typescript
interface ShareViewerProps {
  payload: unknown;
  autoPlay?: boolean;
  animationTitle?: string;          // Override payload name (server-provided, authoritative)
  animationId?: string;
  progressionSet?: { id: string; title: string; progression_order: number }[];
  currentProgressionOrder?: number | null;
}
```

Use `animationTitle` (if provided) in preference to `payload.name` for the title overlay — the server title is authoritative and always up to date.

When `progressionSet` is non-empty:
- Sort by `progression_order`
- Find current index: `progressionSet.findIndex(p => p.progression_order === currentProgressionOrder)`
- If `currentProgressionOrder === 0` (base animation), treat as index -1 or a special "Base" slot preceding the progression list
- Render a bottom-center navigation bar:
  ```tsx
  {progressionSet.length > 0 && (
    <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-3 px-4"
         style={{ zIndex: 20, bottom: 'calc(48px + env(safe-area-inset-bottom, 0px))' }}>
      {prevItem && (
        <a href={`/share/${prevItem.id}`}
           className="px-3 py-1 bg-black/60 text-white/80 text-xs font-mono hover:bg-black/80">
          ← Prev
        </a>
      )}
      <span className="px-3 py-1 bg-black/80 text-white text-xs font-mono">
        {currentLabel} / {totalLabel}
      </span>
      {nextItem && (
        <a href={`/share/${nextItem.id}`}
           className="px-3 py-1 bg-black/60 text-white/80 text-xs font-mono hover:bg-black/80">
          Next →
        </a>
      )}
    </div>
  )}
  ```
- Navigation uses `<a href>` not `router.push` — full page navigation to load the new animation cleanly
- Positioned above the `FloatingRemote` (which defaults to bottom-right)

**Note on base animation navigation slot**: The "base" animation (progression_order = 0) is the starting point. When viewing a progression, the prev button for the first progression will point to the base animation's `/share/{id}`. This requires the base animation's ID, which is `animation.parent_animation_id` in the page component — pass it as part of the navigation set or as a separate `baseAnimationId` prop.

Simpler approach: For the base animation page, include itself in the nav set as "Base" at slot 0. For a progression page, fetch the parent ID and include it as slot 0. Build a unified `fullNavigationSet: { id: string; label: string }[]` in the page component, where slot 0 is always the base.

---

## Data Model

No schema changes required. All necessary fields (`parent_animation_id`, `is_progression`, `progression_order`, `visibility`) already exist in `saved_animations`. The `/api/share` route creates a new record of the existing type.

---

## Contracts

### POST /api/share

**Request**:
```typescript
// Body: SharePayloadV2 from serializeForShare (src/core/utils/serializeForShare.ts)
// Content-Type: application/json
// Auth: Required (Supabase session cookie)
```

**Response (200)**:
```typescript
{ id: string } // UUID of the created saved_animations record
```

**Error responses**:
```typescript
401: { error: 'Unauthorized' }
413: { error: 'Payload too large' }
429: { error: 'Rate limit exceeded' }
500: { error: 'Internal server error' }
```

**Side effects**:
- Creates a `saved_animations` row with `visibility: 'link_shared'`
- Animation appears in coach's "My Playbook" after this

---

## Quickstart: Manual Test Guide

**Prerequisites**: Dev server running (`npm run dev`). Must be logged in with a Supabase account.

### Test 1 — Editor Share Button

1. Open `/app`, create or load an animation
2. In the sidebar, find the "Share Link" button under "Share"
3. Click it — should NOT see a toast about "90 days"
4. On desktop: expect a modal with the `/share/{id}` URL and a copy button
5. On mobile (or with DevTools mobile emulation): expect the native share sheet
6. Copy the link and open in a new private/incognito window — animation should play

### Test 2 — Gallery Play Routing

1. Open `/gallery`
2. Click the play overlay on any public animation card
3. URL should change to `/share/{id}` (not `/replay/{id}`)
4. Animation should play in the full-screen mobile-optimised share view

### Test 3 — Gallery Share Action

1. Open `/gallery`
2. Find the Share button on any public animation card
3. Click it — desktop: link copied to clipboard; mobile: native share sheet
4. Paste the link — should be `https://...domain.../share/{id}`

### Test 4 — Share View Title

1. Open any `/share/{id}` URL
2. Animation name should appear as a title overlay at the top of the canvas

### Test 5 — Progression Navigation

1. Find (or create) an animation that has progressions
2. Open its `/share/{id}` link
3. A prev/next navigation bar should appear above the FloatingRemote
4. Clicking Next → routes to the next progression's share link
5. On a progression page, Prev ← returns to the base or previous progression

### Test 6 — Not Found

1. Open `/share/00000000-0000-0000-0000-000000000000` (invalid ID)
2. Should see Next.js 404 page — no crash, no white screen

---

## Phase 2: Agent Context Update

<!-- SPECKIT START -->
Current plan: specs/006-share-workflow/plan.md
<!-- SPECKIT END -->
