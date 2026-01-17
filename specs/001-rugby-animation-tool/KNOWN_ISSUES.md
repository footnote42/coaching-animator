# Known Issues - Rugby Animation Tool

## Critical Issues (Phase 3/4)

### Issue #1: Ball Shape Incorrect
**Severity**: High  
**Component**: Canvas/EntityLayer  
**Status**: Open  
**Reported**: 2026-01-17

**Description**:
The ball entity is currently rendered as a circle, but should be rendered as a rugby ball shape (oval/ellipse) to match the sport.

**Expected Behavior**:
Ball should render as an oval/ellipse shape, oriented appropriately for rugby.

**Current Behavior**:
Ball renders as a circle, same as player tokens.

**Affected Files**:
- `src/components/Canvas/PlayerToken.tsx`

---

### Issue #2: Ball Color Not Visible on Pitch
**Severity**: High  
**Component**: Design Tokens/Entity Defaults  
**Status**: Open  
**Reported**: 2026-01-17

**Description**:
The ball color defaults to the same shade of green as the rugby pitch background, making it invisible or extremely difficult to see during use.

**Expected Behavior**:
Ball should have a contrasting color that stands out against the pitch background, such as white, brown (traditional rugby ball), or bright yellow.

**Current Behavior**:
Ball uses `DESIGN_TOKENS.colors.neutral[0]` which matches the pitch green.

**Affected Files**:
- `src/constants/design-tokens.ts`
- `src/App.tsx` (default ball color on add)

**Suggested Fix**:
Change ball default color to `#FFFFFF` (white) or `#8B4513` (brown leather) for rugby.

---

### Issue #3: Animation Does Not Play Through Frames
**Severity**: Critical  
**Component**: Animation Engine  
**Status**: Open  
**Reported**: 2026-01-17

**Description**:
When the play button is pressed, the animation does not run through frames as expected. The animation system is not transitioning between frames.

**Expected Behavior**:
Pressing play should smoothly animate entities from frame to frame, interpolating positions over the defined durations.

**Current Behavior**:
Animation does not progress through frames when play is pressed.

**Affected Files**:
- `src/hooks/useAnimationLoop.ts`
- `src/store/projectStore.ts` (playback actions)

**Investigation Needed**:
- Check if `useAnimationLoop` is properly implementing frame transitions
- Verify `requestAnimationFrame` loop is running
- Check if `setPlaybackPosition` is being called correctly
- Verify frame duration and interpolation logic

---

## Phase Completion Status

### ✅ Phase 1: Setup - COMPLETE
All project initialization and dependencies installed.

### ✅ Phase 2: Foundational - COMPLETE
All core types, constants, utilities, and configuration complete.

### ✅ Phase 3: User Story 1 - COMPLETE (with issues)
Basic tactical animation functionality implemented, but with known issues above.

### ✅ Phase 4: User Story 2 - COMPLETE
Save/Load functionality fully working and tested.

### ⏸️ Phase 5+: Pending
Awaiting resolution of critical issues before proceeding.
