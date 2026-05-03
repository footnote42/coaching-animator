# Feature Specification: Phase 3f — Audit Remediation

**Feature Branch**: `017-audit-remediation`
**Created**: 2026-05-03
**Status**: Draft
**Input**: User description: "Phase 3f — Audit Remediation"

## Constitutional Compliance Gate *(mandatory)*

- [x] **Tier alignment**: Tier 0/1/2/3 — this is a purely cosmetic pass; no new data, no auth changes, no feature logic
- [x] **No telemetry**: No telemetry introduced
- [x] **No third-party analytics**: No third-party analytics added
- [x] **No hardcoded colors**: No entity color changes; no `EntityColors` bypass
- [x] **Privacy gate**: No new data stored
- [x] **Shared canvas risk**: Some canvas components touched (`Editor.tsx`, `EditorFloatingRemote.tsx`, `FloatingRemote.tsx`, `InlineEditor.tsx`) — all three routes (`/app`, `/replay/[id]`, `/share/[id]`) must be smoke-tested

> No constitutional conflicts. Pure cosmetic remediation scoped to the four violation categories documented in the 2026-04-24 audit.

---

## Background

The UI/UX audit (2026-04-24) scored **15/20**. Phase 3f was dispositioned in the ROADMAP as "Proceed — low-cost cosmetic P1 closures." The re-score target is **18+/20**.

Four violation categories were identified. They are independent and can be fixed as parallel passes:

| Category | Violation | P1? |
|----------|-----------|-----|
| **A — Border Radius** | `rounded-lg/md/sm/full` on interactive UI surfaces in editor, modal, and gallery components — violates `--border-radius: 0px` design token | P1 |
| **B — White Surfaces** | `bg-white` and `bg-white/90` in editor components — violates design system (off-white surface tokens must be used instead) | P1 |
| **C — Auth Page Headings** | Auth page `<h2>` headings (login, register, forgot-password, reset-password) missing `font-heading` class — violates typographic system | P1 |
| **D — Modal Scrim** | `bg-black/50` modal backdrop — violates pure-black prohibition; must use `bg-primary/60` | P2 |

**Out of scope**: Typography overhaul (Inter monoculture), performance optimisation, any feature additions. This spec is a linting-style cosmetic pass only.

---

## User Scenarios & Testing

### User Story 1 — Editor & Canvas Surface Cleanup: No Rounded Corners (Priority: P1)

A coach using the editor should never see pill-shaped buttons, rounded containers, or soft-radius cards within the editing workspace. The aesthetic must read as utilitarian and physical — like a coaching clipboard, not a SaaS app. Every interactive surface in the editor should have sharp corners (`rounded-none`).

**Why this priority**: P1 because editor is the primary creation surface and rounded corners are explicitly prohibited by the design system. Fixing this closes the most visible audit category.

**Independent Test**: Open `/app`, inspect the ProgressionPanel pills, the EditorFloatingRemote controls, the sidebar expand handle, and the Focus Mode button. All should have zero visible border radius.

**Acceptance Scenarios**:

1. **Given** the editor is open, **When** a coach views the ProgressionPanel, **Then** all progression pills have `rounded-none` styling (not `rounded-full`)
2. **Given** the editor is open in Focus Mode, **When** the coach inspects the focus mode toggle button, **Then** it has sharp corners (`rounded-none`) with no soft radius
3. **Given** the MobileDrawer is open on a small screen, **When** a coach inspects it, **Then** the drawer handle dot and close button use `rounded-none` or are removed (handle dot is decorative and may be kept as a visual affordance if inline)
4. **Given** the EditorFloatingRemote is visible, **When** a coach inspects it, **Then** all mode selectors and action buttons use `rounded-none` or `rounded-sm` is replaced with `rounded-none`

---

### User Story 2 — Remove `bg-white` from Editor Surfaces (Priority: P1)

The editor uses pure `bg-white` in several locations — the Focus Mode toggle, the sidebar expand handle, and the InlineEditor. These break the surface token system and introduce a jarring pure-white that conflicts with the `tactics-white` cream palette.

**Why this priority**: P1 because the design system explicitly prohibits `bg-white` in editor surfaces. It should always be `bg-surface`, `bg-surface-warm`, or `bg-background` to maintain the cream/off-white palette character.

**Independent Test**: Open `/app`, trigger Focus Mode, look at the toggle button at top-right and the sidebar expand handle. Both must not be pure white.

**Acceptance Scenarios**:

1. **Given** the editor is open, **When** a coach looks at the Focus Mode toggle button, **Then** it uses `bg-surface` (not `bg-white/90` or `bg-white`) with appropriate border
2. **Given** the sidebar is collapsed, **When** a coach looks at the expand handle tab, **Then** it uses `bg-surface` (not `bg-white`)
3. **Given** the coach double-clicks a player label to edit it, **When** the InlineEditor appears, **Then** its background is `bg-surface` (not `bg-white`)
4. **Given** the ReplayViewer is open, **When** a coach inspects the background, **Then** no `bg-white` is present in the layout shell

---

### User Story 3 — Auth Page Heading Typography (Priority: P1)

All four auth pages (login, register, forgot-password, reset-password) have `<h2>` headings that render in the body font (Inter) instead of the heading font (Oswald). This breaks typographic consistency. Every route that has a primary heading must use `font-heading` to maintain the brand voice.

**Why this priority**: P1 because auth pages are the first personalised surface a coach sees after discovery. A typography mismatch here reads as carelessness.

**Independent Test**: Navigate to `/login`, `/register`, `/forgot-password`, `/reset-password`. The primary `<h2>` heading on each page must render in Oswald (bold, compressed letterforms) not Inter.

**Acceptance Scenarios**:

1. **Given** an unauthenticated user visits `/login`, **When** the page renders, **Then** the `<h2>` heading has `font-heading` class applied
2. **Given** an unauthenticated user visits `/register`, **When** the page renders, **Then** the `<h2>` heading has `font-heading` class applied
3. **Given** a user visits `/forgot-password`, **When** the page renders, **Then** the `<h2>` heading has `font-heading` class applied
4. **Given** a user visits `/reset-password`, **When** the page renders, **Then** the `<h2>` heading has `font-heading` class applied

---

### User Story 4 — Modal Scrim Colour (Priority: P2)

Multiple modals and dialogs use `bg-black/50` as the backdrop overlay. The design system prohibits pure black (`#000000`) — all overlays should use `bg-primary/60` (dark pitch-green at 60% opacity) to reinforce the brand palette even in transient surfaces.

**Why this priority**: P2 because it is a subtle background change that coaches rarely notice consciously — but the cumulative effect of consistent brand colour in overlays builds trust. Lower priority than the above because it has no functional impact and affects transitional surfaces only.

**Independent Test**: Open the Save to Cloud modal, Report modal, Edit Metadata modal, Delete Confirm dialog, VersionHistory modal, and admin modals. The backdrop behind each must be dark-green-tinted (not neutral grey/black).

**Acceptance Scenarios**:

1. **Given** the Save to Cloud modal is open, **When** a coach looks at the backdrop, **Then** it uses `bg-primary/60` (not `bg-black/50`)
2. **Given** the Report modal is open, **When** a coach looks at the backdrop, **Then** it uses `bg-primary/60`
3. **Given** the Edit Metadata modal is open, **When** a coach looks at the backdrop, **Then** it uses `bg-primary/60`
4. **Given** the Delete Confirm dialog is open, **When** a coach looks at the backdrop, **Then** it uses `bg-primary/60`
5. **Given** the admin delete modal is open, **When** an admin looks at the backdrop, **Then** it uses `bg-primary/60`

---

### Edge Cases

- `rounded-full` on the FloatingRemote pill container (`FloatingRemote.tsx`) is **intentional** — it is the share-viewer playback pill. Do NOT change it.
- `rounded-t-2xl` on `MobileDrawer.tsx` (the drawer that slides up from the bottom) is an **intentional UX affordance** — the rounded top corners signal "this slides up from below." This should be evaluated: if it conflicts with the zero-radius principle, replace with `rounded-none`; if the functional affordance is genuinely lost, document the exception.
- `rounded-full` on the MobileDrawer drag handle dot is decorative — replace with a rectangular indicator (`w-12 h-1 bg-border/40` without `rounded-full`) or remove.
- `rounded-sm` inside the EditorFloatingRemote for mode selectors — replace with `rounded-none` (the floating remote already documents `rounded-none` as its principle in the file's JSDoc).
- Gallery card `rounded-*` items: `EndorsementBadge.tsx` uses `rounded-full` for the badge shape — this is **intentional** (circular badge). Do NOT change it. Same for `PublicAnimationCard` tag pills if those use `rounded-full`.
- `ConfirmDialog.tsx` in `shared/ui/` — check whether it uses the Radix Dialog primitive (which manages its own overlay) or a custom overlay. If Radix, the overlay class is set via `DialogOverlay` — patch there, not on the content div.

---

## Requirements

### Functional Requirements

- **FR-001**: All `rounded-lg`, `rounded-md`, `rounded-sm` classes on **interactive editor surfaces** (ProgressionPanel, EditorFloatingRemote, Editor buttons, MobileDrawer close button) MUST be replaced with `rounded-none`
- **FR-002**: All `rounded-full` classes on editor pills and mode toggles MUST be replaced with `rounded-none` (exception: intentional circular badges and the FloatingRemote share-view pill — document exceptions)
- **FR-003**: All `bg-white` and `bg-white/90` on editor surfaces (Focus Mode toggle, sidebar expand handle, InlineEditor, ReplayViewer shell) MUST be replaced with appropriate surface tokens (`bg-surface`, `bg-surface-warm`, or `bg-background`)
- **FR-004**: Auth pages (`login`, `register`, `forgot-password`, `reset-password`) primary `<h2>` headings MUST have `font-heading` class applied
- **FR-005**: All `bg-black/50` modal backdrops MUST be replaced with `bg-primary/60`
- **FR-006**: All changes MUST be purely cosmetic — no functional behaviour, logic, or layout structure changes
- **FR-007**: The `FloatingRemote.tsx` `rounded-full` pill container and `EndorsementBadge.tsx` circular badge MUST NOT be changed (intentional exceptions — document them)

### Frontend Requirements

- **UI-001**: All token substitutions must use existing tokens from `tailwind.config` — no new tokens may be introduced
- **UI-002**: `bg-surface` replaces `bg-white`; `bg-surface-warm` replaces `bg-gray-50`; `bg-primary/60` replaces `bg-black/50`
- **UI-003**: `font-heading` class must be applied to `<h2>` elements on auth pages — do not change font-size, weight, or any other typography properties
- **UI-004**: `rounded-none` replaces all prohibited radius classes on editor interactive surfaces
- **UI-005**: Exceptions (intentional `rounded-full` and intentional drawer `rounded-t-2xl`) must each have an inline comment: `{/* intentional: [reason] */}` or equivalent TSX comment

### Key Files to Modify

**Category A — Border Radius:**
- `src/features/animation/components/ProgressionPanel.tsx` — 3× `rounded-full` pills → `rounded-none`
- `src/features/animation/components/MobileDrawer.tsx` — `rounded-t-2xl` (evaluate), `rounded-full` handle dot → rectangular, `rounded-full` close button → `rounded-none`
- `src/features/animation/components/Editor.tsx` — `rounded-full` Focus Mode CTA, `rounded-full` Focus Mode toggle, `rounded-r-lg` sidebar expand handle, `rounded-md` sidebar expand handle → `rounded-none`
- `src/features/animation/components/Canvas/EditorFloatingRemote.tsx` — multiple `rounded-sm` → `rounded-none`

**Category B — White Surfaces:**
- `src/features/animation/components/Editor.tsx` — `bg-white/90` Focus Mode toggle → `bg-surface`, `bg-white` sidebar expand handle → `bg-surface`
- `src/features/animation/components/Canvas/InlineEditor.tsx` — `bg-white` → `bg-surface`
- `src/features/animation/components/ReplayViewer.tsx` — audit for any `bg-white` in layout shell

**Category C — Auth Headings:**
- `src/app/(auth)/login/page.tsx` — add `font-heading` to `<h2>`
- `src/app/(auth)/register/page.tsx` — add `font-heading` to `<h2>`
- `src/app/(auth)/forgot-password/page.tsx` — add `font-heading` to `<h2>`
- `src/app/(auth)/reset-password/page.tsx` — add `font-heading` to `<h2>`

**Category D — Modal Scrim:**
- `src/shared/components/SaveToCloudModal.tsx` — `bg-black/50` → `bg-primary/60`
- `src/shared/components/ReportModal.tsx` — `bg-black/50` → `bg-primary/60`
- `src/shared/components/EditMetadataModal.tsx` — `bg-black/50` → `bg-primary/60`
- `src/shared/components/DeleteConfirmDialog.tsx` — `bg-black/50` → `bg-primary/60`
- `src/features/gallery/components/VersionHistoryModal.tsx` — `bg-black/50` → `bg-primary/60`
- `src/app/collections/[id]/page.tsx` — `bg-black/50` → `bg-primary/60`
- `src/app/admin/page.tsx` — 2× `bg-black/50` → `bg-primary/60`

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Zero `rounded-lg`, `rounded-md`, `rounded-sm`, `rounded-full` on interactive editor surfaces (ProgressionPanel pills, EditorFloatingRemote controls, Editor action buttons, MobileDrawer close button, sidebar expand handle) — verified by grep
- **SC-002**: Zero `bg-white` or `bg-white/90` in editor component files (`Editor.tsx`, `InlineEditor.tsx`, `ReplayViewer.tsx`, `EditorFloatingRemote.tsx`) — verified by grep
- **SC-003**: All four auth page `<h2>` headings render in Oswald font — verified visually at `/login`, `/register`, `/forgot-password`, `/reset-password`
- **SC-004**: All modal backdrops use `bg-primary/60` — verified visually and by grep
- **SC-005**: `npm run lint && npx tsc --noEmit` passes with zero new errors
- **SC-006**: `npm test -- --run` passes (all unit tests remain green)
- **SC-007**: `/app`, `/replay/[id]`, and `/share/[id]` smoke-tested — no layout regressions introduced
- **SC-008**: Re-audit scores **≥18/20** (target improvement from 15/20)
