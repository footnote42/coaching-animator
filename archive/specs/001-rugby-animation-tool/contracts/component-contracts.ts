/**
 * Component Contracts: Rugby Animation Tool
 *
 * This file defines the TypeScript interfaces for React component props.
 * These contracts specify the API surface of reusable components.
 *
 * NOTE: This is a specification file for planning purposes.
 * The actual implementation will be in src/components/
 */

import type { Entity, Frame, Annotation, SportType, TeamType, EntityType } from './types';

// =============================================================================
// CANVAS COMPONENTS
// =============================================================================

/**
 * Main canvas stage containing all layers.
 * Manages canvas dimensions and coordinates Konva Stage.
 */
export interface StageProps {
  /** Canvas width in pixels */
  width: number;

  /** Canvas height in pixels */
  height: number;

  /** Called when empty canvas area is clicked */
  onCanvasClick?: () => void;

  /** Children layers (Field, EntityLayer, etc.) */
  children: React.ReactNode;
}

/**
 * Field background layer rendering sport-specific pitch markings.
 */
export interface FieldProps {
  /** Sport type determining which field to render */
  sport: SportType;

  /** Canvas width for scaling */
  width: number;

  /** Canvas height for scaling */
  height: number;
}

/**
 * Grid overlay for positioning reference.
 */
export interface GridOverlayProps {
  /** Whether grid is visible */
  visible: boolean;

  /** Spacing between grid lines in canvas units */
  spacing: number;

  /** Canvas width */
  width: number;

  /** Canvas height */
  height: number;
}

/**
 * Layer containing all interactive entities (players, ball, markers).
 */
export interface EntityLayerProps {
  /** Entities to render */
  entities: Entity[];

  /** ID of currently selected entity (for highlight) */
  selectedEntityId: string | null;

  /** Called when entity is clicked/selected */
  onEntitySelect: (entityId: string) => void;

  /** Called when entity drag ends with new position */
  onEntityMove: (entityId: string, x: number, y: number) => void;

  /** Called when entity is double-clicked (for label editing) */
  onEntityDoubleClick: (entityId: string) => void;

  /** Called when entity right-click (for context menu) */
  onEntityContextMenu: (entityId: string, event: { x: number; y: number }) => void;

  /** Whether layer is interactive (false during playback) */
  interactive: boolean;
}

/**
 * Individual player token on the canvas.
 */
export interface PlayerTokenProps {
  /** Entity data */
  entity: Entity;

  /** Whether this entity is selected */
  isSelected: boolean;

  /** Whether token is draggable */
  draggable: boolean;

  /** Called on selection */
  onSelect: () => void;

  /** Called on drag end */
  onDragEnd: (x: number, y: number) => void;

  /** Called on double-click */
  onDoubleClick: () => void;

  /** Called on right-click */
  onContextMenu: (event: { x: number; y: number }) => void;
}

/**
 * Ghost layer showing previous frame positions.
 */
export interface GhostLayerProps {
  /** Entities from previous frame */
  previousEntities: Entity[];

  /** Whether ghost layer is visible */
  visible: boolean;

  /** Opacity of ghost entities (0-1) */
  opacity: number;
}

/**
 * Annotation layer for arrows and lines.
 */
export interface AnnotationLayerProps {
  /** Annotations to render */
  annotations: Annotation[];

  /** Currently selected annotation ID */
  selectedAnnotationId: string | null;

  /** Called when annotation is selected */
  onAnnotationSelect: (annotationId: string) => void;

  /** Whether layer is interactive */
  interactive: boolean;
}

// =============================================================================
// TIMELINE COMPONENTS
// =============================================================================

/**
 * Frame thumbnail strip for navigation.
 */
export interface FrameStripProps {
  /** All frames in project */
  frames: Frame[];

  /** Currently active frame index */
  currentFrameIndex: number;

  /** Called when frame thumbnail is clicked */
  onFrameSelect: (index: number) => void;

  /** Called when add frame button is clicked */
  onAddFrame: () => void;

  /** Called when frame delete button is clicked */
  onRemoveFrame: (frameId: string) => void;

  /** Called when frame duplicate button is clicked */
  onDuplicateFrame: (frameId: string) => void;
}

/**
 * Individual frame thumbnail in the strip.
 */
export interface FrameThumbnailProps {
  /** Frame data */
  frame: Frame;

  /** Display index (1-based for UI) */
  displayIndex: number;

  /** Whether this frame is active */
  isActive: boolean;

  /** Called on click */
  onClick: () => void;

  /** Called on delete action */
  onDelete: () => void;

  /** Called on duplicate action */
  onDuplicate: () => void;
}

/**
 * Playback control buttons.
 */
export interface PlaybackControlsProps {
  /** Whether animation is playing */
  isPlaying: boolean;

  /** Current playback speed */
  speed: 0.5 | 1 | 2;

  /** Whether loop is enabled */
  loopEnabled: boolean;

  /** Current frame index */
  currentFrame: number;

  /** Total frame count */
  totalFrames: number;

  /** Called on play button */
  onPlay: () => void;

  /** Called on pause button */
  onPause: () => void;

  /** Called on reset button */
  onReset: () => void;

  /** Called on previous frame button */
  onPreviousFrame: () => void;

  /** Called on next frame button */
  onNextFrame: () => void;

  /** Called on speed change */
  onSpeedChange: (speed: 0.5 | 1 | 2) => void;

  /** Called on loop toggle */
  onLoopToggle: () => void;
}

/**
 * Frame duration and settings panel.
 */
export interface FrameSettingsProps {
  /** Current frame's duration in ms */
  duration: number;

  /** Min allowed duration */
  minDuration: number;

  /** Max allowed duration */
  maxDuration: number;

  /** Called when duration changes */
  onDurationChange: (duration: number) => void;
}

// =============================================================================
// SIDEBAR COMPONENTS
// =============================================================================

/**
 * Entity palette for adding new players/ball/markers.
 */
export interface EntityPaletteProps {
  /** Called when attack player button clicked */
  onAddAttackPlayer: () => void;

  /** Called when defense player button clicked */
  onAddDefensePlayer: () => void;

  /** Called when ball button clicked */
  onAddBall: () => void;

  /** Called when cone button clicked */
  onAddCone: () => void;

  /** Called when marker button clicked */
  onAddMarker: () => void;
}

/**
 * Sport field selector dropdown.
 */
export interface SportSelectorProps {
  /** Currently selected sport */
  selectedSport: SportType;

  /** Called when sport is changed */
  onSportChange: (sport: SportType) => void;
}

/**
 * Project action buttons (New, Save, Load, Export).
 */
export interface ProjectActionsProps {
  /** Whether project has unsaved changes */
  isDirty: boolean;

  /** Called on New Project */
  onNew: () => void;

  /** Called on Save */
  onSave: () => void;

  /** Called on Load */
  onLoad: () => void;

  /** Called on Export */
  onExport: () => void;
}

/**
 * Selected entity properties panel.
 */
export interface EntityPropertiesProps {
  /** Currently selected entity */
  entity: Entity;

  /** Available colors for this team type */
  availableColors: string[];

  /** Called when label changes */
  onLabelChange: (label: string) => void;

  /** Called when color changes */
  onColorChange: (color: string) => void;

  /** Called when team changes */
  onTeamChange: (team: TeamType) => void;

  /** Called when delete button clicked */
  onDelete: () => void;

  /** Called when duplicate button clicked */
  onDuplicate: () => void;
}

// =============================================================================
// UI COMPONENTS (shadcn/ui customized)
// =============================================================================

/**
 * Button with Tactical Clubhouse styling.
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';

  /** Size variant */
  size?: 'sm' | 'md' | 'lg';

  /** Optional icon (Lucide icon component) */
  icon?: React.ComponentType<{ className?: string }>;

  /** Icon position */
  iconPosition?: 'left' | 'right';

  /** Loading state */
  loading?: boolean;
}

/**
 * Slider for duration/speed control.
 */
export interface SliderProps {
  /** Current value */
  value: number;

  /** Minimum value */
  min: number;

  /** Maximum value */
  max: number;

  /** Step increment */
  step: number;

  /** Called when value changes */
  onChange: (value: number) => void;

  /** Label text */
  label?: string;

  /** Display value formatter */
  formatValue?: (value: number) => string;

  /** Whether slider is disabled */
  disabled?: boolean;
}

/**
 * Color picker for entity colors.
 */
export interface ColorPickerProps {
  /** Currently selected color */
  selectedColor: string;

  /** Available color options */
  colors: string[];

  /** Called when color is selected */
  onColorSelect: (color: string) => void;
}

/**
 * Inline text editor for labels.
 */
export interface InlineEditorProps {
  /** Current text value */
  value: string;

  /** Placeholder when empty */
  placeholder?: string;

  /** Max character length */
  maxLength?: number;

  /** Called when editing completes (blur or Enter) */
  onComplete: (value: string) => void;

  /** Called when editing is cancelled (Escape) */
  onCancel: () => void;
}

/**
 * Export progress dialog.
 */
export interface ExportDialogProps {
  /** Whether dialog is open */
  isOpen: boolean;

  /** Export progress (0-100) */
  progress: number;

  /** Current export status */
  status: 'preparing' | 'recording' | 'processing' | 'complete' | 'error';

  /** Error message if status is 'error' */
  errorMessage?: string;

  /** Called when dialog is closed */
  onClose: () => void;

  /** Called to download completed export */
  onDownload: () => void;

  /** Called to retry failed export */
  onRetry: () => void;
}

/**
 * Unsaved changes confirmation dialog.
 */
export interface ConfirmDialogProps {
  /** Whether dialog is open */
  isOpen: boolean;

  /** Dialog title */
  title: string;

  /** Dialog message */
  message: string;

  /** Confirm button text */
  confirmText: string;

  /** Cancel button text */
  cancelText: string;

  /** Whether confirm action is destructive */
  destructive?: boolean;

  /** Called when confirmed */
  onConfirm: () => void;

  /** Called when cancelled */
  onCancel: () => void;
}

// =============================================================================
// CONTEXT MENU
// =============================================================================

/**
 * Entity context menu (right-click menu).
 */
export interface EntityContextMenuProps {
  /** Position to render menu */
  position: { x: number; y: number };

  /** Whether menu is visible */
  visible: boolean;

  /** Entity type for context-specific options */
  entityType: EntityType;

  /** Called when delete option selected */
  onDelete: () => void;

  /** Called when duplicate option selected */
  onDuplicate: () => void;

  /** Called when edit option selected */
  onEdit: () => void;

  /** Called when menu should close */
  onClose: () => void;
}
