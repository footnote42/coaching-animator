# Migration History

**Last Updated**: 2026-02-14

This document tracks major architectural migrations and refactorings in the coaching-animator project.

---

## Timeline Overview

```
2024-01-26: Project Start (Vite + React)
     ↓
2026-01-30: Vite → Next.js 14 App Router
     ↓
2026-02-04: Vite Code Cleanup (756 lines removed)
     ↓
2026-02-14: Feature-Based Architecture Refactor (85 files migrated)
```

---

## Migration 1: Vite → Next.js (2026-01-30)

### Context

**Spec**: `archive/specs/003-online-platform/`

**Goal**: Migrate from Vite to Next.js to support online platform features (user accounts, cloud storage, galleries, SSR/SSG).

**Decision Drivers**:
- Need for API routes (serverless functions)
- SSR/SSG for SEO and performance
- Authentication patterns (Supabase + Next.js SSR)
- PWA support with `@serwist/next`

### Changes

**Before** (Vite):
```
src/
├── App.tsx              # Main editor (Vite SPA entry)
├── components/          # All components flat
├── stores/              # Zustand stores
├── types/               # TypeScript types
├── utils/               # Utility functions
└── main.tsx             # Vite entry point
```

**After** (Next.js):
```
src/
├── app/                 # Next.js App Router
│   ├── (auth)/          # Auth pages
│   ├── (legal)/         # Legal pages
│   ├── admin/           # Admin dashboard
│   ├── api/             # API routes
│   ├── gallery/         # Public gallery
│   ├── my-gallery/      # Personal gallery
│   ├── app/             # Animation tool (ported from Vite)
│   ├── page.tsx         # Landing page
│   └── layout.tsx       # Root layout
├── components/          # React components (kept)
├── stores/              # Zustand stores (kept)
├── types/               # TypeScript types (kept)
└── utils/               # Utility functions (kept)
```

**Key Technical Changes**:
- Added `'use client'` directives to all canvas components
- Wrapped React-Konva with `next/dynamic` and `{ ssr: false }`
- Created Supabase clients for server/client contexts
- Migrated editor from `src/App.tsx` → `src/app/app/page.tsx`
- Added middleware for auth token refresh

**Files Changed**: ~50 files
**Lines Added**: ~3,000 lines (API routes, auth pages, galleries)
**Lines Removed**: 0 (Vite code kept temporarily)

### Outcome

✅ **Success**: Next.js migration complete with working editor, auth, galleries
✅ **PWA**: Service worker configured with `@serwist/next`
✅ **SSR**: Landing page, galleries use SSR for SEO
✅ **API**: 12 API endpoints created for CRUD, upvoting, reporting

**Remaining Issues**:
- Vite code still present (dead code in `src/App.tsx`)
- Static generation failing (dynamic rendering only)

**Spec Status**: Phase 1-8 complete (111/111 tasks)

---

## Migration 2: Vite Code Cleanup (2026-02-04)

### Context

**Issue**: Dead Vite code still present in codebase after Next.js migration

**Affected Files**:
- `src/App.tsx` (legacy Vite editor)
- Vite-specific imports and patterns

### Changes

**Removed**:
- `src/App.tsx` (756 lines) - Replaced by `src/app/app/page.tsx`
- Vite-specific imports and comments
- Legacy patterns (Vite SPA routing)

**Updated**:
- CLAUDE.md - Noted `src/App.tsx` deletion
- Entity handler documentation - Point to Next.js editor only

**Files Changed**: 15 files
**Lines Removed**: 756 lines

### Outcome

✅ **Success**: Clean codebase with no Vite remnants
✅ **Editor**: Single source of truth at `src/features/animation/components/Editor.tsx`
✅ **Maintenance**: Reduced confusion about which editor to modify

---

## Migration 3: Feature-Based Architecture Refactor (2026-02-14)

### Context

**Task**: T003 (Parent: T001 - Project Refactor and V2 Foundation)

**Goal**: Refactor flat `src/` structure to feature-based architecture for V2.0 scalability (organizations, collections, progressions).

**Decision Drivers**:
- Prepare for V2.0 features (organizations, collections, progressions)
- Improve code organization and discoverability
- Enable clean module boundaries
- Support better testing and documentation

### Changes

**Before** (Flat Structure):
```
src/
├── components/          # All components mixed
│   ├── AnimationCard.tsx
│   ├── Canvas/
│   ├── DeleteConfirmDialog.tsx
│   ├── Editor.tsx
│   ├── EntityPalette.tsx
│   ├── Navigation.tsx
│   └── [40+ other components]
├── stores/
│   ├── projectStore.ts
│   └── uiStore.ts
├── hooks/
│   ├── useAnimationLoop.ts
│   └── [7 other hooks]
├── types/
├── utils/
├── constants/
└── services/
```

**After** (Feature-Based):
```
src/
├── core/                # Shared utilities, domain logic
│   ├── hooks/           # 8 React hooks
│   ├── stores/          # Zustand stores (projectStore, uiStore)
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Pure utility functions
│   ├── constants/       # Design tokens, validation rules
│   └── index.ts         # Barrel export
├── features/            # Feature modules (domain-driven)
│   ├── animation/       # Animation editor feature
│   │   ├── components/  # Editor, ReplayViewer, Canvas, Sidebar, Timeline
│   │   ├── services/    # EntityColors service
│   │   └── index.ts     # Barrel export
│   └── gallery/         # Gallery feature
│       ├── components/  # AnimationCard, PublicAnimationCard, SkeletonCard
│       └── index.ts     # Barrel export
├── shared/              # Shared UI components
│   ├── components/      # Navigation, ErrorBoundary, Modals
│   ├── ui/              # Button, Dialog, Input, Select, Slider
│   └── index.ts         # Barrel export
└── lib/                 # Third-party integrations
    ├── contexts/        # UserContext
    └── supabase/        # Supabase clients
```

**Path Aliases Added** (`tsconfig.json`):
```json
{
  "@/core/*": ["./src/core/*"],
  "@/features/*": ["./src/features/*"],
  "@/shared/*": ["./src/shared/*"],
  "@/lib/*": ["./src/lib/*"]
}
```

**Files Changed**: 85 files migrated
**Imports Updated**: 132+ import statements
**Lines Changed**: ~200 lines (mostly imports)

### Technical Implementation

**Phase 1: Create Module Structure**
- Created `src/core/`, `src/features/`, `src/shared/` directories
- Moved files to appropriate modules
- Created barrel exports (`index.ts`) for each module

**Phase 2: Update Imports** (T004)
- Updated all imports to use path aliases
- Replaced relative imports (`../../`) with `@/` aliases
- Fixed circular dependencies

**Phase 3: Documentation** (T005)
- Created comprehensive README for each module (~9,700 lines total)
- Updated root README with new structure
- Updated CLAUDE.md with file locations

### Outcome

✅ **Success**: Clean feature-based architecture
✅ **V2.0 Ready**: Easy to add `src/features/organizations/`, `src/features/collections/`, `src/features/progressions/`
✅ **TypeScript**: Compilation passes with no errors
✅ **Tests**: All E2E tests passing
✅ **Documentation**: ~9,700 lines of module documentation

**Benefits**:
- Clear module boundaries (core, features, shared, lib)
- Easy to find components (by feature, not by type)
- Better testability (features can be tested in isolation)
- Prevents circular dependencies (enforced by module rules)

**Module Rules**:
```
✅ features/animation/ → @/core, @/shared, @/lib
✅ features/gallery/   → @/core, @/shared, @/lib
✅ shared/             → @/core
❌ core/               → features/* (PROHIBITED)
❌ core/               → shared/*  (PROHIBITED)
❌ shared/             → features/* (PROHIBITED)
```

---

## Migration Lessons Learned

### What Went Well

1. **Incremental Approach**: Migrations done in phases, not big-bang
2. **Documentation First**: Specs written before implementation
3. **Testing**: E2E tests caught regressions
4. **Barrel Exports**: Made migration to path aliases easier

### What Could Improve

1. **Vite Cleanup Earlier**: Dead code lingered for 5 days after Next.js migration
2. **Type Safety**: Some `any` types introduced during migrations (fixed later)
3. **Testing**: More unit tests needed before refactors

### Best Practices Established

1. **Path Aliases**: Always use `@/` aliases, never relative imports across features
2. **Barrel Exports**: Every module has `index.ts` exporting public API
3. **Documentation**: Update CLAUDE.md, README.md, and module READMEs after migrations
4. **Commits**: Atomic commits per phase, descriptive messages with Co-Authored-By

---

## Future Migrations (Planned)

### V2.0 Feature Additions

**Organizations Module** (`src/features/organizations/`):
- Team/club management
- Multi-user collaboration
- Organizational hierarchies

**Collections Module** (`src/features/collections/`):
- Drill libraries
- Template marketplace
- Collection sharing

**Progressions Module** (`src/features/progressions/`):
- Training progressions
- Skill development tracking
- Player progression analytics

**Migration Strategy**:
- Create new feature modules following established patterns
- Use path aliases from day one
- Write module README before implementation
- Follow module dependency rules (features → core/shared/lib)

---

## Migration Tooling

### Scripts Created

None yet - all migrations done manually with careful review.

**Future Consideration**: Create migration scripts for:
- Automatic import path updates
- Barrel export generation
- Module boundary validation

### Validation Checklist

Before completing a migration:
- [ ] TypeScript compilation passes (`npx tsc --noEmit`)
- [ ] ESLint passes (`npm run lint`)
- [ ] E2E tests pass (`npm run e2e`)
- [ ] Unit tests pass (`npm test -- --run`)
- [ ] Documentation updated (CLAUDE.md, README.md, module READMEs)
- [ ] Commits pushed to remote

---

## Related Documentation

- **[Tech Stack](../development/tech-stack.md)** - Active technologies
- **[CHANGELOG](../CHANGELOG.md)** - Recent changes and project status
- **[Feature READMEs](../../src/features/)** - Module-specific documentation
- **[PRD v2.0](../authority/PRD-v2.0.md)** - V2.0 vision and future features
