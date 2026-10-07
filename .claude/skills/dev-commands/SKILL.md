---
name: dev-commands
description: Dev server, unit test, E2E test, and build commands for coaching-animator, including the non-obvious flags. Use when running the app locally, running Vitest or Playwright tests, building, or creating a worktree.
---

# coaching-animator — dev commands

```bash
# Development
npm run dev              # Next.js dev server (port 3000; increments if port is taken)

# Checks: the pre-commit hook already runs tsc, eslint and vitest on every commit
npm run lint             # ESLint
npx tsc --noEmit         # TypeScript type check

# Worktree for a parallel branch (shares node_modules via a junction)
scripts/worktree-add.sh feat/123-thing   # creates ../ca-feat-123-thing from origin/main
scripts/worktree-remove.sh ../ca-feat-123-thing feat/123-thing   # always remove this way:
# plain `git worktree remove` follows the junction and empties the main repo's node_modules

# Unit tests (Vitest)
npm test -- --run                        # Run all unit tests once
npm test -- --run src/core/utils/foo.ts  # Run a single test file
npm test                                 # Watch mode

# E2E tests (Playwright) — default target is production
BASE_URL=http://localhost:3001 npm run e2e          # Run all E2E against local dev
BASE_URL=http://localhost:3001 npm run e2e:headed   # Headed mode (see the browser)
BASE_URL=http://localhost:3001 npx playwright test tests/e2e/editor.spec.ts  # Single spec

# Build (may fail locally without Supabase env vars — OK, CI handles it)
npm run build
```

## Testing

### Unit Tests (Vitest)
Test files co-located with source: `*.test.ts` beside `*.ts`. Run a specific file:
```bash
npm test -- --run src/core/hooks/useCanvasSize.test.ts
```

### E2E Tests (Playwright)
E2E tests live in `tests/e2e/`. The default `BASE_URL` in `tests/e2e/.env.local` targets the deployed Vercel instance. Always set `BASE_URL=http://localhost:3001` (or whichever port `npm run dev` uses) when testing locally.

```bash
BASE_URL=http://localhost:3001 npx playwright test tests/e2e/editor.spec.ts --headed
```

**Before running E2E:** Confirm the dev server is running and which port it started on (Next.js increments if 3000 is taken).

### Manual Test Script
`docs/testing/MANUAL-TEST-SCRIPT.md` — full system verification script for playwright-cli sessions. Results are recorded in `docs/testing/TEST-RUN-*.md`.
