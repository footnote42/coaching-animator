# NOW — coaching-animator

## Status
LIVE at coaching-animator.waynetellis.com. Iteration 2 (spec #72): batch 1 (fixes) and batch 2 (Tags, Source, personal tokens, account deletion, 404s, ball choice) are done and deployed. Batch 3 so far: #80 richer Gallery cards and Tag filter, #82 the skill and Ask your AI button, the full editor on phones (#107), #84 the MCP endpoint, #109 the skill saves straight to the account over MCP (tested end to end), #110 copy-ready MCP setup on /profile and #81 Gallery card previews. Batch 4 done: #87 light theme with dark toggle, #88 landing rewrite, #89 new look, #90 Help and How-to, #91 desktop Lighthouse and mobile checklist, #119 share from My Practices, #122 accessibility fixes, #123 README. #121 Google sign-in on our own pages is merged but inert until configured. Passing and kit batch done: #128 Direction of attack + forward-pass warning, #129 catch point picker, #130 early-receiver warning, #131 pass when a Run finishes (draw and pass), #136 cone colours, #137 kicks. All merged, none tried in a browser yet. #76 closed (2026-10-07): Resend SMTP live, sign-up confirmations come from noreply@waynetellis.com; Google consent screen branded.

## Next
Build spec #140 (animation flow, kicking and kit) with cloud sessions, coordinated from a CLI session. GitHub is the bus: one ticket per cloud session, one branch and PR each (`Closes #N`); the CLI recomputes the frontier (open sub-issues of #140 with no open blockers), launches or hands out prompts, reviews PRs (`/code-review`) and merges on approval. Cloud sessions cannot message back; read their PRs and transcripts.
Waves (from the native blocked-by edges):
1. #141 prefactor (trying remote launch first), #146 Pass/Kick buttons, #149 cone split button, #150 Lying shield.
2. #142 easing, #147 Kick to space, #151 Tackle bag.
3. #144 receivers timed to the ball, then #143 Pace per segment (sequential: same engine code).
4. #145 Release, then #148 Collect (merge #145 first, rebase #148).
5. #153 hero 3 v 2, then #152 layout pass (short design review before code).
Per session: start from latest main; setup script must cd into the repo before `npm ci`; no local Supabase needed; checks are tsc, eslint, vitest. UI tickets (#146, #147, #149-#152) need a browser check on the Vercel preview, desktop and phone (guest mode works despite the preview DB_ERROR).
After #140: resume seeding (Practice #1 rechecked against the new hero), then #92 and #93.
- MCP setup friction logged in IDEAS.md (2026-10-07); revisit with the parked OAuth on `/api/mcp`.
- Try the new passing, kick and cone controls on a phone and tablet.
- Possible ticket: the early-catch warning misses a catch that slides because of a draw-and-pass wait.
- Kick speed is 4 m/s (a 20 m kick takes 5 s); tune `KICK_SPEED_MPS` if it feels slow.
- Re-run Lighthouse after #122 deployed to confirm editor CLS under 0.1 and the label fixes. Gallery cards no longer draw marker numbers (needed for the label audit).
- Not in #89: the Gallery's expandable Tag chip row from the prototype and the ruled-paper background. Raise a ticket if wanted.
- Vercel previews return DB_ERROR on `/api/practices/public` (production is fine): the preview environment's database is behind or misconfigured.
- Parked: OAuth on `/api/mcp` so claude.ai and desktop connectors can sign in without a token. Revisit when Coaches outside Claude Code need it.
- The skill is installed for Claude Code at `~/.claude/skills/coaching-animator` (a junction to `skill/coaching-animator` in the main checkout, so it updates on pull).
- Cloud sessions (claude.ai/code) work for tickets that need no local Supabase: environment setup script must cd into the repo before `npm ci` (it starts in /root). #110 and #81 were built this way.

## Waiting on you
- #121 Google sign-in: decide whether Google's script loading on login/register/profile fits docs/constraints.md; if yes, add the site origin to the Google OAuth client's JavaScript origins, add the client ID to Supabase's Google Authorized Client IDs (and enable manual identity linking), set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in Vercel, then test in a private window. Then submit Google branding verification.
- Best Practices is 77 on every route because Cloudflare injects its bot-detection script (`/cdn-cgi/challenge-platform`). Turn off JavaScript detections / Bot Fight Mode if you want it gone.
- Rotate the DeepSeek API key, and the staging Supabase keys if `.env.staging` held real values.
- Remove the old Vercel env vars `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_BASE_URL`.
- Optional: delete the `VERCEL_TOKEN` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` GitHub secrets.
- Local leftovers safe to delete: `.specify/`, `archive/`, `prototype/*.html`, the `restart` branch, the two locked folders under `.claude/worktrees/` and the empty `../ca-s84` folder (after a reboot).

## Context
- Spec #72 (iteration 2) and its tickets #73-#93; spec #46 (restart, done). Glossary `CONTEXT.md` (Tag and Source added), ADRs `docs/adr/` (0004: AI stays outside the app), constraints `docs/constraints.md`, `SECURITY.md`.
- Code: `src/features/practice/`; editor state lives in `hooks/useEditorWorkspace.ts`. Routes: /practice, /p/[id], /gallery, /my-practices, /feedback, /admin, /practice-script/v1/{guide,guide.md,schema.json}.
- Contact: hello@waynetellis.com. Feedback is stored in the `feedback` table and read in /admin.
- Migrations: CI runs `supabase db push` to production on every push to `main`. Never apply migrations by hand without recording them.
- Parallel work: every agent (Claude or Antigravity) works in its own git worktree, never in the main checkout. Create with `scripts/worktree-add.sh <branch>`, remove with `scripts/worktree-remove.sh <dir>` (plain `git worktree remove` empties main node_modules through the junction). Antigravity uses `../ca-pro` and `../ca-flash`.
- Obsidian: `C:/Users/kenho/Obsidian/Second Brain/Projects/Coaching Animator/`.
- MCP: one user-scope `coaching-animator` registration only; a leftover local-scope entry overrides it (that caused a 401 on 2026-10-07).

## Blocker
None. Seeding waits on #140.

## Last session
2026-10-08: grilled animation quality and editor kit (19 decisions). ADR 0005 (receivers are timed to the ball) and 0006 (kicks can go to space), glossary terms Release, Kick to space, Collect, Lying, Tackle bag. Spec #140 and tickets #141-#153 with native blocked-by edges. Planned the cloud-session build.

2026-10-07 (later): retro over the last 10 sessions. Unit tests now block CI and run in pre-commit (dot reporter); ESLint enforces the @/ alias; worktree add/remove scripts; CLAUDE.md trimmed (schema pointer, one batch per session); skill skips the guide fetch on the MCP route. Earlier today: closed #76, fixed the MCP 401, seeded Practice #1, paused seeding for animation quality.
