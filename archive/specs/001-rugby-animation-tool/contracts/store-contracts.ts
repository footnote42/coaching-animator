/**
 * Store Contracts: Rugby Animation Tool
 *
 * This file defines the TypeScript interfaces for Zustand store slices.
 * These contracts specify the shape of state and available actions.
 *
 * NOTE: This is a specification file for planning purposes.
 * The actual implementation will be in src/store/
 */

import type { Project, Frame, Entity, Annotation, SportType, ExportResolution } from './types';

// =============================================================================
// PROJECT STORE CONTRACT
// =============================================================================

/**
 * Main project store managing all animation data.
 * Uses transient updates for playback to avoid re-renders.
 */
export interface ProjectStoreState {
  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------

  /** Currently loaded project, null if no project open */
  project: Project | null;

  /** Current frame being edited (0-based index) */
  currentFrameIndex: number;

  /** Whether animation is currently playing */
  isPlaying: boolean;

  /** Whether project has unsaved changes */
  isDirty: boolean;

  /** Current playback speed multiplier */
  playbackSpeed: PlaybackSpeed;

  /** Whether playback should loop */
  loopPlayback: boolean;

  // -------------------------------------------------------------------------
  // Project Actions
  // -------------------------------------------------------------------------

  /**
   * Create a new empty project with default settings.
   * Prompts for unsaved changes if current project is dirty.
   */
  newProject: () => void;

  /**
   * Load project from parsed JSON data.
   * Validates data before loading.
   * @returns Validation result with success/errors
   */
  loadProject: (data: unknown) => LoadResult;

  /**
   * Export current project as JSON string.
   * Updates `updatedAt` timestamp.
   */
  saveProject: () => string;

  /**
   * Update project metadata (name, sport, settings).
   */
  updateProjectSettings: (updates: Partial<ProjectSettingsUpdate>) => void;

  // -------------------------------------------------------------------------
  // Frame Actions
  // -------------------------------------------------------------------------

  /**
   * Navigate to a specific frame by index.
   * Stops playback if playing.
   */
  setCurrentFrame: (index: number) => void;

  /**
   * Add a new frame after the current frame.
   * New frame is a copy of current frame's entities.
   */
  addFrame: () => void;

  /**
   * Remove a frame by ID.
   * Prevents deletion of last remaining frame.
   */
  removeFrame: (frameId: string) => void;

  /**
   * Create a duplicate of a frame immediately after it.
   */
  duplicateFrame: (frameId: string) => void;

  /**
   * Update frame properties (duration, annotations).
   */
  updateFrame: (frameId: string, updates: Partial<FrameUpdate>) => void;

  // -------------------------------------------------------------------------
  // Entity Actions
  // -------------------------------------------------------------------------

  /**
   * Add a new entity to the current frame.
   * Generates UUID and applies defaults based on type.
   */
  addEntity: (entity: EntityCreate) => string; // Returns new entity ID

  /**
   * Update entity properties in current frame.
   * Position updates are clamped to canvas bounds.
   */
  updateEntity: (entityId: string, updates: Partial<EntityUpdate>) => void;

  /**
   * Remove entity from current frame only.
   * Entity may still exist in other frames.
   */
  removeEntity: (entityId: string) => void;

  /**
   * Remove entity from ALL frames in project.
   */
  removeEntityGlobally: (entityId: string) => void;

  /**
   * Copy entity from current frame to all subsequent frames.
   * Useful for adding a player that should exist through animation.
   */
  propagateEntity: (entityId: string) => void;

  // -------------------------------------------------------------------------
  // Annotation Actions
  // -------------------------------------------------------------------------

  /**
   * Add annotation to current frame.
   */
  addAnnotation: (annotation: AnnotationCreate) => string;

  /**
   * Update annotation properties.
   */
  updateAnnotation: (annotationId: string, updates: Partial<AnnotationUpdate>) => void;

  /**
   * Remove annotation from current frame.
   */
  removeAnnotation: (annotationId: string) => void;

  // -------------------------------------------------------------------------
  // Playback Actions
  // -------------------------------------------------------------------------

  /**
   * Start animation playback from current frame.
   */
  play: () => void;

  /**
   * Pause animation at current interpolated position.
   */
  pause: () => void;

  /**
   * Stop playback and return to frame 0.
   */
  reset: () => void;

  /**
   * Set playback speed multiplier.
   */
  setPlaybackSpeed: (speed: PlaybackSpeed) => void;

  /**
   * Toggle loop playback mode.
   */
  toggleLoop: () => void;

  // -------------------------------------------------------------------------
  // Transient Update (No Re-render)
  // -------------------------------------------------------------------------

  /**
   * Update playback position without triggering React re-render.
   * Used by animation loop for 60fps updates.
   * @internal
   */
  setPlaybackPosition: (position: PlaybackPosition) => void;
}

// =============================================================================
// UI STORE CONTRACT
// =============================================================================

/**
 * UI state store for modals, selection, and visual settings.
 */
export interface UIStoreState {
  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------

  /** Currently selected entity ID, null if none */
  selectedEntityId: string | null;

  /** Whether ghost layer is visible */
  showGhosts: boolean;

  /** Whether grid overlay is visible */
  showGrid: boolean;

  /** Current sidebar panel */
  activeSidebarPanel: SidebarPanel;

  /** Export dialog state */
  exportDialog: {
    isOpen: boolean;
    progress: number; // 0-100
    status: ExportStatus;
    error?: string;
  };

  /** Unsaved changes confirmation dialog */
  unsavedChangesDialog: {
    isOpen: boolean;
    pendingAction: PendingAction | null;
  };

  // -------------------------------------------------------------------------
  // Selection Actions
  // -------------------------------------------------------------------------

  /** Select an entity by ID */
  selectEntity: (entityId: string | null) => void;

  /** Clear selection */
  deselectAll: () => void;

  // -------------------------------------------------------------------------
  // View Actions
  // -------------------------------------------------------------------------

  /** Toggle ghost layer visibility */
  toggleGhosts: () => void;

  /** Toggle grid overlay visibility */
  toggleGrid: () => void;

  /** Set active sidebar panel */
  setSidebarPanel: (panel: SidebarPanel) => void;

  // -------------------------------------------------------------------------
  // Dialog Actions
  // -------------------------------------------------------------------------

  /** Open export dialog and start export process */
  startExport: () => void;

  /** Update export progress */
  setExportProgress: (progress: number) => void;

  /** Complete export with success or error */
  completeExport: (result: ExportResult) => void;

  /** Close export dialog */
  closeExportDialog: () => void;

  /** Show unsaved changes confirmation */
  showUnsavedChangesDialog: (pendingAction: PendingAction) => void;

  /** Confirm pending action (discard changes) */
  confirmPendingAction: () => void;

  /** Cancel pending action (keep editing) */
  cancelPendingAction: () => void;
}

// =============================================================================
// SUPPORTING TYPES
// =============================================================================

export type PlaybackSpeed = 0.5 | 1 | 2;

export type SidebarPanel = 'entities' | 'settings' | 'export';

export type ExportStatus = 'idle' | 'preparing' | 'recording' | 'processing' | 'complete' | 'error';

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
