import { renderBrandIconPng } from '@/shared/brand-icon-image';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const contentType = 'image/png';

const SIZES = [32, 192, 512] as const;

/** Tab icon (32) plus the 192/512 icons the web manifest points at. */
export function generateImageMetadata() {
  return SIZES.map((s) => ({
    id: String(s),
    size: { width: s, height: s },
    contentType: 'image/png',
  }));
}

export default async function Icon({ id }: { id: Promise<string> }) {
  const resolved = Number(await id);
  const size = SIZES.find((s) => s === resolved) ?? 32;
  return renderBrandIconPng(size);
}
