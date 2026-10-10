# NOW — coaching-animator

## Status
IN PROGRESS — spec #140 built and verified on production; human feel review next. LIVE at coaching-animator.waynetellis.com. Iteration 2 (spec #72): batch 1 (fixes) and batch 2 (Tags, Source, personal tokens, account deletion, 404s, ball choice) are done and deployed. Batch 3 so far: #80 richer Gallery cards and Tag filter, #82 the skill and Ask your AI button, the full editor on phones (#107), #84 the MCP endpoint, #109 the skill saves straight to the account over MCP (tested end to end), #110 copy-ready MCP setup on /profile and #81 Gallery card previews. Batch 4 done: #87 light theme with dark toggle, #88 landing rewrite, #89 new look, #90 Help and How-to, #91 desktop Lighthouse and mobile checklist, #119 share from My Practices, #122 accessibility fixes, #123 README. #121 Google sign-in on our own pages is merged but inert until configured. Spec #140 built (see Next). Passing and kit batch done: #128 Direction of attack + forward-pass warning, #129 catch point picker, #130 early-receiver warning, #131 pass when a Run finishes (draw and pass), #136 cone colours, #137 kicks. All merged, none tried in a browser yet. #76 closed (2026-10-07): Resend SMTP live, sign-up confirmations come from noreply@waynetellis.com; Google consent screen branded.

## Next
Spec #140 (animation flow, kicking and kit) is built and merged: #141-#153 plus #164 and #169. Production Playwright checks (`tests/e2e/prod-spec140.spec.ts`, PR #171; run with the e2e test account, see Context) pass 19 of 19 on desktop chromium and iPhone 13 WebKit (rerun 2026-10-09 after #172): hero (no one stops over 0.15 s), canvas steady on select, toolbar groups, Tags in 4 groups, Pass/Kick and kick to space with Collect, cone split button, Lying shield and bag, Release and per-waypoint Pace, signed-in Save to My Practices and delete. #172 (portrait canvas covering Play on WebKit phones) fixed in PR #173; CI now runs a WebKit phone canvas spec. Screenshots and hero video in the session scratchpad `prod140/`. Left for you:
1. Watch the hero and a few examples for feel; Release only moves example 09 by 0.2 s, so check it reads as a pass on the run.
2. On a phone the Commentary overlay covers much of the top of the canvas by default: keep or change?
3. Real iPhone: cone placement and the phone layout.
4. Tune by eye: `RUN_ACCELERATION_MPS2` (2), `RUN_TAPER_MPS2` (1.5), `KICK_ROLL_M` (2), `KICK_SPEED_MPS` (4).
5. Confirm the layout defaults chosen for you: Details and save folds (not a sheet), phone uses folding groups (not tabs), Tags shown in 4 headed groups.
Possible follow-ups (raise tickets if wanted): corners at waypoints are sharp (no path rounding); "That would break a later Step" is misleading on Step 0 edits; tab order differs from screen order below 1024 px; the "Ball for new passes" picker now shows whenever there are 2 or more balls; CRLF/LF churn between cloud and local sessions (add `.gitattributes`); the early-catch warning may miss a catch that slides because of a draw-and-pass wait.
Then: re-author seeded Practice #1 (963b2f3c...) with Release and receiver timing, resume seeding, then #92 and #93.
- Build lessons: `claude --cloud` needs an interactive TTY, so a coordinating Claude session cannot launch cloud sessions; the Agent tool's remote isolation silently falls back to local worktrees. Local agent worktrees have a real node_modules, so `git worktree remove --force` is safe for them.
- MCP setup friction logged in IDEAS.md (2026-10-07); revisit with the parked OAuth on `/api/mcp`.
- Re-run Lighthouse on production to confirm editor CLS under 0.1 (the #152 agent measured 0 on select at 1440, 1024 and 390 px locally).
- Not in #89: the Gallery's expandable Tag chip row from the prototype and the ruled-paper background. Raise a ticket if wanted.
- Vercel previews return DB_ERROR on `/api/practices/public` (production is fine): the preview environment's database is behind or misconfigured.
- Parked: OAuth on `/api/mcp` so claude.ai and desktop connectors can sign in without a token. Revisit when Coaches outside Claude Code need it.
- The skill is installed for Claude Code at `~/.claude/skills/coaching-animator` (a junction to `skill/coaching-animator` in the main checkout, so it updates on pull).
- Cloud sessions (claude.ai/code) work for tickets that need no local Supabase: environment setup script must cd into the repo before `npm ci` (it starts in /root).

## Waiting on you
- #121 Google sign-in: decide whether Google's script loading on login/register/profile fits docs/constraints.md; if yes, add the site origin to the Google OAuth client's JavaScript origins, add the client ID to Supabase's Google Authorized Client IDs (and enable manual identity linking), set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in Vercel, then test in a private window. Then submit Google branding verification.
- Best Practices is 77 on every route because Cloudflare injects its bot-detection script (`/cdn-cgi/challenge-platform`). Turn off JavaScript detections / Bot Fight Mode if you want it gone.
- Local leftovers safe to delete: `.specify/`, `archive/`, `prototype/*.html`, the `restart` branch, the locked folders under `.claude/worktrees/` (including `agent-af04391760a756731`) and the empty `../ca-s84` folder (after a reboot).

## Context
- Spec #72 (iteration 2) and its tickets #73-#93; spec #46 (restart, done). Glossary `CONTEXT.md` (Tag and Source added), ADRs `docs/adr/` (0004: AI stays outside the app), constraints `docs/constraints.md`, `SECURITY.md`.
- Code: `src/features/practice/`; editor state lives in `hooks/useEditorWorkspace.ts`. Routes: /practice, /p/[id], /gallery, /my-practices, /feedback, /admin, /practice-script/v1/{guide,guide.md,schema.json}.
- Contact: hello@waynetellis.com. Feedback is stored in the `feedback` table and read in /admin.
- Migrations: CI runs `supabase db push` to production on every push to `main`. Never apply migrations by hand without recording them.
- Parallel work: every agent (Claude or Antigravity) works in its own git worktree, never in the main checkout. Create with `scripts/worktree-add.sh <branch>`, remove with `scripts/worktree-remove.sh <dir>` (plain `git worktree remove` empties main node_modules through the junction). Antigravity uses `../ca-pro` and `../ca-flash`.
- Production test login `e2e-test@waynetellis.com`: credentials in gitignored `.env.e2e`, Playwright state in `.auth/coach.json`. Specs using it must skip without E2E_PASSWORD and delete what they save. Node fetch to supabase.co times out on this machine; use curl or the Supabase MCP.
- Obsidian: `C:/Users/kenho/Obsidian/Second Brain/Projects/Coaching Animator/`.
- MCP: one user-scope `coaching-animator` registration only; a leftover local-scope entry overrides it (that caused a 401 on 2026-10-07).

## Blocker
None. Seeding waits on the browser checks above.

## Last session
2026-10-09 — built and merged all of spec #140 (#141-#153) plus #164 and #169 with cloud sessions and local sub-agents. Created the production e2e test account; Playwright production checks (PR #171) found #172 (portrait canvas covered Play on WebKit phones), fixed in #173; now 19/19 pass. Lessons saved to memory.
