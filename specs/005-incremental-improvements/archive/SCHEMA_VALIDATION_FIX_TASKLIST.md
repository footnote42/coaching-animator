# Schema Validation Fix - Task List with Context Checkpoints

**Issue**: Animations with tackle equipment fail to save with 400 validation error
**Root Cause**: Schema drift + incorrect error handling conflating client/network errors
**Reference Docs**:
- `specs/005-incremental-improvements/SCHEMA_VALIDATION_FIX_PLAN.md`
- `specs/005-incremental-improvements/SCHEMA_VALIDATION_FIX_HANDOFF.md`

---

## Phase 1: Schema Validation Fix (Part 1)

### Task 1.1: Read Current Schema Implementation
**Action**: Read `src/lib/schemas/animations.ts` to understand current structure
**Context Check**: NONE (initial read)
**Estimated Tokens**: +5K

### Task 1.2: Update EntitySchema Type Enum
**File**: `src/lib/schemas/animations.ts` (line 13)
**Action**: Add missing entity types to the type enum
**Changes**:
```typescript
// FROM:
type: z.enum(['player', 'ball', 'cone', 'marker'])

// TO:
type: z.enum(['player', 'ball', 'cone', 'marker', 'tackle-shield', 'tackle-bag'])
```
**Estimated Tokens**: +2K

### Task 1.3: Add Optional Fields to EntitySchema
**File**: `src/lib/schemas/animations.ts` (lines 14-19)
**Action**: Add two optional fields for tackle equipment
**Changes**:
```typescript
// Add after existing fields:
parentId: z.string().optional(),  // For ball attachment
orientation: z.enum(['up', 'down', 'left', 'right']).optional(),  // For tackle-shield
```
**Rationale**: Backward compatible with existing animations
**Estimated Tokens**: +2K

### 🔍 CHECKPOINT A: Pre-Testing Assessment
**Trigger**: After completing Task 1.3
**Action**:
1. Check current token usage
2. If usage > 65K tokens (33% of budget), proceed to Phase 2
3. If usage > 130K tokens (65% of budget), STOP and generate handoff

**Decision Tree**:
- ✅ **< 65K tokens**: Continue to Phase 2
- ⚠️ **65K-130K tokens**: Continue to Phase 2, skip Phase 3 (optional refactor)
- 🛑 **> 130K tokens**: STOP, generate handoff (see Handoff Template below)

---

## Phase 2: Error Handling Fix (Part 2)

### Task 2.1: Read Current Error Handling Logic
**Action**: Read `src/components/SaveToCloudModal.tsx` (lines 103-148)
**Context Check**: Continue only if < 130K tokens
**Estimated Tokens**: +8K

### Task 2.2: Understand Current Bug
**Action**: Identify where 400 errors are incorrectly queued as "offline"
**Key Lines**:
- Line 105-114: Network/server error handling
- Line 120-139: Catch block also queues errors
**Problem**: 400 (client errors) fall through to offline queue
**Estimated Tokens**: +3K

### Task 2.3: Replace Error Handling Logic
**File**: `src/components/SaveToCloudModal.tsx` (lines 103-116)
**Action**: Add 400-499 check BEFORE network/server error check
**Changes**:
```typescript
if (!result.ok || !result.data) {
  // NEW: Client errors (400-499) - Show error, DO NOT queue
  if (result.status >= 400 && result.status < 500) {
    setError(
      result.status === 400
        ? 'Invalid animation data. Please try again or contact support.'
        : result.error || 'Failed to save animation'
    );
    return;
  }

  // EXISTING: Network/Server errors (0, 500-599) - Queue offline
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
**Estimated Tokens**: +5K

### 🔍 CHECKPOINT B: Pre-Verification Assessment
**Trigger**: After completing Task 2.3
**Action**:
1. Check current token usage
2. Run quick lint check: `npm run lint`
3. If usage > 130K tokens (65% of budget), STOP and generate handoff

**Decision Tree**:
- ✅ **< 100K tokens**: Continue to Phase 3 (optional refactor)
- ⚠️ **100K-130K tokens**: Skip Phase 3, jump to Phase 4 (testing)
- 🛑 **> 130K tokens**: STOP, generate handoff (see Handoff Template below)

---

## Phase 3: Shared Constants Refactor (OPTIONAL - Part 3)

⚠️ **SKIP THIS PHASE** if token usage > 100K at Checkpoint B

### Task 3.1: Create ENTITY_TYPES Constant
**File**: `src/types/index.ts` (after line 157)
**Action**: Export const array for schema reuse
**Changes**:
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
**Estimated Tokens**: +3K

### Task 3.2: Update Schema to Use Constant
**File**: `src/lib/schemas/animations.ts` (line 1, line 13)
**Action**: Import and use ENTITY_TYPES
**Changes**:
```typescript
// Line 1: Add import
import { ENTITY_TYPES } from '@/types';

// Line 13: Use shared constant
const EntitySchema = z.object({
  id: z.string(),
  type: z.enum(ENTITY_TYPES),  // ← Single source of truth
  // ... rest of schema
});
```
**Estimated Tokens**: +3K

### 🔍 CHECKPOINT C: Pre-Testing Assessment (Optional)
**Trigger**: After completing Task 3.2 (if Phase 3 executed)
**Action**:
1. Check current token usage
2. Run TypeScript check: `npx tsc --noEmit`
3. If usage > 130K tokens (65% of budget), STOP and generate handoff

**Decision Tree**:
- ✅ **< 120K tokens**: Continue to Phase 4 (testing)
- 🛑 **> 120K tokens**: STOP, generate handoff (see Handoff Template below)

---

## Phase 4: Testing & Verification

### Task 4.1: Restart Dev Server
**Action**: `npm run dev` in terminal
**Verify**: Server starts on port 3000 without errors
**Context Check**: Continue only if < 130K tokens
**Estimated Tokens**: +2K

### Task 4.2: Test Case 1 - Save Animation with Tackle Equipment
**Action**: Manual test in browser
**Steps**:
1. Navigate to `http://localhost:3000/app`
2. Add `tackle-shield` and `tackle-bag` entities
3. Click "Save to Cloud", set visibility to "public"
4. Open DevTools Network tab
5. Verify POST `/api/animations` returns **201**
6. Verify response body has `id`, `created_at`, `thumbnail_url`
7. Navigate to `/my-gallery` and verify animation appears
8. Navigate to `/gallery` and verify animation appears (public)

**Expected**: Success (201), animation visible in both galleries
**Estimated Tokens**: +4K (if recording results)

### Task 4.3: Test Case 2 - Regression Test (No Tackle Equipment)
**Action**: Manual test in browser
**Steps**:
1. Create animation with only players, balls, cones
2. Save to cloud with visibility "private"
3. Verify saves successfully
4. Verify appears in `/my-gallery` only (not public gallery)

**Expected**: Backward compatibility maintained
**Estimated Tokens**: +3K

### 🔍 CHECKPOINT D: Mid-Testing Assessment
**Trigger**: After completing Task 4.3
**Action**:
1. Check current token usage
2. If usage > 130K tokens (65% of budget), STOP and generate handoff
3. Document test results so far

**Decision Tree**:
- ✅ **< 120K tokens**: Continue to remaining tests
- 🛑 **> 120K tokens**: STOP, generate handoff with test results (see Handoff Template below)

### Task 4.4: Test Case 3 - Simulate Validation Error
**Action**: Test error handling fix
**Steps**:
1. Temporarily revert schema fix (comment out tackle-shield/tackle-bag)
2. Try to save animation with tackle equipment
3. Verify modal shows red error: "Invalid animation data..."
4. Verify NO success toast appears
5. Verify modal stays open
6. Restore schema fix

**Expected**: Error visible to user, no false success
**Estimated Tokens**: +4K

### Task 4.5: Test Case 4 - Simulate Network Error
**Action**: Test offline queue for network failures
**Steps**:
1. Open DevTools → Network tab → "Offline" mode
2. Try to save animation
3. Verify toast says "Animation saved to cloud!" (queued offline)
4. Turn network back online

**Expected**: Offline queue working correctly
**Estimated Tokens**: +3K

### Task 4.6: Database Verification (Supabase)
**Action**: Verify database row created
**Steps**:
1. Open Supabase Dashboard
2. Navigate to `saved_animations` table
3. Sort by `created_at DESC`
4. Find the newly created row
5. Verify `visibility` column is correct ('public' or 'private')
6. Verify `payload` JSONB contains tackle entities with type 'tackle-shield' or 'tackle-bag'

**Expected**: Database row with valid tackle equipment data
**Estimated Tokens**: +4K

### Task 4.7: Replay Viewer Test
**Action**: Test rendering of saved animation
**Steps**:
1. Navigate to `/replay/[id]` using the animation ID from Test Case 1
2. Verify tackle equipment renders correctly
3. Check browser console for errors

**Expected**: No errors, correct rendering
**Estimated Tokens**: +3K

### Task 4.8: Lint and TypeScript Check
**Action**: Run CI checks locally
**Commands**:
```bash
npm run lint
npx tsc --noEmit
```
**Expected**: 0 errors
**Estimated Tokens**: +2K

### 🔍 CHECKPOINT E: Pre-Documentation Assessment
**Trigger**: After completing Task 4.8
**Action**:
1. Check current token usage
2. If usage > 130K tokens (65% of budget), STOP and generate handoff
3. Summarize test results

**Decision Tree**:
- ✅ **< 140K tokens**: Continue to Phase 5 (documentation)
- 🛑 **> 140K tokens**: STOP, generate handoff with test summary (see Handoff Template below)

---

## Phase 5: Documentation & Commit

### Task 5.1: Update Progress Documentation
**File**: `specs/005-incremental-improvements/PROGRESS.md`
**Action**: Add entry for schema validation fix
**Changes**: Document completion of CRIT-001 fix (schema + error handling)
**Context Check**: Continue only if < 150K tokens
**Estimated Tokens**: +5K

### Task 5.2: Update CLAUDE.md (if needed)
**File**: `CLAUDE.md`
**Action**: Add note about schema validation fix in "Recent Changes" section
**Changes**: Brief entry with date, fix summary, reference to spec 005
**Estimated Tokens**: +3K

### Task 5.3: Stage Changes
**Action**: `git add` modified files
**Commands**:
```bash
git add src/lib/schemas/animations.ts
git add src/components/SaveToCloudModal.tsx
# If Part 3 completed:
git add src/types/index.ts
# Documentation:
git add specs/005-incremental-improvements/PROGRESS.md
git add CLAUDE.md
```
**Estimated Tokens**: +2K

### Task 5.4: Create Commit
**Action**: Commit with descriptive message
**Command**:
```bash
git commit -m "$(cat <<'EOF'
fix: resolve schema validation error for tackle equipment

Fix two-part issue preventing animations with tackle equipment from saving:

1. Schema Validation: Add tackle-shield and tackle-bag to EntitySchema
   - Include optional parentId and orientation fields
   - Maintains backward compatibility with existing animations

2. Error Handling: Distinguish client errors (400-499) from network errors
   - Client errors now show in modal (no false success toast)
   - Network/server errors (0, 500-599) still queue offline correctly

Fixes: CRIT-001 from spec 005-incremental-improvements
Closes: Issue #[number] (if applicable)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```
**Estimated Tokens**: +3K

### Task 5.5: Push to Remote
**Action**: Push changes to GitHub
**Command**: `git push origin main`
**Context Check**: Final check before push
**Estimated Tokens**: +1K

### 🔍 CHECKPOINT F: Final Assessment
**Trigger**: After completing Task 5.5
**Action**:
1. Verify final token usage
2. If all tasks completed successfully, mark as DONE
3. If any issues, document them for follow-up

---

## Handoff Template (Use if stopping at any checkpoint)

### When to Generate Handoff
Trigger handoff generation if token usage exceeds **130K tokens (65% of budget)** at any checkpoint.

### Handoff Document Structure

```markdown
# Schema Validation Fix - Session Handoff

**Generated At**: [Checkpoint Letter] - [Date/Time]
**Token Usage**: [Current]/200000 (XX%)
**Reason for Handoff**: Context approaching 66% capacity

## Work Completed

### ✅ Completed Tasks
[List all completed tasks from Phase 1-5]

### 🔄 In Progress
[Current task when handoff triggered]

### ⏭️ Not Started
[Remaining tasks from task list]

## Current State

### Files Modified
- `src/lib/schemas/animations.ts` - [Status: Modified/Not Modified]
- `src/components/SaveToCloudModal.tsx` - [Status: Modified/Not Modified]
- `src/types/index.ts` - [Status: Modified/Not Modified if Part 3]

### Git Status
```
[Output of git status]
```

### Test Results
[Summary of any tests completed so far]

## Next Steps for New Session

1. **Resume Point**: [Specific task number to resume from]
2. **Context Needed**:
   - Read: `specs/005-incremental-improvements/SCHEMA_VALIDATION_FIX_PLAN.md`
   - Read: This handoff document
   - Check: `git status` to see current state
3. **Immediate Actions**:
   - [List 2-3 specific next actions]

## Critical Context to Preserve

### Root Cause
- Schema drift: Tackle equipment added in spec 004 but schema never updated
- Error conflation: 400 (client errors) treated like 500 (network errors)

### Solution Summary
- **Part 1**: Add tackle-shield, tackle-bag to EntitySchema type enum
- **Part 2**: Add 400-499 check before offline queue logic
- **Part 3** (Optional): Refactor to shared ENTITY_TYPES constant

### Testing Requirements
[List which test cases remain to be executed]

## Questions/Issues Encountered
[Document any ambiguities or problems discovered during this session]

## Estimated Remaining Effort
[Time estimate for remaining work]

---

**Handoff Generated By**: Claude Sonnet 4.5
**Reference Task List**: `specs/005-incremental-improvements/SCHEMA_VALIDATION_FIX_TASKLIST.md`
```

---

## Token Budget Tracking

| Checkpoint | Cumulative Estimate | Budget % | Action |
|------------|-------------------|----------|--------|
| Start | 0K | 0% | Begin Phase 1 |
| A (Post-Schema Fix) | ~9K | 5% | Continue to Phase 2 |
| B (Post-Error Fix) | ~27K | 14% | Continue to Phase 3 or 4 |
| C (Post-Refactor) | ~33K | 17% | Continue to Phase 4 |
| D (Mid-Testing) | ~50K | 25% | Continue remaining tests |
| E (Post-Testing) | ~73K | 37% | Continue to Phase 5 |
| F (Final) | ~87K | 44% | Complete ✅ |

**Handoff Trigger**: If any checkpoint exceeds **130K tokens (65%)**, STOP immediately and generate handoff.

---

## Success Criteria

### Must Have (Required)
- ✅ Schema includes all 6 entity types (player, ball, cone, marker, tackle-shield, tackle-bag)
- ✅ Error handling distinguishes 400-499 from 500-599
- ✅ Test Case 1 passes: Animation with tackle equipment saves successfully (201)
- ✅ Test Case 3 passes: Validation errors show in modal (no false success)
- ✅ Lint and TypeScript checks pass
- ✅ Changes committed and pushed

### Nice to Have (Optional)
- ✅ Part 3 completed: Shared ENTITY_TYPES constant
- ✅ All test cases executed (1-7)
- ✅ Database verification completed
- ✅ Replay viewer test completed
- ✅ Documentation updated

---

## Reference Links

- **Full Plan**: `specs/005-incremental-improvements/SCHEMA_VALIDATION_FIX_PLAN.md`
- **Handoff Prompt**: `specs/005-incremental-improvements/SCHEMA_VALIDATION_FIX_HANDOFF.md`
- **Progress Tracking**: `specs/005-incremental-improvements/PROGRESS.md`
- **Entity Types**: `src/types/index.ts` (lines 151-157)
- **Schema File**: `src/lib/schemas/animations.ts`
- **Save Modal**: `src/components/SaveToCloudModal.tsx`
