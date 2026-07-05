# coaching-animator

## Purpose
Next.js animation editor for rugby coaching — coaches create, save, and share animated play diagrams on a Konva canvas, with Supabase for auth and cloud storage.

## Status
Active. Phase 2 complete; working through the audit DevPlan (see `NOW.md` for current state and next action).

## Workflow
Speckit — `/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement`. Use `/park` to end sessions — updates `NOW.md` (repo root) and optionally captures ideas to Obsidian.

## Key Paths
- Session state: `NOW.md` (repo root — single source of truth, updated via `/park`)
- Editor: `src/features/animation/components/Editor.tsx`
- Stores: `src/core/stores/projectStore.ts`, `uiStore.ts`
- Canvas: `src/features/animation/components/Canvas/`
- API routes: `src/app/api/`
- Specs: `specs/`

## Documentation

Planning and reference docs live in the Obsidian vault: `C:/Users/kenho/Obsidian/Second Brain/Projects/Coaching Animator/`
- `00-Planning/` — PRD v2.0, ROADMAP, ISSUES, audits, DevPlan tracker (`DevPlan.html` — the active worklist)
- `02-Reference/` — DB schema, API contracts, auth patterns, dev guides, troubleshooting, ops/CI runbooks
- `05-Archive/` — retired HANDOFF.md diary, old roadmaps, retrospectives

The repo keeps only repo-coupled docs: `docs/testing/`, `docs/user-guide/`, `docs/CHANGELOG.md`. The binding constitution is `.specify/memory/constitution.md`.

---

## Environment

- **OS:** Windows 11, shell is bash (Unix syntax throughout — not PowerShell)
- **Paths in CLI tools:** Always use forward slashes (`C:/Users/kenho/...`) — backslashes break JSON configs and MCP registration
- **Windows quirk:** All `notebooklm` commands must be prefixed with `PYTHONUTF8=1` or the CLI crashes with a Unicode error

## Workflow

Use `/park` to end sessions cleanly — overwrites `NOW.md` at the repo root (Status / Next / Context / Blocker / Last session) and commits it. `NOW.md` is the single canonical location for session state. (Replaced the `/handoff` + HANDOFF.md diary on 2026-07-05; the old diary is archived in the vault.)

## Commands

```bash
# Development
npm run dev              # Next.js dev server (port 3000; increments if port is taken)

# Pre-Push CI Verification (run both before every push)
npm run lint             # ESLint
npx tsc --noEmit         # TypeScript type check

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

## Path Aliases (Use in ALL Imports)

```typescript
// ✅ Correct
import { useProjectStore } from '@/core/stores/projectStore';
import { Editor } from '@/features/animation/components/Editor';
import { Button } from '@/shared/ui/button';

// ❌ Wrong — never use relative imports across features
import { useProjectStore } from '../../core/stores/projectStore';
```

## Architecture

### Layer Map

```
src/
  app/          Next.js App Router pages + API routes
  core/         Domain model — types, Zustand stores, hooks, constants, utils
  features/     Feature modules (animation, gallery, legal)
  shared/       Cross-feature UI components and hooks
  lib/          Infrastructure — Supabase clients, auth helpers, schemas, contexts
```

### State: Two Zustand Stores

All editor state lives in two stores at `src/core/stores/`:

- **`projectStore`** — the animation data itself: `Project`, frames, entities, annotations, playback state. Serialised to localStorage and cloud. This is the source of truth for the canvas.
- **`uiStore`** — editor UI state only: selected entity, drawing mode, snap-to-grid, export dialog, ghost mode. Never persisted.

Both use Zustand `devtools` middleware. Components should subscribe to the narrowest slice they need.

### Canvas Rendering

The canvas is a **Konva/react-konva** stage (`Stage → Field → EntityLayer → AnnotationLayer → GhostLayer`). Key facts:

- **Internal coordinate system is 0–2000 × 0–2000** for both x and y. Entity positions in `projectStore` are in these units. Konva scales them to CSS pixels via the `useEditorCanvasSize` / `useShareCanvasSize` hooks (ResizeObserver).
- The `Editor` component is **dynamically imported with `ssr: false`** in `AnimationToolClient.tsx`. The canvas never renders on the server.
- Frame-to-frame entity movement uses **linear interpolation** (`src/core/utils/interpolation.ts`). The animation loop drives `playbackPosition` in `projectStore`, and `EntityLayer` reads it to lerp entity positions between keyframes.

### Share Payload Pipeline

Saved animations use two payload formats (both handled transparently):

| Format | Version field | Description |
|--------|--------------|-------------|
| V1 | `version: 1` | Legacy — entities + per-frame updates only |
| V2 | `version: 2` | Current — adds sport, annotations, colour, orientation, layering |

`serializeForShare(project)` → `SharePayloadV2` (stored in Supabase `payload` column)  
`hydrateSharePayload(payload)` → full `Project` (used by ShareViewer / ReplayViewer)  
`loadProject(data)` in `projectStore` validates and hydrates cloud payloads into store state.

### Authentication Flow

1. **Middleware** (`src/middleware.ts`) calls `updateSession` on every request — refreshes Supabase cookies server-side.
2. **`UserContext`** (`src/lib/contexts/UserContext.tsx`) — client-side singleton. Exposes `user`, `profile`, `loading`, `isAdmin`, `signOut`. Wrap every auth-aware component with `useUser()`.
3. **API routes** call `requireAuth()` from `src/lib/server/auth.ts` — returns the Supabase user or a `401` `NextResponse`. Always use server client (`createSupabaseServerClient`) in route handlers, never the browser client.
4. **Guest mode** is fully supported. `isAuthenticated` prop flows into `Editor`; guest state is detected by `!user` in `AnimationToolClient`.

### Supabase Client Rules

| Context | Use |
|---------|-----|
| Client components | `createSupabaseBrowserClient()` — singleton, PKCE flow |
| Server components / API routes | `createSupabaseServerClient()` |
| Server components that only read | `createSupabaseServerClientReadOnly()` |

Foreign-key joins may return `object | object[] | null`. Always flatten:
```typescript
const raw = animation.remixed_from; // RemixedFrom | RemixedFrom[] | null
const record = Array.isArray(raw) ? raw[0] : raw;
```

### API Routes

All routes live under `src/app/api/`. Conventions:
- Export `export const dynamic = 'force-dynamic'` and `export const runtime = 'nodejs'` at the top.
- Validate inputs with Zod schemas from `src/lib/schemas/`.
- Check rate limits via `checkRateLimit()` (`src/lib/server/rate-limit.ts`).
- Guard with `requireAuth()` for authenticated endpoints; use `requireNotBanned()` for write actions.

### Tier Architecture (from Constitution)

- **Tier 0 (Guest):** 10-frame local editing, local storage only (`VALIDATION.PROJECT.GUEST_MAX_FRAMES = 10`)
- **Tier 1 (Auth):** Cloud storage, gallery, up to 50 animations (`max_animations` on `user_profiles`)
- **Tier 2 (Public):** Link sharing (`/share/[id]`), gallery browsing, upvoting
- **Tier 3 (Admin):** Moderation — `isAdmin` from `UserContext`

## Branding & Assets

The `BrandIcon` component (`src/shared/components/BrandIcon.tsx`) is the **single source of truth** for the site logo. Use it for all brand representations.

## Entity Color Service (Mandatory)

**`EntityColors`** at `src/features/animation/services/entityColors.ts` is the mandatory single source of truth for all entity colours. Never hardcode hex values in entity logic.

```typescript
import { EntityColors } from '@/features/animation';

const color = EntityColors.getDefault('cone');         // '#E6EA0C'
const color = EntityColors.getDefault('player', 'attack'); // from DESIGN_TOKENS
const resolved = EntityColors.resolve(entity.color, entity.type, entity.team); // handles empty string
```

**Dependency rule:** `Entities → EntityColors → DESIGN_TOKENS` (never reverse)

Design tokens live at `src/core/constants/design-tokens.ts`. The `colours` key is canonical; `colors` is a backwards-compat alias — use `colours` for new code.

**Domain assumptions:**
- Ball → White (`neutral[0]`)
- Cone → High-Vis Yellow (`neutral[2]`)
- Players → team colour arrays (`attack[]`, `defense[]`)
- Empty string on `entity.color` means "no colour set" — treat as default

## Critical File Locations

### Entity Creation
- `src/features/animation/components/Editor.tsx` — `handleAddCone()`, `handleAddPlayer()`, etc.

### Shared Canvas Components
**These are shared between Editor, ReplayViewer, and ShareViewer.** When modifying, test all three routes:

- `src/features/animation/components/Canvas/Stage.tsx`
- `src/features/animation/components/Canvas/Field.tsx`
- `src/features/animation/components/Canvas/PlayerToken.tsx`
- `src/features/animation/components/Canvas/EntityLayer.tsx`
- `src/features/animation/components/Canvas/AnnotationLayer.tsx`
- `src/features/animation/components/Canvas/FloatingRemote.tsx` (share route only)

### Route → File Mapping
| Route | Page File | Main Component |
|-------|-----------|----------------|
| `/app` | `src/app/app/AnimationToolClient.tsx` | `src/features/animation/components/Editor.tsx` |
| `/replay/[id]` | `src/app/replay/[id]/page.tsx` | `src/features/animation/components/ReplayViewer.tsx` |
| `/share/[id]` | `src/app/share/[id]/page.tsx` | `src/features/animation/components/ShareViewer.tsx` |
| `/gallery` | `src/app/gallery/GalleryClient.tsx` | `src/features/gallery/components/PublicAnimationCard.tsx` |
| `/my-gallery` | `src/app/my-gallery/page.tsx` | `src/features/gallery/components/AnimationCard.tsx` |

### ShareViewer Layout
`/share/[id]` is full-screen, no-scroll, mobile-first:
- `ShareViewer` uses `position: fixed; inset: 0` — **do not** change to `h-screen` or `h-full`
- Canvas sized by `useShareCanvasSize` (ResizeObserver, fits 4:3 to available space)
- `FloatingRemote` is positioned relative to the canvas div, not the viewport

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

## Quality Guardrails

- **Diagnostic Logging:** Use structured prefixes: `[Gallery API] Error: details`
- **Infrastructure Safety:** Use `staging` branch for high-risk changes (Auth, Middleware, DB Schema)
- **SSR Awareness:** Next.js App Router — always use provided Supabase clients (`lib/supabase/`) to prevent session drift
- **Auth Resilience:** `UserContext` has a 15s timeout for auth initialisation (mobile/network latency)

## Constitutional Constraints

**Absolute Prohibitions:**
- No telemetry, analytics, or tracking
- No third-party analytics services
- No advertising or sponsored content
- No paywalls for core features
- Permitted OAuth providers: Google, Apple, GitHub. Prohibited: Facebook/Meta, Twitter/X, LinkedIn, Discord

**Full Governance:** `.specify/memory/constitution.md`

## Active Technologies

TypeScript 5 · Next.js 14 (App Router) · React 18 · Konva / react-konva · Zustand · Supabase (auth + Postgres) · Tailwind CSS · Radix UI · Zod · Vitest · Playwright · Sonner (toasts) · Serwist (PWA/service worker)

## Current Work

Audit DevPlan (vault `00-Planning/DevPlan.html`) — phased worklist from the 2026-07-05 engineering audit. Current state and next action: `NOW.md`.

## Recent Changes

- 2026-07-05: docs migrated to Obsidian vault; /park + NOW.md workflow replaces /handoff + HANDOFF.md
- 023-entity-layering: complete — Animation Layering Control (FEAT-006)
- 022-notebook-tab-nav: complete — Notebook Tab Navigation + Page Textures (NAV-001)
- 021-unified-editor-controls: complete — TimelinePanel replaces EditorFloatingRemote; MobileDrawer MobileTimelineSection
- 020-frame-edit-own-animations: complete — Frame editing for own animations + workflow audit infra
- 018-share-playback-workflow: Phase 2c complete — Share & Playback Workflow

## Large Files (do not read in full)

- `src/features/animation/README.md` (~3,800 lines)
- `src/core/README.md` (~2,900 lines)
- `src/shared/README.md` (~1,900 lines)
- `src/features/gallery/README.md` (~1,100 lines)

## Design Context

See `.impeccable.md` for full design context (brand, aesthetic direction, principles, priority areas).
