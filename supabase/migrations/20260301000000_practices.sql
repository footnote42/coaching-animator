-- =============================================================================
-- practices: a Coach's saved Practice (stores a Practice Script as-is)
-- =============================================================================
-- Sits alongside saved_animations; the old animation model is untouched.
-- A match play is a Practice with no Progressions; progressions live inside
-- the script jsonb, so there are no progression rows.
--
-- Access rules (RLS):
--   * Owners can read, insert, update and delete their own rows, at any
--     visibility (private, link, public).
--   * Rows with visibility 'link' or 'public' are readable by anyone,
--     signed in or not.
--   * Nobody can insert, update or delete a row they do not own.
-- =============================================================================

CREATE TABLE IF NOT EXISTS practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 100),
  description TEXT CHECK (char_length(description) <= 2000),
  visibility TEXT NOT NULL DEFAULT 'private'
    CHECK (visibility IN ('private', 'link', 'public')),
  script JSONB NOT NULL,
  schema_version INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_practices_owner_id ON practices(owner_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_practices_public ON practices(created_at DESC) WHERE visibility = 'public';

CREATE OR REPLACE FUNCTION set_practices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS practices_set_updated_at ON practices;
CREATE TRIGGER practices_set_updated_at
  BEFORE UPDATE ON practices
  FOR EACH ROW EXECUTE FUNCTION set_practices_updated_at();

ALTER TABLE practices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can read own practices" ON practices;
CREATE POLICY "Owners can read own practices"
  ON practices FOR SELECT
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can insert own practices" ON practices;
CREATE POLICY "Owners can insert own practices"
  ON practices FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can update own practices" ON practices;
CREATE POLICY "Owners can update own practices"
  ON practices FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners can delete own practices" ON practices;
CREATE POLICY "Owners can delete own practices"
  ON practices FOR DELETE
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Link and public practices readable by anyone" ON practices;
CREATE POLICY "Link and public practices readable by anyone"
  ON practices FOR SELECT
  USING (visibility IN ('link', 'public'));
