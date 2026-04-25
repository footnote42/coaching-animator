import { useState } from 'react';
import { useProjectStore } from '@/core/stores/projectStore';
import { EntityColors } from '@/features/animation/services/entityColors';
import { toast } from 'sonner';

interface UseEditorEntityHandlersParams {
  setShowRecoveryDialog: (show: boolean) => void;
  recoveredProject: unknown;
  setRecoveredProject: (project: unknown) => void;
  stripColors?: { attack: string; defense: string };
  canvasWidth: number;
  canvasHeight: number;
}

export function useEditorEntityHandlers({
  setShowRecoveryDialog,
  recoveredProject,
  setRecoveredProject,
  stripColors,
  canvasWidth,
  canvasHeight,
}: UseEditorEntityHandlersParams) {
  const addEntity = useProjectStore(s => s.addEntity);
  const propagateEntity = useProjectStore(s => s.propagateEntity);
  const project = useProjectStore(s => s.project);
  const newProject = useProjectStore(s => s.newProject);
  const loadProject = useProjectStore(s => s.loadProject);

  const [showGuestLimitModal, setShowGuestLimitModal] = useState(false);

  const handleRecoverProject = () => {
    if (recoveredProject) {
      const result = loadProject(recoveredProject);
      if (!result.success) {
        toast.error(`Failed to recover project:\n${result.errors.join('\n')}`);
        newProject();
      }
    }
    setShowRecoveryDialog(false);
    setRecoveredProject(null);
  };

  const handleSkipRecovery = () => {
    setShowRecoveryDialog(false);
    setRecoveredProject(null);
    newProject();
  };

  const addEntityWithPropagate = (entityData: Parameters<typeof addEntity>[0]) => {
    const newId = addEntity(entityData);
    if ((project?.frames.length ?? 0) > 1) {
      toast('Add entity to all subsequent frames?', {
        action: { label: 'Yes', onClick: () => propagateEntity(newId) },
        cancel: { label: 'No', onClick: () => {} },
      });
    }
  };

  const handleAddAttackPlayer = () => {
    addEntityWithPropagate({
      type: 'player',
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      team: 'attack',
      color: stripColors?.attack || EntityColors.getDefault('player', 'attack'),
      label: '',
    });
  };

  const handleAddDefensePlayer = () => {
    addEntityWithPropagate({
      type: 'player',
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      team: 'defense',
      color: stripColors?.defense || EntityColors.getDefault('player', 'defense'),
      label: '',
    });
  };

  const handleAddBall = () => {
    addEntityWithPropagate({
      type: 'ball',
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      team: 'neutral',
      color: EntityColors.getDefault('ball'),
      label: '',
    });
  };

  const handleAddCone = () => {
    addEntityWithPropagate({
      type: 'cone',
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      team: 'neutral',
      color: EntityColors.getDefault('cone'),
      label: '',
    });
  };

  const handleAddTackleShield = () => {
    addEntityWithPropagate({
      type: 'tackle-shield',
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      team: 'neutral',
      color: EntityColors.getDefault('tackle-shield'),
      label: '',
    });
  };

  const handleAddTackleBag = () => {
    addEntityWithPropagate({
      type: 'tackle-bag',
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      team: 'neutral',
      color: EntityColors.getDefault('tackle-bag'),
      label: '',
    });
  };

  return {
    showGuestLimitModal,
    setShowGuestLimitModal,
    handleRecoverProject,
    handleSkipRecovery,
    handleAddAttackPlayer,
    handleAddDefensePlayer,
    handleAddBall,
    handleAddCone,
    handleAddTackleShield,
    handleAddTackleBag,
  };
}
