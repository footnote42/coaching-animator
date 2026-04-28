# Research: Auth & Profile (Phase 2g)

**Branch**: `010-auth-profile` | **Date**: 2026-04-27

---

## Summary

Phase 2g is a **pure frontend visual redesign** of the existing profile page. All data infrastructure is already in place. No migration, no API change, no new state management required. The only file that needs editing is `src/app/profile/page.tsx`.

---

## Findings

### 1. `user_profiles` table — columns already exist

The `user_profiles` table (migration `20260131130000_online_platform.sql` + `20260221000000_club_personalization.sql`) already contains all required columns:

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | PK, references `auth.users` |
| `display_name` | TEXT | nullable, max 50 chars (constraint) |
| `club_name` | TEXT | nullable, max 100 chars (constraint) |
| `primary_strip_color` | TEXT | nullable, hex regex validated |
| `secondary_strip_color` | TEXT | nullable, hex regex validated |
| `club_badge_url` | TEXT | nullable |
| `animation_count` | INTEGER | maintained by trigger |
| `max_animations` | INTEGER | quota limit |
| `role` | TEXT | 'user' \| 'admin' |

**Decision**: No Supabase migration required for Phase 2g.

### 2. `region` field — dropped from scope

The spec mentioned `region` as a third coaching identity field. `region` does not exist in the DB, in any migration, or in the TypeScript types. Adding it would require a migration + type regeneration for a field that provides marginal value over `club_name` (clubs are inherently region-specific). 

**Decision**: `region` dropped from Phase 2g. `display_name` + `club_name` provide sufficient coaching identity context. `region` can be added in Phase 4 if coach feedback indicates need.

### 3. First-visit profile row creation — already handled

The initial migration includes a `handle_new_user()` trigger on `auth.users` that auto-inserts a `user_profiles` row on every new signup. The `UserContext` also provides a fallback profile object if the DB query fails. There is **no "upsert on first visit" logic needed in the profile page** — the row always exists for authenticated users.

**Decision**: `API-004` from the spec (upsert logic) is not needed. Remove from plan.

### 4. Profile API — complete, no changes required

`/api/user/profile` (GET + PUT) at `src/app/api/user/profile/route.ts`:
- Already fetches all required fields: `display_name`, `club_name`, `primary_strip_color`, `secondary_strip_color`, `club_badge_url`, `animation_count`, `max_animations`
- Validated via `UpdateProfileSchema` (Zod) in `src/lib/schemas/users.ts`
- Server-side length limits already enforced: `display_name` max 50, `club_name` max 100
- RLS-scoped: only the authenticated user's own row is read/updated

**Decision**: No API changes needed for Phase 2g.

### 5. UserContext — complete, no changes required

`src/lib/contexts/UserContext.tsx` already exposes:
- `user` — Supabase `User` object (email, identities)
- `profile` — `{ display_name, club_name, primary_strip_color, secondary_strip_color, club_badge_url, animation_count, max_animations, role }`
- `loading` — bool (auth state resolving)
- `isAuthenticated` — bool
- `signOut` — async function
- `refreshProfile` — async function

**Decision**: No UserContext changes needed.

### 6. Navigation auth state — UX-005 confirmed redundant

`src/shared/components/Navigation.tsx` already:
- Shows "Sign In" + "Get Started" for guests
- Shows "My Playbook", "Profile", "Create", "Sign Out" for authenticated users
- Renders a loading skeleton (`animate-pulse`) while auth state resolves
- Handles the `loading` state cleanly — no flash of wrong state

**Decision**: UX-005 (auth state indicator) remains correctly parked. Navigation already provides clear auth state differentiation.

### 7. Profile page — visual structure today

`src/app/profile/page.tsx` renders as:
1. `<header>` — "Profile Settings" h1
2. `<form>` block — email (disabled), display name, Club Branding sub-section (badge + club name + strip colors), usage meter, Save button
3. Connected Accounts block — Google link/unlink, password management
4. Quick Links block — My Playbook, Public Gallery

The page works correctly. All state management, API calls, and error handling are solid. The problem is purely **visual hierarchy**: the "Profile Settings" heading and immediate email/form layout signals "settings app", not "coach profile."

---

## What Changes in Phase 2g

**Single file**: `src/app/profile/page.tsx`

**Restructure approach**:
1. Replace the `<header>` block with a **coach identity section** — displays `display_name` (Oswald heading) and `club_name` as a subtitle-style tagline, with avatar area (OAuth photo or initials fallback)
2. Move identity edit fields (`display_name`, `club_name`) to be immediately accessible inline (click-to-edit or always-visible below the card)
3. Retain all existing functionality: strip colors, badge upload, usage meter, connected accounts, password
4. Demote "Connected Accounts" and password management under an "Account Settings" section with a clear dividing line
5. Remove the "Profile Settings" page title — let the coach's name serve as the page anchor

**What does NOT change**:
- No changes to API, Supabase, UserContext, Navigation, or any other file
- No new components required (all changes are within the single page file)
- No new state variables — existing `displayName`, `clubName` state already covers what's needed

---

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|-----------------|
| Add `region` column | No evidence of coach demand; `club_name` is sufficient identity signal; avoids migration complexity |
| Extract `ProfileCard` component | Single page redesign doesn't justify extraction; profile page has no other consumers |
| Separate "view" and "edit" modes | Adds interaction complexity for no clear benefit at this usage scale |
| Add profile statistics (drill count, views) | Out of scope per spec; `animation_count` usage meter retained as-is |
