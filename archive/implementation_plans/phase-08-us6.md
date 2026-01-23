# Implementation Plan: Phase 8 - User Story 6 (Select Different Sports Fields)

**Feature**: Sport Field Selector  
**Priority**: P2  
**Estimated Complexity**: Low-Medium (3-4 tasks)  
**Estimated Time**: 2-3 hours

---

## Goal Description

Implement User Story 6 from the spec: "As a coach, I want to select different field types (Rugby Union, Rugby League, Soccer, American Football) so that I can create diagrams appropriate to my sport."

Currently, the field type is hardcoded to `rugby-union` in `App.tsx`. This implementation will:
1. Add a sport selector dropdown UI component to the sidebar
2. Implement the `updateProjectSettings` action to change the sport type
3. Wire the selector to dynamically update the field background
4. Ensure the selected sport persists in save/load operations

**Background Context**: The `Field.tsx` component already supports dynamic loading of SVG field assets based on the `sport` prop. All 4 field SVG files exist in `src/assets/fields/`. The foundation is solid; we just need to expose the control to users.

---

## User Review Required

> [!IMPORTANT]
> **Default Sport**: This implementation will maintain Rugby Union as the default sport for new projects (per Constitution FR-CON-02).

> [!NOTE]
> **Sport Change Behavior**: When a user changes the sport type, only the field background will change. Entity positions will remain unchanged. This may cause visual issues if switching between fields with different dimensions (e.g., American Football is narrower). We are NOT implementing automatic entity repositioning in this phase.

---

## Proposed Changes

### Component: Project Store

#### [MODIFY] [projectStore.ts](file:///c:/Coding%20Projects/coaching-animator/src/store/projectStore.ts)

**Location**: Line 173 (updateProjectSettings stub)

**Changes**:
- Implement the `updateProjectSettings` action to accept `ProjectSettingsUpdate` DTO
- Update `project.sport` when sport is changed
- Mark project as dirty (`isDirty = true`)
- Update `project.updatedAt` timestamp
- Validate incoming sport type against `SportType` union

---

### Component: Sidebar - Sport Selector

#### [NEW] [SportSelector.tsx](file:///c:/Coding%20Projects/coaching-animator/src/components/Sidebar/SportSelector.tsx)

**Purpose**: Dropdown component for selecting sport type.

**Features**:
- Dropdown/select UI showing all 4 sport options
- Display user-friendly labels (from `FIELD_DIMENSIONS` constants)
- Call `updateProjectSettings` on selection change
- Constitution-compliant styling:
  - Sharp corners (`border-radius: 0`)
  - Monospace font for dropdown
  - Pitch green accents
  - 1px schematic border

**Props**:
```typescript
interface SportSelectorProps {
  currentSport: SportType;
  onSportChange: (sport: SportType) => void;
}
```

**Implementation Notes**:
- Use native `<select>` element (offline-first, no external dependencies)
- Map `SportType` values to display names using `FIELD_DIMENSIONS[sport].name`
- Style to match existing sidebar aesthetic (see `EntityPalette.tsx` for reference)

---

### Component: Sidebar Integration

#### [MODIFY] [ProjectActions.tsx](file:///c:/Coding%20Projects/coaching-animator/src/components/Sidebar/ProjectActions.tsx)

**Changes**:
- Add `SportSelector` component import
- Add props for `currentSport` and `onSportChange`
- Render `SportSelector` at the top of the component (above Save/Load/Export buttons)
- Add section header: "Field Settings"

**Rationale**: `ProjectActions` is the appropriate location because:
1. Sport selection is a project-level setting (not frame-specific or entity-specific)
2. It's already handling project-level actions (save, load, export)
3. It's the first panel users see in the sidebar

---

### Component: App Integration

#### [MODIFY] [App.tsx](file:///c:/Coding%20Projects/coaching-animator/src/App.tsx)

**Changes**:

1. **Import and destructure** `updateProjectSettings` from `useProjectStore` (line ~28-48):
   ```typescript
   const {
     // ... existing destructures
     updateProjectSettings,
   } = useProjectStore();
   ```

2. **Create handler** for sport change:
   ```typescript
   const handleSportChange = (sport: SportType) => {
     updateProjectSettings({ sport });
   };
   ```

3. **Pass props to ProjectActions** (line ~302-308):
   ```typescript
   <ProjectActions
     currentSport={project?.sport || 'rugby-union'}
     onSportChange={handleSportChange}
     // ... existing props
   />
   ```

4. **Update Field component** to use dynamic sport (line ~338-342):
   ```typescript
   <Field
     sport={project?.sport || 'rugby-union'}
     width={canvasWidth}
     height={canvasHeight}
   />
   ```

---

## Verification Plan

### Automated Tests

**Build Check**:
```bash
npm run build
```
**Expected**: No TypeScript errors, successful compilation.

### Browser Tests

#### Test 1: Sport Selector Visibility
1. Run `npm run dev`
2. Open `http://localhost:5173`
3. **Verify**: Sport selector dropdown appears in the left sidebar under "Field Settings"
4. **Verify**: Current selection shows "Rugby Union" by default

#### Test 2: Field Switching - All Sports
1. Create a new project (or use existing)
2. Open the sport selector dropdown
3. **Verify**: All 4 options are listed:
   - Rugby Union
   - Rugby League
   - Soccer
   - American Football
4. Select "Rugby League"
5. **Verify**: Field background updates immediately to show Rugby League markings
6. Repeat for "Soccer" and "American Football"
7. **Verify**: Each field displays correct pitch markings

#### Test 3: Save/Load Persistence
1. Select "Soccer" as the sport
2. Add 2-3 player tokens to the field
3. Click "Save Project"
4. Download the JSON file
5. Click "New Project" (start fresh)
6. Click "Load Project" and select the saved JSON
7. **Verify**: Field loads with Soccer markings
8. **Verify**: Player positions are restored correctly

#### Test 4: Unsaved Changes Detection
1. Create a new project
2. Change sport from "Rugby Union" to "American Football"
3. Click "New Project" (without saving)
4. **Verify**: Unsaved changes warning dialog appears
5. Cancel the dialog
6. **Verify**: Field remains on American Football

#### Test 5: Constitution Compliance
1. Inspect the sport selector dropdown
2. **Verify**: Sharp corners (`border-radius: 0`)
3. **Verify**: Pitch green border or accent color
4. **Verify**: Monospace or readable font
5. **Verify**: 1px border, no drop shadows

---

## Acceptance Criteria Checklist

Per [spec.md User Story 6](file:///c:/Coding%20Projects/coaching-animator/specs/001-rugby-animation-tool/spec.md#L98-L112):

- [ ] **AC 1**: Default view loads with Rugby Union field
- [ ] **AC 2**: Sport selector allows choosing Rugby League, and field updates
- [ ] **AC 3**: Sport selector allows choosing Soccer, and field updates
- [ ] **AC 4**: Sport selector allows choosing American Football, and field updates
- [ ] **AC 5**: Selected sport persists in save/load operations
- [ ] **AC 6**: UI follows Constitution (sharp corners, monospace, pitch green)

---

## Technical Constraints

- **No external libraries**: Use native `<select>` element
- **SVG asset paths**: Must match existing convention `/src/assets/fields/{sport}.svg`
- **Type safety**: All sport values must be validated against `SportType` union
- **Constitution compliance**: Sharp corners, monospace fonts, pitch green accents

---

## Out of Scope

- **Entity repositioning**: When switching sports with different field dimensions, entities will NOT be automatically repositioned or scaled
- **Field dimension validation**: No warnings if entities are positioned outside the new field bounds
- **Custom field uploads**: Only the 4 built-in sports are supported
- **Field orientation (landscape/portrait)**: All fields are landscape

---

## Dependencies

- ✅ `Field.tsx` already supports dynamic `sport` prop
- ✅ All field SVG assets exist
- ✅ `FIELD_DIMENSIONS` constants defined
- ✅ `SportType` type defined
- ✅ `ProjectSettingsUpdate` DTO includes `sport` field
- ⏳ `updateProjectSettings` action needs implementation

---

**Ready for implementation. Proceed to execution phase after review approval.**
