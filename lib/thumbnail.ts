/**
 * Thumbnail generation utilities for animation previews.
 * Captures the first frame of an animation as a PNG image.
 */

const THUMBNAIL_WIDTH = 400;
const THUMBNAIL_HEIGHT = 300;

/**
 * Generate a thumbnail data URL from animation payload.
 * Renders the first frame entities onto a canvas and returns as base64 PNG.
 * 
 * @param payload - The animation payload JSON containing frames and entities
 * @returns Base64 data URL of the thumbnail PNG, or null if generation fails
 */
export async function generateThumbnailFromPayload(
  payload: AnimationPayload
): Promise<string | null> {
  try {
    if (!payload.frames || payload.frames.length === 0) {
      console.warn('No frames in payload for thumbnail generation');
      return null;
    }

    const firstFrame = payload.frames[0];
    const entities = Object.values(firstFrame.entities || {});

    // Create canvas for thumbnail
    const canvas = document.createElement('canvas');
    canvas.width = THUMBNAIL_WIDTH;
    canvas.height = THUMBNAIL_HEIGHT;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('Could not get canvas context for thumbnail');
      return null;
    }

    // Draw field background (simplified rugby field)
    drawFieldBackground(ctx, payload.sport || 'rugby-union');

    // Draw entities
    for (const entity of entities) {
      drawEntity(ctx, entity);
    }

    // Convert to data URL
    return canvas.toDataURL('image/png', 0.8);
  } catch (error) {
    console.error('Failed to generate thumbnail:', error);
    return null;
  }
}

/**
 * Convert a data URL to a Blob for upload.
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Draw simplified field background.
 */
function drawFieldBackground(
  ctx: CanvasRenderingContext2D,
  sport: string
): void {
  // Field green
  ctx.fillStyle = '#2D5A27';
  ctx.fillRect(0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);

  // White lines
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1;

  // Border
  const margin = 10;
  ctx.strokeRect(margin, margin, THUMBNAIL_WIDTH - 2 * margin, THUMBNAIL_HEIGHT - 2 * margin);

  // Center line
  ctx.beginPath();
  ctx.moveTo(THUMBNAIL_WIDTH / 2, margin);
  ctx.lineTo(THUMBNAIL_WIDTH / 2, THUMBNAIL_HEIGHT - margin);
  ctx.stroke();

  // Try lines (for rugby)
  if (sport.includes('rugby')) {
    const tryLineX1 = margin + 30;
    const tryLineX2 = THUMBNAIL_WIDTH - margin - 30;
    
    ctx.beginPath();
    ctx.moveTo(tryLineX1, margin);
    ctx.lineTo(tryLineX1, THUMBNAIL_HEIGHT - margin);
    ctx.moveTo(tryLineX2, margin);
    ctx.lineTo(tryLineX2, THUMBNAIL_HEIGHT - margin);
    ctx.stroke();
  }
}

/**
 * Draw a single entity on the thumbnail canvas.
 */
function drawEntity(
  ctx: CanvasRenderingContext2D,
  entity: ThumbnailEntity
): void {
  // Scale coordinates from original canvas (800x600) to thumbnail size
  const scaleX = THUMBNAIL_WIDTH / 800;
  const scaleY = THUMBNAIL_HEIGHT / 600;
  const x = entity.x * scaleX;
  const y = entity.y * scaleY;

  ctx.save();

  switch (entity.type) {
    case 'player':
      // Draw player circle
      const playerRadius = 8;
      ctx.beginPath();
      ctx.arc(x, y, playerRadius, 0, Math.PI * 2);
      ctx.fillStyle = entity.color || '#3B82F6';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw label if present
      if (entity.label) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(entity.label.substring(0, 2), x, y);
      }
      break;

    case 'ball':
      // Draw ball as small oval
      const ballRadius = 5;
      ctx.beginPath();
      ctx.ellipse(x, y, ballRadius * 1.2, ballRadius * 0.8, 0, 0, Math.PI * 2);
      ctx.fillStyle = entity.color || '#8B4513';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.stroke();
      break;

    case 'cone':
      // Draw cone as hollow circle
      const coneRadius = 6;
      ctx.beginPath();
      ctx.arc(x, y, coneRadius, 0, Math.PI * 2);
      ctx.strokeStyle = entity.color || '#F97316';
      ctx.lineWidth = 2;
      ctx.stroke();
      break;

    case 'tackle-shield':
      // Draw shield as rectangle
      ctx.fillStyle = entity.color || '#1E40AF';
      ctx.fillRect(x - 4, y - 8, 8, 16);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.strokeRect(x - 4, y - 8, 8, 16);
      break;

    case 'tackle-bag':
      // Draw bag as vertical oval
      ctx.beginPath();
      ctx.ellipse(x, y, 4, 10, 0, 0, Math.PI * 2);
      ctx.fillStyle = entity.color || '#7C3AED';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.stroke();
      break;

    default:
      // Generic circle for unknown types
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = entity.color || '#6B7280';
      ctx.fill();
  }

  ctx.restore();
}

// Type definitions for thumbnail generation
interface ThumbnailEntity {
  id: string;
  type: string;
  x: number;
  y: number;
  color?: string;
  label?: string;
  team?: string;
}

interface ThumbnailFrame {
  id: string;
  entities: Record<string, ThumbnailEntity>;
}

interface AnimationPayload {
  sport?: string;
  frames: ThumbnailFrame[];
}

export type { AnimationPayload, ThumbnailEntity, ThumbnailFrame };
