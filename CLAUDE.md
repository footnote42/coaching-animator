# coaching-animator

## Purpose
Next.js animation editor for rugby coaching — coaches create, save, and share animated play diagrams on a Konva canvas, with Supabase for auth and cloud storage.

## Status
Active. Phase 2 complete; working through the audit DevPlan (see `NOW.md` for current state and next action).

## Workflow
`/to-spec` → `/to-tickets` → GitHub issues → implement. Use `/park` to end sessions — updates `NOW.md` (repo root) and optionally captures ideas to Obsidian.

## Key Paths
- Session state: `NOW.md` (repo root — single source of truth, updated via `/park`)
- Editor: `src/features/animation/components/Editor.tsx`
- Stores: `src/core/stores/projectStore.ts`, `uiStore.ts`
- Canvas: `src/features/animation/components/Canvas/`
- API routes: `src/app/api/`
- Binding constraints: `docs/constraints.md`
- Domain glossary: `CONTEXT.md`; decisions: `docs/adr/`

## Documentation

Planning and reference docs live in the Obsidian vault: `C:/Users/kenho/Obsidian/Second Brain/Projects/Coaching Animator/`
- `00-Planning/` — PRD v2.0, ROADMAP, ISSUES, audits, DevPlan tracker (`DevPlan.html` — the active worklist)
- `02-Reference/` — DB schema, API contracts, auth patterns, dev guides, troubleshooting, ops/CI runbooks
- `05-Archive/` — retired HANDOFF.md diary, old roadmaps, retrospectives

The repo keeps only repo-coupled docs: `docs/testing/`, `docs/user-guide/`, `docs/CHANGELOG.md`. The binding rules are in `docs/constraints.md`.

---

## Pre-Push CI Verification

Run both before every push:

```bash
npm run lint             # ESLint
npx tsc --noEmit         # TypeScript type check
```

Everything else (dev server, unit tests, E2E, build) is in the `dev-commands` skill.

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

### Tier Architecture

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

### ShareViewer Layout
`/share/[id]` is full-screen, no-scroll, mobile-first:
- `ShareViewer` uses `position: fixed; inset: 0` — **do not** change to `h-screen` or `h-full`
- Canvas sized by `useShareCanvasSize` (ResizeObserver, fits 4:3 to available space)
- `FloatingRemote` is positioned relative to the canvas div, not the viewport

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

## Large Files (do not read in full)

- `src/features/animation/README.md` (~3,800 lines)
- `src/core/README.md` (~2,900 lines)
- `src/shared/README.md` (~1,900 lines)
- `src/features/gallery/README.md` (~1,100 lines)

## Design Context

See `.impeccable.md` for full design context (brand, aesthetic direction, principles, priority areas).

## Agent skills

### Issue tracker

GitHub Issues on `footnote42/coaching-animator` via `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: root `CONTEXT.md` + `docs/adr/` (created lazily). See `docs/agents/domain.md`.
