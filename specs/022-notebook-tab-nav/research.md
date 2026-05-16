# Research: Notebook Tab Navigation

**Feature**: 022-notebook-tab-nav
**Date**: 2026-05-16

---

## 1. Current Navigation Architecture

**File**: `src/shared/components/Navigation.tsx`
**Lines**: ~183

The current component:
- Is a single `'use client'` component imported in `layout.tsx`
- Uses `usePathname()` and `useUser()` for active state and auth gate
- Desktop links: `hidden md:flex items-center gap-4` div containing flat `<Link>` elements
- Active state: `text-primary font-medium` only — no shape or z-ordering
- Mobile: hamburger button (`md:hidden`) toggles `{menuOpen && <div>...</div>}` dropdown
- Both desktop and mobile render the same `navLinks` JSX variable — the mobile dropdown reuses it

**Routes and section mapping**:
| Section | Route | Auth required |
|---------|-------|---------------|
| Home | `/` | No |
| Gallery | `/gallery` | No |
| My Playbook | `/my-gallery` | Yes |
| Create | `/app` | No (guest editing supported) |

The Admin link (`/admin`) is auth+role-gated and will remain in the dropdown only, not as a tab section.

**Share routes** (`/share/[id]`) return `null` from Navigation — no tabs rendered there.

---

## 2. Colour Token Analysis

**Existing tokens** (from `globals.css`):
- `--color-primary: #1A3D1A` (pitch green)
- `--color-surface: #FDFAF5`
- `--color-accent-warm: #D97706` (amber)
- `--color-border: #1A3D1A`

**Tab colour decisions**:
- Decision: Gallery amber `#D97706` = `--color-accent-warm` ✅ reuses existing token
- Decision: My Playbook `#1A3D1A` = `--color-primary` ✅ reuses existing token
- Decision: Home `#0F766E` — no existing token; new `--c-tab-home` variable needed
- Decision: Create `#1E40AF` — no existing token; new `--c-tab-create` variable needed
- Decision: Nav cover `#18120A` — no existing token; new `--c-nav-cover` variable needed
- Rationale: Defining all five as CSS variables keeps them patchable in one place

**My Playbook contrast risk**: `#1A3D1A` (dark green, WCAG luminance ~0.03) against `#18120A` cover (luminance ~0.01) = ~1.7:1 contrast — too low for the tab to stand out visually. **Resolution**: Accept for now; the prototype (`prototype/nav-tabs.html`) is the visual authority. If the prototype confirms invisibility, lighten to `#166534` (luminance ~0.07, ~2.5:1 — still low but more readable at tab scale given the sheen effect). This change is values-only in `globals.css`.

---

## 3. CSS Technique — Tab Layering

**Approach**: `position: relative` on each tab + `z-index` computed from MRU rank + `margin-right: -11px` for overlap.

- The outer nav element is `z-50` (Tailwind) = `z-index: 50`. Tab z-indices are set within the nav's stacking context — they layer against each other, not against page content.
- Active tab z-index: `MAX_Z` = number of sections + 2 (= 6 for 4 sections). Each MRU rank reduces by 1.
- This matches the prototype implementation (verified working).

**Active tab seam**: Nav has `border-b border-border`. Active tab applies `margin-bottom: -1px` to overlap the border line, eliminating the visual seam. The page body immediately below has `bg-background` / `bg-surface`. The tab colour butts against the page colour — no matching needed.

---

## 4. CSS Technique — Sheen Effect

Using `::after` pseudo-element on `.nav-tab`:
```css
background: linear-gradient(148deg,
  rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.16) 30%,
  rgba(255,255,255,0.03) 58%, rgba(0,0,0,0.10) 100%);
```
- `pointer-events: none` ensures click/tap passes through to the tab
- `inset: 0` + same border-radius ensures the sheen matches the tab shape exactly

**Why CSS pseudo-element instead of Tailwind**: Tailwind JIT generates classes from static strings — a dynamic `bg-[linear-gradient(...)]` with `::after` is not expressible via Tailwind. The styles live in `globals.css` as a named class.

---

## 5. localStorage MRU State

**Why not Zustand**: The MRU visit order is a UI preference — it belongs to the browser, not the app state. It persists independently of auth state and project data. A lightweight hook is appropriate.

**SSR hydration safety**: Next.js 14 App Router renders components on the server. `localStorage` is unavailable during SSR. The hook must initialise from a default value during SSR and hydrate from localStorage in `useEffect`. This prevents hydration mismatch.

**Pattern**:
```typescript
const [visitOrder, setVisitOrder] = useState<SectionId[]>(DEFAULT_ORDER);

useEffect(() => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setVisitOrder(JSON.parse(stored));
  } catch { /* fall back to default */ }
}, []);
```

**Write on navigate**: When `pathname` changes, call `recordVisit(sectionId)` which updates state and writes to localStorage.

---

## 6. Mobile Colour Bars

**Current mobile structure**:
```tsx
{menuOpen && (
  <div className="md:hidden border-t border-border bg-surface px-4 py-3 flex flex-col gap-3">
    {navLinks}
  </div>
)}
```

`navLinks` is a JSX fragment of `<Link>` elements. To add colour bars, the mobile dropdown needs its own rendering path (can't reuse `navLinks` as-is without restructuring).

**Decision**: Split `navLinks` into separate desktop and mobile renderers. Desktop renders tab shapes; mobile renders colour-bar entries. The section registry (`TAB_SECTIONS`) drives both.

---

## 7. Background Textures — Scope

Background textures need to be applied at the page root level, not in `layout.tsx` (which wraps all pages). Each page's root element adds the texture class:

| Page | File | Texture class |
|------|------|---------------|
| Home | `src/app/page.tsx` | `page-texture-lined` |
| Gallery | `src/app/gallery/GalleryClient.tsx` | `page-texture-grid-lg` |
| My Playbook | `src/app/my-gallery/page.tsx` | `page-texture-grid-sm` |
| Create | (no change) | none |
| All others | (no change) | none |

**Note on Gallery**: The Gallery page already has a graph-paper effect (from an earlier spec). Verify whether `GalleryClient.tsx` or `page.tsx` wraps the outermost element — if the existing effect is already in CSS, this may be a no-op or a class rename. Research finding: Gallery and My Playbook already have "graph-page effect with different size grids" (per user in brainstorm). Check existing classes before adding duplicates.

---

## 8. Unresolved Items

None — all design decisions are resolved. The prototype at `prototype/nav-tabs.html` serves as the visual authority for any ambiguity in the CSS.
