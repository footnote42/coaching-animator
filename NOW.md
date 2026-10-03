# NOW — coaching-animator

## Status
LIVE at coaching-animator.waynetellis.com. Iteration 2 (spec #72) in progress: batch 1 (fixes) is done and deployed. Google sign-in branding is verified; email sign up uses Resend SMTP from waynetellis.com.

## Next
Batch 2 and 3 frontier (no blockers):
- #98 account deletion removes the auth user and Practices (the Privacy Policy and Terms promise it; delete by hand until then).
- #78 Tags, #79 Source (each adds a migration; merge one at a time).
- #83 personal tokens (Antigravity, Gemini Pro High).
- #68 missing Practice returns 404, #71 choose the ball in the editor.
Then #80 Gallery cards, #82 skill, #84 MCP. Maintainer tickets: #86, #92, #93.

## Waiting on you
- #76: sign up once on production with an email address and confirm the confirmation email arrives, then close #76.
- Rotate the DeepSeek API key, and the staging Supabase keys if `.env.staging` held real values.
- Remove the old Vercel env vars `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_BASE_URL`.
- Optional: delete the `VERCEL_TOKEN` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` GitHub secrets.
- Local leftovers safe to delete: `.specify/`, `archive/`, `prototype/*.html`, the `restart` branch, and the two locked folders under `.claude/worktrees/` (after a reboot).

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
2026-10-03: Grilled user feedback into spec #72 and tickets #73-#93. Engine gained receive-pass-run and up to 3 balls (#69, #70); circle passing Practice seeded. Batch 1 landed: footer and contact (#73), feedback storage (#74), sign in leads with email sign up (#75), share view phone player (#77), editor workspace hook and light phone editor (#85). Privacy Policy and Terms rewritten; Google verification passed. Filed #98 (account deletion gap).
