-- Accounts are 18+ by self-declaration (docs/adr/0003-accounts-are-18-plus.md).
-- age_confirmed_at records when the person ticked "I am 18 or over".
-- NULL means not yet confirmed: existing accounts are asked once at next sign-in.

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS age_confirmed_at TIMESTAMPTZ;

-- New email sign-ups pass age_confirmed = true in their sign-up metadata after
-- ticking the checkbox. OAuth sign-ups carry no such flag, so they are asked
-- at first sign-in like existing accounts.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, age_confirmed_at)
  VALUES (
    NEW.id,
    CASE WHEN NEW.raw_user_meta_data ->> 'age_confirmed' = 'true' THEN now() ELSE NULL END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
