# Quickstart — Manual Test Guide: Workflow Clarity (Phase 2h)

**Branch**: `011-workflow-clarity`  
**Server**: `npm run dev` (localhost:3000)  
**Auth required**: Yes (for editor share test)

---

## Test 1 — Share view back link

1. Open any `/share/{id}` URL directly (e.g. from a saved animation)
2. **Expect**: A "← Gallery" link visible at the bottom-left of the full-screen view
3. Click it → **Expect**: browser navigates to `/gallery`
4. Resize to 320px wide → **Expect**: link remains visible (arrow icon, text may hide on very small screens)

---

## Test 2 — My-Gallery Play button

1. Sign in and navigate to `/my-gallery`
2. Hover over any animation card thumbnail → Play overlay appears
3. Click the thumbnail
4. **Expect**: browser navigates to `/share/{id}` (full-screen replay, NOT the editor)
5. Confirm the Edit (Pencil) button in the card footer still opens the editor (`/app?load={id}`)

---

## Test 3 — Public gallery click navigation (regression)

1. Navigate to `/gallery` (no sign-in needed)
2. Click any animation card
3. **Expect**: browser navigates to `/share/{id}` (already worked pre-phase, verify not regressed)

---

## Test 4 — Editor share button (regression)

1. Sign in, open `/app`, create or load an animation, save to cloud
2. Click the Share Link button in the sidebar
3. On desktop: **Expect** modal opens with `/share/{id}` URL and Copy button
4. On mobile: **Expect** native Web Share sheet opens

---

## Pre-push gate

```bash
npm run lint && npx tsc --noEmit
npm test -- --run
```

Both must pass with zero new errors before opening a PR.
