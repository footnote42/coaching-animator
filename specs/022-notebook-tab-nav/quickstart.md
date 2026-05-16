# Quickstart: Notebook Tab Navigation

**Feature**: 022-notebook-tab-nav
**Date**: 2026-05-16

---

## Prerequisites

1. Dev server running: `npm run dev` (port 3000)
2. Two browser sessions ready: one signed in, one in private/incognito (guest)

---

## Test A — Tab Visual Appearance (Desktop)

1. Open `http://localhost:3000` in a desktop browser (viewport ≥ 768px)
2. **Expected**: Nav bar has a dark cover background; Home tab is active (raised, teal, sheen visible); Gallery, Create tabs are visible but receded behind Home
3. Hover over an inactive tab — **Expected**: it lifts slightly (opacity increases)
4. Check for seam: inspect the bottom edge of the active tab — **Expected**: no visible border between tab base and page content
5. Check sheen: tilt screen or look at the tab surface — **Expected**: lighter top-left, darker bottom-right diagonal highlight

---

## Test B — Tab Navigation & MRU Ordering

1. From Home, click Gallery — **Expected**: Gallery tab becomes active (amber, raised); Home tab drops back; layering order from front: Gallery → Home → Create
2. Click Create — **Expected**: Create tab becomes active (navy, raised); layering from front: Create → Gallery → Home
3. Click My Playbook (if signed in) — **Expected**: My Playbook tab becomes active (pitch green, raised); layering from front: My Playbook → Create → Gallery → Home
4. Refresh the page — **Expected**: My Playbook tab is still active; stacking order preserved (MRU order same as before refresh)

---

## Test C — Guest (Unauthenticated) View

1. Open a private/incognito browser window to `http://localhost:3000`
2. **Expected**: 3 tabs visible: Home, Gallery, Create; My Playbook tab is absent entirely (not greyed out)
3. Navigate through the 3 visible tabs — **Expected**: MRU layering works with 3 tabs

---

## Test D — Mobile View

1. On the dev server, open browser DevTools and set viewport to 375px wide
2. **Expected**: Tab shapes are not visible; hamburger icon is shown
3. Tap the hamburger — **Expected**: Dropdown opens; each section entry has a 4px coloured bar on the left (teal for Home, amber for Gallery, pitch green for My Playbook if authenticated, navy for Create)
4. Tap a section — **Expected**: Navigate to that section; dropdown closes

---

## Test E — localStorage Fallback

1. Open DevTools → Application → Storage → Local Storage → `http://localhost:3000`
2. Delete the `nav_mru_v1` key
3. Refresh — **Expected**: Tabs layer left-to-right front-to-back (Create frontmost of inactive, then My Playbook, then Gallery, Home active as root)

   Wait — on first visit to `/` with no history, Home is active. Inactive tabs are in default left-to-right order: Gallery frontmost of inactive (index 1), then My Playbook, then Create at back.

4. Set `nav_mru_v1` to an invalid value (e.g. `"broken"`) in DevTools
5. Refresh — **Expected**: Page renders without error; default tab order used

---

## Test F — Page Background Textures

1. Visit `http://localhost:3000` — **Expected**: Faint horizontal ruled lines in page background
2. Visit `/gallery` — **Expected**: Subtle large graph-paper grid in page background; no texture on nav bar itself
3. Visit `/my-gallery` (sign in required) — **Expected**: Subtle small graph-paper grid (tighter than Gallery)
4. Visit `/app` — **Expected**: No texture; clean editor background as before
5. In all cases: **Expected**: Texture does not reduce readability of page text or UI

---

## Test G — Existing Functionality Regression

1. Visit `/app` and create an animation — editor works normally
2. Visit `/gallery` — gallery loads, animations display correctly
3. Share link opens at `/share/[id]` — **Expected**: Navigation does not render on share route (as before)
4. Sign out via profile chip and back in — auth state changes correctly
5. Admin link still appears in mobile menu for admin users (not a tab)

---

## Pass Criteria

All of the following must be true:

- [ ] Tab shapes visible on desktop; hamburger on mobile (≤ 768px)
- [ ] Active tab has no visible seam with page body
- [ ] Each section tab shows its assigned colour
- [ ] MRU layering order updates correctly after navigation
- [ ] MRU order persists across refresh
- [ ] My Playbook tab absent for guest users
- [ ] Mobile dropdown entries have correct colour bars
- [ ] localStorage fallback works silently
- [ ] Page textures render on Home, Gallery, My Playbook; none on Create
- [ ] No regressions in editor, gallery, share, auth flows
- [ ] `npm run lint && npx tsc --noEmit` passes with zero new errors
