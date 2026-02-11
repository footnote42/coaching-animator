# Coaching Animator v2.0 Vision Summary

**Created:** 2026-02-11
**Status:** Planning Complete - Awaiting Stakeholder Review

---

## Executive Summary

Coaching Animator v2.0 represents a strategic pivot from **personal animation tool** to **rugby coaching platform**. Driven by user feedback from grassroots coaches and Hampshire RFU partnership discussions, v2.0 introduces organizational features, pedagogical progressions, and mobile-optimized replay to support rugby coaching at scale.

**v1.0 Achievement:** 89% PRD coverage, cloud-enabled personal tool with galleries and social features.

**v2.0 Mission:** Transform into rugby coaching platform with organizational content curation, pedagogical progressions, and mobile-first replay.

---

## Key User Feedback Driving v2.0

### 1. Mobile Viewing is Make-or-Break
> "Replay feature on mobile is make-or-break. Generation on touch screen is minor requirement but viewing animation on mobile is critical." - Grassroots Coach

**v2.0 Response:**
- Responsive canvas (280px-800px viewport)
- Touch-friendly playback controls (48×48px, WCAG AAA)
- Landscape orientation hint for small screens
- Mobile editor retains basic functionality with warning banner

### 2. Pedagogical Progressions Missing
> "Animations need to be grouped into progressions. Base drill advances to progressions where players move differently or defender introduced. 3 progressions typical, could be more." - Rugby Coach

**v2.0 Response:**
- Parent-child FK relationship (base + up to 5 progressions)
- ONE gallery card per progression set ("Base + 3 progressions")
- Collection detail page shows base + progressions in vertical sequence
- Share entire progression set with single link

### 3. Organizational Sponsorship
> "Hampshire RFU wants to endorse animations and promote good practice. Alongside upvoting, option to highlight animations endorsed by constituent body." - Hampshire RFU Coach

**v2.0 Response:**
- Organizational accounts with unlimited quota
- Curated collections with batch endorsement
- "Endorsed by Hampshire RFU" badges on gallery cards
- Organization profile pages with endorsed content library

### 4. Version Control Gaps
> "Users want to edit creations without starting from scratch. Create, edit, publish, amend minor versions." - Coach

**v2.0 Response:**
- Auto-increment versions (v1.0 → v1.1 → v2.0)
- Keep latest + 3 archived versions
- Version history page with restore functionality
- Versions don't count toward user quota

### 5. Template Library Needed
> "AI text-to-animation deferred to v3.0, but starting positions and template suggestions should be included as non-AI search/filter/template option." - Coach

**v2.0 Response:**
- "Template" tag for animations
- Gallery filter: "Show Templates Only"
- Template badge on animation cards
- "Use Template" button (alias for Remix)
- Hampshire RFU curated templates

### 6. Sport Focus Shift
> "Focus on rugby only. Leave door open to other sports but primacy to rugby features." - Multiple Coaches

**v2.0 Response:**
- Hide soccer/American football from UI (keep code via feature flag)
- Default to Rugby Union for new animations
- Gallery filters show rugby types only

### 7. Personalization Request
> "Users should personalize UI with club badges and set strip default colors to match club colors." - Club Coach

**v2.0 Response:**
- Upload club badge (max 500KB, PNG/JPG/SVG)
- Set primary/secondary strip colors
- New players default to club colors
- Animation metadata includes club name (searchable)

---

## v2.0 Feature Matrix

### New Features (P0)

| Feature | User Benefit | Implementation |
|---------|--------------|----------------|
| **Animation Progressions** | Teach skills incrementally (base → advanced) | Parent-child FK, progression_order field |
| **Organizational Accounts** | Hampshire RFU + clubs endorse quality content | Organizations table, unlimited quota |
| **Curated Collections** | Batch endorsement of related drills | Collections table, many-to-many relationship |
| **Version Control** | Iterate without starting over | Animation_versions table, auto-cleanup trigger |
| **Mobile Replay** | WhatsApp sharing to players on mobile | Responsive canvas, touch controls |

### Enhanced Features (P1)

| Feature | User Benefit | Implementation |
|---------|--------------|----------------|
| **Remix Genealogy** | Track remix lineage (A → B → C) | Remixed_from_id FK, remix_count counter |
| **Template Library** | Start from common formations | "Template" tag, gallery filter |
| **Club Personalization** | Branding with club badges/colors | User_profiles columns, file upload |
| **Video Links** | Link YouTube tutorials to animations | Video_url column, YouTube validation |

### Removed Features

| Feature | Rationale | Migration |
|---------|-----------|-----------|
| **Legacy Shares Table** | Deprecated in v1.0 (90-day expiry) | Delete table, show migration notice |
| **Follow System** | No UI/API exists, defer to v3.0 | Delete table |
| **Grid Overlay Toggle** | Rarely used, simplifies UI | Delete grid logic (~50 lines) |
| **Marker Entity Type** | Deprecated, ~5-10% usage | Auto-convert to cones |

---

## Database Schema Changes

### New Tables (5)

1. **organizations** - Hampshire RFU and club accounts
2. **organization_members** - Member management with roles (admin/editor/viewer)
3. **animation_versions** - Version history (latest + 3 archived)
4. **collections** - Curated sets of animations
5. **collection_items** - Many-to-many relationship

### Schema Updates

**saved_animations** (10 new columns):
- `parent_animation_id`, `progression_order`, `is_progression` (Progressions)
- `organization_id` (Organizations)
- `current_version` (Version Control)
- `remixed_from_id`, `remix_count` (Remix Genealogy)
- `video_url` (YouTube Links)

**user_profiles** (4 new columns):
- `club_name`, `club_badge_url`, `primary_strip_color`, `secondary_strip_color` (Personalization)

### Deleted Tables (2)

- `shares` (deprecated)
- `follows` (deferred to v3.0)

---

## API Endpoints (New)

### Organizations
- `POST /api/organizations` - Create organization
- `GET /api/organizations` - List organizations
- `GET /api/organizations/[id]` - Get organization profile
- `PUT /api/organizations/[id]` - Update organization
- `DELETE /api/organizations/[id]` - Delete organization
- `POST /api/organizations/[id]/members` - Add member
- `DELETE /api/organizations/[id]/members/[userId]` - Remove member
- `GET /api/organizations/[id]/members` - List members

### Collections
- `POST /api/collections` - Create collection
- `GET /api/collections` - List collections
- `GET /api/collections/[id]` - Get collection detail
- `PUT /api/collections/[id]` - Update collection
- `DELETE /api/collections/[id]` - Delete collection
- `POST /api/collections/[id]/animations` - Add animation to collection
- `DELETE /api/collections/[id]/animations/[animationId]` - Remove animation

### Versions
- `GET /api/animations/[id]/versions` - List version history
- `POST /api/animations/[id]/versions/[versionId]/restore` - Restore old version

### Endorsements
- `POST /api/collections/[id]/endorse` - Batch endorse collection

---

## Phased Rollout Plan

### Phase 1 (v2.0): Collections + Version Control + Template Library
**Duration:** 2 weeks

**Deliverables:**
- New tables: `collections`, `collection_items`, `animation_versions`
- New columns: `video_url`, `tags`
- Collections CRUD API
- Version history API
- UI: Collection cards, version history modal, template filter
- E2E tests

**Risk:** Low (independent features, no breaking changes)

### Phase 2 (v2.1): Progressions + Remix Genealogy
**Duration:** 1.5 weeks

**Deliverables:**
- New columns: `parent_animation_id`, `progression_order`, `is_progression`, `remixed_from_id`, `remix_count`
- Remix count trigger
- UI: Progression cards, genealogy breadcrumb
- E2E tests

**Risk:** Low (schema changes only affect new features)

### Phase 3 (v2.2): Organizations + Endorsements
**Duration:** 2 weeks

**Deliverables:**
- New tables: `organizations`, `organization_members`
- Organizations CRUD API
- Endorsement API
- UI: Organization profile, member management, endorsement badges
- RLS policy tests

**Risk:** Medium (RLS complexity, member permissions)

### Phase 4 (v2.3): Personalization + Video Links
**Duration:** 1 week

**Deliverables:**
- New columns: `club_name`, `club_badge_url`, `primary_strip_color`, `secondary_strip_color`
- File upload for club badges
- UI: Personalization settings, video link display
- E2E tests

**Risk:** Low (cosmetic features)

**Total Duration:** 6.5 weeks

---

## Success Metrics

### Launch Criteria (v2.0 Release)

- ✅ All P0 requirements implemented and tested
- ✅ Hampshire RFU organization account created
- ✅ 10 curated collections with 50+ endorsed animations
- ✅ Mobile replay tested on 5 devices (iPhone, Android)
- ✅ Version control tested with 20+ animations
- ✅ Constitutional amendment approved (Tier 4 Organizational)

### 6-Month Targets

| Metric | v1.0 Baseline | v2.0 Target | Measurement |
|--------|---------------|-------------|-------------|
| **Registered Users** | 50 | 500 (10x) | User accounts |
| **Hampshire RFU Content** | 0 | 50+ drills | Org-owned animations |
| **Mobile Replay Views** | 20% | 60% | Device analytics |
| **Progression Sets** | 0 | 100+ | Parent animations with children |
| **Template Usage** | 0 | 30% start from templates | Remix from template tag |
| **Version Iteration** | 0 | 40% have 2+ versions | Version count > 1 |

### 12-Month Vision

- 5 organizational accounts (Hampshire RFU + 4 clubs)
- 200+ curated collections
- 1000+ registered users
- v3.0 planning with AI text-to-animation

---

## Constitutional Amendment Required

### New Tier: Tier 4 (Organizational Accounts)

**Proposed Amendment to Constitution v3.2:**

Add Section **V.2.4 Organizational Features (Tier 4 - Organizations)**:

**Capabilities:**
- Unlimited animation quota
- Batch endorsement via collections
- Organization branding (logo, colors)
- Member management (admin/editor/viewer roles)
- Public organization profile page

**Safeguards:**
1. **Verification:** Organizations must be verified (manual approval initially)
2. **Governance:** Org owners responsible for member conduct
3. **Transparency:** Public organizations visible to all users
4. **Content Quality:** Endorsed content reflects organizational standards
5. **Privacy:** Org members' personal data not shared with admins

**Governance Review:**
- ✅ **Necessity Test:** Hampshire RFU partnership requires organizational accounts
- ✅ **Privacy Impact:** No additional user data collected (org metadata only)
- ✅ **User Consent:** Org members opt-in via invitation
- ✅ **Cost Impact:** Unlimited quota offset by sponsorship revenue

---

## Critical Risks & Mitigation

### Risk 1: Database Migration Complexity

**Issue:** 5 new tables + 10 new columns in `saved_animations` + cascade triggers

**Mitigation:**
- Phase migrations over 4 releases (v2.0, v2.1, v2.2, v2.3)
- Start with low-risk features (collections, version control)
- Defer organizations to v2.2 (higher RLS complexity)
- Test on staging database with production data clone

**Probability:** Medium | **Impact:** High | **Status:** Mitigated

### Risk 2: Version Control Storage Explosion

**Issue:** Latest + 3 archived versions = 4x storage per animation

**Mitigation:**
- Implement compression for archived versions (gzip JSONB payload)
- Monitor storage costs (Supabase free tier: 500MB, paid: $0.125/GB)
- Auto-cleanup trigger enforces 4-version limit
- Consider storing diffs instead of full payloads (v3.0 optimization)

**Probability:** Medium | **Impact:** Medium | **Status:** Monitored

### Risk 3: Organizational RLS Complexity

**Issue:** New access patterns (org members can edit org-owned animations)

**Mitigation:**
- Use Supabase RLS helper functions (`auth.uid()`, `auth.jwt()`)
- Test RLS policies with multiple user roles (admin/editor/viewer)
- Document permission matrix in `docs/architecture/organization-permissions.md`

**Probability:** Medium | **Impact:** High | **Status:** Planned

### Risk 4: Breaking Changes for Existing Users

**Issue:** Removed features (grid overlay, follow system, legacy shares)

**Mitigation:**
- **Grid Overlay:** Low usage, no data loss
- **Follow System:** No UI existed, table deletion invisible to users
- **Legacy Shares:** Migration notice on old links, encourage re-share
- **Marker Entities:** Auto-convert to cones, show toast notification

**Probability:** Low | **Impact:** Low | **Status:** Acceptable

---

## Next Steps

### Immediate (Week 1)

1. **Stakeholder Review** - Present v2.0 PRD to Hampshire RFU and early adopters
2. **Constitutional Amendment** - Draft Tier 4 amendment for approval
3. **Storage Cost Estimation** - Calculate version control + org storage costs
4. **RLS Policy Matrix** - Document all organizational access patterns

### Short-Term (Weeks 2-3)

1. **Phase 1 Implementation** - Collections + Version Control + Template Library
2. **Staging Database Setup** - Clone production data for migration testing
3. **E2E Test Suite** - Write tests for collections and versions
4. **Hampshire RFU Pilot** - Onboard as first organizational account

### Medium-Term (Weeks 4-7)

1. **Phase 2 Implementation** - Progressions + Remix Genealogy
2. **Phase 3 Implementation** - Organizations + Endorsements
3. **Phase 4 Implementation** - Personalization + Video Links
4. **User Acceptance Testing** - 5 rugby coaches test v2.0 features

### Long-Term (6-12 Months)

1. **v2.0 Launch** - Full production rollout
2. **Monitor Success Metrics** - Track adoption, mobile usage, progression sets
3. **Hampshire RFU Content Library** - 50+ endorsed animations
4. **v3.0 Planning** - AI text-to-animation, collaborative editing

---

## Feature Comparison: v1.0 vs v2.0

| Feature | v1.0 | v2.0 | Change |
|---------|------|------|--------|
| **User Accounts** | ✅ Email/password + OAuth | ✅ Same | - |
| **Cloud Storage** | ✅ 50 animations per user | ✅ Same (org: unlimited) | Enhanced |
| **Public Gallery** | ✅ Browse, search, filter | ✅ Same + collections | Enhanced |
| **Upvoting** | ✅ User upvotes | ✅ Same + org endorsements | Enhanced |
| **Link Sharing** | ✅ Read-only replay | ✅ Same + collection sharing | Enhanced |
| **Mobile Replay** | ⚠️ Basic | ✅ Optimized (responsive, touch) | **NEW** |
| **Progressions** | ❌ | ✅ Base + 5 variations | **NEW** |
| **Organizations** | ❌ | ✅ Hampshire RFU + clubs | **NEW** |
| **Collections** | ❌ | ✅ Curated sets | **NEW** |
| **Version Control** | ❌ | ✅ Auto-increment (latest + 3 archived) | **NEW** |
| **Remix Genealogy** | ⚠️ Single link | ✅ Full lineage (A → B → C) | Enhanced |
| **Templates** | ❌ | ✅ Gallery filter + badge | **NEW** |
| **Personalization** | ❌ | ✅ Club badges + colors | **NEW** |
| **Video Links** | ❌ | ✅ YouTube tutorials | **NEW** |
| **Legacy Shares** | ✅ 90-day expiry | ❌ Deleted | Removed |
| **Follow System** | ⚠️ Table only | ❌ Deferred to v3.0 | Removed |
| **Grid Overlay** | ✅ Toggle button | ❌ Removed | Removed |
| **Marker Entities** | ✅ Deprecated | ❌ Auto-convert to cones | Removed |

---

## Resources

**PRD v2.0 Full Document:** `.specify/memory/PRD-v2.0.md`

**PRD v1.0 (Reference):** `.specify/memory/PRD.md`

**Constitution:** `.specify/memory/constitution.md` (v3.2 with OAuth providers)

**Database Schema:** `docs/architecture/database-schema.md`

**API Contracts:** `docs/architecture/api-contracts.md`

**User Feedback Summary:** See Section 2.1 of PRD v2.0

**Phased Implementation Plan:** See Section 11 of PRD v2.0

**Risk Assessment:** See Section 17.1-17.3 of PRD v2.0

---

**Document Status:** Planning Complete - Awaiting Stakeholder Review

**Last Updated:** 2026-02-11

**Contact:** Wayne Ellis (Product Owner)
