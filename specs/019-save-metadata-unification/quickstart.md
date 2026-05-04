# Quickstart: Save & Metadata Unification

**Feature**: 019-save-metadata-unification  
**Date**: 2026-05-04

---

## Prerequisites

- Dev server running: `npm run dev`
- Authenticated as a test user with at least one saved animation

---

## Test Flows

### Flow 1 — Stored metadata appears in Edit modal

1. Open `/app` and save an animation via Save to Cloud with:
   - Description: "Lineout variation — backs move right"
   - Coaching Notes: "Tell players to hold width"
   - Tags: "lineout, set-piece"
2. Navigate to `/my-gallery`
3. Click **Edit** on the animation card
4. **Assert**: Description field shows "Lineout variation — backs move right"
5. **Assert**: Coaching Notes field shows "Tell players to hold width"
6. **Assert**: Tags field shows "lineout, set-piece"
7. **Assert**: YouTube URL field is empty (not "null")

### Flow 2 — Edit tags and YouTube URL, verify persistence

1. In the Edit modal from Flow 1, change Tags to "lineout, rucks, backs"
2. Add YouTube URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
3. Click **Save Changes**
4. **Assert**: Modal closes, card in My Playbook updates immediately (no page reload)
5. Click **Edit** again on the same card
6. **Assert**: Tags field shows "lineout, rucks, backs"
7. **Assert**: YouTube URL field shows `https://www.youtube.com/watch?v=dQw4w9WgXcQ`

### Flow 3 — Invalid YouTube URL blocked

1. Open Edit modal
2. Enter YouTube URL: `https://vimeo.com/123456`
3. Click **Save Changes**
4. **Assert**: Inline error appears: "Please enter a valid YouTube URL..."
5. **Assert**: Form does NOT submit (modal stays open)

### Flow 4 — Clear YouTube URL

1. Open Edit modal for an animation with a stored YouTube URL
2. Clear the YouTube URL field
3. Click **Save Changes**
4. Reopen Edit modal
5. **Assert**: YouTube URL field is empty

### Flow 5 — Editor sidebar has no Metadata button

1. Open `/app`
2. Inspect the left sidebar
3. **Assert**: No "Edit Metadata" button or "Metadata" section is visible

### Flow 6 — Description max 2000 chars

1. Open Edit modal
2. Paste 2001 characters into the Description field
3. **Assert**: Input is capped at 2000 characters (character counter shows "2000/2000")

### Flow 7 — PUT failure shows toast, modal stays open

1. Open Edit modal
2. Simulate network failure (DevTools → Network → Offline)
3. Click **Save Changes**
4. **Assert**: Toast error appears
5. **Assert**: Modal remains open with all form data intact
6. Re-enable network, click **Save Changes** again
7. **Assert**: Save succeeds

---

## Lint & Type Check

```bash
npm run lint && npx tsc --noEmit
```

Both must pass with zero new errors.
