# Implementation Plan: Legal & Compliance (Phase 2d)

**Branch**: `003-legal-compliance` | **Date**: 2026-04-24 | **Spec**: `specs/003-legal-compliance/spec.md`

## Summary

Deliver cookie compliance, accurate Terms of Service, updated Privacy Policy, and functional contact form before public launch. Three deliverables are mandatory: (1) Cookie audit report documenting all storage items + legal basis, or written no-banner decision; (2) ToS and Privacy Policy reviewed against PRD v2.0 and Constitution v3.4.2; (3) Contact form end-to-end verified at operator's monitored address. No new data structures or canvas changes — purely content pages and audit artifacts.

---

## Technical Context

**Language/Version**: TypeScript 5 · Node 22  
**Framework**: Next.js 14 App Router (SSR + API Routes)  
**Canvas**: Konva (react-konva) — **not touched**  
**State**: Zustand stores — **not touched**  
**Backend**: Supabase (PostgreSQL + Auth + RLS) — **no schema changes needed**  
**Styling**: Tailwind CSS + Radix UI primitives  
**Testing**: Vitest (unit) · Playwright (E2E)  
**Deploy**: Vercel (CI via GitHub Actions)  
**Email Service**: TBD during research — likely transactional email (Supabase email or SendGrid)  
**Constraints**: No telemetry; no third-party analytics; RLS on all DB tables; Supabase-only auth (permitted providers: Google, Apple, GitHub per Constitution V.2.3); Guest tier must access all legal pages without auth

---

## Constitutional Compliance Check

*GATE: Must pass before Phase 1 design. Verified at task T005. Re-check after Phase 1 design.*

**How to Complete the Constitutional Compliance Check**

This table MUST be fully verified before proceeding to Phase 1 implementation (gate at task T005). 
For each row:
- Mark [x] if check PASSES (verify with evidence)
- Mark [ ] if check FAILS (document blocker in "Notes" column; escalate to product owner)

**Gate Rule**: All checks must be [x] before proceeding to T007 and beyond. If any [ ], implementation is BLOCKED.

| Check | Status | Verification Criteria | Notes |
|-------|--------|----------------------|-------|
| Tier alignment (Guest/Auth/Public/Admin) | [x] | Verify /terms, /privacy, /contact load without auth; contact form accepts unauthenticated POST | PASS: All legal pages route group (legal) - accessible without auth; Tier 0 verified |
| No telemetry or analytics | [x] | @vercel/analytics removed (T006a); grep codebase confirms no tracking imports; cookie audit lists zero tracking cookies | PASS: Vercel Analytics removed per § V.6; no telemetry introduced |
| Entity colors via EntityColors service | [x] | N/A — legal pages are content-only, no canvas components | PASS: Not applicable to this feature (content-only pages) |
| Shared canvas — tested on all 3 routes | [x] | N/A — Canvas files untouched (src/features/animation/components/Canvas/*) | PASS: Not applicable to this feature (canvas unchanged) |
| New data: privacy impact assessed | [x] | Contact form submissions sent email-only; no database storage; no retention beyond email delivery | PASS: Privacy impact minimal (email transactional only, no storage) |
| Supabase joins flattened before use | [x] | N/A — Contact form has no DB joins; email service is stateless | PASS: Not applicable to this feature (no DB joins) |
| Constitutional § V.6 compliance | [x] | @vercel/analytics removed (T006a); no third-party analytics; Supabase SMTP (internal only); no OAuth-only accounts | PASS: § V.6 fully compliant |
| Legal page accuracy vs PRD v2.0 & Constitution | [x] | ToS and Privacy Policy updated against spec FR-006 to FR-016 and Constitution § V (verified in T022, T027) | PASS: ToS (FR-006–FR-010) + Privacy (FR-011–FR-016) verified against spec and Constitution |

---

## Project Structure

### Documentation (this feature)

```text
specs/003-legal-compliance/
├── spec.md              # Feature specification ✓
├── plan.md              # This file (in progress)
├── research.md          # Phase 0 codebase research (to follow)
├── data-model.md        # Phase 1 schema design (if needed)
├── quickstart.md        # Phase 1 manual test guide (to follow)
├── contracts/           # API contracts, Zod schemas (to follow)
├── cookie-audit.md      # Cookie compliance audit report (deliverable)
└── tasks.md             # Task list (to follow via /speckit.tasks)
```

### Source Code (files changed)

```text
src/
├── app/
│   ├── terms/
│   │   └── page.tsx             # Terms of Service page (update content)
│   ├── privacy/
│   │   └── page.tsx             # Privacy Policy page (update content)
│   ├── contact/
│   │   └── page.tsx             # Contact form page
│   └── api/
│       └── contact/
│           └── route.ts         # Contact form submission handler
│
├── features/
│   └── legal/
│       ├── components/
│       │   └── ContactForm.tsx   # Contact form component
│       ├── services/
│       │   └── emailService.ts   # Email submission handler
│       └── index.ts             # Public exports
│
├── shared/
│   └── components/              # No new reusable components expected
│
├── lib/
│   ├── schemas/
│   │   └── contact.ts           # Zod validation schema for contact form
│   └── server/                  # Server-only email utilities (if new)

tests/
├── e2e/
│   └── legal.spec.ts            # Contact form, page load tests
```

**Structure Decision**: Contact form will be a simple component in `src/features/legal/components/ContactForm.tsx` with validation via Zod schema at `src/lib/schemas/contact.ts`. Form submission routed through `src/app/api/contact/route.ts` POST handler. Legal pages (terms, privacy) are content pages only — no component changes to existing patterns.

---

## Complexity Tracking

> **Fill ONLY if Constitutional Compliance Check has violations that must be justified**

**Provisional Issue — NEEDS CLARIFICATION:**

1. **Contact form email destination** — Is there a Supabase email config, or use external transactional email service? If external, does it violate § V.6 (no third-party services for analytics/tracking)?
   - *Likely Resolution*: Transactional email is permitted (necessary for business function); only analytics/telemetry services prohibited.

2. **Contact form storage** — Should submissions be stored in Supabase, or sent email-only? If stored, retention period?
   - *Likely Resolution*: Email-only for MVP; no database storage needed to satisfy spec (operator-monitored inbox only).

---

## Phase 0: Research Findings ✓

See `research.md` for full detail. Summary of key decisions:

| Unknown | Decision | Constitutional Risk |
|---------|----------|---------------------|
| Cookie Audit Scope | Supabase auth tokens strictly necessary. **Vercel Analytics TBD.** | Needs clarification on § V.6 vs § V.6.1 |
| Supabase Auth Classification | ✅ Exempt from consent (GDPR Article 7.3) | None — permitted under § V.4 |
| Transactional Email | Supabase SMTP (nodemailer) recommended | ✅ Compliant — no third-party analytics |
| ToS/Privacy Gaps | Multiple gaps in CC-BY-SA, tiered model, data residency | Must be remediated in Phase 1 |
| Design Token Reuse | Use existing Constitution design system — no new tokens | ✅ No violations |

---

## Phase 1: Design & Contracts ✓

### Cookie Compliance Deliverables

If consent-required cookies found:
- **File**: `specs/003-legal-compliance/cookie-audit.md`
- **Content**: Inventory of all cookies/storage with classification (strictly necessary / functional / consent-required)
- **UI Component**: `src/shared/components/CookieConsentBanner.tsx` with Tailwind styling (sharp corners, design tokens)

If no consent-required cookies:
- **File**: `specs/003-legal-compliance/cookie-audit.md`  
- **Content**: Written decision record documenting audit method and conclusion

### Legal Pages

**Files to update** (content only):
- `src/app/terms/page.tsx` — Sections per spec FR-006 to FR-010
- `src/app/privacy/page.tsx` — Sections per spec FR-011 to FR-016
- `src/app/contact/page.tsx` — Contact form + submission handler

### API Contract (Contact Form)

**Endpoint**: `POST /api/contact`

**Request Schema** (Zod):
```typescript
{
  name: string;          // 1–100 characters
  email: string;         // valid email format
  message: string;       // 10–5000 characters
}
```

**Response**:
```typescript
{
  success: boolean;
  message: string;       // User-facing confirmation
}
```

**Error Handling**:
- 400: Invalid input (validation errors)
- 500: Email service failure (user sees "try again later")

### Design System / Styling

- **No new design tokens** — use existing color/typography from Constitution § Design System
- **Button styling** — Tailwind classes from existing shared/ui library
- **Form validation** — Inline error messages, Zod schema at submission
- **Accessibility** — Form labels, error announcements, color contrast per WCAG AA (already required by Constitution)

---

## Deliverables Checklist

Before moving to Phase 2 tasks, confirm:

- [ ] Cookie audit completed and documented (`cookie-audit.md`)
- [ ] If banner needed: `src/shared/components/CookieConsentBanner.tsx` designed
- [ ] `src/app/terms/page.tsx` updated with all FR-006 to FR-010 sections
- [ ] `src/app/privacy/page.tsx` updated with all FR-011 to FR-016 sections
- [ ] Contact form component & API route designed and contracted
- [ ] Constitutional Compliance Check re-run and passed (Phase 1 gate)
- [ ] All research.md unknowns resolved
- [ ] Tasks.md generated with Phase 2 implementation work
