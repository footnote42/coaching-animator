# Feature Specification: Security Hardening — MVP Pass

**Feature Branch**: `016-security-hardening`
**Created**: 2026-05-03
**Status**: Draft
**Input**: Phase 3b MVP Security Pass — rate limiting + injection hardening

## Constitutional Compliance Gate

- [x] **Tier alignment**: All tiers — guest write is blocked at auth layer; authenticated mutations require valid session; admin routes require admin role
- [x] **No telemetry**: No new data collection introduced
- [x] **No third-party analytics**: No external SDKs added
- [x] **No hardcoded colors**: Not applicable — security feature only
- [x] **Privacy gate**: No new data stored; rate-limit counters are ephemeral in-memory only
- [x] **Shared canvas risk**: No canvas components touched

---

## User Scenarios & Testing

### User Story 1 — API Abuse is Throttled (Priority: P1)

A guest or authenticated user who sends an excessive number of requests to a write endpoint (auth, upvote, remix, user profile update, gallery search) is stopped with a clear error after exceeding the per-window limit. The platform does not crash, data is not corrupted, and legitimate users are not affected.

**Why this priority**: Rate limiting is the first line of defence before public launch. Without it, malicious actors can spam upvotes, exhaust database connections, or brute-force auth flows at zero cost.

**Independent Test**: Can be tested by sending repeated POST requests to `/api/animations/[id]/upvote` beyond the threshold and verifying a 429 response with `X-RateLimit-Reset` information.

**Acceptance Scenarios**:

1. **Given** a user has sent 10 upvote requests within the allowed window, **When** they send an 11th, **Then** the server returns HTTP 429 with an `X-RateLimit-Reset` header and a human-readable error message.
2. **Given** a guest user reaches the gallery search rate limit, **When** they retry after the window resets, **Then** the request succeeds normally.
3. **Given** two different users are making concurrent requests to the same endpoint, **When** one hits the rate limit, **Then** the other is unaffected (limits are per-user/IP, not global).
4. **Given** an auth endpoint receives burst requests (e.g., resend verification), **When** the limit is exceeded, **Then** a 429 is returned and no further emails are sent until the window resets.

---

### User Story 2 — Malicious Input is Rejected (Priority: P1)

A user who submits free-text content (animation title, description, coaching notes, tags, search query) containing SQL-like patterns, script tags, or oversized payloads sees a validation error rather than having that content persisted or executed.

**Why this priority**: Injection attacks and stored XSS are high-severity pre-launch risks. Supabase parameterises queries by default, but gaps in server-side input validation mean crafted input could reach the database or be reflected to other users.

**Independent Test**: Can be tested by submitting a script-tag string as an animation title via the API and verifying it is rejected or sanitised before storage.

**Acceptance Scenarios**:

1. **Given** a user submits an animation with a title exceeding the maximum length, **When** the API receives the request, **Then** a 400 validation error is returned and nothing is persisted.
2. **Given** a user submits a search query with special characters or SQL-like syntax, **When** the gallery search endpoint processes it, **Then** the query is handled safely without error or data leakage.
3. **Given** a user submits a description containing HTML/script content, **When** the API persists it and another user views it in the gallery, **Then** the content is displayed as plain text — not executed as markup.
4. **Given** a request body exceeds the 1 MB payload limit, **When** the server receives it, **Then** a 413 error is returned before any parsing occurs.

---

### User Story 3 — Unprotected Routes Return Appropriate Errors (Priority: P2)

Admin-only endpoints return 403 for non-admin callers. Auth-required endpoints return 401 for unauthenticated callers. No endpoint silently accepts requests it should reject.

**Why this priority**: Several admin and user-specific routes currently lack rate limiting. While auth checks exist, consistent guard coverage ensures there are no gaps that a future change could accidentally open.

**Independent Test**: Can be tested by calling `/api/admin/reports` without admin credentials and verifying a 403 response (not 200 or 500).

**Acceptance Scenarios**:

1. **Given** an unauthenticated request reaches a user-only mutation endpoint, **When** the server handles it, **Then** a 401 response is returned with no data leaked.
2. **Given** an authenticated non-admin user calls an admin endpoint, **When** the server handles it, **Then** a 403 response is returned.
3. **Given** a diagnostic or health endpoint exists, **When** called from a production environment, **Then** it returns only safe, non-sensitive data (no env vars, no DB connection strings).

---

### Edge Cases

- What happens if the in-memory rate limit cache grows unboundedly? → Periodic cleanup runs every 5 minutes; no new behaviour needed, but window size must be set conservatively for high-volume endpoints.
- What if a rate-limited user shares their session with another device? → Limits are keyed per user ID (authenticated) or IP (guest); session sharing does not circumvent per-user limits.
- What if Vercel cold-starts a new function instance? → In-memory limits reset on cold start; this is a known acceptable trade-off (documented in `rate-limit.ts`).
- Guest (Tier 0) vs authenticated (Tier 1) limits: Public read endpoints (gallery browse) use IP-based limits; write endpoints require auth and use user-ID-based limits.

---

## Requirements

### Functional Requirements

- **FR-001**: The system MUST apply rate limiting to all write endpoints not currently protected: `upvote`, `remix`, `progressions` (create/reorder), `lineage` (if mutable), `user/profile`, `user/account`, and `auth/resend-verification`.
- **FR-002**: The system MUST apply rate limiting to high-traffic public read endpoints: `gallery` (search/browse).
- **FR-003**: Rate limit responses MUST return HTTP 429 with `X-RateLimit-Remaining` and `X-RateLimit-Reset` headers (as produced by `getRateLimitHeaders()` in `src/lib/server/rate-limit.ts`).
- **FR-004**: The system MUST validate all free-text user inputs on the server using the existing Zod schema layer before any database write: title, description, coaching notes, tags, search queries.
- **FR-005**: The system MUST enforce a maximum payload size (1 MB) at the server boundary before parsing any request body on mutation endpoints.
- **FR-006**: Gallery and public-facing views that render user-supplied text MUST treat that text as plain content — no raw markup rendering.
- **FR-007**: Admin-only endpoints MUST verify admin role on every request and return 403 for non-admin authenticated users.
- **FR-008**: The diagnostic endpoint (`/api/diag`) MUST NOT expose environment variable values, credentials, or internal service configuration in its response.
- **FR-009**: Rate limit configurations MUST be centralised in the existing `DEFAULT_CONFIGS` record in `src/lib/server/rate-limit.ts`; limits MUST NOT be hardcoded inline in route files.

### API / Database Requirements

- **API-001**: All new rate limit calls follow the existing `checkRateLimit(key, endpoint)` pattern from `src/lib/server/rate-limit.ts`.
- **API-002**: Rate limit key for authenticated endpoints is user ID; for unauthenticated endpoints it is the client IP extracted from `x-forwarded-for` or `x-real-ip` headers.
- **API-003**: Zod validation errors return HTTP 400 with a structured `{ error: { code: 'VALIDATION_ERROR', message: string } }` payload; no raw Zod messages are surfaced directly to callers.
- **API-004**: No new database tables or schema changes are required for this feature.
- **API-005**: Supabase RLS policies are not modified in this pass — the scope is server-side validation and rate limiting only.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Every write endpoint in the API surface returns HTTP 429 when its per-window request count is exceeded — verified by automated test or manual probe.
- **SC-002**: Submitting a request body larger than 1 MB to any mutation endpoint returns HTTP 413 without the server attempting to parse the body.
- **SC-003**: A search query containing `'; DROP TABLE animations; --` is handled without error and without affecting stored data.
- **SC-004**: The diagnostic endpoint returns a response containing no secrets, connection strings, or environment variable values when called in a production context.
- **SC-005**: `npm run lint && npx tsc --noEmit` passes with zero new errors after all changes.
- **SC-006**: All acceptance scenarios from User Stories 1–3 are covered by unit tests or integration tests.

---

## Assumptions

- Supabase's JS client already uses parameterised queries for all ORM-style calls; the injection risk is limited to cases where raw SQL strings are constructed from user input (assumed rare but needs audit confirmation during implementation).
- XSS risk in the gallery is mitigated by React's default JSX text escaping; the requirement is to confirm no raw HTML insertion patterns are used with user-supplied content anywhere in gallery or share views.
- The existing in-memory rate limiter is sufficient for the current traffic scale (pre-public-beta, single-region Vercel deployment); a distributed solution is out of scope for this pass.
- CSRF protection for Next.js App Router API routes is handled by the SameSite cookie attribute set by Supabase auth; no additional CSRF token implementation is needed for this pass.
- File uploads are not currently in scope (no upload endpoints exist); the file upload security item from SEC-001 is deferred.

---

## Out of Scope

- Distributed/persistent rate limiting (Redis-backed) — deferred to post-launch if traffic demands it
- Supabase RLS policy additions or modifications
- CSRF token implementation (covered by Supabase cookie defaults)
- File upload security
- Environment variable audit tooling or CI secrets scanning
- Auth token expiry configuration changes
