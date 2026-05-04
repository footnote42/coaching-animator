# Tasks: Save & Metadata Unification

**Input**: `specs/019-save-metadata-unification/plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/api-animations-get.md`

**Tests**: No test tasks included — spec does not request TDD approach (SC-005 is a pass-gate, not a write-tests instruction).

**Organization**: Grouped by user story. US1 and US2 are both P1 and sequential — US1 adds the input fields, US2 wires the save behavior.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup

**Purpose**: Confirm clean baseline before any changes

- [x] T001 Verify `npm run lint && npx tsc --noEmit` passes with zero errors on current branch

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend the data pipeline so all three user stories can read `tags` and `video_url` from the API. These two tasks are independent (different files) and BLOCK all user story phases.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 [P] Extend `AnimationSummary` interface in `src/features/gallery/components/AnimationCard.tsx` — add `tags?: string[] | null` and `video_url?: string | null` after the existing optional fields (FR-002)
- [x] T003 [P] Extend Supabase SELECT string in `src/app/api/animations/route.ts` (line ~47) — replace current select with `'id, title, description, coaching_notes, animation_type, duration_ms, frame_count, visibility, upvote_count, created_at, updated_at, progression_count, remix_count, thumbnail_url, preview_entities, tags, video_url, remixed_from_id, remixed_from:remixed_from_id(title)'` (FR-001, API-001)

**Checkpoint**: Interface extended, API returns all four metadata fields — user story implementation can now begin.

---

## Phase 3: User Story 1 — Stored description appears in Edit form (Priority: P1) 🎯 MVP

**Goal**: All seven metadata fields (Title, Description, Coaching Notes, Animation Type, Visibility, Tags, YouTube URL) are present in the Edit modal and pre-populated from the stored `AnimationSummary` prop when the modal opens.

**Independent Test**: Save an animation with description + coaching notes + tags via SaveToCloudModal. Open My Playbook, click Edit. All three fields must be pre-filled with the stored values (quickstart Flow 1).

### Implementation for User Story 1

- [x] T004 [US1] Add Tags input to `src/shared/components/EditMetadataModal.tsx` — comma-separated `<input>`, initialized as `(animation.tags ?? []).join(', ')`, helper text "Up to 10 tags, comma-separated", `N/10 tags` counter below input; position below Coaching Notes and above Visibility to match `SaveToCloudModal` field order (FR-003, FR-004, UI-002, UI-004, UI-005)
- [x] T005 [US1] Add YouTube URL input to `src/shared/components/EditMetadataModal.tsx` — `<input>`, initialized as `animation.video_url ?? ''`, helper text "Optional YouTube link for this drill", add `youtubeUrl`/`youtubeError` state variables and the error display element below the input; inline `YOUTUBE_URL_REGEX` constant copied from `MetadataSheet.tsx` (`/^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[A-Za-z0-9_-]{11}$/`); position below Tags and above Visibility; follow existing form styling `border border-border bg-surface focus:border-primary focus:outline-none` (do NOT wire submit-time validation here — T008 owns that) (FR-003, FR-005, UI-003, UI-004, UI-005)

**Checkpoint**: Open Edit modal on a saved animation — all seven fields present and pre-populated. Tags field shows comma-joined stored tags; YouTube URL field shows stored URL or is empty. No "null" or "undefined" visible.

---

## Phase 4: User Story 2 — Edit modal covers all metadata fields (Priority: P1)

**Goal**: A coach can edit Tags and YouTube URL in the modal, save changes via PUT, see them reflected immediately in the card (optimistic patch), and get a toast error if the PUT fails.

**Independent Test**: Open Edit modal, change Tags to "lineout, rucks, backs" and add a valid YouTube URL, save. Card updates immediately (no reload). Re-open modal — new values persist (quickstart Flow 2).

### Implementation for User Story 2

- [x] T006 [US2] Fix description `maxLength` from 500 to 2000 in `src/shared/components/EditMetadataModal.tsx` (UI-001)
- [x] T007 [US2] Add client-side tags validation in `src/shared/components/EditMetadataModal.tsx` — on submit, parse `tagsInput.split(',').map(t => t.trim()).filter(Boolean)`; block submit with inline error if result has > 10 entries or any entry exceeds 30 chars (FR-004)
- [x] T008 [US2] Add YouTube URL validation on submit in `src/shared/components/EditMetadataModal.tsx` — if field is non-empty, test against `YOUTUBE_URL_REGEX`; block submit with inline error "Please enter a valid YouTube URL (youtube.com/watch?v=... or youtu.be/...)" if invalid (FR-005)
- [x] T009 [US2] Include `tags` and `video_url` in PUT request body in `src/shared/components/EditMetadataModal.tsx` — `tags`: parsed array or `undefined` if input is empty; `video_url`: trimmed string or `undefined` if input is empty (FR-006)
- [x] T010 [US2] Change `onSave` prop type from `() => void` to `(updated: Partial<AnimationSummary>) => void` in `src/shared/components/EditMetadataModal.tsx`; on successful PUT call `onSave({ title, description, coaching_notes, animation_type, visibility, tags, video_url })` with the confirmed form values (FR-008)
- [x] T011 [US2] Add `import { toast } from 'sonner'` to `src/shared/components/EditMetadataModal.tsx`; in the PUT failure handler replace the existing `setError` inline error display with `toast.error(errorMessage)` — remove the visible inline error element and the `setError` call; modal naturally stays open because no success branch is taken (FR-009)
- [x] T012 [US2] Update `handleEditSave` in `src/app/my-gallery/page.tsx` (line ~139) — change signature from `async () => void` to `(updated: Partial<AnimationSummary>) => void`; replace `setEditingId(null); await fetchAnimations()` with `setAnimations((prev) => prev.map((a) => (a.id === editingId ? { ...a, ...updated } : a))); setEditingId(null)` (FR-008)

**Checkpoint**: Edit Tags + YouTube URL → save → card updates immediately without page reload. Re-open modal → values match what was saved. PUT failure (DevTools offline) → toast appears, modal stays open with data intact (quickstart Flows 2–4 and Flow 7).

---

## Phase 5: User Story 3 — Metadata button removed from editor sidebar (Priority: P2)

**Goal**: The standalone "Edit Metadata" button and `MetadataSheet` sheet are fully removed from the editor sidebar with no leftover imports or dead state.

**Independent Test**: Open `/app`. Inspect the left-hand sidebar — no "Metadata" or "Info" button visible. Run lint and TypeScript — zero errors (quickstart Flow 5, SC-003, SC-004).

### Implementation for User Story 3

- [x] T013 [US3] Remove four references to `MetadataSheet` from `src/features/animation/components/Sidebar/ProjectActions.tsx`: (1) `import MetadataSheet` line 9, (2) `const [isMetadataSheetOpen, setIsMetadataSheetOpen] = useState(false)` line 32, (3) the entire "Metadata Section" div containing the "Edit Metadata" button (~lines 142–158), (4) `<MetadataSheet open={isMetadataSheetOpen} onOpenChange={setIsMetadataSheetOpen} />` (~lines 262–265); also remove `Settings` import from lucide-react if it becomes unused (FR-007)
- [x] T014 [US3] Delete `src/features/animation/components/Sidebar/MetadataSheet.tsx` — safe to delete after T013 removes the only import (FR-007)

**Checkpoint**: Sidebar has no metadata button. `grep -r "MetadataSheet"` returns zero results. Lint and TypeScript pass.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T015 [P] Run `npm run lint && npx tsc --noEmit` — confirm zero new errors (SC-004)
- [x] T016 [P] Run `npm test -- --run` — confirm all existing tests still pass (SC-005)
- [x] T017 Manual smoke test: run quickstart Flows 1–7 against `localhost:3000` (dev server running)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **BLOCKS all user story phases**
- **US1 (Phase 3)**: Depends on Phase 2 (AnimationSummary + API change must land first)
- **US2 (Phase 4)**: Depends on Phase 3 (Tags and YouTube URL inputs must exist before wiring save logic)
- **US3 (Phase 5)**: Depends only on Phase 2 (interface change); can start as soon as Foundational is done
- **Polish (Phase 6)**: Depends on all desired user stories complete

### Within Each Phase

- T002 and T003 are independent — run in parallel
- T004 and T005 touch the same file — run sequentially
- T006–T011 all touch `EditMetadataModal.tsx` — run sequentially
- T012 (`my-gallery/page.tsx`) can start as soon as T010 defines the new `onSave` signature
- T013 must complete before T014
- T015 and T016 in Polish are independent — run in parallel

### Parallel Opportunities

| Parallel Set | Tasks | Condition |
|---|---|---|
| API + interface | T002, T003 | Phase 2 start |
| Sidebar cleanup + US2 | T013-T014, T006-T011 | After Phase 2 done |
| Polish gates | T015, T016 | After all stories done |

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only — P1)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (T002, T003 in parallel)
3. Complete Phase 3: US1 (T004, T005)
4. Complete Phase 4: US2 (T006–T012)
5. **STOP and VALIDATE**: run quickstart Flows 1–4 and 7
6. Ship P1 stories if validated

### Incremental Delivery

1. Setup + Foundational → data pipeline ready
2. US1 → pre-population works → smoke-test Flow 1
3. US2 → full edit/save works → smoke-test Flows 2–4 and 7
4. US3 → sidebar cleaned up → smoke-test Flow 5
5. Polish → CI gates pass

---

## Notes

- [P] tasks = different files, no dependencies — run in parallel
- [Story] label maps tasks to user stories for traceability
- No canvas touched — skip canvas smoke tests
- Tags round-trip: `(animation.tags ?? []).join(', ')` on open → `split(',').map(t => t.trim()).filter(Boolean)` on submit
- Supabase joins: existing `remixed_from` flatten pattern retained — no new joins
- Pre-push gate: `npm run lint && npx tsc --noEmit` must pass before PR
