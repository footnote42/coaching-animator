# Product Requirements Document: Coaching Animator v2.0

## From Personal Tool to Rugby Coaching Platform

**Version:** 2.0
**Date:** 11 February 2026
**Author:** Wayne Ellis
**Status:** Draft

---

## 1. Executive Summary

### 1.1 Evolution from v1.0 to v2.0

Coaching Animator v1.0 successfully launched as a cloud-enabled personal animation tool with user accounts, galleries, and basic social features (89% PRD coverage against original specification). User feedback from grassroots coaches and partnership discussions with Hampshire Rugby Football Union (RFU) revealed critical gaps between the personal-tool model and the needs of rugby coaching organizations.

**v1.0 Achievement Summary:**
- ✅ Next.js App Router with PWA capabilities
- ✅ Supabase authentication (email/password + OAuth)
- ✅ Cloud storage with personal galleries
- ✅ Public gallery with upvoting
- ✅ Link sharing and replay viewer
- ✅ Content moderation and admin dashboard
- ✅ 89% PRD coverage with 2 P1, 3 P2 gaps remaining

**v2.0 Mission Statement:**

Transform Coaching Animator from a personal animation tool into a **rugby coaching platform** that supports:
1. **Pedagogical progressions** - base drills with progressive variations
2. **Organizational content curation** - Hampshire RFU and clubs endorse quality content
3. **Mobile-optimized replay** - WhatsApp-based sharing to players on mobile devices
4. **Version control** - iterate on drills without starting from scratch
5. **Template library** - starting positions for common formations
6. **Club personalization** - badges and strip colors for branding

### 1.2 Key Changes in v2.0

**New Features:**
- ✅ **Animation Progressions** - Base drill + up to 5 progressive variations
- ✅ **Organizational Accounts** - Hampshire RFU and clubs with unlimited quota and endorsement rights
- ✅ **Curated Collections** - Batch endorsement of related animations
- ✅ **Full Version Control** - Auto-increment versions with latest + 3 archived
- ✅ **Remix Genealogy** - Track remix lineage across all versions
- ✅ **Template Library** - Gallery badge for starting positions
- ✅ **Club Personalization** - Badges, default strip colors, affiliation metadata
- ✅ **YouTube Video Links** - Coaching notes with video tutorial links
- ✅ **Mobile-First UX Architecture** - Bottom navigation, adaptive canvas, and touch-optimized controls

**Enhanced Features:**
- ✅ **Mobile Replay Optimization** - Responsive canvas, touch-friendly controls (keep basic editing with warning)
- ✅ **Rugby-First UI** - Hide soccer/American football (keep code via feature flag)

**Removed Features:**
- ❌ **Legacy Anonymous Shares Table** - Deprecated in favor of `saved_animations` with `link_shared` visibility
- ❌ **Follow System** - Deleted table, defer social graph to v3.0
- ❌ **Grid Overlay Toggle** - Rarely used, simplifies timeline controls
- ❌ **Marker Entity Type** - Auto-convert to cones on load

**Deferred to v3.0:**
- ⚠️ **AI Text-to-Animation** - Starting positions, full movement generation
- ⚠️ **Mobile Editor Optimization** - Touch UX improvements (basic functionality retained)

### 1.2.1 Architectural Regression: Offline Fallback Removal (Cloud-First Pivot)

**⚠️ IMPORTANT: v1.0 → v2.0 Architectural Change**

**What Changed:**
- **v1.0 (Cloud-optional)**: Animations saved to localStorage first, sync to cloud when online
- **v2.0 (Cloud-first)**: All persistence requires Supabase backend; localStorage used only for transient state

**Why This Changed:**
- Organizational tier (Tier 4) requires real-time collaboration and audit trails (impossible with eventual sync)
- Version control requires centralized history (can't merge conflicting offline edits)
- Hampshire RFU partnership requires reliable shared storage (not local-first)
- PRD v2.0 Section 1.2 explicitly removes "graceful degradation if Supabase down" from requirements

**User Impact - Migration Notice:**
| Scenario | v1.0 Behavior | v2.0 Behavior | User Action Required |
|----------|---------------|---------------|-----------------------|
| **Internet goes down while editing** | Animation saved locally, syncs when online | Animation not saved (unsaved indicator shown) | **User must save before going offline** |
| **Supabase outage during save** | Queued for sync when online | Fails with error message, animation lost if not exported | **User must export JSON before extended outages** |
| **No Supabase access expected** | Works offline indefinitely with local saves | Guest mode (10 frames) only, no cloud persistence | **Use guest mode for offline development** |

**Guest Mode Still Available (Tier 0):**
- ✅ **10-frame local editor UI** remains fully functional
- ✅ **JSON export/download** available without authentication
- ✅ **LocalStorage backup** of current project (for browser refresh)
- ❌ **Cloud storage** requires authentication
- ❌ **Gallery access** requires authentication

**Migration Communication Plan:**
1. **v2.0 Launch Notice**: "v2.0 requires internet for cloud features. Guest mode (10 frames) works offline."
2. **Autosave Alert**: Show banner if offline during edit: "Your changes won't be saved. Check your connection or export as JSON."
3. **Periodic Reminders**: "Cloud-first architecture enables real-time collaboration and version history."
4. **Offline Export**: Provide prominent "Export as JSON" button in guest mode.

**Constitutional Alignment Check:**
- ✅ **Section V.1 Guest Mode (Tier 0)**: "Local editor UI with no cloud persistence" - V2.0 maintains this
- ✅ **Section VI.1 Accessibility**: Free tier (guest mode) still provides "genuine value" (10-frame animations)
- ⚠️ **Section VI.2 Coach Advocacy**: Users losing localStorage backup may feel frustrated; mitigation needed

**Rationale for Accepting This Regression:**
- Organization partnerships outweigh offline convenience (strategic priority)
- Staging environment (Phase 0) provides testing for connectivity issues
- Health check monitoring (Section 11.4) reduces Supabase downtime impact
- Guest mode export (Tier 0) provides offline-first exit ramp for users

**Recommended Actions:**
1. Document this change prominently in release notes
2. Add "Export as backup" reminder in autosave messaging
3. Monitor offline error reports in first 2 weeks post-launch
4. Consider adding "retry with exponential backoff" for transient network errors
5. Plan "true offline mode" as v3.0 feature (with local conflict resolution)

### 1.3 Success Metrics

| Metric | v1.0 Baseline | v2.0 Target | Measurement |
|--------|---------------|-------------|-------------|
| **Coach Adoption** | 50 registered users | 500 users (10x) | User accounts created |
| **Hampshire RFU Content** | 0 endorsed animations | 50+ official drills | Org-owned animations |
| **Mobile Replay Usage** | 20% mobile views | 60% mobile views | Privacy-preserving viewport metrics (aggregated) |
| **Progression Sets** | 0 | 100+ published sets | Base animations with children |
| **Template Usage** | 0 | 30% of new animations start from templates | Remix from template tag |
| **Version Iteration** | 0 | 40% of animations have 2+ versions | Version count > 1 |

---

## 2. Problem Statement

### 2.1 v1.0 Gaps Identified

**User Feedback:**
1. **Mobile viewing is make-or-break** - "Replay feature on mobile is critical. I share via WhatsApp to players. Generation on touch screen is minor requirement, but viewing animation on mobile is essential."
2. **Pedagogical progressions missing** - "Animations need to be grouped into progressions. Base drill advances where players move differently or defender introduced. 3 progressions typical, could be more."
3. **Organizational sponsorship** - "Hampshire RFU wants to endorse animations and promote good practice. Alongside upvoting, option to highlight animations endorsed by constituent body."
4. **Version control gaps** - "Users want to edit creations without starting from scratch. Create, edit, publish, amend minor versions."
5. **Template library needed** - "AI text-to-animation deferred, but starting positions and template suggestions should be included as non-AI search/filter/template option."
6. **Sport focus shift** - "Focus on rugby only. Leave door open to other sports but primacy to rugby features."
7. **Personalization request** - "Users should personalize UI with club badges and set strip default colors to match club colors."

### 2.2 Hampshire RFU Partnership Opportunity

**Organizational Need:**
- Hampshire RFU coaches create official drill packages
- Need to distinguish endorsed content from community contributions
- Want to promote best practices with quality assurance
- Require unlimited animation quota (not constrained by 50-animation limit)
- Build features first, business model undefined (sponsorship potential)

### 2.3 User Persona Evolution

**Primary Persona (v1.0):** Amateur Rugby Coach
- Solo user creating animations for personal use
- Shares via download or link sharing
- 50-animation quota sufficient

**Primary Persona (v2.0):** Grassroots Rugby Coach (Enhanced)
- Creates drill progressions (base + 3-5 variations)
- Shares collections via WhatsApp to players on mobile
- Needs version control to iterate on drills
- Uses templates for common formations
- Personalizes with club branding

**New Persona (v2.0):** Organizational Coach (Hampshire RFU, Clubs)
- Creates endorsed content for constituent members
- Curates collections for different age groups/skill levels
- Requires unlimited quota for official content library
- Needs organizational branding (logo, colors)
- Manages team of content creators

**Tertiary Persona (v2.0):** Player (Mobile-Only User)
- Receives WhatsApp links from coach
- Views replays on mobile device (280px-800px viewport)
- Does not create content (read-only consumer)
- Needs touch-friendly playback controls

---

## 3. Goals & Success Metrics

### 3.1 Goals

| Priority | Goal | Success Criteria |
|----------|------|------------------|
| **P0** | Mobile replay optimization | 60% of replay views on mobile devices |
| **P0** | Animation progressions | 100+ published progression sets (base + variations) |
| **P0** | Organizational accounts | Hampshire RFU + 5 clubs with unlimited quota |
| **P0** | Version control | 40% of animations have 2+ versions |
| **P1** | Curated collections | 20+ collections with 5+ animations each |
| **P1** | Remix genealogy | Display full lineage for all remixes |
| **P1** | Template library | 30% of new animations start from templates |
| **P1** | Club personalization | 50+ users with club badges/colors |
| **P2** | YouTube video links | 20% of animations include video tutorial links |
| **P2** | Rugby-only focus | Hide soccer/American football from UI |

### 3.2 Success Metrics

**Adoption Metrics:**
- 500 registered users (10x from v1.0)
- 50+ Hampshire RFU endorsed animations
- 100+ published progression sets
- 20+ curated collections

**Engagement Metrics:**
- 60% of replay views on mobile
- 40% of animations have 2+ versions
- 30% of new animations start from templates
- 20% of animations include video links

**Quality Metrics:**
- Average upvotes per animation: 5+ (v1.0 baseline: 2)
- Content reports: <1% of public animations (high quality threshold)
- Template remix rate: 50%+ (templates should be heavily reused)

---

## 4. User Personas

### 4.1 Primary Persona: Grassroots Rugby Coach

**Demographics:**
- **Age:** 30-55
- **Role:** Volunteer coach, parent coach, club coach
- **Tech Comfort:** Uses smartphone apps daily, comfortable with basic desktop software
- **Rugby Experience:** Played amateur rugby, coaching 2-10 years

**Context:**
- Coaches local club team (U12-U18 or senior)
- Prepares training sessions weekly
- Limited time (2-3 hours/week for planning)
- Shares drills with players via WhatsApp group

**Needs:**
- Create drill progressions (base + variations)
- Save time with templates
- Iterate on drills without starting over
- Share with players on mobile
- Personalize with club branding

**Pain Points:**
- v1.0: Cannot group related drills
- v1.0: Mobile replay suboptimal
- v1.0: Starting from scratch each time
- v1.0: No version history

**v2.0 Solution:**
- Progressions: Create base + 5 variations in one set
- Mobile optimization: Responsive canvas + touch controls
- Templates: Start from common formations
- Version control: Save v1.0 → v1.1 → v2.0

### 4.2 New Persona: Organizational Coach (Hampshire RFU)

**Demographics:**
- **Age:** 30-70
- **Role:** RFU coach educator, club development officer
- **Tech Comfort:** Professional software use, content creation experience
- **Rugby Experience:** Coached 10+ years, coaching qualifications

**Context:**
- Creates official drills for constituent clubs
- Quality assurance for coaching content
- Promotes best practices across region
- Manages team of content creators

**Needs:**
- Unlimited quota for official content library
- Batch endorsement of curated collections
- Organizational branding (logo, colors)
- Member management (admin/editor/viewer roles)
- Content approval workflow

**Pain Points:**
- v1.0: 50-animation quota insufficient
- v1.0: No organizational accounts
- v1.0: Cannot batch endorse content
- v1.0: No branding capabilities

**v2.0 Solution:**
- Organizational accounts: Unlimited quota
- Curated collections: Batch endorsement
- Org branding: Logo on cards, custom colors
- Member roles: Admin/editor/viewer permissions

### 4.3 Tertiary Persona: Player (Mobile-Only User)

**Demographics:**
- **Age:** 13-45
- **Role:** Rugby player (youth to senior)
- **Tech Comfort:** Mobile-native, rarely uses desktop
- **Rugby Experience:** Plays club rugby, learning drills

**Context:**
- Receives WhatsApp links from coach
- Views drills on mobile before training
- Does not create content (read-only)
- Needs quick understanding of movement patterns

**Needs:**
- Fast-loading mobile replay
- Touch-friendly playback controls (play, pause, speed)
- Landscape hint for small screens
- Coaching notes visible on mobile

**Pain Points:**
- v1.0: Replay canvas too small on mobile
- v1.0: Buttons too small for touch
- v1.0: No landscape orientation hint

**v2.0 Solution:**
- Responsive canvas: 280px-800px viewport
- Touch-friendly controls: 48×48px buttons (WCAG AAA)
- Landscape hint: "Rotate device for best viewing"
- Mobile-optimized coaching notes

---

## 5. Functional Requirements

### 5.1 Mobile Replay Optimization (MAKE-OR-BREAK)

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| **F-MOB-01** | Mobile replay viewer supports 280px-800px canvas with 4:3 aspect ratio | P0 | Already implemented (HIGH-006) |
| **F-MOB-02** | Touch-friendly playback controls (48×48px buttons, WCAG AAA) | P0 | Verify touch target sizes |
| **F-MOB-03** | Landscape hint for small screens ("Rotate device for best viewing") | P1 | Show on <600px width |
| **F-MOB-04** | Mobile editor shows warning banner: "Desktop recommended for editing" | P1 | Keep basic editing functionality |
| **F-MOB-05** | Mobile editor retains basic functionality (drag, select, annotate) | P2 | Don't break existing behavior |

**User Story:**
> As a **player**, I want to **view drill replays on my mobile phone** so that I can **understand movement patterns before training without needing a laptop**.

**Acceptance Criteria:**
- Replay viewer renders correctly on iPhone SE (375px) and Pixel 7 (412px)
- Playback controls (play, pause, prev, next, speed) are touch-friendly (min 48×48px)
- Canvas scales proportionally to viewport while maintaining 4:3 aspect ratio
- Landscape orientation hint appears on portrait screens <600px width
- Coaching notes and metadata visible without horizontal scrolling

### 5.2 Animation Progressions (PEDAGOGICAL STRUCTURE)

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| **F-PROG-01** | Create base animation, add up to 5 child progressions | P0 | Parent-child FK relationship |
| **F-PROG-02** | Each progression links to parent via `parent_animation_id` FK | P0 | Database schema |
| **F-PROG-03** | Progressions reorderable via drag-drop (stores `progression_order` integer) | P0 | UI component |
| **F-PROG-04** | Gallery displays ONE card per progression set with badge ("+ 3 progressions") | P0 | Gallery card design |
| **F-PROG-05** | Collection detail page shows base + progressions in vertical sequence | P0 | New page layout |
| **F-PROG-06** | Progression metadata: title suffix ("Progression 1: Add defender"), description | P1 | Extend metadata schema |
| **F-PROG-07** | Sharing progression set shares entire collection (base + all children) | P1 | Share logic |
| **F-PROG-08** | Option to convert standalone animation to base + add progressions | P2 | Conversion utility |

**User Story:**
> As a **coach**, I want to **create drill progressions (base + variations)** so that I can **teach skills incrementally from basic to advanced**.

**Acceptance Criteria:**
- Create base animation "Ruck Cleanout" with default metadata
- Add 3 progressions: "Add defender", "Add second attacker", "Full speed"
- Reorder progressions via drag-drop in editor
- Gallery shows single card "Ruck Cleanout + 3 progressions"
- Clicking card opens detail page with base + 3 progressions in sequence
- Share link includes all 4 animations (base + 3 progressions)

**Database Schema:**
```sql
ALTER TABLE saved_animations ADD COLUMN (
  parent_animation_id UUID REFERENCES saved_animations(id) ON DELETE CASCADE,
  progression_order INTEGER DEFAULT 0,  -- 0 = base, 1-5 = progressions
  is_progression BOOLEAN DEFAULT FALSE, -- Quick filter for child animations
  CHECK (progression_order BETWEEN 0 AND 5)
);

CREATE INDEX idx_progressions_parent ON saved_animations(parent_animation_id)
  WHERE parent_animation_id IS NOT NULL;
```

### 5.3 Organizational Accounts + Endorsements (HAMPSHIRE RFU PARTNERSHIP)

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| **F-ORG-01** | Create organization account (name, logo, description) | P0 | New table: organizations |
| **F-ORG-02** | Invite users as org members (admin/editor/viewer roles) | P0 | New table: organization_members |
| **F-ORG-03** | Org-owned animations (created by members but owned by org) | P0 | `organization_id` FK in saved_animations |
| **F-ORG-04** | Unlimited quota for organizations (no 50-animation limit) | P0 | Quota enforcement logic |
| **F-ORG-05** | Curated collections with batch endorsement | P0 | Collections table |
| **F-ORG-06** | Gallery card shows "Endorsed by Hampshire RFU" badge | P1 | Badge design |
| **F-ORG-07** | Organization profile page with all endorsed content | P1 | New page layout |
| **F-ORG-08** | Organization branding (logo on cards, custom colors) | P1 | Org metadata + UI |
| **F-ORG-09** | Org admin dashboard (member management, content approval queue) | P2 | Admin UI extension |

**User Story:**
> As a **Hampshire RFU coach**, I want to **create endorsed drill collections** so that I can **promote quality coaching content across constituent clubs**.

**Acceptance Criteria:**
- Hampshire RFU creates organization account with logo and description
- Invite 5 members as editors (can create animations)
- Create 10 org-owned animations (don't count toward personal quota)
- Create curated collection "Official Ruck Drills" with 10 animations
- Gallery shows "Endorsed by Hampshire RFU" badge on collection card
- Organization profile page shows all endorsed collections

**Database Schema:**
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  slug TEXT UNIQUE NOT NULL,  -- URL-friendly name
  description TEXT CHECK (char_length(description) <= 500),
  logo_url TEXT,
  website_url TEXT,
  visibility TEXT CHECK (visibility IN ('private', 'public')) DEFAULT 'public',
  max_animations INTEGER,  -- NULL = unlimited
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('admin', 'editor', 'viewer')) DEFAULT 'editor',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

ALTER TABLE saved_animations ADD COLUMN
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

CREATE INDEX idx_animations_org ON saved_animations(organization_id)
  WHERE organization_id IS NOT NULL;
```

### 5.4 Version Control (EDIT WITHOUT STARTING FROM SCRATCH)

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| **F-VER-01** | Save creates new version (v1.0, v1.1, v1.2, v2.0, etc.) | P0 | Auto-increment logic |
| **F-VER-02** | User sets major/minor increment via checkbox ("Major change" = v2.0) | P0 | UI component |
| **F-VER-03** | Keep latest version + 3 archived (auto-delete older versions) | P0 | Cleanup trigger |
| **F-VER-04** | Version history page shows all versions (thumbnail, date, author) | P0 | New page layout |
| **F-VER-05** | Restore old version (creates new version, doesn't overwrite) | P1 | Restore logic |
| **F-VER-06** | Versions don't count toward quota (Animation #123 v1.0-v1.3 = 1 toward quota) | P1 | Quota calculation |
| **F-VER-07** | Version diff view (show changed entities between versions) | P2 | Diff algorithm |

**User Story:**
> As a **coach**, I want to **edit and save new versions of my drills** so that I can **iterate without losing previous versions or starting from scratch**.

**Acceptance Criteria:**
- Save animation "Backline Move" as v1.0
- Edit and save as v1.1 (minor change checkbox unchecked)
- Edit and save as v2.0 (major change checkbox checked)
- Version history shows v1.0, v1.1, v2.0 with thumbnails and dates
- Restore v1.0 → creates v2.1 (doesn't overwrite v2.0)
- User quota shows 1 animation (not 3 for v1.0, v1.1, v2.0)

**Database Schema:**
```sql
CREATE TABLE animation_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animation_id UUID NOT NULL REFERENCES saved_animations(id) ON DELETE CASCADE,
  version_number TEXT NOT NULL,  -- Semver: "1.0", "1.1", "2.0"
  major_version INTEGER NOT NULL,
  minor_version INTEGER NOT NULL,
  payload JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(animation_id, version_number)
);

CREATE INDEX idx_versions_animation ON animation_versions(animation_id);
CREATE INDEX idx_versions_created ON animation_versions(created_at DESC);

ALTER TABLE saved_animations ADD COLUMN
  current_version TEXT DEFAULT '1.0';
```

**Auto-Cleanup Trigger:**
```sql
CREATE OR REPLACE FUNCTION cleanup_old_versions()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM animation_versions
  WHERE animation_id = NEW.animation_id
    AND version_number NOT IN (
      SELECT version_number FROM animation_versions
      WHERE animation_id = NEW.animation_id
      ORDER BY created_at DESC
      LIMIT 4  -- Keep latest + 3 archived
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cleanup_versions
AFTER INSERT ON animation_versions
FOR EACH ROW EXECUTE FUNCTION cleanup_old_versions();
```

### 5.5 Remix Enhancement (GENEALOGY CHAIN)

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| **F-RMX-01** | Remix button clones animation with "(Remix)" suffix | P0 | Existing functionality |
| **F-RMX-02** | Store `remixed_from_id` FK to original animation | P0 | Database schema |
| **F-RMX-03** | Gallery card shows "Remixed from {Original Title}" with link | P0 | UI component |
| **F-RMX-04** | Show full remix chain (A → B → C → Current) if 3+ generations | P1 | Genealogy component |
| **F-RMX-05** | Original animation shows remix count ("5 remixes") | P1 | Denormalized counter |
| **F-RMX-06** | Remix attribution persists across version edits (v1.0 → v2.0) | P1 | Version logic |
| **F-RMX-07** | Browse all remixes of an animation | P2 | Remix gallery view |

**User Story:**
> As a **coach**, I want to **see who remixed my drill and track the lineage** so that I can **discover variations and get credit for original work**.

**Acceptance Criteria:**
- Coach A creates "Scrum Entry" (original)
- Coach B remixes → "Scrum Entry (Remix)" with `remixed_from_id` = A's animation
- Coach C remixes B's remix → shows chain: A → B → C
- Original animation shows "5 remixes" count
- B edits remix to v2.0 → remix attribution persists

**Database Schema:**
```sql
ALTER TABLE saved_animations ADD COLUMN (
  remixed_from_id UUID REFERENCES saved_animations(id) ON DELETE SET NULL,
  remix_count INTEGER DEFAULT 0  -- Denormalized counter
);

CREATE INDEX idx_remixed_from ON saved_animations(remixed_from_id)
  WHERE remixed_from_id IS NOT NULL;

-- Trigger to update remix_count
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

CREATE TRIGGER trigger_remix_count
AFTER INSERT ON saved_animations
FOR EACH ROW EXECUTE FUNCTION increment_remix_count();
```

### 5.6 Personalization (CLUB BRANDING)

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| **F-PERS-01** | Upload club badge (max 500KB, PNG/JPG/SVG) | P1 | File upload component |
| **F-PERS-02** | Set primary/secondary strip colors (hex pickers) | P1 | Color picker UI |
| **F-PERS-03** | New attack players default to primary color | P1 | Entity creation logic |
| **F-PERS-04** | New defense players default to secondary color | P1 | Entity creation logic |
| **F-PERS-05** | User profile shows club badge + colors | P1 | Profile page |
| **F-PERS-06** | Animation metadata includes club name (searchable, filterable) | P2 | Metadata schema |
| **F-PERS-07** | Editor sidebar uses club colors for headers | P2 | Theme customization |

**User Story:**
> As a **club coach**, I want to **set my club badge and strip colors** so that my **animations reflect my club's branding**.

**Acceptance Criteria:**
- Upload club badge (Hampshire RFC logo, 200KB PNG)
- Set primary strip color: #006400 (dark green)
- Set secondary strip color: #FFFFFF (white)
- New attack player defaults to #006400
- New defense player defaults to #FFFFFF
- Profile shows club badge and colors
- Animations tagged with "Hampshire RFC" (searchable)

**Database Schema:**
```sql
ALTER TABLE user_profiles ADD COLUMN (
  club_name TEXT CHECK (char_length(club_name) <= 100),
  club_badge_url TEXT,
  primary_strip_color TEXT CHECK (primary_strip_color ~ '^#[0-9A-Fa-f]{6}$'),
  secondary_strip_color TEXT CHECK (secondary_strip_color ~ '^#[0-9A-Fa-f]{6}$')
);
```

### 5.7 Rugby-Only Pivot (SPORT FOCUS)

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| **F-SPORT-01** | Sport selector shows only "Rugby Union" and "Rugby League" | P0 | UI filter |
| **F-SPORT-02** | New animations default to Rugby Union | P0 | Default value |
| **F-SPORT-03** | Gallery filter shows only rugby types | P1 | Filter logic |
| **F-SPORT-04** | Soccer/Am Football fields remain in codebase (hidden via feature flag) | P3 | Feature flag |

**User Story:**
> As a **rugby coach**, I want to **see only rugby-specific options** so that I'm **not distracted by irrelevant sports**.

**Acceptance Criteria:**
- Sport selector dropdown shows: Rugby Union, Rugby League (only)
- New animations default to Rugby Union
- Gallery filter shows rugby types only
- Soccer/American Football fields remain in code but hidden

**Code Changes:**
```typescript
// src/constants/sports.ts
export const VISIBLE_SPORTS = ['rugby-union', 'rugby-league'] as const;
export const ALL_SPORTS = ['rugby-union', 'rugby-league', 'soccer', 'american-football'] as const;

// components/Editor.tsx - Sport Selector
const availableSports = VISIBLE_SPORTS;  // Filter UI dropdown
```

### 5.8 Animation Notes with Video Links (ENHANCED COACHING NOTES)

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| **F-VID-01** | Add video URL field to animation metadata (max 500 chars) | P0 | Metadata schema |
| **F-VID-02** | Validate YouTube URL format on save | P0 | Validation logic |
| **F-VID-03** | Replay viewer shows "Watch Tutorial Video" link below coaching notes | P0 | Replay UI |
| **F-VID-04** | Link opens in new tab with `rel="noopener noreferrer"` | P1 | Security |
| **F-VID-05** | Extract YouTube video ID and show thumbnail preview | P2 | YouTube API |

**User Story:**
> As a **coach**, I want to **link YouTube tutorial videos to my animations** so that I can **provide in-depth coaching instructions**.

**Acceptance Criteria:**
- Add video URL field to animation metadata
- Validate YouTube URL (reject invalid URLs)
- Replay viewer shows "Watch Tutorial Video" link
- Link opens in new tab with security attributes
- (Optional) Show thumbnail preview

**Database Schema:**
```sql
ALTER TABLE saved_animations ADD COLUMN
  video_url TEXT CHECK (
    video_url IS NULL OR
    video_url ~ '^https://(www\.)?(youtube\.com/watch\?v=|youtu\.be/)[A-Za-z0-9_-]{11}'
  );
```

### 5.9 Template Library (NON-AI STARTING POSITIONS)

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| **F-TMPL-01** | Add "template" tag to animation metadata | P0 | Metadata schema |
| **F-TMPL-02** | Gallery filter: "Show Templates Only" checkbox | P0 | Filter UI |
| **F-TMPL-03** | Template badge on animation cards (blue "Template" pill) | P0 | Badge design |
| **F-TMPL-04** | "Use Template" button (alias for Remix) | P1 | UI component |
| **F-TMPL-05** | Curated templates created by Hampshire RFU (organizational content) | P2 | Content creation |

**User Story:**
> As a **coach**, I want to **start from common formations** so that I can **save time on setup**.

**Acceptance Criteria:**
- Hampshire RFU creates 10 templates (lineout, scrum, backline, etc.)
- Templates tagged with "template" in metadata
- Gallery filter shows "Templates Only" checkbox
- Template animations show blue "Template" badge
- "Use Template" button clones animation to personal gallery

**UI Changes:**
```typescript
// components/PublicAnimationCard.tsx
{animation.tags.includes('template') && (
  <Badge variant="secondary" className="absolute top-2 left-2">
    Template
  </Badge>
)}

// Gallery filter
<Checkbox id="templates-only">
  <Label htmlFor="templates-only">Templates Only</Label>
</Checkbox>
```

### 5.10 Collections (CURATED SETS - SEPARATE FROM PROGRESSIONS)

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| **F-COLL-01** | Create collection (name, description, visibility) | P0 | Collections table |
| **F-COLL-02** | Add/remove animations to collection (many-to-many relationship) | P0 | Collection items table |
| **F-COLL-03** | Collections owned by users or organizations | P0 | Ownership FK |
| **F-COLL-04** | Gallery shows collection cards with thumbnail grid (first 4 animations) | P0 | Card design |
| **F-COLL-05** | Collection detail page with all animations in grid | P1 | Page layout |
| **F-COLL-06** | Organizational collections auto-endorse all contained animations | P1 | Endorsement logic |
| **F-COLL-07** | Share collection via single link (opens collection detail page) | P2 | Share logic |

**User Story:**
> As a **Hampshire RFU coach**, I want to **curate collections of related drills** so that I can **batch endorse content for specific age groups**.

**Acceptance Criteria:**
- Create collection "U12 Ruck Fundamentals"
- Add 10 unrelated animations (different authors, different dates)
- Gallery shows collection card with 4 thumbnails
- Collection detail page shows all 10 animations in grid
- Organizational collections auto-endorse all animations
- Share collection link opens detail page with all animations

**Database Schema:**
```sql
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  description TEXT CHECK (char_length(description) <= 1000),
  visibility TEXT CHECK (visibility IN ('private', 'public')) DEFAULT 'public',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK ((user_id IS NOT NULL AND organization_id IS NULL) OR
         (user_id IS NULL AND organization_id IS NOT NULL))  -- Exclusive ownership
);

CREATE TABLE collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  animation_id UUID NOT NULL REFERENCES saved_animations(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(collection_id, animation_id)  -- Prevent duplicates
);

CREATE INDEX idx_collection_items_collection ON collection_items(collection_id);
CREATE INDEX idx_collection_items_animation ON collection_items(animation_id);
```

### 5.11 Export Format Compatibility (CRITICAL ORPHAN FROM LEGACY AUDIT)

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| **F-EXPORT-01** | Detect Safari/iOS browsers and offer appropriate export formats | P0 | Browser detection via User-Agent |
| **F-EXPORT-02** | GIF export fallback for Safari/iOS (WebM not supported) | P0 | Use gif.js library |
| **F-EXPORT-03** | User preference for export format (WebM, GIF, MP4) | P1 | Format selector in export modal |
| **F-EXPORT-04** | Export format validation (ensure browser compatibility) | P1 | Warning if format unsupported |
| **F-EXPORT-05** | Show export format recommendation based on browser | P2 | "Recommended for your device" badge |

**User Story:**
> As a **coach using Safari/iOS**, I want to **export animations in a compatible format** so that I can **save and share my work without file format errors**.

**Acceptance Criteria:**
- Safari/iOS users see GIF export option (not WebM)
- Chrome/Firefox users see WebM export option (default)
- Export modal shows "Recommended format" based on browser detection
- User can override recommendation and select any format
- Export fails gracefully with error message if format unsupported

**Browser Detection Logic:**
```typescript
// lib/browser-detect.ts
export function getBrowserInfo(): { isSafari: boolean; isIOS: boolean } {
  const ua = navigator.userAgent;
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
  return { isSafari, isIOS };
}

export function getRecommendedExportFormat(): 'webm' | 'gif' | 'mp4' {
  const { isSafari, isIOS } = getBrowserInfo();
  if (isSafari || isIOS) return 'gif'; // Safari/iOS don't support WebM
  return 'webm'; // Default for Chrome/Firefox
}
```

**Export Format Implementation:**
```typescript
// src/hooks/useExport.ts
import { getRecommendedExportFormat } from '@/lib/browser-detect';

export function useExport() {
  const [format, setFormat] = useState<'webm' | 'gif' | 'mp4'>(
    getRecommendedExportFormat()
  );

  async function exportAnimation() {
    if (format === 'webm') {
      // Existing WebM export logic
    } else if (format === 'gif') {
      // New GIF export using gif.js
      await exportAsGIF();
    } else if (format === 'mp4') {
      // Future: Server-side MP4 conversion (v2.1+)
      throw new Error('MP4 export not yet implemented');
    }
  }

  return { format, setFormat, exportAnimation };
}
```

**Rationale:**
- **Legacy Issue HIGH-002**: 30% of users (Safari/iOS) cannot export animations with WebM-only format
- **User Impact**: Make-or-break feature for mobile coaches (WhatsApp sharing to players)
- **Constitutional Alignment**: Respects **VI.1 Accessibility** (free tier must provide genuine value on all devices)

### 5.12 Mobile-First UX Architecture (STRATEGIC PIVOT)

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| **F-UX-01** | **Adaptive Bottom Navigation**: Editor view uses bottom tab bar (Create, Playbook, Explore, Profile) | P0 | Replaces top-nav in editor |
| **F-UX-02** | **Fit-to-Width Canvas**: Konva Stage scales dynamically to `window.innerWidth` | P0 | Eliminates horizontal scroll |
| **F-UX-03** | **Bottom-Sheet Tool Trays**: Sidebar components move to toggleable bottom trays on mobile | P0 | Keeps tools in "Thumb Zone" |
| **F-UX-04** | **Touch Context Menus**: Implement long-press/swipe gestures for delete/duplicate | P1 | Replaces right-click dependency |
| **F-UX-05** | **Tactical Depth Cues**: Use hard-edged shadows (2px offset) for floating UI elements | P1 | Improves touch target clarity |
| **F-UX-06** | **Coach-to-Coach Messaging**: Rewrite landing page with practical, grounded tone | P1 | Aligns with grassroots persona |

**User Story:**
> As a **coach on the pitch**, I want to **edit my plays with one hand (my thumb)** so that I can **quickly adjust tactics without putting my phone down**.

**Acceptance Criteria:**
- Editor is fully usable on iPhone/Pixel without zooming or scrolling.
- All high-frequency buttons (Add Frame, Play, Save) are in the bottom 40% of the screen.
- Long-pressing a player token opens the action menu (Duplicate/Delete).
- Landing page headline focuses on "Rugby Tactics, Simplified" instead of grandiose claims.

---

### 5.13 Save & Share Workflow (As Built)

> Documents the actual save/persist/share mechanism as implemented in the codebase. Added 2026-04-28 to close the FLOW-001 / FLOW-002 / UX-008 documentation gap. Supersedes any conflicting prose in §6.1 and clarifies the visibility model referenced in §7.

#### 5.13.1 Mental model

- **For authenticated users (Tier 1+), Share IS the save event.** Clicking *Share* in the editor writes the animation to `saved_animations` and immediately makes it discoverable in `/my-gallery` and reachable at `/share/{id}`. There is no separate draft state.
- **For guests (Tier 0)**, no cloud persistence occurs. Local 10-frame editing + JSON export remain the only off-device options.
- This means **"save"** in the user-facing copy is a synonym for **"share"** today; there is no quiet save that is not also link-discoverable to the owner. Renames and visibility flips happen post-hoc from `/my-gallery`.

#### 5.13.2 Endpoints

| Method | Path | Auth | Purpose | Default visibility |
|--------|------|------|---------|--------------------|
| `POST` | `/api/share` | required | Primary editor save path. Insert new row in `saved_animations`, return `{ id }`. Editor routes user to `/share/{id}`. | `link_shared` |
| `POST` | `/api/animations` | required | Explicit save / update from `/my-gallery` flows; supports caller-supplied `visibility`. | caller-supplied (defaults `private`) |
| `GET` | `/api/animations` | required | Returns the user's own animations. Supports `q` and `type` filter params (server accepts; some filtering currently client-side). | — |
| `GET` | `/api/gallery` | optional | Returns publicly visible animations only (`visibility = 'public'`). Does **not** include `link_shared` rows. | — |

Source of truth: `src/app/api/share/route.ts`, `src/app/api/animations/route.ts`, `src/app/api/gallery/route.ts`.

#### 5.13.3 Visibility values

`saved_animations.visibility` accepts three values; each maps to a discoverability surface:

| Value | Set by | Owner sees in /my-gallery | Public sees in /gallery | Reachable at /share/{id} (anyone with link) |
|-------|--------|---------------------------|-------------------------|---------------------------------------------|
| `private` | explicit user choice from `/my-gallery` edit | ✅ | ❌ | ❌ |
| `link_shared` | server default for `POST /api/share` | ✅ | ❌ | ✅ |
| `public` | explicit user choice from `/my-gallery` edit | ✅ | ✅ | ✅ |

RLS policies enforce the surface mapping — see `supabase/migrations/20260131130000_online_platform.sql:271–277`.

> **Note on §7 schema examples.** Several DDL snippets in §7 show `CHECK (visibility IN ('private', 'public'))`. The production schema also accepts `'link_shared'` — see `20260131130000_online_platform.sql:63` (TEXT, no CHECK constraint enforced; values constrained by application logic + RLS). The §7 examples should be read as templates for *new* tables, not the literal current `saved_animations` schema.

#### 5.13.4 Coach workflow narrative

1. Coach edits in `/app`. Frames live in client-side Zustand store; nothing is persisted yet.
2. Coach clicks **Share**. `useShareAnimation` posts to `/api/share`. On 201, the animation lands in DB with `visibility='link_shared'`, owner = current user.
3. Editor navigates to `/share/{id}` and renders `ShareViewer` (full-bleed, mobile-first). The coach copies the link and sends it via WhatsApp.
4. Player opens link on phone, sees the replay. No login required.
5. Coach later visits `/my-gallery`, sees the animation listed with mini-pitch preview. Coach can rename, delete, or change visibility to `public` (which surfaces it in `/gallery`).

#### 5.13.5 Title handling

- Title is taken from `body.name` in the share request.
- If empty / whitespace-only, server applies fallback `'Untitled Animation'` (`src/app/api/share/route.ts:57–59`).
- The share viewer should display the title to give the receiving player context. Tracked under FLOW-002.

#### 5.13.6 Gaps tracked elsewhere

- `FLOW-001` — gallery cards do not link to `/share/{id}`. Phase 2h.
- `FLOW-002` — `/share/{id}` lacks animation name, progression nav, and back-to-site link. Phase 2h.
- `UX-008` — coaches confused which route to send (/replay vs /share). Phase 2h.
- `EDITOR-002` — share button intermittently non-functional in dev. Phase 2h.

#### 5.13.7 Relationship to §6.1 (Legacy Anonymous Shares)

The endpoint *path* `/api/share` was retained but the implementation was rebuilt. The v1 endpoint that wrote anonymous rows to a `shares` table is gone — the table was dropped per §6.1. The current endpoint at the same path is the authenticated save described above. Old share links from before the cutover are out of scope and return 404.

---

## 6. Features to REMOVE in v2.0

### 6.1 Legacy Anonymous Shares Table (CLEAN BREAK)

**Rationale:** Deprecated in favor of `saved_animations` with `link_shared` visibility. Users now authenticate to share.

> **Clarification (2026-04-28):** The v1 `shares` table and the v1 anonymous endpoint at `/api/share` were both removed as planned. The endpoint *path* `/api/share` was subsequently re-bound to the new authenticated save handler — see §5.13. Read the bullets below as the v1.x → v2.0 cleanup, not as a current-state instruction.

**Removal Plan (v1.x → v2.0):**
- ❌ **DELETE**: `shares` table and all data
- ❌ **DELETE**: legacy anonymous `POST /api/share` handler *(path subsequently reused for authenticated save — see §5.13)*
- ❌ **UPDATE**: Replay viewer fallback logic (remove `shares` table lookup)
- ✅ **MIGRATION NOTICE**: Old share links show "This link has expired. Create a free account to share animations."

**SQL:**
```sql
DROP TABLE IF EXISTS shares CASCADE;
```

**Impact:** Minimal user disruption (90-day expiry already communicated in v1.0).

### 6.2 Follow System (DEFERRED TO V3.0)

**Rationale:** Phase 2 foundation table exists but no UI/API. Focus v2.0 on organizational endorsements instead of user-to-user social graph.

**Removal Plan:**
- ❌ **DELETE**: `follows` table
- ✅ **DEFER**: User-to-user following to v3.0 (organizational following may come first)

**SQL:**
```sql
DROP TABLE IF EXISTS follows CASCADE;
```

**Impact:** No user-facing features affected (table never used).

### 6.3 Grid Overlay Toggle (RARELY USED)

**Rationale:** User feedback indicates grid overlay rarely used. Simplifies timeline controls.

**Removal Plan:**
- ❌ **DELETE**: Grid toggle button from `PlaybackControls.tsx`
- ❌ **DELETE**: `showGrid` state from `projectStore.ts`
- ❌ **DELETE**: Grid rendering logic in `Stage.tsx`

**Impact:** Removes 1 button from timeline, ~50 lines of code. Low user impact.

### 6.4 Marker Entity Type (AUTO-CONVERT)

**Rationale:** Deprecated entity type (small green circle). ~5-10% of old animations use markers.

**Migration Plan:**
- ✅ **AUTO-CONVERT**: On animation load, marker entities become cones (same position)
- ✅ **MIGRATION NOTICE**: User sees toast: "Marker entities converted to cones for compatibility"
- ❌ **REMOVE FROM UI**: Marker not available in entity palette

**Code:**
```typescript
// src/utils/hydratePayload.ts
function convertLegacyMarkers(payload: AnimationPayload): AnimationPayload {
  return {
    ...payload,
    frames: payload.frames.map(frame => ({
      ...frame,
      entities: Object.fromEntries(
        Object.entries(frame.entities).map(([id, entity]) =>
          [id, entity.type === 'marker' ? { ...entity, type: 'cone' } : entity]
        )
      )
    }))
  };
}
```

**Impact:** Graceful migration for ~5-10% of animations, no data loss.

---

## 7. Data Model & Schema

### 7.1 New Tables

#### 7.1.1 Organizations

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  slug TEXT UNIQUE NOT NULL,  -- URL-friendly name (e.g., "hampshire-rfu")
  description TEXT CHECK (char_length(description) <= 500),
  logo_url TEXT,
  website_url TEXT,
  visibility TEXT CHECK (visibility IN ('private', 'public')) DEFAULT 'public',
  max_animations INTEGER,  -- NULL = unlimited
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_owner ON organizations(owner_id);
```

**Purpose:** Hampshire RFU and club accounts with unlimited quota.

#### 7.1.2 Organization Members

```sql
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('admin', 'editor', 'viewer')) DEFAULT 'editor',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_org_members_user ON organization_members(user_id);
```

**Purpose:** Member management with role-based permissions.

**Roles:**
- **Admin:** Full access (manage members, create/edit/delete animations, curate collections)
- **Editor:** Create/edit animations, add to collections
- **Viewer:** Read-only access to private org content

#### 7.1.3 Animation Versions

```sql
CREATE TABLE animation_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animation_id UUID NOT NULL REFERENCES saved_animations(id) ON DELETE CASCADE,
  version_number TEXT NOT NULL,  -- Semver: "1.0", "1.1", "2.0"
  major_version INTEGER NOT NULL,
  minor_version INTEGER NOT NULL,
  payload JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(animation_id, version_number)
);

CREATE INDEX idx_versions_animation ON animation_versions(animation_id);
CREATE INDEX idx_versions_created ON animation_versions(created_at DESC);
```

**Purpose:** Version history with latest + 3 archived versions.

**Auto-Cleanup Trigger:**
```sql
CREATE OR REPLACE FUNCTION cleanup_old_versions()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM animation_versions
  WHERE animation_id = NEW.animation_id
    AND version_number NOT IN (
      SELECT version_number FROM animation_versions
      WHERE animation_id = NEW.animation_id
      ORDER BY created_at DESC
      LIMIT 4  -- Keep latest + 3 archived
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cleanup_versions
AFTER INSERT ON animation_versions
FOR EACH ROW EXECUTE FUNCTION cleanup_old_versions();
```

#### 7.1.4 Collections

```sql
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  description TEXT CHECK (char_length(description) <= 1000),
  visibility TEXT CHECK (visibility IN ('private', 'public')) DEFAULT 'public',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK ((user_id IS NOT NULL AND organization_id IS NULL) OR
         (user_id IS NULL AND organization_id IS NOT NULL))  -- Exclusive ownership
);

CREATE INDEX idx_collections_user ON collections(user_id);
CREATE INDEX idx_collections_org ON collections(organization_id);
```

**Purpose:** Curated sets of animations for organizational endorsements.

#### 7.1.5 Collection Items

```sql
CREATE TABLE collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  animation_id UUID NOT NULL REFERENCES saved_animations(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(collection_id, animation_id)  -- Prevent duplicates
);

CREATE INDEX idx_collection_items_collection ON collection_items(collection_id);
CREATE INDEX idx_collection_items_animation ON collection_items(animation_id);
```

**Purpose:** Many-to-many relationship between collections and animations.

### 7.2 Schema Updates to Existing Tables

#### 7.2.1 saved_animations (10 new columns)

```sql
ALTER TABLE saved_animations ADD COLUMN (
  -- Progressions
  parent_animation_id UUID REFERENCES saved_animations(id) ON DELETE CASCADE,
  progression_order INTEGER DEFAULT 0,  -- 0 = base, 1-5 = progressions
  is_progression BOOLEAN DEFAULT FALSE,
  CHECK (progression_order BETWEEN 0 AND 5),

  -- Organizations
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,

  -- Version Control
  current_version TEXT DEFAULT '1.0',

  -- Remix Genealogy
  remixed_from_id UUID REFERENCES saved_animations(id) ON DELETE SET NULL,
  remix_count INTEGER DEFAULT 0,

  -- Video Links
  video_url TEXT CHECK (
    video_url IS NULL OR
    video_url ~ '^https://(www\.)?(youtube\.com/watch\?v=|youtu\.be/)[A-Za-z0-9_-]{11}'
  )
);

CREATE INDEX idx_progressions_parent ON saved_animations(parent_animation_id)
  WHERE parent_animation_id IS NOT NULL;

CREATE INDEX idx_animations_org ON saved_animations(organization_id)
  WHERE organization_id IS NOT NULL;

CREATE INDEX idx_remixed_from ON saved_animations(remixed_from_id)
  WHERE remixed_from_id IS NOT NULL;
```

#### 7.2.2 user_profiles (4 new columns)

```sql
ALTER TABLE user_profiles ADD COLUMN (
  club_name TEXT CHECK (char_length(club_name) <= 100),
  club_badge_url TEXT,
  primary_strip_color TEXT CHECK (primary_strip_color ~ '^#[0-9A-Fa-f]{6}$'),
  secondary_strip_color TEXT CHECK (secondary_strip_color ~ '^#[0-9A-Fa-f]{6}$')
);
```

### 7.3 Tables to DELETE

```sql
-- Legacy anonymous shares (deprecated)
DROP TABLE IF EXISTS shares CASCADE;

-- Follow system (deferred to v3.0)
DROP TABLE IF EXISTS follows CASCADE;
```

---

## 8. API Contracts

### 8.1 New Endpoints

#### 8.1.1 Organizations CRUD

**POST /api/organizations** (Admin only initially, then org owners)
```typescript
// Request
{
  name: string;                // Max 100 chars
  slug: string;                // URL-friendly, unique
  description?: string;        // Max 500 chars
  logo_url?: string;
  website_url?: string;
  visibility: 'private' | 'public';
  max_animations?: number;     // NULL = unlimited
}

// Response
{
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  website_url: string;
  visibility: 'private' | 'public';
  max_animations: number | null;
  created_at: string;
  updated_at: string;
}
```

**GET /api/organizations** (Public)
```typescript
// Query params
{
  visibility?: 'public' | 'private';
  limit?: number;              // Default: 50, max: 100
  offset?: number;             // Pagination
}

// Response
{
  organizations: Organization[];
  total: number;
}
```

**GET /api/organizations/[id]** (Public for public orgs, member-only for private)
```typescript
// Response
{
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  website_url: string;
  visibility: 'private' | 'public';
  member_count: number;        // Denormalized
  animation_count: number;     // Denormalized
  collection_count: number;    // Denormalized
  created_at: string;
}
```

**PUT /api/organizations/[id]** (Admin members only)
```typescript
// Request
{
  name?: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  visibility?: 'private' | 'public';
  max_animations?: number;
}

// Response
{
  id: string;
  // ... updated fields
  updated_at: string;
}
```

**DELETE /api/organizations/[id]** (Owner only)
```typescript
// Response
{
  success: true;
  message: "Organization deleted successfully";
}
```

#### 8.1.2 Organization Membership

**POST /api/organizations/[id]/members** (Admin members only)
```typescript
// Request
{
  user_id: string;
  role: 'admin' | 'editor' | 'viewer';
}

// Response
{
  id: string;
  organization_id: string;
  user_id: string;
  role: 'admin' | 'editor' | 'viewer';
  created_at: string;
}
```

**DELETE /api/organizations/[id]/members/[userId]** (Admin members only)
```typescript
// Response
{
  success: true;
  message: "Member removed successfully";
}
```

**GET /api/organizations/[id]/members** (Members only)
```typescript
// Response
{
  members: {
    id: string;
    user_id: string;
    display_name: string;
    role: 'admin' | 'editor' | 'viewer';
    created_at: string;
  }[];
  total: number;
}
```

#### 8.1.3 Collections CRUD

**POST /api/collections** (Authenticated users or org members)
```typescript
// Request
{
  name: string;                // Max 100 chars
  description?: string;        // Max 1000 chars
  visibility: 'private' | 'public';
  organization_id?: string;    // If creating as org collection
}

// Response
{
  id: string;
  user_id?: string;
  organization_id?: string;
  name: string;
  description: string;
  visibility: 'private' | 'public';
  animation_count: number;
  created_at: string;
  updated_at: string;
}
```

**GET /api/collections** (Public)
```typescript
// Query params
{
  visibility?: 'public' | 'private';
  organization_id?: string;    // Filter by org
  user_id?: string;            // Filter by user
  limit?: number;              // Default: 50, max: 100
  offset?: number;
}

// Response
{
  collections: Collection[];
  total: number;
}
```

**GET /api/collections/[id]** (Public for public collections, owner-only for private)
```typescript
// Response
{
  id: string;
  name: string;
  description: string;
  visibility: 'private' | 'public';
  owner: {
    user_id?: string;
    display_name?: string;
    organization_id?: string;
    organization_name?: string;
  };
  animations: {
    id: string;
    title: string;
    thumbnail_url: string;
    duration_ms: number;
  }[];
  animation_count: number;
  created_at: string;
  updated_at: string;
}
```

**PUT /api/collections/[id]** (Owner only)
```typescript
// Request
{
  name?: string;
  description?: string;
  visibility?: 'private' | 'public';
}

// Response
{
  id: string;
  // ... updated fields
  updated_at: string;
}
```

**DELETE /api/collections/[id]** (Owner only)
```typescript
// Response
{
  success: true;
  message: "Collection deleted successfully";
}
```

#### 8.1.4 Collection Items

**POST /api/collections/[id]/animations** (Owner only)
```typescript
// Request
{
  animation_id: string;
}

// Response
{
  id: string;
  collection_id: string;
  animation_id: string;
  added_at: string;
}
```

**DELETE /api/collections/[id]/animations/[animationId]** (Owner only)
```typescript
// Response
{
  success: true;
  message: "Animation removed from collection";
}
```

#### 8.1.5 Version History

**GET /api/animations/[id]/versions** (Owner only)
```typescript
// Response
{
  versions: {
    id: string;
    version_number: string;
    major_version: number;
    minor_version: number;
    created_by: string;
    created_at: string;
    thumbnail_url?: string;    // Generated from payload
  }[];
  total: number;
}
```

**POST /api/animations/[id]/versions/[versionId]/restore** (Owner only)
```typescript
// Response
{
  id: string;                  // Animation ID
  current_version: string;     // New version number (auto-incremented)
  message: "Version restored as v2.1";
}
```

#### 8.1.6 Endorsements

**POST /api/collections/[id]/endorse** (Org admin only)
```typescript
// Request
{
  organization_id: string;
}

// Response
{
  success: true;
  endorsed_count: number;      // Number of animations endorsed
  message: "Collection endorsed by Hampshire RFU";
}
```

### 8.2 Updated Endpoints

#### 8.2.1 POST /api/animations (Enhanced for progressions and organizations)

```typescript
// Request (new fields)
{
  // ... existing fields ...
  parent_animation_id?: string;    // For progressions
  progression_order?: number;      // 0 = base, 1-5 = progressions
  organization_id?: string;        // If creating as org animation
  video_url?: string;              // YouTube URL
}

// Response (new fields)
{
  // ... existing fields ...
  parent_animation_id: string | null;
  progression_order: number;
  is_progression: boolean;
  organization_id: string | null;
  current_version: string;
  remixed_from_id: string | null;
  remix_count: number;
  video_url: string | null;
}
```

#### 8.2.2 GET /api/gallery (Enhanced filters)

```typescript
// Query params (new)
{
  // ... existing params ...
  organization_id?: string;        // Filter by org
  parent_animation_id?: string;    // Filter progressions
  tags?: string[];                 // Filter by tags (including "template")
}
```

---

## 9. UI/UX Specifications

### 9.1 Gallery Collection Cards

**ONE card per progression set:**

```
┌─────────────────────────────────────────┐
│ [Thumbnail: Base Animation]             │
│                                          │
│ Ruck Cleanout Fundamentals              │
│ + 3 progressions                         │← Badge
│                                          │
│ by Coach Wayne                           │
│ ⬆ 24  👁 156  🏉 Rugby Union            │
│ Endorsed by Hampshire RFU                │← If org collection
└─────────────────────────────────────────┘
```

**Implementation:**
- Single card for base animation
- Badge shows "+ N progressions"
- Click opens collection detail page

### 9.2 Collection Detail Page

**Base + progressions in vertical sequence:**

```
┌─────────────────────────────────────────────────────┐
│ Ruck Cleanout Fundamentals                          │
│ by Coach Wayne | Endorsed by Hampshire RFU          │
│ ⬆ 24  👁 156  🏉 Rugby Union                        │
├─────────────────────────────────────────────────────┤
│ Base Drill: Ruck Entry                              │
│ [Replay Player]                                      │
│ Coaching Notes: Focus on body position...           │
├─────────────────────────────────────────────────────┤
│ Progression 1: Add Defender                         │
│ [Replay Player]                                      │
│ Coaching Notes: Introduce passive defender...       │
├─────────────────────────────────────────────────────┤
│ Progression 2: Add Second Attacker                  │
│ [Replay Player]                                      │
│ Coaching Notes: Timing of second player...          │
├─────────────────────────────────────────────────────┤
│ Progression 3: Full Speed                           │
│ [Replay Player]                                      │
│ Coaching Notes: Apply at match pace...              │
└─────────────────────────────────────────────────────┘
```

**Features:**
- Vertical layout (not horizontal tabs)
- Each progression has inline replay player
- Coaching notes visible without scroll
- Share button shares entire collection

### 9.3 Organization Profile Page

```
┌─────────────────────────────────────────────────────┐
│ [Logo] Hampshire RFU                                │
│ Official coaching resources for constituent clubs   │
│ 🌐 hampshire-rugby.co.uk                            │
│                                                      │
│ 50 Animations | 12 Collections | 125 Members        │
├─────────────────────────────────────────────────────┤
│ Collections                                          │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│ │ U12      │ │ U14      │ │ U16      │            │
│ │ Ruck     │ │ Scrum    │ │ Backline │            │
│ │ 10 drills│ │ 8 drills │ │ 12 drills│            │
│ └──────────┘ └──────────┘ └──────────┘            │
├─────────────────────────────────────────────────────┤
│ All Endorsed Animations                             │
│ [Grid of animation cards]                           │
└─────────────────────────────────────────────────────┘
```

**Features:**
- Organization logo and metadata
- Collection grid with animation counts
- All endorsed animations in gallery view
- Member management (admin-only section)

### 9.4 Version History Modal

**Timeline view with restore buttons:**

```
┌─────────────────────────────────────────┐
│ Version History: Backline Move          │
├─────────────────────────────────────────┤
│ v2.0 (Current) - 2026-02-11             │
│ [Thumbnail]                              │
│ by Coach Wayne                           │
│ Major change: Added defense             │
│                                          │
│ v1.1 - 2026-02-05                        │
│ [Thumbnail]                              │
│ by Coach Wayne                           │
│ Minor change: Adjusted spacing          │
│ [Restore] ← Creates v2.1                 │
│                                          │
│ v1.0 - 2026-02-01                        │
│ [Thumbnail]                              │
│ by Coach Wayne                           │
│ Initial version                          │
│ [Restore] ← Creates v2.1                 │
└─────────────────────────────────────────┘
```

**Features:**
- Reverse chronological order (newest first)
- Thumbnails for visual comparison
- Restore button creates new version (doesn't overwrite)
- Version diff view (P2 feature)

### 9.5 Remix Genealogy Chain

**A → B → C breadcrumb:**

```
┌─────────────────────────────────────────┐
│ Scrum Entry (Remix)                     │
│                                          │
│ Remixed from:                            │
│ Original by Coach A →                    │← Link to A
│ Remix by Coach B →                       │← Link to B
│ This remix by Coach C                    │← Current
│                                          │
│ [Replay Player]                          │
└─────────────────────────────────────────┘
```

**Features:**
- Full lineage displayed
- Clickable links to each generation
- Original animation shows remix count

### 9.6 Template Badge and Filter

**Gallery filter:**

```
┌─────────────────────────────────────────┐
│ Filters                                  │
│ ☑ Templates Only                         │← Checkbox
│ Sport: [All Sports ▼]                    │
│ Type: [All Types ▼]                      │
└─────────────────────────────────────────┘
```

**Template badge:**

```
┌─────────────────────────────────────────┐
│ [Template] ← Blue badge                  │
│ [Thumbnail]                              │
│                                          │
│ Lineout Formation                        │
│ by Hampshire RFU                         │
│ ⬆ 45  👁 320  🏉 Rugby Union            │
│ [Use Template] ← Alias for Remix         │
└─────────────────────────────────────────┘
```

### 9.7 Mobile Warning Banner

**Mobile editor:**

```
┌─────────────────────────────────────────┐
│ ⚠ Desktop recommended for editing       │← Banner
│ Editing on mobile may have limitations   │
│ [Dismiss]                                │
├─────────────────────────────────────────┤
│ [Canvas - basic touch controls work]    │
└─────────────────────────────────────────┘
```

### 9.8 Club Personalization Settings

**Profile page:**

```
┌─────────────────────────────────────────┐
│ Club Personalization                     │
│                                          │
│ Club Name: [Hampshire RFC          ]    │
│                                          │
│ Club Badge:                              │
│ [Upload] (max 500KB, PNG/JPG/SVG)       │
│ [Preview]                                │
│                                          │
│ Primary Strip Color:                     │
│ [#006400] 🎨 ← Color picker              │
│                                          │
│ Secondary Strip Color:                   │
│ [#FFFFFF] 🎨                             │
│                                          │
│ [Save Changes]                           │
└─────────────────────────────────────────┘
```

---

## 10. Security & Validation

### 10.1 RLS Policies for Organizations

**organizations table:**
```sql
-- Public read for public orgs
CREATE POLICY "Public orgs readable by all"
ON organizations FOR SELECT
USING (visibility = 'public');

-- Members can read private orgs
CREATE POLICY "Members can read private orgs"
ON organizations FOR SELECT
USING (
  id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
  )
);

-- Owners can update
CREATE POLICY "Owners can update orgs"
ON organizations FOR UPDATE
USING (owner_id = auth.uid());

-- Owners can delete
CREATE POLICY "Owners can delete orgs"
ON organizations FOR DELETE
USING (owner_id = auth.uid());
```

**organization_members table:**
```sql
-- Members can read member list
CREATE POLICY "Members can read member list"
ON organization_members FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
  )
);

-- Admins can insert members
CREATE POLICY "Admins can add members"
ON organization_members FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Admins can delete members
CREATE POLICY "Admins can remove members"
ON organization_members FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
```

### 10.2 RLS Policies for Collections

**collections table:**
```sql
-- Public read for public collections
CREATE POLICY "Public collections readable by all"
ON collections FOR SELECT
USING (visibility = 'public');

-- Owners can read private collections
CREATE POLICY "Owners can read private collections"
ON collections FOR SELECT
USING (
  user_id = auth.uid() OR
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
  )
);

-- Owners can update
CREATE POLICY "Owners can update collections"
ON collections FOR UPDATE
USING (
  user_id = auth.uid() OR
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
  )
);

-- Owners can delete
CREATE POLICY "Owners can delete collections"
ON collections FOR DELETE
USING (
  user_id = auth.uid() OR
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
```

### 10.3 Version Control Permissions

**Only owner can restore versions:**
```sql
-- In /api/animations/[id]/versions/[versionId]/restore
const { data: animation, error } = await supabase
  .from('saved_animations')
  .select('user_id')
  .eq('id', animationId)
  .single();

if (animation.user_id !== session.user.id) {
  return res.status(403).json({ error: 'Forbidden' });
}
```

### 10.4 YouTube URL Validation

**Prevent XSS via regex:**
```typescript
const YOUTUBE_URL_PATTERN = /^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[A-Za-z0-9_-]{11}$/;

function validateYouTubeUrl(url: string): boolean {
  return YOUTUBE_URL_PATTERN.test(url);
}
```

**Database constraint:**
```sql
ALTER TABLE saved_animations ADD COLUMN
  video_url TEXT CHECK (
    video_url IS NULL OR
    video_url ~ '^https://(www\.)?(youtube\.com/watch\?v=|youtu\.be/)[A-Za-z0-9_-]{11}'
  );
```

### 10.5 Organization Slug Uniqueness

**Enforce via unique constraint:**
```sql
CREATE TABLE organizations (
  slug TEXT UNIQUE NOT NULL,
  -- ...
);
```

**Validation logic:**
```typescript
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Check uniqueness before insert
const { data: existing } = await supabase
  .from('organizations')
  .select('id')
  .eq('slug', slug)
  .single();

if (existing) {
  throw new Error('Organization slug already exists');
}
```

### 10.6 Progression Limit Enforcement

**Max 5 progressions per base:**
```sql
ALTER TABLE saved_animations ADD CONSTRAINT
  CHECK (progression_order BETWEEN 0 AND 5);
```

**Validation logic:**
```typescript
const { count } = await supabase
  .from('saved_animations')
  .select('id', { count: 'exact' })
  .eq('parent_animation_id', parentId);

if (count >= 5) {
  throw new Error('Maximum 5 progressions per base animation');
}
```

---

## 11. Migration & Deployment

### 11.1 Phased Rollout Strategy (Updated for Staging & Mobile-First UX)

**Phase 0 (v2.0-prep): Staging + Mobile-First Foundation** (2 weeks - PREREQUISITE)
- Create staging Supabase project with clone of production schema
- **Adaptive Canvas**: Implement `fit-to-width` scaling for Konva Stage (F-UX-02)
- **Editor Nav**: Implement Bottom Tab Bar for editor view (F-UX-01)
- **Messaging**: Rewrite landing page copy for "Coach-to-Coach" tone (F-UX-06)
- **Export Foundation**: Browser detection + GIF fallback (HIGH-002)
- Testing: Verify responsive canvas across iPhone/Android viewports

**Phase 1 (v2.0): Collections + Version Control + Mobile Trays** (2 weeks)
- **Mobile Trays**: Transition EntityPalette to bottom sheets (F-UX-03)
- New tables: `collections`, `collection_items`, `animation_versions`
- New columns: `video_url`, `tags` (for templates)
- UI: Collection cards, version history modal, template filter
- Testing: E2E tests for collections and versions on Safari/iOS
- **Legacy Audit Integration**: Resolves HIGH-002 (Safari/iOS export)

**Phase 2 (v2.1): Progressions + Remix Genealogy** (1.5 weeks)
- New columns: `parent_animation_id`, `progression_order`, `is_progression`, `remixed_from_id`, `remix_count`
- New indexes: Progression parent, remixed from
- New triggers: Remix count increment
- UI: Progression cards, genealogy breadcrumb
- Testing: E2E tests for progressions and remix chains

**Phase 3 (v2.2): Organizations + Endorsements** (2 weeks)
- New tables: `organizations`, `organization_members`
- New columns: `organization_id` in `saved_animations`
- New endpoints: Organizations CRUD, Membership, Endorsements
- UI: Organization profile, member management, endorsement badges
- Testing: RLS policy tests, E2E tests for organizations

**Phase 4 (v2.3): Personalization + Video Links** (1 week)
- New columns: `club_name`, `club_badge_url`, `primary_strip_color`, `secondary_strip_color` in `user_profiles`
- UI: Club personalization settings, video link display
- Testing: E2E tests for personalization

**Total Estimated Duration:** 7.5 weeks (including Phase 0 staging prerequisite)

### 11.2 Rollback Plan

**Phase 1 Rollback:**
```sql
DROP TABLE IF EXISTS collection_items CASCADE;
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS animation_versions CASCADE;

ALTER TABLE saved_animations DROP COLUMN IF EXISTS video_url;
ALTER TABLE saved_animations DROP COLUMN IF EXISTS tags;
```

**Phase 2 Rollback:**
```sql
DROP TRIGGER IF EXISTS trigger_remix_count ON saved_animations;
DROP FUNCTION IF EXISTS increment_remix_count();

ALTER TABLE saved_animations DROP COLUMN IF EXISTS parent_animation_id;
ALTER TABLE saved_animations DROP COLUMN IF EXISTS progression_order;
ALTER TABLE saved_animations DROP COLUMN IF EXISTS is_progression;
ALTER TABLE saved_animations DROP COLUMN IF EXISTS remixed_from_id;
ALTER TABLE saved_animations DROP COLUMN IF EXISTS remix_count;
```

**Phase 3 Rollback:**
```sql
DROP TABLE IF EXISTS organization_members CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

ALTER TABLE saved_animations DROP COLUMN IF EXISTS organization_id;
```

**Phase 4 Rollback:**
```sql
ALTER TABLE user_profiles DROP COLUMN IF EXISTS club_name;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS club_badge_url;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS primary_strip_color;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS secondary_strip_color;
```

### 11.3 Data Migration Scripts

**Marker to Cone Conversion:**
```typescript
// Run once on v2.0 launch
async function convertMarkersToConesInDatabase() {
  const { data: animations, error } = await supabase
    .from('saved_animations')
    .select('id, payload');

  for (const animation of animations) {
    const payload = convertLegacyMarkers(animation.payload);

    await supabase
      .from('saved_animations')
      .update({ payload })
      .eq('id', animation.id);
  }
}
```

**Legacy Shares Deletion:**
```sql
-- Drop table completely (data already expired or migrated)
DROP TABLE IF EXISTS shares CASCADE;
```

**Follow System Deletion:**
```sql
-- Drop table (no UI/API existed)
DROP TABLE IF EXISTS follows CASCADE;
```

### 11.4 Health Check Strategy for v2.0 Endpoints (Legacy Audit Integration - OPS-003)

**Extend `/api/health` endpoint to cover new v2.0 functionality:**

**Current Health Check (v1.0):**
```typescript
// GET /api/health
{
  status: "healthy" | "degraded" | "down",
  timestamp: string,
  database: "ok" | "error",
}
```

**Extended Health Check (v2.0):**
```typescript
// GET /api/health
{
  status: "healthy" | "degraded" | "down",
  timestamp: string,
  database: {
    status: "ok" | "error",
    latency_ms: number,
  },
  endpoints: {
    collections: "ok" | "error",      // Can create/read collections?
    organizations: "ok" | "error",    // Can read org profiles?
    animations: "ok" | "error",       // Can save animations?
    versions: "ok" | "error",         // Can read version history?
  },
  storage: {
    status: "ok" | "error",
    usage_percent: number,            // Supabase Storage usage
    remaining_gb: number,
  },
  rate_limiting: {
    status: "ok" | "error",           // In-memory cache working?
    pending_requests: number,
  },
}
```

**Implementation Checklist:**
- ✅ Health check validates read access to core tables (animations, collections, organizations)
- ✅ Latency monitoring for database queries (warn if >500ms)
- ✅ Storage quota monitoring (alert if >80% usage)
- ✅ Rate limiter cache verification (ensure in-memory cache operational)
- ✅ Endpoint returns 503 Service Unavailable if any critical component down
- ✅ Cached for 30 seconds (prevent query storms)

**Monitoring & Alerting:**
- **Health check monitoring**: Monitor `/api/health` every 5 minutes from uptime service
- **Storage alerts**: Alert if usage exceeds 80% (allow scaling before quota exceeded)
- **Latency alerts**: Alert if database latency exceeds 1 second (potential connection pool issues)
- **Rate limiter alerts**: Alert if cache misses exceed 5% (potential memory pressure)

**Rationale:**
- **Legacy Issue OPS-003**: v1.0 lacked health check endpoint, making it hard to detect production issues
- **v2.0 Complexity**: New tables (organizations, collections, versions) + new endpoints require comprehensive monitoring
- **Hampshire RFU Pilot**: Organizations tier requires high reliability (organizational content must be available)

---

## 12. Testing Strategy

### 12.1 E2E Tests for Progressions

**Test: Create base + 3 progressions, reorder, share collection**
```typescript
test('Progression workflow', async ({ page }) => {
  // 1. Create base animation
  await createAnimation(page, 'Ruck Cleanout');

  // 2. Add 3 progressions
  await addProgression(page, 'Add defender');
  await addProgression(page, 'Add second attacker');
  await addProgression(page, 'Full speed');

  // 3. Reorder progressions
  await reorderProgression(page, 2, 1); // Swap order

  // 4. View gallery
  await page.goto('/gallery');
  const card = page.locator('text=Ruck Cleanout + 3 progressions');
  await expect(card).toBeVisible();

  // 5. Share collection
  await card.click();
  const shareButton = page.locator('button:has-text("Share")');
  await shareButton.click();
  const shareUrl = await page.locator('[data-testid="share-url"]').textContent();
  expect(shareUrl).toContain('/collection/');
});
```

### 12.2 E2E Tests for Organizations

**Test: Create org, invite member, create org animation, endorse collection**
```typescript
test('Organization workflow', async ({ page }) => {
  // 1. Create organization (admin only)
  await page.goto('/admin/organizations/new');
  await fillForm(page, {
    name: 'Hampshire RFU',
    slug: 'hampshire-rfu',
    description: 'Official coaching resources'
  });
  await submitForm(page);

  // 2. Invite member
  await inviteMember(page, 'coach@example.com', 'editor');

  // 3. Create org animation (as member)
  await createOrgAnimation(page, 'Official Ruck Drill', 'hampshire-rfu');

  // 4. Create curated collection
  await createCollection(page, 'U12 Fundamentals', ['animation-1', 'animation-2']);

  // 5. Endorse collection
  await endorseCollection(page, 'U12 Fundamentals', 'hampshire-rfu');

  // 6. Verify badge on gallery
  await page.goto('/gallery');
  const badge = page.locator('text=Endorsed by Hampshire RFU');
  await expect(badge).toBeVisible();
});
```

### 12.3 E2E Tests for Version Control

**Test: Save v1.0, edit to v1.1, restore v1.0**
```typescript
test('Version control workflow', async ({ page }) => {
  // 1. Save v1.0
  await createAnimation(page, 'Backline Move');
  await saveAnimation(page); // v1.0

  // 2. Edit and save v1.1
  await editAnimation(page, { title: 'Backline Move (Updated)' });
  await saveAnimation(page, { minor: true }); // v1.1

  // 3. Edit and save v2.0
  await editAnimation(page, { title: 'Backline Move (Major)' });
  await saveAnimation(page, { major: true }); // v2.0

  // 4. View version history
  await page.goto('/my-gallery');
  await clickVersionHistory(page, 'Backline Move (Major)');

  // 5. Restore v1.0
  await restoreVersion(page, 'v1.0'); // Creates v2.1

  // 6. Verify current version
  const currentVersion = await page.locator('[data-testid="current-version"]').textContent();
  expect(currentVersion).toBe('v2.1');
});
```

### 12.4 RLS Policy Tests

**Test: Org member permissions**
```typescript
test('RLS: Org member can read private org', async ({ supabase }) => {
  // Setup
  const { data: org } = await supabase
    .from('organizations')
    .insert({ name: 'Test Org', slug: 'test-org', visibility: 'private' })
    .select()
    .single();

  const { data: member } = await supabase
    .from('organization_members')
    .insert({ organization_id: org.id, user_id: testUser.id, role: 'editor' })
    .select()
    .single();

  // Test
  const { data: readOrg, error } = await supabase
    .from('organizations')
    .select()
    .eq('id', org.id)
    .single();

  expect(error).toBeNull();
  expect(readOrg.id).toBe(org.id);
});
```

### 12.5 Mobile Replay Tests

**Test: Responsive canvas, touch controls**
```typescript
test('Mobile replay workflow', async ({ page, viewport }) => {
  // 1. Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

  // 2. Navigate to replay
  await page.goto('/replay/test-animation-id');

  // 3. Verify canvas scales
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  const canvasWidth = await canvas.evaluate(el => el.clientWidth);
  expect(canvasWidth).toBeLessThanOrEqual(375);

  // 4. Verify touch controls
  const playButton = page.locator('button[aria-label="Play"]');
  const buttonSize = await playButton.boundingBox();
  expect(buttonSize.width).toBeGreaterThanOrEqual(48); // WCAG AAA
  expect(buttonSize.height).toBeGreaterThanOrEqual(48);

  // 5. Verify landscape hint
  const hint = page.locator('text=Rotate device for best viewing');
  await expect(hint).toBeVisible();
});
```

---

## 13. Future Considerations (v3.0)

### 13.1 Deferred Features

**AI Text-to-Animation:**
- Generate starting positions from natural language
- Generate full movement from text descriptions
- Integration with OpenAI API or local LLM

**Mobile Editor Optimization:**
- Touch UX improvements (pinch-to-zoom, multi-touch drag)
- Mobile-optimized entity palette
- Tablet-specific layouts

**User-to-User Following:**
- Social graph (follow users, not just organizations)
- Following feed of new animations
- User discovery and recommendations

**Advanced Analytics:**
- View tracking (respect privacy, no individual tracking)
- Completion rates (how many users watch full animation)
- Popular formations and drill types

**Watermarked Video Exports:**
- Club logo on video exports
- Branding for organizational content

**Collaborative Editing:**
- Real-time multi-user editing
- Conflict resolution
- Commenting on specific frames

---

## 14. Glossary

| Term | Definition |
|------|------------|
| **Progression** | A child animation linked to a base animation via parent-child FK relationship |
| **Base Animation** | The first animation in a progression set (progression_order = 0) |
| **Collection** | A curated set of animations grouped together for organizational endorsements |
| **Organization** | Hampshire RFU or club account with unlimited quota and endorsement rights |
| **Endorsement** | Batch approval of animations in a collection by an organization |
| **Version** | A saved iteration of an animation (v1.0, v1.1, v2.0) |
| **Remix Genealogy** | The full lineage of remixes (A → B → C) |
| **Template** | An animation tagged for use as a starting position |

---

## 15. Appendix: Validation Constants

```typescript
// constants/validation.ts (v2.0 updates)
export const VALIDATION = {
  // ... v1.0 constants ...

  ORGANIZATION: {
    NAME_MAX_LENGTH: 100,
    SLUG_PATTERN: /^[a-z0-9\-]+$/,
    DESCRIPTION_MAX_LENGTH: 500,
    LOGO_MAX_SIZE_KB: 500,
  },

  COLLECTION: {
    NAME_MAX_LENGTH: 100,
    DESCRIPTION_MAX_LENGTH: 1000,
    MAX_ANIMATIONS: 100, // Soft limit
  },

  PROGRESSION: {
    MAX_PER_BASE: 5,
    ORDER_MIN: 0,
    ORDER_MAX: 5,
  },

  VERSION: {
    MAX_ARCHIVED: 3, // Keep latest + 3 archived
    VERSION_PATTERN: /^\d+\.\d+$/,
  },

  PERSONALIZATION: {
    CLUB_NAME_MAX_LENGTH: 100,
    BADGE_MAX_SIZE_KB: 500,
    COLOR_PATTERN: /^#[0-9A-Fa-f]{6}$/,
  },

  VIDEO_URL: {
    YOUTUBE_PATTERN: /^https:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[A-Za-z0-9_-]{11}$/,
    MAX_LENGTH: 500,
  },
} as const;
```

---

## 16. Constitutional Amendment Required

### 16.1 New Tier: Tier 4 (Organizational Accounts)

**Proposed Amendment to Constitution v3.2:**

**Add Section V.2.4 Organizational Features (Tier 4):**

```markdown
#### V.2.4 Organizational Features (Tier 4 - Organizations)

**Organizational accounts for rugby bodies (RFUs, clubs):**
- Unlimited animation quota
- Batch endorsement via collections
- Organization branding (logo, colors)
- Member management (admin/editor/viewer roles)
- Public organization profile page

**Mandatory Safeguards:**
1. **Verification**: Organizations must be verified (manual process initially)
2. **Governance**: Organization owners responsible for member conduct
3. **Transparency**: Public organizations visible to all users
4. **Content Quality**: Endorsed content reflects organizational standards
5. **Privacy**: Org members' personal data not shared with organization admins
```

### 16.2 Constitutional Amendment Status: CA-2026-002 (RATIFIED 2026-02-14)

**Amendment Ratification:**
- ✅ Constitutional Amendment CA-2026-002 approved and ratified 2026-02-14
- ✅ Tier 4 (Organizational Accounts) added to Constitution v3.3.0
- ✅ Section V.2.4 fully implemented with comprehensive governance safeguards
- ✅ Privacy-preserving server-side metrics (V.6.1) approved for mobile optimization

**Governance Review (Per Amendment CA-2026-002):**

**Necessity Test:** ✅ PASS
- Hampshire RFU partnership requires organizational accounts
- Grassroots coaches benefit from curated, endorsed content
- 50-animation quota insufficient for organizational content libraries
- Mobile replay optimization requires privacy-preserving viewport metrics

**Privacy Impact Assessment:** ✅ PASS
- No additional user data collected (org metadata only)
- Org members' personal data remains private
- Organizational content follows same privacy rules as user content
- Privacy-preserving metrics: aggregated counts only, no user tracking

**User Consent Check:** ✅ PASS
- Organizations created by verified admins (manual approval)
- Org members opt-in via invitation
- Public content labeled with org endorsement
- Metrics collected server-side (no client-side tracking scripts)

**Cost Impact:** ✅ ACCEPTABLE
- Unlimited quota offset by sponsorship revenue (Hampshire RFU partnership)
- Storage costs monitored (Supabase free tier: 500MB, paid: $0.125/GB)
- Version control compression mitigates storage growth

**Constitutional Alignment:** ✅ PASS
- Maintains "No telemetry" (org features don't track users, metrics aggregated only)
- Maintains "Minimal data collection" (org metadata only)
- Maintains "User data ownership" (users retain control)
- Maintains "Privacy-first" (org features require explicit consent)

---

## 17. Verification Plan

### 17.1 Pre-Implementation

1. ✅ Review PRD with stakeholders (Hampshire RFU, early adopters)
2. ✅ Validate database schema migrations on staging
3. ✅ Create RLS policy matrix for all new tables
4. ✅ Estimate storage costs (version control, organizations)

### 17.2 During Implementation

1. ✅ Test each migration on production data clone
2. ✅ E2E tests for each new feature
3. ✅ RLS policy tests for organizational access
4. ✅ Mobile responsive tests (280px-800px viewport)

### 17.3 Post-Implementation

1. ✅ User acceptance testing (5 rugby coaches)
2. ✅ Hampshire RFU pilot (create 10 endorsed animations)
3. ✅ Monitor storage growth (version control overhead)
4. ✅ Performance testing (collection queries, progression loading)

---

## 18. Success Criteria Summary

**Launch Criteria (v2.0 Release):**
- ✅ All P0 requirements implemented and tested
- ✅ Hampshire RFU organization account created
- ✅ 10 curated collections with 50+ endorsed animations
- ✅ Mobile replay tested on 5 devices (iPhone, Android)
- ✅ Version control tested with 20+ animations
- ✅ Constitutional amendment approved and ratified

**6-Month Success Metrics:**
- 500 registered users (10x from v1.0)
- 100+ published progression sets
- 60% of replay views on mobile
- 40% of animations have 2+ versions
- 30% of new animations start from templates

**12-Month Vision:**
- 5 organizational accounts (Hampshire RFU + 4 clubs)
- 200+ curated collections
- 1000+ registered users
- v3.0 planning with AI text-to-animation

---

# Amendment Log: v2.1

**Version:** 2.1
**Date:** 20 February 2026
**Author:** Wayne Ellis
**Status:** Active
**Source:** Post-deployment quality review of backlog sprint (commit `83dfce4`)

---

## Amendment A2.1-1 — Bug: Admin Animations Search Pagination

**Severity:** Bug (P1)
**Affected file:** `src/app/api/admin/animations/route.ts`

The `.range()` clause is applied to the Supabase query before the `.ilike()` search filter, meaning paginated results when a search term is present are incorrect. The range slices the unfiltered dataset first, then filters, so page 2 of a search will return wrong rows.

**Required fix:** Apply `.ilike()` before `.range()` in the query chain.

---

## Amendment A2.1-2 — Bug: Entity Propagation Missing from Duplicate Action

**Severity:** Medium
**Affected file:** `src/features/animation/components/Editor.tsx`

`handleContextMenuDuplicate` calls `addEntity()` directly, bypassing `addEntityWithPropagate()`. On a multi-frame animation, duplicating an entity via the context menu silently adds it to only the current frame with no propagation offer — inconsistent with the palette add flow.

**Required fix:** Replace the `addEntity()` call in `handleContextMenuDuplicate` with `addEntityWithPropagate()`.

---

## Amendment A2.1-3 — UX: Back-to-Site Link Positioning on Share Page

**Severity:** Medium
**Affected file:** `src/features/animation/components/ShareViewer.tsx`

The back-to-site link uses `absolute bottom-4 right-4` but its containing element (`relative flex flex-col items-center w-full`) is content-height only, not viewport-height. On short or single-frame animations the link appears immediately below the controls rather than at the bottom of the viewport.

**Required fix:** Either position relative to the viewport (e.g. `fixed bottom-4 right-4`) or move the link outside the `ShareViewer` into the share page layout where a viewport-relative anchor is appropriate.

---

## Amendment A2.1-4 — UX: Editor Sidebar Green Header Artifact

**Severity:** Low
**Affected file:** `src/features/animation/components/Editor.tsx`

Removing the logo/nav block from the sidebar left the `bg-pitch-green` `<aside>` with no visible content above the white `bg-tactics-white` scroll area. This renders as a thin green strip at the top of the sidebar that serves no purpose.

**Required fix:** Either remove the green background from `<aside>` (use `bg-tactics-white` for the full sidebar), or add a minimal header (e.g. app name or back-to-gallery link) to intentionally occupy that space.

---

## Amendment A2.1-5 — Performance: EntityLayer LAYER_ORDER Constant

**Severity:** Low
**Affected file:** `src/features/animation/components/Canvas/EntityLayer.tsx`

`LAYER_ORDER` is defined inside the component render function and recreated on every render cycle. As a pure constant it should be hoisted to module scope.

**Required fix:** Move `LAYER_ORDER` outside the component to module level.

---

## Amendment A2.1-6 — UX: Mobile Nav Dropdown Animation

**Severity:** Low
**Affected file:** `src/shared/components/Navigation.tsx`

The mobile hamburger menu appears and disappears with no transition — the dropdown renders/unmounts instantly. A subtle slide or fade would match the polish level of the rest of the UI.

**Required fix:** Add a CSS transition to the mobile dropdown, e.g. using Tailwind's `animate-in slide-in-from-top-2` or a simple height transition with `overflow-hidden`.

---

## Amendment A2.1-7 — Visual: 5-Yard Lines Overlap 22m Lines on SVG Pitch

**Severity:** Low
**Affected file:** `public/assets/fields/rugby-union.svg`

The 3rd 5-yard tick line from each try line (`x=446` from left, `x=1554` from right) sits only 6px from the 22m line (`x=440`, `x=1560`). At rendered canvas scale these visually merge into a double-line artifact. In a real rugby union pitch, the 15m line (not 5-yard increments all the way to 22m) is the relevant marking in that zone.

**Required fix (option A):** Drop the 3rd tick line from each side so ticks only go to 10 yards (2 lines per side).
**Required fix (option B):** Replace with accurate markings — 5m, 10m, 15m from each try line, stopping before the 22m zone.

---

## Amendment A2.1-8 — Data: Admin Animations Table Fetches Unused user_id

**Severity:** Low
**Affected file:** `src/app/api/admin/animations/route.ts`

`user_id` is included in the SELECT but is not rendered in the admin UI table. This is either dead weight in the response payload or unfinished intent (showing the author).

**Required fix:** Either remove `user_id` from the SELECT, or surface it in the table as an "Author ID" column (or join to `user_profiles` for a display name).

---

## Amendment A2.1-9 — Doc: Save & Share Workflow Documented (§5.13)

**Severity:** Doc-hygiene
**Affected files:** `docs/authority/PRD-v2.0.md`

The PRD specified individual save/persist/visibility *requirements* but never narrated the coach-facing save→share→gallery flow as prose. This made FLOW-001 / FLOW-002 / UX-008 recurring issues and left the visibility values (`private` | `link_shared` | `public`) undocumented in user-facing terms.

**Resolution:** Added §5.13 *Save & Share Workflow (As Built)* with the mental model, endpoint table, visibility surface matrix, coach workflow narrative, and a cross-reference clarifying the relationship to §6.1.

---

## Amendment A2.1-10 — UX: Editor Workspace Remodel (Phase 2i)

**Severity:** High (Usability & Productivity)
**Affected files:** `src/features/animation/components/Editor.tsx`, `src/features/animation/components/Canvas/EditorFloatingRemote.tsx`, `src/features/animation/components/ProgressionPanel.tsx`, `src/features/animation/components/MobileDrawer.tsx`

The editor UI had suboptimal real-estate usage on desktop (fixed-width sidebar) and was unusable on small viewports (<768px) due to a blocking `MobileWarning` banner. The workspace needed to adapt to different usage contexts (creation, presentation, and mobile review).

**Required fix:** 
1. **Collapsible Sidebar**: Sidebar should be collapsible to zero-width to reclaim canvas space. State must persist across sessions.
2. **Focus Mode**: A "presentation-first" mode that hides all UI chrome (sidebar, footer, progression header) leaving only the canvas and essential floating controls.
3. **Mobile Drawer**: Replace the mobile blocking banner with a functional bottom drawer that provides access to entity palettes and project actions on small viewports.
4. **Enhanced Remote**: The floating playback remote should expand to provide frame-level controls (Add Frame, Pace, Loop, Ghosting) to avoid footer dependency.

**Resolution:** Implemented via spec `012-editor-workspace-remodel`. Sidebar collapse, Focus Mode, and Mobile Drawer are now operational and verified.

**Document End**

