# Implementation Plan: Phase 3f — Audit Remediation

**Branch**: `017-audit-remediation` | **Date**: 2026-05-03 | **Spec**: `specs/017-audit-remediation/spec.md`

## Summary

Purely cosmetic pass to close four violation categories identified in the 2026-04-24 UI/UX audit (score: 15/20, target: 18+/20):

- **A**: Replace all prohibited `rounded-*` on interactive editor surfaces with `rounded-none`
- **B**: Replace all `bg-white`/`bg-white/90` on editor layout surfaces with `bg-surface`
- **C**: Add `font-heading` to `<h2>` headings on all four auth pages
- **D**: Replace all `bg-black/50` modal backdrops with `bg-primary/60`

No new components. No schema changes. No API changes. No functional behaviour changes.

---

## Technical Context

**Language/Version**: TypeScript 5 · Node 22
**Framework**: Next.js 14 App Router (SSR + API Routes)
**Canvas**: Konva (react-konva) — shared across `/app`, `/replay/[id]`, `/share/[id]`
**State**: Zustand stores in `src/core/stores/`
**Styling**: Tailwind CSS + Radix UI primitives
**Testing**: Vitest (unit) · Playwright (E2E)
**Deploy**: Vercel (CI via GitHub Actions)

---

## Constitutional Compliance Check

| Check | Status | Notes |
|-------|--------|-------|
| Tier alignment | ✅ | Cosmetic only; touches all tiers transparently |
| No telemetry or analytics | ✅ | No new data collection |
| Entity colors via EntityColors service | ✅ | No entity color changes |
| Shared canvas — tested on all 3 routes | ✅ | Editor.tsx and ReplayViewer.tsx touched; smoke-test required |
| New data: privacy impact assessed | ✅ | N/A — no schema changes |
| Supabase joins flattened before use | ✅ | N/A — no new queries |

---

## Project Structure

### Documentation (this feature)

```text
specs/017-audit-remediation/
├── spec.md          ✅ created
├── plan.md          ✅ this file
├── research.md      ✅ created (violation locations)
├── quickstart.md    ✅ created (manual verification guide)
└── tasks.md         ← /speckit.tasks output (NOT created here)
```

### Source Files to Modify

**Category A — Border Radius**
```text
src/features/animation/components/ProgressionPanel.tsx        (3 pills)
src/features/animation/components/Editor.tsx                  (4 buttons)
src/features/animation/components/MobileDrawer.tsx            (3 elements)
src/features/animation/components/Canvas/EditorFloatingRemote.tsx  (6 elements)
```

**Category B — White Surfaces**
```text
src/features/animation/components/Editor.tsx                  (5 instances)
src/features/animation/components/Canvas/InlineEditor.tsx     (1 instance)
src/features/animation/components/ReplayViewer.tsx            (1 instance)
src/features/animation/components/Sidebar/SportSelector.tsx   (1 instance)
```

**Category C — Auth Headings**
```text
src/app/(auth)/login/page.tsx
src/app/(auth)/register/page.tsx
src/app/(auth)/forgot-password/page.tsx
src/app/(auth)/reset-password/page.tsx
```

**Category D — Modal Scrim**
```text
src/shared/components/SaveToCloudModal.tsx
src/shared/components/ReportModal.tsx
src/shared/components/EditMetadataModal.tsx
src/shared/components/DeleteConfirmDialog.tsx
src/features/gallery/components/VersionHistoryModal.tsx
src/app/collections/[id]/page.tsx
src/app/admin/page.tsx
src/features/animation/components/MobileDrawer.tsx    (backdrop: bg-black/40 → bg-primary/50)
```

---

## Implementation Phases

### Phase 0 — Baseline Verification

Run the quality gate before touching any files.

```bash
npm run lint && npx tsc --noEmit
npm test -- --run
```

Both must pass green before any changes.

### Phase 1 — Category A: Border Radius

Target: replace all non-permitted `rounded-*` classes on interactive editor surfaces.

**Rules**:
- Every `rounded-lg`, `rounded-md`, `rounded-r-lg`, `rounded-t-2xl`, `rounded-sm`, `rounded-full` on interactive editor buttons/containers → `rounded-none`
- MobileDrawer drag handle indicator: replace `<div className="w-12 h-1.5 bg-border/40 rounded-full mb-1" />` with `<div className="w-12 h-0.5 bg-border/40" />` (flat rectangular bar — no rounded)
- Add intentional exception comments where needed (FloatingRemote, EndorsementBadge)

**Files**: `ProgressionPanel.tsx`, `Editor.tsx`, `MobileDrawer.tsx`, `EditorFloatingRemote.tsx`

### Phase 2 — Category B: White Surfaces

Target: replace `bg-white`, `bg-white/90`, `bg-white/80` on layout/structural surfaces.

**Rules**:
- Structural backgrounds → `bg-surface`
- Snap-to-grid active state (`bg-white text-black border-white`) → `bg-tactics-white text-primary border-primary` (preserves high-contrast active indicator)
- Drop `backdrop-blur-sm` from Focus Mode toggle and collapse button (glassmorphism is banned by `.impeccable.md` anti-references)

**Files**: `Editor.tsx`, `InlineEditor.tsx`, `ReplayViewer.tsx`, `SportSelector.tsx`

### Phase 3 — Category C: Auth Headings

Target: add `font-heading` to the primary `<h2>` heading in all four auth pages.

**Rule**: Single class addition only. Do not change font-size, weight, line-height, or any other property.

**Files**: `login/page.tsx`, `register/page.tsx`, `forgot-password/page.tsx`, `reset-password/page.tsx`

### Phase 4 — Category D: Modal Scrim

Target: replace `bg-black/50` backdrop overlays with `bg-primary/60`.

**Rule**: Exact string replacement. `bg-black/50` → `bg-primary/60`. `bg-black/40` (MobileDrawer backdrop) → `bg-primary/50`.

**Files**: `SaveToCloudModal.tsx`, `ReportModal.tsx`, `EditMetadataModal.tsx`, `DeleteConfirmDialog.tsx`, `VersionHistoryModal.tsx`, `collections/[id]/page.tsx`, `admin/page.tsx`, `MobileDrawer.tsx`

### Phase 5 — Quality Gate & Smoke Test

```bash
npm run lint && npx tsc --noEmit   # must be zero errors
npm test -- --run                  # all unit tests must pass
```

Manual smoke test per `quickstart.md`:
- Open `/app` — verify all editor button corners are sharp
- Open `/login`, `/register`, `/forgot-password`, `/reset-password` — verify Oswald headings
- Open a modal (Save, Report, Delete) — verify dark-green scrim

### Phase 6 — Intentional Exception Documentation

Verify that the two intentional `rounded-full` exceptions are documented with inline comments:
- `FloatingRemote.tsx` — the share-view playback pill
- `EndorsementBadge.tsx` — circular badge

These were not changed but should have a comment so future passes do not re-flag them.

---

## Design Token Reference

| Old class | New class | Rationale |
|-----------|-----------|-----------|
| `rounded-full` (buttons) | `rounded-none` | Zero-radius token: `.impeccable.md` §Border radius: "0px is a deliberate decision" |
| `rounded-lg` | `rounded-none` | Same |
| `rounded-md` | `rounded-none` | Same |
| `rounded-r-lg` | `rounded-none` | Same |
| `rounded-t-2xl` | `rounded-none` | Same |
| `rounded-sm` | `rounded-none` | Same |
| `bg-white` | `bg-surface` | `surface` = cream/off-white per design tokens |
| `bg-white/90` | `bg-surface` | Same; opacity modifier dropped |
| `bg-white/80` | `bg-surface` | Same |
| `bg-black/50` | `bg-primary/60` | `primary` = pitch-green; scrims reference brand colour |
| `bg-black/40` | `bg-primary/50` | Same (slightly lighter scrim) |
| (none) | `font-heading` | Added to `<h2>` on auth pages |

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Snap-to-grid active state loses visual contrast after `bg-white` → `bg-tactics-white` | Low | `tactics-white` is still distinctly lighter than `bg-black/80` inactive state; contrast ratio acceptable |
| MobileDrawer loses UX affordance after `rounded-t-2xl` removed | Low | translateY animation provides sufficient "slides up from below" cue |
| Canvas wrapper `bg-white` → `bg-surface` causes visible colour bleed around Konva Stage | Very Low | Stage fills the wrapper exactly; no bleed |
| `font-heading` on auth `<h2>` breaks layout due to Oswald's compressed width | Very Low | Heading is short ("Sign In", "Create Account" etc.); Oswald has more width, not less |
| Unit tests reference class strings that change | Very Low | Tests do not assert CSS class values |

---

## Complexity Tracking

No constitutional violations. All changes are compliant.
