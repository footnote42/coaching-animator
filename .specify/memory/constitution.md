<!--
================================================================================
SYNC IMPACT REPORT
================================================================================
Version change: 1.0.0 → 2.0.0 (MAJOR - Core Principle redefinition)

Modified principles:
- Principle V: "Offline-First Privacy" → "Privacy-First Architecture"
  - Changed from absolute offline-only to tiered feature governance
  - Added Tier 1 (Sacred Offline) and Tier 2 (Controlled Networked)
  - Introduced privacy policies and governance framework for backend features

Added sections:
- V.1 Core Offline Features (Tier 1 - Sacred)
- V.2 Optional Networked Features (Tier 2 - Controlled)
- V.3 Data Retention & Privacy Policies
- V.4 Security Baseline for Networked Features
- V.5 Governance for Future Backend Features
- V.6 Absolute Prohibitions (Unchanged)

Removed sections:
- Previous Principle V content (absolute offline-only mandate)

Rationale for Amendment:
- Link-sharing feature solves critical user need (WhatsApp distribution)
- Absolute offline-first blocked this essential use case
- Tiered architecture preserves core offline-first identity while enabling optional networked features
- Privacy and governance safeguards ensure networked features remain user-controlled and privacy-respecting

Templates requiring updates:
- ✅ plan-template.md - Compatible (Constitution Check section supports tiered architecture)
- ✅ spec-template.md - Compatible (requirements structure supports Tier 1/Tier 2 distinction)
- ✅ tasks-template.md - Compatible (phase structure supports incremental backend features)

Follow-up TODOs:
- Update PRD.md Section 2 (Problem Statement) and Section 5.5 (Export System)
- Update spec.md Section 5 (Requirements) to reflect tiered privacy model
- Update animation-share-spec.md with constitutional references
- Update CLAUDE.md Active Technologies section
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

### IV. Tactical Clubhouse Aesthetic

The visual design MUST embody a focused, professional coaching environment.

- **Color Palette**:
  - Pitch Green `#1A3D1A` for primary surfaces, headers, and emphasis
  - Tactics White `#F8F9FA` for backgrounds, content areas, and contrast
  - Accent colors MUST complement the primary palette
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

**Rationale**: The aesthetic establishes credibility and focus. A tactical, no-nonsense appearance reinforces the tool's purpose.

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
- Future: Cloud backup (optional), template libraries (read-only)

**Mandatory Safeguards**:
1. **Explicit User Consent**: Network features require user-initiated action (button click)
2. **Clear Visual Indication**: UI must distinguish networked features (e.g., "Share Link 🌐")
3. **Graceful Degradation**: Network failures must not break core offline functionality
4. **Privacy Disclosure**: First use must display privacy notice explaining data handling

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

#### V.6 Absolute Prohibitions (Unchanged)

**STRICTLY FORBIDDEN regardless of tier:**
- No telemetry, analytics, tracking, or user behavior monitoring
- No third-party services (Google Analytics, Sentry, Mixpanel, etc.)
- No persistent user accounts (MVP scope)
- No paywalls

**Rationale**: Coaches store team strategies and player information. Privacy remains non-negotiable for trust. The tiered architecture preserves the offline-first core while solving critical sharing needs (WhatsApp distribution) under strict privacy governance.

## Design System

This section codifies the Design Tokens into enforceable standards.

### Color Tokens

| Token Name | Value | Usage |
|------------|-------|-------|
| `--color-primary` | `#1A3D1A` | Headers, buttons, emphasis |
| `--color-background` | `#F8F9FA` | Page backgrounds, cards |
| `--color-surface` | `#FFFFFF` | Input fields, content wells |
| `--color-border` | `#1A3D1A` | Schematic borders, dividers |
| `--color-text-primary` | `#1A3D1A` | Body text, labels |
| `--color-text-inverse` | `#F8F9FA` | Text on primary backgrounds |

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

**Version**: 2.0.0 | **Ratified**: 2026-01-16 | **Last Amended**: 2026-01-25
