-- Migration: Add club_badge_url column to user_profiles
-- Description: Club badge image URL for PRD §5.6 Club Branding (F-PERS-05)
-- Created: 2026-02-25

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS club_badge_url TEXT;

COMMENT ON COLUMN user_profiles.club_badge_url IS 'URL of club badge image stored in Supabase Storage (club-badges bucket)';
