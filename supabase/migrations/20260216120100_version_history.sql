-- V2.0 Phase 1: Animation Version History
-- Creates animation_versions table with auto-cleanup trigger
-- Adds current_version column to saved_animations

-- ============================================================================
-- Animation Versions Table
-- ============================================================================
CREATE TABLE animation_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animation_id UUID NOT NULL REFERENCES saved_animations(id) ON DELETE CASCADE,
  version_number TEXT NOT NULL,
  major_version INTEGER NOT NULL CHECK (major_version >= 1),
  minor_version INTEGER NOT NULL CHECK (minor_version >= 0),
  payload JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(animation_id, version_number)
);

-- Index for version lookup
CREATE INDEX idx_animation_versions_animation_id ON animation_versions(animation_id, created_at DESC);

-- ============================================================================
-- Current Version Column
-- ============================================================================
ALTER TABLE saved_animations ADD COLUMN current_version TEXT DEFAULT '1.0' NOT NULL;

-- ============================================================================
-- Auto-Cleanup Trigger Function
-- ============================================================================
-- Keeps only the latest version + 3 previous versions (4 total per animation)
CREATE OR REPLACE FUNCTION cleanup_old_versions()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete versions beyond the latest 4 for this animation
  DELETE FROM animation_versions
  WHERE animation_id = NEW.animation_id
    AND id NOT IN (
      SELECT id
      FROM animation_versions
      WHERE animation_id = NEW.animation_id
      ORDER BY created_at DESC
      LIMIT 4
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger fires after each INSERT
CREATE TRIGGER trigger_cleanup_old_versions
  AFTER INSERT ON animation_versions
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_old_versions();

-- ============================================================================
-- RLS Policies - Animation Versions
-- ============================================================================

-- Enable RLS
ALTER TABLE animation_versions ENABLE ROW LEVEL SECURITY;

-- Versions: Owner-only read (via animation ownership)
CREATE POLICY "animation_versions_owner_read"
  ON animation_versions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM saved_animations
      WHERE saved_animations.id = animation_versions.animation_id
        AND saved_animations.user_id = auth.uid()
    )
  );

-- Versions: Owner-only write (via animation ownership)
CREATE POLICY "animation_versions_owner_write"
  ON animation_versions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM saved_animations
      WHERE saved_animations.id = animation_versions.animation_id
        AND saved_animations.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM saved_animations
      WHERE saved_animations.id = animation_versions.animation_id
        AND saved_animations.user_id = auth.uid()
    )
  );

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON TABLE animation_versions IS 'Version history for animations (v2.0). Auto-cleanup keeps latest + 3 previous versions.';
COMMENT ON COLUMN saved_animations.current_version IS 'Current semantic version (e.g., "1.0", "2.3")';
COMMENT ON FUNCTION cleanup_old_versions() IS 'Automatically deletes old versions, keeping only latest 4 per animation';
