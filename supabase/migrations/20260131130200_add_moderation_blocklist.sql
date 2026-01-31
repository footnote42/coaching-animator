-- Migration: Add moderation blocklist table
-- Created: 2026-01-31
-- Description: Move hardcoded blocklist to database for admin management

-- Create moderation_blocklist table
CREATE TABLE IF NOT EXISTS moderation_blocklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL UNIQUE,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_moderation_blocklist_word ON moderation_blocklist(word) WHERE is_active = TRUE;

-- Add RLS policies (only admins can manage blocklist)
ALTER TABLE moderation_blocklist ENABLE ROW LEVEL SECURITY;

-- Admins can read all words
DROP POLICY IF EXISTS "Admins can read all blocklist words" ON moderation_blocklist;
CREATE POLICY "Admins can read all blocklist words"
  ON moderation_blocklist
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Admins can insert new words
DROP POLICY IF EXISTS "Admins can insert blocklist words" ON moderation_blocklist;
CREATE POLICY "Admins can insert blocklist words"
  ON moderation_blocklist
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Admins can update words
DROP POLICY IF EXISTS "Admins can update blocklist words" ON moderation_blocklist;
CREATE POLICY "Admins can update blocklist words"
  ON moderation_blocklist
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Admins can delete words
DROP POLICY IF EXISTS "Admins can delete blocklist words" ON moderation_blocklist;
CREATE POLICY "Admins can delete blocklist words"
  ON moderation_blocklist
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Seed with initial blocklist words
INSERT INTO moderation_blocklist (word, severity) VALUES
  ('fuck', 'high'),
  ('shit', 'medium'),
  ('ass', 'low'),
  ('bitch', 'high'),
  ('damn', 'low'),
  ('crap', 'low'),
  ('piss', 'low'),
  ('dick', 'medium'),
  ('cock', 'high'),
  ('pussy', 'high'),
  ('asshole', 'high'),
  ('bastard', 'medium'),
  ('slut', 'high'),
  ('whore', 'high'),
  ('nigger', 'high'),
  ('faggot', 'high'),
  ('retard', 'high'),
  ('cunt', 'high')
ON CONFLICT (word) DO NOTHING;
