import React from 'react';
import { Layer, Arrow, Line } from 'react-konva';
import { Annotation } from '../../types';

/**
 * Props for the AnnotationLayer component
 */
export interface AnnotationLayerProps {
    /** Annotations to render */
    annotations: Annotation[];
    /** ID of currently selected annotation (for highlight) */
    selectedAnnotationId: string | null;
    /** Called when annotation is clicked/selected */
    onAnnotationSelect: (annotationId: string) => void;
    /** Called on right-click */
    onContextMenu: (annotationId: string, event: { x: number; y: number }) => void;
    /** Whether layer is interactive (false during playback) */
    interactive: boolean;
    /** Current frame ID for visibility filtering */
    currentFrameId: string;
    /** All frame IDs in order for visibility range checks */
    frameIds: string[];
}

/**
 * Layer containing all annotation shapes (arrows, lines).
 * Renders Konva Arrow and Line shapes based on annotation data.
 * 
 * Responsibilities:
 * - Renders all annotations for the current frame
 * - Filters annotations by frame visibility range (FR-ENT-07)
 * - Manages selection highlighting
 * - Disables interactions during playback
 * - Delegates all state changes through callback props
 */
export const AnnotationLayer: React.FC<AnnotationLayerProps> = ({
    annotations,
    selectedAnnotationId,
    onAnnotationSelect,
    onContextMenu,
    interactive,
    currentFrameId,
    frameIds,
}) => {
    // Filter annotations by frame visibility (FR-ENT-07)
    const visibleAnnotations = annotations.filter((annotation) => {
        const currentFrameIndex = frameIds.indexOf(currentFrameId);
        const startFrameIndex = frameIds.indexOf(annotation.startFrameId);
        const endFrameIndex = frameIds.indexOf(annotation.endFrameId);

        // Show annotation if current frame is within the visibility range
        return currentFrameIndex >= startFrameIndex && currentFrameIndex <= endFrameIndex;
    });

    // Handle right-click context menu
    const handleContextMenu = (annotationId: string, e: { evt: MouseEvent; target: { getStage: () => { getPointerPosition: () => { x: number; y: number } } } }) => {
        e.evt.preventDefault();
        const stage = e.target.getStage();
        const pointerPosition = stage.getPointerPosition();

        onContextMenu(annotationId, {
            x: pointerPosition.x,
            y: pointerPosition.y
        });
    };

    return (
        <Layer listening={interactive}>
            {visibleAnnotations.map((annotation) => {
                const isSelected = selectedAnnotationId === annotation.id;
                const strokeWidth = isSelected ? 4 : 3;

                // Points format: [x1, y1, x2, y2]
                const [x1, y1, x2, y2] = annotation.points;

                if (annotation.type === 'arrow') {
                    return (
                        <Arrow
                            key={annotation.id}
                            points={[x1, y1, x2, y2]}
                            stroke={annotation.color}
                            strokeWidth={strokeWidth}
                            fill={annotation.color}
                            pointerLength={12}
                            pointerWidth={12}
                            lineCap="round"
                            lineJoin="round"
                            onClick={() => onAnnotationSelect(annotation.id)}
                            onTap={() => onAnnotationSelect(annotation.id)}
                            onContextMenu={(e) => handleContextMenu(annotation.id, e)}
                            hitStrokeWidth={20}
                        />
                    );
                }

                // Line type
                return (
                    <Line
                        key={annotation.id}
                        points={[x1, y1, x2, y2]}
                        stroke={annotation.color}
                        strokeWidth={strokeWidth}
                        lineCap="round"
                        lineJoin="round"
                        onClick={() => onAnnotationSelect(annotation.id)}
                        onTap={() => onAnnotationSelect(annotation.id)}
                        onContextMenu={(e) => handleContextMenu(annotation.id, e)}
                        hitStrokeWidth={20}
                    />
                );
            })}
        </Layer>
    );
};
