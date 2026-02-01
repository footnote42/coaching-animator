# Debugging Session Persistence Issues

**Source**: Extracted from `HANDOFF_SESSION_ISSUE.md`
**Last Updated**: 2026-01-31
**Priority**: High
**Status**: Reference guide for troubleshooting

---

## Problem Statement

After successful login, users are redirected back to login when navigating to protected routes on first visit.

**Symptom**:
1. User logs in → redirects to `/app` ✅
2. User navigates to `/profile` → redirects back to `/login?redirect=/profile` ❌
3. User logs in again from that page → profile loads correctly ✅

**Key Observation**: The second login attempt works, suggesting the session IS valid but not immediately accessible on first navigation.

---

## Root Causes & Solutions

### ✅ Issues Already Fixed

#### 1. API 500 Errors (RESOLVED)
**Root Cause**: Legacy `api/` folder at project root contained old Pages Router handlers that conflicted with App Router `/app/api/` routes.
**Fix**: Deleted legacy `api/` folder, archived orphaned test file.

#### 2. AbortError Console Spam (RESOLVED)
**Root Cause**: Supabase SDK's internal `_acquireLock` threw during React Strict Mode double-mounting.
**Fix**: Configured Supabase browser client with `isSingleton: true` in `lib/supabase/client.ts`.

#### 3. Service Worker Interference (RESOLVED)
**Root Cause**: `navigationPreload: true` caused request cancellations.
**Fix**: Disabled `navigationPreload`, added `NetworkOnly` handler for `/api/*` routes.

---

## Current Investigation Areas

### 1. Supabase Dashboard (Check First)
- **Auth → Logs**: Look for token refresh failures or session validation errors
- **Auth → URL Configuration**: Verify Site URL = `https://coaching-animator.vercel.app`
- **Auth → Settings**: Check JWT expiry time, session handling

### 2. Cookie/Session Timing
The issue may be that cookies aren't being set/read fast enough:
- Check if `Set-Cookie` headers are being sent after login
- Verify cookie domain and path settings
- Check for SameSite/Secure attribute issues

### 3. Middleware Session Check
`middleware.ts` uses `updateSession` which may be invalidating the session:
- Check if middleware runs before cookies are fully set
- Consider adding delay or session validation bypass for fresh logins

### 4. Hydration Timing
React hydration may be completing before session is available:
- `UserContext` sets `loading=false` after 500ms timeout
- May need longer grace period or different approach

---

## Key Files

### Auth Context
- `lib/contexts/UserContext.tsx` - Main auth state management
- `lib/supabase/client.ts` - Browser Supabase client (singleton)
- `lib/supabase/server.ts` - Server Supabase client
- `lib/supabase/middleware.ts` - Middleware auth handling

### Pages
- `app/profile/page.tsx` - Has redirect logic
- `app/layout.tsx` - Wraps app in UserProvider
- `middleware.ts` - Protected route handling

### Config
- `.env.local` - Supabase URL and keys
- `next.config.js` - Serwist/CSP configuration

---

## Recent Code Changes

### UserContext.tsx Pattern (Recommended)

```typescript
// Set up listener FIRST
const { subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
  hasReceivedAuthState = true;
  setUser(session?.user ?? null);
  // ... load profile
  setLoading(false);
});

// Then check initial state
const initAuth = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user && !hasReceivedAuthState) {
    setUser(user);
    await loadProfile(user.id);
  }
  // Wait for onAuthStateChange or timeout (15s for mobile)
  setTimeout(() => {
    if (!hasReceivedAuthState) setLoading(false);
  }, 500);
};
```

### Profile Page Redirect Pattern (Recommended)

```typescript
useEffect(() => {
  if (!authLoading && !user) {
    const timer = setTimeout(() => {
      router.push('/login?redirect=/profile');
    }, 300);
    return () => clearTimeout(timer);
  }
}, [user, authLoading, router]);
```

**Critical Details**:
- Check `loading` state first (prevents false redirects)
- Add 300ms delay before redirecting (allows hydration to complete)
- Return cleanup function to clear timeout

---

## Debugging Checklist

### Step 1: Verify Supabase Connection
```typescript
// In browser console or test component
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);
```

### Step 2: Check Middleware is Running
```typescript
// In middleware.ts, add console log
const session = await supabase.auth.getUser();
console.log('[Middleware] Auth user:', session.data.user?.email);
```

### Step 3: Verify Cookies Are Set
```javascript
// In browser console
console.log('Cookies:', document.cookie);
// Should see sb-* cookies if logged in
```

### Step 4: Check UserContext Loading State
```typescript
// In a client component
const { user, loading } = useUser();
console.log('User context - loading:', loading, 'user:', user?.email);
```

### Step 5: Monitor Auth State Changes
```typescript
// In browser console
supabase.auth.onAuthStateChange((event, session) => {
  console.log('[Auth Event]', event, 'session:', session?.user?.email);
});
```

---

## Common Scenarios & Fixes

### Scenario A: Session Lost on Navigation
**Symptom**: User logged in but gets redirected to login on first navigation to protected route.

**Debug Steps**:
1. Check if middleware.ts is refreshing tokens
2. Verify UserContext timeout is sufficient (15s)
3. Check if browser client is singleton (no multiple instances)

**Fix**:
```typescript
// Increase UserContext timeout for slow networks
setTimeout(() => {
  if (!hasReceivedAuthState) setLoading(false);
}, 1000); // Increase from 500ms
```

### Scenario B: Inconsistent Auth State Across Tabs
**Symptom**: Logged in one tab, but logged out in another.

**Debug Steps**:
1. Check `onAuthStateChange` listener is active in all tabs
2. Verify cookies have correct domain (not tab-specific)

**Fix**: No fix needed - auth state automatically syncs via cookies and onAuthStateChange.

### Scenario C: Auth Fails on Refresh
**Symptom**: Page refreshes and user is logged out.

**Debug Steps**:
1. Check if middleware runs on refresh
2. Verify cookies persist (not cleared on refresh)

**Fix**: Ensure middleware.ts exists and includes cookie refresh logic.

---

## Email for Next Investigator

**Test Credentials**:
- **Email**: user@test.com
- **Password**: Password1!

**Tech Stack**:
- Next.js 14.2.29 (App Router)
- Supabase SSR (`@supabase/ssr`)
- Serwist (Service Worker)
- Vercel (deployment)

---

## Related Documentation

- **Auth Patterns**: `docs/architecture/auth-patterns.md`
- **CLAUDE.md**: `CLAUDE.md` - Development guidelines
- **Constitution**: `.specify/memory/constitution.md`
- **Supabase Docs**: [Supabase SSR](https://supabase.com/docs/guides/auth/server-side-rendering)
