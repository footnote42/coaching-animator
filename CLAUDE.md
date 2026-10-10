# coaching-animator

## Purpose
Next.js editor for rugby coaching Practices: coaches draw, animate, save and share a Practice and its Progressions on a Konva canvas, with Supabase for auth and storage.

## Status
Active. Phase 2 complete; working through the audit DevPlan (see `NOW.md` for current state and next action).

## Workflow
`/to-spec` → `/to-tickets` → GitHub issues → implement. Use `/park` to end sessions — updates `NOW.md` (repo root) and optionally captures ideas to Obsidian. One ticket batch per session: when a batch is merged, suggest `/park` then `/clear` before starting the next.

## Key Paths
- Session state: `NOW.md` (repo root — single source of truth, updated via `/park`)
- Practice model: `src/features/practice/` (engine, schema, editing, components)
- API routes: `src/app/api/`
- DB schema: `src/lib/supabase/database.types.ts` (generated; source is `supabase/migrations/`). Read it before writing SQL: table names have changed (`practices`, not `user_animations`)
- Binding constraints: `docs/constraints.md`
- Domain glossary: `CONTEXT.md`; decisions: `docs/adr/`

## Documentation

Planning and reference docs live in the Obsidian vault: `C:/Users/kenho/Obsidian/Second Brain/Projects/Coaching Animator/`
- `00-Planning/` — PRD v2.0, ROADMAP, ISSUES, audits, DevPlan tracker (`DevPlan.html` — the active worklist)
- `02-Reference/` — DB schema, API contracts, auth patterns, dev guides, troubleshooting, ops/CI runbooks
- `05-Archive/` — retired HANDOFF.md diary, old roadmaps, retrospectives

The repo keeps only repo-coupled docs: `docs/testing/`, `docs/user-guide/`, `docs/CHANGELOG.md`. The binding rules are in `docs/constraints.md`.

---

## Checks

The pre-commit hook runs `tsc`, `eslint` (including the `@/` path-alias rule) and `vitest`; a commit that lands has passed them. Dev server, E2E, build and worktree commands are in the `dev-commands` skill.

## Architecture: the Practice model

Vocabulary is in `CONTEXT.md`; the decision is ADR 0002.

- **Engine** (`src/features/practice/`): `schema.ts` (Zod schema, the source of `practice-script.schema.json`), `engine.ts` (`validate`, `resolveStep`, `positionsAt`), `area.ts` (templates, grid, pitch lines), `editing.ts` (pure edit operations), `markerColour.ts` (the single source of marker colours, from `src/shared/design-tokens.ts`).
- **Editor** `/practice` (`components/PracticeImport.tsx`): Konva canvas (`PracticeCanvas`, `PracticeEditLayer`), Step controls, script box, save form and My Practices list (`PracticeLibrary`, `MyPracticesList`). Guests keep work on their device (`hooks/useGuestPractice.ts`). `/practice?id=` opens a saved Practice.
- **Share view** `/p/[id]` (`PracticeShareViewer`): full-screen, plays each Step, no chrome. Link-shared rows are read one at a time through `get_shared_practice`.
- **Gallery** `/gallery` (`GalleryClient`, `/api/practices/public`): public, non-hidden Practices with `PracticeThumbnail` cards. **My Practices** `/my-practices`.
- **Moderation**: anyone can report (`/api/practices/[id]/report`); admins hide, delete, dismiss or ban from `/admin` (`PracticeReportsTab`, `/api/admin/practice-reports`).
- **Guide**: `/practice-script/v1/guide` (+ `guide.md`, `schema.json`) for Coaches and agents (ADR 0001).
- Old routes redirect in `next.config.js`: `/app`, `/explore`, `/my-gallery`, `/share/:id`, `/replay/:id`.

### Authentication Flow

1. **Proxy** (`src/proxy.ts`, the Next 16 name for middleware) calls `updateSession` on every request and guards `/my-practices` and `/admin`.
2. **`UserContext`** (`src/lib/contexts/UserContext.tsx`) exposes `user`, `profile`, `loading`, `isAdmin`, `signOut`.
3. **API routes** use `requireAuth()`, `requireNotBanned()` and `requireAdmin()` from `src/lib/server/auth.ts`, always with the server Supabase client.
4. **Guest mode**: the editor works signed out; saving needs an account.

### Supabase Client Rules

| Context | Use |
|---------|-----|
| Client components | `createSupabaseBrowserClient()` |
| Server components / API routes | `createSupabaseServerClient()` |
| Server components that only read | `createSupabaseServerClientReadOnly()` |

### API Routes

All routes live under `src/app/api/`. Conventions:
- Export `export const dynamic = 'force-dynamic'` and `export const runtime = 'nodejs'` at the top.
- Validate inputs with Zod schemas from `src/lib/schemas/`.
- Check rate limits via `checkRateLimit()` (`src/lib/server/rate-limit.ts`).

## Branding & Assets

The `BrandIcon` component (`src/shared/components/BrandIcon.tsx`) is the **single source of truth** for the site logo. Design tokens live at `src/shared/design-tokens.ts`.

## Quality Guardrails

- **Diagnostic Logging:** Use structured prefixes: `[Gallery API] Error: details`
- **Infrastructure Safety:** Use `staging` branch for high-risk changes (Auth, Middleware, DB Schema)
- **SSR Awareness:** Next.js App Router — always use provided Supabase clients (`lib/supabase/`) to prevent session drift
- **Auth Resilience:** `UserContext` has a 15s timeout for auth initialisation (mobile/network latency)

## Binding Constraints

**Absolute Prohibitions:**
- No telemetry, analytics, or tracking
- No third-party analytics services
- No advertising or sponsored content
- No paywalls for core features
- Permitted OAuth providers: Google, Apple, GitHub. Prohibited: Facebook/Meta, Twitter/X, LinkedIn, Discord
- Any non-essential cookie requires a consent banner before it ships

**Full list:** `docs/constraints.md`

## Design Context

See `.impeccable.md` for full design context (brand, aesthetic direction, principles, priority areas).

## Agent skills

### Issue tracker

GitHub Issues on `footnote42/coaching-animator` via `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: root `CONTEXT.md` + `docs/adr/` (created lazily). See `docs/agents/domain.md`.
