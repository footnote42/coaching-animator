# NOW — coaching-animator

## Status
IN PROGRESS — making it ready for co-coaches. LIVE at coaching-animator.waynetellis.com. Holds and reach (#192: #204-#208) shipped 2026-10-10, plus the polish batch (#193-#202, #195, #199, #201, #203) and the desktop Selection panel fix (#210). Two agent-built test Practices prove realistic plays work: "Ruck, pass out and reset (with holds)" (f91aa50d) and "Now v Target: after the tackle (U11 9v9)" (2a911fad), both adjusted by the Coach.

## Next
Settle the pending decisions on #188 and #191, then start the polish audit (#93).

## Open
- #209: Coach rebuilds the original ruck Practice (fb67f1e5) with holds in the editor, eventually. The new desktop layout (#210) is ready for it.
- #203: phone panel and canvas scroll need a real-iPhone check; no iPhone available, so rely on the WebKit phone E2E or find a device.
- Between 768 and 1279px the Selection panel stays above the canvas and can still scroll for a busy waypoint; fine for now, revisit if tablet Coaches complain.
- Hold friction settled 2026-10-10: plays wait until a ball is caught (fine for teaching); a defender meeting the ball carrier reads as a tackle; `setMove` replacing `after` is documented for AI authors, with no code change.

## Waiting on you
- Review the 11 legal MAINTAINER flags.
- Gallery tidy-up: remove TEST 1 and the duplicate "Circle passing"; rewrite "V Shape Tackle Race".
- #121 Google sign-in: decide whether Google's script loading on login/register/profile fits docs/constraints.md; if yes, add the site origin to the Google OAuth client's JavaScript origins, add the client ID to Supabase's Google Authorized Client IDs (and enable manual identity linking), set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in Vercel, then test in a private window. Then submit Google branding verification.
- Best Practices is 77 on every route because of Cloudflare's bot-detection script; turn off JavaScript detections / Bot Fight Mode if you want it gone.
- Local leftovers safe to delete: `.specify/`, `archive/`, `prototype/*.html`, the `restart` branch, old folders under `.claude/worktrees/` (use `scripts/worktree-remove.sh`), possibly `../ca-pro` and `../ca-flash`.

## Context
- Holds and reach: ADR `docs/adr/0007-holds-and-reach.md`; guide section "Waits: after, hold and reach"; skill example `10-ruck-and-recycle.json`. The skill at `~/.claude/skills/coaching-animator` links to the repo, so it updates on pull.
- Glossary `CONTEXT.md`, ADRs `docs/adr/`, constraints `docs/constraints.md`, `SECURITY.md`.
- Code: `src/features/practice/`; editor state in `hooks/useEditorWorkspace.ts`; wait pickers in `components/WaitPicker.tsx`.
- E2E: the script box is folded by default (#202); open it with `tests/e2e/script-box.ts`. A failed E2E in CI skips the production migration.
- Migrations: CI runs `supabase db push` to production on every push to `main`. Never apply migrations by hand.
- Parallel work: every agent works in its own worktree (`scripts/worktree-add.sh`, remove with `scripts/worktree-remove.sh`). Antigravity uses `../ca-pro` and `../ca-flash`. Cherry-picks skip the hook: run tsc and vitest after.
- Production test login `e2e-test@waynetellis.com`: credentials in gitignored `.env.e2e`. Node fetch to supabase.co times out here; use curl or the Supabase MCP.
- Obsidian: `C:/Users/kenho/Obsidian/Second Brain/Projects/Coaching Animator/`.
- MCP: one user-scope `coaching-animator` registration only.
- Selection panel: from xl (1280px) it renders in the right column (`SelectionPanel side`), otherwise above the canvas; `tests/e2e/selection-panel-desktop.spec.ts` guards it at 1440x900.

## Blocker
None.

## Last session
2026-10-10 — #210: the Selection panel moved beside the canvas from 1280px up (stacked label/control, full-row wait pickers), so the canvas gained about 135px; the new E2E test passes.
