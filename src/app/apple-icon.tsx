import { renderBrandIconPng } from '@/shared/brand-icon-image';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/** apple-touch-icon: the BrandIcon mark on the primary background. */
export default function AppleIcon() {
  return renderBrandIconPng(size.width);
}
