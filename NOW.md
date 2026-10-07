# NOW — coaching-animator

## Status
LIVE at coaching-animator.waynetellis.com. Iteration 2 (spec #72): batch 1 (fixes) and batch 2 (Tags, Source, personal tokens, account deletion, 404s, ball choice) are done and deployed. Batch 3 so far: #80 richer Gallery cards and Tag filter, #82 the skill and Ask your AI button, the full editor on phones (#107), #84 the MCP endpoint, #109 the skill saves straight to the account over MCP (tested end to end), #110 copy-ready MCP setup on /profile and #81 Gallery card previews. Batch 4 done: #87 light theme with dark toggle, #88 landing rewrite, #89 new look, #90 Help and How-to, #91 desktop Lighthouse and mobile checklist, #119 share from My Practices, #122 accessibility fixes, #123 README. #121 Google sign-in on our own pages is merged but inert until configured. Passing and kit batch done: #128 Direction of attack + forward-pass warning, #129 catch point picker, #130 early-receiver warning, #131 pass when a Run finishes (draw and pass), #136 cone colours, #137 kicks. All merged, none tried in a browser yet. #76 closed (2026-10-07): Resend SMTP live, sign-up confirmations come from noreply@waynetellis.com; Google consent screen branded.

## Next
PAUSED for a /grill-with-docs session (clean window) on animation quality and editor functionality; seeding and #92/#93 wait on its outcome. #72 relabelled ready-for-human (only maintainer tickets #92, #93 left).
When resumed: seeding Practices with AI help (skill + MCP) from the six ideas in IDEAS.md (2026-10-04 park entry). #1 (2 v 1 channel, draw and pass late) saved private: https://coaching-animator.waynetellis.com/practice?id=963b2f3c-69f4-4c38-91ea-5f7cd801be39 — check it plays right (3 v 2 may be cramped in the 7 m channel; carrier stops before passing). Then #2 traffic lights onwards. Then #92 England Rugby seeding and #93 polish audit.
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
- Parallel work: every agent (Claude or Antigravity) works in its own git worktree, never in the main checkout. Claude's is `../ca-claude`; Antigravity uses `../ca-pro` and `../ca-flash`.
- Obsidian: `C:/Users/kenho/Obsidian/Second Brain/Projects/Coaching Animator/`.
- MCP: one user-scope `coaching-animator` registration only; a leftover local-scope entry overrides it (that caused a 401 on 2026-10-07).

## Blocker
Animation quality and functionality issues need grilling before more seeding.

## Last session
2026-10-07: closed #76 (custom SMTP had not been enabled; fixed in the dashboard, verified with a plus-address sign-up). Fixed the MCP 401 (stale local-scope token). Seeded Practice #1 over MCP. Paused seeding to address animation quality and functionality.
2026-10-04 (later): grilled passing into #128-#131; added #136 cone colours and #137 kicks from feedback. All six built by Sonnet agents and merged (#132-#135, #138, #139). CONTEXT.md gains Run, Pass, Catch on the run, Direction of attack, Kick.
2026-10-04: merged #114-#118, #120 (look, landing, Help, Lighthouse, share link) and #124-#126 (README, Google ID-token sign-in, accessibility). #76 steer: email nearly done; Google route B chosen (free, #121).
2026-10-03 (later): #86 decided and closed. Orchestrated sub-agents for #87, #88, #89, #90, #91 and new #119 (share link from My Practices); all on PRs #114-#118 and #120, none merged yet.
2026-10-03: #84 MCP endpoint merged (#108). First AI + MCP try went wrong (no skill or MCP installed), so #109 made the skill MCP-first (#111) and the skill was installed for every location; the MCP server is registered for Claude Code at user scope and a test Practice saved to the account. #110 (#112) and #81 (#113) built in two cloud sessions and merged.
