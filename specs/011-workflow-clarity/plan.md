# Implementation Plan: Workflow Clarity (Phase 2h)

**Branch**: `011-workflow-clarity` | **Date**: 2026-04-29 | **Spec**: `specs/011-workflow-clarity/spec.md`

## Summary

Spec 006 (2026-04-26) already implemented the bulk of Phase 2h. The remaining work is two targeted changes:

1. **ShareViewer back link** — change `href="/"` to `href="/gallery"` and update the visible label to "← Gallery". One line change + label text.
2. **My-Gallery Play button** — change `handlePlay` in `my-gallery/page.tsx` from `router.push('/app?load=${id}')` to `router.push('/share/${id}')`. The separate Edit (Pencil) button already handles opening in the editor.

Full research findings are in `research.md`.

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
| Tier alignment (Guest/Auth/Public/Admin) | ✅ | Tier 2 (Public — share view, gallery). No Tier 0/3 changes. |
| No telemetry or analytics | ✅ | No new tracking added |
| Entity colors via EntityColors service | ✅ | No entity color involvement |
| Shared canvas — tested on all 3 routes | ✅ | ShareViewer touched; layout constraint preserved (no canvas changes) |
| New data: privacy impact assessed | ✅ | No schema changes; back link is UI-only |
| Supabase joins flattened before use | ✅ | No new queries |

No violations.

---

## Project Structure

### Files touched by this feature

```text
src/
├── app/
│   └── my-gallery/
│       └── page.tsx                         # Change handlePlay → /share/${id}
│
└── features/
    └── animation/
        └── components/
            └── ShareViewer.tsx              # Change back link href / → /gallery
```

### Documentation (this feature)

```text
specs/011-workflow-clarity/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 codebase research (key findings)
├── quickstart.md        # Manual test guide
└── tasks.md             # Task list (/speckit.tasks output)
```

---

## Implementation Detail

### Change 1 — ShareViewer back link (FLOW-002 / FR-005)

**File**: `src/features/animation/components/ShareViewer.tsx`  
**Current** (line ~346):
```tsx
<a
  href="/"
  className="absolute left-3 flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
  style={{ bottom: 'calc(8px + env(safe-area-inset-bottom, 0px))' }}
>
  <BrandIcon variant="share-viewer" className="brightness-0 invert opacity-60" />
  <span className="hidden sm:inline">Coaching Animator</span>
</a>
```

**Change**:
- `href="/"` → `href="/gallery"`
- Label text: `"Coaching Animator"` → `"← Gallery"` (keep `hidden sm:inline` so it stays icon-only on very small mobile)

No layout, positioning, or style changes needed.

---

### Change 2 — My-Gallery Play button (FLOW-001 / FR-008)

**File**: `src/app/my-gallery/page.tsx`  
**Current** (line ~167):
```typescript
const handlePlay = (id: string) => {
  router.push(`/app?load=${id}`);
};
```

**Change**:
```typescript
const handlePlay = (id: string) => {
  router.push(`/share/${id}`);
};
```

**Safety**: AnimationCard already has a separate Edit (Pencil) button (`onEdit` callback, line 244) that navigates to the editor. Changing Play to `/share/${id}` gives the thumbnail overlay a semantically correct "preview" behaviour without removing edit access.

---

## No Data Model Changes

No schema changes, no new API routes, no new Zod schemas. Skip data-model.md.

---

## Complexity Tracking

No constitutional violations.
