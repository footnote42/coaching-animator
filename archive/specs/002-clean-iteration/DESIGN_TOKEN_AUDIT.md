# Design Token Audit Checklist

**Phase 0 Task T005 - Baseline audit for Constitution IV compliance**

---

## Constitution IV Requirements

**Tactical Clubhouse Aesthetic**:
- **Primary Color**: Pitch Green `#1A3D1A`
- **Background Color**: Tactics White `#F8F9FA`
- **Border Radius**: 0px (sharp corners only)
- **Typography**: Monospace fonts for data displays (coordinates, timecodes, frame counts)

---

## ✅ COMPLIANT ITEMS

### Color Tokens
- **`src/constants/design-tokens.ts`**: Lines 7-8 correctly define colors
  - `primary: '#1A3D1A'` ✅
  - `background: '#F8F9FA'` ✅
- **`src/index.css`**: Lines 4-5 correctly define CSS variables
  - `--color-pitch-green: #1a3d1a` ✅
  - `--color-tactics-white: #f8f9fa` ✅

### Typography Tokens
- **`src/constants/design-tokens.ts`**: Line 23 correctly defines monospace
  - `fontMono: "'JetBrains Mono', 'Fira Code', monospace"` ✅
- **`src/index.css`**: Line 7 correctly defines CSS variable
  - `--font-family-mono: 'JetBrains Mono', 'Fira Code', monospace` ✅

### Border Radius Setting
- **`src/constants/design-tokens.ts`**: Line 29 correctly sets
  - `borderRadius: 0` ✅
- **`src/index.css`**: Line 11 correctly sets
  - `--radius-default: 0px` ✅

---

## ⚠️ VIOLATIONS REQUIRING FIXES

### Rounded Corners (17 violations)

**Files with `rounded-` classes**:
1. `src/components/Replay/ReplayPage.tsx` (3 matches)
2. `src/components/ui/button.tsx` (3 matches)
3. `src/components/ui/select.tsx` (3 matches)
4. `src/components/Timeline/PlaybackControls.tsx` (2 matches)
5. `src/components/ui/dialog.tsx` (2 matches)
6. `src/components/ui/slider.tsx` (2 matches)
7. `src/components/Timeline/FrameThumbnail.tsx` (1 match)
8. `src/components/ui/input.tsx` (1 match)

**Required Action**: Replace all `rounded-*` classes with sharp corners (remove or set to `rounded-none`)

### Typography Usage (22 matches, needs verification)

**Files with font usage**:
1. `src/components/Sidebar/EntityProperties.tsx` (6 matches)
2. `src/components/Timeline/FrameThumbnail.tsx` (3 matches)
3. `src/components/Timeline/PlaybackControls.tsx` (3 matches)
4. `src/index.css` (3 matches)
5. `src/components/ErrorBoundary.tsx` (2 matches)
6. `src/components/Canvas/InlineEditor.tsx` (1 match)
7. `src/components/Sidebar/EntityPalette.tsx` (1 match)
8. `src/components/Sidebar/ProjectActions.tsx` (1 match)
9. `src/components/Sidebar/SportSelector.tsx` (1 match)
10. `src/components/Timeline/FrameStrip.tsx` (1 match)

**Required Action**: Verify all data displays (coordinates, timecodes, frame counts) use `font-mono` class

---

## Phase 2.2 Implementation Tasks

Based on this audit, Phase 2.2 will require:

1. **T027**: Fix rounded corners in UI components (8 files)
2. **T028**: Verify color consistency (should be compliant)
3. **T029**: Verify background consistency (should be compliant)
4. **T030**: Fix typography for data displays (verify 10 files)
5. **T031**: Visual regression test

---

## Audit Summary

- **Colors**: ✅ Compliant (tokens defined correctly)
- **Typography**: ⚠️ Defined correctly, usage needs verification
- **Borders**: ❌ 17 violations found across 8 files
- **Overall**: 75% compliant, need to fix rounded corners and verify typography usage

**Priority**: High - Constitution IV compliance is mandatory for P1 polish phase.
