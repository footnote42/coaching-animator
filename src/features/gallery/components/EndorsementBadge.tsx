import React from 'react';

interface EndorsementBadgeProps {
  endorsedBy: string;
}

/**
 * EndorsementBadge
 *
 * A solid pitch-green stamp rendered at the top-right of a gallery card
 * preview area. Text is the endorser name uppercased with underscores
 * replaced by spaces.
 *
 * Design constraints (spec UI-008):
 * - Solid rectangle — no rounding (rounded-none), no shadow, no border
 * - Uppercase short label
 * - Stamped aesthetic, NOT a floating chip or pill
 */
export function EndorsementBadge({ endorsedBy }: EndorsementBadgeProps) {
  const displayText = endorsedBy.replace(/_/g, ' ').toUpperCase();

  return (
    <span
      aria-label={`Endorsed by ${displayText}`}
      className="bg-primary text-text-inverse text-[10px] font-heading font-bold tracking-wider px-2 py-0.5 rounded-none"
    >
      {displayText}
    </span>
  );
}
