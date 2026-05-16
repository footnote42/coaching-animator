import { useState } from 'react';
import { useProjectStore } from '@/core/stores/projectStore';
import { EntityColors } from '@/features/animation/services/entityColors';
import { toast } from 'sonner';

const SPAWN_OFFSET_PX = 40;
const SPAWN_OFFSETS = [
  { dx: 0, dy: 0 },
  { dx: 1, dy: 0 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 0, dy: -1 },
  { dx: 1, dy: 1 }, { dx: -1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: -1 },
];

function findSpawnPosition(
  cx: number, cy: number,
  entities: Record<string, { x: number; y: number }>,
): { x: number; y: number } {
  const list = Object.values(entities);
  const threshold = SPAWN_OFFSET_PX * 0.75;
  for (const { dx, dy } of SPAWN_OFFSETS) {
    const x = cx + dx * SPAWN_OFFSET_PX;
    const y = cy + dy * SPAWN_OFFSET_PX;
    if (!list.some(e => Math.abs(e.x - x) < threshold && Math.abs(e.y - y) < threshold)) {
      return { x, y };
    }
  }
  return { x: cx, y: cy };
}

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
  const currentFrameIndex = useProjectStore(s => s.currentFrameIndex);
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

  const spawnPosition = () => {
    const entities = project?.frames[currentFrameIndex]?.entities ?? {};
    return findSpawnPosition(canvasWidth / 2, canvasHeight / 2, entities);
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
    const { x, y } = spawnPosition();
    addEntityWithPropagate({
      type: 'player', x, y,
      team: 'attack',
      color: stripColors?.attack || EntityColors.getDefault('player', 'attack'),
      label: '',
    });
  };

  const handleAddDefensePlayer = () => {
    const { x, y } = spawnPosition();
    addEntityWithPropagate({
      type: 'player', x, y,
      team: 'defense',
      color: stripColors?.defense || EntityColors.getDefault('player', 'defense'),
      label: '',
    });
  };

  const handleAddBall = () => {
    const { x, y } = spawnPosition();
    addEntityWithPropagate({
      type: 'ball', x, y,
      team: 'neutral',
      color: EntityColors.getDefault('ball'),
      label: '',
    });
  };

  const handleAddCone = () => {
    const { x, y } = spawnPosition();
    addEntityWithPropagate({
      type: 'cone', x, y,
      team: 'neutral',
      color: EntityColors.getDefault('cone'),
      label: '',
    });
  };

  const handleAddTackleShield = () => {
    const { x, y } = spawnPosition();
    addEntityWithPropagate({
      type: 'tackle-shield', x, y,
      team: 'neutral',
      color: EntityColors.getDefault('tackle-shield'),
      label: '',
    });
  };

  const handleAddTackleBag = () => {
    const { x, y } = spawnPosition();
    addEntityWithPropagate({
      type: 'tackle-bag', x, y,
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
