import { useState } from 'react';
import type { RefObject } from 'react';
import type Konva from 'konva';
import { useProjectStore } from '@/core/stores/projectStore';
import { useUIStore } from '@/core/stores/uiStore';
import type { Project } from '@/core/types';

interface InlineEditorState {
  entityId: string;
  position: { x: number; y: number };
  initialValue: string;
}

interface ContextMenuState {
  entityId: string;
  position: { x: number; y: number };
}

interface AnnotationContextMenuState {
  annotationId: string;
  position: { x: number; y: number };
}

interface UseEditorContextMenuHandlersParams {
  project: Project | null;
  currentFrameIndex: number;
  stageRef: RefObject<Konva.Stage>;
}

export function useEditorContextMenuHandlers({
  project,
  currentFrameIndex,
  stageRef,
}: UseEditorContextMenuHandlersParams) {
  const selectEntity = useUIStore(s => s.selectEntity);
  const deselectAll = useUIStore(s => s.deselectAll);

  const [inlineEditor, setInlineEditor] = useState<InlineEditorState | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [annotationContextMenu, setAnnotationContextMenu] = useState<AnnotationContextMenuState | null>(null);

  const handleEntitySelect = (entityId: string) => {
    selectEntity(entityId);
  };

  const handleEntityMove = (entityId: string, x: number, y: number) => {
    useProjectStore.getState().updateEntity(entityId, { x, y });
  };

  const handleEntityDoubleClick = (entityId: string) => {
    const currentFrame = project?.frames[currentFrameIndex];
    const entities = currentFrame ? Object.values(currentFrame.entities) : [];
    const entity = entities.find((e) => e.id === entityId);
    if (!entity || !stageRef.current) return;

    const canvasElement = stageRef.current.container();
    const rect = canvasElement.getBoundingClientRect();

    setInlineEditor({
      entityId,
      position: { x: rect.left + entity.x - 40, y: rect.top + entity.y - 15 },
      initialValue: entity.label || '',
    });
  };

  const handleEntityContextMenu = (entityId: string, event: { x: number; y: number }) => {
    if (!stageRef.current) return;

    const canvasElement = stageRef.current.container();
    const rect = canvasElement.getBoundingClientRect();

    setContextMenu({
      entityId,
      position: { x: rect.left + event.x, y: rect.top + event.y },
    });
  };

  const handleInlineEditorConfirm = (value: string) => {
    if (inlineEditor) {
      useProjectStore.getState().updateEntity(inlineEditor.entityId, { label: value });
    }
    setInlineEditor(null);
  };

  const handleInlineEditorCancel = () => {
    setInlineEditor(null);
  };

  const handleContextMenuDuplicate = () => {
    if (!contextMenu || !project) return;
    const frame = project.frames[currentFrameIndex];
    if (!frame) return;

    const entity = frame.entities[contextMenu.entityId];
    if (!entity) return;

    useProjectStore.getState().addEntity({
      type: entity.type,
      x: entity.x + 30,
      y: entity.y + 30,
      team: entity.team,
      color: entity.color,
      label: entity.label,
    });
  };

  const handleContextMenuDelete = () => {
    if (!contextMenu) return;
    useProjectStore.getState().removeEntity(contextMenu.entityId);
    deselectAll();
  };

  const handleContextMenuEditLabel = () => {
    if (!contextMenu) return;
    handleEntityDoubleClick(contextMenu.entityId);
  };

  const handleAnnotationContextMenu = (annotationId: string, event: { x: number; y: number }) => {
    if (!stageRef.current) return;

    const canvasElement = stageRef.current.container();
    const rect = canvasElement.getBoundingClientRect();

    setAnnotationContextMenu({
      annotationId,
      position: { x: rect.left + event.x, y: rect.top + event.y },
    });
  };

  const handleAnnotationContextMenuDelete = () => {
    if (!annotationContextMenu) return;
    useProjectStore.getState().removeAnnotation(annotationContextMenu.annotationId);
    deselectAll();
    setAnnotationContextMenu(null);
  };

  const handleCanvasClick = () => {
    deselectAll();
  };

  return {
    inlineEditor,
    contextMenu,
    setContextMenu,
    annotationContextMenu,
    setAnnotationContextMenu,
    handleEntitySelect,
    handleEntityMove,
    handleEntityDoubleClick,
    handleEntityContextMenu,
    handleInlineEditorConfirm,
    handleInlineEditorCancel,
    handleContextMenuDuplicate,
    handleContextMenuDelete,
    handleContextMenuEditLabel,
    handleAnnotationContextMenu,
    handleAnnotationContextMenuDelete,
    handleCanvasClick,
  };
}
