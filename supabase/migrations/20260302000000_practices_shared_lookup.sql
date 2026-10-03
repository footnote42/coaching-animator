-- =============================================================================
-- practices: stop link-shared rows from being enumerable
-- =============================================================================
-- The original policy let anyone SELECT every 'link' and 'public' row, so a
-- plain `select * from practices` listed every link-shared Practice. Now:
--   * Anyone can SELECT only 'public' rows (the Gallery).
--   * A link-shared Practice is read one at a time by id through
--     get_shared_practice(), so only someone holding the link can open it.
--   * Owners keep full access through the existing owner policies.
-- =============================================================================

DROP POLICY IF EXISTS "Link and public practices readable by anyone" ON public.practices;
DROP POLICY IF EXISTS "Public practices readable by anyone" ON public.practices;
CREATE POLICY "Public practices readable by anyone"
  ON public.practices FOR SELECT
  USING (visibility = 'public');

-- One Practice by id: link and public to anyone, private to its owner only.
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
    AND (p.visibility IN ('link', 'public') OR p.owner_id = auth.uid());
$$;

REVOKE ALL ON FUNCTION public.get_shared_practice(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shared_practice(uuid) TO anon, authenticated;
