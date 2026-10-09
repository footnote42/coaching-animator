'use client';

import { useState } from 'react';
import { AREA_TEMPLATES, DIRECTIONS, MAX_AREA_SIDE_M, type Area, type AreaTemplate, type Direction } from '@/features/practice/schema';
import { AREA_TEMPLATE_NAMES, areaFromTemplate, areaTemplate } from '@/features/practice/area';

interface AreaControlProps {
  area: Area;
  onChange: (area: Area) => void;
  /** Direction of attack of the Practice; undefined shows as none. */
  direction?: Direction;
  onDirectionChange?: (direction: Direction) => void;
}

const DIRECTION_NAMES = {
  up: 'Up',
  down: 'Down',
  left: 'Left',
  right: 'Right',
  none: 'None',
} as const satisfies Record<Direction, string>;

const inputClass =
  'h-11 w-16 border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

/**
 * The Area of the base Step: a template picker plus width and length in metres.
 * Picking a template resets the size to the template's; sizes commit on blur or Enter.
 * Give it a key from the Area's size so it resets when the script changes.
 */
export function AreaControl({ area, onChange, direction, onDirectionChange }: AreaControlProps) {
  const [width, setWidth] = useState(String(area.width));
  const [length, setLength] = useState(String(area.length));

  const commit = () => {
    const w = Number(width);
    const l = Number(length);
    const ok = (n: number) => Number.isInteger(n) && n >= 1 && n <= MAX_AREA_SIDE_M;
    if (!ok(w) || !ok(l)) {
      setWidth(String(area.width));
      setLength(String(area.length));
      return;
    }
    if (w !== area.width || l !== area.length) onChange({ ...area, template: areaTemplate(area), width: w, length: l });
  };

  return (
    <fieldset className="flex flex-wrap items-end gap-2 text-sm text-text-primary">
      <legend className="mb-1 font-medium">Area</legend>
      <label className="flex flex-col gap-1">
        <span>Template</span>
        <select
          value={areaTemplate(area)}
          onChange={(e) => onChange(areaFromTemplate(e.target.value as AreaTemplate))}
          className="h-11 border border-[var(--color-border)] bg-[var(--color-surface)] px-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {AREA_TEMPLATES.map((t) => (
            <option key={t} value={t}>
              {AREA_TEMPLATE_NAMES[t]}
            </option>
          ))}
        </select>
      </label>
      {(
        [
          ['Width (m)', width, setWidth],
          ['Length (m)', length, setLength],
        ] as const
      ).map(([label, value, set]) => (
        <label key={label} className="flex flex-col gap-1">
          <span>{label}</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_AREA_SIDE_M}
            step={1}
            value={value}
            onChange={(e) => set(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === 'Enter' && commit()}
            className={inputClass}
          />
        </label>
      ))}
      {onDirectionChange && (
        <label className="flex flex-col gap-1">
          <span>Direction of attack</span>
          <select
            value={direction ?? 'none'}
            onChange={(e) => onDirectionChange(e.target.value as Direction)}
            className="h-11 border border-[var(--color-border)] bg-[var(--color-surface)] px-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {DIRECTIONS.map((d) => (
              <option key={d} value={d}>
                {DIRECTION_NAMES[d]}
              </option>
            ))}
          </select>
        </label>
      )}
    </fieldset>
  );
}
