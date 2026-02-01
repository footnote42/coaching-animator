# coaching-animator Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-31

> **📚 Documentation Reorganized**: New centralized docs in `docs/` directory. See [docs/README.md](docs/README.md) for architecture, testing, troubleshooting, and getting-started guides.

## Current Iteration

- **Spec Folder**: `specs/004-post-launch-improvements/`
- **PRD**: `.specify/memory/PRD.md` (Sections 16-22 cover online platform)
- **Constitution**: `.specify/memory/constitution.md` (v3.0 with Tier 3 Authenticated)
- **Data Model**: `docs/architecture/database-schema.md` (extracted from `archive/specs/003-online-platform/data-model.md`)
- **API Contracts**: `docs/architecture/api-contracts.md` (extracted from `archive/specs/003-online-platform/contracts/api-contracts.md`)

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
└── schemas/                 # Database schemas

specs/003-online-platform/   # Current iteration specs
├── spec.md                  # 9 user stories, 40+ requirements
├── tasks.md                 # 111 completed development tasks
├── PROGRESS.md              # Implementation progress log
├── data-model.md            # Database schemas
├── research.md              # Technical decisions
└── contracts/
    └── api-contracts.md     # API endpoint specs
```

## Commands

- `npm run dev` - Start Next.js development server (port 3000)
- `npm run build` - Production build (currently has static generation issues)
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx tsc --noEmit` - Run Type Check
- `npm test` - Run unit tests
- `npm run e2e` - Run Playwright tests

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

- **003-online-platform Development Complete (2026-01-30)**: All 111 development tasks completed across 9 user stories. Full Next.js migration with user accounts, cloud storage, public gallery, upvoting, moderation, and admin dashboard implemented.
- **Production Deployment Phase Started (2026-01-30)**: Phase 13 initiated with 25 remaining deployment tasks. Current build issues with static generation need resolution.
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

## Constitutional Compliance

**Constitution Location**: `.specify/memory/constitution.md`
**Current Version**: 3.0.1 (ratified 2026-01-16, amended 2026-01-29, architecture updated 2026-01-31)

**Tiered Architecture (Cloud-First Model)**:
- **Tier 0 (Guest)**: 10-frame local editor UI, JSON export only (no cloud)
- **Tier 1 (Authenticated)**: Cloud persistence, personal gallery, up to 50 animations per user
- **Tier 2 (Public/Link-Shared)**: Link sharing, public gallery browsing, upvoting
- **Tier 3 (Admin)**: Moderation and user management

**Governance**: All backend features require Necessity Test, Privacy Impact Assessment, and Constitutional Amendment approval.

## Quality & Stability Guardrails

- **Shift Left Testing**: Always run `npm run lint` and `npx tsc --noEmit` locally before pushing to catch build blockers early.
- **Diagnostic Logging**: Prioritize structured logging (e.g., `[Gallery API] Error: details`) over generic error messages to aid production debugging.
- **Infrastructure Safety**: Use the `staging` branch for high-risk changes (Auth, Middleware, DB Schema) to verify CI/CD health before merging to `main`.
- **SSR Awareness**: Next.js App Router relies on browser/server cookie sync. Always use the provided Supabase clients (`lib/supabase/`) to prevent session drift.
- **Auth Resilience**: Use a 15s timeout for auth initialization in `UserContext` to account for mobile/network latency.

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
