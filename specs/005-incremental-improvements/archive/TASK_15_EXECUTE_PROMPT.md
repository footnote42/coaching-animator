# Task 15: Manual Playback Functionality Test

**Context**:
- Dev server: http://localhost:3000
- Test Animation: /replay/4efc251a-189d-4c02-b984-d68fc7cbbd34
- **Crucial**: Clear SW + Cache before testing (Post-migration hygiene)

**Objective**:
Verify that all playback controls function correctly on a simulated mobile viewport (375x667).

**Test Steps (Chrome DevTools - iPhone SE)**:

1. **Playback State**
   - [ ] Click **Play** button -> Verify animation moves, button icon changes to Pause.
   - [ ] Click **Pause** button -> Verify animation stops, button icon changes to Play.
   - [ ] Click **Reset** button -> Verify animation returns to Frame 1.

2. **Speed Controls**
   - [ ] Click **2x** -> Verify entities move faster.
   - [ ] Click **0.5x** -> Verify entities move slower.
   - [ ] Click **1x** -> Verify normal speed.

3. **Loop & Navigation**
   - [ ] Enable **Loop** -> Verify animation restarts automatically after last frame.
   - [ ] Disable **Loop** -> Verify animation stops at last frame.
   - [ ] Click **Next Frame** (> button) -> Verify advances 1 frame.
   - [ ] Click **Prev Frame** (< button) -> Verify rewinds 1 frame.

4. **Scrubbing**
   - [ ] Drag/Click on **Frame Strip** -> Verify stage updates to selected frame.

5. **Mobile UI**
   - [ ] Verify all buttons have adequate touch targets (>=48px visually/clickable).
   - [ ] Verify controls do not wrap unexpectedly or break layout.

**Completion**:
- Update `TASKS.md`: Mark Task 15 complete.
- Update `PROGRESS.md`: Log session findings.
