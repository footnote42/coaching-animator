# Quickstart: Entity Layering Control (023)

Manual verification guide for QA and self-testing.

---

## Prerequisites

- Dev server running: `npm run dev` (port 3000)
- Signed in OR using as guest

---

## Test 1 — Type hierarchy (US1)

1. Open `/app` and create a new animation (or use an existing one)
2. Add a **cone** to the centre of the pitch
3. Add a **player** overlapping the same position
4. Add the **ball** overlapping the same position
5. **Expected**: Ball renders on top, player in the middle, cone at the bottom
6. Save the animation, reload the page
7. **Expected**: Same stacking order after reload

---

## Test 2 — Bring Forward between same-type entities (US2)

1. Add two **attack players** at the same position
2. Note which player appears on top (should be the second one added, or the one with higher ID alphabetically if offsets are equal)
3. Right-click the bottom player → context menu opens
4. **Expected**: Context menu shows "Bring Forward" (enabled) and "Send Backward" (disabled)
5. Click "Bring Forward"
6. **Expected**: The formerly bottom player now appears on top
7. Right-click the now-top player
8. **Expected**: "Bring Forward" is now disabled; "Send Backward" is enabled

---

## Test 3 — Single entity of its type

1. Add a **ball** (there should only be one)
2. Right-click the ball
3. **Expected**: "Bring Forward" and "Send Backward" are both disabled

---

## Test 4 — Cross-type boundary respected (US2 acceptance scenario 4)

1. Add a **cone** and a **player** overlapping
2. Right-click the cone → "Bring Forward"
3. **Expected**: Cone moves forward within its type group but still renders beneath the player

---

## Test 5 — Persistence across save and reload (US3)

1. Set up two overlapping defenders, use "Bring Forward" to put Defender B on top of Defender A
2. Save the animation
3. Hard-reload the page (Ctrl+Shift+R)
4. **Expected**: Defender B is still on top of Defender A

---

## Test 6 — Replay and share views (US3)

1. After Test 5, open the replay: `/replay/<id>`
2. **Expected**: Same stacking order as editor
3. Open the share link: `/share/<id>`
4. **Expected**: Same stacking order

---

## Test 7 — Guest mode (US4)

1. Sign out / open incognito
2. Go to `/app`, add two overlapping players
3. Use "Bring Forward"
4. **Expected**: Layer change reflects immediately in the canvas
5. Refresh the page
6. **Expected**: Layer change is gone (no persistence for guests — consistent with all other guest state)
