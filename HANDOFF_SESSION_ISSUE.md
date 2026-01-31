# 🔄 Handoff: Session Persistence Issue

## Status
**Date:** 2026-01-31
**Priority:** High
**Blocker:** Profile page redirects to login on first visit after authentication

---

## ✅ Issues Already Fixed

### 1. API 500 Errors (RESOLVED)
**Root Cause:** Legacy `api/` folder at project root contained old Pages Router handlers that conflicted with App Router `/app/api/` routes.
**Fix:** Deleted legacy `api/` folder, archived orphaned test file.

### 2. AbortError Console Spam (RESOLVED)
**Root Cause:** Supabase SDK's internal `_acquireLock` threw during React Strict Mode double-mounting.
**Fix:** Configured Supabase browser client with `isSingleton: true` in `lib/supabase/client.ts`.

### 3. Service Worker Interference (RESOLVED)
**Root Cause:** `navigationPreload: true` caused request cancellations.
**Fix:** Disabled `navigationPreload`, added `NetworkOnly` handler for `/api/*` routes.

---

## ⚠️ Current Issue: Session Not Persisting

### Symptom
After successful login:
1. User logs in → redirects to `/app` ✅
2. User navigates to `/profile` → redirects back to `/login?redirect=/profile` ❌
3. User logs in again from that page → profile loads correctly ✅

### Key Observation
The second login attempt works, suggesting the session IS valid but not immediately accessible on first navigation.

### Error Pattern
```
UserContext: loading=false, user=null → triggers redirect
But onAuthStateChange eventually fires with valid user
```

---

## Key Files

### Auth Context
- `lib/contexts/UserContext.tsx` - Main auth state management
- `lib/supabase/client.ts` - Browser Supabase client (singleton)
- `lib/supabase/server.ts` - Server Supabase client
- `lib/supabase/middleware.ts` - Middleware auth handling

### Pages
- `app/profile/page.tsx` - Has redirect logic (lines 24-35)
- `app/layout.tsx` - Wraps app in UserProvider
- `middleware.ts` - Protected route handling

### Config
- `.env.local` - Supabase URL and keys
- `next.config.js` - Serwist/CSP configuration

---

## Investigation Paths

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

## Recent Code Changes

### UserContext.tsx (Latest)
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
  // Wait for onAuthStateChange or timeout
  setTimeout(() => {
    if (!hasReceivedAuthState) setLoading(false);
  }, 500);
};
```

### Profile Page Redirect (Latest)
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

---

## Test Credentials
- **Email:** user@test.com
- **Password:** Password1!

---

## Tech Stack
- Next.js 14.2.29 (App Router)
- Supabase SSR (`@supabase/ssr`)
- Serwist (Service Worker)
- Vercel (deployment)
