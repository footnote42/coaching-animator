# Legal Compliance Phase 3–5 — User Stories Implementation

**Branch**: `003-legal-compliance`  
**Date**: 2026-04-24  
**Previous Phase**: TDD infrastructure gate ✅ COMPLETE (T002, T003, T006a–b, T007, T008, T010)

---

## Current Status

**Test Suite**: 73 tests passing (11 files), no regressions  
**Infrastructure**: Contact schema, rate limiter, email service, legal features directory all ready  
**Next**: Implement MVP content stories (US1, US2, US3)

### Completed Foundation

| Task | Module | Tests | Status |
|------|--------|-------|--------|
| T002 | Contact Zod schema | 9 | ✅ PASS |
| T008 | Rate limiter (5 req/hr contact) | 8 | ✅ PASS |
| T010 | Email service | 6 | ✅ PASS |
| T003 | Legal features dir structure | — | ✅ DONE |
| T006a | Removed @vercel/analytics | — | ✅ DONE |
| T007 | Cookie audit skeleton | — | ✅ DONE |

---

## Phase 3: User Story 1 — Cookie Audit (T011–T018)

**Goal**: Document all cookies/storage on public routes; determine if consent banner needed; pass Constitutional gate.

**MVP Scope**: Complete T011–T018

### Tasks (Sequential, Manual Testing)

**Audit Tasks** (T011–T014):
- [ ] **T011**: Manual cookie audit on `/` (landing page) — inspect Cookies, LocalStorage, SessionStorage
- [ ] **T012**: Manual audit on `/terms`, `/privacy`, `/contact` pages
- [ ] **T013**: Classify each cookie per GDPR Article 7(3): strictly necessary / functional / consent-required
- [ ] **T014**: Document all findings in `specs/003-legal-compliance/cookie-audit.md`

**Decision & Implementation** (T015–T018):
- [ ] **T015**: Make decision: Banner required? (if consent cookies found) OR write no-banner rationale
- [ ] **T016** (Conditional): If banner required → Create `src/shared/components/CookieConsentBanner.tsx`
  - Tailwind styling, sharp corners, Constitution design tokens
  - Does NOT set consent-required cookies until user accepts
- [ ] **T017** (Conditional): Integrate banner into `src/app/layout.tsx` (only if T015 = "banner required")
- [ ] **T018**: E2E test `tests/e2e/legal-cookies.spec.ts`
  - Verify no consent-required cookies before consent
  - OR verify no banner appears (per T015 decision)

---

## Phase 4: User Story 2 — Terms of Service (T019–T023)

**Goal**: Ensure ToS reflects current product features and Constitutional requirements (CC-BY-SA 4.0, tiered access, remix).

**Can run in parallel with Phase 3**

### Tasks (Content Updates + E2E Test)

- [ ] **T019**: Read current `/terms` page, map to spec FR-006–FR-010
- [ ] **T020**: Draft ToS sections:
  - What is Coaching Animator? (cloud-first, tiered)
  - Content Licensing (CC-BY-SA 4.0 for public gallery)
  - Tiered Access Model (Tier 0–3 feature breakdown, 50-animation Tier 1 limit)
  - Remix & Attribution (CC-BY-SA ShareAlike requirements)
  - Prohibited Content (no advertising, no data selling per § VI.3)
- [ ] **T021**: Update `src/app/terms/page.tsx` with new content (plain language)
- [ ] **T022**: Cross-check updated ToS vs spec FR-006–FR-010 and Constitution § VI.3
- [ ] **T023**: E2E test `tests/e2e/legal-pages.spec.ts` — load `/terms` unauthenticated, verify all sections render

---

## Phase 5: User Story 3 — Privacy Policy (T024–T028)

**Goal**: Ensure Privacy Policy reflects data practices and Constitutional requirements (no telemetry, data deletion timeline, GDPR compliance).

**Can run in parallel with Phase 4 (after T023 E2E setup)**

### Tasks (Content Updates + E2E Test)

- [ ] **T024**: Read current `/privacy` page, map to spec FR-011–FR-016
- [ ] **T025**: Draft Privacy Policy sections:
  - No Tracking Statement (explicit: "We do not collect telemetry, analytics, or advertising tracking")
  - What Data We Collect (email, animation content, OAuth user ID/name if applicable)
  - Data Storage & Residency (Supabase region, jurisdiction, PostgreSQL backend)
  - Cookie & Storage Decision (reference `cookie-audit.md` from US1, explain Supabase auth tokens)
  - Your Rights (GDPR: access, export, delete; 30-day deletion per § V.3)
  - Third-Party Services (OAuth providers, no token storage, data minimization)
- [ ] **T026**: Update `src/app/privacy/page.tsx` with new content (GDPR-compliant language)
- [ ] **T027**: Cross-check updated Privacy Policy vs spec FR-011–FR-016 and Constitution § V.3, V.6
- [ ] **T028**: E2E test (expand `tests/e2e/legal-pages.spec.ts`) — load `/privacy` unauthenticated, verify all sections render

---

## Phase 6: Polish & Validation (T037–T042)

**Prerequisites**: T018, T023, T028 complete (all story phases done)

### Tasks

- [ ] **T037**: `npm run lint && npx tsc --noEmit` — verify no new errors
- [ ] **T038**: `npm test -- --run` — verify no test failures
- [ ] **T039**: E2E full-flow test `tests/e2e/legal-complete-flow.spec.ts`
  - Unauthenticated user: `/terms` → `/privacy` → `/contact` → submit form
- [ ] **T040**: Responsive test `tests/e2e/legal-responsive.spec.ts` — mobile layout checks
- [ ] **T041**: Code review against Constitutional Compliance Check (plan.md)
  - Tier alignment ✅
  - No telemetry ✅
  - Entity colors (N/A)
  - Shared canvas (N/A)
  - Privacy impact ✅
  - Supabase joins (N/A)
- [ ] **T042**: Document deferred items or known issues in spec summary

---

## Implementation Notes

### Before Starting Phase 3

1. **Verify TDD gate still clean**:
   ```bash
   npm test -- --run                 # Should see 73 tests passing
   npx tsc --noEmit                  # Should see 0 errors
   git status                         # Should be clean
   ```

2. **Commit any pending work** (cookie-audit.md if needed):
   ```bash
   git add specs/003-legal-compliance/cookie-audit.md
   git commit -m "docs(legal): cookie audit skeleton (T007)"
   ```

3. **Branch readiness check**:
   ```bash
   git log --oneline -5              # Verify last 3 commits are legal work
   git diff origin/main -- specs/    # See what changed in specs
   ```

### Manual Testing (US1 Cookie Audit)

For T011–T012, use browser DevTools:
1. Open site in private/incognito mode
2. Navigate to each route (/, /terms, /privacy, /contact)
3. **DevTools → Application → Cookies** — list all cookies
4. **DevTools → Application → Local Storage** — list all keys
5. **DevTools → Application → Session Storage** — list all keys
6. Document in `cookie-audit.md` with source (Supabase, Vercel, app code)

### E2E Test Setup

Before writing E2E tests:
- ✅ Playwright already configured (`npm run e2e`)
- ✅ Example: `tests/e2e/legal-*.spec.ts` structure ready
- Use `expect(page).toHaveURL()` for route verification
- Use `expect(page.locator())` for content checks

### Decision Point: Banner or No-Banner?

**T015 Expected Outcome**:
- If audit finds NO consent-required cookies → Mark "no-banner" decision in `cookie-audit.md` (Supabase auth cookies are strictly necessary)
- If audit finds consent-required cookies → Create banner (T016–T017)

**Current Prediction** (based on Vercel + Supabase stack):
- Vercel hosting: No analytics cookies (removed ✅)
- Supabase auth: Session/refresh tokens = Strictly Necessary (no banner needed)
- **Likely outcome**: No banner required, document rationale in `cookie-audit.md`

---

## Git Workflow

**Before pushing to main**:
1. Complete all 3 user stories (US1, US2, US3) + Polish phase
2. Verify: `npm run lint && npx tsc --noEmit && npm test -- --run`
3. Create final commit: `git commit -m "feat(legal): complete compliance framework — cookie audit, ToS, Privacy Policy"`
4. Create PR: `git push origin 003-legal-compliance` → Pull Request to `main`

---

## Success Criteria

✅ **MVP Launch Criteria**:
1. Cookie audit report committed to repo (T014)
2. ToS updated with CC-BY-SA, tiered model, remix (T021)
3. Privacy Policy updated with no-telemetry, data deletion, GDPR (T026)
4. All legal pages accessible without auth (T023, T028)
5. Constitutional Compliance Check fully passed (T005, T041)

✅ **Phase 2.1 (Optional, Post-MVP)**:
- Contact form fully functional (T029–T036)
- Rate limiting working (5 req/hr)
- Email submissions received at operator inbox

---

## References

- **Current Plan**: `specs/003-legal-compliance/plan.md`
- **Task List**: `specs/003-legal-compliance/tasks.md`
- **Cookie Audit** (skeleton): `specs/003-legal-compliance/cookie-audit.md`
- **Constitution**: `.specify/memory/constitution.md` (§ V.3, V.6; § VI.3)
- **Spec**: `specs/003-legal-compliance/spec.md` (FR-006 to FR-016)
- **Research**: `specs/003-legal-compliance/research.md` (findings, blockers, decisions)

---

## Questions for Next Session

1. **Cookie banner decision**: Should I make the banner decision based on audit, or wait for explicit input?
2. **Email operator address**: Where should contact form submissions go? (Check `.env.local` SUPABASE_SMTP_* vars)
3. **Tier 0 verification**: Need to verify `/terms`, `/privacy`, `/contact` pages are truly accessible without auth (T004 verification)

---

**Status**: Ready for Phase 3 start. Infrastructure gates passed. All tests green. 🚀
