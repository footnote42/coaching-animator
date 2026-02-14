/**
 * Animation Feature Module
 *
 * Public API for the animation editor feature.
 * This module provides components, services, and utilities for creating,
 * editing, and playing back rugby coaching animations.
 *
 * @module features/animation
 */

// ============================================================================
// Main Components
// ============================================================================

/**
 * Editor - Main animation editor component
 * Primary interface for creating and editing animations
 */
export { Editor } from './components/Editor';

/**
 * ReplayViewer - Read-only animation playback component
 * Used for sharing and viewing animations without editing capabilities
 */
export { ReplayViewer } from './components/ReplayViewer';

// ============================================================================
// Canvas Components
// ============================================================================

/**
 * Canvas components for rendering animations
 * Re-exported from Canvas/ for convenience
 */
export {
  Stage,
  Field,
  PlayerToken,
  EntityLayer,
  AnnotationLayer,
  AnnotationDrawingLayer,
} from './components/Canvas';

export type {
  StageProps,
  FieldProps,
  PlayerTokenProps,
  EntityLayerProps,
  AnnotationLayerProps,
  AnnotationDrawingLayerProps,
} from './components/Canvas';

// ============================================================================
// Timeline Components
// ============================================================================

/**
 * Timeline components for playback controls
 * Re-exported from Timeline/ for convenience
 */
export {
  FrameStrip,
  FrameThumbnail,
  PlaybackControls,
} from './components/Timeline';

export type {
  FrameStripProps,
  FrameThumbnailProps,
  PlaybackControlsProps,
} from './components/Timeline';

// ============================================================================
// Sidebar Components
// ============================================================================

/**
 * Sidebar components for entity palette and properties
 * Re-exported from Sidebar/ for convenience
 */
export {
  EntityPalette,
} from './components/Sidebar';

export type {
  EntityPaletteProps,
} from './components/Sidebar';

// ============================================================================
// Services
// ============================================================================

/**
 * EntityColors - Centralized entity color resolution service
 * Provides default colors and color resolution for all entity types
 */
export { EntityColors } from './services/entityColors';
