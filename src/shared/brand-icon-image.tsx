import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { DESIGN_TOKENS } from '@/shared/design-tokens';

/**
 * Renders the BrandIcon mark (public/assets/logo.png) on the primary background
 * as a square PNG. Shared by the favicon, apple-touch-icon and manifest icons.
 */
export async function renderBrandIconPng(size: number): Promise<ImageResponse> {
  const logo = await readFile(path.join(process.cwd(), 'public/assets/logo.png'));
  const src = `data:image/png;base64,${logo.toString('base64')}`;
  const mark = Math.round(size * 0.73);

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
        <img src={src} width={mark} height={mark} />
      </div>
    ),
    { width: size, height: size },
  );
}
