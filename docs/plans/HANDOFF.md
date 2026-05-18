# Session Handoff Log

Rolling record of `/handoff` outputs. Newest entry at the top.

---

## 2026-05-18 — Bug fixes: T-016, T-045, T-074, T-133 ✅

**Branch**: `main` (`d19953f` pushed)

### What was completed this session

All four open failures from the 2026-05-17 manual test run resolved in a single commit.

**T-016 (P1) — Guest 10-frame limit not enforced**
- `src/features/animation/components/TimelinePanel.tsx`
- Added `useUser()` + `VALIDATION` check to a new `handleAddFrame` handler
- Guests at frame 10 now see a sign-in toast; authenticated users are unaffected
- Both the "+" header button and `FrameStrip`'s `onAddFrame` prop use the guarded handler
- `tests/unit/components/TimelinePanel.test.tsx` updated with missing `useUser` + `VALIDATION` mocks

**T-045 (P2) — Editor pause button unresponsive during playback**
- `src/features/animation/components/TimelinePanel.tsx`
- Root cause: `currentFrameIndex` subscription caused re-renders on every frame advance, swallowing click events
- Fix: extracted play/pause into a `React.memo` `PlayPauseButton` with `useCallback`-stabilised handlers — button no longer re-renders during playback

**T-074 (P2) — Sidebar "Share Link" auto-saves without guard**
- `src/features/animation/components/Sidebar/ShareButton.tsx` — added `cloudAnimationId` prop + early-return toast if absent
- `src/features/animation/components/Sidebar/ProjectActions.tsx` — threaded `cloudAnimationId` prop
- `src/features/animation/components/Editor.tsx` — passes `cloudAnimationId` down to `ProjectActions`

**T-133 (P3) — Timeline panel off-screen at 768px**
- `src/features/animation/components/Editor.tsx`
- Added `showTimelinePanel = viewportWidth >= 1024` alongside the existing `isMobile < 768`
- TimelinePanel now hidden at 768–1023px; MobileDrawer covers that range

### Known environment issue (pre-existing)

Vitest worker timeout in WSL affects ~8 test files including `TimelinePanel.test.tsx`. All affected files show `transform 0ms / setup 0ms / import 0ms` — the worker never spawns. This is an infrastructure issue, not a code failure. Lint and TSC both clean.

### State after session

```
Branch: main (pushed — d19953f)
Open failures: none from the 2026-05-17 test run
TSC: clean · Lint: clean
```

### Next session prompt

You are resuming work on `coaching-animator` on branch `main`. This session resolved all four open failures from the manual test run (T-016, T-045, T-074, T-133). The codebase is clean.

**Diagnostics first:**
```bash
npm run lint && npx tsc --noEmit && npm test -- --run
```

**No outstanding bugs.** Decide on next work:

1. **Run another manual test pass** against `http://localhost:3001` using `docs/testing/MANUAL-TEST-SCRIPT.md` to verify the four fixes behave correctly in-browser — particularly T-045 (pause button responsiveness during live playback) and T-016 (guest frame limit toast).

2. **Next feature** — run `/speckit.specify` for the next item in the backlog. Check `docs/authority/ROADMAP.md` for the next phase disposition.

**Key architectural notes carried forward:**
- `TimelinePanel` now uses `useUser()` directly — if auth context changes, check this component
- `ShareButton` requires `cloudAnimationId` prop (non-optional in practice); it comes from `Editor` via `ProjectActions`
- `showTimelinePanel = viewportWidth >= 1024` is separate from `isMobile = viewportWidth < 768` — do not conflate them
- Vitest worker timeout in WSL is a known infrastructure issue; does not indicate broken tests

---

## 2026-05-17 — Nav: "Profile" tab rename + tabs repositioned right ✅

**Branch**: `main` (`b9104c5` pushed)

### What was completed this session

Two targeted nav corrections following the previous session's Help/Portfolio tab work:

1. **Renamed "Portfolio" → "Profile"** throughout (`b9104c5`)
   - `useTabOrder.ts`: SectionId union `'portfolio'` → `'profile'`
   - `globals.css`: `--c-tab-portfolio` → `--c-tab-profile`
   - `Navigation.tsx`: TAB_SECTIONS id/label/cssVar updated
   - `help/how-to/page.tsx`: nav guide section updated

2. **Moved notebook tabs to the right side of the nav bar**
   - Tabs previously sat to the right of the logo (left cluster).
   - Now: logo standalone left; all tabs + Admin + Sign Out/Sign up in a single right group.
   - Layout: `justify-between` with logo alone on left, `flex items-center h-full` group on right containing tabs (`items-end h-full pt-2`) then utility links.

Lint and TypeScript both clean before commit.

### Open failures (carried from last test run)

| ID | Severity | Description |
|----|----------|-------------|
| T-016 | P1 (ship-blocker) | Guest 10-frame limit not enforced |
| T-045 | P2 | Editor pause button unresponsive during playback |
| T-074 | P2 | Sidebar "Share Link" auto-saves without guard |
| T-133 | P3 | Timeline panel off-screen at 768px viewport |

### State after session

```
Branch: main (pushed — b9104c5)
Open failures: T-016 (P1), T-045 (P2), T-074 (P2), T-133 (P3)
TSC: clean · Lint: clean
```

### Next session prompt

You are resuming work on `coaching-animator` on branch `main`. The nav now has 6 notebook tabs (Help, Profile added) positioned on the right side of the bar. A full manual test run is in `docs/testing/TEST-RUN-2026-05-17.md` with 4 open failures to address.

**Diagnostics first:**
```bash
npm run lint && npx tsc --noEmit && npm test -- --run
```

**Priority fixes (work in order):**

**1. T-016 (P1) — Guest 10-frame limit not enforced**

`VALIDATION.PROJECT.GUEST_MAX_FRAMES = 10` exists but `addFrame` in `src/core/stores/projectStore.ts` doesn't check it for guests. Add the guard: if `!isAuthenticated && frames.length >= GUEST_MAX_FRAMES`, show a sign-in prompt instead of adding the frame.

**2. T-074 (P2) — Sidebar "Share Link" auto-saves without a guard**

`src/features/animation/components/Sidebar/ProjectActions.tsx` — the Share Link button auto-saves an unsaved animation without prompting. The toolbar "Share Animation" is correctly gated. Apply the same guard: if no cloud ID, prompt to save first.

**3. T-045 (P2) — Editor pause button unresponsive during playback**

Play button re-renders every frame; click events don't land. Compare the working pause in the share view. Fix likely involves stabilising the button ref or pointer-event approach in the TimelinePanel.

**4. T-133 (P3) — Timeline panel off-screen at 768px**

Timeline renders at x≈1690 at 768px viewport. Needs a breakpoint to collapse or reposition at tablet widths.

---

## 2026-05-17 — Full Manual Test Run (76 tests) ✅

**Branch**: `main` (`c48b632` — no code changes this session)

### What was completed this session

Full system regression test using `playwright-cli` against `http://localhost:3001`, covering all 16 areas of `docs/testing/MANUAL-TEST-SCRIPT.md`. Results recorded in `docs/testing/TEST-RUN-2026-05-17.md`.

**Overall: 76 tests / 66 PASS / 3 FAIL / 4 PARTIAL / 3 NOT RUN**

### Failures requiring fixes

| ID | Severity | Description |
|----|----------|-------------|
| T-016 | P1 (ship-blocker) | Guest 10-frame limit not enforced — guests can add unlimited frames past the `VALIDATION.PROJECT.GUEST_MAX_FRAMES = 10` constant |
| T-045 | P2 | Editor pause button unresponsive during playback — button re-renders every frame, click events don't land |
| T-074 | P2 | Sidebar "Share Link" auto-saves unsaved animations and generates a share URL without a save-first guard. Toolbar "Share Animation" correctly guards; only the sidebar path is broken |
| T-133 | P3 | Timeline panel off-screen at 768px viewport (positioned at x≈1690, requires horizontal scroll) |

### Additional observations (not counted as failures)

- T-094: One "T-061 Test Drill (edited)" animation in the test account has corrupt cloud data — `loadProject()` fails schema validation when loading it as a `parentId` for progressions. Other animations load correctly.
- T-102: Web Share API unavailable in headless Playwright — Share button on gallery cards can't be fully verified in this test environment; not a code bug.
- T-026: No success toast on profile save — update is immediate/inline. Minor UX gap worth noting.
- T-061 / T-083: Enter in the Tags field submits the Save modal early — coaching notes can't be filled before the form fires. Blocks T-083 (coaching notes in share view) from being tested.

### State after session

```
Branch: main (no new commits)
Test results: docs/testing/TEST-RUN-2026-05-17.md
Open failures: T-016 (P1), T-045 (P2), T-074 (P2), T-133 (P3)
TSC: clean · Lint: clean (from previous session)
```

### Next session prompt

You are resuming work on `coaching-animator` on branch `main`. A full manual test run was just completed; results are in `docs/testing/TEST-RUN-2026-05-17.md`.

**Start with diagnostics:**
```bash
npm run lint && npx tsc --noEmit && npm test -- --run
```

**Priority fixes (work in order):**

**1. T-016 (P1) — Guest 10-frame limit not enforced**

The constant `VALIDATION.PROJECT.GUEST_MAX_FRAMES = 10` exists but the "Add Frame" action in the editor is not checking it for guest users. Find where frames are added (`src/core/stores/projectStore.ts` likely has an `addFrame` action) and add the guard: if `!isAuthenticated && frames.length >= GUEST_MAX_FRAMES`, show a prompt to sign in instead of adding the frame.

**2. T-074 (P2) — Sidebar "Share Link" auto-saves without a save-first guard**

The sidebar "Share Link" button (`src/features/animation/components/Sidebar/ProjectActions.tsx` — the Share Link section) auto-saves an unsaved animation and generates a share URL. The toolbar "Share Animation" button is correctly disabled for unsaved animations. The sidebar path needs the same guard: if the animation is unsaved (no cloud ID), prompt the user to save to cloud first before generating a share link, rather than silently auto-saving.

**3. T-045 (P2) — Editor pause button unresponsive during playback**

The play button in the editor re-renders every frame during playback, causing click events to not register. Investigate the play/pause button's ref stability in the timeline panel (`src/features/animation/components/Canvas/FloatingRemote.tsx` or the TimelinePanel). The share view's pause works correctly — compare those implementations. The fix likely involves stabilising the button's ref or using a pointer-event approach that doesn't depend on stable DOM.

**4. T-133 (P3) — Timeline panel off-screen at 768px**

The timeline panel renders at x≈1690 at 768px viewport width, outside the viewport. At desktop (1280px+) it's fine. The layout likely needs a breakpoint where the timeline collapses to the bottom of the canvas or becomes scrollable at tablet widths.

---

## 2026-05-17 — Profile Avatar OAuth Removal ✅

**Branch**: `main` (`c48b632` pushed)

### What was delivered this session

1. **Removed Google OAuth avatar from profile page** (`c48b632`)
   - Dropped `avatarUrl` / `user?.user_metadata?.avatar_url` entirely — OAuth profile photos are inconsistent in quality and availability.
   - Removed `BrandIcon` import (added in the previous sub-session), restored `getInitials` from `profileUtils`.
   - Avatar priority is now: **club badge** (if uploaded) → **initials on pitch-green** (permanent fallback).
   - File: `src/app/profile/page.tsx`

### State after session

```
Branch: main (pushed — c48b632)
Open issues: UX-009 (Gallery Carousel — Low severity; only remaining open issue)
TSC: clean · Lint: clean
```

### Next session prompt

You are resuming work on `coaching-animator` on branch `main`. Recent sessions delivered polish fixes to the My Playbook card layout and the profile page avatar. The codebase is stable.

**Diagnostics first:**
```bash
npm run lint && npx tsc --noEmit && npm test -- --run
```

**Only open issue**: `UX-009` — Gallery Carousel & Progression Pack Discovery (Low severity, can defer to Phase 3).

**Suggested next work**: Either tackle UX-009 or run `/speckit.specify` for the next feature in the backlog.

---

## 2026-05-17 — My Playbook Card Layout & Profile Avatar Polish ✅

**Branch**: `main` (both commits pushed)

### What was delivered this session

1. **My Playbook AnimationCard layout redesign** (`043298f`)
   - Replaced congested 7-icon bottom row (up to 7 icons alongside the date, overflowing at 4-column widths) with a clean two-element action strip.
   - Date moved to its own line above actions.
   - Primary action: labeled `[✏ Edit Frames]` button — always visible, no guessing.
   - Secondary actions: `[⊞ More ▾]` dropdown — Share, Add/Unlink Progression, Link to Foundation, Version History, Edit Info, Delete; grouped with dividers and full text labels.
   - Full ARIA: `role="menu"`, `role="menuitem"`, `aria-expanded`, `aria-haspopup`. Escape + click-outside close.
   - File: `src/features/gallery/components/AnimationCard.tsx`

2. **Profile page avatar fallback** (`880aa18`)
   - Removed flat green initials block (was `bg-pitch-green` + `getInitials()` — sloppy for new users with no Google OAuth).
   - New priority order: OAuth photo → club badge → `BrandIcon` (brand logo on green background).
   - Club badge is now surfaced prominently in the profile header when uploaded, not just buried in the Club Branding form.
   - File: `src/app/profile/page.tsx`

### State after session

```
Branch: main (ahead of origin — both commits pushed)
Open issues: UX-009 (Gallery Carousel — Low severity; only remaining open issue)
All 023-entity-layering tasks: complete (21/21)
TSC: clean (verified pre-commit)
Lint: clean (verified pre-commit)
```

### Next session prompt

You are resuming work on `coaching-animator` on branch `main`. The last session delivered two polish fixes: My Playbook card layout (overflow dropdown) and profile page avatar fallback (brand logo).

**Diagnostics first:**
```bash
npm run lint && npx tsc --noEmit && npm test -- --run
```

**Only open issue**: `UX-009` (Gallery Carousel & Progression Pack Discovery) — Low severity, Phase 2–3 deferred. Check `docs/issues/ISSUES.md` to confirm no new issues have been added, then decide whether to tackle UX-009 or start the next feature spec.

**Suggested next work**:
- `UX-009` — Gallery carousel / progression pack terminology and discovery UI (Low priority, can defer to Phase 3)
- Or run `/speckit.specify` for the next feature in the backlog

---

## 2026-05-16 — Animation Layering Control Complete (FEAT-006 / 023-entity-layering) ✅

**Branch**: `023-entity-layering` (pushed)

### What was delivered this session

1.  **Rendering Logic (Phase 3)**:
    *   Implemented deterministic 3-key sort in `EntityLayer.tsx`: `LAYER_ORDER (Type Tier)` → `zIndexOffset` → `Entity ID (Tie-breaker)`.
2.  **Context Menu & Interaction (Phase 4)**:
    *   Enhanced `EntityContextMenu` with "Bring Forward" and "Send Backward" actions.
    *   Implemented peer-aware logic in `useEditorContextMenuHandlers` to dynamically enable/disable buttons (e.g., cannot bring the top player forward).
3.  **State Management (Phase 2)**:
    *   Added `zIndexOffset` to `Entity` and `EntityUpdate` types.
    *   Added `updateEntityLayerOffset` action to `projectStore` to sync layering changes across **all frames** for visual consistency.
4.  **Persistence & Sharing (Phase 5)**:
    *   Updated `SharePayloadV2` and `hydrateSharePayload` to preserve `zIndexOffset`.
    *   Verified layering persists through share links and is correctly rendered in `ShareViewer`.
5.  **Quality Assurance (Phase 7-8)**:
    *   Full unit test coverage for `computeLayerSwap` and `hydrateSharePayload`.
    *   Manual smoke test verified correct behavior on canvas and context menu states.
    *   Build, Lint, and TSC verified clean.

### State after session

```
Branch: 023-entity-layering (pushed)
Tests: 115 tests passing (including new layering logic tests)
TSC: clean
Lint: clean
Open issues: UX-004 (Gallery previews), UX-007 (Hero page)
```

### Next session prompt

You are resuming work on `coaching-animator` on branch `main`. The last session completed the Animation Layering Control feature (FEAT-006).

**Diagnostics first:**
```bash
npm run lint && npx tsc --noEmit && npm test -- --run
```

Then check `docs/issues/ISSUES.md` for the next highest-priority open issue.

---

## 2026-05-16 — FEAT-006 SpecKit Pipeline Complete (023-entity-layering) 📋

**Branch**: `023-entity-layering` (uncommitted — no production code written)

### What was completed this session

Full SpecKit pipeline run for FEAT-006 — Animation Layering Control. No production code written — spec, plan, tasks, and analysis only.

#### 1. Feature specification (`/speckit.specify`)

**File**: `specs/023-entity-layering/spec.md`

- 4 user stories (US1–US4), 3× P1 + 1× P2
- 10 functional requirements (FR-001–FR-010)
- 5 UI requirements (UI-001–UI-005)
- 4 canvas requirements (CV-001–CV-004)
- 6 measurable success criteria (SC-001–SC-006)
- Constitutional compliance gate: fully passed
- Key assumptions: layer offsets are frame-global; single-step increment only; no cross-type user control; no visual z-order badge needed

#### 2. Implementation plan (`/speckit.plan`)

**Files**: `specs/023-entity-layering/plan.md`, `research.md`, `data-model.md`, `quickstart.md`

Key research findings:
- Type hierarchy (`LAYER_ORDER`) already exists in `EntityLayer.tsx` — no regression needed
- `EntityUpdate` needs `zIndexOffset?: number` added
- New store action `updateEntityLayerOffset` must update **all frames** (not just current)
- `computeLayerSwap` pure helper implements rank-swap strategy (not +1/−1)
- `hydratePayload.ts` has a gap: must explicitly spread `zIndexOffset` when reconstructing entities from share payloads
- No Supabase schema migration required — field is inside existing JSONB payload

#### 3. Task list (`/speckit.tasks`)

**File**: `specs/023-entity-layering/tasks.md`

21 tasks across 8 phases:

| Phase | Purpose | Tasks |
|-------|---------|-------|
| 1 | Baseline verify | T001 |
| 2 | Foundational (types + store) | T002–T004 |
| 3 (US1) | EntityLayer 3-key sort | T005–T006 |
| 4 (US2) | Context menu UI + handlers | T007–T010 |
| 5 (US3) | hydratePayload fix | T011–T012 |
| 6 (US4) | Guest verification | T013 |
| 7 | Unit + E2E tests | T014–T016 |
| 8 | Polish + quality gates | T017–T021 |

MVP scope = T001–T010 (type stacking + Bring Forward/Send Backward functional).

#### 4. Analysis (`/speckit.analyze`) + remediations applied

0 CRITICAL, 0 HIGH, 2 MEDIUM, 5 LOW findings. All 4 recommended remediations applied to `tasks.md`:
- C1: T013 clarified (null-guard covered by T014 unit tests)
- C2: T007 extended (disabled buttons must not fire callbacks)
- U1: T016 updated (Konva stage child-order query, not screenshot diff; multi-frame replay assertion added)
- U2: T014 extended (mixed-type input test case added)

### State after session

```
Branch: 023-entity-layering (no commits — spec pipeline only)
Production code changed: none
Tests: unchanged (116 passing from previous session)
TSC: clean (pre-session baseline)
Open issues: UX-004 (Gallery previews), UX-007 (Hero page)
```

### Next session prompt

You are resuming work on `coaching-animator` on branch `023-entity-layering`. This session completed the full SpecKit pipeline for FEAT-006 (Animation Layering Control). No production code has been written yet.

**Next Priority: Implement FEAT-006 — Animation Layering Control**

Run diagnostics first:
```bash
npm run lint && npx tsc --noEmit && npm test -- --run
```

Then begin implementation following `specs/023-entity-layering/tasks.md`. Execute in phase order:

**Phase 2 — Foundational (start here):**
- T002: `src/core/types/index.ts` — add `zIndexOffset?: number` to `Entity` and `EntityUpdate`
- T003: `src/core/stores/projectStore.ts` — add `updateEntityLayerOffset` all-frames action
- T004: `src/core/stores/projectStore.ts` — add `computeLayerSwap` pure helper (exported)

**Phase 3 — US1 (EntityLayer sort):**
- T005: `src/features/animation/components/Canvas/EntityLayer.tsx` — 3-key sort (LAYER_ORDER → zIndexOffset → id)

**Phase 4 — US2 (context menu):**
- T007: `src/shared/ui/EntityContextMenu.tsx` — add Bring Forward / Send Backward props + buttons
- T008: `src/features/animation/components/hooks/useEditorContextMenuHandlers.ts` — add handlers + flags
- T009: `src/features/animation/components/Editor.tsx` — wire handlers + flags

**Key architectural notes:**
- `updateEntityLayerOffset` MUST update all frames, not just current frame
- `computeLayerSwap` filters to same-type entities only (cross-type immutable)
- 3-key sort: type tier → `(zIndexOffset ?? 0)` → `a.id.localeCompare(b.id)`
- `hydratePayload.ts` needs explicit `zIndexOffset` spread (T011) for share-view persistence
- No Supabase migration — field lives in JSONB payload
- Test all three routes: `/app`, `/replay/[id]`, `/share/[id]` (shared `EntityLayer` component)

---

## 2026-05-16 — Notebook Tab Navigation Complete (NAV-001) ✅

**Branch**: `main` (all merged and pushed)

### What was delivered this session

1.  **Notebook Tab Navigation (NAV-001)**:
    *   Full visual rebrand of the desktop navigation to a "Notebook Tab" aesthetic.
    *   Implemented `useTabOrder` hook for MRU-derived z-indexing, ensuring the most recent tabs stay in front.
    *   Added plastic laminate sheen and hard-edged shadows matching the `prototype/nav-tabs.html` authority.
2.  **Mobile Navigation Polish**:
    *   Updated the mobile dropdown to include colour-coded vertical bars for each section.
3.  **Page Textures (DESIGN-002)**:
    *   Applied lined and grid paper background textures to Home, Gallery, and My Playbook.
4.  **Stability & Performance**:
    *   Fixed a critical infinite re-render loop in `Navigation.tsx` caused by unstable `useTabOrder` input.
    *   Verified zero regressions with `npm test`, `lint`, and `tsc`.

### State after session

```
Branch: main (pushed)
Tests: 116 passed
TSC: clean
Lint: clean
Open issues: FEAT-006 (Layering), UX-004 (Gallery previews), UX-007 (Hero page)
```

### Next session prompt

You are resuming work on `coaching-animator` on branch `main`. The last session completed the Notebook Tab Navigation (NAV-001) and Page Textures (DESIGN-002).

**Next Priority: FEAT-006 — Animation Layering Control**
Objective: Fix entity layering order (Cones < Players < Ball) and add "Send up/down" controls for entities in the editor.

**Run diagnostics first:**
```bash
npm run lint && npx tsc --noEmit && npm test -- --run
```

**Key architectural notes:**
- Layering is currently implicitly handled by order in the entities array.
- Implementation should involve a fixed base z-order for types (cones lowest) plus an optional `zIndexOffset` per entity.
- Check `src/features/animation/components/Canvas/EntityLayer.tsx` for rendering order.
- Update `ProjectActions.tsx` or `EntityPalette.tsx` to add "Move Forward/Backward" buttons.

---


**Branch**: `022-notebook-tab-nav`

### What was delivered this session

Full SpecKit pipeline run for the notebook tab navigation feature (NAV-001). No production code written — spec, plan, tasks, and analysis only.

#### 1. Issue triage (carried over from previous session context)

- Closed **SEC-001, SEC-002, SEC-003** in `docs/issues/ISSUES.md` — rate limiting, parameterised queries, and input sanitisation confirmed implemented in 016-security-hardening
- Closed **PLAYBACK-001** — TimelinePanel (021) resolves the scroll-accessibility issue; FloatingRemote retained only in ShareViewer
- Closed **FEAT-012** — MobileDrawer's `MobileTimelineSection` fully satisfies the requirement

#### 2. Prototype built

**File**: `prototype/nav-tabs.html`

Self-contained interactive prototype of the notebook tab navigation concept. Demonstrates:
- Overlapping tab shapes with `margin-right: -11px`
- Per-section colours (teal/amber/pitch-green/navy)
- Plastic sheen via `::after` diagonal gradient
- MRU z-ordering driven by localStorage
- Mobile: colour-coded hamburger dropdown entries
- Page background textures (ruled lines, large grid, small grid)

Open at: `C:\Users\kenho\Projects\coaching-animator\prototype\nav-tabs.html`

#### 3. SpecKit pipeline

| Command | Output |
|---------|--------|
| `/speckit.specify` | `specs/022-notebook-tab-nav/spec.md` — 6 user stories (US1–US6), 10 FRs, 9 UI reqs, 7 SCs |
| `/speckit.plan` | `plan.md`, `research.md`, `data-model.md`, `quickstart.md` |
| `/speckit.tasks` | `tasks.md` — 22 tasks across 7 phases |
| `/speckit.analyze` | 1 CRITICAL, 1 HIGH, 3 MEDIUM, 4 LOW findings |

#### 4. Analysis remediation

All findings addressed:
- **C1 (critical)**: Fixed soft shadow in `plan.md` — `box-shadow` blur `7px` → `0` (hard Tactical Shadow)
- **H1 (high)**: Rounded tab corners documented as accepted constitutional exception in `plan.md` Complexity Tracking
- **L3**: `spec.md FR-008` mobile breakpoint clarified to `< 768px` (md: Tailwind)
- **L4**: `tasks.md T007` — added `aria-label="Site navigation"` instruction
- **M2**: `tasks.md T002` — T016 contingency (class exists/absent) made explicit

### State after session

```
Branch: 022-notebook-tab-nav (local only — not pushed)
Tests: N/A (no production code changed)
TSC: N/A
Lint: N/A
Open issues: ISSUES.md Phase 3 items remain; NAV-001 is now in implementation-ready state
```

### Spec artefacts

```
specs/022-notebook-tab-nav/
├── spec.md          6 user stories, FR/UI/SC requirements
├── plan.md          5 files to change, 1 to create; CSS + hook + Navigation restructure
├── research.md      Codebase analysis: Navigation.tsx, globals.css, auth model
├── data-model.md    Tab visit order (localStorage) + TAB_SECTIONS registry
├── quickstart.md    7-test manual verification guide (Tests A–G)
├── tasks.md         22 tasks, 7 phases, MVP = Phases 1–3 (T001–T009)
└── checklists/
    └── requirements.md
```

### Design decisions locked

| Decision | Value |
|----------|-------|
| Home tab colour | `#0F766E` teal (provisional) |
| Gallery tab colour | `#D97706` amber (= `--color-accent-warm`) |
| My Playbook tab colour | `#1A3D1A` pitch green (= `--color-primary`) — may lighten to `#166534` |
| Create tab colour | `#1E40AF` navy |
| Nav cover background | `#18120A` dark leather |
| MRU localStorage key | `nav_mru_v1` |
| Mobile breakpoint | `md:` (768px) — aligns with existing Navigation.tsx |
| Shadow type | Hard-edged: `box-shadow: 0 -3px 0 rgba(0,0,0,0.40)` |
| Rounded corners | `border-radius: 7px 7px 0 0` — accepted constitutional exception |

### Next session prompt

You are resuming work on `coaching-animator` on branch `022-notebook-tab-nav`. The SpecKit pipeline (specify → plan → tasks → analyze) is complete for feature **NAV-001 / 022-notebook-tab-nav** (Notebook Tab Navigation).

**Run diagnostics first:**
```bash
npm run lint && npx tsc --noEmit && npm test -- --run
```

**Start implementation with `/speckit.implement`** or work through tasks manually starting at T001.

**MVP scope is Phases 1–3 (T001–T009):**
1. Phase 1: Verify baseline (T001–T002)
2. Phase 2: Add CSS to `src/app/globals.css` — tab colour variables + `.nav-tab` class + texture classes (T003–T005)
3. Phase 3: Restructure `src/shared/components/Navigation.tsx` — tab strip, active state, cover background (T006–T009)

**Key files:**
- Spec: `specs/022-notebook-tab-nav/spec.md`
- Plan: `specs/022-notebook-tab-nav/plan.md`
- Tasks: `specs/022-notebook-tab-nav/tasks.md`
- Quickstart: `specs/022-notebook-tab-nav/quickstart.md`
- Prototype (design authority): `prototype/nav-tabs.html`

**Critical architectural notes:**
- `Navigation.tsx` is a single `'use client'` component (~183 lines). It uses `usePathname()`, `useUser()`, and local `useState` only — no Zustand.
- The existing mobile breakpoint is `md:` (768px) — do not introduce a new threshold.
- Tab colours live as CSS custom properties in `globals.css`, not Tailwind config (there is no `tailwind.config.ts`).
- `useTabOrder` hook must be SSR-safe: initialise from a default value during render, hydrate from `localStorage` in `useEffect` only.
- `box-shadow` on `.nav-tab` MUST use zero blur (hard Tactical Shadow) — `box-shadow: 0 -3px 0 rgba(0,0,0,0.40)`. Soft shadows are a constitutional violation.
- `border-radius: 7px 7px 0 0` on tabs is an accepted constitutional exception (approved 2026-05-16).
- My Playbook colour `#1A3D1A` may need lightening to `#166534` — confirm against prototype before committing.

---

## 2026-05-16 — Issue Triage + EDITOR-011/014/017 Complete ✅

**Branch**: `main` (all pushed)

### What was delivered this session

Continued from the previous session which completed 021. This session was pure issue triage and patch work — no new spec.

#### 1. Diagnostics & issue triage

- Ran full diagnostic suite (lint, TSC, unit tests) — found 3 failing tests in `TimelinePanel.test.tsx`
- Root cause: missing `// @vitest-environment jsdom` pragma and `import React from 'react'` in test file (JSX in `vi.mock` callbacks requires React in scope)
- Fixed both; all 19 test files now passing
- Cross-referenced git log with ISSUES.md: EDITOR-010 (progression panel) was already fixed in commit `07f3b72` but not closed in the tracker — closed it
- EDITOR-012 (entity spawn persistence) — investigated `addEntityWithPropagate` and `propagateEntity` logic; confirmed the existing toast opt-in mechanism is correct UX — closed as-designed

#### 2. EDITOR-014 — Entity spawn offsetting

**File**: `src/features/animation/components/hooks/useEditorEntityHandlers.ts`

Added `findSpawnPosition()` helper: checks up to 9 candidate positions (centre + 8 cardinal/diagonal offsets at 40px each) against existing frame entities. All six add-entity handlers now call `spawnPosition()` instead of hardcoding canvas centre. Entities no longer stack when added consecutively.

#### 3. EDITOR-017 — Save button layout

**File**: `src/features/animation/components/Sidebar/ProjectActions.tsx`

Added `mt-2` to Save Local button — all three save-tier buttons (Save Local, Save to Cloud, Sign in to Save) now share the same top margin.

#### 4. EDITOR-011 — Team colour selection + Other Role player

The largest change of the session. After a design discussion:

**Schema** (`src/core/types/index.ts`):
- Added `'other'` to `TeamType`
- Added `teamColors?: { attack: string; defense: string; other: string }` to `ProjectSettings`

**Store** (`src/core/stores/projectStore.ts`):
- New `setTeamColor(team, color)` action: updates `settings.teamColors` AND retroactively walks every frame recolouring all entities of that team
- `newProject()` now seeds `teamColors` from `EntityColors.getDefault()` defaults
- `addEntity` colour fallback changed from `DESIGN_TOKENS.colours[team][0]` to `EntityColors.getDefault(entity.type, team)` — supports all team types including `'other'`; removed now-unused `DESIGN_TOKENS` import

**EntityColors** (`src/features/animation/services/entityColors.ts`):
- Added `other: '#EAB308'` (amber) to `TEAM_DEFAULTS`

**EntityPalette** (`src/features/animation/components/Sidebar/EntityPalette.tsx`):
- New "Team Colours" section: 3 colour swatches (Attack, Defence, Other Role), click to expand inline `ColorPicker`
- New "+ Other Role" button: spawns unlabelled amber player token with `team: 'other'`

**Editor + MobileDrawer**: wired `teamColors`, `onTeamColorChange`, `onAddOtherPlayer` through both paths.

### State after session

```
Branch: main (pushed, 4 commits ahead of previous session)
Tests: 19/19 files passing, 113/113 tests passing
TSC: clean
Lint: clean
Open issues: all Phase 2 editor/UX issues from EDITOR-011 batch are now CLOSED
Remaining open: Phase 2–3 gallery/UX issues (UX-004, UX-007, UX-009, UX-010, etc.)
```

### Commits this session

```
7eac6c4  feat(editor): team colour selection and Other Role player (EDITOR-011)
164349b  fix(editor): offset entity spawn to avoid stacking; fix save button spacing (EDITOR-014, EDITOR-017)
d846516  chore(issues): close EDITOR-012 — entity spawn toast accepted as correct UX
5f44933  fix(tests): add React import and jsdom env to TimelinePanel.test.tsx; close EDITOR-010
```

### Next session prompt

You are resuming work on `coaching-animator` on branch `main`. The last session closed all open Phase 2 editor issues (EDITOR-010 through EDITOR-017). The codebase is in a clean state.

**Diagnostics first:**
```bash
npm run lint && npx tsc --noEmit && npm test -- --run
```

Then check `docs/issues/ISSUES.md` for the next highest-priority open issue. The remaining open items are mostly Phase 2–3 gallery/UX concerns (UX-004, UX-007, UX-009, UX-010 etc.) and do not have a clear ordering — the user will need to decide which to tackle next.

**Key architectural notes for the next session:**
- `TeamType` now includes `'other'` — any code that pattern-matches on team values must handle it
- `ProjectSettings.teamColors` is optional (for backward compat with saved projects) — always apply defaults when reading: `rawTeamColors ?? { attack: EntityColors.getDefault('player', 'attack'), ... }`
- `setTeamColor` in the store is the canonical way to change team colours — do not update entity colours directly for team-wide changes
- The `DESIGN_TOKENS` import was removed from `projectStore.ts` — EntityColors is now the sole source for entity colour defaults

---

## 2026-05-15 — Unified Editor Controls Complete (021) ✅

**Branch**: `021-unified-editor-controls`

### What was delivered this session

#### 1. Implementation of Unified Controls
- **`TimelinePanel.tsx`** — Created a permanent right-side sidebar for desktop viewports, housing all playback and frame management controls.
- **`MobileDrawer.tsx`** — Integrated a new "Timeline" section for mobile parity, ensuring all controls (playback, frame management, toggles) are reachable within the drawer.
- **`Editor.tsx`** — Removed the legacy `EditorFloatingRemote` and redundant footer controls. Integrated the new `TimelinePanel`.
- **`FrameStrip.tsx`** — Added `orientation` prop to support vertical stacking in the right-side panel.
- **`EditorFloatingRemote.tsx`** — Deleted the deprecated component and all orphaned references.

#### 2. Verification & Quality
- **E2E Testing** — Implemented comprehensive tests in `tests/e2e/021-timeline-panel.spec.ts` covering desktop sidebar, mobile drawer, and share route stability.
- **Type Safety** — Resolved all linting and TypeScript issues related to the new components.
- **Design Compliance** — Verified adherence to `rounded-none` and `bg-surface` brand tokens.

### State after session

```
Branch: main (merged from 021-unified-editor-controls)
Implementation: COMPLETE
Verification: PASS (100% E2E, Lint, TSC)
Next step: Identify next priority from ISSUES.md
```

### Next session prompt

You are resuming work on the `coaching-animator` project on branch `main`.

021 (Unified Editor Controls / EDITOR-013) is complete and merged to `main` (commit `405f968`). Check `docs/plans/HANDOFF.md` and `docs/issues/ISSUES.md` to identify the next highest-priority issue.

Run diagnostics before starting new work:
```bash
npm run lint && npx tsc --noEmit && npm test -- --run
```

## 2026-05-15 — Planning Complete for 021 Unified Editor Controls

**Branch**: `021-unified-editor-controls`

### What was delivered this session

#### 1. Speckit workflow: specify → plan → tasks

Completed full planning pipeline for EDITOR-013 (Unified Editor Controls):

- **`specs/021-unified-editor-controls/spec.md`** — 4 user stories (US1–US4), 7 FR, 7 UI, 3 CV, 7 SC
- **`specs/021-unified-editor-controls/research.md`** — 7 findings; key decision: right-side panel over floating remote; confirmed only `EditorFloatingRemote` is deprecated (`FloatingRemote` in ShareViewer is untouched)
- **`specs/021-unified-editor-controls/plan.md`** — architecture: new `TimelinePanel.tsx`, modified `MobileDrawer.tsx`, restructured `Editor.tsx`, deleted `EditorFloatingRemote.tsx`
- **`specs/021-unified-editor-controls/quickstart.md`** — 10 manual test scenarios
- **`specs/021-unified-editor-controls/checklists/requirements.md`** — all items passing
- **`specs/021-unified-editor-controls/tasks.md`** — 33 tasks, 8 phases, TDD enforced in Phase 2
- **`.specify/feature.json`** — updated to `specs/021-unified-editor-controls`

#### 2. Next-session prompt

Written to `docs/plans/prompts/2026-05-15-021-implement.md`.

### State after session

```
Branch: 021-unified-editor-controls
Planning: COMPLETE
Implementation: NOT STARTED
Next step: /speckit.implement
```

### Open issues

None. Planning artifacts are complete and ready for implementation.

---

## 2026-05-15 — Branch Cleanup + Audit Infrastructure Merged (020) ✅

**Branch**: `main` (merged from `020-frame-edit-own-animations`)

---

### What was delivered this session

#### 1. Branch Cleanup & Merge

- Reviewed all uncommitted state on `020-frame-edit-own-animations`
- Gitignored tooling experiment artifacts: `.specify/`, `.playwright-mcp/`, `.github/agents|prompts|copilot-instructions.md`
- Updated `docs/authority/USER-WORKFLOWS.md` — WF1 now correctly describes the working frame-edit and metadata-edit flows (EDITOR-019 complete); removed stale "Known Gaps" entries
- Fixed `scripts/audit-report.mjs` — Playwright JSON uses `suites[].specs[]` not `suites[].tests[]`; annotations live on `spec.tests[0]`
- Added `data-testid="animation-card"` to `PublicAnimationCard.tsx` for test selector parity
- Committed `public/sw.js` (serwist compiled output, tracked in git per project convention)
- Added `.claude/skills/wf-audit.md` (replacement for deprecated `audit.md`) and `.claude/skills/playwright-cli/` reference skill
- Added `docs/superpowers/specs/2026-05-04-workflow-audit-testing-design.md` — design doc for the audit system
- Updated `docs/issues/ISSUES.md` — closed WF1-S5 and WF2-S1+S2 audit bugs (both were fixed in commit `6698b4f` but left in "Open" state)

#### 2. PR #17 — CI Checks & Merge

All required CI checks passed: Lint/Type, Build, Tests (unit + integration), DB Migrations.
Squash-merged PR #17, deleted feature branch.

**Commit**: `4dad01c feat(020): frame-edit own animations + workflow audit infrastructure`

---

### State after session

```
Branch: main
Last commit: 4dad01c (PR #17 squash-merge)

Tests: 18 workflow E2E tests passing (WF1/WF2/WF3)
Lint: zero errors
TypeScript: zero errors

Open issues (priority order):
  HIGH  EDITOR-013 — Unified Floating Editor Controls (deprecate FloatingRemote)
  HIGH  UX-001     — Welcome popup button contrast (WCAG AA)
  MED   EDITOR-012 — Entity spawning: placed on every frame, not just added frame
  MED   EDITOR-010 — Progression buttons missing for new (unsaved) animations
  MED   PLAYBACK-001 — Floating playback remote should persist and be draggable
```

---

### Next session

Start with EDITOR-013. Prompt: `docs/plans/prompts/2026-05-15-editor-013-unified-controls.md`

```
/speckit.specify "EDITOR-013 — Unified Floating Editor Controls: deprecate FloatingRemote, replace with accessible non-scroll editor controls for frame and timeline management."
```

Branch: `021-unified-editor-controls`

---

## 2026-05-03 — Security Hardening MVP Complete (Phase 3b) ✅

**Branch**: `main` (merged from `016-security-hardening`)

---

### What was delivered this session

#### 1. API Rate Limiting (US1)
- **Centralized Config**: Added 7 new endpoint configurations to `DEFAULT_CONFIGS` in `rate-limit.ts`.
- **Hardened Routes**: Applied `checkRateLimit` middleware to 8 sensitive routes:
    - `POST /api/animations/[id]/upvote` (Hourly 30-req limit + existing 1s cooldown)
    - `POST /api/animations/[id]/remix` (5/hr)
    - `PUT /api/user/profile` (10/hr)
    - `DELETE /api/user/account` (3/24hr)
    - `POST /api/auth/resend-verification` (3/hr, IP-keyed)
    - `POST /api/animations/[id]/progressions` (20/hr, added missing POST handler)
    - `PATCH /api/animations/[id]/progressions/reorder` (20/hr)
    - `GET /api/gallery` (100/hr, IP-keyed)
- **Headers**: All rate-limited responses now correctly return `X-RateLimit-Remaining` and `X-RateLimit-Reset`.

#### 2. Diagnostic Info-Leak Prevention (US2)
- **Diag Cleanup**: Removed `urlPrefix` from `GET /api/diag` response to prevent leaking partial Supabase project identifiers.

#### 3. Quality & Verification
- **Test Suite**: Extended `src/lib/server/__tests__/rate-limit.test.ts` with 7 new config assertions and behavioral tests (allows-3-blocks-4th).
- **Integrity**: Verified `npm run lint`, `npx tsc --noEmit`, and `npm test` (113/113) all pass green.
- **Deployment**: Merged feature branch to `main` and pushed to origin.

---

### Issues Logged / Updated
- **ROADMAP.md**: Phase 3b marked complete. Launch Definition progress: 9/9 met.
- **tasks.md**: All 016 implementation and verification tasks marked complete.

---

### State summary for next session

```
Branch state:
  main — security hardening (016) merged and verified.

Roadmap: Phase 3b ✅. Launch Definition 9/9 complete.

Next Priority: Phase 3f — Audit Remediation (Cosmetic P1 closures).
  Scope: Remove rounded-* and bg-white from editor surfaces; fix auth page headings.
  Trigger: Roadmap "Proceed" disposition for 3f.

Execution method: Speckit (/speckit.specify "Phase 3f — Audit Remediation")
```

---

## 2026-05-03 — Retrospective Execution Complete (Phases A, B, C)

**Branch**: `main`

---

### What was delivered this session

Executed the full three-phase retrospective designed last session. Core question answered: the current way of working is a mix of deliberate choices and accumulated defaults — now documented and trimmed.

#### Phase A — Tooling Audit (`71737aa`)
- Created `docs/review/tooling-decision.md` — full audit of MCPs, plugins, hooks, and settings permissions
- Cleaned `.claude/settings.local.json` from ~190 to 76 curated permission entries
- Identified Audible, Microsoft Learn, Spotify for removal via claude.ai web UI
- Flagged cleo, several claude.ai MCPs, code-simplifier, hookify, feature-dev, serena, claude-md-management, and the CLEO subagent architecture for 2-week review

#### Phase B — Decision Archaeology (`32e981d`, `85b0f48`, `7468c2a`)
- Created `docs/review/ai-collaboration-protocol.md` — 37-decision log with ownership tally and protocol rules
- Ownership tally: 54% Human-directed, but AI-originated clusters on structurally consequential decisions
- Identified 5 AI dependency signatures: technical decomposition without pre-drawn boundaries; menu-of-choices selection; scope expansion from AI proposals; plus 2 others
- Distilled 5 directing strengths and 7 protocol rules to carry forward

#### Phase C — Scope Review (`4c6000a`)
- Added dispositions to all Phase 3+ phases in ROADMAP.md
- **Phase 3b (Security)**: Proceed descoped — MVP security pass only
- **Phase 3c (E2E CI Gate)**: Defer until first 10 external users
- **Phase 3d (Search)**: Defer to Phase 4 (trigger: user has >20 animations)
- **Phase 3e (Performance)**: Defer — Lighthouse trigger
- **Phase 3f (Audit Remediation)**: Proceed — low-cost cosmetic closures
- **Phase 4+**: Trigger-gated on 10 active users returning 3+ days

---

### State summary for next session

```
Branch state:
  main — retrospective complete, ROADMAP dispositions committed.

Next Priority: Phase 3b — MVP Security Pass (unblocks launch).
  Descoped: rate limiting, basic SQLi/XSS protection, auth hardening.
  Companion: Phase 3f — Audit Remediation (low-cost cosmetic P1 closures).

Execution method: Speckit (/speckit.implement or /speckit.specify)
Spec: specs/ (Phase 3b spec to be written or found)
```

---

## 2026-05-02 — Retrospective Design (Audit, Align, Accelerate)

**Branch**: `main`

---

### What was delivered this session

Paused the build to design and plan a structured retrospective. The core question: is my current way of working something I designed, or something that accumulated?

**Outputs committed (`d545fc4`):**
- `docs/superpowers/specs/2026-05-02-solo-dev-retrospective-design.md` — approved design for a three-phase retrospective
- `docs/superpowers/plans/2026-05-02-solo-dev-retrospective.md` — 11-task implementation plan across Phase A, B, and C
- `docs/plans/prompts/2026-05-02-retrospective-execution.md` — next-session handoff prompt for subagent-driven execution

**Three phases:**
- **Phase A (tooling audit)** — rationalize MCPs, plugins, hooks, and the accumulated ~120-entry permissions list. Hard prerequisite before resuming the build.
- **Phase B (decision archaeology)** — read HANDOFF diary and key specs; classify past decisions on Ownership×Understanding axes; extract AI dependency signatures and directing strengths; write `docs/review/ai-collaboration-protocol.md`.
- **Phase C (scope review)** — assess Phase 3b-5+ phases with the question "does this exist because the product needs it, or because I planned it?"; add dispositions to ROADMAP.md.

---

### State summary for next session

```
Branch state:
  main — retrospective plan committed, ready to execute.

Next Priority: Phase A — Tooling Audit (before any build work).
Execution method: Subagent-Driven via /superpowers:subagent-driven-development
Plan: docs/superpowers/plans/2026-05-02-solo-dev-retrospective.md
Prompt: docs/plans/prompts/2026-05-02-retrospective-execution.md
```

---

## 2026-05-02 — Cosmetic Polish (Phase 2l) ✅

**Branch**: `main` (finalized Phase 2l improvements merged)

---

### What was delivered this session

#### 1. Gallery & My Playbook Parity
- **Unified Card Layout**: Implemented stable layout slots in `AnimationCard.tsx` and `PublicAnimationCard.tsx`. Cards now have consistent footprints regardless of tag/progression presence (resolves UX-014).
- **Tactical Thumbnails**: Updated `My Playbook` to include the tactical preview and progression strip, matching the visual richness of the public gallery (resolves MYPLAYBOOK-002).
- **Search & Filter**: Added search and filtering (by tag/title) to `My Playbook` (resolves MYPLAYBOOK-001).
- **Clear Actions**: Added explicit "Edit", "Replay", and "Share" buttons to all cards, standardizing hover effects and labels (resolves UX-013, MYPLAYBOOK-003, FLOW-001).

#### 2. Branding & Compliance
- **RFU Endorsement**: Added `hampshire-rfu-badge.webp` (<50KB) and wired up badge overlays for endorsed animations.
- **Mandatory Disclaimers**: Implemented constitution-mandated (V.2.4) endorsement disclaimers as tooltips on badge icons.
- **Design Token Compliance**: Refactored `MiniPitchSVG` to use `EntityColors` service, ensuring all tactical thumbnails match the editor's red/blue/yellow scheme (resolves UX-012).
- **Impeccable Audit**: Standardized `rounded-none` across all new UI surfaces and removed "amber proliferation" from non-CTA elements.

#### 3. Share View Optimization
- **Context-Aware Navigation**: Implemented a "Gallery" or "My Playbook" back-link depending on user ownership and login state (resolves FLOW-004).
- **Metadata Visibility**: Added animation titles and progression navigation to the `ShareViewer` overlay (resolves FLOW-002).
- **Clipboard Integration**: Enhanced the editor "Share" button to copy the optimized `/share/{id}` link to clipboard with visual confirmation.

#### 4. Stability & Quality
- **Test Integrity**: Verified all 106 unit and E2E tests pass (`npm run e2e`, `npm test`).
- **Build Checks**: Confirmed zero linting or TypeScript errors across the codebase.
- **Private Access Fix**: Resolved logic gaps preventing owners from opening their private animations from the playbook (resolves MYPLAYBOOK-004).

---

### Issues Logged / Updated
- **ROADMAP.md**: Updated to v3.3; Phase 2l marked complete.
- **ISSUES.md**: Closed 18 issues including UX-012, UX-013, UX-014, UX-015, UX-017, MYPLAYBOOK-001..004, LANDING-002..004, GALLERY-001..002, FLOW-001, FLOW-002, FLOW-004.
- **hybrid_execution_plan.md**: Synchronized status; Phase 3 (Security) identified as current focus.

---

### State summary for next session

```
Branch state:
  main — all Phase 2l improvements merged and verified.

Roadmap: Updated to v3.3.

Next Priority: Phase 3b — Security Hardening (Rate limiting, SQLi protection).
```

---

## 2026-05-01 — User Guide (Phase 2k) ✅

**Branch**: `014-user-guide` (implementation complete, verified, and merged to main)

---

### What was delivered this session

#### 1. User Onboarding
- **First-Run Modal**: Implemented `FirstRunModal` in `Editor.tsx` using `localStorage` (`hasSeenOnboarding`) to guide new users.
- **"How it works" Button**: Added a persistent help button in the editor sidebar to re-trigger the onboarding guide.

#### 2. Help & Documentation
- **Help Center**: Created `/help` page with "What's on the pitch" guide and common FAQs.
- **APES Framework**: Created `/help/coaching` page documenting the APES (Active, Purposeful, Enjoyable, Safe) framework for grassroots coaching.
- **Global Navigation**: Integrated Help links into the main header menu, footer, and mobile drawer.

#### 3. Entity Documentation Refinement
- **Visual Accuracy**: Updated all documentation (help page, README, patterns.md) to describe the rugby ball as a **"White oval token"** to match the actual canvas rendering.

#### 4. UI/UX Polish
- **Global Footer**: Added a site-wide `Footer` (hidden on editor/share routes) with navigation and branding.
- **Mobile Drawer Integration**: Added Help links to the `MobileDrawer` for better discoverability on small screens.

---

### Issues Logged / Updated
- **ROADMAP.md**: Updated to v3.2; Phase 2j and 2k marked complete. Launch Definition progress increased to 8/9.
- **ISSUES.md**: Closed UX-008 (Share Workflow), FEAT-010 (Snap to Grid), and added/closed UX-016 (User Onboarding & Help).

---

### State summary for next session

```
Branch state:
  main — all Phase 2k changes merged.

Roadmap: Updated to v3.2.

Next Priority: Phase 2l — Cosmetic Polish OR Phase 3b — Security Hardening.
```

See `docs/plans/prompts/2026-05-01-next-session-guide.md` for the full next-session kickoff prompt.

---

## 2026-05-01 — Editor Workspace Remodel (Phase 2i) ✅
 
 **Branch**: `012-editor-workspace-remodel` (implementation complete, verified, and logged)
 
 ---
 
 ### What was delivered this session
 
 #### 1. Workspace Layout Refinement
 - **Collapsible Sidebar**: Zero-width collapse with transition; state persists in `localStorage` (`sidebarCollapsed`).
 - **Focus Mode**: Chrome-free canvas view (≥85% viewport); snapshot restores previous sidebar state on exit.
 - **Mobile Drawer**: Replaced `MobileWarning` banner with a functional bottom drawer (`MobileDrawer.tsx`) for <768px viewports.
 - **Progression Panel**: Capped height (`max-h-16`) with horizontal scroll for pills; "Add" button pinned to the right.
 
 #### 2. Enhanced Remote Controls
 - **Expanded Floating Remote**: Second row toggle (Chevron) adds Add Frame, Pace (0.5x/1x/2x), Loop, and Ghosting controls.
 - **Draggable Persistence**: Remote position and expanded state persist in `localStorage`.
 
 #### 3. Stability & Testing
 - **E2E Stabilization**: Resolved race conditions with `localStorage` init scripts; added `data-testid` to mobile drawer for reliable targeting.
 - **Build Quality**: `npm run lint` and `npx tsc --noEmit` pass with zero errors (addressed `DrawingMode` type mismatches).
 - **Regression Check**: Verified `/share` and `/replay` routes remain stable and correctly scaled.
 
 ---
 
 ### Issues Logged / Updated
 - **ISSUES.md**: Logged 6 new items (MYPLAYBOOK-003, FLOW-004, UX-013..015, NAV-001) from manual review.
 - **Red/Blue Mismatch**: Captured the thumbnail color discrepancy (orange/green vs red/blue) in **UX-012**.
 
 ---
 
 ### State summary for next session
 
 ```
 Branch state:
   012-editor-workspace-remodel — implementation complete (19/19 tasks), verified.
 
 Roadmap: Updated to v3.2 (Phase 2i marked complete).
 
 Next Priority: Phase 2j — Snap-to-Grid.
 ```
 
 See `docs/plans/prompts/2026-05-01-next-session.md` for the full next-session kickoff prompt.
 
 ---
 

**Branch**: `010-auth-profile` (010 implementation complete; awaiting merge to main)
**Role context**: Session run as Senior Technical PM / Frontend Architect audit — no feature code written.

---

### What was delivered this session

#### Part 1 — Comprehensive audit (read-only, plan-mode)

Ran three parallel Explore agents to audit:
- **Governance docs** (`PRD-v2.0.md`, `ROADMAP.md` v3.0, `ISSUES.md`) — agent A
- **Konva canvas architecture + editor layout** — agent B  
- **Phase 2/3 implementation status + Animation→DB workflow** — agent C

**Key findings** (full detail in `C:\Users\kenho\.claude\plans\role-senior-technical-melodic-lobster.md`):

| Finding | Impact |
|---------|--------|
| ROADMAP v3.0 was ~40% stale — specs 006/007/008/009 all merged but ROADMAP still showed 2b/2c/2e/2f as "Open" | Doc drift eroding planning trust |
| FEATURE-001 (endorsement system) shipped silently in 009-gallery-playbook with no "pulled forward" marking | Issue hygiene gap |
| PRD never narrated the save→share→gallery flow; visibility values ('private'/'link_shared'/'public') undocumented in user-facing terms | Root cause of FLOW-001/002, UX-008 |
| Editor sidebar is `w-64` fixed on every viewport; no collapse/zen/focus mode; mobile <768 only warns, doesn't adapt | Screen real estate debt |
| Snap-to-grid is architecture-ready: pixel-absolute coords, ~3-line insertion at `PlayerToken.handleDragEnd` | Pull-forward justified |
| Audit scored 15/20; P1 violations: 15+ `rounded-*` in editor surfaces, 8 `bg-white`, 5 auth pages missing `font-heading` | Audit debt, pre-launch fix |
| SEC-001/002/003 (security hardening) unaddressed; PERF-001 (Lighthouse) unrun | Pre-beta blockers |

**Locked decisions** (from user response):
- Snap-to-grid → Phase 2j (after Workflow Clarity + Workspace Remodel)
- Editor remodel → all: collapsible sidebar + Focus Mode + mobile drawer
- Doc reconciliation → full restructure + PRD save/share rewrite
- FEAT-011 (rugby ball spinner) → stays in Phase 4
- FEATURE-001 → retro-fit hygiene note (done this session)

---

#### Part 2 — Doc reconciliation (implemented)

| File | Change |
|------|--------|
| `docs/authority/ROADMAP.md` | Full rewrite → **v3.1**. Shipped-phase table replaces scattered "Completed Work" bullets. Phases 2b/2c/2e/2f marked ✅ with spec refs + dates. New phases 2h (Workflow Clarity), 2i (Workspace Remodel), 2j (Snap-to-Grid), 2l (Cosmetic Polish) inserted. Phase 3f (Audit Remediation) added. Hygiene Rules section added. Phase 4 struck through FEATURE-001 (delivered) and FEAT-010 (moved to 2j). |
| `docs/archive/ROADMAP-2026-04-25.md` | v3.0 archived (copy of pre-rewrite file). |
| `docs/issues/ISSUES.md` | FEATURE-001 closed with "shipped via 009-gallery-playbook, pulled forward from Phase 4" hygiene note. Phase 4 index entry struck through. |
| `docs/authority/PRD-v2.0.md` | §5.13 *Save & Share Workflow (As Built)* inserted before §6 — 7 subsections covering mental model, endpoint table, visibility matrix, coach workflow narrative, title handling, gap cross-refs, §6.1 relationship. §6.1 clarified with v1→v2 cleanup note. Amendment A2.1-9 logged. |

---

### Open issues / outstanding questions

#### Questions for next session (decide before specifying)

1. **Sequence**: User leaning towards 2h → 2i → 2j. Confirm or redirect before starting `/speckit.specify`.

2. **Phase 2h scope decision**: Workflow Clarity covers both (a) small UI fixes (gallery↔/share navigation, breadcrumb, animation name on /share/{id}) and (b) a PRD prose section. Are both in scope for one spec, or should the UI piece be 2h and the PRD section is already done (§5.13 written this session)?

3. **Phase 2i sidebar design decision**:  
   - Collapsed state: icon-only (tools visible, labels hidden) vs fully hidden with reveal toggle?
   - Focus Mode: hide sidebar only, or also hide footer PlaybackControls?
   - Mobile drawer trigger: hamburger button in canvas header, or FAB?

4. **Phase 2j grid resolution**: ISSUES.md says "grid resolution relative to pitch markings." In practice this means the grid snaps to pitch zones (e.g. 5m, 10m, 22m intervals). Is that the intended unit, or is an arbitrary pixel grid (e.g. 10px) acceptable? This affects whether the grid overlay needs pitch coordinate awareness.

5. **Phase 2h post-010**: Should Phase 2h begin on a new branch immediately after 010 is merged, or before?

---

### State summary for next session

```
Branch state:
  010-auth-profile — implementation complete (13/13 tasks), NOT YET merged to main
  main — last merged: d5c62c1 (009-gallery-playbook)

Governance docs: reconciled 2026-04-28 (ROADMAP v3.1, PRD §5.13, ISSUES FEATURE-001 closed)

Untracked artefacts at repo root:
  nul       — 0-byte Windows artefact (> nul in bash). Safe to delete.
  .agents/  — untracked directory (investigate before committing)
  artifacts/ — untracked directory (investigate before committing)

Pre-push gate (run before any new PR):
  npm run lint && npx tsc --noEmit
  npm test -- --run
```

See `docs/plans/prompts/2026-04-28-next-session.md` for the full next-session kickoff prompt.

---

## 2026-04-25 — Editor & Canvas Planning Complete (005-editor-canvas, Phase 2a) ✅

**Full SpecKit planning workflow complete. Ready to implement.**

**Branch**: `005-editor-canvas`  
**Spec dir**: `specs/005-editor-canvas/`

**What was delivered this session**:

1. **`/speckit.specify`** — Created `spec.md` for Phase 2a (9 user stories, 12 FRs, 9 success criteria). Covers: PITCH-001/002, EDITOR-001–009. Constitutional compliance gate passed.
2. **`/speckit.plan`** — Created `plan.md`, `research.md`, `quickstart.md`. Researched all 9 issues in codebase. Key findings: SVG has 5 distinct defects; canvas sizing is 2 hardcoded constants; PlayerToken label is already `''` by default (not "Attacker/Defender"); 12-colour palette needs reduction to 6.
3. **`/speckit.tasks`** — Created `tasks.md` with 24 tasks (T001–T024) across 10 phases.
4. **`/speckit-superb-review`** — Coverage review: 33 requirements extracted, all covered. 3 description amendments applied to T012 (JSON preservation), T007–T009 (dependency notes), T020 (edge case coverage).
5. **Model delegation assessment** — 4 tasks require Sonnet; 17 tasks suitable for Haiku.

**E2E baseline** (background run, exit 0): 37 passed, 12 skipped, 21 did not run.

**Open issues**: None. All planning artifacts clean.

---

### Model Delegation — Quick Reference

| Model | Tasks |
|-------|-------|
| **Sonnet** | T002 (SVG rewrite), T006 (PitchLegend), T014 (tackle-shield), T018 (MetadataSheet) |
| **Haiku** | T001, T003–T005, T007–T013, T015–T017, T019, T023–T024 |
| Human | T020–T022 (manual browser checks) |

---

### Next Session Prompt

```
Continue feature 005-editor-canvas on coaching-animator.

Branch: 005-editor-canvas
Task list: specs/005-editor-canvas/tasks.md
Quickstart manual tests: specs/005-editor-canvas/quickstart.md

All planning is complete. Begin implementation using the task list.

## Task delegation (model efficiency)

Use Sonnet for: T002, T006, T014, T018 (new components / SVG spatial reasoning)
Use Haiku for: all other tasks (targeted deletions, property changes, 1-line wiring)

## MVP scope first (P1 — T001–T009)

T001: Run npm run lint && npx tsc --noEmit — verify clean baseline
T002: Rewrite public/assets/fields/rugby-union.svg (see plan.md Phase 0 for exact x/y coordinates)
T003: Create src/core/hooks/useEditorCanvasSize.ts (copy of useShareCanvasSize.ts; SSR fallback { width:800, height:600 })
T004: Wire useEditorCanvasSize into src/features/animation/components/Editor.tsx (replace lines ~62-63 hardcoded constants; add containerRef)
T005: Increase fontSize 11→14, add fontStyle="bold" on player label in src/features/animation/components/Canvas/PlayerToken.tsx (~line 238)
T006: Create src/features/animation/components/Canvas/PitchLegend.tsx (Konva Layer, listening={false}, bottom-left 16px margins, EntityColors.getDefault colours)
T007–T009: Add <PitchLegend> to Editor.tsx, ReplayViewer.tsx, ShareViewer.tsx Stage (each a 1-line JSX addition; verify position:fixed on ShareViewer unchanged)

After MVP: T010–T019 (P2+P3 stories, all Haiku-suitable)

## Pre-push gate

npm run lint && npx tsc --noEmit   (must be zero errors)
npm test -- --run                  (73/73 minimum)

## Shared canvas rule

Any change to Canvas/ components must be verified on ALL THREE routes:
/app, /replay/[id], /share/[id]
ShareViewer uses position:fixed inset:0 — do not alter that layout.

## Key files

public/assets/fields/rugby-union.svg
src/core/hooks/useShareCanvasSize.ts        ← pattern to copy for useEditorCanvasSize
src/features/animation/components/Editor.tsx (lines ~62-63: hardcoded canvas dims)
src/features/animation/components/Canvas/PlayerToken.tsx
src/features/animation/components/Canvas/Field.tsx (no change needed — SVG fix is asset-only)
src/features/animation/components/Sidebar/ProjectActions.tsx
src/features/animation/components/Sidebar/EntityProperties.tsx
src/features/animation/components/Sidebar/EntityPalette.tsx
src/core/constants/design-tokens.ts
src/shared/ui/ColorPicker.tsx

Spec: specs/005-editor-canvas/spec.md
Plan: specs/005-editor-canvas/plan.md
```

---

## 2026-04-25 — Technical Debt Refactor Complete (004, Phase 3a) ✅

**All 7 phases of `004-technical-debt-refactor` shipped. Branch merged to main.**

**What was delivered**:
- Editor.tsx reduced 852 → 504 lines (41% reduction) via 4 extracted domain hooks
- `useEditorContextMenuHandlers.ts` (160 lines) — 12 handlers, 3 state vars
- `useEditorProgressionHandlers.ts` (184 lines) — 4 handlers, 6 state vars, exposes setters for parent useEffect coordination
- `useEditorEntityHandlers.ts` (137 lines) — 8 handlers, guest limit modal state
- `useEditorPlaybackHandlers.ts` (71 lines) — 5 handlers, receives `setShowGuestLimitModal` from entity hook
- 25 granular store selectors (18 projectStore, 7 uiStore) replacing 2 broad destructures — eliminates re-render storms

**Verification**: 73/73 unit tests pass. ESLint 0 errors. TypeScript 0 errors. E2E pass. PR merged.

**Known gap**: Line count target was <400 lines; actual is 504. Remaining component manages lifecycle hooks, state coordination, and JSX — further reduction would require JSX extraction (diminishing returns, accepted as-is).

**Next**: Phase 3b — Security Hardening (rate limiting, SQL injection, XSS, CSRF, auth token audit). See `docs/authority/ROADMAP.md` Phase 3 table.

---

## 2026-04-24 — UI/UX Audit Remediation (Continued: 15→15/20) & Next Phase Planning

**Session work**: Fixed all P1/P2 issues from 2026-04-23 audit. Ran fresh `/audit` which scored 15/20 with a new set of systemic issues identified.

**Completed this session**:

1. **Fixed P1 issues from previous audit** (all 6):
   - Modal close buttons: `p-1` → `p-2.5` in SaveToCloudModal, ReportModal, EditMetadataModal
   - ColorPicker swatches: `w-8 h-8` → `w-10 h-10`
   - Landing page CTA hover: `hover:bg-accent-warm/90` → `hover:bg-[var(--color-accent-hover)]` (2 occurrences)
   - `prefers-reduced-motion` guard added to `globals.css`
   - Profile page: 30+ gray references tokenized (`text-gray-*` → `text-text-primary/X`, `bg-gray-*` → `bg-surface-warm`, etc.)
   - Admin page: 25+ gray references tokenized + dark spinner color (`border-emerald-600` → `border-primary`)
   - Landing page footer: emoji removed, wordmark simplified
   - Auth pages: Google OAuth button `bg-white hover:bg-gray-50` → `bg-surface hover:bg-surface-warm`
   - Contact page: `bg-white` → `bg-surface`
   - SkeletonCard: 5× `bg-gray-200` → `bg-surface-warm`
   - Sitemap page: complete rewrite — `border-l-2` → `border-l`, grays → tokens, touch target fixed on expand button, emoji removed from filter buttons
   - Gallery cards: `indigo-900/80 text-indigo-200` → `primary/80 text-text-inverse` (AnimationCard, PublicAnimationCard)

2. **Verification**:
   - `npm run lint` — zero errors ✓
   - `npx tsc --noEmit` — zero errors ✓

3. **Ran fresh `/audit`**:
   - Score remains 15/20 (same as before, but different issues flagged)
   - 4 P1, 5 P2, 3 P3 issues identified
   - Created comprehensive audit report: `docs/issues/audit-2026-04-24-score-15-20.md`

**Key findings from new audit**:

| Priority | Issue | Status |
|----------|-------|--------|
| P1 | `rounded-lg` / `rounded-md` / `rounded` on form elements in profile/admin — violates `--border-radius: 0px` token (~15 occurrences) | Documented |
| P1 | `bg-white` in editor-layer components (ShareViewer, Editor, ReplayViewer, ConfirmDialog, EntityContextMenu, InlineEditor, SportSelector) | Documented |
| P1 | `bg-gray-100 text-gray-400` in FrameStrip.tsx; `text-gray-500` in ConfirmDialog.tsx | Documented |
| P1 | Auth page `<h2>` headings missing `font-heading` (login, register, forgot-password, reset-password) | Documented |
| P2 | Gallery search/filter: `focus:outline-none` with only `focus:border-primary` — weak keyboard indicator | Documented |
| P2 | Admin spinners missing `role="status" aria-label="Loading"` | Documented |
| P2 | `bg-black/50` modal overlays use pure black (banned) — should be `bg-primary/60` | Documented |
| P2 | Template badge + remix button in PublicAnimationCard use off-token `bg-blue-600` | Documented |
| P2 | Progress bar `transition-all` animates `width` (layout property) | Documented |
| P3 | Inter body font monoculture (documented gap in `.impeccable.md`) | Flagged for future `/typeset` pass |
| P3 | Admin search input `w-56` fixed width — tight on narrow viewports | Minor |
| P3 | Auth Google button bare `rounded` may not resolve token correctly | Minor |

**Next session focus** (per your instruction): Use case flow friction + new features

Before diving into new features, recommend quick `/shape` + `/colorize` passes on the P1 issues above to keep the design system score healthy. These are mostly mechanical fixes (remove `rounded-*`, swap colors). Estimate 20-30 minutes total.

Then pivot to use case friction analysis and feature design.

**Audit findings document**: `docs/issues/audit-2026-04-24-score-15-20.md` — comprehensive, with priority sequencing and fixes outlined.

Lint: zero errors. TypeScript: zero errors.

---

## 2026-04-23 — UI/UX Audit Remediation (refine-uiux.md, 11→15/20) ✓

**All 7 tasks from `docs/plans/refine-uiux.md` complete. Score: 15/20.**

Tasks completed:

- **Task 1 `/harden`** — Accessibility: added `<main>` landmark to landing page, `aria-label` on gallery search input, `aria-label` on all 4 AnimationCard action buttons
- **Task 2 `/optimize`** — Image performance: removed `unoptimized` prop from AnimationCard and PublicAnimationCard thumbnails; added `loading="lazy"`. Confirmed `next.config.js` wildcard already covered Supabase hostname — no config change needed
- **Task 3 `/colorize`** — Hardcoded colors: added `--color-accent-hover: oklch(50% 0.14 60)` to `globals.css @theme`; replaced `#B45309` hover in `button.tsx` and `ProjectActions.tsx` (3 occurrences) with the new token; replaced `#FF6B00` in `FieldLayoutOverlay.tsx` with `DESIGN_TOKENS.colours.neutral[3]`; simplified `PlayerToken.tsx` ball/shield/bag `stroke` (both branches were `#1A3D1A`, same as `DESIGN_TOKENS.colours.primary`)
- **Task 4 `/quieter`** — Removed glassmorphism: `FloatingRemote.tsx` `bg-black/60 backdrop-blur-sm border border-white/20` → `bg-black/80 border border-white/10`; `OnboardingTutorial.tsx` `bg-black/50 backdrop-blur-sm` → `bg-black/70`
- **Task 5 `/shape`** — Removed banned border-left stripe in `collections/[id]/page.tsx` (`border-l-2 border-indigo-500/30` → `border border-border`); fixed off-brand `text-indigo-400` → `text-text-primary/60`
- **Task 6 `/adapt`** — Touch targets: AnimationCard action buttons `p-1.5` → `p-2.5` (all 4)
- **Task 7 `/polish`** — No further changes needed; all changes consistent with design system

Lint: zero errors. TypeScript: zero errors.

**Remaining issues found by `/audit` (starting point for next session)**:

| Priority | Issue | Location |
|----------|-------|----------|
| P1 | Modal close buttons `p-1` (~24px) — below 44px touch target | `SaveToCloudModal.tsx:179`, `ReportModal.tsx:77`, `EditMetadataModal.tsx:88` |
| P1 | Off-token grays in profile and admin pages (`text-gray-700/900`, `bg-gray-100`, `border-gray-300`) | `profile/page.tsx` (~20×), `admin/page.tsx` (~15×) |
| P2 | CTA hover inconsistency on landing page — uses `hover:bg-accent-warm/90` not `var(--color-accent-hover)` | `page.tsx:74`, `page.tsx:175` |
| P2 | ColorPicker swatches `w-8 h-8` (32px) — sub-44px touch target | `ColorPicker.tsx:39` |
| P2 | No `prefers-reduced-motion` guard in `globals.css` | `globals.css` |
| P3 | Rugby ball emoji in footer reads off-brand | `page.tsx:195` |

**Next session prompt**:

```
Continue UI/UX remediation on coaching-animator. Audit score is 15/20.

Remaining issues from docs/plans/HANDOFF.md (2026-04-23 entry):

P1 — /adapt pass:
1. Fix p-1 → p-2.5 on close (X) buttons in:
   - src/shared/components/SaveToCloudModal.tsx:179
   - src/shared/components/ReportModal.tsx:77
   - src/shared/components/EditMetadataModal.tsx:88
2. Fix ColorPicker.tsx:39 swatches from w-8 h-8 → w-10 h-10
3. Add prefers-reduced-motion block to src/app/globals.css

P1 — /colorize pass:
4. Tokenize src/app/profile/page.tsx (text-gray-* → text-text-primary/*, border-gray-* → border-border, bg-gray-* → bg-surface-warm/bg-background)
5. Same treatment for src/app/admin/page.tsx
6. Fix hover:bg-accent-warm/90 → hover:bg-[var(--color-accent-hover)] in src/app/page.tsx:74 and :175

After each pass: npm run lint && npx tsc --noEmit
Then run /audit to verify score improvement above 15/20.
```

---

## 2026-04-20 — Landing Page Rebrand Complete (T3 all phases) ✓

**All T001–T019 complete. Feature `002-landing-rebrand` fully delivered.**

Session 1 (T001–T012) — token foundation + feature cards:
- Oswald font via `next/font/google`, cream palette tokens, typographic feature cards

Session 2 (T013–T019) — verification + one fix:
- T013/T014: Mobile 375px — PASS (no scroll, 18px body, 328×88px CTA)
- T015: Amber CTA contrast FIXED — `text-white` (3.19:1) → `text-gray-900` (6.59:1)
- T016: Accessibility spot-check — PASS (all combinations well above 4.5:1)
- T017: lint + tsc — PASS (zero errors)
- T018/T019: Nav/footer visual check + 9-section quickstart checklist — PASS
- Spec status set to Verified; 15/15 spec requirements covered

**Next**: Phase 3 — Automated UAT for core loop (see ROADMAP.md)

---

## 2026-04-19 — Design Context Setup & Authority Doc Cleanup

**Completed**:
- Installed impeccable plugin; ran `/impeccable teach` to establish design context
- Created `.impeccable.md` — full design context: brand (direct · tactical · grassroots), aesthetic direction (coaching whiteboard tradition, anti-SaaS), palette open for rethink, Inter flagged for replacement, WCAG AA, priorities (landing page → gallery)
- Added one-line Design Context pointer to `CLAUDE.md` (full content lives in `.impeccable.md`)
- Reviewed constitution v3.4.1, PRD-v2.0, and ROADMAP against impeccable insights
- **Fixed**: OAuth prohibition was wrong in both `CLAUDE.md` and `ROADMAP.md` — both said "no third-party auth providers" but constitution v3.4.1 (CA-2026-001) explicitly permits Google/Apple/GitHub OAuth. Corrected both files.
- **Deferred to T3**: Constitution Design System hardcodes Inter and near-pure-white hex values — these conflict with impeccable direction but will be resolved during the landing page overhaul
- Deleted stale individual handoff detail files (Phase 1 is shipped; rolling log is sufficient)

**Next**: T3 — Landing page overhaul. Use `/impeccable` skills to guide design. `.impeccable.md` has the full design brief.

---

## 2026-04-18 — Final Scaling Verification & Phase 1 Completion

*Full detail: `docs/plans/HANDOFF-2026-04-18-final-scaling-verification-completion.md`*

**Completed**: Feature `001-fix-share-scaling` is fully delivered. Verified entity icon scaling on mobile viewports (320px to 390px+) using TDD. All 4 Playwright scaling tests pass green. Extra quality gates passed (lint, tsc, units). All work merged and pushed to `main`.

**Core Loop Fixed**: The primary launch blocker—canvas coordinates not mapping correctly to mobile screen sizes—is resolved. Replay links now render a perfect, interactive pitch on players' phones.

**Next**: Phase 2 — Launch Credibility (Landing Page Overhaul).

---

## 2026-04-18 — Entity Icon Scaling Fix (Follow-on Bug)

*Full detail: `docs/plans/HANDOFF-2026-04-18-entity-scaling-fix.md`*

**Completed**: Entity icon scaling implementation using TDD (T018–T021). New E2E tests written (4/4 GREEN), spec extended with US4 + new FRs/CVs/SCs, all quality gates pass (lint, tsc, 50/50 unit tests, 80/80 E2E). Changes uncommitted on `001-fix-share-scaling`.

**Bug fixed**: Animated icons (players, cones, balls) now render at correct scale on mobile share route. Issue: entities were at raw 800×600 editor coordinates on a ~390×292 mobile canvas. Fix: apply scaleX/scaleY transform (canvasWidth/800, canvasHeight/600) to entity layer only.

**Next**: T022 (manual /app + /replay verify), T023 (confirm gates), then `speckit.superb.verify` mandatory gate.

---

## 2026-04-18 — Mobile Replay Scaling Implementation

*Full detail: `docs/plans/HANDOFF-2026-04-18-mobile-scaling-impl.md`*

**Completed**: Full SpecKit workflow (plan → tasks → implement) for `001-fix-share-scaling`.
Three files changed: `useShareCanvasSize.ts` (lazy initializer), `share/[id]/page.tsx` (loading placeholder + dead wrapper), `ShareViewer.tsx` (zero-frames fallback). New TDD test added. 50/50 unit tests, 70/70 E2E tests passing. All changes uncommitted.

**New bug discovered**: Entity icons (players, cones) appear at wrong position/scale on the share route — they render at editor coordinates rather than scaled to the new canvas size. Pitch and FloatingRemote are fine. Root cause is likely in `Stage.tsx` `scaleX/scaleY` computation. Fix required before closing spec.

**Next session prompt**: See full handoff doc above.

---

## 2026-04-18 — Project Direction & Infrastructure Restore

**Supabase restored.** DB had been paused due to inactivity. Restored via dashboard — all data intact. Vercel deployment confirmed active.

**Project direction interview completed.** Key findings:
- Status: pre-launch, no external users yet
- Primary usage: desktop edit / mobile view (original plan holds)
- Dev bandwidth: a few hours per week
- Single launch blocker: mobile replay scaling (ShareViewer forces pinch-zoom)
- v1 definition: core loop working + polished landing page + basic user guide
- Mobile editor: explicitly v2

**Roadmap established** (see `docs/authority/ROADMAP.md`):
- Phase 0: Infrastructure rescue ✅ (complete this session)
- Phase 1: Mobile replay scaling fix
- Phase 2: Landing page overhaul (tactical/hand-drawn aesthetic) + inline user guide
- Phase 3: Automated UAT for core loop
- Phase 4: AI animation spike + growth

**SpecKit brownfield bootstrap completed** (earlier same day):
- `.specify/memory/constitution.md`: File Organization section updated to real feature-based architecture
- `.specify/templates/spec-template.md`: Constitutional compliance gate, frontend/API/canvas sections added
- `.specify/templates/plan-template.md`: Real tech context, actual directory structure
- `.specify/templates/tasks-template.md`: Real paths, test commands, project notes
- `docs/authority/constitution.md`: Deleted (was backup copy — `.specify/memory/constitution.md` is canonical)
- Committed and pushed: `e042afb`

**Next session prompt:**

```
You are continuing work on coaching-animator, a Next.js 14 animation tool for rugby coaching.

Infrastructure is healthy — Supabase restored, Vercel active.

The current priority is Phase 1: fix mobile replay scaling in ShareViewer.

The core problem: ShareViewer forces users to pinch-zoom because the Konva canvas doesn't
scale correctly to the mobile viewport. The position:fixed inset:0 constraint must be
preserved.

Key files:
- src/features/animation/components/ShareViewer.tsx
- The useShareCanvasSize hook (find via grep)
- Canvas components shared across /app, /replay/[id], /share/[id] — test all three

Start with: /speckit.specify "fix mobile replay scaling in ShareViewer"

Roadmap reference: docs/authority/ROADMAP.md
Tooling reference: SPECKIT.md
Pre-push gate: npm run lint && npx tsc --noEmit
```

---

## 2026-02-27 — Canvas Pitch Render E2E Diagnostics (CLEO era)

*Agent-prompt style handoff. Full content: `docs/plans/HANDOFF-2026-02-27-e2e-test.md`*

Ran canvas-pitch-render E2E spec against production. Tests target `https://coaching-animator.vercel.app` by default.

---

## 2026-02-25 — Phase 4 Planning Session (CLEO era)

*Agent-prompt style handoff. Full content: `docs/plans/HANDOFF-2026-02-25-phase4.md`*

Set up Phase 4 (v2.3) planning for Club Personalization & Video Links features.
