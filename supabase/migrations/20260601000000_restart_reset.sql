-- Migration: restart reset (#64, ADR 0002)
-- The old animation model is deleted rather than migrated. This drops every
-- table, function, trigger, policy and column that only the old model used.
--
-- Kept: auth users, user_profiles (rows and the columns new code reads),
-- practices, practice_reports, rate_limits (+ rate_limit_hit), moderation_blocklist,
-- is_admin, get_shared_practice, guard_practice_hidden, handle_new_user.
--
-- Not applied by this branch. #65 applies it to production.

-- =============================================================================
-- 1. Old content tables
-- =============================================================================
-- CASCADE removes their policies, indexes, triggers and the foreign keys
-- between them (collection_items, animation_versions, upvotes and
-- content_reports all reference saved_animations).

DROP TABLE IF EXISTS public.collection_items CASCADE;
DROP TABLE IF EXISTS public.collections CASCADE;
DROP TABLE IF EXISTS public.animation_versions CASCADE;
DROP TABLE IF EXISTS public.upvotes CASCADE;
DROP TABLE IF EXISTS public.content_reports CASCADE;
DROP TABLE IF EXISTS public.saved_animations CASCADE;

-- Dropped in 20260216000000 already; repeated so a database that skipped it ends clean.
DROP TABLE IF EXISTS public.follows CASCADE;
DROP TABLE IF EXISTS public.shares CASCADE;

-- =============================================================================
-- 2. Trigger functions that only served those tables
-- =============================================================================

DROP FUNCTION IF EXISTS public.update_animation_count();
DROP FUNCTION IF EXISTS public.update_upvote_count();
DROP FUNCTION IF EXISTS public.cleanup_old_versions();
DROP FUNCTION IF EXISTS public.check_parent_is_base();
DROP FUNCTION IF EXISTS public.check_no_self_remix();
DROP FUNCTION IF EXISTS public.increment_progression_count();
DROP FUNCTION IF EXISTS public.decrement_progression_count();
DROP FUNCTION IF EXISTS public.increment_remix_count();
DROP FUNCTION IF EXISTS public.decrement_remix_count();

-- =============================================================================
-- 3. Old-only columns on user_profiles
-- =============================================================================
-- animation_count / max_animations: the old save quota.
-- club_name, strip colours, club_badge_url: club branding for old animation
-- cards and editor defaults. Practices read none of them.

ALTER TABLE public.user_profiles
  DROP COLUMN IF EXISTS animation_count,
  DROP COLUMN IF EXISTS max_animations,
  DROP COLUMN IF EXISTS club_name,
  DROP COLUMN IF EXISTS primary_strip_color,
  DROP COLUMN IF EXISTS secondary_strip_color,
  DROP COLUMN IF EXISTS club_badge_url;

-- =============================================================================
-- 4. club-badges storage bucket
-- =============================================================================
-- Supabase blocks direct deletes from storage tables, so the bucket and any
-- badge images are emptied and deleted through the Storage API or dashboard
-- (see #65). Here the bucket is closed: its policies go and it stops being public.

DROP POLICY IF EXISTS "Users can upload their own club badge" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own club badge" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own club badge" ON storage.objects;
DROP POLICY IF EXISTS "Club badges are publicly readable" ON storage.objects;

UPDATE storage.buckets SET public = false WHERE id = 'club-badges';
