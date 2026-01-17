# Known Issues - Rugby Animation Tool

## ✅ Resolved Issues (Fixed 2026-01-17)

### Issue #1: Ball Shape Incorrect - RESOLVED
**Severity**: High  
**Component**: Canvas/EntityLayer  
**Status**: ✅ FIXED  
**Fixed**: 2026-01-17

**Fix Applied**: 
Updated `PlayerToken.tsx` to render balls as `Ellipse` instead of `Circle` (radiusX=18, radiusY=12, ~1.5:1 ratio).

---

### Issue #2: Ball Color Not Visible on Pitch - RESOLVED
**Severity**: High  
**Component**: Design Tokens/Entity Defaults  
**Status**: ✅ FIXED  
**Fixed**: 2026-01-17

**Fix Applied**:
Changed `DESIGN_TOKENS.colors.neutral[0]` from `#1A3D1A` (pitch green) to `#FFFFFF` (white) for high contrast visibility.

---

### Issue #3: Animation Does Not Play Through Frames - RESOLVED
**Severity**: Critical  
**Component**: Animation Engine  
**Status**: ✅ FIXED  
**Fixed**: 2026-01-17

**Root Cause**:
The `setCurrentFrame` action in `projectStore.ts` was setting `isPlaying: false` whenever the frame index changed. This stopped the animation after each frame transition.

**Fix Applied**:
Removed `isPlaying: false` from the `setCurrentFrame` action, allowing the animation loop to progress through frames without stopping.

---

## Phase Completion Status

### ✅ Phase 1: Setup - COMPLETE
All project initialization and dependencies installed.

### ✅ Phase 2: Foundational - COMPLETE
All core types, constants, utilities, and configuration complete.

### ✅ Phase 3: User Story 1 - COMPLETE
Basic tactical animation functionality implemented and working.

### ✅ Phase 4: User Story 2 - COMPLETE
Save/Load functionality fully working and tested.

### ✅ Critical Bug Fixes - COMPLETE
All critical issues resolved. Ready to proceed to Phase 5.

### ✅ Phase 5: User Story 3 - COMPLETE
Export Animation as Video functionality implemented and verified.
- MediaRecorder integration working
- Progress indicator functional
- .webm video downloads successfully
- All acceptance criteria met (AC-1 through AC-4)
- Completed: 2026-01-17
