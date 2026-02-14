# Core Module

## Overview

The core module provides shared utilities, state management, domain logic, and type definitions used across all features. It serves as the foundational layer for the animation editor, galleries, and future features.

**Location**: `src/core/`
**Purpose**: Centralized business logic, reusable utilities, and global state
**Dependencies**: Zustand, React

## Architecture

### Module Structure

```
src/core/
├── stores/              # Zustand state management
│   ├── projectStore.ts  # Animation project state (frames, entities, annotations)
│   └── uiStore.ts       # Application UI state (playback, drawing, sidebar)
├── hooks/               # Custom React hooks
│   ├── useAnimationLoop.ts        # RAF-based playback with interpolation
│   ├── useReplayAnimationLoop.ts  # Store-free replay hook
│   ├── useAutoSave.ts             # Automatic localStorage persistence
│   ├── useExport.ts               # Video export (MP4/WebM)
│   ├── useFrameCapture.ts         # Canvas snapshot capture
│   ├── useShareAnimation.ts       # Cloud save & share
│   ├── useCanvasSize.ts           # Responsive canvas sizing
│   └── useKeyboardShortcuts.ts    # Editor keyboard shortcuts
├── types/               # TypeScript type definitions
│   ├── index.ts         # Core domain types (Project, Frame, Entity, Annotation)
│   ├── share.ts         # Share payload types (V1/V2)
│   └── gif.js.d.ts      # GIF library type declarations
├── utils/               # Pure utility functions
│   ├── fileIO.ts        # JSON download/upload
│   ├── serializeForShare.ts      # Payload serialization
│   ├── hydratePayload.ts         # Payload deserialization
│   ├── validation.ts             # Data validation (colors, names, entities)
│   ├── sanitization.ts           # String sanitization
│   └── interpolation.ts          # Animation interpolation (lerp)
├── constants/           # Design tokens and validation rules
│   ├── design-tokens.ts # Colors, spacing, typography
│   ├── fields.ts        # Sport field dimensions
│   └── validation.ts    # Max lengths, limits, constraints
└── index.ts             # Barrel export (public API)
```

### Dependency Rules

The core module is **dependency-free** from feature modules:

```
✅ features/animation/ → @/core
✅ features/gallery/   → @/core
✅ shared/             → @/core
❌ core/               → features/* (NEVER)
❌ core/               → shared/*   (NEVER)
```

**Why?** Core provides shared primitives. Features depend on core, not vice versa. This prevents circular dependencies and keeps the module reusable across V2.0 features (organizations, collections, progressions).

## State Management (Zustand Stores)

### useProjectStore

Manages animation project state (frames, entities, annotations, settings).

**File**: `stores/projectStore.ts`

**State**:
```typescript
{
  project: Project | null;             // Current project data
  currentFrameIndex: number;           // Active frame index
  isPlaying: boolean;                  // Playback state
  isDirty: boolean;                    // Unsaved changes flag
  playbackSpeed: PlaybackSpeed;        // 0.5x, 1x, 2x
  loopPlayback: boolean;               // Loop toggle
  playbackPosition: PlaybackPosition | null; // Frame interpolation data
}
```

**Key Actions**:

#### Project Management
- `newProject()` - Create new project with default frame
- `loadProject(data: unknown): LoadResult` - Load from JSON (validates schema)
- `saveProject(): string` - Serialize to JSON string
- `updateProjectSettings(updates: ProjectSettingsUpdate)` - Update project settings

#### Frame Management
- `setCurrentFrame(index: number)` - Switch active frame
- `addFrame()` - Add new frame after current
- `removeFrame(frameId: string)` - Delete frame
- `duplicateFrame(frameId: string)` - Clone frame with entities
- `updateFrame(frameId, updates: FrameUpdate)` - Update frame properties

#### Entity Management
- `addEntity(entity: EntityCreate): string` - Add entity to current frame
- `updateEntity(entityId: string, updates: EntityUpdate)` - Update entity properties
- `removeEntity(entityId: string)` - Remove from current frame only
- `removeEntityGlobally(entityId: string)` - Remove from all frames
- `propagateEntity(entityId: string)` - Copy to subsequent frames

#### Annotation Management
- `addAnnotation(annotation: AnnotationCreate): string` - Add annotation
- `updateAnnotation(annotationId: string, updates: AnnotationUpdate)` - Update annotation
- `removeAnnotation(annotationId: string)` - Delete annotation

#### Playback Controls
- `play()` - Start playback
- `pause()` - Pause playback
- `reset()` - Reset to frame 0
- `setPlaybackSpeed(speed: PlaybackSpeed)` - Change speed (0.5x, 1x, 2x)
- `toggleLoop()` - Toggle loop playback
- `setPlaybackPosition(position: PlaybackPosition)` - Set interpolation state

**Usage Example**:
```typescript
import { useProjectStore } from '@/core';

function MyComponent() {
  const {
    project,
    currentFrameIndex,
    addEntity,
    updateEntity,
  } = useProjectStore();

  const handleAddPlayer = () => {
    const entityId = addEntity({
      type: 'player',
      x: 400,
      y: 300,
      color: '#ef4444',
      label: 'P1',
      team: 'attack',
    });
    console.log('Created entity:', entityId);
  };

  return <button onClick={handleAddPlayer}>Add Player</button>;
}
```

### useUIStore

Manages application UI state (sidebar, drawing mode, selected entities).

**File**: `stores/uiStore.ts`

**State**:
```typescript
{
  selectedEntityId: string | null;     // Active entity for properties panel
  selectedAnnotationId: string | null; // Active annotation
  drawingMode: DrawingMode | null;     // arrow, line, freehand-path
  sidebarPanel: SidebarPanel;          // entities, properties, settings
  exportStatus: ExportStatus;          // idle, exporting, complete, error
  exportProgress: number;              // 0-100
  pendingAction: PendingAction | null; // Queued action (load, new)
}
```

**Key Actions**:

#### Selection Management
- `setSelectedEntity(id: string | null)` - Select entity for properties panel
- `setSelectedAnnotation(id: string | null)` - Select annotation
- `clearSelection()` - Deselect all

#### Drawing Mode
- `setDrawingMode(mode: DrawingMode | null)` - Activate annotation tool
- `cancelDrawing()` - Exit drawing mode

#### Sidebar
- `setSidebarPanel(panel: SidebarPanel)` - Switch sidebar tab

#### Export Status
- `setExportStatus(status: ExportStatus)` - Update export state
- `setExportProgress(progress: number)` - Update progress (0-100)

#### Pending Actions
- `setPendingAction(action: PendingAction)` - Queue action (e.g., load after confirm)
- `clearPendingAction()` - Clear queue

**Usage Example**:
```typescript
import { useUIStore } from '@/core';

function Sidebar() {
  const {
    selectedEntityId,
    setSelectedEntity,
    sidebarPanel,
    setSidebarPanel,
  } = useUIStore();

  return (
    <div>
      <button onClick={() => setSidebarPanel('entities')}>
        Entities
      </button>
      <button onClick={() => setSidebarPanel('properties')}>
        Properties
      </button>

      {selectedEntityId && (
        <div>Selected: {selectedEntityId}</div>
      )}
    </div>
  );
}
```

## Custom React Hooks

### Animation & Playback Hooks

#### useAnimationLoop

RAF-based animation playback with entity interpolation.

**File**: `hooks/useAnimationLoop.ts`

**Features**:
- Smooth entity movement between frames
- Speed control (0.5x, 1x, 2x)
- Loop support
- requestAnimationFrame-based timing

**Usage**:
```typescript
import { useAnimationLoop } from '@/core';

function Editor() {
  const { play, pause, reset } = useAnimationLoop();

  return (
    <div>
      <button onClick={play}>Play</button>
      <button onClick={pause}>Pause</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

**How it works**:
1. Reads frames from `useProjectStore`
2. Calculates interpolation between frames
3. Updates `playbackPosition` in store
4. Canvas components render entities at interpolated positions

#### useReplayAnimationLoop

Store-free animation loop for ReplayViewer (no Zustand dependency).

**File**: `hooks/useReplayAnimationLoop.ts`

**Differences from useAnimationLoop**:
- No Zustand store dependency (uses local useState)
- Self-contained state management
- Designed for read-only playback

**Usage**:
```typescript
import { useReplayAnimationLoop } from '@/core';

function ReplayViewer({ frames }: { frames: Frame[] }) {
  const {
    isPlaying,
    currentFrameIndex,
    playbackPosition,
    play,
    pause,
    reset,
    setSpeed,
  } = useReplayAnimationLoop(frames, 30); // 30 fps

  return (
    <div>
      <button onClick={play}>Play</button>
      <button onClick={pause}>Pause</button>
      <select onChange={(e) => setSpeed(Number(e.target.value) as PlaybackSpeed)}>
        <option value={0.5}>0.5x</option>
        <option value={1}>1x</option>
        <option value={2}>2x</option>
      </select>
    </div>
  );
}
```

#### useKeyboardShortcuts

Editor keyboard shortcuts (play, add frame, undo, etc.).

**File**: `hooks/useKeyboardShortcuts.ts`

**Shortcuts**:
- `Space` - Play/Pause
- `Ctrl+N` - New project
- `Ctrl+S` - Save project
- `Ctrl+O` - Load project
- `Delete` - Delete selected entity
- `Escape` - Clear selection

**Usage**:
```typescript
import { useKeyboardShortcuts } from '@/core';

function Editor() {
  useKeyboardShortcuts(); // Activates shortcuts

  return <div>Editor content...</div>;
}
```

### Export & Capture Hooks

#### useExport

Handles video export (MP4/WebM) via MediaRecorder API.

**File**: `hooks/useExport.ts`

**Features**:
- Supports MP4 and WebM formats
- Multiple resolutions (480p, 720p, 1080p)
- Progress tracking
- Canvas capture via MediaRecorder

**Usage**:
```typescript
import { useExport } from '@/core';

function ExportButton() {
  const { exportVideo, isExporting, progress } = useExport();

  const handleExport = () => {
    exportVideo({
      format: 'mp4',
      resolution: '720p',
      filename: 'my-animation.mp4',
    });
  };

  return (
    <button onClick={handleExport} disabled={isExporting}>
      {isExporting ? `Exporting ${progress}%` : 'Export Video'}
    </button>
  );
}
```

#### useFrameCapture

Captures canvas snapshots for thumbnails and export.

**File**: `hooks/useFrameCapture.ts`

**Features**:
- Captures Konva.Stage as base64 PNG
- Used for frame thumbnails and cloud uploads

**Usage**:
```typescript
import { useFrameCapture } from '@/core';
import { useRef } from 'react';
import Konva from 'konva';

function Canvas() {
  const stageRef = useRef<Konva.Stage>(null);
  const { captureFrame } = useFrameCapture(stageRef);

  const handleCapture = () => {
    const imageData = captureFrame(); // → base64 PNG string
    console.log('Captured:', imageData);
  };

  return (
    <div>
      <Stage ref={stageRef} width={800} height={600}>
        {/* Canvas layers */}
      </Stage>
      <button onClick={handleCapture}>Capture Frame</button>
    </div>
  );
}
```

### Cloud & Share Hooks

#### useShareAnimation

Handles cloud save & share functionality.

**File**: `hooks/useShareAnimation.ts`

**Features**:
- Saves animation to Supabase
- Generates shareable replay link
- Handles authentication check
- Progress tracking

**Usage**:
```typescript
import { useShareAnimation } from '@/core';

function ShareButton() {
  const { shareAnimation, isSharing } = useShareAnimation();

  const handleShare = async () => {
    const result = await shareAnimation({
      name: 'My Drill',
      description: 'Lineout play',
      visibility: 'public',
    });

    if (result.success) {
      console.log('Share link:', result.url);
      navigator.clipboard.writeText(result.url);
    }
  };

  return (
    <button onClick={handleShare} disabled={isSharing}>
      {isSharing ? 'Sharing...' : 'Share to Cloud'}
    </button>
  );
}
```

#### useAutoSave

Automatic localStorage persistence for unsaved changes.

**File**: `hooks/useAutoSave.ts`

**Features**:
- Debounced auto-save (5 second delay)
- localStorage key: `coaching-animator-autosave`
- Only saves when `isDirty` flag is set

**Usage**:
```typescript
import { useAutoSave } from '@/core';

function Editor() {
  useAutoSave(); // Activates auto-save

  return <div>Editor content...</div>;
}
```

### Utility Hooks

#### useCanvasSize

Responsive canvas sizing with aspect ratio preservation.

**File**: `hooks/useCanvasSize.ts`

**Features**:
- Responsive to container size
- Maintains 4:3 aspect ratio
- Debounced resize events

**Usage**:
```typescript
import { useCanvasSize } from '@/core';

function Canvas() {
  const { width, height } = useCanvasSize();

  return (
    <Stage width={width} height={height}>
      {/* Canvas layers */}
    </Stage>
  );
}
```

## Type Definitions

### Core Domain Types

**File**: `types/index.ts`

#### Project
```typescript
interface Project {
  version: string;
  id: string;
  name: string;
  sport: SportType;
  createdAt: string;
  updatedAt: string;
  frames: Frame[];
  settings: ProjectSettings;
}
```

#### Frame
```typescript
interface Frame {
  id: string;
  index: number;
  duration: number; // milliseconds
  entities: Record<string, Entity>;
  annotations: Annotation[];
}
```

#### Entity
```typescript
interface Entity {
  id: string;
  type: EntityType;
  x: number;
  y: number;
  color?: string;
  label?: string;
  team?: TeamType;
  orientation?: EntityOrientation;
}
```

#### Annotation
```typescript
interface Annotation {
  id: string;
  type: AnnotationType;
  points: number[]; // [x1, y1, x2, y2, ...]
  color: string;
  strokeWidth: number;
}
```

### Enums & Union Types

#### SportType
```typescript
type SportType = 'rugby-union' | 'rugby-league' | 'soccer' | 'american-football';
```

#### EntityType
```typescript
type EntityType = 'player' | 'cone' | 'ball' | 'tackle-shield' | 'tackle-bag' | 'equipment';
```

**Constant**: `ENTITY_TYPES` - Array of all valid entity types (for validation)

#### TeamType
```typescript
type TeamType = 'attack' | 'defense';
```

#### AnnotationType
```typescript
type AnnotationType = 'arrow' | 'line' | 'freehand-path';
```

#### ExportResolution
```typescript
type ExportResolution = '480p' | '720p' | '1080p';
```

### Store Supporting Types

#### PlaybackSpeed
```typescript
type PlaybackSpeed = 0.5 | 1 | 2;
```

#### SidebarPanel
```typescript
type SidebarPanel = 'entities' | 'properties' | 'settings';
```

#### ExportStatus
```typescript
type ExportStatus = 'idle' | 'exporting' | 'complete' | 'error';
```

#### ExportFormat
```typescript
type ExportFormat = 'mp4' | 'webm';
```

#### DrawingMode
```typescript
type DrawingMode = 'arrow' | 'line' | 'freehand-path';
```

### Create/Update DTOs

#### EntityCreate
```typescript
interface EntityCreate {
  type: EntityType;
  x: number;
  y: number;
  color?: string;
  label?: string;
  team?: TeamType;
  orientation?: EntityOrientation;
}
```

#### EntityUpdate
```typescript
interface EntityUpdate {
  x?: number;
  y?: number;
  color?: string;
  label?: string;
  team?: TeamType;
  orientation?: EntityOrientation;
}
```

Similar patterns for `AnnotationCreate`, `AnnotationUpdate`, `FrameUpdate`, `ProjectSettingsUpdate`.

### Share Types

**File**: `types/share.ts`

#### SharePayloadV1 (Legacy)
```typescript
interface SharePayloadV1 {
  version: string;
  name: string;
  sport: SportType;
  frames: Array<{
    id: string;
    index: number;
    duration: number;
    updates: Record<string, Entity>; // ⚠️ Legacy field
    annotations: Annotation[];
  }>;
}
```

#### SharePayloadV2 (Current)
```typescript
interface SharePayloadV2 {
  version: string;
  name: string;
  sport: SportType;
  frames: Frame[]; // Standard Frame type
  settings: ProjectSettings;
}
```

## Utilities

### File I/O

**File**: `utils/fileIO.ts`

#### downloadJson
```typescript
function downloadJson(data: unknown, filename: string): void
```

Downloads JSON data as a file (browser download).

**Example**:
```typescript
import { downloadJson } from '@/core';

const project = useProjectStore.getState().project;
downloadJson(project, 'my-animation.json');
```

#### readJsonFile
```typescript
function readJsonFile<T>(file: File): Promise<T>
```

Reads and parses JSON file from file input.

**Example**:
```typescript
import { readJsonFile } from '@/core';

const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const data = await readJsonFile(file);
    console.log('Loaded:', data);
  }
};
```

### Serialization

**File**: `utils/serializeForShare.ts`

#### serializeForShare
```typescript
function serializeForShare(project: Project): SharePayloadV2
```

Converts Project to SharePayload (for cloud save/share).

**Features**:
- Strips local-only fields (e.g., `isDirty`, timestamps)
- Validates entity types
- Ensures backward compatibility

**Example**:
```typescript
import { serializeForShare } from '@/core';

const project = useProjectStore.getState().project;
const payload = serializeForShare(project);

// Upload to cloud
await fetch('/api/animations', {
  method: 'POST',
  body: JSON.stringify({ payload }),
});
```

**File**: `utils/hydratePayload.ts`

#### hydrateSharePayload
```typescript
function hydrateSharePayload(payload: SharePayloadV1 | SharePayloadV2): Project
```

Converts SharePayload back to Project (for loading from cloud).

**Features**:
- Handles V1 and V2 payloads
- Migrates `updates` → `entities` for V1
- Adds default project metadata

**Example**:
```typescript
import { hydrateSharePayload } from '@/core';

const res = await fetch('/api/animations/123');
const { payload } = await res.json();

const project = hydrateSharePayload(payload);
useProjectStore.getState().loadProject(project);
```

### Validation

**File**: `utils/validation.ts`

#### validateProjectName
```typescript
function validateProjectName(name: string): boolean
```

Validates project name (1-100 chars, no special chars).

#### validateHexColor
```typescript
function validateHexColor(color: string): boolean
```

Validates hex color string (e.g., `#ff0000`).

#### validateEntityLabel
```typescript
function validateEntityLabel(label: string): boolean
```

Validates entity label (1-10 chars).

**Example**:
```typescript
import { validateProjectName, validateHexColor } from '@/core';

const isValid = validateProjectName('My Drill');
console.log(isValid); // true

const isValidColor = validateHexColor('#ff0000');
console.log(isValidColor); // true
```

### Sanitization

**File**: `utils/sanitization.ts`

#### sanitizeString
```typescript
function sanitizeString(input: string, maxLength: number): string
```

Removes dangerous characters and truncates to max length.

#### truncateString
```typescript
function truncateString(input: string, maxLength: number): string
```

Truncates string with ellipsis.

#### sanitizeProjectName
```typescript
function sanitizeProjectName(name: string): string
```

Sanitizes project name (removes special chars, limits length).

**Example**:
```typescript
import { sanitizeProjectName } from '@/core';

const safeName = sanitizeProjectName('<script>alert("XSS")</script>');
console.log(safeName); // "scriptalertXSSscript" (stripped tags, truncated)
```

### Interpolation

**File**: `utils/interpolation.ts`

#### lerp
```typescript
function lerp(start: number, end: number, t: number): number
```

Linear interpolation between two numbers.

**Parameters**:
- `start` - Starting value
- `end` - Ending value
- `t` - Progress (0-1)

**Example**:
```typescript
import { lerp } from '@/core';

const value = lerp(0, 100, 0.5);
console.log(value); // 50
```

#### lerpPosition
```typescript
function lerpPosition(
  start: { x: number; y: number },
  end: { x: number; y: number },
  t: number
): { x: number; y: number }
```

Linear interpolation between two positions (for entity movement).

**Example**:
```typescript
import { lerpPosition } from '@/core';

const pos = lerpPosition(
  { x: 0, y: 0 },
  { x: 100, y: 100 },
  0.5
);
console.log(pos); // { x: 50, y: 50 }
```

## Constants

### Design Tokens

**File**: `constants/design-tokens.ts`

#### DESIGN_TOKENS.colors
```typescript
{
  primary: { /* ... */ },
  neutral: [
    '#ffffff', // 0 - White (Ball)
    '#f5f5f5', // 1 - Off-white
    '#fde047', // 2 - High-vis yellow (Cone)
    '#a1a1aa', // 3 - Gray
    // ...
  ],
  attack: [
    '#ef4444', // 0 - Red
    '#dc2626', // 1 - Dark red
    // ...
  ],
  defense: [
    '#3b82f6', // 0 - Blue
    '#2563eb', // 1 - Dark blue
    // ...
  ],
}
```

#### DESIGN_TOKENS.spacing
```typescript
{
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
}
```

#### DESIGN_TOKENS.typography
```typescript
{
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    bold: 700,
  },
}
```

### Field Dimensions

**File**: `constants/fields.ts`

#### FIELD_DIMENSIONS
```typescript
{
  'rugby-union': {
    width: 100,
    height: 70,
    svg: '/fields/rugby-union.svg',
  },
  'rugby-league': {
    width: 100,
    height: 68,
    svg: '/fields/rugby-league.svg',
  },
  'soccer': {
    width: 105,
    height: 68,
    svg: '/fields/soccer.svg',
  },
  'american-football': {
    width: 120,
    height: 53.3,
    svg: '/fields/american-football.svg',
  },
}
```

### Validation Rules

**File**: `constants/validation.ts`

#### VALIDATION
```typescript
{
  projectName: {
    minLength: 1,
    maxLength: 100,
  },
  entityLabel: {
    minLength: 1,
    maxLength: 10,
  },
  description: {
    maxLength: 500,
  },
  maxFrames: 50,
  maxEntitiesPerFrame: 30,
  maxAnnotationsPerFrame: 20,
  userMaxAnimations: 50,
}
```

## Testing Patterns

### Unit Tests (Vitest)

Test utilities in isolation:

```typescript
import { describe, test, expect } from 'vitest';
import { lerp, lerpPosition } from '@/core';

describe('interpolation', () => {
  test('lerp interpolates between numbers', () => {
    expect(lerp(0, 100, 0)).toBe(0);
    expect(lerp(0, 100, 0.5)).toBe(50);
    expect(lerp(0, 100, 1)).toBe(100);
  });

  test('lerpPosition interpolates between positions', () => {
    const result = lerpPosition(
      { x: 0, y: 0 },
      { x: 100, y: 100 },
      0.5
    );
    expect(result).toEqual({ x: 50, y: 50 });
  });
});
```

### Hook Tests

Test hooks with `@testing-library/react-hooks`:

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useProjectStore } from '@/core';

test('addEntity creates entity', () => {
  const { result } = renderHook(() => useProjectStore());

  // Create new project
  act(() => result.current.newProject());

  // Add entity
  let entityId: string;
  act(() => {
    entityId = result.current.addEntity({
      type: 'player',
      x: 100,
      y: 100,
      color: '#ef4444',
      label: 'P1',
    });
  });

  // Verify entity was added
  const currentFrame = result.current.project?.frames[0];
  expect(currentFrame?.entities[entityId!]).toBeDefined();
  expect(currentFrame?.entities[entityId!].type).toBe('player');
});
```

### Integration Tests

Test store + hooks together:

```typescript
import { renderHook, act } from '@testing-library/react-hooks';
import { useProjectStore } from '@/core';
import { serializeForShare, hydrateSharePayload } from '@/core';

test('can serialize and hydrate project', () => {
  const { result } = renderHook(() => useProjectStore());

  // Create project
  act(() => result.current.newProject());
  const original = result.current.project!;

  // Serialize
  const payload = serializeForShare(original);

  // Hydrate
  const hydrated = hydrateSharePayload(payload);

  // Verify
  expect(hydrated.name).toBe(original.name);
  expect(hydrated.frames.length).toBe(original.frames.length);
});
```

## Future Enhancements

### V2.0 Features (Planned)

1. **Multi-User State Management**
   - WebSocket integration for real-time collaboration
   - Conflict resolution algorithms
   - Operational Transform (OT) or CRDT for entity positions

2. **Enhanced Type Safety**
   - Branded types for IDs (`EntityId`, `FrameId`, `ProjectId`)
   - Runtime schema validation with Zod
   - Type guards for share payload versions

3. **Performance Optimizations**
   - Immutable data structures (Immer) for store updates
   - Memoization for expensive computations
   - Virtualization for large frame lists

4. **Advanced Hooks**
   - `useUndo/useRedo` - History management
   - `useCollaboration` - WebSocket sync
   - `useOfflineQueue` - Offline action queue

5. **Validation Enhancements**
   - Schema validation with Zod
   - Entity constraints (min/max positions)
   - Frame duration constraints

### Technical Debt

1. **Store Improvements**
   - Split projectStore into smaller stores (frames, entities, annotations)
   - Add store persistence layer (indexedDB)
   - Add store middleware for logging, analytics

2. **Type Safety**
   - Add strict null checks for all types
   - Improve generic types for store actions
   - Add runtime validation for all DTOs

3. **Testing**
   - Missing tests for `useAutoSave`
   - Missing tests for `useShareAnimation`
   - Integration tests for store + hooks

4. **Documentation**
   - Add JSDoc comments for all public APIs
   - Add examples for all hooks
   - Add troubleshooting guide

## Related Documentation

- **Animation Feature**: [src/features/animation/README.md](../features/animation/README.md) - Editor & ReplayViewer
- **Gallery Feature**: [src/features/gallery/README.md](../features/gallery/README.md) - Gallery components
- **Shared Module**: [src/shared/README.md](../shared/README.md) - UI components
- **Database Schema**: [docs/architecture/database-schema.md](../../docs/architecture/database-schema.md)
- **PRD v1.0**: [docs/authority/PRD.md](../../docs/authority/PRD.md)

## Questions?

For architecture questions or contribution guidelines, see:
- **CLAUDE.md** - Project development guidelines
- **docs/development/getting-started.md** - Setup and onboarding
- **docs/troubleshooting/** - Debugging guides
