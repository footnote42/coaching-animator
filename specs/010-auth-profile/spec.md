# Feature Specification: Auth & Profile

**Feature Branch**: `010-auth-profile`  
**Created**: 2026-04-27  
**Status**: Draft  
**Input**: Phase 2g — Auth state indicator in header, profile UX

---

## Clarifications

### Session 2026-04-27

- Q: Is a persistent header auth state indicator (UX-005) required, given that "My Playbook" in the nav already signals authentication and "Log In" is visible on first open? → A: Parked as potentially redundant. The "My Playbook" navigation link serves as an implicit auth state signal for logged-in coaches; "Log In" on the landing/nav entry point serves guests. User Story 1 and all auth indicator requirements (FR-001–FR-006, FR-009, UI-001–UI-003, UI-007) are deferred. Phase 2g scope is narrowed to PROFILE-001 (profile page redesign) only.
- Q: Should coaches be able to edit their display name in the app, or is it read-only from their OAuth provider? → A: Editable in-app. Coaches can set a custom display name independent of their OAuth provider. Stored as a writable column in profiles.
- Q: If no profiles row exists for an authenticated coach (first visit or missing row), what should the profile page do? → A: Auto-create a blank profile row on first authenticated visit (upsert). Coach lands on the profile page with empty prompts rather than an error state.

---

## Constitutional Compliance Gate

- [x] **Tier alignment**: Tier 0 (Guest — login button visible), Tier 1 (Authenticated — profile indicator, coach profile page)
- [x] **No telemetry**: No usage tracking; all state is local session/auth state
- [x] **No third-party analytics**: No new SDKs introduced
- [x] **No hardcoded colors**: All new UI uses existing design token palette
- [x] **Privacy gate**: Profile coaching context fields (club name) are user-provided and voluntarily stored. No PII collected beyond what the auth system already holds.
- [x] **Shared canvas risk**: Zero — this feature touches only navigation header and the profile page. No canvas, no editor, no share route.

---

## Background

One gap remains in the auth and identity experience before launch:

**Profile page is a raw form** (PROFILE-001): The current profile page functions as a minimal settings form — email, password, save button. It conveys nothing about the coach behind it and has no coaching identity. Before launch, the profile should feel like a coach's card: personalised, contextual, and reflective of how coaches think about themselves (name, club affiliation).

**UX-005 (auth state indicator) is parked**: The "My Playbook" navigation link already signals authenticated state to logged-in coaches; the existing "Log In" entry point handles guests. A dedicated header indicator is potentially redundant and is deferred pending further evidence of user confusion.

---

## User Scenarios & Testing

### User Story 1 — Auth State Indicator in Header (Deferred — UX-005)

> **Parked**: The "My Playbook" navigation link provides implicit auth state indication for logged-in coaches. "Log In" is already accessible on initial page open. A dedicated persistent header indicator is potentially redundant. Deferred until post-launch user research confirms confusion at this touch point.

---

### User Story 2 — Coach Profile Card (Priority: P1)

A coach opens their profile page and sees a form with an email field and a save button — indistinguishable from any SaaS account settings page. They have no way to express their coaching identity: who they coach for, where, what they focus on. The profile redesign replaces the form-first layout with a card-first layout that leads with identity and surfaces settings as a secondary concern.

**Why this priority**: Profile credibility matters pre-launch as coaches will share the app with their own players, who may check the creator's profile. A raw settings form undermines the coaching-platform positioning.

**Independent Test**: Log in and navigate to the profile page. Confirm the page leads with a coach identity section (name and club visible or prominently editable), not a raw form. Confirm editing works and changes persist.

**Acceptance Scenarios**:

1. **Given** an authenticated coach on their profile page, **When** the page loads, **Then** their name (or a prompt to add a name) and club are displayed prominently — not buried in a form.
2. **Given** a coach has no club name set, **When** the profile page loads, **Then** friendly prompts (e.g., "Add your club") are shown in the relevant fields — not blank inputs with no context.
3. **Given** a coach fills in their club name and saves, **When** the save completes, **Then** the profile page reflects the updated values without requiring a page reload.
4. **Given** a coach on the profile page, **When** they scroll or interact with the page, **Then** account-level settings (email, password change) are accessible but do not visually dominate the page.
5. **Given** a coach with a profile photo set via their OAuth provider, **When** the profile page loads, **Then** their photo is displayed as the profile avatar.

---

### Edge Cases

- First-time coach visit: a DB trigger (`handle_new_user`) auto-creates a blank `user_profiles` row when the auth account is created. The profile page is guaranteed to find an existing row — no upsert needed in the app. Coach sees empty prompts ("Add your club") — never an error or broken state.
- Display name not yet set by coach: fall back to the OAuth provider name if available; otherwise leave blank with an "Add your name" prompt. Never show an empty name field with no context.
- Coach saves profile with club name containing special characters (`&`, `<`, `>`): sanitize on display; do not allow XSS.
- Network error during profile save: show an inline error message adjacent to the save action; do not silently fail.
- Profile page on mobile at 375px width: single-column layout, no overflow.

---

## Requirements

### Functional Requirements

> FR-001 through FR-006 (auth state indicator) are **deferred** — UX-005 parked as potentially redundant given existing "My Playbook" nav signal. See Clarifications.

- **FR-007**: The profile page MUST lead with a coach identity section displaying name and club, both editable in-app. Display name is a writable field — coaches may override whatever name their OAuth provider supplied.
- **FR-008**: The profile page MUST support editing and saving the club name field as a free-text input. No predefined list or validation is required in Phase 2g. A structured dropdown or autocomplete may replace this input in a future phase — the `text` column type supports this without a schema migration.
- **FR-009**: The profile page MUST display account-level settings (email, password change link) as a secondary section — visible but not dominant.
- **FR-010**: All profile field changes MUST be persisted to the user's account record.

### Frontend Requirements

> UI-001, UI-002, UI-003, UI-007 (auth state indicator styling) are **deferred** — UX-005 parked. See Clarifications.

- **UI-004**: The profile page layout leads with the coach identity card (full-width or prominent section), followed by an edit form, followed by account settings.
- **UI-005**: Club name input on the profile page uses the existing form component styles — no new input variants introduced.
- **UI-006**: The profile page MUST NOT use a multi-column form layout on mobile (375px). Single-column only on small viewports.
- **UI-008**: Profile page inline error messages (save failure, validation) appear immediately adjacent to the relevant field or action — not as toast notifications.

### API / Database Requirements

- **API-001**: The `user_profiles` table already contains all required columns: `display_name` (nullable text, writable, max 50 chars) and `club_name` (nullable text, max 100 chars). No Supabase migration is required. No TypeScript type regeneration needed.
- **API-002**: Profile reads and writes MUST be scoped to the authenticated user only — no cross-user reads permitted via RLS.
- **API-003**: The profile update endpoint MUST validate that `club_name` does not exceed 100 characters server-side. `display_name` max 50 chars is also enforced server-side. Both validations are already implemented in the existing API.

### Key Entities

- **User / Profile**: The authenticated user record. All required columns already exist in the `user_profiles` table: `display_name` (writable, nullable text, max 50 chars — pre-populated from OAuth provider on first sign-in but overridable by the coach) and `club_name` (nullable text, max 100 chars). No migration required. `region` is out of scope for Phase 2g.

---

## Design Direction

### Profile Page

The page should open with a "coach card" feeling — imagine a laminated coaching card laid flat. The coach's name (Oswald, large) anchors the top. Club name sits directly below as supporting metadata, styled like a subtitle, not a label-value form pair. Below the identity card, a compact edit section allows updating all fields inline.

Account-level settings (email, password) move to a clearly labelled secondary section — "Account Settings" — separated by a divider. These are necessary but should not define the page.

Typography follows the existing Oswald/body-text pairing. No new typefaces. Sharp corners throughout. No floating cards within the profile — use sectional dividers instead.

---

## Success Criteria

- **SC-001**: ~~Auth state indicator — deferred (UX-005 parked).~~
- **SC-002**: ~~Auth indicator navigation — deferred (UX-005 parked).~~
- **SC-003**: Profile page displays name and club prominently; a usability review confirms the page no longer reads as a "raw settings form."
- **SC-004**: Profile fields (display name, club name) save successfully and persist across browser sessions.
- **SC-005**: `npm run lint && npx tsc --noEmit` passes with zero new errors after implementation.
- **SC-006**: WCAG AA contrast (4.5:1 minimum) is met on all new text elements introduced in the profile page.
- **SC-007**: ~~Auth indicator routes — deferred (UX-005 parked).~~

---

## Assumptions

- The `user_profiles` table exists and contains all required columns: `display_name` (nullable text) and `club_name` (nullable text). No migration required.
- Profile rows always exist for authenticated users — a DB trigger (`handle_new_user`) auto-creates a `user_profiles` row when an auth account is created. No app-level upsert is needed.
- Display name is pre-populated from the OAuth provider (Google/Apple/GitHub) on first sign-in and stored as a writable `display_name` column in `user_profiles`. Coaches may override it at any time via the profile page.
- No avatar image upload is in scope for Phase 2g. Avatars are sourced from the OAuth provider profile picture only. User-uploaded avatars are deferred.
- "Log In" (not "Sign In" or "Register") is the preferred CTA label per the existing auth flow's language.
- `club_name` is a free-text field (confirmed). No predefined list or reference data source is required in Phase 2g. A structured dropdown is a future drop-in — the `text` column type supports this without a schema migration. `region` was dropped from Phase 2g scope; `club_name` provides sufficient coaching identity context.

---

## Out of Scope (Phase 2g)

- **Auth state indicator in header** (UX-005) — parked as potentially redundant given "My Playbook" nav signal; revisit post-launch if user confusion is reported
- Avatar image upload or crop UI (deferred — OAuth provider photo is sufficient for launch)
- Public-facing coach profile pages visible to other users (Phase 4+)
- Club verification or affiliation management (requires partnership integration)
- Multi-account or organization-level profiles (Constitution Tier 4 — Phase 4+)
- Profile statistics (number of drills created, most-viewed animation) — deferred to Phase 4
- Notification preferences (deferred — no notification system exists yet)
