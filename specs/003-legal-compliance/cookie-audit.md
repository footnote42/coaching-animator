# Cookie & Storage Audit Report

**Date**: 2026-04-24  
**Status**: In Progress  
**Audited Routes**: / (landing), /terms, /privacy, /contact

---

## Summary

Audit completed on all public routes (/, /terms, /privacy, /contact). All cookies and storage mechanisms are classified per GDPR Article 7(3). **Result: Only Strictly Necessary items found. No banner required.**

---

## Findings

### Cookies Discovered

| Name | Source | Classification | Legal Basis | Retention | Notes |
|------|--------|----------------|-------------|-----------|-------|
| `sb-*-auth-token` | Supabase Auth | Strictly Necessary | Legitimate Necessity | Session | Session authentication token (set only on authenticated routes) |
| `sb-*.json` | Supabase Auth | Strictly Necessary | Legitimate Necessity | Session | Session metadata (set only on authenticated routes) |

### Local Storage

| Key | Source | Purpose | Classification | Retention | Notes |
|-----|--------|---------|----------------|-----------|-------|
| `sb-*-auth.0` | Supabase Auth | Session object persistence | Strictly Necessary | Session | Used for session recovery across page reloads |
| `projectStore` | App (Zustand) | Guest animation state | Strictly Necessary | Browser session/user-managed | Allows guest users (Tier 0) to create animations without auth |
| `projectStore-persist` | App (Zustand) | Persistent state | Strictly Necessary | Until cleared | Persists guest animations across browser sessions |

### Session Storage

| Key | Source | Purpose | Classification | Retention | Notes |
|-----|--------|---------|----------------|-----------|-------|
| (None found) | — | — | — | — | No session-specific storage beyond localStorage |

### Third-Party Services

| Service | Type | Cookies Set | Tracking | Status | Notes |
|---------|------|-------------|----------|--------|-------|
| Vercel Analytics | Web Analytics | ❌ Removed | ❌ No | ✓ Removed per Constitution § V.6 | Fully compliant |

---

## Classification Schema

**Strictly Necessary**: Required for core functionality (auth, CSRF protection)
- Legal basis: Legitimate Interest / Necessity
- Requires no banner

**Functional**: Enhances user experience (preferences, language)
- Legal basis: Legitimate Interest (with option to opt-out)
- May require banner based on jurisdiction

**Analytics/Tracking**: User behavior analysis, marketing
- Legal basis: Explicit Consent
- **Status**: ❌ NOT USED — Vercel Analytics removed per Constitution § V.6

---

## Decision: Cookie Banner Required?

**Status**: ✅ COMPLETE (T011–T015)

- [ ] Banner required (consent-required cookies found)
- [x] No banner needed (only strictly necessary cookies)

---

## GDPR Compliance Notes

- **Data Processors**: Supabase (auth tokens), Vercel (hosting, no analytics)
- **Data Retention**: Per Constitution § V.3 (30-day deletion window)
- **User Rights**: Access, export, delete available via Supabase auth flow
- **Documentation**: Privacy Policy updated in US3 (T025–T027)

---

## Audit Completion Summary

**Tasks Completed**:
- [x] **T011**: Manual audit of landing page (/) — No consent-required cookies found
- [x] **T012**: Manual audit of /terms, /privacy, /contact pages — No consent-required cookies found
- [x] **T013**: Classify each item per GDPR Article 7(3) — All items classified as Strictly Necessary
- [x] **T014**: Document findings in this audit report
- [x] **T015**: Banner decision made — **NO BANNER REQUIRED**

**Rationale for No-Banner Decision**:
1. **Supabase Auth Tokens**: Strictly Necessary for core functionality; exempt from consent requirements
2. **localStorage projectStore**: Strictly Necessary for guest tier (Tier 0) offline editing capability
3. **No Analytics**: Vercel Analytics removed per Constitution § V.6
4. **No Advertising**: No tracking pixels or ad networks
5. **GDPR Compliant**: All storage is either Strictly Necessary or user-controlled

**Constitutional Alignment**:
- ✅ § V.6 (No Telemetry): No telemetry, analytics, or tracking cookies
- ✅ § V.3 (Data Deletion): Supabase auth data deleted within 30 days of account deletion
- ✅ Tier 0 Access: All public routes accessible without authentication

## Next Steps

- **T016–T017**: SKIPPED (no banner needed)
- **T018**: E2E test for cookie compliance (verify no consent-required cookies set)

---

## References

- Constitution § V.3 (Data deletion timeline)
- Constitution § V.6 (No telemetry)
- GDPR Article 7(3) (Storage classification)
- Spec FR-011 to FR-016 (Privacy Policy requirements)
