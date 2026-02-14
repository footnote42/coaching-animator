# Changelog

All notable changes to the coaching-animator project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- GIF export functionality (Safari compatibility)
- Password reset flow (forgot password)
- Navigation component integration
- Retry logic for offline actions

---

## [1.1.0] - 2026-02-14 - V2 Foundation Refactor

### Added
- Feature-based architecture (T003) - 85 files migrated to `src/core/`, `src/features/`, `src/shared/`
- Path aliases (`@/core/*`, `@/features/*`, `@/shared/*`, `@/lib/*`) in tsconfig.json
- Barrel exports (`index.ts`) for all modules (T004)
- Comprehensive module READMEs (~9,700 lines total) (T005)
  - `src/features/animation/README.md` (~3,800 lines)
  - `src/features/gallery/README.md` (~1,100 lines)
  - `src/core/README.md` (~2,900 lines)
  - `src/shared/README.md` (~1,900 lines)
- PRD v2.0 DRAFT with organizational tier and privacy-preserving metrics (T002)
- Alignment audit resolution (11 issues resolved, CA-2026-002 ratified)

### Changed
- Migrated all imports to path aliases (132+ imports updated)
- Updated root README with feature-based architecture diagram
- Updated CLAUDE.md with new file locations
- Updated Constitution to v3.3 (Organizational Tier & Privacy-Preserving Metrics)

### Technical
- TypeScript compilation passes with no errors
- All E2E tests passing
- ESLint passes

### Documentation
- Created comprehensive documentation hub at `docs/README.md`
- Organized docs by role (frontend, backend, QA, DevOps)
- Added troubleshooting guides, testing strategy, architecture docs

---

## [1.0.1] - 2026-02-09 - Critical Bug Fixes

### Fixed
- **CRIT-003**: Schema validation bug preventing animations with tackle equipment from saving
  - Updated `EntitySchema` to include all 6 entity types (tackle-shield, tackle-bag)
  - Fixed error handling to distinguish client vs network errors
  - Refactored to shared `ENTITY_TYPES` constant to prevent schema drift

### Added
- Shared `ENTITY_TYPES` constant exported from `@/core/types`

### Documentation
- Updated `archive/specs/005-incremental-improvements/PROGRESS.md` with resolution details

---

## [1.0.0] - 2026-02-05 - Replay Viewer Overhaul

### Changed
- **MED-001 + MED-002**: Rewrote ReplayViewer to reuse Editor's canvas components
  - Pixel-identical rendering between editor and replay modes
  - Store-free `useReplayAnimationLoop` hook (no Zustand dependency)
  - Smooth entity interpolation with RAF-based animation

### Added
- Speed controls for replay (0.5x, 1x, 2x)
- Loop toggle for replay
- Centralized `normalizeReplayPayload()` for backward compatibility
- 3 defensive render tests for ReplayViewer

### Documentation
- Updated `src/features/animation/README.md` with ReplayViewer architecture

---

## [0.9.0] - 2026-02-04 - Vite Code Cleanup

### Removed
- Dead Vite code (756 lines)
  - `src/App.tsx` (legacy Vite editor)
  - Vite-specific imports and patterns

### Changed
- Updated CLAUDE.md to note `src/App.tsx` deletion
- Entity handler documentation now points to Next.js editor only

### Technical
- Single source of truth for editor: `src/features/animation/components/Editor.tsx`

---

## [0.8.0] - 2026-02-01 - Incremental Improvements Spec

### Added
- New spec: `archive/specs/005-incremental-improvements/` (14 issues identified)
  - 🔴 2 Critical: Retry logic not wired up
  - 🟠 5 High: Navigation, Safari export, password reset, sharing
  - 🟡 5 Medium: Performance, layout
  - 🟢 2 Low: Minor UX improvements

### Documentation
- Risk assessment for all 14 issues
- Pick-and-choose approach for incremental fixes

---

## [0.7.0] - 2026-02-01 - Profile Bugs Fixed

### Fixed
- Display name persistence issue
- Animation count display issue
- Root cause: Missing `max_animations` column in database schema

### Added
- Database migration for `max_animations` column
- Comprehensive E2E tests for profile functionality
- Troubleshooting documentation at `docs/troubleshooting/profile-bugs-resolution-summary.md`

---

## [0.6.0] - 2026-01-30 - Online Platform Complete

### Added
- **All 9 User Stories Complete** (111/111 tasks)
  - US1-US3: Authentication, cloud save/load, public gallery
  - US4-US7: Guest mode, upvoting, reporting, landing page
  - US8-US9: Admin moderation, remix functionality
- Next.js 14 App Router with SSR/SSG
- Supabase PostgreSQL database with RLS
- PWA with offline support (`@serwist/next`)
- Email-based authentication (no third-party providers)
- Public gallery with search and upvoting
- Admin dashboard for moderation

### Changed
- Architecture pivot to cloud-first model
  - Tier 0 (Guest): 10-frame local editing, JSON export only
  - Tier 1 (Authenticated): Cloud storage, 50 animations max
  - Tier 2 (Public/Link-Shared): Read-only replay, upvoting
  - Tier 3 (Admin): Moderation, user management

### Database
- Created 6 tables: `user_profiles`, `saved_animations`, `upvotes`, `content_reports`, `follows`, `rate_limits`
- Implemented Row Level Security (RLS) policies for all tables

### API
- 12 API endpoints for CRUD, upvoting, reporting, moderation
- See `docs/architecture/api-contracts.md` for full specifications

### Documentation
- Complete spec at `archive/specs/003-online-platform/spec.md`
- API contracts at `docs/architecture/api-contracts.md`
- Database schema at `docs/architecture/database-schema.md`

---

## [0.5.0] - 2026-01-29 - Constitution v3.0.0

### Added
- Tier 3 (Authenticated Features) governance rules
  - User accounts, cloud storage, public gallery
  - Email-only auth, minimal profile data
  - GDPR compliance

### Changed
- Updated Constitution to v3.0.0
- Tier 1 (offline core) remains sacred

---

## [0.4.0] - 2026-01-27 - Vercel Functions Implementation

### Added
- Phase 3.2: Production-ready API handlers for link-sharing
- Serverless functions for animation CRUD

---

## [0.3.0] - 2026-01-26 - Supabase Setup

### Added
- Phase 3.1: Backend infrastructure for link-sharing
- Supabase PostgreSQL database
- Supabase Auth for user authentication

---

## Project Status Overview

### Completed Iterations

#### 002-clean-iteration ✅ COMPLETE
- Phase 3: Basic Animation (T031-T044)
- Phase 4: Save/Load
- Phase 5: Export Video
- Phase 6: Share Animation Link (Tier 2)

#### 003-online-platform ✅ COMPLETE
- **Goal**: Migrate to Next.js + add user accounts, cloud storage, galleries
- **Status**: 111/111 tasks complete (~95% of total project)
- **Planning Phase**: ✅ COMPLETE (2026-01-29)
- **Implementation Phases**: ✅ COMPLETE (2026-01-30)

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

#### 004-post-launch-improvements 🟡 PARTIAL (50-60%)
- Systematic verification found actual completion at 50-60%
- Critical failures: Retry logic not wired up, navigation not integrated, GIF export missing
- See `archive/specs/004-post-launch-improvements/VERIFICATION.md`

#### 005-incremental-improvements 🔄 IN PROGRESS
- 14 issues identified (2 critical, 5 high, 5 medium, 2 low)
- Pick-and-choose approach for incremental fixes
- See `archive/specs/005-incremental-improvements/`

### Current Phase
Phase 13 - Production Deployment (25 remaining tasks)

---

## Known Issues

### Critical (🔴 2)
- **Retry logic exists but not wired up** - Offline actions not queued
- **Navigation component not integrated** - Missing from app layout

### High (🟠 5)
- Safari video export unstable
- Password reset flow missing
- Share button visibility inconsistent
- Performance issues with 30+ entities
- Mobile layout issues

### Medium (🟡 5)
- Frame strip not virtualized (performance)
- No loading states for async operations
- Color picker UX improvements needed
- Entity label editing clunky
- Timeline scrubbing not implemented

### Low (🟢 2)
- Keyboard shortcuts documentation incomplete
- Onboarding tutorial could be improved

See `archive/specs/005-incremental-improvements/` for full details.

---

## Constitutional Compliance

All changes must comply with Constitution v3.3:

**Absolute Prohibitions**:
- ❌ No telemetry, analytics, or tracking
- ❌ No third-party identity providers (Google, Facebook, etc.)
- ❌ No third-party analytics services
- ❌ No advertising or sponsored content
- ❌ No paywalls for core features

See `docs/authority/constitution.md` for full governance rules.

---

## Related Documentation

- **[Migration History](architecture/migration-history.md)** - Technology migration timeline
- **[Tech Stack](development/tech-stack.md)** - Active technologies
- **[README.md](../README.md)** - Project overview and setup
- **[PRD v1.0](authority/PRD.md)** - Product requirements (89% coverage)
- **[PRD v2.0](authority/PRD-v2.0.md)** - V2.0 vision (DRAFT)
- **[Constitution](authority/constitution.md)** - v3.3 governance rules
