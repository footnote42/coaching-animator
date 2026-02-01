# Profile Bugs Analysis & Fixes

**Date**: 2026-02-01
**Status**: ✅ **RESOLVED**

**Issues**:
1. ✅ Profile display name not persisting after save - **FIXED**
2. ✅ Animation count showing 0 or undefined - **FIXED**

---

## Investigation Summary

### Root Causes Found

#### Issue #1: Display Name Not Persisting ❌
- **Status**: Database has correct value, client-side issue
- **Evidence**: Direct database query shows `display_name: "Test Coach 1769958794880"` is correctly saved
- **Conclusion**: The PUT API works correctly, the GET API likely returns the data, but the client-side isn't displaying it after page reload

**Possible causes**:
- UserContext not triggering re-render after profile load
- GET API response not including display_name field
- Browser caching the page state
- Race condition in auth initialization

#### Issue #2: Animation Count & Max Animations ❌
- **Status**: Missing database column!
- **Evidence**:
  - `animation_count` exists and works correctly (value: 4, matches actual count)
  - `max_animations` column **does not exist** in `user_profiles` table
  - Database trigger for `animation_count` is working correctly

**Root cause**: The initial migration (`20260131130000_online_platform.sql`) did not include the `max_animations` column, but the application code expects it.

---

## Detailed Findings

### Database State (Direct Query Results)

```json
{
  "id": "d045f90e-18b4-411d-b103-bae420da6e4e",
  "display_name": "Test Coach 1769958794880",
  "animation_count": 4,
  "role": "user",
  "banned_at": null,
  "ban_reason": null,
  "created_at": "2026-01-30T18:52:43.376354+00:00",
  "updated_at": "2026-02-01T15:13:15.995+00:00"
  // NOTE: max_animations is MISSING
}
```

**Actual animations count in database**: 4 (matches `animation_count`)

### API Behavior

**PUT /api/user/profile**:
- ✅ Successfully updates `display_name`
- ✅ Returns 200 OK
- ✅ Response includes updated `display_name` and `updated_at`

**GET /api/user/profile**:
- ⚠️ Need to verify if `max_animations` is being selected
- ⚠️ Need to verify response includes `display_name`

### Test Results

**E2E Test: "should update display name and persist after refresh"**
- ✅ Save operation succeeds (success toast appears)
- ✅ PUT request returns 200 OK
- ❌ After page reload, input shows empty value `""`
- **Expected**: `"Test Coach 1769958794880"`
- **Actual**: `""`

---

## Fixes Required

### Fix #1: Add `max_animations` Column to Database

**Priority**: HIGH (blocks profile page from displaying correctly)

**Migration SQL**:

```sql
-- File: supabase/migrations/20260201000000_add_max_animations.sql

-- Add max_animations column with default value of 50
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS max_animations INTEGER DEFAULT 50 NOT NULL;

-- Update existing rows to have the default value
UPDATE user_profiles
SET max_animations = 50
WHERE max_animations IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.max_animations IS 'Maximum number of animations a user can save (quota limit)';
```

**To apply**:

1. **Option A: Supabase Dashboard** (Recommended)
   - Go to https://supabase.com/dashboard
   - Navigate to your project → SQL Editor
   - Paste the migration SQL above
   - Click "Run"

2. **Option B: Local Script** (Requires DATABASE_URL)
   - Add `DATABASE_URL` to `.env.local`:
     ```
     DATABASE_URL=postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres
     ```
   - Install postgres package: `npm install postgres`
   - Run: `npx tsx scripts/add-max-animations.ts`

3. **Option C: Supabase CLI** (If you have local Supabase setup)
   - Run: `npx supabase db push`

---

### Fix #2: Investigate Display Name Client-Side Issue

**Priority**: HIGH

**Hypothesis**: The GET endpoint is returning the display_name, but the client-side isn't updating the UI correctly after page reload.

**Investigation steps**:

1. ✅ **DONE**: Added detailed logging to API routes
   - `app/api/user/profile/route.ts` now logs GET/PUT requests and responses
   - `lib/contexts/UserContext.tsx` logs profile loading
   - `app/profile/page.tsx` logs save flow and useEffect updates

2. ⏳ **TODO**: Check browser console logs during page reload
   - Look for `[Profile API] GET returning profile:` log
   - Verify if `display_name` is in the response
   - Check if `[UserContext] Profile loaded from Supabase:` shows correct data
   - Verify `[Profile] profile.display_name changed:` useEffect log

3. ⏳ **TODO**: Verify GET endpoint includes all fields
   - Check `app/api/user/profile/route.ts` line 18
   - Ensure SELECT includes: `id, display_name, animation_count, role, created_at, max_animations`
   - Ensure response JSON includes all fields

4. ⏳ **TODO**: Check UserContext profile state updates
   - Verify `setProfile()` creates new object reference (force React re-render)
   - Ensure `refreshProfile()` awaits `loadProfile()` completion
   - Check if AbortError handling is silently returning without setting profile

**Potential fixes**:

- **If GET doesn't return display_name**: Update SELECT query in `app/api/user/profile/route.ts`
- **If React doesn't re-render**: Force new object reference in `setProfile({ ...data })`
- **If timing issue**: Add small delay before showing success toast to ensure state propagates
- **If caching**: Add `Cache-Control: no-cache` header to GET response

---

## Testing Plan

### Manual Testing (After applying Fix #1)

1. **Start dev server**: `npm run dev`
2. **Navigate to**: http://localhost:3002/profile
3. **Login as**: user@test.com / Password1!
4. **Test display name**:
   - Enter new display name
   - Click "Save Changes"
   - Verify success toast appears
   - Refresh page (Ctrl+R or F5)
   - ✅ **Expected**: Display name persists
   - Open browser DevTools → Console
   - Check logs for `[Profile API] GET returning profile:`
   - Verify `display_name` is in the response

5. **Test animation count**:
   - Check "X / 50 animations" text
   - ✅ **Expected**: Shows actual count (e.g., "4 / 50")
   - ✅ **Expected**: Progress bar has correct width

### Automated Testing

Run E2E tests:

```bash
# Test display name persistence
npx playwright test tests/e2e/profile.spec.ts --grep "should update display name" --project=chromium

# Test animation count
npx playwright test tests/e2e/profile.spec.ts --grep "should display accurate animation count" --project=chromium

# Run all profile tests
npx playwright test tests/e2e/profile.spec.ts --project=chromium
```

---

## Resolution

### ✅ Both Issues Fixed (2026-02-01)

**Root Cause**: Missing `max_animations` column in `user_profiles` table

**What Happened**:
- The GET endpoint tried to SELECT `max_animations` column that didn't exist
- This caused the entire profile query to fail silently
- Without profile data, the display name couldn't be shown
- Without `max_animations`, the quota display was incomplete

**Fix Applied**:
```sql
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS max_animations INTEGER DEFAULT 50 NOT NULL;

UPDATE user_profiles
SET max_animations = 50
WHERE max_animations IS NULL;
```

**Verification**:
- ✅ E2E test "should update display name and persist after refresh" - **PASSED**
- ✅ E2E test "should display profile page with user information" - **PASSED**
- ✅ Manual testing confirmed both issues resolved

---

## Next Steps

1. ✅ **Apply Fix #1**: Add `max_animations` column to database - **DONE**
2. ✅ **Test manually**: Verify animation count shows correctly - **DONE**
3. ✅ **Debug Fix #2**: Check browser console logs to identify display name issue - **DONE**
4. ✅ **Apply Fix #2**: Same fix resolved both issues - **DONE**
5. ✅ **Re-run E2E tests**: Verify both issues are resolved - **DONE**
6. ⏳ **Clean up**: Remove debug logging from production code (optional, can keep for monitoring)

---

## Debug Logs Added

### Files Modified

All changes include detailed console.log statements:

1. **`app/profile/page.tsx`**:
   - Logs display name being saved
   - Logs API response status
   - Logs refreshProfile() flow
   - Logs useEffect when profile.display_name changes

2. **`lib/contexts/UserContext.tsx`**:
   - Logs profile data loaded from Supabase
   - Logs refreshProfile() calls
   - Logs profile state updates

3. **`app/api/user/profile/route.ts`**:
   - Logs GET requests with user ID
   - Logs full GET response JSON
   - Logs PUT request body
   - Logs PUT database updates

### How to Use Logs

1. Open browser DevTools (F12)
2. Go to Console tab
3. Filter for: `[Profile]`, `[UserContext]`, or `[Profile API]`
4. Perform actions (save, refresh page)
5. Check log sequence to identify where data flow breaks

---

## Scripts Created

### Database Diagnostic

**Check current profile data**:
```bash
npx tsx scripts/check-profile-db.ts
```

**Output**:
- Current user_profiles row
- animation_count vs actual count comparison
- Identifies missing columns

### Migration Script

**Add max_animations column**:
```bash
npx tsx scripts/add-max-animations.ts
```

**Requires**:
- DATABASE_URL in .env.local
- `npm install postgres`

---

## Additional Resources

- **Database Schema**: `docs/architecture/database-schema.md`
- **API Contracts**: `docs/architecture/api-contracts.md`
- **Session Persistence**: `docs/troubleshooting/session-persistence.md`
- **Test Helpers**: `tests/e2e/helpers.ts`
- **Profile E2E Tests**: `tests/e2e/profile.spec.ts`
