# Feature Specification: User Guide

**Feature Branch**: `014-user-guide`
**Created**: 2026-05-01
**Status**: Draft
**Issues resolved**: (T7), T8
**Phase**: 2k (ROADMAP v3.2)

---

## Constitutional Compliance Gate *(mandatory — check before writing requirements)*

Verify this feature against [docs/authority/constitution.md](../../docs/authority/constitution.md):

- [x] **Tier alignment**: Tier 0 (Guest) and Tier 1 (Authenticated). The help page and onboarding flow are accessible to all visitors; no tier-gated content. Dismissed state is device-local only.
- [x] **No telemetry**: No usage analytics collected. Onboarding completion/dismissal is stored in `localStorage` — no server-side persistence, no user identity attached.
- [x] **No third-party analytics**: No Sentry, Mixpanel, GA, or similar SDKs added.
- [x] **No hardcoded colors**: Any UI additions use Tailwind design tokens only (pitch-green, tactics-white, warm-accent). EntityColors service is not involved.
- [x] **Privacy gate**: Onboarding dismissed state stored in `localStorage` (device-local). No new data transmitted to the server.
- [x] **Shared canvas risk**: Inline editor hints may surface in the editor viewport but do not modify canvas components (`Stage.tsx`, `Field.tsx`, etc.). Must test `/app` to confirm no canvas regressions.

> No constitutional violations identified. Proceed.

---

## Clarifications

- **Scope of pedagogy taster**: A single lightweight page introducing one coaching framework (APES — Active, Purposeful, Enjoyable, Safe). Full coaching education platform is Phase 5+ (ASPIRATION-001); this is a one-page taster only.
- **Onboarding format**: A modal/overlay that appears on first visit to the editor (`/app`). Not a step-by-step product tour with overlays on each element — that is too heavyweight for Phase 2k. A concise "how it works" card (3–5 steps) with a dismiss button is sufficient.
- **Help page depth**: A single `/help` page with structured sections covering: core workflow, entity types, sharing, and a link to the pedagogy taster. Not a full searchable documentation site.

### Session 2026-05-01

- Q: Should the onboarding card block the editor (modal) or sit non-blocking in a corner/overlay while the editor is still accessible behind it? → A: Non-blocking corner/overlay card — editor is fully usable behind it
- Q: Where should the "Show guide" trigger live in the editor? → A: Help icon button in the editor toolbar (sidebar)
- Q: Where should the Help link live — navigation header or site footer? → A: Both — footer as primary, plus a small "?" icon in the navigation header

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — First-time coach self-onboards without external help (Priority: P1)

A rugby coach hears about the tool and opens it for the first time. When they navigate to the editor, a "How it works" card appears explaining the core workflow in four steps: add players to the pitch, move them frame by frame to show the drill, save the animation, and share the link with the squad. The coach reads it in under a minute and dismisses it. They then complete their first drill and share it — without needing to ask anyone for help.

**Why this priority**: This is a named v1 Launch Definition criterion: "coaches self-onboard in <5 minutes". Without it the product cannot launch to a wider audience.

**Independent Test**: Open the editor at `/app` in a private/incognito browser session. The onboarding card appears. Read and dismiss it. Complete the core loop (add entity → add frame → save → copy share link). Total elapsed time should be under 5 minutes.

**Acceptance Scenarios**:

1. **Given** a user has not previously visited `/app`, **When** they open the editor, **Then** an onboarding card appears covering the core 4-step workflow before any other interaction
2. **Given** the onboarding card is visible, **When** the user clicks "Got it" or a close/dismiss control, **Then** the card disappears and the editor is fully usable
3. **Given** a user has previously dismissed the onboarding, **When** they return to `/app` in the same browser, **Then** the onboarding card does not appear
4. **Given** a guest (Tier 0) user, **When** they open the editor, **Then** the onboarding appears identically to an authenticated user

---

### User Story 2 — Coach is stuck and finds answers in the help page (Priority: P1)

A coach is unsure how to share an animation with their squad. They notice a "Help" link in the navigation or footer. They open `/help` and scan the structured sections. They find the "Sharing" section, which explains: save the animation first, then click the Share button to get a link. They return to the editor and complete the task.

**Why this priority**: Without a help page, the only support path is email. Help page is explicitly in the 2k scope and directly supports the 5-minute self-onboard criterion.

**Independent Test**: Navigate to `/help` directly. Verify sections exist for: core workflow, entity types, sharing, and coaching taster link. Confirm the page loads without authentication.

**Acceptance Scenarios**:

1. **Given** a user on any page, **When** they click the "Help" link in the navigation or footer, **Then** they are taken to `/help`
2. **Given** a user on `/help`, **When** they read the page, **Then** they can find an explanation of: adding entities, creating frames, saving, and sharing
3. **Given** a guest (Tier 0) user, **When** they access `/help`, **Then** the page loads fully without requiring sign-in

---

### User Story 3 — Coach discovers the APES coaching framework (Priority: P2)

A coach notices a link on the help page titled "What is APES?" They click through to a lightweight page at `/help/coaching` that explains the APES framework (Active, Purposeful, Enjoyable, Safe) in plain language, with a brief note on how it applies to designing drills in the animator. There is a link to the public gallery so they can browse example animations.

**Why this priority**: The ROADMAP explicitly lists "coaching pedagogy taster" as part of 2k scope, and ASPIRATION-001 calls for a "Phase 2 taster" page. It seeds the Phase 5+ vision without building the full platform.

**Independent Test**: Navigate to `/help/coaching`. Page loads without authentication. Reads and makes sense without prior rugby coaching knowledge.

**Acceptance Scenarios**:

1. **Given** a user on `/help`, **When** they click the coaching framework link, **Then** they are taken to `/help/coaching`
2. **Given** a user on `/help/coaching`, **When** they read the page, **Then** they see: an explanation of APES, a brief note on how it applies to drill design, and a link to the gallery
3. **Given** a guest (Tier 0) user, **When** they access `/help/coaching`, **Then** the page loads fully without sign-in

---

### User Story 4 — Returning coach re-accesses onboarding on demand (Priority: P3)

A coach who dismissed the onboarding several weeks ago wants to remind themselves of a step. They find a "Show guide" or "How it works" link somewhere in the editor (e.g., the help icon in the toolbar or a footer link) and re-open the onboarding card on demand.

**Why this priority**: Useful but not blocking launch. The help page (Story 2) is the primary recovery path for returning coaches.

**Independent Test**: Dismiss onboarding. Locate the "Show guide" trigger. Confirm the onboarding card reappears.

**Acceptance Scenarios**:

1. **Given** a coach who has previously dismissed the onboarding, **When** they click the "How it works" / "Show guide" trigger, **Then** the onboarding card appears
2. **Given** the onboarding card is re-opened manually, **When** the coach dismisses it again, **Then** it closes without changing any other editor state

---

### Edge Cases

- What if the user clears `localStorage`? The onboarding card should reappear on next editor visit (same behaviour as a first-time visit).
- What if the browser blocks `localStorage`? The onboarding card should still render but dismissed state cannot be persisted — acceptable degradation; the card simply reappears each visit.
- Guest (Tier 0) vs authenticated (Tier 1): both see identical onboarding and help content. No gating.
- What if `/help/coaching` is visited directly without visiting `/help` first? It must load as a standalone page with its own navigation back to `/help`.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: An onboarding card MUST appear on the first visit to `/app` for any user (guest or authenticated)
- **FR-002**: The onboarding card MUST explain the core workflow in ≤5 steps: add entities, set positions per frame, save, share
- **FR-003**: The onboarding card MUST be dismissible via a clearly labelled action ("Got it", "Dismiss", or equivalent)
- **FR-004**: The dismissed state MUST be persisted in `localStorage` so the card does not reappear on subsequent visits in the same browser
- **FR-005**: A help icon button in the editor toolbar (sidebar) MUST allow coaches to re-open the onboarding card on demand
- **FR-006**: A `/help` page MUST exist with sections covering: core workflow, entity types (players, cones, ball), sharing, and a link to the coaching framework taster
- **FR-007**: A `/help/coaching` page MUST exist with a plain-language explanation of the APES coaching framework and its relevance to drill design
- **FR-008**: Both `/help` and `/help/coaching` MUST be accessible without authentication (Tier 0)
- **FR-009**: The help page MUST be reachable from both (a) a small "?" icon in the navigation header, and (b) a "Help" link in the site footer — both present on all pages

### Frontend Requirements

- **UI-001**: Onboarding card is a non-blocking corner overlay in the editor — the canvas and all editor controls remain fully accessible while the card is visible; it does not behave as a modal and does not trap focus
- **UI-002**: Onboarding card uses design tokens only — no soft shadows, no rounded corners (sharp corners, `rounded-none`)
- **UI-003**: Help page uses the project's standard page layout (Navigation header, content area); consistent with `/gallery` and `/profile` page structure
- **UI-004**: `/help/coaching` includes only text, icons (if any), and a link to the gallery — no video embeds, no external media
- **UI-005**: A "?" icon in the navigation header and a "Help" link in the site footer MUST both link to `/help` and be present on every page

### Key Entities

- **OnboardingState**: Device-local boolean flag stored in `localStorage`. Key: `coachingAnimator_onboardingDismissed`. No server-side persistence.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor can complete the full core loop (add entity → animate → save → copy share link) in under 5 minutes, measured from their first landing on `/app`
- **SC-002**: The onboarding card appears on the first visit and does not appear on subsequent visits in the same browser after dismissal
- **SC-003**: `/help` and `/help/coaching` both return HTTP 200 when accessed without authentication
- **SC-004**: `/help` is reachable within 1 click from any page via the navigation header "?" icon; also linked from the site footer
- **SC-005**: `npm run lint && npx tsc --noEmit` passes with no new errors introduced by this feature
- **SC-006**: All acceptance scenarios in User Stories 1–3 are covered by unit or E2E tests
