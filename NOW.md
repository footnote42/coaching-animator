# NOW — coaching-animator

## Status
LIVE at coaching-animator.waynetellis.com. Iteration 2 (spec #72): batch 1 (fixes) and batch 2 (Tags, Source, personal tokens, account deletion, 404s, ball choice) are done and deployed. Batch 3 so far: #80 richer Gallery cards and Tag filter, #82 the skill and Ask your AI button, the full editor on phones (#107), and #84 the MCP endpoint (live, but the AI flow needs work: see below).

## Next
Frontier: rework the AI + MCP flow. First real try (Claude Code, MCP not connected) wrote a JSON file and pointed at localhost with a made-up "Import Practice" button instead of saving to the account. Fix the skill so it uses the MCP tools when present, make setup easier, and look at OAuth so claude.ai connectors work.
Then #81 card previews, #86 light/dark prototype (maintainer). Maintainer tickets: #92, #93.
- README needs a refresh (out of date since the restart).

## Waiting on you
- #76: sign up once on production with an email address and confirm the confirmation email arrives, then close #76.
- Rotate the DeepSeek API key, and the staging Supabase keys if `.env.staging` held real values.
- Remove the old Vercel env vars `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_BASE_URL`.
- Optional: delete the `VERCEL_TOKEN` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` GitHub secrets.
- Local leftovers safe to delete: `.specify/`, `archive/`, `prototype/*.html`, the `restart` branch, the two locked folders under `.claude/worktrees/` and the empty `../ca-s84` folder (after a reboot).

## Context
- Spec #72 (iteration 2) and its tickets #73-#93; spec #46 (restart, done). Glossary `CONTEXT.md` (Tag and Source added), ADRs `docs/adr/` (0004: AI stays outside the app), constraints `docs/constraints.md`, `SECURITY.md`.
- Code: `src/features/practice/`; editor state lives in `hooks/useEditorWorkspace.ts`. Routes: /practice, /p/[id], /gallery, /my-practices, /feedback, /admin, /practice-script/v1/{guide,guide.md,schema.json}.
- Contact: hello@waynetellis.com. Feedback is stored in the `feedback` table and read in /admin.
- Migrations: CI runs `supabase db push` to production on every push to `main`. Never apply migrations by hand without recording them.
- Parallel work: every agent (Claude or Antigravity) works in its own git worktree, never in the main checkout. Claude's is `../ca-claude`; Antigravity uses `../ca-pro` and `../ca-flash`.
- Obsidian: `C:/Users/kenho/Obsidian/Second Brain/Projects/Coaching Animator/`.

## Blocker
None.

## Last session
2026-10-03: Batch 2 landed through three Sonnet agents and Antigravity: Tags (#78), Source (#79), personal tokens (#83), account deletion deletes the auth user via the service-role key (#98), missing Practices 404 (#68, root loading.tsx removed), editor ball choice (#71). Migrations 0603-0606 applied in order. Supabase CLI pinned in CI after a rate-limit failure.
