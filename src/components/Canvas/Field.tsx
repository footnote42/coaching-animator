import React, { useEffect, useState } from 'react';
import { Layer, Image as KonvaImage, Text } from 'react-konva';
import { SportType, PitchLayout } from '../../types';

/**
 * Props for the Field component
 */
export interface FieldProps {
    /** Sport type determining which field to render */
    sport: SportType;
    /** Canvas width for scaling */
    width: number;
    /** Canvas height for scaling */
    height: number;
    /** Pitch layout variant (defaults to 'standard') */
    layout?: PitchLayout;
}


/**
 * Field background layer rendering sport-specific pitch markings.
 * Uses SVG assets from src/assets/fields/
 * Supports layout variants: standard (default), attack, defence, training
 */
export const Field: React.FC<FieldProps> = ({ sport, width, height, layout = 'standard' }) => {
    const [image, setImage] = useState<HTMLImageElement | undefined>(undefined);
    const [loadingError, setLoadingError] = useState<string | null>(null);

    useEffect(() => {
        // Reset image state when sport or layout changes
        setImage(undefined);

        // Load the appropriate SVG asset based on the sport and layout
        const img = new window.Image();

        // Path resolution for asset serving
        // For non-standard layouts, use layout-specific assets (e.g., rugby-union-attack.svg)
        // For standard layout, use the base asset (e.g., rugby-union.svg)
        const assetPath = layout === 'standard'
            ? `/assets/fields/${sport}.svg`
            : `/assets/fields/${sport}-${layout}.svg`;

        img.onload = () => {
            setImage(img);
            setLoadingError(null);
        };

        img.onerror = () => {
            setLoadingError(`Failed to load field asset: ${assetPath}`);
            console.error(`Failed to load field asset: ${assetPath}`);
        };

        img.src = assetPath;

        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [sport, layout]);

    if (loadingError) {
        return (
            <Layer listening={false}>
                <Text
                    text={loadingError}
                    x={width / 2}
                    y={height / 2}
                    fontSize={14}
                    fill="red"
                    align="center"
                    offsetX={100}
                />
            </Layer>
        );
    }

    if (!image) {
        return <Layer listening={false} />;
    }

    return (
        <Layer listening={false}>
            <KonvaImage
                image={image}
                width={width}
                height={height}
                listening={false}
            />
        </Layer>
    );
};

