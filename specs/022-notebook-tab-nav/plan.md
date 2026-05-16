# Implementation Plan: Notebook Tab Navigation

**Branch**: `022-notebook-tab-nav` | **Date**: 2026-05-16 | **Spec**: `specs/022-notebook-tab-nav/spec.md`

## Summary

Replace the flat navigation link row with colour-coded notebook-style tabs that layer by MRU visit order, carry a plastic laminate sheen, and integrate into the app's existing routing/auth model. On mobile, tabs are replaced by colour-coded hamburger dropdown entries. Background textures are added to Home, Gallery, and My Playbook pages. No server changes — this is a pure client-side UI enhancement.

---

## Technical Context

**Language/Version**: TypeScript 5 · Node 22
**Framework**: Next.js 14 App Router (SSR + client components)
**State**: `useState` / `useEffect` / `localStorage` — no Zustand store needed
**Styling**: Tailwind CSS + hand-authored CSS in `globals.css` (no `tailwind.config.ts` — tokens are CSS custom properties)
**Testing**: Vitest (unit) · Playwright (E2E)
**Deploy**: Vercel (CI via GitHub Actions)
**Constraints**: No telemetry; no third-party analytics; entity colors via EntityColors service (N/A here — nav colours are UI chrome)

---

## Constitutional Compliance Check

| Check | Status | Notes |
|-------|--------|-------|
| Tier alignment (Guest/Auth/Public/Admin) | ✅ Pass | Guest sees Home/Gallery/Create; Auth adds My Playbook — matches existing auth gate |
| No telemetry or analytics | ✅ Pass | localStorage key stores section IDs only; no PII; not transmitted |
| Entity colors via EntityColors service | ✅ N/A | Tab colours are navigation chrome, not canvas entities |
| Shared canvas — tested on all 3 routes | ✅ N/A | No Canvas/ component touched |
| New data: privacy impact assessed | ✅ Pass | One localStorage key: ordered array of section IDs. No PII, no server storage |
| Supabase joins flattened before use | ✅ N/A | No new Supabase queries |

---

## Project Structure

### Documentation (this feature)

```text
specs/022-notebook-tab-nav/
├── spec.md          ✅
├── plan.md          ✅ (this file)
├── research.md      ✅
├── data-model.md    ✅
├── quickstart.md    ✅
└── tasks.md         (created by /speckit.tasks)
```

### Source Code — Files to Change

```text
src/
├── shared/
│   ├── components/
│   │   └── Navigation.tsx        MODIFY — replace flat links with tab strip
│   └── hooks/
│       └── useTabOrder.ts        CREATE — MRU localStorage hook
│
└── app/
    ├── globals.css               MODIFY — tab colour vars + texture classes + nav-tab CSS
    ├── page.tsx                  MODIFY — add page-texture-lined class to root element
    ├── gallery/
    │   └── GalleryClient.tsx     MODIFY — add page-texture-grid-lg class to root element
    └── my-gallery/
        └── page.tsx              MODIFY — add page-texture-grid-sm class to root element
```

No changes to: stores, API routes, Supabase schema, types, Canvas components, auth flow.

---

## Phase 0: Research

See `research.md` for full findings. Key decisions:

| Decision | Chosen | Rationale |
|----------|--------|-----------|
| Tab colour storage | CSS custom properties in `globals.css` | Keeps colours in one place; accessible to both Tailwind inline and pseudo-elements |
| MRU state | Custom hook + `localStorage` | No Zustand needed — this is pure UI preference state, not app state |
| Sheen/depth effects | CSS pseudo-elements (`:before`/`:after`) via `.nav-tab` class in `globals.css` | Tailwind JIT cannot generate pseudo-element gradients dynamically |
| Active tab "open" seam | `margin-bottom: -1px` on active tab | Covers the `border-b` of the nav without colour-matching complexity |
| Background textures | CSS `background-image` gradient patterns via utility classes in `globals.css` | No image assets; zero network requests; easy per-page application |
| Mobile | Update existing hamburger dropdown — add coloured `div` left bar to each entry | Least invasive; reuses existing open/close state |

---

## Phase 1: Design & Contracts

### 1.1 Tab Colour Variables

Four CSS custom properties added to `globals.css`:

```css
--c-tab-home:     #0F766E;  /* teal   — provisional */
--c-tab-gallery:  #D97706;  /* amber  (= --color-accent-warm) */
--c-tab-playbook: #1A3D1A;  /* pitch green (= --color-primary) */
--c-tab-create:   #1E40AF;  /* navy */
--c-nav-cover:    #18120A;  /* dark leather — notebook cover */
```

### 1.2 Tab Section Registry

A `TAB_SECTIONS` constant in `Navigation.tsx` defines all tabs:

```typescript
interface TabSection {
  id: 'home' | 'gallery' | 'playbook' | 'create';
  label: string;
  href: string;
  cssVar: string;      // e.g. '--c-tab-gallery'
  requiresAuth: boolean;
}

const TAB_SECTIONS: TabSection[] = [
  { id: 'home',     label: 'Home',        href: '/',          cssVar: '--c-tab-home',     requiresAuth: false },
  { id: 'gallery',  label: 'Gallery',     href: '/gallery',   cssVar: '--c-tab-gallery',  requiresAuth: false },
  { id: 'playbook', label: 'My Playbook', href: '/my-gallery',cssVar: '--c-tab-playbook', requiresAuth: true  },
  { id: 'create',   label: 'Create',      href: '/app',       cssVar: '--c-tab-create',   requiresAuth: false },
];
```

### 1.3 useTabOrder Hook

**File**: `src/shared/hooks/useTabOrder.ts`

Contract:
- Reads from localStorage on mount; gracefully handles unavailability
- Returns `[visitOrder, recordVisit]` — visitOrder is section IDs most-recently-visited first
- `recordVisit(id)` prepends the visited ID, deduplicates, and writes back
- Returns the default left-to-right order if no stored history exists
- Does NOT cause SSR hydration mismatch (initialises from localStorage in a `useEffect`)

### 1.4 Navigation.tsx Restructure

**Desktop tab strip** replaces the `hidden md:flex items-center gap-4` div:
- One `.nav-tab` per visible section, driven by `TAB_SECTIONS` filtered by auth state
- Active tab: `isActive(section.href)` → `.nav-tab-active` class modifier → `margin-bottom: -1px`
- Z-index: computed from MRU rank — active gets `MAX_Z`, MRU-1 gets `MAX_Z-1`, etc.
- Background colour: `style={{ backgroundColor: 'var(--c-tab-{id})' }}`

**Mobile dropdown** (separate from desktop):
- Each section entry: `div` with flex row — 4px coloured left bar + link text
- Colour bar: `div` with `w-1 self-stretch` + inline `style={{ backgroundColor: '...' }}`
- Auth gate and sign-out button unchanged

### 1.5 CSS Classes in globals.css

**Tab base styles** (`.nav-tab`):
```css
.nav-tab {
  position: relative;
  padding: 8px 18px 10px;
  border-radius: 7px 7px 0 0;
  margin-right: -11px;
  box-shadow: 0 -3px 0 rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.22);
  transition: padding-top 0.1s ease, opacity 0.1s ease;
}
.nav-tab::after {
  /* Plastic sheen overlay */
  content: '';
  position: absolute; inset: 0;
  border-radius: 7px 7px 0 0;
  background: linear-gradient(148deg,
    rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.16) 30%,
    rgba(255,255,255,0.03) 58%, rgba(0,0,0,0.10) 100%);
  pointer-events: none;
}
.nav-tab::before {
  /* Right-edge depth shadow */
  content: '';
  position: absolute;
  top: 4px; right: 0; bottom: 0; width: 4px;
  background: linear-gradient(to right, transparent, rgba(0,0,0,0.22));
  border-radius: 0 7px 0 0;
  pointer-events: none;
}
.nav-tab:not(.nav-tab-active) { padding-top: 6px; opacity: 0.88; }
.nav-tab.nav-tab-active {
  padding-top: 10px;
  padding-bottom: 12px;
  margin-bottom: -1px;
}
```

**Background textures**:
```css
.page-texture-lined {
  background-image: linear-gradient(rgba(0,0,0,0.055) 1px, transparent 1px);
  background-size: 100% 30px;
  background-position: 0 29px;
}
.page-texture-grid-lg {
  background-image:
    linear-gradient(rgba(0,0,0,0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.055) 1px, transparent 1px);
  background-size: 28px 28px;
}
.page-texture-grid-sm {
  background-image:
    linear-gradient(rgba(0,0,0,0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.055) 1px, transparent 1px);
  background-size: 16px 16px;
}
```

### 1.6 Nav Bar Cover Background

Add `--c-nav-cover: #18120A` to `globals.css`. Apply as inline style on the `<nav>` element.

### 1.7 Tab Text Colour

All tab labels are white (`text-white`) — legible against amber, pitch green, navy, teal.

### 1.8 Implementation Sequence

1. Add CSS variables and `.nav-tab` / texture classes to `globals.css`
2. Create `useTabOrder` hook
3. Restructure `Navigation.tsx` — tab strip (desktop) + colour bars (mobile)
4. Apply page texture classes to `page.tsx`, `GalleryClient.tsx`, `my-gallery/page.tsx`
5. TSC + lint pass
6. Visual review in browser

---

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| `border-radius: 7px 7px 0 0` on tabs | User-directed notebook metaphor identity — "rounded top pill" was an explicit design requirement stated before spec was written | Sharp-corner tabs lose the notebook divider metaphor entirely; the rounded shape is load-bearing for the visual concept |
| `--c-tab-create: #1E40AF` (navy) without warm undertones | Four sections need four visually distinct colours; no warm-toned navy exists in the existing palette | Using amber/green/teal for three tabs and defaulting Create to a warm colour would clash or repeat; navy provides clear differentiation |
| `::before` right-edge gradient (soft opacity fade) | Conveys stacked physical depth — a key element of the notebook metaphor | A hard 1px border in a darker tab shade would be less effective at communicating depth across varying section colours |

**Note**: All three violations above are accepted constitutional exceptions for this feature per explicit user approval (2026-05-16). The notebook tab navigation is a branded UI chrome element — not a game entity, not a primary surface — and the constitution's sharp-corners and warm-palette rules were authored for tactical/game UI, not navigation identity systems.

**Minor tension**: `--c-tab-playbook: #1A3D1A` equals `--color-primary`. Same colour, different semantics. Defined in separate variables — no collision.

**My Playbook tab visibility risk**: Pitch green on the dark notebook cover has low contrast. If the prototype confirms a problem, lighten `--c-tab-playbook` to `#166534`. Values-only change in `globals.css`.
