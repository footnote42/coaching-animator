/**
 * Core Types: Rugby Animation Tool
 *
 * This file defines the core TypeScript interfaces for the data model.
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

// =============================================================================
// STORE SUPPORTING TYPES
// =============================================================================

export type PlaybackSpeed = 0.5 | 1 | 2;

export type SidebarPanel = 'entities' | 'settings' | 'export';

export type ExportStatus = 'idle' | 'preparing' | 'capturing' | 'encoding' | 'complete' | 'error';

export type DrawingMode = 'none' | 'arrow' | 'line';

export type PendingAction =
    | { type: 'new-project' }
    | { type: 'load-project'; data: unknown }
    | { type: 'close' };

export interface LoadResult {
    success: boolean;
    errors: string[];
    warnings: string[];
}

export interface ExportResult {
    success: boolean;
    blob?: Blob;
    error?: string;
}

export interface PlaybackPosition {
    /** Index of frame being transitioned FROM */
    fromFrameIndex: number;

    /** Index of frame being transitioned TO */
    toFrameIndex: number;

    /** Progress through transition (0-1) */
    progress: number;
}

// -----------------------------------------------------------------------------
// Create/Update DTOs
// -----------------------------------------------------------------------------

export interface ProjectSettingsUpdate {
    name: string;
    sport: SportType;
    showGrid: boolean;
    gridSpacing: number;
    defaultTransitionDuration: number;
    exportResolution: ExportResolution;
}

export interface FrameUpdate {
    duration: number;
}

export interface EntityCreate {
    type: Entity['type'];
    x: number;
    y: number;
    team?: Entity['team'];
    color?: string;
    label?: string;
}

export interface EntityUpdate {
    x: number;
    y: number;
    color: string;
    label: string;
    team: Entity['team'];
    parentId: string | null;
}

export interface AnnotationCreate {
    type: Annotation['type'];
    points: number[];
    color: string;
}

export interface AnnotationUpdate {
    points: number[];
    color: string;
    endFrameId: string;
}
