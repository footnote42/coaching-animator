# Coaching Animator Refinement Roadmap

**Created**: 2026-01-28  
**Purpose**: Bridge the gap between current state and intended "Warmer" vision  
**Priority Order**: UI/UX Warmth → Field Visuals → Share Functionality

---

## Executive Summary

Based on comprehensive audit findings, this roadmap addresses three critical areas:
1. **UI/UX "Warmth" & Contrast** - Transform clinical interface into warm, professional coaching environment
2. **Field Visuals** - Fix SVG asset loading preventing pitch rendering
3. **Share Functionality** - Resolve API endpoint issues and error handling

---

## Phase A: UI/UX "Warmth" & Contrast Fixes (Priority: HIGH)

**Rationale**: Immediate visual impact for user satisfaction and peer review readiness. These changes establish the "Warm Tactical Professionalism" aesthetic defined in Constitution v2.1.0.

### A.1 Color System Enhancement
**Files**: `src/index.css`, `src/constants/design-tokens.ts`

**Tasks**:
- [ ] Add warm accent color `#D97706` to CSS variables
- [ ] Add deep charcoal text `#111827` for enhanced contrast  
- [ ] Add surface warmth `#F9FAFB` for main backgrounds
- [ ] Update DESIGN_TOKENS with new warm color palette
- [ ] Remove cold gray utilities (`tactical-mono-*`)

**Expected Outcome**: Warmer, more inviting color scheme with improved readability

### A.2 Canvas Area Background Fix
**File**: `src/App.tsx` (line 424)

**Tasks**:
- [ ] Change `bg-tactical-mono-100` to `bg-[var(--color-surface-warm)]`
- [ ] Update canvas container border to use warm accent
- [ ] Ensure proper contrast between canvas and surroundings

**Expected Outcome**: Eliminates washed-out gray background, provides warm canvas context

### A.3 Button & Interactive Element Enhancement
**Files**: `src/components/ui/button.tsx`, `src/components/Sidebar/ProjectActions.tsx`

**Tasks**:
- [ ] Update primary buttons to use warm accent (`#D97706`)
- [ ] Enhance button hover states with warm transitions
- [ ] Improve visual hierarchy between primary/secondary actions
- [ ] Add subtle warmth to outline buttons

**Expected Outcome**: Clear visual hierarchy with warm, inviting interactive elements

### A.4 Typography & Spacing Improvements
**Files**: `src/index.css`, `src/components/Sidebar/ProjectActions.tsx`

**Tasks**:
- [ ] Increase heading font weights for better visual hierarchy
- [ ] Update text colors to use deep charcoal (`#111827`)
- [ ] Add warm undertones to text selection states
- [ ] Improve spacing consistency across components

**Expected Outcome**: Enhanced readability and professional appearance

### A.5 Timeline & Footer Enhancement
**Files**: `src/components/Timeline/` components

**Tasks**:
- [ ] Replace gray borders with warm accent borders
- [ ] Update playback controls with warm hover states
- [ ] Enhance frame strip visual contrast
- [ ] Add warmth to progress indicators

**Expected Outcome**: Cohesive warm aesthetic throughout timeline interface

---

## Phase B: Field Visuals (Priority: MEDIUM)

**Rationale**: Core functionality issue preventing proper pitch visualization. Critical for user understanding of tactical context.

### B.1 SVG Asset Path Correction
**File**: `src/components/Canvas/Field.tsx` (line 33)

**Tasks**:
- [ ] Change `/src/assets/fields/${sport}.svg` to `/assets/fields/${sport}.svg`
- [ ] Verify asset loading in development and production
- [ ] Test all 4 sport field types (rugby-union, rugby-league, soccer, american-football)

**Expected Outcome**: Green pitch with proper markings renders correctly

### B.2 Field Rendering Validation
**Files**: `src/components/Canvas/Field.tsx`, SVG assets

**Tasks**:
- [ ] Confirm SVG dimensions scale properly to canvas size
- [ ] Validate pitch marking visibility and contrast
- [ ] Test field rendering在不同 canvas resolutions
- [ ] Ensure field backgrounds use correct green (`#1A3D1A`)

**Expected Outcome**: Crisp, properly scaled field visuals with clear markings

### B.3 Asset Loading Error Handling
**File**: `src/components/Canvas/Field.tsx`

**Tasks**:
- [ ] Add fallback for missing SVG assets
- [ ] Implement loading state indicator
- [ ] Add error logging for asset loading failures
- [ ] Ensure graceful degradation for unsupported sports

**Expected Outcome**: Robust field rendering with proper error handling

---

## Phase C: Share Functionality (Priority: MEDIUM)

**Rationale**: Essential Tier 2 feature with current API configuration issues. Requires development environment setup and error handling improvements.

### C.1 Development API Configuration
**Files**: `vite.config.ts`, `api/` directory

**Tasks**:
- [ ] Create `vercel.json` configuration for local development
- [ ] Add Vite proxy configuration for API endpoints
- [ ] Set up local API server for development testing
- [ ] Configure environment variables for local development

**Expected Outcome**: Functional `/api/share` endpoint in development environment

### C.2 Error Handling Enhancement
**Files**: `src/hooks/useShareAnimation.ts`, `src/components/Sidebar/ShareButton.tsx`

**Tasks**:
- [ ] Add proper JSON parsing error handling
- [ ] Implement graceful degradation for API failures
- [ ] Add user-friendly error messages for network issues
- [ ] Ensure offline functionality remains intact

**Expected Outcome**: Robust share functionality with helpful error states

### C.3 Environment-Aware API Configuration
**Files**: `api/share.ts`, environment configuration

**Tasks**:
- [ ] Verify CORS configuration for development vs production
- [ ] Add environment-specific error handling
- [ ] Implement API health check functionality
- [ ] Add logging for debugging API issues

**Expected Outcome**: Reliable API communication across all environments

### C.4 Privacy Notice UX Enhancement
**File**: `src/components/Sidebar/ShareButton.tsx`

**Tasks**:
- [ ] Implement proper privacy notice dialog (not just toast)
- [ ] Add warm, trustworthy styling to privacy notice
- [ ] Ensure compliance with Constitution V.2 requirements
- [ ] Test privacy notice on first use

**Expected Outcome**: Professional, compliant privacy disclosure experience

---

## Implementation Notes

### Dependencies Between Phases
- **Phase A** can proceed independently (immediate visual improvements)
- **Phase B** requires no dependencies (standalone field rendering fix)
- **Phase C** depends on development environment setup

### Testing Strategy
- **Phase A**: Visual regression testing, contrast validation
- **Phase B**: Cross-browser field rendering tests
- **Phase C**: API endpoint testing, error scenario validation

### Success Metrics
- **Phase A**: User feedback on "warmth" and visual appeal
- **Phase B**: Field renders correctly in all sport modes
- **Phase C**: Share functionality works in development and production

---

## Constitutional Compliance

All phases must comply with Constitution v2.1.0 requirements:
- **Warm Tactical Professionalism** aesthetic (Phase A)
- **Privacy-First Architecture** safeguards (Phase C)
- **Tier 2 feature governance** (Phase C)

---

**Next Steps**: Begin Phase A implementation for immediate visual impact while parallel development addresses Phase B and C infrastructure issues.
