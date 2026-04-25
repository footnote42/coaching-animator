# Tasks: Share Workflow

**Input**: `specs/006-share-workflow/plan.md`, `spec.md`, `research.md`
**Branch**: `006-share-workflow`
**Date**: 2026-04-25

**Tests**: Not requested in spec — no test tasks generated. Manual verification steps provided per story.

**Organization**: Tasks are grouped by user story. US1, US2, and US3 are all P1; they can be worked in priority order or in parallel once each story's dependencies are clear. US4 (P2, UX clarity) is fully addressed within US1's ShareButton modal implementation — no separate phase.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story this task belongs to (US1–US3)
- Exact file paths are included in every task

## Path Conventions

```
API routes:   src/app/api/share/route.ts
Share page:   src/app/share/[id]/page.tsx
Gallery:      src/app/gallery/GalleryClient.tsx
Components:   src/features/animation/components/Sidebar/ShareButton.tsx
              src/features/animation/components/ShareViewer.tsx
              src/features/gallery/components/PublicAnimationCard.tsx

Pre-push:     npm run lint && npx tsc --noEmit
Manual test:  npm run dev (port 3000)
```

---

## Phase 1: Setup

**Purpose**: Confirm baseline is clean before any changes land.

- [x] T001 Verify `npm run lint && npx tsc --noEmit` passes on branch `006-share-workflow` with zero errors before writing any code

---

## Phase 2: User Story 1 — Coach Shares from Editor (Priority: P1) 🎯 MVP

**Goal**: Editor share button generates a working `/share/{id}` URL, displays it in a modal with copy-to-clipboard, and triggers the native share sheet on mobile. The inaccurate 90-day privacy toast is removed.

**Independent Test**: Log in, open any animation in `/app`, click the Share button in the sidebar. Expect a modal (desktop) or native share sheet (mobile) with a valid `/share/{id}` URL. Copy the link, open it in a private window — animation plays. No "90 days" toast appears at any point.

**Note — US4 addressed here**: User Story 4 (P2, UX clarity) has no distinct implementation. The ShareButton modal's explanation text ("Send this link to your players — they can watch the animation on their phone, no account needed") and clean dismiss behaviour are implemented as part of T003 below.

### Implementation for User Story 1

- [x] T002 [US1] Create `src/app/api/share/route.ts`: POST handler that calls `requireAuth()`, validates body with `validatePayloadSize()`, upserts to `saved_animations` with `visibility: 'link_shared'`, `title: body.name || 'Untitled Animation'`, `user_id: user.id`, `animation_type: 'tactic'`, `frame_count: body.frames.length`, `duration_ms` computed from frames, returns `{ id: string }`. Error responses: 401 (no auth), 413 (payload too large), 429 (rate limit via `checkRateLimit()`), 500 (DB error). Pattern: follow `src/app/api/animations/route.ts` POST handler.

- [x] T003 [US1] Enhance `src/features/animation/components/Sidebar/ShareButton.tsx`:
  (a) **Auth guard**: Before calling `shareAnimation()`, check whether the user is authenticated (read from the existing auth context/store). If not authenticated, render a short inline prompt instead of the share modal: "Sign in to share this animation with your players." Include a sign-in button (route to `/auth/signin`) and a dismiss option. Do not call `shareAnimation()` in this branch. This satisfies FR-009 and SC-001 for guest users.
  (b) Remove the `PRIVACY_NOTICE_KEY` localStorage check and the "stored for 90 days" `toast.info` entirely.
  (c) After `shareAnimation()` succeeds, check `typeof navigator.share === 'function'` at call time. If true, call `navigator.share({ url, title: project.name })`; if that throws `AbortError`, fall through to modal.
  (d) Open a `Dialog` (from `src/shared/ui/`) with: title "Share Link", explanation text "Send this link to your players — they can watch the animation on their phone, no account needed.", readonly URL input showing the full `/share/{id}` URL, copy button with `Check` icon on success, dismiss button. Apply `rounded-none` to the Dialog content element (UI-003).

- [x] T004 [US1] Verify User Story 1: run `npm run lint && npx tsc --noEmit` — zero new errors

**Checkpoint**: Editor share fully functional. Test independently before continuing.

---

## Phase 3: User Story 2 — Player Views Shared Animation (Priority: P1)

**Goal**: The `/share/{id}` page displays the animation title at the top of the canvas and shows prev/next progression navigation when sibling progressions exist.

**Independent Test**: Open any `/share/{id}` URL. The animation title appears in a gradient overlay at the top of the canvas. If the animation has progressions, a bottom-center nav bar shows "Prev" and "Next" links to adjacent `/share/{id}` URLs. If no progressions, the nav bar is absent.

### Implementation for User Story 2

- [x] T005 [P] [US2] Add title overlay to `src/features/animation/components/ShareViewer.tsx`: add `animationTitle?: string` prop to `ShareViewerProps`. Inside the `<div style={{ position: 'relative', width: canvasWidth, height: canvasHeight }}>` wrapper, render a `<div className="absolute top-0 left-0 right-0 px-4 py-2 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" style={{ zIndex: 10 }}>` containing `<h1 className="text-white font-heading font-bold text-sm sm:text-base truncate text-center">` with `{animationTitle ?? payload.name}` as content. The `animationTitle` prop (server-provided) takes precedence; `payload.name` is the fallback.

- [x] T006 [P] [US2] Extend server query in `src/app/share/[id]/page.tsx`:
  (a) **Null guard**: Immediately after the `.single()` call, check if `data` is null (animation missing, hidden, or wrong visibility). If so, call Next.js `notFound()` to render the project's 404 page. This satisfies FR-010 and SC-005. Verify with test URL `/share/00000000-0000-0000-0000-000000000000` — expect a 404 page, no console error, no white screen.
  (b) Add `parent_animation_id, is_progression, progression_order` to the existing `.select()` call. Then compute a `fullNavigationSet: { id: string; label: string }[]` array where slot 0 is always the base animation and subsequent slots are progressions ordered by `progression_order`. If `animation.is_progression` is true, fetch siblings via `parent_animation_id`; the base animation record (for slot 0) is fetched separately via `parent_animation_id`. If `animation.is_progression` is false (base), fetch children via `.eq('parent_animation_id', id)`. Filter all fetched records to `.is('hidden_at', null).in('visibility', ['public', 'link_shared'])`. Pass `fullNavigationSet` and `currentAnimationId` (the current `id`) as props to `ShareViewer`. Pass `animationTitle={animation.title}` as the authoritative title prop.

- [x] T007 [US2] Add progression navigation bar to `src/features/animation/components/ShareViewer.tsx`: add `fullNavigationSet?: { id: string; label: string }[]` and `currentAnimationId?: string` props to `ShareViewerProps`. When `fullNavigationSet.length > 1`, find `currentIndex = fullNavigationSet.findIndex(n => n.id === currentAnimationId)`. Render `prevItem = fullNavigationSet[currentIndex - 1]` and `nextItem = fullNavigationSet[currentIndex + 1]`. Bottom-center nav bar positioned above FloatingRemote. Use `<a href>` not `router.push` for clean full-page navigation.

- [x] T008 [US2] Verify User Story 2: run `npm run lint && npx tsc --noEmit` — zero new errors

**Checkpoint**: Share view shows title and progression nav. Test independently before continuing.

---

## Phase 4: User Story 3 — Coach Shares from Gallery Card (Priority: P1)

**Goal**: Gallery Play action routes to `/share/{id}` (not `/replay/{id}`). Gallery cards have a Share button that copies the `/share/{id}` URL or triggers the native share sheet on mobile.

**Independent Test**: Open `/gallery`. Click the play overlay on any card — browser navigates to `/share/{id}` (URL bar shows `/share/`, not `/replay/`). Click the Share icon on a card — desktop: link copied to clipboard with 2-second "Copied" feedback; mobile: native share sheet opens. The copied URL contains `/share/` not `/replay/`.

### Implementation for User Story 3

- [x] T009 [P] [US3] Fix gallery routing in `src/app/gallery/GalleryClient.tsx`: on line 171, change `router.push(\`/replay/${id}\`)` to `router.push(\`/share/${id}\`)`. One-line change only.

- [x] T010 [P] [US3] Add share action to `src/features/gallery/components/PublicAnimationCard.tsx`: add `const [copied, setCopied] = useState(false)` state. Add `handleShare` async function: build `url = \`${window.location.origin}/share/${animation.id}\``; try `navigator.share({ url, title: animation.title })` if `typeof navigator.share === 'function'` (returns early on success); fallback: `navigator.clipboard.writeText(url)`, then `setCopied(true)`, `setTimeout(() => setCopied(false), 2000)`. Add a share icon button (`Share2` from `lucide-react`) to the card's action row. When `copied` is true, show `Check` icon instead of `Share2`. Call `e.stopPropagation()` at the top of `handleShare` to prevent card click-through.

- [x] T011 [US3] Verify User Story 3: run `npm run lint && npx tsc --noEmit` — zero new errors

**Checkpoint**: Gallery routing and share action both work. Test independently before continuing.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final quality gates and shared canvas regression checks.

- [ ] T012 [P] Manual verify `/app` route (editor): open editor, confirm no visual regressions — canvas renders, entities draggable, existing share button still visible
- [ ] T013 [P] Manual verify `/share/[id]` route on mobile (or DevTools mobile emulation): title overlay visible at top, FloatingRemote functional, progression nav appears if applicable, layout has no horizontal scroll, `position:fixed` container intact
- [ ] T014 [P] Manual verify `/gallery`: play overlay routes to `/share/{id}`, Share icon on cards produces correct URL
- [ ] T015 Manual verify `/replay/[id]` route: still renders correctly (route stays in codebase, must not be broken)
- [x] T016 Run `npm run lint && npx tsc --noEmit` — zero new errors across all changed files
- [ ] T017 Run `npm test -- --run` — all existing unit tests pass (no regressions from ShareViewer prop additions)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **US1 (Phase 2)**: Depends on Setup. T002 before T003 (ShareButton calls `shareAnimation()` which POSTs to the route created in T002)
- **US2 (Phase 3)**: Independent of US1 and US3. T005 and T006 can run in parallel (different files). T007 depends on T005 (same file)
- **US3 (Phase 4)**: Independent of US1 and US2. T009 and T010 can run in parallel (different files)
- **Polish (Phase 5)**: Depends on all three user story phases being complete

### Parallel Opportunities Within Stories

- **US2**: T005 (ShareViewer title) + T006 (share page query) run in parallel; T007 (nav bar) follows
- **US3**: T009 (GalleryClient routing) + T010 (PublicAnimationCard share action) run in parallel
- **Polish**: T012, T013, T014, T015 all independent — run in parallel

### Cross-Story Parallelism

US2 and US3 are entirely independent — they touch different files. Both can be worked concurrently with US1 provided the API route (T002) is not needed until the ShareButton (T003) integration test.

---

## Implementation Strategy

### MVP First (US1 Only)

1. Phase 1: Verify clean baseline
2. Phase 2: US1 — editor share button works end-to-end
3. Validate: log in, click Share, get modal, copy link, open in private window
4. Ship if ready

### Incremental Delivery

1. US1 → working share button (P1, blocks coach–player handoff)
2. US2 → title + progression nav (P1, improves player experience)
3. US3 → gallery routing + share action (P1, gallery discoverability)
4. Polish → regression verification across all routes

---

## Notes

- No DB schema changes — all required fields (`parent_animation_id`, `is_progression`, `progression_order`, `visibility`) already exist in `saved_animations`
- No new Zustand store changes — all state is server-fetched or component-local
- ShareViewer layout: `position:fixed inset:0` — never change to `h-screen` or `h-full`
- Supabase joins: flatten with `Array.isArray(raw) ? raw[0] : raw` before use
- Entity colors: not touched in this feature — `EntityColors` service constraint not applicable
- Pre-push gate: `npm run lint && npx tsc --noEmit` must pass before PR (SC-006)
- US4 (P2, self-explanatory UX) is addressed within T003 — modal explanation text and clean dismiss behaviour satisfy its acceptance criteria
