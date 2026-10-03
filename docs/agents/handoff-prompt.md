# Continue the coaching-animator restart

You are continuing work on github.com/footnote42/coaching-animator (local path `C:/Users/kenho/Projects/coaching-animator`, Windows, use Git Bash syntax). All restart work is on branch `restart`; `main` is production and must not be touched.

## Read first

1. `NOW.md` — current state, next steps, and the items waiting on the maintainer.
2. `CLAUDE.md` — conventions (API routes, Supabase clients, `@/` imports, no emojis, conventional commits).
3. `CONTEXT.md` — the domain glossary. Use its terms exactly: Practice, Step, Progression, Lever, Commentary, Practice Script, Area, Pace, Coach, Guest, Gallery.
4. `docs/adr/`, `docs/constraints.md` (no telemetry or analytics, no ads, no paywalls), `SECURITY.md`.
5. The spec: `gh issue view 46`. Each ticket: `gh issue view <n> --comments`.

## Rules

- Work on `restart` or a branch cut from it. Never push to or merge into `main`.
- Never touch the production Supabase database or Vercel settings. Schema changes go in `supabase/migrations/` as files only.
- Before every commit you push, run and pass all four: `npm run lint`, `npx tsc --noEmit`, `npx vitest run`, `npm run build`. Do not commit `public/sw.js` or `.claude/settings.local.json`.
- Commit messages are conventional and end with `Closes #<n>`.
- After a ticket lands on `restart`, push `restart` and close the issue with `gh issue close <n> -c "Landed on branch restart (<sha>). <one line>"`.
- Do not close #51, #52 or #65. They need the maintainer.
- Keep diffs minimal and add no speculative abstractions. Reuse what exists in `src/features/practice/`.

## Work, in order

1. **#64, #66 and #43 are done** (on `restart`). Skip them. The E2E spec is `tests/e2e/guest-coach-viewer.spec.ts`; CI runs it in the `e2e` job against a local Supabase. See `NOW.md` for how to run it locally.
2. **#38: Lighthouse baseline.** Only after the maintainer has cut over to production. Otherwise leave it.

## When you stop

- Update `NOW.md`: Status, Next, and Waiting on you.
- Commit, and push `restart`.
- List every issue you closed and anything you skipped, with reasons.
