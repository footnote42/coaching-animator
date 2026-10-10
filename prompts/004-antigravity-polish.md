# Antigravity prompt: polish tickets (co-coach launch gate)

**Created**: 2026-10-10
**Run in**: two Antigravity workspaces at once, each in its own worktree: `../ca-pro` (list A) and `../ca-flash` (list B). Never work in the main checkout.

## Lists

- **List A (`../ca-pro`)**: #193 delete confirm, #194 Share on private cards, #197 Feedback in nav, #202 Script box under Advanced
- **List B (`../ca-flash`)**: #196 tap targets and form labels, #200 tool name and description, #198 one Commentary toggle

The two lists don't touch the same files, apart from #198 and #202, which both touch `PracticeImport.tsx` in different places. Keep those edits small.

## Per ticket

1. Read the ticket: `gh issue view <n>`. Also read `CLAUDE.md`, `CONTEXT.md` (vocabulary: Practice, Step, Progression, Commentary, Tag) and `.impeccable.md` (design rules).
2. Start a fresh branch from the latest main: `git fetch origin && git checkout -B ticket/<n> origin/main`.
3. Make the smallest change that meets every acceptance box. Match the surrounding code style. Use existing components (Button, dialogs, toasts from `sonner`), and add no new dependencies.
4. Add or update a Vitest test for the behaviour.
5. Commit: `git commit -m "fix: <what> (#<n>)"`. The pre-commit hook runs tsc, eslint and vitest; it must pass. **Never use `--no-verify`.**
6. **Do not push, open a PR, or close the issue.** The maintainer's Claude session reviews and merges.
7. Move on to the next ticket in your list.

## Rules

- UK English in all user-facing text, no emojis, and plain words for volunteer coaches.
- No analytics, tracking or third-party scripts (`docs/constraints.md`).
- If a ticket is unclear or needs a decision, stop that ticket, write the question in your report, and go on to the next.
- If tests that you didn't touch start failing, report it; don't "fix" them by weakening them.

## Report

When your list is done, write `walkthrough-2026-10-10/POLISH-<A|B>.md` in your workspace, with one line per ticket: `#<n> | branch | commit hash | done / blocked: <why> | files changed`.
