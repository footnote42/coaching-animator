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

1. **#64: switch over and delete the old model.**
   - Check `git fetch origin && git branch -r | grep agent/64`. If `origin/agent/64-switch-over` exists, a previous agent did this work. Review it, merge it into `restart`, resolve conflicts, verify, push, and close #64.
   - If it doesn't exist, implement #64 per the issue. The route decisions are already made:
     - `/practice` stays the editor, and `/app` redirects to it.
     - The Gallery moves from `/explore` to `/gallery`, and `/explore` redirects there.
     - `/my-practices` is a new page, and `/my-gallery` redirects to it.
     - `/p/[id]` is the share view, and `/share/:id` and `/replay/:id` redirect to `/p/:id`.
   - Delete:
     - the old `src/features/animation` and `src/features/gallery`. First move any hooks the new code imports.
     - payload V1/V2, collections, version history, GIF export, replay, PWA/offline (serwist and `sw.ts`), and old API routes.
     - unused dependencies, and the duplicate thumbnail (keep one of GalleryThumbnail and PracticeThumbnail).
   - Write a reset migration, dated after `20260501000000`. It keeps auth users, `user_profiles`, `rate_limits`, `moderation_blocklist`, `practices` and `practice_reports`. It drops `saved_animations`, `animation_versions`, `collections`, `collection_items`, `upvotes` and `content_reports`, plus anything only those tables use.
   - Update `database.types.ts`, and rewrite CLAUDE.md's architecture sections for the Practice model.
2. **#66: end-to-end test, Guest to Coach to viewer**, in Playwright against localhost (`playwright.config.ts` already defaults to it).
   - Guest: import an example script, play it, Copy script, sign in, and keep the Practice.
   - Coach: add a Progression with a Lever, then share it.
   - Viewer at a phone viewport on `/p/[id]`: step to the last Progression, toggle Commentary, and change speed.
   - Delete the old core-loop and share-and-replay specs. Use role- and label-based selectors.
3. **#43: CI gate.**
   - Decision: CI runs a local Supabase (`supabase start` applies the repo migrations). `.github/workflows/ci.yml` already has a `test-migrations` job that does this.
   - Add an e2e job that builds, starts the app against the local Supabase, runs the #66 spec, and uploads the Playwright report.
   - Make the deploy jobs depend on it.
4. **#38: Lighthouse baseline.** Only after the maintainer has cut over to production. Otherwise leave it.

## When you stop

- Update `NOW.md`: Status, Next, and Waiting on you.
- Commit, and push `restart`.
- List every issue you closed and anything you skipped, with reasons.
