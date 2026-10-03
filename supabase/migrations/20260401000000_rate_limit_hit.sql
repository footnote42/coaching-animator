-- Issue #44: durable, atomic rate limiting backed by the existing rate_limits table.
--
-- Fixed window: each (caller key, window) pair is one row whose primary key is
-- "<key>:<window epoch>", so the upsert on the existing PK is atomic and
-- concurrent requests cannot race. No schema change to the table.

CREATE OR REPLACE FUNCTION public.rate_limit_hit(p_key TEXT, p_window_seconds INTEGER)
RETURNS TABLE (hit_count INTEGER, window_start TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_window TIMESTAMPTZ;
BEGIN
  IF p_key IS NULL OR length(p_key) > 300 OR p_window_seconds IS NULL OR p_window_seconds < 1 THEN
    RAISE EXCEPTION 'invalid rate limit arguments';
  END IF;

  v_window := to_timestamp(floor(extract(epoch FROM now()) / p_window_seconds) * p_window_seconds);

  -- Occasional cleanup (~1% of calls): drop windows older than two days.
  IF random() < 0.01 THEN
    DELETE FROM public.rate_limits rl WHERE rl.window_start < now() - INTERVAL '2 days';
  END IF;

  RETURN QUERY
  INSERT INTO public.rate_limits AS rl (key, count, window_start)
  VALUES (p_key || ':' || extract(epoch FROM v_window)::BIGINT::TEXT, 1, v_window)
  ON CONFLICT (key) DO UPDATE SET count = rl.count + 1
  RETURNING rl.count, rl.window_start;
END;
$$;

REVOKE ALL ON FUNCTION public.rate_limit_hit(TEXT, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rate_limit_hit(TEXT, INTEGER) TO anon, authenticated;

-- The table itself must not be reachable by API roles: RLS is enabled with no
-- policies (see online_platform migration); also remove table privileges.
REVOKE ALL ON TABLE public.rate_limits FROM anon, authenticated;
