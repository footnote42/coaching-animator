/**
 * Shared Module
 *
 * Reusable UI components and primitives used across all features.
 * This module provides the design system foundation and common UI patterns.
 *
 * @module shared
 */

// ============================================================================
// Shared Components
// ============================================================================

/**
 * Modal and dialog components
 */
export { DeleteConfirmDialog } from './components/DeleteConfirmDialog';
export { EditMetadataModal } from './components/EditMetadataModal';
export { ReportModal } from './components/ReportModal';
export { SaveToCloudModal } from './components/SaveToCloudModal';

/**
 * Application shell components
 */
export { Navigation } from './components/Navigation';
export { ErrorBoundary } from './components/ErrorBoundary';
export { OfflineIndicator } from './components/OfflineIndicator';

// ============================================================================
// UI Primitives
// ============================================================================

/**
 * Base UI components (shadcn/ui inspired)
 */
export { Button } from './ui/button';
export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
export { Input } from './ui/input';
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
export { Slider } from './ui/slider';

/**
 * Custom UI components
 */
export { ColorPicker } from './ui/ColorPicker';
export { ConfirmDialog } from './ui/ConfirmDialog';
export { EntityContextMenu } from './ui/EntityContextMenu';
