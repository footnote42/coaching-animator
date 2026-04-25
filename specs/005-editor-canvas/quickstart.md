# Quickstart — Manual Test Guide: Editor & Canvas Credibility (Phase 2a)

**Branch**: `005-editor-canvas`  
**Prerequisites**: Dev server running (`npm run dev`), test animation saved to cloud (for `/replay` and `/share` routes)

---

## Setup

```bash
npm run dev        # Start dev server on localhost:3000
```

Log in with a test account so cloud-save routes are accessible.

---

## Test 1: Pitch Markings (PITCH-001)

**Route**: `/app`

1. Open `localhost:3000/app`.
2. Without adding any entities, observe the pitch canvas.
3. **Verify all of the following are visible**:
   - [ ] Boundary lines (outer rectangle)
   - [ ] Two solid white try lines (left and right thirds)
   - [ ] Two solid white 22-metre lines
   - [ ] Two dashed 10-metre lines
   - [ ] One solid halfway line
   - [ ] H-shaped goalposts at both ends (two uprights + crossbar visible as an H, not a U-shape)
   - [ ] 5-metre gang lines (short dashed lines along the top and bottom of the pitch, parallel to the touchlines, between the try lines)
4. **Verify none of the following are present**:
   - [ ] No extra unexplained dashed vertical lines
   - [ ] No grey-coloured lines (all lines are white/light)
   - [ ] No U-bracket shapes at the try lines

**Repeat** at `/replay/[id]` and `/share/[id]` — pitch markings must be identical.

---

## Test 2: Canvas Responsive Sizing (PITCH-002)

**Route**: `/app`

1. Open the editor at full-screen on your monitor.
2. The canvas should fill the available workspace proportionally.
3. Drag the browser window to make it narrower (simulate 1280px wide).
4. **Verify**: Canvas shrinks proportionally; no horizontal scrollbar; pitch is fully visible.
5. Expand the window again.
6. **Verify**: Canvas expands to fill the workspace.
7. Open DevTools → toggle device emulation (mobile viewport, e.g. 390×844 iPhone).
8. **Verify**: Canvas fits within the mobile viewport; no overflow.

**Note**: `/replay/[id]` and `/share/[id]` use their own sizing hooks — do NOT test those routes here. Those routes should be unaffected.

---

## Test 3: Export Settings Removed (EDITOR-003)

**Route**: `/app`

1. Open the editor sidebar.
2. Scroll through all sidebar sections.
3. **Verify**: No "Export Settings" heading, no "WebM" button, no "GIF" button, no resolution selector (720p/1080p).
4. **Verify**: "Save Local" (JSON download) button is still present in the Project section.

---

## Test 4: Tactical Colour Palette (EDITOR-009)

**Route**: `/app`

1. Add an attack player to the canvas.
2. With the player selected, open the colour picker in the sidebar.
3. **Verify**: Exactly 6 colour swatches visible.
4. **Verify**: The 6 colours are visually distinct — red, blue, white, yellow/amber, green, black.
5. Click each swatch and verify the player token on the canvas changes colour accordingly.
6. **Verify**: No extra swatches beyond the 6.

---

## Test 5: Team Selector Removed (EDITOR-008)

**Route**: `/app`

1. Add an attack player to the canvas. Select it.
2. Look at the entity properties panel in the sidebar.
3. **Verify**: No "Team" control (no Attack/Defense/Neutral buttons in properties).
4. **Verify**: Label (Jersey #) and Colour fields are still present.
5. Select a cone, ball, tackle shield, tackle bag — verify none show a team selector.

---

## Test 6: Player Token Labels & Legend (EDITOR-006/007)

**Route**: `/app` and `/share/[id]`

1. Add 3 attack players. Set their labels to 1, 2, 3 (via Jersey # field).
2. Add 2 defense players. Set their labels to 9, 10.
3. **Verify** on canvas:
   - [ ] Player tokens show their numbers only — no "Attacker" or "Defender" text on the token.
   - [ ] Numbers are clearly readable at normal desktop zoom.
4. Open the page on a mobile device (or use DevTools device emulation at 390px wide).
5. **Verify** on mobile: numbers are legible at arm's length (hold phone at normal viewing distance).
6. **Verify**: A pitch legend is visible on the canvas showing the attack colour with a label, and the defence colour with a label.
7. **Verify** the legend is visible but does not obstruct the centre of the pitch.

**Repeat at `/share/[id]`**: Legend and token labels render correctly in the full-screen share view.

---

## Test 7: Tackle Equipment Icons (EDITOR-005)

**Route**: `/app`

1. Add a tackle shield to the canvas.
2. Add a tackle bag to the canvas.
3. Without any prompt, show the canvas to someone and ask them to name both shapes.
   - Acceptable: "shield / pad / tackle pad" and "tackle bag / standing bag / post pad".
   - Not acceptable: "rectangle" or "oval" without any rugby context.
4. **Verify**: Both icons are visually distinct from each other.
5. **Verify**: Both icons use the entity colour (from `EntityColors`), not hardcoded hex.

---

## Test 8: Entity Button Consistency (EDITOR-004)

**Route**: `/app`

1. Look at the entity creation toolbar in the sidebar.
2. **Verify**: All entity creation buttons (Attack Player, Defense Player, Ball, Cone, Tackle Shield, Tackle Bag) have the same visual style — same size, same border, same background colour (outline variant).
3. Hover over each button.
4. **Verify**: Hover states are identical across all entity buttons.

---

## Test 9: Metadata Pop-Out (EDITOR-001)

**Route**: `/app`

1. Look at the sidebar.
2. **Verify**: No "Animation Title" or "Tutorial Video URL" input field is directly visible in the sidebar.
3. **Verify**: An "Edit Details" (or equivalent) button is present in the sidebar.
4. Click the button.
5. **Verify**: A dialog/sheet opens with the Animation Title field and YouTube URL field.
6. Change the animation title. Close the dialog.
7. **Verify**: The updated title is reflected (e.g., in the browser tab or save filename).

---

## Regression Check: All Routes

After all changes are in place, verify these baseline behaviours are unaffected:

| Route | Check |
|-------|-------|
| `/app` | Add player, cone, ball — all appear on canvas; drag to reposition works |
| `/app` | Annotation (arrow, line) drawing works |
| `/replay/[id]` | Playback plays correctly; pitch visible; no layout shift |
| `/share/[id]` | Full-screen layout preserved; `position:fixed inset:0` not broken; canvas fits mobile viewport |
| `/gallery` | Gallery cards unaffected |
| `/my-gallery` | My Playbook unaffected |

---

## Pre-Push Gate

```bash
npm run lint          # Must pass with zero new errors
npx tsc --noEmit     # Must pass with zero new type errors
npm test -- --run    # Unit tests — 73/73 must pass (or more if new tests added)
```
