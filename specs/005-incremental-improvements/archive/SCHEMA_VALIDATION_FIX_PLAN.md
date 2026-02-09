# Fix Animation Save Validation Error

**Issue ID**: Schema Validation Bug (discovered 2026-02-08)
**Priority**: 🔴 Critical
**Status**: Plan Complete, Ready for Implementation

## Context

After the recent file migration (commit 5215d9a), users report animations are not saving to their playbook or appearing in the public gallery. Investigation reveals:

**Root Cause**: Schema validation mismatch causing 400 Bad Request errors, combined with incorrect offline queueing logic.

### Problem 1: Missing Entity Types in Schema

The `EntitySchema` in `src/lib/schemas/animations.ts` (line 13) only allows:
```typescript
type: z.enum(['player', 'ball', 'cone', 'marker'])
```

But the application now supports tackle equipment added in spec 004:
```typescript
// src/types/index.ts (lines 151-157)
export type EntityType =
  | 'player' | 'ball' | 'cone' | 'marker'
  | 'tackle-shield'  // ← Missing from schema
  | 'tackle-bag';    // ← Missing from schema
```

### Problem 2: False Success Toast on Validation Errors

When POST `/api/animations` returns 400 (validation error), `SaveToCloudModal.tsx` incorrectly:
1. Queues the request as "offline" (lines 105-114)
2. Shows success toast: "Animation saved to cloud!"
3. No database row is created
4. User believes save succeeded

**Design Flaw**: 400 errors (client bugs) should NOT be treated like network failures (503, timeout). Current logic conflates the two:
```typescript
// SaveToCloudModal.tsx line 105-114
if (result.status === 0 || result.status >= 500) {
  const offlineId = offlineQueue.addItem(...);
  onSuccess(offlineId);  // ← Shows success toast for validation errors!
  return;
}
```

This allows validation errors (400) to fall through to the catch block (line 121), which also queues offline.

## Solution

Two-part fix addressing both schema drift and error handling:

### Part 1: Fix Schema Validation (src/lib/schemas/animations.ts)

**File**: `src/lib/schemas/animations.ts` (lines 11-19)

```typescript
// BEFORE (missing tackle equipment):
const EntitySchema = z.object({
  id: z.string(),
  type: z.enum(['player', 'ball', 'cone', 'marker']),
  team: z.enum(['attack', 'defense', 'neutral']),
  x: z.number(),
  y: z.number(),
  color: z.string().optional(),
  label: z.string().optional(),
});

// AFTER (include all entity types):
const EntitySchema = z.object({
  id: z.string(),
  type: z.enum(['player', 'ball', 'cone', 'marker', 'tackle-shield', 'tackle-bag']),
  team: z.enum(['attack', 'defense', 'neutral']),
  x: z.number(),
  y: z.number(),
  color: z.string().optional(),
  label: z.string().optional(),
  parentId: z.string().optional(),  // For ball attached to player
  orientation: z.enum(['up', 'down', 'left', 'right']).optional(),  // For tackle-shield
});
```

**Rationale**:
- Matches TypeScript `EntityType` in `src/types/index.ts` (lines 151-157)
- `orientation` is optional because tackle equipment can be created without it (see `Editor.tsx` lines 242-262)
- `parentId` is optional because only ball entities use it
- Backward compatible: old animations without these fields still validate

### Part 2: Fix False Success Toast (src/components/SaveToCloudModal.tsx)

**File**: `src/components/SaveToCloudModal.tsx` (lines 103-148)

**Current Logic** (BROKEN):
```typescript
// Line 103-116: Only checks for network/server errors
if (!result.ok || !result.data) {
  if (result.status === 0 || result.status >= 500) {
    // Queue offline
    const offlineId = offlineQueue.addItem(...);
    onSuccess(offlineId);  // Shows success toast
    return;
  }
  throw new Error(result.error || 'Failed to save animation');
}

// Line 120-139: Catch block ALSO queues 400 errors offline
catch (err) {
  if (err instanceof Error && (err.message.includes('Network') || err.message.includes('fetch'))) {
    const offlineId = offlineQueue.addItem(...);
    onSuccess(offlineId);  // ← 400 errors fall through here!
    return;
  }
  setError(getFriendlyErrorMessage(err));
}
```

**Fixed Logic** (distinguish client vs network errors):
```typescript
// Line 103: Check result
if (!result.ok || !result.data) {
  // Client errors (400-499): Show error, DO NOT queue
  if (result.status >= 400 && result.status < 500) {
    setError(
      result.status === 400
        ? 'Invalid animation data. Please try again or contact support.'
        : result.error || 'Failed to save animation'
    );
    return;
  }

  // Network/Server errors (0, 500-599): Queue offline
  if (result.status === 0 || result.status >= 500) {
    const offlineId = offlineQueue.addItem({
      type: 'create',
      endpoint: '/api/animations',
      method: 'POST',
      payload: requestBody
    });
    onSuccess(offlineId);
    return;
  }

  throw new Error(result.error || 'Failed to save animation');
}
```

**Why This Matters**:
- **400 Bad Request** = client bug (schema mismatch, invalid data) → show error
- **401/403** = auth issue → show error
- **500/503** = server problem → queue offline, show success
- **Network timeout** = connectivity issue → queue offline, show success

### Part 3: Prevent Future Schema Drift (src/types/index.ts + src/lib/schemas/animations.ts)

**Optional but Recommended**: Create single source of truth for entity types.

**File**: `src/types/index.ts` (add after line 157)

```typescript
// Export as const array for schema reuse
export const ENTITY_TYPES = [
  'player',
  'ball',
  'cone',
  'marker',
  'tackle-shield',
  'tackle-bag',
] as const;

export type EntityType = typeof ENTITY_TYPES[number];
```

**File**: `src/lib/schemas/animations.ts` (line 1, add import)

```typescript
import { ENTITY_TYPES } from '@/types';

// Line 13: Use shared constant
const EntitySchema = z.object({
  id: z.string(),
  type: z.enum(ENTITY_TYPES),  // ← Single source of truth
  // ... rest of schema
});
```

**Benefits**:
- Schema automatically stays in sync with TypeScript types
- Adding new entity types (e.g., `'rugby-post'`) only requires one change
- Compile-time error if schema is out of sync

## Verification Steps

### 1. Apply Fixes
- Update `src/lib/schemas/animations.ts` (Part 1)
- Update `src/components/SaveToCloudModal.tsx` (Part 2)
- Optionally: Refactor to shared constants (Part 3)

### 2. Restart Dev Server
```bash
npm run dev
```

### 3. Test Validation Fix (Part 1)
**Test Case 1**: Animation with tackle equipment
- Open `/app` (animation editor)
- Add `tackle-shield` and `tackle-bag` entities
- Click "Save to Cloud", set visibility to "public"
- **Expected**: Network tab shows POST `/api/animations` returns **201** (success)
- **Expected**: Response body: `{ id: "...", created_at: "...", thumbnail_url: "..." }`
- **Expected**: Toast: "Animation saved to cloud!"
- **Expected**: Animation appears in `/my-gallery` immediately
- **Expected**: Animation appears in `/gallery` (public gallery)

**Test Case 2**: Animation without tackle equipment (regression test)
- Create animation with only players, balls, cones
- Save to cloud with visibility "private"
- **Expected**: Saves successfully, appears in `/my-gallery` only

### 4. Test Error Handling Fix (Part 2)

**Test Case 3**: Simulate validation error (before full fix)
- Temporarily revert Part 1 schema fix
- Try to save animation with tackle equipment
- **Expected Before Fix**: Toast says "saved" but nothing appears in gallery
- **Expected After Part 2 Fix**: Modal shows red error: "Invalid animation data. Please try again or contact support."
- **Expected**: NO toast notification
- **Expected**: Modal stays open (not closed)

**Test Case 4**: Simulate network error
- Use browser DevTools → Network tab → "Offline" mode
- Try to save animation
- **Expected**: Toast says "Animation saved to cloud!" (queued offline)
- **Expected**: Animation appears in gallery with "Pending upload" badge (if offline queue UI exists)

**Test Case 5**: Simulate server error
- Temporarily modify API to return 500
- Try to save animation
- **Expected**: Toast says "Animation saved to cloud!" (queued offline)
- **Expected**: No red error in modal

### 5. Database Verification (Supabase Dashboard)
- Navigate to `saved_animations` table
- Find the newly created row (sort by `created_at DESC`)
- **Expected**: `visibility` column shows correct value ('public' or 'private')
- **Expected**: `payload` JSONB contains tackle entities:
  ```json
  {
    "frames": [{
      "entities": {
        "some-id": {
          "type": "tackle-shield",  // ← Present in JSONB
          "x": 400,
          "y": 300,
          "team": "neutral",
          "color": "#...",
          "label": ""
        }
      }
    }]
  }
  ```

### 6. Replay Viewer Test
- Navigate to `/replay/[id]` for the newly saved animation
- **Expected**: Tackle equipment renders correctly
- **Expected**: No console errors about unknown entity types

### 7. Lint & TypeScript Check
```bash
npm run lint
npx tsc --noEmit
```
**Expected**: 0 errors

## Root Cause Analysis

### Timeline of Issues

1. **Spec 003** (2026-01-30): Online platform implemented
   - Created `src/lib/schemas/animations.ts` with validation
   - Entity types: `['player', 'ball', 'cone', 'marker']`

2. **Spec 004** (2026-02-01): Post-launch improvements
   - Added tackle equipment to TypeScript types (`src/types/index.ts`)
   - Added rendering logic (`PlayerToken.tsx`, `EntityColors.ts`)
   - Added creation handlers (`Editor.tsx`)
   - **MISSED**: Updating validation schema

3. **Commit 5215d9a** (2026-02-07): File migration
   - Moved files to `src/` directory
   - Did NOT cause the bug (schema was already stale)
   - Exposed the bug when users started saving animations with tackle equipment

### Why It Went Unnoticed

1. **False Success Toast**: Users saw "saved!" but animations didn't appear
2. **No Error Logs**: 400 responses were silently queued offline
3. **Test Gap**: No E2E test for "save animation with all entity types"
4. **Manual Testing**: May have focused on basic entities (players, balls)

### Design Flaw

The offline queue logic treats **all** non-200 responses as "network failures":
- 400 (validation error) → queued as "offline" → false success
- 500 (server error) → queued as "offline" → correct behavior
- 0 (network timeout) → queued as "offline" → correct behavior

**Fix**: Only queue 0 (network) and 5xx (server) errors. Show errors for 4xx (client bugs).

## Prevention Strategies

### 1. Single Source of Truth (Part 3 of Solution)
- Define `ENTITY_TYPES` constant once
- Import into both TypeScript types AND Zod schemas
- Compiler enforces sync at build time

### 2. E2E Test Coverage (Recommended Addition)
**File**: `tests/e2e/save-all-entity-types.spec.ts`

```typescript
test('Save animation with all entity types', async ({ page }) => {
  await page.goto('/app');
  // Add player, ball, cone, marker, tackle-shield, tackle-bag
  // Click "Save to Cloud"
  // Verify 201 response
  // Navigate to /my-gallery
  // Verify animation appears in list
});
```

### 3. Better Error Visibility
- Part 2 fix distinguishes client vs network errors
- Validation errors now show in modal (not hidden as "success")
- Consider logging validation errors to console for debugging

### 4. Schema Validation in Dev
- Add pre-commit hook that checks schema/type parity
- Or: Add unit test that validates `ENTITY_TYPES` matches schema enum

### 5. Offline Queue Audit (Future Work)
- Review what's currently queued in `localStorage`
- Add UI to view/retry/clear offline queue
- Consider expiring old queued items (>7 days)

## Files to Modify

1. **`src/lib/schemas/animations.ts`** (lines 11-19) - Add missing entity types
2. **`src/components/SaveToCloudModal.tsx`** (lines 103-148) - Fix error handling
3. **`src/types/index.ts`** (optional, after line 157) - Add ENTITY_TYPES constant

## Estimated Effort

- **Part 1** (Schema fix): 5 minutes
- **Part 2** (Error handling): 10 minutes
- **Part 3** (Shared constants): 15 minutes
- **Testing**: 20 minutes
- **Total**: ~50 minutes

## Related Issues

- Spec 003: Online platform (where schema was created)
- Spec 004: Post-launch improvements (where tackle equipment was added)
- Commit 5215d9a: File migration (exposed the bug)
