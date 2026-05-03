# Implementation Plan: Security Hardening — MVP Pass

**Branch**: `016-security-hardening` | **Date**: 2026-05-03 | **Spec**: `specs/016-security-hardening/spec.md`

## Summary

Close rate-limiting gaps on 7 API routes and remove a minor info-leak from the diagnostic endpoint. Injection hardening and XSS protection are already in place; this pass is surgical: add `checkRateLimit` calls to unprotected routes and centralise config in `DEFAULT_CONFIGS`.

---

## Technical Context

**Language/Version**: TypeScript 5 · Node 22
**Framework**: Next.js 14 App Router (API Routes)
**Backend**: Supabase (PostgreSQL + Auth + RLS) via `src/lib/supabase/`
**Rate Limiting**: In-memory Map, `src/lib/server/rate-limit.ts`
**Validation**: Zod schemas in `src/lib/schemas/`
**Testing**: Vitest (unit)
**Deploy**: Vercel (CI via GitHub Actions)
**Constraints**: No telemetry; no third-party analytics; RLS on all DB tables

---

## Constitutional Compliance Check

| Check | Status | Notes |
|-------|--------|-------|
| Tier alignment (Guest/Auth/Public/Admin) | [x] Pass | Rate limits keyed by user ID (auth) or IP (guest) — no cross-tier access |
| No telemetry or analytics | [x] Pass | No new data collection |
| Entity colors via EntityColors service | [x] N/A | No canvas changes |
| Shared canvas — tested on all 3 routes | [x] N/A | No canvas changes |
| New data: privacy impact assessed | [x] Pass | Rate-limit counters are ephemeral in-memory only |
| Supabase joins flattened before use | [x] N/A | No new queries |

No violations. No Complexity Tracking entries required.

---

## Project Structure

### Documentation (this feature)

```text
specs/016-security-hardening/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 codebase research
├── quickstart.md        # Manual test guide
└── tasks.md             # Task list (/speckit.tasks output)
```

No `data-model.md` or `contracts/` — no new entities or external interfaces.

### Source Code (files to modify)

```text
src/lib/server/
└── rate-limit.ts                              # Add 7 new DEFAULT_CONFIGS entries

src/app/api/
├── animations/[id]/upvote/route.ts            # Add checkRateLimit (hourly window)
├── animations/[id]/remix/route.ts             # Add checkRateLimit
├── animations/[id]/progressions/route.ts      # Add checkRateLimit to POST
├── animations/[id]/progressions/reorder/route.ts  # Add checkRateLimit
├── user/profile/route.ts                      # Add checkRateLimit to PUT
├── user/account/route.ts                      # Add checkRateLimit to DELETE
├── auth/resend-verification/route.ts          # Add checkRateLimit (IP-keyed)
└── diag/route.ts                              # Remove urlPrefix field

src/lib/server/__tests__/
└── rate-limit.test.ts                         # Extend for new config keys
```

---

## Implementation Phases

### Phase 1 — Rate Limit Config (no-risk, no-behaviour-change)

**Task**: Add 7 new keys to `DEFAULT_CONFIGS` in `src/lib/server/rate-limit.ts`.

```
upvote:               { maxRequests: 30,  windowMs: 3_600_000 }
remix:                { maxRequests: 5,   windowMs: 3_600_000 }
profile_update:       { maxRequests: 10,  windowMs: 3_600_000 }
account_delete:       { maxRequests: 3,   windowMs: 86_400_000 }
resend_verification:  { maxRequests: 3,   windowMs: 3_600_000 }
progression_create:   { maxRequests: 20,  windowMs: 3_600_000 }
progression_reorder:  { maxRequests: 20,  windowMs: 3_600_000 }
```

**Key extraction pattern for each route**:
- Authenticated endpoints: `user.id` — `checkRateLimit(user.id, 'endpoint_key')`
- Unauthenticated (`resend_verification`): IP from `request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'`

**Rate limit response pattern** (consistent with existing routes):
```typescript
if (!rateLimitResult.allowed) {
  return NextResponse.json(
    { error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' } },
    {
      status: 429,
      headers: getRateLimitHeaders(rateLimitResult),
    }
  );
}
```

---

### Phase 2 — Apply to Each Route

Apply the pattern above to each of the 7 routes. Placement: immediately after auth check (for auth-required routes) or at the top of the handler (for `resend_verification`).

**Upvote** (`upvote/route.ts`): Insert `checkRateLimit(user.id, 'upvote')` after `requireAuth()`, before the existing 1s cooldown check. Keep the cooldown — it serves a different purpose (per-animation toggle spam).

**Remix** (`remix/route.ts`): Insert `checkRateLimit(user.id, 'remix')` after `requireAuth()`.

**Profile** (`user/profile/route.ts`): Insert `checkRateLimit(user.id, 'profile_update')` inside the `PUT` handler only, after `requireAuth()`. GET reads do not need rate limiting.

**Account** (`user/account/route.ts`): Insert `checkRateLimit(user.id, 'account_delete')` at the start of `DELETE` handler, after `requireAuth()`.

**Resend Verification** (`auth/resend-verification/route.ts`): Extract IP from request headers. Insert `checkRateLimit(ip, 'resend_verification')` before the Supabase `auth.resend()` call.

**Progressions** (`progressions/route.ts`): Insert `checkRateLimit(user.id, 'progression_create')` inside `POST` handler after auth check. Leave `GET` unprotected.

**Progressions Reorder** (`progressions/reorder/route.ts`): Insert `checkRateLimit(user.id, 'progression_reorder')` after `requireAuth()`.

---

### Phase 3 — Diagnostic Endpoint

Remove `urlPrefix` from `GET /api/diag` response. Replace with just the boolean flags.

Before:
```typescript
env: {
  hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  nodeEnv: process.env.NODE_ENV,
  urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 15)
}
```

After:
```typescript
env: {
  hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  nodeEnv: process.env.NODE_ENV,
}
```

---

### Phase 4 — Tests

Extend `src/lib/server/__tests__/rate-limit.test.ts` to cover:
- Each new config key exists in DEFAULT_CONFIGS with expected values
- `resend_verification` at 3 requests is allowed, 4th is blocked
- `account_delete` window is 24h (not 1h)

Unit test for IP extraction in the `resend_verification` handler (mock `request.headers`).

---

## Acceptance Verification

After all phases:

1. `npm run lint && npx tsc --noEmit` — zero new errors
2. `npm test -- --run` — all existing + new tests pass
3. Manual probe: POST to `/api/animations/[id]/remix` 6x — 6th returns 429 with `X-RateLimit-Reset` header
4. Manual probe: GET `/api/diag` — response contains no URL prefix string
5. Manual probe: POST to `/api/auth/resend-verification` 4x — 4th returns 429
