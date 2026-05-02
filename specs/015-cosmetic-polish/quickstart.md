# Quickstart / Manual Test Guide: Phase 2l — Cosmetic Polish

**Branch**: `015-cosmetic-polish` | **Date**: 2026-05-01

## Prerequisites

```bash
npm run dev          # Start dev server on localhost:3000
# Supabase env vars must be set (see .env.local)
# Have at least one signed-in account with saved animations (public + private)
# Have at least one animation with progressions
```

---

## Workstream 1 — Landing Polish

**Route**: `/`

1. Open `localhost:3000` in a fresh (logged-out) browser tab.
2. **Hero background** (FR-017): Confirm a tactical-ball SVG is visible in the hero section. It should look hand-drawn (marker stroke style), pitch-green outline, amber markings. Should NOT cover foreground copy.
3. **Section 2 card 2** (FR-018): Read the copy. Confirm no reference to "code" or developer concepts.
4. **Section 2 card 4** (FR-019): Read the copy. Confirm no reference to export/GIF/WebM. Confirm the 4-card grid is preserved.
5. **Section 3 card 1** (FR-020): Confirm it says something about clicking to place entities (from palette), then dragging to reposition — not an ambiguous "drag?" label.
6. **Section 3 card 3** (FR-021): Confirm no GIF export claim.
7. **Footer** (FR-022): Scroll to bottom. Confirm the footer does not repeat the same links from the section directly above it.
8. **Reduced motion** (FR-026): Add `prefers-reduced-motion: reduce` in browser DevTools → verify no hero animations play.
9. **Mobile** (< 480 px): Resize to 375 px width. Confirm tactical-ball SVG reduces opacity/scale gracefully.

---

## Workstream 2 — Gallery / Playbook Parity

### My Playbook (`/my-gallery`)

1. Sign in and navigate to `localhost:3000/my-gallery`.
2. **Page banner** (FR-011): Confirm a titled page banner ("My Playbook") is visible above the card grid, styled differently from `/gallery`.
3. **Visual distinction** (FR-011): Compare side-by-side with `/gallery`. Each must have a different banner title + subtle background tone. You must be able to tell which page you're on without reading the URL.
4. **Search/filter** (FR-007): Type part of an animation title in the search input. Cards should filter in real time.
5. **Card parity** (FR-008): Confirm cards show a mini-pitch tactical preview and progression strip (on animations that have progressions).
6. **Card actions** (FR-009): Confirm each card has clearly labelled Edit, Replay, and Share actions (text or icon+label — not hidden).
7. **Private animation** (FR-010): Click a private animation. It should open without a 403/404 or "not available" message.
8. **Empty state**: Clear the search to show all animations. Delete all (or use an account with no animations). Confirm the search input remains visible and no crash occurs.

### Public Gallery (`/gallery`)

1. Navigate to `localhost:3000/gallery`.
2. **Play action** (FR-003): Click the Play button on any animation card. Confirm the browser navigates to `/share/{id}` — NOT `/replay/{id}`.
3. **Hover consistency** (FR-012): Hover Share, Remix, Play. Confirm all use the same hover feedback (colour/tone change).
4. **Card layout stability** (FR-013): Find a card with tags + progression count and one without. Confirm they occupy similar vertical footprints and the grid does not jump.
5. **MiniPitchSVG colours** (FR-014): Inspect a card thumbnail. Field should be rugby green, player tokens red (attack) / blue (defence), cones hi-vis yellow.
6. **RFU badge** (FR-015): Find or create an animation with `endorsed_by` set. Confirm the Hampshire RFU badge renders as a compressed image.
7. **Templates filter** (FR-016): Toggle the templates filter. Confirm it filters correctly and no regression from the architecture refactor (create a template, filter it, remix it — full flow).

---

## Workstream 3 — Share-Flow Clarity

### Editor share button (`/app`)

1. Open `localhost:3000/app`. Save an animation (or use an existing draft).
2. **Share button** (FR-001): Click Share. Confirm a modal/sheet opens — NOT "not available in development".
3. **Share URL**: Confirm the modal shows the `/share/{id}` link.
4. **Copy-to-clipboard** (FR-001): Click the copy button. Paste into address bar. Confirm URL is `/share/{id}`.
5. **Web Share API on mobile** (FR-002): Simulate mobile in DevTools → click Share → confirm system share sheet triggers (or clipboard fallback on browsers without support).

### Gallery share from card (`/gallery`)

1. Navigate to `/gallery`. Find an animation card.
2. **Share from card** (GALLERY-002): Click the Share action on the card. Confirm same share-sheet behaviour as editor (URL, copy, Web Share on mobile).

### Share view (`/share/{id}`)

1. Navigate directly to `/share/{some-animation-id}`.
2. **Animation title** (FR-004): Confirm title is visible at the **top-left** of the chrome layer (above canvas). Uses `font-heading`, truncates if long.
3. **Attribution link** (FR-005): Confirm "powered by Coaching Animator" (or similar) is at the **bottom-right** of the chrome. Clicking returns to `/` (landing page).
4. **Canvas sizing** (CV-002): Confirm canvas dimensions are unchanged — title and attribution are in the chrome overlay, not shifting the canvas.
5. **Back button — guest** (FR-006): Sign out. Visit `/share/{id}`. Back button → `/gallery`.
6. **Back button — owner** (FR-006): Sign in as the animation owner. Visit `/share/{id}`. Back button → `/my-gallery`.
7. **Back button — non-owner** (FR-006): Sign in as a different user. Visit `/share/{id}`. Back button → `/gallery`.
8. **Long title** (edge case): Use an animation with a very long title. Confirm truncation/wrap without breaking layout.

---

## Workstream 4 — Header / Profile Context

### Header auth state (`any page`)

1. Sign out. Visit `localhost:3000/`. Confirm a **Login** action (or equivalent) is visible in the header without opening any menu.
2. Sign in. Visit any page. Confirm a **profile chip** (initial or named control) is persistently visible in the header without opening any menu.

### Profile page (`/profile`)

1. Sign in. Navigate to `localhost:3000/profile`.
2. **Composition** (FR-024): Confirm the page feels like a coach identity card — clear heading hierarchy, sectioned layout. Not a flat bare form.
3. **No new fields**: Confirm no Club or Region fields are present (deferred to Phase 4).

---

## Workstream 5 — Impeccable Audit Pass

After completing workstreams 1–4:

1. Run the impeccable audit: `/impeccable:audit` (or equivalent audit-2026-04-24 framework).
2. Confirm **re-score ≥ 18/20** (SC-010).
3. Verify P1 items on touched surfaces:
   - No `rounded-*` on new buttons/badges/banners (check browser DevTools computed styles)
   - No `bg-white` on editor (`/app`) or share (`/share/[id]`) surfaces
   - `font-heading` applied to: share-view title, page banners, profile heading, rewritten landing card titles

---

## CI Verification (Pre-Push)

```bash
npm run lint             # ESLint — must pass
npx tsc --noEmit         # TypeScript — must pass
npm test -- --run        # Unit tests — must pass
npm run e2e              # E2E Playwright — must pass (requires dev server)
```

### RFU Badge Size Gate

```bash
ls -la public/assets/hampshire-rfu-badge.*    # Must be < 50 KB (51200 bytes)
```

---

## Known Risks

| Risk | Mitigation |
|------|-----------|
| ShareViewer chrome change breaks canvas sizing | CV-002: title/attribution in chrome layer only; `useShareCanvasSize` hook must not be modified |
| AnimationCard parity breaks existing Playbook behaviour | Test private-open (FR-010), search, and action buttons after changes |
| MiniPitchSVG colour change looks wrong | Compare against EntityColors defaults and editor rendering |
| Templates filter regression (GALLERY-003) | Full E2E: create template → verify filter → remix |
| `bg-white` or `rounded-*` introduced accidentally | Run impeccable audit before marking WS5 complete |
