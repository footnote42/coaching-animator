# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`  
**Created**: [DATE]  
**Status**: Draft  
**Input**: User description: "{ARGS}"

## Constitutional Compliance Gate *(mandatory — check before writing requirements)*

Verify this feature against [docs/authority/constitution.md](../../docs/authority/constitution.md):

- [ ] **Tier alignment**: Which tier(s) does this touch? (Tier 0 Guest / Tier 1 Auth / Tier 2 Public / Tier 3 Admin)
- [ ] **No telemetry**: Feature collects no user identity, device fingerprints, or usage analytics
- [ ] **No third-party analytics**: No Sentry, Mixpanel, GA, or similar SDKs added
- [ ] **No hardcoded colors**: All entity colors go through `EntityColors` service (`src/features/animation/services/entityColors.ts`)
- [ ] **Privacy gate**: Any new data stored? If so — what, for how long, who can access it?
- [ ] **Shared canvas risk**: Does this touch `Canvas/`, `Stage.tsx`, `Field.tsx`, `PlayerToken.tsx`, `EntityLayer.tsx`, `AnnotationLayer.tsx`? If so — test `/app`, `/replay/[id]`, AND `/share/[id]`

> Flag any conflicts here before continuing. A constitutional violation discovered in implementation costs 10× as much to fix.

---

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story must be INDEPENDENTLY TESTABLE — implementing just one should yield a
  viable MVP. Assign priorities (P1, P2, P3…). P1 = must ship, P3 = nice to have.
-->

### User Story 1 - [Brief Title] (Priority: P1)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently — e.g., "Can be fully tested by visiting /app and [action]"]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]
2. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 2 - [Brief Title] (Priority: P2)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 3 - [Brief Title] (Priority: P3)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

- What happens when [boundary condition]?
- How does the system handle [error scenario]?
- Guest (Tier 0) vs authenticated (Tier 1) behaviour difference?

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST [specific capability]
- **FR-002**: System MUST [specific capability]
- **FR-003**: Users MUST be able to [key interaction]
- **FR-004**: System MUST [data requirement]

*Mark unclear requirements:*
- **FR-005**: [NEEDS CLARIFICATION: describe what's unclear]

### Frontend Requirements *(include if feature has UI)*

- **UI-001**: Component(s) live in `src/features/[feature]/components/` (or `src/shared/components/` if reusable across features)
- **UI-002**: Styling uses Tailwind classes; design tokens from `tailwind.config` (pitch-green, tactics-white, warm-accent)
- **UI-003**: Sharp corners only (`rounded-none`); no soft drop shadows
- **UI-004**: [Specific UI behaviour]

### API / Database Requirements *(include if feature touches backend)*

- **API-001**: Route lives at `src/app/api/[resource]/route.ts`
- **API-002**: Input validated with Zod schema in `src/lib/schemas/`
- **API-003**: Supabase RLS enforces access control — no unprotected queries
- **API-004**: [Specific endpoint or schema requirement]

### Canvas / Animation Requirements *(include if feature touches Konva canvas)*

- **CV-001**: Canvas changes must be tested on `/app` (editor), `/replay/[id]` (replay), and `/share/[id]` (share)
- **CV-002**: `ShareViewer` uses `position:fixed inset:0` — do not change to `h-screen`/`h-full`
- **CV-003**: Entity colors MUST use `EntityColors.resolve()` — never hardcoded hex
- **CV-004**: [Specific canvas behaviour]

### Key Entities *(include if feature involves new or changed data)*

- **[Entity 1]**: [What it represents, key attributes without implementation detail]
- **[Entity 2]**: [Relationships to other entities]

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: [Measurable metric — e.g., "Coach can add a player and see it on canvas within 1 click"]
- **SC-002**: [Measurable metric — e.g., "Share URL opens correctly on mobile without horizontal scroll"]
- **SC-003**: [Quality gate — e.g., "`npm run lint && npx tsc --noEmit` passes with no new errors"]
- **SC-004**: [Test coverage — e.g., "All acceptance scenarios covered by unit or E2E tests"]
