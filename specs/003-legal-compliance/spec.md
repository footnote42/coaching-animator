# Feature Specification: Legal & Compliance (Phase 2d)

**Feature Branch**: `003-legal-compliance`
**Created**: 2026-04-24
**Status**: Draft
**Issues**: LEGAL-001, LEGAL-002, LEGAL-003, CONTACT-001

## Constitutional Compliance Gate

- [x] **Tier alignment**: Tier 0 (Guest) — all legal pages and the cookie decision must be accessible without authentication
- [x] **No telemetry**: This feature must not introduce any tracking, analytics, or consent-gating that would enable data collection prohibited by the constitution
- [x] **No third-party analytics**: No new third-party scripts introduced. Cookie audit specifically checks whether existing scripts (Supabase SDK, web fonts) set consent-requiring cookies
- [x] **Privacy gate**: No new data stored. Privacy Policy update reflects existing data practices. Contact form sends submissions to an operator-monitored address — no new storage model
- [x] **Shared canvas risk**: No canvas components touched

> No constitutional conflicts identified. The cookie audit outcome (banner or documented no-banner decision) must preserve the constitutional prohibition on telemetry.

---

## User Scenarios & Testing

### User Story 1 — Cookie Consent Handled Correctly (Priority: P1)

A visitor arrives at the site for the first time. They should either see a minimal, honest cookie notice explaining what is stored and why — or, if no consent-requiring cookies are used, experience a clean site with no banner at all (and a documented decision on file confirming this).

**Why this priority**: GDPR compliance is a legal requirement for UK/EU users. Launching without this decision documented and acted upon is a legal risk.

**Independent Test**: Open the site in a private/incognito browser window; inspect browser storage (cookies, localStorage, sessionStorage) and note what is set before any interaction. Cross-reference findings against the audit report.

**Acceptance Scenarios**:

1. **Given** a first-time visitor loads any public page, **When** browser storage is inspected, **Then** every cookie or storage item found is documented in the cookie audit report with a clear legal basis
2. **Given** cookies requiring consent are found, **When** the visitor loads the site, **Then** a consent banner appears before those cookies are set, and they are blocked until consent is given
3. **Given** no cookies requiring user consent are found, **When** the site is audited, **Then** a written decision record exists confirming no banner is needed and the basis for that conclusion
4. **Given** the user has not interacted with a consent banner, **When** they browse the site, **Then** no analytics, tracking, or advertising cookies are present (constitutional prohibition)

---

### User Story 2 — Terms of Service Accurately Reflects the Product (Priority: P1)

A coach considering signing up reads the Terms of Service. The terms accurately describe: what the product does, who owns uploaded content, how public animations are licensed, and what happens to their account if they stop using the service.

**Why this priority**: Inaccurate or outdated ToS creates legal exposure and erodes trust. The existing ToS pre-dates the cloud-first architecture and public gallery model.

**Independent Test**: Read the live Terms of Service page at `/terms`. Verify each of the four content areas listed in FR-003 is present and accurate.

**Acceptance Scenarios**:

1. **Given** a coach reads the ToS, **When** they look for the content licensing terms, **Then** they find a plain-language explanation of CC-BY-SA and what it means for animations they share to the public gallery
2. **Given** a coach reads the ToS, **When** they look for the data architecture section, **Then** they find accurate descriptions of cloud storage, tiered access, and the 50-animation limit for Tier 1 accounts
3. **Given** a reviewer compares the ToS against the PRD v2.0 and Constitution v3.4.2, **When** checking for coverage, **Then** no material product feature is missing from the ToS
4. **Given** the ToS references contact or support channels, **When** a user follows those instructions, **Then** the contact details are accurate and functional

---

### User Story 3 — Privacy Policy Reflects Actual Data Practices (Priority: P1)

A coach or parent reviewing the Privacy Policy understands exactly what personal data is collected, where it is stored, how long it is kept, and that the product does not track or sell their data.

**Why this priority**: GDPR requires an accurate, complete privacy policy. The existing policy pre-dates the Supabase migration and constitutional no-telemetry stance.

**Independent Test**: Read the live Privacy Policy page at `/privacy`. Verify it matches the four content areas in FR-005.

**Acceptance Scenarios**:

1. **Given** a visitor reads the Privacy Policy, **When** they look for the no-tracking statement, **Then** they find an explicit declaration that no telemetry, analytics, or advertising tracking is used
2. **Given** a visitor reads the Privacy Policy, **When** they look for data residency information, **Then** they find a confirmed statement of where user data (accounts, animations) is stored and under which jurisdiction
3. **Given** a visitor reads the Privacy Policy, **When** they look for what data is collected, **Then** the policy accurately lists only: email address (for authentication), animation content (user-created), and any technical identifiers set by the auth provider
4. **Given** the policy references user rights, **When** a user wants to delete their account and data, **Then** the policy describes a clear process for requesting deletion

---

### User Story 4 — Contact Form Reaches the Operator (Priority: P2)

A coach with a question or issue submits the contact form. The submission is received by the product operator at a monitored address.

**Why this priority**: A broken contact channel erodes trust and prevents operators from receiving support requests at launch.

**Independent Test**: Submit a test message via the contact form at `/contact`; confirm receipt at the monitored address within a reasonable timeframe.

**Acceptance Scenarios**:

1. **Given** a user completes and submits the contact form, **When** the form is submitted successfully, **Then** a confirmation message is shown to the user
2. **Given** a contact form submission is made, **When** the operator checks the monitored inbox, **Then** the message is received with the sender's name, email, and message body intact
3. **Given** a user submits the form with an invalid email address, **When** they attempt to submit, **Then** the form prevents submission and shows an inline validation message

---

### Edge Cases

- What if the cookie audit reveals cookies that cannot be blocked without breaking core functionality (e.g., Supabase auth tokens)? Auth session cookies are strictly necessary and exempt from consent requirements — the decision record must classify them as such.
- What if the existing ToS or Privacy Policy contains content that is legally inaccurate? Flag for operator review; do not auto-replace legal text without human sign-off.
- Guest (Tier 0) users must be able to read all legal pages without logging in.

---

## Requirements

### Functional Requirements

**Cookie Compliance (LEGAL-001)**

- **FR-001**: A cookie audit MUST be performed that inventories every cookie, localStorage entry, and sessionStorage entry set by the site across all public routes
- **FR-002**: Each item in the audit MUST be classified as: strictly necessary, functional, or consent-required
- **FR-003**: If any consent-required items are found, a cookie consent banner MUST be displayed to first-time visitors before those items are set
- **FR-004**: If no consent-required items are found, a written decision record MUST be produced documenting the basis for that conclusion and retained in the repository
- **FR-005**: The product MUST NOT introduce any new cookies or storage items that require user consent beyond those already present

**Terms of Service (LEGAL-002)**

- **FR-006**: The Terms of Service MUST be reviewed and updated to accurately reflect the current feature set as defined in PRD v2.0
- **FR-007**: The ToS MUST include a clear section on content licensing, specifically: public gallery animations are licensed CC-BY-SA; user retains ownership of private animations
- **FR-008**: The ToS MUST accurately describe the tiered access model (Tier 0–3), including the 50-animation cloud storage limit for Tier 1
- **FR-009**: The ToS MUST address the remix/genealogy feature: remixed animations must attribute the original creator
- **FR-010**: The ToS MUST be reviewed against Constitution v3.4.2 and must not contain provisions that conflict with constitutional prohibitions (no advertising, no data selling, no paywalls on core features)

**Privacy Policy (LEGAL-003)**

- **FR-011**: The Privacy Policy MUST be reviewed and updated to reflect current data practices as of the Supabase cloud migration
- **FR-012**: The Privacy Policy MUST explicitly state that no telemetry, usage analytics, or advertising tracking is collected or shared with third parties
- **FR-013**: The Privacy Policy MUST confirm the data residency of user accounts and animation content (Supabase region)
- **FR-014**: The Privacy Policy MUST enumerate all personal data collected: at minimum, email address and any identifiers set by the OAuth provider
- **FR-015**: The Privacy Policy MUST describe the process for a user to request account and data deletion
- **FR-016**: The Privacy Policy MUST reference the cookie/storage decision (outcome of FR-003 or FR-004)

**Contact Form (CONTACT-001)**

- **FR-017**: The contact form MUST be tested end-to-end; a test submission MUST be confirmed received at the operator's monitored address
- **FR-018**: The monitored email address MUST be confirmed as actively checked by the product operator
- **FR-019**: The contact form MUST display a visible confirmation to the user after successful submission

### Frontend Requirements

- **UI-001**: If a cookie consent banner is required, it lives in `src/shared/components/` as a reusable component
- **UI-002**: Cookie banner (if required) follows the existing design system: Tailwind classes, design tokens, sharp corners (`rounded-none`)
- **UI-003**: Legal pages (`/terms`, `/privacy`, `/contact`) must remain accessible to unauthenticated (Tier 0) users

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Cookie audit report produced and committed to repository; every storage item on the site is classified with a legal basis
- **SC-002**: Either a consent banner is live (if consent-required cookies found) OR a written no-banner decision is committed to the repository — one of these two outcomes is mandatory before launch
- **SC-003**: Terms of Service reviewed against PRD v2.0 and Constitution v3.4.2; zero material product features are absent from the ToS
- **SC-004**: Privacy Policy contains an explicit no-telemetry declaration, confirmed data residency, and a data deletion process
- **SC-005**: Test contact form submission confirmed received at monitored operator address
- **SC-006**: All legal pages load correctly for unauthenticated visitors
- **SC-007**: `npm run lint && npx tsc --noEmit` passes with no new errors after any code changes

---

## Assumptions

- The existing legal pages (`/terms`, `/privacy`, `/contact`) are written content pages that can be updated without schema or API changes
- Supabase auth session tokens are classified as strictly necessary (exempt from consent) — this is standard practice for session management cookies
- The operator has access to the email address configured in the contact form and can confirm receipt
- Legal text updates are reviewed by the product operator before publication; this spec defines the required content coverage, not the precise wording
- Supabase data residency will be confirmed by checking the project region in the Supabase dashboard during implementation
- The ToS and Privacy Policy require content updates only; no new pages or routes need to be created


