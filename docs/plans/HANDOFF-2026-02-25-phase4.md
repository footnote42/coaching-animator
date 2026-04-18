  Handoff Prompt — Phase 4 Planning
                                                                                                                                 
  You are starting a fresh planning session for coaching-animator (Next.js + Supabase rugby coaching platform).
  
  ## Your Task

  Use CLEO protocols to plan Phase 4 (v2.3): Club Personalization & Video Links.

  Start by running:
    ct session start --scope epic:<new-epic-id> --auto-focus --name "Phase 4 Planning"

  Then use the ct-epic-architect skill to decompose Phase 4 into tasks.

  ---

  ## Context: What Phase 4 Delivers (PRD §5.6, §5.8, §9.8)

  **Club Personalization** (F-PERS-01 through F-PERS-07):
  - Upload club badge (max 500KB, PNG/JPG/SVG) → stored in Supabase Storage
  - Set primary/secondary strip colors via hex color pickers
  - New attack players default to primary strip color
  - New defense players default to secondary strip color
  - Profile page shows club badge + colors
  - (P2) Animation metadata includes club name as searchable field
  - (P2) Editor sidebar headers use club colors

  **Video Links** (F-VID-01 through F-VID-04):
  - video_url field on saved_animations (already in DB + API)
  - YouTube URL validation on save
  - Replay viewer already shows "Watch Tutorial Video" link

  ---

  ## CRITICAL: What's Already Done (do not re-implement)

  Before creating tasks, verify these are implemented:

  | Feature | Status | Evidence |
  |---------|--------|----------|
  | DB columns: club_name, primary_strip_color, secondary_strip_color | ✅ DONE | `src/app/api/user/profile/route.ts`
  reads/writes them |
  | Profile page UI: club name + color fields | ✅ DONE | `src/app/profile/page.tsx` |
  | Strip colors wired into Editor | ✅ DONE | `src/app/app/AnimationToolClient.tsx` passes `stripColors` prop |
  | video_url DB column + API | ✅ DONE | `src/lib/schemas/animations.ts`, `src/app/api/animations/` |
  | video_url shown in replay viewer | ✅ DONE | `src/app/replay/[id]/page.tsx` |

  **Gaps to fill**:
  - club_badge_url column: check if it exists in DB migration and is read/written in profile API
    - API selects: `id, display_name, animation_count, role, created_at, max_animations, club_name, primary_strip_color,
  secondary_strip_color` — badge_url is MISSING from the select
  - Club badge upload UI: file upload component + Supabase Storage bucket
  - Color picker UI: profile page currently has text inputs for hex — needs actual color picker component
  - YouTube URL validation: check if SaveToCloudModal validates the format
  - F-PERS-03/04: Verify strip colors actually affect new player default colors in Editor (check EntityColors service)
  - F-PERS-05: Verify profile page displays badge visually (not just text fields)
  - E2E tests for personalization

  ---

  ## Key Files

  | Area | Path |
  |------|------|
  | Profile page | `src/app/profile/page.tsx` |
  | Profile API | `src/app/api/user/profile/route.ts` |
  | Save modal (video URL) | `src/shared/components/SaveToCloudModal.tsx` |
  | Entity colors service | `src/features/animation/services/entityColors.ts` |
  | Editor (strip colors) | `src/app/app/AnimationToolClient.tsx` |
  | Animations schema | `src/lib/schemas/animations.ts` |
  | Replay viewer | `src/app/replay/[id]/page.tsx` |
  | DB migrations | `supabase/migrations/` |

  ---

  ## Authority Docs

  - PRD: `docs/authority/PRD-v2.0.md` §5.6 (Personalization), §5.8 (Video Links), §9.8 (UI wireframe)
  - Constitution: `docs/authority/constitution.md`
  - Roadmap: `docs/authority/ROADMAP.md`

  ---

  ## Planning Instructions

  1. Read the key files listed above to establish what's actually implemented vs. missing
  2. Check `supabase/migrations/` for whether `club_badge_url` column exists
  3. Identify the true gaps (expected: badge upload + storage, color picker UI, badge display, E2E tests — but verify)
  4. Create a Phase 4 epic in CLEO, then decompose into tasks ordered by dependency
  5. Mark any already-complete requirements as done immediately — do not create tasks for implemented work
  6. Output a task breakdown for human review before any implementation begins

  Do not implement anything — planning only.