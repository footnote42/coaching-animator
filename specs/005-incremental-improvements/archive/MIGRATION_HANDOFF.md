# Migration Handoff: Resolve SSR/Hydration Error

**Date**: 2026-02-07  
**Issue**: HIGH-006 (Mobile Replay Optimization) - Blocked by runtime error  
**Current Blocker**: `TypeError: e[o] is not a function` (webpack runtime)  
**Root Cause**: Module resolution ambiguity from dual directory structure  
**Estimated Time**: 2-4 hours (across multiple phases)

---

## Context

The application is experiencing a **persistent SSR/hydration error** that prevents any page from loading in both dev and production modes. This error was discovered during Task 13 (Manual Desktop Regression Testing) and has been traced to **module resolution ambiguity** caused by having both:
- `/lib` and `/src/lib`
- `/components` and `/src/components`

This dual structure is confusing Next.js's webpack module resolution, resulting in the runtime error `TypeError: e[o] is not a function`.

### What Was Investigated

✅ **Confirmed**:
- App Router structure (`/app`)
- Single React instance (18.3.1, deduped)
- Supabase client/server split is clean
- `rate-limit.ts` is Edge-safe (Map/Date only)
- Valid animation ID for testing: `ca77fbf0-bc62-4e28-bbd4-882b6d6c1abe`

✅ **Identified Risks**:
- `next.config.js` has hardcoded `swSrc: 'app/sw.ts'` (breaks when moving `/app`)
- Middleware must be at root OR `/src`, never both
- Vitest config has custom `@/*` resolver requiring update
- Server-only utilities must not leak into client bundles

---

## Your Mission

Execute a **sequential, gate-based migration** to consolidate all source code under `/src` and eliminate the dual directory ambiguity.

**Critical**: Each phase has a GATE. If a gate fails, **ROLLBACK** immediately using the rollback plan.

---

## Implementation Plan

**Full Plan**: See `specs/005-incremental-improvements/MIGRATION_PLAN.md`

### Phase 0: Pre-Flight Checks

- [ ] Ensure clean git state: `git status`
- [ ] Establish baseline: `npm run build` (may fail, but capture output)
- [ ] Verify no fragile imports: `grep -r "from.*public" src/ app/`

### Phase 1: Config Alignment

- [ ] Update `tsconfig.json`: Set `"paths": { "@/*": ["./src/*"] }` (remove `./*` fallback)
- [ ] Note `vitest.config.ts` for post-move update
- [ ] Verify ESLint uses `next/core-web-vitals` (auto-handles paths)

### Phase 2A: Move `components/` → `src/components/`

**Files to move** (11 files from `/components`):
- `Editor.tsx`, `Navigation.tsx`, `OfflineIndicator.tsx`, `OnboardingTutorial.tsx`, `SaveToCloudModal.tsx`, and 6 others

**Steps**:
1. Create `src/components/root/` if merging, OR move directly to `src/components/`
2. Move files: `mv components/* src/components/root/`
3. Find all imports: `grep -r "from.*components" app/ src/`
4. Update to use `@/components`
5. **GATE**: `npm run build` succeeds

### Phase 2B: Move `lib/` (Safe Utils Only)

**Move these files ONLY**:
- `api-client.ts`, `browser-detect.ts`, `error-messages.ts`, `moderation.ts`, `offline-queue.ts`, `quota.ts`, `schemas/`, `thumbnail.ts`

**DO NOT move yet**: `auth.ts`, `rate-limit.ts`, `supabase/` (Phase 2C)

**Steps**:
1. Move files to `src/lib/`
2. Update imports to `@/lib/*`
3. **GATE**: `npm run build` succeeds

### Phase 2C: Move Server-Only Utils (Guarded)

**Critical**: These require boundary enforcement.

**Physical separation** (create these directories):
- `src/lib/server/` - for `auth.ts`, `rate-limit.ts`
- `src/lib/supabase/` - for Supabase config

**Steps**:
1. Move `auth.ts` → `src/lib/server/auth.ts`
2. Move `rate-limit.ts` → `src/lib/server/rate-limit.ts`
3. Move `supabase/` → `src/lib/supabase/`
4. **Audit**: `grep -r "'use client'" src/ | xargs grep "lib/server"` → MUST be empty
5. Update API route imports
6. **GATE**: `curl http://localhost:3000/api/animations` returns 401

### Phase 2D: Move `/app` → `/src/app` (HIGH IMPACT)

**Critical**: Update `next.config.js` FIRST.

**Steps**:
1. **Update `next.config.js`**:
   ```js
   swSrc: 'src/app/sw.ts',  // was 'app/sw.ts'
   ```
2. Move entire router: `mv app src/app`
3. Move middleware: `mv middleware.ts src/middleware.ts`
4. Verify `src/app/globals.css` still imports Tailwind
5. Delete old `/app` directory (confirm empty first)
6. **GATE**: `npm run build && npm run start` both succeed, `/` loads without error

### Phase 3: Import Normalization & Cleanup

- [ ] Convert remaining relative imports to `@/` aliases
- [ ] Delete old directories: `rm -rf components lib` (after verification)
- [ ] Audit for `export default` vs named export consistency

### Phase 4: Production Verification

**Build Checks**:
- `npx tsc --noEmit` → 0 errors
- `npm run build` → All routes pass static generation
- `npm run lint` → 0 errors
- `npm ls react` → Single version

**Runtime Checks**:
- `npm run start` + test `/`, `/gallery`, `/replay/ca77fbf0-bc62-4e28-bbd4-882b6d6c1abe`
- Verify middleware executes (auth flow works)
- Verify API routes respond correctly
- Confirm Tailwind styles in production build

---

## Critical Files

### Config Files (Update During Migration)
- `next.config.js` - Update `swSrc` in Phase 2D
- `tsconfig.json` - Update paths in Phase 1
- `vitest.config.ts` - Update after Phase 2D

### Files to Move
```
/components → src/components/root/
/lib → src/lib/ (phased, see plan)
/app → src/app/
/middleware.ts → src/middleware.ts
```

### Server-Only Boundary (Phase 2C)
```
src/lib/server/
  ├── auth.ts
  └── rate-limit.ts
src/lib/supabase/
  ├── client.ts
  ├── server.ts
  └── middleware.ts
```

---

## Rollback Plan

**If any GATE fails**:
1. `git reset --hard HEAD`
2. `rm -rf .next`
3. `npm run dev`
4. Document failure and stop

---

## Verification Commands

```bash
# Pre-flight
git status
npm run build  # Baseline (may fail)

# Phase gates
npm run build  # Must pass after each phase
npm run start  # Production runtime check (Phase 2D+)
npx tsc --noEmit  # Type check (Phase 4)
npm run lint  # Lint check (Phase 4)

# Boundary audit (Phase 2C)
grep -r "'use client'" src/ | xargs grep "lib/server"  # Must be empty

# Runtime tests (Phase 4)
curl http://localhost:3000/api/animations  # Should return 401
# Browser: http://localhost:3000/replay/ca77fbf0-bc62-4e28-bbd4-882b6d6c1abe
```

---

## Common Pitfalls

❌ **Don't**:
- Move all files at once (use phases)
- Skip gates (build verification is critical)
- Mix `export default` and named exports without audit
- Import `src/lib/server/*` from client components

✅ **Do**:
- Follow phases sequentially
- Rollback immediately on gate failure
- Update config files before moves
- Verify middleware placement (only one location)

---

## Success Criteria

Before marking complete:
- [ ] All phases executed successfully
- [ ] All gates passed
- [ ] Production build succeeds
- [ ] Production runtime works (`npm run start`)
- [ ] Test animation renders: `/replay/ca77fbf0-bc62-4e28-bbd4-882b6d6c1abe`
- [ ] No hydration errors in browser console
- [ ] Middleware executes (auth flow works)
- [ ] Tailwind styles present in production
- [ ] Old `/components` and `/lib` directories deleted

---

## Context for AI Agent

**Project**: Coaching Animator (sports coaching animation tool)  
**Tech Stack**: Next.js 14 App Router, TypeScript, React 18, React-Konva, Zustand, Supabase, Vitest  
**Current Issue**: Runtime error blocking all development and testing  
**Approach**: Sequential migration with strict gates to minimize risk

**Why This Matters**:
- Currently **cannot test Task 13** (Manual Desktop Regression Testing)
- Cannot proceed with mobile optimization work
- Production builds are failing
- Development server shows error overlay on all pages

**Your Goal**:
- Resolve the module ambiguity
- Restore stable development environment
- Enable Task 13 to proceed
- Create clean `/src` structure for future maintainability

**Safe Rollback**: Each phase has a gate. If it fails, rollback and document. Better to rollback than to create more issues.

---

## Questions? Check These First

**Q: Why not move everything at once?**  
A: Too risky. Phased approach allows isolation of failures.

**Q: What if middleware breaks?**  
A: Phase 2C gate checks this. Rollback if it fails.

**Q: Why separate `lib/server` and `lib/client`?**  
A: Prevents accidental server-only imports in client bundles (common cause of hydration errors).

**Q: Can I skip a gate to save time?**  
A: **NO**. Gates are critical safety checks.

**Q: What if I'm unsure about an import?**  
A: Use `@/` aliases consistently. Check if file is server-only before importing.

---

**This is high-impact work. Follow the plan carefully, verify at each gate, and don't hesitate to rollback if something doesn't work.** 🚀
