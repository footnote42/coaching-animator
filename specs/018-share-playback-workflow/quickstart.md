# Quickstart: Phase 2c — Share & Playback Workflow

**Date**: 2026-05-03
**Feature**: `specs/018-share-playback-workflow/spec.md`

Manual test checklist to verify the feature after implementation. Run against `localhost:3000` with `npm run dev`.

---

## Prerequisites

- Dev server running: `npm run dev`
- Logged-in user with at least two animations saved to the cloud
- One animation with `coaching_notes` populated (edit directly in Supabase dashboard if needed)
- At least one animation with one or more progressions (create via the editor ProgressionPanel)

---

## 1 — Editor Share Button (US-1 / FR-001)

1. Navigate to `/app`
2. Open an existing saved animation (or create and save one)
3. Locate the Share button in the editor toolbar
4. Click Share
   - **Desktop**: Verify a `/share/{id}` link is copied to clipboard; a success toast appears
   - **Mobile** (375px viewport): Verify the native share sheet opens with the link pre-populated
5. Paste the link in a new tab — verify the share page loads correctly

**Unsaved state**:
6. Make a change to the animation without saving
7. Click Share — a save-first prompt must appear
8. Save and verify the share action completes after saving

---

## 2 — Gallery Play and Share Routing (US-2 / FR-003, FR-004)

1. Navigate to `/gallery`
2. Click any animation card — verify it navigates to `/share/{id}` (not `/replay/{id}`)
3. Click the Share button on any card — verify clipboard copy (desktop) or Web Share sheet (mobile)
4. Navigate to `/my-gallery` — verify Play/Share actions behave identically

---

## 3 — Share View: Title, Navigation, Footer, Back (US-3 / FR-005–008)

1. Open any `/share/{id}` for an animation **without** progressions:
   - Verify title is visible above canvas
   - Verify "powered by Coaching Animator" footer is visible bottom-right
   - Verify NO prev/next navigation controls appear
   - Verify back link bottom-left (owner → "My Playbook", guest → "Gallery")

2. Open `/share/{id}` for an animation that is a Foundation with at least 2 progressions:
   - Verify prev/next navigation controls appear
   - Click Next — verify navigation to the first Progression's `/share/{id}`
   - At first Progression: verify Prev goes back to Foundation, Next goes to Progression 2 (if exists)

3. Open `/share/{id}` while logged out (private window):
   - Verify "Gallery" back link (not "My Playbook") appears

---

## 4 — Coaching Notes in Save and Edit (US-4 / FR-009, FR-010)

1. Open the Save to Cloud modal (`/app` → Save button)
   - Verify a "Coaching Notes" textarea appears below the Description field
   - Enter coaching notes text, save

2. Navigate to `/my-gallery` → open the saved animation for editing
   - Verify the Coaching Notes field is pre-populated with the saved text
   - Modify the text, save

3. Re-open the edit modal — verify the updated text is shown

4. Clear the Coaching Notes field, save — verify it saves as empty/null (no crash)

---

## 5 — Coaching Notes Overlay in Playback Views (US-5 / FR-011)

1. Open `/share/{id}` for an animation **with** coaching notes:
   - Verify a "Notes" button/icon is visible
   - Tap/click Notes — verify a dismissible overlay appears with the coaching notes text
   - Verify the overlay does not obscure playback controls
   - Dismiss via close button or tap outside — verify overlay closes

2. Open `/share/{id}` for an animation **without** coaching notes:
   - Verify NO Notes button is rendered

3. Repeat steps 1–2 for `/replay/{id}`

---

## 6 — Progression Creation from My Playbook (US-6 / FR-013)

1. Navigate to `/my-gallery`
2. Open card actions on any Foundation animation
3. Verify "Add Progression" is listed as an option
4. Click "Add Progression" — verify the editor opens with the progression pre-linked to that parent (visible in the save modal: Foundation is pre-selected)
5. Build a simple animation, save — verify it is saved as a progression (check `/my-gallery` shows it in the ProgressionStrip under the parent, not as a standalone card)
6. Navigate to the public gallery — verify the new progression does NOT appear as a standalone card

---

## 7 — Save As Progression (US-6 / FR-014)

1. Navigate to `/app`, open an existing animation
2. Open the Save modal
3. Verify a "Save As Progression" option is available
4. Select it — verify a parent-picker appears listing the user's Foundation animations
5. Choose a parent Foundation
6. Verify the title auto-generates as "{Foundation Title} — Progression {n}" and is editable
7. Save — verify the animation is saved as a progression, not standalone

---

## 8 — Link to Foundation (US-6 / FR-019)

1. Navigate to `/my-gallery`
2. Open card actions on a **standalone** animation
3. Verify "Link to Foundation" is listed as an option
4. Click it — verify a modal appears to select a Foundation from the user's animations
5. Select a Foundation and confirm — verify the card moves from standalone to the Foundation's progression strip
6. Verify the original standalone card is no longer visible as top-level

---

## 9 — Unlink Progression (US-6 / FR-020)

1. Navigate to `/my-gallery`
2. Find a Foundation with progressions, open the ProgressionStrip
3. Open a progression's actions — verify "Unlink" is available
4. Click Unlink — verify the progression is removed from the strip and reappears as a standalone top-level card

---

## 10 — Floating Remote Always Visible (US-7 / FR-012)

1. Open `/share/{id}` at a 375×812px viewport (iPhone size)
2. Verify playback controls (FloatingRemote) are visible without scrolling
3. Scroll if the page allows — verify controls remain visible

---

## 11 — Regression Checks

Run after all changes:
```bash
npm run lint
npx tsc --noEmit
npm test -- --run
```

Open and smoke-test:
- `/app` — editor loads, canvas renders, toolbar visible
- `/replay/{id}` — animation plays, no console errors
- `/share/{id}` — animation plays, title visible, remote accessible
