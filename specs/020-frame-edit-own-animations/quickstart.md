# Quickstart: Direct Frame Editing

This guide covers manual verification of the frame-editing workflow.

## Pre-conditions
- Authenticated as a Coach.
- At least one animation saved in My Playbook.

## Test Scenarios

### Scenario 1: Entry Point from My Playbook
1. Navigate to `/my-gallery`.
2. Locate an animation card.
3. **Verify**: There is a "Edit Frames" button (Pencil icon) and a "Settings" button (for metadata).
4. Click **Edit Frames**.
5. **Verify**: The URL is `/app?load={ID}&mode=edit`.
6. **Verify**: The editor loads correctly with the saved frames.

### Scenario 2: Overwrite Original
1. Complete Scenario 1.
2. Move a player to a new position.
3. Click **Save to Cloud**.
4. **Verify**: The modal shows "Overwrite Original" as the primary action.
5. Click **Overwrite Original**.
6. **Verify**: A success toast appears.
7. Reload the page.
8. **Verify**: The player is in the *new* position.
9. **Verify**: The animation ID in the URL has not changed.

### Scenario 3: Save as Copy
1. Load an animation in edit mode.
2. Modify it.
3. Click **Save to Cloud**.
4. Click **Save as New Copy**.
5. Change the title to "Variation 1".
6. Click **Save**.
7. Navigate to My Playbook.
8. **Verify**: Both the original animation and "Variation 1" exist.
9. **Verify**: They have different IDs.

### Scenario 4: Permission Check (Remix Mode)
1. Navigate to a Public Animation you *do not* own (via `/gallery`).
2. Click **Remix**.
3. **Verify**: The URL is `/app?load={ID}` (no `mode=edit`).
4. Click **Save to Cloud**.
5. **Verify**: The "Overwrite Original" option is NOT visible. You can only save as a new animation.
