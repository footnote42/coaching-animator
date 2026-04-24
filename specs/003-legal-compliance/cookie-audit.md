# Cookie & Storage Audit Report

**Date**: 2026-04-24  
**Status**: In Progress  
**Audited Routes**: / (landing), /terms, /privacy, /contact

---

## Summary

Detailed audit of all cookies, local storage, session storage, and other browser storage mechanisms found on public routes.

---

## Findings

### Cookies Discovered

| Name | Source | Classification | Legal Basis | Retention | Notes |
|------|--------|----------------|-------------|-----------|-------|
| (To be completed during manual audit) | | | | | |

### Local Storage

| Key | Source | Purpose | Classification | Retention | Notes |
|-----|--------|---------|----------------|-----------|-------|
| (To be completed during manual audit) | | | | | |

### Session Storage

| Key | Source | Purpose | Classification | Retention | Notes |
|-----|--------|---------|----------------|-----------|-------|
| (To be completed during manual audit) | | | | | |

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

**Status**: Pending completion of audit (task T011–T015)

- [ ] Banner required (consent-required cookies found)
- [ ] No banner needed (only strictly necessary cookies)

---

## GDPR Compliance Notes

- **Data Processors**: Supabase (auth tokens), Vercel (hosting, no analytics)
- **Data Retention**: Per Constitution § V.3 (30-day deletion window)
- **User Rights**: Access, export, delete available via Supabase auth flow
- **Documentation**: Privacy Policy updated in US3 (T025–T027)

---

## Next Steps

1. **T011**: Manual audit of landing page (/) — cookies, localStorage, sessionStorage
2. **T012**: Manual audit of /terms, /privacy, /contact pages
3. **T013**: Classify each item per GDPR Article 7(3)
4. **T014**: Complete findings table (this doc)
5. **T015**: Make banner decision

---

## References

- Constitution § V.3 (Data deletion timeline)
- Constitution § V.6 (No telemetry)
- GDPR Article 7(3) (Storage classification)
- Spec FR-011 to FR-016 (Privacy Policy requirements)
