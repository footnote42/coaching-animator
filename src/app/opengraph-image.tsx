import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { DESIGN_TOKENS } from '@/shared/design-tokens';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const alt = 'Coaching Animator';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Default social image for pages without their own (/p/[id] has its own). */
export default async function Image() {
  const logo = await readFile(path.join(process.cwd(), 'public/assets/logo.png'));
  const src = `data:image/png;base64,${logo.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 56,
          backgroundColor: DESIGN_TOKENS.colours.primary,
          color: DESIGN_TOKENS.colours.textInverse,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img src={src} width={260} height={260} />
        <div style={{ fontSize: 88, fontWeight: 700 }}>Coaching Animator</div>
      </div>
    ),
    size,
  );
}
