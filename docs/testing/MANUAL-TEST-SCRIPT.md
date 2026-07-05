# Manual Test Script — Coaching Animator

**Version**: 1.0  
**Date**: 2026-05-17  
**Scope**: Full system verification — all major user flows  
**Authority**: Derived from USER-WORKFLOWS.md and specs 010, 018, 020, 023

---

## Playwright CLI Handoff Instructions

This script is designed to be executed by a Claude Code Playwright CLI session.

### Setup

1. Start the dev server in a separate terminal: `npm run dev`
2. Confirm the server is running at `http://localhost:3000`
3. To test against production, replace `BASE_URL` in each test with the production URL
4. In a Claude Code session, run `/playwright-cli` to open the browser agent
5. Work through tests sequentially. Mark each result inline: **PASS** or **FAIL**
6. On failure: capture a screenshot and note the console error if any
7. A clean run requires all non-skipped tests to PASS

### Auth Accounts Required

You will need:
- **AUTH_EMAIL** / **AUTH_PASS**: a real authenticated coach account (sign up before starting)
- **INCOGNITO**: a private/incognito window for guest perspective tests

### Conventions

- `BASE_URL` = `http://localhost:3000`
- `[navigate]` = go to that URL directly
- `[click]` = single click the described element
- `[verify]` = assert the condition is true without taking action

---

## Area 1: Landing Page

### T-001: Landing page renders
**Precondition**: Fresh browser, not signed in  
**Steps**:
1. [navigate] `BASE_URL/`
2. [verify] The page loads without a white screen or error
3. [verify] A headline, pitch illustration or hero section is visible
4. [verify] A primary CTA button is visible (e.g., "Get Started" or "Create a Drill")

**Pass criteria**: Page renders with visible headline and at least one CTA

---

### T-002: Log In button visible to guest
**Precondition**: Not signed in  
**Steps**:
1. [navigate] `BASE_URL/`
2. [verify] A "Log In" link or button is present in the navigation

**Pass criteria**: "Log In" is visible and clickable

---

### T-003: Primary CTA routes to editor
**Precondition**: Not signed in  
**Steps**:
1. [navigate] `BASE_URL/`
2. [click] The primary CTA (e.g., "Get Started", "Try it now", or "Create a Drill")
3. [verify] The editor canvas at `/app` loads OR the sign-in flow begins

**Pass criteria**: No broken route or 404

---

## Area 2: Guest Editor (Tier 0)

### T-010: Guest can access editor without signing in
**Precondition**: Not signed in  
**Steps**:
1. [navigate] `BASE_URL/app`
2. [verify] The rugby pitch canvas is visible
3. [verify] The entity toolbar is accessible

**Pass criteria**: Editor renders without a sign-in gate

---

### T-011: Guest can add an attack player
**Precondition**: At `/app`, not signed in  
**Steps**:
1. [click] The attack player button in the toolbar (red player icon)
2. [click] An empty area on the pitch canvas
3. [verify] A red player token appears at the clicked position

**Pass criteria**: Red entity placed on pitch

---

### T-012: Guest can add a cone
**Precondition**: At `/app`, not signed in  
**Steps**:
1. [click] The cone button in the toolbar (yellow/triangle icon)
2. [click] An empty area on the pitch
3. [verify] A yellow cone token appears

**Pass criteria**: Yellow cone placed on pitch

---

### T-013: Guest can add the ball
**Precondition**: At `/app`, not signed in  
**Steps**:
1. [click] The ball button in the toolbar
2. [click] An empty area on the pitch
3. [verify] A ball token appears (white/circular)

**Pass criteria**: Ball placed on pitch

---

### T-014: Guest can drag an entity to reposition it
**Precondition**: At least one entity on the pitch (from T-011)  
**Steps**:
1. [drag] An entity from its current position to a new position on the pitch
2. [verify] The entity moves to the new position and stays there after releasing

**Pass criteria**: Entity repositions on drag

---

### T-015: Guest can add frames up to the 10-frame limit
**Precondition**: At `/app`, not signed in, at least one entity placed  
**Steps**:
1. [click] `+ Frame` in the timeline until 10 frames exist
2. [verify] All 10 frames appear in the timeline strip
3. [verify] Each + Frame click successfully adds a new frame

**Pass criteria**: 10 frames created without error

---

### T-016: Guest is blocked from adding an 11th frame
**Precondition**: At `/app`, not signed in, 10 frames already created  
**Steps**:
1. [click] `+ Frame` again
2. [verify] A message appears indicating the guest frame limit has been reached (e.g., a prompt to sign in, or the button is disabled/greyed)
3. [verify] No 11th frame is added to the timeline

**Pass criteria**: Frame 11 is blocked; user receives a clear message

---

### T-017: Guest has no cloud save
**Precondition**: At `/app`, not signed in  
**Steps**:
1. [verify] "Save to Cloud" button is either absent OR displays a sign-in prompt when clicked
2. [click] The save button if visible
3. [verify] No animation is silently saved; user is prompted to sign in if button was present

**Pass criteria**: Cloud save is not accessible without authentication

---

## Area 3: Authentication

### T-020: Log In button opens auth flow
**Precondition**: Not signed in  
**Steps**:
1. [navigate] `BASE_URL/`
2. [click] "Log In"
3. [verify] An authentication page or modal opens

**Pass criteria**: Auth flow is reachable

---

### T-021: OAuth providers are visible
**Precondition**: Auth page/modal open  
**Steps**:
1. [verify] Google sign-in option is present
2. [verify] At least one of Apple or GitHub is also present
3. [verify] No prohibited providers are shown (Facebook, Twitter/X, LinkedIn, Discord)

**Pass criteria**: Google present; no prohibited providers

---

### T-022: After sign in, "My Playbook" appears in nav
**Precondition**: Successfully signed in with a valid account  
**Steps**:
1. [verify] After completing sign-in, the navigation shows "My Playbook" (or equivalent link to `/my-gallery`)
2. [verify] "Log In" is no longer visible

**Pass criteria**: Navigation reflects authenticated state

---

### T-023: Authenticated coach can access Save to Cloud
**Precondition**: Signed in, at `/app`  
**Steps**:
1. Add an entity to the pitch
2. [click] "Save to Cloud"
3. [verify] A metadata form/modal appears (not a sign-in prompt)

**Pass criteria**: Save modal opens for authenticated user

---

### T-024: Sign out works
**Precondition**: Signed in  
**Steps**:
1. Navigate to the profile page or account menu
2. [click] "Sign out"
3. [verify] The page redirects to the landing page or home
4. [verify] "My Playbook" is no longer in the navigation
5. [verify] "Log In" reappears

**Pass criteria**: Session is fully terminated

---

### T-025: Profile page accessible after sign in
**Precondition**: Signed in  
**Steps**:
1. Navigate to the profile page (via nav or direct URL)
2. [verify] The page loads without error
3. [verify] A coach identity section is visible (name, club area) — not just a raw settings form

**Pass criteria**: Profile page loads with identity-first layout

---

### T-026: Display name is editable and persists
**Precondition**: Signed in, on profile page  
**Steps**:
1. [click] The display name field
2. Clear the current value and type `Test Coach Name`
3. [click] Save
4. [verify] A success indicator appears (toast or inline confirmation)
5. Reload the page
6. [verify] The display name shows `Test Coach Name`

**Pass criteria**: Display name saved and persists across page reload

---

### T-027: Club name is editable and persists
**Precondition**: Signed in, on profile page  
**Steps**:
1. [click] The club name field
2. Type `Test RFC`
3. [click] Save
4. Reload the page
5. [verify] Club name shows `Test RFC`

**Pass criteria**: Club name saved and persists

---

## Area 4: Editor — Entities

### T-030: Editor loads for authenticated coach
**Precondition**: Signed in  
**Steps**:
1. [navigate] `BASE_URL/app`
2. [verify] Pitch canvas is visible
3. [verify] Entity toolbar is accessible
4. [verify] Timeline panel is visible at the bottom

**Pass criteria**: Full editor renders without errors

---

### T-031: Add attack player (red)
**Precondition**: Signed in, at `/app`  
**Steps**:
1. [click] Attack player in toolbar
2. [click] Pitch canvas
3. [verify] Red player token appears

**Pass criteria**: Red entity placed

---

### T-032: Add defence player (blue)
**Precondition**: Signed in, at `/app`  
**Steps**:
1. [click] Defence player in toolbar
2. [click] Pitch canvas
3. [verify] Blue player token appears

**Pass criteria**: Blue entity placed

---

### T-033: Add cone
**Precondition**: Signed in, at `/app`  
**Steps**:
1. [click] Cone in toolbar
2. [click] Pitch canvas
3. [verify] Yellow cone appears

**Pass criteria**: Cone placed

---

### T-034: Add ball
**Precondition**: Signed in, at `/app`  
**Steps**:
1. [click] Ball in toolbar
2. [click] Pitch canvas
3. [verify] Ball token appears (white/light coloured, round)

**Pass criteria**: Ball placed

---

### T-035: Drag entity to new position
**Precondition**: At least one entity on pitch  
**Steps**:
1. [drag] An entity to a new pitch position
2. [verify] Entity settles at the new position

**Pass criteria**: Entity repositions correctly

---

### T-036: Right-click entity opens context menu
**Precondition**: At least one entity on pitch  
**Steps**:
1. [right-click] An entity
2. [verify] A context menu appears
3. [verify] Menu contains: Bring Forward, Send Backward, Duplicate, Delete (or a subset)

**Pass criteria**: Context menu appears with expected actions

---

### T-037: Duplicate entity from context menu
**Precondition**: At least one entity on pitch  
**Steps**:
1. Count entities on pitch
2. [right-click] An entity → [click] Duplicate
3. [verify] Entity count increases by 1
4. [verify] The duplicate appears near the original

**Pass criteria**: Duplicate created

---

### T-038: Delete entity from context menu
**Precondition**: At least two entities on pitch  
**Steps**:
1. Count entities
2. [right-click] An entity → [click] Delete
3. [verify] Entity count decreases by 1
4. [verify] Deleted entity is gone from pitch

**Pass criteria**: Entity removed

---

## Area 5: Editor — Frames and Timeline

### T-041: Frame 1 exists on editor open
**Precondition**: Signed in, at `/app`  
**Steps**:
1. [verify] The timeline strip shows at least one frame
2. [verify] Frame 1 is the active frame

**Pass criteria**: Timeline initialises with Frame 1 active

---

### T-042: Add a second frame
**Precondition**: Signed in, at `/app`, one entity on pitch  
**Steps**:
1. [click] `+ Frame` in the timeline
2. [verify] A second frame thumbnail appears in the timeline strip
3. [verify] Frame 2 is now the active frame

**Pass criteria**: Second frame added and selected

---

### T-043: Navigate between frames
**Precondition**: Two or more frames exist  
**Steps**:
1. [click] Frame 1 in the timeline strip
2. [verify] Canvas updates to show Frame 1 entity positions
3. [click] Frame 2 in the timeline strip
4. [verify] Canvas updates to Frame 2 entity positions

**Pass criteria**: Frame navigation updates canvas

---

### T-044: Play animation
**Precondition**: Two or more frames, entities in different positions per frame  
**Steps**:
1. Set entities in Frame 1 position
2. Switch to Frame 2, move at least one entity
3. [click] Play in the timeline
4. [verify] Frames advance automatically (Frame 1 → Frame 2 → ...)
5. [verify] Entity positions change between frames during playback

**Pass criteria**: Animation plays with visible entity movement

---

### T-045: Pause animation
**Precondition**: Animation is playing  
**Steps**:
1. While animation is playing, [click] Pause
2. [verify] Animation stops on the current frame
3. [verify] The frame no longer advances

**Pass criteria**: Playback pauses

---

### T-046: Delete a frame
**Precondition**: Three or more frames exist  
**Steps**:
1. Select a middle frame (e.g., Frame 2)
2. Click the delete/trash icon for that frame
3. [verify] The frame is removed from the timeline
4. [verify] Remaining frames re-index (no gaps)

**Pass criteria**: Frame removed, timeline reindexes

---

## Area 6: Editor — Entity Layering

### T-049: Cone renders below player when overlapping
**Precondition**: Signed in, at `/app`  
**Steps**:
1. Place a cone on the pitch
2. Place an attack player exactly on top of the cone (same position)
3. [verify] The player token is visible above the cone (cone is partially or fully obscured)

**Pass criteria**: Player renders on top of cone; correct type hierarchy enforced

---

### T-050: Ball renders above player when overlapping
**Precondition**: Signed in, at `/app`  
**Steps**:
1. Place an attack player
2. Place the ball exactly on top of the player
3. [verify] The ball is visible above the player token

**Pass criteria**: Ball renders on top of player

---

### T-051: Context menu shows Bring Forward / Send Backward
**Precondition**: Two players overlapping  
**Steps**:
1. Place two attack players at the same position
2. [right-click] The overlapping entity area
3. [verify] "Bring Forward" is present in the context menu
4. [verify] "Send Backward" is present in the context menu

**Pass criteria**: Both layer controls appear in context menu

---

### T-052: Bring Forward raises entity within type group
**Precondition**: Two players overlapping, player A visually on top  
**Steps**:
1. [right-click] the player that is currently below (player B)
2. [click] Bring Forward
3. [verify] Player B is now rendered above Player A

**Pass criteria**: Layering order changes within type group

---

### T-053: Layer actions disabled at type boundary
**Precondition**: One cone on pitch, no other cones  
**Steps**:
1. [right-click] the cone
2. [verify] "Send Backward" is visually disabled (greyed out / not interactive) — there is nothing below a cone
3. Place only one player (no other players)
4. [right-click] the player
5. [verify] "Bring Forward" is visually disabled — there is no higher-order entity to surpass, and the ball type is above (cross-type not allowed)

**Pass criteria**: Disabled state correctly indicates boundary; actions cannot be triggered

---

## Area 7: Editor — Snap to Grid

### T-054: Snap to grid toggle is visible
**Precondition**: Signed in, at `/app`  
**Steps**:
1. [verify] A snap-to-grid control is visible in the editor toolbar or toolbar area

**Pass criteria**: Snap toggle present

---

### T-055: Snap to grid constrains entity movement
**Precondition**: Snap to grid enabled  
**Steps**:
1. Enable snap to grid
2. [drag] An entity slowly across the pitch
3. [verify] The entity steps/snaps to discrete grid positions rather than moving continuously

**Pass criteria**: Entity snaps to grid intersections

---

### T-056: Disabling snap allows free movement
**Precondition**: Snap to grid was enabled  
**Steps**:
1. Disable snap to grid
2. [drag] An entity slowly across the pitch
3. [verify] The entity follows the cursor smoothly without snapping

**Pass criteria**: Entity moves freely when snap is off

---

## Area 8: Save and Cloud Persistence

### T-060: Save to Cloud opens metadata modal
**Precondition**: Signed in, at `/app`, at least one entity on pitch  
**Steps**:
1. [click] "Save to Cloud"
2. [verify] A modal or sheet opens
3. [verify] The modal contains a Title field, Description field, Coaching Points field, and Tags input

**Pass criteria**: Metadata form appears with all four fields

---

### T-061: Fill metadata and save successfully
**Precondition**: Save modal is open  
**Steps**:
1. Enter title: `T-061 Test Drill`
2. Enter description: `Automated test drill for verification`
3. Enter coaching points: `Focus on communication and support lines`
4. Enter tag: `tackling`
5. [click] Save
6. [verify] The modal closes
7. [verify] A success toast or confirmation message appears

**Pass criteria**: Animation saves without error

---

### T-062: Animation appears in My Playbook after save
**Precondition**: T-061 completed  
**Steps**:
1. [navigate] `BASE_URL/my-gallery`
2. [verify] A card titled `T-061 Test Drill` is visible
3. [verify] The description or tag is shown on or accessible from the card

**Pass criteria**: Saved animation appears in My Playbook

---

### T-063: Animation persists after page reload
**Precondition**: T-062 completed  
**Steps**:
1. Reload `BASE_URL/my-gallery`
2. [verify] The `T-061 Test Drill` card is still present

**Pass criteria**: Animation is not lost on reload

---

### T-064: Edit Frames re-loads existing animation
**Precondition**: `T-061 Test Drill` exists in My Playbook  
**Steps**:
1. [navigate] `BASE_URL/my-gallery`
2. [click] The Edit Frames (pencil) icon on the `T-061 Test Drill` card
3. [verify] The editor opens at `/app` (or with query param)
4. [verify] The entities from the original save are visible on the pitch
5. [verify] The frame count matches what was saved

**Pass criteria**: Existing animation loads correctly into editor

---

### T-065: Overwrite Original updates the animation
**Precondition**: T-064 — editor open with `T-061 Test Drill` loaded  
**Steps**:
1. Add a new entity to the pitch
2. [click] "Save to Cloud"
3. [click] "Overwrite Original" (or equivalent)
4. [verify] Save succeeds
5. [navigate] `BASE_URL/my-gallery`
6. [verify] Only one `T-061 Test Drill` card exists (not a duplicate)
7. [click] Edit Frames again
8. [verify] The new entity is present in the re-loaded animation

**Pass criteria**: Overwrite saves correctly; no duplicate created; changes persist

---

## Area 9: Share Flow

### T-070: Share modal opens from My Playbook
**Precondition**: Signed in, at least one saved animation in My Playbook  
**Steps**:
1. [navigate] `BASE_URL/my-gallery`
2. [click] The Share button on an animation card
3. [verify] A modal or sheet appears with visibility options (link-only / public gallery)

**Pass criteria**: Share options visible

---

### T-071: Link-only share generates a URL
**Precondition**: Share modal open  
**Steps**:
1. [click] "Link-only" (or equivalent)
2. [verify] A share URL is generated (format includes `/share/`)
3. [verify] The URL is copyable (copy button present or URL is selectable)

**Pass criteria**: Valid share URL generated

---

### T-072: Share URL is accessible without signing in
**Precondition**: Share URL from T-071  
**Steps**:
1. Copy the share URL
2. Open a new incognito/private browser window
3. Paste and navigate to the share URL
4. [verify] The page loads at `/share/{id}` without a sign-in gate
5. [verify] The animation canvas is visible

**Pass criteria**: Share URL accessible to unauthenticated viewer

---

### T-073: Editor share button works after save
**Precondition**: Signed in, `T-061 Test Drill` loaded in editor  
**Steps**:
1. [navigate] `BASE_URL/app` and load a saved animation
2. [click] The Share button in the editor toolbar
3. [verify] On desktop: a success toast appears confirming link copied; OR the native share sheet opens
4. [verify] No "not available" or error message appears

**Pass criteria**: Editor share button produces a working link

---

### T-074: Unsaved animation prompts save before share
**Precondition**: Signed in, at `/app` with unsaved changes  
**Steps**:
1. Place entities on the pitch without saving
2. [click] Share in the editor toolbar
3. [verify] A prompt or warning appears asking to save before sharing
4. [verify] No share link is generated until after saving

**Pass criteria**: Save-first guard is enforced before sharing

---

## Area 10: Share View (Player Perspective)

### T-076: Share view loads in full-screen layout
**Precondition**: A valid share URL (from T-071)  
**Steps**:
1. Open the share URL (incognito window)
2. [verify] The page layout is full-screen / no visible navigation bar clutter
3. [verify] The pitch canvas occupies the primary viewport area

**Pass criteria**: Share view renders in immersive layout

---

### T-077: Animation title is visible in share view
**Precondition**: Share URL for `T-061 Test Drill`  
**Steps**:
1. Open the share URL
2. [verify] The title `T-061 Test Drill` (or the animation's actual title) is displayed on the page

**Pass criteria**: Title rendered above or near the canvas

---

### T-078: Floating playback controls are visible without scrolling
**Precondition**: Share view open at 375px wide viewport (mobile simulation)  
**Steps**:
1. Set browser viewport to 375px wide
2. Open the share URL
3. [verify] Playback controls (play, pause, frame nav) are visible without scrolling down
4. Scroll the page if scrollable
5. [verify] Controls remain visible after scrolling

**Pass criteria**: Controls always accessible; no scroll required

---

### T-079: No edit controls visible to guest viewer
**Precondition**: Share view open, not signed in  
**Steps**:
1. Open the share URL in incognito
2. [verify] There is no "Edit", "Save to Cloud", or "My Playbook" button visible on the page
3. [verify] "Built with Coaching Animator" link (or equivalent) is the only site-linking element

**Pass criteria**: Zero editor controls visible to unauthenticated viewer

---

## Area 11: Playback Controls

### T-080: Play advances frames
**Precondition**: Share view open, animation has at least 2 frames  
**Steps**:
1. Note the current frame (should be Frame 1)
2. [click] Play
3. [verify] Frames advance automatically (animation plays)
4. [verify] Entity positions change between frames

**Pass criteria**: Playback works

---

### T-081: Pause stops playback
**Precondition**: Animation playing  
**Steps**:
1. [click] Pause
2. [verify] Animation stops; frame no longer advances

**Pass criteria**: Pause works

---

### T-082: Prev/Next frame navigation
**Precondition**: Animation has 3+ frames, paused  
**Steps**:
1. Navigate to Frame 1
2. [click] Next frame → [verify] Frame 2 active
3. [click] Next frame → [verify] Frame 3 active
4. [click] Previous frame → [verify] Frame 2 active

**Pass criteria**: Frame-by-frame navigation works

---

### T-083: Coaching notes overlay (if coaching points set)
**Precondition**: Share URL for an animation with Coaching Points set (e.g., T-061)  
**Steps**:
1. Open the share URL
2. [verify] A "Notes" control is visible in the playback controls area
3. [click] Notes
4. [verify] An overlay or panel appears showing the coaching points text (`Focus on communication and support lines` from T-061)
5. [click] outside the panel or close control
6. [verify] Overlay dismisses; playback controls remain visible

**Pass criteria**: Notes overlay opens, shows correct content, dismisses cleanly

---

### T-083b: Notes control absent when no coaching points
**Precondition**: An animation saved with no coaching points  
**Steps**:
1. Save an animation without entering any coaching points
2. Open its share URL
3. [verify] No "Notes" button is visible in the playback controls

**Pass criteria**: Notes button does not render for animations without coaching points

---

## Area 12: My Gallery / Playbook

### T-090: My Playbook lists own animations
**Precondition**: Signed in, at least one saved animation  
**Steps**:
1. [navigate] `BASE_URL/my-gallery`
2. [verify] The page loads without error
3. [verify] A card for `T-061 Test Drill` is visible

**Pass criteria**: My Playbook renders and shows own animations

---

### T-091: Animation card shows title and controls
**Precondition**: My Playbook page loaded  
**Steps**:
1. [verify] Card shows the animation title
2. [verify] Card has visible action controls (Edit Frames, Edit Info, Share, More/dropdown)

**Pass criteria**: Card layout is complete

---

### T-092: Edit Info modal opens pre-populated
**Precondition**: My Playbook loaded, `T-061 Test Drill` card visible  
**Steps**:
1. [click] Edit Info (settings/gear icon) on the card
2. [verify] A modal opens
3. [verify] Title field is pre-populated with `T-061 Test Drill`
4. [verify] Description field is pre-populated with `Automated test drill for verification`
5. [verify] Coaching Points field is pre-populated with `Focus on communication and support lines`

**Pass criteria**: All fields pre-populated from saved values

---

### T-093: Update title persists
**Precondition**: Edit Info modal open for T-061  
**Steps**:
1. Change the title to `T-061 Test Drill (edited)`
2. [click] Save
3. [verify] The card in My Playbook now shows `T-061 Test Drill (edited)`
4. Reload the page
5. [verify] The updated title persists

**Pass criteria**: Title change saved and persists

---

### T-094: Add Progression opens editor pre-linked
**Precondition**: Signed in, at least one saved animation in My Playbook  
**Steps**:
1. [click] More (or equivalent dropdown) on an animation card
2. [click] "Add Progression"
3. [verify] The editor opens at `/app`
4. [verify] A visual indicator or pre-selected Foundation is visible in the save flow (the link to the parent animation is pre-set)

**Pass criteria**: Editor opens in progression-creation mode linked to the parent

---

### T-095: Save as Progression creates child, not standalone
**Precondition**: Editor open after T-094  
**Steps**:
1. Add at least one entity, add a second frame
2. [click] "Save to Cloud"
3. [verify] Save options include "Save as Progression" (or the save modal shows the parent animation pre-linked)
4. Complete the save
5. [navigate] `BASE_URL/my-gallery`
6. [verify] The new animation does NOT appear as a top-level standalone card
7. [verify] The parent Foundation card shows a ProgressionStrip or progression badge beneath it

**Pass criteria**: Progression saved as child of Foundation; not standalone

---

### T-096: Delete animation removes card
**Precondition**: My Playbook has at least two animations (so one can be deleted safely)  
**Steps**:
1. [click] More on a card you want to delete
2. [click] Delete
3. [verify] A confirmation prompt appears (if applicable)
4. Confirm deletion
5. [verify] The card is no longer visible in My Playbook
6. Reload the page
7. [verify] The deleted animation does not reappear

**Pass criteria**: Animation permanently deleted

---

## Area 13: Public Gallery

### T-100: Guest can browse the public gallery
**Precondition**: Not signed in  
**Steps**:
1. [navigate] `BASE_URL/gallery`
2. [verify] The page loads without a sign-in gate
3. [verify] At least one animation card is visible (if any public animations exist)

**Pass criteria**: Gallery accessible to guests

---

### T-101: Clicking Play routes to share view
**Precondition**: Public gallery has at least one animation  
**Steps**:
1. [click] "Play" on an animation card
2. [verify] The URL changes to `/share/{id}` for that animation
3. [verify] The share view loads (pitch canvas, floating remote)

**Pass criteria**: Play routes to `/share/{id}`, not `/replay/{id}`

---

### T-102: Clicking Share produces a share URL
**Precondition**: Public gallery open  
**Steps**:
1. [click] "Share" on an animation card
2. [verify] A share link is generated (clipboard copy toast, or Web Share sheet on mobile)
3. [verify] The link format is `/share/{id}`

**Pass criteria**: Share from gallery produces correct URL format

---

### T-103: Authenticated user can upvote
**Precondition**: Signed in, public gallery open with at least one animation  
**Steps**:
1. Note the upvote count on a card
2. [click] The upvote button
3. [verify] The upvote count increments by 1

**Pass criteria**: Upvote registers and count updates

---

### T-104: Authenticated user can Remix
**Precondition**: Signed in, public gallery open  
**Steps**:
1. [click] "Remix" on an animation card
2. [verify] The editor opens at `/app?load={id}` (or equivalent)
3. [verify] The entity positions and frame count from the original animation are pre-loaded in the editor
4. Add a modification (move an entity)
5. [click] "Save to Cloud"
6. Complete the save
7. [navigate] `BASE_URL/my-gallery`
8. [verify] A new animation card appears (different ID from the original)
9. [navigate] `BASE_URL/gallery`
10. [verify] The original animation is unchanged

**Pass criteria**: Remix creates a new animation; original is unchanged

---

### T-105: Progression count badge on Foundation card
**Precondition**: A Foundation animation with at least one Progression has been made public  
**Steps**:
1. [navigate] `BASE_URL/gallery`
2. Locate the Foundation animation card
3. [verify] A badge reads "{n} progressions" (e.g., "1 progression" or "2 progressions")
4. [verify] No standalone Progression cards appear separately in the gallery listing

**Pass criteria**: Badge shows correct count; Progressions not listed standalone

---

## Area 14: Progressions

### T-110: Progressions help page loads
**Precondition**: Any browser state  
**Steps**:
1. [navigate] `BASE_URL/help/progressions`
2. [verify] The page loads without error
3. [verify] Content describes what progressions are and how to use them

**Pass criteria**: Help page renders with meaningful content

---

### T-111: Progression navigation in share view
**Precondition**: A Foundation with at least one Progression, both accessible via share links  
**Steps**:
1. Open the Foundation's share URL
2. [verify] A "Next" button (or "Next Progression") is visible in the playback area
3. [click] Next
4. [verify] The URL changes to the Progression's `/share/{id}`
5. [verify] The Progression's title is displayed
6. [verify] A "Previous" button is now visible
7. [click] Previous
8. [verify] URL returns to the Foundation's `/share/{id}`

**Pass criteria**: Prev/Next progression navigation works correctly

---

### T-112: Foundation is labelled "Foundation", not numbered
**Precondition**: Foundation's share view open  
**Steps**:
1. [verify] The Foundation animation is displayed without a "Part 1" or "Progression 1" label
2. [verify] The title is the animation's own title (not auto-suffixed)

**Pass criteria**: Foundation carries no progression number label

---

### T-113: Progression does not appear as standalone in gallery
**Precondition**: A Progression saved as child of a Foundation  
**Steps**:
1. [navigate] `BASE_URL/gallery`
2. [verify] The Progression animation card does NOT appear as a top-level card
3. [verify] Only the Foundation card is visible (with progression badge if public)

**Pass criteria**: Progression is not discoverable as standalone in the public gallery

---

## Area 15: Profile

### T-120: Profile page leads with coach identity
**Precondition**: Signed in  
**Steps**:
1. Navigate to the profile page
2. [verify] The page's primary visual area shows the coach's name and club — NOT a generic form with just an email field at the top
3. [verify] Name and club are prominently displayed or editable at the top of the page

**Pass criteria**: Identity-first layout confirmed

---

### T-121: Display name change reflects without reload
**Precondition**: Signed in, profile page  
**Steps**:
1. Change the display name field
2. [click] Save
3. [verify] The new name is visible on the profile page immediately (no reload needed)

**Pass criteria**: Display name updates in place

---

### T-122: Account settings visible as secondary section
**Precondition**: Profile page  
**Steps**:
1. Scroll the profile page
2. [verify] An "Account Settings" or equivalent section is present
3. [verify] Email address is visible in this section
4. [verify] This section is below the identity/edit section, not above it

**Pass criteria**: Account settings are present but secondary

---

### T-123: Profile page single-column on mobile
**Precondition**: Browser viewport set to 375px wide  
**Steps**:
1. Navigate to the profile page at 375px width
2. [verify] No horizontal overflow or cut-off content
3. [verify] All sections stack vertically (single column)

**Pass criteria**: Mobile layout is single-column with no overflow

---

## Area 16: Mobile Layout Spot-Checks

### T-130: Share view is full-screen at 375px
**Precondition**: Valid share URL, viewport 375px wide  
**Steps**:
1. Open share URL at 375px viewport
2. [verify] Pitch canvas occupies the full viewport height and width
3. [verify] No navigation bar or footer adds scrollable area outside the canvas

**Pass criteria**: Full-screen immersive layout on mobile

---

### T-131: Floating remote visible without scroll at 375px
**Precondition**: Share view at 375px  
**Steps**:
1. Open share URL
2. [verify] Playback controls are visible in the initial viewport — no scrolling needed

**Pass criteria**: Controls visible immediately on mobile

---

### T-132: My Gallery cards readable at 375px
**Precondition**: Signed in, My Playbook with at least one animation  
**Steps**:
1. Navigate to `/my-gallery` at 375px viewport
2. [verify] Animation cards are readable (title visible, not truncated to illegibility)
3. [verify] Action icons are tappable (not overlapping or cut off)

**Pass criteria**: Card layout usable on mobile

---

### T-133: Editor toolbar accessible at 768px
**Precondition**: Signed in, at `/app`, viewport 768px wide  
**Steps**:
1. Open the editor at 768px width
2. [verify] Entity toolbar is visible and icons are distinguishable
3. [verify] Timeline panel is visible at the bottom

**Pass criteria**: Editor usable at tablet width

---

### T-134: Public gallery cards readable at 375px
**Precondition**: Public gallery open at 375px viewport  
**Steps**:
1. [navigate] `BASE_URL/gallery` at 375px
2. [verify] Animation cards are displayed in a single column or appropriate mobile grid
3. [verify] Play and Share buttons are tappable

**Pass criteria**: Gallery usable on mobile

---

## Test Run Summary Template

Copy and fill in after completing a test run:

```
Date: ___________
Tester / Session: ___________
Base URL: ___________

| Area | Tests | Pass | Fail | Skipped |
|------|-------|------|------|---------|
| 1. Landing Page | T-001–003 | | | |
| 2. Guest Editor | T-010–017 | | | |
| 3. Authentication | T-020–027 | | | |
| 4. Editor Entities | T-030–038 | | | |
| 5. Editor Frames | T-041–046 | | | |
| 6. Entity Layering | T-049–053 | | | |
| 7. Snap to Grid | T-054–056 | | | |
| 8. Save & Persistence | T-060–065 | | | |
| 9. Share Flow | T-070–074 | | | |
| 10. Share View | T-076–079 | | | |
| 11. Playback | T-080–083b | | | |
| 12. My Gallery | T-090–096 | | | |
| 13. Public Gallery | T-100–105 | | | |
| 14. Progressions | T-110–113 | | | |
| 15. Profile | T-120–123 | | | |
| 16. Mobile | T-130–134 | | | |
| **TOTAL** | **~70** | | | |

Failures:
- T-XXX: <description of failure>

Blockers for sign-off:
- [ ] All P1/critical tests pass (T-001, T-010–017, T-020–027, T-030–038, T-060–065, T-070–074, T-076–079, T-080–083, T-090–096)
```
