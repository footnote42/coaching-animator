# Issues Tracker

**Light-touch, local issue tracking for coaching-animator**

Status legend: `[ ]` Open · `[x]` Closed · `[~]` Deferred

---

## Phase 2: Launch Credibility

### 🔴 UX-001 — Welcome Popup Button Contrast
- **Status**: `[x]` Closed
- **Severity**: High (accessibility)
- **Observed**: Dark text on dark green background in welcome popup button — difficult to read
- **Location**: Welcome popup ("Share a replay link with your squad" button)
- **Files**: Find via grep for welcome popup component
- **Action**: Increase contrast or change background color to meet WCAG AA
- **Roadmap ref**: Phase 2, T3 (Landing Credibility)

---

### EDITOR-010 — Progression Buttons Missing for New Animations
- **Status**: `[x]` Closed
- **Severity**: Medium (usability)
- **Observed**: The progression buttons at the top of the animation page are not always present, especially noticeable when creating a new animation. They only appear once the animation is saved and has progressions.
- **Action**: Refactor the progression panel logic to allow local unsaved progressions, or show an empty state to add the first progression.
- **Roadmap ref**: Phase 2 (Editor & Canvas)

---

### EDITOR-011 — Team Colour Selection & Legend Alignment
- **Status**: `[ ]` Open
- **Severity**: Low (UX clarity)
- **Observed**: The legend indicates team colours, but there's no option to change the team colours and immediately have those selections amend the colours of the entities on the pitch.
- **Action**: Implement a UI for selecting team colours globally for the animation, and connect it to the EntityColors resolution logic.
- **Roadmap ref**: Phase 2 (Editor & Canvas)

---

### EDITOR-012 — Entity Spawning & Persistence Logic
- **Status**: `[ ]` Open
- **Severity**: Medium (UX friction)
- **Observed**: When adding entities to an existing multi-frame animation, they are currently placed in the centre of the pitch for *every* frame. This requires the user to move or delete them on every frame individually.
- **Action**: Change spawning logic: an entity should be placed only in the frame where it was added. It should then maintain that same position in all *subsequent* frames by default, awaiting user movement, rather than resetting to centre on every frame.
- **Roadmap ref**: Phase 2 (Editor & Canvas)

---

### EDITOR-014 — Entity Spawn Offsetting
- **Status**: `[ ]` Open
- **Severity**: Low (usability)
- **Observed**: Adding multiple entities without moving the first results in them sitting directly on top of each other at the centre of the pitch, making selection difficult.
- **Action**: Implement a spawn offset; if the centre point is already occupied by a just-added entity that hasn't been moved, offset the next entity slightly.
- **Roadmap ref**: Phase 2 (Editor & Canvas)

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

### UX-010 — Progression Workflow & Gallery Integration
- **Status**: `[ ]` Open
- **Severity**: High (core workflow)
- **Observed**: Progression workflow is not intuitive. Progressions currently sit as standalone animations in the gallery, cluttering the view.
- **Action**: 
  - Update save feature to allow saving directly to a "parent" animation.
  - Remove standalone progression animations from the main gallery; they should only be accessible via the parent.
  - Inherit parent metadata and descriptors automatically.
  - Auto-generate title as `{Parent Title} {part n}`.
- **Roadmap ref**: Phase 2c (Share Workflow)

---

### UX-011 — Entity Depth & Visual Indicators
- **Status**: `[ ]` Open
- **Severity**: Low (visual polish)
- **Observed**: Entities look "flat" on the pitch. It's not always clear how they are layered or that they are distinct from the background.
- **Action**: Add subtle shadows or depth indicators to entities (players, balls, kit) to give a sense of depth and separation from the pitch surface.
- **Roadmap ref**: Phase 2 (Visual Excellence)

---

### UX-012 — Thumbnail Design & Color Scheme
- **Status**: `[ ]` Open
- **Severity**: Low (visual polish)
- **Observed**: Tactical thumbnails use muted/placeholder colors (amber/muted primary). Should closer match the actual pitch (grass green) and entity (red/blue teams, high-vis yellow cones) color scheme.
- **Action**: Update `MiniPitchSVG` to use colors more representative of the actual editor experience.
- **Roadmap ref**: Phase 2f (Gallery & My Playbook)

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
- **Status**: `[ ]` Open
- **Severity**: Medium (brand credibility)
- **Observed**: Landing background should use subtle coaching diagrams in the style of the brand icon. Design spec from review:
  > "The Tactical Ball" (The Marker Silhouette): A single, centered, utilitarian SVG-style icon of a rugby ball (prolate spheroid). Thick, hand-drawn whiteboard marker aesthetic. Ball outline: Pitch Green (#1A3D1A). Inside: Amber (#D97706) tactical markings — heavy hand-drawn X in centre, dotted line with arrowhead sweeping across indicating play direction. All lines imperfect and heavy-stroked. Zero rounded corners. Off-white textured background referencing 1980s rugby programme.
- **Action**: Design and implement SVG tactical ball icon; use as subtle background element on landing hero
- **Roadmap ref**: Phase 2e (Landing Refinements)

---

### LANDING-003 — Section 2 Card Copy Errors
- **Status**: `[ ]` Open
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
- **Status**: `[ ]` Open
- **Severity**: Medium (UX clarity)
- **Observed**: Section 3 card review:
  - Card 1: "Drag?" — unclear; actual interaction is click-to-place then drag; rewrite
  - Card 3: References "Export to GIF" — deprecated; remove
- **Action**: Rewrite section 3 card 1 to accurately describe click/drag interaction; remove GIF export mention
- **Roadmap ref**: Phase 2e (Landing Refinements)

---

## Gallery (new — 2026-04-24 review)

### GALLERY-001 — Hampshire RFU Endorsement Icon
- **Status**: `[ ]` Open
- **Severity**: Medium (partnership credibility)
- **Observed**: Gallery needs a Hampshire RFU endorsement icon/badge on endorsed cards. Image must be compressed to <50KB for web use.
- **Action**: Obtain RFU image; compress to <50KB; wire up to `endorsed_by` field (see FEATURE-001 for full endorsement system); for now, display badge if field set
- **Roadmap ref**: Phase 2f (Gallery & My Playbook); full system in Phase 4 (FEATURE-001)

---

### GALLERY-002 — Share from Gallery (Copy Link + WhatsApp)
- **Status**: `[ ]` Open
- **Severity**: High (core workflow)
- **Observed**: Share button on gallery card needs to: (a) produce a /share/{id} link for copy-paste, (b) offer WhatsApp share on mobile
- **Action**: Implement share sheet: copy-to-clipboard for desktop; Web Share API for mobile (targets WhatsApp naturally); generate /share/{id} not /replay/{id}
- **Roadmap ref**: Phase 2c (Share Workflow) — coordinate with UX-008

---

### GALLERY-003 — Templates Filter Untested
- **Status**: `[ ]` Open
- **Severity**: Medium (regression risk)
- **Observed**: Template gallery filter exists but has not been tested post-architecture refactor
- **Action**: Test template creation, template tagging, template filter in gallery, and template remix flow end-to-end
- **Roadmap ref**: Phase 2f (Gallery & My Playbook)

---

## My Playbook (new — 2026-04-24 review)

### MYPLAYBOOK-001 — No Search or Filter
- **Status**: `[ ]` Open
- **Severity**: Medium (usability at scale)
- **Observed**: My Playbook has no search or filter capability; gallery has it. As coaches accumulate animations, discovery becomes difficult.
- **Action**: Replicate gallery search and filter (by tag, title) in My Playbook view
- **Roadmap ref**: Phase 2f (Gallery & My Playbook)

---

### MYPLAYBOOK-002 — Layout Parity with Public Gallery
- **Status**: `[ ]` Open
- **Severity**: Medium (UX consistency)
- **Observed**: My Playbook cards lack the visual richness of Public Gallery cards (no tactical thumbnails, no progression strip).
- **Action**: Update `AnimationCard.tsx` to include the tactical preview and progression strip, matching the feature set and design of `PublicAnimationCard.tsx`.
- **Roadmap ref**: Phase 2f (Gallery & My Playbook)

---

## Profile (new — 2026-04-24 review)

### PROFILE-001 — Profile Page Too Functional
- **Status**: `[ ]` Open
- **Severity**: Low (UX polish)
- **Observed**: Profile page feels like a raw settings form rather than a coach's profile. Lacks personality and context.
- **Action**: UX review; consider merging with account settings; add coaching context (club, region); make it feel like a coach's card not a form
- **Roadmap ref**: Phase 2g (Auth & Profile)

---


---

### EDITOR-002 — Share Button Non-Functional in Dev
- **Status**: `[ ]` Open
- **Severity**: High (core loop)
- **Observed**: Share button in the editor is currently non-functional (marked "not available in development"). Should at minimum copy the /share/{id} link to clipboard or display it for manual copy.
- **Action**: Implement clipboard copy fallback; display link in a modal; hook up to Web Share API for mobile
- **Roadmap ref**: Phase 2c (Share Workflow)

---

---

## Playback Controls (new — 2026-04-24 review)

### PLAYBACK-001 — Playback Remote Should Float and Persist
- **Status**: `[ ]` Open
- **Severity**: Medium (usability at pitch)
- **Observed**: Playback controls disappear when scrolling and are fixed in document flow. Coaches at the pitch need controls always accessible.
- **Proposal**: Floating draggable remote (drag to reposition); always-on-screen; possibly bottom-anchored by default
- **Action**: Implement floating, draggable playback remote in editor; ensure it stays within viewport bounds
- **Roadmap ref**: Phase 2b (Playback & Controls)

---

### EDITOR-013 — Unified Floating Editor Controls
- **Status**: `[ ]` Open
- **Severity**: High (mobile usability)
- **Observed**: Users still have to scroll to see the bottom edge of the pitch or the timeline controls (add frame, pace, loop, etc.). These should be part of the persistent viewport overlay.
- **Action**: Expand the floating playback remote (from 007) to include all core frame controls: add frame, change pace, toggle loop, and ghosting. This eliminates the need for the fixed footer on smaller viewports.
- **Roadmap ref**: Phase 2b (Playback & Controls)

---

## New Features (from 2026-04-24 review)

### FEAT-010 — Snap to Grid
- **Status**: `[ ]` Open
- **Severity**: Low (power user feature)
- **Observed**: When building frames, coaches would benefit from snapping entity positions to a grid to maintain alignment across frames.
- **Action**: Add optional snap-to-grid toggle; define grid resolution relative to pitch markings; snap on drag end
- **Roadmap ref**: Phase 4 (post-launch, based on coach feedback)

---

### FEAT-011 — Spinning Rugby Ball Save Indicator
- **Status**: `[ ]` Open
- **Severity**: Low (delight)
- **Observed**: Current save action uses a generic spinner. A spinning rugby ball would reinforce brand personality.
- **Action**: Create or source a simple CSS/SVG animated rugby ball; replace save spinner globally
- **Roadmap ref**: Phase 4 (low-effort delight item)

---

## Share Flow & Navigation (new — 2026-04-24 review)

### FLOW-001 — No Share Flow from Gallery to /share/{id}
- **Status**: `[ ]` Open
- **Severity**: High (core loop)
- **Observed**: Gallery "Play" button goes to /replay/{id} (unoptimised, old route). No UI path exists from gallery to the optimised /share/{id} route. These routes have meaningfully different UX (share is mobile-optimised, full-screen).
- **Action**: Update gallery Play/Share buttons to use /share/{id}; clarify /replay vs /share distinction in code comments; consider deprecating /replay for public use
- **Roadmap ref**: Phase 2c (Share Workflow) — coordinate with UX-008

---

### FLOW-002 — Share Replay Missing Context and Navigation
- **Status**: `[ ]` Open
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

### PITCH-002 — Pitch Does Not Scale to Screen Size in Editor
- **Status**: `[x]` Closed
- **Completed**: 2026-04-25 (Phase 2a, 005-editor-canvas)
- **Summary**: Implemented `useEditorCanvasSize` hook using ResizeObserver to ensure responsive canvas in the editor.

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
