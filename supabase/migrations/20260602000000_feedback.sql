-- =============================================================================
-- Feedback form submissions
-- =============================================================================
-- Anyone (signed in or not) can submit through the API; only admins can read
-- and mark rows as read. Uses public.is_admin() from the practice moderation
-- migration.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  email TEXT CHECK (char_length(email) <= 254),
  area TEXT NOT NULL CHECK (area IN ('general', 'editor', 'save-share', 'gallery', 'mobile', 'other')),
  what TEXT NOT NULL CHECK (char_length(what) BETWEEN 1 AND 2000),
  rating TEXT NOT NULL CHECK (rating IN ('works-well', 'needs-improvement', 'broken')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- A new submission is always unread.
DROP POLICY IF EXISTS "Anyone can send feedback" ON public.feedback;
CREATE POLICY "Anyone can send feedback"
  ON public.feedback FOR INSERT
  TO anon, authenticated
  WITH CHECK (read_at IS NULL);

DROP POLICY IF EXISTS "Admins can read feedback" ON public.feedback;
CREATE POLICY "Admins can read feedback"
  ON public.feedback FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update feedback" ON public.feedback;
CREATE POLICY "Admins can update feedback"
  ON public.feedback FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
