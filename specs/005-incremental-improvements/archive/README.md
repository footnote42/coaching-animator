# Archived Planning Documents

**Created**: 2026-02-07
**Purpose**: Archive intermediate planning and task documents from completed work

---

## What's Here

This directory contains **11 planning and task documents** from completed work in Spec 005. These documents were created during implementation but are no longer needed for day-to-day reference since the work is complete.

**Archived**: 2026-02-07
**Reason**: Spec 005 is 95% complete (18/19 issues). These intermediate documents served their purpose during implementation but now clutter the main directory.

---

## Archived Documents

### Mobile Replay Optimization (HIGH-006 - COMPLETE 2026-02-07)

- **MOBILE_REPLAY_PLAN.md** - Comprehensive implementation plan for viewport-aware canvas scaling
- **TASKS.md** - 18-task checklist with detailed steps and verification
- **TASK_15_EXECUTE_PROMPT.md** - Execution prompt for manual playback testing
- **TASK_17_HANDOFF_PROMPT.md** - Handoff for cross-browser testing
- **ISSUE_LANDSCAPE_HINT.md** - Intermediate analysis for landscape orientation hint

**Summary**: Implemented responsive canvas sizing for mobile devices using `useCanvasSize` hook. All 18 tasks complete, deployed to production (commit 5215d9a).

---

### File Migration (COMPLETE 2026-02-07)

- **MIGRATION_PLAN.md** - Sequential migration plan for moving files from root to `src/` directory
- **MIGRATION_HANDOFF.md** - Migration handoff with risk gates and rollback procedures

**Summary**: Migrated project structure from dual directories (`/components`, `/lib`, `/app`) to unified `src/` structure. Completed as part of Task 18.

---

### Entity Color Refinement (Task 2 - COMPLETE 2026-02-02)

- **TASK_2_HANDOFF.md** - Handoff document for entity color palette work (LOW-001, MED-006)

**Summary**: Refined cone visual thickness and entity color palette. Removed hardcoded hex values.

---

### Gallery Detail Cleanup (Task 12 - COMPLETE 2026-02-06)

- **TASK_12_HANDOFF.md** - Handoff for gallery detail route removal
- **TASK_12_IMPLEMENTATION_PLAN.md** - Implementation plan for consolidating replay viewers
- **TASK_12_EXECUTE_PROMPT.md** - Execution prompt for MED-008

**Summary**: Removed obsolete gallery detail route (`/gallery/[id]`), consolidated to single ReplayViewer. Removed 1,004 lines of duplicate code.

---

## Why Archive Instead of Delete?

These documents represent valuable historical context:
- **Decision rationale** - Why certain approaches were chosen
- **Implementation details** - How complex features were built
- **Lessons learned** - What worked, what didn't, what to avoid next time
- **Verification steps** - How features were tested

Archiving preserves this knowledge while keeping the main directory clean and focused on active work.

---

## Active Documents (NOT Archived)

These 4 documents remain in the main directory:

1. **README.md** - Main issue backlog with risk ratings
2. **ISSUES_REGISTER.md** - Detailed issue descriptions
3. **PROGRESS.md** - Session history and progress tracking
4. **QUICK_START.md** - Getting started guide

These documents are updated regularly and needed for ongoing work.

---

## How to Use This Archive

**When to reference**:
- Need context on how a feature was implemented
- Want to understand why a decision was made
- Planning similar work and need examples
- Troubleshooting issues related to completed work

**How to find information**:
1. Check this README for document summaries
2. Open specific documents for detailed context
3. Cross-reference with PROGRESS.md for timeline

---

## Archive Maintenance

- ✅ Keep documents in original format (no modification)
- ✅ Add new archives with date and reason in this README
- ✅ Never delete archived documents (preserve history)
- ❌ Don't update archived documents (they're historical)

---

## Spec 004 Legacy Documents (2026-02-07)

**Location**: `004-legacy-documents/` subdirectory
**Source**: `specs/004-post-launch-improvements/`
**Purpose**: Preserve architectural decision records and verification evidence

### What Was Archived

5 documents containing critical decision context from spec 004:

1. **VERIFICATION.md** - Systematic verification revealing 50-60% actual completion (vs. claimed 100%)
2. **CLOSURE.md** - Completion analysis, reconciliation, and remediation tracking
3. **ARCHITECTURE_CLEANUP_PLAN.md** - Vite cleanup strategy with 5-phase validation pattern
4. **plan.md** - Consolidated implementation plan with constitutional check
5. **implementation-plan.md** - User observation methodology and issue discovery

### Why These Were Archived

These documents provide essential context for understanding:

- How spec 005 evolved from spec 004 verification findings
- Architectural decisions made during Phase 5 cleanup (Vite code removal, EntityColors service)
- Verification methodology that prevents inflated completion claims
- Lessons learned for future specification work

### When to Reference

- **Planning verification**: Use VERIFICATION.md as template for systematic verification
- **Large refactorings**: Use ARCHITECTURE_CLEANUP_PLAN.md for validation patterns
- **Issue discovery**: Use implementation-plan.md for user testing methodology
- **Constitutional compliance**: Use plan.md for governance checks

### Maintenance Notes

These documents are **read-only snapshots** preserving decision context. Do not modify or delete.

For active work, see the main spec 005 documents in the parent directory.

---

**Last Updated**: 2026-02-07
