# Issues Register: Incremental Improvements

**Spec**: 005-incremental-improvements
**Created**: 2026-02-01
**Last Updated**: 2026-02-07
**Status**: 18/19 Complete (95%)

---

## 📋 Open Issues Requiring Action

### 🟠 HIGH-002: Safari/iOS Users Can't Export Animations

**Risk**: 🟠 HIGH
**Impact**: 🚫 Feature Broken (30% of users affected)
**Effort**: High (2-3 days)
**Status**: 📋 **OPEN**

#### Description

The export functionality only generates WebM format, which Safari and iOS don't support. Approximately 30% of users (all Safari/iOS users) cannot export their animations at all.

#### Current Behavior

1. Safari/iOS user creates animation
2. User clicks "Export"
3. WebM file generated
4. Browser can't play or download WebM
5. **User cannot export their work**

#### Expected Behavior

1. System detects Safari/iOS browser
2. User clicks "Export"
3. System generates GIF or MP4 instead of WebM
4. User can download and view their animation

#### Files to Create/Modify

- `lib/browser-detect.ts` (new) - Detect Safari/iOS
- `src/hooks/useExport.ts` - Add GIF/MP4 export logic
- Export modal component - Show format based on browser

#### Implementation Steps

1. Create browser detection utility
2. Research GIF generation library (e.g., gif.js)
3. Research MP4 generation (may need server-side)
4. Implement fallback export logic
5. Update export UI to show format

#### Validation Steps

1. **On Chrome/Firefox**:
   - Export animation
   - Verify: WebM format generated
   - Verify: Video plays correctly

2. **On Safari (macOS)**:
   - Export animation
   - Verify: GIF or MP4 format generated
   - Verify: File downloads and plays

3. **On iOS Safari**:
   - Export animation
   - Verify: GIF or MP4 format generated
   - Verify: File downloads and plays

#### Success Criteria

- ✅ Safari users can export animations
- ✅ iOS users can export animations
- ✅ Export format appropriate for browser
- ✅ Exported files play correctly on all platforms

---

### 🟢 LOW-002: Pitch Layout Type Missing from Types

**Risk**: 🟢 LOW
**Impact**: 🐌 Performance (TypeScript)
**Effort**: Very Low (15 minutes)
**Status**: 📋 **OPEN** (Can be deferred)

#### Description

The `PitchLayout` type isn't defined in the types file, even though the feature exists. This is a TypeScript hygiene issue with no user impact.

#### Current Behavior

- PitchLayout type not defined
- TypeScript may show errors
- Code less maintainable

#### Expected Behavior

- PitchLayout type properly defined
- No TypeScript errors
- Code more maintainable

#### Files to Modify

- `src/types/index.ts`

#### Implementation Steps

1. Add type definition:
   ```typescript
   export type PitchLayout = 'standard' | 'attack' | 'defence' | 'training';
   ```
2. Update any components using pitch layouts
3. Verify TypeScript errors resolved

#### Validation Steps

1. Run `npx tsc --noEmit`
2. Verify: No TypeScript errors
3. Verify: Type autocomplete works

#### Success Criteria

- ✅ PitchLayout type defined
- ✅ No TypeScript errors
- ✅ Type autocomplete works

---

## ✅ Completed Issues (18 Total)

### 🔴 CRITICAL Issues (2/2 Complete)

#### CRIT-001: Save Operations Have No Retry Logic ✅ FIXED

**Completed**: 2026-02-02 | **Commit**: 2d1f71f

Added `onRetry` callback to `api-client.ts` and wired up retry progress UI in SaveToCloudModal. Users now see "Retrying... (1/3)" during save operations.

---

#### CRIT-002: Gallery Fails on Network Issues ✅ FIXED

**Completed**: 2026-02-02 | **Commit**: 2a44101

Applied same retry progress pattern to Gallery page with banner UI. Gallery now retries on network failures with visible progress.

---

### 🟠 HIGH Priority Issues (5/6 Complete)

#### HIGH-001: No Site-Wide Navigation ✅ FIXED

**Completed**: 2026-02-02 | **Commits**: 121ddc6, 5a491c6, 13ba6cc, 651f850

Added Navigation to root layout, removed duplicates from pages, refactored legal and auth layouts. Navigation now appears consistently on all pages with auth-aware role-based links.

---

#### HIGH-003: Tackle Equipment Feature ✅ IMPLEMENTED (with 1 refinement needed)

**Status**: ✅ 95% Complete (verified 2026-02-09)

**What's Implemented**:
- ✅ Type definitions: `tackle-shield` and `tackle-bag` in EntityType (src/types/index.ts:157-158)
- ✅ Rendering: Rect with 4-way rotation for shield, Ellipse for bag (PlayerToken.tsx:210-235)
- ✅ Entity colors: High-vis red (shield) and purple (bag) defaults (entityColors.ts:17-18)
- ✅ Creation handlers: UI buttons in Equipment section (EntityPalette.tsx:98-118)
- ✅ Schema validation: Includes tackle types with optional orientation field (animations.ts:14,21)
- ✅ Save to cloud: Works correctly (fixed in CRIT-003, 2026-02-09)
- ✅ Replay viewer: Renders tackle equipment correctly (shared canvas components)

**Status**: Feature complete and functional for production use.

**Future Enhancement** (tracked separately):
- **ENH-001**: Orientation Control UI for tackle-shields
  - **Priority**: Low
  - **Effort**: ~30 minutes
  - **Details**: Add 4-button selector (↑↓←→) in EntityProperties.tsx
  - **Current Workaround**: Users delete and recreate to change orientation
  - See "Future Enhancements" section below for full details

---

#### HIGH-004: Password Reset & Profile Password Management ✅ FIXED

**Status**: ✅ **FIXED** (2026-02-09)

#### Description

The password reset flow was previously reported as "going through the motions" but not persisting changes. Additionally, the profile page had UI bugs preventing reliable password updates.

#### Resolution

1.  **Profile Page UI Fixes**: Resolved a syntax error and conditional visibility bug that was hiding the password form.
2.  **Set Password for OAuth Users**: Implemented a new "Set Password" flow in `profile/page.tsx` for users who sign up via Google but want to add an email/password credential later.
3.  **Consistent Password Updates**: Standardized the use of `supabase.auth.updateUser({ password })` across the profile and reset-password pages.
4.  **Verified Flow**: Confirmed that password updates now persist and allow users to authenticate with their new credentials.

#### Files Modified

- `src/app/profile/page.tsx`
- `src/app/(auth)/reset-password/page.tsx`

#### Success Criteria

- ✅ Users can set a password if they only have an OAuth identity
- ✅ Users can change an existing password via the profile page
- ✅ Password reset flow via email link correctly updates the user record
- ✅ No UI errors or hidden forms in the password management section

---

#### HIGH-005: Individual Animation Sharing & Replay Broken ✅ FIXED

**Completed**: 2026-02-05

**Resolution**:
- Fixed 404 on share links (fallback to `shares` table)
- Implemented rich V2 payload supporting all entity types
- Increased payload limit to 500KB
- Created backward-compatible `hydrateSharePayload()` utility
- Verified anonymous users can open shared links

---

#### HIGH-006: Mobile Playback Optimization & Compact View ✅ FIXED

**Completed**: 2026-02-07 | **Commit**: 5215d9a

**Resolution**:
- Created `useCanvasSize` hook for responsive canvas sizing (280px-800px)
- Implemented touch-friendly controls (≥48px targets)
- Added landscape orientation hint
- Responsive page header and metadata stacking
- **Testing**: 10 unit tests + 12 E2E tests across 3 browsers (Chromium, Firefox, WebKit)

---

### 🟡 MEDIUM Priority Issues (8/8 Complete)

#### MED-001: Replay Playback Performance Poor ✅ FIXED

**Completed**: 2026-02-05 | **Commit**: 780a928

Created store-free `useReplayAnimationLoop` hook with stable RAF lifecycle, entity interpolation, speed controls (0.5x/1x/2x), and loop toggle.

---

#### MED-002: Replay Page Layout Lacks Polish ✅ FIXED

**Completed**: 2026-02-05 | **Commit**: 780a928

Replaced inline rendering with editor's shared canvas components (Stage, Field, EntityLayer, AnnotationLayer, PlayerToken). Pixel-identical entity rendering, all 6 entity types, sport-specific fields, arrow annotations with arrowheads.

---

#### MED-003: Staging Environment Configuration Missing ✅ DEFERRED

**Status**: Not required for current workflow

Team uses direct-to-production deployment via Vercel with preview branches. Staging environment not needed at current scale.

---

#### MED-004: Editor Layout Needs Refinement ✅ DEFERRED

**Status**: No user complaints

No user feedback indicating layout issues. Editor is functional and usable. Can be revisited if users report specific problems.

---

#### MED-005: Entity Labeling Needs Refinement ✅ DEFERRED

**Status**: No user complaints

Current labeling (Att 01, Def 01) is clear enough for current users. Can be revisited based on user feedback.

---

#### MED-006: Entity Color Palette Refinement ✅ FIXED

**Completed**: 2026-02-02 | **Commits**: 8bd9a04, c20be2c

Refined palettes, removed dull orange/brown, updated defaults (White Ball, Yellow Cone), synced design tokens.

---

#### MED-007: Centralized Entity Color Management ✅ FIXED

**Completed**: 2026-02-04 | **Commit**: eb5f41c

Created `EntityColors` service as single source of truth, removed 40+ hardcoded hex values, refactored Editor.tsx and PlayerToken.tsx.

---

#### MED-008: Gallery Detail Page Uses Stale Rendering Logic ✅ FIXED

**Completed**: 2026-02-06

Removed obsolete gallery detail route (697 lines), consolidated to single ReplayViewer. Gallery now uses modern React-Konva rendering with full entity support. Removed 1,004 lines of obsolete code total.

---

### 🟢 LOW Priority Issues (2/3 Complete)

#### LOW-001: Cone Visual Thickness ✅ FIXED

**Completed**: 2026-02-02 | **Commit**: 8bd9a04

Updated cone rendering to bold, minimalist style (7px stroke, 8px radius, tactical yellow).

---

#### LOW-003: Password Strength Indicator Missing ✅ DEFERRED

**Status**: Not required for MVP

Current password validation (8+ characters) is sufficient. Password strength indicator can be added as future enhancement.

---

### 🔧 MAINTENANCE (1/1 Complete)

#### MAINT-001: Husky Deployment Error ✅ FIXED

**Completed**: 2026-02-09

Resolved Vercel deployment failure caused by missing `husky` dependency. Added `husky` to `devDependencies` and confirmed successful deployment.

---

## Issue Statistics

| Priority | Total | Complete | Pending | Deferred | Completion Rate |
|----------|-------|----------|---------|----------|-----------------|
| 🔴 CRITICAL | 3 | 3 | 0 | 0 | 100% |
| 🟠 HIGH | 6 | 5 | 1 | 0 | 83% |
| 🟡 MEDIUM | 8 | 5 | 0 | 3 | 100% (excluding deferred) |
| 🟢 LOW | 3 | 1 | 1 | 1 | 67% (excluding deferred) |
| 🔵 ENHANCEMENTS | 1 | 1 | 0 | 0 | 100% |
| 🔧 MAINTENANCE | 1 | 1 | 0 | 0 | 100% |
| **TOTAL** | **22** | **16** | **2** | **4** | **89%** |

**Notes**:
- CRIT-003 added and fixed (2026-02-09): Schema validation bug
- HIGH-003 reclassified from "deferred" to "complete" (2026-02-09): Tackle equipment verified as implemented
- HIGH-004 reopened (2026-02-09): Password reset doesn't actually change password
- ENH-001 added: Future enhancement for orientation control UI

---

## 🔮 Future Enhancements

### ENH-001: Tackle-Shield Orientation Control UI

**Priority**: 🟢 Low
**Effort**: ~30 minutes
**Status**: Tracked for future implementation

**Current Behavior**:
- Tackle-shields are created with default "up" orientation (0°)
- Rendering supports 4-way rotation (up/right/down/left)
- No UI control to change orientation after creation
- Users must delete and recreate to change orientation

**Proposed Enhancement**:
- Add orientation selector to `EntityProperties.tsx` (after Possession, before Color)
- 4-button layout: ↑ Up | → Right | ↓ Down | ← Left
- Calls `onUpdate({ orientation: selectedOrientation })`
- Visual feedback showing current orientation

**Files to Modify**:
- `src/components/Sidebar/EntityProperties.tsx` (~20-30 lines)

**Testing**:
- Create tackle-shield
- Change orientation using new selector
- Verify rotation in editor canvas
- Save animation and verify orientation persists in replay

**Workaround**: Users can delete and recreate shields with desired orientation. Feature is low priority as tackle equipment is rarely used compared to core entities (players, ball, cones).

---

## Next Steps

1. **PRIORITY: Fix HIGH-004** (Password Reset) - 1-2 days
   - Debug password change mechanism
   - Verify token handling and database updates
   - Consider OAuth alternatives (requires constitutional review)
2. **If Safari/iOS support is critical**: Implement HIGH-002 (2-3 days)
3. **If time allows**: Fix LOW-002 for TypeScript hygiene (15 minutes)
4. **Monitor user feedback**: Revisit ENH-001 if users request orientation control

---

**Note**: Detailed implementation steps for completed issues have been preserved in git history and the [archive/](./archive/) directory. This register now focuses on active work and brief summaries of completed items.
