# Implementation Plan: User Guide (Phase 2k)

**Branch**: `014-user-guide` | **Date**: 2026-05-01 | **Spec**: `specs/014-user-guide/spec.md`

## Summary

Deliver the v1 self-onboarding requirement: a non-blocking corner card in the editor, a `/help` page, a `/help/coaching` APES taster page, a navigation "?" icon, and a site footer with a Help link. The onboarding card already exists as `FirstRunModal` (a blocking dialog) — it needs to be converted to a non-blocking corner overlay with corrected styling per `.impeccable.md`. No new database schema or API routes are required.

---

## Technical Context

**Language/Version**: TypeScript 5 · Node 22
**Framework**: Next.js 15 App Router (SSR + API Routes)
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

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Check | Status | Notes |
|-------|--------|-------|
| Tier alignment (Guest/Auth/Public/Admin) | [x] | All new surfaces (onboarding, /help, /help/coaching) are Tier 0 (Guest) accessible. No tier-gated content added. |
| No telemetry or analytics | [x] | Onboarding dismissed state stored in `localStorage` only. No server-side persistence, no identity attached. |
| Entity colors via EntityColors service | [x] | Not applicable — no canvas entity changes. |
| Shared canvas — tested on all 3 routes | [x] | `FirstRunModal` renders in `/app` only. No canvas component changes. Only verify `/app` regression. |
| New data: privacy impact assessed | [x] | No new server-side data. Existing `localStorage` key `'firstRunSeen'` is retained. |
| Supabase joins flattened before use | [x] | Not applicable — no new queries. |

> No constitutional violations identified. Proceed.

---

## Phase 0: Research Findings

### Finding 1 — FirstRunModal already exists

**File**: `src/features/animation/components/FirstRunModal.tsx`
**Current state**: A **blocking** Radix UI Dialog that prevents canvas interaction until explicitly dismissed. Already rendered in `Editor.tsx:302`.
**Problem**: Contradicts the clarified spec (non-blocking corner overlay). Also uses `rounded-md` (violates `.impeccable.md` zero border-radius rule).
**Decision**: Refactor `FirstRunModal` in-place — remove Radix Dialog, replace with an absolutely positioned corner card. Do not rename the file (the import in Editor.tsx will stay clean).

### Finding 2 — OnboardingTutorial.tsx is orphaned

**File**: `src/shared/components/OnboardingTutorial.tsx`
**Current state**: Exists but is **not imported anywhere**. It's a multi-step modal with emojis, `rounded-xl`, `rounded-full`, and `animate-in zoom-in-95` — all `.impeccable.md` violations.
**Decision**: Delete this file. `FirstRunModal` covers the same user need once refactored.

### Finding 3 — localStorage key in use

`FirstRunModal` uses key `'firstRunSeen'`. This key must be retained to avoid re-showing the card for any users who have already dismissed it (pre-launch, but consistent with the edge case spec).

### Finding 4 — No footer exists

`layout.tsx` renders `<Navigation>` and `{children}` — no `<Footer>` component. A new `Footer` shared component is required and must be excluded from `/share/*` routes (those routes suppress all chrome, per existing Navigation logic).

### Finding 5 — No /help routes exist

`src/app/help/` does not exist. Both pages are new server components — no auth, no Supabase queries, static content only.

### Finding 6 — Help icon placement (editor sidebar)

The sidebar renders `ProjectActions` + `EntityPalette` + `EntityProperties` inside a scrollable `<div className="bg-tactics-white flex-1 overflow-y-auto">`. A help icon button goes at the **bottom** of the sidebar (outside the scrollable area, in a fixed bottom strip of the `<aside>`), so it is always visible regardless of scroll position. It toggles the `showOnboarding` state already managed in `Editor.tsx`.

### Finding 7 — Style violations to fix (impeccable.md compliance)

| Location | Violation | Fix |
|----------|-----------|-----|
| `FirstRunModal.tsx` | `rounded-md` button | `rounded-none` |
| `FirstRunModal.tsx` | Blocking modal blocks canvas | Convert to corner overlay |
| Editor sidebar collapse button | `rounded-md`, `rounded-r-lg`, `hover:scale-105` | `rounded-none`, remove scale animation |
| Mobile drawer button | `rounded-full` | `rounded-none` |

> The sidebar and mobile drawer style fixes are in-scope for this feature only if they are directly adjacent to new help UI. The plan limits fixes to `FirstRunModal` and new components to stay focused on the 2k scope. The broader style violations are tracked under 2l (Cosmetic Polish).

---

## Project Structure

### Documentation (this feature)

```text
specs/014-user-guide/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Codebase findings (embedded in plan — no separate file needed)
├── data-model.md        # Not required (no new entities)
├── quickstart.md        # Manual test guide
└── tasks.md             # Task list (/speckit.tasks output — NOT created here)
```

### Source Code — Files Touched

```text
src/
├── app/
│   ├── layout.tsx                              # Add <Footer /> (excluded on /share/*)
│   └── help/
│       ├── page.tsx                            # NEW — /help page (server component)
│       └── coaching/
│           └── page.tsx                        # NEW — /help/coaching page (server component)
│
├── features/animation/components/
│   ├── FirstRunModal.tsx                       # REFACTOR — blocking dialog → corner overlay
│   └── Editor.tsx                              # Add showOnboarding state + help icon in sidebar
│
└── shared/components/
    ├── Navigation.tsx                          # Add "?" icon (links to /help)
    ├── Footer.tsx                              # NEW — site footer with Help + legal links
    └── OnboardingTutorial.tsx                  # DELETE — orphaned, superseded by FirstRunModal

tests/
├── unit/components/
│   └── FirstRunModal.test.tsx                  # UPDATE — test corner overlay, not dialog
└── e2e/
    └── user-guide.spec.ts                      # NEW — E2E for onboarding + /help + /help/coaching
```

---

## Phase 1: Component Design

### 1. FirstRunModal (refactored)

**Location**: `src/features/animation/components/FirstRunModal.tsx`
**Pattern**: Fixed-position corner card (bottom-right of viewport, above the floating remote). Client component, purely UI state.

**Props interface** (updated):
```
interface FirstRunModalProps {
  open: boolean;
  onDismiss: () => void;
}
```

**Behaviour**:
- Rendered by `Editor.tsx` which controls `open` state via `showOnboarding` boolean
- `Editor.tsx` initialises `showOnboarding` from `localStorage.getItem('firstRunSeen') !== '1'` (existing key, existing semantics)
- On dismiss: `localStorage.setItem('firstRunSeen', '1')`, call `onDismiss`
- Card positions at `fixed bottom-24 right-4 z-40` (clears the floating remote at the bottom)
- Width: `max-w-xs` (small, non-intrusive)

**Content** (updated copy — direct, tactical, no emojis):
1. "Add players to the pitch — drag from the sidebar"
2. "Move them per frame — click Add Frame to record each position"
3. "Save and share — generate a link your squad can open on their phone"

**Style requirements**:
- `rounded-none` (zero border radius — `.impeccable.md`)
- `border border-border` (no shadow)
- `bg-surface` background, `text-text-primary` text
- Dismiss button: `rounded-none bg-primary text-text-inverse text-sm font-medium` — full width, label "Got it"
- No animations, no emojis, no `animate-in`

### 2. Help icon in editor sidebar

**Location**: `src/features/animation/components/Editor.tsx`
**Placement**: At the bottom of the `<aside>` element, outside the scrollable `overflow-y-auto` div, inside a fixed-height bottom strip.

```jsx
{/* Sidebar bottom strip */}
<div className="border-t border-border p-3 flex justify-between items-center">
  <button
    onClick={() => setShowOnboarding(true)}
    className="flex items-center gap-1.5 text-xs text-text-inverse/70 hover:text-text-inverse transition-colors"
    aria-label="Show guide"
  >
    <HelpCircle className="w-4 h-4" />
    <span>How it works</span>
  </button>
  <Link href="/help" className="text-xs text-text-inverse/50 hover:text-text-inverse/80 transition-colors">
    Help
  </Link>
</div>
```

> Only shown when sidebar is expanded (`!sidebarCollapsed`). When collapsed, the sidebar has zero width so this is hidden naturally.

### 3. Navigation "?" icon

**Location**: `src/shared/components/Navigation.tsx`
**Placement**: Appended to `navLinks` fragment, after all other links, before the "Create" / "Get Started" CTA button.

```jsx
<Link
  href="/help"
  className="p-1.5 text-text-primary/70 hover:text-primary transition-colors"
  aria-label="Help"
>
  <HelpCircle className="w-4 h-4" />
</Link>
```

> Icon only (no label) in desktop nav to avoid adding a text-heavy new item. Mobile dropdown gets a text link: "Help".

### 4. Footer component

**Location**: `src/shared/components/Footer.tsx`
**Added to**: `src/app/layout.tsx` (rendered after `{children}`, before `<OfflineIndicator />`)
**Excluded from**: `/share/*` routes — detect via `usePathname()` in a client wrapper, OR (simpler) add the exclusion to the Footer itself using the same pattern as Navigation.

```jsx
// Footer.tsx — client component (needs usePathname)
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith('/share/') || pathname.startsWith('/app')) return null;

  return (
    <footer className="border-t border-border bg-surface mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-text-primary/50">
        <Link href="/help" className="hover:text-text-primary transition-colors">Help</Link>
        <Link href="/help/coaching" className="hover:text-text-primary transition-colors">Coaching Guide</Link>
        <Link href="/contact" className="hover:text-text-primary transition-colors">Contact</Link>
        <Link href="/legal/terms" className="hover:text-text-primary transition-colors">Terms</Link>
        <Link href="/legal/privacy" className="hover:text-text-primary transition-colors">Privacy</Link>
        <Link href="/sitemap-page" className="hover:text-text-primary transition-colors">Sitemap</Link>
      </div>
    </footer>
  );
}
```

> The footer is also hidden on `/app` (editor) — the editor uses a full-height layout with no document scroll; a footer would break that.

### 5. /help page

**Location**: `src/app/help/page.tsx`
**Type**: Server component (no client hooks needed)
**Metadata**: `export const metadata = { title: 'Help' }`

**Sections**:
1. **Core workflow** — 4 steps mirroring the onboarding card (consistent language)
2. **What's on the pitch** — entity types: attacker (red), defender (blue), ball (white), cone (yellow), tackle shield, tackle bag
3. **Sharing** — save first, then Share button copies `/share/{id}` link; works in WhatsApp
4. **Coaching framework** — one-liner teaser + link to `/help/coaching`

**Style**: Uses standard heading hierarchy (`font-heading font-bold`). No cards with rounded corners. Prose sections with `prose` or raw Tailwind utilities. Consistent with the rest of the site (`max-w-2xl mx-auto px-4`).

### 6. /help/coaching page

**Location**: `src/app/help/coaching/page.tsx`
**Type**: Server component
**Metadata**: `export const metadata = { title: 'Coaching Framework' }`

**Content**:
- Heading: "The APES Framework"
- Brief intro: what APES stands for (Active, Purposeful, Enjoyable, Safe) and why it matters at grassroots level
- Four sections (one per letter): plain English description + one example in the context of a drill in the animator
- CTA: "Browse the gallery for APES-aligned drills" → link to `/gallery`
- Back link: "← Back to Help" → `/help`

**Tone**: Direct, grassroots. Write for a volunteer club coach, not an academic. No jargon beyond what the framework name requires.

---

## Impeccable Style Compliance

Per `.impeccable.md` — checked against every new UI surface:

| Principle | Applied |
|-----------|---------|
| Zero border radius | All new components use `rounded-none` |
| No emojis | No emojis in any copy or icon usage |
| No soft shadows | No `shadow-*` classes on new components; `border border-border` used instead |
| Design tokens | `bg-surface`, `text-text-primary`, `border-border`, `bg-primary`, `text-text-inverse` — no raw hex |
| No animations | No `animate-in`, `transition-transform scale-*`, or keyframe animations |
| Direct tone | Copy mirrors coaching whiteboard language: imperative, short, specific |
| WCAG AA | All text against its background must meet 4.5:1 — verify `text-text-primary/70` and `text-text-inverse/70` computed values |
| No rounded progress bars | Not applicable — the step indicator from `OnboardingTutorial` is not replicated |

---

## Success Criteria Mapping

| Spec SC | Implementation target |
|---------|-----------------------|
| SC-001: Core loop <5 minutes | Onboarding card explains all 4 steps; help page reinforces |
| SC-002: Card appears first visit, not on return | `localStorage.getItem('firstRunSeen') !== '1'` in `Editor.tsx` |
| SC-003: /help and /help/coaching return 200 unauthenticated | Server components, no auth middleware on these routes |
| SC-004: /help reachable in 1 click | "?" in Navigation header on every page |
| SC-005: lint + tsc pass | Verified pre-PR |
| SC-006: Acceptance scenarios in tests | E2E in `tests/e2e/user-guide.spec.ts`; unit in `FirstRunModal.test.tsx` |
