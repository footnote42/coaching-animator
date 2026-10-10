-- #174: lock down user_profiles.
--
-- Before this migration any signed-in coach could PATCH their own row through
-- the REST API and set role = 'admin' or clear banned_at, because the
-- "Users can update own profile" policy checked only the row owner. And the
-- "Public can read display names" policy (USING true) exposed every column of
-- every profile (role, ban fields, age confirmation) to anonymous callers.

-- 1. Only admins (or server-side roles: service_role, postgres) may set or
--    change role, ban fields or identity columns. Coaches keep display_name
--    and age_confirmed_at.
CREATE OR REPLACE FUNCTION public.guard_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF current_user NOT IN ('anon', 'authenticated') OR public.is_admin() THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    IF NEW.role IS DISTINCT FROM 'user' OR NEW.banned_at IS NOT NULL OR NEW.ban_reason IS NOT NULL THEN
      RAISE EXCEPTION 'only admins can set role or ban fields';
    END IF;
  ELSIF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.created_at IS DISTINCT FROM OLD.created_at
     OR NEW.role IS DISTINCT FROM OLD.role
     OR NEW.banned_at IS DISTINCT FROM OLD.banned_at
     OR NEW.ban_reason IS DISTINCT FROM OLD.ban_reason THEN
    RAISE EXCEPTION 'only admins can change role or ban fields';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

DROP TRIGGER IF EXISTS user_profiles_guard ON public.user_profiles;
CREATE TRIGGER user_profiles_guard
  BEFORE INSERT OR UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_user_profile();

-- Signed-out callers never write profiles.
REVOKE INSERT, UPDATE, DELETE ON public.user_profiles FROM anon;

-- 2. Reads: a coach reads their own row ("Users can read own profile"), admins
--    read every row, and everyone else gets display names only, through
--    public_display_names().
DROP POLICY IF EXISTS "Public can read display names" ON public.user_profiles;

-- Recreated here because production may not have it: until now the public
-- policy covered own-row reads.
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
CREATE POLICY "Users can read own profile"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can read user profiles" ON public.user_profiles;
CREATE POLICY "Admins can read user profiles"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE OR REPLACE FUNCTION public.public_display_names(ids uuid[])
RETURNS TABLE (id uuid, display_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT p.id, p.display_name::text
  FROM public.user_profiles p
  WHERE p.id = ANY (ids)
  LIMIT 100;
$$;

REVOKE ALL ON FUNCTION public.public_display_names(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_display_names(uuid[]) TO anon, authenticated;
