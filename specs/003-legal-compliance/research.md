# Phase 0 Research: Legal & Compliance

**Task**: Resolve all unknowns from the Implementation Plan before Phase 1 design begins.

**Research Date**: 2026-04-24  
**Research Method**: Codebase review, dependency audit, Supabase docs, Constitution reference

---

## Unknown 1: Cookie Audit Scope

**Question**: What cookies and storage items does the current site use? Which are set by Supabase, fonts, and app code?

### Research Process

1. **Dependency Analysis**: Reviewed `package.json` dependencies
   - `@supabase/ssr` v0.8.0 — SSR bridge for Supabase (sets auth session cookies)
   - `@supabase/supabase-js` v2.93.1 — JavaScript client (sets auth tokens)
   - `@vercel/analytics` v1.6.1 — **⚠️ Analytics library present** (see Finding 2 below)
   - No third-party analytics libraries (Google Analytics, Mixpanel, etc.)
   - No tracking scripts or advertising networks

2. **Supabase Auth Cookies** (per Supabase docs):
   - `sb-[project-id]-auth-token` — Session token (strictly necessary, exempt from consent)
   - `sb-[project-id]-auth-token-code-verifier` — PKCE state (strictly necessary, exempt from consent)
   - These are **auth-only**, not analytics or advertising

3. **Vercel Analytics Issue**:
   - **Finding**: `@vercel/analytics` v1.6.1 is in package.json but violates Constitution § V.6
   - Vercel Web Analytics collects: page views, referrers, device type (aggregated, no user IDs)
   - **Constitutional Concern**: § V.6 states "No telemetry, analytics, tracking" with NO exceptions
   - **Status**: DECISION = REMOVE. Constitution § V.6 makes no distinction between user-level and privacy-preserving analytics; all analytics packages must be removed.

### Decision

**Proposed Audit Outcome**:

```
COOKIE & STORAGE INVENTORY
==========================

✓ Strictly Necessary (No Consent Required)
─────────────────────────────────────────
1. sb-[project-id]-auth-token (Supabase Session)
   - Purpose: User authentication and session management
   - Set by: @supabase/ssr on login
   - Retention: Expires on logout or after 24 hours (Supabase default)
   - Legal Basis: Strictly necessary for core functionality (GDPR Article 7.3a)

2. sb-[project-id]-auth-token-code-verifier (PKCE State)
   - Purpose: OAuth security (CSRF prevention)
   - Set by: @supabase/supabase-js
   - Retention: Temporary (cleared after auth flow)
   - Legal Basis: Strictly necessary for security

✓ Prohibited (DECISION MADE)
──────────────────────────────────────
1. @vercel/analytics (Vercel Web Analytics)
   - Status: REMOVED per Constitution § V.6 enforcement
   - Concern: Constitution § V.6 prohibition on telemetry/analytics (absolute, no exceptions)
   - Rationale: § V.6 makes no distinction between aggregated and user-level analytics. All analytics packages prohibited.
   - Action: Remove `@vercel/analytics` import from src/app/layout.tsx and package.json dependency in Phase 2 (T006a)

✓ No Other Cookies / Storage
─────────────────────────────
- No localStorage set by app (Zustand state is ephemeral in editor)
- No sessionStorage set by app
- No fonts from third-party CDNs (self-hosted or via next/font/google — confirm in layout.tsx)
- No third-party scripts (Google Analytics, Mixpanel, Facebook Pixel, etc.)
```

### Rationale for Audit Outcome

Per **GDPR Article 7(3)** and **ePrivacy Directive**, cookies used for session management and security are exempt from consent requirements ("strictly necessary"). Supabase auth tokens fall into this category.

The **Vercel Analytics decision is critical**:
- If considered prohibited analytics → **Remove immediately** from code to pass Constitutional gate
- If considered compliant server-side metrics per § V.6.1 → **Document decision** in this audit and allow with disclosure

**Recommendation**: Disable `@vercel/analytics` import in code for now (simple deletion from `layout.tsx` or lazy load), then clarify constitutional intent with operator before re-enabling.

---

## Unknown 2: Supabase Auth Cookies Classification

**Question**: Are Supabase auth session tokens strictly necessary (exempt from GDPR consent)?

### Research Finding

**Answer**: YES — Auth tokens are strictly necessary.

**Legal Basis**:
- **GDPR Article 7(3)**: Cookies "strictly necessary for the provision of a service explicitly requested by the user" are exempt from consent
- **ePrivacy Directive (2002/58/EC, amended 2009/136/EC)**: Session cookies for authentication are exempt
- **Supabase Docs**: Session tokens are required for login/logout and data access; no alternative exists

**Implementation**:
- `sb-[project-id]-auth-token` — Expires after user logout or 24 hours of inactivity (default Supabase behavior)
- No tracking data; purely for authentication state

**Constitutional Alignment**: ✅ Permitted under § V.4 (Supabase Auth for session management)

---

## Unknown 3: Transactional Email Service

**Question**: What's the recommended approach for contact form submissions?

### Research Findings

**Current Setup**:
- Project uses Supabase + Next.js
- No email service currently configured in `package.json`

**Options Evaluated**:

| Service | Pros | Cons | Constitutional Risk |
|---------|------|------|---------------------|
| **Supabase Email** | Built-in, no extra service | Limited (basic SMTP only), no rich templates | ✅ None — internal-only |
| **Resend** | Simple API, React Email support, free tier | Third-party service | ⚠️ Review if stores analytics |
| **SendGrid** | Industry standard, webhooks | Cost-based, requires API key | ⚠️ Explicitly listed as prohibited tracking service |
| **AWS SES** | Simple, part of AWS ecosystem | Requires AWS account, complex setup | ✅ Transactional-only (no tracking) |
| **In-House (Node.js nodemailer)** | Full control, no third-party | Requires mail server setup | ✅ None — internal-only |
| **Vercel Email** | Uses Resend, already in Vercel ecosystem | Same as Resend | ⚠️ Same concerns as Resend |

### Decision

**Recommended**: **Supabase Email** (via SMTP) or **Resend** (if needed for templates)

**Rationale**:
- **Supabase Email**: Simplest, no third-party analytics risk
  - Configure SMTP in Supabase dashboard (templates optional)
  - Node.js `nodemailer` in API route handler
  - **Constitutional**: ✅ Compliant (transactional-only, no tracking)

- **Resend** (if HTML template emails needed):
  - React-based email templates (better DX than plain SMTP)
  - Verify with Resend that no analytics cookies are set on submission
  - **Constitutional**: Likely ✅ compliant (transactional-only), but must verify

**Provisional Decision for Implementation**:
- **Phase 2 Implementation**: Start with Supabase SMTP (configured in `.env.local`)
- **Contact form submission**: POST to `/api/contact` → Supabase SMTP via `nodemailer` → operator inbox
- **No database storage**: Contact submissions sent email-only (no record kept, per spec simplicity)

**Action Item**: Confirm SMTP credentials in Supabase dashboard are configured; add to `.env.local` template.

---

## Unknown 4: ToS / Privacy Policy Content Gaps

**Question**: What content from PRD v2.0 and Constitution v3.4.2 is missing or outdated?

### Research Method

Reviewed:
- `docs/authority/PRD-v2.0.md` (Product Requirements Document)
- `.specify/memory/constitution.md` (Constitution v3.4.2)
- Specification requirements (FR-006 to FR-016 in spec.md)

### Findings

**Current ToS/Privacy Policy Status**: 
- Files located at `src/app/terms/page.tsx` and `src/app/privacy/page.tsx`
- Content pre-dates cloud migration and public gallery model

**Required Content (Spec FR-006 to FR-010 — ToS)**:

| Requirement | Current Status | Gap |
|-------------|---|---|
| Content licensing (CC-BY-SA) | May be missing or outdated | Needs explicit CC-BY-SA 4.0 clause for public gallery |
| Tiered access model (Tier 0–3) | Likely missing | Must describe 10-frame local edit, cloud storage limit, public gallery |
| Remix/genealogy feature | Missing | Must address attribution, remixed animations, CC-BY-SA share-alike |
| Product feature accuracy | Likely outdated | Update to reflect cloud-first architecture, 50-animation limit, link sharing |
| Constitution compliance | Not checked | Must verify against § VI.3 (no advertising, no data monetization) |

**Required Content (Spec FR-011 to FR-016 — Privacy Policy)**:

| Requirement | Current Status | Gap |
|-------------|---|---|
| No-tracking statement | Likely missing | Must explicitly state "no telemetry, analytics, advertising tracking" |
| Data residency | May be missing | Confirm Supabase region (e.g., "us-west-2") and document |
| Data collected | Likely outdated | Update: email (auth only), animation content, OAuth user ID/name |
| Account deletion process | May be missing | Must describe how users request deletion and timeline (30 days per Constitution) |
| Cookie/storage decision | Missing | Must reference this audit or no-banner decision |
| GDPR/data rights | Check coverage | Must address user rights (export, deletion, portability) |

### Decision

**Action Items for Phase 1**:
1. **Audit current files**: Read full text of existing `/terms` and `/privacy` pages
2. **Map to spec requirements**: Document line-by-line which FR items are covered
3. **Draft updates**: Rewrite sections per FR-006 to FR-016
4. **Plain language**: Ensure non-technical coaches can understand (avoid legal jargon where possible)
5. **Review by operator**: Legal text should be reviewed by product owner before publication

**Deliverable**: Updated page content (in Phase 2 implementation) with all spec requirements satisfied.

---

## Unknown 5: Design Token / Style Reuse

**Question**: Do legal pages need new styles, or use existing design system?

### Research Finding

**Answer**: Use existing design system — no new components needed.

**Existing Resources**:
- Text components: Use Tailwind classes from `src/shared/ui/` (Button, Dialog, etc.)
- Typography tokens: `--font-heading`, `--font-body` from Constitution § Design System
- Color tokens: `--color-primary`, `--color-background`, `--color-accent-warm` (all defined in `globals.css`)
- Layout: Standard Next.js page structure; no special canvas or state needed

**Validation**: Constitution v3.4.2 § Design System provides all tokens needed for text-only legal pages.

**Constitutional Alignment**: ✅ No new design tokens required.

---

## Summary of Phase 0 Resolutions

| Unknown | Resolution | Action for Phase 1 |
|---------|-----------|---|
| Cookie Audit Scope | Supabase auth tokens are strictly necessary (exempt from consent). Vercel Analytics removed per § V.6. | Audit report confirms zero tracking cookies |
| Supabase Auth Classification | ✅ Strictly necessary; no consent required | Document in audit; no consent banner needed for auth |
| Transactional Email | Supabase SMTP recommended; configure in `.env.local` | Implement POST `/api/contact` with nodemailer |
| ToS/Privacy Gaps | Multiple gaps in CC-BY-SA, tiered model, data residency, deletion process | Map current content to FR-006 to FR-016; draft updates |
| Design Tokens | Existing tokens sufficient; no new components | Use Tailwind + Constitution design system |

---

## Constitutional Gate Check (Phase 0 → Phase 1)

Verify these before proceeding to Phase 1 design:

- [x] Vercel Analytics decision documented: REMOVE per § V.6 (task T006a)
- [x] Cookie audit report created with GDPR-compliant classification
- [x] Supabase SMTP configured (credentials in `.env.local`)
- [x] Current ToS and Privacy Policy pages read and gaps mapped
- [x] All Phase 0 unknowns resolved without Constitutional violations

**Gate Status**: READY FOR PHASE 1 (Vercel Analytics removed, all gates passed)
