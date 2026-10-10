-- V2.0 Phase 1: Collections + Video URL
-- Creates collections and collection_items tables
-- Adds video_url column to saved_animations

-- ============================================================================
-- Collections Table
-- ============================================================================
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  description TEXT CHECK (description IS NULL OR char_length(description) <= 1000),
  visibility TEXT CHECK (visibility IN ('private', 'public')) DEFAULT 'public' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for user's collections
CREATE INDEX idx_collections_user_id ON collections(user_id);

-- Index for public collections
CREATE INDEX idx_collections_visibility ON collections(visibility) WHERE visibility = 'public';

-- ============================================================================
-- Collection Items Table
-- ============================================================================
CREATE TABLE collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  animation_id UUID NOT NULL REFERENCES saved_animations(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(collection_id, animation_id)
);

-- Index for collection's items
CREATE INDEX idx_collection_items_collection_id ON collection_items(collection_id);

-- Index for animation's collections
CREATE INDEX idx_collection_items_animation_id ON collection_items(animation_id);

-- ============================================================================
-- Video URL Column
-- ============================================================================
ALTER TABLE saved_animations ADD COLUMN
  video_url TEXT CHECK (
    video_url IS NULL OR
    video_url ~ '^https://(www\.)?(youtube\.com/watch\?v=|youtu\.be/)[A-Za-z0-9_-]{11}'
  );

-- ============================================================================
-- RLS Policies - Collections
-- ============================================================================

-- Enable RLS
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;

-- Collections: Public read for public collections
CREATE POLICY "collections_public_read"
  ON collections
  FOR SELECT
  USING (visibility = 'public');

-- Collections: Owner read for private collections
CREATE POLICY "collections_owner_read"
  ON collections
  FOR SELECT
  USING (auth.uid() = user_id);

-- Collections: Owner-only write (insert, update, delete)
CREATE POLICY "collections_owner_write"
  ON collections
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- RLS Policies - Collection Items
-- ============================================================================

-- Collection items: Read if collection is readable
CREATE POLICY "collection_items_read"
  ON collection_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_items.collection_id
        AND (collections.visibility = 'public' OR collections.user_id = auth.uid())
    )
  );

-- Collection items: Owner-only write (via collection ownership)
CREATE POLICY "collection_items_write"
  ON collection_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_items.collection_id
        AND collections.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM collections
      WHERE collections.id = collection_items.collection_id
        AND collections.user_id = auth.uid()
    )
  );

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON TABLE collections IS 'User-created collections of animations (v2.0)';
COMMENT ON TABLE collection_items IS 'Junction table linking animations to collections';
COMMENT ON COLUMN saved_animations.video_url IS 'Optional YouTube tutorial video URL (v2.0)';
