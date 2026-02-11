# PRD Gap Analysis & Prioritized Backlog
## Coaching Animator - Missing and Partially Implemented Features

**Generated**: 2026-02-11
**Analysis Basis**: PRD v1.0 (Sections 1-22) vs. Capability Inventory
**Overall Coverage**: 89% (76/85 requirements implemented)

---

## Executive Summary

| Category | Count | Notes |
|----------|-------|-------|
| **P0 Critical Gaps** | 0 | ✅ All P0 requirements implemented |
| **P1 High Gaps** | 2 | Minor gaps with workarounds |
| **P2 Medium Gaps** | 3 | Acceptable deferral |
| **P3 Low Gaps** | 4 | Expected Phase 2 work |
| **Total Gaps** | 9 | 6% of total requirements |

**Risk Assessment**: 🟢 **Low Risk** - No critical blockers, all gaps have workarounds or are Phase 2 features.

---

## P0 Critical Gaps: None ✅

All Priority 0 requirements are fully implemented. The application has no blocking gaps for core functionality.

---

## P1 High Priority Gaps (2 Gaps)

### GAP-001: Safari/iOS Video Export ❌

| Aspect | Details |
|--------|---------|
| **PRD Reference** | F-EXP-01 (partial), related to F-EXP-04 |
| **Current State** | WebM export works on Chrome/Edge, fails on Safari/iOS (no codec support) |
| **Impact** | ~30-40% of mobile users cannot export animations as video |
| **Workaround** | Users can save to cloud and share `/replay/[id]` links (no download needed) |
| **Spec 005 Issue** | HIGH-002 |
| **Estimated Effort** | 2-3 days |
| **Recommended Solution** | Implement GIF export fallback for Safari/iOS using gif.js library |
| **Priority Rationale** | P1 because workaround exists, but degrades UX for iOS coaches |

**Implementation Plan**:
1. Add codec detection in `useExport.ts` (check for WebM support via `MediaRecorder.isTypeSupported()`)
2. If WebM not supported, fall back to GIF export:
   - Use `gif.js` library for client-side GIF encoding
   - Capture frames at 10fps (vs 60fps for WebM) to reduce file size
   - Show format recommendation: "GIF recommended for animations <20 frames"
3. Update export modal UI to show detected format
4. Test on Safari 16+ and iOS 16+

**Cross-Reference**: See Spec 005 `PROGRESS.md` lines 147-182 for detailed implementation notes.

---

### GAP-002: Community Guidelines Page ❌

| Aspect | Details |
|--------|---------|
| **PRD Reference** | F-MOD-10 |
| **Current State** | Terms of Service and Privacy Policy exist, but no Community Guidelines page |
| **Impact** | Users lack clear guidance on acceptable content standards |
| **Workaround** | Terms of Service includes basic content policy (Section 4: Acceptable Use) |
| **Estimated Effort** | 1 hour |
| **Recommended Solution** | Create `/community-guidelines` page in legal layout |

**Implementation Plan**:
1. Create `app/(legal)/community-guidelines/page.tsx`
2. Content sections:
   - Welcome message (grassroots coaches, supportive community)
   - Acceptable content (tactical diagrams, training drills, skill demos)
   - Prohibited content (offensive language, explicit imagery, spam, copyright violations)
   - Reporting process (how to flag inappropriate content)
   - Moderation approach (admin review, warning system, bans)
   - Appeal process (contact email for disputes)
3. Link from footer and moderation-related UI (report modal, admin dashboard)

**Priority Rationale**: P1 because content moderation is active, users should have clear guidelines.

---

## P2 Medium Priority Gaps (3 Gaps)

### GAP-003: Offline Animation Viewing (PWA Caching) ❌

| Aspect | Details |
|--------|---------|
| **PRD Reference** | F-GAL-13 |
| **Current State** | PWA installed, but animation payloads not cached for offline access |
| **Impact** | Coaches cannot view saved animations without internet connection |
| **Workaround** | Coaches can export animations to JSON files for offline access (manual workflow) |
| **Estimated Effort** | 3-5 days |
| **Recommended Solution** | Deferred to Phase 2 (complex cache invalidation strategy required) |

**Implementation Complexity**:
- Requires selective caching strategy (cache recently viewed animations, not all 50)
- Cache invalidation on animation updates
- Storage quota management (IndexedDB limits)
- Sync strategy when back online

**Priority Rationale**: P2 because workaround exists (JSON export), and implementation is complex for marginal benefit.

---

### GAP-004: "My Upvoted" Animations List ❌

| Aspect | Details |
|--------|---------|
| **PRD Reference** | F-SOC-06 |
| **Current State** | Users can upvote animations, but cannot view list of upvoted animations |
| **Impact** | Users cannot revisit animations they appreciated |
| **Workaround** | Coaches can remix (clone) animations to their personal gallery |
| **Estimated Effort** | 4-6 hours |
| **Recommended Solution** | Add `/my-upvotes` page with query on `upvotes` table |

**Implementation Plan**:
1. Create `app/my-upvotes/page.tsx`
2. Query: `SELECT * FROM saved_animations JOIN upvotes ON saved_animations.id = upvotes.animation_id WHERE upvotes.user_id = current_user`
3. Reuse `PublicAnimationCard` component for display
4. Add link in navigation (next to "My Playbook")

**Priority Rationale**: P2 because remix feature provides similar value (users can clone animations they like).

---

### GAP-005: Self-Service Account Deletion UI ❌

| Aspect | Details |
|--------|---------|
| **PRD Reference** | F-AUTH-07 (partial implementation) |
| **Current State** | Database cascade delete exists, but no self-service UI |
| **Impact** | Users cannot delete their own accounts (admin must do it via Supabase console) |
| **Workaround** | Users can contact admin via `/contact` page to request deletion |
| **Estimated Effort** | 4-6 hours |
| **Recommended Solution** | Add "Delete Account" button in profile page with confirmation flow |

**Implementation Plan**:
1. Add "Danger Zone" section to `/profile` page
2. "Delete Account" button triggers confirmation modal:
   - Warning: "This action is permanent and cannot be undone"
   - List consequences: "All your animations, upvotes, and profile data will be deleted"
   - Input field: "Type your email to confirm"
3. API endpoint: `DELETE /api/user/account`
   - Verify user is authenticated
   - Cascade delete via `CASCADE` constraints (existing)
   - Sign out user after deletion
4. GDPR compliance: Send confirmation email after deletion

**Priority Rationale**: P2 because admin deletion is available, but self-service improves GDPR compliance posture.

---

## P3 Low Priority Gaps (4 Gaps)

### GAP-006: Following System (3 Features) 🟡

| Aspect | Details |
|--------|---------|
| **PRD Reference** | F-SOC-10, F-SOC-11, F-SOC-12 (Phase 2) |
| **Current State** | Foundation table (`follows`) exists, no UI or API |
| **Impact** | Users cannot follow coaches or see "Following" feed |
| **Workaround** | None (feature not exposed) |
| **Estimated Effort** | 1-2 weeks (full implementation) |
| **Recommended Solution** | Phase 2 work (documented in PRD Section 20.3) |

**Implementation Plan** (Phase 2):
1. API endpoints:
   - `POST /api/user/follow/:userId` (follow/unfollow)
   - `GET /api/user/followers` (list followers)
   - `GET /api/user/following` (list following)
   - `GET /api/feed/following` (animations from followed users)
2. UI components:
   - "Follow" button on user profile pages
   - Follower/following counts on profiles
   - "Following" tab in navigation
   - Feed page with chronological animations
3. Database: Use existing `follows` table
4. Notifications: Optional email notifications for new followers

**Priority Rationale**: P3 because this is explicitly Phase 2 work in PRD. Foundation exists for future implementation.

---

### GAP-007: .mp4 Export via ffmpeg.wasm ❌

| Aspect | Details |
|--------|---------|
| **PRD Reference** | F-EXP-04 (P3 priority) |
| **Current State** | WebM export only (Chrome/Edge) |
| **Impact** | Users cannot export as .mp4 (more universally compatible format) |
| **Workaround** | WebM works on most modern browsers; users can convert locally if needed |
| **Estimated Effort** | 3-4 days |
| **Recommended Solution** | Deferred (P3 priority, complex implementation) |

**Implementation Complexity**:
- ffmpeg.wasm is large (~10-30 MB, slow initial load)
- Client-side transcoding is slow (2-3x animation duration)
- Memory-intensive (may crash on low-end devices)
- Marginal benefit over WebM or GIF (Safari workaround)

**Priority Rationale**: P3 because Safari gap is better solved with GIF export (GAP-001), and WebM works on 70%+ of browsers.

---

## Partial Implementations (Acceptable State)

### PARTIAL-001: Entity Fade-Out Animation ⚠️

| Aspect | Details |
|--------|---------|
| **PRD Reference** | F-ANI-05 (P1) |
| **Current State** | Entities disappearing in later frames are instantly hidden (no fade-out animation) |
| **Impact** | Less smooth visual transition when entities disappear |
| **Assessment** | Acceptable - fade-out adds visual complexity without clear UX benefit |
| **Recommended Action** | No action required (instant hide is valid design choice) |

---

### PARTIAL-002: Admin "Warn User" Email Notification ⚠️

| Aspect | Details |
|--------|---------|
| **PRD Reference** | F-MOD-07 (P1) |
| **Current State** | Admin can mark user as warned (admin_notes field), but no email sent automatically |
| **Impact** | User doesn't receive notification of warning (admin must email manually) |
| **Assessment** | Acceptable for Phase 1 (admin can send email manually, automation is enhancement) |
| **Recommended Action** | Phase 2: Integrate email service (SendGrid, Postmark) for automated warnings |

---

### PARTIAL-003: Animation Detail Page Redirect ⚠️

| Aspect | Details |
|--------|---------|
| **PRD Reference** | `/gallery/:id` route (Section 21.1) |
| **Current State** | Gallery cards link directly to `/replay/:id`, no separate detail page |
| **Impact** | No intermediate page showing full description, coaching notes, author profile, etc. |
| **Assessment** | Acceptable - replay page shows title, author, upvotes (minimal metadata) |
| **Recommended Action** | Phase 2: Consider detail page if users request expanded metadata view |

---

## Technical Debt & Quality Improvements (Not in PRD)

These gaps are not in the PRD but were identified during capability inventory:

### TECH-001: Staging Environment ⚠️

| Aspect | Details |
|--------|---------|
| **Issue** | MED-003 in Spec 005 |
| **Current State** | No staging branch or environment, all changes deploy directly to production |
| **Impact** | Higher risk of production incidents |
| **Estimated Effort** | 2-3 hours |
| **Recommended Solution** | Set up `staging` branch + Vercel environment |

**Implementation Plan**:
1. Create `staging` branch in GitHub
2. Configure Vercel to auto-deploy `staging` branch to `staging.coaching-animator.app`
3. Duplicate Supabase project for staging (separate database)
4. Update documentation: Use staging for high-risk changes (Auth, Middleware, DB Schema)

---

### TECH-002: DOMPurify Sanitization ⚠️

| Aspect | Details |
|--------|---------|
| **PRD Reference** | Section 21.4 (Input Validation Strategy) |
| **Current State** | Simple regex sanitization in `lib/moderation.ts`, no DOMPurify |
| **Impact** | Lower XSS protection for user-generated content |
| **Assessment** | Acceptable for Phase 1 (no rich text input fields, regex strips HTML tags) |
| **Recommended Action** | Phase 2: Add DOMPurify if rich text editing is introduced |

---

### TECH-003: Editor Layout Refinement ⚠️

| Aspect | Details |
|--------|---------|
| **Issue** | MED-004 in Spec 005 |
| **Current State** | Editor layout feels cluttered, sidebar too wide, timeline cramped |
| **Impact** | Reduced UX quality, harder to focus on canvas |
| **Estimated Effort** | 3-5 hours |
| **Recommended Solution** | UI polish (collapsible sidebar, compact timeline) |

---

### TECH-004: Entity Labeling UX ⚠️

| Aspect | Details |
|--------|---------|
| **Issue** | MED-005 in Spec 005 |
| **Current State** | Label editing workflow unclear, no inline editing hints |
| **Impact** | Users may not discover double-click to edit |
| **Estimated Effort** | 2-3 hours |
| **Recommended Solution** | Add tooltip on hover: "Double-click to edit label" |

---

### TECH-005: Password Strength Indicator ⚠️

| Aspect | Details |
|--------|---------|
| **Issue** | LOW-003 in Spec 005 |
| **Current State** | Basic password requirements (min 8 chars) but no strength meter |
| **Impact** | Users may create weak passwords, reduced security |
| **Estimated Effort** | 1-2 hours |
| **Recommended Solution** | Add visual strength indicator using `zxcvbn` library |

---

## Gap Resolution Roadmap

### Sprint 1: Complete Spec 005 (1-2 weeks)

**Focus**: Close remaining Spec 005 issues (82% → 100%)

| Task | Issue | Effort | Priority |
|------|-------|--------|----------|
| Safari/iOS GIF export | HIGH-002 | 2-3 days | High |
| Staging environment setup | MED-003 | 2-3 hours | Medium |
| Editor layout refinement | MED-004 | 3-5 hours | Medium |
| Entity labeling UX | MED-005 | 2-3 hours | Medium |

**Outcome**: All HIGH-priority issues resolved, Spec 005 complete.

---

### Sprint 2: PRD Gaps + Quality (1-2 weeks)

**Focus**: Address P1 PRD gaps and low-hanging tech debt

| Task | Gap ID | Effort | Priority |
|------|--------|--------|----------|
| Community Guidelines page | GAP-002 | 1 hour | P1 |
| Self-service account deletion | GAP-005 | 4-6 hours | P2 |
| Password strength indicator | TECH-005 | 1-2 hours | Low |
| "My Upvoted" animations list | GAP-004 | 4-6 hours | P2 |

**Outcome**: PRD P1/P2 gaps closed, improved UX quality.

---

### Phase 2: Social Features (4-6 weeks)

**Focus**: Following system, offline caching, advanced moderation

| Task | Gap ID | Effort | Priority |
|------|--------|--------|----------|
| Following system (3 features) | GAP-006 | 1-2 weeks | P3 |
| Offline animation caching | GAP-003 | 3-5 days | P2 |
| Automated warning emails | PARTIAL-002 | 2-3 days | Enhancement |
| Animation detail pages | PARTIAL-003 | 3-4 days | Enhancement |

**Outcome**: Phase 2 social features complete, improved offline support.

---

## Non-Prioritized Gaps (Deferred Indefinitely)

| Gap | Reason for Deferral |
|-----|---------------------|
| .mp4 export via ffmpeg.wasm (GAP-007) | P3 priority, complex implementation, Safari gap solved with GIF |
| Collaborative editing | Out of PRD scope, future consideration |
| Mobile app (React Native) | Out of PRD scope, future consideration |
| Team/organization accounts | Out of PRD scope, future consideration |

---

## Risk Assessment by Gap

| Gap | User Impact | Business Risk | Technical Risk | Overall Risk |
|-----|-------------|---------------|----------------|--------------|
| GAP-001 (Safari export) | High (30-40% users) | Medium (workaround exists) | Low (GIF library mature) | **Medium** |
| GAP-002 (Guidelines) | Low (ToS covers basics) | Low (moderation still works) | None | **Low** |
| GAP-003 (Offline caching) | Medium (convenience) | Low (JSON export works) | High (complex caching) | **Low** |
| GAP-004 (My Upvoted) | Low (remix exists) | None | Low (simple query) | **Low** |
| GAP-005 (Account deletion) | Low (admin can delete) | Medium (GDPR concern) | Low (DB ready) | **Low-Medium** |
| GAP-006 (Following) | None (not exposed) | None | Medium (new features) | **None** |
| GAP-007 (.mp4 export) | Low (WebM works) | None | High (large library) | **Low** |

**Overall Risk**: 🟢 **Low** - No high-risk gaps, all have workarounds or are Phase 2.

---

## Recommendations Summary

### Immediate (Next Sprint)

1. ✅ **Complete Spec 005** (4 remaining issues)
   - Prioritize HIGH-002 (Safari export) if iOS users are significant
   - MED-003 (staging) for deployment safety

2. ✅ **Add Community Guidelines** (GAP-002)
   - 1-hour effort, clarifies content policy

### Short-Term (1-2 Months)

1. **Close P2 PRD Gaps** (GAP-004, GAP-005)
   - Self-service account deletion for GDPR compliance
   - "My Upvoted" list for user convenience

2. **Technical Debt** (TECH-003, TECH-004, TECH-005)
   - Editor layout and labeling UX improvements
   - Password strength indicator

### Long-Term (Phase 2)

1. **Following System** (GAP-006)
   - 3 features, 1-2 weeks effort
   - Foundation exists, ready to implement

2. **Offline Caching** (GAP-003)
   - Complex, 3-5 days effort
   - Requires careful strategy

---

## Conclusion

The Coaching Animator has **excellent PRD coverage (89%)** with only **2 P1 gaps** (both minor with workarounds). All critical functionality is implemented, and remaining gaps are:

- ✅ **Low-risk**: No P0 gaps, all P1 gaps have workarounds
- ✅ **Well-documented**: All gaps tracked in Spec 005 or this document
- ✅ **Manageable**: Total remaining effort ~2-3 weeks across all gaps

**Recommendation**: Continue with Spec 005 completion (focus on HIGH-002 Safari export), then address GAP-002 (Community Guidelines) and GAP-005 (self-service deletion) for improved UX and GDPR compliance.

---

**Document End**
