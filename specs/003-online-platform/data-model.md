# Data Model: Online Platform

**Feature Branch**: `003-online-platform`  
**Created**: 2026-01-29

## Overview

Database schema design for user accounts, cloud storage, social features, and content moderation. All tables use Supabase PostgreSQL with Row Level Security (RLS).

---

## Entity Relationship Diagram

```
┌─────────────────┐     ┌─────────────────────┐     ┌─────────────────┐
│   auth.users    │────<│   user_profiles     │     │   upvotes       │
│   (Supabase)    │     │                     │     │                 │
└─────────────────┘     └─────────────────────┘     └─────────────────┘
         │                       │                          │
         │                       │                          │
         ▼                       ▼                          │
┌─────────────────────────────────────────┐                 │
│           saved_animations              │<────────────────┘
│                                         │
└─────────────────────────────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│ content_reports │     │    follows      │
│                 │     │  (Phase 2)      │
└─────────────────┘     └─────────────────┘
```

---

## Tables

### 1. user_profiles

Extends Supabase `auth.users` with application-specific data.

```sql
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
```

**TypeScript Interface**:
```typescript
interface UserProfile {
  id: string;                    // UUID, references auth.users.id
  display_name: string | null;   // Optional, max 50 chars
  animation_count: number;       // Denormalized quota counter
  role: 'user' | 'admin';
  banned_at: string | null;      // ISO 8601 if banned
  ban_reason: string | null;
  created_at: string;            // ISO 8601
  updated_at: string;            // ISO 8601
}
```

---

### 2. saved_animations

User-owned animations with metadata and payload.

```sql
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
  hidden_at TIMESTAMPTZ,         -- Set by moderation
  hidden_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Constraints
ALTER TABLE saved_animations
  ADD CONSTRAINT title_length CHECK (char_length(title) BETWEEN 1 AND 100),
  ADD CONSTRAINT description_length CHECK (char_length(description) <= 2000),
  ADD CONSTRAINT coaching_notes_length CHECK (char_length(coaching_notes) <= 5000),
  ADD CONSTRAINT tags_count CHECK (array_length(tags, 1) <= 10),
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
```

**TypeScript Interface**:
```typescript
interface SavedAnimation {
  id: string;                           // UUID
  user_id: string;                      // References auth.users.id
  title: string;                        // 1-100 chars
  description: string | null;           // Max 2000 chars
  coaching_notes: string | null;        // Max 5000 chars
  animation_type: 'tactic' | 'skill' | 'game' | 'other';
  tags: string[];                       // Max 10 tags
  payload: ProjectPayload;              // Full animation data (JSONB)
  duration_ms: number;                  // Max 60000 (60s)
  frame_count: number;                  // Max 50
  visibility: 'private' | 'link_shared' | 'public';
  upvote_count: number;                 // Denormalized
  view_count: number;                   // Analytics
  hidden_at: string | null;             // Set by moderation
  hidden_reason: string | null;
  created_at: string;                   // ISO 8601
  updated_at: string;                   // ISO 8601
}

// Reuse existing Project type for payload
type ProjectPayload = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;
```

---

### 3. upvotes

Junction table for user-animation upvote relationships.

```sql
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
```

**TypeScript Interface**:
```typescript
interface Upvote {
  user_id: string;      // References auth.users.id
  animation_id: string; // References saved_animations.id
  created_at: string;   // ISO 8601
}
```

---

### 4. content_reports

Moderation queue for reported animations.

```sql
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
```

**TypeScript Interface**:
```typescript
interface ContentReport {
  id: string;                                      // UUID
  animation_id: string;                            // References saved_animations.id
  reporter_id: string;                             // References auth.users.id
  reason: 'inappropriate' | 'spam' | 'copyright' | 'other';
  details: string | null;                          // Max 500 chars
  status: 'pending' | 'reviewed' | 'dismissed';
  reviewed_by: string | null;                      // Admin user ID
  reviewed_at: string | null;                      // ISO 8601
  action_taken: 'none' | 'hidden' | 'deleted' | 'user_warned' | 'user_banned' | null;
  created_at: string;                              // ISO 8601
}
```

---

### 5. follows (Phase 2 Foundation)

Follower relationships between users. UI deferred to Phase 2.

```sql
CREATE TABLE follows (
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  followed_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, followed_id),
  CHECK (follower_id != followed_id)  -- Can't follow yourself
);

-- Indexes
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_followed ON follows(followed_id);
```

**TypeScript Interface**:
```typescript
interface Follow {
  follower_id: string;  // User who follows
  followed_id: string;  // User being followed
  created_at: string;   // ISO 8601
}
```

---

### 6. rate_limits (Optional - for persistent rate limiting)

```sql
CREATE TABLE rate_limits (
  key TEXT PRIMARY KEY,           -- Format: "ip:{ip}:endpoint" or "user:{id}:endpoint"
  count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW()
);

-- Cleanup function (run via pg_cron or scheduled function)
CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;
```

---

## Row Level Security (RLS) Policies

### user_profiles

```sql
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

-- Public can read display_name for public animations
CREATE POLICY "Public can read display names"
  ON user_profiles FOR SELECT
  USING (true);  -- Filtered in queries to only return display_name
```

### saved_animations

```sql
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
```

### upvotes

```sql
ALTER TABLE upvotes ENABLE ROW LEVEL SECURITY;

-- Users can manage their own upvotes
CREATE POLICY "Users can manage own upvotes"
  ON upvotes FOR ALL
  USING (auth.uid() = user_id);

-- Anyone can read upvote counts (via aggregation)
CREATE POLICY "Public can read upvotes"
  ON upvotes FOR SELECT
  USING (true);
```

### content_reports

```sql
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;

-- Users can create reports
CREATE POLICY "Users can create reports"
  ON content_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Users can read their own reports
CREATE POLICY "Users can read own reports"
  ON content_reports FOR SELECT
  USING (auth.uid() = reporter_id);

-- Admins can read and update all reports
CREATE POLICY "Admins can manage reports"
  ON content_reports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

## Quota Enforcement

### Animation Count Trigger

```sql
-- Update animation_count when animations are created/deleted
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
```

### Quota Check (Application Level)

```typescript
// lib/quota.ts
const MAX_ANIMATIONS_PER_USER = 50;

export async function checkQuota(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('user_profiles')
    .select('animation_count')
    .eq('id', userId)
    .single();
  
  return (data?.animation_count ?? 0) < MAX_ANIMATIONS_PER_USER;
}
```

---

## Migration Strategy

**Order of table creation**:
1. `user_profiles` (depends on auth.users)
2. `saved_animations` (depends on auth.users)
3. `upvotes` (depends on auth.users, saved_animations)
4. `content_reports` (depends on auth.users, saved_animations)
5. `follows` (depends on auth.users)
6. `rate_limits` (standalone)

**Migration file**: `supabase/migrations/001_online_platform.sql`
