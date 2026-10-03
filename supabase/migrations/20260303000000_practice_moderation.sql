-- =============================================================================
-- Moderation on Practices
-- =============================================================================
--   * practices.hidden: an admin can hide a Practice. Hidden Practices drop out
--     of the Gallery, the public SELECT policy and get_shared_practice(),
--     except for the owner and admins.
--   * practice_reports: anyone (signed in or not) can report a Practice; only
--     admins can read and resolve reports.
-- The old content_reports / saved_animations moderation is untouched.
-- =============================================================================

-- Same admin check the content_reports policies use (user_profiles.role).
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

ALTER TABLE public.practices ADD COLUMN IF NOT EXISTS hidden BOOLEAN NOT NULL DEFAULT FALSE;

-- Owners may update their own rows, but only admins may change `hidden`.
CREATE OR REPLACE FUNCTION public.guard_practice_hidden()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.hidden IS DISTINCT FROM OLD.hidden
     AND auth.uid() IS NOT NULL
     AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'only admins can hide or unhide a practice';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

DROP TRIGGER IF EXISTS practices_guard_hidden ON public.practices;
CREATE TRIGGER practices_guard_hidden
  BEFORE UPDATE ON public.practices
  FOR EACH ROW EXECUTE FUNCTION public.guard_practice_hidden();

-- Gallery: public and not hidden.
DROP POLICY IF EXISTS "Public practices readable by anyone" ON public.practices;
CREATE POLICY "Public practices readable by anyone"
  ON public.practices FOR SELECT
  USING (visibility = 'public' AND NOT hidden);

-- Admins can see, hide/unhide and delete any Practice.
DROP POLICY IF EXISTS "Admins can read practices" ON public.practices;
CREATE POLICY "Admins can read practices"
  ON public.practices FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update practices" ON public.practices;
CREATE POLICY "Admins can update practices"
  ON public.practices FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete practices" ON public.practices;
CREATE POLICY "Admins can delete practices"
  ON public.practices FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- One Practice by id: link and public (not hidden) to anyone, anything to the
-- owner or an admin.
CREATE OR REPLACE FUNCTION public.get_shared_practice(p_id uuid)
RETURNS SETOF public.practices
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT p.*
  FROM public.practices p
  WHERE p.id = p_id
    AND (
      (p.visibility IN ('link', 'public') AND NOT p.hidden)
      OR p.owner_id = auth.uid()
      OR public.is_admin()
    );
$$;

REVOKE ALL ON FUNCTION public.get_shared_practice(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shared_practice(uuid) TO anon, authenticated;

-- Reports
CREATE TABLE IF NOT EXISTS public.practice_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID NOT NULL REFERENCES public.practices(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL
    CHECK (reason IN ('inappropriate', 'spam', 'copyright', 'safeguarding', 'other')),
  details TEXT CHECK (char_length(details) <= 500),
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'dismissed', 'actioned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_practice_reports_status ON public.practice_reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_practice_reports_practice_id ON public.practice_reports(practice_id);

ALTER TABLE public.practice_reports ENABLE ROW LEVEL SECURITY;

-- Anyone, signed in or not, can file a report. A signed-in reporter can only
-- file as themselves, and a new report is always open.
DROP POLICY IF EXISTS "Anyone can report a practice" ON public.practice_reports;
CREATE POLICY "Anyone can report a practice"
  ON public.practice_reports FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'open'
    AND resolved_at IS NULL
    AND resolved_by IS NULL
    AND (reporter_id IS NULL OR reporter_id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can read practice reports" ON public.practice_reports;
CREATE POLICY "Admins can read practice reports"
  ON public.practice_reports FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update practice reports" ON public.practice_reports;
CREATE POLICY "Admins can update practice reports"
  ON public.practice_reports FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
