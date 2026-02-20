-- Phase 2: Progressions + Remix Genealogy
-- 5 new columns on saved_animations + triggers + constraints

ALTER TABLE saved_animations
  ADD COLUMN parent_animation_id UUID REFERENCES saved_animations(id) ON DELETE CASCADE,
  ADD COLUMN progression_order INTEGER DEFAULT 0,
  ADD COLUMN is_progression BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN progression_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN remixed_from_id UUID REFERENCES saved_animations(id) ON DELETE SET NULL,
  ADD COLUMN remix_count INTEGER NOT NULL DEFAULT 0;

-- progression_order must be 0-5 (0 = base, 1-5 = progression slots)
ALTER TABLE saved_animations
  ADD CONSTRAINT chk_progression_order CHECK (progression_order BETWEEN 0 AND 5);

-- INTEGRITY: parent_animation_id may only point to a base animation (not another progression)
-- Enforced via trigger (can't use CHECK with subquery in Postgres)
CREATE OR REPLACE FUNCTION check_parent_is_base()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_animation_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM saved_animations
      WHERE id = NEW.parent_animation_id AND is_progression = TRUE
    ) THEN
      RAISE EXCEPTION 'parent_animation_id must reference a base animation (is_progression = false)';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_parent_is_base
  BEFORE INSERT OR UPDATE ON saved_animations
  FOR EACH ROW EXECUTE FUNCTION check_parent_is_base();

-- INTEGRITY: prevent self-referential remix (animation cannot remix itself)
CREATE OR REPLACE FUNCTION check_no_self_remix()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.remixed_from_id IS NOT NULL AND NEW.remixed_from_id = NEW.id THEN
    RAISE EXCEPTION 'An animation cannot be remixed from itself';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_no_self_remix
  BEFORE INSERT OR UPDATE ON saved_animations
  FOR EACH ROW EXECUTE FUNCTION check_no_self_remix();

-- DENORMALIZED COUNTER: increment progression_count on parent when a progression is created
CREATE OR REPLACE FUNCTION increment_progression_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_animation_id IS NOT NULL AND NEW.is_progression = TRUE THEN
    UPDATE saved_animations
    SET progression_count = progression_count + 1
    WHERE id = NEW.parent_animation_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_progression_count_inc
  AFTER INSERT ON saved_animations
  FOR EACH ROW EXECUTE FUNCTION increment_progression_count();

CREATE OR REPLACE FUNCTION decrement_progression_count()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.parent_animation_id IS NOT NULL AND OLD.is_progression = TRUE THEN
    UPDATE saved_animations
    SET progression_count = GREATEST(progression_count - 1, 0)
    WHERE id = OLD.parent_animation_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_progression_count_dec
  AFTER DELETE ON saved_animations
  FOR EACH ROW EXECUTE FUNCTION decrement_progression_count();

-- DENORMALIZED COUNTER: increment remix_count on original when a remix is created
CREATE OR REPLACE FUNCTION increment_remix_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.remixed_from_id IS NOT NULL THEN
    UPDATE saved_animations
    SET remix_count = remix_count + 1
    WHERE id = NEW.remixed_from_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_remix_count_inc
  AFTER INSERT ON saved_animations
  FOR EACH ROW EXECUTE FUNCTION increment_remix_count();

CREATE OR REPLACE FUNCTION decrement_remix_count()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.remixed_from_id IS NOT NULL THEN
    UPDATE saved_animations
    SET remix_count = GREATEST(remix_count - 1, 0)
    WHERE id = OLD.remixed_from_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_remix_count_dec
  AFTER DELETE ON saved_animations
  FOR EACH ROW EXECUTE FUNCTION decrement_remix_count();

-- INDEXES for FK lookups
CREATE INDEX idx_progressions_parent ON saved_animations(parent_animation_id)
  WHERE parent_animation_id IS NOT NULL;

CREATE INDEX idx_remixed_from ON saved_animations(remixed_from_id)
  WHERE remixed_from_id IS NOT NULL;
