# Quickstart: Auth & Profile (Phase 2g)

**Branch**: `010-auth-profile` | **Date**: 2026-04-27

---

## Overview

Phase 2g is a visual-only redesign of `/profile`. The goal is to make the profile page feel like a coach's identity card rather than a settings form. All data and API infrastructure is already in place.

---

## Manual Test Checklist

### Prerequisites

```bash
npm run dev      # Dev server on localhost:3000
```

Log in as a test user (email/password or Google OAuth).

---

### Test 1 — Profile Identity Card (P1)

1. Navigate to `localhost:3000/profile`
2. **Confirm**: Page opens with the coach's `display_name` (or "Add your name" prompt if not set) as the dominant visual element — not a form heading
3. **Confirm**: `club_name` appears beneath the name as a subtitle/tagline (or "Add your club" prompt if not set)
4. **Confirm**: Profile avatar is visible — either the OAuth provider's photo or an initials circle
5. **Confirm**: The page heading is NOT "Profile Settings"

---

### Test 2 — Editing Identity Fields

1. Edit the display name field
2. Edit the club name field
3. Click Save
4. **Confirm**: Both values update in the identity card section immediately (no reload)
5. **Confirm**: Refresh the page — updated values persist

---

### Test 3 — Account Settings Are Secondary

1. Scroll through the profile page
2. **Confirm**: The connected accounts section (Google + password) is below the identity and branding sections, under a clear "Account Settings" divider
3. **Confirm**: It is accessible but does not visually dominate the page

---

### Test 4 — Empty State Prompts

1. Clear `display_name` and save (empty string / null)
2. Clear `club_name` and save
3. **Confirm**: Profile page shows friendly prompts ("Add your name", "Add your club") rather than blank inputs

---

### Test 5 — Mobile Layout

1. Open DevTools → set viewport to 375px wide
2. **Confirm**: Profile page uses single-column layout throughout — no side-by-side form columns
3. **Confirm**: All inputs and buttons are accessible without horizontal scroll

---

### Test 6 — Error Handling

1. Disconnect network (DevTools → Network → Offline)
2. Fill in display name and click Save
3. **Confirm**: An inline error message appears adjacent to the save action
4. **Confirm**: No silent failure or toast notification

---

### Test 7 — Contrast (WCAG AA)

1. Inspect the profile avatar (initials circle)
2. **Confirm**: Text contrast between initials and background is ≥ 4.5:1
3. Inspect any new text elements added in the identity card section
4. **Confirm**: All pass 4.5:1 minimum

---

### Test 8 — Existing Functionality Preserved

1. Upload a club badge image
2. Change primary and secondary strip colors
3. Verify the usage meter (animation count / max) still renders
4. Verify Quick Links (My Playbook, Public Gallery) are still accessible
5. Verify the Connected Accounts section (Google link/unlink, password) still works
6. **Confirm**: None of these features are broken by the layout restructure

---

## CI Gate

Before opening a PR:

```bash
npm run lint
npx tsc --noEmit
```

Both must pass with zero new errors.
