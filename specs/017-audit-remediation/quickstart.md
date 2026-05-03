# Quickstart Manual Test Guide: 017-audit-remediation

**Branch**: `017-audit-remediation` | **Date**: 2026-05-03

This guide covers the manual verification steps for all four violation categories. Run after implementation, before marking tasks complete.

---

## Prerequisites

```bash
npm run dev   # dev server on port 3000
```

---

## Test A: Border Radius — Editor Surfaces

### A1 — ProgressionPanel Pills

1. Open `/app` and load a cloud animation that has progressions (must be authenticated)
2. Inspect the ProgressionPanel at the top of the canvas area
3. **PASS**: All pills (Base, P1, P2…, Add) have **sharp corners** — no pill/capsule shape
4. **FAIL**: Any pill has a curved border radius

### A2 — Focus Mode Toggle Button

1. Open `/app`
2. Look at the top-right corner — the Maximize/Minimize icon button
3. **PASS**: Button has **sharp corners** — square button, no circle
4. **FAIL**: Button is circular or has any visible radius

### A3 — Snap-to-Grid Toggle Button

1. Open `/app`
2. Look at the top-right area — the Grid icon button (next to Focus Mode)
3. Click it to toggle active
4. **PASS**: Button has sharp corners in both active and inactive states
5. **PASS** (active): Active state is clearly distinguishable (light background, different border/text)

### A4 — Sidebar Collapse Button

1. Open `/app` on desktop (≥768px)
2. Look at the top-right of the sidebar panel — the collapse `<` button
3. **PASS**: Button has **sharp corners** — no rounded card shape
4. **FAIL**: Button has `rounded-md` or visible radius

### A5 — Sidebar Expand Handle

1. Collapse the sidebar (click the `<` button)
2. Look at the left edge — the `>` expand tab
3. **PASS**: Tab has sharp corners — no `rounded-r-lg` shape
4. **FAIL**: Tab has a curved right edge

### A6 — Mobile Drawer Trigger

1. Resize browser to <768px (or use DevTools mobile emulation)
2. Look at the bottom centre of the screen — the "Tools & Actions" FAB button
3. **PASS**: Button has **sharp corners** — not a pill/capsule
4. **FAIL**: Button has `rounded-full` shape

### A7 — MobileDrawer Container & Handle

1. On mobile (<768px), tap the "Tools & Actions" button to open the drawer
2. Inspect the drawer itself
3. **PASS**: Drawer top edge is **sharp** — not rounded-top-2xl
4. **PASS**: Drag handle at top is a **flat horizontal bar** (not a pill dot)
5. **PASS**: Close `X` button has **sharp corners**
6. **FAIL**: Any of the above shows curved corners

### A8 — EditorFloatingRemote Controls

1. Open `/app` on desktop
2. Find the floating remote control widget on the canvas
3. Expand it (chevron button)
4. **PASS**: All control buttons (speed 0.5x/1x/2x, loop, ghost, expand) have **sharp corners**
5. **FAIL**: Any button has `rounded-sm` or other radius

---

## Test B: White Surfaces — Editor

### B1 — Focus Mode Toggle Background

1. Open `/app`
2. Look at the Focus Mode button background
3. **PASS**: Background is **off-white cream** (`bg-surface`) — not pure white
4. **PASS**: No frosted glass / blur effect on the button
5. **FAIL**: Button background is pure white or has a blur backdrop

### B2 — Sidebar Collapse Button Background

1. Open `/app` with sidebar visible
2. Look at the in-sidebar collapse button (top-right of sidebar panel)
3. **PASS**: Button background is cream surface — not `bg-white/80`
4. **PASS**: No blur backdrop

### B3 — Sidebar Expand Handle Background

1. Collapse sidebar
2. Look at the expand tab on the left edge
3. **PASS**: Tab background is `bg-surface` — not pure white

### B4 — Canvas Wrapper

1. Open `/app`
2. Look at the border area around the pitch canvas
3. **PASS**: The thin border gap around the Konva canvas area shows cream, not pure white

### B5 — InlineEditor (Label Edit Input)

1. Open `/app`
2. Double-click a player token to open the label editor
3. **PASS**: The text input field background is cream (`bg-surface`) — not pure white

### B6 — ReplayViewer Canvas Wrapper

1. Open a replay link: `/replay/[any-animation-id]`
2. Look at the canvas border gap
3. **PASS**: Wrapper background is `bg-surface` — not pure white

---

## Test C: Auth Page Headings

### C1 — Login Page

1. Navigate to `/login` (while logged out)
2. Look at the "Sign In" heading
3. **PASS**: Heading renders in **Oswald** (bold, compressed letterforms) — visibly different from body text
4. **FAIL**: Heading uses the same font as the form labels (Inter)

### C2 — Register Page

1. Navigate to `/register`
2. Look at the "Create Account" (or equivalent) heading
3. **PASS**: Heading renders in **Oswald**

### C3 — Forgot Password Page

1. Navigate to `/forgot-password`
2. Look at the heading
3. **PASS**: Heading renders in **Oswald**

### C4 — Reset Password Page

1. Navigate to `/reset-password` (may show an error if no token — that's fine; the heading still renders)
2. Look at the heading
3. **PASS**: Heading renders in **Oswald**

---

## Test D: Modal Scrim Colour

### D1 — Save to Cloud Modal

1. Open `/app`, click "Save to Cloud"
2. Look at the backdrop behind the modal
3. **PASS**: Backdrop is **dark green-tinted** — not neutral grey
4. **FAIL**: Backdrop is pure grey/black

### D2 — Report Modal

1. Open `/gallery`, click the "…" menu on a public animation, then "Report"
2. Look at the backdrop
3. **PASS**: Dark green backdrop

### D3 — Edit Metadata Modal

1. Open `/app` with a cloud animation loaded
2. Open the edit metadata modal (via ProjectActions)
3. **PASS**: Dark green backdrop

### D4 — Delete Confirm Dialog

1. Open `/my-gallery`, hover an animation card, click "Delete"
2. Look at the backdrop
3. **PASS**: Dark green backdrop

### D5 — Admin Modal (Admin users only)

1. Log in as an admin, open `/admin`
2. Trigger a delete action
3. **PASS**: Dark green backdrop

### D6 — MobileDrawer Backdrop

1. On mobile (<768px), open the drawer
2. Look at the backdrop behind the drawer
3. **PASS**: Backdrop is **dark green-tinted** — not neutral black

---

## Regression Checks

### R1 — FloatingRemote on Share View

1. Open a share link: `/share/[any-animation-id]`
2. Look at the playback controls pill
3. **PASS**: Playback pill RETAINS `rounded-full` — this is intentional

### R2 — EndorsementBadge

1. Open `/gallery`, find an endorsed animation (green badge icon)
2. **PASS**: Badge RETAINS circular `rounded-full` shape — this is intentional

### R3 — No Layout Regressions

1. Open `/app` — verify editor layout is undamaged
2. Open `/replay/[id]` — verify replay renders correctly
3. Open `/share/[id]` — verify share view fills screen, remote is visible

---

## Quality Gate

```bash
npm run lint && npx tsc --noEmit   # must be zero errors
npm test -- --run                  # all tests must pass
```
