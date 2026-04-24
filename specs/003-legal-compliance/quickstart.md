# Quickstart & Manual Test Guide: Legal & Compliance

**Feature**: Legal & Compliance (Phase 2d)  
**Test Environment**: Local dev (`localhost:3000`)  
**Test Date**: [Fill in during implementation]

---

## Test Prerequisites

- [ ] Dev server running (`npm run dev`)
- [ ] Supabase SMTP configured in `.env.local`
- [ ] Operator email address accessible (check inbox during tests)
- [ ] Private/incognito browser window ready (for cookie inspection)

---

## Test 1: Cookie Audit & Browser Storage Inspection

**Acceptance Criteria** (Spec FR-001, FR-002, FR-003):
- Every cookie and storage item found is documented
- Each item is classified as strictly necessary, functional, or consent-required
- No consent-required cookies are set before user consent (if banner required)

### Manual Test Steps

1. **Open private/incognito browser window**
   - Windows: Ctrl+Shift+N
   - Mac: Cmd+Shift+N

2. **Navigate to** `http://localhost:3000/`
   - Do NOT log in yet
   - Do NOT interact with any buttons

3. **Inspect browser storage** (F12 → Application tab)

   **Cookies:**
   - [ ] Note any cookies set before action
   - [ ] Expected: None (or only Supabase tokens if pre-loaded)
   - [ ] Each cookie: Classify as (strictly necessary / functional / consent-required)

   **LocalStorage:**
   - [ ] Check `Application → Local Storage → http://localhost:3000`
   - [ ] Expected: Empty for first-time visitor
   - [ ] If present: Document value and purpose

   **SessionStorage:**
   - [ ] Check `Application → Session Storage → http://localhost:3000`
   - [ ] Expected: Empty for first-time visitor

4. **Visit all public pages** (do NOT log in):
   - [ ] `/` (landing)
   - [ ] `/terms` (Terms of Service)
   - [ ] `/privacy` (Privacy Policy)
   - [ ] `/contact` (Contact form)
   - After each: Re-inspect storage; note any new cookies/items

5. **Document findings** in `specs/003-legal-compliance/cookie-audit.md`:
   ```
   Cookie Name: [e.g., sb-xyz-auth-token]
   Set by: [Supabase / App / Third-party]
   Classification: [Strictly Necessary / Functional / Consent-Required]
   Legal Basis: [GDPR Article X, or business requirement]
   Retention: [Expires after X, or until deletion]
   ```

6. **Conclusion**:
   - [ ] If any consent-required cookies found: Cookie banner must appear before those cookies are set
   - [ ] If no consent-required cookies found: Document written decision in `cookie-audit.md`

---

## Test 2: Terms of Service Accuracy

**Acceptance Criteria** (Spec FR-006 to FR-010):
- ToS accurately reflects current product features
- CC-BY-SA licensing explained for public gallery
- Tiered access model described (Tier 0–3)
- Remix/genealogy and attribution covered
- No conflicts with Constitution v3.4.2

### Manual Test Steps

1. **Read** `/terms` page in browser

2. **Verify coverage** — Check for each required section:

   - [ ] **Section 1: What is Coaching Animator?**
     - Describes product as coaching animation tool
     - References cloud storage for Tier 1+

   - [ ] **Section 2: Content Licensing (CC-BY-SA)**
     - Explains that public gallery animations are CC-BY-SA 4.0
     - Users retain ownership of private animations
     - Coaches can remix public animations with attribution

   - [ ] **Section 3: Tiered Access Model**
     - Tier 0 (Guest): 10-frame local editing, no cloud storage
     - Tier 1 (Authenticated): Cloud storage, 50-animation limit
     - Tier 2 (Public Gallery): Link sharing, upvoting
     - Tier 3 (Admin): Moderation features

   - [ ] **Section 4: Remix & Attribution**
     - Remixed animations must credit original creator
     - CC-BY-SA ShareAlike applies to remixes
     - Users can prevent remixing by keeping animations private

   - [ ] **Section 5: Prohibited Content**
     - References no advertising, no data selling (Constitution § VI.3)
     - Describes moderation and banning

   - [ ] **Section 6: Contact & Support**
     - Contact form URL (`/contact`)
     - Link to privacy policy

3. **Cross-check** against spec requirements (FR-006 to FR-010):
   - [ ] All functional requirements addressed
   - [ ] Plain language (non-technical coaches can understand)
   - [ ] No contradictions with Constitution v3.4.2

4. **Document** any gaps or inaccuracies:
   - [ ] Screenshot or note section/requirement number
   - [ ] Assign to Phase 2 implementation task

---

## Test 3: Privacy Policy Accuracy

**Acceptance Criteria** (Spec FR-011 to FR-016):
- Privacy Policy accurately describes data collection practices
- No-telemetry statement explicit
- Data residency confirmed
- Deletion process clear

### Manual Test Steps

1. **Read** `/privacy` page in browser

2. **Verify coverage** — Check for each required section:

   - [ ] **Section 1: No Tracking Statement**
     - Explicit: "We do not collect telemetry, usage analytics, or advertising tracking"
     - References no third-party analytics services

   - [ ] **Section 2: What Data We Collect**
     - Email address (authentication only)
     - Animation content (user-created)
     - OAuth user ID and name (if applicable)
     - Describes each data point's purpose

   - [ ] **Section 3: Data Storage & Residency**
     - Confirms Supabase region (e.g., "us-west-2")
     - Explains that animations are stored in PostgreSQL
     - Identifies jurisdiction (UK/EU/other)

   - [ ] **Section 4: Cookie & Storage Decision**
     - References this audit (`specs/003-legal-compliance/cookie-audit.md`)
     - Explains Supabase auth tokens (strictly necessary)

   - [ ] **Section 5: Your Rights (GDPR/CCPA)**
     - Right to access your data
     - Right to export your data
     - Right to delete your account and data
     - How to request deletion (contact form or email)
     - Deletion timeline: 30 days

   - [ ] **Section 6: Third-Party Services**
     - Lists OAuth providers (Google, Apple, GitHub) if enabled
     - Explains what data is shared with each (email, name, avatar only)
     - Confirms no OAuth tokens stored long-term

3. **Cross-check** against spec requirements (FR-011 to FR-016):
   - [ ] All functional requirements addressed
   - [ ] Plain language, non-technical
   - [ ] No contradictions with Constitution v3.4.2

4. **Document** any gaps:
   - [ ] Screenshot or note section/requirement number
   - [ ] Assign to Phase 2 implementation task

---

## Test 4: Contact Form Functionality

**Acceptance Criteria** (Spec FR-017 to FR-019):
- Form submission received at operator's monitored address
- User sees confirmation message after successful submission
- Invalid inputs rejected with inline validation

### Manual Test Steps

1. **Navigate to** `http://localhost:3000/contact`

2. **Test validation** (client-side & server-side):

   - [ ] **Empty form submit**: Error message for each required field
   - [ ] **Invalid email** (e.g., "invalid-email"): Error message "Invalid email address"
   - [ ] **Message too short** (< 10 chars): Error message "Message must be at least 10 characters"
   - [ ] **Message too long** (> 5000 chars): Error message appears
   - [ ] **XSS attempt** in name/email/message: Form rejects or sanitizes (no script execution)

3. **Test successful submission**:

   - [ ] Fill form with valid data:
     ```
     Name: Test Coach
     Email: coach@example.com
     Message: I have a question about how to use the editor to create new drills.
     ```

   - [ ] Click "Send" button

   - [ ] Verify response:
     - [ ] User sees confirmation message (e.g., "Thank you! We'll get back to you soon.")
     - [ ] Form fields clear or form disappears
     - [ ] No 500 error in console

4. **Verify email receipt** (operator inbox):

   - [ ] Check operator's email address (configured in `.env.local`)
   - [ ] Verify received within 2 minutes of form submission
   - [ ] Verify email contains:
     - [ ] Sender name: "Test Coach"
     - [ ] Reply-to email: coach@example.com
     - [ ] Message body: Full text of the message
   - [ ] Email formatting is readable (plain text OK)

5. **Test rate limiting** (optional):

   - [ ] Submit form 5 times in succession (same browser/IP)
   - [ ] 6th submission: Should receive 429 error or "Too many requests" message
   - [ ] Wait 1 hour (or adjust test time-window)
   - [ ] 7th submission: Should succeed again

6. **Test accessibility**:

   - [ ] Tab through form fields (keyboard-only navigation)
   - [ ] Labels are associated with inputs (`<label for="...">`)
   - [ ] Error messages announce via `aria-live="polite"`
   - [ ] Submit button is keyboard-accessible

---

## Test 5: Legal Page Unauthenticated Access

**Acceptance Criteria** (Spec UI-003):
- All legal pages load for unauthenticated (Tier 0) users
- No login required to view `/terms`, `/privacy`, `/contact`

### Manual Test Steps

1. **Logout** (if logged in):
   - [ ] Close private/incognito window if still open
   - [ ] Open normal browser window
   - [ ] Navigate to `http://localhost:3000`
   - [ ] If logged in, click logout

2. **Verify unauthenticated access**:

   - [ ] Navigate directly to `/terms` → Page loads (no 401/403 error)
   - [ ] Navigate directly to `/privacy` → Page loads (no 401/403 error)
   - [ ] Navigate directly to `/contact` → Page loads (no 401/403 error)
   - [ ] Submit contact form as unauthenticated user → Succeeds (receives confirmation)

3. **Verify page rendering**:

   - [ ] Text is readable (no font loading errors)
   - [ ] Links are clickable (e.g., links to `/privacy` from `/terms`)
   - [ ] No console errors (F12 → Console tab)

---

## Test Summary Checklist

**Cookie & Storage**:
- [ ] All cookies documented in `cookie-audit.md`
- [ ] Classification complete (strictly necessary / functional / consent-required)
- [ ] Decision made: banner required or no-banner decision documented

**Terms of Service**:
- [ ] Covers sections FR-006 to FR-010
- [ ] CC-BY-SA, tiered model, remix/attribution explained
- [ ] No Constitutional conflicts identified

**Privacy Policy**:
- [ ] Covers sections FR-011 to FR-016
- [ ] No-telemetry statement explicit
- [ ] Data residency, deletion process, user rights documented

**Contact Form**:
- [ ] Form validation works (client + server)
- [ ] Submission received at operator inbox
- [ ] User confirmation message displays
- [ ] Rate limiting prevents abuse

**Accessibility & Tier 0**:
- [ ] All legal pages load without authentication
- [ ] Keyboard navigation works
- [ ] No console errors

---

## Post-Test Artifacts

Before sign-off, ensure:

1. **`cookie-audit.md`** — Complete audit with classifications and decision (banner or no-banner)
2. **Updated `/terms` page** — All FR-006 to FR-010 sections present
3. **Updated `/privacy` page** — All FR-011 to FR-016 sections present
4. **`/api/contact` route** — Validates input, sends email, returns 200 on success
5. **Test Evidence** — Screenshots or notes from above tests, filed with operator
6. **CI/CD Checks**:
   - [ ] `npm run lint` passes (no new ESLint errors)
   - [ ] `npx tsc --noEmit` passes (no type errors)
   - [ ] `npm test -- --run` passes (no new test failures)

---

## Known Issues / Deferred Items

| Issue | Reason | Next Phase |
|-------|--------|-----------|
| (Resolved) Vercel Analytics removed | Constitution § V.6 absolute prohibition enforced | Removed in T006a per § V.6 |
| Contact form database persistence | Spec allows email-only; database optional | Add in future phase if audit trail needed |
| Cookie banner UI | Deferred until cookie audit decides (T015) | Implement if consent-required cookies found |

