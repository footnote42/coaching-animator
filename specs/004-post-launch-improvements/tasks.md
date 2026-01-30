# Tasks: Post-Launch Improvements

**Feature**: 004-post-launch-improvements  
**Total Tasks**: 48 (T101-T148)  
**Start Date**: TBD  
**Reference**: See `plan.md` for consolidated issue sources

---

## Task Status Legend

- `[ ]` - Not started
- `[x]` - Complete
- `[~]` - In progress
- `[!]` - Blocked

---

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- Task IDs start at T101 (historic T001-T024 now superseded)
- Include exact file paths in descriptions

---

## Phase 1: Critical Fixes (P0) - Block Deployment

**Estimated Time**: 3-5 days  
**Goal**: Fix broken features, data loss risks, security vulnerabilities, performance bottlenecks

### Sub-Phase 1a: Critical Bug Fixes (User-Reported)

- [ ] **TOKEN_CHECK_1A**: Verify token usage < 110K before starting

- [ ] T101 Fix Share Link API 405 error - investigate missing POST handler in `app/api/share/route.ts`
- [ ] T102 Fix Replay entity rendering - import Field component from editor in `app/replay/[id]/ReplayViewer.tsx`
- [ ] T103 [P] Optimize Replay playback - use requestAnimationFrame instead of setTimeout in `app/replay/[id]/ReplayViewer.tsx`

**Sub-Checkpoint 1a**: Share Link works, Replay matches editor appearance

### Sub-Phase 1b: Critical Infrastructure Fixes (Technical Review)

- [ ] **TOKEN_CHECK_1B**: Verify token usage < 110K before continuing

- [ ] T104 Add retry logic with exponential backoff - create `lib/api-client.ts` wrapper
- [ ] T105 [P] Update `components/SaveToCloudModal.tsx` to use retry wrapper
- [ ] T106 [P] Update gallery fetch calls in `app/gallery/page.tsx` to use retry wrapper
- [ ] T107 Add animation payload Zod schema in `lib/schemas/animations.ts`
- [ ] T108 Add payload validation to POST/PUT `/api/animations` routes
- [ ] T109 Migrate rate limiting to in-memory cache in `lib/rate-limit.ts`

**Sub-Checkpoint 1b**: API retries work, payloads validated, rate limit <5ms

**Phase 1 Complete**: All P0 critical issues resolved

---

## Phase 2: Navigation & Core UX (P1-A)

**Estimated Time**: 1 week  
**Goal**: Site-wide navigation overhaul and entity system improvements

### Sub-Phase 2a: Navigation System

- [ ] **TOKEN_CHECK_2A**: Verify token usage < 110K before starting

- [ ] T110 Create shared Navigation component in `components/Navigation.tsx`
- [ ] T111 [P] Create UserContext provider in `lib/contexts/UserContext.tsx`
- [ ] T112 Integrate Navigation into `app/layout.tsx`
- [ ] T113 [P] Add Navigation to `app/(auth)/layout.tsx` (simplified version)
- [ ] T114 [P] Add Navigation to `app/app/page.tsx` (editor - currently missing)
- [ ] T115 [P] Verify Navigation on all other pages (my-gallery, gallery, profile, admin, replay)

**Sub-Checkpoint 2a**: All pages have consistent navigation, role-based links work

### Sub-Phase 2b: Entity System - Sizing & Naming

- [ ] **TOKEN_CHECK_2B**: Verify token usage < 110K before continuing

- [ ] T116 Reduce entity token sizes by 20-30% in `src/components/Canvas/PlayerToken.tsx`
- [ ] T117 Improve default entity naming convention in `src/store/projectStore.ts` (Att 01, Def 01, etc.)
- [ ] T118 Redesign cones as hollow circles, remove markers in `src/components/Canvas/PlayerToken.tsx`
- [ ] T119 [P] Remove marker button from `src/components/Sidebar/EntityPalette.tsx`
- [ ] T120 Refine entity color palette in `src/constants/design-tokens.ts`

**Sub-Checkpoint 2b**: Entities properly sized, named, and colored

### Sub-Phase 2c: Entity System - New Types

- [ ] **TOKEN_CHECK_2C**: Verify token usage < 110K before continuing

- [ ] T121 Add tackle-shield and tackle-bag to EntityType in `src/types/index.ts`
- [ ] T122 Add orientation field to Entity interface in `src/types/index.ts`
- [ ] T123 Implement tackle-shield rendering (4-way orientation) in `src/components/Canvas/PlayerToken.tsx`
- [ ] T124 [P] Implement tackle-bag rendering (upright/fallen states) in `src/components/Canvas/PlayerToken.tsx`
- [ ] T125 Add entity buttons to `src/components/Sidebar/EntityPalette.tsx`
- [ ] T126 Update entity spawn positions based on type/team in `src/store/projectStore.ts`

**Sub-Checkpoint 2c**: New entity types work, spawn positions contextual

**Phase 2 Complete**: Navigation and entity system overhauled

---

## Phase 3: Media & Gallery UX (P1-B)

**Estimated Time**: 1 week  
**Goal**: Media export fixes, thumbnails, offline mode, gallery performance

### Sub-Phase 3a: Media Export

- [ ] **TOKEN_CHECK_3A**: Verify token usage < 110K before starting

- [ ] T127 Add browser detection utility in `lib/browser-detect.ts`
- [ ] T128 Implement MP4 export fallback for Safari/iOS in `src/hooks/useExport.ts`
- [ ] T129 Update export UI with format options in export modal component

**Sub-Checkpoint 3a**: Safari/iOS users can export MP4

### Sub-Phase 3b: Thumbnails

- [ ] **TOKEN_CHECK_3B**: Verify token usage < 110K before continuing

- [ ] T130 Add `thumbnail_url` field to database migration in `supabase/migrations/`
- [ ] T131 Create thumbnail generation utility (capture first frame) in `lib/thumbnail.ts`
- [ ] T132 Update POST `/api/animations` to generate and upload thumbnail
- [ ] T133 [P] Update `components/PublicAnimationCard.tsx` to display thumbnail
- [ ] T134 [P] Update `components/AnimationCard.tsx` to display thumbnail

**Sub-Checkpoint 3b**: Gallery cards show visual previews

### Sub-Phase 3c: Offline & Performance

- [ ] **TOKEN_CHECK_3C**: Verify token usage < 110K before continuing

- [ ] T135 Create Supabase health check utility in `lib/supabase/health.ts`
- [ ] T136 Implement offline fallback mode in editor with localStorage queue
- [ ] T137 Add offline indicator banner component
- [ ] T138 Fix N+1 query in `app/api/gallery/route.ts` using JOINs
- [ ] T139 Add pagination to My Gallery in `app/my-gallery/page.tsx`

**Sub-Checkpoint 3c**: Offline mode works, gallery queries optimized

### Sub-Phase 3d: UX Improvements

- [ ] **TOKEN_CHECK_3D**: Verify token usage < 110K before continuing

- [ ] T140 Create onboarding tutorial component in `components/OnboardingTutorial.tsx`
- [ ] T141 Add localStorage flag for first-time users in `app/app/page.tsx`
- [ ] T142 Create health check endpoint in `app/api/health/route.ts`
- [ ] T143 Add guest mode frame limit indicator banner in editor
- [ ] T144 Create error message mapping utility in `lib/error-messages.ts`
- [ ] T145 Update error displays to use friendly messages

**Sub-Checkpoint 3d**: Onboarding works, errors user-friendly

**Phase 3 Complete**: Media, thumbnails, offline, gallery UX all improved

---

## Phase 4: Polish & Operations (P2)

**Estimated Time**: 2-3 weeks  
**Goal**: Editor polish, pitch layouts, content fixes, operations improvements

### Sub-Phase 4a: Editor Polish

- [ ] **TOKEN_CHECK_4A**: Verify token usage < 110K before starting

- [ ] T146 Standardize button styling in `src/components/Sidebar/EntityPalette.tsx`
- [ ] T147 [P] Fix possession dropdown background in `src/components/Sidebar/EntityProperties.tsx`
- [ ] T148 [P] Add subtle texture background around pitch in `components/Editor.tsx`

**Sub-Checkpoint 4a**: Editor UI consistent and polished

### Sub-Phase 4b: Pitch Layouts

- [ ] **TOKEN_CHECK_4B**: Verify token usage < 110K before continuing

- [ ] T149 Add PitchLayout type to `src/types/index.ts`
- [ ] T150 Update Field component to support layouts in `src/components/Canvas/Field.tsx`
- [ ] T151 [P] Create FieldAttack component in `src/components/Canvas/FieldAttack.tsx`
- [ ] T152 [P] Create FieldDefence component in `src/components/Canvas/FieldDefence.tsx`
- [ ] T153 [P] Create FieldTraining component in `src/components/Canvas/FieldTraining.tsx`
- [ ] T154 Add pitch layout selector UI in `src/components/Sidebar/ProjectActions.tsx`

**Sub-Checkpoint 4b**: All 4 pitch layouts work

### Sub-Phase 4c: Content Fixes

- [ ] **TOKEN_CHECK_4C**: Verify token usage < 110K before continuing

- [ ] T155 Standardize British English spelling across UI (Visualise, Colour, Organise)
- [ ] T156 Fix profile animation counter in `app/profile/page.tsx`
- [ ] T157 Add description field to `components/EditMetadataModal.tsx`
- [ ] T158 [P] Add description display to `app/replay/[id]/page.tsx`
- [ ] T159 [P] Improve replay page visual design (warm gray background + texture)

**Sub-Checkpoint 4c**: Content and metadata correct

### Sub-Phase 4d: Reliability Fixes

- [ ] **TOKEN_CHECK_4D**: Verify token usage < 110K before continuing

- [ ] T160 Add autosave quota check in `src/hooks/useAutoSave.ts`
- [ ] T161 Add debounce and optimistic locking to upvote in `app/api/animations/[id]/upvote/route.ts`
- [ ] T162 Add JSONB payload size validation (1MB max) in `lib/schemas/animations.ts`
- [ ] T163 Persist editor state during auth redirects using sessionStorage
- [ ] T164 Add email verification resend endpoint in `app/api/auth/resend-verification/route.ts`
- [ ] T165 Add ban check to gallery API routes

**Sub-Checkpoint 4d**: Reliability issues resolved

### Sub-Phase 4e: Operations

- [ ] **TOKEN_CHECK_4E**: Verify token usage < 110K before continuing

- [ ] T166 Add cache invalidation headers to API responses
- [ ] T167 Move moderation blocklist to database table
- [ ] T168 Create `.env.staging` configuration and document staging setup
- [ ] T169 Add migration step to CI/CD pipeline
- [ ] T170 Add test runner to CI/CD pipeline
- [ ] T171 Document backup and recovery procedures in `docs/operations.md`

**Sub-Checkpoint 4e**: Operations infrastructure improved

**Phase 4 Complete**: All P2 issues resolved

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (P0)**: No dependencies - start immediately, BLOCKS deployment
- **Phase 2 (P1-A)**: Can start after Phase 1 complete
- **Phase 3 (P1-B)**: Can start after Phase 1 complete (parallel with Phase 2 if staffed)
- **Phase 4 (P2)**: Can start after Phases 2-3 complete

### Sub-Phase Dependencies

- **1a → 1b**: Sequential (both P0)
- **2a → 2b → 2c**: Sequential (entity system builds on itself)
- **3a, 3b, 3c, 3d**: Can run in parallel if staffed
- **4a, 4b, 4c, 4d, 4e**: Can run in parallel if staffed

### Parallel Opportunities

Within each sub-phase, tasks marked [P] can run in parallel:
- T105, T106 (retry wrapper updates)
- T113, T114, T115 (navigation integration)
- T119, T120 (entity palette + colors)
- T123, T124 (tackle equipment rendering)
- T133, T134 (card thumbnails)
- T147, T148 (editor polish)
- T151, T152, T153 (pitch layout components)
- T158, T159 (replay page)

---

## Implementation Strategy

### MVP: Phase 1 Only
1. Complete Sub-Phase 1a (critical bugs)
2. Complete Sub-Phase 1b (infrastructure)
3. **STOP and VALIDATE**: All P0 issues resolved
4. Deploy if critical path clear

### Full Implementation
1. Phase 1 → Deploy (P0 complete)
2. Phase 2 → Navigation + Entity system
3. Phase 3 → Media + Gallery UX
4. Phase 4 → Polish + Operations
5. Each phase adds value without breaking previous work

---

## P3 Backlog (Future Iterations)

Reference only - no task IDs assigned:
- Bulk operations in My Gallery
- Mobile canvas optimization
- Save as Draft workflow
- API versioning
- Middleware optimization
- Migration rollback strategy
- Export resolution options
- Animation compression
- GIF export
- Export progress indicator
- Canvas rendering optimization
- Concurrent edit detection
- Composite database indexes
- Rate limit table cleanup
- Monitoring/observability
- Configurable limits
- Code splitting
- Type consolidation
- Error tracking (Sentry)
- Analytics
- Feature flags
- Performance budgets

---

**Document Version**: 2.0 (Consolidated from ISSUES_REGISTER + implementation-plan)  
**Last Updated**: 2026-01-30  
**Status**: Ready for Implementation
