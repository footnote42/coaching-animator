Prompt 1: Continue v2.0 Upgrade (Phase 1)                                                                                                                                                                                                                       
  You are a lead engineer continuing the v2.0 upgrade of the coaching-animator application. Phase 0 (Cleanup & Prep) is complete.   Your job is to execute Phase 1 (Collections + Versions + Templates) using the CLEO task management system.                                                                                                                                                     
  ## Context

  **Branch**: main (all Phase 0 changes committed)
  **Plan**: docs/plans/v2-phase-0-1-plan.md
  **Epic**: T006 - V2.0 Upgrade - Phase 0-1
  **Current Phase**: T008 - Phase 1: Collections + Versions + Templates

  ## Phase 0 Complete (6/7 tasks)

  ✅ T009: Legacy tables dropped (shares, follows)
  ✅ T010: Grid overlay removed
  ✅ T011: Marker entity type removed (auto-converts to cone)
  ✅ T012: Rugby-only sport selector
  ✅ T013: Safari/iOS GIF export verified and documented
  ✅ T015: Mobile replay optimization (P0 - all 5 requirements met)
  ⏭️ T014: Staging Supabase setup (optional infrastructure task - can be done later)

  ## Phase 1 Tasks (17 remaining)

  **Migrations** (do these first):
  - T016: Collections tables + video_url column
  - T017: Version history table + auto-cleanup trigger

  **APIs** (depend on migrations):
  - T018: Collections CRUD + items (depends on T016)
  - T019: Version history + restore (depends on T017)
  - T020: Update animations API for v2.0 fields (depends on T018, T019)

  **UI** (depends on APIs):
  - T021: Collection cards + template filter (depends on T020)
  - T022: Collection detail page (depends on T021)
  - T023: Version history modal (depends on T020)
  - T024: Video URL in editor + replay viewer (depends on T020)

  **Testing**:
  - T025: E2E tests - Phase 0-1 (depends on T021-T024)

  ## Start Here

  1. **Resume CLEO session**:
     ```bash
     ct session list
     ct session resume <session_id>  # Resume existing v2.0 session
     # OR
     ct session start --scope epic:T006 --auto-focus --name "V2.0 Phase 1"

  2. Start with T016 (Collections migration):
  ct focus set T016
  ct show T016
  3. Follow the plan at docs/plans/v2-phase-0-1-plan.md:
    - Lines 185-229: Full SQL schema for collections tables
    - Lines 237-263: Version history table schema
    - Create migrations in supabase/migrations/

  Critical Rules

  - Migration format: YYYYMMDDHHMMSS_description.sql
  - Test migrations: Apply to staging Supabase first if T014 was completed
  - Verify after each task: npm run lint && npx tsc --noEmit
  - Commit after each task: Descriptive messages with task ID
  - Mark tasks complete: ct done T0XX --notes "description"
  - Path aliases: Always use @/core/*, @/features/*, @/shared/*
  - EntityColors service: Mandatory for entity colors
  - Shared canvas components: Test changes in BOTH /app and /replay/[id]

  Database Schema Notes

  Existing tables (don't recreate these):
  - user_profiles, saved_animations, upvotes, content_reports, rate_limits, moderation_blocklist

  New tables (Phase 1):
  - collections, collection_items, animation_versions

  Column additions (Phase 1):
  - saved_animations.video_url, saved_animations.current_version

  Authority Documents

  - PRD v2.0: docs/authority/PRD-v2.0.md
  - PRD v1.0: docs/authority/PRD.md (current state reference)
  - Constitution: docs/authority/constitution.md (v3.3 - governance rules)

  Ready to Start

  The codebase is clean, all Phase 0 changes are committed, and Phase 1 tasks are set up in CLEO. Begin with T016 (Collections   
  migration).