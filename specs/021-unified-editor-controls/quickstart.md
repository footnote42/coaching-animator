# Quickstart: Manual Test Guide — Unified Editor Controls

**Branch**: `021-unified-editor-controls`
**Requires**: Dev server running (`npm run dev`)

---

## Pre-conditions

1. Start the dev server: `npm run dev`
2. Open the editor: `http://localhost:3000/app`
3. Log in if testing authenticated features (Tier 1)

---

## Test 1: Right-side TimelinePanel visible without scrolling (SC-001)

**Viewport**: 1366×768 (resize browser or use DevTools)

1. Open `http://localhost:3000/app`
2. **Verify**: A right-side panel is visible alongside the canvas — no scrolling needed
3. **Verify**: The panel contains: Play/Pause, Prev/Next, frame counter, Add Frame, Speed (0.5×/1×/2×), Loop, Ghost
4. **Verify**: No footer below the canvas
5. **Verify**: `EditorFloatingRemote` is NOT present (no draggable pill visible)

---

## Test 2: Add frame via TimelinePanel (FR-001)

1. Open editor with a single-frame animation
2. Click **Add Frame** in the right-side panel
3. **Verify**: A second frame appears in the FrameStrip inside the panel
4. **Verify**: No scrolling required at any point

---

## Test 3: Delete last frame is disabled (FR-006)

1. Open editor with a single-frame animation
2. **Verify**: The delete frame button (if present) is visually disabled
3. Add a second frame
4. **Verify**: Delete frame is now enabled
5. Delete one frame — **Verify**: one frame remains, delete re-disables

---

## Test 4: Speed and Loop controls (FR-002)

1. Click **2×** speed in the panel — **Verify**: animation plays at double speed
2. Click **Loop** toggle — **Verify**: icon/button updates to show active state
3. Click **Loop** again — **Verify**: loop is disabled, icon reverts

---

## Test 5: Mobile — Timeline in MobileDrawer (FR-003)

**Viewport**: 375×812 (iPhone-sized)

1. Open `http://localhost:3000/app`
2. **Verify**: Right-side TimelinePanel is NOT visible (hidden on mobile)
3. **Verify**: Bottom "Tools & Actions" button is visible
4. Tap "Tools & Actions" to open MobileDrawer
5. **Verify**: A "Timeline" section is present in the drawer
6. **Verify**: Play/Pause, Prev/Next Frame, Add Frame, Speed, Loop, Ghost are all tappable
7. Tap **Add Frame** — **Verify**: frame is added without closing the drawer or requiring scroll

---

## Test 6: Focus mode hides panel (FR-007 / design intent)

1. Open editor
2. Click the **Focus Mode** button (top-right corner)
3. **Verify**: Right-side TimelinePanel disappears (consistent with left sidebar collapsing)
4. Exit focus mode — **Verify**: TimelinePanel reappears

---

## Test 7: FloatingRemote grep (SC-003)

In terminal:
```bash
grep -r "EditorFloatingRemote" src/
```
**Expected**: zero matches

```bash
grep -r "FloatingRemote" src/features/animation/components/ShareViewer.tsx
```
**Expected**: references present (share viewer is unchanged)

---

## Test 8: Share and Replay routes unaffected (SC-004)

1. Open `http://localhost:3000/replay/<any-id>`
2. **Verify**: Replay view loads normally, no errors in console
3. Open `http://localhost:3000/share/<any-id>`
4. **Verify**: Share view loads normally, `FloatingRemote` pill is visible and functional

---

## Test 9: Accessibility (SC-005)

1. Open editor, tab through TimelinePanel using keyboard
2. **Verify**: All buttons receive focus and have visible focus indicators
3. **Verify**: All buttons have `aria-label` attributes (check DevTools)
4. Check contrast of panel text against background — must meet 4.5:1

---

## Test 10: Lint and type-check (SC-006)

```bash
npm run lint
npx tsc --noEmit
```
**Expected**: Zero new errors
