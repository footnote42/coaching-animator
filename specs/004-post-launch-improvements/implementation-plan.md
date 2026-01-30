# Post-Launch User Observations Implementation Plan

This plan addresses 17 new user-identified issues discovered during hands-on testing, organized into 6 thematic work packages with clear priorities and dependencies.

---

## Executive Summary

**Total Issues**: 17 new + 3 merged with existing = 20 actionable items  
**Critical Bugs**: 2 (Share Link broken, Replay rendering incorrect)  
**High Priority**: 5 work packages  
**Estimated Timeline**: 3-4 weeks across 6 parallel work streams

**Key Findings**:
- 2 critical bugs blocking core sharing functionality
- Navigation system needs complete overhaul (site-wide)
- Entity system requires visual redesign and new types
- Replay viewer has multiple rendering/UX issues

---

## Work Package 1: Critical Bug Fixes (P0)

**Priority**: CRITICAL - Block deployment  
**Estimated Effort**: 3-5 days  
**Dependencies**: None  
**Owner**: Backend + Frontend

### Issues Addressed
- **Obs #17**: Share Link feature broken (405 error)
- **Obs #18**: Replay viewer renders entities incorrectly
- **Obs #19**: Replay playback not smooth

### Implementation Tasks

#### Task 1.1: Fix Share Link API (Obs #17)
**File**: `app/api/share/route.ts` or similar
- Investigate 405 error - likely missing POST handler or route misconfiguration
- Check if share API endpoint exists and is properly configured
- Verify HTTP method matches frontend call
- Test share link generation end-to-end
- **Validation**: Share Link button creates valid shareable URL

#### Task 1.2: Fix Replay Entity Rendering (Obs #18)
**Files**: 
- `app/replay/[id]/ReplayViewer.tsx` (lines 1-249)
- `src/components/Canvas/EntityLayer.tsx`
- `src/components/Canvas/Field.tsx`

**Problems identified**:
- Entity types hardcoded as `'player' | 'ball' | 'cone' | 'marker'` (line 15)
- Simplified field markings (line 99: "Field markings - simplified")
- Different rendering logic than editor

**Actions**:
- Import and reuse Field component from editor (not simplified version)
- Use same entity rendering logic as EntityLayer
- Match entity shapes: ball should be oval, not circle
- Add all pitch markings (try line, 22m, 10m, posts)
- **Validation**: Replay matches editor appearance exactly

#### Task 1.3: Optimize Replay Playback (Obs #19)
**File**: `app/replay/[id]/ReplayViewer.tsx`
- Current: Uses setTimeout for frame transitions (line 79)
- Improve: Use requestAnimationFrame for smoother animation
- Match editor's animation loop implementation from `useAnimationLoop` hook
- Add frame interpolation if missing
- **Validation**: Replay playback smooth as editor

---

## Work Package 2: Navigation System Overhaul (P0)

**Priority**: CRITICAL - Affects entire site usability  
**Estimated Effort**: 4-6 days  
**Dependencies**: None  
**Owner**: Frontend

### Issues Addressed
- **Obs #9**: No navigation from /app editor (DUPLICATE of UX-009)
- **Obs #13**: Site-wide navigation poor (BROADER than UX-009)

### Implementation Tasks

#### Task 2.1: Create Shared Navigation Component
**New File**: `components/Navigation.tsx`

**Requirements**:
- Role-based visibility:
  - **Visitors**: Home, Gallery, Login, Register, Terms, Privacy, Contact
  - **Users**: All visitor links + My Gallery, Editor, Profile, Logout
  - **Admins**: All user links + Admin Dashboard
- Consistent placement across all pages
- Mobile responsive (hamburger menu)
- Active page highlighting

#### Task 2.2: Integrate Navigation Across Site
**Files to update**:
- `app/layout.tsx` - Add to root layout
- `app/(auth)/layout.tsx` - Simplified version for auth pages
- `app/(legal)/layout.tsx` - Already has navigation, ensure consistency
- `app/app/page.tsx` - Add to editor (currently missing)
- `app/my-gallery/page.tsx`
- `app/gallery/page.tsx`
- `app/profile/page.tsx`
- `app/admin/page.tsx`
- `app/replay/[id]/page.tsx`

#### Task 2.3: Add User Context Provider
**New File**: `lib/contexts/UserContext.tsx`
- Fetch user role on mount
- Provide to Navigation component
- Cache user data to avoid repeated fetches

**Validation**: 
- All pages have consistent navigation
- Role-based links show/hide correctly
- Mobile navigation works

---

## Work Package 3: Entity System Improvements (P1)

**Priority**: HIGH - Affects core editor usability  
**Estimated Effort**: 5-7 days  
**Dependencies**: None  
**Owner**: Frontend + Design

### Issues Addressed
- **Obs #4**: Entity tokens too large for pitch scale
- **Obs #6**: Default entity naming confusing
- **Obs #7**: Cone entities need redesign
- **Obs #8**: Color palette needs refinement
- **Obs #11**: New entity types (Tackle Shields & Bags)
- **Obs #12**: Entity spawn positions contextual

### Implementation Tasks

#### Task 3.1: Adjust Entity Token Sizes (Obs #4)
**Files**:
- `src/components/Canvas/PlayerToken.tsx`
- `src/constants/validation.ts` or similar

**Actions**:
- Reduce default token size by 20-30%
- Test with full team (15 players) on pitch
- Ensure proportions work across different pitch layouts
- **Validation**: Pitch feels realistic, not crowded

#### Task 3.2: Improve Default Entity Naming (Obs #6)
**File**: `src/store/projectStore.ts` (addEntity function)

**Current**: Likely generic names like "Player 1", "Entity 1"  
**New naming convention**:
- Attack players: "Att 01", "Att 02", "Att 03"...
- Defense players: "Def 01", "Def 02", "Def 03"...
- Ball: "Ball 1", "Ball 2"...
- Cone: "Cone 1", "Cone 2"...
- Marker: "Marker 1", "Marker 2"...

**Implementation**:
- Track counter per entity type
- Generate sequential names on creation
- **Validation**: New entities have logical default names

#### Task 3.3: Redesign Cone Entities (Obs #7)
**Files**:
- `src/components/Canvas/PlayerToken.tsx` or entity rendering logic
- `src/types/index.ts` (EntityType definition)
- `src/components/Sidebar/EntityPalette.tsx` - Remove marker button

**Current**: Cones and markers both circles, cones larger  
**Decision**: Keep cones only, remove markers

**Implementation**:
- Change cones to **hollow circles** (donut shape)
- Reduce size to match current marker size
- Remove marker entity type from code
- Remove marker button from entity palette
- Color-coded cones serve all marking purposes
- Keep marker code commented for potential reintroduction

**Visual**: Hollow circle (ring/donut) with configurable stroke width and color

**Validation**: Cones visually distinct as hollow circles, appropriate size

#### Task 3.4: Refine Entity Color Palette (Obs #8)
**File**: `src/constants/design-tokens.ts` (lines 16-19)

**Current colors**:
```typescript
attack: ['#2563EB', '#10B981', '#06B6D4', '#8B5CF6'],
defense: ['#DC2626', '#EA580C', '#F59E0B', '#EF4444'],
neutral: ['#FFFFFF', '#8B4513', '#FFD700', '#FF6B35'],
```

**Issues**: Brown (#8B4513), Orange (#FF6B35, #EA580C, #F59E0B) not traditional sports colors

**New palette** (traditional sports):
```typescript
attack: ['#2563EB', '#10B981', '#06B6D4', '#8B5CF6'], // Blue, Green, Cyan, Purple
defense: ['#DC2626', '#EF4444', '#000000', '#FFFFFF'], // Red, Red-alt, Black, White
neutral: ['#FFFFFF', '#FFD700', '#C0C0C0', '#1A1A1A'], // White, Gold, Silver, Dark
```

**Validation**: Colors appropriate for sports context

#### Task 3.5: Add New Entity Types - Tackle Equipment (Obs #11)
**Files**:
- `src/types/index.ts` - Add to EntityType union (line 145-149)
- `src/components/Sidebar/EntityPalette.tsx` - Add buttons
- `src/components/Canvas/PlayerToken.tsx` - Add rendering logic
- `src/store/projectStore.ts` - Add creation handlers

**New entity types**:
```typescript
export type EntityType =
    | 'player'
    | 'ball'
    | 'cone'
    // 'marker' removed - consolidated into cones (hollow circles)
    | 'tackle-shield'
    | 'tackle-bag';
```

**Tackle Shield requirements**:
- Supports possession (parentId field)
- 4-way orientation: up, down, left, right
- Size: Fits inside player token, may overlap corners
- Visual: Shield/rectangle shape

**Tackle Bag requirements**:
- Static entity (no possession)
- 2-state orientation: upright (standing), fallen (90° rotation)
- Size: Almost as tall as player tokens
- Visual: **Cylindrical representation** (rounded rectangle or ellipse to suggest 3D cylinder)

**New Entity interface fields**:
```typescript
export interface Entity {
    // ... existing fields
    orientation?: 'up' | 'down' | 'left' | 'right' | 'upright' | 'fallen';
}
```

**Validation**: 
- Shields attach to players, move with them
- Shields rotate in 4 directions
- Bags have 2 states (upright/fallen)
- Appropriate sizes relative to players

#### Task 3.6: Contextual Entity Spawn Positions (Obs #12)
**File**: `src/store/projectStore.ts` (addEntity function)

**Current**: All entities spawn at center (400, 300 for 800x600 canvas)

**New logic**:
```typescript
// Default/full pitch
if (entityType === 'player' && team === 'attack') {
  x = 200; // Left side
} else if (entityType === 'player' && team === 'defense') {
  x = 600; // Right side
}

// Attack pitch layout (when implemented)
if (pitchLayout === 'attack') {
  if (team === 'attack') y = 450; // Bottom
  if (team === 'defense') y = 150; // Top
}

// Defense pitch layout (when implemented)
if (pitchLayout === 'defense') {
  if (team === 'attack') y = 150; // Top
  if (team === 'defense') y = 450; // Bottom
}
```

**Validation**: Entities spawn in logical positions based on type and pitch layout

---

## Work Package 4: Editor UI/UX Polish (P1)

**Priority**: HIGH - Affects daily usability  
**Estimated Effort**: 3-4 days  
**Dependencies**: None  
**Owner**: Frontend

### Issues Addressed
- **Obs #2**: Button styling inconsistencies
- **Obs #5**: Possession dropdown no background
- **Obs #10**: White space around pitch

### Implementation Tasks

#### Task 4.1: Standardize Button Styling (Obs #2)
**Files**:
- `src/components/Sidebar/EntityPalette.tsx` (lines 52-96)
- `src/components/Sidebar/ProjectActions.tsx`
- `components/ui/button.tsx` (if exists)

**Current issues**:
- Attack/Defense buttons: `variant="default"` (colored, no border/shadow)
- Ball/Cone/Marker buttons: `variant="outline"` (border, different style)
- Inconsistent across Project Actions

**Solution**:
- Create consistent button variant with color + border + shadow
- Apply to all entity palette buttons
- Apply to all project action buttons
- Follow Tactical Clubhouse Aesthetic (sharp corners, no rounded edges)

**Validation**: All buttons have consistent styling

#### Task 4.2: Fix Possession Dropdown Background (Obs #5)
**File**: `src/components/Sidebar/EntityProperties.tsx` or similar

**Issue**: Dropdown menu has no background, hard to read over canvas

**Solution**:
- Add solid background color (white or surface color)
- Add border for definition
- Ensure proper z-index layering
- Test with various canvas backgrounds

**Validation**: Dropdown readable against any background

#### Task 4.3: Address White Space Around Pitch (Obs #10)
**File**: `components/Editor.tsx` or canvas container

**Current**: Large white space around 800x600 canvas

**Decision**: Add subtle texture background

**Implementation**:
- Add subtle grass texture or tactical pattern to background
- Use CSS background-image or SVG pattern
- Ensure texture doesn't distract from canvas
- Keep texture subtle and professional
- Consider light warm gray base color (#F9FAFB) with texture overlay

**Future enhancement**: User customization (team logos) can be added later

**Validation**: White space has visual interest without distraction

---

## Work Package 5: Pitch Layout System (P1)

**Priority**: HIGH - New feature request  
**Estimated Effort**: 5-7 days  
**Dependencies**: Work Package 3 (entity spawn positions)  
**Owner**: Frontend

### Issues Addressed
- **Obs #3**: Pitch layout options needed

### Implementation Tasks

#### Task 5.1: Add Pitch Layout Types
**File**: `src/types/index.ts`

**New types**:
```typescript
export type PitchLayout = 
    | 'full'        // Full pitch (current default)
    | 'attack'      // Top half, try line at top, posts marked
    | 'defence'     // Bottom half, posts at bottom
    | 'training';   // Plain square, no markings

export interface ProjectSettings {
    // ... existing fields
    pitchLayout: PitchLayout;
}
```

#### Task 5.2: Create Pitch Layout Components
**Files**:
- `src/components/Canvas/Field.tsx` - Update to support layouts
- `src/components/Canvas/FieldAttack.tsx` - New component
- `src/components/Canvas/FieldDefence.tsx` - New component
- `src/components/Canvas/FieldTraining.tsx` - New component

**Attack layout**:
- Show top half of pitch only
- Try line at top edge
- Posts marked at top
- 22m, 10m lines visible

**Defence layout**:
- Show bottom half of pitch only
- Try line at bottom edge
- Posts marked at bottom
- 22m, 10m lines visible

**Training layout**:
- Plain square/rectangle
- No markings
- Solid color or minimal grid

#### Task 5.3: Add Pitch Layout Selector UI
**File**: `src/components/Sidebar/ProjectActions.tsx` or new settings panel

**UI**: Dropdown or button group
- Full Pitch (default)
- Attack View
- Defence View
- Training Pitch

**Validation**: 
- Pitch layout changes dynamically
- Entity spawn positions adjust (from WP3 Task 3.6)
- All layouts render correctly

---

## Work Package 6: Content & Metadata Fixes (P2)

**Priority**: MEDIUM - Quality improvements  
**Estimated Effort**: 2-3 days  
**Dependencies**: None  
**Owner**: Frontend + Content

### Issues Addressed
- **Obs #1**: British English spelling standardization
- **Obs #14**: Profile animation counter broken
- **Obs #15**: Gallery thumbnails bland (DUPLICATE - already in T005)
- **Obs #16**: Edit modal missing description field
- **Obs #20**: Replay page missing description
- **Obs #21**: Replay page visual design plain

### Implementation Tasks

#### Task 6.1: Standardize British English Spelling (Obs #1)
**Files**: All content files, primarily:
- `app/page.tsx` (line 68: "Visualize" → "Visualise")
- Search codebase for: "color", "organize", "analyze", "realize"
- Replace with: "colour", "organise", "analyse", "realise"

**Scope**: UI text, marketing copy, help text  
**Exclude**: Code variables, API endpoints, technical terms

**Validation**: All user-facing text uses British English

#### Task 6.2: Fix Profile Animation Counter (Obs #14)
**File**: `app/profile/page.tsx`

**Issue**: Shows "0 out of 50" for all users

**Root cause**: Likely not fetching `animation_count` from `user_profiles` table

**Solution**:
- Fetch user profile data including `animation_count`
- Display actual count: `{animationCount} out of 50`
- Update on animation save/delete

**Validation**: Counter shows correct number of saved animations

#### Task 6.3: Add Description to Edit Modal (Obs #16)
**File**: `components/EditMetadataModal.tsx` (lines 1-203)

**Current fields**: Title, Animation Type, Visibility (lines 28-30)  
**Missing**: Description field

**Add**:
```typescript
const [description, setDescription] = useState(animation.description || '');
```

**Add to form**: Textarea for description (after title, before type)

**Add to API call** (line 49-53):
```typescript
body: JSON.stringify({
  title: title.trim(),
  description: description.trim() || null,
  animation_type: animationType,
  visibility,
}),
```

**Validation**: Description can be edited after initial save

#### Task 6.4: Add Description to Replay Page (Obs #20)
**File**: `app/replay/[id]/page.tsx`

**Current**: Shows title and creator name  
**Missing**: Description field

**Solution**:
- Fetch description from animation data
- Display below title/creator
- Format with line breaks if needed

**Validation**: Description visible on replay page

#### Task 6.5: Improve Replay Page Visual Design (Obs #21)
**File**: `app/replay/[id]/page.tsx` and related styles

**Current**: White background + green pitch = dull

**Options**:
- Subtle texture background (grass, tactical pattern)
- Light gray/warm background color
- Gradient background (not too bright)

**Recommended**: Light warm gray (#F9FAFB) with subtle texture

**Validation**: Replay page visually appealing, not distracting

---

## Implementation Sequence & Timeline

### Week 1: Critical Bugs + Navigation
- **Days 1-3**: Work Package 1 (Critical Bugs)
  - Fix Share Link API
  - Fix Replay rendering
  - Optimize playback
- **Days 4-5**: Work Package 2 (Navigation) - Start
  - Create Navigation component
  - Begin integration

### Week 2: Navigation + Entity System
- **Days 1-2**: Work Package 2 (Navigation) - Complete
  - Finish integration across all pages
  - Test role-based visibility
- **Days 3-5**: Work Package 3 (Entity System) - Start
  - Adjust token sizes
  - Improve naming
  - Redesign cones

### Week 3: Entity System + Editor Polish
- **Days 1-3**: Work Package 3 (Entity System) - Complete
  - Add tackle equipment
  - Contextual spawn positions
  - Refine color palette
- **Days 4-5**: Work Package 4 (Editor Polish)
  - Standardize buttons
  - Fix dropdown background
  - Address white space

### Week 4: Pitch Layouts + Content Fixes
- **Days 1-4**: Work Package 5 (Pitch Layouts)
  - Add layout types
  - Create layout components
  - Add selector UI
- **Days 5**: Work Package 6 (Content Fixes)
  - British English
  - Profile counter
  - Edit/replay descriptions
  - Visual polish

---

## Testing & Validation Checklist

### Critical Bug Fixes (WP1)
- [ ] Share Link generates valid URL
- [ ] Replay viewer matches editor appearance
- [ ] Entity shapes correct (ball oval, not circle)
- [ ] Pitch markings visible in replay
- [ ] Replay playback smooth (60 FPS)

### Navigation System (WP2)
- [ ] Navigation visible on all pages
- [ ] Role-based links show/hide correctly
- [ ] Mobile navigation works
- [ ] Active page highlighted
- [ ] Logout redirects to home

### Entity System (WP3)
- [ ] Token sizes proportional to pitch
- [ ] Default names follow convention
- [ ] Cones visually distinct from markers
- [ ] Color palette sports-appropriate
- [ ] Tackle shields attach to players
- [ ] Tackle bags have 2 states
- [ ] Entities spawn in logical positions

### Editor Polish (WP4)
- [ ] All buttons styled consistently
- [ ] Possession dropdown readable
- [ ] White space addressed

### Pitch Layouts (WP5)
- [ ] All 4 layouts render correctly
- [ ] Layout selector works
- [ ] Entity spawn adjusts per layout

### Content Fixes (WP6)
- [ ] British English throughout
- [ ] Profile counter shows correct number
- [ ] Description editable in modal
- [ ] Description visible on replay page
- [ ] Replay page visually improved

---

## Risk Assessment

### High Risk
- **Replay rendering fix**: May require significant refactoring if rendering logic deeply diverged
- **Navigation integration**: Could break existing layouts if not carefully implemented
- **Tackle equipment**: New entity types may expose edge cases in existing logic

### Medium Risk
- **Pitch layouts**: Requires careful coordinate mapping for different views
- **Entity spawn positions**: Must work with all pitch layouts

### Low Risk
- **Content fixes**: Straightforward text/data updates
- **Button styling**: CSS-only changes
- **Color palette**: Simple constant updates

---

## Dependencies & Blockers

### External Dependencies
- None identified

### Internal Dependencies
- WP3 Task 3.6 (spawn positions) depends on WP5 (pitch layouts) for full implementation
- WP2 (navigation) should complete before WP4 (editor polish) to avoid rework

### Potential Blockers
---

## Design Decisions Made

The following design decisions have been confirmed:

1. **Cone vs Marker** (WP3): Keep cones only (hollow circles), remove markers
2. **White Space** (WP4): Add subtle texture background
3. **Tackle Bag Visual** (WP3): Cylindrical representation

---

## Success Metrics

### Functional
- 0 critical bugs (Share Link, Replay rendering)
- 100% pages have navigation
- 2 new entity types working
- 4 pitch layouts available

### Quality
- Consistent button styling across editor
- British English throughout
- Accurate metadata display

### User Experience
- Replay viewer matches editor quality
- Entity system intuitive and realistic
- Navigation clear and accessible

---

## Next Steps

1. **Review this plan** - Confirm priorities and approach
2. **Make design decisions** - Cone/marker, white space, tackle bag visuals
3. **Start WP1** - Fix critical bugs immediately
4. **Parallel work** - WP2 (navigation) can start alongside WP1
5. **Iterate** - Test each work package before moving to next

---

**Plan Version**: 1.0  
**Created**: 2026-01-30  
**Status**: Ready for Review
