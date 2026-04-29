# Phase 0 Research: Workflow Clarity (Phase 2h)

**Date**: 2026-04-29  
**Branch**: `011-workflow-clarity`

---

## Summary

The spec was written before the codebase was audited. Spec 006 (share-workflow, shipped 2026-04-26) implemented the majority of what Phase 2h describes. The actual remaining work is **two targeted changes**.

---

## Area 1 — Gallery Card Click Navigation (FLOW-001)

### Public Gallery

**Finding**: Already implemented.

`GalleryClient.tsx:179–181`:
```typescript
const handleView = (id: string) => {
  router.push(`/share/${id}`);
};
```
`PublicAnimationCard.tsx:137`: `onClick={() => onView(animation.id)}` → calls the above.

**Decision**: No change needed for public gallery.

### My-Gallery

**Finding**: Thumbnail Play overlay goes to editor, not share view.

`my-gallery/page.tsx:166–168`:
```typescript
const handlePlay = (id: string) => {
  router.push(`/app?load=${id}`);  // ← opens in editor
};
```

`AnimationCard.tsx:122`: `onClick={() => onPlay?.(animation.id)}` — the Play overlay calls onPlay.

**Context**: AnimationCard has a separate Edit button (Pencil, line 244) that also calls `onEdit` → editor. With Edit available separately, the Play overlay should semantically open the share view, not the editor.

**Decision**: Change `handlePlay` in `my-gallery/page.tsx` to `router.push('/share/${id}')`.

---

## Area 2 — Editor Share Button (EDITOR-002)

**Finding**: Fully implemented in spec 006. `ShareButton.tsx` (168 lines):
- Auth guard with sonner toast prompt (lines 42–51)
- Calls `useShareAnimation` hook to save+get URL (line 53)
- Web Share API on mobile (lines 62–72)
- Desktop modal with clipboard copy + visual copied state (lines 79–87, 115–164)
- Sonner toast on errors (lines 56, 86)

**Decision**: No changes needed. EDITOR-002 is resolved.

---

## Area 3 — ShareViewer Back Link (FLOW-002)

**Finding**: Title overlay already exists (ShareViewer.tsx:271–278). Progression nav already exists (lines 305–341). Back-to-site link exists (lines 344–355) but targets `/`, not `/gallery`.

Current back link (lines 344–355):
```typescript
<a
  href="/"           // ← needs to be /gallery
  className="absolute left-3 flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
  style={{ bottom: 'calc(8px + env(safe-area-inset-bottom, 0px))' }}
>
  <BrandIcon variant="share-viewer" className="brightness-0 invert opacity-60" />
  <span className="hidden sm:inline">Coaching Animator</span>
</a>
```

The outer container is `position:fixed; inset:0` (line 265). The back link is positioned `absolute` within that container, so it is already correctly anchored.

**Decision**: Change `href="/"` to `href="/gallery"`. Update the display label to something like "← Gallery" or show "Back to Gallery" text. Keep the existing positioning and styling unchanged.

---

## Area 4 — Toast/Notification System

**Finding**: Project uses `sonner` throughout.
- Setup: `src/app/layout.tsx:70` — `<Toaster position="bottom-left" />`
- Import: `import { toast } from 'sonner'`
- Methods: `toast.success()`, `toast.error()`, `toast.info()`

AnimationCard handleCopyLink uses `setCopied` visual toggle (not a sonner toast). This is an acceptable UX pattern — no change needed for GALLERY-002.

---

## Area 5 — Share ID Construction

**Finding**: All share URLs use `animation.id` (UUID primary key, `saved_animations.id`).  
Pattern: `` `${window.location.origin}/share/${animation.id}` `` — consistent across all components.  
No utility function exists; template literals are used inline.

**Decision**: No new utility needed.

---

## Spec vs Reality Delta

| Spec FR | Reality | Work needed |
|---------|---------|-------------|
| FR-001 (editor clipboard copy) | Done — ShareButton modal + clipboard | None |
| FR-002 (editor Web Share API) | Done — ShareButton native share | None |
| FR-003 (save-first prompt) | Done — auth guard shows prompt | None |
| FR-004 (share view title) | Done — ShareViewer gradient overlay | None |
| FR-005 (back-to-gallery link) | Partial — link exists, goes to `/` | **Fix href** |
| FR-006 (overlay layout safety) | Done — absolute within relative wrapper | None |
| FR-007 (gallery card → /share) | Done — GalleryClient uses /share | None |
| FR-008 (my-gallery play → /share) | Missing — goes to editor | **Fix handlePlay** |
| FR-009 (gallery share button clipboard) | Done — AnimationCard handleCopyLink | None |
| FR-010 (gallery share Web Share API) | Missing — no Web Share API call | Low priority P3 |
| FR-011 (clipboard toast) | Partial — visual toggle, not sonner toast | Low priority P3 |
| FR-012 (/replay preserved) | Done — route untouched | None |

**Net remaining work**: 2 targeted changes (FR-005, FR-008). FR-010 and FR-011 are nice-to-haves; add as P3 tasks.

---

## Remaining Issues After Phase 2h

These issues will need separate treatment (Phase 3f or later):
- `AnimationCard.tsx:190`: Remix attribution still links to `/replay/` route (not `/share/`)
- FLOW-003 (Welcome page for players receiving share links) — out of scope for 2h
