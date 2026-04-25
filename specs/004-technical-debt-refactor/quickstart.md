# Manual Test Guide: Phase 3a — Technical Debt Reduction

**Branch**: `004-technical-debt-refactor`
**Purpose**: Verify editor behaviour is unchanged after each refactor step

---

## Setup

```bash
npm run dev   # start dev server on port 3000
```

Open a second terminal for running automated checks:

```bash
npm run lint && npx tsc --noEmit && npm test -- --run
```

Run this command after **each implementation step** before proceeding.

---

## Step-by-Step Smoke Tests

Run the full checklist after each hook extraction:

### Entity Creation (tests useEditorEntityHandlers)

1. Open `http://localhost:3000/app`
2. Click "Add Attack Player" → red token appears on canvas
3. Click "Add Defense Player" → blue token appears on canvas
4. Click "Add Ball" → white/ball token appears on canvas
5. Click "Add Cone" → yellow token appears on canvas
6. Click "Add Tackle Shield" → shield token appears on canvas
7. Click "Add Tackle Bag" → bag token appears on canvas

### Context Menus (tests useEditorContextMenuHandlers)

8. Right-click any player token → context menu shows Duplicate / Delete / Edit Label
9. Click "Duplicate" → new entity appears near the original
10. Right-click duplicated player → click "Delete" → entity removed
11. Double-click any player → inline label editor appears over entity
12. Type a label, press Enter → label appears on player
13. Press Escape in inline editor → editor closes, label unchanged
14. Click the canvas background → any open context menu dismisses

### Drawing (tests useEditorPlaybackHandlers)

15. Enable drawing mode → click and drag on canvas → arrow annotation appears
16. Right-click the annotation → delete option appears → click Delete → annotation removed

### Playback & Frames (tests useEditorPlaybackHandlers)

17. Click "Add Frame" → frame count increases, new empty frame appears
18. Click "Previous Frame" / "Next Frame" → frame index changes correctly
19. Click Play → frames advance in sequence
20. Enable Loop → playback wraps back to frame 1 after last frame
21. Change frame duration → duration shown in timeline updates

### Guest Limit (tests useEditorEntityHandlers + useEditorPlaybackHandlers)

22. Clear all animations (new project as guest / Tier 0 user)
23. Add frames until count reaches 10 → 11th "Add Frame" triggers guest limit modal
24. Dismiss modal → frame count stays at 10

### Progressions (tests useEditorProgressionHandlers — requires authenticated user + cloud animation)

25. Load a cloud animation that has progressions
26. Progression switcher panel is visible
27. Click a different progression → loads correctly
28. Make an edit (move a player) → attempt to switch progression → unsaved-changes dialog appears
29. Click "Discard and Switch" → switches without saving
30. Add a new progression (if <5 exist) → new progression created and auto-selected

### Other Routes

31. Open `http://localhost:3000/replay/[valid-id]` → animation loads and plays
32. Open `http://localhost:3000/share/[valid-id]` → full-screen viewer, no horizontal scroll on mobile viewport

---

## Automated Verification

After completing all steps:

```bash
npm run lint           # 0 errors
npx tsc --noEmit       # 0 errors
npm test -- --run      # 73 tests pass
npm run e2e            # E2E suite passes (requires dev server running)
```
