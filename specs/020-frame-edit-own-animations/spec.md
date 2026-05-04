# Feature Specification: Direct Frame Editing

**Feature Branch**: `020-frame-edit-own-animations`  
**Created**: 2026-05-04  
**Status**: Draft  
**Input**: User description: "A user should be able to open any animation they own in the editor, modify its frames, and save changes back to the original record (overwrite, not remix)."

## Constitutional Compliance Gate *(mandatory — check before writing requirements)*

Verify this feature against [docs/authority/constitution.md](../../docs/authority/constitution.md):

- [x] **Tier alignment**: Tier 1 (Authenticated) — editing saved animations is an authenticated-only feature.
- [x] **No telemetry**: No new tracking added.
- [x] **No third-party analytics**: None added.
- [x] **No hardcoded colors**: Continues to use `EntityColors` service.
- [x] **Privacy gate**: Only the owner of an animation can overwrite it. Public users can still only "Remix" (Save as New).
- [x] **Shared canvas risk**: Touches `Editor.tsx` logic but doesn't change the underlying canvas components. Will verify `/app`, `/replay/[id]`, and `/share/[id]`.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Opening Own Animation for Editing (Priority: P1)

As a coach, I see a "Open in Editor" button on my animation cards in My Playbook. Clicking it opens the editor with the current frames loaded.

**Why this priority**: Essential entry point for the frame-editing workflow.

**Independent Test**: Navigate to My Playbook. Identify an animation I own. Click "Open in Editor". Verify the editor loads at `/app?load={id}&mode=edit` and shows the correct frames.

**Acceptance Scenarios**:

1. **Given** I am in My Playbook, **When** I click "Open in Editor" on an animation card, **Then** I am redirected to `/app?load={id}&mode=edit`.
2. **Given** the editor loads via the edit path, **When** it finishes loading, **Then** the canvas reflects the saved frames and the "Save" button acknowledges I am editing an existing record.

---

### User Story 2 - Overwriting Original Animation (Priority: P1)

As a coach, after modifying frames in the editor, I click "Save". I am presented with a choice: "Update Original" or "Save as Copy". I choose "Update Original" to overwrite the existing record.

**Why this priority**: This closes the core coaching loop (Workflow 1, Step 5).

**Independent Test**: Load an own animation in the editor. Move a player. Click "Save to Cloud". Choose "Update Original". Verify the record ID remains the same but the payload is updated.

**Acceptance Scenarios**:

1. **Given** I am editing an animation I own, **When** I click "Save to Cloud", **Then** the modal shows an "Update Original" button.
2. **Given** I choose "Update Original", **When** the save completes, **Then** the `PUT /api/animations/[id]` endpoint is called with the new payload.
3. **Given** the update is successful, **When** I view the share link, **Then** I see the updated version (live update).

---

### User Story 3 - Save as New (Duplicate/Remix) (Priority: P2)

As a coach, I want to use an existing drill as a template for a new one without losing the original. I modify the frames and choose "Save as Copy".

**Why this priority**: Supports variations of drills without destructive overwrites.

**Independent Test**: Load an own animation. Modify it. Click "Save to Cloud". Choose "Save as Copy". Verify a new animation record is created with a new ID.

**Acceptance Scenarios**:

1. **Given** I am editing an animation, **When** I click "Save to Cloud", **Then** I see a "Save as Copy" option.
2. **Given** I choose "Save as Copy", **When** I provide a new title, **Then** a `POST /api/animations` call is made.
3. **Given** the save completes, **When** I check My Playbook, **Then** both the original and the new animation exist.

---

### Edge Cases

- **Editing a Public Animation**: If I edit my own public animation, overwriting it keeps the same URL in the gallery. This is intended.
- **Ownership Verification**: If I manually type a URL `?load={id}&mode=edit` for an animation I *don't* own, the "Update Original" option should be disabled or hidden (backend will block it anyway).
- **Quota Check**: "Update Original" does not check quota. "Save as Copy" *must* check the 50-animation limit.
- **In-Flight Edits**: If I am editing and lose internet, the offline queue should handle `PUT` requests just like `POST` requests.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `AnimationCard` MUST display an "Open in Editor" action (icon: `Pencil` or `ExternalLink`) that navigates to `/app?load={id}&mode=edit`.
- **FR-002**: `AnimationToolClient` MUST parse the `mode=edit` search parameter.
- **FR-003**: When `mode=edit` is active and the user is the owner, the `SaveToCloudModal` MUST expose an "Update Original" action.
- **FR-004**: The `Update Original` action MUST call `PUT /api/animations/[id]` with the current editor payload.
- **FR-005**: The `Save as Copy` action MUST call `POST /api/animations` (standard save logic).
- **FR-006**: The system MUST warn the user that "Update Original" will affect existing share links.

### Frontend Requirements

- **UI-001**: `AnimationCard` update: Rename existing "Edit" (pencil) to "Edit Info" (using a different icon or tooltip) and add "Edit Frames" (pencil).
- **UI-002**: `SaveToCloudModal` update: If `isEditMode`, show a primary button "Overwrite Original" and a secondary "Save as New Copy".
- **UI-003**: `SaveToCloudModal` MUST show a warning: "⚠️ Overwriting will update this animation for everyone who has a share link."

### API / Database Requirements

- **API-001**: `PUT /api/animations/[id]` endpoint is already functional for payloads — ensure the frontend correctly sends the `payload` object.
- **API-002**: Ensure `is_major_version` can be optionally passed if we want to expose version control to the user (default to minor update for overwrites).

### Key Entities

- **EditMode**: A state in the Editor determining if we are targeting an existing record.
- **UpdatePayload**: The same structure as create payload but sent via `PUT`.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A coach can open an animation from My Playbook, move one player, and overwrite the record in under 3 clicks.
- **SC-002**: The animation ID remains identical after an "Update Original" operation.
- **SC-003**: An unauthenticated user cannot see the "Update Original" option or successfully call the `PUT` endpoint.
- **SC-004**: `npm run lint && npx tsc --noEmit` passes with no new errors.
