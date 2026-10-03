# NOW — coaching-animator

## Status
LIVE at coaching-animator.waynetellis.com. Iteration 2 (spec #72): batch 1 (fixes) and batch 2 (Tags, Source, personal tokens, account deletion, 404s, ball choice) are done and deployed. Batch 3 so far: #80 richer Gallery cards and Tag filter, #82 the skill and Ask your AI button, the full editor on phones (#107), #84 the MCP endpoint, #109 the skill saves straight to the account over MCP (tested end to end), #110 copy-ready MCP setup on /profile and #81 Gallery card previews.

## Next
Frontier: #86 light/dark prototype (maintainer), which unblocks #87 light theme, #88 landing page and #89 new look. Then #90 Help refresh and #91 Lighthouse and mobile checklist (after the look, or they need redoing). Maintainer tickets: #92, #93.
- Parked: OAuth on `/api/mcp` so claude.ai and desktop connectors can sign in without a token. Revisit when Coaches outside Claude Code need it.
- The skill is installed for Claude Code at `~/.claude/skills/coaching-animator` (a junction to `skill/coaching-animator` in the main checkout, so it updates on pull).
- README needs a refresh (out of date since the restart).
- Cloud sessions (claude.ai/code) work for tickets that need no local Supabase: environment setup script must cd into the repo before `npm ci` (it starts in /root). #110 and #81 were built this way.

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
2026-10-03: #84 MCP endpoint merged (#108). First AI + MCP try went wrong (no skill or MCP installed), so #109 made the skill MCP-first (#111) and the skill was installed for every location; the MCP server is registered for Claude Code at user scope and a test Practice saved to the account. #110 (#112) and #81 (#113) built in two cloud sessions and merged.
