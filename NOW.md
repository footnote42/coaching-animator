# NOW — coaching-animator

## Status
LIVE (2026-10-03). The Practice restart is merged to `main` and deployed at coaching-animator.waynetellis.com. The production DB was reset: tables are practices, practice_reports, user_profiles, rate_limits and moderation_blocklist, and all 7 accounts were kept.

## Next
1. #68: missing Practices return HTTP 200 instead of 404.
2. Seed the Gallery with a few good Practices: write them with Claude using the guide at /practice-script/v1/guide (ADR 0001 plan).

## Waiting on you
- Delete the `club-badges` storage bucket (Dashboard → Storage).
- Rotate the DeepSeek API key, and rotate the staging Supabase keys if `.env.staging` held real values.
- Remove the old Vercel env vars `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_BASE_URL`.
- Optional: delete the `VERCEL_TOKEN` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` GitHub secrets. The token was invalid; CI now only applies migrations and Vercel's Git integration deploys.
- Local leftovers that are safe to delete: `.specify/`, `archive/`, `prototype/*.html`, and the `restart` branch.

## Context
- Spec #46 (done), glossary `CONTEXT.md`, ADRs `docs/adr/`, constraints `docs/constraints.md`, `SECURITY.md`.
- Code: `src/features/practice/`. Routes: /practice, /p/[id], /gallery, /my-practices, /practice-script/v1/{guide,guide.md,schema.json}.
- Migrations: CI runs `supabase db push` to production on every push to `main`. 20260226 was repaired by hand on 2026-10-03; never apply migrations by hand without recording them.
- Obsidian: `C:/Users/kenho/Obsidian/Second Brain/Projects/Coaching Animator/`.

## Blocker
None.

## Last session
2026-10-03: Recorded Lighthouse 13.5.0 mobile baseline across production routes (/, /practice, /p/[id], /gallery). Documented in `docs/testing/lighthouse-mobile-baseline.md` and vault, closed #38. Earlier: production cutover, repaired migration history, merged `restart` into `main`, closed #65 and #46.
