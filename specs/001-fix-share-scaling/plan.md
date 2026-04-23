# Verification and Finalization of Entity Scaling Fix (001-fix-share-scaling)

This plan covers the visual verification and quality gate passing for the entity scaling fix which is already implemented in the WSL environment.

## User Review Required

> [!IMPORTANT]
> All commands must be run via the WSL environment inside the project directory.
> Visual verification (T022) requires running the dev server in WSL and checking the routes via the browser tools.

## Proposed Changes

No code changes are anticipated as the fix is already implemented. The focus is on verification and project management within the SpecKit workflow.

### Project Management

#### [MODIFY] [tasks.md](file:///home/footnote42/Projects/coaching-animator/specs/001-fix-share-scaling/tasks.md)
Update task status as verification progresses.

## Verification Plan

### Automated Tests
- Run full quality gates in WSL:
  - npm run lint
  - npx tsc --noEmit
  - npm test -- --run
  - npm run e2e
- Run completion gate:
  - npx speckit.superb.verify

### Manual Verification
- **T022**: Visual check of /app and /replay/[id] to ensure they are unaffected by the scaling changes.
- **Visual check of /share/[id]**: Confirm entities are correctly positioned on mobile viewports.

## Execution Steps
1. Start npm run dev in WSL.
2. Use browser tools to verify /app and /replay (T022).
3. Run automated quality gates in WSL (T023).
4. Run speckit.superb.verify.
5. Commit changes: git add . && git commit -m 'feat(T018-T023): implement entity icon scaling on share route'
