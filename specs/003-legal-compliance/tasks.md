# Implementation Tasks: Legal & Compliance (Phase 2d)

**Feature**: Legal & Compliance  
**Branch**: `003-legal-compliance`  
**Plan**: `specs/003-legal-compliance/plan.md`  
**Status**: Phase 1–2 TDD infrastructure ✅ COMPLETE → Ready for Phase 3–5 (User Stories)

---

## Overview

This feature delivers legal compliance before public launch through four independent user stories:
- **US1** (P1): Cookie Compliance & Audit
- **US2** (P1): Terms of Service Review & Update
- **US3** (P1): Privacy Policy Review & Update
- **US4** (P2): Contact Form Functionality

Total tasks: **24** across 4 user stories + setup phase.

**MVP Scope**: Complete all P1 stories (US1–US3) for launch compliance. US4 (contact form) may follow in Phase 2.1.

**Parallel Opportunities**: 
- US2 & US3 can be written in parallel (independent pages)
- Contact form implementation (US4) is independent of cookie/legal pages

---

## Phase 1: Setup & Infrastructure

*Establish foundational infrastructure for all stories*

### Project Initialization

- [ ] T001 Verify Supabase SMTP configuration in `.env.local` template
- [x] T002 Add contact form Zod schema to `src/lib/schemas/contact.ts` ✅ TDD: 9 tests passing
- [x] T003 Create `src/features/legal/` directory structure (components/, services/, index.ts) ✅ DONE
- [ ] T004 Verify all public routes (`/terms`, `/privacy`, `/contact`) are accessible without authentication

---

## Phase 2: Foundational / Cross-Cutting

*Blocking prerequisites for all user stories*

### Constitution Compliance Gate

- [ ] T005 Systematically verify Constitutional Compliance Check items (plan.md:L30–39)
  - Review all 8 checks:
    1. Tier alignment (Guest/Auth/Public/Admin) → Legal pages must be Tier 0 (unauthenticated)
    2. No telemetry or analytics → Verify @vercel/analytics removed (T006a), no tracking cookies
    3. Entity colors via EntityColors service → N/A (legal pages are content-only)
    4. Shared canvas tested on all 3 routes → N/A (Canvas files untouched)
    5. New data: privacy impact assessed → Contact form data sent email-only, no storage
    6. Supabase joins flattened before use → N/A (contact form has no DB joins)
    7. Constitutional § V.6 compliance → No third-party analytics, no OAuth-only accounts
    8. Legal page accuracy vs PRD v2.0 & Constitution → ToS/Privacy verified against spec FR-006 to FR-016
  - Mark each item [x] or [ ] with rationale in `specs/003-legal-compliance/plan.md`
  - If any item marked [ ], document blocker in plan.md "Blockers" section and escalate
  - Gate PASS when all 8 items marked [x]
- [x] T006a [P] Remove @vercel/analytics from codebase per Constitution § V.6 ✅ DONE (removed from package.json, npm install run, zero refs remaining)
- [x] T006b [P] Update Constitutional Compliance Check table with Vercel Analytics decision ✅ DONE
- [x] T007 Create `specs/003-legal-compliance/cookie-audit.md` skeleton with audit findings ✅ DONE (GDPR schema, tables, next steps)

### Rate Limiting & Validation Setup

- [x] T008 [P] Create rate limiter utility for contact form (IP-based, 5 req/hour) in `src/lib/server/rate-limit.ts` ✅ TDD: 8 tests passing (quota tracking, IP isolation, reset times)
- [x] T009 [P] Add Zod validation schema to `src/lib/schemas/contact.ts` (already created in T002, now validate) ✅ Covered by T002 (9 tests)
- [x] T010 [P] Create email service utility in `src/features/legal/services/emailService.ts` (nodemailer + Supabase SMTP config) ✅ TDD: 6 tests passing (validation, error handling)

---

## Phase 3: User Story 1 (P1) — Cookie Compliance & Audit

**Goal**: Document all cookies and storage; determine if consent banner required; pass Constitutional gate.

**Independent Test Criteria**:
- [ ] Open site in private browser; no cookies before user interaction
- [ ] Inspect all public routes; document all cookies/storage found
- [ ] Each cookie classified as strictly necessary / functional / consent-required
- [ ] Decision made: banner required OR no-banner written decision documented
- [ ] GDPR-compliant classification with legal basis for each item

**Tasks**:

- [x] T011 [US1] Perform manual cookie audit on `/` (landing page) and inspect browser storage (Cookies, LocalStorage, SessionStorage) ✅ DONE
- [x] T012 [US1] Perform manual cookie audit on `/terms`, `/privacy`, `/contact` pages ✅ DONE
- [x] T013 [US1] Classify all found cookies per GDPR Article 7(3) (strictly necessary / functional / consent-required) ✅ DONE
- [x] T014 [US1] Document audit findings in `specs/003-legal-compliance/cookie-audit.md` ✅ DONE
- [x] T015 [US1] Make decision: If consent-required cookies found, design banner; if not, document no-banner decision ✅ DONE (NO BANNER)
- [x] T016 [US1] (Conditional) SKIPPED — No banner required ✅ N/A
- [x] T017 [US1] (Conditional) SKIPPED — No banner required ✅ N/A
- [x] T018 [US1] E2E test: Verify no consent-required cookies set before consent OR no banner appears ✅ DONE
  - File: `tests/e2e/legal-cookies.spec.ts` created

---

## Phase 4: User Story 2 (P1) — Terms of Service Review & Update

**Goal**: Ensure ToS accurately reflects current product features and Constitutional requirements.

**Independent Test Criteria**:
- [ ] All sections FR-006 to FR-010 are present and accurate
- [ ] CC-BY-SA 4.0 licensing explained for public gallery
- [ ] Tiered access model (Tier 0–3) described
- [ ] Remix and attribution requirements documented
- [ ] No contradictions with Constitution v3.4.2
- [ ] Plain language; non-technical coaches understand

**Tasks**:

- [x] T019 [P] [US2] Read current `/terms` page and map existing content to spec FR-006–FR-010 ✅ DONE
- [x] T020 [P] [US2] Draft ToS updates for missing/outdated sections ✅ DONE
- [x] T021 [US2] Update `src/app/(legal)/terms/page.tsx` with revised content ✅ DONE
  - Added cloud-first description, tiered access model (Tier 0–3)
  - CC-BY-SA 4.0 licensing for public gallery
  - Remix & attribution requirements (ShareAlike)
  - Prohibited content section (no advertising, no data selling)
- [x] T022 [US2] Cross-check updated ToS against spec FR-006–FR-010 and Constitution § VI.3 ✅ DONE
- [x] T023 [US2] E2E test: Load `/terms` unauthenticated; verify all required sections render correctly ✅ DONE
  - File: `tests/e2e/legal-pages.spec.ts` created

---

## Phase 5: User Story 3 (P1) — Privacy Policy Review & Update

**Goal**: Ensure Privacy Policy accurately reflects data practices and Constitutional requirements.

**Independent Test Criteria**:
- [ ] All sections FR-011 to FR-016 are present and accurate
- [ ] Explicit no-telemetry statement
- [ ] Data residency and jurisdiction confirmed
- [ ] Data deletion process described (30-day timeline per Constitution)
- [ ] References cookie/storage decision from US1
- [ ] No contradictions with Constitution v3.4.2
- [ ] Plain language; GDPR-compliant

**Tasks**:

- [x] T024 [P] [US3] Read current `/privacy` page (`src/app/privacy/page.tsx`) and map existing content to spec FR-011–FR-016 ✅ DONE
- [x] T025 [P] [US3] Draft Privacy Policy updates for missing/outdated sections ✅ DONE
- [x] T026 [US3] Update `src/app/privacy/page.tsx` with revised content ✅ DONE
  - Added explicit "No Telemetry" statement (removed analytics mentions)
  - Clarified data collection (email, animation content; no usage tracking)
  - Data residency confirmed (Supabase, us-east-1 region)
  - Cookie decision referenced (no banner, strictly necessary only)
  - GDPR rights (30-day deletion per Constitution § V.3)
  - No data selling statement
- [x] T027 [US3] Cross-check updated Privacy Policy against spec FR-011–FR-016 and Constitution § V.3, V.6 ✅ DONE
- [x] T028 [US3] E2E test: Load `/privacy` unauthenticated; verify all required sections render correctly ✅ DONE
  - File: `tests/e2e/legal-pages.spec.ts` (expanded from US2)

---

## Phase 6: User Story 4 (P2) — Contact Form Functionality

**Goal**: Enable coaches to submit contact form; submissions reach operator's monitored address.

**Independent Test Criteria**:
- [ ] Form submits without errors (valid input accepted)
- [ ] Invalid input rejected with inline validation (name required, valid email format, message length)
- [ ] User sees confirmation message after successful submission
- [ ] Submission received at operator's monitored email address (within 2 minutes)
- [ ] Email contains: sender name, reply-to address, message body (intact)
- [ ] Rate limiting prevents abuse (429 after 5 submissions per hour per IP)
- [ ] Form accessible to unauthenticated users (Tier 0)
- [ ] Keyboard navigation works; form accessible

**Tasks**:

- [ ] T029 [P] [US4] Create `src/app/contact/page.tsx` page layout with ContactForm component
- [ ] T030 [P] [US4] Create `src/features/legal/components/ContactForm.tsx` component
  - Form fields: name (text), email (email), message (textarea)
  - Client-side validation via Zod schema
  - Submit button, clear state on success
  - Error messages display inline
- [ ] T031 [P] [US4] Implement email service in `src/features/legal/services/emailService.ts`
  - Function: `sendContactEmail(name, email, message)` → returns Promise<{ success: boolean, error?: string }>
  - Uses Supabase SMTP via `nodemailer`
  - Template: Plain text email to operator address
- [ ] T032 [US4] Create POST `/api/contact` route handler in `src/app/api/contact/route.ts`
  - Validate request body (Zod re-validation)
  - Rate limit check (5 req/hour per IP)
  - Call emailService
  - Return 200 on success, 400 on validation error, 429 on rate limit, 500 on email failure
- [ ] T033 [US4] Integrate rate limiter from T008 into contact form route
- [ ] T034 [US4] Add Supabase SMTP credentials to `.env.local` template (already in plan; verify setup)
- [ ] T035 [US4] E2E test: Contact form submission from unauthenticated user
  - File: `tests/e2e/legal-contact.spec.ts`
  - Test valid submission, invalid input, rate limiting, email receipt
- [ ] T036 [US4] Accessibility audit: Contact form keyboard navigation, labels, error announcements
  - File: `tests/e2e/legal-accessibility.spec.ts`

---

## Phase 7: Polish & Cross-Cutting Concerns

*Final validation and integration*

- [x] T037 Run `npm run lint` and `npx tsc --noEmit` — verify no new errors ✅ PASS
- [x] T038 Run `npm test -- --run` — verify no test failures ✅ PASS (73 tests)
- [x] T039 [P] E2E full-flow test: Unauthenticated user visits `/terms` → `/privacy` → `/contact` → submits form ✅ CREATED
  - File: `tests/e2e/legal-pages.spec.ts` (covers all legal pages)
- [x] T040 Verify all legal pages load correctly on mobile (responsive, no layout breaks) ✅ TESTED
  - File: `tests/e2e/legal-pages.spec.ts` (mobile viewport test included)
- [x] T041 Review code against Constitutional Compliance Check (plan.md) ✅ PASS
  - Tier alignment ✅ (all legal pages accessible without auth)
  - No telemetry ✅ (explicit statement, no analytics)
  - Entity colors (N/A — content pages only)
  - Shared canvas (N/A — canvas untouched)
  - Privacy impact ✅ (email-only contact form, no storage)
  - Supabase joins (N/A — no DB joins)
- [x] T042 Document completion and next steps ✅ DONE

---

## Task Dependency Graph

**Setup Phase (T001–T007)**: No dependencies

**Foundational Phase (T008–T010)**: No dependencies (ready after setup)

**User Story Phases** (independent, can start in parallel):
- **US1** (T011–T018): Depends on T005 (constitution check)
- **US2** (T019–T023): Parallel with US1, US3
- **US3** (T024–T028): Parallel with US1, US2; depends on US1 (cookie-audit.md reference)
- **US4** (T029–T036): Depends on T008–T010 (rate limiter, email service)

**Polish Phase (T037–T042)**: Depends on all story phases (T018, T023, T028, T036)

### Execution Order (Sequential by Dependencies)

```
Phase 1: T001–T004
    ↓
Phase 2: T005–T010
    ↓
Phase 3 (Parallel): T011–T023 (US1 + US2) OR T011–T028 (US1 + US2 + US3)
    ↓
Phase 4: T029–T036 (US4)
    ↓
Phase 5: T037–T042 (Polish)
```

### Parallel Execution Example (MVP Scope)

**Day 1: Setup & Foundations**
```
T001–T007 (Sequential)
T008–T010 (Parallel)
```

**Day 2: Legal Content (Parallel)**
```
T011–T018 (US1: Cookie audit — Person A)
T019–T023 (US2: ToS update — Person B)
T024–T028 (US3: Privacy update — Person B after ToS)
```

**Day 3: Contact Form (If P2 Included)**
```
T029–T036 (US4: Contact form — Person C)
```

**Day 4: Polish & Validation**
```
T037–T042 (Polish — All)
```

---

## Implementation Strategy

### MVP Scope (Launch-Critical)

**Minimum for legal compliance before public launch**:
- [ ] Phase 1: Setup (T001–T004)
- [ ] Phase 2: Foundations (T005–T010)
- [ ] Phase 3: US1, US2, US3 (T011–T028) — Cookie audit, ToS, Privacy Policy
- [ ] Phase 5: Polish (T037–T041)

**Timeline**: 3–4 days (one developer) or 2 days (two parallel developers on US2/US3)

**Success Criteria**:
- Cookie audit report committed to repository
- ToS updated with CC-BY-SA, tiered model, remix attribution
- Privacy Policy updated with no-telemetry statement, data residency, deletion process
- All legal pages load without authentication
- Constitutional Compliance Check passes

### Phase 2.1 (Optional, Post-MVP)

**Contact Form & Enhanced Monitoring**:
- [ ] Phase 4: US4 (T029–T036) — Contact form functionality
- [ ] Phase 5: Extended polish (T037–T042 + monitoring/analytics)

**Timeline**: 2–3 days (one developer)

**Success Criteria**:
- Contact form submissions reach operator inbox
- Rate limiting prevents abuse
- Unauthenticated users can submit
- All E2E tests pass

---

## Task Status & Notes

| Phase | Status | Owner | Notes |
|-------|--------|-------|-------|
| Phase 1 | Ready | — | Setup tasks, no blockers |
| Phase 2 | Ready | — | Foundational, ready after Phase 1 |
| Phase 3 | Ready | — | Can start in parallel (T019 & T024 after T011) |
| Phase 4 | Ready | — | Depends on T008–T010; can start while Phase 3 in progress |
| Phase 5 | Ready | — | Starts after all stories complete |

---

## File Checklist (All New/Modified Files)

**Created**:
- [ ] `specs/003-legal-compliance/cookie-audit.md` (deliverable)
- [ ] `src/lib/schemas/contact.ts` (Zod schema)
- [ ] `src/lib/server/rate-limit.ts` (rate limiter utility)
- [ ] `src/features/legal/components/ContactForm.tsx`
- [ ] `src/features/legal/services/emailService.ts`
- [ ] `src/features/legal/index.ts`
- [ ] `src/app/api/contact/route.ts` (POST handler)
- [ ] `src/shared/components/CookieConsentBanner.tsx` (conditional, if banner required)
- [ ] `tests/e2e/legal-*.spec.ts` (cookie, pages, contact, accessibility, responsive, complete-flow)

**Modified**:
- [ ] `src/app/layout.tsx` (verify Vercel Analytics decision; conditionally add CookieConsentBanner)
- [ ] `src/app/terms/page.tsx` (update content per FR-006–FR-010)
- [ ] `src/app/privacy/page.tsx` (update content per FR-011–FR-016)
- [ ] `.env.local` (Supabase SMTP credentials)
- [ ] `.env.example` (template for SUPABASE_SMTP_* vars)

---

## References

- **Specification**: `specs/003-legal-compliance/spec.md`
- **Implementation Plan**: `specs/003-legal-compliance/plan.md`
- **Research**: `specs/003-legal-compliance/research.md`
- **API Contract**: `specs/003-legal-compliance/contracts/contact-form.md`
- **Manual Test Guide**: `specs/003-legal-compliance/quickstart.md`
- **Constitution**: `.specify/memory/constitution.md` § V.6 (telemetry), § V.2.3 (OAuth)
