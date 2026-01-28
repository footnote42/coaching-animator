# Implementation Plan: Clean Iteration - Bug Fixes & Polish

**Branch**: `002-clean-iteration` | **Date**: 2026-01-28 | **Spec**: `specs/002-clean-iteration/spec.md`

## Summary

This iteration addresses two critical functional bugs (Share Link failure, Export Resolution disconnect) and implements UI/polish improvements to achieve full PRD and Constitution compliance. The work is organized into 3 phases with clear dependencies and verification steps.

**Primary Requirements**:
- Fix Share Link API integration (missing environment configuration)
- Connect export resolution UI to actual video capture logic
- Implement HiDPI canvas support
- Audit and enforce Constitution IV design tokens
- Enable annotation start frame editing

**Technical Approach**: Direct code fixes to existing hooks and components, no architectural changes required.

---

## Technical Context

**Language/Version**: TypeScript 5.x, React 18.2.0  
**Primary Dependencies**: Vite, Konva 9.3.22, react-konva 18.2.14, Zustand 5.0.2, Tailwind CSS 4.x, shadcn/ui  
**Storage**: LocalStorage (Tier 1), Supabase PostgreSQL (Tier 2 - link sharing)  
**Testing**: Manual verification, unit tests for serialization  
**Target Platform**: Chrome/Edge 90+ (primary), Firefox (secondary)  
**Project Type**: Single-page web application  
**Performance Goals**: 60 FPS animation playback, <5s video export for typical projects  
**Constraints**: Offline-first for Tier 1 features, 100KB max share payload, 5-minute max export duration  
**Scale/Scope**: 50 frames max, 100+ entities per frame

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Status |
|-----------|-------------|--------|
| **I. Modular Architecture** | Changes isolated to specific hooks/components | ✅ PASS |
| **II. Rugby-Centric Design** | No terminology changes required | ✅ PASS |
| **III. Intuitive UX** | Fixes improve discoverability and feedback | ✅ PASS |
| **IV. Tactical Clubhouse Aesthetic** | Enforces color/typography tokens | ✅ PASS |
| **V. Privacy-First Architecture** | Share Link remains Tier 2 (optional, user-initiated) | ✅ PASS |

**Violations**: None

---

## Project Structure

### Documentation (this feature)

```text
specs/002-clean-iteration/
├── spec.md              # Feature specification (COMPLETE)
├── plan.md              # This file (COMPLETE)
├── tasks.md             # Granular task checklist (PENDING)
├── PROJECT_STATE.md     # Status tracker (PENDING)
└── checklists/
    └── requirements.md  # Spec quality checklist (PENDING)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── Canvas/
│   │   └── (no changes)
│   ├── Sidebar/
│   │   ├── EntityProperties.tsx    # [MODIFY] Enable annotation start frame
│   │   ├── ProjectActions.tsx      # [MODIFY] Add JSON load error toast
│   │   └── ShareButton.tsx         # [VERIFY] Error handling
│   └── ui/                          # [AUDIT] Border radius compliance
├── hooks/
│   ├── useExport.ts                 # [MODIFY] Pass resolution to capture
│   └── useFrameCapture.ts           # [MODIFY] Read resolution from settings
├── store/
│   └── projectStore.ts              # [MODIFY] Add frame limit toast
├── constants/
│   ├── design-tokens.ts             # [VERIFY] Constitution compliance
│   └── validation.ts                # [VERIFY] Export resolution constants
├── App.tsx                          # [MODIFY] Add pixelRatio to Stage
└── index.css                        # [AUDIT] CSS variable compliance

api/
├── share.ts                         # [MODIFY] Improve error messages
└── lib/
    └── supabase.ts                  # [VERIFY] Error handling

tests/
└── unit/
    └── (existing tests remain)
```

**Structure Decision**: Existing structure is appropriate. Changes are localized to specific files per Modular Architecture principle.

---

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

N/A - No constitutional violations.

---

## Implementation Phases

### Phase 0: Environment Setup & Verification (30 minutes)

**Goal**: Establish baseline and prepare environment for bug fixes.

**Tasks**:
1. Create `.env.local` from `.env.local.example`
2. Document Supabase setup requirements
3. Verify current export behavior (confirm 720p hardcoding)
4. Verify current share behavior (confirm missing env error)
5. Audit current design token usage (baseline for P1 work)

**Deliverables**:
- `.env.local` file (gitignored, local only)
- Setup documentation update
- Baseline verification screenshots/notes

**Verification**:
- Share Link button shows clear error when env missing
- Export always produces 1280x720 regardless of UI setting
- Design token audit checklist prepared

---

### Phase 1: Critical Bug Fixes (P0) (2-3 hours)

**Goal**: Fix Share Link and Export Resolution bugs.

#### Phase 1.1: Share Link Environment Configuration

**Files Modified**:
- `.env.local` (create from example)
- `api/share.ts` (improve error messages)
- `README.md` or setup docs (add Supabase instructions)

**Changes**:
1. Add clear setup instructions for Supabase configuration
2. Improve error messaging in `api/share.ts` to distinguish missing env vs. network errors
3. Test share flow with valid configuration

**Acceptance**:
- Share Link button successfully creates URL when configured
- Clear error message shown when env vars missing (not generic 500)
- Privacy notice toast appears on first share

#### Phase 1.2: Export Resolution Connection

**Files Modified**:
- `src/hooks/useFrameCapture.ts`
- `src/hooks/useExport.ts`

**Changes**:
1. Modify `useFrameCapture.ts` to accept resolution parameter
2. Read resolution from `project.settings.exportResolution`
3. Map resolution string to dimensions via `VALIDATION.EXPORT.RESOLUTIONS`
4. Pass dimensions to stage sizing logic

**Acceptance**:
- Export at 720p produces 1280x720 video
- Export at 1080p produces 1920x1080 video
- Resolution selector UI updates correctly

**Verification Commands**:
```bash
# Manual test: Export video, check dimensions
# ffprobe output.webm (if ffmpeg installed)
# Or: Load video in browser, check videoWidth/videoHeight
```

---

### Phase 2: UI/Polish Improvements (P1) (3-4 hours)

**Goal**: Implement HiDPI support and enforce Constitution design tokens.

#### Phase 2.1: High-DPI Canvas Support

**Files Modified**:
- `src/App.tsx` (Stage component)

**Changes**:
1. Add `pixelRatio={window.devicePixelRatio}` prop to Konva Stage
2. Test on HiDPI display (or simulate with browser DevTools)

**Acceptance**:
- Canvas renders crisply on Retina/HiDPI displays
- No performance degradation on standard displays

#### Phase 2.2: Design Token Audit & Enforcement

**Files Modified**:
- `src/index.css` (CSS variables)
- Various UI components (Tailwind classes)

**Changes**:
1. Verify `--color-primary: #1A3D1A` usage
2. Verify `--color-background: #F8F9FA` usage
3. Search for `rounded-*` classes, replace with sharp corners
4. Verify monospace font usage for data displays

**Acceptance**:
- Visual audit confirms color compliance
- No rounded corners in UI (except where explicitly required)
- Timecodes, coordinates use monospace font

**Verification Commands**:
```bash
# Search for rounded corners
grep -r "rounded-" src/components

# Search for color usage
grep -r "#1A3D1A\|#F8F9FA" src/
```

---

### Phase 3: Spec Compliance Gaps (P2) (2-3 hours)

**Goal**: Enable missing spec features and improve edge case handling.

#### Phase 3.1: Annotation Start Frame Editing

**Files Modified**:
- `src/components/Sidebar/EntityProperties.tsx`
- `src/store/projectStore.ts` (if annotation update logic needed)

**Changes**:
1. Make Start Frame selector functional (remove disabled state)
2. Implement `onValueChange` handler to update annotation
3. Verify annotation visibility updates correctly

**Acceptance**:
- Start Frame dropdown is enabled and functional
- Changing start frame updates annotation visibility
- Annotation appears only from selected frame onward

#### Phase 3.2: Edge Case Error Handling

**Files Modified**:
- `src/store/projectStore.ts` (frame limit)
- `src/components/Sidebar/ProjectActions.tsx` (JSON load)

**Changes**:
1. Add toast notification when 50-frame limit reached
2. Add toast notification when invalid JSON loaded
3. Verify all edge cases produce user-friendly feedback

**Acceptance**:
- Adding 51st frame shows clear message
- Loading invalid JSON shows toast (not just console error)
- All error messages are user-friendly

---

## Testing Strategy

### Manual Verification Checklist

**P0 Bugs**:
- [ ] Share Link creates URL and copies to clipboard
- [ ] Share Link shows clear error when env missing
- [ ] Export at 720p produces 1280x720 video
- [ ] Export at 1080p produces 1920x1080 video

**P1 Polish**:
- [ ] Canvas renders sharply on HiDPI display
- [ ] All UI uses Pitch Green `#1A3D1A` for primary
- [ ] All UI uses Tactics White `#F8F9FA` for background
- [ ] No rounded corners in UI components
- [ ] Monospace font used for timecodes/coordinates

**P2 Compliance**:
- [ ] Annotation start frame selector is functional
- [ ] 50-frame limit shows user-friendly message
- [ ] Invalid JSON load shows user-friendly toast

### Regression Testing

- [ ] Existing animation playback works correctly
- [ ] Entity drag-and-drop still functional
- [ ] Frame navigation works correctly
- [ ] Auto-save to LocalStorage still works
- [ ] Video export completes without errors

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Supabase setup complexity | High | Provide clear setup docs, test locally first |
| Export resolution breaks existing exports | Medium | Test both resolutions thoroughly, verify backward compatibility |
| HiDPI changes affect performance | Low | Test on standard displays, add performance monitoring |
| Design token changes break existing UI | Medium | Audit systematically, test all screens |

---

## Rollout Plan

1. **Phase 0**: Setup and verification (no user-facing changes)
2. **Phase 1**: Deploy P0 bug fixes to production
3. **Phase 2**: Deploy P1 polish improvements
4. **Phase 3**: Deploy P2 compliance features

**Deployment**: Vercel auto-deploy on merge to main branch

---

## Success Metrics

- ✅ Share Link success rate: 100% when configured
- ✅ Export resolution accuracy: 100% match to UI selection
- ✅ HiDPI rendering: No visible blur on 2x displays
- ✅ Constitution compliance: 100% color/typography adherence
- ✅ Zero regressions in existing functionality

---

## References

- **Spec**: `specs/002-clean-iteration/spec.md`
- **PRD**: `.specify/memory/PRD.md`
- **Constitution**: `.specify/memory/constitution.md`
- **Previous Iteration**: `specs/001-rugby-animation-tool/`
- **Gap Analysis**: See checkpoint summary from 2026-01-28
