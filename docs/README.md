# Coaching Animator Documentation

**Last Updated**: 2026-01-31
**Project Status**: 111/111 development tasks complete (95% of total)
**Current Phase**: Phase 13 - Production Deployment

---

## Quick Start

**New to the project?** Start here:
1. [Getting Started Guide](development/getting-started.md) - Setup and first run
2. [CLAUDE.md](../CLAUDE.md) - Comprehensive development guidelines
3. [Project README](../README.md) - User-facing overview

---

## Documentation Structure

### Foundation Documents

These documents define the project's core principles and requirements:

- **[Constitution](../.specify/memory/constitution.md)** - Core governance, architectural principles, and tiered feature model (Tier 0-3)
- **[PRD](../.specify/memory/PRD.md)** - Product Requirements Document (sections 16-22 cover online platform)
- **[CLAUDE.md](../CLAUDE.md)** - Auto-generated comprehensive development guidelines

### Architecture

Deep dive into system design and implementation details:

- **[Database Schema](architecture/database-schema.md)** - Supabase PostgreSQL tables, RLS policies, and relationships
  - Tables: user_profiles, saved_animations, upvotes, content_reports, follows, rate_limits
  - RLS policies for access control
  - Quota enforcement triggers

- **[API Contracts](architecture/api-contracts.md)** - RESTful endpoint specifications
  - Authentication endpoints
  - Animation CRUD operations
  - Gallery and search endpoints
  - Social features (upvote, remix)
  - Moderation and reporting
  - User profile management
  - Error response formats
  - Zod validation schemas

- **[Auth Patterns](architecture/auth-patterns.md)** - Supabase authentication guide
  - Browser and server client setup
  - Middleware auth refresh
  - Client-side context management
  - Protected routes patterns
  - Session persistence
  - Common auth errors and solutions

### Development

Guides for developers working on the project:

- **[Getting Started](development/getting-started.md)** - Setup guide for new developers
  - Prerequisites and installation
  - Environment configuration
  - Running the dev server
  - Project structure overview
  - Common commands
  - Understanding authentication
  - Development workflow

### Testing

Test infrastructure and strategies:

- **[Testing Strategy](testing/strategy.md)** - Overall E2E testing approach
  - Test coverage (3 user story groups)
  - Test execution commands
  - Test infrastructure and files
  - Environment variables
  - Debugging failed tests
  - Performance baselines
  - CI/CD integration
  - Known limitations and future improvements

- **[E2E Guide](testing/e2e-guide.md)** - Playwright E2E testing quick reference
  - Test coverage overview
  - Setup and configuration
  - Running tests (local, CI/CD, various modes)
  - Test structure and best practices
  - Debugging and troubleshooting
  - Performance baselines
  - Reporting formats

### Troubleshooting

Reference guides for debugging production issues:

- **[Session Persistence](troubleshooting/session-persistence.md)** - Debugging auth session issues
  - Problem statement and symptoms
  - Root causes and solutions
  - Investigation areas
  - Key files and patterns
  - Debugging checklist
  - Common scenarios with fixes

- **[Production Stability](troubleshooting/production-stability.md)** - API stability debugging guide
  - Critical suspects (Service Worker, Next.js version, Middleware)
  - Summary of attempted fixes
  - Recommended next steps
  - Error patterns to watch
  - Debug API routes
  - Environment variables checklist

---

## Active Specifications

### Current Iteration

- **Spec Folder**: `specs/005-incremental-improvements/`
- **Status**: In progress (9/14 issues resolved)
- **Previous Spec**: `specs/004-post-launch-improvements/` (Phase 13 - Production Deployment)

### Historical Specifications

All completed iterations are archived:
- **003-online-platform** (✅ Complete): User accounts, cloud storage, galleries, upvoting, moderation
- **002-clean-iteration** (✅ Complete): Basic animation, save/load, export, link sharing (Tier 2)
- **001-vite-migration** (✅ Complete): Initial Vite-based animation tool

See `archive/specs/` for full archived documentation.

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14 App Router + PWA (@serwist/next)
- **UI**: React 18 + Tailwind CSS v4
- **Canvas**: React-Konva
- **State**: Zustand
- **Authentication**: Supabase Auth (@supabase/ssr)

### Backend
- **Database**: Supabase PostgreSQL with Row Level Security
- **API**: Next.js Route Handlers (App Router)
- **Hosting**: Vercel

### Testing
- **Unit Tests**: Vitest
- **E2E Tests**: Playwright

### Tools
- **Type Safety**: TypeScript 5
- **Linting**: ESLint
- **Package Manager**: npm

---

## Key Database Tables

| Table | Purpose | Status |
|-------|---------|--------|
| `user_profiles` | User metadata, display name, role, quota | ✅ Live |
| `saved_animations` | User animations with metadata and payload | ✅ Live |
| `upvotes` | User-animation upvote relationships | ✅ Live |
| `content_reports` | Moderation queue for reported animations | ✅ Live |
| `follows` | User follower relationships | ⏳ Phase 2 (UI deferred) |
| `rate_limits` | Persistent rate limiting | ✅ Live |

See [Database Schema](architecture/database-schema.md) for SQL definitions and RLS policies.

---

## Key API Endpoints

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `GET/POST /api/animations` | Required | User animation CRUD |
| `GET /api/gallery` | Optional | Public gallery search |
| `POST /api/animations/[id]/upvote` | Required | Toggle upvote |
| `POST /api/animations/[id]/remix` | Required | Clone animation |
| `POST /api/report` | Required | Report animation |
| `GET/POST /api/admin/reports` | Admin | Moderation queue |
| `GET/PUT /api/user/profile` | Required | User profile |

See [API Contracts](architecture/api-contracts.md) for full specifications.

---

## Development Principles

### Quality & Stability

- **Shift Left Testing**: Run `npm run lint` and `npx tsc --noEmit` locally before pushing
- **Diagnostic Logging**: Use structured logging (e.g., `[Gallery API] Error: details`)
- **Infrastructure Safety**: Use `staging` branch for high-risk auth/middleware/schema changes
- **SSR Awareness**: Always use provided Supabase clients to prevent session drift
- **Auth Resilience**: Use 15s timeout in UserContext to handle mobile/network latency

### Architectural Constraints

- **Cloud-First Model**: All persistent storage requires Supabase backend
- **No Telemetry**: No analytics or tracking
- **Email-Only Auth**: No third-party identity providers
- **Quota System**: 50 animations per user (Tier 1)
- **RLS Enforced**: Row-level security policies control all data access

---

## Getting Help

1. **Read the Docs**: Start with this README and navigate to relevant sections
2. **Check CLAUDE.md**: Comprehensive development guidelines
3. **Search Issues**: Many common questions already have answers
4. **Review Recent Commits**: Understand recent changes and patterns
5. **Consult Constitution**: For governance and architectural decisions

---

## Documentation Index by Role

### For New Developers
1. [Getting Started](development/getting-started.md)
2. [CLAUDE.md](../CLAUDE.md)
3. [Auth Patterns](architecture/auth-patterns.md)
4. [API Contracts](architecture/api-contracts.md)

### For Frontend Engineers
1. [Auth Patterns](architecture/auth-patterns.md)
2. [API Contracts](architecture/api-contracts.md)
3. [Database Schema](architecture/database-schema.md)
4. [Testing Strategy](testing/strategy.md)

### For Backend Engineers
1. [Database Schema](architecture/database-schema.md)
2. [API Contracts](architecture/api-contracts.md)
3. [Testing Strategy](testing/strategy.md)

### For DevOps/Infrastructure
1. [CLAUDE.md](../CLAUDE.md) (Operations section)
2. [Production Stability](troubleshooting/production-stability.md)
3. `docs/operations/` (existing documentation)

### For QA/Testing
1. [Testing Strategy](testing/strategy.md)
2. [E2E Guide](testing/e2e-guide.md)
3. [Troubleshooting Guides](troubleshooting/)

### For Project Managers
1. [Constitution](../.specify/memory/constitution.md)
2. [PRD](../.specify/memory/PRD.md)
3. [CLAUDE.md](../CLAUDE.md) (Project Status section)

---

## Common Documentation Searches

**How do I...?**

- Setup the project → [Getting Started](development/getting-started.md)
- Understand authentication → [Auth Patterns](architecture/auth-patterns.md)
- Add a new API endpoint → [API Contracts](architecture/api-contracts.md)
- Run tests → [Testing Strategy](testing/strategy.md) or [E2E Guide](testing/e2e-guide.md)
- Debug a session issue → [Session Persistence](troubleshooting/session-persistence.md)
- Find API endpoints → [API Contracts](architecture/api-contracts.md)
- Understand database structure → [Database Schema](architecture/database-schema.md)
- Know what features are Tier 1 vs Tier 2 → [Constitution](../.specify/memory/constitution.md)
- Understand sharing/replay → See "Sharing & Replay Feature" below

---

## Sharing & Replay Feature

Animations can be shared via read-only replay links. This is how it works end-to-end:

### How Users Share Animations

1. **Create**: User creates an animation in the editor at `/app`
2. **Save to Cloud**: User saves to cloud via "Save to Cloud" modal (requires authentication)
3. **Publish**: User sets visibility to `public` or `link-shared` (from My Gallery or editor)
4. **Share**: Animation is accessible at `/replay/[id]` — a read-only replay page

### Replay Viewer Architecture

The replay page (`/replay/[id]`) renders animations using **shared canvas components** from the editor:

| Component | Location | Purpose |
|-----------|----------|---------|
| `Stage` | `src/components/Canvas/Stage.tsx` | Konva Stage wrapper |
| `Field` | `src/components/Canvas/Field.tsx` | Sport-specific pitch SVG |
| `EntityLayer` | `src/components/Canvas/EntityLayer.tsx` | Entity rendering + interpolation |
| `AnnotationLayer` | `src/components/Canvas/AnnotationLayer.tsx` | Arrow/Line annotations |
| `PlayerToken` | `src/components/Canvas/PlayerToken.tsx` | Individual entity shapes |
| `useReplayAnimationLoop` | `src/hooks/useReplayAnimationLoop.ts` | Store-free RAF animation |

The `ReplayViewer` (`app/replay/[id]/ReplayViewer.tsx`) orchestrates these components with:
- **`normalizeReplayPayload()`** — backward compatibility for older database payloads
- **`ReplayCanvas`** — internal component isolating 60fps renders from controls
- **Playback controls** — play/pause, prev/next frame, speed (0.5x/1x/2x), loop toggle

### Key API Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /api/animations/[id]` | Fetch animation payload (public/link-shared) |
| `POST /api/share` | Generate shareable link |

### When Modifying Shared Components

These canvas components are shared between the editor (`/app`) and replay (`/replay/[id]`). When modifying them, test both routes. See [CLAUDE.md](../CLAUDE.md) "Shared Canvas Components" section.

---

## File Organization

```
docs/
├── README.md                          # This file
├── architecture/
│   ├── database-schema.md             # Supabase PostgreSQL tables and RLS
│   ├── api-contracts.md               # API endpoint specifications
│   └── auth-patterns.md               # Supabase auth guide
├── development/
│   └── getting-started.md             # Setup guide for new developers
├── testing/
│   ├── strategy.md                    # Overall testing approach
│   └── e2e-guide.md                   # Playwright E2E tests reference
├── troubleshooting/
│   ├── session-persistence.md         # Debugging auth session issues
│   └── production-stability.md        # API stability debugging
└── operations/
    ├── ci-cd-setup.md                 # GitHub Actions and Vercel
    ├── staging-setup.md               # Staging environment
    └── operations.md                  # Backup and recovery

specs/
├── 004-post-launch-improvements/      # Current iteration
└── archive/
    └── specs/
        ├── 003-online-platform/       # Completed
        ├── 002-clean-iteration/       # Completed
        └── 001-vite-migration/        # Completed

.specify/
├── memory/
│   ├── constitution.md                # Core governance
│   └── PRD.md                         # Product requirements
└── templates/                         # Workflow templates

Root Files:
├── CLAUDE.md                          # Auto-generated dev guidelines
├── README.md                          # User-facing project overview
├── package.json                       # Dependencies and scripts
└── middleware.ts                      # Auth refresh
```

---

## Recent Changes

**2026-01-31**: Documentation reorganization
- Created centralized `/docs/` structure
- Extracted architecture docs from specs
- Moved troubleshooting guides from root
- Moved testing strategy from root
- Created developer getting-started guide
- Linked all documentation in this index

**2026-01-30**: 003-online-platform complete
- All 111 development tasks completed
- Full Next.js migration with user accounts
- Cloud storage, galleries, upvoting, moderation
- Started Phase 13 - Production Deployment

---

## Quick Links

- **[Getting Started](development/getting-started.md)** - First thing to read
- **[CLAUDE.md](../CLAUDE.md)** - Comprehensive guidelines
- **[Auth Patterns](architecture/auth-patterns.md)** - How auth works
- **[API Contracts](architecture/api-contracts.md)** - All endpoints
- **[Database Schema](architecture/database-schema.md)** - Data model
- **[Testing Strategy](testing/strategy.md)** - How to test
- **[Constitution](../.specify/memory/constitution.md)** - Core principles
- **[GitHub Issues](https://github.com/your-org/coaching-animator/issues)** - Questions & bugs

---

**Project**: Coaching Animator
**Status**: Active Development (Phase 13)
**Last Updated**: 2026-01-31
