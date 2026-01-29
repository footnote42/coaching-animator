-- Migration: 001_online_platform
-- Description: Create tables for online platform features
-- Created: 2026-01-29

-- =============================================================================
-- 1. USER_PROFILES TABLE
-- =============================================================================

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  animation_count INTEGER DEFAULT 0,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  banned_at TIMESTAMPTZ,
  ban_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Constraints
ALTER TABLE user_profiles
  ADD CONSTRAINT display_name_length CHECK (char_length(display_name) <= 50);

-- Indexes
CREATE INDEX idx_user_profiles_role ON user_profiles(role);

-- Trigger: Auto-create profile on auth.users insert
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================================================
-- 2. SAVED_ANIMATIONS TABLE
-- =============================================================================

CREATE TABLE saved_animations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  coaching_notes TEXT,
  animation_type TEXT NOT NULL DEFAULT 'tactic' 
    CHECK (animation_type IN ('tactic', 'skill', 'game', 'other')),
  tags TEXT[] DEFAULT '{}',
  payload JSONB NOT NULL,
  duration_ms INTEGER NOT NULL,
  frame_count INTEGER NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'private' 
    CHECK (visibility IN ('private', 'link_shared', 'public')),
  upvote_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  hidden_at TIMESTAMPTZ,
  hidden_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Constraints
ALTER TABLE saved_animations
  ADD CONSTRAINT title_length CHECK (char_length(title) BETWEEN 1 AND 100),
  ADD CONSTRAINT description_length CHECK (char_length(description) <= 2000),
  ADD CONSTRAINT coaching_notes_length CHECK (char_length(coaching_notes) <= 5000),
  ADD CONSTRAINT tags_count CHECK (array_length(tags, 1) <= 10 OR tags = '{}'),
  ADD CONSTRAINT duration_limit CHECK (duration_ms <= 60000),
  ADD CONSTRAINT frame_count_limit CHECK (frame_count <= 50);

-- Indexes
CREATE INDEX idx_animations_user_id ON saved_animations(user_id);
CREATE INDEX idx_animations_visibility ON saved_animations(visibility) WHERE visibility = 'public';
CREATE INDEX idx_animations_created_at ON saved_animations(created_at DESC);
CREATE INDEX idx_animations_upvote_count ON saved_animations(upvote_count DESC) WHERE visibility = 'public';
CREATE INDEX idx_animations_tags ON saved_animations USING GIN(tags);

-- Full-text search index
CREATE INDEX idx_animations_search ON saved_animations 
  USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Trigger: Update animation_count in user_profiles
CREATE OR REPLACE FUNCTION update_animation_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE user_profiles SET animation_count = animation_count + 1 WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE user_profiles SET animation_count = animation_count - 1 WHERE id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_animation_change
  AFTER INSERT OR DELETE ON saved_animations
  FOR EACH ROW EXECUTE FUNCTION update_animation_count();

-- =============================================================================
-- 3. UPVOTES TABLE
-- =============================================================================

CREATE TABLE upvotes (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  animation_id UUID NOT NULL REFERENCES saved_animations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, animation_id)
);

-- Index for "my upvoted animations" query
CREATE INDEX idx_upvotes_user_id ON upvotes(user_id);

-- Trigger: Update denormalized upvote_count
CREATE OR REPLACE FUNCTION update_upvote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE saved_animations SET upvote_count = upvote_count + 1 WHERE id = NEW.animation_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE saved_animations SET upvote_count = upvote_count - 1 WHERE id = OLD.animation_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_upvote_change
  AFTER INSERT OR DELETE ON upvotes
  FOR EACH ROW EXECUTE FUNCTION update_upvote_count();

-- =============================================================================
-- 4. CONTENT_REPORTS TABLE
-- =============================================================================

CREATE TABLE content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animation_id UUID NOT NULL REFERENCES saved_animations(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('inappropriate', 'spam', 'copyright', 'other')),
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  action_taken TEXT CHECK (action_taken IN ('none', 'hidden', 'deleted', 'user_warned', 'user_banned')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Constraints
ALTER TABLE content_reports
  ADD CONSTRAINT details_length CHECK (char_length(details) <= 500);

-- Indexes
CREATE INDEX idx_reports_status ON content_reports(status) WHERE status = 'pending';
CREATE INDEX idx_reports_animation_id ON content_reports(animation_id);

-- Prevent duplicate reports from same user
CREATE UNIQUE INDEX idx_reports_unique_per_user 
  ON content_reports(animation_id, reporter_id) 
  WHERE status = 'pending';

-- =============================================================================
-- 5. FOLLOWS TABLE (Phase 2 Foundation - No UI)
-- =============================================================================

CREATE TABLE follows (
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  followed_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, followed_id),
  CHECK (follower_id != followed_id)
);

-- Indexes
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_followed ON follows(followed_id);

-- =============================================================================
-- 6. RATE_LIMITS TABLE
-- =============================================================================

CREATE TABLE rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW()
);

-- Cleanup function (can be called via pg_cron or scheduled)
CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- user_profiles RLS
-- -----------------------------------------------------------------------------

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile (except role, banned fields)
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Public can read display names (for author attribution)
CREATE POLICY "Public can read display names"
  ON user_profiles FOR SELECT
  USING (true);

-- -----------------------------------------------------------------------------
-- saved_animations RLS
-- -----------------------------------------------------------------------------

ALTER TABLE saved_animations ENABLE ROW LEVEL SECURITY;

-- Owners can CRUD their own animations
CREATE POLICY "Owners can manage own animations"
  ON saved_animations FOR ALL
  USING (auth.uid() = user_id);

-- Public can read public animations (not hidden)
CREATE POLICY "Public can read public animations"
  ON saved_animations FOR SELECT
  USING (visibility = 'public' AND hidden_at IS NULL);

-- Anyone with link can read link_shared animations (not hidden)
CREATE POLICY "Link-shared readable by anyone"
  ON saved_animations FOR SELECT
  USING (visibility = 'link_shared' AND hidden_at IS NULL);

-- Admins can read all
CREATE POLICY "Admins can read all"
  ON saved_animations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- -----------------------------------------------------------------------------
-- upvotes RLS
-- -----------------------------------------------------------------------------

ALTER TABLE upvotes ENABLE ROW LEVEL SECURITY;

-- Users can manage their own upvotes
CREATE POLICY "Users can manage own upvotes"
  ON upvotes FOR ALL
  USING (auth.uid() = user_id);

-- Anyone can read upvotes (for counts)
CREATE POLICY "Public can read upvotes"
  ON upvotes FOR SELECT
  USING (true);

-- -----------------------------------------------------------------------------
-- content_reports RLS
-- -----------------------------------------------------------------------------

ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;

-- Users can create reports
CREATE POLICY "Users can create reports"
  ON content_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Users can read their own reports
CREATE POLICY "Users can read own reports"
  ON content_reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- Admins can manage all reports
CREATE POLICY "Admins can manage reports"
  ON content_reports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- -----------------------------------------------------------------------------
-- follows RLS
-- -----------------------------------------------------------------------------

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Users can manage their own follows
CREATE POLICY "Users can manage own follows"
  ON follows FOR ALL
  USING (auth.uid() = follower_id);

-- Public can read follow relationships
CREATE POLICY "Public can read follows"
  ON follows FOR SELECT
  USING (true);

-- -----------------------------------------------------------------------------
-- rate_limits RLS (service role only - no public access)
-- -----------------------------------------------------------------------------

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- No public policies - accessed only via service role
