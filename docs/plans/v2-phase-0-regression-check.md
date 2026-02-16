 ## Prompt 2: Run E2E Tests (Phase 0 Regression Check)

  You are a QA engineer verifying that Phase 0 changes to the coaching-animator application have not introduced regressions. Your
   job is to run the existing E2E test suite and investigate any failures.

  Context

  Branch: main
  Recent Changes: Phase 0 (Cleanup & Prep) completed - 6 code changes committed
  Test Framework: Playwright (configured in playwright.config.ts)
  Test Location: tests/e2e/

  Phase 0 Changes That Need Verification

  1. Legacy tables dropped (T009):
    - shares and follows tables removed
    - /api/share route deleted
    - Replay viewer no longer checks shares table
    - ⚠️ Risk: Replay links might break if old share IDs are used
  2. Grid overlay removed (T010):
    - GridOverlay component deleted
    - UI toggle removed from PlaybackControls
    - ⚠️ Risk: Canvas rendering might have issues
  3. Marker entity type removed (T011):
    - 'marker' removed from ENTITY_TYPES
    - Auto-conversion: marker → cone in hydratePayload
    - ⚠️ Risk: Old animations with markers might not load correctly
  4. Rugby-only sport selector (T012):
    - Dropdown now shows only rugby-union and rugby-league
    - ⚠️ Risk: Existing soccer/american-football animations might have issues
  5. Mobile optimizations (T015):
    - Dismissable landscape hint in ReplayViewer
    - Mobile editor warning banner in Editor
    - Coaching notes added to replay page
    - ⚠️ Risk: Mobile viewports might have layout issues

  Test Execution Steps

  1. Check Test Environment

  # Verify dev server is NOT running (E2E tests start their own)
  ps aux | grep "next dev"  # Should be empty

  # Check for existing test results
  ls -la test-results/

  2. Run Full E2E Suite

  npm run e2e

  # If tests fail, run with headed mode for debugging:
  npm run e2e -- --headed

  # Run specific test file:
  npm run e2e -- tests/e2e/animation-editor.spec.ts

  3. Run Tests at Mobile Viewports

  # Test at iPhone SE dimensions (375x667)
  npm run e2e -- --project=mobile-safari

  # Test at Pixel 7 dimensions (412x915)
  npm run e2e -- --project=mobile-chrome

  Expected Test Coverage

  Check these areas based on Phase 0 changes:

  Animation Loading (T011 - marker conversion):
  - Old animations with markers load correctly
  - Markers render as cones
  - Console shows "[hydratePayload] Converted deprecated marker entity to cone"

  Canvas Rendering (T010 - grid removal):
  - Canvas renders without grid overlay
  - No errors in console about missing GridOverlay
  - Field, entities, and annotations render correctly

  Sport Selector (T012 - rugby-only):
  - Dropdown shows only "Rugby Union" and "Rugby League"
  - Existing soccer/american-football animations still load and display

  Replay Viewer (T009, T015):
  - Public animations load via /replay/[id]
  - Link-shared animations load correctly
  - Coaching notes display if present
  - Landscape hint appears on mobile (portrait <600px)
  - Landscape hint can be dismissed

  Mobile Editor (T015):
  - Editor shows warning banner on viewport <768px
  - Warning banner can be dismissed
  - Editor remains functional on mobile (with limitations)

  Playback Controls (T010, T015):
  - All playback buttons work (play, pause, reset, next, prev)
  - No grid toggle button present
  - Mobile buttons are 48x48px (touch-friendly)

  Investigation Steps for Failures

  If tests fail:

  1. Check console logs:
  # Run with debug output
  DEBUG=pw:api npm run e2e
  2. Capture screenshots:
    - Playwright automatically saves screenshots to test-results/
    - Check for visual regressions
  3. Check network requests:
    - Open browser DevTools during headed test runs
    - Look for 404s or failed API calls
  4. Verify database state:
    - Ensure test database has proper schema
    - Check if legacy tables (shares, follows) are causing issues
  5. Test manual smoke scenarios:
  npm run dev
  # Open http://localhost:3000/app
  # Create animation with cones (formerly markers)
  # Test export as GIF (Safari) and WebM (Chrome)
  # Test mobile viewport (Chrome DevTools responsive mode)

  Reporting Results

  After test execution, provide:

  1. Pass/Fail Summary:
    - Total tests run
    - Passed count
    - Failed count
    - Skipped count
  2. Failure Details (if any):
    - Test name
    - Error message
    - Screenshot path
    - Root cause analysis
  3. Regression Assessment:
    - Are failures related to Phase 0 changes?
    - Are they pre-existing issues?
    - Severity: Critical / High / Medium / Low
  4. Recommendations:
    - Should Phase 1 proceed?
    - Do Phase 0 changes need fixes?
    - Should new tests be added?

  Success Criteria

  ✅ All existing E2E tests pass
  ✅ No visual regressions in screenshots
  ✅ No console errors during test runs
  ✅ Mobile viewports work correctly
  ✅ Animation loading/playback works for all entity types

  Ready to Start

  Run npm run e2e and report results. The codebase is stable and all Phase 0 changes have been manually verified with lint and   
  TypeScript checks.