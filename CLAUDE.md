# coaching-animator Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-29

## Current Iteration

- **Spec Folder**: `specs/003-online-platform/`
- **PRD**: `.specify/memory/PRD.md` (Sections 16-22 cover online platform)
- **Constitution**: `.specify/memory/constitution.md` (v3.0 with Tier 3 Authenticated)
- **Migration Plan**: `specs/003-online-platform/MIGRATION_PLAN.md`
- **Data Model**: `specs/003-online-platform/data-model.md`
- **API Contracts**: `specs/003-online-platform/contracts/api-contracts.md`

## Active Technologies

- TypeScript 5.x with React 18+
- **Current**: Vite + Tailwind CSS + shadcn/ui
- **Migration Target**: Next.js App Router + PWA (@serwist/next)
- React-Konva for canvas rendering
- Zustand for state management
- **Backend**: Supabase PostgreSQL + Supabase Auth
- **Hosting**: Vercel

## Project Structure

```text
src/                          # Current Vite app (to be migrated)
├── components/
│   ├── Canvas/              # Canvas rendering layers
│   ├── Sidebar/             # Entity palette and project actions
│   └── Replay/              # Shareable replay viewer
├── hooks/                   # Custom React hooks
├── store/                   # Zustand stores
├── utils/                   # Utilities
├── types/                   # TypeScript type definitions
├── constants/               # Design tokens and validation
└── assets/                  # Field SVGs

specs/003-online-platform/   # Current iteration specs
├── spec.md                  # 9 user stories, 40+ requirements
├── MIGRATION_PLAN.md        # 8-phase migration approach
├── data-model.md            # Database schemas
├── research.md              # Technical decisions
├── quickstart.md            # Dev setup guide
└── contracts/
    └── api-contracts.md     # API endpoint specs
```

## Commands

- `npm run dev` - Start Vite development server (port 5175)
- `npm run build` - Production build
- `npm test` - Run tests
- `npm run lint` - Run ESLint

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

#### Implementation Phases (Pending)

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Next.js Foundation + PWA + Landing Page | Pending |
| 2 | Supabase Auth + Auth Pages | Pending |
| 3 | Port Animation Tool to /app | Pending |
| 4 | Database Schema + Cloud Save/Load | Pending |
| 5 | Personal Gallery + Public Gallery | Pending |
| 6 | Remix, Upvoting, Reporting | Pending |
| 7 | Admin Dashboard | Pending |
| 8 | Remove Vite, Cleanup, OG Images | Pending |

**Estimated Total**: ~14 days development

## Recent Changes

- **003-online-platform Planning Complete (2026-01-29)**: Completed planning phase for Next.js migration and online platform features. Created research.md (10 technical unknowns), data-model.md (6 database tables with RLS), api-contracts.md (20+ endpoints), and quickstart.md (dev setup guide). Constitution amended to v3.0 with Tier 3 (Authenticated) features.
- **Constitution v3.0.0 (2026-01-29)**: Added Tier 3 (Authenticated Features) for user accounts, cloud storage, public gallery, upvoting, moderation. Email-only auth, minimal profile data, GDPR compliance. Tier 1 (offline core) remains sacred.
- **Phase 3.2: Vercel Functions API Implementation Complete (2026-01-27)**: Production-ready API handlers for link-sharing feature.
- **Phase 3.1: Supabase Setup Complete (2026-01-26)**: Backend infrastructure for link-sharing feature.

## Key Constraints (from Constitution v3.0)

- **Tier 1 (Sacred Offline)**: Animation creation, editing, local persistence, local export - MUST work without network
- **Tier 2 (Controlled Networked)**: Link sharing, public gallery browsing - explicit consent required
- **Tier 3 (Authenticated)**: Cloud storage, personal gallery, upvoting, moderation - email-only auth

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
**Current Version**: 3.0.0 (ratified 2026-01-16, amended 2026-01-29)

**Tiered Architecture**:
- **Tier 1 (Sacred Offline)**: Animation creation, editing, local persistence, local export
- **Tier 2 (Controlled Networked)**: Link sharing, public gallery browsing
- **Tier 3 (Authenticated)**: Cloud storage, personal gallery, upvoting, moderation

**Governance**: All backend features require Necessity Test, Privacy Impact Assessment, and Constitutional Amendment approval.

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
