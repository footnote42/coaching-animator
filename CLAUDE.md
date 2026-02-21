<!-- CLEO:START -->
@.cleo/templates/AGENT-INJECTION.md
<!-- CLEO:END -->
# coaching-animator Development Guidelines

> **📚 Comprehensive Documentation**: See [README.md](README.md), [docs/](docs/), and [feature READMEs](src/features/) for complete project documentation.

## Current Project Context

- **Current Iteration**: v2.0 Phase 2 **in progress** — Progressions core complete (T048–T050 ✓: drag-drop reorder, gallery badge+link, /progression/[id] view). Next: T051 E2E tests, then T052–T054 Remix Genealogy, then T044–T046 Rugby Pivot.
- **Architecture**: Feature-based (V2.0 ready) - See [README.md](README.md#project-structure-feature-based-architecture)
- **Documentation Hub**: [docs/README.md](docs/README.md) for all guides by role
- **Feature Modules**: [src/features/animation/](src/features/animation/README.md), [src/features/gallery/](src/features/gallery/README.md), [src/core/](src/core/README.md), [src/shared/](src/shared/README.md)
- **Authority Docs**: [PRD v2.0](docs/authority/PRD-v2.0.md), [Constitution v3.4.0](docs/authority/constitution.md), [Roadmap](docs/authority/ROADMAP.md)

## Environment

- **Platform**: Windows with PowerShell
- **Command Usage**: Do NOT use Unix-specific commands (`ls -la`, `grep`, `cat`, `find`)
  - Use PowerShell equivalents or cross-platform alternatives
  - Prefer Claude Code tools (Read, Grep, Glob) over shell commands
- **Path Separators**: Forward slashes `/` in code, backslashes `\` for Windows-only paths

## Core Behaviors

After completing implementation work, **always proactively**:
1. Update relevant documentation files (README.md, CLAUDE.md, docs/, spec files)
2. Commit changes with descriptive messages following project conventions
3. Push commits to remote repository

**Do not wait to be asked**. Documentation updates and commits should be automatic follow-through.

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

**When to run**:
- ✅ After fixing TypeScript errors
- ✅ After modifying imports or dependencies
- ✅ After refactoring shared utilities or types
- ✅ Before any push to `main` or `staging`

**CI Pipeline**: See `.github/workflows/ci.yml` for full pipeline config

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

**Configured in `tsconfig.json`**:
- `@/core/*` → Shared utilities, hooks, stores, types, constants
- `@/features/*` → Feature modules (animation, gallery, future: organizations, collections)
- `@/shared/*` → Shared UI components and primitives
- `@/lib/*` → Third-party integrations (Supabase, contexts)

## Critical File Locations

### Entity Creation Handlers
When adding/modifying entity creation logic:
- ✅ **Edit**: `src/features/animation/components/Editor.tsx` (handlers: `handleAddCone()`, `handleAddPlayer()`, etc.)
- ❌ **Don't edit**: `src/App.tsx` (deleted during Vite cleanup)

### Shared Canvas Components
**These components are shared between Editor and ReplayViewer.**
When modifying, test BOTH `/app` (editor) AND `/replay/[id]` (replay) routes:

- `src/features/animation/components/Canvas/Stage.tsx`
- `src/features/animation/components/Canvas/Field.tsx`
- `src/features/animation/components/Canvas/PlayerToken.tsx`
- `src/features/animation/components/Canvas/EntityLayer.tsx`
- `src/features/animation/components/Canvas/AnnotationLayer.tsx`

### Route → File Mapping
| Route | Page File | Main Component |
|-------|-----------|----------------|
| `/app` | `src/app/app/page.tsx` | `src/features/animation/components/Editor.tsx` |
| `/replay/[id]` | `src/app/replay/[id]/page.tsx` | `src/features/animation/components/ReplayViewer.tsx` |
| `/gallery` | `src/app/gallery/page.tsx` | `src/features/gallery/components/PublicAnimationCard.tsx` |
| `/gallery` (logic) | `src/app/gallery/GalleryClient.tsx` | All gallery state, filters, upvote/remix handlers |
| `/my-gallery` | `src/app/my-gallery/page.tsx` | `src/features/gallery/components/AnimationCard.tsx` |

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

### Test Execution

```bash
# Local development testing (requires npm run dev in separate terminal)
npm run e2e

# Unit tests
npm test -- --run

# CI verification (run before pushing)
npm run lint
npx tsc --noEmit
```

## Quality & Stability Guardrails

- **Shift Left Testing**: Always run `npm run lint` and `npx tsc --noEmit` locally before pushing to catch build blockers early
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
- No third-party identity providers (Google, Facebook, etc.)
- No third-party analytics services
- No advertising or sponsored content
- No paywalls for core features

**Full Governance**: See [docs/authority/constitution.md](docs/authority/constitution.md)

## Session Handoff

When generating handoff prompts for next task/session, **always include**:
- Current task status and completion state
- Relevant file paths and code locations
- Outstanding issues or blockers
- Next steps or dependencies
- Any context needed for fresh session to continue seamlessly

**Goal**: Next session picks up exactly where previous session left off without re-discovery.

---

## 📚 Documentation Index

**Quick Navigation**:
- **[README.md](README.md)** - Project overview, setup, usage guide
- **[docs/README.md](docs/README.md)** - Developer documentation hub (organized by role)
- **[src/features/animation/README.md](src/features/animation/README.md)** - Animation feature module docs (~3,800 lines)
- **[src/features/gallery/README.md](src/features/gallery/README.md)** - Gallery feature module docs (~1,100 lines)
- **[src/core/README.md](src/core/README.md)** - Core utilities, hooks, stores, types (~2,900 lines)
- **[src/shared/README.md](src/shared/README.md)** - UI component library docs (~1,900 lines)

**Architecture & Specs**:
- **[docs/architecture/database-schema.md](docs/architecture/database-schema.md)** - Supabase tables, RLS policies
- **[docs/architecture/api-contracts.md](docs/architecture/api-contracts.md)** - API endpoint specifications
- **[docs/architecture/auth-patterns.md](docs/architecture/auth-patterns.md)** - Supabase auth implementation

**Product & Governance**:
- **[docs/authority/PRD-v2.0.md](docs/authority/PRD-v2.0.md)** - Product Requirements (active authority)
- **[docs/authority/constitution.md](docs/authority/constitution.md)** - v3.4.0 governance rules
- **[docs/authority/ROADMAP.md](docs/authority/ROADMAP.md)** - Phased development plan
- **[docs/CHANGELOG.md](docs/CHANGELOG.md)** - Notable changes from v2.0 onward

<!-- MANUAL ADDITIONS START -->
## Supabase Join Flattening

Foreign-key joins may return `object | object[] | null` depending on the relationship type. Always flatten before use:

```typescript
const raw = animation.remixed_from; // RemixedFrom | RemixedFrom[] | null
const record = Array.isArray(raw) ? raw[0] : raw;
```
<!-- MANUAL ADDITIONS END -->
