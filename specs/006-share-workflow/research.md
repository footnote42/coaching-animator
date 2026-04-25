# Research: Share Workflow (006)

**Date**: 2026-04-25  
**Branch**: `006-share-workflow`

---

## Summary

Full codebase audit of the share flow. No unknown decisions remain. All findings are concrete — each maps to a specific file and line.

---

## Finding 1 — `/api/share` route is missing

**Status**: Confirmed bug  
**File**: `src/app/api/share/` (directory exists, empty — no `route.ts`)

The client hook (`src/core/hooks/useShareAnimation.ts:16`) POSTs to `/api/share` expecting `{ id }` in return. The directory exists but the route handler was never written. This causes a 404 in all environments, which the hook surfaces as "Share feature not available in development."

**Decision**: Implement `src/app/api/share/route.ts`.  
**Rationale**: The client is already fully wired to this endpoint. Creating the server handler is the minimal change.  
**Design**: POST handler, requires auth, accepts current project payload (`serializeForShare` output), upserts to `saved_animations` with `visibility: 'link_shared'`, returns `{ id }`. Reuses existing `CreateAnimationSchema` validation pattern from `src/app/api/animations/route.ts`.

---

## Finding 2 — Gallery routes to `/replay/{id}` instead of `/share/{id}`

**Status**: Confirmed bug  
**File**: `src/app/gallery/GalleryClient.tsx:171`

```typescript
router.push(`/replay/${id}`);
```

Should be:
```typescript
router.push(`/share/${id}`);
```

`/replay/{id}` is the old route (non-optimised, full-page, no mobile layout). `/share/{id}` is the mobile-first full-screen experience. This is a one-line fix.

**Decision**: Change the routing in GalleryClient. No other gallery files need changing (AnimationCard's `handleCopyLink` at line 99 already correctly generates `/share/{id}`).

---

## Finding 3 — ShareViewer does not display animation title

**Status**: Confirmed bug  
**File**: `src/features/animation/components/ShareViewer.tsx`

`normalizeReplayPayload()` returns a `ReplayPayload` with `name: String(payload.name || 'Untitled')` (line 82). The `ShareViewer` renders `payload.name` to nothing — it's available but unused in the JSX.

**Decision**: Add a title overlay in the ShareViewer's canvas wrapper div. Positioned top-center, above the FloatingRemote. Uses Oswald/heading font per design system.

---

## Finding 4 — ShareViewer "Powered by" link already exists

**Status**: Already implemented  
**File**: `src/features/animation/components/ShareViewer.tsx` (bottom of component)

The back-to-site link is already rendered:
```tsx
<a href="/" className="absolute left-3 ... text-white/40">
  <BrandIcon variant="share-viewer" ... />
  <span className="hidden sm:inline">Coaching Animator</span>
</a>
```

FR-006 ("Powered by Coaching Animator" footer link) is already satisfied. No change needed here.

---

## Finding 5 — Progression navigation infrastructure already exists

**Status**: API exists, not wired to share view  
**File**: `src/app/api/animations/[id]/progressions/route.ts`

GET `/api/animations/[id]/progressions` returns `{ progressions: [...] }` ordered by `progression_order`. Works for unauthenticated access when the base animation is `link_shared` or `public`.

**Gap**: The share page (`src/app/share/[id]/page.tsx`) only selects `id, title, payload, view_count`. It doesn't fetch progressions or check if this animation IS a progression (has `parent_animation_id`).

**Decision**: In the share page server component, add a second query to fetch:
- `parent_animation_id`, `is_progression`, `progression_order` for the current animation
- If `is_progression = true`: fetch siblings via `parent_animation_id` and include in render
- If `is_progression = false` (base): fetch children from progressions API
- Pass `progressionSiblings: { id: string; title: string; progression_order: number }[]` and `currentProgressionOrder: number | null` as props to `ShareViewer`

**Edge case**: If the progression endpoint returns an empty array, no navigation is shown.

---

## Finding 6 — ShareButton lacks modal and Web Share API

**Status**: Partial implementation  
**File**: `src/features/animation/components/Sidebar/ShareButton.tsx`

The button correctly calls `useShareAnimation(project)`. When successful, `useShareAnimation` copies to clipboard and returns the URL. The ShareButton only shows a `toast.success` — the URL is never displayed to the user.

**Also**: Privacy notice toast is inaccurate — says "stored for 90 days" but the constitution says animations are retained indefinitely. Must be removed or corrected.

**Decision**: 
1. After `shareAnimation()` succeeds, show a modal with the URL (copy button + display URL text)
2. On mobile (Web Share API available): call `navigator.share({ url, title })` directly; fallback to modal if share fails
3. Remove the inaccurate 90-day privacy notice toast

**Web Share API detection**: `typeof navigator.share === 'function'` at call time (not on mount, avoids SSR issues).

---

## Finding 7 — PublicAnimationCard has no share action

**Status**: Gap  
**File**: `src/features/gallery/components/PublicAnimationCard.tsx`

The card has a Play overlay and a Remix button but no share action. Gallery-002 requires a share sheet. 

**Decision**: Add a share button to `PublicAnimationCard` mirroring the `AnimationCard.handleCopyLink` pattern (which already generates `/share/${id}`). On desktop: clipboard copy + "Copied" feedback. On mobile: Web Share API with clipboard fallback.

---

## Finding 8 — AnimationCard play action routes correctly for My Playbook

**Status**: Correct as-is  
**File**: `src/app/my-gallery/page.tsx:131-132`

```typescript
const handlePlay = (id: string) => {
  router.push(`/app?load=${id}`);
```

In "My Playbook," Play loads the animation into the editor for editing — this is the correct UX. The spec's concern (FLOW-001) is specifically about the public gallery. No change needed in My Playbook.

---

## Decisions Summary

| Decision | Rationale | Alternative Rejected |
|----------|-----------|----------------------|
| Implement `/api/share` route | Client already wired to it | Using `project.id` directly — would require visibility state management |
| Show share URL in modal | Toast doesn't display URL | URL-only toast — user can't see the link to verify it |
| Web Share API with clipboard fallback | Native mobile UX; targets WhatsApp | Deep-linking WhatsApp — brittle, not constitutional |
| Gallery routing fix: one-line change | Minimal blast radius | New `PlayButton` component — over-engineering |
| Fetch progressions server-side in share page | SSR, no client waterfall | Client-side fetch in ShareViewer — adds loading state complexity |
| Skip changing My Playbook play action | Loads into editor, correct UX | Would break edit-on-click flow in personal gallery |
