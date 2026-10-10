-- Migration: account deletion anonymises feedback, reports and rate-limit keys (#182)
-- Deleting an auth user (route or Supabase dashboard) must leave no row that
-- identifies the person. Done in the database so every deletion path is covered.
--
-- feedback: gains a nullable user_id (set for signed-in submitters). On deletion
--   the name is replaced, email and user_id are nulled, the message is kept.
--   Older rows have no user_id, so they are also matched on the account email.
-- practice_reports: reporter_id/resolved_by already SET NULL; the free-text
--   details a reporter wrote are cleared too.
-- rate_limits: keys embed the user id ("user:<uuid>:..."); those rows are purged.

ALTER TABLE public.feedback
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id) WHERE user_id IS NOT NULL;

-- A submitter can only attribute feedback to themselves.
DROP POLICY IF EXISTS "Anyone can send feedback" ON public.feedback;
CREATE POLICY "Anyone can send feedback"
  ON public.feedback FOR INSERT
  TO anon, authenticated
  WITH CHECK (read_at IS NULL AND (user_id IS NULL OR user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.anonymise_deleted_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.feedback
     SET name = 'Deleted user', email = NULL, user_id = NULL
   WHERE user_id = OLD.id
      OR (OLD.email IS NOT NULL AND email IS NOT NULL AND lower(email) = lower(OLD.email));

  UPDATE public.practice_reports SET details = NULL WHERE reporter_id = OLD.id;

  DELETE FROM public.rate_limits WHERE key LIKE '%' || OLD.id::TEXT || '%';

  RETURN OLD;
END;
$$;

REVOKE ALL ON FUNCTION public.anonymise_deleted_user() FROM PUBLIC, anon, authenticated;

-- BEFORE DELETE so it runs ahead of the ON DELETE SET NULL / CASCADE actions.
DROP TRIGGER IF EXISTS anonymise_deleted_user ON auth.users;
CREATE TRIGGER anonymise_deleted_user
  BEFORE DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.anonymise_deleted_user();
