# Animation Feature Module

## Overview

The animation feature module provides the core editing and playback functionality for rugby coaching animations. It includes a full-featured canvas-based editor with React-Konva, timeline controls, entity management, and a read-only replay viewer for sharing.

**Location**: `src/features/animation/`
**Primary Routes**: `/app` (editor), `/replay/[id]` (viewer)
**Key Dependencies**: React-Konva, Zustand (via `@/core/stores`), EntityColors service

## Architecture

### Component Hierarchy

```
Editor (Main orchestrator)
├── Stage (Konva.Stage wrapper)
│   ├── Field (Sport field background)
│   ├── FieldLayoutOverlay (Grid, pitch lines)
│   ├── EntityLayer (Draggable entities)
│   │   └── PlayerToken (Individual entity renderer)
│   ├── GhostLayer (Frame preview)
│   ├── AnnotationLayer (Arrows, paths)
│   └── AnnotationDrawingLayer (Active drawing)
├── Sidebar
│   ├── EntityPalette (Add entities)
│   ├── EntityProperties (Edit selected entity)
│   ├── ProjectActions (Save, load, export)
│   ├── ShareButton (Cloud save & publish)
│   └── SportSelector (Change sport type)
└── Timeline
    ├── FrameStrip (Frame thumbnails)
    ├── FrameThumbnail (Individual frame preview)
    └── PlaybackControls (Play, pause, speed)

ReplayViewer (Read-only playback)
├── Stage (Shared with Editor)
│   ├── Field (Shared)
│   ├── EntityLayer (Shared)
│   └── AnnotationLayer (Shared)
└── PlaybackControls (Custom replay controls)
```

### Data Flow

1. **User Input** → Editor handlers (`handleAddCone`, `handleAddPlayer`, etc.)
2. **Handler** → Zustand store action (`addEntity`, `updateEntity`, etc.)
3. **Store** → Immutable state update
4. **State Change** → React re-render
5. **Canvas** → EntityLayer/AnnotationLayer re-draw via React-Konva

### Shared Canvas Components

The following components are **shared between Editor and ReplayViewer**. When modifying these, test both routes:

- `Stage.tsx` - Konva.Stage wrapper with responsive sizing
- `Field.tsx` - Sport field background (rugby, soccer, etc.)
- `PlayerToken.tsx` - Entity renderer (players, cones, balls, tackle equipment)
- `EntityLayer.tsx` - Draggable entity container
- `AnnotationLayer.tsx` - Arrows, lines, paths

**Why shared?** Ensures pixel-identical rendering between editing and replay modes.

## Key Components

### Canvas Components (`components/Canvas/`)

#### Stage.tsx
Konva.Stage wrapper with responsive canvas sizing.

**Props**: `StageProps` (width, height, stageRef, children, onMouseDown, onMouseMove, onMouseUp)
**Features**: Touch support, drag bounds enforcement

#### Field.tsx
Renders the sport field background using SVG images.

**Props**: `FieldProps` (sport, width, height)
**Supported Sports**: Rugby Union, Rugby League, Soccer, American Football

#### PlayerToken.tsx
Renders individual entities (players, cones, balls, tackle equipment).

**Props**: `PlayerTokenProps` (entity, onClick, onDragStart, onDragEnd, draggable)
**Color Resolution**: Uses `EntityColors.resolve()` for color fallbacks
**Entity Types**: player, cone, ball, tackle-shield, tackle-bag, equipment

#### EntityLayer.tsx
Container for all draggable entities with Konva.Layer.

**Props**: `EntityLayerProps` (entities, selectedEntityId, onEntityClick, onEntityDragEnd, draggable)
**Features**: Drag & drop, selection highlighting, touch support

#### AnnotationLayer.tsx
Renders static annotations (arrows, lines, paths).

**Props**: `AnnotationLayerProps` (annotations, selectedAnnotationId, onAnnotationClick)
**Annotation Types**: arrow, line, freehand-path

#### AnnotationDrawingLayer.tsx
Handles active drawing mode for creating new annotations.

**Props**: `AnnotationDrawingLayerProps` (mode, onComplete)
**Drawing Modes**: arrow, line, freehand-path

### Editor Component (`components/Editor.tsx`)

Main animation editor orchestrator. Coordinates canvas, sidebar, timeline, and state management.

**Props**: `EditorProps` (isAuthenticated, onSaveToCloud, loadingFromCloud)

**Entity Creation Handlers**:
- `handleAddCone()` - Creates cone with default high-vis yellow
- `handleAddBall()` - Creates ball with default white
- `handleAddPlayer()` - Creates player token with team colors
- `handleAddTackleShield()` - Creates tackle shield
- `handleAddTackleBag()` - Creates tackle bag

**⚠️ Important**: This is the ONLY editor implementation post-Vite migration. All entity handlers use the `EntityColors` service (never hardcoded hex values).

### ReplayViewer Component (`components/ReplayViewer.tsx`)

Read-only animation playback component for `/replay/[id]` routes.

**Props**: `ReplayViewerProps` (payload)

**Key Features**:
- Reuses Editor's canvas components for pixel-identical rendering
- Store-free animation loop (`useReplayAnimationLoop` hook)
- Backward compatibility via `normalizeReplayPayload()`
- Speed controls: 0.5x, 1x, 2x
- Loop toggle

**Payload Hydration**: Handles both V1 SharePayload (`frames[].updates`) and V2 ReplayPayload (`frames[].entities`)

### Sidebar Components (`components/Sidebar/`)

#### EntityPalette.tsx
Drag-and-drop entity creation palette.

**Props**: `EntityPaletteProps` (onAddEntity)
**Entity Types**: Players (Attack/Defense), Cones, Balls, Tackle Equipment

#### EntityProperties.tsx
Property editor for selected entities (color, label, orientation).

**Props**: None (reads from Zustand store)
**Features**: Color picker, label input, rotation slider, delete button

#### ProjectActions.tsx
Project-level actions (New, Load, Save JSON, Export Video).

**Props**: None
**Actions**: New project, Load JSON, Save JSON, Export MP4/WebM

#### ShareButton.tsx
Cloud save and publish button (requires authentication).

**Props**: None
**Features**: Opens `SaveToCloudModal`, disabled for guest users

#### SportSelector.tsx
Dropdown to change sport type (changes field background).

**Props**: None
**Sports**: Rugby Union, Rugby League, Soccer, American Football

### Timeline Components (`components/Timeline/`)

#### FrameStrip.tsx
Horizontal strip of frame thumbnails with add/duplicate/delete controls.

**Props**: `FrameStripProps` (frames, currentFrameIndex, onFrameSelect, onAddFrame, onRemoveFrame, onDuplicateFrame)

#### FrameThumbnail.tsx
Individual frame preview with canvas snapshot.

**Props**: `FrameThumbnailProps` (frame, index, isSelected, onClick, onDelete, onDuplicate)

#### PlaybackControls.tsx
Play/pause, reset, speed control, loop toggle.

**Props**: `PlaybackControlsProps` (isPlaying, playbackSpeed, loopPlayback, onPlayPause, onReset, onSpeedChange, onLoopToggle)

### Services

#### entityColors.ts
Centralized entity color resolution service (single source of truth for entity colors).

**API**:
- `getDefault(type: EntityType, team?: TeamType): string` - Returns default color for entity type
- `resolve(color: string | undefined, type: EntityType, team?: TeamType): string` - Resolves color with fallback to defaults

**Dependency Rule**: `Entities → EntityColors → DESIGN_TOKENS` (never reverse)

**Domain Assumptions**:
- Ball: White oval token.
- Cones are High-Vis Yellow (`neutral[2]`)
- Players use team colors (red/blue gradients)

**⚠️ Important**: This service is **mandatory** for all entity color logic. Never use `DESIGN_TOKENS` or hex literals directly in entity handlers or UI rendering.

## Usage Examples

### Basic Import Pattern

```typescript
import {
  Editor,
  ReplayViewer,
  Stage,
  Field,
  EntityLayer,
  PlayerToken,
  EntityColors,
} from '@/features/animation';
import type {
  StageProps,
  FieldProps,
  PlayerTokenProps,
} from '@/features/animation';
```

### Creating an Editor Page

```typescript
// src/app/app/page.tsx
'use client';

import { Editor } from '@/features/animation';
import { useState } from 'react';

export default function EditorPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <div className="h-screen">
      <Editor
        isAuthenticated={isAuthenticated}
        onSaveToCloud={() => console.log('Save to cloud')}
        loadingFromCloud={false}
      />
    </div>
  );
}
```

### Creating a Replay Viewer Page

```typescript
// src/app/replay/[id]/page.tsx
'use client';

import { ReplayViewer } from '@/features/animation';
import { useEffect, useState } from 'react';

export default function ReplayPage({ params }: { params: { id: string } }) {
  const [payload, setPayload] = useState(null);

  useEffect(() => {
    // Fetch animation payload from API
    fetch(`/api/animations/${params.id}`)
      .then(res => res.json())
      .then(data => setPayload(data.payload));
  }, [params.id]);

  if (!payload) return <div>Loading...</div>;

  return <ReplayViewer payload={payload} />;
}
```

### Using EntityColors Service

```typescript
import { EntityColors } from '@/features/animation';
import type { EntityType, TeamType } from '@/core/types';

// Get default color for entity type
const coneColor = EntityColors.getDefault('cone'); // → '#fde047' (high-vis yellow)
const ballColor = EntityColors.getDefault('ball'); // → '#ffffff' (white)
const playerColor = EntityColors.getDefault('player', 'attack'); // → '#ef4444' (red)

// Resolve color with fallback
const resolvedColor = EntityColors.resolve(
  entity.color, // May be undefined or empty
  entity.type,
  entity.team
); // → Falls back to default if empty
```

### Adding a New Entity Handler

```typescript
// src/features/animation/components/Editor.tsx

const handleAddMyEntity = useCallback(() => {
  // ✅ Correct - Use EntityColors service
  const newEntity: EntityCreate = {
    type: 'my-entity',
    x: canvasWidth / 2,
    y: canvasHeight / 2,
    color: EntityColors.getDefault('my-entity'),
    label: 'E1',
  };

  // ❌ NEVER do this - No hardcoded hex values!
  // color: '#ff0000',

  // ❌ NEVER do this - No direct DESIGN_TOKENS access!
  // color: DESIGN_TOKENS.colors.neutral[2],

  addEntity(newEntity);
}, [canvasWidth, canvasHeight, addEntity]);
```

## State Management

### Zustand Stores (from `@/core/stores`)

#### useProjectStore
Manages animation project state (frames, entities, annotations, settings).

**Key State**:
- `project: Project | null` - Current project data
- `currentFrameIndex: number` - Active frame
- `isPlaying: boolean` - Playback state
- `isDirty: boolean` - Unsaved changes flag
- `playbackSpeed: PlaybackSpeed` - 0.5x, 1x, 2x
- `loopPlayback: boolean` - Loop toggle

**Key Actions**:
- `newProject()` - Create new project
- `loadProject(data)` - Load from JSON
- `addFrame()` - Add new frame
- `addEntity(entity)` - Create entity
- `updateEntity(id, updates)` - Update entity properties
- `play()`, `pause()`, `reset()` - Playback controls

#### useUIStore
Manages UI state (sidebar, drawing mode, selected entities).

**Key State**:
- `selectedEntityId: string | null` - Active entity for properties panel
- `drawingMode: DrawingMode | null` - Active annotation tool
- `sidebarPanel: SidebarPanel` - Current sidebar tab

**Key Actions**:
- `setSelectedEntity(id)` - Select entity
- `setDrawingMode(mode)` - Activate drawing tool
- `setSidebarPanel(panel)` - Switch sidebar tab

### Custom Hooks (from `@/core/hooks`)

#### useAnimationLoop
RAF-based animation playback with entity interpolation.

**Usage**:
```typescript
const { play, pause, reset } = useAnimationLoop();
```

**Features**: Smooth entity movement, speed control, loop support

#### useReplayAnimationLoop
Store-free animation loop for ReplayViewer (no Zustand dependency).

**Usage**:
```typescript
const {
  isPlaying,
  currentFrameIndex,
  play,
  pause,
  reset,
  setSpeed,
} = useReplayAnimationLoop(frames, fps);
```

**Differences from useAnimationLoop**:
- No Zustand store dependency
- Self-contained state (useState)
- Designed for read-only playback

#### useExport
Handles video export (MP4/WebM) via MediaRecorder API.

**Usage**:
```typescript
const { exportVideo, isExporting, progress } = useExport();
```

**Supported Formats**: MP4, WebM
**Resolutions**: 480p, 720p, 1080p

#### useFrameCapture
Captures canvas snapshots for thumbnails and export.

**Usage**:
```typescript
const { captureFrame } = useFrameCapture(stageRef);
const imageData = captureFrame(); // → base64 PNG
```

## Testing Patterns

### Component Tests

Test canvas components in isolation:

```typescript
import { render } from '@testing-library/react';
import { PlayerToken } from '@/features/animation';

test('renders player token with correct color', () => {
  const entity = {
    id: '1',
    type: 'player' as const,
    x: 100,
    y: 100,
    color: '#ef4444',
    label: 'P1',
  };

  const { container } = render(
    <Stage width={800} height={600}>
      <Layer>
        <PlayerToken entity={entity} onClick={() => {}} />
      </Layer>
    </Stage>
  );

  // Assert Konva elements rendered
  expect(container.querySelector('canvas')).toBeInTheDocument();
});
```

### Hook Tests

Test hooks with `@testing-library/react-hooks`:

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useReplayAnimationLoop } from '@/core/hooks/useReplayAnimationLoop';

test('useReplayAnimationLoop plays and pauses', () => {
  const frames = [
    { id: '1', index: 0, duration: 2000, entities: {}, annotations: [] },
    { id: '2', index: 1, duration: 2000, entities: {}, annotations: [] },
  ];

  const { result } = renderHook(() => useReplayAnimationLoop(frames, 30));

  // Initial state
  expect(result.current.isPlaying).toBe(false);
  expect(result.current.currentFrameIndex).toBe(0);

  // Play
  act(() => result.current.play());
  expect(result.current.isPlaying).toBe(true);

  // Pause
  act(() => result.current.pause());
  expect(result.current.isPlaying).toBe(false);
});
```

### E2E Tests (Playwright)

Test full editor workflow:

```typescript
import { test, expect } from '@playwright/test';

test('can create and play animation', async ({ page }) => {
  await page.goto('/app');

  // Add entities
  await page.click('[data-testid="add-cone-button"]');
  await page.click('[data-testid="add-player-button"]');

  // Add frame
  await page.click('[data-testid="add-frame-button"]');

  // Play animation
  await page.click('[data-testid="play-button"]');
  await expect(page.locator('[data-testid="play-button"]')).toHaveAttribute('aria-pressed', 'true');

  // Pause
  await page.click('[data-testid="pause-button"]');
  await expect(page.locator('[data-testid="play-button"]')).toHaveAttribute('aria-pressed', 'false');
});
```

## Future Enhancements

### V2.0 Features (Planned)

1. **Multi-User Collaboration**
   - Real-time editing with WebSockets
   - Conflict resolution for simultaneous edits
   - User cursors and presence indicators

2. **Advanced Entity Types**
   - Custom entity shapes (triangles, hexagons)
   - Equipment library (hurdles, agility poles, tackle bags)
   - Entity grouping and nesting

3. **Animation Templates**
   - Pre-built drill templates (lineouts, scrums, passing drills)
   - Template marketplace for sharing

4. **Enhanced Annotations**
   - Text labels with rich formatting
   - Distance measurements
   - Timing indicators

5. **Export Enhancements**
   - GIF export (currently missing)
   - Slow-motion replay
   - Export individual frames as images
   - PDF export with annotations

6. **Performance Optimizations**
   - Canvas layer caching for large projects
   - Virtualized frame strip for 50+ frames
   - Web Worker-based export pipeline

### Technical Debt

1. **Entity Color Service Migration**
   - ✅ COMPLETE: All entity handlers use `EntityColors` service
   - ✅ COMPLETE: No hardcoded hex values in UI rendering

2. **Type Safety Improvements**
   - Add strict null checks for entity properties
   - Improve generic types for store actions

3. **Test Coverage Gaps**
   - Missing tests for `AnnotationDrawingLayer`
   - Missing tests for `GhostLayer`
   - E2E tests for export functionality

4. **Accessibility**
   - Keyboard navigation for canvas entities
   - Screen reader support for timeline controls
   - Focus management for modal dialogs

## Migration Notes

### From Vite to Next.js (2026-01-30)

- **Old Editor**: `src/App.tsx` (deleted 2026-02-04)
- **New Editor**: `src/features/animation/components/Editor.tsx`
- **Breaking Changes**: None for consumers using barrel exports
- **Canvas SSR**: All canvas components use `'use client'` directive
- **Dynamic Imports**: Editor loaded with `next/dynamic` with `{ ssr: false }`

### From Flat Structure to Feature-Based (2026-02-14, T003)

- **Old Locations**:
  - `src/components/` → `src/features/animation/components/`
  - `src/services/` → `src/features/animation/services/`
- **New Imports**: Use path aliases (`@/features/animation`)
- **Breaking Changes**: None for consumers using barrel exports

## Related Documentation

- **Core Module**: [src/core/README.md](../../core/README.md) - Shared utilities, stores, hooks
- **Shared Module**: [src/shared/README.md](../../shared/README.md) - UI components
- **API Contracts**: [docs/architecture/api-contracts.md](../../../docs/architecture/api-contracts.md)
- **Database Schema**: [docs/architecture/database-schema.md](../../../docs/architecture/database-schema.md)
- **PRD v1.0**: [docs/authority/PRD.md](../../../docs/authority/PRD.md)
- **PRD v2.0**: [docs/authority/PRD-v2.0.md](../../../docs/authority/PRD-v2.0.md)

## Questions?

For architecture questions or contribution guidelines, see:
- **CLAUDE.md** - Project development guidelines
- **docs/development/getting-started.md** - Setup and onboarding
- **docs/troubleshooting/** - Debugging guides
