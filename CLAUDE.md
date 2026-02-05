# coaching-animator Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-01

> **📚 Documentation Reorganized**: New centralized docs in `docs/` directory. See [docs/README.md](docs/README.md) for architecture, testing, troubleshooting, and getting-started guides.

## Current Iteration

- **Spec Folder**: `specs/005-incremental-improvements/`
- **Approach**: Incremental, pick-and-choose improvements (14 issues identified)
- **Status**: 🔴 2 Critical, 🟠 5 High, 🟡 5 Medium, 🟢 2 Low priority issues
- **Previous Spec**: `specs/004-post-launch-improvements/` (50-60% complete, see VERIFICATION.md)
- **PRD**: `.specify/memory/PRD.md` (Sections 16-22 cover online platform)
- **Constitution**: `.specify/memory/constitution.md` (v3.0 with Tier 3 Authenticated)
- **Data Model**: `docs/architecture/database-schema.md`
- **API Contracts**: `docs/architecture/api-contracts.md` (extracted from `archive/specs/003-online-platform/contracts/api-contracts.md`)

## Documentation Quick Links

**Start here for common tasks:**

| Need | Document |
|------|----------|
| **New to project?** | [docs/development/getting-started.md](docs/development/getting-started.md) |
| **Understand architecture** | [docs/README.md](docs/README.md) |
| **API endpoints** | [docs/architecture/api-contracts.md](docs/architecture/api-contracts.md) |
| **Database schema** | [docs/architecture/database-schema.md](docs/architecture/database-schema.md) |
| **Authentication** | [docs/architecture/auth-patterns.md](docs/architecture/auth-patterns.md) |
| **Testing** | [docs/testing/strategy.md](docs/testing/strategy.md) or [docs/testing/e2e-guide.md](docs/testing/e2e-guide.md) |
| **Debug auth issues** | [docs/troubleshooting/session-persistence.md](docs/troubleshooting/session-persistence.md) or [docs/troubleshooting/supabase-aborterror-fix.md](docs/troubleshooting/supabase-aborterror-fix.md) |
| **Debug profile issues** | [docs/troubleshooting/profile-bugs-resolution-summary.md](docs/troubleshooting/profile-bugs-resolution-summary.md) |
| **Debug API issues** | [docs/troubleshooting/production-stability.md](docs/troubleshooting/production-stability.md) |
| **Governance & principles** | [.specify/memory/constitution.md](.specify/memory/constitution.md) |
| **Product requirements** | [.specify/memory/PRD.md](.specify/memory/PRD.md) |

## Active Technologies

- TypeScript 5.x with React 18+
- **Current**: Next.js 14 App Router + PWA (@serwist/next)
- **Previous**: Vite (migrated to Next.js)
- React-Konva for canvas rendering
- Zustand for state management
- **Backend**: Supabase PostgreSQL + Supabase Auth
- **Hosting**: Vercel

## Project Structure

```text
docs/                        # Developer documentation (NEW)
├── README.md                # Documentation index and quick links
├── architecture/            # System design documentation
│   ├── database-schema.md   # Supabase tables, RLS, migrations
│   ├── api-contracts.md     # API endpoint specifications
│   └── auth-patterns.md     # Supabase auth implementation
├── development/             # Developer guides
│   └── getting-started.md   # Setup and onboarding
├── testing/                 # Testing documentation
│   ├── strategy.md          # E2E testing approach
│   └── e2e-guide.md         # Playwright reference
├── troubleshooting/         # Debugging guides
│   ├── session-persistence.md       # Auth debugging
│   ├── supabase-aborterror-fix.md   # AbortError resolution
│   ├── profile-bugs-analysis.md     # Profile bugs investigation
│   ├── profile-bugs-resolution-summary.md  # Profile bugs fix
│   └── production-stability.md      # API debugging
└── operations/              # Operational procedures
    ├── ci-cd-setup.md       # GitHub Actions, Vercel pipeline
    ├── staging-setup.md     # Staging environment
    └── operations.md        # Backup, recovery procedures

app/                         # Next.js App Router pages and API routes
├── (auth)/                  # Authentication pages (login, register, etc.)
├── (legal)/                 # Legal pages (terms, privacy, contact)
├── admin/                   # Admin dashboard
├── api/                     # API endpoints
│   ├── admin/              # Admin-only endpoints
│   ├── animations/         # Animation CRUD operations
│   └── auth/               # Authentication endpoints
├── gallery/                 # Public gallery pages
├── my-gallery/              # Personal gallery page
├── profile/                 # User profile page
├── replay/                  # Animation replay pages
├── app/                     # Animation tool (main application)
├── globals.css              # Global styles
├── layout.tsx               # Root layout
├── page.tsx                 # Landing page
└── sitemap.ts               # SEO sitemap

components/                  # React components (shared)
├── AnimationCard.tsx        # Gallery animation card
├── Editor.tsx               # Main animation editor
├── SaveToCloudModal.tsx     # Cloud save dialog
└── [other components]

src/                         # Core animation components (from Vite)
├── components/              # Canvas, Sidebar, Timeline components
├── hooks/                   # Custom React hooks
├── store/                   # Zustand stores
├── utils/                   # Utilities
├── types/                   # TypeScript type definitions
├── constants/               # Design tokens and validation
└── assets/                  # Field SVGs

lib/                         # Shared utilities and Supabase clients
├── auth.ts                  # Authentication helpers
├── supabase/                # Supabase client configurations
│   ├── client.ts            # Browser client (singleton)
│   ├── server.ts            # Server client
│   └── middleware.ts        # Auth refresh middleware
└── schemas/                 # Database schemas

specs/                       # Specifications (archived & active)
├── 004-post-launch-improvements/  # Current iteration (Phase 13)
└── archive/
    └── specs/003-online-platform/ # Completed: User accounts, galleries
        ├── spec.md          # 9 user stories, 40+ requirements
        ├── tasks.md         # 111 completed development tasks
        ├── data-model.md    # Database schema (see docs/architecture/)
        └── contracts/
            └── api-contracts.md  # API specs (see docs/architecture/)

tests/                       # Test files
└── e2e/                     # Playwright E2E tests
    ├── phase-1-galleries.spec.ts  # Gallery & link sharing tests
    ├── helpers.ts           # Test utilities
    └── README.md            # Test documentation
```

## Architecture: Next.js App Structure

**Important**: This project migrated from Vite to Next.js. The editor is now served via Next.js App Router.

### Active Files (Next.js)
- **`app/app/page.tsx`** - `/app` route (animation editor page)
- **`components/Editor.tsx`** - Main editor component with entity handlers
- **`components/SaveToCloudModal.tsx`** - Cloud save dialog
- **`components/OnboardingTutorial.tsx`** - Welcome tutorial
- **`lib/contexts/UserContext.tsx`** - Auth state management

### Core Animation Engine (`src/` directory)
The `src/` directory contains the **reusable animation engine** (48 active files):
- `src/components/Canvas/*` (11 files) - React-Konva rendering layers
- `src/components/Sidebar/*` (6 files) - UI controls
- `src/components/Timeline/*` (4 files) - Playback controls
- `src/hooks/*` (8 files) - Custom React hooks
- `src/store/*` (2 files) - Zustand state management
- `src/services/*` (1 file) - Entity color service
- `src/constants/*` (3 files) - Design tokens, validation
- `src/types/*` (3 files) - TypeScript type definitions
- `src/utils/*` (6 files) - File I/O, serialization, interpolation

**⚠️ REMOVED**: `src/App.tsx` was deleted in cleanup (see ARCHITECTURE_CLEANUP_PLAN.md Option 2).
**✅ ALWAYS EDIT `components/Editor.tsx`** - This is the active Next.js editor.

### Entity Creation Handlers
When adding/modifying entity creation logic:
- ✅ **Edit**: `components/Editor.tsx` (handlers like `handleAddCone()`)
- ❌ **Don't edit**: `src/App.tsx` (deleted during Vite cleanup)

### Shared Canvas Components
The following components are shared between Editor and ReplayViewer.
When modifying these, test both `/app` (editor) and `/replay/[id]` (replay):

- `src/components/Canvas/Stage.tsx`
- `src/components/Canvas/Field.tsx`
- `src/components/Canvas/PlayerToken.tsx`
- `src/components/Canvas/EntityLayer.tsx`
- `src/components/Canvas/AnnotationLayer.tsx`

### File Mapping Quick Reference
| Route | Page File | Main Component |
|-------|-----------|----------------|
| `/app` | `app/app/page.tsx` | `components/Editor.tsx` |
| `/replay/[id]` | `app/replay/[id]/page.tsx` | `app/replay/[id]/ReplayViewer.tsx` |
| `/gallery` | `app/gallery/page.tsx` | - |
| `/my-gallery` | `app/my-gallery/page.tsx` | - |

**Cleanup History (2026-02-04)**: Dead Vite code removed per Option 2 (V3 with deep-scan validation):
- Deleted: `src/main.tsx`, `src/vite-env.d.ts`, `src/index.css`, `src/App.tsx`, `index.html` (756 lines + 1 file)
- Verified: Zero `import.meta.env` usage, no global type dependencies, CSS files 100% identical
- Active: `components/Editor.tsx` is the sole editor implementation
- See: `specs/004-post-launch-improvements/ARCHITECTURE_CLEANUP_PLAN.md`

## Commands

- `npm run dev` - Start Next.js development server (port 3000)
- `npm run build` - Production build (currently has static generation issues)
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx tsc --noEmit` - Run Type Check
- `npm test` - Run unit tests
- `npm run e2e` - Run Playwright tests

### Pre-Push CI Verification

**Always run these checks before pushing to `main` to catch CI failures early:**

```bash
# Critical checks (must pass - these block CI)
npm run lint              # ESLint - catches code quality issues
npx tsc --noEmit         # TypeScript - catches type errors

# Optional checks (good practice)
npm test -- --run        # Unit tests - catches logic errors
```

**When to run:**
- ✅ After fixing TypeScript errors
- ✅ After modifying imports or dependencies
- ✅ After refactoring shared utilities or types
- ✅ Before any push to `main` or `staging`

**CI Pipeline Reference:** See `.github/workflows/ci.yml` for the full CI/CD pipeline configuration.

> **💡 Tip**: The `npm run build` command may fail locally without Supabase environment variables, but will pass in CI where secrets are configured. Focus on lint and typecheck for local verification.

## Project Status

### Completed Iterations

#### 002-clean-iteration ✅ COMPLETE
- Phase 3: Basic Animation (T031-T044)
- Phase 4: Save/Load
- Phase 5: Export Video
- Phase 6: Share Animation Link (Tier 2)

### Current Iteration: 003-online-platform

**Goal**: Migrate to Next.js + add user accounts, cloud storage, galleries

#### Planning Phase ✅ COMPLETE (2026-01-29)
- ✅ Specification complete (`spec.md`)
- ✅ Migration plan documented (`MIGRATION_PLAN.md`)
- ✅ Research documented (`research.md`)
- ✅ Data model designed (`data-model.md`)
- ✅ API contracts defined (`contracts/api-contracts.md`)
- ✅ Quickstart guide created (`quickstart.md`)

#### Implementation Phases ✅ COMPLETE (2026-01-30)

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Next.js Foundation + PWA + Landing Page | ✅ Complete |
| 2 | Supabase Auth + Auth Pages | ✅ Complete |
| 3 | Port Animation Tool to /app | ✅ Complete |
| 4 | Database Schema + Cloud Save/Load | ✅ Complete |
| 5 | Personal Gallery + Public Gallery | ✅ Complete |
| 6 | Remix, Upvoting, Reporting | ✅ Complete |
| 7 | Admin Dashboard | ✅ Complete |
| 8 | Remove Vite, Cleanup, OG Images | ✅ Complete |

**Development Status**: 111/111 tasks complete (~95% of total project)
**Current Phase**: Phase 13 - Production Deployment (25 remaining tasks)

## Recent Changes

- **005-incremental-improvements Created (2026-02-01)**: New spec with 14 risk-assessed issues from spec 004 verification and user observations. Includes 2 critical (retry logic not wired up), 5 high priority (navigation, Safari export, password reset, sharing), 5 medium (performance, layout), and 2 low priority issues. Designed for incremental, pick-and-choose approach.
- **004-post-launch-improvements Verified (2026-02-01)**: Systematic verification found actual completion at 50-60%, not claimed 100%. Critical failures: retry logic exists but not used, navigation not integrated, tackle equipment missing, GIF export missing. See `specs/004-post-launch-improvements/VERIFICATION.md`.
- **Profile Bugs Fixed (2026-02-01)**: Resolved display name persistence and animation count issues. Root cause: missing `max_animations` column in database schema. Added migration, comprehensive E2E tests, and troubleshooting documentation.
- **003-online-platform Development Complete (2026-01-30)**: All 111 development tasks completed across 9 user stories. Full Next.js migration with user accounts, cloud storage, public gallery, upvoting, moderation, and admin dashboard implemented.
- **Constitution v3.0.0 (2026-01-29)**: Added Tier 3 (Authenticated Features) for user accounts, cloud storage, public gallery, upvoting, moderation. Email-only auth, minimal profile data, GDPR compliance. Tier 1 (offline core) remains sacred.
- **Phase 3.2: Vercel Functions API Implementation Complete (2026-01-27)**: Production-ready API handlers for link-sharing feature.
- **Phase 3.1: Supabase Setup Complete (2026-01-26)**: Backend infrastructure for link-sharing feature.

## Key Constraints (from Constitution v3.0)

**Architecture Pivot (2026-01-31)**: Tool now operates in cloud-first model. Local editing UI for UX, but all persistence requires Supabase backend.

- **Tier 0 (Guest)**: 10-frame local editing, JSON download only, no cloud persistence
- **Tier 1 (Authenticated)**: Cloud storage, personal gallery, unlimited animations (50 max per user quota)
- **Tier 2 (Public/Link-Shared)**: Link sharing (read-only replay), public gallery browsing, upvoting
- **Tier 3 (Admin)**: Moderation, user management

**Absolute Prohibitions**:
- No telemetry, analytics, or tracking
- No third-party identity providers (Google, Facebook, etc.)
- No third-party analytics services
- No advertising or sponsored content
- No paywalls for core features

## Database Tables (003-online-platform)

| Table | Purpose |
|-------|---------|
| `user_profiles` | Extends auth.users, display name, role, quota |
| `saved_animations` | User-owned animations with metadata, payload |
| `upvotes` | User-animation upvote relationships |
| `content_reports` | Moderation queue for reported animations |
| `follows` | Phase 2 foundation (UI deferred) |
| `rate_limits` | Persistent rate limiting |

**Full schema with RLS policies**: [docs/architecture/database-schema.md](docs/architecture/database-schema.md)

## API Endpoints (003-online-platform)

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `GET/POST /api/animations` | Required | List/create user animations |
| `GET/PUT/DELETE /api/animations/[id]` | Varies | Single animation CRUD |
| `GET /api/gallery` | Optional | Public gallery with search |
| `POST /api/animations/[id]/upvote` | Required | Toggle upvote |
| `POST /api/animations/[id]/remix` | Required | Clone to personal gallery |
| `POST /api/report` | Required | Report animation |
| `GET/POST /api/admin/reports` | Admin | Moderation queue |

**Complete endpoint specs with request/response schemas**: [docs/architecture/api-contracts.md](docs/architecture/api-contracts.md)

## Development Learnings

### React-Konva Rendering Patterns
- **Critical**: Stage->Layer hierarchy must be correct
- **Next.js**: Wrap with `'use client'` and `next/dynamic` with `{ ssr: false }`

### Tailwind v4 Migration
- CSS-based configuration in `index.css`
- Design tokens defined as CSS custom properties

### Supabase Auth with Next.js
- Use `@supabase/ssr` for cookie-based sessions
- Server Components: `createServerClient()`
- Client Components: `createBrowserClient()`
- Middleware refreshes auth token
- **Full implementation guide**: See [docs/architecture/auth-patterns.md](docs/architecture/auth-patterns.md)
 
### Development Sync & Persistence
- **State Lock-in**: Entities saved in `localStorage` or databases keep their original properties. Updating code defaults does *not* automatically update existing entities; a "Start Fresh" or manual property migration is required.
- **Hardcoding Shadowing**: ✅ **FIXED (2026-02-04)**. All hardcoded hex strings in instantiation handlers (`Editor.tsx`) and rendering layers (`PlayerToken.tsx`) have been replaced by the `EntityColors` service. Explicitly prohibit new hardcoded hex values in UI-to-entity logic.
- **Token Naming**: Maintain single source of truth for palette keys; avoid naming splits like `colors` vs `colours`.
- **HMR Failures**: Root-level initialization logic (like store defaults) may not hot-reload. Force a server restart by trivial edits to `next.config.js` or `package.json` if the browser shows stale behavior.

### Entity Color Service Pattern
The `EntityColors` service (`src/services/entityColors.ts`) provides centralized entity color resolution:

- **Dependency Rule**: `Entities → EntityColors → DESIGN_TOKENS` (never reverse)
- **Usage**: Import `EntityColors` and use `getDefault(type, team?)` for defaults or `resolve(color, type, team?)` for fallback resolution.
- **Enforcement**: This service is the **mandatory** single source of truth. Creation handlers must not use `DESIGN_TOKENS` or hex literals directly.
- **Domain Assumptions**: Default colors follow user preference: **Ball is White** (`neutral[0]`), **Cones are High-Vis Yellow** (`neutral[2]`).
- **UI Separation**: UI component colors (e.g., ColorPicker borders) may differ from entity defaults intentionally. This is expected behavior.
- **Empty Strings**: The service treats empty strings as "no color set" for backwards compatibility.

## Constitutional Compliance

**Constitution Location**: `.specify/memory/constitution.md`
**Current Version**: 3.0.1 (ratified 2026-01-16, amended 2026-01-29, architecture updated 2026-01-31)

**Tiered Architecture (Cloud-First Model)**:
- **Tier 0 (Guest)**: 10-frame local editor UI, JSON export only (no cloud)
- **Tier 1 (Authenticated)**: Cloud persistence, personal gallery, up to 50 animations per user
- **Tier 2 (Public/Link-Shared)**: Link sharing, public gallery browsing, upvoting
- **Tier 3 (Admin)**: Moderation and user management

**Governance**: All backend features require Necessity Test, Privacy Impact Assessment, and Constitutional Amendment approval.

## Documentation Navigation by Role

### For Frontend Developers
Start with [docs/development/getting-started.md](docs/development/getting-started.md), then:
- [docs/architecture/auth-patterns.md](docs/architecture/auth-patterns.md) - Auth implementation
- [docs/architecture/api-contracts.md](docs/architecture/api-contracts.md) - Available endpoints
- [docs/testing/e2e-guide.md](docs/testing/e2e-guide.md) - Testing patterns

### For Backend/API Developers
Start with [docs/architecture/database-schema.md](docs/architecture/database-schema.md), then:
- [docs/architecture/api-contracts.md](docs/architecture/api-contracts.md) - Endpoint specs
- [docs/testing/strategy.md](docs/testing/strategy.md) - Testing approach
- [CLAUDE.md](#key-constraints-from-constitution-v30) - Constitutional constraints

### For DevOps/Infrastructure
- `docs/operations/ci-cd-setup.md` - GitHub Actions and Vercel pipeline
- `docs/operations/staging-setup.md` - Staging environment
- `docs/operations/operations.md` - Backup and recovery

### For QA/Testing
- [docs/testing/strategy.md](docs/testing/strategy.md) - Test strategy and coverage
- [docs/testing/e2e-guide.md](docs/testing/e2e-guide.md) - Running E2E tests
- [docs/troubleshooting/](docs/troubleshooting/) - Debugging guides

### For Troubleshooting
- [docs/troubleshooting/session-persistence.md](docs/troubleshooting/session-persistence.md) - Auth session issues
- [docs/troubleshooting/supabase-aborterror-fix.md](docs/troubleshooting/supabase-aborterror-fix.md) - Supabase AbortError and missing nav links
- [docs/troubleshooting/production-stability.md](docs/troubleshooting/production-stability.md) - API issues
- [docs/README.md](docs/README.md) - Quick diagnostic lookup

## Quality & Stability Guardrails

- **Shift Left Testing**: Always run `npm run lint` and `npx tsc --noEmit` locally before pushing to catch build blockers early.
- **Diagnostic Logging**: Prioritize structured logging (e.g., `[Gallery API] Error: details`) over generic error messages to aid production debugging.
- **Infrastructure Safety**: Use the `staging` branch for high-risk changes (Auth, Middleware, DB Schema) to verify CI/CD health before merging to `main`.
- **SSR Awareness**: Next.js App Router relies on browser/server cookie sync. Always use the provided Supabase clients (`lib/supabase/`) to prevent session drift.
- **Auth Resilience**: Use a 15s timeout for auth initialization in `UserContext` to account for mobile/network latency.

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
