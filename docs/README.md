# Coaching Animator Documentation

**Last Updated**: 2026-02-21
**Project Status**: v2.0 Phase 0-1 complete. Phase 2 (Progressions & Remix Genealogy) next.
**Architecture**: Feature-based — `src/core/`, `src/features/`, `src/shared/`

---

## Quick Start

**New to the project?** Start here:
1. [Getting Started Guide](development/getting-started.md) - Setup and first run
2. [CLAUDE.md](../CLAUDE.md) - Development guidelines
3. [Project README](../README.md) - User-facing overview

---

## Authority Documents

These govern the project's direction and constraints:

- **[PRD-v2.0](authority/PRD-v2.0.md)** - Product Requirements Document (active, rugby coaching platform)
- **[Constitution](authority/constitution.md)** - v3.4.0 governance, tiered model (Tier 0-4), absolute prohibitions
- **[Roadmap](authority/ROADMAP.md)** - Phased development plan linking PRD, Constitution, and vision
- **[Changelog](CHANGELOG.md)** - Notable changes from v2.0 onward

---

## Architecture

- **[Database Schema](architecture/database-schema.md)** - Supabase PostgreSQL tables, RLS policies, relationships
- **[API Contracts](architecture/api-contracts.md)** - RESTful endpoint specifications
- **[Auth Patterns](architecture/auth-patterns.md)** - Supabase authentication guide
- **[Migration History](architecture/migration-history.md)** - Database migration log

---

## Development

- **[Getting Started](development/getting-started.md)** - Setup, environment, first run
- **[Patterns](development/patterns.md)** - Code patterns and conventions
- **[Tech Stack](development/tech-stack.md)** - Framework and library details

---

## Testing

- **[Testing Strategy](testing/strategy.md)** - Overall E2E testing approach
- **[E2E Guide](testing/e2e-guide.md)** - Playwright test reference

---

## Operations

- **[CI/CD Setup](ci-cd-setup.md)** - GitHub Actions and Vercel deployment
- **[Staging Setup](staging-setup.md)** - Staging environment configuration
- **[Operations](operations.md)** - Backup and recovery runbook

---

## Troubleshooting

- **[Session Persistence](troubleshooting/session-persistence.md)** - Debugging auth session issues
- **[Production Stability](troubleshooting/production-stability.md)** - API stability debugging
- **[Safari/iOS Export](technical/safari-ios-export.md)** - Safari export research

---

## Feature Module Documentation

Each feature module has its own comprehensive README:

| Module | README | Lines |
|--------|--------|-------|
| Animation | [src/features/animation/README.md](../src/features/animation/README.md) | ~3,800 |
| Gallery | [src/features/gallery/README.md](../src/features/gallery/README.md) | ~1,100 |
| Core | [src/core/README.md](../src/core/README.md) | ~2,900 |
| Shared UI | [src/shared/README.md](../src/shared/README.md) | ~1,900 |

---

## Sharing & Replay Feature

Animations can be shared via read-only replay links:

1. **Create**: User creates animation in the editor at `/app`
2. **Save**: User saves to cloud (requires authentication)
3. **Publish**: User sets visibility to `public` or `link-shared`
4. **Share**: Animation accessible at `/replay/[id]` (read-only replay)

### Shared Canvas Components

These components are shared between Editor (`/app`) and Replay (`/replay/[id]`). When modifying, test both routes:

| Component | Location |
|-----------|----------|
| Stage | `src/features/animation/components/Canvas/Stage.tsx` |
| Field | `src/features/animation/components/Canvas/Field.tsx` |
| EntityLayer | `src/features/animation/components/Canvas/EntityLayer.tsx` |
| AnnotationLayer | `src/features/animation/components/Canvas/AnnotationLayer.tsx` |
| PlayerToken | `src/features/animation/components/Canvas/PlayerToken.tsx` |

---

## File Organization

```
docs/
├── README.md                          # This file
├── CHANGELOG.md                       # v2.0+ changelog
├── authority/
│   ├── PRD-v2.0.md                    # Product Requirements (active)
│   ├── constitution.md                # Governance v3.4.0
│   └── ROADMAP.md                     # Phased development plan
├── architecture/
│   ├── database-schema.md             # Supabase tables and RLS
│   ├── api-contracts.md               # API endpoint specifications
│   ├── auth-patterns.md               # Supabase auth guide
│   └── migration-history.md           # DB migration log
├── development/
│   ├── getting-started.md             # Setup guide
│   ├── patterns.md                    # Code conventions
│   └── tech-stack.md                  # Framework details
├── testing/
│   ├── strategy.md                    # Testing approach
│   └── e2e-guide.md                   # Playwright reference
├── troubleshooting/
│   ├── session-persistence.md         # Auth session debugging
│   └── production-stability.md        # API stability
├── technical/
│   └── safari-ios-export.md           # Safari export research
├── ci-cd-setup.md                     # GitHub Actions + Vercel
├── staging-setup.md                   # Staging environment
└── operations.md                      # Backup and recovery
```

---

## Documentation by Role

### For New Developers
1. [Getting Started](development/getting-started.md)
2. [CLAUDE.md](../CLAUDE.md)
3. [Auth Patterns](architecture/auth-patterns.md)

### For Frontend Engineers
1. [Patterns](development/patterns.md)
2. [API Contracts](architecture/api-contracts.md)
3. [Database Schema](architecture/database-schema.md)

### For DevOps/Infrastructure
1. [CI/CD Setup](ci-cd-setup.md)
2. [Operations](operations.md)
3. [Production Stability](troubleshooting/production-stability.md)

### For QA/Testing
1. [Testing Strategy](testing/strategy.md)
2. [E2E Guide](testing/e2e-guide.md)

### For Project Managers
1. [Roadmap](authority/ROADMAP.md)
2. [PRD-v2.0](authority/PRD-v2.0.md)
3. [Constitution](authority/constitution.md)

---

## Maintenance & Archive

Historical documentation is preserved in `.gitignored` archive directories:
- **`archive/v1-docs/`** — PRD v1.0, alignment reports, V2 Vision, historical bug audits
- **`archive/completed-phases/`** — v1.0 changelog, session handoffs, completed phase artifacts
- **`archive/specs/`** — Specifications 001-006 (all completed)
- **`archive/implementation_plans/`** — Phase-by-phase implementation plans
