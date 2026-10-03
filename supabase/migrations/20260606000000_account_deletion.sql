-- Migration: account deletion (#98)
-- Deleting an auth user (auth.admin.deleteUser) must not be blocked by an admin's
-- footprint. moderation_blocklist.created_by referenced auth.users with no
-- ON DELETE action, so deleting an admin who added a term failed. Keep the term,
-- drop the attribution. Everything else already cascades or sets null:
-- user_profiles and practices (CASCADE), practice_reports.reporter_id and
-- resolved_by (SET NULL). Feedback is anonymous and holds no user id.

ALTER TABLE public.moderation_blocklist
  DROP CONSTRAINT IF EXISTS moderation_blocklist_created_by_fkey;

ALTER TABLE public.moderation_blocklist
  ADD CONSTRAINT moderation_blocklist_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
