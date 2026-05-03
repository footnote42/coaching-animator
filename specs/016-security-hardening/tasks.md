# Tasks: Security Hardening — MVP Pass

**Input**: `specs/016-security-hardening/plan.md`, `spec.md`, `research.md`

**Tests**: Test tasks included for the rate-limit config and key scenarios (unit only — no E2E needed for this feature).

**Organization**: Tasks grouped by user story. US1 and US2 are both P1 and are independent.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup

**Purpose**: Confirm baseline passes before any changes.

- [x] T001 Verify `npm run lint && npx tsc --noEmit` passes on `016-security-hardening` branch before any changes

---

## Phase 2: Foundational

**Purpose**: Add rate limit config keys — required before ANY route task can be implemented.

**CRITICAL**: All route tasks (T003–T010, T020) depend on this phase completing first.

- [x] T002 Add 7 new endpoint keys to `DEFAULT_CONFIGS` in `src/lib/server/rate-limit.ts`: `upvote` (30/hr), `remix` (5/hr), `profile_update` (10/hr), `account_delete` (3/24hr), `resend_verification` (3/hr), `progression_create` (20/hr), `progression_reorder` (20/hr). Note: `gallery` key already exists (100/hr) — no new entry needed for it.

**Checkpoint**: `rate-limit.ts` updated — route tasks can now begin.

---

## Phase 3: User Story 1 — API Abuse is Throttled (Priority: P1) MVP

**Goal**: Every unprotected write endpoint applies a standard hourly rate limit using the existing `checkRateLimit` infrastructure.

**Independent Test**: POST to `/api/animations/[id]/remix` 6 times — first 5 return 201, 6th returns 429 with `X-RateLimit-Reset` header.

### Tests for User Story 1

- [x] T003 [US1] Extend `src/lib/server/__tests__/rate-limit.test.ts` to assert all 7 new config keys are present in DEFAULT_CONFIGS with correct `maxRequests` and `windowMs` values

### Implementation for User Story 1

- [x] T004 [P] [US1] Add `checkRateLimit(user.id, 'upvote')` to `src/app/api/animations/[id]/upvote/route.ts` — insert after `requireAuth()`, before the existing 1s cooldown; return 429 with `getRateLimitHeaders()` if blocked
- [x] T005 [P] [US1] Add `checkRateLimit(user.id, 'remix')` to `src/app/api/animations/[id]/remix/route.ts` — insert after `requireAuth()`, return 429 if blocked
- [x] T006 [P] [US1] Add `checkRateLimit(user.id, 'profile_update')` to PUT handler in `src/app/api/user/profile/route.ts` — insert after `requireAuth()`, return 429 if blocked (GET handler unchanged)
- [x] T007 [P] [US1] Add `checkRateLimit(user.id, 'account_delete')` to DELETE handler in `src/app/api/user/account/route.ts` — insert after `requireAuth()`, return 429 if blocked
- [x] T008 [P] [US1] Add IP-based `checkRateLimit(ip, 'resend_verification')` to `src/app/api/auth/resend-verification/route.ts` — extract IP from `x-forwarded-for` ?? `x-real-ip` ?? `'unknown'`; insert before the `auth.resend()` call; return 429 if blocked
- [x] T009 [P] [US1] Add `checkRateLimit(user.id, 'progression_create')` to POST handler in `src/app/api/animations/[id]/progressions/route.ts` — insert after auth check, return 429 if blocked (GET handler unchanged)
- [x] T010 [P] [US1] Add `checkRateLimit(user.id, 'progression_reorder')` to `src/app/api/animations/[id]/progressions/reorder/route.ts` — insert after `requireAuth()`, return 429 if blocked
- [x] T020 [P] [US1] Add IP-based `checkRateLimit(ip, 'gallery')` to GET handler in `src/app/api/gallery/route.ts` — extract IP from `x-forwarded-for` ?? `x-real-ip` ?? `'unknown'`; `DEFAULT_CONFIGS` already contains the `gallery` key (100/hr); return 429 if blocked
- [x] T011 [US1] Verify `npm run lint && npx tsc --noEmit` passes after all route changes

**Checkpoint**: All 8 routes rate-limited. Manual probe confirms 429 on 6th remix request.

---

## Phase 4: User Story 2 — Diagnostic Endpoint Info Leak Removed (Priority: P1)

**Goal**: The `/api/diag` endpoint no longer exposes any partial URL or credential data.

**Independent Test**: `curl http://localhost:3000/api/diag | jq .env` — response contains `hasUrl`, `hasAnonKey`, `nodeEnv` only; no `urlPrefix` key.

### Implementation for User Story 2

- [x] T012 [US2] Remove `urlPrefix` field from the `env` object in `src/app/api/diag/route.ts` — keep `hasUrl`, `hasAnonKey`, `nodeEnv` booleans/values
- [x] T013 [US2] Verify `npm run lint && npx tsc --noEmit` passes after diag change

**Checkpoint**: `GET /api/diag` returns no partial URL strings.

---

## Phase 5: User Story 3 — Auth Guard Consistency Verified (Priority: P2)

**Goal**: Admin and user-only routes are confirmed to return correct error codes for unauthorised callers. No code changes expected; this phase is verification only.

**Independent Test**: Unauthenticated request to any user mutation endpoint returns 401; non-admin request to `/api/admin/reports` returns 403.

### Verification for User Story 3

- [ ] T014 [US3] Manual probe: `curl -X DELETE http://localhost:3000/api/user/account` (no auth) — verify 401 returned (not 500 or 200)
- [ ] T015 [US3] Manual probe: `curl http://localhost:3000/api/admin/reports` with a non-admin session cookie — verify 403 returned
- [ ] T016 [US3] Manual probe: `curl http://localhost:3000/api/diag` in production preview — verify no secrets in response

**Checkpoint**: All three probes confirm expected error codes.

---

## Phase 6: Polish & Final Checks

- [ ] T017 [P] Run `npm test -- --run` — all unit tests pass including new rate-limit assertions
- [ ] T018 [P] Run `npm run lint && npx tsc --noEmit` — zero new errors across the full codebase
- [ ] T019 Manual probe: POST to `/api/auth/resend-verification` 4 times — confirm 4th returns 429
- [ ] T021 [P] Manual probe: POST an oversized payload (>1 MB body) to `/api/animations` — confirm 413 response before any DB write (verifies SC-002 / FR-005)
- [ ] T022 [P] Manual probe: `GET /api/gallery?q=%27%3B+DROP+TABLE+animations%3B+--` — confirm 200 with normal results and no error (verifies SC-003 / FR-004)


---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — **BLOCKS T004–T010, T020**
- **Phase 3 (US1)**: Depends on Phase 2 (T002 must be complete before T004–T010, T020)
- **Phase 4 (US2)**: Independent from Phase 3 — can run in parallel with Phase 3
- **Phase 5 (US3)**: Depends on Phase 3 + Phase 4 being complete
- **Phase 6 (Polish)**: Depends on all stories complete

### Parallel Opportunities

Within Phase 3: T004–T010 and T020 are fully parallel — each touches a different route file with no shared state.

Phase 4 (T012–T013) can run in parallel with Phase 3 route tasks — `diag/route.ts` has no dependency on `rate-limit.ts`.

---

## Implementation Strategy

### MVP (Phase 1–3 only)

1. Phase 1: Confirm clean baseline
2. Phase 2: Add rate limit configs to `rate-limit.ts`
3. Phase 3: Apply to all 8 routes in parallel — this is the highest-risk reduction
4. Validate via manual probe + tests
5. Ship US1 as the security MVP

### Full pass

Phase 4 (diag fix) adds 10 minutes. Phase 5 (verification) is no-code. Include both in the same PR.

---

## Notes

- All rate limit responses MUST include `getRateLimitHeaders(result)` to expose `X-RateLimit-Remaining` and `X-RateLimit-Reset`
- Error body format: `{ error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' } }`
- `resend_verification` is the only route using IP-based keying — all others use `user.id`
- Upvote's existing 1s per-animation cooldown is kept (different purpose — prevents toggle spam on a single animation)
- Pre-push gate: `npm run lint && npx tsc --noEmit` must pass before PR
