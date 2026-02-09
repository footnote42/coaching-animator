# Handoff Prompt: Fix Animation Save Validation Error

## Quick Summary

Animations with tackle equipment (tackle-shield, tackle-bag) fail to save with 400 validation error, but users see false "success" toast. Two-part fix required: (1) update schema to include missing entity types, (2) fix error handling to distinguish client vs network errors.

## Implementation Plan

**Read first**: `specs/005-incremental-improvements/SCHEMA_VALIDATION_FIX_PLAN.md`

## Task Breakdown

### Task 1: Fix Schema Validation (5 mins)
**File**: `src/lib/schemas/animations.ts` (line 13)

Add missing entity types to `EntitySchema`:
- Add `'tackle-shield'` and `'tackle-bag'` to type enum
- Add `parentId: z.string().optional()` (for ball attachment)
- Add `orientation: z.enum(['up', 'down', 'left', 'right']).optional()` (for tackle-shield)

**Why**: Schema only allowed `['player', 'ball', 'cone', 'marker']` but app now supports tackle equipment (added in spec 004). This causes 400 errors on save.

### Task 2: Fix Error Handling (10 mins)
**File**: `src/components/SaveToCloudModal.tsx` (lines 103-148)

Fix the `handleSubmit` error handling to distinguish:
- **400-499 (client errors)**: Show error in modal, DO NOT queue offline
- **0, 500-599 (network/server errors)**: Queue offline, show success toast

**Current bug**: ALL errors get queued as "offline", causing false success messages.

**Replace lines 103-116** with logic that checks `result.status`:
```typescript
if (result.status >= 400 && result.status < 500) {
  setError('Invalid animation data. Please try again or contact support.');
  return;
}
```

### Task 3: Shared Constants (Optional, 15 mins)
**Files**:
- `src/types/index.ts` (after line 157)
- `src/lib/schemas/animations.ts` (line 1 import, line 13 usage)

Create `ENTITY_TYPES` constant and export from types, import into schema. This prevents future schema drift by making TypeScript types and Zod schemas share a single source of truth.

## Testing Checklist

After implementing:

1. ✅ **Save animation with tackle equipment**
   - Open `/app`, add tackle-shield and tackle-bag
   - Save to cloud (public visibility)
   - Verify: 201 response, appears in My Gallery AND Public Gallery

2. ✅ **Regression: Save animation without tackle equipment**
   - Create animation with only players/balls/cones
   - Save to cloud (private visibility)
   - Verify: Saves successfully, appears in My Gallery only

3. ✅ **Error handling: Simulate 400 error**
   - Temporarily revert schema fix
   - Try saving with tackle equipment
   - Verify: Modal shows error (NOT success toast)

4. ✅ **Error handling: Simulate network failure**
   - Browser DevTools → Network → "Offline"
   - Try saving
   - Verify: Success toast (queued offline as expected)

5. ✅ **Database verification**
   - Check Supabase `saved_animations` table
   - Verify new row exists with tackle entities in payload JSONB

6. ✅ **Replay viewer**
   - Navigate to `/replay/[id]`
   - Verify tackle equipment renders correctly

7. ✅ **Lint and TypeScript**
   ```bash
   npm run lint
   npx tsc --noEmit
   ```

## Context for Next Session

### What Happened

User reported animations not saving after file migration (commit 5215d9a). Investigation found:

1. **Schema drift**: Tackle equipment added in spec 004 but validation schema never updated
2. **False success**: 400 errors treated as "offline mode", showing success when save actually failed
3. **File migration didn't cause bug**: Just exposed existing schema staleness

### Key Files

- `src/lib/schemas/animations.ts` - Zod validation schemas
- `src/components/SaveToCloudModal.tsx` - Cloud save modal with offline queue
- `src/types/index.ts` - TypeScript type definitions
- `src/app/api/animations/route.ts` - POST endpoint (no changes needed)

### Root Cause Timeline

1. Spec 003 (Jan 30): Created schema with 4 entity types
2. Spec 004 (Feb 1): Added tackle equipment to types/rendering (6 entity types)
3. Schema never updated → validation mismatch
4. Commit 5215d9a (Feb 7): File migration exposed the bug

### Design Flaw Identified

`SaveToCloudModal` conflates client errors (400-499) with network errors (0, 500-599):
- **Client errors** = bugs, show error to user
- **Network errors** = transient, queue offline with success message

Current code treats both the same → false success on validation failures.

## Quick Start Command

```bash
# Read the full plan
cat specs/005-incremental-improvements/SCHEMA_VALIDATION_FIX_PLAN.md

# Start implementing
# 1. Edit src/lib/schemas/animations.ts (add tackle-shield, tackle-bag to type enum)
# 2. Edit src/components/SaveToCloudModal.tsx (fix error handling logic)
# 3. Test with tackle equipment entities
# 4. Run npm run lint && npx tsc --noEmit
```

## Expected Outcome

After fix:
- ✅ Animations with tackle equipment save successfully (201 response)
- ✅ False success toast eliminated (validation errors show error)
- ✅ Proper offline queueing (only for network/server errors)
- ✅ Schema stays in sync with types (if Part 3 implemented)

## Questions to Clarify

None - plan is complete and ready for execution.

## References

- Full plan: `specs/005-incremental-improvements/SCHEMA_VALIDATION_FIX_PLAN.md`
- Spec 004: `specs/004-post-launch-improvements/` (where tackle equipment was added)
- Commit 5215d9a: File migration that exposed the bug
