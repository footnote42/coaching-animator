# Post-Launch Improvements

**Spec ID**: 004-post-launch-improvements  
**Created**: 2026-01-30  
**Status**: Ready for Implementation  
**Priority**: P0/P1 tasks critical before public launch

---

## Overview

This specification documents 33 issues identified during a systematic end-to-end review of the coaching animation platform after completing all 111 tasks from the online platform build (spec 003). The review covered 6 dimensions: Product/UX, Architecture, Media, Reliability, Scalability, and Operations.

**Key Finding**: The project is functionally complete with all 9 user stories implemented, but several critical reliability and architecture issues must be addressed before scaling to production traffic.

---

## Documents

1. **`ISSUES_REGISTER.md`** - Comprehensive issue catalog with 33 issues across 6 dimensions
2. **`tasks.md`** - 24 actionable tasks prioritized by impact and effort
3. **`PROGRESS.md`** - Session tracking template for implementation progress

---

## Priority Breakdown

- **P0 (Critical)**: 3 issues - Must fix before public launch
  - REL-001: No retry logic for API calls (data loss risk)
  - REL-010: No animation payload validation (security vulnerability)
  - ARCH-001: Database-based rate limiting (performance bottleneck)

- **P1 (High)**: 9 issues - Fix within 2 weeks of launch
  - MEDIA-001: WebM-only export (Safari/iOS broken)
  - UX-003: No animation previews in gallery
  - REL-008: No offline fallback mode
  - SCALE-001: N+1 query problem in gallery
  - UX-001: No onboarding experience
  - OPS-003: No health check endpoint
  - And 3 more...

- **P2 (Medium)**: 12 issues - Fix within 1 month
- **P3 (Low)**: 9 issues - Backlog for future iterations

---

## Implementation Phases

### Phase 1: Critical Fixes (P0)
**Tasks**: T001-T003  
**Time**: 3-5 days  
**Goal**: Fix data loss, security, and performance issues

### Phase 2: High Priority (P1)
**Tasks**: T004-T012  
**Time**: 1-2 weeks  
**Goal**: Fix broken features, improve UX, enable monitoring

### Phase 3: Medium Priority (P2)
**Tasks**: T013-T024  
**Time**: 2-3 weeks  
**Goal**: Polish UX, reduce technical debt, improve operations

---

## Quick Start

1. **Review the issues**: Read `ISSUES_REGISTER.md` to understand all identified problems
2. **Validate findings**: Run validation steps for P0/P1 issues in your environment
3. **Triage with team**: Confirm priorities based on business goals
4. **Start Phase 1**: Begin with T001 (retry logic) - highest data loss risk
5. **Track progress**: Update `PROGRESS.md` after each session

---

## Key Risks

1. **Data Loss**: Users lose work when API calls fail (no retry logic)
2. **Security**: Unvalidated payloads could enable XSS attacks
3. **Performance**: Database rate limiting will bottleneck at scale
4. **iOS Users**: 30%+ of users can't use video export (WebM-only)

---

## Success Metrics

### Phase 1 (P0) Success Criteria
- API calls automatically retry on network failure
- Malformed animation payloads rejected with validation errors
- Rate limit checks use cache (<5ms vs 50-100ms)

### Phase 2 (P1) Success Criteria
- Safari/iOS users can export as MP4
- Gallery cards show visual thumbnails
- Editor works offline when Supabase unavailable
- Gallery queries optimized (1-2 queries vs 40+)
- New users see onboarding tutorial
- `/api/health` endpoint available for monitoring

---

## Related Specifications

- **003-online-platform**: Baseline implementation (111 tasks complete)
- **002-clean-iteration**: Design system and offline features
- **001-rugby-animation-tool**: Original MVP specification

---

## Notes

- All issues include validation steps to confirm they exist
- Tasks reference issue IDs for traceability
- Commit messages should reference task IDs (e.g., "Fix: Add retry logic [REL-001] (T001)")
- Some P2/P3 issues may be promoted based on user feedback

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-30  
**Next Review**: After Phase 1 completion
