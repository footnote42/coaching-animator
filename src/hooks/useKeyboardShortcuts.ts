import { useEffect } from 'react';
import { useProjectStore } from '../store/projectStore';
import { useUIStore } from '../store/uiStore';

/**
 * Global keyboard shortcut handler
 *
 * Shortcuts:
 * - Space: Toggle play/pause
 * - Delete/Backspace: Remove selected entity or annotation
 * - Ctrl/Cmd+S: Save project
 * - Left Arrow: Previous frame
 * - Right Arrow: Next frame
 * - Escape: Deselect all entities, cancel drawing mode
 */
export function useKeyboardShortcuts() {
  const {
    isPlaying,
    play,
    pause,
    currentFrameIndex,
    setCurrentFrame,
    removeEntity,
    removeAnnotation,
    saveProject,
    project,
  } = useProjectStore();

  const {
    selectedEntityId,
    selectedAnnotationId,
    deselectAll,
    selectAnnotation,
    drawingMode,
    setDrawingMode,
  } = useUIStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input field
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Space: Toggle play/pause
      if (e.code === 'Space') {
        e.preventDefault();
        if (isPlaying) {
          pause();
        } else {
          play();
        }
        return;
      }

      // Delete/Backspace: Remove selected entity or annotation
      if (e.code === 'Delete' || e.code === 'Backspace') {
        e.preventDefault();
        if (selectedEntityId) {
          removeEntity(selectedEntityId);
          deselectAll();
        } else if (selectedAnnotationId) {
          removeAnnotation(selectedAnnotationId);
          selectAnnotation(null);
        }
        return;
      }

      // Ctrl/Cmd+S: Save project
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyS') {
        e.preventDefault();
        if (project) {
          saveProject();
        }
        return;
      }

      // Left Arrow: Previous frame
      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (currentFrameIndex > 0) {
          setCurrentFrame(currentFrameIndex - 1);
        }
        return;
      }

      // Right Arrow: Next frame
      if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (project && currentFrameIndex < project.frames.length - 1) {
          setCurrentFrame(currentFrameIndex + 1);
        }
        return;
      }

      // Escape: Cancel drawing mode, deselect all
      if (e.code === 'Escape') {
        e.preventDefault();
        if (drawingMode !== 'none') {
          setDrawingMode('none');
        }
        deselectAll();
        selectAnnotation(null);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    isPlaying,
    play,
    pause,
    currentFrameIndex,
    setCurrentFrame,
    removeEntity,
    removeAnnotation,
    saveProject,
    project,
    selectedEntityId,
    selectedAnnotationId,
    deselectAll,
    selectAnnotation,
    drawingMode,
    setDrawingMode,
  ]);
}
