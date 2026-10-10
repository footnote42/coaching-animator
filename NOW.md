# NOW — coaching-animator

## Status
IN PROGRESS — making it ready for co-coaches. LIVE at coaching-animator.waynetellis.com, now on Next 16.4 / React 19 (#190). Audit follow-ups shipped 2026-10-10: DB privilege hardening (#212, migration applied, advisor clean except the 3 intentional public functions and leaked-password protection), redirect-only Google sign-in plus tighter headers (#183), safe auth redirects and API tidy (#214), copyable error details (#188), engine-throw guard (#189), api-client error messages (#216). Practices "Ruck, pass out and reset (with holds)" (f91aa50d), "Now v Target" (2a911fad) and "Square passing" (352097e7) prove realistic plays work.

## Next
Run one agent batch for #219-#224 (lint rules, legal-pages E2E, sign-in lands on My Practices, editor list removal, My Practices buttons, site map removal), then the polish audit (#93), rescoped for the co-coach launch (see Open).

## Open
- #93 rescope: audit production as a co-coach first sees it (landing, sign-up, editor on phone and desktop, share view, Gallery). Skip what the 2026-10-10 security, compliance and Lighthouse audits covered; re-check Lighthouse only because Next 16 changed the build.
- Ready for agents: #219 (re-enable 3 react-hooks rules, 26 spots), #220 (stale legal-pages E2E), and from the 2026-10-10 click-through #221 (sign-in lands on /my-practices), #222 (drop the Practice list from /practice), #223 (My Practices button row), #224 (remove /sitemap-page, keep sitemap.xml). #221 and #222 both touch sign-in/editor flows: run them in sequence.
- #225 spec: admin Practices list with bulk hide/delete, and member stats (own data only, no tracking). Next step `/to-spec`.
- #178 left: item 2 (fail closed for report/feedback), item 12 (safeguarding nudge). Leaked-password protection is Pro-only: accepted risk.
- #186 left: items 3 (theme localStorage, privacy §9), 5 (provider tokens), 8 (ban record retention), 9 (Cloudflare email obfuscation).
- Practice Lab: watch 352097e7 play (defender Progression, team A filing round vs team B's run) before publishing. First skill change waiting for a review: ask which end the ball starts on and whether a line holds until its first player has the ball.
- #209: Coach rebuilds the original ruck Practice (fb67f1e5) with holds. #203: real-iPhone check of swipe, drag, tap, long-press.
- Vercel preview deployments have no `SUPABASE_SERVICE_ROLE_KEY`, so previews fail any DB route; verify on a local `next start` with `.env.local` or on production.
- Between 768 and 1279px the Selection panel stays above the canvas; revisit if tablet Coaches complain.

## Waiting on you
- Decide #178 items 2 and 12, #186 items 3, 5, 8, 9; then close both.
- Review the 11 legal MAINTAINER flags.
- Google branding verification (#121): the GIS button is gone, so only the consent-screen branding remains.
- Best Practices is 77 on every route because of Cloudflare's bot-detection script; turn off JavaScript detections / Bot Fight Mode if you want it gone.
- Local leftovers safe to delete: `.specify/`, `archive/`, `prototype/*.html`, the `restart`, `ticket/198`, `ticket/202` branches, remote branches `fix/178-db-privileges`, `fix/183-pkce-only-headers`, `fix/188-error-details`, `fix/189-engine-guard`, and three orphan folders under `.claude/worktrees/`.

## Context
- Practice Lab: `/practice-debrief` after each agent-built Practice, `/practice-debrief review` every 5 raw debriefs or monthly; notes in Obsidian `03-Practice-Lab/`. Skill edits come from reviews only, into `skill/coaching-animator/SKILL.md`.
- Holds and reach: ADR `docs/adr/0007-holds-and-reach.md`; guide section "Waits: after, hold and reach"; skill example `10-ruck-and-recycle.json`.
- Glossary `CONTEXT.md`, ADRs `docs/adr/`, constraints `docs/constraints.md`, `SECURITY.md`.
- Next 16: `src/middleware.ts` is now `src/proxy.ts`; lint is the ESLint CLI with `eslint.config.mjs`; Turbopack builds, `canvas` aliased to `src/lib/empty-module.js`; request APIs (`cookies()`, `params`) are async.
- Code: `src/features/practice/`; editor state in `hooks/useEditorWorkspace.ts`; wait pickers in `components/WaitPicker.tsx`.
- E2E: the script box is folded by default (#202); open it with `tests/e2e/script-box.ts`. A failed E2E in CI skips the production migration.
- Migrations: CI runs `supabase db push` to production on every push to `main`. Never apply migrations by hand. New tables need their own REVOKEs (#212 only covered existing ones).
- Parallel work: agents use `isolation: "worktree"` (real node_modules). `scripts/worktree-add.sh` worktrees and `../ca-pro`, `../ca-flash` (Antigravity, on main as of 2026-10-10) junction node_modules: never `git worktree remove --force` them; use `scripts/worktree-remove.sh`.
- Production test login `e2e-test@waynetellis.com`: credentials in gitignored `.env.e2e`. Node fetch to supabase.co times out here; use curl or the Supabase MCP.
- Obsidian: `C:/Users/kenho/Obsidian/Second Brain/Projects/Coaching Animator/`.
- MCP: one user-scope `coaching-animator` registration only.

## Blocker
None.

## Last session
2026-10-10 — Delivered the audit and hardening route with sub-agents: #211-#218 merged (DB privileges, headers and redirect-only Google sign-in, auth redirects, error details, engine guard, api-client, Next 16); #191 closed (check /admin daily); follow-ups #219, #220 filed; #140 closed. Maintainer click-through on Next 16 passed; findings filed as #221-#225.
