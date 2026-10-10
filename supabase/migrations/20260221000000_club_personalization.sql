-- Migration: Add club personalization columns to user_profiles
-- Description: Club name and strip colors for PRD §5.6 Club Branding
-- Created: 2026-02-21

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS club_name TEXT CHECK (char_length(club_name) <= 100),
ADD COLUMN IF NOT EXISTS primary_strip_color TEXT CHECK (primary_strip_color ~ '^#[0-9A-Fa-f]{6}$'),
ADD COLUMN IF NOT EXISTS secondary_strip_color TEXT CHECK (secondary_strip_color ~ '^#[0-9A-Fa-f]{6}$');

COMMENT ON COLUMN user_profiles.club_name IS 'User club name for branding';
COMMENT ON COLUMN user_profiles.primary_strip_color IS 'Hex color for attack player defaults';
COMMENT ON COLUMN user_profiles.secondary_strip_color IS 'Hex color for defense player defaults';
