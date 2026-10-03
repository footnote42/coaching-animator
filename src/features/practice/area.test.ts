import { describe, it, expect } from 'vitest';
import {
  areaFromTemplate,
  areaTemplate,
  gridSpacing,
  markerRadius,
  pitchLines,
  MIN_MARKER_RADIUS_PX,
} from './area';
import { validate } from './engine';
import passingSquare from './examples/passing-square.json';

describe('Area templates', () => {
  it('starts pitch templates at the generic pitch size, 70 m wide', () => {
    expect(areaFromTemplate('full-pitch')).toEqual({ template: 'full-pitch', width: 70, length: 120 });
    expect(areaFromTemplate('half-pitch')).toEqual({ template: 'half-pitch', width: 70, length: 60 });
  });

  it('reads an Area without a template as open grass named by its shape', () => {
    expect(areaTemplate({ width: 12, length: 12 })).toBe('square');
    expect(areaTemplate({ width: 30, length: 20 })).toBe('horizontal');
    expect(areaTemplate({ width: 20, length: 30 })).toBe('vertical');
    expect(validate(passingSquare).ok).toBe(true);
  });

  it('rejects an unknown template', () => {
    const script = { ...passingSquare, area: { template: 'oval', width: 12, length: 12 } };
    expect(validate(script).ok).toBe(false);
  });

  it('spaces grid lines by Area size', () => {
    expect(gridSpacing({ width: 12, length: 12 })).toBe(1);
    expect(gridSpacing(areaFromTemplate('half-pitch'))).toBe(5);
    expect(gridSpacing(areaFromTemplate('full-pitch'))).toBe(10);
  });

  it('marks try lines, 22s, 10 m lines and halfway on a full pitch', () => {
    expect(pitchLines(areaFromTemplate('full-pitch')).map((l) => l.y)).toEqual([10, 32, 50, 60, 70, 88, 110]);
    expect(pitchLines(areaFromTemplate('half-pitch')).map((l) => l.y)).toEqual([10, 32, 50]);
    expect(pitchLines({ width: 20, length: 20 })).toEqual([]);
  });

  it('keeps full-pitch markers legible at 375 px wide', () => {
    const area = areaFromTemplate('full-pitch');
    expect(markerRadius(area, 375 / area.width)).toBeGreaterThanOrEqual(MIN_MARKER_RADIUS_PX);
    // Markers grow with the Area, in metres.
    expect(markerRadius(area, 1, 0)).toBeGreaterThan(markerRadius({ width: 12, length: 12 }, 1, 0));
  });
});
