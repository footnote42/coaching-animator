# Next Session Prompt — 2026-05-18

You are resuming work on `coaching-animator` on branch `main`. The previous session resolved all four open failures from the 2026-05-17 manual test run in commit `d19953f`.

## What was fixed

| ID | Severity | Fix |
|----|----------|-----|
| T-016 | P1 | Guest 10-frame limit now enforced in TimelinePanel with sign-in toast |
| T-045 | P2 | Pause button stabilised with React.memo + useCallback; no longer swallows clicks during playback |
| T-074 | P2 | Share Link sidebar button requires cloudAnimationId before sharing |
| T-133 | P3 | TimelinePanel hidden at <1024px; MobileDrawer covers 768–1023px range |

## Diagnostics first

```bash
npm run lint && npx tsc --noEmit && npm test -- --run
```

Note: Vitest worker timeouts in WSL affect ~8 test files (TimelinePanel.test.tsx included). This is a pre-existing infrastructure issue — `transform 0ms / setup 0ms` confirms it never reaches the test code. Lint and TSC are authoritative.

## Recommended next steps (choose one)

### Option A — Manual verification of the four fixes

Run a targeted manual test pass against `http://localhost:3001`:

1. **T-016**: Log out. Open the editor. Add frames until frame 10. Attempt to add an 11th — expect toast "Sign in to add more than 10 frames", no frame added.
2. **T-045**: Start playback. While animation is running, click Pause repeatedly. Should respond immediately on first click every time.
3. **T-074**: Create a new animation (unsaved, no cloud ID). Open the sidebar Share section. Click Share Link — expect "Save to cloud first" toast, no share URL generated. Then save to cloud and retry — should work.
4. **T-133**: Resize browser to 768px wide. Confirm TimelinePanel is gone and MobileDrawer hamburger is accessible. At 1024px, TimelinePanel should reappear.

### Option B — Next feature

Check `docs/authority/ROADMAP.md` for the next phase disposition and run:

```
/speckit.specify "<feature description>"
```

## Key files changed this session

- `src/features/animation/components/TimelinePanel.tsx` — T-016 guard + T-045 memo
- `src/features/animation/components/Sidebar/ShareButton.tsx` — T-074 guard
- `src/features/animation/components/Sidebar/ProjectActions.tsx` — T-074 prop thread
- `src/features/animation/components/Editor.tsx` — T-074 prop pass + T-133 breakpoint
- `tests/unit/components/TimelinePanel.test.tsx` — added useUser + VALIDATION mocks

## Architectural notes

- `TimelinePanel` now calls `useUser()` — auth-aware. If UserContext changes, check this.
- `ShareButton` prop signature: `{ cloudAnimationId?: string | null }` — comes from Editor via ProjectActions
- `showTimelinePanel = viewportWidth >= 1024` is intentionally separate from `isMobile = viewportWidth < 768`
