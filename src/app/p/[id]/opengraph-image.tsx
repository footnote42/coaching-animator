import { ImageResponse } from 'next/og';
import { DESIGN_TOKENS } from '@/core/constants/design-tokens';
import { positionsAt, resolveStep, stepCount, type ResolvedMarker } from '@/features/practice/engine';
import { markerColour } from '@/features/practice/markerColour';
import { loadPractice } from './loadPractice';

export const runtime = 'nodejs';
export const alt = 'Practice preview';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const PAD = 40;
/** Largest box the Area is fitted into, in pixels. */
const AREA_BOX = { width: 620, height: size.height - PAD * 2 };
const BACKGROUND = '#0B1A0B';

function markerStyle(marker: ResolvedMarker, x: number, y: number, r: number) {
  const fill = markerColour(marker);
  const box = (w: number, h: number) => ({ position: 'absolute' as const, left: x - w / 2, top: y - h / 2, width: w, height: h });
  switch (marker.kind) {
    case 'ball':
      return { ...box(r * 1.4, r * 0.9), borderRadius: '50%', backgroundColor: fill, border: '1px solid #111827' };
    case 'cone':
      return { ...box(r * 1.1, r * 1.1), borderRadius: '50%', backgroundColor: fill, border: '1px solid #111827' };
    case 'tackle-shield':
      return { ...box(r * 1.2, r * 2), backgroundColor: fill, border: '1px solid #111827' };
    default:
      return {
        ...box(r * 2, r * 2),
        borderRadius: '50%',
        backgroundColor: fill,
        border: `${Math.max(2, r * 0.15)}px solid #FFFFFF`,
        color: '#FFFFFF',
        fontSize: Math.max(10, r * 0.9),
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      };
  }
}

function Brand({ children }: { children?: React.ReactNode }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: PAD,
        gap: PAD,
        backgroundColor: BACKGROUND,
        color: '#FFFFFF',
      }}
    >
      {children}
    </div>
  );
}

/** Share card for /p/[id]: the base Step drawn through the engine, beside the title. */
export default async function Image({ params }: { params: { id: string } }) {
  const loaded = await loadPractice(params.id);
  if (!loaded) {
    return new ImageResponse(
      <Brand>
        <div style={{ fontSize: 64, fontWeight: 700 }}>Coaching Animator</div>
      </Brand>,
      size,
    );
  }

  const { practice, script } = loaded;
  const step = resolveStep(script, 0);
  const { positions } = positionsAt(step, 0);
  const { width: w, length: l } = step.area;
  const cell = Math.min(AREA_BOX.width / w, AREA_BOX.height / l);
  const r = Math.max(cell * 0.4, 6);
  const steps = stepCount(script);

  return new ImageResponse(
    <Brand>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexShrink: 0,
          width: w * cell,
          height: l * cell,
          backgroundColor: DESIGN_TOKENS.colours.primary,
        }}
      >
        {step.markers.map((marker) => {
          const p = positions[marker.id];
          return (
            <div key={marker.id} style={markerStyle(marker, (p.x + 0.5) * cell, (p.y + 0.5) * cell, r)}>
              {marker.kind === 'attacker' || marker.kind === 'defender' || marker.kind === 'coach'
                ? marker.label ?? ''
                : ''}
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, gap: 24 }}>
        <div style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.1 }}>{practice.title}</div>
        <div style={{ fontSize: 28, opacity: 0.75 }}>
          {steps === 1 ? '1 Step' : `${steps} Steps: base and ${steps - 1} Progression${steps === 2 ? '' : 's'}`}
        </div>
        <div style={{ fontSize: 24, opacity: 0.6, marginTop: 24 }}>Coaching Animator</div>
      </div>
    </Brand>,
    size,
  );
}
