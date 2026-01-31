-- Migration: 002_add_thumbnail
-- Description: Add thumbnail_url column to saved_animations for gallery previews
-- Created: 2026-01-30

-- =============================================================================
-- ADD THUMBNAIL_URL COLUMN
-- =============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='saved_animations' AND column_name='thumbnail_url') THEN
        ALTER TABLE saved_animations ADD COLUMN thumbnail_url TEXT;
    END IF;
END $$;

-- Constraint: Ensure URL is reasonable length if provided
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'thumbnail_url_length') THEN
        ALTER TABLE saved_animations ADD CONSTRAINT thumbnail_url_length CHECK (char_length(thumbnail_url) <= 500);
    END IF;
END $$;

-- Index for queries that filter by having a thumbnail
CREATE INDEX IF NOT EXISTS idx_animations_has_thumbnail ON saved_animations(thumbnail_url) 
WHERE thumbnail_url IS NOT NULL;

-- =============================================================================
-- COMMENT
-- =============================================================================

COMMENT ON COLUMN saved_animations.thumbnail_url IS 
'URL to thumbnail image (PNG) stored in Supabase Storage. Generated from first frame on save.';
