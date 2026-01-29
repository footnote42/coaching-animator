/**
 * Core Types: Rugby Animation Tool
 *
 * This file defines the core TypeScript interfaces for the data model.
 * Re-exported by other contract files for type consistency.
 *
 * NOTE: This is a specification file for planning purposes.
 * The actual implementation will be in src/types/index.ts
 */

// =============================================================================
// CORE ENTITIES
// =============================================================================

/**
 * Top-level project container.
 */
export interface Project {
  /** Schema version for migration support (semver) */
  version: string;

  /** Unique identifier (UUID v4) */
  id: string;

  /** User-provided project name */
  name: string;

  /** Selected sport field type */
  sport: SportType;

  /** ISO 8601 creation timestamp */
  createdAt: string;

  /** ISO 8601 last modification timestamp */
  updatedAt: string;

  /** Ordered array of animation frames */
  frames: Frame[];

  /** Project-level settings */
  settings: ProjectSettings;
}

/**
 * Project settings and preferences.
 */
export interface ProjectSettings {
  /** Toggle grid overlay visibility */
  showGrid: boolean;

  /** Grid spacing in canvas units */
  gridSpacing: number;

  /** Default transition duration for new frames (ms) */
  defaultTransitionDuration: number;

  /** Video export resolution */
  exportResolution: ExportResolution;
}

/**
 * A single keyframe in the animation sequence.
 */
export interface Frame {
  /** Unique identifier (UUID v4) */
  id: string;

  /** Position in sequence (0-based) */
  index: number;

  /** Transition duration to next frame (ms) */
  duration: number;

  /** Entities keyed by their stable ID */
  entities: Record<string, Entity>;

  /** Annotations attached to this frame */
  annotations: Annotation[];
}

/**
 * Any object placed on the field canvas.
 */
export interface Entity {
  /** Stable UUID across all frames */
  id: string;

  /** Entity category */
  type: EntityType;

  /** X coordinate (0-2000) */
  x: number;

  /** Y coordinate (0-2000) */
  y: number;

  /** Display color (hex format) */
  color: string;

  /** Display label (jersey number, position code) */
  label: string;

  /** Team designation */
  team: TeamType;

  /** For ball: ID of player holding it */
  parentId?: string;
}

/**
 * Visual overlay for tactical instructions.
 */
export interface Annotation {
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

// =============================================================================
// ENUMS / UNION TYPES
// =============================================================================

/**
 * Supported sport field types.
 */
export type SportType =
  | 'rugby-union'
  | 'rugby-league'
  | 'soccer'
  | 'american-football';

/**
 * Entity categories.
 */
export type EntityType =
  | 'player'
  | 'ball'
  | 'cone'
  | 'marker';

/**
 * Team designations for color coding.
 */
export type TeamType =
  | 'attack'
  | 'defense'
  | 'neutral';

/**
 * Annotation shape types.
 */
export type AnnotationType =
  | 'arrow'
  | 'line'
  | 'curve';

/**
 * Export resolution options.
 */
export type ExportResolution =
  | '720p'
  | '1080p';

// =============================================================================
// VALIDATION CONSTANTS
// =============================================================================

export const VALIDATION = {
  PROJECT: {
    NAME_MAX_LENGTH: 100,
    MAX_FRAMES: 50,
    SUPPORTED_VERSIONS: ['1.0'] as const,
  },
  ENTITY: {
    LABEL_MAX_LENGTH: 10,
    LABEL_PATTERN: /^[\w\s\-\.]*$/,
    COLOR_PATTERN: /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/,
    COORD_MIN: 0,
    COORD_MAX: 2000,
  },
  FRAME: {
    DURATION_MIN_MS: 100,
    DURATION_MAX_MS: 10000,
    DURATION_DEFAULT_MS: 2000,
  },
  ANNOTATION: {
    MAX_POINTS: 100,
  },
  EXPORT: {
    TIMEOUT_BUFFER_MS: 5000,
    MAX_DURATION_MS: 300000,
    RESOLUTIONS: {
      '720p': { width: 1280, height: 720 },
      '1080p': { width: 1920, height: 1080 },
    },
  },
  STORAGE: {
    MAX_SIZE_BYTES: 5 * 1024 * 1024,
    AUTOSAVE_INTERVAL_MS: 30000,
  },
  RATE_LIMITS: {
    EXPORT_COOLDOWN_MS: 5000,
    SAVE_COOLDOWN_MS: 2000,
  },
} as const;

// =============================================================================
// DESIGN TOKENS
// =============================================================================

export const DESIGN_TOKENS = {
  colors: {
    primary: '#1A3D1A',       // Pitch Green
    background: '#F8F9FA',    // Tactics White
    surface: '#FFFFFF',
    border: '#1A3D1A',
    textPrimary: '#1A3D1A',
    textInverse: '#F8F9FA',

    // Team colors
    attack: ['#2563EB', '#10B981', '#06B6D4', '#8B5CF6'],
    defense: ['#DC2626', '#EA580C', '#F59E0B', '#EF4444'],
    neutral: ['#1A3D1A', '#6B7280', '#854D0E'],
  },
  typography: {
    fontMono: "'JetBrains Mono', 'Fira Code', monospace",
    fontHeading: "'Inter', 'Helvetica Neue', sans-serif",
    fontBody: "'Inter', system-ui, sans-serif",
  },
  spacing: {
    unit: 4,
    borderRadius: 0,
    borderWidth: 1,
  },
} as const;

// =============================================================================
// FIELD DIMENSIONS
// =============================================================================

export const FIELD_DIMENSIONS: Record<SportType, { width: number; height: number; name: string }> = {
  'rugby-union': { width: 2000, height: 1400, name: 'Rugby Union' },
  'rugby-league': { width: 2000, height: 1360, name: 'Rugby League' },
  'soccer': { width: 2000, height: 1295, name: 'Soccer' },
  'american-football': { width: 2000, height: 1066, name: 'American Football' },
};

// =============================================================================
// STORAGE TYPES
// =============================================================================

/**
 * Wrapper for stored project data.
 */
export interface StoredProject {
  /** Storage schema version */
  storageVersion: string;

  /** ISO 8601 timestamp of save */
  savedAt: string;

  /** The actual project data */
  data: Project;
}

/**
 * File validation result.
 */
export interface FileValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
