# Implementation Plan: Phase 2c — Share & Playback Workflow

**Branch**: `018-share-playback-workflow` | **Date**: 2026-05-03 | **Spec**: `specs/018-share-playback-workflow/spec.md`

---

## Summary

Close 10 open Phase 2 issues across the share/playback/progression workflow. Research revealed that roughly half the spec requirements are already implemented — the remaining work is tightly scoped to UI wiring and two new PATCH mutations (link/unlink). No database migrations required; all schema columns exist.

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
| Tier alignment (Guest/Auth/Public/Admin) | ✅ | Tier 1 (editor, save) + Tier 2 (share/replay, gallery). No Guest or Admin surfaces changed |
| No telemetry or analytics | ✅ | Web Share API is a browser platform primitive — no data retention |
| Entity colors via EntityColors service | ✅ | No entity color changes |
| Shared canvas — tested on all 3 routes | ✅ Required | ShareViewer and ReplayViewer both modified for coaching notes |
| New data: privacy impact assessed | ✅ | `coaching_notes` — same access model as `description` (owner-controlled, readable per visibility setting) |
| Supabase joins flattened before use | ✅ Required | All new queries must flatten FK results before use |

---

## Already Implemented — No Action Required

The following spec requirements are already done and need only regression-testing:

| FR | Feature | Where |
|----|---------|-------|
| FR-003 | Gallery Play routes to `/share/{id}` | `GalleryClient.tsx` line 180 |
| FR-004 | Gallery Share button (Web Share / clipboard) | `PublicAnimationCard.tsx`, `AnimationCard.tsx` |
| FR-005 | Share view title above canvas | `ShareViewer.tsx` |
| FR-006 | "Powered by" footer on share view | `ShareViewer.tsx` |
| FR-007 | Progression prev/next navigation | `share/[id]/page.tsx` + `ShareViewer.tsx` |
| FR-008 | Context-aware back button (owner/guest) | `ShareViewer.tsx` |
| FR-012 | FloatingRemote stays accessible | `FloatingRemote.tsx` (position: fixed relative to canvas) |

---

## Project Structure

### Documentation (this feature)

```text
specs/018-share-playback-workflow/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Codebase research findings
├── data-model.md        # Schema design (no new migrations needed)
├── quickstart.md        # Manual test checklist
├── contracts/
│   └── api.md           # API contracts and payload schemas
└── tasks.md             # Task list (/speckit.tasks output — NOT created here)
```

### Source Files to Create

```text
src/
└── shared/
    └── components/
        └── CoachingNotesOverlay.tsx   # New — dismissible notes panel (shared)
```

### Source Files to Modify

```text
src/
├── app/
│   ├── share/[id]/page.tsx            # Add coaching_notes to select
│   └── replay/[id]/page.tsx           # Add coaching_notes to select
│
├── features/
│   ├── animation/
│   │   └── components/
│   │       ├── Editor.tsx             # Add Share button to toolbar
│   │       ├── ShareViewer.tsx        # Add CoachingNotesOverlay + coachingNotes prop
│   │       └── ReplayViewer.tsx       # Add CoachingNotesOverlay + coachingNotes prop
│   │
│   └── gallery/
│       └── components/
│           └── AnimationCard.tsx      # Add Progression actions (Add, Link, Unlink)
│
└── shared/
    └── components/
        ├── SaveToCloudModal.tsx        # Add coaching_notes textarea + Save As Progression
        └── EditMetadataModal.tsx       # Add coaching_notes textarea
```

---

## Implementation Phases

### Phase A — Coaching Notes UI (P1, independent)

**Goal**: Wire `coaching_notes` from DB → save modal → edit modal → share/replay overlay.

**A1 — Add coaching notes to SaveToCloudModal**
- File: `src/shared/components/SaveToCloudModal.tsx`
- Add `coachingNotes` state (string, default `''`)
- Add `<textarea>` below Description, max 5000 chars, label "Coaching Notes"
- Include in save payload: `coaching_notes: coachingNotes.trim() || null`
- Pre-populate from `initialCoachingNotes` prop (for edit flow)

**A2 — Add coaching notes to EditMetadataModal**
- File: `src/shared/components/EditMetadataModal.tsx`
- Same textarea pattern as A1
- Pre-populate from the animation's existing `coaching_notes`
- Include in PATCH payload

**A3 — Build CoachingNotesOverlay component**
- File: `src/shared/components/CoachingNotesOverlay.tsx`
- Props: `coachingNotes: string | null`, `isOpen: boolean`, `onClose: () => void`
- Renders a slide-up dismissible panel (position absolute bottom, z-index above canvas but below FloatingRemote)
- Hidden when `coachingNotes` is null or empty string
- Closes on overlay tap or close button

**A4 — Add Notes overlay to ShareViewer**
- File: `src/features/animation/components/ShareViewer.tsx`
- Add `coachingNotes?: string | null` prop
- Add Notes icon button (visible only when `coachingNotes` is non-empty)
- Wire to `CoachingNotesOverlay` open/close state

**A5 — Add Notes overlay to ReplayViewer**
- File: `src/features/animation/components/ReplayViewer.tsx`
- Add `coachingNotes?: string | null` prop
- Same Notes button + CoachingNotesOverlay pattern as A4

**A6 — Pass coaching_notes from share page to ShareViewer**
- File: `src/app/share/[id]/page.tsx`
- Extend `.select(...)` to include `coaching_notes`
- Pass as `coachingNotes={animation.coaching_notes}` to `ShareViewer`

**A7 — Pass coaching_notes from replay page to ReplayViewer**
- File: `src/app/replay/[id]/page.tsx`
- Same as A6 for ReplayViewer

---

### Phase B — Editor Share Button (P1, independent)

**Goal**: Fix EDITOR-002 — the editor has no functional share button.

**B1 — Add Share button to editor toolbar**
- File: `src/features/animation/components/Editor.tsx`
- Import `ShareSheet` from `@/features/animation/components/ShareSheet`
- Add `isShareOpen` state
- Add Share icon button to toolbar (disabled state when `cloudAnimationId` is null)
- If animation is unsaved (no `cloudAnimationId`): clicking Share triggers save-first prompt (reuse or extend `onSaveToCloud` flow), then opens ShareSheet on success
- Render `<ShareSheet animationId={cloudAnimationId} ... open={isShareOpen} />`

---

### Phase C — Progression Workflow UI (P1, sequential — C1 before C2/C3)

**Goal**: Implement "Add Progression", "Save As Progression", "Link to Foundation", and "Unlink" actions.

**C1 — Add "Add Progression" action to AnimationCard**
- File: `src/features/gallery/components/AnimationCard.tsx`
- Add "Add Progression" to the card action menu (visible only for Foundations — `!animation.is_progression`)
- Action: navigate to `/app` with a query param `?parentId={animation.id}` that tells the editor to pre-link this animation as the Foundation
- Editor on load: if `parentId` query param is set, pre-populate `parent_animation_id` in the save modal

**C2 — Add "Save As Progression" to SaveToCloudModal**
- File: `src/shared/components/SaveToCloudModal.tsx`
- Add a "Save as Progression" toggle button below the visibility selector
- When toggled on: show a Foundation picker (`<select>` or searchable list) fetched from `GET /api/animations?is_progression=false` (user's own Foundations)
- Auto-fill title as `"{Foundation Title} — Progression {next_n}"` (fetch sibling count from `GET /api/animations/{foundationId}/progressions`)
- On save: include `parent_animation_id`, `is_progression: true`, `progression_order` in the POST payload
- Tags and sport type inherit from Foundation (pre-fill but remain editable)

**C3 — Add "Link to Foundation" action to AnimationCard**
- File: `src/features/gallery/components/AnimationCard.tsx`
- Add "Link to Foundation" to card action menu (visible for standalone animations — `!animation.is_progression`)
- Action: open a modal with a Foundation picker (same fetch as C2)
- On confirm: PATCH `/api/animations/{id}` with `{ parent_animation_id, is_progression: true, progression_order: nextSlot }`
- If animation has `progression_count > 0`: show warning "This animation has its own progressions. Linking it as a progression will detach them."
- On success: refresh the My Playbook list

**C4 — Add "Unlink" action to ProgressionStrip items**
- File: `src/features/gallery/components/ProgressionStrip.tsx` (or `AnimationCard.tsx` via ProgressionStrip callbacks)
- Add an action on each Progression item in the strip: "Unlink"
- Confirm dialog before proceeding
- Action: PATCH `/api/animations/{progressionId}` with `{ parent_animation_id: null, is_progression: false, progression_order: 0 }`
- On success: refresh parent card (decrement ProgressionStrip)

---

## Sequencing

```
Phase A (coaching notes) — fully independent; run in parallel with Phase B
Phase B (editor share) — independent; can run in parallel with A
Phase C1 — needed before C2 (C2 needs query param support that C1 sets up)
C2, C3, C4 — can run in parallel after C1
```

Recommended order: **A in parallel with B, then C1, then C2/C3/C4**.

---

## Complexity Tracking

No constitutional violations. No complexity exceptions required.

---

## Implementation Notes

### coaching_notes vs coaching_points
Spec uses `coaching_points` — actual DB column is `coaching_notes`. All code must use `coaching_notes`.

### ON DELETE CASCADE (not SET NULL)
Deleting a Foundation deletes its Progressions. The spec edge case "orphaned progressions" is moot. UI should warn coaches before deleting a Foundation that has progressions (count badge in the delete confirm dialog).

### Progression limit (max 5)
The PATCH/POST endpoints enforce max 5 progressions. The parent-picker in C2/C3 must show remaining slots. If a Foundation is at 5, the "Add Progression" and "Link to Foundation" actions must be disabled with a tooltip explaining the limit.

### ProgressionStrip vs stacked cards
The existing `ProgressionStrip` is a horizontal scrollable row. The spec described "stacked offset cards" as a preference. The strip is already functional and tested; implementing the stacked card metaphor is a separate visual polish task out of scope for this plan. The functional goal (manage progressions from My Playbook) is met by the strip.

### Rate limiting
Any new PATCH calls to the link/unlink flow should reuse `checkRateLimit(user.id, 'animation_update')` if that bucket exists, or create a new `'progression_link'` bucket following the same pattern.

---

## Success Criteria Verification

| SC | How Verified |
|----|-------------|
| SC-001 | Share link in ≤2 clicks from editor | Manual test (quickstart §1) |
| SC-002 | Gallery produces `/share/{id}` URLs | Already done; regression-test (quickstart §2) |
| SC-003 | Share view: title + site link + nav | Already done; regression-test (quickstart §3) |
| SC-004 | Coaching notes readable from share/replay | Manual test (quickstart §5) |
| SC-005 | Progression creation in ≤3 taps | Manual test (quickstart §6) |
| SC-006 | No standalone progression gallery cards | Regression-test + grep for `is_progression` filter |
| SC-007 | Coaching notes persists across save/reopen | Manual test (quickstart §4) |
| SC-008 | `npm run lint && npx tsc --noEmit` passes | CI automated |
| SC-009 | All 3 routes render without regression | Manual smoke-test + Playwright E2E |
