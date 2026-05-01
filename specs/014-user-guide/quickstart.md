# Quickstart: Manual Test Guide — User Guide (Phase 2k)

**Branch**: `014-user-guide`
**Prereq**: `npm run dev` running at `localhost:3000`

---

## 1. Onboarding card — first visit

1. Open an incognito/private browser window
2. Navigate to `http://localhost:3000/app`
3. **Expect**: A card appears in the bottom-right corner of the editor. It is not a modal — the canvas and sidebar are visible and interactive behind it.
4. Read the card content: three coaching steps, no emojis, no rounded corners
5. Click "Got it"
6. **Expect**: Card disappears. Editor is fully usable.
7. Refresh the page
8. **Expect**: Card does NOT reappear

---

## 2. Help icon re-opens onboarding

1. (Continue from step 8 above — card has been dismissed)
2. In the editor sidebar (desktop), locate the "How it works" button at the bottom of the sidebar panel
3. Click it
4. **Expect**: Onboarding card reappears in the bottom-right corner
5. Dismiss again — editor returns to normal

---

## 3. Navigation "?" icon

1. From any page (landing `/`, gallery `/gallery`, my-gallery `/my-gallery`, profile `/profile`)
2. Locate the `?` icon in the top navigation bar (desktop) or the "Help" link in the mobile menu
3. Click it
4. **Expect**: Navigates to `/help`
5. `/help` loads without requiring sign-in (test in incognito)

---

## 4. Help page content

1. Navigate to `http://localhost:3000/help`
2. **Expect**: Page loads (HTTP 200, no auth redirect)
3. Verify all four sections exist: core workflow, what's on the pitch, sharing, coaching framework
4. Locate the "Coaching Guide" / "What is APES?" link and click it
5. **Expect**: Navigates to `/help/coaching`

---

## 5. Coaching page content

1. Navigate to `http://localhost:3000/help/coaching`
2. **Expect**: Page loads without sign-in
3. Verify APES is explained (Active, Purposeful, Enjoyable, Safe)
4. Verify a link to the gallery exists
5. Verify a "← Back to Help" link exists and navigates to `/help`

---

## 6. Footer

1. Navigate to `/gallery`
2. Scroll to the bottom of the page
3. **Expect**: Footer is visible with links including "Help", "Coaching Guide", "Contact", "Terms", "Privacy", "Sitemap"
4. Navigate to `/app` (editor)
5. **Expect**: Footer is NOT visible (editor is full-height, no footer)
6. Navigate to `/share/{any-valid-id}`
7. **Expect**: Footer is NOT visible (share view suppresses all chrome)

---

## 7. Style check (impeccable.md compliance)

1. Inspect the onboarding card: zero border radius on card and button
2. Inspect the help pages: no rounded cards or buttons; no emojis in content
3. Inspect the footer: no rounded corners

---

## 8. Guest (Tier 0) verification

1. In incognito, do NOT sign in
2. Complete steps 1–6 above
3. **Expect**: All surfaces work identically to authenticated state
