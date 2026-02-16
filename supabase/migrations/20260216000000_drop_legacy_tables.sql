-- Migration: Drop legacy tables (shares, follows)
-- Description: Remove unused shares and follows tables per v2.0 cleanup
-- Created: 2026-02-16
-- Ticket: T009

-- =============================================================================
-- DROP LEGACY TABLES
-- =============================================================================

-- Drop shares table (deprecated in favor of saved_animations link_shared visibility)
DROP TABLE IF EXISTS shares CASCADE;

-- Drop follows table (no UI, Phase 2 foundation was never used)
DROP TABLE IF EXISTS follows CASCADE;
