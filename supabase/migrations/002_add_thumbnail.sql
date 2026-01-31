-- Migration: 002_add_thumbnail
-- Description: Add thumbnail_url column to saved_animations for gallery previews
-- Created: 2026-01-30

-- =============================================================================
-- ADD THUMBNAIL_URL COLUMN
-- =============================================================================

ALTER TABLE saved_animations 
ADD COLUMN thumbnail_url TEXT;

-- Constraint: Ensure URL is reasonable length if provided
ALTER TABLE saved_animations
ADD CONSTRAINT thumbnail_url_length CHECK (char_length(thumbnail_url) <= 500);

-- Index for queries that filter by having a thumbnail
CREATE INDEX idx_animations_has_thumbnail ON saved_animations(thumbnail_url) 
WHERE thumbnail_url IS NOT NULL;

-- =============================================================================
-- COMMENT
-- =============================================================================

COMMENT ON COLUMN saved_animations.thumbnail_url IS 
'URL to thumbnail image (PNG) stored in Supabase Storage. Generated from first frame on save.';
