import React from 'react';
import { cn } from '@/lib/utils';

interface RugbyBallSpinnerProps {
    className?: string;
}

export const RugbyBallSpinner: React.FC<RugbyBallSpinnerProps> = ({ className }) => (
    <svg
        viewBox="0 0 16 16"
        className={cn('animate-spin-slow', className)}
        aria-hidden="true"
    >
        {/* Ball body */}
        <ellipse
            cx="8"
            cy="8"
            rx="6.5"
            ry="4"
            fill="#D97706"
            stroke="#1A3D1A"
            strokeWidth="1.2"
        />
        {/* Horizontal seam */}
        <line x1="1.5" y1="8" x2="14.5" y2="8" stroke="#1A3D1A" strokeWidth="0.9" />
        {/* Lacing marks */}
        <line x1="7" y1="6.2" x2="9" y2="6.2" stroke="#1A3D1A" strokeWidth="0.7" />
        <line x1="7" y1="8" x2="9" y2="8" stroke="#1A3D1A" strokeWidth="0.7" />
        <line x1="7" y1="9.8" x2="9" y2="9.8" stroke="#1A3D1A" strokeWidth="0.7" />
    </svg>
);
