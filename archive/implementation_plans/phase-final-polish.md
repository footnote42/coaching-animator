# Final Phase: Spec Compliance & Polish

> **Goal**: Satisfy remaining functional requirements and success criteria from the specification.

## 1. Ball Possession Logic (FR-ENT-06)

Entities with a `parentId` should follow the parent during interpolation. 

### Proposed Changes
- **Interpolation Engine**: Update `useAnimationLoop.ts` (or wherever interpolation happens) to check for `parentId`. If a ball has a parent, its position is inherited/relative.
- **UI**: In `EntityProperties.tsx`, if the selected entity is a "ball", show a "Possession" dropdown listing all players in the current frame.
- **Visuals**: Maybe draw a subtle link or just snap the ball to the player's center.

## 2. Export Resolution Selector (FR-EXP-03)

Allow users to choose between 720p (default) and 1080p.

### Proposed Changes
- **Store**: Add a UI action to update `project.settings.exportResolution`.
- **UI**: In `ProjectActions.tsx`, add a toggle or dropdown next to the Export button to select resolution.
- **Export Hook**: Update `useExport.ts` to use the resolution setting from the store.

## 3. UI Refinements & Bug Fixes

### Double-Click Reliability (User Feedback)
- Investigate `PlayerToken.tsx` double-click handling. Konva's `onDblClick` can sometimes be finicky depending on stage scale and individual click timing.
- Consider adding a small hit radius cushion or implementing a custom click timer.

### Context Menu Polish
- Ensure "Duplicate" works as expected (it seems to, but verify).
- Add "Flip Direction" for Arrows? (Optional polish).

## Verification Plan

### Automated Tests
- `npm run build`
- Unit test for parent-relative interpolation.

### Manual Verification
1. Create player, create ball. 
2. Assign ball to player via properties.
3. Move player in next frame.
4. Verify ball follow player during playback.
5. Export at 1080p and verify file resolution.
