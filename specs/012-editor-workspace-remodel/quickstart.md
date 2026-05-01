# Quickstart — Manual Test Guide: Editor Workspace Remodel (Phase 2i)

**Branch**: `012-editor-workspace-remodel`  
**Server**: `npm run dev` (localhost:3000)  
**Auth required**: Yes for progression panel test; no for all others

---

## Test 1 — Sidebar collapse (US1 / SC-006)

1. Open `/app` on a 1280×800 viewport
2. Note the current canvas width (should be ~768px with 256px sidebar + 16px gap)
3. Click the collapse toggle at the bottom of the sidebar
4. **Expect**: sidebar disappears (zero width); canvas expands to fill freed space
5. **Expect**: a small chevron button appears on the canvas left edge
6. Click the chevron
7. **Expect**: sidebar re-expands; canvas shrinks back
8. Collapse again → hard-refresh (Ctrl+Shift+R)
9. **Expect**: editor loads with sidebar still collapsed (SC-006 — state persisted via localStorage)

---

## Test 2 — Focus Mode (US2 / SC-001)

1. Open `/app` on a 1440×900 viewport
2. Click the Focus Mode button (Maximize icon, top-right corner of canvas)
3. **Expect**: sidebar, footer (PlaybackControls + FrameStrip), and any progression header disappear
4. **Expect**: canvas container fills the full 1440×900 viewport with no chrome visible
5. **Expect**: the Focus Mode toggle button (now a Minimize icon) remains visible top-right
6. **Expect**: the floating remote remains visible and functional
7. Start playback before entering Focus Mode → enter Focus Mode → **Expect**: playback continues uninterrupted (FR-006)
8. Exit Focus Mode via the toggle
9. **Expect**: all hidden panels reappear in their previous state

---

## Test 3 — Sidebar collapse + Focus Mode (edge case)

1. Collapse the sidebar
2. Enter Focus Mode
3. **Expect**: all chrome hidden (sidebar was already collapsed — still hidden)
4. Exit Focus Mode
5. **Expect**: sidebar is still collapsed (not expanded) — previous state restored (FR-007)

---

## Test 4 — Expanded floating remote (US4 / SC-005)

1. Open `/app` on a 768px-tall viewport (browser DevTools → resize)
2. Scroll the footer out of view (make the viewport too short to show it)
3. Locate the floating remote; click the expand chevron (chevron-up icon on the right of the remote)
4. **Expect**: remote expands to show a second row: Frame | 0.5× | 1× | 2× | Loop icon | Ghost icon
5. Click "Frame" → **Expect**: a new frame is added (same as footer Add Frame)
6. Click "0.5×" → **Expect**: playback speed changes to 0.5×
7. Click Loop icon → **Expect**: loop toggles on/off (icon highlights)
8. Click Ghost icon → **Expect**: ghost mode toggles on/off (icon highlights)
9. Drag the remote to a new position → **Expect**: entire remote (both rows) moves together and stays within viewport

---

## Test 5 — Mobile drawer (US3 / SC-002, SC-003)

1. Open `/app` in DevTools at 375×812 viewport (iPhone SE)
2. **Expect**: NO warning banner visible
3. **Expect**: canvas is visible and fills most of the screen
4. **Expect**: a "Tools" handle bar at the bottom of the screen
5. Tap the handle → **Expect**: bottom drawer slides up
6. **Expect**: EntityPalette and ProjectActions visible in the drawer
7. Tap outside the drawer (or tap the handle again) → **Expect**: drawer closes and canvas is fully visible
8. Confirm step 3 + 5 are achievable in two taps or fewer (SC-003)
9. Confirm the floating remote is not hidden behind the drawer when it is open (UI-004)

---

## Test 6 — Progression panel max-height (SC-004)

1. Sign in, open an animation with 5 progressions (or create and add them)
2. Open the editor; verify the progression panel is visible
3. **Expect**: the Add button is always visible (not scrolled off the panel)
4. **Expect**: the editor height does not change as progressions are added — panel scrolls horizontally only
5. **Expect**: with max 5 progressions, the panel never forces the main content below the viewport

---

## Test 7 — Route regression (SC-009)

1. Open `/share/{id}` → **Expect**: no visual changes from 011-workflow-clarity baseline
2. Open `/replay/{id}` → **Expect**: no visual changes

---

## Pre-push gate

```bash
npm run lint && npx tsc --noEmit
npm test -- --run
```

Both must pass with zero new errors before opening a PR.
