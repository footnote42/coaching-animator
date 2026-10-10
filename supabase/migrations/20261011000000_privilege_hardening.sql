-- #178 (items 1, 3, 4): privilege hardening. Every statement is idempotent
-- (REVOKE/GRANT/ALTER FUNCTION can be re-run; the one recreated function uses
-- CREATE OR REPLACE).
--
-- Callers that change with this migration (all in the same PR):
--   rate_limit_hit        -> src/lib/server/rate-limit.ts, service-role client
--   verify_personal_token -> src/lib/server/personal-tokens.ts, service-role client
--   user_profiles health probe -> src/lib/supabase/health.ts, service-role client

-- 1. rate_limit_hit was executable by anon with any key, so anyone could burn
--    another coach's counter. Only the service role calls it now. service_role
--    is granted explicitly rather than relying on Supabase default privileges.
REVOKE ALL ON FUNCTION public.rate_limit_hit(TEXT, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rate_limit_hit(TEXT, INTEGER) TO service_role;

-- 2. verify_personal_token is SECURITY DEFINER and stamps last_used_at; it is
--    only used by the MCP route, which has no user session. Same treatment.
REVOKE ALL ON FUNCTION public.verify_personal_token(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_personal_token(TEXT) TO service_role;

-- 3. handle_new_user runs only as the auth.users trigger (SECURITY DEFINER, so
--    the trigger needs no caller privilege; EXECUTE is checked when the trigger
--    is created, not when it fires). Its body already uses schema-qualified names.
ALTER FUNCTION public.handle_new_user() SET search_path = '';
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- 4. set_practices_updated_at only assigns NEW.updated_at = NOW() (pg_catalog is
--    always searched), so pinning the search_path needs no body change.
ALTER FUNCTION public.set_practices_updated_at() SET search_path = '';

-- 5. cleanup_rate_limits referenced rate_limits unqualified, so recreate it with
--    a qualified name before pinning. Nothing in src/ calls it; left callable it
--    would let anon reset every counter older than an hour, so close it too.
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.rate_limits WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$;
REVOKE ALL ON FUNCTION public.cleanup_rate_limits() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_rate_limits() TO service_role;

-- is_admin() stays executable by anon and authenticated: RLS policies and
-- guard_user_profile() call it as the invoking role, so revoking it would break
-- them. It returns only whether the caller is an admin.

-- 6. Table privileges that no code path needs. RLS does not guard TRUNCATE,
--    TRIGGER or REFERENCES, so remove them from every public table.
DO $$
DECLARE
  t record;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('REVOKE TRUNCATE, TRIGGER, REFERENCES ON TABLE public.%I FROM anon, authenticated', t.tablename);
  END LOOP;
END $$;

-- 7. Signed-out callers never touch these tables (see the audit in the PR).
--    moderation_blocklist has no caller in src/ at all. The user_profiles
--    health probe moved to the service-role client.
REVOKE ALL ON TABLE public.personal_tokens FROM anon;
REVOKE ALL ON TABLE public.user_profiles FROM anon;
REVOKE ALL ON TABLE public.moderation_blocklist FROM anon;
