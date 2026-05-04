# User Workflows

**Version**: 1.0
**Date**: 2026-05-04
**Status**: Authority document

These are the canonical workflows for coaching-animator. They define what the product *should* do for each user role, serve as the reference for development decisions, and embed test checklists that can be executed manually or by an automated agent.

---

## Roles

| Role | Description |
|---|---|
| **Guest** | Unauthenticated visitor. Can browse the public gallery and watch shared animations. Cannot create or save. |
| **Coach (authenticated)** | Logged-in user. Can create, save, edit, and share animations. Up to 50 animations. |
| **Player (link recipient)** | Receives a share link. Views the animation in replay mode. No account needed. |

---

## Workflow 1: Core Coaching Loop

The primary workflow. Phase 2 does not close until this workflow is fully executable end-to-end.

### Narrative (coach-readable)

1. **Sign in** — Navigate to the app and log in with Google, Apple, or GitHub.
2. **Create** — Open the editor at `/app`. Place players (red = attack, blue = defence), cones (yellow), and a ball on the pitch. Use the toolbar to choose entity types.
3. **Animate** — Add frames using the frame strip at the bottom. Each frame captures a snapshot of entity positions. Move entities between frames to show movement sequences.
4. **Save** — Click "Save to Cloud". On first save, a metadata modal appears: enter a title, optional description, coaching notes, and tags. Click Save.
5. **Edit frames** — *(EDITOR-019 — not yet implemented)* Re-open the animation in the editor to modify frames and overwrite the original. Current workaround: see Workflow 3 (Remix) to create a modified copy.
6. **Edit metadata** — In My Playbook (`/my-gallery`), click the pencil icon on an animation card. Update title, description, coaching notes, tags, or YouTube URL. Changes save immediately.
7. **Share** — Click Share on an animation card. Choose visibility: link-only (anyone with the link) or public gallery (discoverable). Copy the share URL.
8. **Replay** — Open the share link in any browser. The animation plays back in full-screen mobile-optimised view with floating playback controls.

### Test Checklist (agent-executable)

**Preconditions**: Authenticated user. Dev server running at `localhost:3000`.

- [ ] Navigate to `/app`
- [ ] Verify the pitch canvas is visible and the toolbar is accessible
- [ ] Add 6 players (3 red attack, 3 blue defence) by clicking the player entity buttons
- [ ] Drag players to positions on the pitch
- [ ] Add 1 cone (yellow) to the pitch
- [ ] Add at least 2 movement arrows by selecting the arrow tool and drawing on the canvas
- [ ] Add a second frame via the frame strip ("+frame" button or equivalent)
- [ ] Move at least 2 players to new positions in frame 2
- [ ] Click "Save to Cloud"
- [ ] Verify the metadata modal appears
- [ ] Enter title `Test Drill 001`, add a description `Basic tackle drill`, add tag `tackling`
- [ ] Click Save in the modal
- [ ] Verify success toast or confirmation
- [ ] Navigate to `/my-gallery`
- [ ] Verify an animation card titled `Test Drill 001` is visible
- [ ] Click the pencil (Edit) icon on the card
- [ ] Verify the metadata modal opens pre-populated with title, description, and tag
- [ ] Update the title to `Test Drill 001 (edited)`
- [ ] Click Save — verify the card title updates to `Test Drill 001 (edited)`
- [ ] Click Share on the animation card
- [ ] Choose `link-only` visibility
- [ ] Verify a share URL is generated and copyable
- [ ] Open the share URL in a new incognito/private browser window
- [ ] Verify the animation loads at `/share/{id}`
- [ ] Verify the floating playback remote is visible
- [ ] Press Play — verify frames advance correctly
- [ ] Verify no edit controls are visible to the unauthenticated viewer
- [ ] **[SKIP — EDITOR-019]** Attempt to re-open animation in editor to edit frames directly from My Playbook — this path does not yet exist

### Known Gaps

- **EDITOR-019**: Frame editing of saved animations is not implemented. The Edit button opens metadata only. To edit frames, a user must currently use Workflow 3 (Remix), which creates a new animation rather than overwriting the original. **Spec 020 will address this.**

---

## Workflow 2: Share & Replay

A coach shares an animation with players. Players view it without an account.

### Narrative (coach-readable)

1. From My Playbook (`/my-gallery`), find the animation to share.
2. Click **Share** on the animation card.
3. Choose visibility — **link-only** (private, anyone with the URL) or **public gallery** (listed at `/gallery` for discovery).
4. Copy the generated share URL.
5. Send the URL to players (message, email, team app).
6. Players open the link on any device — no account required.
7. The animation plays in a full-screen view with a floating remote control (play, pause, prev/next frame, prev/next progression if applicable).
8. Coaching notes are accessible via the info overlay in the playback controls.

### Test Checklist (agent-executable)

**Preconditions**: At least one saved animation in My Playbook. Dev server running at `localhost:3000`.

- [ ] Navigate to `/my-gallery`
- [ ] Click Share on an existing animation card
- [ ] Verify a modal or sheet appears with visibility options
- [ ] Select `link-only` visibility
- [ ] Verify a share URL is generated (format: `/share/{id}` or full URL)
- [ ] Copy the share URL
- [ ] Open the URL in an incognito/private browser window (simulating unauthenticated player)
- [ ] Verify the page loads at `/share/{id}` in full-screen layout
- [ ] Verify the animation title is visible
- [ ] Verify the floating remote control is present
- [ ] Click Play — verify frames advance in sequence
- [ ] Verify no editor, save, or My Playbook controls are visible to the unauthenticated user
- [ ] If the animation has coaching notes: verify the info/notes overlay is accessible
- [ ] If the animation has progressions: verify prev/next progression navigation is present and functional

### Known Gaps

None. Share & Replay is fully implemented.

---

## Workflow 3: Remix & Personalise

A user (or the original creator) takes an existing public animation and adapts it into their own playbook as a new animation. This does **not** overwrite the original.

### Narrative (coach-readable)

1. Browse the public gallery at `/gallery` — available to all visitors, no account required to browse.
2. Find an animation to adapt.
3. Click **Remix** on the animation card.
4. The editor opens with the animation's frames pre-loaded.
5. Modify the drill — move players, change positions, add or remove frames.
6. Click Save to Cloud. This creates a **new animation** in your own My Playbook. The original is unchanged.

Note: Remix is for creating a personalised copy or an alternative version. It is not the same as editing your own saved animation — that is Workflow 1 Step 5 (EDITOR-019, pending spec 020).

### Test Checklist (agent-executable)

**Preconditions**: At least one public animation in the gallery. Dev server running at `localhost:3000`.

- [ ] Navigate to `/gallery` (can be unauthenticated for browsing, must sign in to remix)
- [ ] Locate a public animation card
- [ ] Click **Remix**
- [ ] If not authenticated, verify redirect to sign-in and return after login
- [ ] Verify the editor opens at `/app?load={id}` with the animation frames pre-loaded
- [ ] Verify player positions and frame count match the original animation
- [ ] Modify at least one frame (move a player or add an entity)
- [ ] Click Save to Cloud
- [ ] Verify a new animation is created (new ID) with a prompt or default title
- [ ] Navigate to `/my-gallery` — verify the remixed animation appears as a new card
- [ ] Navigate to `/gallery` — verify the **original animation is unchanged**

### Known Gaps

None. Remix is fully implemented.

---

## Appendix: Session Prompts

### Initiate frame-edit spec (spec 020)

Copy and paste into a new session to begin specifying the missing Workflow 1 Step 5:

```
/speckit.specify

Feature: Direct frame editing of own saved animations

A user should be able to open any animation they own in the editor,
modify its frames, and save changes back to the original record
(overwrite, not remix). This is the missing step in the core coaching
loop (Workflow 1, Step 5 in docs/authority/USER-WORKFLOWS.md).

Context:
- Current state: EditMetadataModal handles metadata only; no frame-edit path exists
- Remix path (?load={id}) creates a new animation — does not overwrite original
- Spec 011-workflow-clarity was never fully implemented (zero tasks)
- This should likely be spec 020 or a substantive revision of spec 011

Key questions for the spec:
- Should "Open in Editor" appear in My Playbook alongside Edit/Share?
- On save from editor, should it prompt "overwrite original" vs "save as new"?
- How does this interact with shared/public animations? (Editing a shared
  animation should invalidate or update the share link — needs a decision)
- Animation quota (50 per user): overwrite does not consume quota; save-as-new does
```
