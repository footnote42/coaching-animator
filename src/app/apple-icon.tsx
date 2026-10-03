import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { DESIGN_TOKENS } from '@/shared/design-tokens';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/** apple-touch-icon: the BrandIcon mark on the primary background. */
export default async function AppleIcon() {
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
          backgroundColor: DESIGN_TOKENS.colours.primary,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img src={src} width={132} height={132} />
      </div>
    ),
    size,
  );
}
