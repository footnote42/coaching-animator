# Production API & Auth Stabilization

**Source**: Extracted from `HANDOFF_STABILIZATION.md`
**Last Updated**: 2026-01-31
**Status**: Reference guide - multiple fix attempts logged

---

## Current Status

Critical production issues remain unresolved despite multi-layered attempts to fix them. The application is suffering from:
- Persistent 500 HTML errors on API routes
- 405 Method Not Allowed on Profile updates
- AbortErrors during authentication

---

## Critical Suspects

### 1. Service Worker Interference (Serwist)

**Evidence**: Console logs repeatedly show:
```
The service worker navigation preload request was cancelled before 'preloadResponse' settled.
```

This strongly suggests that the PWA/Service Worker setup is intercepting and failing requests before they even reach the server handlers. This would explain why even a "simple" `/api/diag` route fails with a 500 error.

**Investigation Path**:
- Check `app/sw.ts` for `navigationPreload: true` setting
- Verify `next.config.js` Serwist configuration
- Check if PWA is interfering with `/api/*` routes

### 2. Next.js 14 vs 15 Ambiguity

**Evidence**: Project uses Next.js **14.2.29**, but confusion exists between:
- Synchronous `cookies()` (v14)
- Asynchronous `cookies()` (v15)

The `lib/supabase/server.ts` was recently "downgraded" to synchronous `cookies()` to match v14, but internal crashes might still occur in middleware or server components.

**Investigation Path**:
- Verify `cookies()` usage is synchronous (Next.js 14)
- Check for async/await on cookies() calls
- Verify all server components match v14 patterns

### 3. Middleware Race Conditions

**Evidence**: Middleware was recently updated to exclude `/api` routes from session updates to reduce surface area, but `AbortError: signal is aborted without reason` in the console suggests that the frontend is cancelling requests.

This could be due to:
- `UserContext` state transitions
- Service Worker logic
- Middleware interfering with response handling

**Investigation Path**:
- Check middleware doesn't abort API requests
- Verify UserContext isn't causing rapid state changes
- Check Service Worker doesn't cancel API requests

---

## Summary of Attempted Fixes

1. **Standardized API Runtimes**: Forced `nodejs` runtime and `force-dynamic` on all routes to avoid Edge Runtime overhead/crashes.

2. **Middleware Matcher**: Restricted middleware to exclude `/api` to prevent HTML error intercepts.

3. **CORS Handling**: Added `OPTIONS` handlers to the Profile API to resolve 403/405 errors (though 405 persists).

4. **Auth Resilience**: Removed heavy timeouts from `initAuth` to prevent "orphan promises" and AbortErrors.

5. **Diagnostic API**: Created `/api/diag` to isolate environment issues from dependencies (currently 500ing).

---

## Recommended Next Steps

### Priority 1: Disable Service Worker
Temporarily disable `withSerwist` in `next.config.js` to confirm if it is the source of the 500/Abort errors.

```javascript
// In next.config.js - comment out Serwist
// const withSerwist = require('@serwist/next').withSerwist;

// export default withSerwist({
//   // config
// });

// Use plain next config instead
export default {
  // your config
};
```

**Verify**: Do 500 errors disappear? Do AbortErrors stop?

### Priority 2: Verify Environment Variables
Check Vercel logs directly to see if `NEXT_PUBLIC_SUPABASE_URL` is actually present at build/runtime.

```bash
# In Vercel dashboard:
# 1. Go to Settings → Environment Variables
# 2. Verify NEXT_PUBLIC_SUPABASE_URL is set
# 3. Check build logs for variable substitution
```

### Priority 3: Debug Navigation Preload
Investigate `app/sw.ts` and the `navigationPreload: true` setting.

```typescript
// Check if this is set
navigationPreload: true // May be causing issues

// Try setting to false
navigationPreload: false
```

### Priority 4: Middleware Bypass
Confirm if removing `middleware.ts` entirely (temporarily) resolves site loading.

```bash
# Rename middleware temporarily
mv middleware.ts middleware.ts.bak

# Deploy and test
# If errors disappear, middleware is the culprit
```

---

## Error Patterns to Watch

### Pattern A: Service Worker Cancellation
```
AbortError: signal is aborted without reason
The service worker navigation preload request was cancelled
```
→ Points to **Serwist/PWA interference**

### Pattern B: Runtime Crash
```
500 Internal Server Error
(No specific error message)
```
→ Points to **Runtime environment or missing deps**

### Pattern C: Method Not Allowed
```
405 Method Not Allowed
```
→ Points to **Route handler mismatch or CORS issue**

---

## Debug API Route (`/api/diag`)

This diagnostic endpoint was created to isolate issues:

```typescript
// app/api/diag/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    env: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓' : '✗',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓' : '✗',
    },
    nodeVersion: process.version,
    uptime: process.uptime(),
  });
}
```

**What to Check**:
- If `/api/diag` returns 500, the issue is at runtime level
- If `/api/diag` returns 200, the issue is route-specific
- Check environment variables are present

---

## Environment Variables Checklist

Ensure these are set in Vercel:

```
✓ NEXT_PUBLIC_SUPABASE_URL
✓ NEXT_PUBLIC_SUPABASE_ANON_KEY
✓ NEXT_PUBLIC_SERWIST_CONFIG
✓ NODE_ENV=production
```

---

## Log Collection Strategy

### Vercel Logs
```bash
# View production logs in Vercel dashboard
Settings → Functions → View logs
```

### Browser Console
```javascript
// Capture all console messages during load
window.consoleLogs = [];
const originalLog = console.log;
console.log = function(...args) {
  window.consoleLogs.push(args);
  originalLog.apply(console, args);
};
```

### Network Tab
- Look for requests returning 500 with no body
- Check for cancelled requests (aborted by client)
- Verify API calls complete before redirect

---

## Testing Checklist After Fixes

After each fix attempt:
1. ❌ Does `/api/diag` still 500?
2. ❌ Are AbortErrors gone from console?
3. ❌ Can user access profile after login?
4. ❌ Do cookies persist across navigations?
5. ❌ Can user log out and log back in?

---

## Quick Reference: File Locations

| File | Purpose | Check For |
|------|---------|-----------|
| `next.config.js` | Serwist setup | `withSerwist` enabled? |
| `app/sw.ts` | Service Worker | `navigationPreload: true`? |
| `middleware.ts` | Auth refresh | Excluding `/api`? |
| `lib/supabase/server.ts` | Server auth | Synchronous `cookies()`? |
| `lib/supabase/client.ts` | Browser auth | `isSingleton: true`? |
| `app/api/*/route.ts` | API handlers | Correct runtime/dynamic? |

---

## Related Documentation

- **Auth Patterns**: `docs/architecture/auth-patterns.md`
- **Session Persistence**: `docs/troubleshooting/session-persistence.md`
- **CLAUDE.md**: `CLAUDE.md` - Development guidelines
- **Constitution**: `.specify/memory/constitution.md`

---

## Success Criteria

The fix is successful when:
- ✅ `/api/diag` returns 200 with env variables
- ✅ No AbortErrors in console
- ✅ User can login and access `/profile`
- ✅ Session persists across navigations
- ✅ No 500 errors on any API routes
