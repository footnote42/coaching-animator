# Task 12: Execute E2E Tests Implementation

## Quick Start

Please implement Task 12 (E2E Tests for Mobile Replay) by following the detailed implementation plan.

## Instructions

1. **Read the implementation plan:**
   - Location: `specs/005-incremental-improvements/TASK_12_IMPLEMENTATION_PLAN.md`
   - This contains the complete technical design, code examples, and success criteria

2. **Create the test file:**
   - Create `tests/e2e/replay-mobile.spec.ts` (~90-120 lines)
   - Implement 4 E2E tests as specified in the plan:
     - Test 1: Canvas fits 375px viewport (no horizontal scroll)
     - Test 2: Canvas maintains 4:3 aspect ratio at 500px
     - Test 3: Play/pause button ≥48px at 375px
     - Test 4: Desktop unchanged - canvas ≤800×600 at 1920px

3. **Follow the code structure from the plan:**
   - Use inline `test.use()` for viewport configuration
   - Use multi-stage wait strategy (networkidle → canvas visible → 200ms delay)
   - Use tolerance-based assertions (≤, toBeCloseTo)
   - Locate canvas with `.first()` and button with `title` attribute

4. **Verify implementation:**
   ```bash
   # Run tests
   npm run e2e -- tests/e2e/replay-mobile.spec.ts

   # Check for flakiness (10 runs)
   for i in {1..10}; do npm run e2e -- replay-mobile || break; done

   # Quality checks
   npx tsc --noEmit
   npm run lint
   ```

5. **Update documentation:**
   - Mark Task 12 complete in `specs/005-incremental-improvements/TASKS.md`
   - Add completion details to `specs/005-incremental-improvements/PROGRESS.md`

## Success Criteria

- ✅ 12 tests pass (4 tests × 3 browsers: Chromium, Firefox, WebKit)
- ✅ No flakiness in 10 consecutive runs
- ✅ Total execution time <30s per run
- ✅ TypeScript: 0 errors
- ✅ ESLint: 0 warnings
- ✅ Documentation updated

## Context

Tasks 1-11 have implemented responsive canvas sizing and mobile-optimized controls. Task 12 adds automated E2E tests to protect this work from regressions and ensure mobile users can view replays correctly across all browsers.

## Resources

- **Implementation plan:** `specs/005-incremental-improvements/TASK_12_IMPLEMENTATION_PLAN.md`
- **Existing test patterns:** `tests/e2e/phase-1-galleries.spec.ts`
- **Component being tested:** `src/components/replay/ReplayViewer.tsx`
- **Sizing hook:** `src/hooks/useCanvasSize.ts`

## Estimated Time

60-75 minutes total:
- Writing tests: 30-40 minutes
- Debugging flakiness: 15-20 minutes
- Verification & docs: 15 minutes
