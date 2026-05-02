# Implementation Plan: Phase 2l — Cosmetic Polish

**Branch**: `015-cosmetic-polish` | **Date**: 2026-05-01 | **Spec**: `specs/015-cosmetic-polish/spec.md`

## Summary

Close ~22 open issues across 5 workstreams to complete Phase 2: (1) landing page credibility polish, (2) My Playbook parity with the public Gallery, (3) share-flow clarity end-to-end, (4) header auth-state visibility and profile composition, (5) impeccable design audit pass. No new APIs, no schema changes, no shared-canvas modifications. Exit criterion: impeccable audit ≥18/20, lint+tsc clean, E2E green.

---

## Technical Context

**Language/Version**: TypeScript 5 · Node 22
**Framework**: Next.js 14 App Router (SSR + API Routes)
**Canvas**: Konva (react-konva) — shared across `/app`, `/replay/[id]`, `/share/[id]` — **NOT TOUCHED this phase**
**State**: Zustand stores in `src/core/stores/`
**Backend**: Supabase (PostgreSQL + Auth + RLS) via `src/lib/supabase/`
**Styling**: Tailwind CSS + Radix UI primitives
**Testing**: Vitest (unit) · Playwright (E2E)
**Deploy**: Vercel (CI via GitHub Actions)
**Performance Goals**: No new canvas interactions; API responses <500ms p95
**Constraints**: No telemetry; no third-party analytics; RLS on all DB tables; entity colors via EntityColors service only; no `rounded-*` on new surfaces; no `bg-white` on editor/share surfaces; amber only for singular CTAs

---

## Constitutional Compliance Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Check | Status | Notes |
|-------|--------|-------|
| Tier alignment (Guest/Auth/Public/Admin) | [x] | Tier 0 (landing/share), Tier 1 (Playbook, editor share, profile), Tier 2 (gallery). No Tier 3. |
| No telemetry or analytics | [x] | FR-025 explicitly prohibits new tracking/SDKs |
| Entity colors via EntityColors service | [x] | FR-014 and CV-003 mandate token/EntityColors resolution for MiniPitchSVG; UI-002/UI-003 prohibit raw hex |
| Shared canvas — tested on all 3 routes | [x] | CV-001: Stage.tsx, Field.tsx, PlayerToken.tsx, EntityLayer.tsx, AnnotationLayer.tsx explicitly NOT touched |
| New data: privacy impact assessed | [x] | API-003: no new fields, columns, or migrations; no new PII |
| Supabase joins flattened before use | [x] | No new queries; reuses existing endpoints |

> Constitutional compliance confirmed. No violations. Phase 0 cleared.

---

## Project Structure

### Documentation (this feature)

```text
specs/015-cosmetic-polish/
├── spec.md              # Feature specification (/speckit.specify output)
├── plan.md              # This file (/speckit.plan output)
├── research.md          # Phase 0 codebase research (/speckit.plan output)
├── data-model.md        # Phase 1 schema design (/speckit.plan output)
├── quickstart.md        # Phase 1 manual test guide (/speckit.plan output)
└── tasks.md             # Task list (/speckit.tasks output — NOT created here)
```

### Source Code Touched

```text
src/
├── app/
│   ├── page.tsx                         # Landing: Section 2 cards 2+4, Section 3 cards 1+3, footer (FR-017..022)
│   ├── _components/
│   │   └── HeroBackground.tsx           # Landing hero tactical-ball SVG (FR-017)
│   ├── gallery/
│   │   └── GalleryClient.tsx            # Play→/share/{id} route fix (FR-003), gallery page banner (FR-011)
│   ├── my-gallery/
│   │   └── page.tsx                     # Search/filter (FR-007), page banner (FR-011), private open (FR-010)
│   ├── share/[id]/
│   │   └── page.tsx                     # Animation title + attribution passthrough (FR-004, FR-005, FR-006)
│   └── profile/
│       └── page.tsx (or profileUtils)   # Layout/composition pass (FR-024)
│
├── features/
│   ├── animation/
│   │   ├── components/
│   │   │   ├── Editor.tsx               # Share button fix — remove placeholder, add share sheet (FR-001, FR-002)
│   │   │   ├── ShareViewer.tsx          # Title overlay + attribution + context-aware back (FR-004, FR-005, FR-006)
│   │   │   └── ShareSheet.tsx           # NEW: Web Share API + clipboard fallback (FR-001, FR-002, FR-006)
│   │   └── services/
│   │       └── entityColors.ts          # Read-only reference for MiniPitchSVG tokens
│   └── gallery/
│       ├── components/
│       │   ├── AnimationCard.tsx        # Parity: mini-pitch preview, progression strip, clear actions (FR-008, FR-009)
│       │   ├── PublicAnimationCard.tsx  # Hover consistency fix (FR-012), card layout slots (FR-013)
│       │   ├── MiniPitchSVG.tsx         # Palette fix: pitch green, red/blue, hi-vis yellow via tokens (FR-014)
│       │   └── RFUBadge.tsx             # NEW or existing: production compressed asset (FR-015)
│       └── services/ (if needed)
│
├── shared/
│   ├── components/
│   │   └── Navigation.tsx (or Header)   # Auth state indicator: guest Login / auth chip (FR-023)
│   └── ui/
│       └── card-action-hover.ts         # Shared hover utility (UI-005)
│
└── public/
    └── assets/
        ├── tactical-ball.svg            # NEW: hand-drawn marker aesthetic (FR-017)
        └── hampshire-rfu-badge.*        # Production compressed <50 KB asset (FR-015)
```

---

## Complexity Tracking

No constitutional violations — table not required.

---

## Phase 0: Research

> Full detail in `research.md`. Key findings summarised here.

### Key Questions Resolved

| Question | Finding |
|----------|---------|
| Does ShareViewer have title/attribution slots? | Title exists but centered — tweak to left-align. No "powered by" link. Back button hardcoded `/gallery`. `bg-white` violation on ShareCanvas. |
| What does Editor share button do? | **No share button exists at all.** EditorFloatingRemote has no share action. Requires new ShareSheet component + button. |
| Does GalleryClient route Play to /share or /replay? | **Already routes to /share/{id}.** FLOW-001 verified resolved. No code change needed. |
| Does AnimationCard have mini-pitch / progression strip? | Both exist. Missing: labelled Edit/Replay/Share actions (icon-only), `endorsed_by` type/badge, `rounded-full` violations. |
| Does my-gallery page have search/filter? | **Already exists** (lines 199–255 with title/tag search + sort). Only missing: page banner / visual distinction from /gallery. |
| What colours does MiniPitchSVG use today? | Attack = amber (wrong), Defence = text (wrong), Cones = not rendered. All need EntityColors fix. |
| What does HeroBackground.tsx render today? | 6 animated SVG tactical-diagram variants (pitch lines, arrows). Likely satisfies LANDING-002 but verify rugby-ball shape requirement from ISSUES.md. |
| Does the header show auth state? | Plain text links only. No profile chip. Auth state not visually distinct from navigation links. |
| Does the profile page need composition work? | Identity card already structured. Only fix: `rounded-full` on avatar → `rounded-none`. |

### Scope Reduction Summary

Several spec items are already resolved in the codebase:
- FLOW-001 / FR-003 (gallery Play → `/share/`) — **already done**
- MYPLAYBOOK-001 / FR-007 (Playbook search/filter) — **already done**
- LANDING-003/004 / FR-018..021 (copy fixes) — **appears done**, verify only
- UX-017 / FR-022 (footer duplication) — **appears done**, verify only
- LANDING-002 / FR-017 (tactical SVG hero) — **likely done**, verify rugby-ball shape

Actual new code required: Editor ShareSheet, ShareViewer tweaks (alignment + attribution + back-routing + bg-white fix), AnimationCard label additions + endorsed_by, MiniPitchSVG colour fix, Navigation ProfileChip, page banners, profile rounded-full fix.

---

## Phase 1: Design

### Workstream Sequence

These workstreams can largely proceed in parallel, with the share-flow group (WS3) carrying the most cross-file risk. Recommended implementation order within a single session:

1. **WS4 — Header/Profile** (smallest blast radius, isolated shared component)
2. **WS1 — Landing Polish** (isolated route, no shared state)
3. **WS2 — Gallery/Playbook Parity** (two pages, shared card components)
4. **WS3 — Share-flow Clarity** (ShareViewer + Editor + GalleryClient — test all 3 routes after)
5. **WS5 — Impeccable Audit Pass** (verification sweep on touched surfaces)

### Data Model

See `data-model.md`. Summary: **no schema changes**. All requirements are UI/composition changes reusing existing entities.

### Interface Contracts

No new API routes. Existing endpoints unchanged (API-001). See `data-model.md` for component interface additions.

### Key Decisions

**ShareSheet component**: Extract share-sheet behaviour into a new `ShareSheet.tsx` component (used by both Editor and Gallery card) to avoid duplicating Web Share API + clipboard logic. Located at `src/features/animation/components/ShareSheet.tsx` (it's animation-feature-owned because it produces animation share links).

**Gallery/Playbook page banners**: Two separate banner sections in GalleryClient and my-gallery page — each with a `font-heading` page title, a tactical motif (SVG or CSS), and a subtle `bg-` background tint. Banner must render above the card grid, below the main Navigation.

**Card layout slots**: Enforce stable card height via Tailwind `min-h-[N]` on the tag-row and progression-strip divs. Use `h-0` collapse when empty so no blank whitespace, but overall card height is stable by having a fixed `min-h` outer container per card.

**MiniPitchSVG colours**: Replace any hardcoded hex in `MiniPitchSVG.tsx` with Tailwind token class fills or inline `style` referencing the values exported from the `EntityColors` service.

**Context-aware back button**: In `ShareViewer.tsx`, read the user's auth state and the animation's `user_id` to determine the back href. Owner (authenticated user whose `id === animation.user_id`) → `/my-gallery`; otherwise → `/gallery`.

**RFU badge**: `endorsed_by` column already exists. Add compressed `hampshire-rfu-badge.webp` (or `.png`) to `public/assets/`. Enforce <50 KB in CI via a file-size check in package.json scripts or a lint rule.

**Impeccable audit**: After all changes, run `/impeccable:audit` (or the audit-2026-04-24 framework) to verify ≥18/20. Target P1 gaps on touched surfaces: `rounded-*`, `bg-white`, `font-heading` missing.
