# Task: Run Canvas Pitch Render E2E Diagnostics                                                                                                                                                                                                                 
  ## What to do                                                                                                                    Run the new E2E test file on Chromium first, then collect and report results.                                                  
                                                                                                                                   ## Test file                                                                                                                     `tests/e2e/canvas-pitch-render.spec.ts`                                                                                        

  ## Steps

  ### 1. Verify dev server is NOT already running (tests target production by default)
  Check `playwright.config.ts` — the default `baseURL` is `https://coaching-animator.vercel.app`.
  If the user wants to test locally instead, set `BASE_URL=http://localhost:3000` and start `npm run dev` first.

  ### 2. Run Chromium only (fastest first pass)
  ```bash
  npx playwright test tests/e2e/canvas-pitch-render.spec.ts --project=chromium

  3. If any tests fail, run with headed mode to visually inspect

  npx playwright test tests/e2e/canvas-pitch-render.spec.ts --project=chromium --headed

  4. Check diagnostic screenshots in test-results/artifacts/:

  - editor-BLACK-SCREEN-detected-*.png → black screen confirmed on /app
  - share-mobile-BLACK-SCREEN-detected-*.png → black screen confirmed on /share
  - editor-canvas-diagnostic-*.png → always captured, inspect for pitch colour
  - share-mobile-canvas-diagnostic-*.png → always captured
  - share-mobile-resize-observer-diagnostic-*.png → ResizeObserver state

  5. After Chromium pass, run full browser matrix

  npx playwright test tests/e2e/canvas-pitch-render.spec.ts

  What each failure means

  ┌────────────────────────────────┬───────────────────────────┬─────────────────────────────────────────────────────────────┐   
  │          Failing test          │        Root cause         │                         File to fix                         │   
  ├────────────────────────────────┼───────────────────────────┼─────────────────────────────────────────────────────────────┤   
  │ Suite 3: any 404               │ Missing SVG asset         │ public/assets/fields/                                       │   
  ├────────────────────────────────┼───────────────────────────┼─────────────────────────────────────────────────────────────┤   
  │ Suite 1b/2a-iii: non-200       │ Asset serving broken      │ next.config.js                                              │   
  ├────────────────────────────────┼───────────────────────────┼─────────────────────────────────────────────────────────────┤   
  │ Suite 2a-ii: width=800 on      │ ResizeObserver guard      │ src/core/hooks/useShareCanvasSize.ts:31                     │   
  │ mobile                         │ fires at 0×0              │                                                             │   
  ├────────────────────────────────┼───────────────────────────┼─────────────────────────────────────────────────────────────┤   
  │ Suite 1d/2a-iv: centre pixel   │ Konva not painting (init  │ src/features/animation/components/Canvas/Field.tsx or       │   
  │ black + SVG 200                │ race)                     │ Stage.tsx                                                   │   
  ├────────────────────────────────┼───────────────────────────┼─────────────────────────────────────────────────────────────┤   
  │ Suite 2a-v: wrapper zero-size  │ Canvas wrapper collapsed  │ src/features/animation/components/ShareViewer.tsx:229       │   
  └────────────────────────────────┴───────────────────────────┴─────────────────────────────────────────────────────────────┘   

  Key file locations

  - Test file: tests/e2e/canvas-pitch-render.spec.ts
  - Helpers: tests/e2e/helpers.ts (loginAsTestUser, takeScreenshot)
  - Playwright config: playwright.config.ts (baseURL, outputDir, browser projects)
  - SVG assets: public/assets/fields/*.svg (rugby-union, rugby-league, soccer, american-football)
  - ResizeObserver hook: src/core/hooks/useShareCanvasSize.ts
  - ShareViewer: src/features/animation/components/ShareViewer.tsx

  Auth for Suite 1 (/app)

  Uses loginAsTestUser → email: user@test.com, password: Password1!
  This account must exist in the target environment.

  Share animation ID (Suites 2, 4)

  Fetched automatically in beforeAll from /api/gallery?limit=1&visibility=public.
  If no public animations exist, share suites auto-skip gracefully.

  Report back

  After running, provide:
  1. Pass/fail count per suite
  2. Any BLACK-SCREEN-detected screenshots found (confirm/deny the bug)
  3. Console output from Suite 4 diagnostic (ResizeObserver dimensions)
  4. Full list of any unexpected failures with error messages