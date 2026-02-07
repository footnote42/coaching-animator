# Implementation Plan: Post-Launch Improvements

**Branch**: `004-post-launch-improvements` | **Date**: 2026-01-30 | **Spec**: [ISSUES_REGISTER.md](./ISSUES_REGISTER.md), [implementation-plan.md](./implementation-plan.md)

## Summary

This plan consolidates 50 issues from two sources—systematic technical review (33 issues) and user observation testing (17 issues)—into a unified implementation roadmap. The project is functionally complete with all 9 user stories from 003-online-platform implemented, but critical reliability, UX, and architecture issues must be addressed before scaling to production traffic.

---

## Technical Context

**Language/Version**: TypeScript 5.x, React 18, Next.js 14  
**Primary Dependencies**: Zustand, Konva/react-konva, Supabase (Auth + Database + Storage), TailwindCSS  
**Storage**: PostgreSQL via Supabase, localStorage for offline  
**Testing**: Vitest, Playwright (configured but not in CI)  
**Target Platform**: Web (desktop-first, mobile-responsive)  
**Performance Goals**: <500ms gallery load, <5ms rate limit check, 60fps canvas  
**Constraints**: Offline-first core (Tier 1 sacred), <200KB JS bundle for landing  
**Scale/Scope**: 10K users, 50 animations/user, public gallery with moderation

---

## Constitution Check

*GATE: Must pass before implementation. Verified against constitution.md v3.0.0*

| Principle | Status | Notes |
|-----------|--------|-------|
| **I. Modular Architecture** | ✅ PASS | All fixes maintain component isolation |
| **II. Rugby-Centric Design** | ✅ PASS | Entity system improvements use sport terminology |
| **III. Intuitive UX** | ✅ PASS | Onboarding, error messages, navigation all improve UX |
| **IV. Warm Tactical Professionalism** | ✅ PASS | Color palette refinement aligns with tokens |
| **V. Privacy-First Architecture** | ✅ PASS | No new data collection; offline core preserved |
| **V.1 Tier 1 Sacred** | ✅ PASS | Offline fallback mode strengthens this |
| **V.6 Absolute Prohibitions** | ✅ PASS | No analytics/telemetry added (P3 backlog only) |
| **VI. Grassroots Coach Advocacy** | ✅ PASS | All improvements serve coach usability |

**GATE PASSED** - No constitution violations.

---

## Issue Sources Consolidated

### Source 1: Technical Review (ISSUES_REGISTER.md)
33 issues across 6 dimensions discovered during systematic end-to-end review:
- **Product/UX**: 8 issues (UX-001 to UX-008)
- **Architecture**: 8 issues (ARCH-001 to ARCH-008)
- **Media**: 7 issues (MEDIA-001 to MEDIA-007)
- **Reliability**: 10 issues (REL-001 to REL-010)
- **Scalability**: 8 issues (SCALE-001 to SCALE-008)
- **Operations**: 9 issues (OPS-001 to OPS-009)

### Source 2: User Observations (implementation-plan.md)
17 issues in 6 Work Packages discovered during hands-on testing:
- **WP1 Critical Bugs**: Share Link broken (405), Replay rendering incorrect, playback not smooth
- **WP2 Navigation**: No nav from editor, site-wide navigation poor
- **WP3 Entity System**: Tokens too large, naming confusing, cone redesign, color palette, tackle equipment, spawn positions
- **WP4 Editor Polish**: Button styling, possession dropdown, white space
- **WP5 Pitch Layouts**: Full/Attack/Defence/Training layouts needed
- **WP6 Content Fixes**: British English, profile counter, description fields, replay page design

---

## Priority Summary

| Priority | Count | Source Split | Timeline |
|----------|-------|--------------|----------|
| **P0 Critical** | 6 | 3 tech + 3 user | Before public launch |
| **P1 High** | 18 | 9 tech + 9 user | Within 2 weeks |
| **P2 Medium** | 17 | 12 tech + 5 user | Within 1 month |
| **P3 Backlog** | 9 | 9 tech + 0 user | Future iterations |

---

## P0 Critical Issues (Block Deployment)

| ID | Issue | Source | Impact |
|----|-------|--------|--------|
| WP1-1 | Share Link API broken (405 error) | User Obs | Core sharing feature broken |
| WP1-2 | Replay viewer renders entities incorrectly | User Obs | Shared animations look wrong |
| WP1-3 | Replay playback not smooth | User Obs | Poor viewing experience |
| REL-001 | No retry logic for API calls | Tech Review | Data loss risk |
| REL-010 | No animation payload validation | Tech Review | Security vulnerability (XSS) |
| ARCH-001 | Database-based rate limiting | Tech Review | 50-100ms latency per request |

---

## P1 High Priority Issues

| ID | Issue | Source |
|----|-------|--------|
| WP2-1 | No navigation from /app editor | User Obs |
| WP2-2 | Site-wide navigation poor | User Obs |
| WP3-1 | Entity tokens too large | User Obs |
| WP3-2 | Default entity naming confusing | User Obs |
| WP3-3 | Cone entities need redesign | User Obs |
| WP3-4 | Color palette needs refinement | User Obs |
| WP3-5 | New entity types needed (tackle equipment) | User Obs |
| WP3-6 | Entity spawn positions not contextual | User Obs |
| WP4-1 | Button styling inconsistencies | User Obs |
| MEDIA-001 | WebM-only export (Safari/iOS broken) | Tech Review |
| UX-003/MEDIA-002 | No animation thumbnails | Tech Review |
| REL-008 | No offline fallback mode | Tech Review |
| SCALE-001 | N+1 query in gallery | Tech Review |
| UX-001 | No onboarding experience | Tech Review |
| OPS-003 | No health check endpoint | Tech Review |
| SCALE-002 | No pagination on My Gallery | Tech Review |
| UX-002 | Guest mode limits unclear | Tech Review |
| UX-008 | Error messages technical | Tech Review |

---

## P2 Medium Priority Issues

| ID | Issue | Source |
|----|-------|--------|
| WP4-2 | Possession dropdown no background | User Obs |
| WP4-3 | White space around pitch | User Obs |
| WP5-1 | Pitch layout options needed | User Obs |
| WP6-1 | British English spelling | User Obs |
| WP6-2 | Profile animation counter broken | User Obs |
| WP6-3 | Edit modal missing description | User Obs |
| WP6-4 | Replay page missing description | User Obs |
| WP6-5 | Replay page visual design plain | User Obs |
| REL-002 | Autosave quota check | Tech Review |
| REL-003 | Upvote race condition | Tech Review |
| ARCH-003 | Payload size validation | Tech Review |
| ARCH-005 | State lost during auth redirects | Tech Review |
| REL-005 | Email verification resend | Tech Review |
| REL-006 | Banned user gallery access | Tech Review |
| REL-007 | Cache invalidation | Tech Review |
| REL-009 | Moderation blocklist hardcoded | Tech Review |
| OPS-001 | No staging environment | Tech Review |
| OPS-002 | Manual database migrations | Tech Review |
| OPS-004 | No automated testing in CI | Tech Review |
| OPS-007 | No backup documentation | Tech Review |

---

## P3 Backlog (Future Iterations)

Reference only - no tasks generated:
- UX-005: Bulk operations in My Gallery
- UX-006: Mobile canvas optimization
- UX-007: Save as Draft workflow
- ARCH-006: API versioning
- ARCH-007: Middleware optimization
- ARCH-008: Migration rollback strategy
- MEDIA-003: Export resolution options
- MEDIA-004: Animation compression
- MEDIA-005: GIF export
- MEDIA-006: Export progress indicator
- MEDIA-007: Canvas rendering optimization
- REL-004: Concurrent edit detection
- SCALE-003: Composite database indexes
- SCALE-004: Rate limit table cleanup
- SCALE-005: Monitoring/observability
- SCALE-006: Configurable limits
- SCALE-007: Code splitting
- SCALE-008: Type consolidation
- OPS-005: Error tracking
- OPS-006: Analytics
- OPS-008: Feature flags
- OPS-009: Performance budgets

---

## Implementation Phases

### Phase 1: Critical Fixes (P0)
**Tasks**: T101-T106  
**Time**: 3-5 days  
**Goal**: Fix data loss, security, broken features, and performance issues

### Phase 2: High Priority (P1) - Part A
**Tasks**: T107-T118  
**Time**: 1 week  
**Goal**: Navigation overhaul, entity system improvements

### Phase 3: High Priority (P1) - Part B
**Tasks**: T119-T130  
**Time**: 1 week  
**Goal**: Media export, thumbnails, offline mode, UX improvements

### Phase 4: Medium Priority (P2)
**Tasks**: T131-T148  
**Time**: 2-3 weeks  
**Goal**: Polish, pitch layouts, content fixes, operations

---

## Key Risks

1. **Replay Rendering**: May require significant refactoring if logic deeply diverged from editor
2. **Navigation Integration**: Could break existing layouts if not carefully implemented
3. **Tackle Equipment**: New entity types may expose edge cases in existing logic
4. **Pitch Layouts**: Requires careful coordinate mapping for different views

---

## Success Metrics

### Functional
- 0 critical bugs (Share Link, Replay, API calls work)
- 100% pages have consistent navigation
- API retry success rate >90%
- Safari/iOS users can export MP4

### Performance
- Rate limit check <5ms (vs 50-100ms)
- Gallery queries: 1-2 (vs 40+)
- Gallery response <500ms

### Quality
- British English throughout
- User-friendly error messages
- Onboarding tutorial completion >60%

---

**Plan Version**: 2.0 (Consolidated)  
**Created**: 2026-01-30  
**Status**: Ready for Task Generation
