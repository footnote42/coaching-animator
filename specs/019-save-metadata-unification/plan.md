# Implementation Plan: Save & Metadata Unification

**Branch**: `019-save-metadata-unification` | **Date**: 2026-05-04 | **Spec**: `specs/019-save-metadata-unification/spec.md`

## Summary

Extend `AnimationSummary` and `GET /api/animations` to include `description`, `coaching_notes`, `tags`, and `video_url`; add Tags and YouTube URL inputs to `EditMetadataModal` with an optimistic in-memory patch on save; remove the standalone `MetadataSheet` and its trigger from the editor sidebar.

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
| Tier alignment (Guest/Auth/Public/Admin) | ✅ | Edit metadata is Tier 1 (auth required); reads via GET are owner-only per existing RLS |
| No telemetry or analytics | ✅ | No new tracking introduced |
| Entity colors via EntityColors service | ✅ | No entity color changes |
| Shared canvas — tested on all 3 routes | ✅ N/A | No canvas changes |
| New data: privacy impact assessed | ✅ | No new columns — `tags` and `video_url` already exist; merely exposing them in the list query |
| Supabase joins flattened before use | ✅ | No new joins; existing `remixed_from` flatten pattern retained |

---

## Project Structure

### Documentation (this feature)

```text
specs/019-save-metadata-unification/
├── spec.md              ✅ complete
├── plan.md              ← this file
├── research.md          ← Phase 0 output (below)
├── data-model.md        ← Phase 1 output (below)
├── quickstart.md        ← Phase 1 output (below)
└── tasks.md             (created by /speckit.tasks)
```

### Source Files Touched

```text
src/
├── app/
│   ├── api/animations/route.ts               ← extend SELECT string (API-001)
│   └── my-gallery/page.tsx                   ← optimistic patch in handleEditSave
│
├── features/
│   └── animation/components/
│       └── Sidebar/
│           ├── ProjectActions.tsx            ← remove MetadataSheet button + import
│           └── MetadataSheet.tsx             ← DELETE
│
├── features/
│   └── gallery/components/
│       └── AnimationCard.tsx                 ← extend AnimationSummary interface
│
└── shared/components/
    └── EditMetadataModal.tsx                 ← add Tags + YouTube URL; fix description limit; optimistic onSave
```

---

## Complexity Tracking

No constitutional violations.

---

## Phase 0: Research

*All unknowns resolved via codebase inspection. No external research required.*

### Decision Log

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| Optimistic patch via `setAnimations` in `my-gallery/page.tsx` | Avoids full `fetchAnimations()` refetch; instant feedback; no flicker | Refetch list (rejected — unnecessary network round-trip); page reload (rejected — hostile UX) |
| Keep `onSave` callback signature change to `(updated: Partial<AnimationSummary>) => void` | Carries changed fields back to parent for in-place patch | Returning the full updated record from PUT (overkill — parent already has the rest of the data) |
| Toast (`sonner`) on PUT failure + modal stays open | Matches project-wide error pattern; preserves unsaved edits | Modal closes on error (rejected — destroys coach's edits) |
| Inline error display removed from modal error state → toast only | Cleaner modal; consistent with project toast conventions | Keep both inline + toast (redundant) |
| `YOUTUBE_URL_REGEX` extracted from `MetadataSheet` and inlined in `EditMetadataModal` | MetadataSheet is being deleted; regex is a single constant | Moving to `lib/schemas/animations.ts` (future improvement, out of scope) |
| Tags display: `(animation.tags ?? []).join(', ')` on modal open | Canonical round-trip: DB `string[]` → comma-separated text → `split(',').trim()` on save | Space-only delimiter (rejected — commas are the convention used in `SaveToCloudModal`) |

---

## Phase 1: Design

### Data Model Changes

See `data-model.md`.

### API Contract

See `contracts/api-animations-get.md`.

### Quickstart

See `quickstart.md`.
