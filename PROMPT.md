# ROLE
Act as a Lead Full-Stack Engineer implementing the Online Platform build for coaching-animator.

# CONTEXT
This is a Vite/React/TypeScript animation tool for rugby coaches, being migrated to Next.js with user accounts, cloud storage, galleries, and website pages. The local-only MVP is complete. This iteration adds the online platform features.

# TASK
Execute the implementation tasks from the current iteration's task list, working through phases and sub-phases with careful context management.

# KEY DOCUMENTS (Read these in order)
1. **Agent Entry Point**: `CLAUDE.md` - Current iteration reference and tech stack
2. **PRD**: `.specify/memory/PRD.md` - Product vision and requirements
3. **Constitution**: `.specify/memory/constitution.md` - Design principles and constraints
4. **Current Spec**: `specs/003-online-platform/spec.md` - Feature specification with 9 user stories
5. **Build Plan**: `specs/003-online-platform/MIGRATION_PLAN.md` - Next.js migration approach
6. **Data Model**: `specs/003-online-platform/data-model.md` - Database schema and RLS policies
7. **API Contracts**: `specs/003-online-platform/contracts/api-contracts.md` - Endpoint specifications
8. **Task List**: `specs/003-online-platform/tasks.md` - Granular checklist (START HERE for execution)
9. **Progress**: `specs/003-online-platform/PROGRESS.md` - Session history and current state

# EXECUTION INSTRUCTIONS
1. Read `specs/003-online-platform/PROGRESS.md` to check current state (if exists)
2. Read `specs/003-online-platform/tasks.md` for the current phase only
3. Work through tasks sequentially unless marked [P] for parallel
4. Check off tasks as you complete them by updating tasks.md with `[x]`
5. **Monitor token usage after each task** - Stop if threshold reached
6. **Stop at sub-phase checkpoints** to verify before continuing
7. Follow Constitution principles (Sacred Offline, Modular Architecture, Rugby-Centric Design)

## EXECUTION LOOP (per task)

For each task in the current sub-phase:
1. **Check token usage** - If > 130K tokens, proceed immediately to handoff
2. **Assess remaining capacity** - If 110K-130K tokens, complete current task only then handoff
3. **Read task requirements** from tasks.md
4. **Implement task** following Constitution principles
5. **Mark complete** with [x] in tasks.md
6. **Verify** - Test the change works
7. **Repeat** OR handoff if checkpoint/threshold reached

# SUCCESS CRITERIA
- Next.js app boots and existing animation tool works
- User registration, login, cloud save functional
- Public gallery browsable and searchable
- All P1 user stories independently testable
- Zero regressions in offline animation functionality

# NOTES
- Preserve all existing functionality during migration
- Test manually after each sub-phase checkpoint
- Commit changes with clear messages per sub-phase
- Ask for clarification if any requirement is ambiguous

---

# CONTEXT WINDOW MANAGEMENT

**Target**: Use no more than 66% of available context (130K tokens max out of 200K)

**Philosophy**: Work in **sub-phase chunks** with explicit checkpoints. This prevents context rot on complex tasks.

## SUB-PHASE STRUCTURE

Large phases are divided into sub-phases with verification checkpoints:

### Phase 1: Setup (7 tasks)
- **1a**: T001-T004 - Next.js initialization
- **1b**: T005-T007 - PWA configuration
- **Checkpoint**: `npm run dev` starts, Tailwind works

### Phase 2: Foundational (19 tasks)
- **2a**: T008-T015 - Database schema and RLS
- **Checkpoint**: Run migration, verify tables exist in Supabase
- **2b**: T016-T019 - Supabase clients
- **Checkpoint**: Auth callback route responds
- **2c**: T020-T026 - Shared utilities
- **Checkpoint**: `npm run build` passes

### Phase 3: US1 - Auth + Save (21 tasks)
- **3a**: T027-T031 - Auth pages
- **Checkpoint**: Login/register pages render
- **3b**: T032-T035 - Editor migration
- **Checkpoint**: Canvas renders, drag/drop works
- **3c**: T036-T038, T046-T047 - APIs
- **Checkpoint**: POST/GET /api/animations works
- **3d**: T039-T045 - Gallery UI
- **Checkpoint**: Full US1 flow works end-to-end

### Phases 4-12: See tasks.md
- Each user story phase = 1 session max
- Stop at phase checkpoint before continuing

## TOKEN USAGE MONITORING

**CRITICAL**: Token monitoring is mandatory to prevent context rot and ensure quality handoffs.

**Decision Points**:
- **< 110K tokens**: Continue normally with next task
- **110K-130K tokens**: Complete current task only, then initiate handoff
- **> 130K tokens**: Stop immediately and initiate handoff (do not start new tasks)

**Philosophy**: The two-thirds threshold (130K of 200K) preserves enough "fresh" context to:
- Write a coherent PROGRESS.md update
- Explain current state clearly to next session
- Complete graceful handoff without degraded recall

**Never continue past 130K tokens** even if a sub-phase is incomplete.

## MANDATORY HANDOFF TRIGGERS

The agent **MUST** initiate handoff if ANY of these occur:

1. **Context Threshold**: Token usage reaches 130K (66% of 200K context)
2. **Sub-Phase Checkpoint**: Current sub-phase tasks are complete
3. **Unexpected Complexity**: A single task requires >3 files modified or >200 lines changed
4. **Error Loop**: Same error encountered 3+ times without resolution
5. **Scope Creep**: Task reveals missing dependencies not in the plan
6. **Build Failure**: `npm run build` fails and fix is non-obvious

When triggering early handoff:
1. Complete current task OR revert to last working state
2. Document the blocker/complexity in PROGRESS.md
3. Run `npm run build` to verify stability
4. Create handoff with explicit **"RESUME AT: T0XX"** marker

## HANDOFF PROCEDURE

When ready to handoff (checkpoint reached OR trigger hit):

1. **Update tasks.md**: Check off completed tasks with `[x]`

2. **Update** `specs/003-online-platform/PROGRESS.md`:

```markdown
## Session [N] - [Date]

**Sub-Phase**: 2b (Supabase Clients)
**Completed Tasks**: T016, T017, T018, T019
**Status**: Full sub-phase complete | Early handoff (reason)

**Verification**:
- [ ] `npm run build` passes
- [ ] Checkpoint test: [describe what was verified]

**Key Changes**:
- Created lib/supabase/server.ts with createServerClient()
- Created lib/supabase/client.ts with createBrowserClient()
- Added middleware.ts for session refresh

**Issues/Blockers**: None | [describe blocker]

**RESUME AT**: T020 (Phase 2c: Shared Utilities)

**Context for Next Session**:
- Supabase clients are ready
- Auth callback responds at /api/auth/callback
- Ready to build shared utilities (schemas, auth helpers)
```

3. **Verify build**: Run `npm run build` - do not handoff with broken build

4. **Report to user**: State completed tasks, verification status, and resume point

## SESSION BATCH GUIDE

| Sub-Phase | Tasks | Checkpoint |
|-----------|-------|------------|
| **1a** | T001-T004 | Next.js boots |
| **1b** | T005-T007 | PWA manifest accessible |
| **2a** | T008-T015 | DB tables exist |
| **2b** | T016-T019 | Auth callback works |
| **2c** | T020-T026 | Build passes |
| **3a** | T027-T031 | Auth pages render |
| **3b** | T032-T035 | Canvas works |
| **3c** | T036-T038, T046-T047 | APIs respond |
| **3d** | T039-T045 | US1 complete |
| **4** | T048-T052 | US2 complete |
| **5** | T053-T063 | US3 complete |
| **6-12** | See tasks.md | Per-phase checkpoints |

## CONTINUING FROM PREVIOUS SESSION

1. Read `specs/003-online-platform/PROGRESS.md` for latest session
2. Check `specs/003-online-platform/tasks.md` for completed tasks `[x]`
3. Resume from **"RESUME AT"** task in PROGRESS.md
4. Re-read only the files relevant to current sub-phase
5. Run `npm run build` to verify starting state
6. Follow same handoff procedure at next checkpoint