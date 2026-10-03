# NOW — coaching-animator

## Status
IN PROGRESS (2026-10-03). Restart is on branch `restart` (pushed). `main` is untouched and still serves production. Closed on `restart`: #25 #29 #30 #33 #35 #40 #43 #44 #45 #47–#64 #66 #67.

## Next
1. #64, #66 (E2E `tests/e2e/guest-coach-viewer.spec.ts`) and #43 (CI `e2e` job on a local Supabase; deploys depend on it) are done.
2. #51 and #52 are reviewed, signed off and closed.
3. #38 (Lighthouse baseline) after cutover.
4. Cutover: apply migrations, merge `restart` → `main`, then #65. Confirm the `e2e` job passes on `main` after the merge.
5. Running the E2E locally: `npx supabase start`, then set `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` to the local values in the shell (they override `.env.local`, which points at production) and run `npx playwright test tests/e2e/guest-coach-viewer.spec.ts --project=chromium`. The spec skips if Supabase is not local.

## Waiting on you
- #65: production DB reset. Apply migrations in order: 20260301000000_practices, 20260302000000_practices_shared_lookup, 20260303000000_practice_moderation, 20260401000000_rate_limit_hit, 20260501000000_age_confirmed_at, then 20260601000000_restart_reset. Delete the club-badges storage bucket by hand. Decide whether to wipe existing practices rows.
- Rotate the staging Supabase keys if `.env.staging` held real values (it was in git history).
- Remove the old Vercel env vars `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_BASE_URL`. If `NEXT_PUBLIC_SITE_URL` is unset, the canonical origin is used.
- Local leftovers that are safe to delete: `.specify/`, `archive/` (untracked), and `prototype/brand.html` / `roadmap.html` (keep or delete).
- CI now also runs on pushes to `restart` (to prove the gate before cutover). Drop `restart` from the push trigger in `.github/workflows/ci.yml` once merged.
- Rotate the DeepSeek API key: it was echoed into agent logs and synced to OneDrive. It has moved out of the PowerShell profile into the Windows user environment; set the new key with `[Environment]::SetEnvironmentVariable('DEEPSEEK_API_KEY', '<new key>', 'User')`.

## Context
- Spec #46, glossary `CONTEXT.md`, ADRs `docs/adr/`, constraints `docs/constraints.md`, `SECURITY.md`.
- New code: `src/features/practice/` (engine, schema, area, editing, components, docs/guide.md). Routes: /practice (editor), /p/[id] (share), /gallery, /my-practices, /practice-script/v1/{guide,guide.md,schema.json}.
- Agent guide blind test passed: a fresh model wrote a valid script from the guide alone (#61).
- Obsidian: `C:/Users/kenho/Obsidian/Second Brain/Projects/Coaching Animator/`. PRD, ROADMAP and DevPlan are marked superseded.

## Blocker
None for agents. Production cutover needs your go-ahead.

## Last session
2026-10-03 (later): #66 E2E spec and #43 CI gate landed on `restart`. The spec passes locally on the dev server and on `next start`, both against a local Supabase. CSP `connect-src` now also allows a non-hosted Supabase origin (needed for local/CI; production unchanged).
