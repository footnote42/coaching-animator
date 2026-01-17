# Implementation Plan - Critical Bug Fixes (Post-Phase 4)

This plan addresses three critical issues discovered during Phase 4 manual testing that prevent proper functionality of User Story 1 (Basic Tactical Animation).

## Context
- **Source**: Issues documented in [KNOWN_ISSUES.md](../KNOWN_ISSUES.md)
- **Priority**: Critical - blocks Phase 5 and beyond
- **Affects**: User Story 1 core functionality
- **SOP**: Follow [.gemini/commands/speckit.implement.toml](../../../.gemini/commands/speckit.implement.toml)

## Issues to Fix

### Issue #1: Ball Shape Incorrect
**Problem**: Ball renders as circle, should be rugby ball (oval) shape  
**Impact**: Visual accuracy, sport authenticity  
**Files**: `src/components/Canvas/PlayerToken.tsx`

### Issue #2: Ball Color Not Visible
**Problem**: Ball color defaults to pitch green, making it invisible  
**Impact**: Usability - cannot see the ball on the field  
**Files**: `src/constants/design-tokens.ts`, `src/App.tsx`

### Issue #3: Animation Does Not Play
**Problem**: Animation does not progress through frames when play button pressed  
**Impact**: Critical - core animation feature non-functional  
**Files**: `src/hooks/useAnimationLoop.ts`, `src/store/projectStore.ts`

---

## Proposed Changes

### 1. Fix Ball Rendering Shape

#### File: [PlayerToken.tsx](file:///c:/Coding%20Projects/coaching-animator/src/components/Canvas/PlayerToken.tsx)

**Current Implementation**: All entities render as `<Circle>`

**Required Changes**:
1. Add conditional rendering based on `entity.type`
2. For `type === 'ball'`, render as `<Ellipse>` instead of `<Circle>`
3. Ball dimensions: 
   - `radiusX`: 20 (horizontal)
   - `radiusY`: 13 (vertical) 
   - Ratio approximates rugby ball shape (≈1.5:1)
4. Maintain same positioning logic (x, y coordinates)
5. Keep drag handlers and selection logic identical

**Implementation**:
```typescript
// In PlayerToken component, replace Circle with conditional rendering:
{entity.type === 'ball' ? (
    <Ellipse
        radiusX={20}
        radiusY={13}
        fill={entity.color}
        stroke={isSelected ? '#FF6B35' : '#1A3D1A'}
        strokeWidth={isSelected ? 3 : 1}
    />
) : (
    <Circle
        radius={15}
        fill={entity.color}
        stroke={isSelected ? '#FF6B35' : '#1A3D1A'}
        strokeWidth={isSelected ? 3 : 1}
    />
)}
```

---

### 2. Fix Ball Color Visibility

#### File: [design-tokens.ts](file:///c:/Coding%20Projects/coaching-animator/src/constants/design-tokens.ts)

**Problem**: `DESIGN_TOKENS.colors.neutral[0]` is pitch green

**Solution**: Update neutral color palette to start with ball-appropriate colors

**Changes**:
```typescript
colors: {
    attack: ['#2E7D32', '#388E3C', '#43A047'],    // Keep existing
    defense: ['#D32F2F', '#E53935', '#F44336'],   // Keep existing
    neutral: [
        '#FFFFFF',  // White - primary ball color (high contrast on green)
        '#8B4513',  // Brown leather - traditional rugby ball
        '#FFD700',  // Gold - marker/cone color
        '#FF6B35',  // Orange - alternate marker
    ],
},
```

#### File: [App.tsx](file:///c:/Coding%20Projects/coaching-animator/src/App.tsx)

**Current**: Ball uses `DESIGN_TOKENS.colors.neutral[0]` which is green

**No changes needed** - fixing design tokens will automatically resolve this

---

### 3. Fix Animation Playback

This is the most critical issue requiring investigation and implementation.

#### Investigation Required

**Check**: Does `useAnimationLoop` hook exist and is it properly implemented?

**File**: [useAnimationLoop.ts](file:///c:/Coding%20Projects/coaching-animator/src/hooks/useAnimationLoop.ts)

#### Expected Implementation

The hook should:
1. Subscribe to `isPlaying`, `currentFrameIndex`, `playbackSpeed`, `loopPlayback` from store
2. Use `requestAnimationFrame` loop when `isPlaying === true`
3. Calculate elapsed time and determine current interpolation progress
4. Call `setPlaybackPosition()` with interpolated values
5. Advance to next frame when duration expires
6. Handle loop logic when reaching last frame
7. Stop playback when reaching end (if not looping)

#### File: [useAnimationLoop.ts](file:///c:/Coding%20Projects/coaching-animator/src/hooks/useAnimationLoop.ts) [IMPLEMENT]

**Create comprehensive animation loop**:

```typescript
import { useEffect, useRef } from 'react';
import { useProjectStore } from '../store/projectStore';

export const useAnimationLoop = () => {
    const project = useProjectStore((state) => state.project);
    const isPlaying = useProjectStore((state) => state.isPlaying);
    const currentFrameIndex = useProjectStore((state) => state.currentFrameIndex);
    const playbackSpeed = useProjectStore((state) => state.playbackSpeed);
    const loopPlayback = useProjectStore((state) => state.loopPlayback);
    const setPlaybackPosition = useProjectStore((state) => state.setPlaybackPosition);
    const setCurrentFrame = useProjectStore((state) => state.setCurrentFrame);
    const pause = useProjectStore((state) => state.pause);

    const animationFrameRef = useRef<number>();
    const startTimeRef = useRef<number>();
    const currentFrameStartRef = useRef<number>(0);

    useEffect(() => {
        if (!isPlaying || !project || project.frames.length <= 1) {
            return;
        }

        const animate = (timestamp: number) => {
            if (!startTimeRef.current) {
                startTimeRef.current = timestamp;
                currentFrameStartRef.current = timestamp;
            }

            const currentFrame = project.frames[currentFrameIndex];
            const elapsed = (timestamp - currentFrameStartRef.current) * playbackSpeed;
            const duration = currentFrame.duration;
            const progress = Math.min(elapsed / duration, 1);

            // Update playback position for interpolation
            const toFrameIndex = currentFrameIndex + 1;
            
            if (toFrameIndex < project.frames.length) {
                setPlaybackPosition({
                    fromFrameIndex: currentFrameIndex,
                    toFrameIndex,
                    progress,
                });

                // Check if we should advance to next frame
                if (progress >= 1) {
                    setCurrentFrame(toFrameIndex);
                    currentFrameStartRef.current = timestamp;
                }

                animationFrameRef.current = requestAnimationFrame(animate);
            } else {
                // Reached the end
                if (loopPlayback) {
                    setCurrentFrame(0);
                    currentFrameStartRef.current = timestamp;
                    animationFrameRef.current = requestAnimationFrame(animate);
                } else {
                    pause();
                }
            }
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            startTimeRef.current = undefined;
        };
    }, [isPlaying, project, currentFrameIndex, playbackSpeed, loopPlayback, setPlaybackPosition, setCurrentFrame, pause]);
};
```

#### File: [projectStore.ts](file:///c:/Coding%20Projects/coaching-animator/src/store/projectStore.ts)

**Implement `setPlaybackPosition` action** (currently a stub):

```typescript
setPlaybackPosition: (position: PlaybackPosition) => set((state) => {
    // This state is used by EntityLayer to interpolate positions
    // No need to update project state, just store the playback position
    // EntityLayer will read this to calculate interpolated positions
    return {
        ...state,
        playbackPosition: position,
    };
}),
```

**Add to store state**:
```typescript
export interface ProjectStoreState {
    // ... existing fields
    playbackPosition: PlaybackPosition | null;
    // ... rest of interface
}
```

#### File: [EntityLayer.tsx](file:///c:/Coding%20Projects/coaching-animator/src/components/Canvas/EntityLayer.tsx)

**Update to use interpolated positions during playback**:

1. Subscribe to `playbackPosition` from store
2. If `playbackPosition` is not null, calculate interpolated entity positions
3. Use lerp function from `src/utils/interpolation.ts` to interpolate x, y coordinates
4. Render entities at interpolated positions instead of current frame positions

---

## Verification Plan

### Issue #1: Ball Shape
1. Add a ball entity to canvas
2. Verify it renders as an oval/ellipse
3. Verify it maintains correct positioning and drag behavior
4. Test selection highlighting

### Issue #2: Ball Color
1. Add a ball entity to canvas
2. Verify it appears white (high contrast against green pitch)
3. Verify visibility on all field types
4. Test that existing saved projects with balls update to new color

### Issue #3: Animation Playback
1. Create a project with 2+ frames
2. Position players differently in each frame
3. Press play button
4. **Verify**: Entities smoothly animate from frame 1 → frame 2
5. **Verify**: Animation continues through all frames
6. **Verify**: Animation stops at end (or loops if enabled)
7. Test with different playback speeds (0.5x, 1x, 2x)
8. Test loop mode

---

## Testing Checklist

- [ ] Ball renders as oval/ellipse shape
- [ ] Ball color is visible on green pitch
- [ ] Ball drag and selection work correctly
- [ ] Animation plays through frames smoothly
- [ ] Animation respects frame durations
- [ ] Animation respects playback speed settings
- [ ] Loop mode works correctly
- [ ] Pause button stops animation
- [ ] Reset button returns to frame 0
- [ ] Keyboard shortcuts (spacebar) work during playback
- [ ] Build completes without errors
- [ ] Manual browser testing confirms all fixes

---

## Notes

### Priority Order
1. **Fix Animation Playback** (Issue #3) - Most critical, core feature
2. **Fix Ball Color** (Issue #2) - Simple, high impact on usability
3. **Fix Ball Shape** (Issue #1) - Polish, less critical

### Dependencies
- Issues #1 and #2 are independent, can be fixed in parallel
- Issue #3 requires careful implementation and testing
- All three should be fixed before continuing to Phase 5

### Constitution Compliance
- ✅ Modular approach: Each fix targets specific components
- ✅ Rugby-centric: Ball shape matches sport requirements
- ✅ Intuitive UX: Visible ball, smooth animation
- ✅ Offline-first: No external dependencies added
