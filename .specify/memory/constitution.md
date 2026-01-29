<!--
================================================================================
SYNC IMPACT REPORT
================================================================================
Version change: 2.1.0 → 3.0.0 (MAJOR - User Accounts & Online Platform)

Modified principles:
- Principle V: Added Tier 3 (Authenticated Features) for user accounts and cloud storage
- Principle V.6: Updated Absolute Prohibitions to permit email/password accounts while maintaining privacy safeguards

Added sections:
- V.2.1 User Account Features (Tier 3 - Authenticated)
- VI. Grassroots Coach Advocacy (new core principle)
- Website Design Tokens (new design system section)

Removed sections:
- "No persistent user accounts" from V.6 Absolute Prohibitions

Rationale for Amendment:
- Grassroots coaches need cloud storage to access animations across devices
- Public gallery enables peer learning and community building
- User accounts required for content ownership, moderation, and social features
- Privacy safeguards maintained: email-only auth, minimal profile data, GDPR compliance
- Tier 1 (offline core) remains sacred and unaffected

Templates requiring updates:
- ✅ plan-template.md - Compatible (supports tiered architecture)
- ✅ spec-template.md - Compatible (supports authenticated features)
- ✅ tasks-template.md - Compatible (supports phased implementation)

Follow-up TODOs:
- Update PRD.md with new sections (16-21) for accounts, gallery, hosting, security
- Create MIGRATION_PLAN.md for Next.js migration
- Implement database schema for users, animations, upvotes, reports
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
- **Discoverability**: All features MUST be accessible within 2 clicks from the main canvas
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
  - No drop shadows; use borders or background contrast instead
- **Imagery**:
  - Pitch diagrams, tactical arrows, and formation overlays
  - No stock photography or generic illustrations

**Rationale**: The warm, professional aesthetic establishes credibility and inspires confidence. A tactical yet approachable appearance reinforces the tool's purpose while making coaches feel supported and empowered.

### V. Privacy-First Architecture

The application adopts a **tiered feature architecture** that preserves offline-first as the sacred core while enabling optional networked features under strict governance.

#### V.1 Core Offline Features (Tier 1 - Sacred)

**MUST remain 100% offline with zero network dependencies:**
- Animation creation & editing
- Local persistence (LocalStorage, JSON file downloads)
- Local export (GIF generation, video rendering)
- Application bootstrap and all UI interactions

**Enforcement**: No network calls permitted in Tier 1 code paths.

#### V.2 Optional Networked Features (Tier 2 - Controlled)

**MAY utilize network connectivity under strict conditions:**
- Link sharing (read-only replay URLs)
- Public gallery browsing (read-only)

**Mandatory Safeguards**:
1. **Explicit User Consent**: Network features require user-initiated action (button click)
2. **Clear Visual Indication**: UI must distinguish networked features (e.g., "Share Link 🌐")
3. **Graceful Degradation**: Network failures must not break core offline functionality
4. **Privacy Disclosure**: First use must display privacy notice explaining data handling
5. **Warm UX**: Networked features must maintain the warm, trustworthy aesthetic and provide helpful error states

#### V.2.1 User Account Features (Tier 3 - Authenticated)

**MAY require user authentication under strict conditions:**
- Cloud storage of user-created animations
- Personal gallery management
- Public gallery participation (publishing, upvoting)
- Content moderation (reporting)

**Mandatory Safeguards**:
1. **Email-only Authentication**: No social login, no third-party identity providers
2. **Minimal Profile Data**: Only email, optional display name, no additional PII collection
3. **User Data Ownership**: Full export and deletion rights (GDPR-style compliance)
4. **Transparent Storage**: Clear disclosure of what data is stored and where
5. **Privacy by Default**: All content private unless explicitly published by user
6. **Account Deletion**: Complete data removal within 30 days of request
7. **Offline Core Preserved**: Tier 1 features must work without authentication

#### V.3 Data Retention & Privacy Policies

**All networked features must adhere to:**
- **Data Minimization**: Transmit only required data (animation payload, no metadata)
- **No Telemetry**: No user identity, device fingerprints, or usage analytics
- **Retention Limits**: 90-day automatic expiration from last access
- **Right to Deletion**: Users must be able to delete shared animations (future: deletion link)
- **Security by Obscurity (MVP)**: UUID/nanoid provides baseline privacy without authentication

#### V.4 Security Baseline for Networked Features

**All backend endpoints must implement:**
- JSON schema validation
- Maximum payload size enforcement (100KB)
- Rate limiting (POST /api/share: 10/hour, GET /api/share/:id: 100/hour)
- Generic error messages (no sensitive information)
- Strict CORS policy (no wildcard)

**MVP Limitations (Acknowledged)**:
- No authentication/authorization (UUID obscurity is the security model)
- No DDoS protection beyond basic rate limiting
- No data encryption at rest

#### V.5 Governance for Future Backend Features

**Any proposed backend feature must pass:**
1. **Necessity Test**: Can this be implemented offline-first? (If yes, mandatory)
2. **Privacy Impact Assessment**: What data is transmitted? How long retained? Who accesses?
3. **Amendment Approval**: Document in constitution.md with version bump

**Rejection Criteria (Automatic Disqualification)**:
- Features requiring persistent user accounts (violates "No Accounts" unless amended)
- Features sending telemetry to third parties (violates "No Telemetry")
- Features with indefinite data retention (violates retention limits)

#### V.6 Absolute Prohibitions (Updated v3.0)

**STRICTLY FORBIDDEN regardless of tier:**
- No telemetry, analytics, tracking, or user behavior monitoring
- No third-party identity providers (Google, Facebook, Apple login)
- No third-party analytics services (Google Analytics, Sentry, Mixpanel, etc.)
- No sale or sharing of user data with third parties
- No mandatory accounts for core offline features (Tier 1 remains sacred)
- No paywalls (free tier must always provide genuine value)
- No advertising or sponsored content

**Rationale**: Coaches store team strategies and player information. Privacy remains non-negotiable for trust. User accounts are permitted solely to enable cloud storage and community features, with strict privacy safeguards. The tiered architecture preserves the offline-first core while enabling online platform features under governance.

## Design System

This section codifies the Design Tokens into enforceable standards.

### Color Tokens

| Token Name | Value | Usage |
|------------|-------|-------|
| `--color-primary` | `#1A3D1A` | Headers, buttons, emphasis |
| `--color-background` | `#F8F9FA` | Page backgrounds, cards |
| `--color-surface` | `#FFFFFF` | Input fields, content wells |
| `--color-surface-warm` | `#F9FAFB` | Main backgrounds (warmer alternative) |
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

src/
├── components/       # UI components (co-located with styles/tests)
├── hooks/            # Custom React hooks
├── store/            # Zustand store slices
├── utils/            # Pure utility functions
├── types/            # Shared TypeScript interfaces
└── constants/        # Static configuration values

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

**Version**: 3.0.0 | **Ratified**: 2026-01-16 | **Last Amended**: 2026-01-29
