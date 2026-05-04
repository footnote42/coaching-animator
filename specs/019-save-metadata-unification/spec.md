# Feature Specification: Save & Metadata Unification

**Feature Branch**: `019-save-metadata-unification`  
**Created**: 2026-05-04  
**Status**: Draft  
**Closes**: EDITOR-016, EDITOR-018

---

## Constitutional Compliance Gate

- [x] **Tier alignment**: Tier 1 (Authenticated) — all metadata editing requires auth; reads are public-accessible where already permitted
- [x] **No telemetry**: No new tracking
- [x] **No third-party analytics**: None added
- [x] **No hardcoded colors**: No entity color changes
- [x] **Privacy gate**: No new data stored; `tags` and `video_url` already exist in the DB schema. Extending the select query to return these fields to the animation owner is safe.
- [x] **Shared canvas risk**: No canvas changes
- [x] **§III 2-click rule**: YouTube URL editing moves from editor sidebar (MetadataSheet) to My Playbook Edit modal — deliberate trade-off; MetadataSheet was a confusing partial-edit surface; edit-after-save via My Playbook is the canonical metadata management path

---

## User Scenarios & Testing

### User Story 1 — Stored description appears in Edit form (Priority: P1)

A coach saves an animation with a title, description ("Use this drill for lineout variations"), coaching notes, and two tags ("lineout, set-piece"). They close the editor and return to My Playbook. When they click Edit on the animation card, the edit modal opens with the description, coaching notes, and tags already filled in — nothing is blank.

**Why this priority**: Data disappearing silently on re-edit is a trust-breaker. A coach who re-enters their description every time will stop using the feature.

**Independent Test**: Save an animation with description + coaching notes + tags via SaveToCloudModal. Open My Playbook, click Edit on that card. All three fields must be pre-filled.

**Acceptance Scenarios**:

1. **Given** an animation saved with a non-empty description, **When** its Edit modal is opened from My Playbook, **Then** the description field is pre-filled with the stored value.
2. **Given** an animation saved with coaching notes, **When** its Edit modal is opened, **Then** the coaching notes field is pre-filled.
3. **Given** an animation saved with tags ["lineout", "set-piece"], **When** its Edit modal is opened, **Then** the tags field shows "lineout, set-piece".
4. **Given** an animation with no description or tags, **When** its Edit modal is opened, **Then** those fields are empty (not showing "null" or "undefined").

---

### User Story 2 — Edit modal covers all metadata fields (Priority: P1)

A coach opens the Edit modal for a saved animation and can update every field they could set when first saving: title, description, coaching notes, animation type, visibility, tags, and YouTube tutorial URL. They save changes and confirm the updates appear immediately.

**Why this priority**: The current edit modal is missing tags and YouTube URL — fields coaches set on first save but cannot change later without re-saving the whole animation.

**Independent Test**: Open Edit modal from My Playbook. Verify Tags input and YouTube URL input are present. Edit both fields and save. Re-open edit modal and confirm values are persisted.

**Acceptance Scenarios**:

1. **Given** the Edit modal is open, **When** a coach inspects the form, **Then** they see fields for: Title, Description, Coaching Notes, Animation Type, Tags, YouTube URL, Visibility.
2. **Given** an animation with a stored YouTube URL, **When** its Edit modal is opened, **Then** the YouTube URL field is pre-filled with the stored value.
3. **Given** a coach enters tags "lineout, rucks, backs" and saves, **When** they reopen the edit modal, **Then** the tags field shows "lineout, rucks, backs".
4. **Given** a coach enters an invalid YouTube URL (not `youtube.com/watch?v=` or `youtu.be/`), **When** they submit the form, **Then** an inline validation error appears and the form does not submit.
5. **Given** a coach clears the YouTube URL field and saves, **When** they reopen the edit modal, **Then** the YouTube URL field is empty.

---

### User Story 3 — Metadata button removed from editor sidebar (Priority: P2)

A coach using the editor no longer sees a standalone "Metadata" button in the sidebar. The animation title is set in the editor header (or at save time via the Save to Cloud modal). YouTube URL and all other metadata are managed via the Save to Cloud modal (on first save) or the My Playbook Edit card (on subsequent saves). The editor sidebar is simpler.

**Why this priority**: The standalone Metadata button duplicates the Save modal and only exposes a subset of fields (title + YouTube URL), creating a confusing partial-edit surface. Removing it reduces cognitive overhead.

**Independent Test**: Open the editor. Inspect the left-hand sidebar. Confirm there is no standalone "Metadata" button or sheet trigger.

**Acceptance Scenarios**:

1. **Given** the editor is open, **When** a coach inspects the sidebar, **Then** there is no Metadata or Info button that opens a separate sheet.
2. **Given** a coach opens Save to Cloud, **When** they inspect the form, **Then** a YouTube URL field is present (already shipped — verify it is retained).
3. **Given** the Metadata button is removed, **When** lint and TypeScript checks are run, **Then** there are zero errors (all imports removed cleanly).

---

### Edge Cases

- Animation with `description = null` (never set): edit modal description field is empty, not "null".
- Animation with `tags = []` (empty array) or `tags = null`: edit modal tags field is empty.
- Tags field: trailing comma or extra spaces should be trimmed before submission (e.g. "lineout, , scrum" → ["lineout", "scrum"]).
- YouTube URL: empty string must be treated as "no URL" and sent as `undefined` / cleared on save.
- Coach with 10 tags already saved: adding an 11th tag via edit modal must be blocked with an inline error.
- PUT request fails (network/server error): toast error is displayed, modal remains open with all form data intact for retry. No partial state is applied to the store.

---

## Requirements

### Functional Requirements

- **FR-001**: `GET /api/animations` response MUST include `description`, `coaching_notes`, `tags`, and `video_url` for each animation in the list.
- **FR-002**: `AnimationSummary` TypeScript interface MUST include `tags?: string[] | null` and `video_url?: string | null` fields.
- **FR-003**: `EditMetadataModal` MUST pre-populate Title, Description, Coaching Notes, Animation Type, Visibility, Tags, and YouTube URL from the `AnimationSummary` prop on open.
- **FR-004**: `EditMetadataModal` MUST include a Tags input (comma-separated, max 10 tags, max 30 chars each) identical in behaviour to the save form.
- **FR-005**: `EditMetadataModal` MUST include a YouTube URL input with the same regex validation as `MetadataSheet` (`youtube.com/watch?v=` or `youtu.be/` format).
- **FR-006**: `EditMetadataModal` `PUT /api/animations/[id]` request MUST include `tags` and `video_url` fields when submitting.
- **FR-008**: On successful save, `EditMetadataModal` MUST apply an optimistic in-memory patch to the animation entry in local state/store — no refetch of `GET /api/animations` is required.
- **FR-009**: On PUT failure, `EditMetadataModal` MUST display a toast error and keep the modal open with form data intact so the coach can retry.
- **FR-007**: The standalone Metadata button and `MetadataSheet` component MUST be removed from the editor sidebar.

### Frontend Requirements

- **UI-001**: Description textarea in `EditMetadataModal` max character limit must be 2000 (matching `SaveToCloudModal`), not the current 500.
- **UI-002**: Tags input uses comma-separated plain text input with helper text "Up to 10 tags, comma-separated" and character counter showing `N/10 tags`.
- **UI-003**: YouTube URL input includes the same helper text and error display as `MetadataSheet`.
- **UI-004**: All new inputs follow existing form styling: `border border-border bg-surface focus:border-primary focus:outline-none`, no rounded corners.
- **UI-005**: Tags and YouTube URL fields are positioned below Coaching Notes and above Visibility in the edit form, to match the field order in `SaveToCloudModal`.

### API / Database Requirements

- **API-001**: `GET /api/animations` Supabase select string extends from the current list to add: `description, coaching_notes, tags, video_url`.
- **API-002**: No schema migration required — `description`, `coaching_notes`, `tags`, and `video_url` columns already exist in `saved_animations`.
- **API-003**: `PUT /api/animations/[id]` already accepts `tags` and `video_url` via `UpdateAnimationSchema` — no backend change needed; verify with a unit test or manual check.

### Key Entities

- **AnimationSummary** (extended): adds `tags?: string[] | null` and `video_url?: string | null` — consumed by `EditMetadataModal`, `AnimationCard` list response.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: A coach can save an animation with description, coaching notes, and tags, then immediately open its Edit modal from My Playbook and see all three fields pre-filled — with zero re-entry required.
- **SC-002**: A coach can set or change tags and YouTube URL via the Edit modal; changes persist across page reloads.
- **SC-003**: The editor sidebar contains no Metadata or Info button that opens a metadata sheet.
- **SC-004**: `npm run lint && npx tsc --noEmit` passes with zero new errors after all changes.
- **SC-005**: Existing test suite passes (113/113 minimum); any new behaviour introduced by the edit modal changes is covered by at least one unit test.

---

## Clarifications

### Session 2026-05-04

- Q: After a successful Edit modal save, how should the My Playbook animation list update? → A: Optimistic in-memory patch — update the card's data directly in local state/store, no network call.
- Q: If the PUT request fails (network/server error), what should the Edit modal do? → A: Toast error, modal stays open so the coach can retry without losing form data.

---

## Assumptions

1. The `tags` column in `saved_animations` stores a `text[]` (PostgreSQL array). The Supabase JS client returns this as `string[] | null`. No migration needed.
2. `video_url` column stores a nullable `text` field. The Supabase JS client returns `string | null`. No migration needed.
3. The `UpdateAnimationSchema` already allows `tags` and `video_url` — confirmed by reading `animations.ts`. No schema change required.
4. Removing `MetadataSheet.tsx` is safe: only `ProjectActions.tsx` imports it. Once the import and button are removed from `ProjectActions.tsx`, the file can be deleted.
5. Coaches who set a YouTube URL using the old Metadata Sheet before this change will still have their URL stored in the DB; it will now appear in the Edit modal after this fix.
