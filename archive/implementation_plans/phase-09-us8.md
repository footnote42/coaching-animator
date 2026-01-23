# Phase 9: User Story 8 - Draw Annotations

> **Goal**: Enable coaches to draw arrows and lines on the field for tactical instructions.

## Overview

This implementation plan breaks User Story 8 into 5 incremental phases to mitigate context rot risk. Each phase produces working, testable code.

## Acceptance Criteria (from spec.md)

1. **Given** I select the Arrow tool, **When** I click and drag on the canvas, **Then** an arrow is drawn from start to end point
2. **Given** I have drawn an annotation, **When** I select it, **Then** I can change its color or delete it
3. **Given** annotations exist on a frame, **When** I export or save, **Then** the annotations are included

## Existing Foundation

- ✅ `Annotation` interface defined in `src/types/index.ts`
- ✅ `Frame.annotations: Annotation[]` array exists
- ✅ `AnnotationCreate` and `AnnotationUpdate` DTOs defined
- ⚠️ Store actions are stubs: `addAnnotation`, `updateAnnotation`, `removeAnnotation`

---

## Phase 1: Store & State Foundation (Low Risk)

### 1.1 Implement projectStore.ts actions

**File**: `src/store/projectStore.ts`

Replace stub implementations at lines 543-545:

```typescript
addAnnotation: (annotation: AnnotationCreate): string => set((state) => {
    if (!state.project) return '';
    const currentFrame = state.project.frames[state.currentFrameIndex];
    if (!currentFrame) return '';

    const id = crypto.randomUUID();
    const newAnnotation: Annotation = {
        id,
        type: annotation.type,
        points: annotation.points,
        color: annotation.color,
        startFrameId: currentFrame.id,
        endFrameId: currentFrame.id,
    };

    const updatedFrames = state.project.frames.map((frame, idx) =>
        idx === state.currentFrameIndex
            ? { ...frame, annotations: [...frame.annotations, newAnnotation] }
            : frame
    );

    return {
        project: {
            ...state.project,
            frames: updatedFrames,
            updatedAt: new Date().toISOString(),
        },
        isDirty: true,
    };
    return id;
}),

updateAnnotation: (annotationId: string, updates: Partial<AnnotationUpdate>) => set((state) => {
    if (!state.project) return {};
    const currentFrame = state.project.frames[state.currentFrameIndex];
    if (!currentFrame) return {};

    const updatedAnnotations = currentFrame.annotations.map(ann =>
        ann.id === annotationId ? { ...ann, ...updates } : ann
    );

    const updatedFrames = state.project.frames.map((frame, idx) =>
        idx === state.currentFrameIndex
            ? { ...frame, annotations: updatedAnnotations }
            : frame
    );

    return {
        project: {
            ...state.project,
            frames: updatedFrames,
            updatedAt: new Date().toISOString(),
        },
        isDirty: true,
    };
}),

removeAnnotation: (annotationId: string) => set((state) => {
    if (!state.project) return {};
    const currentFrame = state.project.frames[state.currentFrameIndex];
    if (!currentFrame) return {};

    const updatedAnnotations = currentFrame.annotations.filter(ann => ann.id !== annotationId);

    const updatedFrames = state.project.frames.map((frame, idx) =>
        idx === state.currentFrameIndex
            ? { ...frame, annotations: updatedAnnotations }
            : frame
    );

    return {
        project: {
            ...state.project,
            frames: updatedFrames,
            updatedAt: new Date().toISOString(),
        },
        isDirty: true,
    };
}),
```

### 1.2 Add drawing mode to uiStore.ts

**File**: `src/store/uiStore.ts`

Add new state and actions:

```typescript
// New type (add to types/index.ts)
export type DrawingMode = 'none' | 'arrow' | 'line';

// New state in UIStoreState
drawingMode: DrawingMode;
selectedAnnotationId: string | null;

// New actions
setDrawingMode: (mode: DrawingMode) => void;
selectAnnotation: (id: string | null) => void;
```

### 1.3 Verification

```bash
npm run build  # Must pass with 0 errors
```

---

## Phase 2: Annotation Layer Component

### 2.1 Create AnnotationLayer.tsx

**File**: `src/components/Canvas/AnnotationLayer.tsx` [NEW]

```typescript
import React from 'react';
import { Layer, Arrow, Line } from 'react-konva';
import { Annotation } from '../../types';

export interface AnnotationLayerProps {
    annotations: Annotation[];
    selectedAnnotationId: string | null;
    onAnnotationSelect: (id: string) => void;
    interactive: boolean;
}

export const AnnotationLayer: React.FC<AnnotationLayerProps> = ({
    annotations,
    selectedAnnotationId,
    onAnnotationSelect,
    interactive,
}) => {
    return (
        <Layer listening={interactive}>
            {annotations.map((annotation) => {
                const isSelected = selectedAnnotationId === annotation.id;
                const [x1, y1, x2, y2] = annotation.points;

                if (annotation.type === 'arrow') {
                    return (
                        <Arrow
                            key={annotation.id}
                            points={[x1, y1, x2, y2]}
                            stroke={annotation.color}
                            strokeWidth={isSelected ? 4 : 3}
                            pointerLength={10}
                            pointerWidth={10}
                            onClick={() => onAnnotationSelect(annotation.id)}
                        />
                    );
                }

                return (
                    <Line
                        key={annotation.id}
                        points={[x1, y1, x2, y2]}
                        stroke={annotation.color}
                        strokeWidth={isSelected ? 4 : 2}
                        onClick={() => onAnnotationSelect(annotation.id)}
                    />
                );
            })}
        </Layer>
    );
};
```

### 2.2 Export from index.ts

**File**: `src/components/Canvas/index.ts`

```typescript
export { AnnotationLayer } from './AnnotationLayer';
```

### 2.3 Add to App.tsx

In Stage render tree, add AnnotationLayer between Field and EntityLayer.

---

## Phase 3: Drawing Interaction

### 3.1 Create AnnotationDrawingLayer.tsx

**File**: `src/components/Canvas/AnnotationDrawingLayer.tsx` [NEW]

Handles transient drawing state during click-and-drag:
- Tracks start point on mouseDown
- Renders preview shape during mouseMove
- Commits annotation on mouseUp

### 3.2 Modify Stage.tsx

Add drawing event handlers when `drawingMode !== 'none'`:
- `onMouseDown`: Start drawing
- `onMouseMove`: Update preview
- `onMouseUp`: Complete annotation

---

## Phase 4: UI Controls & Polish

### 4.1 Add annotation tools to EntityPalette.tsx

**File**: `src/components/Sidebar/EntityPalette.tsx`

Add new section after entity buttons:

```tsx
<h3 className="text-sm font-semibold text-tactics-white mt-4">Annotations</h3>
<div className="flex gap-2">
    <Button
        variant={drawingMode === 'arrow' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setDrawingMode('arrow')}
    >
        Arrow
    </Button>
    <Button
        variant={drawingMode === 'line' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setDrawingMode('line')}
    >
        Line
    </Button>
</div>
```

### 4.2 Wire deletion in App.tsx

Handle Delete key for selected annotation (similar to entity deletion).

---

## Phase 5: Verification & Documentation

### Build Check

```bash
npm run build
```

### Browser Tests

| # | Test | Expected Result |
|---|------|-----------------|
| 1 | Click Arrow → Drag on canvas | Arrow appears |
| 2 | Click Line → Drag on canvas | Line appears |
| 3 | Click on annotation | Selection highlight |
| 4 | Select annotation → Press Delete | Annotation removed |
| 5 | Save → Load project | Annotations persist |
| 6 | Create on Frame 2 → Go to Frame 1 | Annotation not visible |
| 7 | Export video | Annotations visible in export |

### Documentation Updates

- Update `HANDOFF.md` with completion status
- Update `tasks.md` with completion status

---

## Risk Assessment

| Phase | Risk | Mitigation |
|-------|------|------------|
| 1 | Low | Existing type foundation |
| 2 | Low | Simple Konva shapes |
| 3 | Medium | Drawing interaction complexity |
| 4 | Low | Pattern exists in EntityPalette |
| 5 | Low | Standard verification |

**Total Estimated Effort**: 3-4 hours across 2-3 sessions
