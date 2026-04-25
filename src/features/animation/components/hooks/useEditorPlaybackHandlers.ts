import { useProjectStore } from '@/core/stores/projectStore';
import { useUIStore } from '@/core/stores/uiStore';
import { DESIGN_TOKENS } from '@/core/constants/design-tokens';
import { VALIDATION } from '@/core/constants/validation';

interface UseEditorPlaybackHandlersParams {
  isAuthenticated: boolean;
  setShowGuestLimitModal: (show: boolean) => void;
}

export function useEditorPlaybackHandlers({
  isAuthenticated,
  setShowGuestLimitModal,
}: UseEditorPlaybackHandlersParams) {
  const addFrame = useProjectStore(s => s.addFrame);
  const setCurrentFrame = useProjectStore(s => s.setCurrentFrame);
  const updateFrame = useProjectStore(s => s.updateFrame);
  const addAnnotation = useProjectStore(s => s.addAnnotation);
  const project = useProjectStore(s => s.project);
  const currentFrameIndex = useProjectStore(s => s.currentFrameIndex);

  const setDrawingMode = useUIStore(s => s.setDrawingMode);

  const maxFrames = isAuthenticated
    ? VALIDATION.PROJECT.MAX_FRAMES
    : VALIDATION.PROJECT.GUEST_MAX_FRAMES;

  const handleAddFrame = () => {
    if (!project) return;
    if (project.frames.length >= maxFrames) {
      if (!isAuthenticated) {
        setShowGuestLimitModal(true);
      }
      return;
    }
    addFrame();
  };

  const handlePreviousFrame = () => {
    if (currentFrameIndex > 0) {
      setCurrentFrame(currentFrameIndex - 1);
    }
  };

  const handleNextFrame = () => {
    if (project && currentFrameIndex < project.frames.length - 1) {
      setCurrentFrame(currentFrameIndex + 1);
    }
  };

  const handleFrameDurationChange = (frameId: string, durationMs: number) => {
    updateFrame(frameId, { duration: durationMs });
  };

  const handleDrawingComplete = (points: number[], type: 'arrow' | 'line') => {
    addAnnotation({
      type,
      points,
      color: DESIGN_TOKENS.colours.annotation,
    });
    setDrawingMode('none');
  };

  return {
    handleAddFrame,
    handlePreviousFrame,
    handleNextFrame,
    handleFrameDurationChange,
    handleDrawingComplete,
  };
}
