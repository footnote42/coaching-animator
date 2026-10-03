# NOW — coaching-animator

## Status
IN PROGRESS (2026-10-03). Restart is on branch `restart` (pushed). `main` is untouched and still serves production. Closed on `restart`: #25 #29 #30 #33 #35 #40 #44 #45 #47–#50 #53–#63 #67.

## Next
1. #64 (switch every route to Practices, delete old model). A cloud agent was working on branch `agent/64-switch-over`. If that branch exists on origin, review and merge it into `restart`; otherwise redo #64.
2. #66 (E2E Guest → Coach → viewer) + #43 (CI gate on local Supabase). Both need #64 merged first.
3. #38 (Lighthouse baseline) after cutover.
4. Cutover (you): apply migrations, merge `restart` → `main`, then #65.

## Waiting on you
- #51: approve terms/privacy/18+ wording (marked `REVIEW #51` in the terms page). Note the invented 14-day reply target.
- #52: review the OSA risk assessment draft `docs/legal/osa-risk-assessment.md`, date it, remove DRAFT.
- #65: production DB reset. Apply migrations in order: 20260301000000_practices, 20260302000000_practices_shared_lookup, 20260303000000_practice_moderation, 20260401000000_rate_limit_hit, 20260501000000_age_confirmed_at, then #64's reset migration.
- Rotate the staging Supabase keys if `.env.staging` held real values (it was in git history).
- Remove the old Vercel env vars `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_BASE_URL`. If `NEXT_PUBLIC_SITE_URL` is unset, the canonical origin is used.
- Local leftovers that are safe to delete: `.specify/`, `archive/` (untracked), and `prototype/brand.html` / `roadmap.html` (keep or delete).

## Context
- Spec #46, glossary `CONTEXT.md`, ADRs `docs/adr/`, constraints `docs/constraints.md`, `SECURITY.md`.
- New code: `src/features/practice/` (engine, schema, area, editing, components, docs/guide.md). Routes: /practice (editor), /p/[id] (share), /explore (Gallery, moves to /gallery in #64), /practice-script/v1/{guide,guide.md,schema.json}.
- Agent guide blind test passed: a fresh model wrote a valid script from the guide alone (#61).
- Obsidian: `C:/Users/kenho/Obsidian/Second Brain/Projects/Coaching Animator/`. PRD, ROADMAP and DevPlan are marked superseded.

## Blocker
None for agents. Production cutover needs your go-ahead.

## Last session
2026-10-03: orchestrated sub-agents (local plus cloud) through the restart tickets on `restart`; merged and verified each branch (lint, tsc, vitest, build).
