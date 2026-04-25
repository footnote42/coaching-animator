# Feature Specification: Share Workflow

**Feature Branch**: `006-share-workflow`  
**Created**: 2026-04-25  
**Status**: Draft  
**Input**: User description: "phase 2c - Share Workflow from ROADMAP.md — issues EDITOR-002, FLOW-001, FLOW-002, UX-008, GALLERY-002"

## Constitutional Compliance Gate *(mandatory — check before writing requirements)*

Verify this feature against [docs/authority/constitution.md](../../docs/authority/constitution.md):

- [x] **Tier alignment**: Tier 1 (Authenticated) generates share links; Tier 2 (Public/Link-Shared) views them via /share/{id}; Tier 0 (Guest) can view share links but cannot generate them (cloud persistence required)
- [x] **No telemetry**: Share link generation collects no usage analytics or device data
- [x] **No third-party analytics**: Web Share API is a browser-native API — no third-party SDK
- [x] **No hardcoded colors**: No entity color changes in this feature
- [x] **Privacy gate**: No new data stored. Share links reuse existing animation IDs already in the database
- [x] **Shared canvas risk**: Changes to ShareViewer (`/share/[id]`) touch the shared canvas path — test `/app`, `/replay/[id]`, AND `/share/[id]` after any canvas-adjacent changes

> No constitutional conflicts identified.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Coach Shares from Editor (Priority: P1)

A coach finishes building an animation in the editor. They click the "Share" button in the sidebar or toolbar. The system produces a working `/share/{id}` link — displayed in a modal with a copy-to-clipboard button. On mobile, the system also offers a native share sheet so the coach can send the link directly via WhatsApp or any installed app. The coach confirms the link is correct by seeing the animation title in the modal.

**Why this priority**: This is the entry point to the core sharing loop — desktop-to-mobile handoff. Without a functional share button, coaches cannot deliver drill animations to their squad. The current stub ("not available in development") breaks the workflow for all authenticated users.

**Independent Test**: Log in, open an animation in `/app`, click Share — verify a modal appears with a valid `/share/{id}` URL that can be copied.

**Acceptance Scenarios**:

1. **Given** a coach is viewing their animation in the editor, **When** they click the Share button, **Then** a modal opens showing the `/share/{id}` URL for that animation
2. **Given** the share modal is open, **When** the coach clicks "Copy link", **Then** the URL is copied to the clipboard and a brief confirmation appears ("Link copied")
3. **Given** the coach is on a mobile browser, **When** they click Share, **Then** the native Web Share API sheet is triggered, offering WhatsApp and other installed apps as targets
4. **Given** the animation has not been saved to the cloud, **When** the coach clicks Share, **Then** they see a clear message explaining they must save first before sharing

---

### User Story 2 — Player Views Shared Animation (Priority: P1)

A player receives a `/share/{id}` link from their coach via WhatsApp. They open it on their phone. They see the animation name at the top of the full-screen replay view, watch the drill, and can optionally navigate to the next or previous animation if their coach shared a progression set. A subtle "Coaching Animator" link at the bottom lets curious players explore the site.

**Why this priority**: The player experience is the final destination of the entire workflow. The current `/share/{id}` route renders the animation but shows no title, has no way to navigate between progressions, and gives no context about what the player is looking at — undermining coach credibility.

**Independent Test**: Open a `/share/{id}` link in a mobile browser — verify the animation name appears, the animation plays, and a site link is visible in the footer.

**Acceptance Scenarios**:

1. **Given** a valid `/share/{id}` URL, **When** a player opens it, **Then** the animation title is displayed prominently above the canvas
2. **Given** the animation has sibling progressions (animations with related metadata indicating a sequence), **When** viewing `/share/{id}`, **Then** previous and next navigation controls are visible and functional
3. **Given** the animation is the only one in a sequence (or has no linked progressions), **When** viewing `/share/{id}`, **Then** no progression navigation is shown
4. **Given** any `/share/{id}` view, **When** the player scrolls to the bottom, **Then** a subtle "Powered by Coaching Animator" link is visible and routes to the landing page
5. **Given** an invalid or deleted animation ID, **When** a player opens the share link, **Then** a clear "Animation not found" message is shown — no crash

---

### User Story 3 — Coach Shares from Gallery Card (Priority: P1)

A coach browsing the public gallery sees a drill they want to share with their squad. They click the Share icon on the gallery card. On desktop, the `/share/{id}` link is copied to their clipboard. On mobile, the native share sheet opens directly so they can send it via WhatsApp.

**Why this priority**: Gallery is a primary discovery surface — coaches frequently browse then share to their squad. The current Play button routes to `/replay/{id}` (unoptimised) instead of `/share/{id}` (mobile-first). There is no share action on gallery cards at all.

**Independent Test**: Open the gallery page, click Share on any animation card — verify a `/share/{id}` URL is produced (not `/replay/{id}`).

**Acceptance Scenarios**:

1. **Given** a coach is viewing the gallery, **When** they click the Share button on an animation card, **Then** the `/share/{id}` URL for that animation is copied to clipboard (desktop) or the native share sheet opens (mobile)
2. **Given** a coach clicks the Play/Watch button on an animation card, **Then** they are routed to `/share/{id}` (not `/replay/{id}`)
3. **Given** the Web Share API is not supported by the browser, **When** the coach clicks Share, **Then** the link is copied to clipboard with a "Link copied" confirmation as fallback

---

### User Story 4 — Share Workflow is Self-Explanatory (Priority: P2)

A first-time coach visits the editor and wants to share their animation. The share interaction is immediately obvious: the Share button is clearly labelled, the modal explains what the link does ("Send this link to your players — they'll see your animation on their phone, no account needed"), and the copy action gives clear feedback.

**Why this priority**: UX clarity prevents coaches from giving up before completing the first share. The workflow needs to explain itself for coaches who are not technical.

**Independent Test**: Show the editor share flow to someone unfamiliar with the app — they should complete a share without any guidance.

**Acceptance Scenarios**:

1. **Given** a coach opens the share modal, **When** they read the modal content, **Then** one short sentence explains what the shared link does from the player's perspective
2. **Given** a coach has completed sharing, **When** they dismiss the modal, **Then** no persistent UI change is left in the editor (modal closes cleanly)

---

### Edge Cases

- What happens when the animation ID no longer exists in the database when a player opens the share link? → Show a "not found" page, not a crash
- What happens if the player's browser does not support Web Share API? → Fall back to clipboard copy with visual confirmation
- What if the animation belongs to another user — can anyone with the link view it? → Yes: `/share/{id}` is Tier 2 public-by-link; the animation must already be cloud-saved (Tier 1 created it)
- What if the coach is not logged in when clicking Share in the editor? → Show a prompt to sign in or save the animation first
- What does "progression set" mean for navigation? → Progressions are linked by existing animation metadata (or a deliberate sequencing mechanism); if no such metadata exists, navigation is hidden — this spec does not define a new progression data model

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Share button in the editor MUST generate and display a `/share/{id}` URL for the current animation in a modal
- **FR-002**: The share modal MUST include a one-click copy-to-clipboard action with visible confirmation feedback
- **FR-003**: On mobile browsers that support the Web Share API, tapping Share MUST trigger the native share sheet instead of (or in addition to) the modal
- **FR-004**: The `/share/{id}` page MUST display the animation's title
- **FR-005**: The `/share/{id}` page MUST display previous and next navigation controls when the animation has linked progressions; these controls MUST be hidden when no progressions are linked
- **FR-006**: The `/share/{id}` page MUST include a "Powered by Coaching Animator" link in the footer that routes to the landing page
- **FR-007**: Gallery animation cards MUST include a Share action that produces a `/share/{id}` link (copy on desktop, Web Share API on mobile)
- **FR-008**: All gallery Play/Watch actions MUST route to `/share/{id}` — not `/replay/{id}`
- **FR-009**: If the animation has not been saved to the cloud, the Share button in the editor MUST show a prompt explaining that saving is required before sharing, rather than generating a broken link
- **FR-010**: Opening an invalid or deleted `/share/{id}` MUST render a user-friendly "Animation not found" state — not a runtime error

### Frontend Requirements

- **UI-001**: Share modal component lives in `src/features/animation/components/` (or `src/shared/ui/` if reused across editor and gallery)
- **UI-002**: Styling uses Tailwind classes; design tokens from `tailwind.config` (pitch-green, tactics-white, warm-accent)
- **UI-003**: Sharp corners only (`rounded-none`); no soft drop shadows — consistent with design system
- **UI-004**: Animation title in the share view uses the same typographic scale as established headings (Oswald, uppercase)
- **UI-005**: Progression navigation controls (prev/next) are clearly tappable on mobile — minimum 44×44px touch target
- **UI-006**: "Powered by" footer link must be subtle (small, muted) — it must not distract from the animation content
- **UI-007**: Copy confirmation ("Link copied") MUST be a transient message (disappears after ~2 seconds) — not a persistent toast that requires dismissal

### Key Entities

- **Animation**: The existing cloud-saved animation record. No schema changes required — share links use the existing `id`. The `title` field is already stored and must be surfaced in the share view.
- **Progression link**: An optional relationship between animations indicating sequence order. If this data exists in the current schema, the navigation feature uses it. If it does not exist, progression navigation is deferred and FR-005 is treated as "no progressions found → navigation hidden".

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A coach can go from editor → Share button → copied link → player-viewable animation in under 3 steps with no dead ends
- **SC-002**: The `/share/{id}` page displays the correct animation title on every valid share link
- **SC-003**: Opening a share link on a mobile browser renders the animation correctly with no horizontal scroll and no layout breakage
- **SC-004**: The gallery Share action produces a `/share/{id}` URL — zero occurrences of `/replay/{id}` in gallery share output
- **SC-005**: Opening an invalid `/share/{id}` URL shows an error state without a runtime exception (no console errors, no white screen)
- **SC-006**: `npm run lint && npx tsc --noEmit` passes with zero new errors after implementation
- **SC-007**: All five acceptance scenario groups (Stories 1–4 + Edge Cases) are covered by manual or automated tests before merge

---

## Assumptions

- The `id` used in `/share/{id}` is the Supabase animation UUID — identical to what is already used for gallery card links
- The `/replay/{id}` route will remain in the codebase after this change but will no longer be the default target for public-facing share actions; internal deprecation can be deferred to Phase 3
- "Progression navigation" reads from existing animation metadata fields (if any). If no progression link field exists in the current schema, progression navigation is rendered as "hidden" and FR-005 is effectively a no-op for v1 — the UI slot is built but never shown
- Web Share API availability is detected at runtime; clipboard fallback covers all non-supporting browsers
- The share modal in the editor should reuse or closely mirror the gallery share sheet UX to keep the user mental model consistent
- `ShareViewer` layout (`position: fixed; inset: 0`) is not changed by this feature — animation title and footer are overlaid within the existing fixed container
