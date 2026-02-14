# CLAUDE.md Token Optimization Audit

**Date**: 2026-02-14
**Current Size**: ~531 lines, ~21,000 tokens
**Goal**: Reduce to ~150-200 lines, ~6,000-8,000 tokens

---

## 📊 Content Categorization

### ✅ Core Context (KEEP - High-Frequency Operational)

**Essential for every turn** (~120 lines):

1. **Environment & Constraints** (Lines 56-62)
   - Windows/PowerShell constraints
   - Claude Code tool preferences
   - Path separator rules

2. **Core Behaviors** (Lines 64-73)
   - Auto-commit, auto-push after implementation
   - Proactive documentation updates

3. **Commands** (Lines 272-328)
   - `npm run dev`, `npm run lint`, `npx tsc --noEmit`
   - Pre-push CI verification checklist
   - E2E test environment verification
   - **CRITICAL**: These are referenced constantly

4. **Path Aliases** (Lines 179-183)
   - `@/core/*`, `@/features/*`, `@/shared/*`, `@/lib/*`
   - **CRITICAL**: Used in every import

5. **Import Conventions** (Lines 253-265)
   - Path alias examples vs relative imports
   - **CRITICAL**: Prevents import errors

6. **File Locations - Critical Files Only** (Lines 216-237)
   - Entity creation handlers: `src/features/animation/components/Editor.tsx`
   - Shared canvas components (test both routes)
   - File mapping quick reference (routes → files)
   - **CRITICAL**: Frequently referenced for edits

7. **Entity Color Service Pattern** (Lines 449-457)
   - Anti-pattern enforcement (no hardcoded hex, no DESIGN_TOKENS)
   - **CRITICAL**: Prevents regressions

8. **Quality Guardrails** (Lines 502-508)
   - Shift-left testing, diagnostic logging
   - **CRITICAL**: CI/CD health

9. **Session Handoff** (Lines 518-527)
   - Handoff prompt requirements
   - **CRITICAL**: Multi-session continuity

---

### 📁 Static Standards (MOVE to docs/authority/)

**Reference once, rarely change** (~250 lines to relocate):

1. **Active Technologies** (Lines 46-54)
   - **Relocate to**: `docs/development/tech-stack.md`
   - **Why**: Tech stack doesn't change frequently

2. **Project Structure Tree** (Lines 75-166)
   - **Relocate to**: Already in README.md and feature READMEs
   - **Replace with**: Link to README.md
   - **Why**: ~90 lines of redundancy

3. **Migration History** (Lines 170-173)
   - **Relocate to**: `docs/architecture/migration-history.md`
   - **Why**: Historical context, not operational

4. **Feature Module Details** (Lines 192-214, 239-251)
   - Animation/Gallery/Shared module breakdowns
   - **Relocate to**: Already in `src/*/README.md` files
   - **Replace with**: Links to feature READMEs
   - **Why**: ~50 lines of duplication

5. **V2.0 Readiness** (Lines 267-270)
   - **Relocate to**: `docs/authority/V2_VISION.md`
   - **Why**: Strategic vision, not operational

6. **Project Status** (Lines 330-366)
   - Completed iterations, phases
   - **Relocate to**: `docs/CHANGELOG.md` or archive
   - **Why**: Historical, ~35 lines

7. **Recent Changes** (Lines 368-379)
   - Detailed change log entries
   - **Relocate to**: `docs/CHANGELOG.md`
   - **Why**: ~12 lines, better suited for CHANGELOG

8. **Constitutional Constraints** (Lines 381-397, 459-470)
   - **Relocate to**: Already in `docs/authority/constitution.md`
   - **Replace with**: Link + critical summary (Tier 0-3, prohibitions)
   - **Why**: ~30 lines of duplication

9. **Database Tables** (Lines 399-410)
   - **Relocate to**: Already in `docs/architecture/database-schema.md`
   - **Replace with**: Link only

10. **API Endpoints** (Lines 412-424)
    - **Relocate to**: Already in `docs/architecture/api-contracts.md`
    - **Replace with**: Link only

11. **Development Learnings** (Lines 426-447)
    - React-Konva, Tailwind, Supabase patterns
    - **Relocate to**: Feature READMEs or `docs/development/patterns.md`
    - **Why**: ~22 lines, better in specialized docs

12. **Documentation Navigation by Role** (Lines 472-500)
    - **Relocate to**: Already in `docs/README.md`
    - **Replace with**: Link to docs/README.md
    - **Why**: ~30 lines of duplication

13. **Workflow/Primary Languages** (Lines 510-516)
    - **Remove**: Generic info, not project-specific

---

### ❌ Redundant/Obsolete (REMOVE or replace with links)

**Already documented elsewhere** (~160 lines to cut):

1. **Documentation Quick Links Table** (Lines 24-44)
   - **Why**: Duplicates `docs/README.md` and root README
   - **Replace with**: "See [docs/README.md](docs/README.md) for documentation index"

2. **Current Iteration Details** (Lines 10-22)
   - **Why**: Changes frequently, better as link to spec folder
   - **Replace with**: Link to `archive/specs/005-incremental-improvements/`

3. **Full Project Structure Tree** (Lines 75-166)
   - **Why**: Duplicates README.md, feature READMEs
   - **Replace with**: Link to README.md + critical file locations only

4. **Implementation Phases Table** (Lines 352-363)
   - **Why**: Historical, in `archive/specs/003-online-platform/`
   - **Replace with**: Link to spec

5. **Architecture: Feature-Based Design** (Lines 168-271)
   - **Why**: ~100 lines, most content in feature READMEs
   - **Replace with**: Link to README.md + path aliases + critical file locations

---

## 📈 Optimization Impact

| Category | Current Lines | Optimized Lines | Savings |
|----------|---------------|-----------------|---------|
| Core Context (Keep) | ~120 | ~120 | 0 |
| Static Standards (Move) | ~250 | ~30 (links) | -220 |
| Redundant (Remove) | ~160 | ~10 (links) | -150 |
| **Total** | **~530** | **~160** | **-370 lines (~70%)** |

**Estimated Token Reduction**: ~21,000 → ~6,500 tokens (~69% reduction)

---

## 🎯 Recommended Structure for Optimized CLAUDE.md

```markdown
# coaching-animator Development Guidelines

> **📚 Comprehensive Documentation**: See [README.md](README.md), [docs/](docs/), and [feature READMEs](src/features/)

## Current Project Context

- **Current Iteration**: [005-incremental-improvements](archive/specs/005-incremental-improvements/) (14 issues: 2 critical, 5 high, 5 medium, 2 low)
- **Architecture**: Feature-based (V2.0 ready) - See [README.md](README.md#project-structure-feature-based-architecture)
- **Documentation**: [docs/README.md](docs/README.md) for all guides, [src/features/](src/features/) for module READMEs

## Environment

- **Platform**: Windows with PowerShell (use Claude Code tools, not Unix commands)
- **Path Separators**: Forward slashes `/` in code, backslashes `\` for Windows-only

## Core Behaviors

After implementation work, **always proactively**:
1. Update docs (README.md, CLAUDE.md, docs/, spec files)
2. Commit with descriptive messages
3. Push to remote repository

## Commands (Critical - Run Before Every Push)

```bash
# Development
npm run dev              # Next.js dev server (port 3000)

# Pre-Push CI Verification (CRITICAL)
npm run lint             # ESLint - blocks CI if fails
npx tsc --noEmit         # TypeScript - blocks CI if fails
npm test -- --run        # Unit tests (optional)
npm run e2e              # E2E tests (requires dev server)

# Build
npm run build            # May fail locally without env vars (OK in CI)
```

**When to run**: After fixing TS errors, modifying imports/deps, refactoring utilities, before any push to `main`/`staging`

## Path Aliases (Use in ALL Imports)

```typescript
// ✅ Correct
import { useProjectStore } from '@/core/stores/projectStore';
import { Editor } from '@/features/animation/components/Editor';
import { Button } from '@/shared/ui/button';

// ❌ Never use relative imports across features
import { useProjectStore } from '../../core/stores/projectStore';
```

**Configured in `tsconfig.json`**:
- `@/core/*` → Shared utilities, hooks, stores, types, constants
- `@/features/*` → Feature modules (animation, gallery, future: organizations)
- `@/shared/*` → Shared UI components
- `@/lib/*` → Third-party integrations (Supabase, contexts)

## Critical File Locations

**Entity Creation Handlers**:
- ✅ **Edit**: `src/features/animation/components/Editor.tsx` (handlers: `handleAddCone()`, etc.)
- ❌ **Don't edit**: `src/App.tsx` (deleted during Vite cleanup)

**Shared Canvas Components** (test both `/app` editor AND `/replay/[id]` routes):
- `src/features/animation/components/Canvas/Stage.tsx`
- `src/features/animation/components/Canvas/Field.tsx`
- `src/features/animation/components/Canvas/PlayerToken.tsx`
- `src/features/animation/components/Canvas/EntityLayer.tsx`
- `src/features/animation/components/Canvas/AnnotationLayer.tsx`

**Route → File Mapping**:
| Route | Page | Component |
|-------|------|-----------|
| `/app` | `src/app/app/page.tsx` | `src/features/animation/components/Editor.tsx` |
| `/replay/[id]` | `src/app/replay/[id]/page.tsx` | `src/features/animation/components/ReplayViewer.tsx` |
| `/gallery` | `src/app/gallery/page.tsx` | `src/features/gallery/components/PublicAnimationCard.tsx` |
| `/my-gallery` | `src/app/my-gallery/page.tsx` | `src/features/gallery/components/AnimationCard.tsx` |

## Entity Color Service (Anti-Pattern Enforcement)

**CRITICAL**: Use `EntityColors` service for ALL entity colors.

```typescript
// ✅ Correct
import { EntityColors } from '@/features/animation';
const color = EntityColors.getDefault('cone'); // High-vis yellow

// ❌ NEVER do this
const color = '#fde047';                    // Hardcoded hex
const color = DESIGN_TOKENS.colors.neutral[2]; // Direct tokens access
```

**Rules**:
- `Entities → EntityColors → DESIGN_TOKENS` (never reverse)
- No hardcoded hex values in entity handlers or UI rendering
- Empty strings treated as "no color set" (backward compatibility)

**File**: `src/features/animation/services/entityColors.ts`

## Testing & E2E Environment

**Before running E2E tests**:
- ✅ Verify target URL (`localhost:3000` or production)
- ✅ Ensure dev server running (`npm run dev`)
- ✅ Check environment variables set
- **When in doubt**: Ask user which environment to test

## Quality Guardrails

- **Shift Left Testing**: Run `npm run lint` + `npx tsc --noEmit` before pushing (catch CI blockers early)
- **Diagnostic Logging**: Use structured logs (`[Gallery API] Error: details`) for debugging
- **Infrastructure Safety**: Use `staging` branch for high-risk changes (Auth, Middleware, DB Schema)
- **SSR Awareness**: Use Supabase clients from `lib/supabase/` (prevent session drift)
- **Auth Resilience**: 15s timeout in `UserContext` (mobile/network latency)

## Constitutional Constraints (v3.3)

**Tiered Access** (Cloud-First Model):
- **Tier 0 (Guest)**: 10-frame local editing, JSON export only
- **Tier 1 (Authenticated)**: Cloud storage, 50 animations max
- **Tier 2 (Public/Link-Shared)**: Read-only replay, upvoting
- **Tier 3 (Admin)**: Moderation

**Absolute Prohibitions**:
- No telemetry, analytics, tracking
- No third-party auth (Google, Facebook)
- No advertising, paywalls for core features

**Full governance**: [docs/authority/constitution.md](docs/authority/constitution.md)

## Session Handoff

When generating handoff prompts, **always include**:
- Task status and completion state
- File paths and code locations
- Outstanding issues or blockers
- Next steps or dependencies
- Context for seamless session continuation

**Goal**: Next session picks up immediately without re-discovery.

---

## 📚 Documentation Index

**Quick Links**:
- [README.md](README.md) - Project overview, setup, usage
- [docs/README.md](docs/README.md) - Developer documentation index
- [src/features/animation/README.md](src/features/animation/README.md) - Animation feature docs
- [src/features/gallery/README.md](src/features/gallery/README.md) - Gallery feature docs
- [src/core/README.md](src/core/README.md) - Shared utilities, hooks, stores
- [src/shared/README.md](src/shared/README.md) - UI component library
- [docs/architecture/](docs/architecture/) - Database schema, API contracts, auth patterns
- [docs/authority/](docs/authority/) - PRD, Constitution, V2 Vision
- [archive/specs/005-incremental-improvements/](archive/specs/005-incremental-improvements/) - Current iteration
```

---

## 🚀 Next Steps

1. **Review** this audit with user
2. **Create** `docs/development/tech-stack.md` for Active Technologies
3. **Create** `docs/architecture/migration-history.md` for migration timeline
4. **Create** `docs/CHANGELOG.md` for recent changes
5. **Replace** CLAUDE.md with optimized version
6. **Commit** with message: `docs: optimize CLAUDE.md to reduce token footprint (70% reduction)`

**Expected Impact**: 531 lines → 160 lines, ~21,000 tokens → ~6,500 tokens
