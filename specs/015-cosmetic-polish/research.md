# Research: Phase 2l — Cosmetic Polish

**Branch**: `015-cosmetic-polish` | **Date**: 2026-05-01

## Methodology

Codebase scan of all files named in the spec's project structure section, plus the landing page, entity colour service, and design tokens. Findings compared against spec requirements to identify what is already done, what is a tweak, and what is new work.

---

## Critical Discovery: Several Issues Already Resolved

The following spec requirements are **already implemented** in the current codebase. These need verification only (SC-008 style), not implementation:

| Issue | Spec Assumption | Reality | Verification Task |
|-------|----------------|---------|------------------|
| FLOW-001 / FR-003 | Gallery Play → `/replay/{id}` needs fixing | `GalleryClient.tsx` `handleView` already routes to `/share/${id}` | Verify no `/replay/` links remain on public surfaces |
| LANDING-002 / FR-017 | Tactical-ball SVG hero is missing | `HeroBackground.tsx` has 6 animated SVG tactical-diagram variants cycling | Verify hand-drawn aesthetic + rugby-ball shape requirement from ISSUES.md |
| LANDING-003/004 / FR-018..021 | Copy references "code" and GIF export | `page.tsx` Section 2/3 cards contain no "code" or GIF/export text | Read copy carefully; Section 2 card 2 = sharing benefit; card 4 = "Free to use" |
| UX-017 / FR-022 | Footer duplicates links above it | Footer contains only Terms, Privacy, Contact, Site Map (distinct from CTA section above) | Verify footer has no nav links duplicated from section above |
| MYPLAYBOOK-001 / FR-007 | My Playbook has no search/filter | `my-gallery/page.tsx` already has search input, type filter, sort controls (lines 199–255) | Verify filter behaviour end-to-end |

**Impact**: Workstream 1 (Landing Polish) and parts of Workstream 3 (FLOW-001) reduce to verification/confirmation tasks rather than new code.

---

## Workstream 3 — Share-flow Clarity

### ShareViewer (`src/features/animation/components/ShareViewer.tsx`)

**Line count**: ~358

**Title** (FR-004):
- `animationTitle` prop exists and renders at top-center (gradient bar, lines 271–278).
- **Gap**: `text-center` — needs changing to `text-left`.
- `font-heading` already applied — no change needed there.

**"Powered by" link** (FR-005):
- Does **not** exist. New element needed.
- Bottom-right absolute position is available.
- `FloatingRemote` is bottom-right relative to canvas; attribution must NOT collide. Position as `absolute bottom-2 right-2` within the chrome layer outside the canvas div.

**Back button** (FR-006):
- Hardcoded to `/gallery` (lines 344–355).
- Needs owner-aware routing: owner → `/my-gallery`, others → `/gallery`.
- No `userId` prop currently passed. Solution: page.tsx selects `user_id` from animation query and passes as `animationUserId` prop; ShareViewer derives `isOwner` using `useUser()` from UserContext.

**`bg-white` violation** (impeccable P1):
- `ShareCanvas` div has `className="bg-white overflow-hidden"` (line 177).
- Must change to `bg-surface` or `bg-[#FDFAF5]` (cream token).

**Canvas sizing** (CV-002):
- `position: fixed; inset: 0` confirmed ✓.
- `useShareCanvasSize` ResizeObserver on container — do NOT modify.

### Share page (`src/app/share/[id]/page.tsx`)

**Line count**: ~150

**Owner detection**: Server component. Does not currently pass `user_id` of animation owner.
- Fix: add `user_id` to Supabase select query (line 69–76).
- Pass as `animationUserId` prop to `ShareViewer`.

### Editor share button (`src/features/animation/components/Editor.tsx` / `EditorFloatingRemote.tsx`)

**Critical finding**: **No share button exists at all** in the Editor or `EditorFloatingRemote`. EDITOR-002 describes a share button showing "not available in development" — this appears to have been removed/never fully implemented.

**EditorFloatingRemote buttons**: prev/next frame, play/pause, frame counter, expand, add frame, speed, loop, ghost mode. No share action.

**Required work**:
1. Create `ShareSheet.tsx` component with Web Share API + clipboard fallback.
2. Add a Share button to the editor interface (EditorFloatingRemote expanded row or editor toolbar/header).
3. Button only active when animation has a saved ID (not a new unsaved animation).

### Gallery share from card (GALLERY-002)

- `PublicAnimationCard.tsx` already has a Share button (lines 302–313) with Web Share API + clipboard fallback — **pattern exists**.
- `AnimationCard.tsx` has share icon only (line 232) — needs upgrading to match.
- The `PublicAnimationCard` share pattern is the model for `ShareSheet.tsx` extraction.

---

## Workstream 2 — Gallery / Playbook Parity

### AnimationCard (`src/features/gallery/components/AnimationCard.tsx`)

**Line count**: ~300

| Feature | Status | Gap |
|---------|--------|-----|
| MiniPitchSVG preview | Present (line 153) | None |
| ProgressionStrip | Present (line 280) | None |
| Edit action | Icon only (line 253) | Needs text label (FR-009) |
| Replay/Play action | Click overlay only | Needs labelled "Replay" button (FR-009) |
| Share action | Icon only (line 232) | Needs labelled "Share" button matching PublicAnimationCard (FR-009) |
| `endorsed_by` badge | Missing — not in type | `AnimationSummary` type missing `endorsed_by`; no badge render (FR-015) |
| Hover consistency | `hover:bg-surface-warm` | Needs shared utility class (UI-005) |
| `rounded-full` | **Violation** lines 177, 184 | Fix to `rounded-none` (impeccable P1) |
| Remix link | `/replay/` | Update to `/share/` |

### PublicAnimationCard (`src/features/gallery/components/PublicAnimationCard.tsx`)

**Line count**: ~323. This is the parity target.

Violations found:
- `rounded-full` lines 177, 184 — same fix needed
- Remix attribution link uses `/replay/` (line 225) — old route, update to `/share/`

### MiniPitchSVG (`src/features/gallery/components/MiniPitchSVG.tsx`)

**Line count**: ~102

Current colour mapping (needs fixing for FR-014):

| Element | Current Value | Should Be | EntityColors Source |
|---------|--------------|-----------|---------------------|
| Pitch background | `var(--color-primary)` = `#1A3D1A` | ✓ pitch green | Correct |
| Attack player dots | `var(--color-accent-warm)` = `#D97706` | Blue (`#2563EB`) | `EntityColors.getDefault('player', 'attack')` |
| Defence player dots | `var(--color-text-primary)` @ 40% | Red (`#DC2626`) | `EntityColors.getDefault('player', 'defense')` |
| Cones | Not rendered | Hi-vis yellow (`#E6EA0C`) | `EntityColors.getDefault('cone')` = `neutral[2]` |

Note on colour semantics: in the EntityColors service, `attack` = blue gradient (`attack[0]` = `#2563EB`) and `defense` = red gradient (`defense[0]` = `#DC2626`) — confirmed from `src/core/constants/design-tokens.ts`. The spec copy says "red attack / blue defence" — this is **reversed from the actual token values**. Implementation MUST match the tokens (blue attack, red defence), not the spec prose.

**⚠️ CLAUDE.md global instruction discrepancy**: the global CLAUDE.md shows `EntityColors.getDefault('player', 'attack') → '#ef4444' (red)` — this is incorrect. The actual resolved value is `#2563EB` (blue). Treat `design-tokens.ts` and `entityColors.ts` source as authoritative over CLAUDE.md comment examples.

Implementation approach: MiniPitchSVG is a React SVG component. Pass player/cone colours as props derived from `EntityColors` calls at the caller site (e.g. `AnimationCard`), or import `EntityColors` directly in `MiniPitchSVG` (it has no React dependency). Direct import is cleaner.

A note at line 25 says "intentional documented exception per research.md Decision 6". **FR-014 overrides this**: the phase requirement is explicit.

### My Playbook page (`src/app/my-gallery/page.tsx`)

**Line count**: ~393

**Search/filter**: Already exists ✓ (lines 199–255).

**Page banner / visual distinction** (FR-011):
- Existing header (lines 178–197): generic `text-2xl font-heading` heading "My Playbook".
- Missing: tactical motif, different background tone from `/gallery`.
- Gap: no `bg-` differentiation; same appearance as gallery page.

**Private animation open bug** (FR-010 / MYPLAYBOOK-004):
- `onPlay` calls `/share/${animation.id}` (line 167).
- Bug may be in the share route's auth check, not the card navigation. Requires investigation of `src/app/share/[id]/page.tsx` RLS/auth handling for private animations viewed by owner.

---

## Workstream 4 — Header / Profile Context

### Navigation (`src/shared/components/Navigation.tsx`)

**Auth state** (FR-023 / UX-005):
- Unauthenticated: "Sign In" and "Get Started" text links — plain.
- Authenticated: "My Playbook", "Profile", "Create", "Sign Out" links — plain. No visual identity indicator.
- **Gap**: No profile chip showing who is signed in. A `ProfileChip` component (initial/avatar) should replace or augment the "Profile" text link.

### Profile page (`src/app/profile/page.tsx`)

**Line count**: ~350+

**Current state**:
- Has identity card header: avatar circle with initials/OAuth avatar, `font-heading` display name, uppercase, bold (lines 249–279) — good composition ✓
- `font-heading` on display name: already applied ✓
- Sections below: form fields for name, email, etc. — reasonably structured

**Violations**:
- `rounded-full` on avatar circle (line 253) — impeccable P1, change to square (no radius)
- `rounded-full` on loading spinner (line 235) — minor, fix

**Assessment**: The profile page already reads as an identity card. PROFILE-001 in 2l is largely reduced to fixing the `rounded-full` violations. No layout overhaul needed.

---

## Workstream 1 — Landing Polish (Verification Tasks)

### `src/app/page.tsx`

**Section 2 cards** (FEATURES array ~lines 33–57):
- Card 2: About sharing squad — no "code" reference ✓
- Card 4: "Free to use" — no export/GIF reference ✓

**Section 3 How It Works** (~lines 131–155):
- Step 1: "Click to add... drag to position" — accurate ✓
- Step 3: "Share a link" — no GIF export ✓

**Footer** (~lines 187–204): Terms, Privacy, Contact, Site Map — distinct from CTA section above ✓

**Conclusion**: LANDING-003, LANDING-004, UX-017 appear already resolved. Verification only.

### `src/app/_components/HeroBackground.tsx`

**Line count**: ~487

Has 6 SVG tactical diagram variations with:
- Amber (`#D97706`) strokes / markings ✓
- Pitch lines ✓
- Hand-drawn aesthetic ✓
- Animated cycling ✓

**Potential gap**: These are tactical *diagram* elements (lines, arrows, passes), not a rugby *ball* shape. LANDING-002 in ISSUES.md specifically calls for a "tactical-ball SVG" — may mean a rugby ball shape is needed in addition to or instead of the current diagrams. Requires reading ISSUES.md note carefully before marking resolved. If only tactical diagrams are needed, this is already done.

---

## Workstream 5 — Impeccable Audit Pass

Violations found across codebase scan (confirmed):

| File | Line | Violation | Fix |
|------|------|-----------|-----|
| `ShareViewer.tsx` | ~177 | `bg-white` on ShareCanvas | → `bg-surface` |
| `AnimationCard.tsx` | 177, 184 | `rounded-full` | → `rounded-none` |
| `PublicAnimationCard.tsx` | 177, 184 | `rounded-full` | → `rounded-none` |
| `profile/page.tsx` | 253 | `rounded-full` on avatar | → `rounded-none` |
| `MiniPitchSVG.tsx` | ~all | Wrong entity colour tokens | → EntityColors |

Additional items to check during audit pass (may not be violations, need verification):
- Any new `rounded-*` introduced during WS1–4 implementation
- Any new `bg-white` on editor/share surfaces
- `font-heading` applied to: share-view title reposition, page banners, profile heading (verify)
- Amber (`#D97706`) not used on new badges/hover states

---

## Revised Workstream Effort Assessment

Based on research:

| Workstream | Original Assessment | Revised |
|-----------|--------------------|---------| 
| WS1 — Landing | medium (copy + SVG) | small (mostly verification; hero SVG done) |
| WS2 — Gallery/Playbook | large (parity work) | medium (AnimationCard labelling + MiniPitchSVG colours + banner; search already exists) |
| WS3 — Share-flow | large (share button + routing) | medium-large (share button new work; FLOW-001 already done; ShareViewer tweaks) |
| WS4 — Header/Profile | small | small (ProfileChip in nav + profile rounded-full fix) |
| WS5 — Audit | small | small (already identified violations, targeted fixes) |

Overall: scope is **smaller than originally sized** — approximately medium-large not large.

---

## Decision Log

| Decision | Rationale |
|----------|-----------|
| `ShareSheet.tsx` extraction | Both Editor and Gallery card need Web Share + clipboard. Pattern exists in PublicAnimationCard; extract to shared component to avoid duplication. |
| `animationUserId` prop on ShareViewer | Owner-aware back button requires owner's user_id. Server component passes it; ShareViewer client-side compares with `useUser()`. Avoids auth call on server path. |
| MiniPitchSVG colours via direct EntityColors import | Component is a React component; can import service directly. Cleaner than prop-passing from every caller. |
| Landing copy — verify only, don't rewrite | Codebase scan shows copy is already correct. Rewriting risks introducing new errors. Verify first; only edit if stale copy found. |
| FLOW-001 / gallery Play — verify only | `handleView` already routes to `/share/`. No change needed unless verification reveals regression. |
