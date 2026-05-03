# Research Notes: 017-audit-remediation

**Date**: 2026-05-03 | **Branch**: `017-audit-remediation`

## Summary

Four violation categories were confirmed by grep. All are purely cosmetic. No functional changes are required. No schema changes. No API changes. No new components needed.

---

## Category A — Border Radius Violations

### Files with prohibited `rounded-*` on interactive editor surfaces

| File | Line | Violation | Action |
|------|------|-----------|--------|
| `ProgressionPanel.tsx` | 57 | `rounded-full` on draggable pill button | → `rounded-none` |
| `ProgressionPanel.tsx` | 119 | `rounded-full` on base pill button | → `rounded-none` |
| `ProgressionPanel.tsx` | 151 | `rounded-full` on add-progression button | → `rounded-none` |
| `Editor.tsx` | 318 | `rounded-full` on Focus Mode toggle | → `rounded-none` |
| `Editor.tsx` | 347 | `rounded-md` on collapse-sidebar button (inside sidebar) | → `rounded-none` |
| `Editor.tsx` | 392 | `rounded-r-lg` on sidebar expand handle tab | → `rounded-none` |
| `Editor.tsx` | 418 | `rounded-full` on mobile drawer trigger button | → `rounded-none` |
| `MobileDrawer.tsx` | 54 | `rounded-t-2xl` on drawer container | → `rounded-none` (remove UX affordance; drawer has `translate-y` animation already) |
| `MobileDrawer.tsx` | 63 | `rounded-full` on drag handle indicator dot | → remove `rounded-full` or replace `<div>` with `w-12 h-0.5 bg-border/40` rectangle |
| `MobileDrawer.tsx` | 70 | `rounded-full` on close `X` button | → `rounded-none` |
| `EditorFloatingRemote.tsx` | 279 | `rounded-sm` on action buttons | → `rounded-none` |
| `EditorFloatingRemote.tsx` | 285 | `rounded-sm` on speed mode toggle group | → `rounded-none` |
| `EditorFloatingRemote.tsx` | 290 | `rounded-sm` on speed option buttons | → `rounded-none` |
| `EditorFloatingRemote.tsx` | 301 | `rounded-sm` on loop toggle | → `rounded-none` |
| `EditorFloatingRemote.tsx` | 311 | `rounded-sm` on ghost toggle | → `rounded-none` |
| `EditorFloatingRemote.tsx` | 322 | `rounded-sm` on expand/collapse button | → `rounded-none` |

### Intentional exceptions (do NOT change)

| File | Class | Reason |
|------|-------|--------|
| `FloatingRemote.tsx` | `rounded-full` | Share-view playback pill — intentional brand shape for the mobile-first share experience |
| `EndorsementBadge.tsx` | `rounded-full` | Circular badge icon — intentional endorsement shape |

---

## Category B — White Surface Violations

### Files with `bg-white` on editor layout surfaces

| File | Line | Violation | Action |
|------|------|-----------|--------|
| `Editor.tsx` | 318 | `bg-white/90` — Focus Mode toggle button | → `bg-surface` (drop `backdrop-blur-sm` too — banned glassmorphism) |
| `Editor.tsx` | 330 | `bg-white` — Snap-to-Grid active state | → `bg-tactics-white` (keeps the high-contrast intent for the "active" indicator) |
| `Editor.tsx` | 347 | `bg-white/80` — in-sidebar collapse button | → `bg-surface` (drop `backdrop-blur-sm`) |
| `Editor.tsx` | 392 | `bg-white` — sidebar expand handle tab | → `bg-surface` |
| `Editor.tsx` | 440 | `bg-white` — canvas wrapper div | → `bg-surface` (canvas border wrapper; the canvas itself is rendered by Konva) |
| `Editor.tsx` | 568 | `bg-white` — annotation context menu | → `bg-surface` |
| `InlineEditor.tsx` | 73 | `bg-white` — label edit input | → `bg-surface` |
| `ReplayViewer.tsx` | 179 | `bg-white` — canvas wrapper div | → `bg-surface` |
| `SportSelector.tsx` | 33 | `bg-white` — select dropdown | → `bg-surface` |

### Notes
- `EditorFloatingRemote.tsx` `white/10`, `white/5`, `text-white` etc. are all tint/text values on a dark (`bg-black/80`) floating remote — these are correct and must NOT be changed.
- `Editor.tsx` line 330 (`bg-white text-black border-white shadow-[...]`): This is the snap-to-grid **active** high-contrast state. `bg-tactics-white` works here as `tactics-white` maps to the light cream. Alternatively, `bg-surface border-primary` with `text-primary` — choose whichever reads as clearly active.

---

## Category C — Auth Page Heading Typography

### Pages missing `font-heading` on `<h2>`

All four auth pages delegate their content to the `(auth)/layout.tsx` wrapper. The layout itself adds no heading — headings live in each page's component.

| File | Line | Element | Existing classes | Add |
|------|------|---------|-----------------|-----|
| `login/page.tsx` | 68 | `<h2>` | `text-xl font-semibold text-text-primary mb-6` | `font-heading` |
| `register/page.tsx` | TBD | `<h2>` | similar | `font-heading` |
| `forgot-password/page.tsx` | TBD | `<h2>` | similar | `font-heading` |
| `reset-password/page.tsx` | TBD | `<h2>` | similar | `font-heading` |

**Note**: The auth layout also has a `<p>` tag ("Rugby Play Visualisation") — no change needed there, that is body copy.

---

## Category D — Modal Scrim Colour

### Files with `bg-black/50` modal backdrops

| File | Line | Action |
|------|------|--------|
| `SaveToCloudModal.tsx` | 163 | `bg-black/50` → `bg-primary/60` |
| `ReportModal.tsx` | 67 | `bg-black/50` → `bg-primary/60` |
| `EditMetadataModal.tsx` | 75 | `bg-black/50` → `bg-primary/60` |
| `DeleteConfirmDialog.tsx` | 22 | `bg-black/50` → `bg-primary/60` |
| `VersionHistoryModal.tsx` | 105 | `bg-black/50` → `bg-primary/60` |
| `collections/[id]/page.tsx` | 471 | `bg-black/50` → `bg-primary/60` |
| `admin/page.tsx` | 249 | `bg-black/50` → `bg-primary/60` |
| `admin/page.tsx` | 572 | `bg-black/50` → `bg-primary/60` |

**Note**: `MobileDrawer.tsx` line 43 uses `bg-black/40` (slightly different) — not `bg-black/50`. This is the mobile drawer backdrop; same fix applies: → `bg-primary/50`.

---

## Design Token Mapping

| Old class | New class | Token meaning |
|-----------|-----------|--------------|
| `bg-white` | `bg-surface` | Cream/off-white surface |
| `bg-white/90` | `bg-surface` | Same; drop opacity modifier |
| `bg-white/80` | `bg-surface` | Same |
| `rounded-full` (buttons) | `rounded-none` | Zero radius token |
| `rounded-lg` | `rounded-none` | Zero radius token |
| `rounded-md` | `rounded-none` | Zero radius token |
| `rounded-r-lg` | `rounded-none` | Zero radius token |
| `rounded-t-2xl` | `rounded-none` | Zero radius token |
| `rounded-sm` | `rounded-none` | Zero radius token |
| `bg-black/50` | `bg-primary/60` | Dark green scrim |
| `bg-black/40` | `bg-primary/50` | Dark green scrim (lighter) |

---

## Key Decisions Made During Research

1. **Snap-to-grid active state** (`Editor.tsx` line 330): `bg-white text-black` → `bg-tactics-white text-primary` — preserves the high-contrast "active" indicator without pure white.

2. **MobileDrawer `rounded-t-2xl`**: Remove. The drawer animation (translateY from 100% to 0) provides sufficient affordance without needing rounded corners. No UX loss.

3. **MobileDrawer drag handle dot**: Replace `<div className="w-12 h-1.5 bg-border/40 rounded-full mb-1" />` with `<div className="w-12 h-0.5 bg-border/40" />` — a flat rectangular bar.

4. **`EditorFloatingRemote.tsx` `white/*` tints**: All intentional — on a `bg-black/80` dark surface, `text-white/70`, `hover:bg-white/10` are contrast tints, not surface colours. No changes.

5. **Canvas wrapper `bg-white`** (`Editor.tsx` line 440, `ReplayViewer.tsx` line 179): This wraps the Konva Stage. Changing to `bg-surface` is safe — the canvas draws its own pitch background inside, so the wrapper colour is only visible in the thin border gap. The pitch-green field renders inside Konva, not via CSS.

6. **`SportSelector.tsx` `bg-white`** on the `<select>`: → `bg-surface`. The border and text colour are already themed; the `bg-white` is an oversight.
