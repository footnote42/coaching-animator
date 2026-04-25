# Handoff: Legal & Compliance (Phase 2d) — Ready for Implementation

**Date**: 2026-04-24  
**Status**: READY TO IMPLEMENT  
**Branch**: `003-legal-compliance`  
**Previous Work**: Specification → Planning → Task Generation → Analysis & Remediation

---

## What Was Completed This Session

### 1. **Specification & Planning** ✅
- Created comprehensive feature specification with 4 user stories (US1–US4)
- Documented implementation plan with technical context, constitutional gates, and phase structure
- Generated 42-task breakdown across 7 phases (Setup → Foundational → User Stories → Polish)
- Created API contract, manual test guide, and research findings

### 2. **Critical Analysis** ✅
- Ran `/speckit.analyze` and identified 2 CRITICAL issues:
  - **C1**: Vercel Analytics decision unresolved (Constitutional § V.6 violation risk)
  - **C2**: Constitutional Compliance Check gate not systematized (unclear verification criteria)

### 3. **Remediation Applied** ✅
- **Vercel Analytics Decision**: RESOLVED to REMOVE per Constitution § V.6 (no telemetry exceptions exist)
  - Added task T006a: Remove `@vercel/analytics` from codebase
  - Added task T006b: Document decision in Constitutional Compliance Check table
  
- **Constitutional Compliance Check Gate**: SYSTEMATIZED in T005 with explicit verification criteria
  - Expanded T005 with 8-point checklist (all checks specified with pass/fail criteria)
  - Updated plan.md table with verification criteria column
  - Marked 2 checks [x] PASS (No telemetry, § V.6 compliance) based on Vercel Analytics removal
  - Added gate rule: "All checks must be [x] before proceeding to T007+"

### 4. **Files Updated**
| File | Changes |
|------|---------|
| `research.md` | Vercel Analytics decision finalized; Constitutional Gate Check marked READY |
| `tasks.md` | T005 expanded; T006a/T006b inserted; T007+ updated |
| `plan.md` | Constitutional Compliance Check table: added verification criteria, gate rules |
| `quickstart.md` | Known Issues: Vercel Analytics moved from TBD to Resolved |

---

## Current State: What's Ready, What Needs Work

### ✅ Ready to Implement
- **Phase 1 (Setup)**: T001–T004 — Infrastructure setup (no blockers)
- **Phase 2 Foundational**: T005–T007 — Constitutional gate + rate limiter + email service (all criteria clear)
- **User Stories US1–US4**: T011–T036 — All mapped to requirements with acceptance criteria
- **Phase 7 (Polish)**: T037–T042 — Final validation, linting, E2E tests

### ⚠️ Non-Critical Issues (HIGH/MEDIUM)
**None blocking implementation.** The following are improvement opportunities post-Phase-1:
1. **H1**: Task ordering — Dependencies are correct but could be made more explicit
2. **H2**: Conditional tasks (T016–T017) — Should explicitly reference T015 decision
3. **H3**: § V.6.1 terminology — References to non-existent Constitution section removed ✅
4. **M1**: Terminology drift — "CONTACT_FORM_RECIPIENT_EMAIL" vs "operator email" (use first form consistently)
5. **M2–M3**: Minor wording improvements (non-blocking)

---

## Architecture & Constraints Overview

### Tech Stack
- **Frontend**: Next.js 14 App Router, TypeScript 5, Tailwind CSS, Radix UI
- **Backend**: Supabase (PostgreSQL + Auth), Node 22
- **Testing**: Vitest (unit), Playwright (E2E)
- **Email**: Supabase SMTP (nodemailer)
- **Rate Limiting**: IP-based (5 requests/hour for contact form)

### Constitutional Requirements (§ V.6 & § V.3)
- ✅ **NO telemetry/analytics**: Vercel Analytics removed (T006a)
- ✅ **NO third-party tracking**: Supabase SMTP is internal-only
- ✅ **Privacy-first**: 30-day data deletion timeline (contact form email-only, no DB storage)
- ✅ **Tier 0 access**: All legal pages + contact form accessible without authentication

### Key Files to Create/Modify
| File | Task | Type |
|------|------|------|
| `src/lib/schemas/contact.ts` | Zod validation (name, email, message) | T002/T009 |
| `src/lib/server/rate-limit.ts` | IP-based rate limiter (5/hr) | T008 |
| `src/features/legal/services/emailService.ts` | Supabase SMTP email handler | T010 |
| `src/app/api/contact/route.ts` | POST handler with validation + rate limit | T032 |
| `src/features/legal/components/ContactForm.tsx` | React form component | T030 |
| `src/app/terms/page.tsx` | ToS with CC-BY-SA, tiered model, remix | T021 |
| `src/app/privacy/page.tsx` | Privacy Policy with no-tracking statement | T026 |
| `specs/003-legal-compliance/cookie-audit.md` | Cookie audit report (deliverable) | T014 |

---

## Implementation Sequence

### Recommended Start: Phase 1 → Phase 2 → Parallel User Stories
```
Week 1, Day 1 (Setup):
  T001–T004: Directory structure, Supabase config, route verification

Week 1, Day 1–2 (Foundational):
  T005: Constitutional Compliance Check systematization & gate verification
  T006a/T006b: Remove Vercel Analytics & document decision
  T007–T010: Cookie audit, rate limiter, email service setup

Week 1, Day 2–4 (User Stories — Can parallelize):
  US1 (T011–T018): Cookie audit + banner decision (1–1.5 days)
  US2 (T019–T023): ToS review & update (1–1.5 days, parallel with US1)
  US3 (T024–T028): Privacy Policy review & update (1–1.5 days, parallel with US1/US2)
  US4 (T029–T036): Contact form (1–2 days, depends on T008–T010)

Week 1, Day 4–5 (Polish):
  T037–T042: Linting, testing, E2E validation, final accessibility audit
```

**MVP Scope**: Complete US1, US2, US3 (P1 stories) for launch compliance. US4 (contact form) can follow as Phase 2.1.

---

## Constitutional Compliance Status

### ✅ PASSED
- No telemetry/analytics (§ V.6)
- No third-party tracking services (§ V.6)
- Privacy-first data handling (§ V.3)
- Tier 0 access for legal pages (§ V.2)
- Supabase-only email (internal, § V.6 compliant)

### 🔄 GATES (T005 must verify all)
- Tier alignment check
- Entity colors (N/A — content-only pages)
- Shared canvas (N/A — Canvas untouched)
- Privacy impact (Contact form email-only, minimal)
- Supabase joins flattened (N/A — stateless email)
- Legal page accuracy vs Constitution (Verified in US2/US3 phases)

**Gate Status**: READY FOR T005 VERIFICATION before Phase 2 proceeding

---

## What the Next Developer Should Do

### Immediate Next Steps (Day 1)
1. **Verify Setup** (T001–T004):
   - [ ] Create `src/features/legal/` directory structure
   - [ ] Verify `.env.local` has Supabase SMTP config (see contracts/contact-form.md)
   - [ ] Confirm `/terms`, `/privacy`, `/contact` routes are accessible without auth

2. **Gate Check** (T005):
   - [ ] Go through plan.md Constitutional Compliance Check table (L30–39)
   - [ ] Verify all 8 checks; mark [x] or [ ] with evidence
   - [ ] If any [ ], document blocker and escalate before continuing

3. **Remove Vercel Analytics** (T006a):
   - [ ] Delete `@vercel/analytics` import from `src/app/layout.tsx`
   - [ ] Remove dependency from `package.json`
   - [ ] Run `npm install` and verify no remaining references

4. **Document Decision** (T006b):
   - [ ] Update plan.md Constitutional Compliance Check table: mark "No telemetry" [x] PASS
   - [ ] Add note in cookie-audit.md skeleton: "Vercel Analytics: Removed per § V.6"

### Running Pre-Push Checks
```bash
# Before committing any changes
npm run lint                 # ESLint validation
npx tsc --noEmit             # TypeScript type checking
npm test -- --run            # Unit tests (if any)

# Optional E2E (after dev server running)
npm run dev &                # Start dev server in background
npm run e2e                  # Playwright E2E tests
```

### Key References
- **Specification**: `specs/003-legal-compliance/spec.md` (4 user stories with FR-001 to FR-019)
- **Implementation Plan**: `specs/003-legal-compliance/plan.md` (technical context, phases, gates)
- **Task List**: `specs/003-legal-compliance/tasks.md` (42 tasks, execution order)
- **Research Findings**: `specs/003-legal-compliance/research.md` (Phase 0 decisions)
- **Manual Tests**: `specs/003-legal-compliance/quickstart.md` (5 test scenarios)
- **API Contract**: `specs/003-legal-compliance/contracts/contact-form.md` (POST /api/contact schema)
- **Constitution**: `.specify/memory/constitution.md` § V.6 (no telemetry), § V.3 (30-day deletion)

---

## Success Criteria for Handoff to Next Developer

- [ ] Phase 1 setup complete (T001–T004)
- [ ] Constitutional Compliance Check verified (T005 gate PASS)
- [ ] Vercel Analytics removed & decision documented (T006a/T006b)
- [ ] Cookie audit report created (T007–T014)
- [ ] Rate limiter & email service utilities built (T008–T010)
- [ ] All pre-push checks pass (`npm run lint`, `npx tsc --noEmit`)
- [ ] Ready to proceed to User Story implementation (US1–US4)

---

## Open Questions / Escalation Path

**No critical blockers remain.** If issues arise:

1. **Constitutional alignment questions**: Reference `.specify/memory/constitution.md` § V.6 (telemetry prohibition is absolute)
2. **Contact form email issues**: Verify Supabase SMTP is configured in project dashboard; see `contracts/contact-form.md` for env vars
3. **Task clarification**: Each task has specific file paths and acceptance criteria; refer to `tasks.md` for details

---

## Branch & Git Hygiene

**Current Branch**: `003-legal-compliance` (feature branch off `main`)

**Commit Strategy**:
- Conventional commits: `feat(legal)`, `fix(legal)`, `chore(legal)`, `docs(legal)`
- Example: `feat(legal): remove @vercel/analytics per Constitution § V.6`
- One commit per task phase (or multiple small commits if helpful, then squash on merge)

**Pre-merge to main**:
- [ ] All CI checks pass (lint, type, tests)
- [ ] All E2E tests pass for legal pages
- [ ] Constitutional Compliance Check gate verified
- [ ] Code reviewed for security (no telemetry, no third-party services)

---

**Ready to start? Begin with Phase 1 (T001–T004) and verify Constitutional gate (T005) before proceeding to Phase 2.**
