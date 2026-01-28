import React, { useEffect, useState } from 'react';
import { Layer, Image as KonvaImage, Text } from 'react-konva';
import { SportType } from '../../types';

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
}


/**
 * Field background layer rendering sport-specific pitch markings.
 * Uses SVG assets from src/assets/fields/
 */
export const Field: React.FC<FieldProps> = ({ sport, width, height }) => {
    const [image, setImage] = useState<HTMLImageElement | undefined>(undefined);
    const [loadingError, setLoadingError] = useState<string | null>(null);

    useEffect(() => {
        // Load the appropriate SVG asset based on the sport
        const img = new window.Image();

        // Path resolution for Vite asset serving
        // Vite serves assets from the root, so we use the correct public path
        const assetPath = `/assets/fields/${sport}.svg`;

        img.src = assetPath;
        img.onload = () => {
            setImage(img);
            setLoadingError(null);
        };
        
        img.onerror = () => {
            setLoadingError(`Failed to load field asset: ${assetPath}`);
            console.error(`Failed to load field asset: ${assetPath}`);
        };

        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [sport]);

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

