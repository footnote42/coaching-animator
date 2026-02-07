# 🐛 Landscape Hint Not Rendering (RESOLVED)

**Status**: ✅ Fixed
**Resolution Date**: 2026-02-07
**Verified By**: Manual Browser Simulation (Task 14)
**Priority**: Medium
**Date Identified**: 2026-02-07

## Problem Statement

Landscape hint in ReplayViewer doesn't appear on mobile viewports (< 600px width). The condition exists in the code but the element doesn't render.

## What's Been Fixed ✅

1. **CSS Class Issue**
   - Changed `bg-surface-darker` (doesn't exist) → `bg-[var(--color-surface-warm)]`
   - Added `text-text-primary` for proper text color
   - File: `src/components/replay/ReplayViewer.tsx` (line 164)

2. **Mobile Layout Overflow**
   - Removed duplicate `px-4` padding from canvas container
   - Canvas now fits perfectly on mobile without horizontal scroll
   - File: `src/components/replay/ReplayViewer.tsx` (line 168)

## What's Still Broken ❌

**Symptom**: The hint div doesn't render at all (not just invisible)

**Expected Behavior**:
```tsx
{canvasWidth < 600 && (
  <div className="mb-3 px-4 py-2 bg-[var(--color-surface-warm)] border border-border rounded text-sm text-text-primary">
    💡 Rotate device for best viewing experience
  </div>
)}
```

**Current Behavior**: No hint visible on mobile viewports (tested at 375px)

## Hypothesis

The `useCanvasSize` hook has an SSR-safe initial state of 800px:

```typescript
const [size, setSize] = useState<CanvasSize>({
  width: maxWidth,      // 800px
  height: maxWidth / aspectRatio,
});
```

**Potential Issue**:
1. First render: `canvasWidth = 800` → condition `canvasWidth < 600` is false → hint doesn't render
2. `useEffect` runs: calculates actual width (343px on mobile)
3. State updates to 343px
4. **Component should re-render** → condition becomes true → hint should appear

If hint still doesn't show, one of these is failing:
- useEffect isn't running
- State isn't updating
- Component isn't re-rendering after state update
- Condition is being evaluated incorrectly

## Investigation Needed

### Debug Steps

1. **Add console logging**:
   ```typescript
   const { width: canvasWidth, height: canvasHeight } = useCanvasSize(800, 4 / 3);
   console.log('[ReplayCanvas] canvasWidth:', canvasWidth);
   ```

2. **Verify re-render**:
   ```typescript
   useEffect(() => {
     console.log('[ReplayCanvas] Canvas width updated:', canvasWidth);
   }, [canvasWidth]);
   ```

3. **Check condition**:
   ```typescript
   const showHint = canvasWidth < 600;
   console.log('[ReplayCanvas] showHint:', showHint, 'canvasWidth:', canvasWidth);
   ```

### Test Cases

- [ ] Desktop (1920px): Hint should NOT appear (canvasWidth = 800)
- [ ] Tablet (768px): Hint should NOT appear (canvasWidth = 736)
- [ ] Large phone (414px): Hint SHOULD appear (canvasWidth = 382)
- [ ] iPhone SE (375px): Hint SHOULD appear (canvasWidth = 343)
- [ ] Narrow (320px): Hint SHOULD appear (canvasWidth = 288)

## Files Involved

- **Component**: `src/components/replay/ReplayViewer.tsx` (lines 161-167)
- **Hook**: `src/hooks/useCanvasSize.ts` (lines 1-76)
- **Page**: `app/replay/[id]/page.tsx` (line 194)

## Workaround (If Needed)

If urgent fix needed before investigation:

```typescript
// Force hint to always show on mobile (bypass canvasWidth check)
{typeof window !== 'undefined' && window.innerWidth < 600 && (
  <div className="mb-3 px-4 py-2 bg-[var(--color-surface-warm)] border border-border rounded text-sm text-text-primary">
    💡 Rotate device for best viewing experience
  </div>
)}
```

## Related Context

- Part of Task 5 from MOBILE_REPLAY_PLAN.md
- Original issue: Browser tool timeout (red herring - was actually port conflict)
- Port 3000 now working correctly
- Layout overflow fixed (Task 3 complete)
