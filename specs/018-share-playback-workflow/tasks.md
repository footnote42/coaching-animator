# Tasks: Phase 2c — Share & Playback Workflow

**Branch**: `018-share-playback-workflow` | **Plan**: `specs/018-share-playback-workflow/plan.md` | **Date**: 2026-05-03

---

## Summary

| Phase | User Story | Tasks | Status |
|-------|-----------|-------|--------|
| Foundational | Schema verification | T001 | required |
| US1 (P1) | Share from Editor | T002 | implement |
| US2 (P1) | Share and Play from Gallery | — | already done; regression only |
| US3 (P1) | Share View: Title / Nav / Context | — | already done; regression only |
| US4 (P1) | Coaching Points in Save/Edit | T003–T004 | implement |
| US5 (P1) | Coaching Notes Overlay | T005–T007 | implement |
| US6 (P1) | Progression Workflow | T008–T013 | implement |
| US7 (P2) | Floating Remote | — | already done; regression only |
| US8 (P3) | Context-Aware Back Button | — | already done; regression only |
| Polish | Regression pass | T014 | implement |

**Total new tasks**: 13 (of which ~11 are active implementation)

**Parallel opportunities**: T003/T004 (independent files); T006/T007 (independent files); T009/T010 (after T008); T011/T012/T013 (after T008)

---

## Already Implemented — Regression Only

The following spec requirements are fully implemented. No code changes required; verify during T013.

| FR | Feature | Where |
|----|---------|-------|
| FR-003 | Gallery Play routes to `/share/{id}` | `GalleryClient.tsx:180` |
| FR-004 | Gallery Share button (Web Share / clipboard) | `PublicAnimationCard.tsx`, `AnimationCard.tsx` |
| FR-005 | Share view title above canvas | `ShareViewer.tsx` |
| FR-006 | "Powered by" footer on share view | `ShareViewer.tsx` |
| FR-007 | Progression prev/next navigation | `share/[id]/page.tsx` + `ShareViewer.tsx` |
| FR-008 | Context-aware back button (owner/guest) | `ShareViewer.tsx` |
| FR-012 | FloatingRemote stays accessible | `FloatingRemote.tsx` |

---

## Phase 1 — Foundational

*Blocking prerequisite: complete before US4/US5/US6 tasks. US1 (B1) can run in parallel.*

- [x] T001 Verify and extend Zod animation schemas in `src/lib/schemas/animations.ts`: confirm `coaching_notes: z.string().max(5000).nullable().optional()` is present; add if missing. Confirm `parent_animation_id: z.string().uuid().nullable().optional()`, `is_progression: z.boolean().optional()`, `progression_order: z.number().int().min(0).max(5).optional()` are present in the PATCH schema; add any that are missing.

---

## Phase 2 — US1: Share from Editor (P1)

*Goal: editor toolbar has a functional Share button that produces a `/share/{id}` link in ≤ 2 clicks.*

*Independent test*: Open `/app`, save an animation. Click Share. A `/share/{id}` link must be copied to clipboard or Web Share sheet opens.

- [x] T002 [US1] Add `isShareOpen` state and Share icon button to the editor toolbar in `src/features/animation/components/Editor.tsx`: import `ShareSheet`; add Share button (disabled when `cloudAnimationId` is null); when animation is unsaved, clicking Share triggers the save-first flow (extend `onSaveToCloud`) and opens ShareSheet only on successful save; render `<ShareSheet animationId={cloudAnimationId} open={isShareOpen} onOpenChange={setIsShareOpen} />` at end of component

---

## Phase 3 — US4: Coaching Points in Save and Edit Flow (P1)

*Goal: both save and edit modals expose a "Coaching Notes" textarea that persists and pre-populates.*

*Independent test*: Save animation with coaching notes. Open edit modal — field must be pre-populated with saved value.

- [x] T003 [P] [US4] Add `coachingNotes` state and "Coaching Notes" textarea to `src/shared/components/SaveToCloudModal.tsx`: state defaults to `''`; textarea placed below Description field; `maxLength={5000}`; label "Coaching Notes"; include `coaching_notes: coachingNotes.trim() || null` in save payload; accept and populate from `initialCoachingNotes` prop (for pre-fill in edit context)

- [x] T004 [P] [US4] Add `coachingNotes` state and "Coaching Notes" textarea to `src/shared/components/EditMetadataModal.tsx`: same textarea pattern as T003; pre-populate from `animation.coaching_notes`; include `coaching_notes: coachingNotes.trim() || null` in PATCH payload on save

---

## Phase 4 — US5: Coaching Notes Overlay in Playback Views (P1)

*Goal: share and replay pages show a dismissible Notes overlay when coaching notes are present.*

*Independent test*: Open `/share/{id}` for an animation with coaching notes. Tap Notes button — overlay must appear with notes text. Open `/share/{id}` without coaching notes — Notes button must not render.

- [x] T005 [US5] Create `src/shared/components/CoachingNotesOverlay.tsx`: props `coachingNotes: string | null`, `isOpen: boolean`, `onClose: () => void`; renders a slide-up dismissible panel (position absolute, bottom-anchored, z-index above canvas but below FloatingRemote); renders nothing when `coachingNotes` is null or empty string; closes on overlay backdrop tap or close button click

- [x] T006 [P] [US5] Add `coaching_notes` to the Supabase select in `src/app/share/[id]/page.tsx` and wire to ShareViewer: extend `.select(...)` to include `coaching_notes`; add `coachingNotes?: string | null` prop to `ShareViewer`; add Notes icon button in `src/features/animation/components/ShareViewer.tsx` (visible only when `coachingNotes` is non-empty); manage open/close state; render `<CoachingNotesOverlay coachingNotes={coachingNotes} isOpen={isNotesOpen} onClose={() => setIsNotesOpen(false)} />`

- [x] T007 [P] [US5] Add `coaching_notes` to the Supabase select in `src/app/replay/[id]/page.tsx` and wire to ReplayViewer: same pattern as T006; add `coachingNotes?: string | null` prop to `src/features/animation/components/ReplayViewer.tsx`; add Notes button + CoachingNotesOverlay with same open/close logic

---

## Phase 5 — US6: Progression Workflow (P1)

*Goal: coaches can create progressions from My Playbook and the save flow; link/unlink is available on cards.*

*Independent test*: My Playbook → "Add Progression" on a card → editor opens pre-linked → save → progression does not appear as standalone in gallery. Parent card shows progression count badge.

*Sequencing*: T008 (Add Progression) must complete before T009/T010 (Save As Progression, Link to Foundation) since T008 establishes the `?parentId` query param convention the editor must handle.

- [x] T008 [US6] Add "Add Progression" action to `src/features/gallery/components/AnimationCard.tsx`: add option to card action menu (visible only when `!animation.is_progression`); action navigates to `/app?parentId={animation.id}`; in `src/features/animation/components/Editor.tsx`, read `parentId` query param on mount and pre-populate `parent_animation_id` in the save modal's initial state (pass as `initialParentId` prop to SaveToCloudModal); on mount with `initialParentId` set, fetch Foundation title and sibling count so SaveToCloudModal can auto-set title to `"{Foundation Title} — Progression {n}"` and pre-populate `tags` and `sport_type` from the Foundation; disable "Add Progression" when `animation.progression_count >= 5` (show tooltip: "Maximum 5 progressions reached")

- [x] T009 [P] [US6] Add "Save As Progression" toggle to `src/shared/components/SaveToCloudModal.tsx`: add toggle button below visibility selector; when toggled on, fetch `GET /api/animations?is_progression=false` to populate a Foundation picker `<select>`; fetch `GET /api/animations/{foundationId}/progressions` to determine next slot (n); auto-fill title as `"{Foundation Title} — Progression {n}"` (editable); on save include `parent_animation_id`, `is_progression: true`, `progression_order: n`; tags and sport_type inherit from Foundation (pre-fill, remain editable); disable Foundations at 5 progressions in the picker with `(full)` label

- [x] T010 [P] [US6] Add "Link to Foundation" action to `src/features/gallery/components/AnimationCard.tsx`: add to card action menu for standalone animations (`!animation.is_progression`); opens a modal with Foundation picker (same fetch as T009: `GET /api/animations?is_progression=false`); on confirm: PATCH `/api/animations/{id}` with `{ parent_animation_id, is_progression: true, progression_order: nextSlot }`; if animation has `progression_count > 0` show warning: "This animation has its own progressions. Linking it will detach them."; on success: refresh the My Playbook list; disable Foundations at 5 progressions in the picker

- [x] T011 [US6] Add "Unlink" action to progression items in `src/features/gallery/components/ProgressionStrip.tsx` (or via callback from `AnimationCard.tsx`): add "Unlink" action on each Progression item in the strip; show confirm dialog before proceeding; on confirm: PATCH `/api/animations/{progressionId}` with `{ parent_animation_id: null, is_progression: false, progression_order: 0 }`; on success: refresh parent card (decrement ProgressionStrip); use `checkRateLimit(user.id, 'animation_update')` or `'progression_link'` bucket following existing `src/lib/server/rate-limit.ts` pattern

- [x] T012 [P] [US6] Add progression count badge to `src/features/gallery/components/PublicAnimationCard.tsx`: render a `"{n} progressions"` badge when `animation.progression_count > 0`; badge count is `animation.progression_count` (linked children only, Foundation excluded); badge must not appear when count is 0 or null; use design token styling (no `bg-white`, sharp corners)

- [x] T013 [P] [US6] Add rename and delete actions to progression items in `src/features/gallery/components/ProgressionStrip.tsx`: add "Rename" action that opens an inline input or dialog pre-populated with the progression's title; on confirm: PATCH `/api/animations/{progressionId}` with `{ title: newTitle }`; add "Delete" action with a confirm dialog that warns "Deleting this progression cannot be undone"; on confirm: DELETE `/api/animations/{progressionId}`; on success: refresh parent card (decrement ProgressionStrip); rate-limit both calls following existing `src/lib/server/rate-limit.ts` pattern

---

## Phase 6 — Polish & Regression Pass

- [x] T014 Run full regression pass: `npm run lint && npx tsc --noEmit && npm test -- --run`; smoke-test `/app` (editor loads, canvas renders, toolbar visible, Share button works), `/replay/{id}` (animation plays, no console errors), `/share/{id}` (title visible, remote accessible, coaching notes overlay if notes present, progression nav if applicable); verify progression animations absent from `/gallery` as standalone cards; verify private animation `/share/{id}` returns 404 for a non-owner (RLS regression check)

---

## Dependencies

```
T001 (schema)
  → T003, T004, T005, T006, T007, T009, T010, T011 (all depend on schemas being correct)

T002 (editor share button)
  → independent (can run in parallel with any Phase 3–5 task)

T003, T004 (coaching notes in modals)
  → parallel with each other (different files)
  → T003 must precede T009 (Save As Progression extends SaveToCloudModal)

T005 (CoachingNotesOverlay component)
  → T006, T007 (both import it)

T006, T007 (ShareViewer + ReplayViewer)
  → parallel with each other (different files)

T008 (Add Progression action)
  → T009, T010, T011, T013 (all extend patterns established in T008 or work on ProgressionStrip)

T009, T010 (Save As Progression, Link to Foundation)
  → parallel with each other (different files/modal)

T011, T012, T013 (Unlink, Public badge, Rename/Delete)
  → T011/T013 can run in parallel (both work on ProgressionStrip)
  → T012 can run in parallel with T011/T013 (different file: PublicAnimationCard)

T014 (regression)
  → all tasks complete
```

---

## Parallel Execution Examples

### Batch 1 (after T001)
```
T002  (Editor.tsx — Share button)
T003  (SaveToCloudModal.tsx — coaching notes textarea)
T004  (EditMetadataModal.tsx — coaching notes textarea)
T005  (CoachingNotesOverlay.tsx — new component)
```

### Batch 2 (after T005)
```
T006  (ShareViewer + share/[id]/page.tsx)
T007  (ReplayViewer + replay/[id]/page.tsx)
```

### Batch 3 (after T003 + T008)
```
T009  (SaveToCloudModal — Save As Progression)
T010  (AnimationCard — Link to Foundation)
```

### Batch 4 (after T008)
```
T011  (ProgressionStrip — Unlink)
T012  (PublicAnimationCard — progression badge)
T013  (ProgressionStrip — Rename/Delete)
```

---

## Implementation Strategy

MVP scope (gets the core loop working):
1. T001 — schema guard
2. T002 — editor share button (unblocks SC-001)
3. T003 + T004 — coaching notes in save/edit (unblocks SC-007)
4. T005 + T006 + T007 — coaching notes overlay (unblocks SC-004)

Incremental delivery:
- After MVP: T008 (Add Progression — unblocks SC-005)
- After T008: T009 + T010 in parallel
- After T008: T011 (Unlink), T012 (badge), T013 (rename/delete) in parallel
- Final: T014 regression pass

---

## Key Implementation Notes

- **Column name**: DB column is `coaching_notes` (not `coaching_points` as the spec says). All code must use `coaching_notes`.
- **ON DELETE CASCADE**: Deleting a Foundation deletes its Progressions. Warn before Foundation deletion when `progression_count > 0`.
- **Progression limit**: Max 5 per Foundation (DB `chk_progression_order` constraint). Disable Add/Link actions at the limit.
- **Rate limiting**: Reuse `checkRateLimit(user.id, 'animation_update')` for link/unlink PATCH calls. See `src/lib/server/rate-limit.ts`.
- **Supabase join flattening**: Any FK result from Supabase must be flattened before use: `const r = Array.isArray(raw) ? raw[0] : raw`.
- **Shared canvas routes**: After any canvas-adjacent change test `/app`, `/replay/[id]`, AND `/share/[id]`.
