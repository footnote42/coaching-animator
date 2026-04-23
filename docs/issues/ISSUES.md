# Issues Tracker

**Light-touch, local issue tracking for coaching-animator**

Status legend: `[ ]` Open · `[x]` Closed · `[~]` Deferred

---

## Phase 2: Launch Credibility

### 🔴 UX-001 — Welcome Popup Button Contrast
- **Status**: `[ ]` Open
- **Severity**: High (accessibility)
- **Observed**: Dark text on dark green background in welcome popup button — difficult to read
- **Location**: Welcome popup ("Share a replay link with your squad" button)
- **Files**: Find via grep for welcome popup component
- **Action**: Increase contrast or change background color to meet WCAG AA
- **Roadmap ref**: Phase 2, T3 (Landing Credibility)

---

### UX-002 — Export Settings Outdated (WebM/GIF)
- **Status**: `[ ]` Open
- **Severity**: Medium (confusing UX)
- **Observed**: Export settings panel still references WebM and GIF formats — unclear if feature is live, deprecated, or in-progress
- **Location**: Animation studio panel → export settings
- **Files**: Find export component
- **Action**: Either clarify export roadmap in UI or hide/deprecate the feature to avoid user confusion
- **Roadmap ref**: Phase 2, T3 (Landing Credibility)

---

### UX-003 — YouTube Linking Discoverability
- **Status**: `[ ]` Open
- **Severity**: Low (feature hidden, not broken)
- **Observed**: Option to link to YouTube video sits in animation page menu panel — users unlikely to find it
- **Location**: Animation page menu panel
- **Preferred location**: Details pane/popup when filling in animation metadata
- **Action**: Move YouTube link option to metadata UI
- **Roadmap ref**: Phase 2, T3 (Landing Credibility)

---

## Phase 2–3: Gallery UX

### UX-004 — Gallery Cards Lack Visual Preview
- **Status**: `[ ]` Open
- **Severity**: Medium (reduces engagement)
- **Observed**: Gallery cards are plain — no visual representation of animation content
- **Options**: 
  - Mini frame grab (first or key frame from animation)
  - Creator-selected thumbnail icon
- **Implementation**: Requires creator-side choice + storage mechanism
- **Roadmap ref**: Phase 2 (nice-to-have after launch) or Phase 3
- **Note**: Can ship as v1.0.1 if not blocking core loop verification

---

### UX-005 — Authentication State Not Visible
- **Status**: `[ ]` Open
- **Severity**: High (usability blocker)
- **Observed**: No way to see if you're logged in without opening menu. Confusing for new users. Need either logged-in icon, login button, or guest indicator in header.
- **Location**: Navigation header
- **Action**: Add persistent auth state indicator (profile icon for logged-in, login button for guest)
- **Roadmap ref**: Phase 2, T3 (Landing Credibility)

---

### UX-006 — Pitch Layout Not Standardized
- **Status**: `[ ]` Open
- **Severity**: Medium (authenticity/credibility)
- **Observed**: Canvas pitch needs standard rugby field layout for credibility with coaches. Missing visual landmarks.
- **Spec**: Add horizontal lines and yard markers:
  - Try lines (full width, 5m from end)
  - 22-yard line
  - 10-yard line
  - 5-meter inner markers along both long sides
- **Action**: Design and implement standard pitch grid background
- **Roadmap ref**: Phase 2, T3 (Landing Credibility)
- **Note**: May affect Stage.tsx shared canvas component — test on /app, /replay, /share

---

### UX-007 — Design Direction Research & Hero Page Kit
- **Status**: `[ ]` Open
- **Severity**: Medium (landing page credibility)
- **Observed**: Need research on design approach (modern/enticing vs plain/functional). Also need to consider kit visualization on hero page to signal "this is for rugby coaches."
- **Exploration**: 
  - Collect design examples (rugby app landing pages, coaching platforms)
  - Decide visual approach: tactical/hand-drawn vs modern/minimalist
  - Consider kit imagery: tackle bags, balls, shields, posts, whiteboard, whistle, boots, gum shield, scrum cap
- **Action**: Design sprint with design research + kit asset library plan
- **Roadmap ref**: Phase 2, T3 (Landing Credibility)
- **Dependency**: Informs overall landing page redesign direction

---

### UX-008 — Share Workflow Not Clear
- **Status**: `[ ]` Open
- **Severity**: High (breaks core loop)
- **Observed**: Animation rendering is confusing. Hash is unique but rendering via "replay" (old, not optimized) vs "share" (optimized). Users don't know which to use or how to share from where.
- **Problem**: 
  - Where does user initiate share? (animation page? menu?)
  - Which route do they use? (replay/ vs share/?)
  - What does hash represent? (ID or checksum?)
- **Action**: Document and clarify share workflow. Update UI to guide coaches step-by-step. Consider: "Share" button → generates link → explains what link does.
- **Roadmap ref**: Phase 2, T3 (Landing Credibility) — critical for onboarding
- **Note**: May need inline help or wizard

---

### UX-009 — Gallery Carousel & Progression Pack Discovery
- **Status**: `[ ]` Open
- **Severity**: Low (engagement)
- **Observed**: Gallery needs carousel for scrolling animations. Also need terminology for a "pack of progressions" (e.g., set, progression tree, suite, sequence). Each pack variant needs icon or frame grab.
- **Action**: 
  1. Define terminology for progression packs
  2. Design carousel UI (swipe/click through animations in a pack)
  3. Add visual badges or icons for pack variants
- **Roadmap ref**: Phase 2–3 (nice-to-have for launch, improves discoverability)

---

## Phase 3: Quality Safety Net

### FEAT-006 — Animation Layering Control
- **Status**: `[ ]` Open
- **Severity**: Medium (UX improvement)
- **Observed**: Animation layering needs work. Cones should always render as first layer (behind players/ball). Need option to move ball or player up/down a layer.
- **Implementation**: 
  - Set fixed z-index: cones < players < ball (by default)
  - Add UI in editor to adjust z-order (send up/send down buttons per entity)
  - Persist z-order in animation JSON
- **Files**: `src/features/animation/components/Canvas/EntityLayer.tsx` (likely)
- **Roadmap ref**: Phase 3 (quality improvement)

---

### FEAT-007 — Search & Keyword Discoverability
- **Status**: `[ ]` Open
- **Severity**: Low (discoverability)
- **Observed**: Gallery needs search. Should support filtering by keywords (tags/labels on animations).
- **Implementation**: 
  - Add keyword/tag field to animation metadata
  - Build search index on client (or use full-text search on Supabase)
  - Add search input to gallery page
- **Roadmap ref**: Phase 3 (gallery enhancement)

---

### SEC-001 — Full Security Review
- **Status**: `[ ]` Open
- **Severity**: High (pre-beta mandatory)
- **Scope**: Comprehensive security audit covering:
  - Rate limiting on API endpoints
  - SQL injection prevention (especially free-text fields: animation descriptions, coach notes)
  - XSS protection in gallery display
  - CSRF protection on state-changing actions
  - Auth token handling (secure httpOnly cookies, proper expiry)
  - User input validation
  - File upload security (if applicable)
  - Environment variable exposure
- **Action**: Schedule dedicated security review sprint (ideally with external review or security-focused agent)
- **Roadmap ref**: Phase 3 (blocker before public beta)
- **Dependencies**: Should block public launch

---

### SEC-002 — Rate Limiting Implementation
- **Status**: `[ ]` Open
- **Severity**: High (security)
- **Observed**: API endpoints need rate limiting to prevent abuse. Suggested endpoints: auth, upload, comment, search.
- **Implementation**: 
  - Use middleware (e.g., `next-rate-limit` or Supabase RLS with rate-limit policies)
  - Configure reasonable limits per endpoint and user tier
  - Return 429 (Too Many Requests) with retry-after header
- **Roadmap ref**: Phase 3, part of SEC-001
- **Dependencies**: Requires overall security review

---

### SEC-003 — SQL Injection Prevention (Free-Text Fields)
- **Status**: `[ ]` Open
- **Severity**: High (data safety)
- **Observed**: Free-text fields (animation descriptions, tags, search queries) are vulnerable to SQL injection if using raw SQL or improper parameterization.
- **Action**: 
  1. Audit all free-text input handlers
  2. Ensure all queries use parameterized statements (Supabase client already does this, but verify)
  3. Sanitize search queries before full-text indexing
  4. Add input validation on client (cosmetic) and server (required)
- **Roadmap ref**: Phase 3, part of SEC-001

---

## Phase 3–4: Feature Decisions

### FEAT-008 — GIF/Export Format Decision
- **Status**: `[ ]` Open (decision needed)
- **Severity**: Medium (feature clarity)
- **Observed**: Export settings still reference WebM and GIF. Unclear if feature is live, planned, or deprecated. Decision needed:
  - **Option A**: Drop export entirely (rely on share link + replay viewer)
  - **Option B**: Support GIF only (simple, shareable, low quality)
  - **Option C**: Support MP4 via client-side encoding (requires ffmpeg.wasm)
  - **Option D**: Server-side rendering (Vercel Functions + headless Chrome)
- **Action**: Make deliberate decision and update UI accordingly
- **Roadmap ref**: Phase 3 (clarification) or Phase 4 (if building new export system)
- **Note**: Defer unless coaches specifically request it

---

### FEAT-009 — Offline Capability Exploration
- **Status**: `[ ]` Open
- **Severity**: Low (nice-to-have)
- **Observed**: No way to use the app offline. For coaches with unreliable connectivity or fieldside work, offline editing would be valuable.
- **Exploration**: 
  - Evaluate Service Worker + IndexedDB for local persistence
  - Sync strategy for offline edits
  - Scope: read-only for v1 (browse animations offline), edit sync for v2
- **Roadmap ref**: Phase 4+ (depends on user feedback)
- **Complexity**: Medium–Large (data sync, conflict resolution)

---

## Phase 4+: Growth Features

### FEATURE-010 — Kit Visualization Library
- **Status**: `[ ]` Open
- **Severity**: Low (nice-to-have)
- **Observed**: Current entities (player, cone, ball) are minimal. Rugby coaches may want additional visual objects: tackle bags, shields, posts, whiteboard markers, whistle, boots, gum shield, scrum cap, etc.
- **Exploration**: 
  - Design simple icon/SVG set for rugby kit
  - Add kit entities to entity creation menu
  - Decide: fixed positions (non-animated) vs draggable like players?
- **Roadmap ref**: Phase 4+ (post-v1, adds richness to drill design)
- **Complexity**: Low–Medium

---

### DESIGN-001 — Progression Pack Terminology & UX
- **Status**: `[ ]` Open
- **Severity**: Low (design clarity)
- **Observed**: Need precise terminology for "a related set of animations representing a progression." Current options: progression set, progression pack, progression suite, progression sequence, progression tree.
- **Decision needed**: 
  - Pick terminology and apply consistently across UI + docs
  - Decide if packs are first-class objects (created explicitly) or derived (grouped by metadata)
  - Design carousel/grouping UX in gallery
- **Roadmap ref**: Phase 4+ (part of coaching education platform vision)
- **Note**: Ties to FEATURE-003 (progression links metadata)

---

### FEATURE-001 — Endorsed Animations (RFU Partnership)
- **Status**: `[ ]` Open
- **Severity**: Low (growth feature)
- **Observed**: Need mechanism to highlight animations endorsed by Hampshire RFU
- **Implementation**: 
  - Add `endorsed_by` field to animation metadata (RFU org ID)
  - Display small RFU rose icon in gallery card corner
  - Requires admin moderation interface
- **Roadmap ref**: Phase 4 (post-v1, requires partnership integration)
- **Dependencies**: Admin panel for marking endorsed animations

---

### FEATURE-002 — Roadmap Page
- **Status**: `[ ]` Open
- **Severity**: Low (nice-to-have)
- **Observed**: Site map is great; Roadmap page would aid credibility and user expectations
- **Location**: Site navigation (sibling to `/sitemap`)
- **Content**: Public roadmap of upcoming features, phases, estimated timing
- **Roadmap ref**: Site nav enhancement (post-v1)
- **Note**: Requires discipline to keep updated

---

## Phase 5+: Coaching Education Platform (Exploration/Aspiration)

### ASPIRATION-001 — Coaching Pedagogy Research & Validation
- **Status**: `[~]` Deferred (exploration phase)
- **Severity**: Strategic (vision-level)
- **Concept**: Transform from animation tool to coaching education platform. Embed pedagogical frameworks into the app to elevate coaches' practice.
- **Frameworks to explore**:
  - APES (Active, Purposeful, Enjoyable, Safe) — minimum standard for sessions
  - Progression/Regression — drills with difficulty variants for mixed-ability squads
  - Tell, Sell, Ask, Delegate (TSAD) — coaching approaches and their effectiveness
- **Roadmap ref**: Phase 5+ (post-v1, requires coach interviews and framework validation)
- **Research needed**: See `docs/coaching-frameworks/COACHING-PEDAGOGY.md` for exploration checklist
- **Phase 2 taster** (optional): Single info page (e.g., `/help/apes`) explaining one framework with gallery example

---

### FEATURE-003 — Drill Metadata Schema with Pedagogical Tags
- **Status**: `[~]` Deferred (depends on ASPIRATION-001)
- **Severity**: Medium (enables future features)
- **Concept**: Extend animation metadata to include pedagogical context:
  - APES alignment tags (Active, Purposeful, Enjoyable, Safe)
  - Progression/regression links to related drills
  - Recommended coaching approach (Tell/Sell/Ask/Delegate)
  - Difficulty gradient indicator
- **Database schema**: New columns on `animations` table + new `progression_links` table
- **UI**: Metadata edit form extension + visualization in gallery drill cards
- **Roadmap ref**: Phase 5+, dependent on ASPIRATION-001 validation

---

### FEATURE-004 — Coaching Guides Linked to Drills
- **Status**: `[~]` Deferred (depends on ASPIRATION-001 + FEATURE-003)
- **Severity**: Low (nice-to-have)
- **Concept**: Short contextual articles paired with drills:
  - "How to coach this drill using Ask" (vs. Tell/Sell/Delegate)
  - "Why this regression matters for beginners"
  - "Watch for these safety signals"
- **Content model**: Associate markdown guides with drill IDs, display in drill detail page
- **Roadmap ref**: Phase 5+, part of coaching education platform vision

---

### FEATURE-005 — Session Design Tool with APES Balance Visualizer
- **Status**: `[~]` Deferred (long-term aspiration)
- **Severity**: Low (nice-to-have)
- **Concept**: Coaches build a week of training and see:
  - APES balance across the week (are all four present?)
  - Progression arc (does difficulty scale sensibly?)
  - Coaching approach distribution (bias toward Tell or Ask?)
- **UI**: Drag-drop drill builder, balance dashboard, recommendations
- **Roadmap ref**: Phase 5+, big feature, requires FEATURE-003 + FEATURE-004 foundation

---

## Closed Issues

*None yet.*

---

## How to Use This Tracker

1. **Add**: Copy a template, assign ID (UX-### for UI/UX, FEATURE-### for features), fill details
2. **Reference**: Link from ROADMAP.md phase sections and spec docs
3. **Update**: Change status checkboxes as work progresses
4. **Archive**: Move closed issues to bottom section with completion date

---

## Quick Reference by Roadmap Phase

- **Phase 2** (Launch Credibility): UX-001, UX-002, UX-003, UX-004, **UX-005, UX-006, UX-007, UX-008, UX-009**
- **Phase 3** (Quality Safety Net): **FEAT-006, FEAT-007, SEC-001, SEC-002, SEC-003**
- **Phase 3–4** (Feature Decisions): **FEAT-008, FEAT-009**
- **Phase 4+** (Growth): FEATURE-001, FEATURE-002, **FEATURE-010, DESIGN-001**
- **Phase 5+** (Coaching Education Platform — Aspiration): ASPIRATION-001, FEATURE-003, FEATURE-004, FEATURE-005
