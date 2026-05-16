# coaching-animator Development Guidelines

## Environment

Prefer Claude Code tools (Read, Grep, Glob) over shell commands. Forward slashes in code; backslashes only for Windows-native paths.

## Workflow

Use `/handoff` to end sessions cleanly — appends a new entry to `docs/plans/HANDOFF.md` (the rolling session diary). This is the single canonical location for handoff state.

## Commands (Critical - Run Before Every Push)

```bash
# Development
npm run dev              # Next.js dev server (port 3000)

# Pre-Push CI Verification (CRITICAL - These block CI)
npm run lint             # ESLint - catches code quality issues
npx tsc --noEmit         # TypeScript - catches type errors

# Optional Checks (Good Practice)
npm test -- --run        # Unit tests - catches logic errors
npm run e2e              # E2E tests (requires dev server running)

# Build
npm run build            # May fail locally without Supabase env vars (OK in CI)
npm run start            # Production server
```

## Path Aliases (Use in ALL Imports)

```typescript
// ✅ Correct - Use path aliases
import { useProjectStore } from '@/core/stores/projectStore';
import { Editor } from '@/features/animation/components/Editor';
import { AnimationCard } from '@/features/gallery/components/AnimationCard';
import { Button } from '@/shared/ui/button';

// ❌ Incorrect - Never use relative imports across features
import { useProjectStore } from '../../core/stores/projectStore';
```

## Branding & Assets

- **Brand Icon**: The `BrandIcon` component (`src/shared/components/BrandIcon.tsx`) is the **single source of truth** for the site logo. Use it for all brand representations (Header, Empty States, Onboarding) to ensure consistent scaling and optimization.

## Critical File Locations

### Entity Creation Handlers
When adding/modifying entity creation logic:
- ✅ **Edit**: `src/features/animation/components/Editor.tsx` (handlers: `handleAddCone()`, `handleAddPlayer()`, etc.)

### Shared Canvas Components
**These components are shared between Editor, ReplayViewer, and ShareViewer.**
When modifying, test `/app` (editor), `/replay/[id]` (replay), AND `/share/[id]` (share) routes:

- `src/features/animation/components/Canvas/Stage.tsx`
- `src/features/animation/components/Canvas/Field.tsx`
- `src/features/animation/components/Canvas/PlayerToken.tsx`
- `src/features/animation/components/Canvas/EntityLayer.tsx`
- `src/features/animation/components/Canvas/AnnotationLayer.tsx`
- `src/features/animation/components/Canvas/FloatingRemote.tsx` (share route only)

### Route → File Mapping
| Route | Page File | Main Component |
|-------|-----------|----------------|
| `/app` | `src/app/app/page.tsx` | `src/features/animation/components/Editor.tsx` |
| `/replay/[id]` | `src/app/replay/[id]/page.tsx` | `src/features/animation/components/ReplayViewer.tsx` |
| `/share/[id]` | `src/app/share/[id]/page.tsx` | `src/features/animation/components/ShareViewer.tsx` |
| `/gallery` | `src/app/gallery/page.tsx` | `src/features/gallery/components/PublicAnimationCard.tsx` |
| `/gallery` (logic) | `src/app/gallery/GalleryClient.tsx` | All gallery state, filters, upvote/remix handlers |
| `/my-gallery` | `src/app/my-gallery/page.tsx` | `src/features/gallery/components/AnimationCard.tsx` |

### ShareViewer Layout Notes
`/share/[id]` is a full-screen, no-scroll mobile-first view. Key constraints:
- `ShareViewer` uses `position: fixed; inset: 0` — **do not** change to `h-screen` or `h-full` (breaks due to root layout Navigation sibling adding document flow)
- Canvas is sized by `useShareCanvasSize` (ResizeObserver on container, fits 4:3 aspect to available space)
- `FloatingRemote` is positioned relative to the canvas div, not the viewport

## Entity Color Service (Anti-Pattern Enforcement)

**CRITICAL**: The `EntityColors` service is the **mandatory** single source of truth for all entity colors.

```typescript
// ✅ Correct - Use EntityColors service
import { EntityColors } from '@/features/animation';

const coneColor = EntityColors.getDefault('cone'); // → '#fde047' (high-vis yellow)
const ballColor = EntityColors.getDefault('ball'); // → '#ffffff' (white)
const playerColor = EntityColors.getDefault('player', 'attack'); // → '#ef4444' (red)

const resolvedColor = EntityColors.resolve(
  entity.color, // May be undefined or empty
  entity.type,
  entity.team
); // Falls back to default if empty

// ❌ NEVER do this - No hardcoded hex values!
const color = '#fde047';

// ❌ NEVER do this - No direct DESIGN_TOKENS access in entity logic!
const color = DESIGN_TOKENS.colors.neutral[2];
```

**Dependency Rule**: `Entities → EntityColors → DESIGN_TOKENS` (never reverse)

**File**: `src/features/animation/services/entityColors.ts`

**Domain Assumptions**:
- Ball is White (`neutral[0]`)
- Cones are High-Vis Yellow (`neutral[2]`)
- Players use team colors (attack: red gradient, defense: blue gradient)

**Empty Strings**: Treated as "no color set" for backward compatibility

## Testing

### E2E Test Environment Verification

Before running E2E tests (`npm run e2e`), **always verify**:
- **Target URL**: Confirm testing against `localhost:3000` (dev) or production URL
- **Server State**: Ensure dev server running (`npm run dev` in separate terminal)
- **Environment Variables**: Check required env vars set for target environment

**When in doubt**: Ask user which environment to test against before executing tests.

## Quality & Stability Guardrails

- **Diagnostic Logging**: Prioritize structured logging (e.g., `[Gallery API] Error: details`) over generic error messages to aid production debugging
- **Infrastructure Safety**: Use `staging` branch for high-risk changes (Auth, Middleware, DB Schema) to verify CI/CD health before merging to `main`
- **SSR Awareness**: Next.js App Router relies on browser/server cookie sync. Always use provided Supabase clients (`lib/supabase/`) to prevent session drift
- **Auth Resilience**: Use 15s timeout for auth initialization in `UserContext` to account for mobile/network latency

## Constitutional Constraints (v3.4.0)

**Tiered Architecture** (Cloud-First Model):
- **Tier 0 (Guest)**: 10-frame local editing, JSON export only, no cloud persistence
- **Tier 1 (Authenticated)**: Cloud storage, personal gallery, 50 animations max per user
- **Tier 2 (Public/Link-Shared)**: Link sharing (read-only replay), public gallery browsing, upvoting
- **Tier 3 (Admin)**: Moderation, user management
- **Tier 4 (Organizational)**: Club accounts, team management (Phase 3)

**Absolute Prohibitions**:
- No telemetry, analytics, or tracking
- No third-party analytics services
- No advertising or sponsored content
- No paywalls for core features
- OAuth auth providers: Google, Apple, GitHub permitted (Section V.2.3); Facebook/Meta, Twitter/X, LinkedIn, Discord prohibited

**Full Governance**: See [docs/authority/constitution.md](docs/authority/constitution.md)

## Supabase Join Flattening

Foreign-key joins may return `object | object[] | null` depending on the relationship type. Always flatten before use:

```typescript
const raw = animation.remixed_from; // RemixedFrom | RemixedFrom[] | null
const record = Array.isArray(raw) ? raw[0] : raw;
```

## Large Files (do not read in full)

- `src/features/animation/README.md` (~3,800 lines)
- `src/core/README.md` (~2,900 lines)
- `src/shared/README.md` (~1,900 lines)
- `src/features/gallery/README.md` (~1,100 lines)

## Active Technologies
- TypeScript 5 · Node 22

## Current Feature
- **022-notebook-tab-nav** — Notebook Tab Navigation (NAV-001)
- Spec: `specs/022-notebook-tab-nav/spec.md`
- Plan: `specs/022-notebook-tab-nav/plan.md`
- Tasks: `specs/022-notebook-tab-nav/tasks.md` (22 tasks, MVP = T001–T009)
- Branch: `022-notebook-tab-nav`

## Recent Changes
- 021-unified-editor-controls: complete — TimelinePanel replaces EditorFloatingRemote; MobileDrawer MobileTimelineSection
- 020-frame-edit-own-animations: complete — Frame editing for own animations + workflow audit infra
- 018-share-playback-workflow: Phase 2c complete — Share & Playback Workflow
- 017-audit-remediation: Phase 3f complete — Audit Remediation (cosmetic fixes, re-score 18+/20)

## Design Context

See `.impeccable.md` for full design context (brand, aesthetic direction, principles, priority areas).
