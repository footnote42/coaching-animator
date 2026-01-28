# Feature Specification: Clean Iteration - Bug Fixes & Polish

**Feature Branch**: `002-clean-iteration`  
**Created**: 2026-01-28  
**Status**: Ready for Implementation  
**Input**: Gap analysis of MVP against PRD and Spec-Kit specifications

## Summary

This iteration addresses critical bugs, UI inconsistencies, and spec compliance gaps identified during the post-MVP audit. The goal is to stabilize the production application before adding new features.

**Source Documents**:
- PRD: `.specify/memory/PRD.md`
- Constitution: `.specify/memory/constitution.md`
- Previous Iteration: `specs/001-rugby-animation-tool/`

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Share Animation via Link (Priority: P0-BUG)

A coach wants to share their animated play via WhatsApp. They click "Share Link" expecting a URL to be copied to their clipboard.

**Why this priority**: Critical bug - feature is completely broken without Supabase environment configuration. Tier 2 feature per Constitution V.2.

**Independent Test**: Click "Share Link" button with a valid project loaded; URL should be copied to clipboard and toast should confirm success.

**Acceptance Scenarios**:

1. **Given** a project with at least 2 frames, **When** user clicks "Share Link", **Then** a shareable URL is copied to clipboard and success toast appears
2. **Given** missing Supabase configuration, **When** user clicks "Share Link", **Then** a clear error message explains the issue (not a generic 500 error)
3. **Given** first-time share usage, **When** share succeeds, **Then** privacy notice toast appears explaining 90-day retention

---

### User Story 2 - Export Video at Selected Resolution (Priority: P0-BUG)

A coach selects 1080p export resolution and exports their animation, expecting a 1920x1080 video file.

**Why this priority**: Critical bug - UI allows resolution selection but export ignores the setting and always outputs 720p.

**Independent Test**: Select 1080p in export settings, export video, verify output file dimensions are 1920x1080.

**Acceptance Scenarios**:

1. **Given** export resolution set to 720p, **When** user exports video, **Then** output is 1280x720 pixels
2. **Given** export resolution set to 1080p, **When** user exports video, **Then** output is 1920x1080 pixels
3. **Given** any resolution setting, **When** export completes, **Then** file dimensions match the selected resolution

---

### User Story 3 - High-DPI Canvas Rendering (Priority: P1-POLISH)

A coach using a Retina/HiDPI display sees crisp, clear canvas rendering without blur or pixelation.

**Why this priority**: Visual quality issue affecting users with modern displays. Spec requirement F-CAN-05.

**Independent Test**: View canvas on a HiDPI display (2x pixel ratio); elements should render sharply without blur.

**Acceptance Scenarios**:

1. **Given** a device with `window.devicePixelRatio > 1`, **When** canvas renders, **Then** stage uses appropriate pixel ratio scaling
2. **Given** any display, **When** entities are rendered, **Then** circles and text appear crisp without aliasing artifacts

---

### User Story 4 - Constitution-Compliant Visual Design (Priority: P1-POLISH)

The application UI adheres to the Tactical Clubhouse aesthetic defined in Constitution IV.

**Why this priority**: Brand consistency and professional appearance per Constitution requirements.

**Independent Test**: Visual audit confirms color palette, typography, and border styling match Constitution IV tokens.

**Acceptance Scenarios**:

1. **Given** any UI component, **When** rendered, **Then** primary color is Pitch Green `#1A3D1A`
2. **Given** any UI component, **When** rendered, **Then** background color is Tactics White `#F8F9FA`
3. **Given** any UI component, **When** rendered, **Then** border-radius is 0px (sharp corners)
4. **Given** data display (coordinates, timecodes), **When** rendered, **Then** monospace font is used

---

### User Story 5 - Annotation Start Frame Selection (Priority: P2-COMPLIANCE)

A coach wants to set which frame an annotation appears on, using the Start Frame selector in properties panel.

**Why this priority**: Feature UI exists but is non-functional (read-only). Spec requirement F-ENT-07.

**Independent Test**: Create annotation, change Start Frame in properties panel, verify annotation visibility changes accordingly.

**Acceptance Scenarios**:

1. **Given** an annotation selected, **When** user changes Start Frame dropdown, **Then** annotation's `startFrameId` updates
2. **Given** an annotation with Start Frame set, **When** navigating frames, **Then** annotation only appears from Start Frame onward

---

### Edge Cases

- **Share offline**: Share button should be disabled with "Offline" label when `navigator.onLine` is false
- **Export with 1 frame**: Export should fail gracefully with clear message (minimum 2 frames required)
- **Export timeout**: Long animations should timeout with user-friendly message after calculated duration + buffer
- **50 frame limit**: Adding a 51st frame should be prevented with clear feedback
- **Invalid JSON load**: Loading corrupted/invalid JSON should show toast error, not crash

---

## Requirements *(mandatory)*

### Functional Requirements

#### P0 - Critical Bug Fixes

- **FR-BUG-01**: System MUST read `project.settings.exportResolution` and use corresponding dimensions from `VALIDATION.EXPORT.RESOLUTIONS` during video export
- **FR-BUG-02**: System MUST provide clear setup instructions or error messaging when Supabase environment variables are missing
- **FR-BUG-03**: Share API MUST return user-friendly error messages, not expose stack traces in production

#### P1 - UI/Polish

- **FR-POL-01**: Konva Stage MUST set `pixelRatio` prop to `window.devicePixelRatio` for HiDPI support (F-CAN-05)
- **FR-POL-02**: All UI components MUST use `--color-primary: #1A3D1A` for primary surfaces (Constitution IV)
- **FR-POL-03**: All UI components MUST use `--color-background: #F8F9FA` for backgrounds (Constitution IV)
- **FR-POL-04**: All UI components MUST have `border-radius: 0` (Constitution IV)
- **FR-POL-05**: Timecodes, coordinates, and frame counts MUST use monospace font (Constitution IV)

#### P2 - Spec Compliance

- **FR-COMP-01**: Annotation Start Frame selector MUST be functional (not read-only) per F-ENT-07
- **FR-COMP-02**: System MUST show user-friendly toast when 50-frame limit is reached per F-FRM-06
- **FR-COMP-03**: System MUST show user-friendly toast when loading invalid JSON per F-PER-02

---

### Key Entities

- **ExportSettings**: Resolution configuration (`720p` | `1080p`) stored in `project.settings.exportResolution`, mapped to pixel dimensions via `VALIDATION.EXPORT.RESOLUTIONS`
- **SharePayloadV1**: Minimal animation data for link sharing, validated by schema, stored in Supabase with 90-day TTL
- **Annotation**: Drawing element with `startFrameId` and `endFrameId` controlling visibility range

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Share Link button successfully creates and copies URL when Supabase is configured
- **SC-002**: Video export at 1080p produces file with dimensions exactly 1920x1080
- **SC-003**: Canvas renders without visible blur on devices with `devicePixelRatio >= 2`
- **SC-004**: Visual audit confirms 100% compliance with Constitution IV color and typography tokens
- **SC-005**: Annotation Start Frame selector updates annotation visibility correctly
- **SC-006**: All edge cases produce user-friendly error messages (no console-only errors)

---

## Files Requiring Changes

| File | Change Type | Requirement |
|------|-------------|-------------|
| `src/hooks/useFrameCapture.ts` | Bug Fix | FR-BUG-01 |
| `src/hooks/useExport.ts` | Bug Fix | FR-BUG-01 |
| `.env.local` | Configuration | FR-BUG-02 |
| `api/share.ts` | Bug Fix | FR-BUG-03 |
| `src/App.tsx` (Stage) | Enhancement | FR-POL-01 |
| `src/index.css` | Audit/Fix | FR-POL-02, FR-POL-03, FR-POL-04 |
| UI components | Audit/Fix | FR-POL-04, FR-POL-05 |
| `src/components/Sidebar/EntityProperties.tsx` | Enhancement | FR-COMP-01 |
| `src/store/projectStore.ts` | Enhancement | FR-COMP-02 |
| `src/components/Sidebar/ProjectActions.tsx` | Enhancement | FR-COMP-03 |

---

## References

- **PRD Section 5.5**: Export System requirements (F-EXP-01 through F-EXP-06)
- **PRD Section 7**: Security & Validation Requirements
- **Constitution IV**: Tactical Clubhouse Aesthetic
- **Constitution V.2**: Optional Networked Features (Tier 2 - Controlled)
- **Previous Audit**: `specs/001-rugby-animation-tool/specification_audit.md`
