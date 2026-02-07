# Task 17: Cross-Browser Testing - Handoff Prompt

**Role**: QA & Frontend Specialist
**Objective**: Execute Task 17 (Cross-Browser Testing) from `specs/005-incremental-improvements/TASKS.md`.

## Context
We are optimizing the Mobile Replay experience. Tasks 1-16 are complete.
- **Task 16 (Pre-Push)** was just completed, resolving `npm run build` errors by refactoring `/app` and `/gallery` to use Server Component wrappers with `force-dynamic` rendering.
- The codebase is currently stable and passes all lint/type checks.

## Your Mission
Perform manual verification of the Mobile Replay View across different browser engines to ensure the responsive canvas sizing and controls work consistently.

### Steps to Execute
1. **Environment Setup**:
   - Ensure the dev server is running (`npm run dev`).
   - Navigate to a replay URL (e.g., verify a recently created animation or use an existing one from `saved_animations`).

2. **Chrome Mobile Emulation** (Blink Engine):
   - Use DevTools Device Toolbar.
   - Test explicitly on:
     - iPhone SE (Small screen, 375px)
     - Pixel 7 (Standard Android)
     - iPad Mini (Tablet)
   - **Verify**: Canvas fits width, no horizontal scroll, controls are accessible.

3. **Firefox Responsive Design Mode** (Gecko Engine):
   - Open Firefox > Web Developer > Responsive Design Mode.
   - **Verify**: Aspect ratio (4:3) is preserved when resizing the viewport handle.
   - **Check**: Do buttons wrap correctly? Does the "Rotate device" hint appear < 600px?

4. **Safari / WebKit** (If available):
   - If on macOS, test in Safari.
   - If on Windows, trust the Chrome/Firefox checks for layout, but visually inspect for any obvious CSS grid/flex bugs (Safari sometimes treats flex gaps differently).

5. **Reporting**:
   - Update `specs/005-incremental-improvements/TASKS.md`: Mark Task 17 as complete.
   - Update `specs/005-incremental-improvements/PROGRESS.md`: Log the browser versions tested and any minor layout quirks found (if fixed or ignored).

## Relevant Files
- `specs/005-incremental-improvements/TASKS.md` (Checklist)
- `specs/005-incremental-improvements/PROGRESS.md` (Status Log)
- `src/hooks/useCanvasSize.ts` (Core logic being tested)
- `src/components/replay/ReplayViewer.tsx` (Main UI component)

## Definition of Done
- [ ] Confirmed functional parity in Chrome and Firefox.
- [ ] No layout breakage on small mobile viewports (320px-375px).
- [ ] `TASKS.md` updated.
