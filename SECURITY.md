# Security

This document describes the security model of Coaching Animator as it is implemented in the code and migrations. Binding rules live in `docs/constraints.md`.

## Reporting a vulnerability

Use the contact form at `/contact`. The form has no dedicated security subject, so start the message with "Security" and describe the problem. Do not post vulnerabilities in public GitHub issues. Please include steps to reproduce and the affected URL.

## Content Security Policy

Security headers are set for every route in `next.config.js` (`headers()`): a Content Security Policy, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and a `Permissions-Policy` that disables camera, microphone and geolocation. The CSP also sets `frame-ancestors 'none'`, `form-action 'self'`, `base-uri 'self'`, and limits images and network connections to this origin and Supabase (`*.supabase.co`).

### Trade-off: `unsafe-inline`

In production `script-src` is `'self' 'unsafe-inline' https://vercel.live`. `'unsafe-eval'` is added only in development, where Next.js uses eval for fast refresh and source maps; Konva, react-konva and marked need no eval. `'unsafe-inline'` stays because Next.js injects inline bootstrap scripts, and removing it needs a nonce-based CSP through middleware, which makes pages dynamically rendered. That has not been done.

Mitigations: all user content is rendered through React (escaped by default), inputs are validated with Zod schemas, and the app accepts no user-supplied HTML. `style-src` keeps `'unsafe-inline'` for inline styles.

## Rate limiting

Implemented in `src/lib/server/rate-limit.ts` and the migration `20260401000000_rate_limit_hit.sql`.

- A Postgres fixed-window counter. The SQL function `rate_limit_hit(p_key, p_window_seconds)` upserts one row per `<key>:<window epoch>` in `rate_limits`, so the increment is atomic across serverless instances and survives restarts. Old windows are deleted occasionally.
- Limits are configured per endpoint (for example `practice_save` 20 per hour, `practice_report` 5 per hour, `contact` 5 per hour).
- It fails open: if the store errors, the request is allowed and the error is logged with the `[RateLimit]` prefix. Availability is preferred over blocking real users.
- The `rate_limits` table has RLS enabled with no policies, and `anon` and `authenticated` have no table privileges.

`rate_limit_hit` is `SECURITY DEFINER` and EXECUTE is revoked from `anon`, `authenticated` and `PUBLIC` (`20261011000000_privilege_hardening.sql`, #178). Only the service-role client calls it, so a caller cannot inflate another coach's counter through `/rest/v1/rpc`. `cleanup_rate_limits()` is closed the same way.

## Access rules (row-level security)

Every table has RLS enabled. For the Practice tables:

`practices` (`20260301000000_practices.sql`, `20260302000000_practices_shared_lookup.sql`, `20260303000000_practice_moderation.sql`)

- Owners have full access (select, insert, update, delete) to their own rows at any visibility.
- Rows with `visibility = 'public'` and not `hidden` are readable by anyone, signed in or not (the Gallery).
- Link-shared rows are not listable. They are opened one at a time by id through the `SECURITY DEFINER` function `get_shared_practice(p_id)`, so only someone holding the link can read one. The function returns link and public rows that are not hidden, plus any row to its owner or an admin. It sets `search_path = ''`.
- The `hidden` flag is admin-only: a `BEFORE UPDATE` trigger (`guard_practice_hidden`) rejects any change to `hidden` by a signed-in non-admin. Hidden rows leave the Gallery and the shared lookup, except for the owner and admins.
- Admins (via `is_admin()`, which checks `user_profiles.role = 'admin'`) can read, update and delete any Practice.

`practice_reports`

- Anyone, signed in or not, can insert a report. The policy forces `status = 'open'`, no resolution fields, and `reporter_id` either null or the caller's own id.
- Only admins can read and resolve reports, through `is_admin()`.

`feedback` (`20260602000000_feedback.sql`)

- Anyone, signed in or not, can insert a submission (through `POST /api/feedback`, rate limited). The policy forces `read_at` to null.
- Only admins can read submissions and mark them read, through `is_admin()`.

`personal_tokens` (`20260603000000_personal_tokens.sql`)

- Holds hashed tokens for MCP API access. The plaintext token is never stored and only returned once upon creation.
- Owners can select their own rows, and insert/update their own rows.
- The `guard_personal_token_update` trigger ensures that only `last_used_at` and `revoked_at` can be modified after creation.
- No one (including the owner) can retrieve the `token_hash` from the client; it's omitted from the API output.

The legacy tables (`saved_animations`, `content_reports`, `upvotes`, `collections`, `collection_items`, `animation_versions`) and the `club-badges` storage policies are dropped by `20260601000000_restart_reset.sql`.

## Authentication and authorisation

- Sign-in is Supabase Auth with the PKCE flow. Permitted OAuth providers are Google, Apple and GitHub, with email and password always available (`docs/constraints.md`). OAuth tokens are not stored.
- Middleware (`src/middleware.ts`) refreshes the Supabase session cookies on each request. These are strictly necessary cookies.
- API routes call the helpers in `src/lib/server/auth.ts`: `requireAuth()` returns the user or a 401; `requireNotBanned(userId)` returns a 403 for suspended accounts (`user_profiles.banned_at`) and is used on write actions; `requireAdmin()` checks `user_profiles.role = 'admin'` and returns a 403 otherwise. Route handlers use the server Supabase client, never the browser client.
- Admin is a role on the user profile. The database enforces it again through `is_admin()` in RLS, so UI checks are not the only gate.
- Accounts are 18+ by self-declaration (`docs/adr/0003-accounts-are-18-plus.md`). Players use Guest mode, which stores nothing on the server.
- Error responses are generic and do not leak internals.

## Privacy: no telemetry or analytics

There is no telemetry, analytics, tracking, device fingerprinting or third-party analytics service, and no tracking embeds or advertising (`docs/constraints.md`). Data collected is limited to email, optional display name and optional avatar URL. Users can export and delete their data.
