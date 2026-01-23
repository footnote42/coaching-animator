# Implementation Plan: Phase 6 - User Story 4 (Manage Multiple Frames)

**Feature Branch**: `001-rugby-animation-tool` | **Phase**: 6 | **Date**: 2026-01-22

## Goal Description

Enhance the existing frame management system to fully support User Story 4 acceptance criteria. The primary goal is to add a **duration slider** to each frame thumbnail, allowing coaches to adjust per-frame transition times interactively. This completes the frame management feature set by complementing the already-implemented duplicate frame and frame navigation functionality.

## Current Implementation Status

### ✅ Already Implemented
- **Duplicate Frame**: `duplicateFrame(frameId)` action in `projectStore.ts` (lines 264-299)
  - Creates exact copy of frame with all entities
  - Inserts after selected frame
  - Updates frame indices correctly
- **Update Frame**: `updateFrame(frameId, updates)` action in `projectStore.ts` (lines 301-332)
  - Supports duration updates with validation (100ms-10,000ms)
  - Clamps values to valid range
- **Frame Navigation**: Prev/Next buttons in `PlaybackControls.tsx`
  - Navigate between frames via arrow buttons
  - Displays current frame count (e.g., "2/5")
  - Buttons disabled at boundaries
- **Frame Duration Display**: `FrameThumbnail.tsx` shows duration (line 67)
  - Displays as "X.Xs" below frame number
  - Read-only text display
- **Duplicate Button**: Copy icon on frame thumbnail hover (lines 74-80)
  - Triggers `onDuplicate` callback

### ⏳ Needs Implementation
- **Duration Slider UI**: Interactive slider to adjust frame duration
  - Currently only shows duration as text
  - No way to modify duration from UI
  - Slider component already exists in `src/components/ui/slider.tsx`

## Proposed Changes

### Component: FrameThumbnail.tsx

#### [MODIFY] [FrameThumbnail.tsx](file:///c:/Coding%20Projects/coaching-animator/src/components/Timeline/FrameThumbnail.tsx)

**Changes**:
1. Import shadcn `Slider` component
2. Add duration slider below frame number display
3. Wire slider to `updateFrame` via new `onDurationChange` callback prop
4. Convert slider value (0.1s-10s range) to milliseconds for store
5. Display current duration dynamically as slider moves
6. Apply Constitution-compliant styling:
   - Sharp corners (border-radius: 0)
   - Monospace font for duration value
   - Pitch Green accent for slider track

**Props Update**:
```typescript
export interface FrameThumbnailProps {
  frame: Frame;
  displayIndex: number;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onDurationChange: (frameId: string, durationMs: number) => void; // NEW
}
```

**Layout**:
- Slider positioned below duration text
- Width: match thumbnail (64px)
- Min: 0.1s (100ms), Max: 10s (10000ms), Step: 0.1s (100ms)
- Update on change (not on drag end) for immediate feedback

---

### Component: FrameStrip.tsx

#### [MODIFY] [FrameStrip.tsx](file:///c:/Coding%20Projects/coaching-animator/src/components/Timeline/FrameStrip.tsx)

**Changes**:
1. Add `onDurationChange` prop to interface
2. Pass prop through to each `FrameThumbnail`
3. No layout changes needed

**Props Update**:
```typescript
export interface FrameStripProps {
  frames: Frame[];
  currentFrameIndex: number;
  onFrameSelect: (index: number) => void;
  onAddFrame: () => void;
  onRemoveFrame: (frameId: string) => void;
  onDuplicateFrame: (frameId: string) => void;
  onDurationChange: (frameId: string, durationMs: number) => void; // NEW
}
```

---

### Component: App.tsx

#### [MODIFY] [App.tsx](file:///c:/Coding%20Projects/coaching-animator/src/App.tsx)

**Changes**:
1. Import `updateFrame` from project store (line 44 - add to destructuring)
2. Create `handleFrameDurationChange` handler
3. Pass handler to `FrameStrip` as `onDurationChange` prop (line 282)

**New Handler** (add after line 206):
```typescript
const handleFrameDurationChange = (frameId: string, durationMs: number) => {
  updateFrame(frameId, { duration: durationMs });
};
```

## Verification Plan

### Automated Tests

**Unit Tests** (if time permits, optional for this phase):
- Test that `updateFrame` clamps duration values correctly
- Test that slider converts seconds to milliseconds properly

### Browser Verification (Primary)

Run the following tests in the browser after implementation:

1. **Test Duration Slider Functionality**
   - Start dev server: `npm run dev`
   - Create a new project
   - Add 3 frames (click "+" button twice)
   - On Frame 1 thumbnail, move slider to minimum (0.1s)
   - Verify duration text updates to "0.1s"
   - On Frame 2 thumbnail, move slider to 3.0s
   - Verify duration text updates to "3.0s"
   - Click Play button
   - Verify Frame 1→2 transition happens quickly (~100ms)
   - Verify Frame 2→3 transition happens slowly (~3000ms)

2. **Test Duplicate Frame**
   - Add players to Frame 1 (Attack + Defense)
   - Hover over Frame 2 thumbnail
   - Click Copy icon
   - Verify Frame 3 appears with same entities as Frame 2
   - Verify new frame appears immediately after Frame 2

3. **Test Previous/Next Navigation**
   - Click "Next" arrow in PlaybackControls
   - Verify current frame indicator updates (e.g., "2/4")
   - Verify canvas shows Frame 2 entities
   - Click "Previous" arrow
   - Verify return to Frame 1
   - Verify buttons disable at boundaries (Prev at frame 1, Next at last frame)

4. **Test Persistence**
   - Adjust Frame 1 duration to 0.5s
   - Adjust Frame 2 duration to 4.0s
   - Click "Save Project"
   - Download JSON file
   - Click "Load Project"
   - Upload the saved file
   - Verify Frame 1 shows "0.5s"
   - Verify Frame 2 shows "4.0s"
   - Play animation to confirm durations work

### Acceptance Criteria Checklist

From [spec.md](file:///c:/Coding%20Projects/coaching-animator/specs/001-rugby-animation-tool/spec.md) User Story 4:

- [x] **AC-1**: Add frame creates copy of current frame ✅ *Already works*
- [x] **AC-2**: Click frame thumbnail shows that frame's positions ✅ *Already works*
- [ ] **AC-3**: Duplicate frame creates exact copy after selected frame ⏳ *Needs verification*
- [x] **AC-4**: Remove frame deletes and moves to adjacent frame ✅ *Already works*
- [ ] **AC-5**: Duration slider updates transition time ⏳ *Needs implementation*

## Technical Constraints

### Constitution Compliance

- **Sharp corners**: Slider component must use `border-radius: 0`
- **Monospace fonts**: Duration value must use font-mono
- **Pitch Green (#1A3D1A)**: Slider track/thumb should use primary color
- **No drop shadows**: Slider styling should use borders, not shadows
- **Immediate feedback**: Slider must update duration on change, not on drag end (<100ms)

### Validation

- Duration range: 100ms (0.1s) to 10,000ms (10s) per `VALIDATION.FRAME` constants
- `updateFrame` already clamps values to this range
- Slider step: 100ms (0.1s increments)

### User Experience

- Slider should be compact (fit within 64px thumbnail width)
- Duration value should update live as slider moves
- Slider should not interfere with duplicate/delete buttons on hover
- Slider should be disabled during playback (if needed, check `isPlaying` state)

## Notes

- This is a **low-risk, high-value** implementation
- Most functionality already exists in the store
- Main work is UI wiring, not business logic
- Slider component from shadcn/ui is already installed and working
- Consider making slider width slightly narrower (e.g., 56px) to fit comfortably in thumbnail
- Duration slider placement: below frame number, above hover buttons

## Success Metrics

Implementation is successful when:
1. All 5 acceptance criteria pass
2. Duration slider adjusts frame transition times
3. Changes persist through save/load cycle
4. UI remains responsive (<100ms updates)
5. Constitution aesthetic compliance maintained
