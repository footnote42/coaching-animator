# Task 2 Handoff: Integrate useCanvasSize Hook into ReplayViewer

**Date**: 2026-02-07
**Spec**: Mobile Replay Optimization (specs/005-incremental-improvements/MOBILE_REPLAY_PLAN.md)
**Previous Task**: Task 1 ✅ Complete
**Current Task**: Task 2 - Update ReplayViewer to Import Hook
**Estimated Time**: 15-20 minutes

---

## Context from Task 1

✅ **Completed**: `useCanvasSize` hook has been created and verified.

**What was delivered**:
- **File**: `src/hooks/useCanvasSize.ts` (76 lines)
  - Responsive canvas sizing with 4:3 aspect ratio preservation
  - RAF-based resize debouncing for iOS Safari compatibility
  - SSR-safe initial state (defaults to 800×600)
  - Negative width prevention (280px minimum)
  - Export added to `src/hooks/index.ts`
- **Verification**: TypeScript ✅ | ESLint ✅

**Hook Signature**:
```typescript
export function useCanvasSize(
  maxWidth: number = 800,
  aspectRatio: number = 4 / 3,
  minWidth: number = 280
): CanvasSize // { width: number, height: number }
```

---

## Task 2 Objective

Integrate the `useCanvasSize` hook into `ReplayViewer.tsx` by replacing hardcoded canvas constants.

**Success Criteria**:
- Remove `CANVAS_WIDTH` and `CANVAS_HEIGHT` constants
- Import and use `useCanvasSize` hook
- Pass dynamic dimensions to Stage component
- No TypeScript errors
- Browser console clean (no warnings/errors)

---

## Implementation Steps

### Step 1: Locate the Target File

**File**: `src/components/replay/ReplayViewer.tsx`

**Current State** (lines 119-120):
```typescript
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
```

These constants are used throughout the component:
- Line 168: `<Stage width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>`
- Line 192: Entity interpolation calculations
- Line 149: PlaybackPosition state

### Step 2: Add Import Statement

**Location**: Top of file (after existing imports)

**Add this import**:
```typescript
import { useCanvasSize } from '@/hooks/useCanvasSize';
```

**Note**: The `@/hooks/` path alias is already configured in `tsconfig.json` and works correctly.

### Step 3: Replace Constants with Hook

**Location**: Inside `ReplayViewer` function component (around line 119)

**Remove**:
```typescript
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
```

**Replace with**:
```typescript
const { width: canvasWidth, height: canvasHeight } = useCanvasSize(800, 4/3);
```

**Rationale**:
- `maxWidth: 800` - Maintains desktop behavior (800px max)
- `aspectRatio: 4/3` - Preserves pitch proportions (800÷600 = 1.333...)
- `minWidth: 280` - Uses default (no need to specify)

### Step 4: Update Variable References

**Find and replace** throughout the component:
- `CANVAS_WIDTH` → `canvasWidth`
- `CANVAS_HEIGHT` → `canvasHeight`

**Affected lines** (approximate - verify in actual file):
- Line 168: Stage component width/height props
- Any calculations using the canvas dimensions

**Example change**:
```typescript
// Before:
<Stage width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>

// After:
<Stage width={canvasWidth} height={canvasHeight}>
```

---

## Critical Files Reference

### Primary File to Edit
- **`src/components/replay/ReplayViewer.tsx`** (357 lines)
  - Location: `c:\Coding Projects\coaching-animator\src\components\replay\ReplayViewer.tsx`
  - Current constants: lines 119-120
  - Stage component: line 168
  - Function: `ReplayViewer` (exported default)

### Related Files (Read-Only - For Context)
- **`src/hooks/useCanvasSize.ts`** - The hook you're integrating
- **`src/components/Canvas/Stage.tsx`** - Accepts width/height props
- **`specs/005-incremental-improvements/MOBILE_REPLAY_PLAN.md`** - Full spec (lines 142-157 cover Task 2)

---

## Verification Checklist

### 1. TypeScript Compilation
```bash
npx tsc --noEmit
```
**Expected**: Exit code 0, no type errors

### 2. ESLint Check
```bash
npm run lint
```
**Expected**: Exit code 0, no warnings

### 3. Dev Server Test
```bash
npm run dev
```
**Expected**:
- Server starts without errors
- Navigate to `/replay/[any-test-id]`
- Browser console: No errors or warnings
- Canvas renders correctly

### 4. Visual Inspection

**Desktop (1920px viewport)**:
- Canvas should be ≤800px wide
- Verify with DevTools: `document.querySelector('canvas').width`
- Expected: ~800

**Mobile (375px viewport)**:
- Canvas should fit viewport (no horizontal scroll)
- Verify: `document.body.scrollWidth === document.body.clientWidth`
- Expected: `true`

---

## Expected File Changes

| File | Change Type | Lines Changed |
|------|-------------|---------------|
| `src/components/replay/ReplayViewer.tsx` | MODIFY | ~5 lines |

**Diff Preview**:
```diff
+ import { useCanvasSize } from '@/hooks/useCanvasSize';

  export default function ReplayViewer({ id }: ReplayViewerProps) {
-   const CANVAS_WIDTH = 800;
-   const CANVAS_HEIGHT = 600;
+   const { width: canvasWidth, height: canvasHeight } = useCanvasSize(800, 4/3);

    // ... rest of component

-   <Stage width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
+   <Stage width={canvasWidth} height={canvasHeight}>
```

---

## Common Pitfalls to Avoid

### ❌ Don't Do This:
```typescript
// Wrong: Using destructured names that don't match
const { width, height } = useCanvasSize();
// This creates variables named "width" and "height" which might conflict
```

### ✅ Do This Instead:
```typescript
// Correct: Rename to match existing variable names
const { width: canvasWidth, height: canvasHeight } = useCanvasSize(800, 4/3);
```

### ❌ Don't Forget:
- Update ALL references to `CANVAS_WIDTH` and `CANVAS_HEIGHT`
- Don't leave the old constants defined (causes confusion)
- Don't modify the hook parameters unless you understand the aspect ratio impact

---

## Integration Points

### Where Canvas Dimensions Are Used

1. **Stage Component** (line 168):
   ```typescript
   <Stage width={canvasWidth} height={canvasHeight}>
   ```

2. **ReplayCanvas Props** (if passed as props):
   - Check if `ReplayCanvas` component receives width/height
   - Update prop passing if necessary

3. **Entity Calculations** (verify no hardcoded 800/600):
   - Entity positions are typically normalized (0-1 range)
   - Canvas dimensions should only be used for Stage sizing
   - No changes needed to entity rendering logic

---

## Next Steps After Task 2

Once Task 2 is complete and verified:

- **Task 3**: Update canvas container styling for responsiveness
  - Modify outer container classes
  - Add `max-w-[800px] mx-auto px-4`
  - Remove fixed `aspect-[4/3]` class

- **Task 4**: Manual mobile testing
  - Chrome DevTools → Device Mode → iPhone SE (375×667)
  - Verify no horizontal scrollbar
  - Verify canvas fits viewport

---

## Reference Documentation

### Key Files Locations
```
c:\Coding Projects\coaching-animator\
├── src/
│   ├── hooks/
│   │   ├── useCanvasSize.ts          ← Task 1 output (ready to use)
│   │   └── index.ts                   ← Export added
│   └── components/
│       └── replay/
│           └── ReplayViewer.tsx       ← Task 2 target file
└── specs/005-incremental-improvements/
    ├── MOBILE_REPLAY_PLAN.md          ← Full specification
    ├── TASKS.md                       ← Task checklist
    └── PROGRESS.md                    ← Progress tracking
```

### Useful Commands
```bash
# Type safety
npx tsc --noEmit

# Linting
npm run lint

# Dev server
npm run dev

# Find all usages of CANVAS_WIDTH/HEIGHT
npx grep -r "CANVAS_WIDTH\|CANVAS_HEIGHT" src/components/replay/
```

---

## Success Criteria Recap

Before marking Task 2 complete, ensure:

- [x] Import statement added: `import { useCanvasSize } from '@/hooks/useCanvasSize';`
- [x] Hook called: `const { width: canvasWidth, height: canvasHeight } = useCanvasSize(800, 4/3);`
- [x] Constants removed: `CANVAS_WIDTH` and `CANVAS_HEIGHT` deleted
- [x] All references updated to use `canvasWidth` and `canvasHeight`
- [x] TypeScript compilation passes: `npx tsc --noEmit`
- [x] ESLint passes: `npm run lint`
- [x] Dev server runs without errors
- [x] Browser console clean (no warnings/errors)

---

## Context for AI Agent

**Project**: Coaching Animator (sports coaching animation tool)
**Tech Stack**: Next.js 14 App Router, TypeScript, React 18, React-Konva, Zustand
**Current Issue**: Mobile viewport horizontal overflow (HIGH-006)
**Approach**: Incremental tasks (18 total), currently on Task 2 of 18

**Task 1 Achievement**:
- Created responsive canvas sizing hook
- Verified working with TypeScript and ESLint
- Ready for integration

**Your Mission**:
- Integrate the hook into ReplayViewer
- Replace hardcoded 800×600 constants
- Verify no regressions
- Takes ~15-20 minutes

**No Planning Needed**: Implementation steps are clearly defined above. Execute directly.

---

## Questions? Check These First

**Q: Where is the ReplayViewer component?**
A: `src/components/replay/ReplayViewer.tsx` (moved from `app/replay/[id]/` in Session 2026-02-06)

**Q: What if TypeScript complains about the import?**
A: Ensure `@/hooks/` path alias is in `tsconfig.json` (it already is)

**Q: Should I modify the hook parameters?**
A: No, use defaults: `useCanvasSize(800, 4/3)` maintains current behavior

**Q: What about the canvas container div?**
A: That's Task 3. For Task 2, only change the constants → hook + variable renaming.

**Q: Do I need to update tests?**
A: Not for Task 2. Unit tests are Task 11, E2E tests are Task 12.

---

**Good luck! This is a straightforward integration task. Follow the steps, verify thoroughly, and you'll be done in 15-20 minutes.** 🚀
