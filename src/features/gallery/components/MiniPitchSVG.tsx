import React from 'react';

interface PreviewEntity {
  x: number;
  y: number;
  team: 'attack' | 'defense' | 'neutral';
}

interface MiniPitchSVGProps {
  entities: PreviewEntity[] | null;
  className?: string;
}

/**
 * MiniPitchSVG
 *
 * Renders a simplified tactical pitch outline (100×75 viewBox) with coloured
 * dots for attackers and defenders derived from first-frame entity data.
 *
 * Uses CSS custom properties for colours — NOT EntityColors or hardcoded hex values.
 * This is an intentional documented exception per research.md Decision 6.
 *
 * - Attacker dots: var(--color-accent-warm)  (amber)
 * - Defender dots: var(--color-text-primary) at 40% opacity (muted)
 * - Neutral entities are omitted
 * - Maximum 15 dots rendered
 */
export function MiniPitchSVG({ entities, className }: MiniPitchSVGProps) {
  // Filter to max 15, exclude neutral
  const dots = (entities ?? [])
    .filter((e) => e.team !== 'neutral')
    .slice(0, 15)
    .map((e) => {
      // Automatic scaling: if x > 100, assume it's raw 800x600 canvas space and scale to 100x75
      const needsScaling = e.x > 100 || e.y > 75;
      return {
        ...e,
        x: needsScaling ? e.x / 8 : e.x,
        y: needsScaling ? e.y / 8 : e.y,
      };
    });

  return (
    <svg
      viewBox="0 0 100 75"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Pitch background */}
      <rect
        x="0"
        y="0"
        width="100"
        height="75"
        fill="var(--color-primary)"
      />

      {/* Pitch lines */}
      <rect
        x="1"
        y="1"
        width="98"
        height="73"
        fill="none"
        stroke="rgba(255, 255, 255, 0.4)"
        strokeWidth="1"
      />

      {/* Halfway line */}
      <line
        x1="50"
        y1="1"
        x2="50"
        y2="74"
        stroke="rgba(255, 255, 255, 0.4)"
        strokeWidth="1"
      />

      {/* Entity dots */}
      {dots.map((e, i) => {
        // Use vibrant team colors matching the editor palette
        const dotColor = e.team === 'attack' 
          ? '#2563EB' // Vibrant Blue
          : '#DC2626'; // Vibrant Red
          
        return (
          <circle
            key={i}
            cx={e.x}
            cy={e.y}
            r="3"
            fill={dotColor}
            stroke="white"
            strokeWidth="0.5"
          />
        );
      })}
    </svg>
  );
}
