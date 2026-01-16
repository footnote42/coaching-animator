import React, { useEffect, useState } from 'react';
import { Image as KonvaImage } from 'react-konva';
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

    useEffect(() => {
        // Load the appropriate SVG asset based on the sport
        const img = new window.Image();

        // Path resolution depends on how Vite serves assets.
        // Since we are in src/components/Canvas/Field.tsx, the asset is at src/assets/fields/
        // We can use URL constructor or direct path if served from public, 
        // but here we'll assume standard relative path which Vite's dev server handles.
        const assetPath = `/src/assets/fields/${sport}.svg`;

        img.src = assetPath;
        img.onload = () => {
            setImage(img);
        };

        return () => {
            img.onload = null;
        };
    }, [sport]);

    if (!image) {
        return null;
    }

    return (
        <KonvaImage
            image={image}
            width={width}
            height={height}
            listening={false} // Field shouldn't block clicks to entities
        />
    );
};
