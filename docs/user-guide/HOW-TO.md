# Coaching Animator — User Guide

**Version**: 1.0  
**Audience**: Rugby coaches and players  
**Last updated**: 2026-05-17

---

## What is Coaching Animator?

Coaching Animator is a browser-based tool for rugby coaches. You draw tactical drills on a pitch, animate player and entity movement across frames, and share a link with your squad. Players open the link on any device — no account, no download.

---

## 1. Getting Started

### Guest vs. Authenticated

| | Guest | Authenticated Coach |
|---|---|---|
| Create animations | Yes (up to 10 frames) | Yes (unlimited frames) |
| Save to cloud | No | Yes |
| Share with players | No | Yes |
| My Playbook | No | Yes |
| Public gallery | Browse only | Browse, upvote, remix |

### Signing Up

1. Click **Log In** in the top navigation.
2. Choose **Google**, **Apple**, or **GitHub** — whichever you prefer.
3. On your first sign-in, a profile row is created automatically.
4. You are now a Tier 1 coach — cloud saves, sharing, and My Playbook are all unlocked.

### Signing In

Click **Log In** at any time. Your session persists across browser sessions — you rarely need to sign in again on the same device.

---

## 2. Creating Your First Animation

1. Navigate to **/app** (the editor). The rugby pitch canvas fills the screen.
2. In the toolbar, choose the entity type you want to place:
   - **Attack player** (red) — attacking team
   - **Defence player** (blue) — defending team
   - **Cone** (yellow) — marker, gate, or reference point
   - **Ball** (white) — the ball
3. Click on the pitch to place the entity.
4. **Drag** any entity to reposition it.
5. Right-click an entity to open the context menu: **Duplicate**, **Delete**, **Bring Forward**, or **Send Backward**.
6. Give your animation a name when you save (see Section 5).

**Tip**: Place all entities in their starting positions on Frame 1 before adding more frames.

---

## 3. Working with Frames

Frames are the building blocks of animation. Each frame is a snapshot of entity positions. Playing the animation steps through frames in sequence.

### Adding a Frame

Click the **+ Frame** button in the timeline panel (bottom of the screen). A new frame is added after the current frame.

### Navigating Frames

- Click a frame in the timeline strip to jump to it.
- Use the **Previous / Next** arrows in the timeline to step through frames one at a time.

### Animating Movement

1. Go to Frame 1. Position your players.
2. Add Frame 2. Move players to their next positions.
3. Repeat for as many steps as the drill needs.
4. Press **Play** in the timeline to preview the movement sequence.

### Deleting a Frame

Select the frame in the timeline strip, then click the delete icon. The animation shifts remaining frames to fill the gap.

### Frame Limits

- **Guest (no account)**: Maximum 10 frames per animation. No cloud save.
- **Authenticated coach**: No frame limit.

---

## 4. Editor Controls Reference

### Timeline Panel

The timeline panel runs along the bottom of the editor. It contains:

| Control | Purpose |
|---|---|
| Frame strip | Thumbnail row of all frames; click to navigate |
| + Frame | Add a new frame after the current one |
| Play / Pause | Preview the animation |
| Previous / Next | Step through frames |

### Entity Context Menu

Right-click any entity on the pitch to open the context menu:

| Action | Description |
|---|---|
| Bring Forward | Raise this entity one step within its type group |
| Send Backward | Lower this entity one step within its type group |
| Duplicate | Copy the entity at the same position |
| Delete | Remove the entity from the current frame and all frames |

**Layering note**: Cones always render below players; players always render below the ball. Bring Forward / Send Backward adjusts order within each type group only (e.g., player over player). Cross-type ordering cannot be changed.

### Snap to Grid

Toggle **Snap to Grid** in the toolbar to constrain entity movement to grid lines. Useful for precise alignment. Toggle it off for free-form placement.

---

## 5. Saving and Managing Animations

### Save to Cloud

1. Click **Save to Cloud** in the editor toolbar.
2. A metadata form appears on first save:
   - **Title** (required) — short name for the drill
   - **Description** (optional) — context for the drill
   - **Coaching Points** (optional) — delivery notes visible to players in the share view
   - **Tags** (optional) — searchable labels (e.g., `lineout`, `tackling`, `defence`)
3. Click **Save**.
4. A confirmation message appears. The animation is now in your Playbook.

### Overwrite vs. Save as New

When editing an animation you have already saved:

- **Overwrite Original** — updates the existing animation in place. Use this for iterative refinements.
- **Save as New** — creates a separate copy. Use this to branch a variation without affecting the original.

### My Playbook (My Gallery)

Navigate to **/my-gallery** to see all your saved animations. Each card shows:

- Title and description
- **Edit Info** (settings icon) — update title, description, coaching points, tags
- **Edit Frames** (pencil icon) — open the editor with existing frames loaded
- **Share** — generate a share link
- **More** — delete the animation, add a progression, or link to a Foundation

---

## 6. Sharing with Players

### Generate a Share Link

1. From **My Playbook**, find the animation you want to share.
2. Click **Share** on the animation card.
3. Choose visibility:
   - **Link-only** — anyone with the URL can view it; not publicly listed
   - **Public gallery** — listed at `/gallery` for any visitor to discover
4. Copy the generated URL (format: `https://yourdomain.com/share/{id}`).
5. Send it to your players via message, email, or team app.

### Sharing from the Editor

After saving to cloud, click the **Share** button in the editor toolbar. On desktop, the link is copied to your clipboard. On mobile, the native share sheet opens (supports WhatsApp, Messages, etc.).

### What Players See

Players open the share link in any browser — no account required. They see:

- The animation title
- The full-screen pitch canvas
- Floating playback controls (play, pause, prev/next frame)
- **Notes** button — reveals your Coaching Points (only shown if you added coaching points)
- A subtle "Built with Coaching Animator" link back to the site

They cannot edit, delete, or save anything.

---

## 7. Watching Replays

The share view (`/share/{id}`) is the primary viewing experience for players.

### Playback Controls

The floating remote is always visible on screen — players never need to scroll to find it.

| Control | Action |
|---|---|
| Play | Advance frames automatically |
| Pause | Stop on the current frame |
| Previous frame | Step back one frame |
| Next frame | Step forward one frame |
| Notes | Open the Coaching Points overlay (if set) |

### Replay View

The `/replay/{id}` route is a secondary viewing surface with the same controls. Coaches may use this route when reviewing their own animations in a layout that preserves more screen context.

### Progression Navigation

If an animation is part of a progression set, the share view adds:

| Control | Action |
|---|---|
| Previous drill | Navigate to the Foundation or previous Progression |
| Next drill | Navigate to the next Progression in the set |

---

## 8. Public Gallery

Navigate to **/gallery** to browse community animations — no account required.

- **Play** — open the animation in the share view
- **Share** — copy a share link for the animation
- **Upvote** — like an animation (requires sign-in)
- **Remix** — open the animation in your editor as a starting point (requires sign-in)

Animations marked **Public** by their creator appear here. **Link-only** animations are not listed.

Progression animations are not listed as standalone cards. They are accessible from their parent Foundation card (which shows a progression count badge).

---

## 9. Progressions

A progression is a linked variation of an existing animation. Use progressions to build a multi-part drill set — Foundation first, then increasingly complex variations.

### Creating a Progression

**From My Playbook**:
1. Find the animation you want to build on (the Foundation).
2. Click **More** on its card.
3. Select **Add Progression**.
4. The editor opens pre-linked to that Foundation.
5. Build the drill variation and click **Save to Cloud**.
6. The animation saves as **{Foundation Title} — Progression 1** (or the next available number). You can edit the title before saving.

**From the editor save flow**:
1. Click **Save to Cloud**.
2. Select **Save as Progression**.
3. Choose a Foundation animation from your Playbook.
4. Enter a title (or accept the auto-generated one) and save.

### Viewing Progressions in My Playbook

Your Foundation card displays a horizontal strip of its Progressions beneath it. Each Progression in the strip has its own Edit, Rename, and Unlink actions.

### Unlinking a Progression

Click **Unlink** on a Progression in the strip to detach it from its Foundation. It becomes a standalone animation in your Playbook. If it was public, it becomes a standalone public gallery card.

### Navigating a Progression Set (Share View)

When a player opens a share link for any animation in a set (Foundation or Progression), they see the full navigation set — Foundation → Progression 1 → Progression 2 → … — and can step through the entire drill series without needing a new link for each part.

---

## 10. Guest Mode Limits

If you use the editor without signing in:

- You can build an animation with **up to 10 frames**.
- No cloud save — your work is lost on page reload.
- No share link — sharing requires a saved animation.
- You can **export JSON** (download the animation data locally) as a workaround.

To remove these limits, sign in with Google, Apple, or GitHub. It takes under a minute.

---

## 11. Profile and Account

Navigate to **/profile** (your name in the nav, or via the account menu).

### Coach Identity

The profile page leads with your coaching identity:

- **Display name** — editable. Defaults to the name from your sign-in provider (Google, Apple, or GitHub), but you can set any name you prefer.
- **Club name** — free text. Enter your club or academy name.

Click **Save** to persist changes. The update takes effect immediately.

### Account Settings

Below the identity section:

- **Email** — your registered email address (read-only; managed by your sign-in provider)
- **Password change** — available if you signed in with email/password; not applicable for OAuth sign-ins

### Signing Out

Click **Sign out** at the bottom of the profile page or via the account menu in the navigation.

---

## Quick Reference

| Task | How |
|---|---|
| Open the editor | Navigate to `/app` |
| Add an entity | Select type in toolbar, click pitch |
| Move an entity | Drag it |
| Delete an entity | Right-click → Delete |
| Add a frame | Click + Frame in timeline |
| Save animation | Click Save to Cloud, fill form |
| Share an animation | My Playbook → Share → copy URL |
| Watch as a player | Open the share link in any browser |
| View my animations | Navigate to `/my-gallery` |
| Browse public drills | Navigate to `/gallery` |
| Read the progressions guide | Navigate to `/help/progressions` |
