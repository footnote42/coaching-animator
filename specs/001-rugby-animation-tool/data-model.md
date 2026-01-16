# Data Model: Rugby Animation Tool

**Feature Branch**: `001-rugby-animation-tool`
**Date**: 2026-01-16
**Status**: Complete

This document defines the data model for the Rugby Animation Tool, including all entities, relationships, validation rules, and state transitions.

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                  PROJECT                                     │
│  ─────────────────────────────────────────────────────────────────────────  │
│  id: UUID                                                                    │
│  name: string                                                                │
│  version: string                                                             │
│  sport: SportType                                                            │
│  createdAt: ISO8601                                                          │
│  updatedAt: ISO8601                                                          │
│  settings: ProjectSettings                                                   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       │ 1:N (ordered)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                   FRAME                                      │
│  ─────────────────────────────────────────────────────────────────────────  │
│  id: UUID                                                                    │
│  index: number (0-based position)                                            │
│  duration: number (ms, 100-10000)                                            │
│  entities: Record<EntityId, Entity>                                          │
│  annotations: Annotation[]                                                   │
└─────────────────┬───────────────────────────────────────┬───────────────────┘
                  │                                       │
                  │ 1:N (keyed by ID)                     │ 1:N
                  ▼                                       ▼
┌─────────────────────────────────────┐   ┌───────────────────────────────────┐
│              ENTITY                  │   │           ANNOTATION               │
│  ─────────────────────────────────  │   │  ─────────────────────────────── │
│  id: UUID (stable across frames)     │   │  id: UUID                         │
│  type: EntityType                    │   │  type: AnnotationType             │
│  x: number (0-2000)                  │   │  points: number[]                 │
│  y: number (0-2000)                  │   │  color: HexColor                  │
│  color: HexColor                     │   │  startFrameId: UUID               │
│  label: string (max 10 chars)        │   │  endFrameId: UUID                 │
│  team: TeamType                      │   └───────────────────────────────────┘
│  parentId?: UUID (ball possession)   │
└─────────────────────────────────────┘
```

---

## Core Types

### Project

The top-level container for all animation data.

```typescript
interface Project {
  /** Schema version for migration support */
  version: string;

  /** Unique identifier (UUID v4) */
  id: string;

  /** User-provided name (max 100 chars) */
  name: string;

  /** Selected sport field type */
  sport: SportType;

  /** ISO 8601 creation timestamp */
  createdAt: string;

  /** ISO 8601 last modification timestamp */
  updatedAt: string;

  /** Ordered array of frames (min 1, max 50) */
  frames: Frame[];

  /** Project-level settings */
  settings: ProjectSettings;
}

interface ProjectSettings {
  /** Toggle grid overlay visibility */
  showGrid: boolean;

  /** Grid spacing in canvas units (default: 50) */
  gridSpacing: number;

  /** Default transition duration for new frames (ms) */
  defaultTransitionDuration: number;

  /** Video export resolution */
  exportResolution: ExportResolution;
}

type SportType = 'rugby-union' | 'rugby-league' | 'soccer' | 'american-football';
type ExportResolution = '720p' | '1080p';
```

### Frame

A single keyframe in the animation sequence.

```typescript
interface Frame {
  /** Unique identifier (UUID v4) */
  id: string;

  /** Position in sequence (0-based, managed by store) */
  index: number;

  /** Transition duration to next frame (ms, 100-10000) */
  duration: number;

  /** Entities keyed by their stable ID */
  entities: Record<string, Entity>;

  /** Annotations attached to this frame */
  annotations: Annotation[];
}
```

### Entity

Any object placed on the field canvas.

```typescript
interface Entity {
  /** Stable UUID across all frames */
  id: string;

  /** Entity category */
  type: EntityType;

  /** X coordinate (0-2000, left edge = 0) */
  x: number;

  /** Y coordinate (0-2000, top edge = 0) */
  y: number;

  /** Display color (hex format) */
  color: string;

  /** Display label (jersey number, position code, max 10 chars) */
  label: string;

  /** Team designation for color coding */
  team: TeamType;

  /** For ball: ID of player entity holding it (optional) */
  parentId?: string;
}

type EntityType = 'player' | 'ball' | 'cone' | 'marker';
type TeamType = 'attack' | 'defense' | 'neutral';
```

### Annotation

Visual overlay elements for tactical instructions.

```typescript
interface Annotation {
  /** Unique identifier (UUID v4) */
  id: string;

  /** Annotation shape type */
  type: AnnotationType;

  /** Coordinate pairs [x1, y1, x2, y2, ...] */
  points: number[];

  /** Display color (hex format) */
  color: string;

  /** First frame where annotation appears */
  startFrameId: string;

  /** Last frame where annotation appears */
  endFrameId: string;
}

type AnnotationType = 'arrow' | 'line' | 'curve';
```

---

## Validation Rules

### Project Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| `version` | Must match semver format and be in supported list | "Unsupported file version: {version}" |
| `id` | Valid UUID v4 format | "Invalid project ID format" |
| `name` | 1-100 characters, no HTML tags | "Project name must be 1-100 characters" |
| `sport` | One of valid SportType values | "Invalid sport type: {sport}" |
| `createdAt` | Valid ISO 8601 timestamp | "Invalid creation timestamp" |
| `updatedAt` | Valid ISO 8601 timestamp | "Invalid update timestamp" |
| `frames` | 1-50 frames, each valid | "Project must have 1-50 frames" |

### Frame Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| `id` | Valid UUID v4 format | "Invalid frame ID format" |
| `index` | Integer, 0 to frames.length-1, unique | "Invalid frame index" |
| `duration` | Integer, 100-10000 ms | "Frame duration must be 100-10000ms" |
| `entities` | All values are valid Entity objects | "Invalid entity in frame {index}" |
| `annotations` | Max 100 annotations per frame | "Too many annotations in frame {index}" |

### Entity Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| `id` | Valid UUID v4 format | "Invalid entity ID format" |
| `type` | One of valid EntityType values | "Invalid entity type: {type}" |
| `x` | Finite number, 0-2000 | "X coordinate must be 0-2000" |
| `y` | Finite number, 0-2000 | "Y coordinate must be 0-2000" |
| `color` | Valid hex color (#RGB or #RRGGBB) | "Invalid color format" |
| `label` | 0-10 characters, alphanumeric + common symbols | "Label must be 0-10 characters" |
| `team` | One of valid TeamType values | "Invalid team type: {team}" |
| `parentId` | If present, valid UUID referencing existing entity | "Invalid parent entity reference" |

### Annotation Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| `id` | Valid UUID v4 format | "Invalid annotation ID format" |
| `type` | One of valid AnnotationType values | "Invalid annotation type: {type}" |
| `points` | 2-200 finite numbers, even count | "Invalid annotation points" |
| `color` | Valid hex color | "Invalid annotation color" |
| `startFrameId` | Valid frame ID in project | "Invalid start frame reference" |
| `endFrameId` | Valid frame ID in project, >= startFrameId | "Invalid end frame reference" |

---

## State Transitions

### Project Lifecycle

```
┌──────────┐     load()      ┌──────────┐
│   NEW    │ ──────────────▶ │  LOADED  │
└──────────┘                 └────┬─────┘
      │                           │
      │ newProject()              │ edit actions
      ▼                           ▼
┌──────────┐                 ┌──────────┐
│  CLEAN   │ ◀────────────── │  DIRTY   │
└──────────┘    save()       └──────────┘
      │                           │
      │                           │
      └───────────────────────────┘
              close() / newProject()
              (with unsaved changes warning)
```

### Animation Playback States

```
┌──────────┐     play()      ┌──────────┐
│  STOPPED │ ──────────────▶ │ PLAYING  │
│ (frame 0)│                 │          │
└──────────┘                 └────┬─────┘
      ▲                           │
      │ reset()                   │ pause()
      │                           ▼
      │                     ┌──────────┐
      │                     │  PAUSED  │
      │◀────────────────────│          │
      │        reset()      └──────────┘
      │                           │
      │        play()             │
      │◀──────────────────────────┘
              (auto on end, or loop)
```

### Entity State in Frame

```
                    ┌─────────────────────┐
                    │  DOES NOT EXIST     │
                    │  (not in entities)  │
                    └──────────┬──────────┘
                               │
                               │ addEntity()
                               ▼
┌──────────────────────────────────────────────────────┐
│                      EXISTS                           │
│  ┌──────────┐   select()   ┌──────────┐             │
│  │UNSELECTED│ ───────────▶ │ SELECTED │             │
│  └──────────┘              └──────────┘             │
│       ▲                          │                   │
│       │       deselect()         │                   │
│       └──────────────────────────┘                   │
└──────────────────────────────────────────────────────┘
                               │
                               │ removeEntity()
                               ▼
                    ┌─────────────────────┐
                    │      REMOVED        │
                    └─────────────────────┘
```

---

## Default Values

### New Project Defaults

```typescript
const DEFAULT_PROJECT: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
  version: '1.0',
  name: 'Untitled Project',
  sport: 'rugby-union', // Per Constitution II
  frames: [createDefaultFrame()],
  settings: {
    showGrid: false,
    gridSpacing: 50,
    defaultTransitionDuration: 2000, // 2 seconds
    exportResolution: '720p'
  }
};
```

### New Frame Defaults

```typescript
const DEFAULT_FRAME: Omit<Frame, 'id' | 'index'> = {
  duration: 2000, // Inherited from project settings
  entities: {},
  annotations: []
};
```

### New Entity Defaults by Type

```typescript
const ENTITY_DEFAULTS: Record<EntityType, Omit<Entity, 'id' | 'x' | 'y'>> = {
  player: {
    type: 'player',
    color: '#2563EB', // Blue (attack default)
    label: '',
    team: 'attack',
  },
  ball: {
    type: 'ball',
    color: '#854D0E', // Brown
    label: '',
    team: 'neutral',
  },
  cone: {
    type: 'cone',
    color: '#EA580C', // Orange
    label: '',
    team: 'neutral',
  },
  marker: {
    type: 'marker',
    color: '#1A3D1A', // Pitch Green
    label: '',
    team: 'neutral',
  }
};
```

### Team Color Palettes

```typescript
const TEAM_COLORS = {
  attack: ['#2563EB', '#10B981', '#06B6D4', '#8B5CF6'], // Blue, Green, Cyan, Purple
  defense: ['#DC2626', '#EA580C', '#F59E0B', '#EF4444'], // Red, Orange, Amber, Rose
  neutral: ['#1A3D1A', '#6B7280', '#854D0E'] // Pitch Green, Gray, Brown
};
```

---

## Storage Schema

### LocalStorage Keys

| Key | Type | Description |
|-----|------|-------------|
| `animatorapp_autosave` | `StoredProject` | Current auto-saved project |
| `animatorapp_backup` | `StoredProject` | Previous auto-save (rollback) |
| `animatorapp_settings` | `AppSettings` | User preferences |

### Stored Project Wrapper

```typescript
interface StoredProject {
  /** Storage schema version */
  storageVersion: string;

  /** ISO 8601 timestamp of save */
  savedAt: string;

  /** The actual project data */
  data: Project;
}
```

---

## Indexes and Lookups

### Runtime Derived State

These structures are computed at runtime for efficient lookups:

```typescript
interface RuntimeState {
  /** Quick lookup: entityId -> frameIds where entity exists */
  entityFrameMap: Map<string, Set<string>>;

  /** Quick lookup: frameIndex -> frameId */
  frameIndexMap: Map<number, string>;

  /** Currently selected entity (if any) */
  selectedEntityId: string | null;

  /** Current editing frame index */
  currentFrameIndex: number;
}
```

---

## Migration Support

### Version Migration Map

```typescript
const MIGRATIONS: Record<string, (data: unknown) => Project> = {
  '1.0': (data) => data as Project, // Current version, no migration
  // Future: '1.1': (data) => migrateFrom1_0To1_1(data),
};

const CURRENT_VERSION = '1.0';
const SUPPORTED_VERSIONS = ['1.0'];
```

### Migration Process

1. Read `version` field from loaded data
2. If version not in `SUPPORTED_VERSIONS`, reject with error
3. Apply migrations sequentially from loaded version to `CURRENT_VERSION`
4. Update `version` field to `CURRENT_VERSION`
5. Save migrated project

---

## Serialization Notes

### JSON Export Format

- All UUIDs as strings
- Timestamps as ISO 8601 strings
- Colors as hex strings with `#` prefix
- Coordinates as numbers (not strings)
- No circular references (entities reference by ID, not by object)

### File Size Estimates

| Scenario | Entities | Frames | Estimated Size |
|----------|----------|--------|----------------|
| Simple play | 8 players | 2 | ~5 KB |
| Complex play | 20 entities | 10 | ~50 KB |
| Maximum | 50 entities | 50 | ~500 KB |

All scenarios well within LocalStorage limits (5-10 MB typical).
