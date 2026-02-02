# Spec 005: Incremental Improvements

**Status**: 🔄 In Progress (3/14 complete)
**Created**: 2026-02-01
**Approach**: Incremental, pick-and-choose improvements
**Source**: Verification of spec 004 + User observations

---

## Overview

This specification consolidates unfinished work from spec 004 and newly identified issues into a backlog of incremental improvements. Each issue is risk-assessed using industry-standard severity ratings to help prioritize work.

**Key Principle**: Pick issues to address at your own pace. No pressure to complete everything at once.

---

## Risk Rating System

We use the **CVSS-inspired** severity scale commonly used in software security and quality management:

| Rating | Icon | Industry Term | What It Means (Plain English) |
|--------|------|---------------|-------------------------------|
| **CRITICAL** | 🔴 | P0 / Sev-1 | **Users lose data or can't use core features.** Fix ASAP or don't deploy. |
| **HIGH** | 🟠 | P1 / Sev-2 | **Major features broken or missing.** Significant user frustration. Fix soon. |
| **MEDIUM** | 🟡 | P2 / Sev-3 | **Annoying but not blocking.** Users can work around it. Fix when convenient. |
| **LOW** | 🟢 | P3 / Sev-4 | **Nice to have.** Polish and refinement. Fix during slow periods. |

**Impact Categories**:
- 💾 **Data Loss**: Users lose their work
- 🚫 **Feature Broken**: Advertised feature doesn't work
- 🐌 **Performance**: Slow or inefficient
- 😕 **UX Issue**: Confusing or frustrating
- 🎨 **Polish**: Visual or minor refinement

---

## Issue Backlog

### 🔴 CRITICAL Issues (Fix Before Production)

#### ~~CRIT-001: Save Operations Have No Retry Logic~~ ✅ FIXED
- **Status**: ✅ **FIXED** (2026-02-02, Commit: 2d1f71f)
- **Risk**: 🔴 CRITICAL
- **Impact**: 💾 Data Loss
- **Resolution**: Added `onRetry` callback to `api-client.ts` and wired up retry progress UI in SaveToCloudModal

#### ~~CRIT-002: Gallery Fails on Network Issues~~ ✅ FIXED
- **Status**: ✅ **FIXED** (2026-02-02, Commit: 2a44101)
- **Risk**: 🔴 CRITICAL
- **Impact**: 🚫 Feature Broken
- **Resolution**: Applied same retry progress pattern to Gallery page with banner UI

---

### 🟠 HIGH Priority Issues (Major Features)

#### ~~HIGH-001: No Site-Wide Navigation~~ ✅ FIXED
- **Status**: ✅ **FIXED** (2026-02-02, Commits: 121ddc6, 5a491c6, 13ba6cc, 651f850)
- **Risk**: 🟠 HIGH
- **Impact**: 😕 UX Issue
- **Resolution**: Added Navigation to root layout, removed duplicates from pages, refactored legal and auth layouts. Navigation now appears consistently on all pages with auth-aware role-based links.

#### HIGH-002: Safari/iOS Users Can't Export Animations
- **Risk**: 🟠 HIGH
- **Impact**: 🚫 Feature Broken
- **Source**: Verification T127-T128
- **Plain English**: Safari and iOS don't support WebM video format. About 30% of users can't export their animations at all.
- **User Impact**: Critical for 30% of users - Complete feature failure
- **Effort**: High (2-3 days) - Implement browser detection and GIF/MP4 fallback
- **Files**: `lib/browser-detect.ts` (new), `src/hooks/useExport.ts`
- **Fix**: Detect Safari/iOS and export as GIF or MP4 instead

#### HIGH-003: Tackle Equipment Feature Missing
- **Risk**: 🟠 HIGH
- **Impact**: 🚫 Feature Broken
- **Source**: Verification T121-T126
- **Plain English**: Spec 004 claimed to add tackle shields and tackle bags, but they're completely missing from the code.
- **User Impact**: Medium - Promised feature doesn't exist
- **Effort**: High (3-4 days) - Add entity types, rendering, and UI
- **Files**: `src/types/index.ts`, `src/components/Canvas/PlayerToken.tsx`, `src/components/Sidebar/EntityPalette.tsx`
- **Fix**: Either implement fully or remove from documentation

#### HIGH-004: Password Reset Not Implemented
- **Risk**: 🟠 HIGH
- **Impact**: 🚫 Feature Broken
- **Source**: User observation
- **Plain English**: Users who forget their password have no way to reset it. They're permanently locked out of their account.
- **User Impact**: Critical for affected users - Account lockout
- **Effort**: Medium (1-2 days) - Add password reset flow with Supabase
- **Files**: `app/(auth)/reset-password/page.tsx` (new), API routes
- **Fix**: Implement Supabase password reset flow

#### HIGH-005: Individual Animation Sharing Broken
- **Risk**: 🟠 HIGH
- **Impact**: 🚫 Feature Broken
- **Source**: User observation
- **Plain English**: Sharing works from the public gallery, but users can't share their own animations from the editor (/app). The share button doesn't work.
- **User Impact**: High - Can't share work with others
- **Effort**: Medium (1-2 days) - Fix share functionality in editor
- **Files**: `app/app/page.tsx`, share modal components
- **Fix**: Wire up share functionality from editor

---

### 🟡 MEDIUM Priority Issues (Annoying but Workable)

#### MED-001: Replay Playback Performance Poor
- **Risk**: 🟡 MEDIUM
- **Impact**: 🐌 Performance
- **Source**: Verification T103
- **Plain English**: Replay uses `setTimeout` instead of `requestAnimationFrame`, making playback choppy and inefficient.
- **User Impact**: Medium - Playback looks unprofessional
- **Effort**: Low (2-3 hours) - Replace setTimeout with requestAnimationFrame
- **Files**: `app/replay/[id]/ReplayViewer.tsx`
- **Fix**: Use `requestAnimationFrame` for smooth 60fps playback

#### MED-002: Replay Page Layout Lacks Polish
- **Risk**: 🟡 MEDIUM
- **Impact**: 🎨 Polish
- **Source**: User observation
- **Plain English**: The replay page doesn't have pitch markings and looks less polished than the editor. Animation playback isn't smooth.
- **User Impact**: Medium - Looks unprofessional compared to editor
- **Effort**: Medium (1 day) - Add pitch markings, improve layout
- **Files**: `app/replay/[id]/ReplayViewer.tsx`, `app/replay/[id]/page.tsx`
- **Fix**: Use same Field component as editor, improve styling

#### MED-003: Staging Environment Configuration Missing
- **Risk**: 🟡 MEDIUM
- **Impact**: 🚫 Feature Broken (DevOps)
- **Source**: Verification T168
- **Plain English**: The `.env.staging` file doesn't exist, so we can't deploy to a staging environment for testing before production.
- **User Impact**: None (internal) - But increases risk of production bugs
- **Effort**: Low (1 hour) - Create .env.staging file
- **Files**: `.env.staging` (new)
- **Fix**: Create staging environment configuration

#### MED-004: Editor Layout Needs Refinement
- **Risk**: 🟡 MEDIUM
- **Impact**: 😕 UX Issue
- **Source**: User observation
- **Plain English**: The editor layout (/app) feels cramped or unbalanced. Needs visual refinement.
- **User Impact**: Medium - Slightly frustrating to use
- **Effort**: Medium (1-2 days) - Adjust spacing, sizing, layout
- **Files**: `app/app/page.tsx`, editor components
- **Fix**: Review and refine layout spacing and proportions

#### MED-005: Entity Labeling Needs Refinement
- **Risk**: 🟡 MEDIUM
- **Impact**: 😕 UX Issue
- **Source**: User observation
- **Plain English**: The way entities are labeled (Att 01, Def 01, etc.) could be clearer or more intuitive.
- **User Impact**: Medium - Slightly confusing
- **Effort**: Low (2-4 hours) - Improve naming convention
- **Files**: `src/store/projectStore.ts`
- **Fix**: Review and improve default entity naming

---

### 🟢 LOW Priority Issues (Nice to Have)

#### LOW-001: Cone Visual Thickness
- **Risk**: 🟢 LOW
- **Impact**: 🎨 Polish
- **Source**: User observation
- **Plain English**: Cones are now hollow circles (good!) but the circle outline is too thin and hard to see.
- **User Impact**: Low - Minor visual issue
- **Effort**: Very Low (30 minutes) - Increase stroke width
- **Files**: `src/components/Canvas/PlayerToken.tsx`
- **Fix**: Increase `strokeWidth` for cone rendering

#### LOW-002: Pitch Layout Type Missing from Types
- **Risk**: 🟢 LOW
- **Impact**: 🐌 Performance (TypeScript)
- **Source**: Verification T149
- **Plain English**: The PitchLayout type isn't defined in the types file, even though the feature exists. This is a TypeScript hygiene issue.
- **User Impact**: None (developer only)
- **Effort**: Very Low (15 minutes) - Add type definition
- **Files**: `src/types/index.ts`
- **Fix**: Add `type PitchLayout = 'standard' | 'attack' | 'defence' | 'training'`

---

## Unverified Tasks from Spec 004

The following tasks were marked complete but need verification through browser testing:

### ⚠️ Needs Browser Testing (16 tasks)

- **T102**: ReplayViewer uses Field component
- **T108**: API routes validate payloads with Zod
- **T116-T120**: Entity sizing and naming improvements
- **T129**: Export format selector UI
- **T132-T134**: Thumbnail integration in cards
- **T137-T139**: Offline banner, N+1 fix, pagination
- **T141, T143, T145**: Onboarding integration, guest limit banner, error messages
- **T146-T148**: Editor polish (buttons, dropdowns, texture)
- **T150, T154**: Field component layouts, pitch selector UI
- **T155-T159**: British English, profile counter, description field
- **T160-T165**: Autosave quota, upvote debounce, payload size, auth persistence, email resend, ban check
- **T166-T167**: Cache headers, blocklist database

**Recommendation**: Test these in browser during normal usage. If they work, great! If not, add to this backlog.

---

## Summary Statistics

| Priority | Count | Status | Recommended Timeline |
|----------|-------|--------|---------------------|
| 🔴 CRITICAL | 2 | ✅ Complete | ~~Fix before any production deployment~~ |
| 🟠 HIGH | 5 | 📋 Pending | Fix within 1-2 weeks |
| 🟡 MEDIUM | 5 | 📋 Pending | Fix within 1-2 months |
| 🟢 LOW | 2 | 📋 Pending | Fix during slow periods |
| ⚠️ Unverified | 16 | 📋 Pending | Test during normal usage |

**Total Identified Issues**: 14  
**Completed**: 2/14 (14%)  
**Remaining**: 12 issues (plus 16 unverified)

---

## Recommended Approach

### ~~Week 1: Critical Fixes~~ ✅ COMPLETE
1. ~~CRIT-001: Wire up retry logic to SaveToCloudModal (2-4 hours)~~ ✅ DONE
2. ~~CRIT-002: Wire up retry logic to gallery (2-4 hours)~~ ✅ DONE
3. ~~Test both thoroughly with network throttling~~ ⏳ Pending production testing

### Week 2-3: High Priority Features
Pick 1-2 from:
- HIGH-001: Add navigation (1 day)
- HIGH-004: Password reset (1-2 days)
- HIGH-005: Fix individual sharing (1-2 days)

### Week 4+: Medium Priority Polish
Pick issues as time allows:
- MED-001: Replay performance (2-3 hours)
- MED-004: Editor layout (1-2 days)
- MED-005: Entity labeling (2-4 hours)

### Ongoing: Low Priority
- Fix during slow periods or when touching related code

---

## How to Use This Spec

1. **Pick an issue** from the backlog based on priority and available time
2. **Create a task** in your task tracker or just note it
3. **Implement the fix** following the guidance in the issue description
4. **Test thoroughly** in browser with real usage scenarios
5. **Mark as complete** and move to next issue

**No pressure to complete everything.** This is a living backlog for incremental improvements.

---

## Related Documents

- [ISSUES_REGISTER.md](./ISSUES_REGISTER.md) - Detailed issue descriptions with validation steps
- [../004-post-launch-improvements/VERIFICATION.md](../004-post-launch-improvements/VERIFICATION.md) - Source verification report
- [PROGRESS.md](./PROGRESS.md) - Track progress on selected issues

---

**Next Steps**:
1. Review this backlog
2. Pick 1-2 critical issues to start with
3. Create ISSUES_REGISTER.md with detailed descriptions
4. Begin implementation at your own pace
