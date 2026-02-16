# Coaching Animator v2.0 Upgrade Plan (Phase 0-1)

## Context

Coaching Animator v1.0 is a cloud-enabled personal animation tool for sports coaches (89% PRD v1.0 coverage). v2.0 transforms it into a **rugby coaching platform**. This plan covers **Phase 0 (Cleanup & Prep)** and **Phase 1 (Collections + Version Control + Templates)** only. Phases 2-4 (Progressions, Organizations, Personalization) will be planned separately after Phase 1 ships.

**PRD**: `docs/authority/PRD-v2.0.md`
**Constitution**: `docs/authority/constitution.md` (v3.3)

---

## CLEO Structure

```
Epic: "V2.0 Upgrade - Phase 0-1"
├── T-Phase0: Cleanup & Prep
│   ├── T01: Drop legacy tables (shares, follows)
│   ├── T02: Remove grid overlay
│   ├── T03: Remove marker entity type + auto-convert
│   ├── T04: Rugby-only sport selector
│   ├── T05: Verify Safari/iOS GIF export
│   ├── T06: Create staging Supabase project
│   └── T07: Mobile replay optimization (P0 - MAKE-OR-BREAK)
└── T-Phase1: Collections + Versions + Templates
    ├── T08: Migration - Collections + video_url columns
    ├── T09: Migration - Version history table + trigger
    ├── T10: API - Collections CRUD + items
    ├── T11: API - Version history + restore
    ├── T12: Update animations API for v2.0 fields
    ├── T13: UI - Collection cards + template filter in gallery
    ├── T14: UI - Collection detail page
    ├── T15: UI - Version history modal
    ├── T16: UI - Video URL in editor + replay viewer
    └── T17: E2E tests - Phase 0-1
```

---

## Dependency Graph

```
Phase 0 (all parallel, no cross-deps):
T01 ─┐
T02 ─┤
T03 ─┤
T04 ─┼──► Phase 1 start
T05 ─┤
T06 ─┤
T07 ─┘  ← Mobile Replay (P0, early confidence builder)

Phase 1:
T08 ─► T10 ─► T12 ─► T13 ─► T14 ─┐
T09 ─► T11 ─► T12 ─┘              ├──► T17 (E2E)
                    T16 ───────────┘
                    T15 ───────────┘
```

---

## Phase 0: Cleanup & Prep

### T01: Drop legacy tables

Drop `shares` and `follows` tables. Both are unused (shares deprecated, follows had no UI).

**Migration SQL**:
```sql
DROP TABLE IF EXISTS shares CASCADE;
DROP TABLE IF EXISTS follows CASCADE;
```

**Also update**:
- Remove `/api/share` route (if it references `shares` table)
- Update replay viewer to remove `shares` table fallback lookup

**Files**: New migration SQL, possibly `src/app/api/share/route.ts`, replay viewer
**Verify**: Migration applies cleanly, replay viewer still works for `saved_animations`-based links

---

### T02: Remove grid overlay

Grid overlay toggle is rarely used (PRD Section 6.3). Remove component, state, and UI toggle.

**Files to modify**:
- `src/features/animation/components/Canvas/GridOverlay.tsx` → DELETE
- `src/core/stores/uiStore.ts` → Remove `showGrid` state and `toggleGrid` action
- `src/features/animation/components/Timeline/PlaybackControls.tsx` → Remove grid toggle button
- `src/features/animation/components/Editor.tsx` → Remove GridOverlay import/usage
- `src/features/animation/components/ReplayViewer.tsx` → Remove GridOverlay if used

**Verify**: `npm run lint && npx tsc --noEmit`, no visual regression in editor/replay

---

### T03: Remove marker entity type + auto-convert

Marker entity deprecated. Auto-convert existing markers to cones on load.

**Files to modify**:
- `src/core/types/index.ts` → Remove `'marker'` from `ENTITY_TYPES`
- `src/features/animation/services/entityColors.ts` → Remove marker color mapping
- `src/features/animation/components/Sidebar/EntityPalette.tsx` → Remove marker option (may already be gone)
- Create/extend payload hydration utility to convert `type: 'marker'` → `type: 'cone'` on load
- Show toast notification when conversion happens

**Verify**: Load old JSON with markers, confirm they render as cones. TypeScript compiles with no marker references.

---

### T04: Rugby-only sport selector

Filter sport dropdown to rugby types only. Keep all sport code behind feature flag.

**Files to modify**:
- `src/core/constants/fields.ts` → Add `VISIBLE_SPORTS = ['rugby-union', 'rugby-league'] as const`
- `src/features/animation/components/Sidebar/SportSelector.tsx` → Filter options to `VISIBLE_SPORTS`
- Default new projects to `rugby-union`

**Verify**: Dropdown shows only Rugby Union/League. Existing soccer/AmFoot animations still load correctly.

---

### T05: Verify Safari/iOS GIF export

`gif.js` already in dependencies. Audit and verify the export path works.

**Audit**:
- Check `src/core/hooks/useExport.ts` for GIF export logic
- Check if `src/lib/browser-detect.ts` exists
- If working: document it, mark PRD F-EXPORT items as covered
- If incomplete: implement browser detection + GIF fallback + format selector in export modal

**Files**: `useExport.ts`, `browser-detect.ts` (verify or create)
**Verify**: Export from Safari/iOS produces valid GIF file

---

### T06: Create staging Supabase project

Set up staging environment for safe migration testing.

**Steps**:
1. Create new Supabase project (staging)
2. Apply all existing migrations to staging
3. Create `.env.staging` with staging credentials
4. Document staging workflow

**Files**: `.env.staging.example` (NEW), staging workflow docs
**Verify**: Staging Supabase accessible, migrations apply cleanly

---

### T07: Mobile replay optimization (P0 - MAKE-OR-BREAK)

PRD Section 5.1 identifies mobile replay as the highest-impact feature. Players receive WhatsApp links from coaches and view on mobile. This task ensures the replay experience is excellent on 280px-800px viewports.

**Audit first** (F-MOB-01 may already be partially done per PRD note about HIGH-006):
- Check `ReplayViewer.tsx` and `Stage.tsx` for responsive canvas behavior
- Check `PlaybackControls.tsx` for touch target sizes
- Measure actual button sizes against WCAG AAA 48x48px minimum

**Implement/fix**:
1. **Responsive canvas** (F-MOB-01): Canvas scales to viewport width maintaining 4:3 aspect ratio (280px-800px)
2. **Touch-friendly controls** (F-MOB-02): All playback buttons min 48x48px touch targets
3. **Landscape hint** (F-MOB-03): Show "Rotate device for best viewing" banner on portrait screens <600px width. Dismissable.
4. **Mobile editor warning** (F-MOB-04): Show "Desktop recommended for editing" banner on `/app` route when viewport <768px. Dismissable.
5. **Coaching notes mobile layout** (F-MOB-05): Ensure notes visible without horizontal scrolling on mobile

**Files to modify**:
- `src/features/animation/components/ReplayViewer.tsx` (responsive layout, landscape hint)
- `src/features/animation/components/Canvas/Stage.tsx` (canvas scaling)
- `src/features/animation/components/Timeline/PlaybackControls.tsx` (touch target sizes)
- `src/features/animation/components/Editor.tsx` (mobile warning banner)

**Verify**:
- Set browser viewport to 375x667 (iPhone SE): canvas renders, controls usable
- Set viewport to 412x915 (Pixel 7): same checks
- Landscape hint appears in portrait <600px, dismissed with tap
- Editor warning appears on mobile, dismissed with tap
- **CRITICAL**: Test in BOTH `/app` (editor) AND `/replay/[id]` (shared canvas components)

---

## Phase 1: Collections + Version Control + Templates

### T08: Migration - Collections tables + video_url

Create `collections` and `collection_items` tables. Add `video_url` column to `saved_animations`.

**New table: `collections`**:
```sql
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  description TEXT CHECK (char_length(description) <= 1000),
  visibility TEXT CHECK (visibility IN ('private', 'public')) DEFAULT 'public',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**New table: `collection_items`**:
```sql
CREATE TABLE collection_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  animation_id UUID NOT NULL REFERENCES saved_animations(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(collection_id, animation_id)
);
```

**New column on `saved_animations`**:
```sql
ALTER TABLE saved_animations ADD COLUMN
  video_url TEXT CHECK (
    video_url IS NULL OR
    video_url ~ '^https://(www\.)?(youtube\.com/watch\?v=|youtu\.be/)[A-Za-z0-9_-]{11}'
  );
```

**RLS policies**: Public collections readable by all, owner-only write. Collection items follow collection ownership.

**Note**: No `organization_id` column on `collections` yet - that gets added in Phase 3 when the `organizations` table exists.

**Files**: `supabase/migrations/YYYYMMDDHHMMSS_collections_and_video.sql`
**Verify**: Apply to staging, test RLS with different users, YouTube URL regex validates correctly

---

### T09: Migration - Version history table + auto-cleanup trigger

Create `animation_versions` table with auto-cleanup.

**New table: `animation_versions`**:
```sql
CREATE TABLE animation_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animation_id UUID NOT NULL REFERENCES saved_animations(id) ON DELETE CASCADE,
  version_number TEXT NOT NULL,
  major_version INTEGER NOT NULL,
  minor_version INTEGER NOT NULL,
  payload JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(animation_id, version_number)
);
```

**New column on `saved_animations`**:
```sql
ALTER TABLE saved_animations ADD COLUMN current_version TEXT DEFAULT '1.0';
```

**Auto-cleanup trigger**: Delete versions beyond latest + 3 after each INSERT.

**RLS**: Owner-only read/write via animation ownership check.

**Files**: `supabase/migrations/YYYYMMDDHHMMSS_version_history.sql`
**Verify**: Insert 6 versions for same animation, confirm only 4 remain

---

### T10: API - Collections CRUD + items

7 endpoints for collection management.

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/collections` | POST | Required | Create collection |
| `/api/collections` | GET | Optional | List collections (filters: user_id, visibility) |
| `/api/collections/[id]` | GET | Optional | Get collection with animations |
| `/api/collections/[id]` | PUT | Owner | Update metadata |
| `/api/collections/[id]` | DELETE | Owner | Delete collection |
| `/api/collections/[id]/animations` | POST | Owner | Add animation to collection |
| `/api/collections/[id]/animations/[animationId]` | DELETE | Owner | Remove from collection |

**Files**:
- `src/app/api/collections/route.ts` (NEW)
- `src/app/api/collections/[id]/route.ts` (NEW)
- `src/app/api/collections/[id]/animations/route.ts` (NEW)
- `src/app/api/collections/[id]/animations/[animationId]/route.ts` (NEW)
- `src/lib/schemas/collections.ts` (NEW - Zod schemas)

**Verify**: Full CRUD cycle, ownership enforcement, rate limiting

---

### T11: API - Version history + restore

2 endpoints for version management.

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/animations/[id]/versions` | GET | Owner | List versions (newest first) |
| `/api/animations/[id]/versions/[versionId]/restore` | POST | Owner | Restore old version (creates new) |

**Restore logic**: Read old version's payload -> determine next version number -> create new version with that payload -> update `saved_animations.current_version`.

**Files**:
- `src/app/api/animations/[id]/versions/route.ts` (NEW)
- `src/app/api/animations/[id]/versions/[versionId]/restore/route.ts` (NEW)

**Verify**: List returns newest-first, restore v1.0 after v2.0 creates v2.1

---

### T12: Update animations API for v2.0 fields

Extend existing animation endpoints for version creation, video URLs, and tag filtering.

**Changes to `POST /api/animations`**:
- Accept `video_url` field (validate YouTube format)
- On first save, create v1.0 entry in `animation_versions`
- Set `current_version = '1.0'` on `saved_animations`

**Changes to `PUT /api/animations/[id]`**:
- On update, auto-create new version (minor by default)
- Accept `is_major_version` boolean -> increments major version
- Save payload snapshot to `animation_versions`

**Changes to `GET /api/gallery`**:
- Add `tags` query param filter (comma-separated)
- Support filtering for template-tagged animations

**Files**:
- `src/app/api/animations/route.ts` (extend POST)
- `src/app/api/animations/[id]/route.ts` (extend PUT)
- `src/app/api/gallery/route.ts` (extend GET with tags filter)
- `src/lib/schemas/animations.ts` (add video_url, is_major_version)

**Verify**: Save with video_url validates, update creates version entry, gallery filters by tags

---

### T13: UI - Collection cards + template filter in gallery

Update gallery UI to show collections and templates.

**Gallery page changes**:
- Add "Templates Only" checkbox filter
- Add collections section (or mix into gallery feed)

**PublicAnimationCard changes**:
- Show blue "Template" pill badge if `tags.includes('template')`
- Show "Use Template" button (alias for existing remix flow)

**Files**:
- `src/features/gallery/components/PublicAnimationCard.tsx` (extend)
- `src/app/gallery/page.tsx` (add filter checkbox, collection support)

**Verify**: Template badge visible, filter works, "Use Template" clones animation

---

### T14: UI - Collection detail page

New page showing all animations in a collection.

**Route**: `/collections/[id]`

**Layout**:
- Collection name, description, owner attribution
- Grid of animation cards (reuse existing card components)
- "Share Collection" button (copies URL)

**Files**:
- `src/app/collections/[id]/page.tsx` (NEW)

**Verify**: Page loads with all animations, share button works, responsive layout

---

### T15: UI - Version history modal

Modal accessible from personal gallery (my-gallery) showing version timeline.

**Component**: `VersionHistoryModal`
- Triggered from "Version History" button on `AnimationCard.tsx`
- Lists versions newest-first with version number, date, author
- "Restore" button on each non-current version
- Restore creates new version and refreshes list

**Files**:
- `src/features/gallery/components/VersionHistoryModal.tsx` (NEW)
- `src/features/gallery/components/AnimationCard.tsx` (add Version History button)

**Verify**: Modal shows versions, restore creates new version, list refreshes

---

### T16: UI - Video URL in editor + replay viewer

Add YouTube video URL field to animation metadata and display in replay.

**Editor changes**:
- Add video URL text input to metadata/settings section
- Client-side YouTube URL validation
- Clear error messaging for invalid URLs

**Replay viewer changes**:
- Show "Watch Tutorial Video" link below coaching notes
- Link opens in new tab with `rel="noopener noreferrer"`
- Only visible when `video_url` is set

**Files**:
- Editor metadata section (likely in Sidebar or ProjectActions)
- `src/features/animation/components/ReplayViewer.tsx` (add video link)

**Verify**: Add YouTube URL in editor, save, view in replay, link opens new tab

---

### T17: E2E tests - Phase 0-1

Comprehensive tests covering all Phase 0-1 work.

**Test suites**:
1. **Cleanup tests**: Grid overlay gone, marker auto-converts, rugby-only dropdown
2. **Mobile replay**: Responsive canvas at 375px/412px, touch targets 48x48px, landscape hint, editor warning
3. **Collections**: Create collection, add animations, view detail page, share link
4. **Versions**: Save v1.0, edit to v1.1, view history, restore v1.0 (creates v2.1)
5. **Templates**: Tag animation as template, filter gallery, use template
6. **Video URL**: Add YouTube URL, verify in replay viewer

**Files**:
- `tests/e2e/cleanup-v2.spec.ts` (NEW)
- `tests/e2e/collections.spec.ts` (NEW)
- `tests/e2e/versions.spec.ts` (NEW)

**Verify**: All tests pass on staging, then on production

---

## Key Files Reference

| Purpose | File Path |
|---------|-----------|
| Entity types | `src/core/types/index.ts` |
| Entity colors (MANDATORY) | `src/features/animation/services/entityColors.ts` |
| Project store | `src/core/stores/projectStore.ts` |
| UI store | `src/core/stores/uiStore.ts` |
| Editor | `src/features/animation/components/Editor.tsx` |
| Replay viewer | `src/features/animation/components/ReplayViewer.tsx` |
| Gallery card (public) | `src/features/gallery/components/PublicAnimationCard.tsx` |
| Gallery card (personal) | `src/features/gallery/components/AnimationCard.tsx` |
| Sport selector | `src/features/animation/components/Sidebar/SportSelector.tsx` |
| Grid overlay (DELETE) | `src/features/animation/components/Canvas/GridOverlay.tsx` |
| Playback controls | `src/features/animation/components/Timeline/PlaybackControls.tsx` |
| Field constants | `src/core/constants/fields.ts` |
| Animations API | `src/app/api/animations/route.ts` |
| Gallery API | `src/app/api/gallery/route.ts` |
| Zod schemas | `src/lib/schemas/animations.ts` |
| Supabase client | `src/lib/supabase/client.ts` |
| Supabase server | `src/lib/supabase/server.ts` |
| Migrations dir | `supabase/migrations/` |

---

## Verification Checklist (run after each task)

1. `npm run lint` passes
2. `npx tsc --noEmit` passes
3. Existing E2E tests still pass
4. Manual smoke test of affected routes
5. CLEO task status updated

## Rollback Plan (Phase 1)

```sql
-- If Phase 1 needs rollback:
DROP TABLE IF EXISTS collection_items CASCADE;
DROP TABLE IF EXISTS collections CASCADE;
DROP TABLE IF EXISTS animation_versions CASCADE;
ALTER TABLE saved_animations DROP COLUMN IF EXISTS video_url;
ALTER TABLE saved_animations DROP COLUMN IF EXISTS current_version;
```
