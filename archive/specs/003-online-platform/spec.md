# Feature Specification: Online Platform

**Feature Branch**: `003-online-platform`  
**Created**: 2026-01-29  
**Status**: Draft  
**Input**: User description: "Add user accounts, cloud storage, gallery, and migrate to Next.js for full website with landing, auth pages, and static pages"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Coach Creates Account and Saves Animation (Priority: P1)

A grassroots rugby coach discovers the tool, creates an account, builds a tactical animation, and saves it to their personal cloud gallery for future access.

**Why this priority**: Core value proposition - without accounts and cloud storage, there is no online platform. This enables all other features.

**Independent Test**: Can be fully tested by completing registration, creating a simple animation, saving to cloud, logging out, logging back in, and verifying the animation is accessible.

**Acceptance Scenarios**:

1. **Given** a visitor on the landing page, **When** they click "Get Started" and complete email registration with verification, **Then** they are logged in and can access the animation tool.
2. **Given** a logged-in user with an animation, **When** they click "Save to Cloud" and enter title/metadata, **Then** the animation is stored and appears in their personal gallery.
3. **Given** a logged-in user, **When** they navigate to "My Gallery", **Then** they see all their saved animations with title, date, and thumbnail.
4. **Given** a user who logs out and logs back in, **When** they access their gallery, **Then** all previously saved animations are still available.

---

### User Story 2 - Coach Shares Animation Publicly (Priority: P1)

A coach creates a useful tactical play and publishes it to the public gallery so other coaches can discover and learn from it.

**Why this priority**: Community value - public sharing enables discovery and peer learning, differentiating this from a local-only tool.

**Independent Test**: Can be tested by saving an animation, changing visibility to "Public", and verifying it appears in the public gallery search results.

**Acceptance Scenarios**:

1. **Given** a user with a saved private animation, **When** they change visibility to "Public", **Then** the animation becomes discoverable in the public gallery.
2. **Given** a public animation, **When** any visitor searches the public gallery, **Then** matching animations appear in results with title, description, and preview.
3. **Given** a public animation, **When** a visitor clicks on it, **Then** they can view the full animation replay without logging in.

---

### User Story 3 - Visitor Explores Public Gallery (Priority: P1)

A coach looking for tactical ideas browses the public gallery, searches for specific plays, and views animations without needing an account.

**Why this priority**: Discovery and accessibility - guests must be able to find value before committing to registration.

**Independent Test**: Can be tested by visiting the public gallery as a guest, searching for animations, filtering by tags, and viewing replays.

**Acceptance Scenarios**:

1. **Given** a visitor (not logged in), **When** they navigate to the public gallery, **Then** they see a browsable list of public animations.
2. **Given** a visitor on the gallery page, **When** they search for "lineout", **Then** they see animations tagged with or titled "lineout".
3. **Given** a visitor on the gallery page, **When** they filter by animation type "tactic", **Then** only tactical animations are displayed.
4. **Given** a visitor viewing a public animation, **When** they click "Play", **Then** the animation replays without requiring login.

---

### User Story 4 - Guest Creates Limited Animation Locally (Priority: P2)

A visitor wants to try the tool without registering. They can create a basic animation locally but cannot save to cloud.

**Why this priority**: Reduces friction for new users to experience the tool's value before committing to registration.

**Independent Test**: Can be tested by using the animation tool without logging in, creating up to 10 frames, and verifying cloud save is disabled.

**Acceptance Scenarios**:

1. **Given** a guest visitor, **When** they access the animation tool, **Then** they can create animations with up to 10 frames.
2. **Given** a guest with an animation, **When** they try to add an 11th frame, **Then** they see a message prompting registration for unlimited frames.
3. **Given** a guest with an animation, **When** they click "Save", **Then** they can only download JSON locally; cloud save prompts registration.

---

### User Story 5 - Registered User Upvotes Animations (Priority: P2)

A logged-in coach finds a useful public animation and upvotes it to show appreciation and help surface quality content.

**Why this priority**: Community curation - upvotes help surface the best content without requiring complex moderation.

**Independent Test**: Can be tested by logging in, viewing a public animation (not own), clicking upvote, and verifying the count increases.

**Acceptance Scenarios**:

1. **Given** a logged-in user viewing another user's public animation, **When** they click the upvote button, **Then** the upvote count increases by 1.
2. **Given** a user who has already upvoted an animation, **When** they click upvote again, **Then** their upvote is removed (toggle behavior).
3. **Given** a user viewing their own public animation, **When** they look for the upvote button, **Then** it is disabled or hidden.

---

### User Story 6 - User Reports Inappropriate Content (Priority: P2)

A user encounters an animation with inappropriate content and reports it for admin review.

**Why this priority**: Trust and safety - essential for any public content platform.

**Independent Test**: Can be tested by logging in, viewing a public animation, clicking "Report", selecting a reason, and verifying the report is submitted.

**Acceptance Scenarios**:

1. **Given** a logged-in user viewing a public animation, **When** they click "Report" and select a reason, **Then** the report is submitted and they see confirmation.
2. **Given** a submitted report, **When** an admin views the moderation queue, **Then** the reported animation appears with reporter details and reason.

---

### User Story 7 - Visitor Learns About the Tool (Priority: P2)

A new visitor lands on the homepage and learns what the tool does, who it's for, and how to get started through clear messaging and navigation.

**Why this priority**: Conversion - visitors need to understand value before registering.

**Independent Test**: Can be tested by visiting the landing page and verifying presence of hero section, feature highlights, and clear call-to-action.

**Acceptance Scenarios**:

1. **Given** a visitor on the landing page, **When** they view the hero section, **Then** they understand this is a rugby tactical animation tool for coaches.
2. **Given** a visitor on the landing page, **When** they scroll down, **Then** they see key features explained with visuals.
3. **Given** a visitor, **When** they click "Get Started", **Then** they are taken to registration or directly to the tool (if allowing guest access).

---

### User Story 8 - Admin Moderates Reported Content (Priority: P3)

An admin reviews reported animations and takes appropriate action (dismiss, hide, or remove content; warn or ban users).

**Why this priority**: Required for public content but can be handled manually initially.

**Independent Test**: Can be tested by creating a report, logging in as admin, viewing the queue, and taking an action.

**Acceptance Scenarios**:

1. **Given** an admin on the moderation dashboard, **When** they view pending reports, **Then** they see animation details, reporter, reason, and action buttons.
2. **Given** an admin reviewing a report, **When** they click "Hide", **Then** the animation is removed from public view and the owner is notified.
3. **Given** an admin reviewing a false report, **When** they click "Dismiss", **Then** the report is resolved and the animation remains public.

---

### User Story 9 - Coach Remixes Public Play (Priority: P2)

A coach discovers a useful public animation and wants to create their own variation of it without affecting the original.

**Why this priority**: Growth loop - remixing enables coaches to learn from each other and build upon shared knowledge, driving engagement and content creation.

**Independent Test**: Can be tested by logging in, viewing a public animation (not own), clicking "Remix to Playbook", and verifying a copy appears in personal gallery.

**Acceptance Scenarios**:

1. **Given** a logged-in user viewing a public animation, **When** they click "Remix to Playbook", **Then** a copy of the animation is saved to their personal gallery with "(Remix)" appended to the title.
2. **Given** a remixed animation in user's gallery, **When** they edit and save it, **Then** the original public animation is unchanged.
3. **Given** a guest viewing a public animation, **When** they click "Remix to Playbook", **Then** they are prompted to register first.

---

### Edge Cases

- What happens when a user's email verification link expires? → Resend verification email option
- What happens if a user deletes their account? → All their animations are deleted; public ones removed from gallery
- What happens if an animation is reported while owner is editing? → Owner can still edit; if hidden, they see a notice
- What happens when storage quota (50 animations) is reached? → Clear message with option to delete old animations
- What happens if a user tries to access /my-gallery without logging in? → Redirect to login with return URL

## Requirements *(mandatory)*

### Functional Requirements

**Authentication**
- **FR-AUTH-01**: System MUST allow users to register with email and password
- **FR-AUTH-02**: System MUST verify email addresses before granting full access
- **FR-AUTH-03**: System MUST allow users to log in with verified credentials
- **FR-AUTH-04**: System MUST allow users to reset password via email link
- **FR-AUTH-05**: System MUST allow users to log out and clear session
- **FR-AUTH-06**: System MUST support guest mode with limited functionality (10 frames max, no cloud save)
- **FR-AUTH-07**: System MUST allow users to delete their account and all associated data

**Cloud Storage**
- **FR-STOR-01**: Registered users MUST be able to save animations to cloud storage
- **FR-STOR-02**: System MUST enforce storage limit of 50 animations per user
- **FR-STOR-03**: System MUST enforce maximum animation duration of 60 seconds
- **FR-STOR-04**: Saved animations MUST include metadata (title, description, coaching notes, type, tags)
- **FR-STOR-05**: Users MUST be able to edit saved animation metadata
- **FR-STOR-06**: Users MUST be able to delete their saved animations
- **FR-STOR-07**: System MUST support importing animations from local JSON files

**Gallery**
- **FR-GAL-01**: Users MUST be able to view their personal gallery of saved animations
- **FR-GAL-02**: Personal gallery MUST support sorting by title, date, duration, type
- **FR-GAL-03**: Personal gallery MUST display thumbnail previews
- **FR-GAL-04**: Public gallery MUST be accessible without login
- **FR-GAL-05**: Public gallery MUST support search by title and description
- **FR-GAL-06**: Public gallery MUST support filtering by animation type and tags
- **FR-GAL-07**: Public gallery MUST display trending/popular animations (by upvotes)

**Visibility & Sharing**
- **FR-VIS-01**: Animations MUST default to private visibility
- **FR-VIS-02**: Users MUST be able to change visibility to link-shared or public
- **FR-VIS-03**: Link-shared animations MUST be viewable by anyone with the URL
- **FR-VIS-04**: Public animations MUST be discoverable in the public gallery
- **FR-VIS-05**: Users MUST be able to copy shareable links for their animations

**Social Features**
- **FR-SOC-01**: Registered users MUST be able to upvote public animations (not their own)
- **FR-SOC-02**: Upvotes MUST be toggleable (upvote/remove upvote)
- **FR-SOC-03**: Animation detail pages MUST display upvote count

**Content Moderation**
- **FR-MOD-01**: Registered users MUST be able to report public animations
- **FR-MOD-02**: Reports MUST include a reason (inappropriate, spam, copyright, other)
- **FR-MOD-03**: Admins MUST be able to view and manage report queue
- **FR-MOD-04**: Admins MUST be able to hide, remove, or dismiss reported content
- **FR-MOD-05**: Users MUST agree to Terms of Service on registration
- **FR-MOD-06**: System MUST validate user-submitted text (titles, descriptions) against a blocklist of offensive terms (using a library like `bad-words`) before allowing save to database (pre-moderation)

**Website Pages**
- **FR-WEB-01**: System MUST have a landing page explaining the tool and prompting action
- **FR-WEB-02**: System MUST have login and registration pages
- **FR-WEB-03**: System MUST have Terms of Service and Privacy Policy pages
- **FR-WEB-04**: System MUST have a contact page using external form service (Formspree)
- **FR-WEB-05**: Landing page and gallery pages MUST be search-engine friendly

**User Interface**
- **FR-UI-01**: When a gallery is empty, display a warm "Coach's Clipboard" illustration with a call-to-action, rather than a generic "No results" message

**SEO & Social**
- **FR-SEO-01**: Public animation links MUST generate a dynamic Open Graph (OG) image showing a preview of the board/field, using `@vercel/og`

**Security**
- **FR-SEC-01**: System MUST implement Content Security Policy headers
- **FR-SEC-02**: System MUST implement persistent rate limiting on authentication and write endpoints using Supabase `rate_limits` table (or Vercel KV) to track usage across serverless instances
- **FR-SEC-03**: System MUST validate all user input on both client and server
- **FR-SEC-04**: System MUST never expose sensitive secrets to client-side code
- **FR-SEC-05**: System MUST use secure, HTTP-only cookies for session management

### Key Entities

- **User**: Represents a registered account with email, optional display name, role (user/admin), and quota tracking
- **SavedAnimation**: User-owned animation with metadata, visibility settings, payload, and engagement metrics (upvotes, views)
- **Upvote**: Association between a user and an animation they have upvoted
- **ContentReport**: Record of a reported animation with reporter, reason, status, and admin action taken
- **Follow** (foundation only): Association between follower and followed user (UI deferred)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete account registration in under 2 minutes
- **SC-002**: Users can save an animation to cloud in under 10 seconds after clicking save
- **SC-003**: Public gallery search returns results in under 2 seconds
- **SC-004**: 90% of users successfully save their first animation on first attempt
- **SC-005**: Landing page loads in under 3 seconds on mobile connections
- **SC-006**: System supports at least 100 concurrent users without degradation
- **SC-007**: All user data can be exported or deleted within 30 days of request (GDPR compliance)
- **SC-008**: Reported content is reviewed within 48 hours (manual SLA, not system metric)
- **SC-009**: Guest users who create animations convert to registered users at >20% rate
- **SC-010**: Core offline animation features (Tier 1) continue to work without network connectivity
