# Starter Prompt: Fix Critical Issues in Rugby Animation Tool

**Role & Framework Alignment**
You are the primary implementation agent for my **Rugby Animation Tool**. We are using a Spec-Driven Development (SDD) workflow.

**Core Instructions:**
1. **SOP Intake:** Read [.gemini/commands/speckit.implement.toml](cci:7://file:///c:/Coding%20Projects/coaching-animator/.gemini/commands/speckit.implement.toml:0:0-0:0). Adopt the logic in the `prompt` section as your Standard Operating Procedure (SOP).
2. **Context Intake:** Analyze the following files to understand the project "Soul" and "Structure":
   - [.specify/memory/constitution.md](cci:7://file:///c:/Coding%20Projects/coaching-animator/.specify/memory/constitution.md:0:0-0:0) (Design tokens, modularity, and aesthetic)
   - [specs/001-rugby-animation-tool/spec.md](cci:7://file:///c:/Coding%20Projects/coaching-animator/specs/001-rugby-animation-tool/spec.md:0:0-0:0) (The "What" and "Why")
   - [specs/001-rugby-animation-tool/plan.md](cci:7://file:///c:/Coding%20Projects/coaching-animator/specs/001-rugby-animation-tool/plan.md:0:0-0:0) (Tech stack and architecture)
3. **Current Status:** Read [specs/001-rugby-animation-tool/KNOWN_ISSUES.md](cci:7://file:///c:/Coding%20Projects/coaching-animator/specs/001-rugby-animation-tool/KNOWN_ISSUES.md:0:0-0:0) to understand the critical bugs that need fixing.
4. **Execution Goal:** Implement the bug fixes following the detailed plan at: [specs/001-rugby-animation-tool/implementation_plans/bugfix-critical-issues.md](cci:7://file:///c:/Coding%20Projects/coaching-animator/specs/001-rugby-animation-tool/implementation_plans/bugfix-critical-issues.md:0:0-0:0)

**What You Need to Fix:**
Three critical issues are blocking progress:
1. **Ball Shape**: Currently renders as circle, needs to be rugby ball (oval/ellipse)
2. **Ball Color**: Currently green (invisible on green pitch), needs to be white or contrasting color
3. **Animation Playback**: Animation does not progress through frames when play button is pressed (MOST CRITICAL)

**Suggested Execution Order:**
1. Fix Animation Playback (Issue #3) - highest priority, core feature broken
2. Fix Ball Color (Issue #2) - simple change, high usability impact
3. Fix Ball Shape (Issue #1) - polish improvement

**Verification:**
After implementing fixes, run `npm run build` to verify compilation, then test manually in the browser to confirm:
- Ball is visible and oval-shaped
- Animation smoothly progresses through frames
- All playback controls work (play, pause, reset, speed, loop)
