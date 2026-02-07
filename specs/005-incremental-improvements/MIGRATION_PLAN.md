# Resolve Hydration Error: Sequential Migration with Risk Gates

**Root Cause**: Module resolution ambiguity from dual directory structure (`/lib` vs `/src/lib`, `/components` vs `/src/components`) triggering webpack runtime error `e[o] is not a function`.

## Audit Summary
- **Router**: App Router (`/app`)
- **React**: 18.3.1 (deduped ✓)
- **Supabase**: Client/server split confirmed ✓
- **Rate-limit**: Edge-safe (Map/Date only) ✓
- **Tests**: Vitest with custom `@/*` resolver
- **Config Impacts**: `next.config.js` has hardcoded `swSrc: 'app/sw.ts'`

## Critical Risks

> [!CAUTION]
> **Export Mismatches**: Mixing `export default` vs named exports triggers webpack resolution failures.
> **next.config.js Hardcoding**: `swSrc: 'app/sw.ts'` breaks when moving `/app` → `/src/app`.
> **Middleware Placement**: Must be `/middleware.ts` OR `/src/middleware.ts`, never both.

---

## Phase 0: Pre-Flight Checks

- [ ] **Verify No Fragile Imports**: Confirm no `import ... from '../../public'` patterns.
- [ ] **Snapshot Current State**: `git status` clean, `npm run build` baseline.
- [ ] **Test Animation ID**: `ca77fbf0-bc62-4e28-bbd4-882b6d6c1abe` (valid).

---

## Phase 1: Config Alignment

- [ ] **Update `tsconfig.json`**:
  ```json
  "paths": { "@/*": ["./src/*"] }  // Remove ./* fallback
  ```
- [ ] **Update `vitest.config.ts`**: Change custom resolver to prioritize `src/` exclusively after move.
- [ ] **Audit ESLint**: Confirm `next/core-web-vitals` handles `@/*` (no action needed).

---

## Phase 2A: Move `components/` → `src/components/`

- [ ] **Execute Move**: `mv components/* src/components/root/` (or merge into existing subdirs).
- [ ] **Fix Imports**: Update all `import ... from '../../components'` → `@/components`.
- [ ] **Verify Build**: `npm run build` must pass.
- [ ] **Smoke Test**: Dev server loads `/`, `/gallery` without errors.

**GATE**: Production build green OR rollback.

---

## Phase 2B: Move `lib/` → `src/lib/` (Excluding Auth/Rate-Limit)

- [ ] **Move Safe Utilities First**:
  - `api-client.ts`
  - `browser-detect.ts`
  - `error-messages.ts`
  - `moderation.ts`
  - `offline-queue.ts`
  - `quota.ts`
  - `schemas/`
  - `thumbnail.ts`
- [ ] **Fix Imports**: Convert to `@/lib/*`.
- [ ] **Verify Build**: `npm run build`.

**GATE**: Tests pass OR rollback.

---

## Phase 2C: Move Server-Only Utils (Guarded)

- [ ] **Move with Boundary Check**:
  - `auth.ts` → `src/lib/server/auth.ts`
  - `rate-limit.ts` → `src/lib/server/rate-limit.ts`
  - `supabase/` → `src/lib/supabase/`
- [ ] **Physical Separation**:
  - `src/lib/server/` (Node/Edge safe)
  - `src/lib/client/` (browser safe)
  - Shared stays in `src/lib/`
- [ ] **Audit**: Grep for `'use client'` files importing `src/lib/server/*` → FAIL BUILD.
- [ ] **Verify**: Middleware still executes, API routes respond.

**GATE**: `curl http://localhost:3000/api/animations` returns 401 (auth working).

---

## Phase 2D: Move `/app` → `/src/app` (High Impact)

- [ ] **Update `next.config.js`**:
  ```js
  swSrc: 'src/app/sw.ts',  // was 'app/sw.ts'
  ```
- [ ] **Move Entire Router**: `mv app src/app`.
- [ ] **Move Middleware**: `mv middleware.ts src/middleware.ts`.
- [ ] **Fix Global CSS**: Verify `src/app/globals.css` imports Tailwind correctly.
- [ ] **Delete Old `/app`**: Confirm no stray files remain.

**GATE**: `next build` succeeds AND `next start` renders `/` correctly.

---

## Phase 3: Import Normalization & Cleanup

- [ ] **Convert Remaining Relative Imports**: Search `from '../` → `@/`.
- [ ] **Remove Duplicate Directories**: `rm -rf components lib` (after verification).
- [ ] **Verify Export Consistency**: Audit for `export default` vs named export mismatches.

---

## Phase 4: Production Verification

### Build Checks
- [ ] `npx tsc --noEmit` → 0 errors.
- [ ] `npm run build` → Static generation passes for all routes.
- [ ] `npm run lint` → 0 errors.
- [ ] `npm ls react` → Single version (18.3.1).

### Runtime Checks
- [ ] `npm run start` → Production server runs.
- [ ] `/` loads without hydration error.
- [ ] `/replay/ca77fbf0-bc62-4e28-bbd4-882b6d6c1abe` renders animation.
- [ ] Middleware executes (auth redirects work).
- [ ] `/api/animations` returns expected response.
- [ ] Tailwind styles present in production build.

### Vercel Preview (if applicable)
- [ ] Deploy preview branch.
- [ ] Compare bundle size vs. baseline.
- [ ] Smoke test production URL.

---

## Rollback Plan

If any GATE fails:
1. `git reset --hard HEAD`
2. `rm -rf .next`
3. `npm run dev`
4. Document failure in issue tracker.
