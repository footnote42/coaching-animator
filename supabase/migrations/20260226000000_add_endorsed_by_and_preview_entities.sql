-- Migration: add endorsed_by and preview_entities to saved_animations
-- Feature: 009-gallery-playbook
-- Date: 2026-04-26

ALTER TABLE saved_animations
  ADD COLUMN endorsed_by TEXT DEFAULT NULL,
  ADD COLUMN preview_entities JSONB DEFAULT NULL;

-- Backfill: extract first-frame player entities (players only, LIMIT 15)
UPDATE saved_animations
SET preview_entities = (
  SELECT jsonb_agg(
    jsonb_build_object('x', elem->>'x', 'y', elem->>'y', 'team', elem->>'team')
  )
  FROM (
    SELECT value AS elem
    FROM jsonb_each((payload->'frames'->0->'entities'))
    WHERE value->>'type' = 'player'
    LIMIT 15
  ) subq
)
WHERE preview_entities IS NULL
  AND payload IS NOT NULL
  AND jsonb_array_length(payload->'frames') > 0;
