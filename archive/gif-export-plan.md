# Implementation Plan: Animated GIF Export (GIF-Only)

Implement client-side GIF export as the primary output mechanism, replacing the previous video export prototype.

## User Review Required

> [!IMPORTANT]
> **GIF-Only Strategy**: Following user decision, this plan focuses exclusively on GIF export. All references to WebM/video coexistence have been removed. The UI will feature a single, direct "Export as GIF" action.

> [!WARNING]
> **Performance Expectations**: GIF encoding is CPU-intensive. Initial implementation targets <90 seconds for 20-second animations (P1). Users will see a progress indicator and have the option to cancel long exports.

> [!CAUTION]
> **Library Selection**: This plan uses `gif.js` (proven, stable). It will be bundled locally to maintain the offline-first constitution requirement.

## Proposed Changes

### Phase 1: Research & Library Selection (4-6 hours)

**Objective**: Validate library choice and establish encoding parameters through spike implementation.

#### Tasks

1. **Library Evaluation Spike**
   - Test `gif.js` with sample canvas capture from existing `CanvasStage`
   - Measure encoding time for 10-frame, 5-second test sequence
   - Verify offline bundling (no CDN dependencies)
   - Document memory usage and file size for test output

2. **Performance Baseline**
   - Capture baseline metrics: encoding time, file size, quality
   - Test on Chrome/Edge (target browsers per `spec.md`)
   - Verify GIF plays correctly on WhatsApp Web and in desktop browsers

3. **Document Findings**
   - Create `specs/001-rugby-animation-tool/gif-export-research.md`
   - Record library choice rationale and configurations

**Acceptance Criteria**:
- [ ] `gif.js` successfully encodes 10-frame test animation
- [ ] GIF plays on WhatsApp Web without errors
- [ ] Research document committed with performance metrics

---

### Phase 2: Core GIF Encoder Hook (4-5 hours)

**Objective**: Create `useGifExport` hook for GIF generation.

#### [NEW] [useGifExport.ts](file:///c:/Coding%20Projects/coaching-animator/src/hooks/useGifExport.ts)

Custom hook exposing GIF export functionality:

```typescript
interface UseGifExportReturn {
  exportAsGif: () => Promise<void>;
  progress: number;
  isExporting: boolean;
  error: string | null;
  cancelExport: () => void;
}
```

#### [MODIFY] [package.json](file:///c:/Coding%20Projects/coaching-animator/package.json)

Add `gif.js` dependency.

**Acceptance Criteria**:
- [ ] Hook exports GIF for 2-frame test animation
- [ ] Progress updates from 0% to 100%
- [ ] GIF file downloads successfully

---

### Phase 3: UI Integration - Direct Export (4-5 hours)

**Objective**: Implement a single "Export as GIF" button in the sidebar.

#### [MODIFY] [ProjectActions.tsx](file:///c:/Coding%20Projects/coaching-animator/src/components/Sidebar/ProjectActions.tsx)

Remove old export logic and implement direct GIF export:

```typescript
// Integrate GIF hook
const { exportAsGif, progress, isExporting, cancelExport } = useGifExport();

// Simple button handler
const handleExport = () => {
  exportAsGif();
};
```

**UI Structure**:
- Single button: "Export as GIF"
- Disabled state while exporting
- Integrated progress bar below the button

**Acceptance Criteria**:
- [ ] "Export as GIF" button visible in sidebar
- [ ] Clicking button triggers GIF export flow
- [ ] Progress bar updates during export
- [ ] Build succeeds

---

### Phase 4: Progress & Cancellation UX (4-5 hours)

**Objective**: Provide feedback and control during encoding.

#### [MODIFY] [ProjectActions.tsx](file:///c:/Coding%20Projects/coaching-animator/src/components/Sidebar/ProjectActions.tsx)

Enhance progress UI:
- Progress percentage text (e.g., "75%")
- "Cancel" button visible only during export
- Proper resource cleanup on cancellation

**Acceptance Criteria**:
- [ ] Progress percentage visible during export
- [ ] Cancel button stops export and resets UI
- [ ] Cancellation cleans up worker resources

---

### Phase 5: Quality & Performance Optimization (4-6 hours)

**Objective**: Tune encoding settings for optimal size/speed.

#### [MODIFY] [useGifExport.ts](file:///c:/Coding%20Projects/coaching-animator/src/hooks/useGifExport.ts)

Optimize encoder configuration:
- Quality setting (target: balancing fidelity vs. size)
- Worker count (matching `navigator.hardwareConcurrency`)
- Clamping resolution to 720p

**Acceptance Criteria**:
- [ ] 20-second animation exports in <90 seconds (P1)
- [ ] Output GIF <10MB for typical 20s animation (P2)
- [ ] Labels remain legible in output

---

### Phase 6: Emulated Mobile Verification (3-4 hours)

**Objective**: Validate GIF compatibility using browser emulation tools.

#### Testing Checklist

Using Chrome/Edge DevTools Device Emulation:
- [ ] **iOS Emulation**: Verify GIF renders in Safari (mobile) emulation
- [ ] **Android Emulation**: Verify GIF renders in Chrome (mobile) emulation
- [ ] **WhatsApp Web**: Verify GIF sends and plays in desktop WhatsApp client
- [ ] **Email**: Verify GIF renders in Gmail/Outlook web clients

**Acceptance Criteria**:
- [ ] GIF plays correctly in iOS Safari emulation (DevTools)
- [ ] GIF plays correctly in Android Chrome emulation (DevTools)
- [ ] GIF sends/plays on WhatsApp Web
- [ ] Results documented in `specs/001-rugby-animation-tool/gif-export-verification.md`

---

### Phase 7: Documentation & Cleanup (3-4 hours)

**Objective**: Finalize docs and code structure.

#### [MODIFY] [README.md](file:///c:/Coding%20Projects/coaching-animator/README.md)
#### [MODIFY] [spec.md](file:///c:/Coding%20Projects/coaching-animator/specs/001-rugby-animation-tool/spec.md)

- Update all export instructions to specify GIF only
- Update functional requirements (FR-EXP-01 now targets .gif)
- Remove any lingering references to WebM/Video export

**Acceptance Criteria**:
- [ ] README updated for GIF export
- [ ] spec.md reflects GIF as the primary export format
- [ ] Final build succeeds with no warnings

---

## Verification Plan

### Automated Tests
- `npm run build`: No errors, bundle size checked
- `npm run lint`: No new errors

### Manual Verification
- **Emulation Test**: Use DevTools to simulate iOS/Android viewers
- **Benchmark**: Verify <90s/10MB targets for 20s animation

---

## Constitution Check

### Modular Architecture ✅
- `useGifExport` is a self-contained hook

### Tactical Clubhouse Aesthetic ✅
- Progress UI uses Pitch Green accents

### Offline-First Privacy ✅
- `gif.js` bundled locally; no network encoding

---

## Timeline Estimate

| Phase | Hours | Cumulative |
|-------|-------|------------|
| Phase 1: Research | 4-6 | 4-6 |
| Phase 2: Encoder Hook | 4-5 | 8-11 |
| Phase 3: UI Integration | 4-5 | 12-16 |
| Phase 4: UX Feedback | 4-5 | 16-21 |
| Phase 5: Optimization | 4-6 | 20-27 |
| Phase 6: Emulation Testing | 3-4 | 23-31 |
| Phase 7: Cleanup | 3-4 | 26-35 |

**Total Estimated Effort**: 26-35 hours
