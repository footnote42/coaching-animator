import { z } from 'zod';

export const AnimationTypeSchema = z.enum(['tactic', 'skill', 'game', 'other']);
export const VisibilitySchema = z.enum(['private', 'link_shared', 'public']);
export const ReportReasonSchema = z.enum(['inappropriate', 'spam', 'copyright', 'other']);

// Maximum payload size: 1MB
export const MAX_PAYLOAD_SIZE_BYTES = 1_000_000;

// Entity schema for animation frames
const EntitySchema = z.object({
  id: z.string(),
  type: z.enum(['player', 'ball', 'cone', 'marker']),
  team: z.enum(['attack', 'defense', 'neutral']),
  x: z.number(),
  y: z.number(),
  color: z.string().optional(),
  label: z.string().optional(),
});

// Annotation schema
const AnnotationSchema = z.object({
  id: z.string(),
  type: z.enum(['arrow', 'line', 'freehand']),
  points: z.array(z.number()),
  color: z.string().optional(),
}).passthrough();

// Frame schema
const FrameSchema = z.object({
  id: z.string(),
  duration: z.number().optional(),
  entities: z.record(z.string(), EntitySchema),
  annotations: z.array(AnnotationSchema).optional(),
}).passthrough();

// Full animation payload schema with strict validation
export const AnimationPayloadSchema = z.object({
  version: z.string(),
  name: z.string().max(200),
  sport: z.string(),
  frames: z.array(FrameSchema).min(1).max(500),
  settings: z.object({}).passthrough(),
}).passthrough();

// Validate payload size
export function validatePayloadSize(payload: unknown): { valid: boolean; size: number; error?: string } {
  const jsonString = JSON.stringify(payload);
  const size = new TextEncoder().encode(jsonString).length;
  
  if (size > MAX_PAYLOAD_SIZE_BYTES) {
    return {
      valid: false,
      size,
      error: `Payload too large: ${(size / 1_000_000).toFixed(2)}MB (max: 1MB)`
    };
  }
  
  return { valid: true, size };
}

export const CreateAnimationSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(2000).optional(),
  coaching_notes: z.string().max(5000).optional(),
  animation_type: AnimationTypeSchema,
  tags: z.array(z.string().max(30)).max(10).optional(),
  payload: AnimationPayloadSchema,
  visibility: VisibilitySchema.optional().default('private'),
  thumbnail: z.string().optional(), // Base64 data URL for thumbnail image
});

export const UpdateAnimationSchema = CreateAnimationSchema.partial();

export const ReportSchema = z.object({
  animation_id: z.string().uuid(),
  reason: ReportReasonSchema,
  details: z.string().max(500).optional(),
});

export const PaginationSchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export const GalleryQuerySchema = PaginationSchema.extend({
  q: z.string().optional(),
  type: AnimationTypeSchema.optional(),
  tags: z.string().optional(),
  sort: z.enum(['created_at', 'upvote_count']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const MyAnimationsQuerySchema = PaginationSchema.extend({
  sort: z.enum(['title', 'created_at', 'duration_ms', 'animation_type']).default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type AnimationType = z.infer<typeof AnimationTypeSchema>;
export type Visibility = z.infer<typeof VisibilitySchema>;
export type ReportReason = z.infer<typeof ReportReasonSchema>;
export type CreateAnimationInput = z.infer<typeof CreateAnimationSchema>;
export type UpdateAnimationInput = z.infer<typeof UpdateAnimationSchema>;
export type ReportInput = z.infer<typeof ReportSchema>;
export type GalleryQuery = z.infer<typeof GalleryQuerySchema>;
export type MyAnimationsQuery = z.infer<typeof MyAnimationsQuerySchema>;
