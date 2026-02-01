-- Migration: Add max_animations column to user_profiles
-- Description: Add quota limit column that was missing from initial schema
-- Created: 2026-02-01

-- Add max_animations column with default value of 50
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS max_animations INTEGER DEFAULT 50 NOT NULL;

-- Update existing rows to have the default value
UPDATE user_profiles
SET max_animations = 50
WHERE max_animations IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.max_animations IS 'Maximum number of animations a user can save (quota limit)';
