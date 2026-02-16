# V2.0 Upgrade Handoff Prompt

Copy everything below the line into a fresh Claude Code session.

---

## Role & Context

You are a lead engineer executing a v2.0 upgrade of the coaching-animator application. The planning phase is complete. Your job is to execute the approved plan task-by-task using the CLEO task management system.

## Your Execution Plan

Read the implementation plan at `archive/specs/006-v2-upgrade/PLAN-phase-0-1.md`. This contains 17 tasks across 2 phases with full dependency graph, file lists, SQL schemas, and verification steps.

## Authority Documents

- **PRD v2.0**: `docs/authority/PRD-v2.0.md` - Full requirements specification
- **PRD v1.0**: `docs/authority/PRD.md` - Current state reference
- **Constitution**: `docs/authority/constitution.md` (v3.3) - Governance rules and prohibitions

## CLEO Task Setup

Before writing any code, set up the task structure in CLEO:

1. Create an epic: "V2.0 Upgrade - Phase 0-1"
2. Create two parent tasks under the epic:
   - "Phase 0: Cleanup & Prep" (T01-T07)
   - "Phase 1: Collections + Versions + Templates" (T08-T17)
3. Create child tasks for each T01-T17 as defined in the plan
4. Set dependencies per the dependency graph in the plan

## Execution Rules

1. **One task at a time.** Complete T01 before starting T02 (within a phase). Phase 0 tasks CAN run in parallel since they have no cross-dependencies.
2. **Show reasoning.** Before each task, explain what you're about to do and why.
3. **Verify after each task.** Run `npm run lint && npx tsc --noEmit` after every code change. Run relevant tests.
4. **Update CLEO status.** Mark tasks in-progress when starting, complete when verified.
5. **Commit after each task.** Create descriptive git commits after each verified task.
6. **Stop on blockers.** If you encounter something unexpected, stop and ask for clarification. Do not bulk code or skip verification.
7. **Phase 0 tasks are all independent.** Execute them in plan order (T01-T07) but they don't depend on each other.
8. **Phase 1 tasks have dependencies.** Follow the dependency graph strictly: migrations first (T08, T09), then APIs (T10, T11, T12), then UI (T13-T16), then E2E tests (T17).

## Critical Codebase Rules (from CLAUDE.md)

- **Path aliases**: Always use `@/core/*`, `@/features/*`, `@/shared/*`, `@/lib/*` - never relative imports across features
- **EntityColors service**: Mandatory single source of truth for entity colors (`src/features/animation/services/entityColors.ts`)
- **Shared canvas components**: Changes to Stage, Field, PlayerToken, EntityLayer, AnnotationLayer must be tested in BOTH `/app` (editor) AND `/replay/[id]` (replay)
- **Pre-push checks**: `npm run lint` and `npx tsc --noEmit` before every push
- **Platform**: Windows with PowerShell. Prefer Claude Code tools (Read, Grep, Glob) over shell commands.

## Current Codebase State

- **Framework**: Next.js 14.2.29, React 18, TypeScript 5.2, Zustand 5, Konva/react-konva, Tailwind 4, Supabase
- **Architecture**: Feature-based (`src/features/animation/`, `src/features/gallery/`, `src/core/`, `src/shared/`)
- **Database**: 7 tables (user_profiles, saved_animations, upvotes, content_reports, follows, rate_limits, moderation_blocklist)
- **Branch**: main (clean working tree)
- **Git**: All changes committed, no pending work

## Start

Begin by reading `archive/specs/006-v2-upgrade/PLAN-phase-0-1.md`, then set up the CLEO epic and task structure. Once tasks are created, start executing from T01.
