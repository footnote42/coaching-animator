# Handoff: Production API & Auth Stabilization

## Current Status
Critical production issues remain unresolved despite multi-layered attempts to fix them. The application is suffering from persistent 500 HTML errors on API routes, 405 Method Not Allowed on Profile updates, and AbortErrors during authentication.

## Critical Suspects

### 1. Service Worker Interference (Serwist)
The console logs repeatedly show: 
`The service worker navigation preload request was cancelled before 'preloadResponse' settled.`
This strongly suggests that the PWA/Service Worker setup is intercepting and failing requests before they even reach the server handlers. This would explain why even an "extremely simple" `/api/diag` route is failing with a 500 error.

### 2. Next.js 14 vs 15 Ambiguity
The project uses Next.js **14.2.29**, but there has been confusion in the codebase between synchronous (v14) and asynchronous (v15) patterns for `cookies()` and headers. The `lib/supabase/server.ts` was recently "downgraded" to synchronous `cookies()` to match v14, but internal crashes might still be occurring in the middleware or server components.

### 3. Middleware Race Conditions
The middleware was recently updated to exclude `/api` routes from session updates to reduce surface area, but the `AbortError: signal is aborted without reason` in the console suggests that the frontend is cancelling requests, possibly due to `UserContext` state transitions or SW logic.

## Summary of Attempts
1.  **Standardized API Runtimes**: Forced `nodejs` runtime and `force-dynamic` on all routes to avoid Edge Runtime overhead/crashes.
2.  **Middleware Matcher**: Restricted middleware to exclude `/api` to prevent HTML error intercepts.
3.  **CORS Handling**: Added `OPTIONS` handlers to the Profile API to resolve 403/405 errors (though 405 persists).
4.  **Auth Resilience**: Removed heavy timeouts from `initAuth` to prevent "orphan promises" and AbortErrors.
5.  **Diagnostic API**: Created `/api/diag` to isolate environment issues from dependencies (currently 500ing).

## Recommended Next Steps for the Next Agent
1.  **Disable Service Worker**: Temporarily disable `withSerwist` in `next.config.js` to confirm if it is the source of the 500/Abort errors.
2.  **Verify Environment Variables**: Check Vercel logs directly to see if `NEXT_PUBLIC_SUPABASE_URL` is actually present at build/runtime.
3.  **Debug Navigation Preload**: Investigate `app/sw.ts` and the `navigationPreload: true` setting.
4.  **Middleware Bypass**: Confirm if removing `middleware.ts` entirely (temporarily) resolves site loading.
