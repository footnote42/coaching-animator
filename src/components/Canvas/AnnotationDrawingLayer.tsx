import React, { useState } from 'react';
import { Layer, Arrow, Line, Rect } from 'react-konva';
import { DrawingMode } from '../../types';
import Konva from 'konva';

/**
 * Props for the AnnotationDrawingLayer component
 */
export interface AnnotationDrawingLayerProps {
    /** Current drawing mode (none, arrow, line) */
    drawingMode: DrawingMode;
    /** Default color for new annotations */
    defaultColor: string;
    /** Called when drawing is completed with start and end points */
    onDrawingComplete: (points: number[], type: 'arrow' | 'line') => void;
    /** Whether layer is interactive */
    interactive: boolean;
    /** Canvas width for hit area */
    width: number;
    /** Canvas height for hit area */
    height: number;
}

/**
 * Transient drawing layer for click-and-drag annotation creation.
 * 
 * Handles:
 * - MouseDown: Start drawing, capture start point
 * - MouseMove: Update preview shape
 * - MouseUp: Complete drawing, call callback
 */
export const AnnotationDrawingLayer: React.FC<AnnotationDrawingLayerProps> = ({
    drawingMode,
    defaultColor,
    onDrawingComplete,
    interactive,
    width,
    height,
}) => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
    const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null);

    // Don't render if not in drawing mode or not interactive
    if (drawingMode === 'none' || !interactive) {
        return null;
    }

    const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
        const stage = e.target.getStage();
        if (!stage) return;

        const pos = stage.getPointerPosition();
        if (!pos) return;

        setIsDrawing(true);
        setStartPoint({ x: pos.x, y: pos.y });
        setCurrentPoint({ x: pos.x, y: pos.y });
    };

    const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (!isDrawing) return;

        const stage = e.target.getStage();
        if (!stage) return;

        const pos = stage.getPointerPosition();
        if (!pos) return;

        setCurrentPoint({ x: pos.x, y: pos.y });
    };

    const handleMouseUp = () => {
        if (!isDrawing || !startPoint || !currentPoint) {
            setIsDrawing(false);
            return;
        }

        // Only create annotation if the line has meaningful length (at least 10 pixels)
        const dx = currentPoint.x - startPoint.x;
        const dy = currentPoint.y - startPoint.y;
        const length = Math.sqrt(dx * dx + dy * dy);

        if (length >= 10) {
            const points = [startPoint.x, startPoint.y, currentPoint.x, currentPoint.y];
            onDrawingComplete(points, drawingMode as 'arrow' | 'line');
        }

        // Reset state
        setIsDrawing(false);
        setStartPoint(null);
        setCurrentPoint(null);
    };

    const strokeWidth = 3;
    const previewPoints = startPoint && currentPoint
        ? [startPoint.x, startPoint.y, currentPoint.x, currentPoint.y]
        : [];

    return (
        <Layer>
            {/* Transparent rect to capture mouse events across entire canvas */}
            <Rect
                x={0}
                y={0}
                width={width}
                height={height}
                fill="transparent"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            />

            {/* Preview shape while drawing */}
            {isDrawing && startPoint && currentPoint && (
                drawingMode === 'arrow' ? (
                    <Arrow
                        points={previewPoints}
                        stroke={defaultColor}
                        strokeWidth={strokeWidth}
                        fill={defaultColor}
                        pointerLength={12}
                        pointerWidth={12}
                        lineCap="round"
                        lineJoin="round"
                        opacity={0.7}
                        listening={false}
                    />
                ) : (
                    <Line
                        points={previewPoints}
                        stroke={defaultColor}
                        strokeWidth={strokeWidth}
                        lineCap="round"
                        lineJoin="round"
                        opacity={0.7}
                        listening={false}
                    />
                )
            )}
        </Layer>
    );
};
