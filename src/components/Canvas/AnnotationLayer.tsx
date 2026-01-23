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
    /** Whether layer is interactive (false during playback) */
    interactive: boolean;
}

/**
 * Layer containing all annotation shapes (arrows, lines).
 * Renders Konva Arrow and Line shapes based on annotation data.
 * 
 * Responsibilities:
 * - Renders all annotations for the current frame
 * - Manages selection highlighting
 * - Disables interactions during playback
 * - Delegates all state changes through callback props
 */
export const AnnotationLayer: React.FC<AnnotationLayerProps> = ({
    annotations,
    selectedAnnotationId,
    onAnnotationSelect,
    interactive,
}) => {
    return (
        <Layer listening={interactive}>
            {annotations.map((annotation) => {
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
                        hitStrokeWidth={20}
                    />
                );
            })}
        </Layer>
    );
};
