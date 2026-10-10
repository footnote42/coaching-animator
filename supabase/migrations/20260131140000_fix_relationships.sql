-- Migration: Fix relationships for PostgREST joins
-- Created: 2026-01-31
-- Description: Add explicit Foreign Key from saved_animations.user_id to user_profiles.id
-- This allows PostgREST to detect the relationship for joins.

DO $$
BEGIN
    -- Check if the constraint already exists to be idempotent
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'saved_animations_user_id_fkey_profiles') THEN
        ALTER TABLE saved_animations
        ADD CONSTRAINT saved_animations_user_id_fkey_profiles
        FOREIGN KEY (user_id) REFERENCES user_profiles(id)
        ON DELETE CASCADE;
    END IF;
END $$;
