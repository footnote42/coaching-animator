# Tasks: Online Platform

**Input**: Design documents from `/specs/003-online-platform/`
**Prerequisites**: MIGRATION_PLAN.md (required), spec.md (required), data-model.md, contracts/api-contracts.md, research.md

**Tests**: Tests are NOT included unless explicitly requested.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: Next.js App Router structure at repository root
- `app/` - Next.js pages and API routes
- `lib/` - Shared utilities, Supabase clients, schemas
- `components/` - React components (existing + new)
- `supabase/migrations/` - Database migrations

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize Next.js alongside existing Vite, configure tooling

### Sub-Phase 1a: Next.js Initialization

- [x] T001 Install Next.js and dependencies: `next@latest`, `@supabase/ssr`, `@serwist/next`
- [x] T002 Create Next.js config in `next.config.js` with security headers, image domains, Tailwind
- [x] T003 [P] Create root layout in `app/layout.tsx` with providers and global styles
- [x] T004 [P] Create `app/globals.css` importing existing Tailwind and design tokens from `src/index.css`

**Sub-Checkpoint 1a**: `npm run dev` starts Next.js, basic page renders

### Sub-Phase 1b: PWA Configuration

- [x] T005 Update `package.json` scripts: `dev` → next dev, `build` → next build, keep `dev:vite` temporarily
- [x] T006 [P] Create `public/manifest.json` with PWA metadata (theme: Pitch Green #1A3D1A)
- [x] T007 Configure `@serwist/next` service worker in `next.config.js` for offline-first

**Checkpoint 1**: `npm run dev` starts Next.js, Tailwind works, PWA manifest accessible at `/manifest.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure required before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Sub-Phase 2a: Database Schema & RLS

- [x] T008 Create Supabase migration file `supabase/migrations/001_online_platform.sql` with all tables from data-model.md
- [x] T009 Create `user_profiles` table with trigger for auto-creation on auth.users insert
- [x] T010 Create `saved_animations` table with constraints and indexes (including full-text search)
- [x] T011 [P] Create `upvotes` table with trigger for denormalized upvote_count
- [x] T012 [P] Create `content_reports` table with unique constraint per user
- [x] T013 [P] Create `follows` table (Phase 2 foundation, no UI)
- [x] T014 [P] Create `rate_limits` table for persistent rate limiting
- [x] T015 Implement all RLS policies from data-model.md for all tables

**Sub-Checkpoint 2a**: Migration file created with all tables, triggers, and RLS policies

### Sub-Phase 2b: Supabase Client Setup

- [x] T016 Create `lib/supabase/server.ts` with `createServerClient()` for Server Components
- [x] T017 [P] Create `lib/supabase/client.ts` with `createBrowserClient()` for Client Components
- [x] T018 [P] Create `lib/supabase/middleware.ts` for session refresh
- [x] T019 Create middleware `middleware.ts` at project root to refresh auth tokens

**Sub-Checkpoint 2b**: Supabase clients created, middleware active

### Sub-Phase 2c: Shared Utilities

- [x] T020 Create `lib/schemas/animations.ts` with Zod schemas from api-contracts.md
- [x] T021 [P] Create `lib/schemas/users.ts` with profile and report schemas
- [x] T022 Create `lib/auth.ts` with `getUser()`, `requireAuth()`, `requireAdmin()` helpers
- [x] T023 [P] Create `lib/quota.ts` with `checkQuota()` function (50 animation limit)
- [x] T024 [P] Create `lib/moderation.ts` with `bad-words` blocklist validation (server-side only)
- [x] T025 [P] Create `lib/rate-limit.ts` with rate limiting helpers using Supabase table
- [x] T026 Create `app/api/auth/callback/route.ts` to handle OAuth code exchange

**Checkpoint 2**: Foundation ready - `npm run build` passes, Supabase clients working, middleware active

---

## Phase 3: User Story 1 - Coach Creates Account and Saves Animation (Priority: P1) MVP

**Goal**: User can register, login, create animation, save to cloud, access from gallery

**Independent Test**: Register → Create animation → Save to cloud → Logout → Login → Verify animation accessible

### Sub-Phase 3a: Auth Pages

- [x] T027 [US1] Create `app/(auth)/login/page.tsx` with email/password form
- [x] T028 [P] [US1] Create `app/(auth)/register/page.tsx` with email registration + ToS checkbox
- [x] T029 [P] [US1] Create `app/(auth)/forgot-password/page.tsx` with email reset form
- [x] T030 [P] [US1] Create `app/(auth)/reset-password/page.tsx` for password reset from email link
- [x] T031 [US1] Create `app/(auth)/layout.tsx` with centered auth card layout

**Sub-Checkpoint 3a**: Login and register pages render, forms submit to Supabase Auth

### Sub-Phase 3b: Animation Tool Migration

- [x] T032 [US1] Create `components/Editor.tsx` by extracting logic from `src/App.tsx`
- [x] T033 [US1] Create `app/app/page.tsx` with dynamic import of Editor (`ssr: false`)
- [x] T034 [US1] Add auth state detection to Editor - detect logged-in vs guest
- [x] T035 [US1] Verify Konva canvas, drag/drop, timeline, playback all work in Next.js

**Sub-Checkpoint 3b**: Canvas renders at /app, Editor dynamically loaded with SSR disabled

### Sub-Phase 3c: Cloud Save API

- [x] T036 [US1] Create `app/api/animations/route.ts` with GET (list) and POST (create) handlers
- [x] T037 [US1] Implement POST validation: blocklist check, duration ≤60s, frames ≤50, quota check
- [x] T038 [US1] Create `app/api/animations/[id]/route.ts` with GET, PUT, DELETE handlers
- [x] T046 [US1] Create `app/api/user/profile/route.ts` with GET and PUT handlers
- [x] T047 [P] [US1] Create `app/api/user/account/route.ts` with DELETE handler (GDPR)

**Sub-Checkpoint 3c**: API routes created with full validation, auth, rate limiting

### Sub-Phase 3d: Personal Gallery UI

- [x] T039 [US1] Create `app/my-gallery/page.tsx` (protected route) listing user's animations
- [x] T040 [US1] Add sorting controls (title, date, duration, type) to personal gallery
- [x] T041 [US1] Create animation card component in `components/AnimationCard.tsx` with thumbnail
- [x] T042 [US1] Add edit metadata modal to personal gallery items
- [x] T043 [US1] Add delete confirmation dialog to personal gallery items
- [x] T044 [US1] Create "Save to Cloud" button/modal in Editor with title/description/type/tags inputs
- [x] T045 [US1] Integrate save flow: validate → POST /api/animations → show success/redirect to gallery

**Checkpoint 3**: User Story 1 fully functional - register → login → create animation → save → view in gallery

---

## Phase 4: User Story 2 - Coach Shares Animation Publicly (Priority: P1)

**Goal**: User can change animation visibility to public, making it discoverable in public gallery

**Independent Test**: Save private animation → Change visibility to "Public" → Verify appears in public gallery search

### Visibility Controls

- [x] T048 [US2] Add visibility toggle (private/link_shared/public) to edit metadata modal
- [x] T049 [US2] Update PUT /api/animations/[id] to handle visibility changes
- [x] T050 [US2] Add visibility badge to AnimationCard component

### Shareable Links

- [x] T051 [US2] Create "Copy Link" button for link_shared and public animations
- [x] T052 [US2] Create `app/replay/[id]/page.tsx` for public replay viewing

**Checkpoint**: User Story 2 functional - visibility controls work, public animations discoverable

---

## Phase 5: User Story 3 - Visitor Explores Public Gallery (Priority: P1)

**Goal**: Guests can browse, search, filter, and view public animations without login

**Independent Test**: Visit /gallery as guest → Search → Filter by type → View animation replay

### Public Gallery Page

- [x] T053 [US3] Create `app/gallery/page.tsx` (SSR for SEO) with public animation list
- [x] T054 [US3] Create `app/api/gallery/route.ts` with search, filter, sort, pagination
- [x] T055 [US3] Add search input (title + description full-text search) to gallery page
- [x] T056 [US3] Add filter dropdowns (animation_type, tags) to gallery page
- [x] T057 [US3] Add sort controls (newest, most upvoted) to gallery page
- [x] T058 [US3] Implement pagination or infinite scroll for gallery

### Animation Detail Page

- [x] T059 [US3] Create `app/gallery/[id]/page.tsx` with full animation replay
- [x] T060 [US3] Display metadata: title, description, author, tags, upvote count, created date
- [x] T061 [US3] Add SEO meta tags (title, description, OG tags) to detail page

### Dynamic OG Images

- [x] T062 [US3] Create `app/api/og/[id]/route.tsx` using @vercel/og for dynamic preview images
- [x] T063 [US3] Configure OG image URL in gallery detail page meta tags

**Checkpoint**: User Story 3 functional - public gallery browsable, searchable, filterable; animation details viewable

---

## Phase 6: User Story 4 - Guest Creates Limited Animation Locally (Priority: P2)

**Goal**: Guests can try the tool with 10-frame limit, local-only save, prompted to register for more

**Independent Test**: Visit /app as guest → Create animation → Try 11th frame → See registration prompt

### Sub-Phase 6a: Frame Limit Enforcement

- [x] **TOKEN_CHECK_6A**: Verify token usage < 110K before starting Phase 6
- [x] T064 [US4] Implement 10-frame limit check in Editor for unauthenticated users
- [x] T065 [US4] Show registration prompt modal when guest tries to add 11th frame

**Sub-Checkpoint 6a**: Frame limit enforced, registration prompt shown - MANDATORY HANDOFF

### Sub-Phase 6b: Save Restrictions

- [x] **TOKEN_CHECK_6B**: Verify token usage < 110K before continuing
- [x] T066 [US4] Disable "Save to Cloud" button for guests, show "Register to Save" prompt
- [x] T067 [US4] Keep local JSON download available for guests

**Checkpoint 6**: User Story 4 functional - guest limits enforced, registration prompts shown

---

## Phase 7: User Story 5 - Registered User Upvotes Animations (Priority: P2)

**Goal**: Logged-in users can upvote/un-upvote public animations (not their own)

**Independent Test**: Login → View public animation (not own) → Click upvote → Count increases → Click again → Removed

### Sub-Phase 7a: Upvote API

- [x] **TOKEN_CHECK_7A**: Verify token usage < 110K before starting Phase 7
- [x] T068 [US5] Create `app/api/animations/[id]/upvote/route.ts` with POST handler (toggle)
- [x] T069 [US5] Add `user_has_upvoted` field to GET /api/animations/[id] and /api/gallery responses

**Sub-Checkpoint 7a**: Upvote API functional - MANDATORY HANDOFF

### Sub-Phase 7b: Upvote UI

- [x] **TOKEN_CHECK_7B**: Verify token usage < 110K before continuing
- [x] T070 [US5] Add upvote button to AnimationCard component (public gallery)
- [x] T071 [US5] Add upvote button to gallery detail page
- [x] T072 [US5] Disable/hide upvote button for own animations
- [x] T073 [US5] Show login prompt when guest clicks upvote

**Checkpoint 7**: User Story 5 functional - upvoting works, counts update, toggle behavior correct

---

## Phase 8: User Story 6 - User Reports Inappropriate Content (Priority: P2)

**Goal**: Logged-in users can report public animations with a reason

**Independent Test**: Login → View public animation → Click Report → Select reason → Submit → See confirmation

### Sub-Phase 8a: Report API

- [x] **TOKEN_CHECK_8A**: Verify token usage < 110K before starting Phase 8
- [x] T074 [US6] Create `app/api/report/route.ts` with POST handler
- [x] T075 [US6] Implement rate limiting (5 reports/hour) on report endpoint

**Sub-Checkpoint 8a**: Report API functional - MANDATORY HANDOFF

### Sub-Phase 8b: Report UI

- [x] **TOKEN_CHECK_8B**: Verify token usage < 110K before continuing
- [x] T076 [US6] Add "Report" button to gallery detail page (logged-in users only)
- [x] T077 [US6] Create report modal with reason dropdown and optional details
- [x] T078 [US6] Show success confirmation after report submission

**Checkpoint 8**: User Story 6 functional - reports submitted, stored in content_reports table

---

## Phase 9: User Story 7 - Visitor Learns About the Tool (Priority: P2)

**Goal**: Landing page explains the tool, features, and drives registration

**Independent Test**: Visit / → See hero, features, CTA → Click "Get Started" → Navigate to register/tool

### Sub-Phase 9a: Landing Page

- [x] **TOKEN_CHECK_9A**: Verify token usage < 110K before starting Phase 9
- [x] T079 [US7] Create `app/page.tsx` as landing page with hero section
- [x] T080 [US7] Add feature highlights section with visuals/icons to landing page
- [x] T081 [US7] Add "Get Started" CTA button linking to /register or /app
- [x] T082 [US7] Ensure landing page is mobile responsive

**Sub-Checkpoint 9a**: Landing page complete - MANDATORY HANDOFF

### Sub-Phase 9b: Legal Pages

- [x] **TOKEN_CHECK_9B**: Verify token usage < 110K before continuing
- [x] T083 [P] [US7] Create `app/(legal)/terms/page.tsx` with Terms of Service content
- [x] T084 [P] [US7] Create `app/(legal)/privacy/page.tsx` with Privacy Policy content
- [x] T085 [P] [US7] Create `app/(legal)/contact/page.tsx` with Formspree form integration

**Checkpoint 9**: User Story 7 functional - landing page complete, legal pages accessible

---

## Phase 10: User Story 8 - Admin Moderates Reported Content (Priority: P3)

**Goal**: Admins can view report queue and take actions (dismiss, hide, delete, warn, ban)

**Independent Test**: Login as admin → View /admin → See pending reports → Take action → Report resolved

### Sub-Phase 10a: Admin API

- [x] **TOKEN_CHECK_10A**: Verify token usage < 110K before starting Phase 10
- [x] T086 [US8] Create `app/api/admin/reports/route.ts` with GET handler (admin only)
- [x] T087 [US8] Create `app/api/admin/reports/[id]/action/route.ts` with POST handler

**Sub-Checkpoint 10a**: Admin API functional - MANDATORY HANDOFF

### Sub-Phase 10b: Admin Dashboard UI

- [x] **TOKEN_CHECK_10B**: Verify token usage < 110K before continuing
- [x] T088 [US8] Create `app/admin/page.tsx` (protected, admin-only) with moderation queue
- [x] T089 [US8] Display report details: animation, reporter, reason, date
- [x] T090 [US8] Add action buttons: Dismiss, Hide, Delete, Warn User, Ban User

**Sub-Checkpoint 10b**: Admin UI complete - MANDATORY HANDOFF

### Sub-Phase 10c: Moderation Actions

- [x] **TOKEN_CHECK_10C**: Verify token usage < 110K before continuing
- [x] T091 [US8] Implement hide action: set `hidden_at` on animation, remove from public view
- [x] T092 [US8] Implement user warning/ban: update `user_profiles.banned_at`

**Checkpoint 10**: User Story 8 functional - admins can moderate content

---

## Phase 11: User Story 9 - Coach Remixes Public Play (Priority: P2)

**Goal**: User can copy a public animation to their gallery as a remix

**Independent Test**: Login → View public animation → Click "Remix to Playbook" → Copy in personal gallery

### Sub-Phase 11a: Remix API

- [x] **TOKEN_CHECK_11A**: Verify token usage < 110K before starting Phase 11
- [x] T093 [US9] Create `app/api/animations/[id]/remix/route.ts` with POST handler
- [x] T094 [US9] Implement remix: copy animation, append "(Remix)" to title, set private

**Sub-Checkpoint 11a**: Remix API functional - MANDATORY HANDOFF

### Sub-Phase 11b: Remix UI

- [x] **TOKEN_CHECK_11B**: Verify token usage < 110K before continuing
- [x] T095 [US9] Add "Remix to Playbook" button to gallery detail page (logged-in users)
- [x] T096 [US9] Show login prompt when guest clicks remix button
- [x] T097 [US9] Redirect to personal gallery after successful remix

**Checkpoint 11**: User Story 9 functional - remix creates copy in user's gallery

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Improvements affecting multiple user stories, cleanup, deployment

### Sub-Phase 12a: Security Hardening

- [x] **TOKEN_CHECK_12A**: Verify token usage < 110K before starting Phase 12
- [x] T098 [P] Configure CSP headers in `next.config.js` per FR-SEC-01
- [x] T099 [P] Verify all API routes validate input server-side per FR-SEC-03
- [x] T100 Audit for secret exposure - ensure no sensitive data in client bundles

**Sub-Checkpoint 12a**: Security hardened - MANDATORY HANDOFF

### Sub-Phase 12b: Performance & UX

- [x] **TOKEN_CHECK_12B**: Verify token usage < 110K before continuing
- [x] T101 [P] Add loading states/skeletons to gallery pages
- [x] T102 [P] Verify SSR/ISR for public gallery pages (SEO)
- [x] T103 Configure sitemap.xml generation for public pages
- [x] T104 [P] Create "Coach's Clipboard" empty state illustration for personal gallery (FR-UI-01)
- [x] T105 [P] Create empty state for public gallery (no results found)

**Sub-Checkpoint 12b**: UX polished - MANDATORY HANDOFF

### Sub-Phase 12c: Cleanup & Verification

- [x] **TOKEN_CHECK_12C**: Verify token usage < 110K before continuing
- [x] T106 Remove Vite: uninstall `vite`, `@vitejs/plugin-react`, delete `vite.config.ts`
- [x] T107 Update README.md with new development commands and deployment instructions
- [x] T108 Run full quickstart.md validation (all user stories)
- [x] T109 Verify GIF export works in Next.js environment (R-007)
- [x] T110 Verify offline mode works per Constitution V.1 (PWA service worker)
- [x] T111 Verify Zustand hydration has no SSR mismatches (R-008)

**Checkpoint 12**: Production ready - all stories functional, security hardened, cleaned up

---

## Phase 13: Production Deployment

**Purpose**: Deploy to production with Supabase backend and verify all features work end-to-end

**Prerequisites**: All Phase 1-12 tasks complete, Supabase account created

### Sub-Phase 13a: Supabase Setup

- [x] **TOKEN_CHECK_13A**: Verify token usage < 110K before starting Phase 13
- [x] T112 Create Supabase project at supabase.com
- [x] T113 Run migration: Execute `supabase/migrations/001_online_platform.sql` in Supabase SQL Editor
- [x] T114 Verify all tables created: `user_profiles`, `saved_animations`, `upvotes`, `content_reports`, `follows`, `rate_limits`
- [x] T115 Configure Auth settings: Enable email provider, set redirect URLs, configure email templates
- [x] T116 Test auth flow locally: Register → Confirm email → Login → Verify session

**Sub-Checkpoint 13a**: Supabase configured, auth working locally

### Sub-Phase 13b: Environment & Deployment

- [ ] **TOKEN_CHECK_13B**: Verify token usage < 110K before continuing
- [ ] T117 Create Vercel project linked to repository
- [ ] T118 Configure environment variables in Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only)
  - `NEXT_PUBLIC_SITE_URL` (production URL)
- [ ] T119 Deploy to Vercel and verify build succeeds
- [ ] T120 Verify production site loads at deployment URL

**Sub-Checkpoint 13b**: Site deployed, accessible at production URL

### Sub-Phase 13c: Admin Setup & Verification

- [ ] **TOKEN_CHECK_13C**: Verify token usage < 110K before continuing
- [ ] T121 Register admin account on production
- [ ] T122 Manually set admin role: `UPDATE user_profiles SET role = 'admin' WHERE id = '<admin-user-id>'`
- [ ] T123 Verify admin dashboard accessible at `/admin`

**Sub-Checkpoint 13c**: Admin account configured

### Sub-Phase 13d: End-to-End Testing

- [ ] **TOKEN_CHECK_13D**: Verify token usage < 110K before continuing
- [ ] T124 [US1] Test: Register → Create animation → Save to cloud → Logout → Login → Verify in gallery
- [ ] T125 [US2] Test: Set animation to public → Copy share link → Open in incognito → Verify viewable
- [ ] T126 [US3] Test: Browse public gallery → Filter by type → Sort by upvotes → View animation detail
- [ ] T127 [US4] Test: Open /app as guest → Create animation → Hit 10-frame limit → See upgrade prompt
- [ ] T128 [US5] Test: Login → Upvote animation → Verify count increases → Upvote again → Verify toggle
- [ ] T129 [US6] Test: Report animation → Verify in admin queue → Take action → Verify status updates
- [ ] T130 [US7] Test: Visit landing page → Verify hero, features, CTA → Click "Start Creating"
- [ ] T131 [US8] Test: Admin dashboard → List reports → Dismiss/Hide/Ban actions work
- [ ] T132 [US9] Test: View public animation → Click Remix → Verify copy in personal gallery

**Sub-Checkpoint 13d**: All user stories verified on production

### Sub-Phase 13e: Final Verification

- [ ] T133 Verify PWA: Install app on mobile → Go offline → Verify offline page shows
- [ ] T134 Verify SEO: Check sitemap.xml accessible → Check OG meta tags on share pages
- [ ] T135 Verify security: Check CSP headers in browser dev tools → Verify no console errors
- [ ] T136 Create backup: Document admin credentials securely → Export Supabase schema

**Checkpoint 13**: Production deployment complete - all features verified, ready for users

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 - **BLOCKS all user stories**
- **User Stories (Phase 3-11)**: All depend on Phase 2 completion
  - P1 stories (US1, US2, US3) should be prioritized
  - US2 depends on US1 (needs save functionality)
  - US3 can parallel with US1/US2
  - P2/P3 stories can proceed after P1 completion
- **Polish (Phase 12)**: After all desired user stories complete

### User Story Dependencies

| Story | Depends On | Can Parallel With |
|-------|------------|-------------------|
| US1 (Auth + Save) | Phase 2 only | US3 |
| US2 (Public Share) | US1 | US3, US7 |
| US3 (Public Gallery) | Phase 2 only | US1, US2, US7 |
| US4 (Guest Mode) | US1 (Editor migration) | US5-US9 |
| US5 (Upvotes) | US3 | US4, US6, US7, US9 |
| US6 (Reports) | US3 | US4, US5, US7, US9 |
| US7 (Landing) | Phase 2 only | US1-US6, US9 |
| US8 (Admin) | US6 | - |
| US9 (Remix) | US1, US3 | US4-US7 |

### Within Each User Story

- Models/Tables before API routes
- API routes before UI
- Core functionality before polish

---

## Parallel Execution Examples

### Phase 2 (Foundational) - Maximum Parallelism

```
Parallel Group A (Tables):
  T011: Create upvotes table
  T012: Create content_reports table
  T013: Create follows table
  T014: Create rate_limits table

Parallel Group B (Supabase Clients):
  T016: lib/supabase/server.ts
  T017: lib/supabase/client.ts
  T018: lib/supabase/middleware.ts

Parallel Group C (Utilities):
  T021: lib/schemas/users.ts
  T023: lib/quota.ts
  T024: lib/moderation.ts
  T025: lib/rate-limit.ts
```

### User Story 1 - Auth Pages Parallel

```
Parallel Group (Auth Pages):
  T027: login/page.tsx
  T028: register/page.tsx
  T029: forgot-password/page.tsx
  T030: reset-password/page.tsx
```

### Cross-Story Parallelism (After Phase 2)

```
Developer A: US1 (Auth + Save) - Critical path
Developer B: US3 (Public Gallery) - Can start immediately
Developer C: US7 (Landing Page) - Can start immediately
```

---

## Implementation Strategy

### MVP First (US1 + US2 + US3)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (**CRITICAL - blocks all stories**)
3. Complete Phase 3: User Story 1 (Auth + Save)
4. Complete Phase 4: User Story 2 (Public Sharing)
5. Complete Phase 5: User Story 3 (Public Gallery)
6. **STOP and VALIDATE**: Test all P1 stories end-to-end
7. Deploy MVP

### Incremental Delivery

1. **MVP**: Setup → Foundation → US1 → US2 → US3 → Deploy
2. **+Guest Mode**: US4 → Deploy
3. **+Social**: US5 (Upvotes) → US9 (Remix) → Deploy
4. **+Trust & Safety**: US6 (Reports) → US8 (Admin) → Deploy
5. **+Marketing**: US7 (Landing) → Deploy

### Estimated Effort

| Phase | Tasks | Effort |
|-------|-------|--------|
| Setup | 7 | 1 day |
| Foundational | 19 | 2 days |
| US1 (Auth + Save) | 21 | 3 days |
| US2 (Public Share) | 5 | 0.5 days |
| US3 (Public Gallery) | 11 | 2 days |
| US4 (Guest Mode) | 4 | 0.5 days |
| US5 (Upvotes) | 6 | 1 day |
| US6 (Reports) | 5 | 0.5 days |
| US7 (Landing) | 7 | 1 day |
| US8 (Admin) | 7 | 1.5 days |
| US9 (Remix) | 5 | 0.5 days |
| Polish | 14 | 1.5 days |

**Total**: 111 tasks, ~15 days

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently testable after completion
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- PWA offline capability (R-002) must be verified early in Phase 1
