# ROLE
Act as a Lead Full-Stack Engineer implementing the Clean Iteration build plan for coaching-animator.

# CONTEXT
This is a Next.js/React/TypeScript animation tool for rugby coaches. The MVP is complete and deployed to Vercel. This iteration fixes critical bugs and polish issues identified in a gap analysis.

# TASK
Execute the implementation tasks from the current iteration's task list, starting with Phase 0 (Environment Setup).

# KEY DOCUMENTS (Read these in order)
1. **Agent Entry Point**: [CLAUDE.md](cci:7://file:///c:/Coding%20Projects/coaching-animator/CLAUDE.md:0:0-0:0) - Current iteration reference and tech stack
2. **PRD**: [.specify/memory/PRD.md](cci:7://file:///c:/Coding%20Projects/coaching-animator/.specify/memory/PRD.md:0:0-0:0) - Product vision and requirements
3. **Constitution**: [.specify/memory/constitution.md](cci:7://file:///c:/Coding%20Projects/coaching-animator/.specify/memory/constitution.md:0:0-0:0) - Design principles and constraints
4. **Current Spec**: [specs/002-clean-iteration/spec.md](cci:7://file:///c:/Coding%20Projects/coaching-animator/specs/002-clean-iteration/spec.md:0:0-0:0) - Feature specification with user stories
5. **Build Plan**: [specs/002-clean-iteration/plan.md](cci:7://file:///c:/Coding%20Projects/coaching-animator/specs/002-clean-iteration/plan.md:0:0-0:0) - Implementation phases and approach
6. **Task List**: [specs/002-clean-iteration/tasks.md](cci:7://file:///c:/Coding%20Projects/coaching-animator/specs/002-clean-iteration/tasks.md:0:0-0:0) - Granular checklist (START HERE for execution)

# EXECUTION INSTRUCTIONS
1. Read [specs/002-clean-iteration/tasks.md](cci:7://file:///c:/Coding%20Projects/coaching-animator/specs/002-clean-iteration/tasks.md:0:0-0:0) to understand the task structure
2. Begin with Phase 0 (Environment Setup) - Tasks T001-T005
3. Work sequentially through phases unless tasks are marked [P] for parallel
4. Check off tasks as you complete them by updating tasks.md
5. Stop at checkpoints to verify before proceeding to next phase
6. Follow Constitution principles (Modular Architecture, Rugby-Centric Design, Privacy-First)

# CRITICAL BUGS TO FIX (Priority 0)
- **Share Link**: Missing Supabase environment configuration (`.env.local` needs creation)
- **Export Resolution**: UI allows 720p/1080p selection but export always outputs 720p (hardcoded in [useFrameCapture.ts](cci:7://file:///c:/Coding%20Projects/coaching-animator/src/hooks/useFrameCapture.ts:0:0-0:0))

# SUCCESS CRITERIA
- Share Link creates URL when Supabase configured
- Export resolution matches UI selection (720p → 1280x720, 1080p → 1920x1080)
- Zero regressions in existing functionality

# NOTES
- Do not refactor code beyond what's required to fix the bugs
- Test manually after each phase
- Commit changes with clear messages per phase
- Ask for clarification if any requirement is ambiguous

---

# CONTEXT WINDOW MANAGEMENT

**Target**: Use no more than 66% of available context (130K tokens max out of 200K)

**Work in Batches**:
- Implement 3-5 tasks per session
- Update `specs/002-clean-iteration/tasks.md` with `[x]` checkboxes as you complete each task
- Create a handoff summary when approaching 66% usage

**Handoff Trigger**: When you reach ~120K tokens OR complete a logical checkpoint (end of a phase), stop and create a handoff summary.

## HANDOFF PROCEDURE

When ready to handoff:

1. **Update tasks.md**: Check off all completed tasks with `[x]`

2. **Create/Update handoff note** in `specs/002-clean-iteration/PROGRESS.md`:

```markdown
# Progress Log

## Session [N] - [Date] - [Time]

**Completed Tasks**: T001, T002, T003, T004, T005
**Phase Status**: Phase 0 Complete
**Next Task**: T006 (Phase 1.1: Share Link)

**Key Changes**:
- Created `.env.local` from example
- Documented Supabase setup in README.md
- Verified export hardcoding at 720p
- Verified share error without env vars

**Issues/Blockers**: None

**Context for Next Agent**:
- Phase 0 baseline established
- Ready to begin Phase 1.1 (Share Link bug fix)
```

3. **Commit changes**: Use clear commit message like `"Phase 0 complete: Environment setup and verification"`

4. **Stop and report**: Tell the user you've completed [X] tasks and are ready for handoff

## SUGGESTED BATCH SIZES

| Phase | Tasks | Sessions |
|-------|-------|----------|
| **Phase 0** | T001-T005 (5 tasks) | 1 session |
| **Phase 1.1** | T006-T010 (5 tasks) | 1 session |
| **Phase 1.2** | T011-T019 (9 tasks) | 1-2 sessions |
| **Phase 2.1** | T020-T022 (3 tasks) | 1 session |
| **Phase 2.2** | T023-T031 (9 tasks) | 1-2 sessions |
| **Phase 3** | T032-T042 (11 tasks) | 1-2 sessions |
| **Phase 4** | T043-T062 (20 tasks) | 1 session |
| **Phase 5** | T063-T067 (5 tasks) | 1 session |

## CONTINUING FROM PREVIOUS SESSION

If `PROGRESS.md` exists:
1. Read `specs/002-clean-iteration/PROGRESS.md` for the latest status
2. Check `specs/002-clean-iteration/tasks.md` for completed tasks (marked `[x]`)
3. Resume from the "Next Task" indicated in PROGRESS.md
4. Follow the same handoff procedure when reaching 66% context usage