'use client';

import Image from 'next/image';

/**
 * BrandIcon variants define the standard sizes used across the application.
 * You can manually adjust these values here to scale the icon globally.
 */
export type BrandIconVariant = 'header' | 'tutorial' | 'share-viewer' | 'empty-state' | 'large';

const VARIANTS: Record<BrandIconVariant, number> = {
    header: 46,        // Site navigation header
    tutorial: 40,      // Onboarding guide steps
    'share-viewer': 30, // Bottom-left attribution in replay view
    'empty-state': 64,  // Gallery/Collections empty states
    large: 140,         // 404 / Hero sections
};

interface BrandIconProps {
    /** Preset size variant */
    variant?: BrandIconVariant;
    /** Override the variant size with a custom pixel value */
    size?: number;
    /** Optional CSS classes */
    className?: string;
    /** Set to true if the icon is above the fold (e.g. Header) */
    priority?: boolean;
}

/**
 * The single source of truth for the Coaching Animator brand icon.
 * Update the SCALES object above to adjust sizing throughout the project.
 */
export function BrandIcon({
    variant = 'header',
    size,
    className = '',
    priority = false
}: BrandIconProps) {
    const finalSize = size ?? VARIANTS[variant];

    return (
        <Image
            src="/assets/logo.png"
            alt="Coaching Animator"
            width={finalSize}
            height={finalSize}
            className={`object-contain ${className}`}
            priority={priority}
        />
    );
}
