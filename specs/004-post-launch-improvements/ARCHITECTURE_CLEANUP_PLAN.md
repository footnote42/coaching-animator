# Architecture Cleanup Plan: Vite Code Removal

## Executive Summary
- **Decision Date**: 2026-01-31
- **Execution Date**: 2026-02-04
- **Status**: ✅ Complete
- **Commit**: eb5f41c
- **Strategy**: Option 2 V3 (Safe Cleanup with Deep-Scan Validation)

## Background
After migrating from Vite to Next.js (spec 003), the codebase retained 5 dead Vite files (756 lines) that were no longer executed but created maintenance burden and confusion.

## Problem Statement
- Dead code chain: index.html → src/main.tsx → src/App.tsx (never executed)
- Active code chain: app/app/page.tsx → components/Editor.tsx → src/* (animation engine)
- Confusion: Two editors (src/App.tsx and components/Editor.tsx) with only one active
- References to deleted files in documentation

## Options Considered

### Option 1: Keep Dead Code (Rejected)
**Pros**: Zero risk
**Cons**: Maintenance burden, developer confusion, stale documentation

### Option 2: Remove Dead Code (Selected)
**Pros**: Clean codebase, clear documentation, no maintenance burden
**Cons**: Medium risk (requires careful verification)

### Option 3: Comment Out Dead Code (Rejected)
**Pros**: Easy to revert
**Cons**: Still creates clutter, doesn't solve confusion

## Selected Strategy: Option 2 V3

**Deep-Scan Validation** approach with comprehensive pre-deletion verification:

1. **Environment Leakage Check**: Verify zero `import.meta.env` usage
2. **Type Dependency Check**: Verify no global types from vite-env.d.ts
3. **CSS Audit**: Verify src/index.css is 100% duplicate of app/globals.css
4. **SVG Asset Check**: Verify runtime paths (not Vite-specific imports)
5. **Cross-Platform Paths**: Use project-relative paths for safety

## Files Deleted

1. **src/main.tsx** (81 lines) - Vite entry point, never executed in Next.js
2. **src/vite-env.d.ts** (1 line) - Vite type definitions (no global types used)
3. **src/index.css** (82 lines) - 100% duplicate of app/globals.css
4. **src/App.tsx** (571 lines) - Legacy editor, replaced by components/Editor.tsx
5. **index.html** (21 lines) - Dead Vite HTML, references deleted files

**Total**: 756 lines + 1 HTML file

## Files Preserved

All 48 active animation engine files in `src/` directory:
- `src/components/` - Canvas, Sidebar, Timeline (20+ files)
- `src/hooks/` - Custom React hooks (8 files)
- `src/store/` - Zustand state management (2 files)
- `src/services/` - EntityColors service (1 file)
- `src/constants/` - Design tokens, validation (3 files)
- `src/types/` - TypeScript definitions (3 files)
- `src/utils/` - File I/O, serialization, interpolation (6 files)
- `src/assets/` - Field SVG files

## Verification Results

**Pre-Deletion Validation**:
- ✅ Zero `import.meta.env` usage in src/ directory
- ✅ No global type dependencies from vite-env.d.ts
- ✅ CSS files verified identical (both use Tailwind v4 @theme)
- ✅ SVG assets use runtime paths (not Vite-specific imports)
- ✅ Cross-platform paths used

**Post-Deletion Verification**:
- ✅ TypeScript compilation passes (`npx tsc --noEmit`)
- ✅ ESLint passes (`npm run lint`)
- ✅ Dev server runs without errors
- ✅ Editor loads at /app route
- ✅ All UI elements present and functional
- ✅ Zero console errors
- ✅ No 404 errors for deleted files
- ✅ Auto-save functionality verified
- ✅ Fast Refresh (HMR) working
- ✅ Entity creation tested (cone, ball, player)
- ✅ Field SVG assets load correctly

## Updated References

**File 1: components.json**
- Updated CSS path from `src/index.css` to `app/globals.css`

**File 2: CLAUDE.md**
- Added architecture documentation section
- Added cleanup history entry
- Documented that src/App.tsx is deleted

**File 3: components/Editor.tsx**
- Added inline documentation header
- Clarified this is the sole editor implementation

## Impact

**Code Quality**:
- 756 lines of dead code removed
- Clear editor architecture (single implementation)
- No maintenance burden from dead files

**Developer Experience**:
- Clear documentation on which editor to modify
- No confusion about Vite vs Next.js
- Easier onboarding for new developers

**Risk Mitigation**:
- Comprehensive verification prevented issues
- All critical checks passed
- Production deployment successful

## Rollback Procedures

**If Issues Found**:
1. Before push: `git reset --hard HEAD~1`
2. After push: `git revert eb5f41c`

**No rollback needed** - All verification passed, production stable.

## Timeline

- **2026-01-31**: Planning and deep-scan validation
- **2026-02-04**: Execution and verification (60 minutes)
- **2026-02-04**: Merged to main and deployed to production
- **2026-02-04+**: 24-48 hour soak test (successful, no issues)

## Related Documentation

- **Commit**: eb5f41c (chore: remove dead Vite code with deep-scan validation)
- **Plan File**: C:\Users\kenho\.claude\plans\async-swimming-wolf.md
- **Spec 004**: Phase 8 (Architecture Cleanup) now verified complete
- **CLAUDE.md**: Lines 129-172 (Architecture section)

## Conclusion

The Vite cleanup was successfully completed with zero production issues. The codebase is now cleaner, clearer, and easier to maintain. All verification checks passed, and the production deployment was successful.

**Status**: ✅ Complete and Verified
**Recommendation**: This cleanup demonstrates the value of deep-scan validation for architectural changes.
