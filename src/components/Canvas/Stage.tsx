import React from 'react';
import { Stage as KonvaStage } from 'react-konva';

/**
 * Props for the Stage component
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
 * Main canvas stage containing all layers.
 * Manages canvas dimensions and coordinates Konva Stage.
 * 
 * This component serves as the root container for all canvas layers
 * (Field, EntityLayer, GhostLayer, AnnotationLayer).
 */
export const Stage: React.FC<StageProps> = ({
    width,
    height,
    onCanvasClick,
    children
}) => {
    const handleStageClick = (e: any) => {
        // Check if the click was on the stage background (not on any shape)
        const clickedOnEmpty = e.target === e.target.getStage();

        if (clickedOnEmpty && onCanvasClick) {
            onCanvasClick();
        }
    };

    return (
        <KonvaStage
            width={width}
            height={height}
            onClick={handleStageClick}
            style={{
                cursor: 'default',
                display: 'block',
            }}
        >
            {children}
        </KonvaStage>
    );
};
