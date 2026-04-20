<!--
================================================================================
SYNC IMPACT REPORT
================================================================================
Version change: 3.3.0 → 3.4.0 (MINOR - Mobile-First Ergonomics & Tactical Depth)

Modified principles:
- Section III: Added Progressive Disclosure override for mobile viewports
- Section IV: Permitted hard-edged "Tactical Shadows" for interactive depth
- Section V: Added V.10 Mobile-First Adaptive Architecture

Rationale for Amendment (CA-2026-003):
- Pivot to mobile-first usage requires ergonomic overrides
- 2-click rule (Section III) creates clutter on small screens; progressive disclosure prioritized
- No-shadow rule (Section IV) hinders depth perception on touch; hard-edged shadows improve clarity
- Desktop-first sidebar-canvas model replaced by adaptive bottom-oriented UI

Key Safeguards:
- Shadows MUST be hard-edged (no blur) to maintain schematic aesthetic
- Bottom navigation restricted to editor view to maximize vertical pixels
- Progressive disclosure MUST remain contextual to avoid hidden-feature frustration

Constitutional Alignment:
- ✅ Maintains "Rugby-Centric" metaphors
- ✅ Maintains "Warm Tactical Professionalism"
- ✅ Enhances "Intuitive UX" for the primary mobile use case

Previous Amendment: 3.2.0 → 3.3.0 (Organizational Tier & Privacy-Preserving Metrics - CA-2026-002)
================================================================================
-->

# AnimatorApp Constitution

## Core Principles

### I. Modular Architecture

All features MUST be implemented as self-contained, composable modules.

- **Components**: Each UI component MUST be independently testable and reusable
- **Hooks**: Complex logic MUST be extracted into custom hooks with single responsibilities
- **Store Slices**: State MUST be organized into focused Zustand slices by domain (canvas, timeline, export, etc.)
- **Utilities**: Shared logic MUST reside in dedicated utility modules with explicit exports
- **No Circular Dependencies**: Module imports MUST form a directed acyclic graph

**Rationale**: Modularity enables incremental development, simplifies debugging, and allows features to be added/removed without cascading changes. A solo developer or small team benefits from clear boundaries.

### II. Rugby-Centric Design Language

The application MUST communicate through sport-appropriate visual metaphors and terminology.

- **Iconography**: Use rugby-relevant symbols (jerseys, balls, pitch markers, goalposts) over generic icons
- **Terminology**: Labels MUST use coaching vocabulary ("keyframe" → "phase", "entity" → "player/marker")
- **Field Backgrounds**: Default view MUST present a recognizable rugby pitch with proper markings
- **Color Semantics**: Team colors MUST be distinguishable and adhere to sport conventions (home/away contrast)

**Rationale**: Target users are rugby coaches. Familiar visual language reduces cognitive load and builds trust in the tool.

### III. Intuitive UX

Every interaction MUST minimize the steps between coach intent and on-screen result.

- **Drag-and-Drop First**: Primary interactions MUST be achievable via direct manipulation
- **Discoverability**: All features MUST be accessible within 2 clicks from the main canvas (Except on Mobile, see V.10)
- **Progressive Disclosure**: Advanced options MUST be hidden by default, revealed contextually
- **Immediate Feedback**: Actions MUST produce visible results within 100ms
- **Error Prevention**: The UI MUST prevent invalid states rather than report them after the fact

**Rationale**: Amateur coaches have limited time and technical patience. Friction leads to abandonment.

### IV. Warm Tactical Professionalism

The visual design MUST embody a warm, professional coaching environment that inspires confidence and builds trust.

- **Color Palette**:
  - Pitch Green `#1A3D1A` for primary surfaces, headers, and emphasis
  - Tactics White `#F8F9FA` for backgrounds, content areas, and contrast
  - Warm Accent `#D97706` for highlights, CTAs, and interactive elements
  - Deep Charcoal `#111827` for primary text to enhance readability
  - Surface Warmth `#F9FAFB` for main backgrounds (warmer than pure white)
  - Accent colors MUST complement the primary palette with warm undertones
- **Typography**:
  - Monospace fonts for data, statistics, coordinates, and timecodes
  - Bold sans-serif fonts for headings, labels, and navigation
  - Body text: readable sans-serif, minimum 14px equivalent
- **Borders & Shapes**:
  - Sharp corners only (border-radius: 0 or negligible)
  - 1px "schematic" borders for visual separation
  - No soft drop shadows; hard-edged "Tactical Shadows" (2px offset, no blur) are permitted to indicate interactive depth on mobile
- **Imagery**:
  - Pitch diagrams, tactical arrows, and formation overlays
  - No stock photography or generic illustrations

**Rationale**: The warm, professional aesthetic establishes credibility and inspires confidence. A tactical yet approachable appearance reinforces the tool's purpose while making coaches feel supported and empowered.

### V. Privacy-First Cloud Architecture

The application adopts a **tiered feature architecture** with cloud-first persistence while maintaining user privacy and data minimization principles.

**Architecture Note (2026-01-31)**: Following user pivot, all persistent storage uses Supabase backend. Guest mode provides local editor UI for UX continuity, but animations must be downloaded/exported locally. Authenticated users get cloud persistence with strict privacy safeguards.

#### V.1 Guest Mode (Tier 0 - Limited Local)

**Local editor UI with no cloud persistence:**
- Animation creation & editing (10-frame limit)
- Local JSON export/download
- Application bootstrap and UI interactions
- Session data stored in browser LocalStorage only

**Enforcement**: No cloud storage, no account required, optional account promotion after 10 frames.

#### V.2 Authenticated Cloud Features (Tier 1)

**MUST require email authentication for persistence:**
- Cloud storage of user animations (Supabase PostgreSQL)
- Personal gallery management
- Unlimited animations within user quota (50 max per user)
- Animation history and versioning

**Mandatory Safeguards**:
1. **Authentication Options**:
   - **Email/Password** (REQUIRED - must always be available as primary option)
   - **OAuth Providers** (OPTIONAL - Google, Apple, GitHub permitted under Section V.2.3 governance)
   - All authentication methods MUST support email verification
   - Users MUST be able to link/unlink OAuth accounts and set passwords anytime
2. **Minimal Profile Data**: Only email, optional display name, optional avatar URL (OAuth only), no additional PII collection
3. **User Data Ownership**: Full export and deletion rights (GDPR-style compliance)
4. **Transparent Storage**: Clear disclosure of what data is stored and where
5. **Privacy by Default**: All content private by default unless explicitly published
6. **Account Deletion**: Complete data removal within 30 days of request

#### V.2.1 Link Sharing & Public Gallery (Tier 2 - Public/Link-Shared)

**MAY be accessed with or without authentication:**
- Link sharing (read-only replay URLs, no login required)
- Public gallery browsing (read-only)
- Upvoting public animations (requires auth)
- Reporting inappropriate content (requires auth)

**Mandatory Safeguards**:
1. **Explicit User Consent**: Publishing requires user-initiated action (visibility toggle)
2. **Clear Visual Indication**: UI distinguishes private vs link_shared vs public
3. **Privacy Disclosure**: First publish prompts privacy notice explaining data handling
4. **Warm UX**: Features maintain warm, trustworthy aesthetic with helpful error states

#### V.2.2 Admin Moderation (Tier 3 - Admin Only)

**Admin-only features for content governance:**
- Viewing content reports and moderation queue
- Hiding or deleting inappropriate animations
- Banning users from creating new animations
- Setting user roles and permissions

**Mandatory Safeguards**:
1. **Role-Based Access Control**: Only users with admin role can access moderation tools
2. **Audit Trail**: Admin actions logged for transparency
3. **Transparent Policies**: Community guidelines explain what content gets moderated

#### V.2.3 OAuth Authentication Providers (Optional Tier 1 - CA-2026-001)

**Permitted Providers:**
- Google OAuth 2.0 (via Supabase Auth)
- Apple Sign In (via Supabase Auth)
- GitHub OAuth (via Supabase Auth)

**Why These Providers:**
- **Google**: Highest adoption (70%+ of web users), strong security, grassroots coaches often use Gmail
- **Apple**: Privacy-focused (email relay, limited data sharing), required for App Store if offering social login
- **GitHub**: Developer-friendly, minimal data sharing, aligns with open-source philosophy

**Mandatory Requirements:**

1. **Email/Password Must Remain Primary**
   - OAuth is supplementary, not replacement
   - Users MUST be able to create accounts with email/password only
   - Login page MUST show email/password option prominently (above or equal to OAuth buttons)
   - No "OAuth-only" accounts (users must be able to set password after OAuth signup)

2. **User Control & Transparency**
   - Users MUST be able to link/unlink OAuth providers from profile settings
   - UI MUST clearly disclose what data is shared with each provider
   - First-time OAuth login MUST show consent screen explaining:
     - What data is accessed (email, name, avatar)
     - That we don't store OAuth tokens long-term
     - That email can be used for password recovery
   - Users MUST be able to set a password after OAuth signup (account portability)

3. **Privacy Safeguards**
   - **No OAuth Token Storage**: We receive email/name/avatar, then discard OAuth tokens
   - **No Cross-Site Tracking**: No sharing of user activity with OAuth providers
   - **Minimal Scopes**: Only request email and public profile (no calendar, contacts, files access)
   - **No Silent Auth**: No automatic login without user interaction
   - **Data Minimization**: Store only email, display name, avatar URL (no OAuth user IDs or provider-specific tokens)

4. **Security Requirements**
   - OAuth redirect URIs MUST be domain-locked (no wildcard redirects)
   - PKCE (Proof Key for Code Exchange) MUST be enabled for all flows
   - State parameter MUST be validated to prevent CSRF attacks
   - Supabase Auth MUST handle all OAuth flows (no direct provider integration)

5. **Graceful Degradation**
   - If OAuth provider is down, email/password MUST still work
   - Users MUST be able to convert OAuth accounts to email/password
   - Account deletion MUST revoke OAuth connections

6. **No Third-Party Analytics Integration**
   - OAuth providers MUST NOT be used for user tracking or analytics
   - No Google Analytics, Facebook Pixel, or similar tracking tied to OAuth
   - Provider SDKs limited to authentication only (no advertising/analytics modules)

**Implementation via Supabase Auth:**
- Supabase handles OAuth flows, token exchange, and security
- We receive only: email, name, avatar URL
- OAuth tokens never reach our application code
- Supabase manages session cookies and PKCE flow

**Prohibited OAuth Providers:**
- **Facebook/Meta**: Data harvesting concerns, advertising integration risks
- **Twitter/X**: Platform instability, unclear privacy policies
- **LinkedIn**: Professional network, not relevant to grassroots coaching
- **Discord**: Gaming-focused, limited coach adoption
- **Microsoft**: Enterprise-focused, overlaps with GitHub for developer audience

**Constitutional Alignment:**
- ✅ Maintains "No telemetry" (OAuth used only for auth, not tracking)
- ✅ Maintains "Minimal data collection" (email, name, avatar only)
- ✅ Maintains "User data ownership" (users can export/delete anytime)
- ✅ Maintains "No third-party analytics" (OAuth ≠ tracking)
- ✅ Respects "Privacy-first" (email/password remains primary, OAuth is convenience)

#### V.2.4 Organizational Features (Tier 4 - Organizations - CA-2026-002)

**Organizational accounts for rugby bodies (RFUs, clubs, schools):**

**Capabilities:**
- Unlimited animation quota (not subject to 50-animation user limit)
- Batch endorsement via curated collections
- Organization branding (logo, custom colors)
- Member management with role-based access control (admin/editor/viewer)
- Public organization profile page

**Mandatory Safeguards:**

1. **Verification & Approval**
   - Organizations MUST be manually verified before activation (email domain verification + identity proof)
   - Initial verification limited to recognized rugby bodies (RFUs, registered clubs, schools)
   - Verification criteria documented publicly (e.g., "Must provide club registration number")
   - Admin approval required for organization creation (no self-service initially)

2. **Governance & Accountability**
   - Organization owners responsible for member conduct and endorsed content
   - Endorsement MUST NOT imply legal liability or quality guarantee (disclaimer required)
   - Organizations MUST have public profile visible to all users (transparency)
   - Organizations MUST be able to be reported for policy violations (same moderation queue as users)

3. **Member Privacy**
   - Organization admins MUST NOT see members' personal email addresses (only display names)
   - Members MUST explicitly accept invitation before joining organization
   - Members MUST be able to leave organization at any time without org admin approval
   - Member activity (e.g., animations created) MUST NOT be tracked or reported to org admins

4. **Content Ownership & Licensing**
   - Org-owned animations created by members belong to organization (explicit consent required on first creation)
   - Members MUST be able to export their own contributed animations (data portability)
   - Organizations MUST disclose content licensing terms (e.g., CC-BY-SA 4.0) publicly
   - Organization deletion MUST NOT delete member-contributed content without 30-day notice

5. **Quota & Cost Governance**
   - Unlimited quota subject to fair use policy (e.g., max 1000 animations, max 10GB storage)
   - Admin reserves right to impose retroactive quota if storage costs exceed budget
   - Organizations MUST be notified 30 days before quota enforcement
   - Storage compression MUST be implemented for archived versions (reduce 4x overhead)

**Role-Based Access Control (RBAC):**

| Role | Permissions |
|------|-------------|
| **Admin** | Create/edit/delete org animations, manage members, create collections, endorse content, update org profile |
| **Editor** | Create/edit org animations, add animations to collections (cannot manage members or endorse) |
| **Viewer** | Read-only access to private org content (cannot create or edit) |

**Audit Trail Requirements:**
- Member additions/removals MUST be logged with timestamp and admin ID
- Endorsement actions MUST be logged with collection ID and admin ID
- Org profile changes MUST be logged with before/after values
- Audit logs retained for 12 months, accessible to org admins only

**Endorsement Disclaimer (Required UI Text):**
> "Endorsed by [Org Name]" indicates this content is curated by [Org Name]. Endorsement does not guarantee accuracy, safety, or suitability for all coaching contexts. Coaches are responsible for adapting drills to their players' skill levels.

**Constitutional Alignment:**
- ✅ Maintains "No telemetry" (org features don't track individual users)
- ✅ Maintains "Minimal data collection" (org metadata only, member privacy protected)
- ✅ Maintains "User data ownership" (members retain export/deletion rights)
- ✅ Maintains "Privacy-first" (member activity not shared with org admins)
- ✅ Respects "Grassroots Coach Advocacy" (unlimited quota serves educational mission)

#### V.3 Data Retention & Privacy Policies

**All cloud features must adhere to:**
- **Data Minimization**: Store only essential user data (email, display name, animation payload)
- **No Telemetry**: No user identity tracking, device fingerprints, or usage analytics
- **User Deletions**: Users can delete animations and export all personal data anytime
- **Account Deletion**: Complete data removal within 30 days of user request
- **Retention Default**: Animations retained indefinitely unless user deletes; link-shared animations permanent unless owner unpublishes
- **Right to Deletion**: Users can immediately delete or unpublish any animation they created

#### V.4 Security Baseline for Cloud Features

**All backend endpoints must implement:**
- JSON schema validation on all inputs
- Maximum payload size enforcement (validated in POST /api/animations)
- Rate limiting (POST /api/animations: 10/hour per user, POST /api/report: 5/hour per user)
- Generic error messages (no sensitive information leakage)
- Strict CORS policy (domain-specific, no wildcard)
- Row-level security (RLS) on all database tables
- Content blocklist validation on titles/descriptions

**Security Measures**:
- Supabase Auth for session management
- PostgreSQL RLS for data isolation
- User quotas (50 animations per user, configurable)
- Ban/rate-limit enforcement on users

#### V.5 Governance for Future Backend Features

**Any proposed backend feature must pass:**
1. **Privacy Impact Assessment**: What user data is collected/transmitted? Who accesses it? How long retained?
2. **User Consent Check**: Does the feature require explicit user opt-in? Is consent documented?
3. **Tier Alignment Check**: Which tier does this belong to? Does it respect tier boundaries?
4. **Amendment Approval**: If feature changes core principles, requires constitutional amendment with version bump

**Rejection Criteria (Automatic Disqualification)**:
- Features sending telemetry to third parties (violates "No Telemetry")
- Features with indefinite retention of PII beyond user request
- Features requiring third-party identity providers for tracking or analytics (OAuth authentication for login is permitted under Section V.2.3 — Google, Apple, GitHub only)
- Features monetizing user data or requiring paid access to core features

#### V.6 Absolute Prohibitions (Updated v3.3 - Privacy-Preserving Metrics & Organizational Features)

**STRICTLY FORBIDDEN regardless of tier:**
- No telemetry, analytics, tracking, or user behavior monitoring
- No third-party identity providers for tracking or analytics purposes
- OAuth authentication providers permitted ONLY under Section V.2.3 governance (Google, Apple, GitHub)
- No OAuth-only accounts (email/password must remain available)
- No third-party analytics services (Google Analytics, Sentry, Mixpanel, etc.)
- No sale or sharing of user data with third parties
- No paywalls (free tier must always provide genuine value, including cloud storage)
- No advertising or sponsored content
- No cryptocurrency, NFTs, or blockchain integration
- No harvesting or selling coaching content without explicit coach consent

**Permitted Exceptions:**
- Privacy-preserving server-side metrics (Section V.6.1 - aggregated counts only, no user IDs)
- Organizational features (Section V.2.4 - with member privacy safeguards)

**Rationale**: Coaches store sensitive team strategies and player information. Privacy remains non-negotiable for trust. The cloud-first architecture maintains privacy through minimal data collection, email-only auth, and transparent data handling. Guest mode (Tier 0) provides local editor UI for immediate use without registration. Tier 1 (authenticated) enables cloud persistence with full user control over data deletion. The tiered architecture prioritizes coach autonomy and privacy above all else.

#### V.6.1 Privacy-Preserving Server-Side Metrics (Permitted Exception - CA-2026-002)

**Permitted Server-Side Metrics (No User Tracking):**

The following **aggregated, anonymized metrics** MAY be collected server-side for product improvement:
- Viewport dimensions (e.g., "375px width" = mobile) - aggregated counts only
- Replay completion rates (percentage of users who watch full animation) - no user IDs
- Animation duration distribution (e.g., "60% of animations are <30 seconds")
- Public gallery search queries (keywords only, no user attribution)

**Mandatory Requirements:**
1. **No User Identity Storage**: Metrics MUST NOT store user IDs, session IDs, IP addresses, or device fingerprints
2. **Server-Side Only**: No client-side tracking scripts, pixels, or cookies for analytics
3. **Aggregated Only**: Metrics MUST be aggregated before storage (e.g., "500 mobile views" not "User123 viewed on mobile")
4. **No Third-Party Sharing**: Metrics MUST NOT be sent to external analytics services (Google Analytics, Mixpanel, etc.)
5. **Ephemeral Collection**: Raw request logs MUST be deleted within 7 days; only aggregated summaries retained

**Implementation Example (Compliant):**
```typescript
// ✅ COMPLIANT: Server-side aggregation, no user tracking
async function trackReplayView(animationId: string, viewport: { width: number }) {
  const isMobile = viewport.width < 768;

  await supabase
    .from('animation_stats')
    .upsert({
      animation_id: animationId,
      mobile_views: isMobile ? sql`mobile_views + 1` : sql`mobile_views`,
      desktop_views: isMobile ? sql`desktop_views` : sql`desktop_views + 1`,
    });

  // No user_id, session_id, or IP stored
}
```

**Prohibited Implementation (Non-Compliant):**
```typescript
// ❌ PROHIBITED: User tracking, client-side analytics
analytics.track('replay_view', {
  user_id: session.user.id,        // Violates "No User Identity Storage"
  device: navigator.userAgent,     // Violates "No device fingerprints"
  timestamp: new Date(),
});
```

**Rationale:**
- PRD v2.0 requires "60% mobile replay views" metric to validate mobile optimization success
- Aggregated viewport metrics inform responsive design decisions without tracking individual users
- Server-side implementation avoids client-side tracking scripts (no cookies, pixels, fingerprints)

## Design System

This section codifies the Design Tokens into enforceable standards.

### Color Tokens

| Token Name | Value | Usage |
|------------|-------|-------|
| `--color-primary` | `#1A3D1A` | Headers, buttons, emphasis |
| `--color-background` | `#F2ECD8` | Page backgrounds — warm cream (amended v3.4.2) |
| `--color-surface` | `#FDFAF5` | Input fields, content wells — light cream |
| `--color-surface-warm` | `#EDE6D0` | Alternating section backgrounds — deeper cream |
| `--color-border` | `#1A3D1A` | Schematic borders, dividers |
| `--color-accent-warm` | `#D97706` | CTAs, highlights, interactive elements |
| `--color-text-primary` | `#111827` | Body text, labels (enhanced contrast) |
| `--color-text-inverse` | `#F8F9FA` | Text on primary backgrounds |

### Website Design Tokens

| Token Name | Value | Usage |
|------------|-------|-------|
| `--color-hero-gradient-start` | `#1A3D1A` | Landing page hero backgrounds |
| `--color-hero-gradient-end` | `#2D5A2D` | Subtle gradient variation |
| `--color-cta-primary` | `#D97706` | Primary call-to-action buttons |
| `--color-cta-hover` | `#B45309` | CTA hover state |
| `--color-success` | `#059669` | Success messages, confirmations |
| `--color-error` | `#DC2626` | Error states, warnings |
| `--color-info` | `#2563EB` | Informational messages |

### Typography Tokens

| Token Name | Font Family | Usage |
|------------|-------------|-------|
| `--font-mono` | `'JetBrains Mono', 'Fira Code', monospace` | Frame counts, coordinates, timecodes |
| `--font-heading` | `'Inter', 'Helvetica Neue', sans-serif` | H1–H4, navigation, buttons |
| `--font-body` | `'Inter', system-ui, sans-serif` | Paragraphs, descriptions |

### Spacing & Layout

| Token Name | Value | Notes |
|------------|-------|-------|
| `--border-radius` | `0px` | Sharp corners enforced |
| `--border-width` | `1px` | Schematic line weight |
| `--spacing-unit` | `4px` | Base unit for margins/padding |

## Development Workflow

### Component Development Pattern

1. **Isolation First**: Build components in isolation before integration
2. **Props-Driven**: Components MUST be controlled via props; internal state for UI-only concerns
3. **Typed Interfaces**: All component props MUST have TypeScript interfaces
4. **Co-located Files**: Component, styles, tests, and stories MUST reside together

### State Management Pattern

1. **Zustand Store**: Global state via Zustand with typed actions
2. **Transient Updates**: Animation playback MUST use Zustand transient updates to avoid re-renders
3. **Selectors**: Components MUST subscribe to minimal required state slices
4. **Actions Only**: State mutations MUST occur through named action functions

### File Organization

```text
src/
├── app/                    # Next.js App Router — pages, layouts, API routes
│   ├── (auth)/             # Auth pages (login, register, forgot-password, reset-password)
│   ├── api/                # API route handlers (src/app/api/[resource]/route.ts)
│   ├── app/                # Editor page (/app route)
│   ├── gallery/            # Public gallery
│   ├── my-gallery/         # Personal gallery
│   ├── replay/[id]/        # Replay viewer
│   ├── share/[id]/         # Share viewer (position:fixed inset:0 — mobile-first)
│   └── ...
├── features/
│   ├── animation/          # Editor, Canvas, Timeline, Sidebar, ReplayViewer, ShareViewer
│   │   ├── components/     # React components (Canvas/ Sidebar/ Timeline/ sub-dirs)
│   │   ├── services/       # Pure business logic (entityColors.ts, etc.)
│   │   └── index.ts        # Public exports
│   └── gallery/            # AnimationCard, PublicAnimationCard, VersionHistoryModal
│       ├── components/
│       └── index.ts
├── core/
│   ├── stores/             # Zustand slices (projectStore.ts, uiStore.ts)
│   ├── hooks/              # Shared custom hooks (useAnimationLoop, useAutoSave, etc.)
│   ├── types/              # Shared TypeScript interfaces
│   ├── utils/              # Pure utility functions
│   └── constants/          # Static config (design-tokens.ts, fields.ts, validation.ts)
├── shared/
│   ├── components/         # Reusable cross-feature components
│   └── ui/                 # shadcn-style UI primitives (Button, Dialog, etc.)
├── lib/
│   ├── supabase/           # Supabase client factories (browser + server)
│   ├── schemas/            # Zod validation schemas (animations.ts, collections.ts, users.ts)
│   ├── contexts/           # React contexts (UserContext, etc.)
│   └── server/             # Server-only utilities
└── assets/
    └── fields/             # Rugby pitch SVG/image assets

tests/
├── unit/                   # Vitest unit tests (mirrors src/ structure)
│   ├── components/
│   └── services/
└── e2e/                    # Playwright E2E tests
```

### VI. Grassroots Coach Advocacy

The application exists to **empower grassroots sports coaches** - volunteers, parents, club coaches, and school teachers who give their time to develop players.

#### VI.1 Target Audience Principles

- **Accessibility**: Free tier must provide genuine value, not a crippled demo
- **Simplicity**: Features must be usable without technical expertise
- **Respect**: Coaches' time is volunteered; don't waste it with complexity
- **Community**: Enable sharing and learning between coaches
- **Inclusion**: Support coaches at all levels, from minis to senior amateur

#### VI.2 Content Philosophy

- **Educational Focus**: Animations are teaching tools, not entertainment
- **Coach-to-Coach**: Community features serve peer learning, not social networking
- **Quality over Quantity**: Encourage thoughtful, useful content over volume

#### VI.3 Commercial Boundaries

- **No Advertising**: Never display third-party advertisements
- **No Data Monetization**: User data is never sold or used for profiling
- **Sustainable Model**: Future paid tiers for power features only, never for basic coaching needs

**Rationale**: Grassroots coaches are the heart of amateur sport. They deserve tools that respect their mission, their time, and their privacy. This principle ensures the platform serves coaches, not exploits them.

### V.7 Remix Licensing & Attribution

**All user-created animations are licensed under Creative Commons BY-SA 4.0 (Attribution-ShareAlike):**

**User Rights:**
- Users MUST be able to remix any public animation (Remix button always available)
- Users retain copyright to their original animations
- Users MUST attribute original creator when remixing (automatic via `remixed_from_id` FK)
- Users MAY opt out of remixing (make animation private, not available for remix)

**Attribution Requirements:**
- Remix genealogy MUST display full lineage (Original by Coach A → Remix by Coach B → This Remix)
- Gallery cards MUST show "Remixed from [Original Title]" with clickable link to original
- Original creators MUST be notified when their animation is remixed (optional email notification)

**ShareAlike Requirement:**
- Remixes MUST be licensed under same CC-BY-SA 4.0 terms (no proprietary derivatives)
- Users MUST NOT remove attribution from remixed animations
- Commercial use permitted as long as attribution and ShareAlike terms preserved

**Licensing Disclosure (Required UI Text on First Publish):**
> By publishing this animation, you agree to license it under Creative Commons BY-SA 4.0. This allows other coaches to remix your work with attribution, and requires remixes to use the same license. You retain copyright and can unpublish anytime. [Learn more about CC-BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)

**Rationale:**
- CC-BY-SA 4.0 balances creator attribution with community remix culture
- ShareAlike prevents proprietary lock-in (remixes remain freely remixable)
- Opt-out via private visibility respects coaches who prefer not to share

### V.8 External Links & Third-Party Content

**YouTube Video Links (Permitted):**
- Animations MAY include YouTube video URLs for coaching tutorials
- Links MUST use `rel="noopener noreferrer"` for security (prevent tab hijacking)
- Links MUST open in new tab (preserve user's animation context)
- Embedding YouTube players PROHIBITED (embeds include tracking pixels; links only)

**YouTube Link Validation:**
- MUST match pattern: `https://(www.)?(youtube.com/watch?v=|youtu.be/)[A-Za-z0-9_-]{11}`
- MUST NOT include tracking parameters (e.g., `?utm_source=`, `&si=`)
- Database constraint enforces regex validation

**Privacy Notice (Required on First Video Link Add):**
> YouTube links may track views when clicked. We don't control YouTube's privacy practices. Consider using privacy-focused alternatives (e.g., Invidious) or self-hosted videos if user privacy is critical.

**Other External Links:**
- Social media profile links permitted (optional user profile field)
- Links to coaching resources, RFU websites, club pages permitted
- Affiliate links, referral links, or monetized URLs PROHIBITED (violates "No advertising")

**Prohibited Integrations:**
- No embedded YouTube/Vimeo players (tracking pixels)
- No social media share buttons with tracking (use native browser sharing)
- No third-party commenting systems (Disqus, Facebook Comments)
- No external analytics beacons or tracking pixels

**Rationale:**
- YouTube tutorials enhance coaching value (common use case: "Watch this video then review animation")
- Links allow external resources without embedding tracking scripts
- `rel="noopener noreferrer"` prevents security vulnerabilities (tab hijacking, window.opener access)

### V.9 Template Curation & Starting Positions

**Templates are animations tagged for use as starting positions:**

**Who Can Create Templates:**
- **Phase 1 (v2.0):** Only verified organizations (Hampshire RFU, clubs) can create templates
- **Phase 2 (v2.1+):** Any user can tag their animation as "template" (subject to moderation)

**Template Quality Standards:**
- Templates MUST represent common formations (lineout, scrum, backline, defensive line)
- Templates MUST NOT include movement (static starting positions only)
- Templates SHOULD include coaching notes explaining formation purpose
- Templates MUST be public visibility (cannot be private or link-shared only)

**Template Moderation:**
- Admin reserves right to remove "template" tag if animation doesn't meet standards
- Templates with low usage (<5 remixes in 90 days) MAY be demoted from template gallery
- Community can report templates as "not suitable for starting position"

**Template Badge (Required UI Element):**
- Blue "Template" badge on gallery cards (distinct from "Endorsed by" badge)
- Template filter checkbox in gallery ("Show Templates Only")
- "Use Template" button (alias for Remix) on template detail page

**Template Licensing:**
- Templates MUST use CC-BY-SA 4.0 license (same as all public animations)
- Templates MUST allow remixing (cannot opt out)

**Rationale:**
- Curated templates save coaches time (common formations pre-positioned)
- Organizational control (Phase 1) ensures initial quality, then opens to community (Phase 2)
- Moderation prevents template spam (e.g., non-starter animations tagged as templates)

#### V.10 Mobile-First Adaptive Architecture (CA-2026-003)

**The application MUST adapt its interface to prioritize touch ergonomics on mobile viewports (< 768px):**

1. **Navigation Hierarchy**
   - **Editor View**: MUST hide the global top-nav to maximize vertical space.
   - **Primary Actions**: MUST use a Bottom Tab Bar for "Create", "Playbook", "Explore", and "Profile".
   - **Progressive Disclosure**: High-frequency tools MUST be accessible via bottom-oriented floating palettes or trays.

2. **Touch Ergonomics**
   - **Hit Areas**: Interactive tokens (players, balls) MUST have a minimum transparent touch target of 44x44px.
   - **Gestures**: Critical context actions (Delete, Duplicate) MUST be accessible via long-press or swipe gestures as native touch alternatives to right-click/double-click.
   - **Thumb Zone**: 80% of interactive controls MUST reside in the bottom 40% of the viewport.

3. **Adaptive Canvas**
   - **Scaling**: The tactical canvas MUST scale to fit the viewport width (`scale-to-width`) while maintaining the 4:3 aspect ratio.
   - **Orientation**: UI MUST provide visual cues for "Landscape Recommended" when the viewport height is insufficient for critical editor controls.

**Rationale:**
- Pivot to mobile-first usage demands an ergonomic paradigm shift.
- Maximizing "Tactical Real Estate" on small screens is a functional priority over desktop-consistency.

## Governance

### Amendment Procedure

1. Proposed changes MUST be documented with rationale
2. Changes affecting Core Principles require explicit justification of necessity
3. Design System changes MUST include visual examples or mockups
4. All amendments MUST update the version and `Last Amended` date

### Versioning Policy

- **MAJOR**: Removal or redefinition of Core Principles
- **MINOR**: New principles, sections, or material expansions
- **PATCH**: Clarifications, typo fixes, non-semantic refinements

### Compliance Review

- All pull requests MUST verify adherence to Core Principles
- Design tokens MUST be enforced via Tailwind configuration or CSS variables
- Code review checklist MUST include Constitution Check items

**Version**: 3.4.2 | **Ratified**: 2026-01-16 | **Last Amended**: 2026-04-20 (Patch: Update Design System color tokens — background/surface/surface-warm updated to warm cream palette for landing rebrand; design rationale in .impeccable.md §Color)
