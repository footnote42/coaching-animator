# Research: Security Hardening — MVP Pass

**Feature**: 016-security-hardening
**Date**: 2026-05-03
**Status**: Complete

---

## Rate Limiting — Current Coverage

### Already protected (using `checkRateLimit` from `src/lib/server/rate-limit.ts`)

| Route | Method | Config key |
|-------|--------|------------|
| `POST /api/animations` | create | `create_animation` |
| `POST /api/report` | report | `report` |
| `POST /api/share` | share | `share` |
| `POST /api/collections` | create | *(inherits)* |
| `PATCH /api/collections/[id]` | update | *(inherits)* |
| `POST /api/collections/[id]/animations` | add | *(inherits)* |

### Gaps — routes with no `checkRateLimit` call

| Route | Method | Risk | Key type |
|-------|--------|------|----------|
| `GET /api/gallery` | search/browse | Medium — public endpoint; config key already exists in DEFAULT_CONFIGS (100/hr) but not called | IP (unauthenticated) |
| `POST /api/animations/[id]/upvote` | toggle | Medium — has a naive 1s in-memory cooldown only; no hourly window | User-ID |
| `POST /api/animations/[id]/remix` | create | High — creates DB row; no limit | User-ID |
| `PUT /api/user/profile` | update | Low-medium | User-ID |
| `DELETE /api/user/account` | delete | High — destructive; no limit | User-ID |
| `POST /api/auth/resend-verification` | email send | Critical — email bombing risk | IP (unauthenticated) |
| `POST /api/animations/[id]/progressions` | create | Medium — creates DB row | User-ID |
| `PATCH /api/animations/[id]/progressions/reorder` | update | Low — idempotent batch update | User-ID |

**Decision**: Add standard `checkRateLimit` to all 8 routes above. Upvote's custom 1s cooldown is kept for toggle-spam prevention; the hourly window from DEFAULT_CONFIGS is added on top. Gallery uses IP-based keying (public, unauthenticated).

**Rationale**: Centralised config in DEFAULT_CONFIGS makes limits easy to tune. Consistent pattern across the codebase.

**Alternatives considered**: Vercel Edge Middleware for global rate limiting — rejected for this pass because it would require shared state (Redis/Upstash) and adds deployment complexity. In-memory per-instance is acceptable pre-launch.

---

## Rate Limit — New Config Values

| Endpoint key | maxRequests | windowMs | Rationale |
|---|---|---|---|
| `upvote` | 30 | 1 hour | Toggle spam beyond 30/hr is abuse |
| `remix` | 5 | 1 hour | 5 remixes/hr is generous |
| `profile_update` | 10 | 1 hour | Profile updates are infrequent |
| `account_delete` | 3 | 24 hours | Destructive; rarely needed |
| `resend_verification` | 3 | 1 hour | Email sends are expensive and abusable |
| `progression_create` | 20 | 1 hour | Up to 5 progressions x 4 base animations/hr |
| `progression_reorder` | 20 | 1 hour | Reordering is a UX action, not a write-heavy op |

---

## Injection / Validation — Current State

**Finding**: The injection surface is already well-protected.

- `POST /api/animations` — validated by `CreateAnimationSchema` (Zod); payload size checked via `validatePayloadSize`
- `PUT /api/animations/[id]` — validated by `UpdateAnimationSchema`; payload size checked
- `POST /api/share` — payload size checked
- `GET /api/gallery` — query params validated by `GalleryQuerySchema` (`q` is a plain string; Supabase `.ilike()` parameterises it automatically)
- `PUT /api/user/profile` — validated by `UpdateProfileSchema`
- `POST /api/auth/resend-verification` — validated (email format only)
- `PATCH /api/animations/[id]/progressions/reorder` — validated by inline `ReorderSchema`

**Supabase query safety**: All DB queries use the Supabase JS client ORM methods. These are parameterised by default. No raw SQL string construction found in any route file. Injection risk is negligible.

**Decision**: No schema changes needed. Injection hardening is already in place.

---

## XSS — Current State

**Finding**: No raw HTML rendering patterns found anywhere in the React codebase.

Searched for risky HTML-injection patterns across `src/` — zero results. React's JSX text content escaping is the active protection layer for all user-supplied text rendered in the gallery (titles, descriptions, coaching notes, tags).

**Decision**: No work needed for XSS.

---

## Diagnostic Endpoint — Info Leak

**Finding**: `GET /api/diag` exposes `urlPrefix` (first 15 characters of `NEXT_PUBLIC_SUPABASE_URL`).

The `urlPrefix` partially reveals the Supabase project identifier. The anon key itself is not exposed. `NEXT_PUBLIC_*` variables are already embedded in the client bundle so this is low severity, but it should be removed as a hygiene measure.

**Decision**: Remove `urlPrefix` from the response. Boolean `hasUrl`/`hasAnonKey` flags are sufficient for diagnostics.

---

## Admin Route Coverage

**Finding**: All admin routes call `requireAdmin()` at the top of every handler, returning 401 for unauthenticated callers and 403 for non-admin users.

**Decision**: No changes needed. Rate limiting is not required for admin endpoints (authenticated-only, low traffic).

---

## Payload Size — Current State

**Finding**: `validatePayloadSize` is called in:
- `POST /api/animations` (on `body.payload`)
- `PUT /api/animations/[id]` (on `body.payload`)
- `POST /api/share` (on `body`)

Not called in remix, progressions, or reorder — these routes do not accept animation payloads (they operate on IDs or small order arrays).

**Decision**: No additional payload size checks needed.

---

## Summary of Changes Required

| Area | Files | Change |
|------|-------|--------|
| Rate limit configs | `src/lib/server/rate-limit.ts` | Add 7 new endpoint keys to `DEFAULT_CONFIGS` (gallery key already exists) |
| Gallery route | `src/app/api/gallery/route.ts` | Add `checkRateLimit` (IP-keyed; config already present) |
| Upvote route | `src/app/api/animations/[id]/upvote/route.ts` | Add `checkRateLimit` with hourly window (keep 1s cooldown) |
| Remix route | `src/app/api/animations/[id]/remix/route.ts` | Add `checkRateLimit` |
| Profile route | `src/app/api/user/profile/route.ts` | Add `checkRateLimit` to PUT handler |
| Account route | `src/app/api/user/account/route.ts` | Add `checkRateLimit` to DELETE handler |
| Resend verification | `src/app/api/auth/resend-verification/route.ts` | Add `checkRateLimit` (IP-keyed) |
| Progressions route | `src/app/api/animations/[id]/progressions/route.ts` | Add `checkRateLimit` to POST handler |
| Progressions reorder | `src/app/api/animations/[id]/progressions/reorder/route.ts` | Add `checkRateLimit` |
| Diag endpoint | `src/app/api/diag/route.ts` | Remove `urlPrefix` field |
| Tests | `src/lib/server/__tests__/rate-limit.test.ts` | Extend test coverage for new config keys |
