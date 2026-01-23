# Remediation Plan: Rugby Animation Tool

**Branch**: `001-rugby-animation-tool` | **Date**: 2026-01-23 | **Spec**: [spec.md](./spec.md)  
**Input**: Specification Audit from [specification_audit.md](./specification_audit.md)  
**Archived**: Original implementation plan moved to `/archive/plan.md.original`

---

## Executive Summary

This plan addresses the **9 must-fix issues**, **7 should-fix issues**, and **3 emerging risks** identified in the [specification_audit.md](./specification_audit.md). The implementation follows a 4-phase sequence prioritizing stability before feature completeness.

> [!IMPORTANT]
> All 9 User Stories (US1-US9) are functionally complete. This plan focuses on:
> - **Gap closure** (spec requirements not fully implemented)
> - **Stability** (error handling, resilience)
> - **Polish** (UX quality, Constitution compliance)

---

## Issue Summary

### Must-Fix (9 Issues)

| ID | Issue | Spec Reference | Status |
|----|-------|----------------|--------|
| MF-01 | Grid Overlay missing | FR-CAN-04 | 🔴 MISSING |
| MF-02 | Ball Possession UI missing | FR-ENT-06 | 🟡 PARTIAL |
| MF-03 | Annotation Frame Visibility missing | FR-ENT-07 | 🟡 PARTIAL |
| MF-04 | Entity Fade-Out animation missing | FR-ANI-05 | 🔴 MISSING |
| MF-05 | Export Resolution UI disabled | FR-EXP-03 | 🟡 DISABLED |
| MF-06 | Tab Close Warning missing | FR-PER-04 | 🔴 MISSING |
| MF-07 | Invalid JSON Error Message | Edge Case | 🟡 VERIFY |
| MF-08 | 50 Frame Limit Message | Edge Case | 🟡 VERIFY |
| MF-09 | beforeunload Handler | FR-PER-04 | 🔴 MISSING |

### Should-Fix (7 Issues)

| ID | Issue | Spec Reference | Status |
|----|-------|----------------|--------|
| SF-01 | High-DPI/Retina Support | FR-CAN-05 | 🟡 PARTIAL |
| SF-02 | Double-Click Label Editing | FR-ENT-04 | 🟡 Known Issue |
| SF-03 | Duration Slider UX Clarity | FR-FRM-04 | 🟡 VERIFY |
| SF-04 | Export Progress Indicator | FR-EXP-02 | 🟡 VERIFY |
| SF-05 | Context Menu Coverage | FR-UI-06 | 🟡 PARTIAL |
| SF-06 | Aesthetic Compliance | FR-CON-03 | 🟡 VERIFY |
| SF-07 | Incomplete Polish Phase | Tasks T103-T117 | 🟡 PARTIAL |

### Emerging Risks (3 Issues)

| ID | Issue | Impact |
|----|-------|--------|
| ER-01 | No Loading States | High - perceived as broken |
| ER-02 | No Error Boundaries | High - poor resilience |
| ER-03 | LocalStorage Quota Management | Medium - silent failures |

---

## Phase 1: Stabilization 🛡️

**Goal**: Fix high-impact issues preventing production use  
**Estimated Effort**: 4-6 hours

### 1.1 Error Boundaries (ER-02)

**Files to modify:**
- [NEW] `src/components/ErrorBoundary.tsx`
- [MODIFY] `src/App.tsx`

**Implementation:**
```typescript
// ErrorBoundary.tsx - React Error Boundary with fallback UI
// Wrap major component trees: Canvas, Sidebar, Timeline
```

**Acceptance:**
- Canvas render errors show graceful fallback instead of white screen
- User can recover by refreshing or starting new project

---

### 1.2 Loading States (ER-01, T105)

**Files to modify:**
- [MODIFY] `src/store/uiStore.ts` - add `isLoading` state
- [MODIFY] `src/components/Sidebar/ProjectActions.tsx` - loading indicators
- [MODIFY] `src/hooks/useExport.ts` - ensure progress updates

**Acceptance:**
- Save button shows spinner during file save
- Load button shows spinner during file parse
- Export button shows progress percentage

---

### 1.3 Tab Close Warning (MF-06, MF-09, AF-03)

**Files to modify:**
- [MODIFY] `src/App.tsx` - add `beforeunload` event listener

**Implementation:**
```typescript
// Add to App.tsx useEffect
window.addEventListener('beforeunload', (e) => {
  if (isDirty) {
    e.preventDefault();
    e.returnValue = '';
  }
});
```

**Acceptance:**
- Closing browser tab with unsaved changes shows browser confirmation dialog
- Refreshing page with unsaved changes shows confirmation

---

### 1.4 Double-Click Reliability (SF-02)

**Files to modify:**
- [MODIFY] `src/components/Canvas/PlayerToken.tsx` - improve double-click timing
- [MODIFY] `src/components/Canvas/InlineEditor.tsx` - adjust trigger sensitivity

**Implementation:**
- Increase double-click timeout window (300ms → 500ms)
- Reduce click-drag threshold to distinguish from edit intent

**Acceptance:**
- Double-click on player label consistently opens inline editor
- No accidental edit triggers during drag operations

---

### 1.5 Edge Case Verification (MF-07, MF-08)

**Files to verify:**
- `src/utils/validation.ts` - JSON validation error messages
- `src/store/projectStore.ts` - frame limit messaging

**Acceptance:**
- Loading malformed JSON shows user-friendly toast, not console.error
- Adding frame at limit (50) shows "Maximum frames reached" message
- No silent failures

---

## Phase 2: Spec Compliance 📋

**Goal**: Address all must-fix items to achieve 100% FR coverage  
**Estimated Effort**: 6-10 hours

### 2.1 Grid Overlay (MF-01, FR-CAN-04, T103-T104)

**Files to create/modify:**
- [NEW] `src/components/Canvas/GridOverlay.tsx`
- [MODIFY] `src/store/uiStore.ts` - ensure `showGrid` action functional
- [MODIFY] `src/components/Canvas/Stage.tsx` - integrate GridOverlay

**Implementation:**
```typescript
// GridOverlay.tsx
// Render 100-unit grid lines (20 per axis on 2000x2000 canvas)
// Use Konva.Line with DESIGN_TOKENS.colors.tactics_white at 30% opacity
```

**Acceptance:**
- Toggle grid button visible in UI (Sidebar or toolbar)
- Grid lines render at regular intervals over field
- Grid does not affect entity interaction or export

---

### 2.2 Entity Fade-Out (MF-04, FR-ANI-05, T106)

**Files to modify:**
- [MODIFY] `src/components/Canvas/EntityLayer.tsx` - opacity interpolation
- [MODIFY] `src/hooks/useAnimationLoop.ts` - track entity existence

**Implementation:**
- During playback, entities not in target frame fade from 1.0 → 0.0 opacity
- Use same lerp timing as position interpolation

**Acceptance:**
- Playing animation where entity exists in Frame 1 but not Frame 2 shows gradual fade
- Entity reappears with fade-in if it exists in subsequent frame

---

### 2.3 Export Resolution UI (MF-05, FR-EXP-03)

**Files to modify:**
- [MODIFY] `src/components/Sidebar/ProjectActions.tsx` - add resolution dropdown
- [MODIFY] `src/hooks/useExport.ts` - respect resolution setting

**Implementation:**
- Add Select component with options: 720p (default), 1080p
- Wire to `projectStore.settings.exportResolution`

**Acceptance:**
- Resolution selector visible before export
- 1080p export produces higher quality video file
- Default remains 720p per spec

---

### 2.4 Ball Possession Logic (MF-02, FR-ENT-06, T107)

**Files to modify:**
- [MODIFY] `src/components/Sidebar/EntityProperties.tsx` - possession dropdown
- [MODIFY] `src/components/Canvas/EntityLayer.tsx` - render ball relative to parent
- [MODIFY] `src/hooks/useAnimationLoop.ts` - interpolate child with parent

**Implementation:**
- EntityProperties shows "Possession" dropdown for ball entity
- Lists all player entities as options + "None"
- Ball renders offset from parent player position
- During animation, ball follows parent's interpolated position

**Acceptance:**
- Can assign ball to player via dropdown
- Ball moves with player during playback
- Saving/loading preserves possession

---

### 2.5 Annotation Frame Visibility (MF-03, FR-ENT-07)

**Files to modify:**
- [MODIFY] `src/components/Sidebar/EntityProperties.tsx` - frame range UI for annotations
- [MODIFY] `src/components/Canvas/AnnotationLayer.tsx` - filter by frame visibility
- [MODIFY] `src/store/projectStore.ts` - ensure `startFrameId`/`endFrameId` used

**Implementation:**
- When annotation selected, show Start Frame and End Frame dropdowns
- AnnotationLayer filters annotations to only show those where currentFrame is in range

**Acceptance:**
- Can set annotation to appear only on frames 2-4
- During playback, annotation fades in/out at frame boundaries
- Export includes only visible annotations per frame

---

## Phase 3: Polish & UX 💎

**Goal**: Should-fix items and remaining polish tasks  
**Estimated Effort**: 4-6 hours

### 3.1 High-DPI Support (SF-01, FR-CAN-05)

**Files to modify:**
- [MODIFY] `src/components/Canvas/Stage.tsx` - add pixelRatio prop

**Implementation:**
```typescript
// Stage.tsx
<Stage 
  width={width} 
  height={height}
  pixelRatio={window.devicePixelRatio || 1}
>
```

**Acceptance:**
- Sharp rendering on MacBook Retina displays
- No performance degradation on standard displays

---

### 3.2 Context Menu Coverage (SF-05, FR-UI-06)

**Files to verify/modify:**
- [VERIFY] `src/components/Canvas/PlayerToken.tsx` - context menu present
- [MODIFY] `src/components/Canvas/AnnotationLayer.tsx` - add annotation context menu

**Acceptance:**
- Right-click on player shows context menu
- Right-click on annotation shows context menu with Delete option
- Right-click on ball shows context menu

---

### 3.3 Aesthetic Compliance Audit (SF-06, FR-CON-03)

**Files to audit:**
- `src/index.css` - verify @theme uses Pitch Green (#1A3D1A) and Tactics White (#F8F9FA)
- Key components: Sidebar, Timeline, Dialogs

**Verification:**
- Screenshot 5-10 UI panels
- Confirm sharp corners (border-radius: 0)
- Confirm monospace for frame counts/timecodes
- Confirm Pitch Green accent color usage

---

### 3.4 Remaining Polish Tasks (SF-07)

From [tasks.md](./tasks.md) Phase 12:

- [ ] T111: Error boundaries (done in Phase 1)
- [ ] T113: Loading indicator during startup
- [ ] T114: Accessibility attributes (ARIA labels)
- [ ] T116: User-facing README.md
- [ ] T117: Code cleanup (console.logs, TODOs)

**Priority:** T116 (README) is critical for user adoption

---

## Phase 4: Validation & UAT 🧪

**Goal**: Testing and documentation for deployment readiness  
**Estimated Effort**: 3-5 hours

### 4.1 Browser Test Matrix

| Feature | Chrome | Edge | Firefox | Safari |
|---------|--------|------|---------|--------|
| Entity drag | ✅ | ✅ | 🔬 | 🔬 |
| Animation playback | ✅ | ✅ | 🔬 | 🔬 |
| Video export | ✅ | ✅ | 🔬 | ❌ |
| Save/Load | ✅ | ✅ | 🔬 | 🔬 |
| Auto-save | ✅ | ✅ | 🔬 | 🔬 |

Legend: ✅ = Expected to work, 🔬 = Test needed, ❌ = Not supported

### 4.2 Performance Benchmarking

**Test Cases:**
1. 50 frames, 30 entities - playback at 60fps?
2. Export 5-minute animation - completes without timeout?
3. Large project approaching 5MB LocalStorage - auto-save handles gracefully?

### 4.3 User Acceptance Testing

**Scenario:** Rugby coach creates 2-frame animation in 5 minutes (SC-001)

**Steps:**
1. Open application
2. Add 8 attack players, 4 defense players
3. Add ball, assign to player
4. Create Frame 2, reposition entities
5. Play animation
6. Export video
7. Save project

**Time Target:** < 5 minutes for first-time user

---

## Verification Plan

### Automated Testing

**No existing automated tests found.** Create verification via:

1. **Build Check**: `npm run build` must succeed without errors
2. **TypeScript Check**: `npm run type-check` (if available) or `tsc --noEmit`
3. **Dev Server**: `npm run dev` must start without errors

### Browser Testing (Manual)

After each phase:

1. Start dev server: `npm run dev`
2. Open Chrome at http://localhost:5173/
3. Execute test cases for that phase
4. Document any regressions

### Phase-Specific Verification

**Phase 1 Verification:**
- [ ] Close tab with unsaved changes → browser warns
- [ ] Throw error in component → error boundary catches
- [ ] Double-click player label 10 times → 100% success rate

**Phase 2 Verification:**
- [ ] Toggle grid → grid lines appear
- [ ] Delete entity from frame 2, play → entity fades out
- [ ] Export at 1080p → video is higher resolution
- [ ] Assign ball to player → ball follows during animation
- [ ] Set annotation visibility 2-4 → only shows on those frames

**Phase 3 Verification:**
- [ ] Test on high-DPI monitor → no blur
- [ ] Right-click annotation → context menu appears
- [ ] Visual audit → Constitution colors compliant

**Phase 4 Verification:**
- [ ] Complete UAT scenario < 5 minutes
- [ ] 50-frame project plays at 60fps
- [ ] Browser compatibility matrix filled

---

## Task Summary

| Phase | Tasks | Must-Fix | Should-Fix | Emerging |
|-------|-------|----------|------------|----------|
| 1: Stabilization | 5 | 3 | 1 | 2 |
| 2: Spec Compliance | 5 | 6 | 0 | 0 |
| 3: Polish & UX | 4 | 0 | 5 | 0 |
| 4: Validation | 3 | 0 | 1 | 1 |
| **Total** | **17** | **9** | **7** | **3** |

**Estimated Total Effort:** 17-27 hours

---

## Constitution Compliance Check

### I. Modular Architecture ✅
- Error boundaries maintain component isolation
- New components follow existing patterns

### II. Rugby-Centric Design Language ✅
- No terminology changes needed
- Ball possession enhances rugby use case

### III. Intuitive UX ✅
- Loading states prevent confusion
- Error boundaries prevent crashes

### IV. Tactical Clubhouse Aesthetic ✅
- Audit ensures color compliance
- Sharp corners preserved

### V. Offline-First Privacy ✅
- No new network calls
- All changes local-only

---

## Next Steps

1. **User Review**: Approve this remediation plan
2. **Execute Phase 1**: Stabilization (error boundaries, loading states, tab warning)
3. **Verify Phase 1**: Browser testing
4. **Execute Phase 2**: Spec compliance (grid, fade-out, export UI, possession, annotations)
5. **Verify Phase 2**: Browser testing
6. **Continue Phases 3-4** as time permits

---

## References

- [specification_audit.md](./specification_audit.md) - Gap analysis source
- [spec.md](./spec.md) - Authoritative specification
- [tasks.md](./tasks.md) - Original task list (Phases 1-12)
- [/archive/plan.md.original](/archive/plan.md.original) - Archived original plan
