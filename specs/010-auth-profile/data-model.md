# Data Model: Auth & Profile (Phase 2g)

**Branch**: `010-auth-profile` | **Date**: 2026-04-27

---

## Summary

No schema changes. The `user_profiles` table already contains all columns needed for this feature. This document records the existing data model as reference for implementation.

---

## `user_profiles` Table (existing)

All columns used by the profile page are already present. No migration required.

```sql
CREATE TABLE user_profiles (
  id                   UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name         TEXT CHECK (char_length(display_name) <= 50),
  club_name            TEXT CHECK (char_length(club_name) <= 100),
  primary_strip_color  TEXT CHECK (primary_strip_color ~ '^#[0-9A-Fa-f]{6}$'),
  secondary_strip_color TEXT CHECK (secondary_strip_color ~ '^#[0-9A-Fa-f]{6}$'),
  club_badge_url       TEXT,
  animation_count      INTEGER DEFAULT 0,
  max_animations       INTEGER DEFAULT 50,
  role                 TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  banned_at            TIMESTAMPTZ,
  ban_reason           TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);
```

**Row creation**: A trigger (`handle_new_user`) auto-inserts a `user_profiles` row on every `auth.users` insert. Every authenticated user is guaranteed a profile row.

---

## TypeScript Interface (existing — `UserContext.tsx`)

```typescript
interface UserProfile {
  id: string;
  display_name: string | null;   // Coach's chosen name — editable in profile page
  club_name: string | null;      // Club identity — editable in profile page
  primary_strip_color: string | null;
  secondary_strip_color: string | null;
  club_badge_url: string | null;
  animation_count: number;
  max_animations: number;
  role: 'user' | 'admin';
}
```

---

## Profile Page Data Flow

```
UserContext (global)
  └─ profile: UserProfile | null
       │
       ├─ display_name → local state [displayName]  → PUT /api/user/profile
       ├─ club_name    → local state [clubName]      → PUT /api/user/profile
       ├─ primary_strip_color  → local state         → PUT /api/user/profile
       ├─ secondary_strip_color → local state        → PUT /api/user/profile
       └─ club_badge_url → local state               → Supabase Storage upload
                                                        → PUT /api/user/profile (URL)
```

---

## Fields Used in Coach Identity Card (redesign)

| Field | Source | Display Role |
|-------|--------|-------------|
| `display_name` | `profile.display_name` | Primary heading (Oswald, large) |
| `club_name` | `profile.club_name` | Subtitle / tagline below name |
| OAuth avatar | `user.user_metadata.avatar_url` | Profile avatar image |
| Email initials | `user.email` | Initials fallback if no avatar |

---

## `region` — Deferred

`region` is not a column in `user_profiles` and is not added in Phase 2g. `club_name` provides sufficient coaching context. See `research.md` for rationale.
