# Feature Specification: Workflow Clarity

**Feature Branch**: `011-workflow-clarity`  
**Created**: 2026-04-29  
**Status**: Draft  
**Issues resolved**: FLOW-001, FLOW-002, UX-008, EDITOR-002, GALLERY-002  
**Phase**: 2h (ROADMAP v3.1)

## Constitutional Compliance Gate *(mandatory — check before writing requirements)*

Verify this feature against [docs/authority/constitution.md](../../.specify/memory/constitution.md):

- [x] **Tier alignment**: Tier 1 (Authenticated — editor share button), Tier 2 (Public — gallery share, share view header). No Tier 0 Guest changes.
- [x] **No telemetry**: Feature collects no user identity, device fingerprints, or usage analytics
- [x] **No third-party analytics**: No Sentry, Mixpanel, GA, or similar SDKs added
- [x] **No hardcoded colors**: No entity color changes in scope; no EntityColors involvement
- [x] **Privacy gate**: No new data stored. `/share/{id}` page already loads animation by public ID. Navigation links are UI-only.
- [x] **Shared canvas risk**: `ShareViewer.tsx` is touched (header overlay added). Must test `/share/[id]` — layout constraint (`position:fixed; inset:0`) must be preserved.

> No constitutional violations identified. Proceed.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Coach shares a drill link from the editor (Priority: P1)

A coach finishes building a drill in the editor and wants to share it with their squad. They click the Share button in the editor and get a usable `/share/{id}` link immediately — no dead end, no "not available in development" message.

**Why this priority**: EDITOR-002 is the most direct core-loop blocker. The share button is the first thing a coach reaches for after saving.

**Independent Test**: Navigate to `/app`, save an animation to cloud, click the Share button. Verify a `/share/{id}` link is copied to clipboard and a confirmation toast appears.

**Acceptance Scenarios**:

1. **Given** a coach has saved an animation to cloud, **When** they click the Share button in the editor, **Then** the `/share/{id}` URL is copied to clipboard and a toast confirms "Link copied"
2. **Given** the coach is on a mobile device, **When** they click Share, **Then** the native Web Share sheet opens with the `/share/{id}` link pre-populated
3. **Given** the animation has not been saved to cloud, **When** the coach clicks Share, **Then** they see a prompt to save first before sharing

---

### User Story 2 — Player opens a share link and can navigate back to the gallery (Priority: P1)

A player receives a `/share/{id}` link via WhatsApp. They open it, watch the drill replay, and can see the animation name and navigate back to the public gallery to browse other drills.

**Why this priority**: FLOW-002 — the share view is currently anonymous (no title, no back link). Players have no context about what they're watching or how to find more.

**Independent Test**: Open `/share/{id}` directly (no prior navigation). Verify the animation name is displayed and a back-to-gallery link is present.

**Acceptance Scenarios**:

1. **Given** a player opens a `/share/{id}` link, **When** the page loads, **Then** the animation name is visible in a non-intrusive header overlay
2. **Given** a player is watching a replay, **When** they tap/click the back-to-gallery link, **Then** they are navigated to `/gallery`
3. **Given** a share view loads, **When** viewed on mobile, **Then** the header overlay does not obscure the canvas controls (FloatingRemote) and does not break the full-screen layout

---

### User Story 3 — Coach plays an animation directly from the public gallery (Priority: P1)

A coach browsing the public gallery clicks an animation card and immediately sees the full-screen share replay — not the old `/replay/{id}` route.

**Why this priority**: FLOW-001 — the gallery currently routes to the unoptimised `/replay/{id}` route. All public-facing navigation should use the mobile-optimised `/share/{id}`.

**Independent Test**: Navigate to `/gallery`, click any animation card. Verify the browser navigates to `/share/{id}` (not `/replay/{id}`).

**Acceptance Scenarios**:

1. **Given** an animation card in `/gallery`, **When** the coach clicks it, **Then** the browser navigates to `/share/{id}`
2. **Given** an animation card in `/my-gallery`, **When** the coach clicks the Play button, **Then** the browser navigates to `/share/{id}`
3. **Given** the coach is on the share view reached from the gallery, **When** they click back-to-gallery, **Then** they return to `/gallery`

---

### User Story 4 — Coach shares a gallery animation link via clipboard or WhatsApp (Priority: P2)

A coach browsing the gallery wants to share a specific animation with a colleague. They click the Share button on a gallery card and get the `/share/{id}` link — ready to paste into WhatsApp or copy to clipboard.

**Why this priority**: GALLERY-002 — the share button currently generates incorrect or non-functional links. Lower priority than P1 stories since the core loop can work without it, but it is a high-severity issue.

**Independent Test**: Navigate to `/gallery`, click the Share button on any card. Verify clipboard receives a `/share/{id}` link (desktop) or the native share sheet opens (mobile).

**Acceptance Scenarios**:

1. **Given** a coach on desktop clicks the Share button on a gallery card, **When** the button is activated, **Then** the `/share/{id}` link is copied to clipboard and a "Link copied" toast appears
2. **Given** a coach on mobile clicks the Share button, **When** the button is activated, **Then** the native Web Share API sheet opens with the `/share/{id}` link
3. **Given** the share action targets an animation with no public ID, **When** the share button is clicked, **Then** a graceful error is shown ("This animation cannot be shared yet")

---

### Edge Cases

- What if the animation has no title? Display "Untitled Drill" as a fallback on the share view header.
- What if the Web Share API is not supported (desktop browsers)? Fall back silently to clipboard copy.
- What if clipboard write fails? Show the link in a copyable text field inside a small tooltip or modal.
- What if `/share/{id}` is opened without any referrer? The back-to-gallery link still works (it is a hardcoded `/gallery` href, not document.referrer).
- My-Gallery Play button: coach's own draft animations that are not yet saved to cloud — share button should follow the same "save first" prompt as the editor share button.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The editor Share button MUST copy the animation's `/share/{id}` URL to clipboard on activation
- **FR-002**: On mobile devices, the editor Share button MUST invoke the Web Share API instead of clipboard copy
- **FR-003**: If the animation has not been saved to cloud (no share ID exists), the Share button MUST prompt the user to save before sharing rather than failing silently
- **FR-004**: The `/share/{id}` page MUST display the animation name in a non-intrusive header overlay
- **FR-005**: The `/share/{id}` page MUST include a "Back to Gallery" link that navigates to `/gallery`
- **FR-006**: The header overlay on `/share/{id}` MUST NOT reflow the page or alter the canvas layout — it must use absolute/overlay positioning within the existing `position:fixed; inset:0` container
- **FR-007**: Clicking an animation card in `/gallery` MUST navigate to `/share/{id}` (not `/replay/{id}`)
- **FR-008**: The Play button on `/my-gallery` animation cards MUST navigate to `/share/{id}` (not `/replay/{id}`)
- **FR-009**: The Share button on gallery cards (public and My-Gallery) MUST copy a `/share/{id}` link to clipboard on desktop
- **FR-010**: On mobile, the gallery card Share button MUST invoke the Web Share API with the `/share/{id}` link
- **FR-011**: A clipboard-copy confirmation toast MUST appear after any successful clipboard write (editor share button and gallery share button)
- **FR-012**: The `/replay/{id}` route MUST continue to function (no breakage of existing bookmarked links)

### Frontend Requirements

- **UI-001**: The share view header overlay uses design tokens only — no hardcoded colors, no `bg-white`, no `rounded-*`
- **UI-002**: The back-to-gallery link uses the project's established link/button styles; no new component needed if an existing pattern fits
- **UI-003**: The clipboard confirmation toast reuses the existing toast/notification pattern in the project (do not introduce a new toast library)
- **UI-004**: On mobile (`<768px`), the share view header overlay must not overlap the FloatingRemote controls — position it at the top of the viewport, within the fixed container
- **UI-005**: Gallery card click target (the card image/title area) routes to `/share/{id}` — the Share icon button on the card remains a separate action (clipboard/Web Share)

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A coach can complete the full flow — editor → save → Share button → clipboard copy → player opens `/share/{id}` link — in under 3 interactions after saving
- **SC-002**: The `/share/{id}` page displays the animation name on every load (no anonymous share views)
- **SC-003**: Zero gallery card clicks navigate to `/replay/{id}` in either `/gallery` or `/my-gallery`
- **SC-004**: The share view header overlay does not alter canvas dimensions or trigger layout shift on any viewport from 320px to 1440px wide
- **SC-005**: `npm run lint && npx tsc --noEmit` passes with zero new errors
- **SC-006**: All acceptance scenarios for US1–US4 are covered by unit or E2E tests
- **SC-007**: The `/replay/{id}` route still resolves correctly (backward-compatibility preserved)

---

## Assumptions

- The animation's `share_id` (used to construct `/share/{id}`) is already available in the editor store / Supabase record after cloud save. No new API endpoints are needed.
- The existing toast/notification system in the project is sufficient for the clipboard-copy confirmation; no new dependency required.
- `document.referrer` is NOT used for the back-to-gallery link — it is hardcoded to `/gallery` for reliability across direct link opens and WhatsApp-opened tabs.
- `/replay/{id}` is intentionally preserved as a working route to avoid breaking any existing links shared before this phase ships.
- The gallery card's click-to-navigate and share-icon-to-copy are two distinct interactions — no modal preview step is introduced (confirmed design decision).
