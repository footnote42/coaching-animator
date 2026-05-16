# Issues Tracker

**Light-touch, local issue tracking for coaching-animator**

Status legend: `[ ]` Open · `[x]` Closed · `[~]` Deferred

---

## Phase 2: Launch Credibility

### ✅ UX-001 — Welcome Popup Button Contrast
- **Status**: `[x]` Closed
- **Severity**: High (accessibility)
- **Observed**: Dark text on dark green background in welcome popup button — difficult to read
- **Resolution**: Text contrast was already correct (`text-text-inverse` = #F8F9FA on `bg-primary` = #1A3D1A, ~11:1 ratio). The real bug was `focus-visible:ring-ring` referencing an undefined token, leaving keyboard users with no visible focus indicator. Fixed in `FirstRunModal.tsx`: replaced `focus-visible:ring-ring` with `focus-visible:ring-accent-warm focus-visible:ring-offset-2 focus-visible:ring-offset-primary` (amber ring, clearly visible on dark green). Closed 2026-05-15.

---

### EDITOR-010 — Progression Buttons Missing for New Animations
- **Status**: `[x]` Closed
- **Completed**: 2026-05-15 (022-progression-panel-new-anim, commit 07f3b72)
- **Summary**: Panel now renders for all authenticated, non-edit-mode, non-progression sessions. Add button is disabled with "Save to cloud first" tooltip until animation is saved.
- **Severity**: Medium (usability)
- **Observed**: The progression buttons at the top of the animation page are not always present, especially noticeable when creating a new animation. They only appear once the animation is saved and has progressions.
- **Roadmap ref**: Phase 2 (Editor & Canvas)

---

### EDITOR-011 — Team Colour Selection & Legend Alignment
- **Status**: `[x]` Closed
- **Completed**: 2026-05-16
- **Summary**: Added `teamColors` to `ProjectSettings` (attack/defense/other). New `setTeamColor` store action updates settings and retroactively recolours all matching entities across all frames. "Team Colours" section added to EntityPalette sidebar with inline ColorPicker per team. "Other Role" player type added (team: 'other', amber default, no auto-label). All wired through Editor + MobileDrawer.
- **Severity**: Low (UX clarity)
- **Observed**: The legend indicates team colours, but there's no option to change the team colours and immediately have those selections amend the colours of the entities on the pitch.
- **Roadmap ref**: Phase 2 (Editor & Canvas)

---

### EDITOR-012 — Entity Spawning & Persistence Logic
- **Status**: `[x]` Closed
- **Completed**: 2026-05-16 (via 005-editor-canvas, propagateEntity + opt-in toast)
- **Summary**: Entity is placed only on the current frame. If the animation has multiple frames, a toast prompts "Add entity to all subsequent frames?" — user opts in via Yes/No. Accepted as correct UX.
- **Severity**: Medium (UX friction)
- **Roadmap ref**: Phase 2 (Editor & Canvas)

---

### EDITOR-014 — Entity Spawn Offsetting
- **Status**: `[x]` Closed
- **Completed**: 2026-05-16
- **Summary**: Added `findSpawnPosition()` helper in `useEditorEntityHandlers.ts`. Checks existing frame entities against up to 9 candidate positions (centre + 8 cardinal/diagonal offsets at 40px steps). All six add-entity handlers now call `spawnPosition()` instead of hardcoding canvas centre.
- **Severity**: Low (usability)
- **Observed**: Adding multiple entities without moving the first results in them sitting directly on top of each other at the centre of the pitch, making selection difficult.
- **Roadmap ref**: Phase 2 (Editor & Canvas)

---

### EDITOR-016 — Metadata and Save-to-Cloud Must Be Unified
- **Status**: `[x]` Closed
- **Completed**: 2026-05-04 (Phase 2m, 019-save-metadata-unification)
- **Summary**: Unified all metadata fields (Tags, YouTube URL, Description, etc.) into the EditMetadataModal; removed legacy MetadataSheet and sidebar buttons.
- **Severity**: High (UX coherence)
- **Observed**: There are two separate surfaces for animation information: the 'Metadata' button in the left-hand menu and the info card shown when saving to the cloud. These create a fragmented and confusing experience. The same fields must be accessible and consistent across both save and edit flows.
- **Action**: 
  - Remove the standalone 'Metadata' button from the editor left-hand menu.
  - Design a single Save/Metadata process that captures all animation information (title, description, coaching points, tags, progression links) during the save-to-cloud flow and on subsequent edits.
  - The edit/info card accessed from My Playbook must show the same fields and all existing stored values in full.
- **See also**: EDITOR-018 (description not populated in edit), FEAT-013 (Coaching Points field)
- **Roadmap ref**: Phase 2 (Editor & Canvas)

---

### EDITOR-017 — Save Local / Save to Cloud Button Layout Inconsistency
- **Status**: `[x]` Closed
- **Completed**: 2026-05-16
- **Summary**: Added `mt-2` to the Save Local button in `ProjectActions.tsx` to match the spacing on Save to Cloud and Sign in to Save. All three save-tier buttons now share the same top margin.
- **Severity**: Low (visual polish)
- **Observed**: In the Project Information pane (left side of the editor), the 'Save Local' and 'Save to Cloud' buttons have inconsistent layout and spacing. Different button colours are acceptable but the structural layout must match.
- **Roadmap ref**: Phase 2l (Cosmetic Polish)

---

### EDITOR-018 — Description Field Not Populated When Editing from My Playbook
- **Status**: `[x]` Closed
- **Completed**: 2026-05-04 (Phase 2m, 019-save-metadata-unification)
- **Summary**: Verified description persistence and fixed pre-population in EditMetadataModal; updated API select and optimistic update logic.
- **Severity**: High (data integrity / UX)
- **Observed**: A description was added via the 'Save to Cloud' popup, but when the animation was opened in edit mode from My Playbook the description field was empty. The stored description is either not being persisted correctly or not being loaded into the edit form.
- **Action**: 
  1. Verify the description is written to and read from the correct database column.
  2. Confirm the edit/info card pre-populates all existing field values when opened.
  3. Check for mismatch between the save payload and the fetch query (field name aliasing or missing select).
- **See also**: EDITOR-016 (save/metadata unification)
- **Roadmap ref**: Phase 2 (Editor & Canvas / My Playbook)

---

### EDITOR-019 — Frame Editing of Own Saved Animations
- **Status**: `[x]` Closed
- **Severity**: High (core workflow gap — Phase 2 blocker)
- **Completed**: 2026-05-04 (Phase 2 remainder, 020-frame-edit-own-animations)
- **Summary**: Implemented direct frame editing for owned animations. Coaches can now re-open their own animations from My Playbook, modify frames, and choose to overwrite the original (updating all share links) or save as a new copy.
- **Action**:
  - Add "Open in Editor" action to My Playbook animation cards (alongside Edit/Share)
  - Load the animation frames into the editor at `/app?load={id}&mode=edit`
  - On save: choice of overwrite original (PUT) or save as new copy (POST)
  - Handled shared/public animations: overwriting updates the existing record, keeping share links valid but updated.
- **Roadmap ref**: Phase 2 remainder — spec 020

---

### WORKFLOW-001 — No Clear Route to Create Progressions
- **Status**: `[x]` Closed
- **Completed**: 2026-05-04 (Phase 2c+, 018-share-playback-workflow)
- **Summary**: "Save as Progression" and "Link to Foundation" UI flows implemented in editor. Progression creation path is now discoverable.
- **Severity**: High (core workflow gap)
- **Observed**: Once an animation has been created and saved, there is no discoverable path to add a progression to it. The user cannot determine how progressions are created from the current UI.
- **Action**: 
  - Define and document the intended progression creation workflow (e.g. "Save As Progression" from an open animation, or an "Add Progression" action on a My Playbook card).
  - Implement the UI entry point for this workflow.
  - Consider whether a brainstorm/workflow design session is needed before implementation.
- **Note**: User 2026-05-02 — "Do I need to brainstorm the workflow around how I think progressions should work?" — the workflow needs to be designed before implementation.
- **See also**: UX-010 (progression workflow & gallery integration), EDITOR-016 (save/metadata unification)
- **Roadmap ref**: Phase 2 (core workflow)

---
## Phase 2–3: Gallery UX

### UX-004 — Gallery Cards Lack Visual Preview
- **Status**: `[x]` Closed
- **Completed**: 2026-05-16
- **Summary**: Verified complete — gallery cards now display visual pitch thumbnails via `MiniPitchSVG` showing entity positions from the first frame. Sufficient for launch.
- **Severity**: Medium (reduces engagement)
- **Roadmap ref**: Phase 2 (nice-to-have after launch) or Phase 3

---

---

---

### UX-007 — Design Direction Research & Hero Page Kit
- **Status**: `[x]` Closed
- **Completed**: 2026-05-16
- **Summary**: Design direction established — tactical/hand-drawn aesthetic confirmed via 022-notebook-tab-nav (notebook tabs, page textures, whiteboard motif). Hero page SVG background and brand icon already implement the coaching diagram aesthetic. Kit visualization deferred to FEATURE-010 as a Phase 4+ enhancement.
- **Severity**: Medium (landing page credibility)
- **Roadmap ref**: Phase 2, T3 (Landing Credibility)

---

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

### UX-010 — Progression Workflow & Gallery Integration
- **Status**: `[x]` Closed
- **Completed**: 2026-05-04 (Phase 2c+, 018-share-playback-workflow)
- **Summary**: Inline progression badges, Save-as-Progression and Link-to-Foundation flows, progression navigation in editor/share/replay. Parent/child structure enforced.
- **Severity**: High (core workflow)
- **Observed**: Progression workflow is not intuitive. Progressions currently sit as standalone animations in the gallery, cluttering the view. Progression animations in a collection must be navigable from all galleries, from the animation editor, and from all playback/share screens.
- **Action**: 
  - Update save feature to allow saving directly to a "parent" animation.
  - Remove standalone progression animations from the main gallery; they should only be accessible via the parent.
  - Inherit parent metadata and descriptors automatically.
  - Auto-generate title as `{Parent Title} {part n}`.
  - Expose prev/next progression navigation in the editor, share view, and replay view.
- **See also**: WORKFLOW-001 (no clear creation path for progressions), FLOW-002 (share view missing progression navigation)
- **Roadmap ref**: Phase 2c (Share Workflow)

---

### UX-011 — Entity Depth & Visual Indicators
- **Status**: `[x]` Closed
- **Completed**: 2026-05-16
- **Summary**: Added `shadowProps` object to `PlayerToken.tsx` (`shadowEnabled: true`, `shadowColor: rgba(0,0,0,0.35)`, `shadowBlur: 4`, `shadowOffsetX: 1`, `shadowOffsetY: 2`, `shadowOpacity: 0.4`). Applied to player circles, ball ellipse, tackle shield, and tackle bag via spread. Cone left unshadowed (stroke-only shape — shadow would appear on the stroke ring rather than a fill body).
- **Severity**: Low (visual polish)
- **Roadmap ref**: Phase 2 (Visual Excellence)

---

### UX-012 — Thumbnail Design & Color Scheme
- **Status**: `[x]` Closed
- **Completed**: 2026-05-02 (Phase 2l, 015-cosmetic-polish)
- **Summary**: Refactored MiniPitchSVG to use EntityColors service; thumbnails now match editor red/blue/yellow scheme.
- **Severity**: Low (visual polish)
- **Observed**: Tactical thumbnails use muted/placeholder colors (amber/muted primary). Should closer match the actual pitch (grass green) and entity (red/blue teams, high-vis yellow cones) color scheme.
- **Action**: Update `MiniPitchSVG` to use colors more representative of the actual editor experience.
- **Roadmap ref**: Phase 2f (Gallery & My Playbook)
- **Note**: User specifically reported orange/green entities in thumbnails vs red/blue in editor (2026-05-01).

---

### UX-013 — Inconsistent Hover Feedback (Gallery)
- **Status**: `[x]` Closed
- **Completed**: 2026-05-02 (Phase 2l, 015-cosmetic-polish)
- **Summary**: Standardized hover effects across all gallery card action buttons.
- **Severity**: Low (UX consistency)
- **Observed**: In Gallery, 'Remix' button changes colour on hover, but 'Share' does not.
- **Action**: Standardize hover effects across all gallery card action buttons.
- **Roadmap ref**: Phase 2f (Gallery & My Playbook)

---

### UX-014 — Inconsistent Thumbnail Layout (Tags/Progressions)
- **Status**: `[x]` Closed
- **Completed**: 2026-05-02 (Phase 2l, 015-cosmetic-polish)
- **Summary**: Implemented stable unified layout slots in AnimationCard and PublicAnimationCard; cards no longer shift with optional tags/progressions.
- **Severity**: Low (Visual polish)
- **Observed**: Thumbnails in Gallery and My Playbook have inconsistent layouts depending on whether they have tags or progression indicators.
- **Action**: Implement a stable, unified layout for card headers/footers that handles optional tags and progression counts without shifting elements.
- **Roadmap ref**: Phase 2f (Gallery & My Playbook)

---

## Phase 3: Quality Safety Net

### FEAT-006 — Animation Layering Control
- **Status**: `[x]` Closed
- **Completed**: 2026-05-16 (Phase 3d, 023-entity-layering)
- **Summary**: Implemented deterministic 3-key rendering sort (Tier → zIndexOffset → ID). Added "Bring Forward" and "Send Backward" actions to `EntityContextMenu` with peer-aware enabled/disabled states. Persistence wired through JSON project state and share payloads.
- **Severity**: Medium (UX improvement)
- **Observed**: Animation layering needs work. Cones should always render as first layer (behind players/ball). Need option to move ball or player up/down a layer.
- **Roadmap ref**: Phase 3d (Animation Layering Control)

---

### SEC-001 — Full Security Review
- **Status**: `[x]` Closed
- **Completed**: 2026-05-04 (Phase 3b, 016-security-hardening)
- **Summary**: Rate limiting, input sanitisation, and injection hardening implemented across all API routes. Auth token handling via Supabase httpOnly cookies. XSS protection via React's default escaping + Supabase parameterised queries throughout.
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
- **Status**: `[x]` Closed
- **Completed**: 2026-05-04 (Phase 3b, 016-security-hardening)
- **Summary**: `checkRateLimit` / `getRateLimitHeaders` utility implemented and wired to all mutating API routes: create animation, upvote, remix, progression create/reorder, version restore. Returns 429 with retry-after headers.
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
- **Status**: `[x]` Closed
- **Completed**: 2026-05-04 (Phase 3b, 016-security-hardening)
- **Summary**: All database queries use Supabase client's parameterised statements throughout. Free-text input hardening applied during audit. No raw SQL strings in the codebase.
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
- **Status**: `[~]` Deferred (won't do)
- **Decision**: Drop export entirely — share link + replay viewer covers the use case. Export UI already removed (UX-002, closed 2026-04-25). No export feature planned.
- **Severity**: Medium (feature clarity)
- **Roadmap ref**: Not scheduled

---

### FEAT-009 — Offline Capability Exploration
- **Status**: `[~]` Deferred (won't do)
- **Decision**: Not planned. Autosave to localStorage already handles transient connectivity loss. Full offline-first requires significant data sync complexity not warranted by current user feedback.
- **Severity**: Low (nice-to-have)
- **Roadmap ref**: Not scheduled

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

### DESIGN-002 — Notebook Page Aesthetic & Graph Paper Differentiator
- **Status**: `[x]` Closed
- **Completed**: 2026-05-16 (Phase 2n, 022-notebook-tab-nav)
- **Summary**: Page textures (page-texture-lined, page-texture-grid-lg, page-texture-grid-sm) implemented and applied to Home, Gallery, and My Playbook respectively. Notebook tab navigation (NAV-001) provides the physical motif foundation.
- **Severity**: Low (design identity / delight)

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

---

## Legal & Compliance (new — 2026-04-24 review)

### CONTACT-001 — Contact Form End-to-End Verification
- **Status**: `[ ]` Open
- **Severity**: Medium
- **Observed**: Contact page exists; form has not been tested end-to-end to confirm submissions are received
- **Action**: Submit test contact form; verify delivery; confirm response address is monitored
- **Roadmap ref**: Phase 2d (Legal & Compliance)

---

## Landing Page (new — 2026-04-24 review)

### LANDING-001 — App Name Not Memorable
- **Status**: `[ ]` Open
- **Severity**: Low (brand consideration)
- **Observed**: "Coaching Animator" is accurate but not catchy. Needs to remain sport-agnostic but maintain rugby roots.
- **Action**: Brainstorm alternatives; test against brand principles (direct · tactical · grassroots); constitutional amendment required if name changes
- **Roadmap ref**: Phase 2e (Landing Refinements) — lower priority than copy corrections

---

### LANDING-002 — Landing Background: Coaching Diagram Aesthetic
- **Status**: `[x]` Closed
- **Completed**: 2026-05-02 (Phase 2l, 015-cosmetic-polish)
- **Summary**: Looping SVG tactical background implemented on landing hero (Phase 2e); 2l extended design polish.
- **Severity**: Medium (brand credibility)
- **Observed**: Landing background should use subtle coaching diagrams in the style of the brand icon. Design spec from review:
  > "The Tactical Ball" (The Marker Silhouette): A single, centered, utilitarian SVG-style icon of a rugby ball (prolate spheroid). Thick, hand-drawn whiteboard marker aesthetic. Ball outline: Pitch Green (#1A3D1A). Inside: Amber (#D97706) tactical markings — heavy hand-drawn X in centre, dotted line with arrowhead sweeping across indicating play direction. All lines imperfect and heavy-stroked. Zero rounded corners. Off-white textured background referencing 1980s rugby programme.
- **Action**: Design and implement SVG tactical ball icon; use as subtle background element on landing hero
- **Roadmap ref**: Phase 2e (Landing Refinements)

---

### LANDING-003 — Section 2 Card Copy Errors
- **Status**: `[x]` Closed
- **Completed**: 2026-05-02 (Phase 2l, 015-cosmetic-polish)
- **Summary**: Rewrote card 2 copy for rugby coaches; removed deprecated export format card.
- **Severity**: Medium (credibility)
- **Observed**: Card review from 2026-04-24:
  - Card 1: Okay
  - Card 2: Vague — references "code" when the audience is rugby coaches (not developers)
  - Card 3: Okay
  - Card 4: References export formats — this feature is deprecated; must be removed
  - Card 5: Repetition but acceptable
  - Card 6: "Free to use" — good, keep
- **Action**: Rewrite card 2 copy to be rugby-specific; remove card 4 or replace with a different value proposition
- **Roadmap ref**: Phase 2e (Landing Refinements)

---

### LANDING-004 — Section 3 Copy Ambiguities
- **Status**: `[x]` Closed
- **Completed**: 2026-05-02 (Phase 2l, 015-cosmetic-polish)
- **Summary**: Rewrote section 3 card 1 to describe click/drag correctly; removed GIF export mention.
- **Severity**: Medium (UX clarity)
- **Observed**: Section 3 card review:
  - Card 1: "Drag?" — unclear; actual interaction is click-to-place then drag; rewrite
  - Card 3: References "Export to GIF" — deprecated; remove
- **Action**: Rewrite section 3 card 1 to accurately describe click/drag interaction; remove GIF export mention
- **Roadmap ref**: Phase 2e (Landing Refinements)

---

## Gallery (new — 2026-04-24 review)

### GALLERY-001 — Hampshire RFU Endorsement Icon
- **Status**: `[x]` Closed
- **Completed**: 2026-05-02 (Phase 2l, 015-cosmetic-polish)
- **Summary**: hampshire-rfu-badge.webp (<50KB) added; badge overlay wired to endorsed_by field with constitution-mandated disclaimers.
- **Severity**: Medium (partnership credibility)
- **Observed**: Gallery needs a Hampshire RFU endorsement icon/badge on endorsed cards. Image must be compressed to <50KB for web use.
- **Action**: Obtain RFU image; compress to <50KB; wire up to `endorsed_by` field (see FEATURE-001 for full endorsement system); for now, display badge if field set
- **Roadmap ref**: Phase 2f (Gallery & My Playbook); full system in Phase 4 (FEATURE-001)

---

### GALLERY-002 — Share from Gallery (Copy Link + WhatsApp)
- **Status**: `[x]` Closed
- **Completed**: 2026-05-02 (Phase 2l, 015-cosmetic-polish)
- **Summary**: Share button copies /share/{id} to clipboard; Web Share API triggers on mobile (targets WhatsApp naturally).
- **Severity**: High (core workflow)
- **Observed**: Share button on gallery card needs to: (a) produce a /share/{id} link for copy-paste, (b) offer WhatsApp share on mobile
- **Action**: Implement share sheet: copy-to-clipboard for desktop; Web Share API for mobile (targets WhatsApp naturally); generate /share/{id} not /replay/{id}
- **Roadmap ref**: Phase 2c (Share Workflow) — coordinate with UX-008

---


---

### EDITOR-002 — Share Button Non-Functional in Dev
- **Status**: `[x]` Closed
- **Completed**: 2026-05-04 (Phase 2c+, 018-share-playback-workflow)
- **Summary**: Editor share button now copies /share/{id} link to clipboard with visual confirmation.
- **Severity**: High (core loop)
- **Observed**: Share button in the editor is currently non-functional (marked "not available in development"). Should at minimum copy the /share/{id} link to clipboard or display it for manual copy.
- **Action**: Implement clipboard copy fallback; display link in a modal; hook up to Web Share API for mobile
- **Roadmap ref**: Phase 2c (Share Workflow)

---

---

## Playback Controls (new — 2026-04-24 review)

### PLAYBACK-002 — Coaching Notes Reveal in Playback Screens
- **Status**: `[x]` Closed
- **Completed**: 2026-05-04 (Phase 2c+, 018-share-playback-workflow)
- **Summary**: Coaching notes overlay implemented in ReplayViewer and ShareViewer; toggled via info icon, does not obstruct animation.
- **Severity**: Medium (coaching utility)
- **Observed**: Playback screens (/share and /replay) have no way to surface the animation's coaching notes or instructions. Coaches sharing a drill need players or other coaches to be able to view these notes without leaving the playback screen.
- **Action**: Add a pop-up/overlay triggered by a button (e.g. "Notes" or info icon) in the playback UI that reveals the animation's coaching notes/description. Should not obstruct the animation but must be accessible without navigating away.
- **See also**: FEAT-013 (Coaching Points field), FLOW-002 (share view missing context)
- **Roadmap ref**: Phase 2c (Share Workflow) / Phase 2b (Playback & Controls)

---

### PLAYBACK-001 — Playback Remote Should Float and Persist
- **Status**: `[x]` Closed
- **Completed**: 2026-05-15 (Phase 2b+, 021-unified-editor-controls)
- **Summary**: Resolved by EDITOR-013. Desktop editor now has a fixed `TimelinePanel` sidebar (always visible, no scrolling required). Mobile has a full `MobileTimelineSection` inside `MobileDrawer` with play/pause, prev/next frame, speed, loop, ghost, add/delete frame. `FloatingRemote` retained only in `ShareViewer` where the full-screen fixed layout makes scroll inaccessibility impossible.
- **Severity**: Medium (usability at pitch)
- **Observed**: Playback controls disappear when scrolling and are fixed in document flow. Coaches at the pitch need controls always accessible.
- **Proposal**: Floating draggable remote (drag to reposition); always-on-screen; possibly bottom-anchored by default
- **Action**: Implement floating, draggable playback remote in editor; ensure it stays within viewport bounds
- **Roadmap ref**: Phase 2b (Playback & Controls)

---

### EDITOR-013 — Unified Editor Controls
- **Status**: `[x]` Closed
- **Completed**: 2026-05-15 (Phase 2b+, 021-unified-editor-controls)
- **Summary**: Replaced legacy `EditorFloatingRemote` with a permanent `TimelinePanel` sidebar (desktop) and integrated controls in `MobileDrawer`. Standardized playback, frame management, and sharing controls.
- **Severity**: High (mobile usability)
- **Observed**: Users still have to scroll to see the bottom edge of the pitch or the timeline controls (add frame, pace, loop, etc.). The current floating remote was intended to solve this but is not effective enough in practice.
- **Action**: The add-frame controls and timeline controls must be accessible without scrolling. Options: (a) extend a slide-up/down panel on the right side (mirroring the left-hand menu pattern), or (b) embed all frame controls in an improved floating remote. The existing floating remote in its current form should be deprecated — do not iterate on it; replace it.
- **Note**: User confirmed 2026-05-02 that floating controls do not adequately solve the scroll friction and want them deprecated.
- **Roadmap ref**: Phase 2b (Playback & Controls)

---

## Navigation & Global UI

### UX-018 — Recover Autosave Popup Fades Into Darkened Background
- **Status**: `[x]` Closed
- **Completed**: 2026-05-16
- **Summary**: Root cause was `bg-background` in `dialog.tsx` resolving to the parchment theme token (`#F2ECD8`) via Tailwind v4 `@theme`, which blended with the `bg-black/80` overlay. Fixed by changing `DialogContent` default from `bg-background` to `bg-white` and upgrading shadow from `shadow-lg` to `shadow-xl`. Also fixed `ConfirmDialog` title/description from washed-out `text-gray-500` to `text-text-primary` / `text-gray-600`. Fix applies globally to all dialogs.
- **Severity**: Medium (usability / first impression)
- **Roadmap ref**: Phase 2l (Cosmetic Polish)

---

### NAV-001 — Selected Page Indicator (Tabs)
- **Status**: `[x]` Closed
- **Completed**: 2026-05-16 (Phase 2n, 022-notebook-tab-nav)
- **Summary**: Implemented notebook tab navigation for desktop with MRU-derived layering and plastic sheen. Mobile dropdown updated with colour-coded sidebars. Page textures (lined/grid) added to main content containers.
- **Severity**: Low (visual polish)

---

## New Features (from 2026-04-24 review)

---

### FEAT-012 — Mobile FrameStrip (swipe-accessible frame navigation on <768px)
- **Status**: `[x]` Closed
- **Completed**: 2026-05-15 (Phase 2b+, 021-unified-editor-controls)
- **Summary**: `MobileDrawer` now includes `MobileTimelineSection` with prev/next frame navigation, add/delete frame, play/pause, speed, loop, and ghost controls. Thumbnail strip not required — no longer a concern.
- **Severity**: Medium (mobile usability)
- **Observed**: On viewports <768px, the FrameStrip (frame thumbnail strip) is hidden as part
  of the 2i mobile layout remodel. Coaches cannot visually navigate between frames on mobile
  without using prev/next on the floating remote.
- **Action**: Design and implement a swipe-accessible FrameStrip alternative for mobile —
  e.g. a horizontally scrollable thumbnail row inside the mobile drawer, or a swipe gesture
  on the canvas to advance frames.
- **Roadmap ref**: Post-2i; candidate for Phase 3d or a dedicated sub-area

---

### FEAT-013 — Coaching Points Field in Animation Metadata
- **Status**: `[x]` Closed
- **Completed**: 2026-05-04 (Phase 2c+, 018-share-playback-workflow)
- **Summary**: Coaching Points field added to animation metadata schema, save/edit forms, and surfaced in playback coaching notes overlay.
- **Severity**: Medium (coaching utility)
- **Observed**: Animation save/edit forms currently support a title and description but no dedicated field for coaching delivery guidance. Coaches need a 'Coaching Points' free-text field to record what to watch for during a session and tips for delivery — separate from the drill description.
- **Action**: Add a 'Coaching Points' free text field to the animation metadata schema (below Description). Display in the save/edit form, store in the database, and surface it in the playback coaching notes reveal (PLAYBACK-002).
- **See also**: EDITOR-016 (save/metadata unification), PLAYBACK-002, FEAT-003 (full pedagogical schema — Phase 5+)
- **Roadmap ref**: Phase 2 (pulled forward from FEAT-003 as a standalone, immediate need)

---

### FEAT-011 — Spinning Rugby Ball Save Indicator
- **Status**: `[x]` Closed
- **Completed**: 2026-05-16
- **Summary**: Created `RugbyBallSpinner` component (`src/shared/ui/RugbyBallSpinner.tsx`) — amber oval with pitch-green seam and lacing marks, animated via existing `animate-spin-slow` token (3s). Replaced `Loader2` spinner on the Save Local button in `ProjectActions.tsx`. Other `Loader2` usages (load, delete, etc.) retain the generic spinner — rugby ball is save-specific for brand resonance.
- **Severity**: Low (delight)
- **Roadmap ref**: Phase 4 (low-effort delight item)

---

## Share Flow & Navigation (new — 2026-04-24 review)

### FLOW-001 — No Share Flow from Gallery to /share/{id}
- **Status**: `[x]` Closed
- **Completed**: 2026-05-02 (Phase 2l, 015-cosmetic-polish)
- **Summary**: Gallery Play/Share buttons updated to use /share/{id}; Edit/Replay/Share standardized across all cards.
- **Severity**: High (core loop)
- **Observed**: Gallery "Play" button goes to /replay/{id} (unoptimised, old route). No UI path exists from gallery to the optimised /share/{id} route. These routes have meaningfully different UX (share is mobile-optimised, full-screen).
- **Action**: Update gallery Play/Share buttons to use /share/{id}; clarify /replay vs /share distinction in code comments; consider deprecating /replay for public use
- **Roadmap ref**: Phase 2c (Share Workflow) — coordinate with UX-008

---

### FLOW-002 — Share Replay Missing Context and Navigation
- **Status**: `[x]` Closed
- **Completed**: 2026-05-02 (Phase 2l, 015-cosmetic-polish)
- **Summary**: Animation title and progression prev/next navigation added to ShareViewer overlay; coaching notes reveal added in 018.
- **Severity**: High (player experience)
- **Observed**: /share/{id} shows the animation but has: no animation name, no progression navigation (next/prev for multi-drill sets), no clear link back to the site.
- **Target UX**: Coaches check the link works → back to editor. Players see the replay → can navigate progressions → optionally visit the site (welcome page or landing).
- **Action**: Add animation title to share view; add prev/next navigation if progressions exist; add subtle "powered by" link back to landing
- **Roadmap ref**: Phase 2c (Share Workflow)

---

### FLOW-003 — Welcome Page for Players Receiving Share Links
- **Status**: `[ ]` Open
- **Severity**: Low (growth)
- **Observed**: Players receiving a share link land directly in the animation with no context about what the site is or what to do next.
- **Proposal**: Lightweight player-facing welcome page — minimal, explains what they're seeing, optional CTA to explore gallery
- **Action**: Design and implement /welcome route; add link from /share view footer; keep it non-intrusive
- **Roadmap ref**: Phase 4 (post-launch, after core loop is solid)

---

### FLOW-004 — Share View Workflow for Logged-In Users
- **Status**: `[x]` Closed
- **Completed**: 2026-05-02 (Phase 2l, 015-cosmetic-polish)
- **Summary**: Context-aware back button in ShareViewer: shows "My Playbook" for animation owner, "Gallery" otherwise.
- **Severity**: Medium (UX workflow)
- **Observed**: From /share/ the return/back button (bottom left) returns users to the gallery only. Logged-in users should have a path back to their Playbook.
- **Action**: Context-aware back button in Share view. If user is owner/logged-in, offer return to Playbook.
- **Roadmap ref**: Phase 2c (Share Workflow)

---

### ADMIN-001 — Admin Bulk Deletion
- **Status**: `[x]` Closed
- **Completed**: 2026-05-16
- **Summary**: Added checkbox column with select-all to animations table; bulk action bar appears when any rows selected; confirm dialog before bulk delete; API extended to accept `{ ids: string[] }` using Supabase `.in()`.
- **Severity**: Medium (Admin efficiency)
- **Observed**: Admin Dashboard lacks multi-select for deleting animations in bulk.
- **Action**: Implement multi-select checkboxes and a "Delete Selected" action in the admin dashboard.
- **Roadmap ref**: Phase 3 (Stability & Pre-Launch Hardening)

---

## Performance (new — 2026-04-24 review)

### PERF-001 — Lighthouse Audit Baseline
- **Status**: `[ ]` Open
- **Severity**: Medium (pre-launch quality gate)
- **Observed**: No Lighthouse audit has been run since the landing page rebrand (Apr 20). Chrome F12 AI assistance also available for analysis. Pre-launch baseline required.
- **Action**: Run Lighthouse on: landing page, gallery, editor, share view; document scores; identify any Critical (red) issues; set targets (Performance >80, Accessibility >90, Best Practices >90)
- **Roadmap ref**: Phase 3e (Performance Baseline)

---

## Closed Issues

### LEGAL-001 — Cookie / Consent Banner Missing
- **Status**: `[x]` Closed
- **Completed**: 2026-04-25 (Phase 0, 003-legal-compliance)
- **Summary**: Cookie audit completed; site has no telemetry per constitutional constraint. Third-party scripts (fonts, Supabase SDK) assessed. Decision documented.

---

### LEGAL-002 — Terms of Service Needs Full Review
- **Status**: `[x]` Closed
- **Completed**: 2026-04-25 (Phase 0, 003-legal-compliance)
- **Summary**: ToS fully reviewed against PRD v2.0 and Constitution v3.4.2. Updated to reflect cloud-first architecture, content licensing model, and org account terms.

---

### LEGAL-003 — Privacy Policy Needs Full Review
- **Status**: `[x]` Closed
- **Completed**: 2026-04-25 (Phase 0, 003-legal-compliance)
- **Summary**: Privacy policy fully reviewed. Supabase data residency confirmed. Constitutional prohibition on telemetry/analytics explicit. Section added for org account data separation.

---

### UX-002 — Export Settings Outdated (WebM/GIF)
- **Status**: `[x]` Closed
- **Completed**: 2026-04-25 (Phase 2a, 005-editor-canvas)
- **Summary**: Export settings block removed from sidebar. Deprecated features hidden to avoid confusion.

---

### UX-003 — YouTube Linking Discoverability
- **Status**: `[x]` Closed
- **Completed**: 2026-04-25 (Phase 2a, 005-editor-canvas)
- **Summary**: Moved YouTube URL field from sidebar to dedicated Metadata dialog.

---

### UX-006 — Pitch Layout Not Standardized
- **Status**: `[x]` Closed
- **Completed**: 2026-04-25 (Phase 2a, 005-editor-canvas)
- **Summary**: Redesigned pitch SVG with correct try lines, 22m, 10m, halfway, and 5m gang lines.

---

### EDITOR-001 — Metadata to Pop-Out Pane
- **Status**: `[x]` Closed
- **Completed**: 2026-04-25 (Phase 2a, 005-editor-canvas)
- **Summary**: Animation name and YouTube link moved to dedicated `MetadataSheet` dialog.

---

### EDITOR-003 — Export Settings Panel: Deprecate
- **Status**: `[x]` Closed
- **Completed**: 2026-04-25 (Phase 2a, 005-editor-canvas)
- **Summary**: Removed export settings panel from ProjectActions.

---

### EDITOR-004 — Entity Button Styling Inconsistent
- **Status**: `[x]` Closed
- **Completed**: 2026-04-25 (Phase 2a, 005-editor-canvas)
- **Summary**: Standardized all entity palette buttons to `variant="outline"`.

---

### EDITOR-005 — Tackle Bag / Tackle Shield Icons Unrecognisable
- **Status**: `[x]` Closed
- **Completed**: 2026-04-25 (Phase 2a, 005-editor-canvas)
- **Summary**: Redesigned tackle shield and tackle bag icons using coaching whiteboard aesthetic shapes.

---

### EDITOR-006 — Attacker/Defender Token Labels
- **Status**: `[x]` Closed
- **Completed**: 2026-04-25 (Phase 2a, 005-editor-canvas)
- **Summary**: Removed "Attacker/Defender" text from tokens and replaced with a persistent `PitchLegend` on the canvas.

---

### EDITOR-007 — Entity Label Typography Too Small
- **Status**: `[x]` Closed
- **Completed**: 2026-04-25 (Phase 2a, 005-editor-canvas)
- **Summary**: Increased player label font size to 14 bold for better mobile legibility.

---

### EDITOR-008 — Team Selector Does Nothing
- **Status**: `[x]` Closed
- **Completed**: 2026-04-25 (Phase 2a, 005-editor-canvas)
- **Summary**: Removed non-functional team selector from EntityProperties.

---

### EDITOR-009 — Colour Selector Palette Too Large
- **Status**: `[x]` Closed
- **Completed**: 2026-04-25 (Phase 2a, 005-editor-canvas)
- **Summary**: Reduced color picker palette to 6 distinct tactical colors.

---

### PITCH-001 — Pitch SVG Markings Incorrect
- **Status**: `[x]` Closed
- **Completed**: 2026-04-25 (Phase 2a, 005-editor-canvas)
- **Summary**: Rewrote `rugby-union.svg` with standards-correct lines and H-shaped posts.

---

### UX-016 — User Onboarding & Help
- **Status**: `[x]` Closed
- **Completed**: 2026-05-01 (Phase 2k, 014-user-guide)
- **Summary**: Implemented FirstRunModal onboarding, /help page, /help/coaching (APES), and integrated help navigation.
### PITCH-002 — Pitch Does Not Scale to Screen Size in Editor
- **Status**: `[x]` Closed
- **Completed**: 2026-04-25 (Phase 2a, 005-editor-canvas)
- **Summary**: Implemented `useEditorCanvasSize` hook using ResizeObserver to ensure responsive canvas in the editor.

---

### UX-008 — Share Workflow Not Clear
- **Status**: `[x]` Closed
- **Severity**: High (breaks core loop)
- **Observed**: Animation rendering is confusing. Hash is unique but rendering via "replay" (old, not optimized) vs "share" (optimized). Users don't know which to use or how to share from where.
- **Action**: Document and clarify share workflow. Update UI to guide coaches step-by-step.
- **Completed**: 2026-04-26 (Phase 2c, 006-share-workflow)
- **Roadmap ref**: Phase 2, T3 (Landing Credibility)

---

### FEAT-010 — Snap to Grid
- **Status**: `[x]` Closed
- **Severity**: Low (power user feature)
- **Observed**: When building frames, coaches would benefit from snapping entity positions to a grid to maintain alignment across frames.
- **Action**: Add optional snap-to-grid toggle; define grid resolution relative to pitch markings; snap on drag end
- **Completed**: 2026-05-01 (Phase 2j, 013-snap-to-grid)
- **Roadmap ref**: Phase 4 (pulled forward to Phase 2j)

---

### FEATURE-001 — Endorsed Animations (RFU Partnership)
- **Status**: `[x]` Closed
- **Completed**: 2026-04-27 (Phase 2f, 009-gallery-playbook)
- **Summary**: Implemented `endorsed_by` column and Hampshire RFU badge in gallery cards.

---

### FEAT-007 — Search & Keyword Discoverability
- **Status**: `[x]` Closed
- **Completed**: 2026-04-27 (Phase 2f, 009-gallery-playbook)
- **Summary**: Added keyword search and tag filtering to the gallery.

---

### UX-017 — Home Page Footer Duplication
- **Status**: `[x]` Closed
- **Completed**: 2026-05-02 (Phase 2l, 015-cosmetic-polish)
- **Summary**: Removed duplicate CTA links from the landing page footer.

---

### MYPLAYBOOK-001 — No Search or Filter
- **Status**: `[x]` Closed
- **Completed**: 2026-05-02 (Phase 2l, 015-cosmetic-polish)
- **Summary**: Added search and type filtering to the My Playbook page.

---

### MYPLAYBOOK-002 — Layout Parity with Public Gallery
- **Status**: `[x]` Closed
- **Completed**: 2026-05-02 (Phase 2l, 015-cosmetic-polish)
- **Summary**: Aligned My Playbook card styles with the public gallery.

---

### MYPLAYBOOK-003 — Unclear Edit/Replay/Share Flow
- **Status**: `[x]` Closed
- **Completed**: 2026-05-02 (Phase 2l, 015-cosmetic-polish)
- **Summary**: Added explicit "Edit", "Play", and "Delete" actions to My Playbook cards.

---

### MYPLAYBOOK-004 — Private Animations Cannot Be Opened
- **Status**: `[x]` Closed
- **Completed**: 2026-05-02 (Phase 2l, 015-cosmetic-polish)
- **Summary**: Fixed auth checks to allow owners to view their private animations on the share route.

---

### PROFILE-001 — Profile Page Too Functional
- **Status**: `[x]` Closed
- **Completed**: 2026-05-02 (Phase 2l, 015-cosmetic-polish)
- **Summary**: Redesigned profile page with identity card layout and improved visuals.

---

### GALLERY-003 — Templates Only Filter
- **Status**: `[x]` Closed
- **Completed**: 2026-05-02 (Phase 2l, 015-cosmetic-polish)
- **Summary**: Added a filter for template animations in the community gallery.

---

### UX-005 — Authentication State Not Visible
- **Status**: `[x]` Closed
- **Completed**: 2026-05-02 (Phase 2l, 015-cosmetic-polish)
- **Summary**: Implemented `ProfileChip` and `LoginButton` in `Navigation.tsx` to show persistent auth state.

---

### UX-015 — Gallery vs Playbook Visual Distinction
- **Status**: `[x]` Closed
- **Completed**: 2026-05-02 (Phase 2l, 015-cosmetic-polish)
- **Summary**: Added unique tactical background motifs and distinct header styling to differentiate Gallery from My Playbook.

---

## Phase 2 Triage Assessment (2026-05-04)

Workflow-first audit applied the **Workflow 1 blocker test**: "Does this issue prevent a user completing the Core Coaching Loop (create → save → edit frames → share → replay)?"

**Result**: ✅ **All Phase 2 blockers closed as of 2026-05-04.** EDITOR-019 is delivered. All other open Phase 2 issues are non-blockers against Workflow 1 and roll to Phase 3.

| Issue | Workflow 1 Blocker? | Roll-to |
|---|---|---|
| EDITOR-019 (frame editing) | ✅ **Fixed** | Phase 2 remainder — spec 020 |
| UX-001 (welcome popup contrast) | No — accessibility, not workflow | Phase 3 |
| EDITOR-010 (progression buttons) | No — friction, not block | Phase 3 |
| EDITOR-011 (team colour selection) | No — polish | Phase 3 |
| EDITOR-012 (entity spawning logic) | No — friction, not block | Phase 3 |
| EDITOR-014 (spawn offsetting) | No — polish | Phase 3 |
| EDITOR-017 (save button layout) | No — visual | Phase 3 |
| UX-004 (gallery visual preview) | No — engagement | Phase 3 |
| UX-007 (design direction research) | No — landing | Phase 4 |
| UX-009 (gallery carousel) | No — discoverability | Phase 3 |
| UX-011 (entity depth) | No — visual | Phase 3 |
| UX-018 (autosave popup) | No — cosmetic | Phase 3 |
| NAV-001 (nav tab indicator) | No — visual | Phase 3 |
| CONTACT-001 (contact form) | No — compliance | Phase 3 |
| LANDING-001 (app name) | No — brand | Phase 4 |

---

## [BUG] WF1-S5: Edit metadata updates card title
**Detected**: 2026-05-08 audit run
**Workflow**: WF1 Core Coaching Loop, Step 5
**Symptom**: Edit Info button clicked successfully but `[role="dialog"]` did not appear within 5s — edit metadata dialog fails to open from My Playbook
**Classification**: UI regression
**Fixed**: 2026-05-08 — `coaching_notes: null → undefined` in `EditMetadataModal` (Zod rejected null for `.optional()` fields, causing 400 on save attempt which prevented the dialog from completing its open sequence)
**Status**: Closed

---

## [BUG] WF2-S1+S2: My Playbook shows animations and Share opens modal
**Detected**: 2026-05-08 audit run
**Workflow**: WF2 Share & Replay, Steps 1–2
**Symptom**: Animation card found and visible, but `button[aria-label="Share"]` never became clickable after hover — 120s timeout
**Classification**: UI regression
**Fixed**: 2026-05-08 — Test was not setting `link_shared` visibility before the Share assertion; the overwrite flow defaulted to `private`, hiding the Share button. WF1-S6 now sets `link_shared` explicitly before WF2 runs.
**Status**: Closed

---

## How to Use This Tracker

1. **Add**: Copy a template, assign ID (UX-### for UI/UX, FEATURE-### for features), fill details
2. **Reference**: Link from ROADMAP.md phase sections and spec docs
3. **Update**: Change status checkboxes as work progresses
4. **Archive**: Move closed issues to bottom section with completion date

---

## Quick Reference by Roadmap Phase

- **Phase 2** (Launch Credibility): UX-001, UX-009 *(~~UX-004~~, ~~UX-007~~, ~~UX-010~~, ~~UX-011~~, ~~UX-012~~, ~~UX-013~~, ~~UX-014~~, ~~UX-018~~ closed)*
- **Phase 2 — Editor/Workflow**: *(~~EDITOR-010~~, ~~EDITOR-011~~, ~~EDITOR-012~~, ~~EDITOR-013~~, ~~EDITOR-014~~, ~~EDITOR-017~~, ~~EDITOR-019~~, ~~EDITOR-016~~, ~~EDITOR-018~~, ~~WORKFLOW-001~~, ~~FEAT-013~~ closed)*
- **Phase 2 — Playback/Share**: FLOW-003 *(~~PLAYBACK-001~~, ~~PLAYBACK-002~~, ~~FLOW-001~~, ~~FLOW-002~~, ~~FLOW-004~~, ~~EDITOR-002~~ closed)*
- **Phase 2 — Landing/Nav**: LANDING-001, CONTACT-001 *(~~NAV-001~~, ~~LANDING-002~~, ~~LANDING-003~~, ~~LANDING-004~~ closed)*
- **Phase 2 — Gallery/Playbook**: *(~~GALLERY-001~~, ~~GALLERY-002~~ closed)*
- **Audit Bugs**: *(~~WF1-S5~~, ~~WF2-S1+S2~~ closed 2026-05-08)*
- **Phase 3** (Quality Safety Net): ADMIN-001, PERF-001 *(~~FEAT-006~~, ~~SEC-001~~, ~~SEC-002~~, ~~SEC-003~~ closed)*
- **Phase 3–4** (Feature Decisions): *(~~FEAT-008~~, ~~FEAT-009~~ deferred/won't do)*
- **Phase 4+** (Growth): ~~FEATURE-001~~ (shipped via 009), FEATURE-002, FEATURE-010, ~~FEAT-011~~ (closed), ~~FEAT-012~~ (closed 021), DESIGN-001, ~~DESIGN-002~~ (closed 022)
- **Phase 5+** (Coaching Education Platform — Aspiration): ASPIRATION-001, FEATURE-003, FEATURE-004, FEATURE-005
