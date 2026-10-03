# Binding constraints

These rules bind every change to coaching-animator. They were carried over from the retired Speckit constitution (v3.4.0). A change that breaks one needs an ADR in `docs/adr/` that supersedes it first.

## Privacy and tracking

- No telemetry, analytics, tracking or user behaviour monitoring.
- No third-party analytics services (Google Analytics, Sentry, Mixpanel and similar).
- No device fingerprinting.
- No sale or sharing of user data with third parties, and no harvesting or selling coaching content without the coach's consent.
- Permitted exception: aggregated server-side counts with no user ID, session ID, IP address or fingerprint, no client-side scripts, no third-party sharing, and raw request logs deleted within 7 days.
- No embedded third-party players or widgets that carry tracking (YouTube and Vimeo embeds, tracking share buttons, third-party comment systems). Plain links are fine, with `rel="noopener noreferrer"`.

## Cookies

Any non-essential cookie requires a consent banner before it ships. Strictly necessary cookies (the Supabase auth session, for example) do not.

## Money

- No advertising or sponsored content, and no affiliate or referral links.
- No paywalls for core features. The free tier must give genuine value, including cloud storage.
- No cryptocurrency, NFT or blockchain integration.

## Sign-in providers

- Permitted OAuth providers: Google, Apple, GitHub, always through Supabase Auth with PKCE.
- Prohibited: Facebook/Meta, Twitter/X, LinkedIn, Discord, Microsoft.
- Email and password must always remain available. There are no OAuth-only accounts, and a user can set a password after OAuth sign-up.
- OAuth is for authentication only: request email and public profile scopes, store no OAuth tokens, and use no provider SDK for advertising or analytics.
- Accounts are 18+ by declaration (see `docs/adr/0003-accounts-are-18-plus.md`).

## User data

- Collect the minimum: email, optional display name, optional avatar URL.
- Content is private by default and published only by an explicit user action.
- Users can export and delete their data at any time. Account deletion removes all data within 30 days.

## Backend baseline

- Validate every input with a schema, and enforce payload size limits.
- Rate-limit write endpoints.
- Return generic error messages that leak nothing sensitive.
- Row-level security on every database table.

## Related

- Domain vocabulary: `CONTEXT.md`
- Decisions: `docs/adr/`
