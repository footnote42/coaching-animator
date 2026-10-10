# Coaching Animator — User Guide

This guide matches the in-app Help (`/help`) and How-to (`/help/how-to`). The app is the source of truth.

## What is Coaching Animator?

A browser tool for rugby coaches. You draw a Practice on an Area, animate it, build it up with Progressions, and share a link with players and co-coaches. Viewers need no account.

## 1. Try it, then sign in

- **Create** (`/practice`) works without an account. A Guest's Practice stays on their device.
- **Share** and **Publish** need an account. Sign in at `/login` with Google or an email and password, or create an account at `/register`. A Practice kept on the device can then be saved to your account.

## 2. Draw the base Step

1. Go to **Create**.
2. Choose an **Area** template (square, horizontal or vertical rectangle, half pitch, full pitch). Set its size in metres.
3. Pick a marker (attacker, defender, ball, cone, tackle shield, tackle bag, coach) and tap the Area to place it. Markers snap to the grid.
4. **Select and drag** moves a marker. **Undo** (Ctrl+Z) and **Redo** (Ctrl+Shift+Z) are in the toolbar.

## 3. Runs and passes

- **Draw a run**: tap a player, then tap cells to draw the path. Select the player to set the **Pace** (walk, jog or sprint).
- **Add a pass**: tap the player with the ball, then the receiver. The receiver is timed to meet the ball: slowed if they would be early, and if they would be late the pass goes later.
- **Play** under the Area runs the Step. **Back to start** resets it. **Ghost mode** shows where markers started.

## 4. Progressions

Choose **Add Progression**, then, if you like, pick the STEP lever it changes: Space, Time, Equipment or People (or leave it blank). Change the new Step and add a coaching point saying why it is harder. A Progression stores only its change, so edits to an earlier Step carry forward. Coaching points are shown as Commentary.

## 5. Save

Give the Practice a title, optionally a description, then choose **Save**. Opening a saved Practice shows **Save changes**.

- **Tags**: pick up to five from the fixed list. Viewers filter the Gallery by Tag.
- **Source**: a link (https only) and an optional title for the video or page the Practice is based on. Viewers see **Watch the original**.
- **Visibility**: Private, Anyone with the link, or Public. Public Practices appear in the Gallery; do not name or identify players.

Saved Practices are listed in **My Practices** (`/my-practices`), where you can open, change visibility, or delete them.

## 6. Share view

A shared link (`/p/[id]`) opens the share view. It has:

- **Play all Steps**, **Previous Step**, **Next Step**, and a **Speed** control.
- **Show Commentary** / **Hide Commentary** for the coaching points.
- **Full screen**, where the device supports it.
- **Share**, using the device share sheet or copying the link.
- **Report**, for Practices that should not be public.
- **More options**, then **Copy script**, to copy the Practice Script.

## 7. Gallery

`/gallery` lists public Practices. Search by title, filter by **Tag**, and hover (or tap) a card to preview it. Open a card to watch it.

## 8. Using an AI

- Paste a Practice Script into the editor. The guide at `/practice-script/v1/guide` has the rules and a prompt to copy. **Ask your AI to change this** copies your Practice with that prompt.
- To let an AI save Practices to your account, create a personal token on **Profile** (`/profile`) and copy the setup shown after creating it. The endpoint is `/api/mcp`.
- The skill is at https://github.com/footnote42/coaching-animator/tree/main/skill/coaching-animator. Everything it saves is private until you publish it.

## 9. Feedback

Use `/feedback` to tell us what works, what is missing and what breaks.
