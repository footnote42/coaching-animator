/**
 * Core Module
 *
 * Shared utilities, state management, and domain logic.
 * This module provides the foundational building blocks used across all features.
 *
 * @module core
 */

// ============================================================================
// State Management (Zustand Stores)
// ============================================================================

/**
 * Project Store - Main animation project state
 * Manages frames, entities, annotations, and project settings
 */
export { useProjectStore } from './stores/projectStore';

/**
 * UI Store - Application UI state
 * Manages playback, drawing mode, sidebar state, and UI interactions
 */
export { useUIStore } from './stores/uiStore';

// ============================================================================
// Custom React Hooks
// ============================================================================

/**
 * Animation and playback hooks
 */
export {
  useAnimationLoop,
  useKeyboardShortcuts,
} from './hooks';

export { useAutoSave } from './hooks/useAutoSave';
export { useExport } from './hooks/useExport';
export { useFrameCapture } from './hooks/useFrameCapture';
export { useShareAnimation } from './hooks/useShareAnimation';
export { useReplayAnimationLoop } from './hooks/useReplayAnimationLoop';

/**
 * Canvas utilities
 */
export {
  useCanvasSize,
} from './hooks';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Core domain types
 * Re-exported from types/ for convenience
 */
export type {
  // Core entities
  Project,
  ProjectSettings,
  Frame,
  Entity,
  Annotation,
  // Enums and union types
  SportType,
  EntityType,
  EntityOrientation,
  TeamType,
  AnnotationType,
  ExportResolution,
  // Storage types
  StoredProject,
  FileValidationResult,
  // Store supporting types
  PlaybackSpeed,
  SidebarPanel,
  ExportStatus,
  ExportFormat,
  DrawingMode,
  PitchLayout,
  PendingAction,
  LoadResult,
  ExportResult,
  PlaybackPosition,
  // Create/Update DTOs
  ProjectSettingsUpdate,
  FrameUpdate,
  EntityCreate,
  EntityUpdate,
  AnnotationCreate,
  AnnotationUpdate,
} from './types';

/**
 * Entity types constant (for schema validation)
 */
export { ENTITY_TYPES } from './types';

/**
 * Share-related types
 */
export type {
  SharePayload,
  SharePayloadV1,
  SharePayloadV2,
} from './types/share';

// ============================================================================
// Constants
// ============================================================================

/**
 * Design tokens (colors, spacing, typography)
 */
export { DESIGN_TOKENS } from './constants/design-tokens';

/**
 * Field definitions and dimensions
 */
export { FIELD_DIMENSIONS } from './constants/fields';

/**
 * Validation rules and limits
 */
export { VALIDATION } from './constants/validation';

// ============================================================================
// Utilities
// ============================================================================

/**
 * File I/O operations
 */
export {
  downloadJson,
  readJsonFile,
} from './utils/fileIO';

/**
 * Serialization utilities
 */
export {
  serializeForShare,
} from './utils/serializeForShare';

export {
  hydrateSharePayload,
} from './utils/hydratePayload';

/**
 * Data validation
 */
export {
  validateProjectName,
  validateHexColor,
  validateEntityLabel,
} from './utils/validation';

/**
 * Animation interpolation
 */
export {
  lerp,
  lerpPosition,
} from './utils/interpolation';

/**
 * Data sanitization
 */
export {
  sanitizeString,
  truncateString,
  sanitizeProjectName,
} from './utils/sanitization';
